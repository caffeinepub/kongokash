import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Shield, Star } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import P2PSection from "./P2PSection";

const MOCK_OFFERS = [
  {
    id: "o1",
    initials: "JK",
    avatarColor: "oklch(0.45 0.15 250)",
    pseudo: "JeanKibu",
    rating: 4.8,
    trades: 245,
    asset: "USDT",
    price: 2850,
    currency: "CDF",
    type: "buy" as const,
    minAmount: 5000,
    maxAmount: 500000,
    method: "Airtel Money",
    methodColor: "bg-red-900/40 text-red-300",
  },
  {
    id: "o2",
    initials: "SM",
    avatarColor: "oklch(0.42 0.13 160)",
    pseudo: "SophieMukadi",
    rating: 4.9,
    trades: 512,
    asset: "USDT",
    price: 2870,
    currency: "CDF",
    type: "sell" as const,
    minAmount: 10000,
    maxAmount: 2000000,
    method: "M-Pesa",
    methodColor: "bg-green-900/40 text-green-300",
  },
  {
    id: "o3",
    initials: "PK",
    avatarColor: "oklch(0.55 0.16 75)",
    pseudo: "PatrickKongo",
    rating: 4.6,
    trades: 88,
    asset: "BTC",
    price: 162500000,
    currency: "CDF",
    type: "buy" as const,
    minAmount: 50000,
    maxAmount: 5000000,
    method: "Virement Bancaire",
    methodColor: "bg-blue-900/40 text-blue-300",
  },
  {
    id: "o4",
    initials: "AM",
    avatarColor: "oklch(0.50 0.17 330)",
    pseudo: "AmandaMbuyi",
    rating: 5.0,
    trades: 1203,
    asset: "USDT",
    price: 2855,
    currency: "CDF",
    type: "buy" as const,
    minAmount: 2000,
    maxAmount: 1000000,
    method: "Orange Money",
    methodColor: "bg-orange-900/40 text-orange-300",
  },
  {
    id: "o5",
    initials: "CN",
    avatarColor: "oklch(0.48 0.14 220)",
    pseudo: "ChrisNzuzi",
    rating: 4.7,
    trades: 334,
    asset: "ETH",
    price: 8420000,
    currency: "CDF",
    type: "sell" as const,
    minAmount: 100000,
    maxAmount: 10000000,
    method: "Airtel Money",
    methodColor: "bg-red-900/40 text-red-300",
  },
  {
    id: "o6",
    initials: "GK",
    avatarColor: "oklch(0.45 0.13 35)",
    pseudo: "GraceKabila",
    rating: 4.5,
    trades: 67,
    asset: "OKP",
    price: 87,
    currency: "CDF",
    type: "buy" as const,
    minAmount: 1000,
    maxAmount: 100000,
    method: "M-Pesa",
    methodColor: "bg-green-900/40 text-green-300",
  },
];

const ASSET_FILTERS = ["Tous", "USDT", "BTC", "ETH", "OKP"];
const TYPE_FILTERS = ["Tous", "Acheter", "Vendre"];

export default function P2PPage() {
  const [assetFilter, setAssetFilter] = useState("Tous");
  const [typeFilter, setTypeFilter] = useState("Tous");
  const [showP2PSection, setShowP2PSection] = useState(false);

  const filteredOffers = MOCK_OFFERS.filter((o) => {
    const assetMatch = assetFilter === "Tous" || o.asset === assetFilter;
    const typeMatch =
      typeFilter === "Tous" ||
      (typeFilter === "Acheter" && o.type === "buy") ||
      (typeFilter === "Vendre" && o.type === "sell");
    return assetMatch && typeMatch;
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-5"
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-white">
            Marché P2P
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Échangez directement entre utilisateurs via escrow sécurisé.
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button
              className="flex items-center gap-2 text-white"
              style={{ background: "oklch(0.42 0.13 160)" }}
              data-ocid="p2p.open_modal_button"
            >
              <Plus size={16} /> Créer une offre
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-900 border-slate-700 text-white">
            <DialogHeader>
              <DialogTitle>Créer une offre P2P</DialogTitle>
            </DialogHeader>
            <p className="text-slate-400 text-sm">
              Utilisez l'onglet P2P complet ci-dessous pour créer et gérer vos
              offres.
            </p>
            <Button
              className="w-full text-white mt-2"
              style={{ background: "oklch(0.42 0.13 160)" }}
              onClick={() => setShowP2PSection(true)}
              data-ocid="p2p.confirm_button"
            >
              Accéder au module P2P complet
            </Button>
          </DialogContent>
        </Dialog>
      </div>

      {/* Security badge */}
      <div className="flex items-center gap-2 px-4 py-2 rounded-xl border border-teal-700/30 bg-teal-900/10">
        <Shield size={14} className="text-teal-400" />
        <span className="text-teal-300 text-xs">
          Tous les échanges sont protégés par un smart contract escrow — vos
          fonds ne sont libérés qu'après confirmation.
        </span>
      </div>

      {/* Filter bar */}
      <div className="space-y-2">
        {/* Asset filter */}
        <div className="flex gap-2 flex-wrap">
          {ASSET_FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setAssetFilter(f)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                assetFilter === f
                  ? "text-white shadow-md"
                  : "border border-slate-600 text-slate-400 bg-transparent hover:border-slate-500"
              }`}
              style={
                assetFilter === f
                  ? {
                      background: "oklch(0.42 0.13 160)",
                      boxShadow: "0 2px 10px oklch(0.42 0.13 160 / 0.3)",
                    }
                  : {}
              }
              data-ocid="p2p.tab"
            >
              {f}
            </button>
          ))}
        </div>
        {/* Type filter */}
        <div className="flex gap-2">
          {TYPE_FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setTypeFilter(f)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                typeFilter === f
                  ? "text-white shadow-md"
                  : "border border-slate-600 text-slate-400 bg-transparent hover:border-slate-500"
              }`}
              style={
                typeFilter === f
                  ? {
                      background:
                        f === "Acheter"
                          ? "oklch(0.45 0.14 145)"
                          : f === "Vendre"
                            ? "oklch(0.45 0.18 27)"
                            : "oklch(0.42 0.13 160)",
                    }
                  : {}
              }
              data-ocid="p2p.tab"
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Offer list */}
      <AnimatePresence mode="popLayout">
        <div className="grid sm:grid-cols-2 gap-3">
          {filteredOffers.map((offer, i) => (
            <motion.div
              key={offer.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ delay: i * 0.04 }}
              data-ocid={`p2p.item.${i + 1}`}
            >
              <Card className="border-slate-700/60 bg-slate-900 hover:border-slate-600 transition-all hover:bg-slate-800/60">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    {/* Trader info */}
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                        style={{ background: offer.avatarColor }}
                      >
                        {offer.initials}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">
                          {offer.pseudo}
                        </p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Star
                            size={11}
                            className="text-amber-400 fill-amber-400"
                          />
                          <span className="text-xs text-amber-400 font-medium">
                            {offer.rating}
                          </span>
                          <span className="text-xs text-slate-500">
                            · {offer.trades} trades
                          </span>
                        </div>
                      </div>
                    </div>
                    {/* Type badge */}
                    <Badge
                      className="text-xs font-semibold px-2 py-1"
                      style={{
                        background:
                          offer.type === "buy"
                            ? "oklch(0.42 0.13 145 / 0.25)"
                            : "oklch(0.42 0.18 27 / 0.25)",
                        color:
                          offer.type === "buy"
                            ? "oklch(0.75 0.14 145)"
                            : "oklch(0.75 0.15 27)",
                        border:
                          offer.type === "buy"
                            ? "1px solid oklch(0.42 0.13 145 / 0.4)"
                            : "1px solid oklch(0.42 0.18 27 / 0.4)",
                      }}
                    >
                      {offer.type === "buy" ? "Achat" : "Vente"}
                    </Badge>
                  </div>

                  {/* Price */}
                  <div className="mb-3">
                    <p className="text-xs text-slate-500 mb-0.5">Prix</p>
                    <p className="text-xl font-bold text-white">
                      1 {offer.asset} ={" "}
                      <span style={{ color: "oklch(0.75 0.14 75)" }}>
                        {offer.price.toLocaleString("fr-FR")} {offer.currency}
                      </span>
                    </p>
                  </div>

                  {/* Limits */}
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs text-slate-500">
                      Min:{" "}
                      <span className="text-slate-300">
                        {offer.minAmount.toLocaleString("fr-FR")}{" "}
                        {offer.currency}
                      </span>
                      {" · "}Max:{" "}
                      <span className="text-slate-300">
                        {offer.maxAmount.toLocaleString("fr-FR")}{" "}
                        {offer.currency}
                      </span>
                    </p>
                  </div>

                  {/* Bottom row */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-medium ${offer.methodColor}`}
                    >
                      {offer.method}
                    </span>
                    <Button
                      size="sm"
                      className="px-5 text-white font-semibold"
                      style={{
                        background:
                          offer.type === "buy"
                            ? "oklch(0.45 0.14 145)"
                            : "oklch(0.45 0.18 27)",
                        boxShadow:
                          offer.type === "buy"
                            ? "0 2px 10px oklch(0.45 0.14 145 / 0.35)"
                            : "0 2px 10px oklch(0.45 0.18 27 / 0.35)",
                      }}
                      data-ocid={`p2p.primary_button.${i + 1}`}
                    >
                      {offer.type === "buy" ? "Acheter" : "Vendre"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
          {filteredOffers.length === 0 && (
            <div
              className="col-span-2 py-16 text-center text-slate-500"
              data-ocid="p2p.empty_state"
            >
              Aucune offre pour ces filtres.
            </div>
          )}
        </div>
      </AnimatePresence>

      {/* Divider to full P2P section */}
      <div className="pt-4">
        <button
          type="button"
          onClick={() => setShowP2PSection((v) => !v)}
          className="w-full py-3 rounded-xl border border-slate-700 text-slate-400 text-sm hover:border-slate-600 hover:text-white transition-all"
          data-ocid="p2p.toggle"
        >
          {showP2PSection ? "▲ Masquer" : "▼ Afficher"} le module P2P complet
          (escrow, mes trades, audit...)
        </button>
        {showP2PSection && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4"
          >
            <P2PSection />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
