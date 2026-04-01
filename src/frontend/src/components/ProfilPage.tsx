import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Building2,
  Copy,
  Headphones,
  LogOut,
  Shield,
  ShieldCheck,
  User,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useProfile } from "../hooks/useQueries";
import PartnerDashboard from "./PartnerDashboard";
import ReferralSection from "./ReferralSection";
import SupportSection from "./SupportSection";

type Section = "profil" | "parrainage" | "support" | "partenaire";

const NAV_ITEMS: Array<{
  id: Section;
  label: string;
  icon: React.ElementType;
}> = [
  { id: "profil", label: "Mon profil", icon: User },
  { id: "parrainage", label: "Parrainage", icon: Shield },
  { id: "support", label: "Support", icon: Headphones },
  { id: "partenaire", label: "Espace Partenaire", icon: Building2 },
];

export default function ProfilPage() {
  const { identity, clear } = useInternetIdentity();
  const { data: profile } = useProfile();
  const [section, setSection] = useState<Section>("profil");
  const principal = identity?.getPrincipal().toString() ?? "";

  const copyPrincipal = () => {
    navigator.clipboard.writeText(principal);
    toast.success("Principal copié !");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 py-8"
    >
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar nav */}
        <div className="lg:w-64 shrink-0">
          <Card className="border-slate-700 bg-slate-900 sticky top-20">
            <CardContent className="p-4">
              {/* User info header */}
              <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-700">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-bold"
                  style={{ background: "oklch(0.52 0.12 160)" }}
                >
                  {profile?.displayName?.[0]?.toUpperCase() ?? "?"}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-white truncate">
                    {profile?.displayName || "Utilisateur"}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    {principal.slice(0, 12)}...{principal.slice(-6)}
                  </p>
                </div>
              </div>

              <nav className="space-y-1">
                {NAV_ITEMS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSection(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      section === item.id
                        ? "text-white"
                        : "text-slate-400 hover:text-white hover:bg-slate-800"
                    }`}
                    style={
                      section === item.id
                        ? {
                            background: "oklch(0.52 0.12 160 / 0.2)",
                            color: "oklch(0.75 0.12 160)",
                          }
                        : {}
                    }
                    data-ocid={`profil.${item.id}.tab`}
                  >
                    <item.icon size={16} />
                    {item.label}
                  </button>
                ))}
              </nav>

              <Separator className="my-4 bg-slate-700" />

              <Button
                variant="outline"
                size="sm"
                onClick={clear}
                className="w-full border-red-500/30 text-red-400 hover:bg-red-900/20 hover:text-red-300"
                data-ocid="profil.delete_button"
              >
                <LogOut size={14} className="mr-2" />
                Déconnexion
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {section === "profil" && (
            <Card className="border-slate-700 bg-slate-900">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <User size={18} /> Mon profil
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-slate-500 uppercase tracking-wider">
                      Nom d'affichage
                    </p>
                    <p className="text-white font-medium">
                      {profile?.displayName || "—"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-slate-500 uppercase tracking-wider">
                      Pays
                    </p>
                    <p className="text-white font-medium">
                      {profile?.country || "—"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-slate-500 uppercase tracking-wider">
                      Devise préférée
                    </p>
                    <p className="text-white font-medium">
                      {profile?.preferredCurrency || "CDF"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-slate-500 uppercase tracking-wider">
                      Code parrainage
                    </p>
                    <p className="text-emerald-400 font-mono font-medium">
                      {profile?.referralCode || "—"}
                    </p>
                  </div>
                </div>

                <Separator className="bg-slate-700" />

                <div className="space-y-2">
                  <p className="text-xs text-slate-500 uppercase tracking-wider">
                    Principal ICP
                  </p>
                  <div className="flex items-center gap-2 p-3 bg-slate-800 rounded-lg border border-slate-700">
                    <p className="text-xs text-slate-300 font-mono flex-1 truncate">
                      {principal}
                    </p>
                    <button
                      type="button"
                      onClick={copyPrincipal}
                      className="text-slate-400 hover:text-white transition-colors shrink-0"
                      data-ocid="profil.secondary_button"
                    >
                      <Copy size={14} />
                    </button>
                  </div>
                </div>

                <Separator className="bg-slate-700" />

                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-3">
                    Sécurité du compte
                  </p>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="flex items-center gap-3 p-3 bg-slate-800 rounded-lg border border-slate-700">
                      <ShieldCheck size={16} className="text-emerald-400" />
                      <div>
                        <p className="text-sm text-white font-medium">
                          Internet Identity
                        </p>
                        <p className="text-xs text-emerald-400">Connecté</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-slate-800 rounded-lg border border-slate-700">
                      <Shield size={16} className="text-amber-400" />
                      <div>
                        <p className="text-sm text-white font-medium">
                          Wallet non-custodial
                        </p>
                        <p className="text-xs text-slate-400">
                          Vérifier dans Wallet
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {section === "parrainage" && <ReferralSection />}
          {section === "support" && <SupportSection />}
          {section === "partenaire" && <PartnerDashboard />}
        </div>
      </div>
    </motion.div>
  );
}
