import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Sparkles,
  BarChart3,
  Sliders,
  DollarSign,
  UserCheck,
  ChevronDown,
  Globe,
  Layers,
  FileText,
  Smartphone,
  Tablet,
  Laptop,
} from 'lucide-react';
import { AdminPortal } from './components/AdminPortal';
import { ClientDashboard } from './components/ClientDashboard';
import { FreeAuditTool } from './components/FreeAuditTool';
import { DripOnboardingWizard } from './components/DripOnboardingWizard';
import { PricingModal } from './components/PricingModal';
import { WhiteLabelSettingsModal } from './components/WhiteLabelSettingsModal';
import { ReportPrintModal } from './components/ReportPrintModal';
import {
  Workspace,
  PromptScanResult,
  UserAccount,
  SubscriptionTier,
  PaymentRecord,
  AdminNotification,
  WhiteLabelConfig,
} from './types/saas';
import { SUPER_ADMIN_EMAIL, PLANS } from './constants/plans';

export default function App() {
  // Navigation & View Mode
  const [activeView, setActiveView] = useState<'dashboard' | 'admin' | 'free_audit' | 'game'>('dashboard');
  const [currentUserEmail, setCurrentUserEmail] = useState<string>(SUPER_ADMIN_EMAIL);
  const [currentUser, setCurrentUser] = useState<UserAccount>({
    id: 'user_admin',
    email: SUPER_ADMIN_EMAIL,
    name: 'Syed Irfan Akbar Rehan',
    role: 'super_admin',
    workspaceId: 'ws_hypergrowth',
    tier: 'pro',
    subscriptionStatus: 'active',
  });

  // Workspace & Scans State
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace>({
    id: 'ws_hypergrowth',
    name: 'HyperGrowth Media Brand Desk',
    domain: 'hypergrowthagency.com',
    brandName: 'HyperGrowth AI',
    ownerId: 'user_agency_1',
    ownerEmail: 'marcus@hypergrowthagency.com',
    tier: 'pro',
    competitors: ['Semrush', 'Ahrefs', 'Conductor'],
    targetPrompts: [
      'Best AI search engine optimization software for B2B',
      'Top Generative Engine Optimization platforms 2026',
      'How to rank on ChatGPT search results',
      'Alternative to traditional SEO agencies for LLM visibility',
      'Best brand citation tracking tool for Perplexity',
    ],
    whiteLabel: {
      enabled: true,
      agencyName: 'HyperGrowth Intelligence Group',
      logoUrl: '',
      primaryColor: '#0ea5e9',
      reportHeaderNotes: 'Prepared exclusively for Enterprise Client Q4 Review.',
    },
    teamSeats: [
      { id: 'seat_1', name: 'Marcus Vance', email: 'marcus@hypergrowthagency.com', role: 'admin' },
      { id: 'seat_2', name: 'Elena Rostova', email: 'elena@hypergrowthagency.com', role: 'editor' },
    ],
    createdAt: '2026-08-15T10:00:00Z',
  });

  const [scans, setScans] = useState<PromptScanResult[]>([]);
  const [isScanning, setIsScanning] = useState(false);

  // Modals
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showPricing, setShowPricing] = useState(false);
  const [showWhiteLabel, setShowWhiteLabel] = useState(false);
  const [showPrintReport, setShowPrintReport] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  // Available sample users for easy switching between Super Admin and Clients
  interface SampleUserItem {
    email: string;
    name: string;
    role: string;
    wsId: string;
    tier?: SubscriptionTier;
    subscriptionStatus?: string;
  }

  const [sampleUsers, setSampleUsers] = useState<SampleUserItem[]>([
    { email: SUPER_ADMIN_EMAIL, name: 'Syed Irfan Akbar Rehan (Super Admin)', role: 'super_admin', wsId: 'ws_hypergrowth', tier: 'enterprise', subscriptionStatus: 'active' },
    { email: 'marcus@hypergrowthagency.com', name: 'Marcus Vance (Agency Admin - Pro)', role: 'agency_admin', wsId: 'ws_hypergrowth', tier: 'pro', subscriptionStatus: 'active' },
    { email: 'sarah@cloudscale.io', name: 'Sarah Jenkins (Client - Starter)', role: 'client', wsId: 'ws_cloudscale', tier: 'starter', subscriptionStatus: 'active' },
    { email: 'david@apexvisibility.com', name: 'David Keller (Agency - Enterprise)', role: 'agency_admin', wsId: 'ws_apex', tier: 'enterprise', subscriptionStatus: 'active' },
  ]);

  // Fetch workspace and scans
  const loadWorkspaceData = async (wsId: string) => {
    try {
      const [wRes, sRes] = await Promise.all([
        fetch(`/api/workspaces/current?workspaceId=${wsId}`),
        fetch(`/api/scans/history?workspaceId=${wsId}`),
      ]);
      if (wRes.ok) {
        const ws = await wRes.json();
        setCurrentWorkspace(ws);
      }
      if (sRes.ok) {
        const sc = await sRes.json();
        setScans(sc);
      }
    } catch (err) {
      console.warn('Backend fetch failed, using state:', err);
    }
  };

  useEffect(() => {
    loadWorkspaceData(currentUser.workspaceId);
  }, [currentUser.workspaceId]);

  // Run AI Scan for Single Prompt
  const handleRunScan = async (prompt: string) => {
    setIsScanning(true);
    try {
      const res = await fetch('/api/scans/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, workspaceId: currentWorkspace.id }),
      });
      if (res.ok) {
        const data = await res.json();
        setScans((prev) => [data.result, ...prev.filter((p) => p.prompt !== prompt)]);
      }
    } catch (err) {
      console.error('Scan failed:', err);
    } finally {
      setIsScanning(false);
    }
  };

  // Add New Prompt
  const handleAddPrompt = async (prompt: string) => {
    const updatedPrompts = [prompt, ...currentWorkspace.targetPrompts.filter((p) => p !== prompt)];
    setCurrentWorkspace({ ...currentWorkspace, targetPrompts: updatedPrompts });
    await handleRunScan(prompt);
  };

  // Switch Active User / Role
  const handleSwitchUser = (selectedEmail: string) => {
    const u = sampleUsers.find((x) => x.email === selectedEmail) || sampleUsers[0];
    setCurrentUserEmail(u.email);
    setCurrentUser({
      id: `u_${u.email}`,
      email: u.email,
      name: u.name,
      role: u.role as any,
      workspaceId: u.wsId,
      tier: u.role === 'super_admin' ? 'enterprise' : u.email.includes('cloudscale') ? 'starter' : 'pro',
      subscriptionStatus: 'active',
    });

    if (u.role === 'super_admin') {
      setActiveView('admin');
    } else {
      setActiveView('dashboard');
    }
    loadWorkspaceData(u.wsId);
    setShowUserDropdown(false);
  };

  // Save White Label settings
  const handleSaveWhiteLabel = async (config: WhiteLabelConfig) => {
    try {
      const res = await fetch('/api/workspaces/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceId: currentWorkspace.id,
          whiteLabel: config,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentWorkspace(data.workspace);
      } else {
        setCurrentWorkspace({ ...currentWorkspace, whiteLabel: config });
      }
    } catch (err) {
      setCurrentWorkspace({ ...currentWorkspace, whiteLabel: config });
    }
  };

  // Complete Onboarding Wizard
  const handleCompleteOnboarding = async (data: {
    brandName: string;
    domain: string;
    competitors: string[];
    targetPrompts: string[];
  }) => {
    try {
      const res = await fetch('/api/workspaces/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceId: currentWorkspace.id,
          brandName: data.brandName,
          domain: data.domain,
          competitors: data.competitors,
          targetPrompts: data.targetPrompts,
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setCurrentWorkspace(updated.workspace);
        await loadWorkspaceData(currentWorkspace.id);
      }
    } catch (err) {
      console.warn('Update failed:', err);
    } finally {
      setShowOnboarding(false);
    }
  };

  // Churn Alert trigger
  const handleTriggerChurnAlertTest = async () => {
    await fetch('/api/notifications/churn-alerts/send-test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        workspaceId: currentWorkspace.id,
        recipientEmail: currentWorkspace.ownerEmail,
      }),
    });
  };

  // Payment Success handler
  const handlePaymentSuccess = (payment: PaymentRecord, notif: AdminNotification) => {
    // 1. Update workspace tier immediately
    setCurrentWorkspace((prev) => ({
      ...prev,
      tier: payment.plan,
    }));

    // 2. Update current logged-in user subscription state to active
    setCurrentUser((prev) => ({
      ...prev,
      tier: payment.plan,
      subscriptionStatus: 'active',
    }));

    // 3. Update sample users list to reflect new plan across workspace switchers
    setSampleUsers((prev) =>
      prev.map((u) =>
        u.email.toLowerCase() === currentUserEmail.toLowerCase() || u.wsId === currentWorkspace.id
          ? { ...u, tier: payment.plan, subscriptionStatus: 'active' }
          : u
      )
    );
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col">
      {/* TOP BAR CONTRACT: Clean Pure White Header with subtle border */}
      <header className="no-print h-16 border-b border-slate-200 bg-white/95 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-8 flex items-center justify-between gap-8 shadow-xs">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setActiveView('dashboard');
          }}
          className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 flex items-center gap-2"
        >
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-mono font-bold text-xs shadow-sm">
            G
          </div>
          <span>GEO Brand Monitor</span>
        </a>

        {/* Zone 2: 4-5 concise single-line text nav links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-600">
          <button
            onClick={() => setActiveView('dashboard')}
            className={`whitespace-nowrap shrink-0 transition-colors ${
              activeView === 'dashboard' ? 'text-indigo-600 font-semibold' : 'hover:text-slate-900'
            }`}
          >
            AI Search Visibility
          </button>
          <button
            onClick={() => setActiveView('free_audit')}
            className={`whitespace-nowrap shrink-0 transition-colors ${
              activeView === 'free_audit' ? 'text-indigo-600 font-semibold' : 'hover:text-slate-900'
            }`}
          >
            Free Audit Tool
          </button>
          <button
            onClick={() => setActiveView('game')}
            className={`whitespace-nowrap shrink-0 transition-colors inline-flex items-center gap-1.5 ${
              activeView === 'game' ? 'text-indigo-600 font-semibold' : 'hover:text-slate-900'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            Geo-Drive 3D
          </button>
          <button
            onClick={() => setShowPricing(true)}
            className="whitespace-nowrap shrink-0 hover:text-slate-900 transition-colors"
          >
            Plans & Pricing ($99–$499)
          </button>
          <button
            onClick={() => setShowOnboarding(true)}
            className="whitespace-nowrap shrink-0 hover:text-slate-900 transition-colors"
          >
            Setup Wizard
          </button>
          {currentUser.role === 'super_admin' && (
            <button
              onClick={() => setActiveView('admin')}
              className={`whitespace-nowrap shrink-0 transition-colors ${
                activeView === 'admin' ? 'text-indigo-600 font-semibold' : 'hover:text-slate-900'
              }`}
            >
              Super Admin Console
            </button>
          )}
        </nav>

        {/* Zone 3: 1 Primary Action (Account / Role Switcher) */}
        <div className="relative shrink-0">
          <button
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs text-slate-800 font-medium rounded-lg flex items-center gap-2 transition-colors whitespace-nowrap shrink-0"
          >
            <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            <span className="max-w-[150px] truncate">
              {currentUser.email === SUPER_ADMIN_EMAIL ? 'Super Admin' : currentUser.name}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
          </button>

          {/* User Account Switcher Dropdown */}
          {showUserDropdown && (
            <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-xl p-2 shadow-xl z-50 text-xs divide-y divide-slate-100">
              <div className="p-2 text-slate-500">
                <span className="block font-semibold text-slate-900">Switch Role / Workspace</span>
                <span className="text-[11px]">Test Super Admin or Client views instantly</span>
              </div>
              <div className="py-1">
                {sampleUsers.map((u) => (
                  <button
                    key={u.email}
                    onClick={() => handleSwitchUser(u.email)}
                    className={`w-full text-left p-2 rounded-lg transition-colors flex items-center justify-between ${
                      currentUser.email === u.email
                        ? 'bg-indigo-50 text-indigo-700 font-semibold'
                        : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <div className="truncate pr-2">
                      <div className="truncate font-medium">{u.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono truncate">{u.email}</div>
                    </div>
                    {u.role === 'super_admin' && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono">
                        ADMIN
                      </span>
                    )}
                  </button>
                ))}
              </div>
              <div className="pt-2 px-1">
                <button
                  onClick={() => {
                    setShowPricing(true);
                    setShowUserDropdown(false);
                  }}
                  className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg text-center transition-colors shadow-xs"
                >
                  Upgrade Subscription
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Mobile Navigation Secondary Bar */}
      <div className="md:hidden no-print bg-white border-b border-slate-200 px-4 py-2 flex items-center gap-2 overflow-x-auto text-xs shadow-xs">
        <button
          onClick={() => setActiveView('dashboard')}
          className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-colors ${
            activeView === 'dashboard' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Visibility Dashboard
        </button>
        <button
          onClick={() => setActiveView('free_audit')}
          className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-colors ${
            activeView === 'free_audit' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Free Lead Magnet
        </button>
        <button
          onClick={() => setActiveView('game')}
          className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-colors inline-flex items-center gap-1.5 ${
            activeView === 'game' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
          Geo-Drive 3D
        </button>
        {currentUser.role === 'super_admin' && (
          <button
            onClick={() => setActiveView('admin')}
            className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-colors ${
              activeView === 'admin' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Admin ($5k MRR)
          </button>
        )}
        <button
          onClick={() => setShowPricing(true)}
          className="px-3 py-1.5 rounded-md font-medium text-indigo-700 whitespace-nowrap bg-indigo-50 border border-indigo-100"
        >
          Upgrade ($99–$499)
        </button>
      </div>

      {/* MAIN VIEWPORT */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeView === 'admin' ? (
          <AdminPortal
            currentUserEmail={currentUserEmail}
            onSwitchWorkspace={(wsId) => {
              loadWorkspaceData(wsId);
              setActiveView('dashboard');
            }}
          />
        ) : activeView === 'free_audit' ? (
          <FreeAuditTool
            onSelectPlan={(tier) => {
              setShowPricing(true);
            }}
          />
        ) : activeView === 'game' ? (
          <div className="space-y-4">
            <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setActiveView('dashboard')}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
                >
                  &larr; Back to Dashboard
                </button>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Geo-Drive 3D Courier Mini-Game</h2>
                  <p className="text-xs text-slate-500">
                    Drive, collect brand prompts &amp; delivery payloads in a 3D open world
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href="/geo-drive.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
                >
                  Launch Fullscreen Tab &rarr;
                </a>
              </div>
            </div>

            <div className="w-full h-[640px] md:h-[720px] rounded-2xl overflow-hidden border border-slate-300 shadow-xl bg-slate-950 relative">
              <iframe
                src="/geo-drive.html"
                title="Geo-Drive 3D Mini-Game"
                className="w-full h-full border-0"
                allow="accelerometer; gyroscope;"
              />
            </div>
          </div>
        ) : (
          <ClientDashboard
            workspace={currentWorkspace}
            scans={scans}
            onRunScan={handleRunScan}
            onAddPrompt={handleAddPrompt}
            onOpenWhiteLabelSettings={() => setShowWhiteLabel(true)}
            onOpenExportReport={() => setShowPrintReport(true)}
            onOpenUpgradeModal={() => setShowPricing(true)}
            onTriggerChurnAlertTest={handleTriggerChurnAlertTest}
            onOpenGame={() => setActiveView('game')}
            isScanning={isScanning}
          />
        )}
      </main>

      {/* FOOTER */}
      <footer className="no-print border-t border-slate-200 bg-white py-6 px-6 text-center text-xs text-slate-500 space-y-1">
        <p className="font-medium text-slate-700">
          GEO Brand Monitor · AI Search Engine Optimization & Citations SaaS
        </p>
        <p className="text-[11px] text-slate-500">
          Instant PayPal Payouts to <span className="font-mono text-slate-700">{SUPER_ADMIN_EMAIL}</span> · Super Admin: <span className="font-mono text-slate-700">{SUPER_ADMIN_EMAIL}</span>
        </p>
      </footer>

      {/* MODALS */}
      {showOnboarding && (
        <DripOnboardingWizard
          onComplete={handleCompleteOnboarding}
          onClose={() => setShowOnboarding(false)}
        />
      )}

      {showPricing && (
        <PricingModal
          currentTier={currentWorkspace.tier}
          userEmail={currentUser.email}
          workspaceId={currentWorkspace.id}
          onClose={() => setShowPricing(false)}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}

      {showWhiteLabel && (
        <WhiteLabelSettingsModal
          initialConfig={currentWorkspace.whiteLabel}
          brandName={currentWorkspace.brandName}
          onSave={handleSaveWhiteLabel}
          onClose={() => setShowWhiteLabel(false)}
        />
      )}

      {showPrintReport && (
        <ReportPrintModal
          workspace={currentWorkspace}
          scans={scans}
          onClose={() => setShowPrintReport(false)}
        />
      )}
    </div>
  );
}
