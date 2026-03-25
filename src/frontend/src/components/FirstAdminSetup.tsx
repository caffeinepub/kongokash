import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useQueryClient } from "@tanstack/react-query";
import { AlertCircle, Loader2, Shield } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export default function FirstAdminSetup() {
  const { identity, login, loginStatus } = useInternetIdentity();
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const [isPending, setIsPending] = useState(false);
  const isLoggingIn = loginStatus === "logging-in";

  const handleClaim = async () => {
    if (!actor) return;
    setIsPending(true);
    try {
      await (actor as any).claimFirstAdmin();
      await queryClient.invalidateQueries({ queryKey: ["isAdminAssigned"] });
      await queryClient.invalidateQueries({ queryKey: ["isCallerAdmin"] });
      toast.success("Vous êtes maintenant administrateur !");
    } catch {
      toast.error("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary mb-4">
            <Shield className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">
            KongoKash
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Plateforme d&apos;échange crypto
          </p>
        </div>

        <Card className="border-border shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl text-foreground flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Configuration initiale
            </CardTitle>
            <CardDescription className="leading-relaxed">
              Aucun administrateur n&apos;a encore été désigné. Connectez-vous
              et cliquez ci-dessous pour devenir le premier administrateur de
              KongoKash.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {!identity ? (
              <>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted">
                  <AlertCircle className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                  <p className="text-sm text-muted-foreground">
                    Veuillez vous connecter avec Internet Identity pour
                    continuer.
                  </p>
                </div>
                <Button
                  className="w-full"
                  onClick={login}
                  disabled={isLoggingIn}
                  data-ocid="first_admin.primary_button"
                >
                  {isLoggingIn ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Connexion...
                    </>
                  ) : (
                    "Se connecter avec Internet Identity"
                  )}
                </Button>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/10 border border-primary/20">
                  <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                  <p className="text-sm text-foreground">
                    Connecté en tant que :{" "}
                    <span className="font-mono text-xs text-muted-foreground">
                      {identity.getPrincipal().toString().slice(0, 16)}...
                    </span>
                  </p>
                </div>

                <Button
                  className="w-full font-semibold"
                  onClick={handleClaim}
                  disabled={isPending}
                  data-ocid="first_admin.submit_button"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Attribution en cours...
                    </>
                  ) : (
                    <>
                      <Shield className="mr-2 h-4 w-4" />
                      Devenir administrateur
                    </>
                  )}
                </Button>

                {isPending && (
                  <p
                    className="text-center text-xs text-muted-foreground"
                    data-ocid="first_admin.loading_state"
                  >
                    Enregistrement sur la blockchain...
                  </p>
                )}
              </>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Cette option sera automatiquement désactivée après attribution.
        </p>
      </motion.div>
    </div>
  );
}
