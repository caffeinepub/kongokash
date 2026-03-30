import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Send } from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { appendAuditEntry } from "../utils/p2pAuditLog";
import {
  type ChatMessage,
  type ChatSenderRole,
  addChatMessage,
  getChatMessages,
} from "../utils/p2pChat";

interface P2PChatProps {
  tradeId: string;
  myPrincipal: string;
  myRole: "Acheteur" | "Vendeur";
  onMessageSent?: () => void;
  readOnly?: boolean;
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

function BubbleSystem({ msg }: { msg: ChatMessage }) {
  return (
    <div className="flex justify-center my-1">
      <div
        className="flex items-start gap-1.5 max-w-[85%] px-3 py-1.5 rounded-xl"
        style={{
          background: "oklch(0.97 0.01 185)",
          border: "1px solid oklch(0.88 0.04 185)",
        }}
      >
        <span className="text-[11px]" style={{ color: "oklch(0.48 0.06 185)" }}>
          🤖
        </span>
        <div>
          <p
            className="text-[11px] italic"
            style={{ color: "oklch(0.40 0.07 185)" }}
          >
            {msg.content}
          </p>
          <p
            className="text-[10px] mt-0.5"
            style={{ color: "oklch(0.60 0.05 185)" }}
          >
            {formatTime(msg.timestamp)}
          </p>
        </div>
      </div>
    </div>
  );
}

function BubbleUser({
  msg,
  myRole,
}: {
  msg: ChatMessage;
  myRole: ChatSenderRole;
}) {
  const isMe = msg.senderRole === myRole;
  const isAcheteur = msg.senderRole === "Acheteur";

  const bubbleBg = isAcheteur ? "oklch(0.88 0.06 225)" : "oklch(0.62 0.13 185)";
  const textColor = isAcheteur
    ? "oklch(0.20 0.08 225)"
    : "oklch(0.98 0.01 185)";
  const timeColor = isAcheteur
    ? "oklch(0.40 0.07 225)"
    : "oklch(0.88 0.04 185)";

  return (
    <div className={`flex ${isMe ? "justify-end" : "justify-start"} my-0.5`}>
      <div
        className="max-w-[75%] px-3 py-2 rounded-2xl space-y-0.5"
        style={{ background: bubbleBg }}
      >
        <p className="text-[11px] font-semibold" style={{ color: timeColor }}>
          {msg.senderRole}
        </p>
        <p className="text-[13px]" style={{ color: textColor }}>
          {msg.content}
        </p>
        <p className="text-[10px] text-right" style={{ color: timeColor }}>
          {formatTime(msg.timestamp)}
        </p>
      </div>
    </div>
  );
}

export default function P2PChat({
  tradeId,
  myPrincipal,
  myRole,
  onMessageSent,
  readOnly = false,
}: P2PChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(() =>
    getChatMessages(tradeId),
  );
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const MAX_CHARS = 500;

  // Poll for new messages every 3s
  useEffect(() => {
    const id = setInterval(() => {
      setMessages(getChatMessages(tradeId));
    }, 3_000);
    return () => clearInterval(id);
  }, [tradeId]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }); // biome-ignore lint/correctness/useExhaustiveDependencies: scroll on messages

  function handleSend() {
    const content = input.trim();
    if (!content || content.length > MAX_CHARS) return;

    addChatMessage({
      tradeId,
      senderRole: myRole,
      senderPrincipal: myPrincipal,
      content,
      timestamp: new Date().toISOString(),
      isSystemMessage: false,
    });

    // Log in audit
    appendAuditEntry({
      tradeId,
      actorPrincipal: myPrincipal,
      actorRole: myRole,
      action: "MESSAGE_ENVOYÉ",
      data: { preview: content.slice(0, 60), length: content.length },
    });

    setInput("");
    setMessages(getChatMessages(tradeId));
    onMessageSent?.();
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div
      className="rounded-xl overflow-hidden flex flex-col"
      style={{
        background: "oklch(0.13 0.04 220)",
        border: "1px solid oklch(0.22 0.05 220)",
      }}
    >
      {/* Warning banner */}
      <div
        className="px-3 py-1.5 flex items-center gap-2"
        style={{
          background: "oklch(0.16 0.05 220)",
          borderBottom: "1px solid oklch(0.22 0.05 220)",
        }}
      >
        <MessageSquare size={11} style={{ color: "oklch(0.62 0.13 185)" }} />
        <p
          className="text-[10px] italic"
          style={{ color: "oklch(0.55 0.06 220)" }}
        >
          💬 Les messages sont loggés et visibles par l'admin en cas de litige
        </p>
      </div>

      {/* Messages area */}
      <div
        ref={scrollRef}
        className="overflow-y-auto p-3 space-y-1"
        style={{ maxHeight: "16rem" }}
      >
        {messages.length === 0 && (
          <div className="py-8 text-center">
            <p
              className="text-[11px]"
              style={{ color: "oklch(0.45 0.04 220)" }}
            >
              Aucun message — démarrez la conversation
            </p>
          </div>
        )}
        {messages.map((msg) =>
          msg.isSystemMessage ? (
            <BubbleSystem key={msg.id} msg={msg} />
          ) : (
            <BubbleUser key={msg.id} msg={msg} myRole={myRole} />
          ),
        )}
      </div>

      {/* Input area (hidden in readOnly mode) */}
      {!readOnly && (
        <div
          className="flex gap-2 p-2 items-end"
          style={{
            borderTop: "1px solid oklch(0.22 0.05 220)",
            background: "oklch(0.11 0.03 220)",
          }}
        >
          <div className="flex-1 space-y-0.5">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Écrivez un message…"
              maxLength={MAX_CHARS + 1}
              className="text-sm bg-white/5 border-white/15 text-white placeholder:text-white/30"
              data-ocid="p2p.chat.input"
            />
            <p
              className="text-right text-[10px] pr-1"
              style={{
                color:
                  input.length > MAX_CHARS
                    ? "oklch(0.62 0.16 25)"
                    : "oklch(0.45 0.04 220)",
              }}
            >
              {input.length}/{MAX_CHARS}
            </p>
          </div>
          <Button
            size="sm"
            onClick={handleSend}
            disabled={!input.trim() || input.length > MAX_CHARS}
            className="gap-1.5 shrink-0"
            style={{
              background: "oklch(0.62 0.13 185)",
              color: "white",
              marginBottom: "18px",
            }}
            data-ocid="p2p.chat.button"
          >
            <Send size={13} />
            Envoyer
          </Button>
        </div>
      )}
    </div>
  );
}
