'use client';

import { useActionState } from 'react';
import { signUpAction, type SignUpState } from './actions';
import { PasswordInput } from '@/components/PasswordInput';

export type RegisterFormLabels = {
  email: string;
  password: string;
  confirmPassword: string;
  signUp: string;
  passwordMismatch: string;
  signUpError: string;
  emailExists?: string;
};

type RegisterFormProps = {
  locale: string;
  labels: RegisterFormLabels;
};

function resolveError(state: SignUpState, labels: RegisterFormLabels): string | null {
  if (!state.errorCode) return null;
  if (state.errorCode === 'passwordMismatch') return labels.passwordMismatch;
  if (state.errorCode === 'emailExists') return state.message ?? labels.emailExists ?? labels.signUpError;
  return state.message ?? labels.signUpError;
}

export function RegisterForm({ locale, labels }: RegisterFormProps) {
  const [state, formAction, pending] = useActionState(signUpAction, {});
  const error = resolveError(state, labels);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="locale" value={locale} />
      <label className="flex flex-col gap-1 text-sm text-zinc-200">
        {labels.email}
        <input
          type="email"
          name="email"
          required
          className="rounded-lg border border-cyan-200/35 bg-slate-900/70 px-3 py-2 text-zinc-100 outline-none transition focus:border-cyan-200/80 focus:ring-2 focus:ring-cyan-300/30"
        />
      </label>
      <PasswordInput
        label={labels.password}
        name="password"
        required
        autoComplete="new-password"
      />
      <PasswordInput
        label={labels.confirmPassword}
        name="confirmPassword"
        required
        autoComplete="new-password"
      />
      {error && <p className="text-sm text-rose-300">{error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="rounded-full border border-zinc-300/80 bg-zinc-200/15 px-4 py-2 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08),0_0_22px_rgba(255,255,255,0.12)] transition hover:bg-zinc-200/20 disabled:opacity-50"
      >
        {pending ? '...' : labels.signUp}
      </button>
    </form>
  );
}
