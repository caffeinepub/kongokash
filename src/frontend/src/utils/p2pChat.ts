// P2P Chat — Messages sécurisés par transaction
export type ChatSenderRole = "Acheteur" | "Vendeur" | "Système";

export interface ChatMessage {
  id: string;
  tradeId: string;
  senderRole: ChatSenderRole;
  senderPrincipal: string;
  content: string;
  timestamp: string; // ISO
  isSystemMessage: boolean;
}

const STORAGE_KEY = "kk_p2p_chat_v1";

function loadMessages(): ChatMessage[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ChatMessage[];
  } catch {
    return [];
  }
}

function saveMessages(msgs: ChatMessage[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(msgs));
  } catch {
    // silent
  }
}

export function getChatMessages(tradeId: string): ChatMessage[] {
  return loadMessages().filter((m) => m.tradeId === tradeId);
}

export function addChatMessage(msg: Omit<ChatMessage, "id">): ChatMessage {
  const full: ChatMessage = {
    ...msg,
    id: crypto.randomUUID(),
  };
  const all = loadMessages();
  all.push(full);
  saveMessages(all);
  return full;
}

export function addSystemMessage(
  tradeId: string,
  content: string,
): ChatMessage {
  return addChatMessage({
    tradeId,
    senderRole: "Système",
    senderPrincipal: "SYSTÈME",
    content,
    timestamp: new Date().toISOString(),
    isSystemMessage: true,
  });
}

export function getUnreadCount(
  tradeId: string,
  lastSeenTimestamp: string | null,
): number {
  const msgs = getChatMessages(tradeId);
  if (!lastSeenTimestamp) return msgs.length;
  return msgs.filter((m) => new Date(m.timestamp) > new Date(lastSeenTimestamp))
    .length;
}
