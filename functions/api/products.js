const json = (body, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
});

export async function onRequest({ request, env }) {
  const url = env.SUPABASE_URL || 'https://rogaddkicxzalpqfcpeq.supabase.co';
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
  const auth = request.headers.get('authorization');
  if (!serviceKey || !auth?.startsWith('Bearer ')) return json({ message: 'Sign-in required.' }, 401);

  // Validate the caller's Supabase session before using the server-only key.
  const userResponse = await fetch(`${url}/auth/v1/user`, {
    headers: { apikey: serviceKey, authorization: auth },
  });
  if (!userResponse.ok) return json({ message: 'Your inventory session has expired. Sign in again.' }, 401);

  const headers = {
    apikey: serviceKey,
    authorization: `Bearer ${serviceKey}`,
    'content-type': 'application/json',
    Prefer: 'return=representation',
  };
  const base = `${url}/rest/v1/products`;
  let target = base;
  if (request.method === 'PATCH' || request.method === 'DELETE') {
    const id = new URL(request.url).searchParams.get('id');
    if (!id) return json({ message: 'Product id is required.' }, 400);
    target += `?id=eq.${encodeURIComponent(id)}`;
  }
  if (!['POST', 'PATCH', 'DELETE'].includes(request.method)) return json({ message: 'Method Not Allowed' }, 405);
  const response = await fetch(target, {
    method: request.method,
    headers,
    body: request.method === 'DELETE' ? undefined : await request.text(),
  });
  const text = await response.text();
  if (!response.ok) return json({ message: 'Supabase product write failed.', detail: text }, 502);
  if (request.method === 'DELETE') return json({ ok: true });
  const rows = text ? JSON.parse(text) : [];
  return json(Array.isArray(rows) ? rows[0] : rows, response.status);
}
