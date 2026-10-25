import React, { useState } from 'react';
import {
  X,
  Sliders,
  CheckCircle2,
  Upload,
  Palette,
  FileText,
  Image as ImageIcon,
} from 'lucide-react';
import { WhiteLabelConfig } from '../types/saas';

interface WhiteLabelSettingsModalProps {
  initialConfig: WhiteLabelConfig;
  brandName: string;
  onSave: (config: WhiteLabelConfig) => Promise<void>;
  onClose: () => void;
}

const COLOR_PRESETS = [
  '#4f46e5', // Vibrant Indigo
  '#2563eb', // Deep Blue
  '#0ea5e9', // Sky Cyan
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#ec4899', // Pink
  '#0f172a', // Charcoal Slate
];

export const WhiteLabelSettingsModal: React.FC<WhiteLabelSettingsModalProps> = ({
  initialConfig,
  brandName,
  onSave,
  onClose,
}) => {
  const [enabled, setEnabled] = useState(initialConfig.enabled ?? true);
  const [agencyName, setAgencyName] = useState(initialConfig.agencyName || 'Vanguard Visibility Group');
  const [logoUrl, setLogoUrl] = useState(
    initialConfig.logoUrl ||
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=60'
  );
  const [primaryColor, setPrimaryColor] = useState(initialConfig.primaryColor || '#4f46e5');
  const [reportHeaderNotes, setReportHeaderNotes] = useState(
    initialConfig.reportHeaderNotes || 'Confidential Generative Engine Optimization Client Report'
  );
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave({
        enabled,
        agencyName,
        logoUrl,
        primaryColor,
        reportHeaderNotes,
      });
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        onClose();
      }, 1000);
    } catch (err) {
      console.error('Failed to save white label:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative my-8">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-lg">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Agency White-Label Branding</h2>
            <p className="text-xs text-slate-500">
              Customize client dashboards and exported PDF reports with your own agency identity.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Enable Switch */}
          <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
            <div>
              <span className="text-xs font-bold text-slate-900">Enable White-Label PDF Branding</span>
              <p className="text-[11px] text-slate-500">Apply custom logo and color to all client deliverables</p>
            </div>
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              className="w-4 h-4 rounded text-indigo-600 focus:ring-0 cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Agency Name (Displayed in Client Reports)
            </label>
            <input
              type="text"
              value={agencyName}
              onChange={(e) => setAgencyName(e.target.value)}
              placeholder="e.g. Acme Growth Partners"
              className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 shadow-2xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Agency Logo Image URL
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="https://youragency.com/logo.png"
                className="flex-1 bg-white border border-slate-300 rounded-lg px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 font-mono shadow-2xs"
              />
              {logoUrl && (
                <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-200 p-1 flex items-center justify-center shrink-0">
                  <img
                    src={logoUrl}
                    alt="Logo Preview"
                    className="max-h-full max-w-full object-contain rounded"
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Color Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-indigo-600" /> Primary Agency Brand Color
            </label>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                {COLOR_PRESETS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setPrimaryColor(color)}
                    className={`w-6 h-6 rounded-full transition-transform ${
                      primaryColor === color ? 'scale-125 ring-2 ring-slate-800' : 'opacity-80 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <input
                type="text"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="w-24 bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-slate-900 font-mono shadow-2xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Report Confidentiality Notes / Tagline
            </label>
            <textarea
              rows={2}
              value={reportHeaderNotes}
              onChange={(e) => setReportHeaderNotes(e.target.value)}
              placeholder="e.g. Prepared exclusively for client executive leadership."
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 shadow-2xs"
            />
          </div>

          {/* Live Preview Card */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
            <span className="text-[10px] uppercase font-mono font-bold text-slate-500">Report Header Preview</span>
            <div className="flex items-center justify-between p-3 rounded-lg bg-white border border-slate-200 shadow-2xs">
              <div className="flex items-center gap-2">
                {logoUrl ? (
                  <img src={logoUrl} alt="Logo" className="w-6 h-6 rounded object-contain" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-6 h-6 rounded font-bold text-[10px] text-white flex items-center justify-center shadow-xs" style={{ backgroundColor: primaryColor }}>
                    {agencyName.slice(0, 1)}
                  </div>
                )}
                <span className="text-xs font-bold text-slate-900">{agencyName}</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded text-white font-semibold shadow-xs" style={{ backgroundColor: primaryColor }}>
                Client: {brandName}
              </span>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between">
            {saveSuccess ? (
              <span className="text-xs text-emerald-600 flex items-center gap-1 font-semibold">
                <CheckCircle2 className="w-4 h-4" /> White-label settings updated!
              </span>
            ) : <span />}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs text-slate-500 hover:text-slate-800 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs"
              >
                {isSaving ? 'Saving...' : 'Apply White-Label Branding'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WhiteLabelSettingsModal;
