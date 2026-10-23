'use client';

import { useId, useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/primitives';
import { formText, type FormText, type Locale } from '@/content/i18n';

const TYPES = ['Web app', 'Mobile app', 'AI feature', 'Something else'] as const;

type Errors = Partial<Record<'name' | 'email' | 'message', string>>;
type State =
  | { kind: 'idle' }
  | { kind: 'sending' }
  | { kind: 'sent' }
  | { kind: 'mailto'; href: string }
  | { kind: 'failed'; reason: string };

function validate(data: { name: string; email: string; message: string }, t: FormText): Errors {
  const e: Errors = {};
  if (!data.name.trim()) e.name = t.errName;
  if (!data.email.trim()) e.email = t.errEmail;
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(data.email.trim())) e.email = t.errEmailDomain;
  if (data.message.trim().length < 20) e.message = t.errMessage;
  return e;
}

const inputClass = (error?: string): string =>
  `w-full rounded-xl border bg-surface px-3.5 text-base text-ink transition-[border-color,box-shadow] placeholder:text-ink-3 focus:outline-none ${
    error
      ? 'border-err shadow-[0_0_0_3px_var(--err-soft)]'
      : 'border-line-strong focus:border-signal focus:shadow-[0_0_0_3px_var(--signal-soft)]'
  }`;

/** `locale` translates what the visitor reads; the type, and anything sent to the API, stays in English. */
export default function ContactForm({ email, locale = 'en' }: { email: string; locale?: Locale }) {
  const t = formText[locale];
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
    if (errors[key as keyof Errors]) setErrors(prev => ({ ...prev, [key]: validate(next, t)[key as keyof Errors] }));
  };

  const blur = (key: keyof Errors): void => {
    setTouched(t => ({ ...t, [key]: true }));
    setErrors(prev => ({ ...prev, [key]: validate(values, t)[key] }));
  };

  const submit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    const found = validate(values, t);
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
        <h2 className="text-h2 font-semibold">{t.almostTitle}</h2>
        <p className="text-ink-2">
          {locale === 'en' ? (
            <>
              Your email app should have opened with your message ready to send. If it didn&apos;t,{' '}
              <a href={state.href} className="font-semibold text-ink underline underline-offset-4">
                open it here
              </a>{' '}
              or write to
            </>
          ) : (
            t.almostText
          )}{' '}
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
        <h2 className="text-h2 font-semibold">{t.sentTitle}</h2>
        <p className="text-ink-2">{t.sentText(values.name.split(' ')[0])}</p>
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
        {field('name', t.name, 'text', t.namePlaceholder, 'name')}
        {field('email', t.email, 'email', 'you@company.com', 'email')}
      </div>

      <fieldset className="grid gap-2">
        <legend className="mb-1.5 text-[13px] font-semibold">{t.typeLegend}</legend>
        <div className="flex flex-wrap gap-2">
          {TYPES.map(option => (
            <label
              key={option}
              className={`inline-flex h-10 cursor-pointer items-center rounded-full border px-4 text-sm font-medium transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-signal ${
                type === option ? 'border-ink bg-ink text-paper' : 'border-line-strong text-ink-2 hover:border-ink hover:text-ink'
              }`}
            >
              <input type="radio" name="type" value={option} checked={type === option} onChange={() => setType(option)} className="sr-only" />
              {t.types[option]}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-1.5">
        <label htmlFor={`${id}-budget`} className="text-[13px] font-semibold">
          {t.budget} <span className="font-normal text-ink-3">{t.optional}</span>
        </label>
        <input
          id={`${id}-budget`}
          value={values.budget}
          onChange={e => set('budget', e.target.value)}
          placeholder={t.budgetPlaceholder}
          className={`h-12 ${inputClass()}`}
        />
      </div>

      <div className="grid gap-1.5">
        <label htmlFor={`${id}-message`} className="text-[13px] font-semibold">
          {t.message}
        </label>
        <textarea
          id={`${id}-message`}
          rows={6}
          value={values.message}
          onChange={e => set('message', e.target.value)}
          onBlur={() => blur('message')}
          placeholder={t.messagePlaceholder}
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
            {t.messageHelp}
          </p>
        )}
      </div>

      {/* Honeypot: hidden from people, filled by bots */}
      {/* Pushed off the start side: in right-to-left pages, a left offset would widen the page instead. */}
      <div aria-hidden="true" className="absolute -start-[9999px] h-px w-px overflow-hidden">
        <label htmlFor={`${id}-company`}>Company</label>
        <input id={`${id}-company`} tabIndex={-1} autoComplete="off" value={values.company} onChange={e => set('company', e.target.value)} />
      </div>

      {state.kind === 'failed' ? (
        <div role="alert" className="grid gap-1.5 rounded-2xl border border-[color-mix(in_srgb,var(--err)_50%,transparent)] bg-err-soft p-4">
          <p className="font-mono text-[13px] text-err">✕ POST /api/contact failed</p>
          <p className="font-semibold">{t.failedTitle}</p>
          <p className="text-sm text-ink-2">
            {state.reason} {t.failedText}{' '}
            <a href={`mailto:${email}`} className="font-semibold text-ink underline">
              {email}
            </a>
            {locale === 'en' ? ' directly.' : null}
          </p>
        </div>
      ) : null}

      <div>
        <Button
          type="submit"
          disabled={state.kind === 'sending'}
          busy={state.kind === 'sending'}
          arrow={state.kind !== 'sending'}
          label={state.kind === 'sending' ? t.sending : state.kind === 'failed' ? t.retry : t.send}
          className="min-w-[190px]"
        />
      </div>
    </form>
  );
}
