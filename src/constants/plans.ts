import { PlanDetails, SubscriptionTier } from '../types/saas';

export const PLANS: Record<SubscriptionTier, PlanDetails> = {
  starter: {
    id: 'starter',
    name: 'Starter Tier',
    price: 99,
    period: 'month',
    promptsLimit: 15,
    workspacesLimit: 1,
    seatsLimit: 1,
    scanFrequency: 'Weekly automated AI search scans',
    supportedEngines: ['ChatGPT', 'Perplexity'],
    features: [
      'Track up to 15 Target Prompts',
      '1 Brand Workspace + 1 Team Seat',
      'Weekly automated AI search scans (ChatGPT & Perplexity)',
      'Basic Sentiment & Citation Reports',
      'Standard Email Support',
    ],
  },
  pro: {
    id: 'pro',
    name: 'Pro / Agency Tier',
    price: 299,
    period: 'month',
    popular: true,
    promptsLimit: 50,
    workspacesLimit: 3,
    seatsLimit: 5,
    scanFrequency: 'Daily automated AI search scans',
    supportedEngines: ['ChatGPT', 'Perplexity', 'Claude', 'Gemini'],
    features: [
      'Track up to 50 Target Prompts',
      '3 Brand Workspaces + 5 Team Seats',
      'Daily scans across ChatGPT, Perplexity, Claude, & Gemini',
      'Competitor Share of Voice (SoV) Analytics',
      'White-Label PDF Export (Client-ready with agency logo)',
      'Automated Email Alerts on AI ranking drops',
      'Priority Engine Processing Queue',
    ],
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise Custom Tier',
    price: 499,
    period: 'month',
    promptsLimit: 150,
    workspacesLimit: 999,
    seatsLimit: 999,
    scanFrequency: 'Real-time instant LLM search monitoring',
    supportedEngines: ['ChatGPT', 'Perplexity', 'Claude', 'Gemini'],
    features: [
      'Track up to 150 Target Prompts',
      'Unlimited Workspaces & Team Seats',
      'Real-time instant LLM search monitoring',
      'Dedicated Account Strategy & GEO Optimization Checklist',
      'Custom Webhook Integrations',
      'Live LLM API Route Passthrough',
      'Dedicated Slack/Priority Phone Support',
    ],
  },
};

export const SUPER_ADMIN_EMAIL = 'syedirfanakbarrehan@gmail.com';
export const PAYPAL_RECEIVER_EMAIL = 'syedirfanakbarmashadi@gmail.com';
