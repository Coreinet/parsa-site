import { z } from 'zod';

const schema = z.object({
  name: z.string().trim().min(1).max(200),
  email: z.email().max(320),
  type: z.string().max(60),
  budget: z.string().max(200).optional().default(''),
  message: z.string().trim().min(20).max(5000),
  company: z.string().optional().default('') // honeypot
});

// Simple in-memory rate limit: 5 messages per IP per 10 minutes (per server instance).
const hits = new Map<string, number[]>();
const WINDOW = 10 * 60 * 1000;

function limited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter(t => now - t < WINDOW);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > 5;
}

/**
 * Delivery: set RESEND_API_KEY and CONTACT_TO (and optionally CONTACT_FROM) to send email via
 * Resend. Without them, messages are only logged in development and refused in production,
 * so the form shows its error state with the email fallback instead of pretending it worked.
 */
export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'local';
  if (limited(ip)) {
    return Response.json({ error: 'Too many messages from this connection. Wait a few minutes.' }, { status: 429 });
  }

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: 'Some fields are missing or invalid.' }, { status: 400 });
  }
  const data = parsed.data;

  // Bots fill the hidden field: accept silently, send nothing.
  if (data.company) return Response.json({ ok: true });

  const key = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO;

  if (!key || !to) {
    if (process.env.NODE_ENV !== 'production') {
      console.info('[contact] (dev, not sent)', data);
      return Response.json({ ok: true });
    }
    // Not configured: tell the form to hand the message to the visitor's email app instead.
    return Response.json({ error: 'The message service is not set up yet.', fallback: 'mailto' }, { status: 503 });
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: process.env.CONTACT_FROM ?? 'Website <onboarding@resend.dev>',
      to,
      reply_to: data.email,
      subject: `New ${data.type} inquiry from ${data.name}`,
      text: `${data.message}\n\n—\n${data.name} <${data.email}>\nType: ${data.type}\nBudget: ${data.budget || 'not given'}`
    })
  });

  if (!res.ok) return Response.json({ error: 'The mail service did not accept the message.' }, { status: 502 });
  return Response.json({ ok: true });
}
