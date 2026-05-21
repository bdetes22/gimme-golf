import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";
import { dbDelete, dbInsert, dbSelect } from "@/lib/supabase-rest";

export const dynamic = "force-dynamic";

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { password, action } = body;

  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (action === "update_notes") {
    const { customerId, notes } = body;
    if (!customerId) {
      return NextResponse.json({ error: "customerId is required" }, { status: 400 });
    }

    const apiUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const apiKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    await fetch(`${apiUrl}/rest/v1/customers?id=eq.${customerId}`, {
      method: "PATCH",
      headers: {
        apikey: apiKey,
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({ notes: notes || null }),
    });

    return NextResponse.json({ success: true });
  }

  if (action === "refund_booking") {
    const { bookingId, stripePaymentId } = body;
    if (!bookingId || !stripePaymentId) {
      return NextResponse.json({ error: "bookingId and stripePaymentId are required" }, { status: 400 });
    }

    try {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
        apiVersion: "2026-04-22.dahlia",
      });

      // Issue refund via Stripe
      const refund = await stripe.refunds.create({
        payment_intent: stripePaymentId,
      });

      // Update booking status to cancelled + refunded
      const apiUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const apiKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
      await fetch(`${apiUrl}/rest/v1/bookings?id=eq.${bookingId}`, {
        method: "PATCH",
        headers: {
          apikey: apiKey,
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify({ status: "cancelled", payment_status: "refunded" }),
      });

      return NextResponse.json({ success: true, refundId: refund.id });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Refund failed";
      console.error("[ADMIN] Refund failed:", message);
      return NextResponse.json({ error: message }, { status: 500 });
    }
  }

  if (action === "cancel_booking") {
    const { bookingId } = body;
    if (!bookingId) {
      return NextResponse.json({ error: "bookingId is required" }, { status: 400 });
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    await fetch(`${url}/rest/v1/bookings?id=eq.${bookingId}`, {
      method: "PATCH",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({ status: "cancelled" }),
    });

    return NextResponse.json({ success: true });
  }

  if (action === "create_booking") {
    const { customerId, location, dateISO, hour } = body;
    if (!customerId || !location || !dateISO || hour === undefined) {
      return NextResponse.json(
        { error: "customerId, location, dateISO, and hour are required" },
        { status: 400 }
      );
    }

    const startTime = new Date(`${dateISO}T${String(hour).padStart(2, "0")}:00:00`);
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);

    await dbInsert("bookings", {
      customer_id: customerId,
      location: location.toLowerCase(),
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      duration_hours: 1,
      status: "confirmed",
      payment_status: "admin_created",
    });

    return NextResponse.json({ success: true });
  }

  if (action === "add_sessions") {
    const { customerId, sessions } = body;
    if (!customerId || !sessions) {
      return NextResponse.json(
        { error: "customerId and sessions are required" },
        { status: 400 }
      );
    }

    const existing = await dbSelect(
      "memberships",
      `customer_id=eq.${customerId}&type=eq.punchpass&active=eq.true&limit=1`
    );

    if (Array.isArray(existing) && existing.length > 0) {
      const mem = existing[0];
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
      await fetch(`${url}/rest/v1/memberships?id=eq.${mem.id}`, {
        method: "PATCH",
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify({
          sessions_remaining: (mem.sessions_remaining || 0) + sessions,
        }),
      });
    } else {
      await dbInsert("memberships", {
        customer_id: customerId,
        type: "punchpass",
        sessions_remaining: sessions,
        active: true,
        start_date: new Date().toISOString().split("T")[0],
      });
    }

    return NextResponse.json({ success: true });
  }

  if (action === "remove_sessions") {
    const { customerId, sessions } = body;
    if (!customerId || !sessions) {
      return NextResponse.json(
        { error: "customerId and sessions are required" },
        { status: 400 }
      );
    }

    const existing = await dbSelect(
      "memberships",
      `customer_id=eq.${customerId}&type=eq.punchpass&active=eq.true&limit=1`
    );

    if (!Array.isArray(existing) || existing.length === 0) {
      return NextResponse.json({ error: "No active punch pass found" }, { status: 404 });
    }

    const mem = existing[0];
    const newSessions = Math.max(0, (mem.sessions_remaining || 0) - sessions);
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    await fetch(`${url}/rest/v1/memberships?id=eq.${mem.id}`, {
      method: "PATCH",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({ sessions_remaining: newSessions }),
    });

    return NextResponse.json({ success: true });
  }

  if (action === "set_membership") {
    const { customerId, type, startDate, endDate, sessionsRemaining } = body;
    if (!customerId || !type) {
      return NextResponse.json({ error: "customerId and type are required" }, { status: 400 });
    }

    const apiUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const apiKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const headers = {
      apikey: apiKey,
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    };

    // Deactivate existing memberships
    await fetch(`${apiUrl}/rest/v1/memberships?customer_id=eq.${customerId}&active=eq.true`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ active: false }),
    });

    // Create new membership
    if (type !== "walkin") {
      const memData: Record<string, unknown> = {
        customer_id: customerId,
        type,
        active: true,
        start_date: startDate || new Date().toISOString().split("T")[0],
        end_date: endDate || null,
        sessions_remaining: type === "punchpass" ? (sessionsRemaining || 10) : null,
        hours_used_this_month: 0,
        hours_reset_date: type === "staff" ? null : (() => {
          const d = new Date();
          d.setMonth(d.getMonth() + 1);
          return d.toISOString().split("T")[0];
        })(),
      };

      await fetch(`${apiUrl}/rest/v1/memberships`, {
        method: "POST",
        headers,
        body: JSON.stringify(memData),
      });
    }

    return NextResponse.json({ success: true });
  }

  if (action === "delete_customer") {
    const { customerId } = body;
    if (!customerId) {
      return NextResponse.json({ error: "customerId is required" }, { status: 400 });
    }

    console.log("[ADMIN] Deleting customer:", customerId);

    // Direct REST API deletes - guaranteed to bypass RLS
    const r1 = await dbDelete("memberships", `customer_id=eq.${customerId}`);
    console.log("[ADMIN] Delete memberships:", r1.status);

    const r2 = await dbDelete("bookings", `customer_id=eq.${customerId}`);
    console.log("[ADMIN] Delete bookings:", r2.status);

    const r3 = await dbDelete("customers", `id=eq.${customerId}`);
    console.log("[ADMIN] Delete customer:", r3.status);

    // Delete auth user
    try {
      const admin = adminClient();
      await admin.auth.admin.deleteUser(customerId);
      console.log("[ADMIN] Auth user deleted");
    } catch {
      console.log("[ADMIN] No auth user found");
    }

    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
