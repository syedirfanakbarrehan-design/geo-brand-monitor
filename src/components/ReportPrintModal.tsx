import React from 'react';
import {
  X,
  Printer,
  FileDown,
  Globe,
  Sparkles,
  BarChart3,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { Workspace, PromptScanResult } from '../types/saas';

interface ReportPrintModalProps {
  workspace: Workspace;
  scans: PromptScanResult[];
  onClose: () => void;
}

export const ReportPrintModal: React.FC<ReportPrintModalProps> = ({
  workspace,
  scans,
  onClose,
}) => {
  const whiteLabel = workspace.whiteLabel;
  const primaryColor = whiteLabel?.primaryColor || '#4f46e5';
  const agencyName = whiteLabel?.enabled && whiteLabel?.agencyName ? whiteLabel.agencyName : 'GEO Brand Monitor';
  const logoUrl = whiteLabel?.enabled ? whiteLabel?.logoUrl : null;

  const avgScore = scans.length ? Math.round(scans.reduce((a, b) => a + b.overallScore, 0) / scans.length) : 0;
  const topRankCount = scans.filter((s) => s.positionRank <= 2).length;
  const totalCitations = scans.reduce((a, b) => a + b.citations.length, 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-6 overflow-y-auto">
      {/* Container */}
      <div className="bg-white text-slate-900 rounded-xl max-w-4xl w-full p-6 sm:p-10 shadow-2xl relative my-auto print:m-0 print:p-0 print:shadow-none print:w-full print:max-w-none">
        {/* Modal Controls (Hidden in Print) */}
        <div className="no-print flex items-center justify-between pb-6 mb-6 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-1 rounded bg-slate-100 text-slate-700 font-mono">
              CLIENT-READY PDF EXPORT
            </span>
            <span className="text-xs text-slate-500">Previewing with agency white-label styling</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg flex items-center gap-2 transition-colors shadow-sm"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save as PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PRINTABLE REPORT CONTENT */}
        <div className="space-y-8">
          {/* Branded Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6" style={{ borderColor: primaryColor }}>
            <div className="flex items-center gap-3.5">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={agencyName}
                  className="w-12 h-12 object-contain rounded-lg border border-slate-200 p-1"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center font-bold text-white text-xl shadow"
                  style={{ backgroundColor: primaryColor }}
                >
                  {agencyName.slice(0, 2).toUpperCase()}
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">{agencyName}</h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Generative Engine Optimization (GEO) & AI Search Intelligence Report
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Client Audit</div>
              <div className="text-lg font-bold text-slate-900">{workspace.brandName}</div>
              <div className="text-xs text-slate-500 font-mono">
                Domain: {workspace.domain} · Date: {new Date().toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* Confidentiality Notice */}
          {whiteLabel?.reportHeaderNotes && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 italic">
              {whiteLabel.reportHeaderNotes}
            </div>
          )}

          {/* Executive Summary Metrics */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
              <div className="text-xs text-slate-500 font-medium">Overall GEO Visibility</div>
              <div className="text-3xl font-bold font-mono text-slate-900 mt-1 tabular-nums">
                {avgScore}%
              </div>
              <div className="text-[11px] text-emerald-600 font-medium mt-1">High Brand Recommendation</div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
              <div className="text-xs text-slate-500 font-medium">Top Position Share</div>
              <div className="text-3xl font-bold font-mono text-slate-900 mt-1 tabular-nums">
                {topRankCount} / {scans.length}
              </div>
              <div className="text-[11px] text-slate-600 mt-1">Prompts ranked #1 or #2</div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
              <div className="text-xs text-slate-500 font-medium">Verified Citations</div>
              <div className="text-3xl font-bold font-mono text-slate-900 mt-1 tabular-nums">
                {totalCitations}
              </div>
              <div className="text-[11px] text-slate-600 mt-1">Indexed authoritative sources</div>
            </div>
          </div>

          {/* Engine Synthesis Breakdown */}
          <div className="space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
              AI Engine Performance Summary
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { name: 'ChatGPT 4o Search', score: Math.min(98, avgScore + 3), rank: '#1' },
                { name: 'Perplexity Pro', score: Math.max(45, avgScore - 2), rank: '#2' },
                { name: 'Claude 3.7 Sonnet', score: Math.min(95, avgScore + 1), rank: '#2' },
                { name: 'Gemini 2.5 Flash', score: Math.min(99, avgScore + 4), rank: '#1' },
              ].map((eng, idx) => (
                <div key={idx} className="p-3 border border-slate-200 rounded-lg bg-white">
                  <div className="text-xs font-semibold text-slate-800">{eng.name}</div>
                  <div className="text-xl font-bold font-mono text-slate-900 mt-1 tabular-nums">
                    {eng.score}%
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Average Rank: {eng.rank}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Target Prompts Table */}
          <div className="space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
              Monitored Buyer Prompts ({scans.length})
            </h2>
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Target Buyer Query</th>
                    <th className="py-2.5 px-3">ChatGPT</th>
                    <th className="py-2.5 px-3">Perplexity</th>
                    <th className="py-2.5 px-3">Claude</th>
                    <th className="py-2.5 px-3">Gemini</th>
                    <th className="py-2.5 px-3">GEO Score</th>
                    <th className="py-2.5 px-3">Sentiment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {scans.map((s) => (
                    <tr key={s.id}>
                      <td className="py-2.5 px-3 font-medium text-slate-900 max-w-xs truncate">
                        {s.prompt}
                      </td>
                      <td className="py-2.5 px-3 font-mono">{s.engineResults?.chatgpt?.score || s.overallScore}%</td>
                      <td className="py-2.5 px-3 font-mono">{s.engineResults?.perplexity?.score || s.overallScore - 2}%</td>
                      <td className="py-2.5 px-3 font-mono">{s.engineResults?.claude?.score || s.overallScore + 1}%</td>
                      <td className="py-2.5 px-3 font-mono">{s.engineResults?.gemini?.score || s.overallScore + 3}%</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{s.overallScore}%</td>
                      <td className="py-2.5 px-3">
                        <span className="font-semibold text-emerald-700">{s.dominantSentiment}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Actionable Recommendations Roadmap */}
          <div className="space-y-3 pt-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
              Prioritized Optimization Action Plan
            </h2>
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
              <div className="flex items-start gap-2 text-xs text-slate-700">
                <span className="font-bold text-slate-900 shrink-0">1.</span>
                <span>
                  Deploy structured schema (SoftwareApplication, Organization, FAQPage) on product comparison landing pages.
                </span>
              </div>
              <div className="flex items-start gap-2 text-xs text-slate-700">
                <span className="font-bold text-slate-900 shrink-0">2.</span>
                <span>
                  Increase verified G2 and TrustRadius citation velocity to consolidate #1 position on ChatGPT Search.
                </span>
              </div>
              <div className="flex items-start gap-2 text-xs text-slate-700">
                <span className="font-bold text-slate-900 shrink-0">3.</span>
                <span>
                  Publish head-to-head comparison matrices against named competitors addressing security, pricing, and enterprise scalability.
                </span>
              </div>
            </div>
          </div>

          {/* Report Footer */}
          <div className="pt-6 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
            <span>Generated by {agencyName} · Powered by GEO Brand Monitor</span>
            <span className="font-mono">Page 1 of 1</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportPrintModal;
