'use client';

import { useActionState } from 'react';
import { PasswordInput } from '@/components/PasswordInput';
import {
  resetPasswordAction,
  updatePasswordAction,
  type ResetPasswordState,
} from './actions';

type ResetPasswordLabels = {
  email: string;
  password: string;
  confirmPassword: string;
  passwordMismatch: string;
  resetPassword: string;
  resetPasswordSent: string;
  resetPasswordError: string;
};

type Props = {
  locale: string;
  labels: ResetPasswordLabels;
  mode: 'request' | 'update';
};

const initialState: ResetPasswordState = { ok: false };

function resolveError(state: ResetPasswordState, labels: ResetPasswordLabels) {
  if (!state.error) return null;
  if (state.errorCode === 'passwordMismatch') return labels.passwordMismatch;
  return state.message ?? labels.resetPasswordError;
}

export function ResetPasswordForm({ locale, labels, mode }: Props) {
  const action = mode === 'update' ? updatePasswordAction : resetPasswordAction;
  const [state, formAction, pending] = useActionState(action, initialState);
  const error = resolveError(state, labels);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="locale" value={locale} />
      {mode === 'request' ? (
        <label className="flex flex-col gap-1 text-sm text-zinc-200">
          {labels.email}
          <input
            type="email"
            name="email"
            required
            className="rounded-lg border border-cyan-200/35 bg-slate-900/70 px-3 py-2 text-zinc-100 outline-none transition focus:border-cyan-200/80 focus:ring-2 focus:ring-cyan-300/30"
          />
        </label>
      ) : (
        <>
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
        </>
      )}
      {error && (
        <p className="text-sm text-rose-300">{error}</p>
      )}
      {mode === 'request' && state.ok === true && (
        <p className="text-sm text-emerald-300">{labels.resetPasswordSent}</p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="rounded-full border border-zinc-300/80 bg-zinc-200/15 px-4 py-2 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08),0_0_22px_rgba(255,255,255,0.12)] transition hover:bg-zinc-200/20 disabled:opacity-50"
      >
        {pending ? '...' : labels.resetPassword}
      </button>
    </form>
  );
}
