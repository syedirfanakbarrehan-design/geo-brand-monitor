import React, { useState } from 'react';
import {
  Sparkles,
  Search,
  ArrowRight,
  CheckCircle2,
  Lock,
  Globe,
  TrendingUp,
  ShieldCheck,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import { PromptScanResult } from '../types/saas';

interface FreeAuditToolProps {
  onSelectPlan: (tier: 'starter' | 'pro' | 'enterprise') => void;
  onClose?: () => void;
}

export const FreeAuditTool: React.FC<FreeAuditToolProps> = ({ onSelectPlan, onClose }) => {
  const [brandName, setBrandName] = useState('');
  const [domain, setDomain] = useState('');
  const [prompt, setPrompt] = useState('Best AI search engine optimization software for B2B');
  const [competitors, setCompetitors] = useState('Semrush, Ahrefs, Conductor');
  const [isLoading, setIsLoading] = useState(false);
  const [auditResult, setAuditResult] = useState<PromptScanResult | null>(null);

  const samplePrompts = [
    'Best CRM for real estate agents with automation',
    'Top enterprise cloud cost optimization tools',
    'Best AI search engine optimization software for B2B',
    'Alternative to traditional SEO agencies for LLM rankings',
  ];

  const handleRunAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandName.trim() || !prompt.trim()) return;

    setIsLoading(true);
    setAuditResult(null);

    try {
      const res = await fetch('/api/scans/free-audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandName: brandName.trim(),
          domain: domain.trim(),
          prompt: prompt.trim(),
          competitors: competitors.split(',').map((c) => c.trim()).filter(Boolean),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setAuditResult(data.audit);
      }
    } catch (err) {
      console.error('Audit failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Hero Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> Free Lead Magnet Tool
        </div>
        <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-slate-900">
          Instant Generative AI Search Audit
        </h1>
        <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto">
          See whether ChatGPT, Perplexity, Claude, and Gemini recommend your brand or your competitors when buyers search for your products.
        </p>
      </div>

      {/* Free Audit Form */}
      <form onSubmit={handleRunAudit} className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-4 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Your Brand Name <span className="text-indigo-600">*</span>
            </label>
            <input
              type="text"
              required
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              placeholder="e.g. Acme Software"
              className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 shadow-2xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Website Domain (Optional)
            </label>
            <input
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="e.g. acmesoftware.com"
              className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 shadow-2xs"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Target Commercial Buyer Prompt <span className="text-indigo-600">*</span>
          </label>
          <input
            type="text"
            required
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. Best CRM for commercial real estate"
            className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 shadow-2xs"
          />

          {/* Quick Prompt Presets */}
          <div className="flex flex-wrap items-center gap-1.5 mt-2">
            <span className="text-[11px] text-slate-500">Quick suggestions:</span>
            {samplePrompts.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setPrompt(p)}
                className="text-[11px] px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors truncate max-w-xs font-medium"
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Key Competitors (comma separated)
          </label>
          <input
            type="text"
            value={competitors}
            onChange={(e) => setCompetitors(e.target.value)}
            placeholder="e.g. Salesforce, HubSpot, Zoho"
            className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 shadow-2xs"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" /> Scanning ChatGPT, Perplexity, Claude & Gemini...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" /> Run 1 Free GEO Brand Audit
            </>
          )}
        </button>
      </form>

      {/* Free Audit Results */}
      {auditResult && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <span className="text-[10px] font-mono px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded font-semibold">
                FREE AUDIT REPORT
              </span>
              <h2 className="text-xl font-bold text-slate-900 mt-1">
                Audit for "{brandName}"
              </h2>
              <p className="text-xs text-slate-500">
                Buyer Query: <span className="text-slate-800 font-medium">"{auditResult.prompt}"</span>
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-xs text-slate-500">Overall GEO Score</div>
                <div className="text-2xl font-bold font-mono text-emerald-600 tabular-nums">
                  {auditResult.overallScore}%
                </div>
              </div>
              <span className="text-xs px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                {auditResult.dominantSentiment}
              </span>
            </div>
          </div>

          {/* Engine Scores Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Object.values(auditResult.engineResults || {}).map((eng) => (
              <div key={eng.engine} className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                <div className="text-xs font-bold text-slate-800">{eng.name}</div>
                <div className="text-lg font-bold font-mono text-indigo-700 mt-1 tabular-nums">
                  {eng.score}%
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">Rank #{eng.positionRank}</div>
              </div>
            ))}
          </div>

          {/* Locked / Blurred Advanced Features Teaser */}
          <div className="relative rounded-xl border border-slate-200 bg-slate-50 p-6 overflow-hidden">
            <div className="filter blur-sm select-none pointer-events-none space-y-3 opacity-40">
              <h4 className="text-sm font-bold text-slate-900">Full 50-Prompt Weekly LLM Tracking & Citations</h4>
              <p className="text-xs text-slate-600">
                G2 review velocity, Reddit community thread tracking, Claude entity mapping, competitor displacement alerts...
              </p>
              <div className="h-16 bg-slate-200 rounded-lg w-full"></div>
            </div>

            {/* Unlock Call to Action Overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-white/90 backdrop-blur-[2px]">
              <Lock className="w-6 h-6 text-indigo-600 mb-2" />
              <h3 className="text-base font-bold text-slate-900">
                Unlock Daily Automated Tracking & Competitor Alerts
              </h3>
              <p className="text-xs text-slate-600 max-w-md mt-1 mb-4">
                Track up to 50 buyer queries across all 4 LLM search engines, export white-label PDF client reports, and get churn-reduction alerts.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => onSelectPlan('starter')}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg border border-slate-200 transition-colors shadow-2xs"
                >
                  Starter ($99/mo)
                </button>
                <button
                  onClick={() => onSelectPlan('pro')}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
                >
                  <span>Upgrade to Pro / Agency ($299/mo)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FreeAuditTool;
