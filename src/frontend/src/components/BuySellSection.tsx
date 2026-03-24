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
import { CheckCircle, Loader2, XCircle } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useBuyCrypto, useSellCrypto } from "../hooks/useQueries";

export default function BuySellSection() {
  const { identity } = useInternetIdentity();
  const buyCrypto = useBuyCrypto();
  const sellCrypto = useSellCrypto();

  const [buyAsset, setBuyAsset] = useState("BTC");
  const [buyFiatAmount, setBuyFiatAmount] = useState("");
  const [buyFiatCurrency, setBuyFiatCurrency] = useState("CDF");
  const [buyPaymentMethod, setBuyPaymentMethod] = useState("mpesa");

  const [sellAsset, setSellAsset] = useState("BTC");
  const [sellCryptoAmount, setSellCryptoAmount] = useState("");
  const [sellFiatCurrency, setSellFiatCurrency] = useState("CDF");

  const handleBuy = async () => {
    if (!identity) {
      toast.error("Veuillez vous connecter d'abord");
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
              avec vos Francs Congolais ou vos Dollars sans intermédiaire
              coûteux. Paiement via M-Pesa, Airtel Money ou virement bancaire.
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
                  icon: "💰",
                  title: "Peu de frais",
                  desc: "Seulement 0.5% par transaction",
                },
                {
                  icon: "📱",
                  title: "Mobile",
                  desc: "Disponible sur tous les appareils",
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
            </div>

            {/* Floating crypto icons for visual */}
            <div className="flex gap-4 flex-wrap">
              {["₿ Bitcoin", "⟠ Ethereum", "₮ USDT"].map((c) => (
                <span
                  key={c}
                  className="px-4 py-2 rounded-full text-sm font-semibold text-white"
                  style={{ background: "oklch(0.27 0.07 195)" }}
                >
                  {c}
                </span>
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

                    <div className="space-y-2">
                      <Label>Méthode de paiement</Label>
                      <Select
                        value={buyPaymentMethod}
                        onValueChange={setBuyPaymentMethod}
                      >
                        <SelectTrigger data-ocid="buysell.select">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mpesa">📱 M-Pesa</SelectItem>
                          <SelectItem value="airtel">
                            📱 Airtel Money
                          </SelectItem>
                          <SelectItem value="bank">
                            🏦 Virement Bancaire
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
                      onClick={handleBuy}
                      disabled={buyCrypto.isPending || !identity}
                      className="w-full font-semibold"
                      style={{
                        background: "oklch(0.52 0.12 160)",
                        color: "white",
                      }}
                      data-ocid="buysell.primary_button"
                    >
                      {buyCrypto.isPending ? (
                        <>
                          <Loader2 size={16} className="mr-2 animate-spin" />{" "}
                          Traitement...
                        </>
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
                    {buyCrypto.isSuccess && (
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
