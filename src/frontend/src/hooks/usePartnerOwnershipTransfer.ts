// ─── usePartnerOwnershipTransfer ─────────────────────────────────────────────
// Manages partner wallet ownership transfers in localStorage.
// The seed phrase is NEVER transferred between persons — the new owner
// generates a completely fresh wallet; the old one is permanently invalidated.

export interface TransferRecord {
  partnerId: string;
  partnerName: string;
  oldOwnerName: string;
  newOwnerName: string;
  newOwnerContact: string;
  legalRef: string;
  /** en_transfert → nouveau_wallet → complete */
  status: "en_transfert" | "nouveau_wallet" | "complete";
  requestDate: string;
  completionDate?: string;
}

export type EnhancedPartnerStatus =
  | "none"
  | "active"
  | "gelé"
  | "en_transfert"
  | "complete";

const LS_TRANSFERS = "kk_partner_ownership_transfers";

function loadTransfers(): Record<string, TransferRecord> {
  try {
    return JSON.parse(localStorage.getItem(LS_TRANSFERS) ?? "{}");
  } catch {
    return {};
  }
}

function saveTransfers(records: Record<string, TransferRecord>): void {
  localStorage.setItem(LS_TRANSFERS, JSON.stringify(records));
}

/** Returns the enhanced status for a partner wallet, factoring in transfers. */
export function getEnhancedPartnerStatus(
  partnerId: string,
): EnhancedPartnerStatus {
  const transfers = loadTransfers();
  const transfer = transfers[partnerId];

  if (transfer) {
    if (transfer.status === "en_transfert") return "gelé";
    if (transfer.status === "nouveau_wallet") return "en_transfert";
    if (transfer.status === "complete") {
      const addrKey = `kk_partner_${partnerId}_address`;
      return localStorage.getItem(addrKey) ? "active" : "none";
    }
  }

  // No active transfer — check wallet presence
  const addrKey = `kk_partner_${partnerId}_address`;
  const encKey = `kk_partner_${partnerId}_encrypted`;
  return localStorage.getItem(addrKey) && localStorage.getItem(encKey)
    ? "active"
    : "none";
}

export function usePartnerOwnershipTransfer() {
  function getTransfers(): TransferRecord[] {
    return Object.values(loadTransfers());
  }

  function getTransfer(partnerId: string): TransferRecord | null {
    return loadTransfers()[partnerId] ?? null;
  }

  /** Step 1 — admin enters new owner info, old wallet is frozen. */
  function initTransfer(
    partnerId: string,
    partnerName: string,
    info: {
      oldOwnerName: string;
      newOwnerName: string;
      newOwnerContact: string;
      legalRef: string;
    },
  ): void {
    const records = loadTransfers();
    records[partnerId] = {
      partnerId,
      partnerName,
      ...info,
      status: "en_transfert",
      requestDate: new Date().toISOString(),
    };
    saveTransfers(records);
    // Freeze flag — prevents any outgoing transactions
    localStorage.setItem(`kk_partner_${partnerId}_frozen`, "true");
  }

  /** Step 2 — new owner has started generating their wallet. */
  function advanceToNewWallet(partnerId: string): void {
    const records = loadTransfers();
    if (records[partnerId]) {
      records[partnerId].status = "nouveau_wallet";
      saveTransfers(records);
    }
  }

  /** Step 3 — new wallet activated; old wallet data permanently erased. */
  function completeTransfer(partnerId: string): void {
    const records = loadTransfers();
    if (!records[partnerId]) return;
    // Permanently wipe old wallet from localStorage
    for (const suffix of [
      "_encrypted",
      "_salt",
      "_iv",
      "_webauthn_id",
      "_address",
      "_frozen",
      "_institution",
    ]) {
      localStorage.removeItem(`kk_partner_${partnerId}${suffix}`);
    }
    records[partnerId].status = "complete";
    records[partnerId].completionDate = new Date().toISOString();
    saveTransfers(records);
  }

  function cancelTransfer(partnerId: string): void {
    const records = loadTransfers();
    delete records[partnerId];
    saveTransfers(records);
    localStorage.removeItem(`kk_partner_${partnerId}_frozen`);
  }

  return {
    getTransfers,
    getTransfer,
    initTransfer,
    advanceToNewWallet,
    completeTransfer,
    cancelTransfer,
  };
}
