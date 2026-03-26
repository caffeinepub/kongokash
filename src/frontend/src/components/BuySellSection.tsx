import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowRight,
  CheckCircle,
  Info,
  Loader2,
  Lock,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useBuyCrypto, useSellCrypto } from "../hooks/useQueries";

type PaymentMethod = "bank" | "airtel" | "mpesa";

const PAYMENT_OPTIONS: Array<{
  id: PaymentMethod;
  label: string;
  icon: string;
  desc: string;
}> = [
  {
    id: "bank",
    label: "Virement Bancaire — Equity BCDC",
    icon: "🏦",
    desc: "Virement direct",
  },
  { id: "airtel", label: "Airtel Money", icon: "🔴", desc: "Mobile Money" },
  { id: "mpesa", label: "M-Pesa", icon: "🟢", desc: "Mobile Money" },
];

const OkapiIcon = ({ className }: { className?: string }) => (
  <img
    src="/assets/generated/okapi-token-icon-transparent.dim_128x128.png"
    className={className ?? "w-5 h-5 inline object-contain"}
    alt="OKP"
  />
);

const QUICK_SELECT_CHIPS = [
  { label: "₿ Bitcoin", value: "BTC", icon: null },
  { label: "⟠ Ethereum", value: "ETH", icon: null },
  { label: "₮ USDT", value: "USDT", icon: null },
  { label: "∞ ICP", value: "ICP", icon: null },
  { label: "OKAPI", value: "OKP", icon: true },
];

export default function BuySellSection() {
  const { identity } = useInternetIdentity();
  const buyCrypto = useBuyCrypto();
  const sellCrypto = useSellCrypto();

  const [buyAsset, setBuyAsset] = useState("BTC");
  const [buyFiatAmount, setBuyFiatAmount] = useState("");
  const [buyFiatCurrency, setBuyFiatCurrency] = useState("CDF");
  const [buyPaymentMethod, setBuyPaymentMethod] =
    useState<PaymentMethod>("bank");

  const [sellAsset, setSellAsset] = useState("BTC");
  const [sellCryptoAmount, setSellCryptoAmount] = useState("");
  const [sellFiatCurrency, setSellFiatCurrency] = useState("CDF");

  const scrollToMobileMoney = () => {
    const el = document.getElementById("mobilemoney");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleBuy = async () => {
    if (!identity) {
      toast.error("Veuillez vous connecter d'abord");
      return;
    }
    if (buyPaymentMethod !== "bank") {
      scrollToMobileMoney();
      return;
    }
    if (!buyFiatAmount || Number.parseFloat(buyFiatAmount) <= 0) {
      toast.error("Entrez un montant valide");
      return;
    }
    try {
      const result = await buyCrypto.mutateAsync({
        asset: buyAsset,
        fiatAmount: Number.parseFloat(buyFiatAmount),
        fiatCurrency: buyFiatCurrency,
        paymentMethod: buyPaymentMethod,
      });
      if (result.success) {
        toast.success(result.message || `Achat de ${buyAsset} confirmé!`);
        setBuyFiatAmount("");
      } else {
        toast.error(result.message || "Achat échoué");
      }
    } catch {
      toast.error("Erreur lors de l'achat");
    }
  };

  const handleSell = async () => {
    if (!identity) {
      toast.error("Veuillez vous connecter d'abord");
      return;
    }
    if (!sellCryptoAmount || Number.parseFloat(sellCryptoAmount) <= 0) {
      toast.error("Entrez un montant valide");
      return;
    }
    try {
      const result = await sellCrypto.mutateAsync({
        asset: sellAsset,
        cryptoAmount: Number.parseFloat(sellCryptoAmount),
        fiatCurrency: sellFiatCurrency,
      });
      if (result.success) {
        toast.success(result.message || `Vente de ${sellAsset} confirmée!`);
        setSellCryptoAmount("");
      } else {
        toast.error(result.message || "Vente échouée");
      }
    } catch {
      toast.error("Erreur lors de la vente");
    }
  };

  return (
    <section id="buysell" className="py-16 bg-background">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left illustration */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <h2 className="font-display font-bold text-3xl lg:text-4xl">
              Achetez et Vendez{" "}
              <span style={{ color: "oklch(0.27 0.07 195)" }}>
                en quelques secondes
              </span>
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Notre plateforme décentralisée vous permet d'échanger directement
              avec vos Francs Congolais ou vos Dollars. Paiement via virement
              bancaire Equity BCDC ou Mobile Money (Airtel Money, M-Pesa).
            </p>

            <div className="grid grid-cols-2 gap-4">
              {[
                {
                  icon: "🔒",
                  title: "Sécurisé",
                  desc: "Transactions vérifiées sur blockchain",
                },
                {
                  icon: "⚡",
                  title: "Rapide",
                  desc: "Confirmation en moins de 5 minutes",
                },
                {
                  icon: "📱",
                  title: "Mobile",
                  desc: "Airtel Money & M-Pesa disponibles",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="p-4 rounded-xl border"
                  style={{ background: "oklch(0.97 0.005 220)" }}
                >
                  <div className="text-2xl mb-2">{item.icon}</div>
                  <div className="font-semibold text-sm mb-1">{item.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {item.desc}
                  </div>
                </div>
              ))}
              {/* Fee card – full width */}
              <div
                className="col-span-2 p-4 rounded-xl border-l-4"
                style={{
                  background: "oklch(0.52 0.12 160 / 0.06)",
                  borderColor: "oklch(0.52 0.12 160)",
                }}
              >
                <div className="font-semibold text-sm mb-2">
                  💰 Frais transparents
                </div>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <div>
                    Dépôt Mobile Money :{" "}
                    <strong style={{ color: "oklch(0.52 0.12 160)" }}>
                      0%
                    </strong>{" "}
                    — GRATUIT
                  </div>
                  <div>
                    Retrait Mobile Money : max{" "}
                    <strong style={{ color: "oklch(0.52 0.12 160)" }}>
                      0.5%
                    </strong>
                  </div>
                  <div>
                    Trading : <strong>~1% + spread</strong>
                  </div>
                </div>
                <div
                  className="mt-2 text-xs"
                  style={{ color: "oklch(0.55 0.22 27)" }}
                >
                  vs cabistes P2P : 3%–5%
                </div>
              </div>
            </div>

            <div className="flex gap-3 flex-wrap">
              {QUICK_SELECT_CHIPS.map((chip) => (
                <button
                  key={chip.value}
                  type="button"
                  onClick={() => setBuyAsset(chip.value)}
                  className="px-4 py-2 rounded-full text-sm font-semibold text-white transition-all hover:opacity-80 flex items-center gap-1.5"
                  style={{
                    background:
                      buyAsset === chip.value
                        ? "oklch(0.77 0.13 85)"
                        : "oklch(0.27 0.07 195)",
                    boxShadow:
                      buyAsset === chip.value
                        ? "0 0 0 2px oklch(0.77 0.13 85 / 0.4)"
                        : "none",
                  }}
                >
                  {chip.icon ? (
                    <OkapiIcon className="w-4 h-4 object-contain" />
                  ) : null}
                  {chip.label}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Right: Buy/Sell form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Card className="shadow-card-lg border" data-ocid="buysell.card">
              <CardContent className="p-6">
                {/* CDF Bridge Info Banner */}
                <div
                  className="flex items-start gap-2 p-3 rounded-lg mb-5 text-sm"
                  style={{
                    background: "oklch(0.27 0.07 195 / 0.08)",
                    border: "1px solid oklch(0.27 0.07 195 / 0.25)",
                    color: "oklch(0.27 0.07 195)",
                  }}
                >
                  <Info size={15} className="mt-0.5 flex-shrink-0" />
                  <span>
                    Le <strong>franc congolais (CDF)</strong> est votre monnaie
                    de passage — échangez n'importe quelle crypto contre CDF,
                    puis achetez <strong>OKAPI</strong>.
                  </span>
                </div>

                <Tabs defaultValue="buy">
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="buy" data-ocid="buysell.tab">
                      Acheter
                    </TabsTrigger>
                    <TabsTrigger value="sell" data-ocid="buysell.tab">
                      Vendre
                    </TabsTrigger>
                  </TabsList>

                  {/* Buy Tab */}
                  <TabsContent value="buy" className="space-y-4">
                    <div className="space-y-2">
                      <Label>Crypto à acheter</Label>
                      <Select value={buyAsset} onValueChange={setBuyAsset}>
                        <SelectTrigger data-ocid="buysell.select">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="BTC">₿ Bitcoin (BTC)</SelectItem>
                          <SelectItem value="ETH">⟠ Ethereum (ETH)</SelectItem>
                          <SelectItem value="USDT">₮ Tether (USDT)</SelectItem>
                          <SelectItem value="ICP">
                            ∞ Internet Computer (ICP)
                          </SelectItem>
                          <SelectItem value="OKP">
                            <span className="flex items-center gap-1.5">
                              <OkapiIcon className="w-4 h-4 inline object-contain" />
                              Okapi Token (OKP)
                            </span>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Montant</Label>
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          placeholder="Ex: 50000"
                          value={buyFiatAmount}
                          onChange={(e) => setBuyFiatAmount(e.target.value)}
                          data-ocid="buysell.input"
                        />
                        <Select
                          value={buyFiatCurrency}
                          onValueChange={setBuyFiatCurrency}
                        >
                          <SelectTrigger
                            className="w-28"
                            data-ocid="buysell.select"
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="CDF">FC (CDF)</SelectItem>
                            <SelectItem value="USD">USD</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Payment method selector */}
                    <div className="space-y-2">
                      <Label>Méthode de paiement</Label>
                      <div className="space-y-2" data-ocid="buysell.panel">
                        {PAYMENT_OPTIONS.map((opt) => (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => {
                              setBuyPaymentMethod(opt.id);
                              if (opt.id !== "bank") scrollToMobileMoney();
                            }}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border-2 text-sm transition-all text-left"
                            style={{
                              borderColor:
                                buyPaymentMethod === opt.id
                                  ? "oklch(0.27 0.07 195)"
                                  : "oklch(0.88 0.02 220)",
                              background:
                                buyPaymentMethod === opt.id
                                  ? "oklch(0.27 0.07 195 / 0.07)"
                                  : "transparent",
                            }}
                            data-ocid={`buysell.${opt.id}_button`}
                          >
                            <span className="text-base">{opt.icon}</span>
                            <div className="flex-1">
                              <div className="font-medium">{opt.label}</div>
                              <div className="text-xs text-muted-foreground">
                                {opt.desc}
                              </div>
                            </div>
                            {buyPaymentMethod === opt.id && (
                              <CheckCircle
                                size={14}
                                style={{ color: "oklch(0.27 0.07 195)" }}
                              />
                            )}
                          </button>
                        ))}
                      </div>
                      {buyPaymentMethod !== "bank" && (
                        <p
                          className="text-xs"
                          style={{ color: "oklch(0.52 0.12 160)" }}
                        >
                          ↓ Rendez-vous dans la section Mobile Money ci-dessous
                        </p>
                      )}
                    </div>

                    {!identity && (
                      <div
                        className="p-3 rounded-lg text-sm"
                        style={{
                          background: "oklch(0.77 0.13 85 / 0.1)",
                          color: "oklch(0.55 0.13 75)",
                        }}
                      >
                        ⚠️ Connectez-vous pour effectuer des transactions
                      </div>
                    )}

                    <Button
                      onClick={handleBuy}
                      disabled={
                        (buyCrypto.isPending && buyPaymentMethod === "bank") ||
                        !identity
                      }
                      className="w-full font-semibold"
                      style={{
                        background: "oklch(0.52 0.12 160)",
                        color: "white",
                      }}
                      data-ocid="buysell.primary_button"
                    >
                      {buyCrypto.isPending && buyPaymentMethod === "bank" ? (
                        <>
                          <Loader2 size={16} className="mr-2 animate-spin" />{" "}
                          Traitement...
                        </>
                      ) : buyPaymentMethod !== "bank" ? (
                        "Aller au Mobile Money ↓"
                      ) : buyCrypto.isSuccess ? (
                        <>
                          <CheckCircle size={16} className="mr-2" /> Confirmer
                          l'achat
                        </>
                      ) : buyCrypto.isError ? (
                        <>
                          <XCircle size={16} className="mr-2" /> Réessayer
                        </>
                      ) : (
                        "Confirmer l'achat"
                      )}
                    </Button>

                    {buyCrypto.isSuccess && buyPaymentMethod === "bank" && (
                      <div
                        className="text-center text-sm"
                        style={{ color: "oklch(0.52 0.12 160)" }}
                        data-ocid="buysell.success_state"
                      >
                        ✓ Transaction réussie!
                      </div>
                    )}
                    {buyCrypto.isError && (
                      <div
                        className="text-center text-sm text-destructive"
                        data-ocid="buysell.error_state"
                      >
                        Erreur lors de la transaction
                      </div>
                    )}

                    {/* Transparency block */}
                    <div
                      className="rounded-xl p-4 space-y-3 border"
                      style={{
                        background: "oklch(0.52 0.12 160 / 0.06)",
                        borderColor: "oklch(0.52 0.12 160 / 0.25)",
                      }}
                    >
                      <div
                        className="flex items-center gap-2 text-xs font-semibold"
                        style={{ color: "oklch(0.52 0.12 160)" }}
                      >
                        <Lock size={12} />
                        Transparence des frais
                      </div>
                      <div className="space-y-2 text-xs">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{ background: "oklch(0.77 0.13 85)" }}
                          />
                          <span className="text-muted-foreground">
                            Ton achat :
                          </span>
                          <span className="font-semibold">
                            {buyFiatAmount
                              ? `${Number.parseFloat(buyFiatAmount).toLocaleString("fr-CD")} ${buyFiatCurrency}`
                              : "— en attente"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <ArrowRight
                            size={10}
                            className="text-muted-foreground flex-shrink-0"
                          />
                          <span className="text-muted-foreground">
                            Frais de trading (1%)
                          </span>
                          <ArrowRight
                            size={10}
                            className="flex-shrink-0"
                            style={{ color: "oklch(0.52 0.12 160)" }}
                          />
                          <span
                            className="font-semibold flex items-center gap-1"
                            style={{ color: "oklch(0.52 0.12 160)" }}
                          >
                            <Lock size={10} />
                            Trésorerie smart contract
                          </span>
                        </div>
                        {buyFiatAmount &&
                          Number.parseFloat(buyFiatAmount) > 0 && (
                            <div className="flex items-center gap-2 pl-4">
                              <span className="text-muted-foreground">
                                soit
                              </span>
                              <span
                                className="font-bold"
                                style={{ color: "oklch(0.77 0.13 85)" }}
                              >
                                {(
                                  Number.parseFloat(buyFiatAmount) * 0.01
                                ).toLocaleString("fr-CD", {
                                  maximumFractionDigits: 2,
                                })}{" "}
                                {buyFiatCurrency}
                              </span>
                              <span className="text-muted-foreground">
                                → trésorerie
                              </span>
                            </div>
                          )}
                      </div>
                      <p
                        className="text-xs text-muted-foreground border-t pt-2"
                        style={{ borderColor: "oklch(0.52 0.12 160 / 0.2)" }}
                      >
                        🔒 Aucun frais ne va à une personne — tout est géré par
                        le smart contract
                      </p>
                    </div>
                  </TabsContent>

                  {/* Sell Tab */}
                  <TabsContent value="sell" className="space-y-4">
                    <div className="space-y-2">
                      <Label>Crypto à vendre</Label>
                      <Select value={sellAsset} onValueChange={setSellAsset}>
                        <SelectTrigger data-ocid="buysell.select">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="BTC">₿ Bitcoin (BTC)</SelectItem>
                          <SelectItem value="ETH">⟠ Ethereum (ETH)</SelectItem>
                          <SelectItem value="USDT">₮ Tether (USDT)</SelectItem>
                          <SelectItem value="ICP">
                            ∞ Internet Computer (ICP)
                          </SelectItem>
                          <SelectItem value="OKP">
                            <span className="flex items-center gap-1.5">
                              <OkapiIcon className="w-4 h-4 inline object-contain" />
                              Okapi Token (OKP)
                            </span>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Quantité de crypto</Label>
                      <div className="relative">
                        <Input
                          type="number"
                          placeholder="Ex: 0.001"
                          value={sellCryptoAmount}
                          onChange={(e) => setSellCryptoAmount(e.target.value)}
                          data-ocid="buysell.input"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-mono">
                          {sellAsset}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Recevoir en</Label>
                      <Select
                        value={sellFiatCurrency}
                        onValueChange={setSellFiatCurrency}
                      >
                        <SelectTrigger data-ocid="buysell.select">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CDF">
                            Franc Congolais (CDF)
                          </SelectItem>
                          <SelectItem value="USD">
                            Dollar Américain (USD)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {!identity && (
                      <div
                        className="p-3 rounded-lg text-sm"
                        style={{
                          background: "oklch(0.77 0.13 85 / 0.1)",
                          color: "oklch(0.55 0.13 75)",
                        }}
                      >
                        ⚠️ Connectez-vous pour effectuer des transactions
                      </div>
                    )}

                    <Button
                      onClick={handleSell}
                      disabled={sellCrypto.isPending || !identity}
                      className="w-full font-semibold"
                      style={{
                        background: "oklch(0.67 0.15 55)",
                        color: "white",
                      }}
                      data-ocid="buysell.secondary_button"
                    >
                      {sellCrypto.isPending ? (
                        <>
                          <Loader2 size={16} className="mr-2 animate-spin" />{" "}
                          Traitement...
                        </>
                      ) : (
                        "Confirmer la vente"
                      )}
                    </Button>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
