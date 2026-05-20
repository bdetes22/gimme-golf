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

    // ── Punch Pass limits ──
    if (membership.type === "punchpass") {
      const remaining = membership.sessions_remaining || 0;
      if (remaining < slotCount) {
        return NextResponse.json({
          error: `Not enough sessions. You have ${remaining} session${remaining === 1 ? "" : "s"} remaining but this booking requires ${slotCount}.`,
        }, { status: 400 });
      }
    }

    // ── Monthly / Annual limits (20 hours per month) ──
    if (membership.type === "monthly" || membership.type === "annual") {
      // Check expiry
      if (membership.end_date && today > membership.end_date) {
        await fetch(`${url()}/rest/v1/memberships?id=eq.${membership.id}`, {
          method: "PATCH",
          headers: restHeaders(),
          body: JSON.stringify({ active: false }),
        });
        return NextResponse.json({
          error: `Your ${membership.type} membership has expired. Please renew to continue booking as a member.`,
          expired: true,
        }, { status: 403 });
      }

      // Reset monthly hours if past reset date
      let hoursUsed = membership.hours_used_this_month || 0;
      const resetDate = membership.hours_reset_date;
      if (resetDate && today >= resetDate) {
        hoursUsed = 0;
        // Set next reset date (1 month from current reset date)
        const nextReset = new Date(resetDate);
        nextReset.setMonth(nextReset.getMonth() + 1);
        await fetch(`${url()}/rest/v1/memberships?id=eq.${membership.id}`, {
          method: "PATCH",
          headers: restHeaders(),
          body: JSON.stringify({
            hours_used_this_month: 0,
            hours_reset_date: nextReset.toISOString().split("T")[0],
          }),
        });
      }

      // Check monthly hours limit (20 hours)
      const hoursRemaining = 20 - hoursUsed;
      if (slotCount > hoursRemaining) {
        const resetDisplay = membership.hours_reset_date || "your next billing date";
        return NextResponse.json({
          error: `You have ${hoursRemaining} hour${hoursRemaining === 1 ? "" : "s"} left this month. Your hours reset on ${resetDisplay}. You can pay the walk-in rate or purchase a punch pass for additional sessions.`,
          hoursRemaining,
          resetDate: membership.hours_reset_date,
        }, { status: 400 });
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
      const resetDate = membership.hours_reset_date;
      const currentUsed = (resetDate && today >= resetDate) ? 0 : (membership.hours_used_this_month || 0);
      updateData.hours_used_this_month = currentUsed + slotCount;
      if (!resetDate) {
        // Set initial reset date to 1 month from now
        const nextReset = new Date();
        nextReset.setMonth(nextReset.getMonth() + 1);
        updateData.hours_reset_date = nextReset.toISOString().split("T")[0];
      }
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
