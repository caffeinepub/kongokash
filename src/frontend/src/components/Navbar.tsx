import { Button } from "@/components/ui/button";
import {
  Home,
  Info,
  List,
  Menu,
  Repeat2,
  Shield,
  User,
  Wallet,
  X,
} from "lucide-react";
import { useState } from "react";
import type { TabId } from "../App";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useProfile } from "../hooks/useQueries";
import AuthModal from "./AuthModal";
import NotificationCenter from "./NotificationCenter";

interface NavbarProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  isAdmin?: boolean;
}

const MAIN_TABS: Array<{ id: TabId; label: string; icon: React.ElementType }> =
  [
    { id: "accueil", label: "Accueil", icon: Home },
    { id: "wallet", label: "Wallet", icon: Wallet },
    { id: "p2p", label: "P2P", icon: Repeat2 },
    { id: "transactions", label: "Transactions", icon: List },
    { id: "profil", label: "Profil", icon: User },
  ];

const GUEST_LINKS: Array<{ label: string; id: TabId; highlight?: boolean }> = [
  { label: "Accueil", id: "accueil" },
  { label: "Okapi", id: "okapi" },
  { label: "Réservations", id: "reservations" },
  { label: "Banques", id: "banques" },
  { label: "À propos", id: "about", highlight: true },
];

export default function Navbar({
  activeTab,
  onTabChange,
  isAdmin = false,
}: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState<"login" | "register">("login");
  const { identity, clear } = useInternetIdentity();
  const { data: profile } = useProfile();

  const openLogin = () => {
    setAuthTab("login");
    setAuthOpen(true);
  };
  const openRegister = () => {
    setAuthTab("register");
    setAuthOpen(true);
  };

  const handleTabClick = (tab: TabId) => {
    onTabChange(tab);
    setMenuOpen(false);
  };

  return (
    <>
      {/* Positioning strip — non-authenticated only */}
      {!identity && (
        <div
          className="w-full text-center py-2 px-4 text-xs font-semibold"
          style={{
            background: "oklch(0.52 0.12 160 / 0.15)",
            color: "oklch(0.78 0.14 160)",
            borderBottom: "1px solid oklch(0.52 0.12 160 / 0.25)",
          }}
        >
          🌍 Réseau de paiement P2P africain — Échangez CDF, FCFA, Naira et
          plus, sans banque &nbsp;&middot;&nbsp;
          <button
            type="button"
            onClick={() => handleTabClick("about")}
            className="underline underline-offset-2 hover:opacity-70 transition-opacity"
          >
            En savoir plus
          </button>
        </div>
      )}

      <header
        className="sticky top-0 z-50 w-full border-b border-white/10"
        style={{ background: "oklch(0.27 0.07 195)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          {/* Logo */}
          <button
            type="button"
            onClick={() => handleTabClick("accueil")}
            className="flex items-center gap-2 group shrink-0"
            data-ocid="nav.link"
          >
            <img
              src="/assets/generated/kongokash-logo-transparent.dim_600x200.png"
              className="h-9 w-auto"
              alt="KongoKash"
            />
          </button>

          {/* Desktop tabs — only when logged in */}
          {identity ? (
            <nav className="hidden md:flex items-center gap-0.5">
              {MAIN_TABS.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => handleTabClick(tab.id)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? "text-white"
                        : "text-white/60 hover:text-white hover:bg-white/10"
                    }`}
                    style={
                      isActive
                        ? {
                            background: "oklch(0.52 0.12 160 / 0.3)",
                            color: "oklch(0.88 0.06 160)",
                            borderBottom: "2px solid oklch(0.77 0.13 85)",
                          }
                        : {}
                    }
                    data-ocid={`nav.${tab.id}.tab`}
                  >
                    <tab.icon size={14} />
                    {tab.label}
                  </button>
                );
              })}
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => handleTabClick("profil")}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all"
                  style={{
                    color: "oklch(0.77 0.13 85)",
                    background: "oklch(0.77 0.13 85 / 0.12)",
                  }}
                  data-ocid="nav.admin.link"
                >
                  <Shield size={13} />
                  Admin
                </button>
              )}
            </nav>
          ) : (
            // Non-authenticated: show minimal nav with About highlighted
            <nav className="hidden md:flex items-center gap-1">
              {GUEST_LINKS.map((link) =>
                link.highlight ? (
                  <button
                    key={link.id}
                    type="button"
                    onClick={() => handleTabClick(link.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all"
                    style={{
                      background: "oklch(0.52 0.12 160 / 0.18)",
                      color: "oklch(0.78 0.14 160)",
                      border: "1px solid oklch(0.52 0.12 160 / 0.35)",
                    }}
                    data-ocid="nav.link"
                  >
                    <Info size={13} />
                    {link.label}
                  </button>
                ) : (
                  <button
                    key={link.id}
                    type="button"
                    onClick={() => handleTabClick(link.id)}
                    className="px-3 py-2 text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 rounded-md transition-colors"
                    data-ocid="nav.link"
                  >
                    {link.label}
                  </button>
                ),
              )}
            </nav>
          )}

          {/* Auth buttons + notifications */}
          <div className="hidden md:flex items-center gap-2">
            {identity && <NotificationCenter />}
            {identity ? (
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleTabClick("profil")}
                  className="text-white/70 text-sm hover:text-white transition-colors"
                  data-ocid="nav.profil.link"
                >
                  {profile?.displayName || "Mon profil"}
                </button>
              </div>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={openLogin}
                  className="border-gold text-gold hover:bg-gold/10 bg-transparent"
                  data-ocid="nav.button"
                >
                  Connexion
                </Button>
                <Button
                  size="sm"
                  onClick={openRegister}
                  style={{ background: "oklch(0.52 0.12 160)" }}
                  className="text-white hover:opacity-90"
                  data-ocid="nav.button"
                >
                  S'inscrire
                </Button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            className="md:hidden text-white p-2"
            onClick={() => setMenuOpen(!menuOpen)}
            data-ocid="nav.toggle"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile dropdown menu */}
        {menuOpen && (
          <div
            className="md:hidden px-4 pb-4 border-t border-white/10"
            style={{ background: "oklch(0.24 0.08 195)" }}
          >
            {identity ? (
              <>
                {MAIN_TABS.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => handleTabClick(tab.id)}
                    className={`flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium mt-1 transition-colors ${
                      activeTab === tab.id
                        ? "text-white bg-white/10"
                        : "text-white/70 hover:text-white hover:bg-white/5"
                    }`}
                    data-ocid={`nav.${tab.id}.tab`}
                  >
                    <tab.icon size={16} />
                    {tab.label}
                  </button>
                ))}
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/10">
                  <NotificationCenter />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clear}
                    className="border-white/30 text-white"
                    data-ocid="nav.button"
                  >
                    Déconnexion
                  </Button>
                </div>
              </>
            ) : (
              <>
                {GUEST_LINKS.map((link) => (
                  <button
                    key={link.id}
                    type="button"
                    onClick={() => handleTabClick(link.id)}
                    className={`flex items-center gap-2 w-full text-left px-3 py-2.5 rounded-lg text-sm mt-1 transition-colors ${
                      link.highlight
                        ? "font-semibold"
                        : "text-white/80 hover:text-white"
                    }`}
                    style={
                      link.highlight
                        ? {
                            background: "oklch(0.52 0.12 160 / 0.15)",
                            color: "oklch(0.78 0.14 160)",
                          }
                        : {}
                    }
                    data-ocid="nav.link"
                  >
                    {link.highlight && <Info size={14} />}
                    {link.label}
                  </button>
                ))}
                <div className="flex gap-2 mt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={openLogin}
                    className="border-gold text-gold bg-transparent"
                    data-ocid="nav.button"
                  >
                    Connexion
                  </Button>
                  <Button
                    size="sm"
                    onClick={openRegister}
                    style={{ background: "oklch(0.52 0.12 160)" }}
                    className="text-white"
                    data-ocid="nav.button"
                  >
                    S'inscrire
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </header>

      {/* Mobile bottom tab bar — only when logged in */}
      {identity && (
        <nav
          className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-slate-700 safe-area-pb"
          style={{ background: "oklch(0.27 0.07 195)" }}
          data-ocid="nav.panel"
        >
          <div className="flex items-center justify-around py-2">
            {MAIN_TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleTabClick(tab.id)}
                  className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-all ${
                    isActive ? "text-white" : "text-white/50"
                  }`}
                  style={isActive ? { color: "oklch(0.77 0.13 85)" } : {}}
                  data-ocid={`nav.${tab.id}.tab`}
                >
                  <tab.icon size={20} />
                  <span className="text-[10px] font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      )}

      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        defaultTab={authTab}
      />
    </>
  );
}
