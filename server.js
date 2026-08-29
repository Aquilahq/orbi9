import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import Stripe from 'stripe';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT || 4242);
const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || `http://localhost:${port}`).replace(/\/$/, '');
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

if (!stripeSecretKey) {
  console.warn('STRIPE_SECRET_KEY is not configured; checkout requests will be unavailable.');
}

const stripe = stripeSecretKey ? new Stripe(stripeSecretKey) : null;
const app = express();

app.use(helmet({ contentSecurityPolicy: false }));

// Stripe requires the exact raw request body for webhook signature verification.
app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  if (!stripe || !webhookSecret) return res.sendStatus(503);

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, req.headers['stripe-signature'], webhookSecret);
  } catch (error) {
    console.error('Stripe webhook signature verification failed:', error.message);
    return res.status(400).send('Invalid webhook signature');
  }

  switch (event.type) {
    case 'checkout.session.completed':
    case 'checkout.session.async_payment_succeeded':
      console.log(`Stripe payment completed: ${event.data.object.id}`);
      break;
    case 'checkout.session.async_payment_failed':
      console.warn(`Stripe payment failed: ${event.data.object.id}`);
      break;
    default:
      break;
  }

  return res.json({ received: true });
});

app.use(express.json({ limit: '32kb' }));
app.use('/api/', rateLimit({ windowMs: 60_000, limit: 30 }));

app.post('/api/create-checkout-session', async (req, res) => {
  if (!stripe) return res.status(503).json({ message: 'Stripe checkout is not configured on the server.' });

  const items = Array.isArray(req.body?.items) ? req.body.items : [];
  if (!items.length || items.length > 50) {
    return res.status(400).json({ message: 'The cart must contain between 1 and 50 items.' });
  }

  const lineItems = [];
  for (const item of items) {
    const quantity = Number(item.quantity);
    const price = Number(item.price);
    const name = String(item.name || '').trim();

    if (!name || !Number.isInteger(quantity) || quantity < 1 || quantity > 99 || !Number.isFinite(price) || price <= 0 || price > 1_000_000) {
      return res.status(400).json({ message: 'The cart contains an invalid item.' });
    }

    lineItems.push({
      quantity,
      price_data: {
        currency: 'usd',
        unit_amount: Math.round(price * 100),
        product_data: { name },
      },
    });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card', 'paypal'],
      line_items: lineItems,
      success_url: `${siteUrl}/?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/?checkout=cancelled`,
      billing_address_collection: 'auto',
      allow_promotion_codes: true,
    });

    return res.json({ url: session.url });
  } catch (error) {
    console.error('Stripe Checkout session creation failed:', error.message);
    return res.status(502).json({ message: 'Checkout could not be started.' });
  }
});

app.use(express.static(__dirname));
app.listen(port, () => console.log(`Orbi9 server listening on port ${port}`));
