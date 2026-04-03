// Devises africaines supportées
export type AfricanCurrency =
  | "CDF"
  | "XAF"
  | "XOF"
  | "NGN"
  | "KES"
  | "GHS"
  | "ZAR"
  | "USD";

export const CURRENCY_LABELS: Record<AfricanCurrency, string> = {
  CDF: "Franc Congolais",
  XAF: "Franc CFA (CEMAC)",
  XOF: "Franc CFA (UEMOA)",
  NGN: "Naira Nigérian",
  KES: "Shilling Kényan",
  GHS: "Cédi Ghanéen",
  ZAR: "Rand Sud-Africain",
  USD: "Dollar Américain",
};

export const CURRENCY_FLAGS: Record<AfricanCurrency, string> = {
  CDF: "🇨🇩",
  XAF: "🇨🇲",
  XOF: "🇸🇳",
  NGN: "🇳🇬",
  KES: "🇰🇪",
  GHS: "🇬🇭",
  ZAR: "🇿🇦",
  USD: "🇺🇸",
};

// Taux par rapport à 1 USDT (pivot)
export const RATES_PER_USDT: Record<AfricanCurrency, number> = {
  CDF: 2840,
  XAF: 610,
  XOF: 610,
  NGN: 1620,
  KES: 130,
  GHS: 15.8,
  ZAR: 18.6,
  USD: 1,
};

export const FEE_RATE = 0.008; // 0.8%

export interface ConversionResult {
  result: number;
  usdtIntermediate: number;
  rateDisplay: string;
  fee: number;
  feeAmount: number;
}

/**
 * Convertit un montant from → to via pivot USDT
 */
export function convertAmount(
  amount: number,
  from: AfricanCurrency,
  to: AfricanCurrency,
): ConversionResult {
  const usdtIntermediate = amount / RATES_PER_USDT[from];
  const rawResult = usdtIntermediate * RATES_PER_USDT[to];
  const fee = FEE_RATE;
  const feeAmount = rawResult * fee;
  const result = rawResult - feeAmount;

  const rate = RATES_PER_USDT[to] / RATES_PER_USDT[from];
  const rateDisplay = `1 ${from} = ${rate < 1 ? rate.toFixed(4) : rate.toFixed(2)} ${to}`;

  return { result, usdtIntermediate, rateDisplay, fee, feeAmount };
}

export interface AgentOffer {
  id: string;
  agentName: string;
  from: AfricanCurrency;
  to: AfricanCurrency;
  rate: number; // combien de `to` pour 1 `from`
  minAmount: number;
  maxAmount: number;
  paymentMethod: string;
  available: boolean;
  completedTrades: number;
  rating: number; // 0-5
  responseTime: string;
}

const AGENT_POOL: Array<{
  name: string;
  paymentMethod: string;
  ratingOffset: number;
  rateSpread: number;
  responseTime: string;
  completedBase: number;
  available: boolean;
}> = [
  {
    name: "Amara Diallo",
    paymentMethod: "Wave",
    ratingOffset: 0,
    rateSpread: -0.005,
    responseTime: "~2 min",
    completedBase: 840,
    available: true,
  },
  {
    name: "Kwame Asante",
    paymentMethod: "MTN Mobile Money",
    ratingOffset: -0.2,
    rateSpread: 0.008,
    responseTime: "~5 min",
    completedBase: 612,
    available: true,
  },
  {
    name: "Fatou Ndiaye",
    paymentMethod: "Orange Money",
    ratingOffset: 0.1,
    rateSpread: 0.002,
    responseTime: "~3 min",
    completedBase: 1203,
    available: true,
  },
  {
    name: "Chidi Okonkwo",
    paymentMethod: "Airtel Money",
    ratingOffset: -0.3,
    rateSpread: -0.012,
    responseTime: "~8 min",
    completedBase: 389,
    available: true,
  },
  {
    name: "Amina Hassan",
    paymentMethod: "M-Pesa",
    ratingOffset: 0.2,
    rateSpread: 0.015,
    responseTime: "~1 min",
    completedBase: 2145,
    available: true,
  },
  {
    name: "Kojo Mensah",
    paymentMethod: "Wave",
    ratingOffset: -0.1,
    rateSpread: -0.003,
    responseTime: "~4 min",
    completedBase: 756,
    available: false,
  },
  {
    name: "Ngozi Adeyemi",
    paymentMethod: "MTN Mobile Money",
    ratingOffset: 0.15,
    rateSpread: 0.006,
    responseTime: "~6 min",
    completedBase: 934,
    available: true,
  },
  {
    name: "Seydou Coulibaly",
    paymentMethod: "Orange Money",
    ratingOffset: -0.05,
    rateSpread: -0.008,
    responseTime: "~3 min",
    completedBase: 467,
    available: false,
  },
];

/**
 * Retourne une liste d'agents simulés pour une paire de devises
 */
export function getAgentOffers(
  from: AfricanCurrency,
  to: AfricanCurrency,
): AgentOffer[] {
  const baseRate = RATES_PER_USDT[to] / RATES_PER_USDT[from];
  const baseMin = 1000;
  const baseMax = 500_000;

  return AGENT_POOL.map((agent, index) => ({
    id: `agent-${index}-${from}-${to}`,
    agentName: agent.name,
    from,
    to,
    rate: baseRate * (1 + agent.rateSpread),
    minAmount: Math.round(baseMin * (1 + index * 0.1)),
    maxAmount: Math.round(baseMax * (0.8 + index * 0.05)),
    paymentMethod: agent.paymentMethod,
    available: agent.available,
    completedTrades: agent.completedBase + index * 17,
    rating: Math.min(5, Math.max(3.5, 4.5 + agent.ratingOffset)),
    responseTime: agent.responseTime,
  })).sort((a, b) => {
    // Sort available first, then by best rate
    if (a.available !== b.available) return a.available ? -1 : 1;
    return b.rate - a.rate;
  });
}
