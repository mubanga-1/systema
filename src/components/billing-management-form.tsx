'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { updateSubscriptionStatus, updateSubscriptionPlan } from '../app/[locale]/billing/actions';
import { Link } from '@/i18n/navigation';
import { toast } from 'sonner';

type SubscriptionStatus = 'active' | 'canceled' | 'unpaid';
type PlanKey = 'base' | 'pro' | 'vanguard';

interface SubscriptionData {
  plan: PlanKey;
  status: SubscriptionStatus;
  next_billing_at: string | null;
}

interface Props {
  initialData: SubscriptionData;
  locale: string;
}

export default function BillingManagementForm({ initialData }: Props) {
  const t = useTranslations('settingsPage.subscription');
  const tGlobal = useTranslations();
  const [subscription, setSubscription] = useState<SubscriptionData>(initialData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleToggleRenewal = async () => {
    setIsSubmitting(true);
    const newStatus = subscription.status === 'active' ? 'canceled' : 'active';
    const { success, error } = await updateSubscriptionStatus(newStatus);
    
    if (success) {
      setSubscription((prev) => ({ ...prev, status: newStatus }));
      toast.success(t('changeSuccess'));
    } else {
      toast.error(error || t('changeError'));
    }
    setIsSubmitting(false);
  };

  const handleChangePlan = async (newPlan: PlanKey) => {
    if (newPlan === subscription.plan) return;
    setIsSubmitting(true);
    const { success, error } = await updateSubscriptionPlan(newPlan);
    
    if (success) {
      setSubscription((prev) => ({ ...prev, plan: newPlan }));
      toast.success(t('changeSuccess'));
    } else {
      toast.error(error || t('changeError'));
    }
    setIsSubmitting(false);
  };

  const nextBillingDate = subscription.next_billing_at
    ? new Date(subscription.next_billing_at).toLocaleDateString()
    : t('notApplicable');

  return (
    <div className="max-w-2xl mx-auto space-y-8 p-6">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{t('title')}</h2>
          <p className="text-muted-foreground">{tGlobal('settingsPage.subtitle')}</p>
        </div>
        <Link 
          href="/settings" 
          className="text-sm font-medium text-primary hover:underline"
        >
          ← {tGlobal('settings')}
        </Link>
      </div>

      <div className="grid gap-6 border rounded-lg p-6 bg-card text-card-foreground shadow-sm">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Current Plan</p>
            <p className="text-2xl font-bold">{subscription.plan.toUpperCase()}</p>
          </div>
          <div className="text-right space-y-1">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Status</p>
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              subscription.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
            }`}>
              {tGlobal(`paymentStatus.${subscription.status}`)}
            </span>
          </div>
        </div>

        <div className="border-t pt-4">
          <p className="text-sm text-muted-foreground">
            {subscription.status === 'active' 
              ? t('renewal', { date: nextBillingDate }) 
              : `Your access ends on ${nextBillingDate}`}
          </p>
        </div>

        <div className="pt-2">
          <button 
            onClick={handleToggleRenewal} 
            disabled={isSubmitting} 
            className={`w-full py-2 rounded-md font-medium transition-colors ${
              subscription.status === 'active' 
                ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {subscription.status === 'active' ? t('cancelRenewal') : t('reactivateRenewal')}
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold">{t('changePlan')}</h3>
        <div className="grid grid-cols-3 gap-3">
          {['base', 'pro', 'vanguard'].map((plan) => (
            <button
              key={plan}
              onClick={() => handleChangePlan(plan as PlanKey)}
              disabled={isSubmitting || subscription.plan === plan}
              className={`py-3 px-4 rounded-md border text-center transition-all ${
                subscription.plan === plan 
                  ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-600' 
                  : 'hover:border-gray-400 hover:bg-gray-50'
              } disabled:opacity-50`}
            >
              <p className="font-bold">{plan.toUpperCase()}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
