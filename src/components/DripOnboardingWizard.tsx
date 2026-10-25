import React, { useState } from 'react';
import {
  Check,
  ChevronRight,
  Sparkles,
  Building2,
  Users2,
  HelpCircle,
  ArrowRight,
  ShieldCheck,
  Globe,
} from 'lucide-react';

interface DripOnboardingWizardProps {
  onComplete: (data: {
    brandName: string;
    domain: string;
    competitors: string[];
    targetPrompts: string[];
  }) => Promise<void>;
  onClose?: () => void;
}

export const DripOnboardingWizard: React.FC<DripOnboardingWizardProps> = ({
  onComplete,
  onClose,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1: Brand & Domain
  const [brandName, setBrandName] = useState('Apex AI');
  const [domain, setDomain] = useState('apexai.io');

  // Step 2: Top 3 Competitors
  const [comp1, setComp1] = useState('Semrush');
  const [comp2, setComp2] = useState('Ahrefs');
  const [comp3, setComp3] = useState('Conductor');

  // Step 3: Core Buyer Queries
  const [selectedPrompts, setSelectedPrompts] = useState<string[]>([
    'Best AI search engine optimization software for B2B',
    'Top Generative Engine Optimization platforms 2026',
    'How to rank on ChatGPT search results',
  ]);
  const [customPrompt, setCustomPrompt] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const suggestedQueries = [
    'Best AI search engine optimization software for B2B',
    'Top Generative Engine Optimization platforms 2026',
    'How to rank on ChatGPT search results',
    'Alternative to traditional SEO agencies for LLM visibility',
    'Best brand citation tracking tool for Perplexity',
    'How to get recommended by Claude for enterprise software',
    'AI search optimization vs traditional Google SEO',
  ];

  const toggleQuery = (query: string) => {
    if (selectedPrompts.includes(query)) {
      setSelectedPrompts(selectedPrompts.filter((q) => q !== query));
    } else {
      setSelectedPrompts([...selectedPrompts, query]);
    }
  };

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPrompt.trim()) return;
    if (!selectedPrompts.includes(customPrompt.trim())) {
      setSelectedPrompts([...selectedPrompts, customPrompt.trim()]);
    }
    setCustomPrompt('');
  };

  const handleFinish = async () => {
    setIsSubmitting(true);
    try {
      await onComplete({
        brandName,
        domain,
        competitors: [comp1, comp2, comp3].filter((c) => c.trim().length > 0),
        targetPrompts: selectedPrompts.length > 0 ? selectedPrompts : [suggestedQueries[0]],
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative">
        {/* Step Indicator Header */}
        <div>
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-bold text-indigo-600 uppercase tracking-wider">
              Step {step} of 3
            </span>
            <span className="font-mono font-medium">{Math.round((step / 3) * 100)}% Completed</span>
          </div>

          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden border border-slate-200">
            <div
              className="bg-indigo-600 h-full rounded-full transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>

        {/* STEP 1: Brand & Domain */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-lg">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Enter Brand Name & Domain</h2>
                <p className="text-xs text-slate-500">
                  We'll configure your isolated workspace and scan citations for this entity.
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Brand or Company Name
                </label>
                <input
                  type="text"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  placeholder="e.g. Acme Tech"
                  className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Primary Website Domain
                </label>
                <input
                  type="text"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  placeholder="e.g. acmetech.com"
                  className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 shadow-2xs"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={!brandName.trim()}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <span>Continue to Competitors</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Top 3 Competitors */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-lg">
                <Users2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Add Your Top 3 Competitors</h2>
                <p className="text-xs text-slate-500">
                  Track your Share of Voice (SoV) and benchmark your citations against market alternatives.
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Competitor 1 (Direct Market Leader)
                </label>
                <input
                  type="text"
                  value={comp1}
                  onChange={(e) => setComp1(e.target.value)}
                  placeholder="e.g. Market Leader Inc"
                  className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Competitor 2
                </label>
                <input
                  type="text"
                  value={comp2}
                  onChange={(e) => setComp2(e.target.value)}
                  placeholder="e.g. Alternative Platform"
                  className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Competitor 3
                </label>
                <input
                  type="text"
                  value={comp3}
                  onChange={(e) => setComp3(e.target.value)}
                  placeholder="e.g. Legacy Competitor"
                  className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 shadow-2xs"
                />
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs text-slate-500 hover:text-slate-900 font-medium"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <span>Continue to Buyer Queries</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Core Buyer Queries */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-lg">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Select Core Buyer Queries</h2>
                <p className="text-xs text-slate-500">
                  Select the prompts your potential buyers ask ChatGPT, Perplexity, Claude, and Gemini.
                </p>
              </div>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {suggestedQueries.map((q, i) => {
                const isSelected = selectedPrompts.includes(q);
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => toggleQuery(q)}
                    className={`w-full p-2.5 rounded-lg border text-left text-xs transition-colors flex items-center justify-between ${
                      isSelected
                        ? 'bg-indigo-50 border-indigo-300 text-indigo-900 font-semibold'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <span className="truncate pr-2">{q}</span>
                    <div
                      className={`w-4 h-4 rounded flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-indigo-600 text-white' : 'border border-slate-300'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Add Custom Prompt */}
            <form onSubmit={handleAddCustom} className="flex gap-2 pt-1">
              <input
                type="text"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="Or type a custom prompt..."
                className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 shadow-2xs"
              />
              <button
                type="submit"
                disabled={!customPrompt.trim()}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 disabled:opacity-40 text-xs text-slate-700 font-semibold rounded-lg"
              >
                Add
              </button>
            </form>

            <div className="pt-4 flex items-center justify-between border-t border-slate-100">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="text-xs text-slate-500 hover:text-slate-900 font-medium"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleFinish}
                disabled={isSubmitting || selectedPrompts.length === 0}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5 transition-all"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isSubmitting ? 'Initializing Workspace...' : 'Launch AI Monitor'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DripOnboardingWizard;
