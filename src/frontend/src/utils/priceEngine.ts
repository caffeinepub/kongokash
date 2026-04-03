// KongoKash Price Engine — simulated dual-channel pricing
// P2P: dynamic, between users (may be better or worse than market)
// KongoKash Direct: fixed spread from market, always available

export type Asset = "BTC" | "ETH" | "USDT" | "ICP" | "OKP";

// Base market prices in CDF
export const BASE_PRICES_CDF: Record<Asset, number> = {
  BTC: 162_000_000,
  ETH: 8_400_000,
  USDT: 2_840,
  ICP: 18_500,
  OKP: 120,
};

export const ASSET_LABELS: Record<Asset, string> = {
  BTC: "Bitcoin",
  ETH: "Ethereum",
  USDT: "Tether",
  ICP: "Internet Computer",
  OKP: "Okapi Token",
};

export const ASSET_ICONS: Record<Asset, string> = {
  BTC: "₿",
  ETH: "⟠",
  USDT: "₮",
  ICP: "∞",
  OKP: "🦌",
};

// KongoKash Direct spread: 1.5% above market for buy, 1.5% below for sell
const DIRECT_SPREAD = 0.015;

// P2P simulated variation seed (deterministic for same session)
const P2P_VARIATION_SEED: Record<Asset, number> = {
  BTC: 0.018, // +1.8% from market
  ETH: -0.012, // -1.2% from market (cheaper on P2P)
  USDT: 0.008, // +0.8% from market
  ICP: -0.022, // -2.2% from market (much cheaper on P2P)
  OKP: 0.031, // +3.1% from market
};

const P2P_OFFER_COUNTS: Record<Asset, number> = {
  BTC: 3,
  ETH: 5,
  USDT: 12,
  ICP: 7,
  OKP: 4,
};

export interface DirectPriceResult {
  price: number;
  spread: number;
  spreadAmount: number;
  available: boolean;
}

export interface P2PPriceResult {
  price: number;
  savings: number; // positive = cheaper than direct, negative = more expensive
  savingsPercent: number;
  offersCount: number;
  available: boolean;
}

export interface ChannelComparison {
  recommended: "direct" | "p2p";
  reason: string;
  savings: number;
  savingsPercent: number;
}

/**
 * Get the KongoKash Direct price for a given asset and action.
 * Direct = stable, always available, 1.5% spread from market.
 */
export function getDirectPrice(
  asset: Asset,
  action: "buy" | "sell",
): DirectPriceResult {
  const base = BASE_PRICES_CDF[asset];
  const spreadAmount = Math.round(base * DIRECT_SPREAD);
  const price =
    action === "buy"
      ? Math.round(base * (1 + DIRECT_SPREAD))
      : Math.round(base * (1 - DIRECT_SPREAD));

  return {
    price,
    spread: DIRECT_SPREAD,
    spreadAmount,
    available: true,
  };
}

/**
 * Get the best available P2P price for a given asset and action.
 * P2P prices vary ±2-5% based on market activity (simulated).
 */
export function getP2PBestPrice(
  asset: Asset,
  action: "buy" | "sell",
): P2PPriceResult {
  const base = BASE_PRICES_CDF[asset];
  const variation = P2P_VARIATION_SEED[asset];
  const offersCount = P2P_OFFER_COUNTS[asset];
  const available = offersCount > 0;

  // For buy: P2P price = base + variation (user is buying from other user)
  // For sell: P2P price = base - variation (user sells, buyer sets price)
  let p2pPrice: number;
  if (action === "buy") {
    p2pPrice = Math.round(base * (1 + variation));
  } else {
    p2pPrice = Math.round(base * (1 - variation));
  }

  // Compare against Direct price
  const directResult = getDirectPrice(asset, action);
  // savings > 0 means P2P is cheaper (for buy) or gives more (for sell)
  const savings =
    action === "buy"
      ? directResult.price - p2pPrice
      : p2pPrice - directResult.price;
  const savingsPercent =
    Math.abs(savings / directResult.price) * (savings >= 0 ? 1 : -1) * 100;

  return {
    price: p2pPrice,
    savings,
    savingsPercent,
    offersCount,
    available,
  };
}

/**
 * Compare both channels for a specific amount and suggest which is better.
 * Threshold: if amount < 50_000 CDF or no P2P offers → recommend Direct.
 * Otherwise: recommend based on actual savings.
 */
export function compareChannels(
  asset: Asset,
  amountCDF: number,
  action: "buy" | "sell",
): ChannelComparison {
  const direct = getDirectPrice(asset, action);
  const p2p = getP2PBestPrice(asset, action);

  // Small amount or no P2P offers → always recommend Direct
  if (amountCDF < 50_000 || !p2p.available) {
    return {
      recommended: "direct",
      reason:
        amountCDF < 50_000
          ? "Pour les petits montants, KongoKash Direct est plus rapide et disponible immédiatement."
          : "Aucune offre P2P disponible actuellement — KongoKash Direct est votre seule option.",
      savings: 0,
      savingsPercent: 0,
    };
  }

  // P2P is significantly cheaper (savings > 500 CDF or > 0.5%)
  const savingsSignificant =
    p2p.savings > 500 || Math.abs(p2p.savingsPercent) >= 0.5;

  if (p2p.savings > 0 && savingsSignificant) {
    const totalSavings = Math.round((p2p.savings / direct.price) * amountCDF);
    return {
      recommended: "p2p",
      reason: `Des offres P2P disponibles à un meilleur prix — économisez ~${totalSavings.toLocaleString("fr-FR")} FC sur ce montant.`,
      savings: totalSavings,
      savingsPercent: p2p.savingsPercent,
    };
  }

  // Direct is better or equivalent
  return {
    recommended: "direct",
    reason:
      p2p.savings <= 0
        ? "Le prix P2P actuel est moins avantageux — KongoKash Direct est recommandé."
        : "KongoKash Direct offre un prix instantané garanti pour ce montant.",
    savings: 0,
    savingsPercent: 0,
  };
}

export function formatPriceCDF(price: number): string {
  return `${new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(price)} FC`;
}
