import { Toaster } from "@/components/ui/sonner";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import AboutPage from "./components/AboutPage";
import AdminDashboard from "./components/AdminDashboard";
import BanquesSection from "./components/BanquesSection";
import DashboardHome from "./components/DashboardHome";
import EchangeHub from "./components/EchangeHub";
import EscrowExplainer from "./components/EscrowExplainer";
import FirstAdminSetup from "./components/FirstAdminSetup";
import Footer from "./components/Footer";
import HeroSection from "./components/HeroSection";
import MarketOverview from "./components/MarketOverview";
import MobileMoneySection from "./components/MobileMoneySection";
import Navbar from "./components/Navbar";
import OkapiSection from "./components/OkapiSection";
import P2PFlowDiagram from "./components/P2PFlowDiagram";
import ProfilPage from "./components/ProfilPage";
import ReservationsSection from "./components/ReservationsSection";
import TransactionsPage from "./components/TransactionsPage";
import TrustSection from "./components/TrustSection";
import VisionSection from "./components/VisionSection";
import WalletPage from "./components/WalletPage";
import { useActor } from "./hooks/useActor";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { ReservationNotifProvider } from "./hooks/useReservationNotifications";
import { WalletContextProvider } from "./hooks/useWalletContext";
import { checkUserSanction, runAutoDetection } from "./utils/fraudDetection";

export type TabId =
  | "accueil"
  | "wallet"
  | "p2p"
  | "transactions"
  | "profil"
  | "reservations"
  | "okapi"
  | "banques"
  | "about";

export default function App() {
  const { identity } = useInternetIdentity();
  const { actor, isFetching } = useActor();
  const [activeTab, setActiveTab] = useState<TabId>("accueil");
  const [activeSubTab, setActiveSubTab] = useState<string | null>(null);

  const { data: adminAssigned = null } = useQuery({
    queryKey: ["isAdminAssigned"],
    queryFn: () => (actor as any).isAdminAssigned() as Promise<boolean>,
    enabled: !!actor && !isFetching,
  });

  const { data: isAdmin = false } = useQuery({
    queryKey: ["isCallerAdmin"],
    queryFn: () => actor!.isCallerAdmin(),
    enabled: !!actor && !isFetching && !!identity,
  });

  const userId = identity?.getPrincipal().toString();
  const [appealOpen, setAppealOpen] = useState(false);
  const [appealMsg, setAppealMsg] = useState("");

  useEffect(() => {
    if (userId) {
      runAutoDetection(userId);
    }
  }, [userId]);

  const sanction = userId ? checkUserSanction(userId) : { blocked: false };

  const handleNavigate = (target: string) => {
    const [tab, sub] = target.split(":");
    setActiveTab(tab as TabId);
    setActiveSubTab(sub ?? null);
  };

  useEffect(() => {
    if (activeSubTab) {
      const t = setTimeout(() => setActiveSubTab(null), 500);
      return () => clearTimeout(t);
    }
  }, [activeSubTab]);

  if (adminAssigned === false) {
    return (
      <ReservationNotifProvider>
        <WalletContextProvider>
          <Navbar
            activeTab={activeTab}
            onTabChange={setActiveTab}
            isAdmin={false}
          />
          <FirstAdminSetup />
          <Toaster richColors position="top-right" />
        </WalletContextProvider>
      </ReservationNotifProvider>
    );
  }

  if (sanction.blocked) {
    const typeLabels: Record<string, string> = {
      BLOCAGE_IMMEDIAT: "Blocage immediat",
      GEL_TEMPORAIRE: "Gel temporaire",
      BLACKLIST_GLOBALE: "Blacklist globale",
    };
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <div className="max-w-md w-full rounded-2xl border border-red-500/30 bg-slate-900 p-8 text-center space-y-5">
          <div className="text-5xl">&#x1F6AB;</div>
          <h1 className="text-2xl font-bold text-red-400">Acces suspendu</h1>
          <p className="text-slate-400">{sanction.message}</p>
          {sanction.type && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-900/30 border border-red-500/30 text-red-300 text-sm font-medium">
              Type : {typeLabels[sanction.type] ?? sanction.type}
            </div>
          )}
          {sanction.expiry && (
            <p className="text-amber-400 text-sm">
              Levee prevue le{" "}
              {sanction.expiry.toLocaleString("fr-CD", {
                day: "2-digit",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          )}
          <p className="text-slate-500 text-sm">
            Contact :{" "}
            <a
              href="mailto:support@kongokash.cd"
              className="text-teal-400 underline"
            >
              support@kongokash.cd
            </a>
          </p>
          {!appealOpen ? (
            <button
              type="button"
              onClick={() => setAppealOpen(true)}
              className="mt-2 px-5 py-2 rounded-lg bg-teal-700 hover:bg-teal-600 text-white text-sm font-medium transition-colors"
              data-ocid="fraud.primary_button"
            >
              Faire appel
            </button>
          ) : (
            <div className="space-y-3 text-left">
              <textarea
                value={appealMsg}
                onChange={(e) => setAppealMsg(e.target.value)}
                placeholder="Expliquez votre situation..."
                rows={3}
                className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white text-sm placeholder:text-slate-500 resize-none"
                data-ocid="fraud.textarea"
              />
              <button
                type="button"
                onClick={() => {
                  setAppealMsg("");
                  setAppealOpen(false);
                  alert("Votre appel a ete envoye a l'equipe de support.");
                }}
                disabled={appealMsg.trim().length < 10}
                className="w-full py-2 rounded-lg bg-teal-700 hover:bg-teal-600 disabled:opacity-40 text-white text-sm font-medium transition-colors"
                data-ocid="fraud.submit_button"
              >
                Envoyer l&apos;appel
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  const renderPageContent = () => {
    if (!identity) {
      return (
        <>
          <HeroSection onGetStarted={() => {}} onViewMarkets={() => {}} />
          <TrustSection onLearnMore={() => setActiveTab("about")} />
          <EscrowExplainer />
          <P2PFlowDiagram />
          <VisionSection />
          <MarketOverview />
          <OkapiSection />
          <ReservationsSection />
          <MobileMoneySection />
          <BanquesSection />
        </>
      );
    }

    switch (activeTab) {
      case "accueil":
        return (
          <div
            className="min-h-[calc(100vh-4rem)] bg-slate-950"
            data-ocid="accueil.page"
          >
            <DashboardHome onNavigate={handleNavigate} />
          </div>
        );
      case "wallet":
        return (
          <div
            className="min-h-[calc(100vh-4rem)] bg-slate-950"
            data-ocid="wallet.page"
          >
            <WalletPage defaultSubTab={activeSubTab} />
          </div>
        );
      case "p2p":
        return (
          <div
            className="min-h-[calc(100vh-4rem)] bg-slate-950"
            data-ocid="p2p.page"
          >
            <EchangeHub defaultView={activeSubTab} />
          </div>
        );
      case "transactions":
        return (
          <div
            className="min-h-[calc(100vh-4rem)] bg-slate-950"
            data-ocid="transactions.page"
          >
            <TransactionsPage />
          </div>
        );
      case "profil":
        return (
          <div
            className="min-h-[calc(100vh-4rem)] bg-slate-950"
            data-ocid="profil.page"
          >
            <ProfilPage />
          </div>
        );
      case "reservations":
        return (
          <div
            className="min-h-[calc(100vh-4rem)] bg-slate-950 py-4"
            data-ocid="reservations.page"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
              <div className="mb-6">
                <h1 className="font-display font-bold text-2xl text-white">
                  Reservations
                </h1>
                <p className="text-slate-400 text-sm mt-1">
                  Hotels, parcs nationaux, vols et structures partenaires.
                </p>
              </div>
            </div>
            <ReservationsSection />
          </div>
        );
      case "okapi":
        return (
          <div className="min-h-[calc(100vh-4rem)]" data-ocid="okapi.page">
            <OkapiSection />
          </div>
        );
      case "banques":
        return (
          <div className="min-h-[calc(100vh-4rem)]" data-ocid="banques.page">
            <BanquesSection />
            <MobileMoneySection />
          </div>
        );
      case "about":
        return (
          <div
            className="min-h-[calc(100vh-4rem)] bg-slate-950"
            data-ocid="about.page"
          >
            <AboutPage
              onGetStarted={() => setActiveTab("wallet")}
              onViewWhitepaper={() => setActiveTab("okapi")}
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <ReservationNotifProvider>
      <WalletContextProvider>
        <div className="min-h-screen flex flex-col">
          <Navbar
            activeTab={activeTab}
            onTabChange={setActiveTab}
            isAdmin={isAdmin}
          />
          <main className="flex-1">
            {renderPageContent()}
            {isAdmin && identity && activeTab === "profil" && (
              <AdminDashboard />
            )}
          </main>
          <Footer onNavigate={(tab) => setActiveTab(tab as TabId)} />
          <Toaster richColors position="top-right" />
        </div>
      </WalletContextProvider>
    </ReservationNotifProvider>
  );
}
