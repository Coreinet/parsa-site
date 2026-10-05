'use client';

import { useId, useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/primitives';

const TYPES = ['Web app', 'Mobile app', 'AI feature', 'Something else'] as const;

type Errors = Partial<Record<'name' | 'email' | 'message', string>>;
type State =
  | { kind: 'idle' }
  | { kind: 'sending' }
  | { kind: 'sent' }
  | { kind: 'mailto'; href: string }
  | { kind: 'failed'; reason: string };

function validate(data: { name: string; email: string; message: string }): Errors {
  const e: Errors = {};
  if (!data.name.trim()) e.name = 'Add your name so I know who to reply to.';
  if (!data.email.trim()) e.email = 'Add an email address to reply to.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(data.email.trim()))
    e.email = 'Add the domain ending, for example sara@company.com';
  if (data.message.trim().length < 20) e.message = 'Write at least a couple of sentences (20+ characters) about the project.';
  return e;
}

const inputClass = (error?: string): string =>
  `w-full rounded-xl border bg-surface px-3.5 text-base text-ink transition-[border-color,box-shadow] placeholder:text-ink-3 focus:outline-none ${
    error
      ? 'border-err shadow-[0_0_0_3px_var(--err-soft)]'
      : 'border-line-strong focus:border-signal focus:shadow-[0_0_0_3px_var(--signal-soft)]'
  }`;

export default function ContactForm({ email }: { email: string }) {
  const id = useId();
  const [values, setValues] = useState({ name: '', email: '', budget: '', message: '', company: '' });
  const [type, setType] = useState<(typeof TYPES)[number]>('Web app');
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [state, setState] = useState<State>({ kind: 'idle' });

  const set = (key: keyof typeof values, value: string): void => {
    const next = { ...values, [key]: value };
    setValues(next);
    // Once a field has shown an error, re-validate it on every change.
    if (errors[key as keyof Errors]) setErrors(prev => ({ ...prev, [key]: validate(next)[key as keyof Errors] }));
  };

  const blur = (key: keyof Errors): void => {
    setTouched(t => ({ ...t, [key]: true }));
    setErrors(prev => ({ ...prev, [key]: validate(values)[key] }));
  };

  const submit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    const found = validate(values);
    setErrors(found);
    setTouched({ name: true, email: true, message: true });
    const first = (Object.keys(found) as (keyof Errors)[])[0];
    if (first) {
      document.getElementById(`${id}-${first}`)?.focus();
      return;
    }
    setState({ kind: 'sending' });
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, type })
      });
      const body = (await res.json().catch(() => ({}))) as { error?: string; fallback?: string };
      if (body.fallback === 'mailto') {
        // Email service missing or refusing: open the visitor's email app with the message filled in.
        const text = `${values.message}\n\n—\n${values.name} <${values.email}>\nType: ${type}\nBudget: ${values.budget || 'not given'}`;
        const href = `mailto:${email}?subject=${encodeURIComponent(`New ${type} inquiry from ${values.name}`)}&body=${encodeURIComponent(text)}`;
        setState({ kind: 'mailto', href });
        window.location.href = href;
        return;
      }
      if (!res.ok) throw new Error(body.error ?? `The server answered ${res.status}.`);
      setState({ kind: 'sent' });
    } catch (err) {
      setState({ kind: 'failed', reason: err instanceof Error ? err.message : 'The message service did not respond.' });
    }
  };

  if (state.kind === 'mailto') {
    return (
      <div role="status" className="grid content-start gap-3 rounded-2xl border border-line bg-paper p-6">
        <h2 className="text-h2 font-semibold">Almost there.</h2>
        <p className="text-ink-2">
          Your email app should have opened with your message ready to send. If it didn&apos;t,{' '}
          <a href={state.href} className="font-semibold text-ink underline underline-offset-4">
            open it here
          </a>{' '}
          or write to{' '}
          <a href={`mailto:${email}`} className="font-semibold text-ink underline underline-offset-4">
            {email}
          </a>
          .
        </p>
      </div>
    );
  }

  if (state.kind === 'sent') {
    return (
      <div role="status" className="grid content-start gap-3 rounded-2xl border border-line bg-paper p-6">
        <p className="font-mono text-[13px] text-ok">✓ POST /api/contact → 200</p>
        <h2 className="text-h2 font-semibold">Message sent.</h2>
        <p className="text-ink-2">Thanks, {values.name.split(' ')[0]}. I usually reply within 2 working days.</p>
      </div>
    );
  }

  const field = (key: 'name' | 'email', label: string, type: string, placeholder: string, autoComplete: string) => {
    const err = touched[key] ? errors[key] : undefined;
    return (
      <div className="grid gap-1.5">
        <label htmlFor={`${id}-${key}`} className="text-[13px] font-semibold">
          {label}
        </label>
        <input
          id={`${id}-${key}`}
          type={type}
          autoComplete={autoComplete}
          value={values[key]}
          onChange={e => set(key, e.target.value)}
          onBlur={() => blur(key)}
          placeholder={placeholder}
          aria-invalid={err ? true : undefined}
          aria-describedby={err ? `${id}-${key}-err` : undefined}
          className={`h-12 ${inputClass(err)}`}
        />
        {err ? (
          <p id={`${id}-${key}-err`} className="text-[13px] text-err">
            {err}
          </p>
        ) : null}
      </div>
    );
  };

  const messageErr = touched.message ? errors.message : undefined;

  return (
    <form noValidate onSubmit={submit} className="grid content-start gap-5" aria-busy={state.kind === 'sending'}>
      <div className="grid gap-5 sm:grid-cols-2">
        {field('name', 'Name', 'text', 'Your name', 'name')}
        {field('email', 'Email', 'email', 'you@company.com', 'email')}
      </div>

      <fieldset className="grid gap-2">
        <legend className="mb-1.5 text-[13px] font-semibold">What are you building?</legend>
        <div className="flex flex-wrap gap-2">
          {TYPES.map(t => (
            <label
              key={t}
              className={`inline-flex h-10 cursor-pointer items-center rounded-full border px-4 text-sm font-medium transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-signal ${
                type === t ? 'border-ink bg-ink text-paper' : 'border-line-strong text-ink-2 hover:border-ink hover:text-ink'
              }`}
            >
              <input type="radio" name="type" value={t} checked={type === t} onChange={() => setType(t)} className="sr-only" />
              {t}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-1.5">
        <label htmlFor={`${id}-budget`} className="text-[13px] font-semibold">
          Budget <span className="font-normal text-ink-3">(optional)</span>
        </label>
        <input
          id={`${id}-budget`}
          value={values.budget}
          onChange={e => set('budget', e.target.value)}
          placeholder="A range is fine"
          className={`h-12 ${inputClass()}`}
        />
      </div>

      <div className="grid gap-1.5">
        <label htmlFor={`${id}-message`} className="text-[13px] font-semibold">
          Message
        </label>
        <textarea
          id={`${id}-message`}
          rows={6}
          value={values.message}
          onChange={e => set('message', e.target.value)}
          onBlur={() => blur('message')}
          placeholder="What you are building, who it is for, and when you would like to start."
          aria-invalid={messageErr ? true : undefined}
          aria-describedby={messageErr ? `${id}-message-err` : `${id}-message-help`}
          className={`py-3 ${inputClass(messageErr)}`}
        />
        {messageErr ? (
          <p id={`${id}-message-err`} className="text-[13px] text-err">
            {messageErr}
          </p>
        ) : (
          <p id={`${id}-message-help`} className="text-[13px] text-ink-3">
            A few sentences is plenty.
          </p>
        )}
      </div>

      {/* Honeypot: hidden from people, filled by bots */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor={`${id}-company`}>Company</label>
        <input id={`${id}-company`} tabIndex={-1} autoComplete="off" value={values.company} onChange={e => set('company', e.target.value)} />
      </div>

      {state.kind === 'failed' ? (
        <div role="alert" className="grid gap-1.5 rounded-2xl border border-[color-mix(in_srgb,var(--err)_50%,transparent)] bg-err-soft p-4">
          <p className="font-mono text-[13px] text-err">✕ POST /api/contact failed</p>
          <p className="font-semibold">Your message wasn&apos;t sent</p>
          <p className="text-sm text-ink-2">
            {state.reason} Your text is still in the form, so you can try again, or email{' '}
            <a href={`mailto:${email}`} className="font-semibold text-ink underline">
              {email}
            </a>{' '}
            directly.
          </p>
        </div>
      ) : null}

      <div>
        <Button
          type="submit"
          disabled={state.kind === 'sending'}
          busy={state.kind === 'sending'}
          arrow={state.kind !== 'sending'}
          label={state.kind === 'sending' ? 'Sending…' : state.kind === 'failed' ? 'Try again' : 'Send message'}
          className="min-w-[190px]"
        />
      </div>
    </form>
  );
}
