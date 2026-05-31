'use client';

import { useActionState } from 'react';
import {
  deleteAccountAction,
  type DeleteAccountState,
} from '../settings/actions';

type DeleteAccountFormProps = {
  locale: string;
  email: string;
  label: string;
};

const initialState: DeleteAccountState = {};

export function DeleteAccountForm({
  locale,
  email,
  label,
}: DeleteAccountFormProps) {
  const [state, formAction, pending] = useActionState(
    deleteAccountAction,
    initialState
  );

  return (
    <form action={formAction} className="mt-5 grid gap-3">
      <input type="hidden" name="locale" value={locale} />
      <input
        name="confirmation"
        type="email"
        placeholder={email}
        className="rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white outline-none transition focus:border-rose-300"
        required
      />
      {state.error && <p className="text-sm text-rose-300">{state.message}</p>}
      <button
        type="submit"
        disabled={pending}
        className="rounded-full border border-rose-300/40 px-4 py-2 text-sm font-semibold text-rose-100 transition hover:bg-rose-400/10 disabled:opacity-50"
      >
        {pending ? '...' : label}
      </button>
    </form>
  );
}
