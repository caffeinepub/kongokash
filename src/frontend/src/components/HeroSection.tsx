import { Button } from "@/components/ui/button";
import { ArrowRight, Lock, TrendingUp } from "lucide-react";
import { motion } from "motion/react";

interface HeroSectionProps {
  onGetStarted: () => void;
  onViewMarkets: () => void;
}

export default function HeroSection({
  onGetStarted,
  onViewMarkets,
}: HeroSectionProps) {
  return (
    <section
      id="hero"
      className="relative overflow-hidden african-border-left african-border-right"
      style={{
        background:
          "linear-gradient(135deg, oklch(0.22 0.07 195) 0%, oklch(0.30 0.08 195) 50%, oklch(0.35 0.09 185) 100%)",
        minHeight: "88vh",
      }}
    >
      {/* Geometric overlay */}
      <div className="absolute inset-0 geo-pattern" />

      {/* Decorative circles */}
      <div
        className="absolute top-20 right-10 w-80 h-80 rounded-full opacity-10"
        style={{ background: "oklch(0.52 0.12 160)" }}
      />
      <div
        className="absolute bottom-10 left-20 w-60 h-60 rounded-full opacity-5"
        style={{ background: "oklch(0.77 0.13 85)" }}
      />

      <div className="relative max-w-7xl mx-auto px-6 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="space-y-6"
          >
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <span
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold"
                style={{
                  background: "oklch(0.77 0.13 85 / 0.15)",
                  color: "oklch(0.77 0.13 85)",
                }}
              >
                <TrendingUp size={14} />
                Plateforme décentralisée #1 en RDC
              </span>
            </motion.div>

            <h1
              className="font-display font-bold text-white leading-tight"
              style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}
            >
              Échangez des Cryptos{" "}
              <span style={{ color: "oklch(0.77 0.13 85)" }}>
                en toute sécurité
              </span>{" "}
              au Congo.
            </h1>

            <p className="text-lg text-white/70 leading-relaxed max-w-lg">
              Achetez et vendez du BTC, ETH et USDT directement avec vos Francs
              Congolais (CDF) ou Dollars US. Rapide, sécurisé, à moindre coût.
            </p>

            {/* Stats */}
            <div className="flex gap-8">
              <div>
                <div className="font-display font-bold text-2xl text-white">
                  2,500+
                </div>
                <div className="text-white/50 text-sm">Utilisateurs actifs</div>
              </div>
              <div>
                <div className="font-display font-bold text-2xl text-white">
                  $1.2M+
                </div>
                <div className="text-white/50 text-sm">Volume échangé</div>
              </div>
              <div>
                <div
                  className="font-display font-bold text-2xl"
                  style={{ color: "oklch(0.77 0.13 85)" }}
                >
                  0%
                </div>
                <div className="text-white/50 text-sm">Dépôt Mobile Money</div>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <Lock size={18} style={{ color: "oklch(0.77 0.13 85)" }} />
                  <div className="font-display font-bold text-2xl text-white">
                    On-Chain
                  </div>
                </div>
                <div className="text-white/50 text-sm">
                  Trésorerie transparente
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <Button
                onClick={onGetStarted}
                size="lg"
                className="rounded-full px-8 font-semibold shadow-gold"
                style={{
                  background: "oklch(0.77 0.13 85)",
                  color: "oklch(0.20 0.01 250)",
                }}
                data-ocid="hero.primary_button"
              >
                Commencer maintenant
                <ArrowRight size={16} className="ml-2" />
              </Button>
              <Button
                onClick={onViewMarkets}
                size="lg"
                variant="outline"
                className="rounded-full px-8 border-white/30 text-white hover:bg-white/10 bg-transparent"
                data-ocid="hero.secondary_button"
              >
                Voir les marchés
              </Button>
            </div>

            {/* Payment methods */}
            <div className="flex items-center gap-3 text-white/50 text-sm">
              <span>Paiement via :</span>
              <span className="px-2 py-1 rounded bg-white/10 text-white/70 text-xs font-medium">
                M-Pesa
              </span>
              <span className="px-2 py-1 rounded bg-white/10 text-white/70 text-xs font-medium">
                Airtel Money
              </span>
              <span className="px-2 py-1 rounded bg-white/10 text-white/70 text-xs font-medium">
                Virement
              </span>
            </div>
          </motion.div>

          {/* Right: Phone mockup */}
          <motion.div
            initial={{ opacity: 0, x: 40, y: 20 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="hidden lg:flex justify-center items-center relative"
          >
            {/* Floating crypto badges */}
            <div
              className="absolute -top-4 -left-4 z-10 float-anim flex items-center gap-2 px-3 py-2 rounded-full shadow-card-lg"
              style={{
                background: "oklch(0.97 0.02 85)",
                border: "1px solid oklch(0.77 0.13 85 / 0.3)",
              }}
            >
              <span className="text-lg">₿</span>
              <div>
                <div
                  className="text-xs font-bold"
                  style={{ color: "oklch(0.20 0.01 250)" }}
                >
                  Bitcoin
                </div>
                <div
                  className="text-xs"
                  style={{ color: "oklch(0.52 0.12 160)" }}
                >
                  +2.4%
                </div>
              </div>
            </div>

            <div
              className="absolute top-12 -right-8 z-10 float-anim float-anim-delay-1 flex items-center gap-2 px-3 py-2 rounded-full shadow-card-lg"
              style={{
                background: "oklch(0.97 0.02 220)",
                border: "1px solid oklch(0.52 0.12 160 / 0.3)",
              }}
            >
              <span className="text-lg">⟠</span>
              <div>
                <div
                  className="text-xs font-bold"
                  style={{ color: "oklch(0.20 0.01 250)" }}
                >
                  Ethereum
                </div>
                <div
                  className="text-xs"
                  style={{ color: "oklch(0.52 0.12 160)" }}
                >
                  +1.8%
                </div>
              </div>
            </div>

            <div
              className="absolute bottom-20 -left-6 z-10 float-anim float-anim-delay-2 flex items-center gap-2 px-3 py-2 rounded-full shadow-card-lg"
              style={{
                background: "oklch(0.97 0.02 160)",
                border: "1px solid oklch(0.52 0.12 160 / 0.3)",
              }}
            >
              <span className="text-lg">₮</span>
              <div>
                <div
                  className="text-xs font-bold"
                  style={{ color: "oklch(0.20 0.01 250)" }}
                >
                  USDT
                </div>
                <div
                  className="text-xs"
                  style={{ color: "oklch(0.52 0.12 160)" }}
                >
                  Stable
                </div>
              </div>
            </div>

            <div
              className="absolute bottom-8 right-0 z-10 float-anim float-anim-delay-3 flex items-center gap-2 px-3 py-2 rounded-full shadow-card-lg"
              style={{
                background: "oklch(0.92 0.04 80)",
                border: "1px solid oklch(0.77 0.13 85 / 0.4)",
              }}
            >
              <span
                className="text-base font-bold"
                style={{ color: "oklch(0.27 0.07 195)" }}
              >
                FC
              </span>
              <div>
                <div
                  className="text-xs font-bold"
                  style={{ color: "oklch(0.20 0.01 250)" }}
                >
                  Franc CDF
                </div>
                <div className="text-xs text-muted-foreground">En hausse</div>
              </div>
            </div>

            {/* Phone image */}
            <div className="relative z-0">
              <div
                className="absolute inset-0 rounded-3xl blur-2xl opacity-30"
                style={{ background: "oklch(0.52 0.12 160)" }}
              />
              <img
                src="/assets/generated/hero-phone-mockup.dim_480x600.png"
                alt="App KongoKash sur smartphone"
                className="relative w-72 xl:w-80 rounded-3xl shadow-card-lg transform -rotate-3"
                loading="eager"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
