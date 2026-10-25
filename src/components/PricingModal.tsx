import React, { useState, useEffect } from 'react';
import {
  X,
  Check,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Lock,
  Mail,
  CheckCircle2,
} from 'lucide-react';
import { SubscriptionTier, PaymentRecord, AdminNotification } from '../types/saas';
import { PLANS, PAYPAL_RECEIVER_EMAIL, SUPER_ADMIN_EMAIL } from '../constants/plans';
import { processPayPalPayment } from '../services/paypalService';

interface PricingModalProps {
  currentTier: SubscriptionTier;
  userEmail: string;
  workspaceId?: string;
  onClose: () => void;
  onPaymentSuccess: (payment: PaymentRecord, notif: AdminNotification) => void;
}

export const PricingModal: React.FC<PricingModalProps> = ({
  currentTier,
  userEmail,
  workspaceId,
  onClose,
  onPaymentSuccess,
}) => {
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionTier>(
    currentTier === 'starter' ? 'pro' : currentTier === 'pro' ? 'enterprise' : 'pro'
  );
  const [checkoutEmail, setCheckoutEmail] = useState(userEmail || 'client@enterprise.com');
  const [isProcessing, setIsProcessing] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState<number | null>(null);
  const [completedPayment, setCompletedPayment] = useState<{
    payment: PaymentRecord;
    notification: AdminNotification;
  } | null>(null);

  const plan = PLANS[selectedPlan];

  const handleReturnToDashboard = () => {
    if (completedPayment) {
      onPaymentSuccess(completedPayment.payment, completedPayment.notification);
    }
    onClose();
  };

  // Automatic 2-second redirect timer upon payment completion
  useEffect(() => {
    if (!completedPayment) return;

    setRedirectCountdown(2);
    const interval = setInterval(() => {
      setRedirectCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          handleReturnToDashboard();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [completedPayment]);

  // Official PayPal Live SDK Buttons mount handler
  useEffect(() => {
    let isCancelled = false;
    const initButtons = () => {
      if (isCancelled) return;
      const paypal = (window as unknown as { paypal?: { Buttons?: (opts: unknown) => { render: (selector: string) => Promise<void> } } }).paypal;
      if (paypal && paypal.Buttons) {
        const container = document.getElementById('paypal-pricing-modal-sdk-container');
        if (container) {
          container.innerHTML = '';
          try {
            paypal.Buttons({
              style: {
                layout: 'vertical',
                color: 'gold',
                shape: 'rect',
                label: 'paypal',
                height: 44,
              },
              createOrder: async () => {
                const res = await fetch('/api/paypal/create-order', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    plan: selectedPlan,
                    customerEmail: checkoutEmail.trim(),
                    workspaceId,
                  }),
                });
                const data = await res.json();
                return data.orderId;
              },
              onApprove: async (data: { orderID: string }) => {
                setIsProcessing(true);
                try {
                  const captureRes = await fetch('/api/paypal/capture-order', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      orderId: data.orderID,
                      plan: selectedPlan,
                      customerEmail: checkoutEmail.trim(),
                      workspaceId,
                    }),
                  });
                  const captureResult = await captureRes.json();
                  if (captureResult.payment) {
                    onPaymentSuccess(captureResult.payment, captureResult.notification);
                    onClose();
                  }
                } catch (err) {
                  console.error('[PAYPAL LIVE SDK CAPTURE ERROR]', err);
                } finally {
                  setIsProcessing(false);
                }
              },
            }).render('#paypal-pricing-modal-sdk-container');
          } catch (e) {
            console.warn('[PAYPAL BUTTON RENDER NOTICE]', e);
          }
        }
      }
    };

    const timer = setTimeout(initButtons, 250);
    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [selectedPlan, checkoutEmail, workspaceId]);

  const handleExecutePayPalCheckout = async () => {
    if (!checkoutEmail.trim()) return;
    setIsProcessing(true);

    try {
      const res = await processPayPalPayment({
        customerEmail: checkoutEmail.trim(),
        customerName: checkoutEmail.split('@')[0],
        plan: selectedPlan,
        amount: plan.price,
        workspaceId,
      });

      if (res.success) {
        onPaymentSuccess(res.payment, res.notification);
        onClose();
      }
    } catch (err) {
      console.error('PayPal checkout error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-4xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {!completedPayment ? (
          <>
            {/* Header */}
            <div className="text-center space-y-2 max-w-xl mx-auto">
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-mono uppercase">
                Flexible Monthly Billing
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                Accelerate Your AI Brand Visibility
              </h2>
              <p className="text-xs sm:text-sm text-slate-600">
                Automated monthly recurring billing routed securely to merchant PayPal with instant provisioning.
              </p>
            </div>

            {/* Plan Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {(Object.keys(PLANS) as SubscriptionTier[]).map((tierKey) => {
                const item = PLANS[tierKey];
                const isSelected = selectedPlan === tierKey;
                const isCurrent = currentTier === tierKey;

                return (
                  <div
                    key={tierKey}
                    onClick={() => setSelectedPlan(tierKey)}
                    className={`rounded-xl p-5 border cursor-pointer transition-all flex flex-col justify-between relative ${
                      isSelected
                        ? 'bg-indigo-50/50 border-indigo-600 shadow-sm ring-1 ring-indigo-600'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {item.popular && (
                      <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[10px] font-bold font-mono uppercase px-2.5 py-0.5 rounded-full bg-indigo-600 text-white shadow-xs">
                        Most Popular (Agency)
                      </span>
                    )}

                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-bold text-slate-900">{item.name}</h3>
                          {isCurrent && (
                            <span className="text-[10px] font-mono text-emerald-700 px-1.5 py-0.5 bg-emerald-50 rounded border border-emerald-200 font-semibold">
                              Current
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">{item.scanFrequency}</p>
                      </div>

                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold font-mono text-slate-900 tabular-nums">
                          ${item.price}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">/month</span>
                      </div>

                      <ul className="space-y-2 text-xs text-slate-700 pt-2 border-t border-slate-100">
                        {item.features.map((feat, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                            <span className="text-[11px] leading-tight text-slate-600">{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-4 mt-4 border-t border-slate-100">
                      <div
                        className={`w-full py-2 text-xs font-semibold text-center rounded-lg transition-colors ${
                          isSelected
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {isSelected ? 'Selected Plan' : 'Select Plan'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* PayPal Checkout Execution Box */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-md bg-[#003087] flex items-center justify-center text-white font-bold text-xs italic">
                    P
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">
                      Instant PayPal Checkout · {plan.name} (${plan.price}/mo)
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Receiver: <span className="font-mono text-indigo-600 font-semibold">{PAYPAL_RECEIVER_EMAIL}</span>
                    </p>
                  </div>
                </div>

                <div className="text-[11px] text-emerald-700 font-mono font-medium flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> SSL Encrypted & Instant Notification
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Subscriber Billing Email
                  </label>
                  <input
                    type="email"
                    value={checkoutEmail}
                    onChange={(e) => setCheckoutEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 font-mono shadow-2xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Currency & Cadence
                  </label>
                  <div className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 font-mono flex items-center justify-between shadow-2xs">
                    <span>USD ($)</span>
                    <span className="text-indigo-600 font-bold">${plan.price}.00 / Month</span>
                  </div>
                </div>
              </div>

              {/* Official PayPal Live JavaScript SDK Button Container */}
              <div className="space-y-3 pt-1">
                <div>
                  <div className="text-[11px] font-semibold text-slate-700 mb-1 flex items-center justify-between">
                    <span>Official PayPal Live Payment Method</span>
                    <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-semibold">
                      Live api-m.paypal.com
                    </span>
                  </div>
                  <div id="paypal-pricing-modal-sdk-container" className="w-full min-h-[46px] rounded-lg"></div>
                </div>

                <div className="relative flex py-1 items-center">
                  <div className="flex-grow border-t border-slate-200"></div>
                  <span className="flex-shrink mx-3 text-[10px] text-slate-400 font-mono uppercase">
                    Or One-Click Direct Merchant Routing
                  </span>
                  <div className="flex-grow border-t border-slate-200"></div>
                </div>

                {/* PayPal Express Button */}
                <button
                  type="button"
                  onClick={handleExecutePayPalCheckout}
                  disabled={isProcessing || !checkoutEmail.trim()}
                  className="w-full py-3 bg-[#0070ba] hover:bg-[#003087] disabled:opacity-50 text-white font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Processing Live PayPal Gateway & Routing Funds...
                    </>
                  ) : (
                    <>
                      <span>Pay with</span>
                      <span className="font-bold italic text-sm tracking-tight">PayPal</span>
                      <span>· Subscribe for ${plan.price}/mo</span>
                    </>
                  )}
                </button>
              </div>

              <p className="text-[10px] text-center text-slate-500">
                Instant alert email automatically triggered to{' '}
                <span className="font-mono text-slate-700 font-medium">{SUPER_ADMIN_EMAIL}</span> on confirmation.
              </p>
            </div>
          </>
        ) : (
          /* Payment Success Confirmation Receipt */
          <div className="text-center py-6 space-y-5">
            <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-bold text-slate-900">Subscription Active!</h3>
              <p className="text-xs text-slate-600">
                Your workspace has been upgraded to the{' '}
                <strong className="text-slate-900 uppercase font-mono">{completedPayment.payment.plan}</strong> Tier.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-left text-xs space-y-2 max-w-md mx-auto font-mono">
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Transaction ID:</span>
                <span className="text-slate-900 font-bold">{completedPayment.payment.transactionId}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Order Amount:</span>
                <span className="text-emerald-600 font-bold">${completedPayment.payment.amount}.00 USD</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Payout Destination:</span>
                <span className="text-indigo-600 font-bold">{completedPayment.payment.receiverEmail}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Admin Notification:</span>
                <span className="text-emerald-700 font-medium">Dispatched to {SUPER_ADMIN_EMAIL}</span>
              </div>
            </div>

            <div className="flex flex-col items-center gap-3 pt-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                <span>Redirecting to dashboard in {redirectCountdown ?? 2}s...</span>
              </div>

              <button
                type="button"
                onClick={handleReturnToDashboard}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs flex items-center gap-2 cursor-pointer"
              >
                <span>Return to Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PricingModal;
