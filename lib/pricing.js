export const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    priceLabel: 'Rp 0',
    period: 'selamanya',
    color: '#64ffda',
    gradient: 'linear-gradient(135deg, #64ffda 0%, #1de9b6 100%)',
    icon: '🐟',
    features: [
      '3 agents (Market Research, Content Creator, Sentiment Analysis)',
      '10 query per hari',
      'Single Agent mode only',
      'Basic web search',
      'Community support',
    ],
    limits: {
      queriesPerDay: 10,
      agents: ['market-research', 'content-creator', 'sentiment-analysis'],
      collaboration: false,
      liveData: false,
      exportResults: false,
      prioritySupport: false,
    },
  },
  {
    id: 'student',
    name: 'Student',
    price: 39000,
    priceLabel: 'Rp 39.000',
    period: '/bulan',
    color: '#ffd600',
    gradient: 'linear-gradient(135deg, #ffd600 0%, #ff9100 100%)',
    icon: '🎓',
    features: [
      '8 AI agents',
      '30 query per hari',
      'Single Agent mode',
      'Web search',
      'Community support',
    ],
    limits: {
      queriesPerDay: 30,
      agents: [
        'market-research', 'content-creator', 'sentiment-analysis',
        'financial-planner', 'product-manager', 'data-analyst',
        'customer-support', 'ml-performance',
      ],
      collaboration: false,
      liveData: false,
      exportResults: false,
      prioritySupport: false,
    },
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 149000,
    priceLabel: 'Rp 149.000',
    period: '/bulan',
    color: '#00d4ff',
    gradient: 'linear-gradient(135deg, #00d4ff 0%, #0057ff 100%)',
    icon: '🦈',
    popular: true,
    features: [
      'Semua 11 AI agents',
      '100 query per hari',
      'Multi-Agent Collaboration',
      'Live data integrations',
      'Export hasil (PDF/CSV)',
      'Image generation standar',
      'Priority support',
    ],
    limits: {
      queriesPerDay: 100,
      agents: 'all',
      collaboration: true,
      liveData: true,
      exportResults: true,
      imageQuality: 'medium',
      prioritySupport: true,
    },
  },
  {
    id: 'business',
    name: 'Business',
    price: 320000,
    priceLabel: 'Rp 320.000',
    period: '/bulan',
    color: '#aa00ff',
    gradient: 'linear-gradient(135deg, #aa00ff 0%, #6200ea 100%)',
    icon: '🐋',
    features: [
      'Semua 11 AI agents',
      'Unlimited query',
      'Multi-Agent Collaboration',
      'Live data integrations',
      'Export hasil (PDF/CSV)',
      'Image generation HD',
      'Custom agent prompts',
      'API access',
      'Tim hingga 10 anggota',
      'Dedicated support',
    ],
    limits: {
      queriesPerDay: -1, // unlimited
      agents: 'all',
      collaboration: true,
      liveData: true,
      exportResults: true,
      imageQuality: 'high',
      customPrompts: true,
      apiAccess: true,
      teamMembers: 10,
      prioritySupport: true,
    },
  },
];

export function getPlan(planId) {
  return PLANS.find(p => p.id === planId) || PLANS[0];
}

export function canUseAgent(planId, agentId) {
  const plan = getPlan(planId);
  if (plan.limits.agents === 'all') return true;
  return plan.limits.agents.includes(agentId);
}

export function canUseCollaboration(planId) {
  return getPlan(planId).limits.collaboration;
}

export function getQueryLimit(planId) {
  return getPlan(planId).limits.queriesPerDay;
}
