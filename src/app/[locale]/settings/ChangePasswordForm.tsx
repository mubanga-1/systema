'use client';

import { useActionState } from 'react';
import { PasswordInput } from '@/components/PasswordInput';
import {
  changePasswordAction,
  type ChangePasswordState,
} from './actions';

type ChangePasswordLabels = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  submit: string;
  success: string;
  passwordMismatch: string;
  invalidCurrentPassword: string;
  changeError: string;
};

type ChangePasswordFormProps = {
  labels: ChangePasswordLabels;
};

function resolveError(
  state: ChangePasswordState,
  labels: ChangePasswordLabels
) {
  if (!state.errorCode) return null;
  if (state.errorCode === 'passwordMismatch') return labels.passwordMismatch;
  if (state.errorCode === 'invalidCurrentPassword') {
    return labels.invalidCurrentPassword;
  }

  return state.message ?? labels.changeError;
}

export function ChangePasswordForm({ labels }: ChangePasswordFormProps) {
  const [state, formAction, pending] = useActionState(
    changePasswordAction,
    {}
  );
  const error = resolveError(state, labels);

  return (
    <form action={formAction} className="mt-5 grid gap-4">
      <PasswordInput
        label={labels.currentPassword}
        name="currentPassword"
        required
        autoComplete="current-password"
      />
      <PasswordInput
        label={labels.newPassword}
        name="newPassword"
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
      {state.ok && <p className="text-sm text-emerald-300">{labels.success}</p>}
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-cyan-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-400 disabled:opacity-50"
      >
        {pending ? '...' : labels.submit}
      </button>
    </form>
  );
}
