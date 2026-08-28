const json = (body, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
});

export async function onRequestPost({ request, env }) {
  if (!env.STRIPE_SECRET_KEY) return json({ message: 'Stripe is not configured on Cloudflare.' }, 503);

  let payload;
  try { payload = await request.json(); } catch { return json({ message: 'Invalid request body.' }, 400); }
  const items = Array.isArray(payload?.items) ? payload.items : [];
  if (!items.length || items.length > 50) return json({ message: 'Your cart is empty or invalid.' }, 400);

  const lineItems = [];
  for (const item of items) {
    const quantity = Math.max(1, Math.min(99, Number(item.quantity) || 0));
    const cents = Math.round(Number(item.price) * 100);
    const name = String(item.name || '').trim();
    if (!name || !quantity || !Number.isSafeInteger(cents) || cents < 1) {
      return json({ message: 'One or more cart items are invalid.' }, 400);
    }
    lineItems.push({
      quantity: String(quantity),
      'price_data[currency]': 'usd',
      'price_data[unit_amount]': String(cents),
      'price_data[product_data][name]': name.slice(0, 250),
    });
  }

  const origin = new URL(request.url).origin;
  const params = new URLSearchParams({
    mode: 'payment',
    'automatic_payment_methods[enabled]': 'true',
    success_url: `${origin}/?checkout=success`,
    cancel_url: `${origin}/?checkout=cancelled`,
    'shipping_address_collection[allowed_countries][0]': 'US',
  });
  lineItems.forEach((line, index) => Object.entries(line).forEach(([key, value]) => params.set(`line_items[${index}][${key}]`, value)));

  const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
      'content-type': 'application/x-www-form-urlencoded',
    },
    body: params,
  });
  const result = await response.json();
  if (!response.ok || !result.url) return json({ message: result?.error?.message || 'Stripe checkout could not be created.' }, 502);
  return json({ url: result.url });
}

export async function onRequest(context) {
  if (context.request.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });
  return onRequestPost(context);
}
