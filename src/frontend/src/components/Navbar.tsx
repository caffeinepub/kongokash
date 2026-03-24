import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useProfile } from "../hooks/useQueries";
import AuthModal from "./AuthModal";

interface NavbarProps {
  onSectionClick: (section: string) => void;
}

export default function Navbar({ onSectionClick }: NavbarProps) {
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

  const navLinks = [
    { label: "Accueil", id: "hero" },
    { label: "Échange", id: "buysell" },
    { label: "Portefeuille", id: "dashboard" },
    { label: "Banques", id: "banques" },
    { label: "Support", id: "footer" },
  ];

  return (
    <>
      <header
        className="sticky top-0 z-50 w-full"
        style={{ background: "oklch(0.27 0.07 195)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          {/* Logo */}
          <button
            type="button"
            onClick={() => onSectionClick("hero")}
            className="flex items-center gap-2 group"
            data-ocid="nav.link"
          >
            <span className="text-2xl">🐆</span>
            <span className="font-display font-bold text-xl text-white tracking-tight">
              KongoKash
            </span>
          </button>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <button
                type="button"
                key={link.id}
                onClick={() => onSectionClick(link.id)}
                className="px-3 py-2 text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 rounded-md transition-colors"
                data-ocid="nav.link"
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Auth buttons */}
          <div className="hidden md:flex items-center gap-3">
            {identity ? (
              <div className="flex items-center gap-3">
                <span className="text-white/70 text-sm">
                  {profile?.displayName || "Mon compte"}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clear}
                  className="border-white/30 text-white hover:bg-white/10 hover:text-white"
                  data-ocid="nav.button"
                >
                  Déconnexion
                </Button>
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

        {/* Mobile menu */}
        {menuOpen && (
          <div
            className="md:hidden px-4 pb-4 border-t border-white/10"
            style={{ background: "oklch(0.27 0.07 195)" }}
          >
            {navLinks.map((link) => (
              <button
                type="button"
                key={link.id}
                onClick={() => {
                  onSectionClick(link.id);
                  setMenuOpen(false);
                }}
                className="block w-full text-left px-3 py-2 text-white/80 hover:text-white text-sm"
                data-ocid="nav.link"
              >
                {link.label}
              </button>
            ))}
            <div className="flex gap-2 mt-3">
              {identity ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clear}
                  className="border-white/30 text-white"
                  data-ocid="nav.button"
                >
                  Déconnexion
                </Button>
              ) : (
                <>
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
                </>
              )}
            </div>
          </div>
        )}
      </header>

      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        defaultTab={authTab}
      />
    </>
  );
}
