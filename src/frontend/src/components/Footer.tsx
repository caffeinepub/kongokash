import { SiFacebook, SiInstagram, SiTelegram, SiX } from "react-icons/si";

export default function Footer() {
  const year = new Date().getFullYear();
  const hostname =
    typeof window !== "undefined" ? window.location.hostname : "";
  const caffeineUrl = `https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(hostname)}`;

  return (
    <footer
      id="footer"
      style={{ background: "oklch(0.22 0.07 195)" }}
      className="text-white"
    >
      <div className="max-w-7xl mx-auto px-6 py-14">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Logo + tagline */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-3xl">🐆</span>
              <span className="font-display font-bold text-xl tracking-tight">
                KongoKash
              </span>
            </div>
            <p className="text-white/60 text-sm leading-relaxed">
              La plateforme décentralisée pour acheter et vendre des
              cryptomonnaies avec vos Francs Congolais à moindre coût.
            </p>
            <div className="flex gap-3 mt-5">
              {[
                { Icon: SiFacebook, label: "Facebook" },
                { Icon: SiX, label: "X (Twitter)" },
                { Icon: SiInstagram, label: "Instagram" },
                { Icon: SiTelegram, label: "Telegram" },
              ].map(({ Icon, label }) => (
                <button
                  key={label}
                  type="button"
                  aria-label={label}
                  className="w-9 h-9 rounded-full flex items-center justify-center hover:opacity-80 transition-opacity cursor-pointer"
                  style={{ background: "oklch(1 0 0 / 0.1)" }}
                  data-ocid="footer.link"
                >
                  <Icon size={16} />
                </button>
              ))}
            </div>
          </div>

          {/* Société */}
          <div>
            <h4
              className="font-semibold text-sm mb-4"
              style={{ color: "oklch(0.77 0.13 85)" }}
            >
              Société
            </h4>
            <ul className="space-y-2 text-sm text-white/60">
              {["À propos", "Carrières", "Blog", "Partenaires"].map((item) => (
                <li key={item}>
                  <button
                    type="button"
                    className="hover:text-white transition-colors text-left"
                    data-ocid="footer.link"
                  >
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Légal */}
          <div>
            <h4
              className="font-semibold text-sm mb-4"
              style={{ color: "oklch(0.77 0.13 85)" }}
            >
              Légal
            </h4>
            <ul className="space-y-2 text-sm text-white/60">
              {[
                "Conditions d'utilisation",
                "Politique de confidentialité",
                "Conformité KYC/AML",
              ].map((item) => (
                <li key={item}>
                  <button
                    type="button"
                    className="hover:text-white transition-colors text-left"
                    data-ocid="footer.link"
                  >
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4
              className="font-semibold text-sm mb-4"
              style={{ color: "oklch(0.77 0.13 85)" }}
            >
              Nous contacter
            </h4>
            <ul className="space-y-2 text-sm text-white/60">
              <li>📧 support@kongokash.cd</li>
              <li>📞 +243 XXX XXX XXX</li>
              <li>📍 Kinshasa, RDC</li>
              <li>
                <button
                  type="button"
                  className="hover:text-white transition-colors"
                  data-ocid="footer.link"
                >
                  Centre d'aide
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm"
          style={{ borderTop: "1px solid oklch(1 0 0 / 0.1)" }}
        >
          <p className="text-white/40">
            © {year} KongoKash. Tous droits réservés. Transactions sécurisées
            via Internet Computer Protocol.
          </p>
          <p className="text-white/30">
            Construit avec ❤️ en utilisant{" "}
            <a
              href={caffeineUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/50 hover:text-white transition-colors underline"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
