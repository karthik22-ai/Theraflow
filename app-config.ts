import type { AppConfig } from './lib/types';

export const APP_CONFIG_DEFAULTS: AppConfig = {
  companyName: 'TheraFlow',
  pageTitle: 'Theraflow',
  pageDescription: 'Your are an ai Therapist helps user to find and overcome Negative thoughts and behaviors',

  supportsChatInput: true,
  supportsVideoInput: false,
  supportsScreenShare: false,
  isPreConnectBufferEnabled: true,

  logo: '',
  accent: '#ffffff',
  logoDark: '',
  accentDark: '#f8f9fa',
  startButtonText: 'Talk to Theraflow',

  agentName: undefined,
};
