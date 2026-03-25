import { Toaster } from "@/components/ui/sonner";
import { useQuery } from "@tanstack/react-query";
import AdminDashboard from "./components/AdminDashboard";
import BanquesSection from "./components/BanquesSection";
import BuySellSection from "./components/BuySellSection";
import Dashboard from "./components/Dashboard";
import FirstAdminSetup from "./components/FirstAdminSetup";
import Footer from "./components/Footer";
import HeroSection from "./components/HeroSection";
import MarketOverview from "./components/MarketOverview";
import MobileMoneySection from "./components/MobileMoneySection";
import Navbar from "./components/Navbar";
import OkapiSection from "./components/OkapiSection";
import { useActor } from "./hooks/useActor";
import { useInternetIdentity } from "./hooks/useInternetIdentity";

export default function App() {
  const { identity } = useInternetIdentity();
  const { actor, isFetching } = useActor();

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

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  if (adminAssigned === false) {
    return (
      <>
        <Navbar onSectionClick={scrollToSection} isAdmin={false} />
        <FirstAdminSetup />
        <Toaster richColors position="top-right" />
      </>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar onSectionClick={scrollToSection} isAdmin={isAdmin} />
      <main className="flex-1">
        <HeroSection
          onGetStarted={() => scrollToSection("buysell")}
          onViewMarkets={() => scrollToSection("market")}
        />
        <MarketOverview />
        <Dashboard />
        <OkapiSection />
        <BuySellSection />
        <MobileMoneySection />
        <BanquesSection />
        {isAdmin && identity && <AdminDashboard />}
      </main>
      <Footer />
      <Toaster richColors position="top-right" />
    </div>
  );
}
