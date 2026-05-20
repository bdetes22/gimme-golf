import { NextRequest, NextResponse } from "next/server";
import { dbSelect } from "@/lib/supabase-rest";

export const dynamic = "force-dynamic";

const url = () => process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = () => process.env.SUPABASE_SERVICE_ROLE_KEY!;

function restHeaders() {
  return {
    apikey: key(),
    Authorization: `Bearer ${key()}`,
    "Content-Type": "application/json",
    Prefer: "return=minimal",
  };
}

function getWeekStart() {
  const now = new Date();
  const day = now.getDay(); // 0=Sun
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day);
  return start.toISOString().split("T")[0];
}

export async function POST(req: NextRequest) {
  try {
    const { customerId, location, dateISO, hours } = await req.json();
    // hours is an array of hour numbers, e.g. [14] for 1hr or [14, 15] for 2hr

    const slotCount = Array.isArray(hours) ? hours.length : 1;
    const hourList: number[] = Array.isArray(hours) ? hours : [hours];

    if (!customerId || !location || !dateISO || hourList.length === 0) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Validate consecutive slots if multi-hour
    if (slotCount > 1) {
      const sorted = [...hourList].sort((a, b) => a - b);
      for (let i = 1; i < sorted.length; i++) {
        if (sorted[i] !== sorted[i - 1] + 1) {
          return NextResponse.json({ error: "Multi-hour bookings must be consecutive time slots" }, { status: 400 });
        }
      }
    }

    // Fetch active membership
    const memberships = await dbSelect(
      "memberships",
      `customer_id=eq.${customerId}&active=eq.true&limit=1`
    );

    if (!Array.isArray(memberships) || memberships.length === 0) {
      return NextResponse.json({ error: "No active membership found" }, { status: 403 });
    }

    const membership = memberships[0];
    const today = new Date().toISOString().split("T")[0];
    const weekStart = getWeekStart();

    // ── Punch Pass limits ──
    if (membership.type === "punchpass") {
      const remaining = membership.sessions_remaining || 0;
      if (remaining < slotCount) {
        return NextResponse.json({
          error: `Not enough sessions. You have ${remaining} session${remaining === 1 ? "" : "s"} remaining but this booking requires ${slotCount}.`,
        }, { status: 400 });
      }
    }

    // ── Monthly / Annual limits ──
    if (membership.type === "monthly" || membership.type === "annual") {
      // Check daily limit: 1 booking per day (a booking can be 1-2 hours)
      if (membership.last_booking_date === dateISO) {
        return NextResponse.json({
          error: "Daily limit reached. Members can book 1 session per day.",
        }, { status: 400 });
      }

      // Reset weekly counter if we're in a new week
      let weeklyUsed = membership.sessions_used_this_week || 0;
      if (membership.week_reset_date !== weekStart) {
        weeklyUsed = 0;
      }

      // Check weekly limit: max 4 hours per week
      if (weeklyUsed + slotCount > 4) {
        const remaining = 4 - weeklyUsed;
        return NextResponse.json({
          error: `Weekly limit reached. You've used ${weeklyUsed} of 4 hours this week.${remaining > 0 ? ` You can book up to ${remaining} more hour${remaining === 1 ? "" : "s"}.` : ""}`,
        }, { status: 400 });
      }

      // Check monthly expiry
      if (membership.type === "monthly" && membership.end_date) {
        if (today > membership.end_date) {
          // Auto-deactivate expired membership
          await fetch(`${url()}/rest/v1/memberships?id=eq.${membership.id}`, {
            method: "PATCH",
            headers: restHeaders(),
            body: JSON.stringify({ active: false }),
          });
          return NextResponse.json({
            error: "Your monthly membership has expired. Please renew to continue booking as a member.",
          }, { status: 403 });
        }
      }

      // Check annual expiry
      if (membership.type === "annual" && membership.end_date) {
        if (today > membership.end_date) {
          await fetch(`${url()}/rest/v1/memberships?id=eq.${membership.id}`, {
            method: "PATCH",
            headers: restHeaders(),
            body: JSON.stringify({ active: false }),
          });
          return NextResponse.json({
            error: "Your annual membership has expired. Please renew to continue booking as a member.",
          }, { status: 403 });
        }
      }
    }

    // ── Create booking(s) ──
    const bookings = hourList.map((hour) => {
      const startTime = new Date(`${dateISO}T${String(hour).padStart(2, "0")}:00:00`);
      const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);
      return {
        customer_id: customerId,
        location: location.toLowerCase(),
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        duration_hours: 1,
        status: "confirmed",
        payment_status: "membership",
      };
    });

    // Insert all bookings
    for (const booking of bookings) {
      const res = await fetch(`${url()}/rest/v1/bookings`, {
        method: "POST",
        headers: restHeaders(),
        body: JSON.stringify(booking),
      });
      if (!res.ok) {
        console.error("Failed to create booking:", await res.text());
        return NextResponse.json({ error: "Failed to create booking" }, { status: 500 });
      }
    }

    // ── Update membership tracking ──
    const updateData: Record<string, unknown> = {
      last_booking_date: dateISO,
    };

    if (membership.type === "punchpass") {
      const newRemaining = (membership.sessions_remaining || 0) - slotCount;
      updateData.sessions_remaining = newRemaining;
      if (newRemaining <= 0) {
        updateData.active = false;
      }
    }

    if (membership.type === "monthly" || membership.type === "annual") {
      const currentWeekUsed = membership.week_reset_date === weekStart
        ? (membership.sessions_used_this_week || 0)
        : 0;
      updateData.sessions_used_this_week = currentWeekUsed + slotCount;
      updateData.week_reset_date = weekStart;
    }

    await fetch(`${url()}/rest/v1/memberships?id=eq.${membership.id}`, {
      method: "PATCH",
      headers: restHeaders(),
      body: JSON.stringify(updateData),
    });

    return NextResponse.json({ success: true, slotsBooked: slotCount });
  } catch (err) {
    console.error("Member booking error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
