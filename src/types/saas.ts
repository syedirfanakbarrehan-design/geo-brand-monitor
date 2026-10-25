export type SubscriptionTier = 'starter' | 'pro' | 'enterprise';

export interface PlanDetails {
  id: SubscriptionTier;
  name: string;
  price: number;
  period: string;
  promptsLimit: number;
  workspacesLimit: number;
  seatsLimit: number;
  scanFrequency: string;
  supportedEngines: string[];
  features: string[];
  popular?: boolean;
}

export interface WhiteLabelConfig {
  enabled: boolean;
  agencyName: string;
  logoUrl: string;
  primaryColor: string;
  reportHeaderNotes?: string;
}

export interface Workspace {
  id: string;
  name: string;
  domain: string;
  brandName: string;
  ownerId: string;
  ownerEmail: string;
  tier: SubscriptionTier;
  competitors: string[];
  targetPrompts: string[];
  whiteLabel: WhiteLabelConfig;
  teamSeats: { id: string; name: string; email: string; role: 'admin' | 'editor' | 'viewer' }[];
  createdAt: string;
}

export interface CitationItem {
  id: string;
  title: string;
  domain: string;
  url: string;
  authorityScore: number;
  engine: 'chatgpt' | 'perplexity' | 'claude' | 'gemini';
}

export interface EngineResult {
  engine: 'chatgpt' | 'perplexity' | 'claude' | 'gemini';
  name: string;
  score: number; // 0 to 100
  sentiment: 'Recommended' | 'Mentioned' | 'Missing' | 'Negative';
  positionRank: number; // 1 = #1 recommendation
  citationsCount: number;
  rawSummary: string;
  detectedKeywords: string[];
}

export interface PromptScanResult {
  id: string;
  workspaceId: string;
  prompt: string;
  category: string;
  timestamp: string;
  overallScore: number; // 0 to 100
  dominantSentiment: 'Recommended' | 'Mentioned' | 'Missing' | 'Negative';
  positionRank: number;
  engineResults: Record<'chatgpt' | 'perplexity' | 'claude' | 'gemini', EngineResult>;
  citations: CitationItem[];
  recommendations: string[];
  mode: 'simulated' | 'live';
}

export interface ShareOfVoiceMetric {
  brand: string;
  percentage: number;
  mentionCount: number;
  sentimentBreakdown: {
    recommended: number;
    mentioned: number;
    negative: number;
  };
  color: string;
  isClientBrand?: boolean;
}

export interface PaymentRecord {
  id: string;
  customerEmail: string;
  customerName: string;
  plan: SubscriptionTier;
  amount: number;
  currency: string;
  transactionId: string;
  timestamp: string;
  status: 'COMPLETED' | 'PENDING' | 'REFUNDED';
  receiverEmail: string;
  payoutStatus: string;
  workspaceId?: string;
}

export interface AdminNotification {
  id: string;
  timestamp: string;
  recipientEmail: string;
  customerEmail: string;
  plan: SubscriptionTier;
  amount: number;
  transactionId: string;
  type: 'NEW_SUBSCRIPTION' | 'PLAN_UPGRADE' | 'SUBSCRIPTION_RENEWAL' | 'WEBHOOK_SUBSCRIPTION_ACTIVE';
  delivered: boolean;
}

export interface AdminApiSettings {
  dualModeSimulated: boolean;
  openaiKey: string;
  perplexityKey: string;
  anthropicKey: string;
  geminiKey: string;
  receiverPayPalEmail: string;
  adminNotificationEmail: string;
  paypalClientId: string;
}

export interface ChurnAlertRecord {
  id: string;
  workspaceId: string;
  brandName: string;
  recipientEmail: string;
  subject: string;
  message: string;
  visibilityChangePct: number;
  currentScore: number;
  sentAt: string;
  type: 'weekly_gain' | 'drop_warning' | 'competitor_alert';
}

export interface UserAccount {
  id: string;
  email: string;
  name: string;
  role: 'super_admin' | 'agency_admin' | 'client';
  workspaceId: string;
  tier: SubscriptionTier;
  subscriptionStatus: 'active' | 'trial' | 'past_due';
}
