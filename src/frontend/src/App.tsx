import { Toaster } from "@/components/ui/sonner";
import BanquesSection from "./components/BanquesSection";
import BuySellSection from "./components/BuySellSection";
import Dashboard from "./components/Dashboard";
import Footer from "./components/Footer";
import HeroSection from "./components/HeroSection";
import MarketOverview from "./components/MarketOverview";
import Navbar from "./components/Navbar";
import OkapiSection from "./components/OkapiSection";

export default function App() {
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar onSectionClick={scrollToSection} />

      <main className="flex-1">
        <HeroSection
          onGetStarted={() => scrollToSection("buysell")}
          onViewMarkets={() => scrollToSection("market")}
        />
        <MarketOverview />
        <Dashboard />
        <OkapiSection />
        <BuySellSection />
        <BanquesSection />
      </main>

      <Footer />
      <Toaster richColors position="top-right" />
    </div>
  );
}
