const url = () => process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = () => process.env.SUPABASE_SERVICE_ROLE_KEY!;

function headers() {
  return {
    apikey: key(),
    Authorization: `Bearer ${key()}`,
    "Content-Type": "application/json",
    Prefer: "return=representation",
  };
}

export async function dbSelect(table: string, query = "") {
  const res = await fetch(`${url()}/rest/v1/${table}?${query}`, {
    headers: headers(),
    cache: "no-store",
  });
  return res.json();
}

export async function dbInsert(table: string, data: Record<string, unknown>) {
  const res = await fetch(`${url()}/rest/v1/${table}`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function dbDelete(table: string, query: string) {
  const res = await fetch(`${url()}/rest/v1/${table}?${query}`, {
    method: "DELETE",
    headers: headers(),
  });
  return { status: res.status, ok: res.ok };
}
