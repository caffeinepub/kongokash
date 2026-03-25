import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useUpdateProfile } from "../hooks/useQueries";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  defaultTab: "login" | "register";
}

export default function AuthModal({
  open,
  onClose,
  defaultTab,
}: AuthModalProps) {
  const { login, isLoggingIn, identity } = useInternetIdentity();
  const updateProfile = useUpdateProfile();
  const [displayName, setDisplayName] = useState("");
  const [preferredCurrency, setPreferredCurrency] = useState("CDF");

  const handleLogin = async () => {
    try {
      await login();
      toast.success("Connexion réussie!");
      onClose();
    } catch {
      toast.error("Erreur de connexion");
    }
  };

  const handleRegister = async () => {
    if (!displayName.trim()) {
      toast.error("Veuillez entrer votre nom");
      return;
    }
    try {
      await login();
      await updateProfile.mutateAsync({
        displayName,
        country: "CD",
        preferredCurrency,
      });
      toast.success("Compte créé avec succès!");
      onClose();
    } catch {
      toast.error("Erreur lors de la création du compte");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md" data-ocid="auth.dialog">
        <DialogHeader>
          <DialogTitle className="font-display text-xl flex items-center gap-2">
            <img
              src="/assets/generated/kongokash-logo-transparent.dim_600x200.png"
              alt="KongoKash"
              className="h-7 w-auto"
            />
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue={defaultTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login" data-ocid="auth.tab">
              Connexion
            </TabsTrigger>
            <TabsTrigger value="register" data-ocid="auth.tab">
              S'inscrire
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="space-y-4 mt-4">
            <p className="text-sm text-muted-foreground">
              Connectez-vous avec Internet Identity pour accéder à votre compte
              KongoKash de façon sécurisée.
            </p>
            {identity ? (
              <div className="p-3 rounded-lg bg-hero-green/10 text-hero-green text-sm font-medium">
                ✓ Déjà connecté!
              </div>
            ) : (
              <Button
                onClick={handleLogin}
                disabled={isLoggingIn}
                className="w-full"
                style={{ background: "oklch(0.27 0.07 195)" }}
                data-ocid="auth.submit_button"
              >
                {isLoggingIn && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isLoggingIn ? "Connexion en cours..." : "Se connecter"}
              </Button>
            )}
          </TabsContent>

          <TabsContent value="register" className="space-y-4 mt-4">
            <p className="text-sm text-muted-foreground">
              Créez votre compte pour acheter et vendre des cryptos en CDF ou
              USD.
            </p>
            <div className="space-y-2">
              <Label htmlFor="displayName">Votre prénom / surnom</Label>
              <Input
                id="displayName"
                placeholder="Ex: Thierry Kabila"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                data-ocid="auth.input"
              />
            </div>
            <div className="space-y-2">
              <Label>Devise préférée</Label>
              <Select
                value={preferredCurrency}
                onValueChange={setPreferredCurrency}
              >
                <SelectTrigger data-ocid="auth.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CDF">Franc Congolais (CDF)</SelectItem>
                  <SelectItem value="USD">Dollar Américain (USD)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleRegister}
              disabled={isLoggingIn || updateProfile.isPending}
              className="w-full"
              style={{ background: "oklch(0.52 0.12 160)" }}
              data-ocid="auth.submit_button"
            >
              {(isLoggingIn || updateProfile.isPending) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isLoggingIn || updateProfile.isPending
                ? "Création..."
                : "Créer mon compte"}
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
