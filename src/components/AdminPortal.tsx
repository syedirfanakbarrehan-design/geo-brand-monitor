import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  DollarSign,
  Users,
  Settings,
  Bell,
  CheckCircle2,
  Cpu,
  Key,
  ExternalLink,
  RefreshCw,
  TrendingUp,
  ArrowUpRight,
  Send,
  Lock,
  Layers,
} from 'lucide-react';
import {
  PaymentRecord,
  AdminNotification,
  AdminApiSettings,
  UserAccount,
} from '../types/saas';
import { SUPER_ADMIN_EMAIL, PAYPAL_RECEIVER_EMAIL, PLANS } from '../constants/plans';

interface AdminPortalProps {
  currentUserEmail: string;
  onSwitchWorkspace: (workspaceId: string) => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  currentUserEmail,
  onSwitchWorkspace,
}) => {
  const [metrics, setMetrics] = useState<{
    currentMRR: number;
    mrrTarget: number;
    progressPct: number;
    totalUsers: number;
    activeSubscriptions: number;
    payments: PaymentRecord[];
    notifications: AdminNotification[];
  }>({
    currentMRR: 1196,
    mrrTarget: 5000,
    progressPct: 24,
    totalUsers: 4,
    activeSubscriptions: 4,
    payments: [],
    notifications: [],
  });

  const [settings, setSettings] = useState<AdminApiSettings>({
    dualModeSimulated: true,
    openaiKey: '',
    perplexityKey: '',
    anthropicKey: '',
    geminiKey: '',
    receiverPayPalEmail: PAYPAL_RECEIVER_EMAIL,
    adminNotificationEmail: SUPER_ADMIN_EMAIL,
    paypalClientId: 'sb-client-id-sample',
  });

  const [usersList, setUsersList] = useState<UserAccount[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'settings' | 'users' | 'payments' | 'notifications'>('overview');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [simulatingWebhook, setSimulatingWebhook] = useState(false);
  const [webhookMessage, setWebhookMessage] = useState<string | null>(null);

  // Load metrics and settings with Super Admin authorization
  const fetchAdminData = async () => {
    try {
      const authHeaders = { 'x-admin-email': currentUserEmail };
      const [mRes, sRes, uRes] = await Promise.all([
        fetch('/api/admin/metrics', { headers: authHeaders }),
        fetch('/api/admin/settings', { headers: authHeaders }),
        fetch('/api/auth/users'),
      ]);
      if (mRes.ok) setMetrics(await mRes.json());
      if (sRes.ok) setSettings(await sRes.json());
      if (uRes.ok) setUsersList(await uRes.json());
    } catch (err) {
      console.warn('Could not fetch admin data from backend:', err);
    }
  };

  useEffect(() => {
    fetchAdminData();
    const interval = setInterval(fetchAdminData, 15000);
    return () => clearInterval(interval);
  }, [currentUserEmail]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-email': currentUserEmail,
        },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Failed to save settings:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTriggerTestWebhook = async () => {
    setSimulatingWebhook(true);
    setWebhookMessage(null);
    try {
      const res = await fetch('/api/paypal/webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-email': currentUserEmail,
        },
        body: JSON.stringify({
          event_type: 'PAYMENT.SALE.COMPLETED',
          resource: {
            id: `TEST-TX-${Date.now().toString(36).toUpperCase()}`,
            amount: { total: '299.00', currency: 'USD' },
            subscriber: { email_address: 'client-test@vectorgrowth.io' },
          },
        }),
      });
      if (res.ok) {
        setWebhookMessage(`Simulated payment routed to ${PAYPAL_RECEIVER_EMAIL} & alert queued to ${SUPER_ADMIN_EMAIL}!`);
        await fetchAdminData();
      }
    } catch (err) {
      setWebhookMessage('Error triggering test webhook');
    } finally {
      setSimulatingWebhook(false);
    }
  };

  // Strict Super Admin Access Authorization Guard
  if (currentUserEmail.toLowerCase() !== SUPER_ADMIN_EMAIL.toLowerCase()) {
    return (
      <div className="bg-white border border-rose-200 rounded-2xl p-8 sm:p-12 text-center max-w-lg mx-auto my-12 shadow-sm space-y-4">
        <div className="w-14 h-14 rounded-full bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto shadow-xs">
          <Lock className="w-7 h-7" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-bold tracking-tight text-slate-900">Super Admin Authorization Required</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Master MRR tracking, payment logs, and global multi-AI engine settings are strictly restricted to{' '}
            <strong className="text-slate-900 font-mono">{SUPER_ADMIN_EMAIL}</strong>.
          </p>
        </div>
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-500">
          Current Session Identity: <span className="text-slate-900 font-semibold">{currentUserEmail}</span>
        </div>
        <p className="text-[11px] text-slate-400">
          Use the top-right account switcher to switch to the Super Admin profile to access this console.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Super Admin Identification Banner */}
      <div className="bg-white border border-slate-200 shadow-xs rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-lg shrink-0 mt-0.5">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-slate-900">Super Admin Console</h1>
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono font-medium">
                MASTER ACCESS
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              Logged in as <span className="text-slate-900 font-medium">{SUPER_ADMIN_EMAIL}</span> · Payout routing directly to{' '}
              <span className="text-indigo-600 font-mono font-medium">{PAYPAL_RECEIVER_EMAIL}</span>
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 border border-slate-200 rounded-lg shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
              activeTab === 'overview' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Overview & MRR
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
              activeTab === 'settings' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            API & Live Switches
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
              activeTab === 'users' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Workspaces ({usersList.length})
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
              activeTab === 'payments' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Payment Logs
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
              activeTab === 'notifications' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Alerts ({metrics.notifications.length})
          </button>
        </div>
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* MRR Progress & Key Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Target MRR Tracker */}
            <div className="bg-white border border-slate-200 shadow-xs rounded-xl p-5 relative overflow-hidden">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                <span>Monthly Recurring Revenue</span>
                <span className="text-emerald-600 font-semibold">Target: $5,000/mo</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold tracking-tight text-slate-900 font-mono tabular-nums">
                  ${metrics.currentMRR.toLocaleString()}
                </span>
                <span className="text-xs text-slate-500">/mo</span>
              </div>
              {/* Progress bar toward $5,000/mo target */}
              <div className="mt-3.5 space-y-1.5">
                <div className="flex justify-between text-[11px] text-slate-600">
                  <span>Goal Progress</span>
                  <span className="font-mono text-indigo-600 font-bold">{metrics.progressPct}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                  <div
                    className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(8, metrics.progressPct)}%` }}
                  />
                </div>
                <div className="text-[10px] text-slate-400 flex justify-between">
                  <span>$0</span>
                  <span>Target: $5,000 MRR</span>
                </div>
              </div>
            </div>

            {/* Active Subscriptions */}
            <div className="bg-white border border-slate-200 shadow-xs rounded-xl p-5">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                <span>Active Subscriptions</span>
                <Users className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="text-3xl font-bold tracking-tight text-slate-900 font-mono tabular-nums">
                {metrics.activeSubscriptions}
              </div>
              <p className="text-xs text-slate-500 mt-2">
                {usersList.filter((u) => u.tier === 'pro').length} Pro · {usersList.filter((u) => u.tier === 'enterprise').length} Enterprise
              </p>
            </div>

            {/* Payout Destination */}
            <div className="bg-white border border-slate-200 shadow-xs rounded-xl p-5">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                <span>PayPal Payout Account</span>
                <DollarSign className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-sm font-semibold text-slate-900 truncate font-mono">
                {PAYPAL_RECEIVER_EMAIL}
              </div>
              <p className="text-[11px] text-emerald-600 mt-2 flex items-center gap-1 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> Live Gateway Routing Active
              </p>
            </div>

            {/* Dual Mode Engine Status */}
            <div className="bg-white border border-slate-200 shadow-xs rounded-xl p-5">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                <span>AI Scan Engine Mode</span>
                <Cpu className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-sm font-semibold text-slate-900">
                {settings.dualModeSimulated ? (
                  <span className="text-amber-600 font-semibold">Simulated Engine (Zero-Cost)</span>
                ) : (
                  <span className="text-emerald-600 font-semibold">Live API Provider Mode</span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 mt-2">
                {settings.dualModeSimulated
                  ? 'Deterministic rankings across 4 models'
                  : 'Routing queries to active API keys'}
              </p>
            </div>
          </div>

          {/* Quick Simulation & Live Webhook Tester */}
          <div className="bg-white border border-slate-200 shadow-xs rounded-xl p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">PayPal Instant Revenue Simulator</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Test the real-time payment capture, instant webhook listener, and admin alert to {SUPER_ADMIN_EMAIL}.
                </p>
              </div>
              <button
                onClick={handleTriggerTestWebhook}
                disabled={simulatingWebhook}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors shrink-0 shadow-xs"
              >
                {simulatingWebhook ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Simulating...
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" /> Fire $299 Test Transaction
                  </>
                )}
              </button>
            </div>

            {webhookMessage && (
              <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{webhookMessage}</span>
              </div>
            )}
          </div>

          {/* Recent Payments Table */}
          <div className="bg-white border border-slate-200 shadow-xs rounded-xl overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">Recent Subscription Transactions</h2>
                <p className="text-xs text-slate-500">Funds routed to {PAYPAL_RECEIVER_EMAIL}</p>
              </div>
              <button
                onClick={fetchAdminData}
                className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
                title="Refresh logs"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-4 font-semibold">Customer Email</th>
                    <th className="py-2.5 px-4 font-semibold">Plan</th>
                    <th className="py-2.5 px-4 font-semibold">Amount</th>
                    <th className="py-2.5 px-4 font-semibold">Transaction ID</th>
                    <th className="py-2.5 px-4 font-semibold">Payout Route</th>
                    <th className="py-2.5 px-4 font-semibold">Status</th>
                    <th className="py-2.5 px-4 font-semibold">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {metrics.payments.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-medium text-slate-900">{p.customerEmail}</td>
                      <td className="py-3 px-4 uppercase font-bold text-indigo-600">{p.plan}</td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-900 tabular-nums">${p.amount}.00</td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-500">{p.transactionId}</td>
                      <td className="py-3 px-4 font-mono text-[11px] text-indigo-600 font-medium">{p.receiverEmail}</td>
                      <td className="py-3 px-4">
                        <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                          {p.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                        {new Date(p.timestamp).toLocaleDateString()} {new Date(p.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  ))}
                  {metrics.payments.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        No transactions recorded yet. Fire a test simulation above.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SETTINGS & LIVE PROVIDER SWITCH TAB */}
      {activeTab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="space-y-6">
          {/* Dual Mode Switch Section */}
          <div className="bg-white border border-slate-200 shadow-xs rounded-xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-indigo-600" /> AI Scan Engine Dual-Mode Switch
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Choose whether customer audits run through deterministic simulated scoring or live external LLM API calls.
                </p>
              </div>

              {/* Toggle Switch */}
              <label className="flex items-center gap-3 cursor-pointer shrink-0">
                <span className="text-xs font-semibold text-slate-700">
                  {settings.dualModeSimulated ? 'Simulated Mode (Default ON)' : 'Live API Provider Mode (ACTIVE)'}
                </span>
                <div className="relative">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={settings.dualModeSimulated}
                    onChange={(e) => setSettings({ ...settings, dualModeSimulated: e.target.checked })}
                  />
                  <div
                    className={`w-12 h-6 rounded-full transition-colors ${
                      settings.dualModeSimulated ? 'bg-indigo-600' : 'bg-emerald-600'
                    }`}
                  />
                  <div
                    className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform shadow-xs ${
                      settings.dualModeSimulated ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </div>
              </label>
            </div>

            <div className="text-xs p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 space-y-1">
              <p className="font-semibold text-slate-900">Mode Explanation:</p>
              <p>
                • <strong>Simulated Mode (ON):</strong> Instant, zero-cost, deterministic scans across ChatGPT, Perplexity, Claude, and Gemini with comprehensive citation scoring and recommendations.
              </p>
              <p>
                • <strong>Live Provider Mode (OFF):</strong> Routes scan requests to live external LLM APIs using the configured API keys below.
              </p>
            </div>
          </div>

          {/* API Keys Configuration */}
          <div className="bg-white border border-slate-200 shadow-xs rounded-xl p-5 space-y-4">
            <div className="border-b border-slate-200 pb-3">
              <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <Key className="w-4 h-4 text-indigo-600" /> External LLM Provider Keys
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Input keys to enable live provider scans across major generative engines.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Google Gemini API Key
                </label>
                <input
                  type="password"
                  value={settings.geminiKey}
                  onChange={(e) => setSettings({ ...settings, geminiKey: e.target.value })}
                  placeholder="AIzaSy... (Pre-injected if configured)"
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 font-mono shadow-2xs"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Enables live Gemini 2.5 Flash Grounding search audits
                </span>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  OpenAI API Key (ChatGPT Search)
                </label>
                <input
                  type="password"
                  value={settings.openaiKey}
                  onChange={(e) => setSettings({ ...settings, openaiKey: e.target.value })}
                  placeholder="sk-proj-..."
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 font-mono shadow-2xs"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Enables live ChatGPT 4o web search ranking audits
                </span>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Perplexity API Key
                </label>
                <input
                  type="password"
                  value={settings.perplexityKey}
                  onChange={(e) => setSettings({ ...settings, perplexityKey: e.target.value })}
                  placeholder="pplx-..."
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 font-mono shadow-2xs"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Enables live Perplexity sonar/deep research citation checks
                </span>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Anthropic API Key (Claude)
                </label>
                <input
                  type="password"
                  value={settings.anthropicKey}
                  onChange={(e) => setSettings({ ...settings, anthropicKey: e.target.value })}
                  placeholder="sk-ant-..."
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 font-mono shadow-2xs"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Enables live Claude 3.7 knowledge retrieval checks
                </span>
              </div>
            </div>
          </div>

          {/* Payment & Alert Routing Setup */}
          <div className="bg-white border border-slate-200 shadow-xs rounded-xl p-5 space-y-4">
            <div className="border-b border-slate-200 pb-3">
              <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-600" /> PayPal Gateway & Notification Routing
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Ensure funds route directly to merchant PayPal and notifications trigger to admin email.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Receiver PayPal Account (Instant Payout Target)
                </label>
                <input
                  type="email"
                  value={settings.receiverPayPalEmail}
                  onChange={(e) => setSettings({ ...settings, receiverPayPalEmail: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 font-mono shadow-2xs"
                />
                <span className="text-[10px] text-emerald-600 mt-1 block font-medium">
                  Hardcoded receiver: syedirfanakbarmashadi@gmail.com
                </span>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Admin Notification Email Target
                </label>
                <input
                  type="email"
                  value={settings.adminNotificationEmail}
                  onChange={(e) => setSettings({ ...settings, adminNotificationEmail: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 font-mono shadow-2xs"
                />
                <span className="text-[10px] text-indigo-600 mt-1 block font-medium">
                  Instant transaction alert recipient: syedirfanakbarrehan@gmail.com
                </span>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  PayPal Live Client ID
                </label>
                <input
                  type="text"
                  value={settings.paypalClientId}
                  onChange={(e) => setSettings({ ...settings, paypalClientId: e.target.value })}
                  placeholder="Enter your live PayPal Client ID"
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 font-mono shadow-2xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-3">
              <div className="flex items-center gap-2">
                {saveSuccess && (
                  <span className="text-xs text-emerald-600 flex items-center gap-1 font-semibold">
                    <CheckCircle2 className="w-4 h-4" /> Settings updated successfully
                  </span>
                )}
              </div>
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs disabled:opacity-50"
              >
                {isSaving ? 'Saving Settings...' : 'Save Global Settings'}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* WORKSPACES & USERS TAB */}
      {activeTab === 'users' && (
        <div className="bg-white border border-slate-200 shadow-xs rounded-xl overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Active Subscriber Workspaces</h2>
              <p className="text-xs text-slate-500">Click any workspace to impersonate and inspect client data</p>
            </div>
            <span className="text-xs font-mono text-indigo-600 font-semibold">{usersList.length} Accounts Registered</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4 font-semibold">Name & Email</th>
                  <th className="py-2.5 px-4 font-semibold">Role</th>
                  <th className="py-2.5 px-4 font-semibold">Tier</th>
                  <th className="py-2.5 px-4 font-semibold">Workspace ID</th>
                  <th className="py-2.5 px-4 font-semibold">Status</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {usersList.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{u.name}</div>
                      <div className="text-slate-500 font-mono text-[11px]">{u.email}</div>
                    </td>
                    <td className="py-3 px-4 capitalize">
                      <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700">
                        {u.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold uppercase text-indigo-600 font-mono">{u.tier}</span>
                      <span className="text-slate-500 text-[11px] ml-1">
                        (${PLANS[u.tier]?.price}/mo)
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">{u.workspaceId}</td>
                    <td className="py-3 px-4">
                      <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                        {u.subscriptionStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {u.role !== 'super_admin' ? (
                        <button
                          onClick={() => onSwitchWorkspace(u.workspaceId)}
                          className="px-2.5 py-1 text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded transition-colors inline-flex items-center gap-1 border border-slate-200"
                        >
                          View Workspace <ArrowUpRight className="w-3 h-3" />
                        </button>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Primary Admin</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* NOTIFICATIONS TAB */}
      {activeTab === 'notifications' && (
        <div className="bg-white border border-slate-200 shadow-xs rounded-xl overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50/50">
            <h2 className="text-sm font-semibold text-slate-900">Dispatched Admin Revenue Alerts</h2>
            <p className="text-xs text-slate-500">
              Immediate emails logged and sent to <span className="text-slate-800 font-mono font-medium">{SUPER_ADMIN_EMAIL}</span>
            </p>
          </div>

          <div className="divide-y divide-slate-100">
            {metrics.notifications.map((n) => (
              <div key={n.id} className="p-4 hover:bg-slate-50/70 transition-colors flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-indigo-50 text-indigo-700 border border-indigo-200 font-medium">
                      {n.type}
                    </span>
                    <span className="text-xs font-bold text-slate-900">
                      +${n.amount}.00 USD from {n.customerEmail}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">
                    Plan: <strong className="text-slate-800 uppercase">{n.plan}</strong> · Transaction ID:{' '}
                    <span className="font-mono text-slate-700">{n.transactionId}</span>
                  </p>
                  <p className="text-[11px] text-slate-400 font-mono">
                    Delivered to: {n.recipientEmail} at {new Date(n.timestamp).toLocaleString()}
                  </p>
                </div>
                <span className="text-[11px] text-emerald-600 flex items-center gap-1 font-mono shrink-0 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Dispatched
                </span>
              </div>
            ))}
            {metrics.notifications.length === 0 && (
              <div className="p-8 text-center text-xs text-slate-400">
                No notification alerts logged yet. Run a test payment to generate one.
              </div>
            )}
          </div>
        </div>
      )}

      {/* PAYMENTS TAB (FULL LIST) */}
      {activeTab === 'payments' && (
        <div className="bg-white border border-slate-200 shadow-xs rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Full Ledger & Payout Routing</h2>
              <p className="text-xs text-slate-500">All subscriptions route instantly to {PAYPAL_RECEIVER_EMAIL}</p>
            </div>
            <span className="text-xs font-mono text-emerald-600 font-bold">
              Total Volume: ${metrics.payments.reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()} USD
            </span>
          </div>

          <div className="space-y-3">
            {metrics.payments.map((p) => (
              <div key={p.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                <div>
                  <div className="font-bold text-slate-900 flex items-center gap-2">
                    <span>{p.customerEmail}</span>
                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 bg-indigo-50 border border-indigo-200 rounded text-indigo-700 font-semibold">
                      {p.plan}
                    </span>
                  </div>
                  <div className="text-slate-500 text-[11px] mt-0.5 font-mono">
                    Transaction ID: {p.transactionId} · Date: {new Date(p.timestamp).toLocaleString()}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm font-bold font-mono text-emerald-600 tabular-nums">
                      +${p.amount}.00
                    </div>
                    <div className="text-[10px] text-slate-500">Recurring Monthly</div>
                  </div>
                  <span className="px-2 py-0.5 text-[10px] rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono font-medium">
                    ROUTED
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPortal;
