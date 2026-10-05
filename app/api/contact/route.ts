import nodemailer from 'nodemailer';
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
 * Delivery: messages are sent from Parsa's Gmail to Parsa's inbox over Gmail SMTP.
 * Set GMAIL_USER (the Gmail address) and GMAIL_APP_PASSWORD (a Google App Password, not the
 * normal password); CONTACT_TO optionally sends to a different inbox. Without them, messages
 * are only logged in development and refused in production, so the form falls back to the
 * visitor's email app instead of pretending it worked.
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

  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD?.replace(/\s+/g, ''); // Google shows it in groups of four
  const to = process.env.CONTACT_TO || user;

  if (!user || !pass || !to) {
    if (process.env.NODE_ENV !== 'production') {
      console.info('[contact] (dev, not sent)', data);
      return Response.json({ ok: true });
    }
    // Not configured: tell the form to hand the message to the visitor's email app instead.
    return Response.json({ error: 'The message service is not set up yet.', fallback: 'mailto' }, { status: 503 });
  }

  // One line only: a name with line breaks must not be able to add mail headers.
  const name = data.name.replace(/[\r\n]+/g, ' ');
  const transport = nodemailer.createTransport({ service: 'gmail', auth: { user, pass } });

  try {
    await transport.sendMail({
      from: { name: `${name} via website`, address: user },
      to,
      replyTo: { name, address: data.email },
      subject: `New ${data.type} inquiry from ${name}`,
      text: `${data.message}\n\n—\n${name} <${data.email}>\nType: ${data.type}\nBudget: ${data.budget || 'not given'}`
    });
  } catch (err) {
    // Visible in Vercel → Project → Logs. Usual cause: a wrong or revoked App Password.
    console.error('[contact] Gmail refused the message', err);
    return Response.json({ error: 'The mail service did not accept the message.', fallback: 'mailto' }, { status: 502 });
  }
  return Response.json({ ok: true });
}
