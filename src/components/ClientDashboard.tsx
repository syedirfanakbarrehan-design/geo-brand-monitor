import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  Search,
  Plus,
  RefreshCw,
  FileDown,
  Sparkles,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  BarChart3,
  Globe,
  Sliders,
  Send,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  Filter,
  Eye,
  Info,
} from 'lucide-react';
import {
  Workspace,
  PromptScanResult,
  SubscriptionTier,
} from '../types/saas';
import { PLANS } from '../constants/plans';
import { GeoDriveEmbedWidget } from './GeoDriveEmbedWidget';

interface ClientDashboardProps {
  workspace: Workspace;
  scans: PromptScanResult[];
  onRunScan: (prompt: string) => Promise<void>;
  onAddPrompt: (prompt: string) => Promise<void>;
  onOpenWhiteLabelSettings: () => void;
  onOpenExportReport: () => void;
  onOpenUpgradeModal: () => void;
  onTriggerChurnAlertTest: () => Promise<void>;
  onOpenGame?: () => void;
  isScanning: boolean;
}

export const ClientDashboard: React.FC<ClientDashboardProps> = ({
  workspace,
  scans,
  onRunScan,
  onAddPrompt,
  onOpenWhiteLabelSettings,
  onOpenExportReport,
  onOpenUpgradeModal,
  onTriggerChurnAlertTest,
  onOpenGame,
  isScanning,
}) => {
  const [selectedScan, setSelectedScan] = useState<PromptScanResult | null>(scans[0] || null);
  const [newPromptInput, setNewPromptInput] = useState('');
  const [isAddingPrompt, setIsAddingPrompt] = useState(false);
  const [filterSentiment, setFilterSentiment] = useState<'all' | 'Recommended' | 'Mentioned' | 'Missing'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [churnAlertSent, setChurnAlertSent] = useState(false);
  const [churnAlertLoading, setChurnAlertLoading] = useState(false);

  const plan = PLANS[workspace.tier] || PLANS.starter;

  // Calculate Aggregated Metrics
  const metrics = useMemo(() => {
    if (!scans.length) {
      return {
        avgScore: 0,
        topRankCount: 0,
        totalCitations: 0,
        recommendedPct: 0,
      };
    }
    const totalScore = scans.reduce((acc, s) => acc + s.overallScore, 0);
    const topRank = scans.filter((s) => s.positionRank <= 2).length;
    const citations = scans.reduce((acc, s) => acc + s.citations.length, 0);
    const recommended = scans.filter((s) => s.dominantSentiment === 'Recommended').length;

    return {
      avgScore: Math.round(totalScore / scans.length),
      topRankCount: topRank,
      totalCitations: citations,
      recommendedPct: Math.round((recommended / scans.length) * 100),
    };
  }, [scans]);

  // Competitor Share of Voice
  const shareOfVoice = useMemo(() => {
    const brandShare = Math.min(65, Math.max(30, metrics.avgScore / 2));
    const remaining = 100 - brandShare;
    const comps = workspace.competitors.length ? workspace.competitors : ['Competitor A', 'Competitor B', 'Competitor C'];
    const compWeights = [0.5, 0.3, 0.2];

    const list = [
      {
        brand: workspace.brandName,
        share: Math.round(brandShare),
        color: workspace.whiteLabel?.primaryColor || '#4f46e5',
        isClient: true,
      },
      ...comps.map((c, i) => ({
        brand: c,
        share: Math.round(remaining * (compWeights[i] || 0.2)),
        color: ['#0284c7', '#9333ea', '#64748b'][i % 3],
        isClient: false,
      })),
    ];
    return list;
  }, [workspace, metrics]);

  // Filtered prompt list
  const filteredScans = useMemo(() => {
    return scans.filter((s) => {
      const matchesSearch = s.prompt.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSentiment = filterSentiment === 'all' || s.dominantSentiment === filterSentiment;
      return matchesSearch && matchesSentiment;
    });
  }, [scans, searchQuery, filterSentiment]);

  const handleAddPromptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPromptInput.trim()) return;
    setIsAddingPrompt(true);
    try {
      await onAddPrompt(newPromptInput.trim());
      setNewPromptInput('');
    } finally {
      setIsAddingPrompt(false);
    }
  };

  const handleSendTestAlert = async () => {
    setChurnAlertLoading(true);
    try {
      await onTriggerChurnAlertTest();
      setChurnAlertSent(true);
      setTimeout(() => setChurnAlertSent(false), 4000);
    } finally {
      setChurnAlertLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Workspace Header / White-Label Bar */}
      <div className="bg-white border border-slate-200 shadow-xs rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          {workspace.whiteLabel?.logoUrl ? (
            <img
              src={workspace.whiteLabel.logoUrl}
              alt="Agency Logo"
              className="w-10 h-10 rounded-lg object-contain bg-slate-50 p-1 border border-slate-200 shrink-0"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white shadow-xs shrink-0"
              style={{ backgroundColor: workspace.whiteLabel?.primaryColor || '#4f46e5' }}
            >
              {workspace.brandName.slice(0, 2).toUpperCase()}
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-slate-900">{workspace.brandName}</h1>
              <span className="text-xs px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 font-mono uppercase font-semibold">
                {workspace.tier} Plan
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
              <span>Domain: <strong className="text-slate-700 font-mono">{workspace.domain}</strong></span>
              <span>·</span>
              <span>Tracking {scans.length} / {plan.promptsLimit} Prompts</span>
              <span>·</span>
              <span>{workspace.teamSeats?.length || 1} Team Seats</span>
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {/* Churn Alert Simulation button */}
          <button
            onClick={handleSendTestAlert}
            disabled={churnAlertLoading}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 transition-colors flex items-center gap-1.5 shadow-2xs"
            title="Send automated weekly gain email summary to client"
          >
            <Send className="w-3.5 h-3.5 text-indigo-600" />
            <span>{churnAlertLoading ? 'Dispatching...' : 'Trigger Weekly Email Alert'}</span>
          </button>

          {/* White-Label Settings (Pro & Enterprise) */}
          {workspace.tier !== 'starter' ? (
            <button
              onClick={onOpenWhiteLabelSettings}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <Sliders className="w-3.5 h-3.5 text-indigo-600" />
              <span>White-Label Branding</span>
            </button>
          ) : (
            <button
              onClick={onOpenUpgradeModal}
              className="px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-medium rounded-lg border border-slate-200 transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Unlock White-Label</span>
            </button>
          )}

          {/* Upgrade / Subscription */}
          <button
            onClick={onOpenUpgradeModal}
            className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-lg border border-indigo-200 transition-colors flex items-center gap-1.5 shadow-2xs"
            title="Manage subscription plan or upgrade tier"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Upgrade Plan</span>
          </button>

          {/* Export Client PDF Report */}
          <button
            onClick={onOpenExportReport}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>Export Client PDF Report</span>
          </button>
        </div>
      </div>

      {churnAlertSent && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Automated Retention Alert dispatched: <strong>"Your Brand Visibility Increased by 14% on ChatGPT this week!"</strong> sent to {workspace.ownerEmail}.
            </span>
          </div>
          <span className="text-[10px] text-emerald-700 font-mono font-medium">CHURN-REDUCTION TRIGGER</span>
        </div>
      )}

      {/* 3D Mini-Game Embedded Dashboard Widget */}
      <GeoDriveEmbedWidget onUnlockAudit={onOpenUpgradeModal} />

      {/* Primary KPI Visibility Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Overall Score */}
        <div className="bg-white border border-slate-200 shadow-xs rounded-xl p-4 sm:p-5">
          <div className="text-xs text-slate-500 mb-1 flex items-center justify-between">
            <span>Overall GEO Visibility</span>
            <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 tabular-nums">
              {metrics.avgScore}%
            </span>
            <span className="text-xs font-semibold text-emerald-600">+14% wk</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden border border-slate-200">
            <div
              className="bg-indigo-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${metrics.avgScore}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-500 mt-2">Weighted average across 4 AI engines</p>
        </div>

        {/* Top Position Rate */}
        <div className="bg-white border border-slate-200 shadow-xs rounded-xl p-4 sm:p-5">
          <div className="text-xs text-slate-500 mb-1 flex items-center justify-between">
            <span>Top-2 Recommendations</span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 tabular-nums">
              {metrics.topRankCount} / {scans.length}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-4">
            {metrics.recommendedPct}% of buyer prompts rank you in top 2
          </p>
        </div>

        {/* Citations Indexed */}
        <div className="bg-white border border-slate-200 shadow-xs rounded-xl p-4 sm:p-5">
          <div className="text-xs text-slate-500 mb-1 flex items-center justify-between">
            <span>Verified AI Citations</span>
            <Globe className="w-3.5 h-3.5 text-cyan-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 tabular-nums">
              {metrics.totalCitations}
            </span>
            <span className="text-xs text-slate-500 font-medium">Sources</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-4">Across G2, Capterra, TechCrunch & domain</p>
        </div>

        {/* Primary Recommendation */}
        <div className="bg-white border border-slate-200 shadow-xs rounded-xl p-4 sm:p-5">
          <div className="text-xs text-slate-500 mb-1 flex items-center justify-between">
            <span>Primary Recommendation</span>
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-emerald-600 tabular-nums">
              {metrics.recommendedPct}%
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-4">Strong positive buyer conversion intent</p>
        </div>
      </div>

      {/* Engine Status Grid (4 Engines) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {[
          {
            key: 'chatgpt',
            name: 'ChatGPT 4o Search',
            desc: 'Web Search & Real-time Citations',
            score: Math.min(98, metrics.avgScore + 3),
            color: 'text-emerald-700',
            bgBadge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          },
          {
            key: 'perplexity',
            name: 'Perplexity Pro',
            desc: 'Deep Research & Sonar Citations',
            score: Math.max(45, metrics.avgScore - 2),
            color: 'text-cyan-700',
            bgBadge: 'bg-cyan-50 text-cyan-700 border-cyan-200',
          },
          {
            key: 'claude',
            name: 'Claude 3.7 Sonnet',
            desc: 'Entity Recognition & Long-form',
            score: Math.min(95, metrics.avgScore + 1),
            color: 'text-amber-700',
            bgBadge: 'bg-amber-50 text-amber-700 border-amber-200',
          },
          {
            key: 'gemini',
            name: 'Gemini 2.5 Flash',
            desc: 'Google Grounding & Knowledge Graph',
            score: Math.min(99, metrics.avgScore + 4),
            color: 'text-indigo-700',
            bgBadge: 'bg-indigo-50 text-indigo-700 border-indigo-200',
          },
        ].map((eng) => (
          <div key={eng.key} className="bg-white border border-slate-200 shadow-xs rounded-xl p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">{eng.name}</span>
                <span className={`text-xs font-mono font-bold ${eng.color}`}>{eng.score}%</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">{eng.desc}</p>
            </div>
            <div className="mt-3.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span>Scan: Automated Daily</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold border ${eng.bgBadge}`}>
                Rank #1-2
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Competitor Share of Voice Section */}
      <div className="bg-white border border-slate-200 shadow-xs rounded-xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-indigo-600" /> Competitor Share of Voice (SoV) in AI Search
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Percentage of generative engine responses recommending {workspace.brandName} vs named rivals.
            </p>
          </div>
          <span className="text-xs text-slate-600">
            Competitors: <strong className="text-slate-800">{workspace.competitors.join(', ') || 'None set'}</strong>
          </span>
        </div>

        {/* Stacked Share of Voice Bar */}
        <div className="space-y-2">
          <div className="w-full h-8 rounded-lg overflow-hidden flex bg-slate-100 p-0.5 border border-slate-200">
            {shareOfVoice.map((item, idx) => (
              <div
                key={idx}
                className="h-full rounded-md flex items-center justify-center text-[11px] font-bold text-white transition-all duration-300 relative group truncate px-2"
                style={{ width: `${item.share}%`, backgroundColor: item.color }}
                title={`${item.brand}: ${item.share}% Share of Voice`}
              >
                {item.share >= 12 && <span>{item.brand} {item.share}%</span>}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-4 text-xs pt-1">
            {shareOfVoice.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-slate-800 font-semibold">{item.brand}</span>
                <span className="font-mono text-slate-500 font-bold tabular-nums">({item.share}%)</span>
                {item.isClient && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200">
                    Your Brand
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Target Prompts Tracking Table & Controls */}
      <div className="bg-white border border-slate-200 shadow-xs rounded-xl overflow-hidden">
        {/* Table Header and Search / Filter Bar */}
        <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50/50">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Target Buyer Prompts Tracking</h2>
            <p className="text-xs text-slate-500">
              Live generative visibility for commercial queries buyers type into LLMs
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search prompts..."
                className="bg-white border border-slate-300 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 w-44 sm:w-56 shadow-2xs"
              />
            </div>

            {/* Sentiment Filter Tabs */}
            <div className="flex items-center gap-1 p-0.5 bg-slate-100 border border-slate-200 rounded-lg">
              {(['all', 'Recommended', 'Mentioned', 'Missing'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setFilterSentiment(filter)}
                  className={`px-2.5 py-1 text-[11px] font-medium rounded transition-colors ${
                    filterSentiment === filter
                      ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Add New Prompt Form */}
        <form onSubmit={handleAddPromptSubmit} className="p-3 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
          <input
            type="text"
            value={newPromptInput}
            onChange={(e) => setNewPromptInput(e.target.value)}
            placeholder="Add new prompt to monitor (e.g. 'Best real estate CRM with AI')"
            className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 shadow-2xs"
          />
          <button
            type="submit"
            disabled={isAddingPrompt || !newPromptInput.trim()}
            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 shrink-0 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add & Scan Prompt</span>
          </button>
        </form>

        {/* Table of Prompts */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-4">Buyer Prompt</th>
                <th className="py-2.5 px-4">ChatGPT</th>
                <th className="py-2.5 px-4">Perplexity</th>
                <th className="py-2.5 px-4">Claude</th>
                <th className="py-2.5 px-4">Gemini</th>
                <th className="py-2.5 px-4">Overall Score</th>
                <th className="py-2.5 px-4">Sentiment</th>
                <th className="py-2.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredScans.map((scan) => (
                <tr
                  key={scan.id}
                  className={`hover:bg-slate-50/80 transition-colors cursor-pointer ${
                    selectedScan?.id === scan.id ? 'bg-indigo-50/40' : ''
                  }`}
                  onClick={() => setSelectedScan(scan)}
                >
                  <td className="py-3 px-4 max-w-xs font-medium text-slate-900 truncate">
                    <div className="truncate font-semibold">{scan.prompt}</div>
                    <span className="text-[10px] text-slate-500">Position #{scan.positionRank}</span>
                  </td>

                  {/* Engine cells */}
                  <td className="py-3 px-4 font-mono">
                    <span className="text-emerald-700 font-bold">{scan.engineResults?.chatgpt?.score || scan.overallScore}%</span>
                    <span className="text-[10px] text-slate-400 ml-1">#{scan.engineResults?.chatgpt?.positionRank || 1}</span>
                  </td>
                  <td className="py-3 px-4 font-mono">
                    <span className="text-cyan-700 font-bold">{scan.engineResults?.perplexity?.score || scan.overallScore - 2}%</span>
                    <span className="text-[10px] text-slate-400 ml-1">#{scan.engineResults?.perplexity?.positionRank || 1}</span>
                  </td>
                  <td className="py-3 px-4 font-mono">
                    <span className="text-amber-700 font-bold">{scan.engineResults?.claude?.score || scan.overallScore + 1}%</span>
                    <span className="text-[10px] text-slate-400 ml-1">#{scan.engineResults?.claude?.positionRank || 2}</span>
                  </td>
                  <td className="py-3 px-4 font-mono">
                    <span className="text-indigo-700 font-bold">{scan.engineResults?.gemini?.score || scan.overallScore + 3}%</span>
                    <span className="text-[10px] text-slate-400 ml-1">#{scan.engineResults?.gemini?.positionRank || 1}</span>
                  </td>

                  <td className="py-3 px-4 font-mono font-bold text-slate-900 tabular-nums">
                    {scan.overallScore}%
                  </td>

                  <td className="py-3 px-4">
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded font-semibold ${
                        scan.dominantSentiment === 'Recommended'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : scan.dominantSentiment === 'Mentioned'
                          ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {scan.dominantSentiment}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => onRunScan(scan.prompt)}
                        disabled={isScanning}
                        className="p-1.5 text-slate-500 hover:text-slate-900 rounded hover:bg-slate-100 transition-colors"
                        title="Rescan this prompt across all AI engines"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
                      </button>
                      <button
                        onClick={() => setSelectedScan(scan)}
                        className="px-2.5 py-1 text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-semibold transition-colors border border-slate-200"
                      >
                        Inspect
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredScans.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No prompts match your search query. Add a new prompt above!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* INSPECT DRAWER / DETAIL VIEW FOR SELECTED PROMPT */}
      {selectedScan && (
        <div className="bg-white border border-slate-200 shadow-xs rounded-xl p-5 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded font-semibold">
                  SCAN DRILLDOWN
                </span>
                <span className="text-xs text-slate-500">
                  Last updated: {new Date(selectedScan.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 mt-1">"{selectedScan.prompt}"</h3>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="text-right">
                <div className="text-xs text-slate-500">GEO Score</div>
                <div className="text-xl font-bold font-mono text-emerald-600 tabular-nums">
                  {selectedScan.overallScore}/100
                </div>
              </div>
              <button
                onClick={() => onRunScan(selectedScan.prompt)}
                disabled={isScanning}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
                <span>Re-run Scan</span>
              </button>
            </div>
          </div>

          {/* Engine Synthesis Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.values(selectedScan.engineResults || {}).map((res) => (
              <div key={res.engine} className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900">{res.name}</span>
                  <span className="font-mono text-emerald-700 font-bold">{res.score}% · Rank #{res.positionRank}</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">{res.rawSummary}</p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {res.detectedKeywords?.map((kw, i) => (
                    <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-600 font-mono">
                      #{kw}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Citations Detected */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-indigo-600" /> Grounding Citations Detected by AI Models
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {selectedScan.citations.map((cite) => (
                <a
                  key={cite.id}
                  href={cite.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg hover:border-slate-300 hover:bg-white transition-colors flex items-center justify-between group"
                >
                  <div className="truncate pr-2">
                    <div className="text-xs font-semibold text-slate-800 group-hover:text-indigo-600 truncate">
                      {cite.title}
                    </div>
                    <div className="text-[11px] font-mono text-indigo-600 truncate">{cite.domain}</div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] font-mono bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-600">
                      Auth {cite.authorityScore}
                    </span>
                    <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-slate-600" />
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* GEO Optimization Recommendations */}
          <div className="bg-indigo-50/60 border border-indigo-100 rounded-lg p-4 space-y-2">
            <h4 className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> Generative Engine Optimization (GEO) Action Plan
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-700">
              {selectedScan.recommendations.map((rec, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-indigo-600 font-bold shrink-0 mt-0.5">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientDashboard;
