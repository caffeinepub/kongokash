// ─── Mobile Money Operators Config for KongoKash ────────────────────────────

export const MOBILE_MONEY_OPERATORS = {
  airtel: {
    id: "airtel",
    name: "Airtel Money",
    color: "#E40000",
    colorOklch: "oklch(0.52 0.18 25)",
    bgOklch: "oklch(0.22 0.08 25 / 0.3)",
    borderOklch: "oklch(0.45 0.15 25 / 0.5)",
    emoji: "🔴",
    prefix: ["099", "098", "+24399", "+24398"],
    smsRegex: {
      amount: /(?:montant|amount)[:\s]+([0-9,. ]+)\s*(?:CDF|FC|USD)?/i,
      txId: /(?:ref|r[eé]f[eé]rence|transaction|id)[:\s#]+([A-Z0-9]+)/i,
      sender: /(?:de|from|exp[eé]diteur)[:\s]+([A-Za-z ]+)/i,
    },
    helpText:
      "Envoyez *111# → Mes transactions → copier le SMS de confirmation",
    exampleSms:
      "Airtel Money: Vous avez envoyé 50,000 CDF. Ref: AM2024XY789. De: Jean Mutombo. Solde: 120,000 CDF.",
  },
  mpesa: {
    id: "mpesa",
    name: "M-Pesa (Vodacom)",
    color: "#00A651",
    colorOklch: "oklch(0.55 0.15 145)",
    bgOklch: "oklch(0.22 0.08 145 / 0.3)",
    borderOklch: "oklch(0.45 0.13 145 / 0.5)",
    emoji: "🟢",
    prefix: ["081", "082", "+24381", "+24382"],
    smsRegex: {
      amount: /([0-9,. ]+)\s*(?:CDF|FC|USD)/i,
      txId: /(?:conf[iî]rmation|code)[:\s]+([A-Z0-9]+)/i,
      sender: /(?:de|from)[:\s]+([A-Za-z0-9 ]+)/i,
    },
    helpText: "Vérifiez le SMS reçu de M-Pesa avec le code de confirmation",
    exampleSms:
      "M-PESA: 50,000 CDF envoyés. Code: MPESA4521KK. De: Marie Kabila. Solde: 80,000 CDF.",
  },
  orange: {
    id: "orange",
    name: "Orange Money",
    color: "#FF6600",
    colorOklch: "oklch(0.65 0.17 55)",
    bgOklch: "oklch(0.26 0.10 55 / 0.3)",
    borderOklch: "oklch(0.50 0.15 55 / 0.5)",
    emoji: "🟠",
    prefix: ["084", "085", "+24384", "+24385"],
    smsRegex: {
      amount: /([0-9,. ]+)\s*(?:CDF|FC|USD)/i,
      txId: /(?:id|num[eé]ro)[:\s]+([0-9]+)/i,
      sender: /(?:envoy[eé]|de)[:\s]+([A-Za-z ]+)/i,
    },
    helpText: "Consultez votre SMS Orange Money pour le numéro de transaction",
    exampleSms:
      "Orange Money: Transfert 50000 CDF reçu. ID: 20241234567. Envoyé par: Paul Ngoy. Merci.",
  },
  vodacom: {
    id: "vodacom",
    name: "Vodacom Cash",
    color: "#E60000",
    colorOklch: "oklch(0.50 0.16 20)",
    bgOklch: "oklch(0.20 0.08 20 / 0.3)",
    borderOklch: "oklch(0.42 0.14 20 / 0.5)",
    emoji: "📱",
    prefix: ["080", "+24380"],
    smsRegex: {
      amount: /([0-9,. ]+)\s*(?:CDF|FC|USD)/i,
      txId: /([A-Z0-9]{6,})/i,
      sender: /(?:de|exp)[:\s]+([A-Za-z ]+)/i,
    },
    helpText: "Copiez le SMS Vodacom Cash reçu après le transfert",
    exampleSms:
      "VODACOM CASH: Paiement 50000 CDF confirmé. Ref: VC987654. Exp: Claude Ilunga.",
  },
};

export type OperatorId = keyof typeof MOBILE_MONEY_OPERATORS;
export type OperatorConfig =
  (typeof MOBILE_MONEY_OPERATORS)[keyof typeof MOBILE_MONEY_OPERATORS];

export interface SmsParseResult {
  amount: string;
  txId: string;
  sender: string;
  confidence: 0 | 1 | 2 | 3;
}

export function parseSmsConfirmation(
  sms: string,
  operatorId: string,
): SmsParseResult | null {
  const op = MOBILE_MONEY_OPERATORS[operatorId as OperatorId];
  if (!op) return null;
  const amount = sms.match(op.smsRegex.amount)?.[1]?.replace(/[, ]/g, "") || "";
  const txId = sms.match(op.smsRegex.txId)?.[1] || "";
  const sender = sms.match(op.smsRegex.sender)?.[1]?.trim() || "";
  return {
    amount,
    txId,
    sender,
    confidence: [amount, txId, sender].filter(Boolean).length as 0 | 1 | 2 | 3,
  };
}

export function formatPhoneNumber(phone: string): string {
  const clean = phone.replace(/[\s\-\(\)]/g, "");
  if (clean.startsWith("0") && clean.length === 10)
    return `+243${clean.slice(1)}`;
  if (clean.startsWith("243") && clean.length === 12) return `+${clean}`;
  return clean;
}

export function detectOperatorFromPhone(phone: string): OperatorId | null {
  const clean = formatPhoneNumber(phone);
  for (const [id, op] of Object.entries(MOBILE_MONEY_OPERATORS)) {
    if (op.prefix.some((p) => clean.startsWith(p))) {
      return id as OperatorId;
    }
  }
  return null;
}

export function getOperatorById(id: string): OperatorConfig | null {
  return MOBILE_MONEY_OPERATORS[id as OperatorId] ?? null;
}

/** Try to auto-detect which operator an offer belongs to from paymentMethod string */
export function detectOperatorFromMethodString(
  method: string,
): OperatorId | null {
  const m = method.toLowerCase();
  if (m.includes("airtel")) return "airtel";
  if (m.includes("mpesa") || m.includes("m-pesa") || m.includes("vodacom"))
    return "mpesa";
  if (m.includes("orange")) return "orange";
  if (m.includes("vodacom cash")) return "vodacom";
  return null;
}
