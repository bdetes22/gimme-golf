import { supabase } from "./supabase";

export async function signUp(
  email: string,
  password: string,
  name: string,
  phone: string
) {
  const res = await fetch("/api/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, name, phone }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Signup failed");
  }
  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentUser() {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();
  if (error) throw error;
  return session?.user ?? null;
}

export async function getUserBookings(customerId: string) {
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("customer_id", customerId)
    .order("start_time", { ascending: false });

  if (error) throw error;
  return data;
}

export async function getUserMembership(customerId: string) {
  const { data, error } = await supabase
    .from("memberships")
    .select("*")
    .eq("customer_id", customerId)
    .eq("active", true)
    .maybeSingle();

  if (error) throw error;
  return data;
}
