import { Button } from "@/components/ui/button";
import { ArrowDownLeft, ArrowUpRight, Download, Send } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { usePortfolioValue } from "../hooks/useQueries";
import Dashboard from "./Dashboard";

function formatCDF(n: number) {
  return `${new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(n)} FC`;
}

const WALLET_ACTIONS = [
  {
    icon: ArrowDownLeft,
    label: "Recevoir",
    sublabel: "Mobile Money / Banque",
    tab: "deposit",
    style: {
      background:
        "linear-gradient(135deg, oklch(0.42 0.13 160) 0%, oklch(0.35 0.11 175) 100%)",
      boxShadow: "0 4px 16px oklch(0.42 0.13 160 / 0.35)",
    },
  },
  {
    icon: Send,
    label: "Envoyer",
    sublabel: "Transfert externe",
    tab: "external",
    style: {
      background:
        "linear-gradient(135deg, oklch(0.45 0.15 250) 0%, oklch(0.38 0.13 260) 100%)",
      boxShadow: "0 4px 16px oklch(0.45 0.15 250 / 0.35)",
    },
  },
  {
    icon: Download,
    label: "Déposer",
    sublabel: "Créditer le compte",
    tab: "deposit",
    style: {
      background:
        "linear-gradient(135deg, oklch(0.55 0.16 145) 0%, oklch(0.45 0.14 155) 100%)",
      boxShadow: "0 4px 16px oklch(0.55 0.16 145 / 0.35)",
    },
  },
  {
    icon: ArrowUpRight,
    label: "Retirer",
    sublabel: "Vers Mobile Money",
    tab: "withdraw",
    style: {
      background:
        "linear-gradient(135deg, oklch(0.65 0.16 75) 0%, oklch(0.55 0.14 65) 100%)",
      boxShadow: "0 4px 16px oklch(0.65 0.16 75 / 0.35)",
    },
  },
];

export default function WalletPage() {
  const { data: portfolio } = usePortfolioValue();
  const [activeTab, setActiveTab] = useState("portfolio");

  const totalCDF = portfolio?.totalCDF ?? 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-5"
    >
      {/* Header */}
      <div>
        <h1 className="font-display font-bold text-2xl text-white">
          Portefeuille
        </h1>
        <p className="text-slate-400 text-sm mt-0.5">
          Gérez vos actifs et vos transferts
        </p>
      </div>

      {/* Total portfolio chip */}
      <div
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-teal-700/40"
        style={{ background: "oklch(0.22 0.06 185 / 0.5)" }}
        data-ocid="wallet.card"
      >
        <span className="text-teal-300 text-xs font-medium">Actif total :</span>
        <span className="text-white font-bold text-sm">
          {formatCDF(totalCDF)}
        </span>
      </div>

      {/* Prominent action buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {WALLET_ACTIONS.map((action, i) => (
          <motion.button
            key={action.label}
            type="button"
            whileTap={{ scale: 0.97 }}
            onClick={() => setActiveTab(action.tab)}
            className="flex flex-col items-center gap-2.5 p-5 rounded-2xl text-white hover:brightness-110 transition-all"
            style={action.style}
            data-ocid={`wallet.primary_button.${i + 1}`}
          >
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
              <action.icon size={22} className="text-white" />
            </div>
            <div className="text-center">
              <p className="text-sm font-bold">{action.label}</p>
              <p className="text-xs opacity-70 mt-0.5">{action.sublabel}</p>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Separator label */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-slate-700/60" />
        <span className="text-xs text-slate-500 font-medium">Mes actifs</span>
        <div className="flex-1 h-px bg-slate-700/60" />
      </div>

      {/* The full Dashboard in portfolio mode */}
      <Dashboard initialTab={activeTab} />
    </motion.div>
  );
}
