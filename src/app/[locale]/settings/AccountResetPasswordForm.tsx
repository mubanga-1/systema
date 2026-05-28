'use client';

import { useActionState } from 'react';
import {
  sendAccountResetPasswordAction,
  type AccountResetPasswordState,
} from './actions';

type AccountResetPasswordFormProps = {
  labels: {
    submit: string;
    success: string;
    error: string;
  };
  locale: string;
};

const initialState: AccountResetPasswordState = {};

export function AccountResetPasswordForm({
  labels,
  locale,
}: AccountResetPasswordFormProps) {
  const [state, formAction, pending] = useActionState(
    sendAccountResetPasswordAction,
    initialState
  );

  return (
    <form action={formAction} className="space-y-2">
      <input type="hidden" name="locale" value={locale} />
      <button
        type="submit"
        disabled={pending}
        className="inline-flex w-full items-center justify-center rounded-full border border-zinc-600 px-4 py-2 text-sm font-semibold text-zinc-100 transition hover:border-zinc-300 disabled:opacity-50 min-[608px]:w-auto"
      >
        {pending ? '...' : labels.submit}
      </button>
      {state.ok && <p className="text-sm text-emerald-300">{labels.success}</p>}
      {state.error && (
        <p className="text-sm text-rose-300">{state.message ?? labels.error}</p>
      )}
    </form>
  );
}
