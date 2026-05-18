export const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    priceLabel: '$0',
    period: 'forever',
    color: '#64ffda',
    gradient: 'linear-gradient(135deg, #64ffda 0%, #1de9b6 100%)',
    icon: '🐟',
    features: [
      '3 agents (Market Research, Content Creator, Sentiment Analysis)',
      '10 queries per day',
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
    id: 'pro',
    name: 'Pro',
    price: 29,
    priceLabel: '$29',
    period: '/month',
    color: '#00d4ff',
    gradient: 'linear-gradient(135deg, #00d4ff 0%, #0057ff 100%)',
    icon: '🦈',
    popular: true,
    features: [
      'Semua 11 AI agents',
      '100 queries per day',
      'Multi-Agent Collaboration',
      'Live data integrations',
      'Export results (PDF/CSV)',
      'Priority support',
    ],
    limits: {
      queriesPerDay: 100,
      agents: 'all',
      collaboration: true,
      liveData: true,
      exportResults: true,
      prioritySupport: true,
    },
  },
  {
    id: 'business',
    name: 'Business',
    price: 99,
    priceLabel: '$99',
    period: '/month',
    color: '#aa00ff',
    gradient: 'linear-gradient(135deg, #aa00ff 0%, #6200ea 100%)',
    icon: '🐋',
    features: [
      'Semua 11 AI agents',
      'Unlimited queries',
      'Multi-Agent Collaboration',
      'Live data integrations',
      'Export results (PDF/CSV)',
      'Custom agent prompts',
      'API access',
      'Team members (up to 10)',
      'Dedicated support',
    ],
    limits: {
      queriesPerDay: -1, // unlimited
      agents: 'all',
      collaboration: true,
      liveData: true,
      exportResults: true,
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
