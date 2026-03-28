import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import {
  type AuditLogEntry,
  type FraudAlert,
  type SanctionType,
  applySanction,
  getAuditLog,
  getFraudAlerts,
  ignoreAlert,
  liftSanction,
  seedDemoFraudAlerts,
} from "../utils/fraudDetection";

// ── Helpers ───────────────────────────────────────────────────────────────────

function FraudScoreBadge({ score }: { score: number }) {
  if (score >= 75)
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/30">
        🔴 {score}
      </span>
    );
  if (score >= 50)
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
        🟠 {score}
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-green-500/20 text-green-400 border border-green-500/30">
      🟢 {score}
    </span>
  );
}

function SanctionBadge({ type }: { type: SanctionType }) {
  const map: Record<SanctionType, { label: string; cls: string }> = {
    BLOCAGE_IMMEDIAT: {
      label: "🔒 Bloqué",
      cls: "bg-red-600/20 text-red-400 border-red-500/30",
    },
    GEL_TEMPORAIRE: {
      label: "❄️ Gelé",
      cls: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    },
    BLACKLIST_GLOBALE: {
      label: "🌍 Blacklist",
      cls: "bg-purple-600/20 text-purple-400 border-purple-500/30",
    },
  };
  const { label, cls } = map[type];
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold border ${cls}`}
    >
      {label}
    </span>
  );
}

function PatternBadge({ pattern }: { pattern: string }) {
  const labels: Record<string, string> = {
    "multi-comptes": "👥 Multi-comptes",
    "litiges-frequents": "⚖️ Litiges fréquents",
    "annulations-massives": "🚫 Annulations massives",
    "ip-suspecte": "🌐 IP suspecte",
    "tentatives-echouees": "❌ Tentatives échouées",
  };
  return (
    <Badge
      variant="outline"
      className="text-xs border-teal-600/40 text-teal-300 bg-teal-900/20"
    >
      {labels[pattern] ?? pattern}
    </Badge>
  );
}

function formatTs(ts: number): string {
  return new Date(ts).toLocaleString("fr-CD", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ── Sanction Dialog ───────────────────────────────────────────────────────────

type DialogConfig = {
  alertId: string;
  userPseudo: string;
  action: "bloquer" | "geler7" | "geler30" | "blacklister" | "lever";
};

function SanctionDialog({
  config,
  onClose,
  onConfirm,
}: {
  config: DialogConfig | null;
  onClose: () => void;
  onConfirm: (motif: string) => void;
}) {
  const [motif, setMotif] = useState("");

  useEffect(() => {
    if (config) setMotif("");
  }, [config]);

  const labels: Record<string, string> = {
    bloquer: "🔒 Blocage immédiat",
    geler7: "❄️ Gel temporaire (7 jours)",
    geler30: "❄️ Gel temporaire (30 jours)",
    blacklister: "🌍 Blacklist globale",
    lever: "✅ Lever la sanction",
  };

  if (!config) return null;

  return (
    <Dialog open={!!config} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-white">
            {labels[config.action]} — {config.userPseudo}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <Label className="text-slate-300">Motif obligatoire</Label>
          <Textarea
            value={motif}
            onChange={(e) => setMotif(e.target.value)}
            placeholder="Expliquer la raison de cette décision..."
            className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-500 min-h-[80px]"
            data-ocid="fraud.textarea"
          />
        </div>
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-slate-600 text-slate-300"
            data-ocid="fraud.cancel_button"
          >
            Annuler
          </Button>
          <Button
            disabled={motif.trim().length < 5}
            onClick={() => onConfirm(motif.trim())}
            className="bg-teal-600 hover:bg-teal-500 text-white"
            data-ocid="fraud.confirm_button"
          >
            Confirmer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function AntiFraudDashboard() {
  const [alerts, setAlerts] = useState<FraudAlert[]>([]);
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([]);
  const [dialogConfig, setDialogConfig] = useState<DialogConfig | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const reload = () => {
    setAlerts(getFraudAlerts());
    setAuditLog(getAuditLog());
  };

  // eslint-disable-next-line
  useEffect(() => {
    seedDemoFraudAlerts();
    setAlerts(getFraudAlerts());
    setAuditLog(getAuditLog());
    // biome-ignore lint/correctness/useExhaustiveDependencies: intentional mount-only effect
  }, []);

  const activeAlerts = alerts.filter((a) => !a.resolved);
  const blockedAccounts = alerts.filter(
    (a) => a.sanctionType === "BLOCAGE_IMMEDIAT" && !a.resolved,
  );
  const frozenAccounts = alerts.filter(
    (a) => a.sanctionType === "GEL_TEMPORAIRE" && !a.resolved,
  );
  const blacklisted = alerts.filter(
    (a) => a.sanctionType === "BLACKLIST_GLOBALE" && !a.resolved,
  );

  const sanctionedAlerts = alerts.filter(
    (a) => a.sanctionType !== undefined && !a.resolved,
  );

  const filteredActive = activeAlerts.filter(
    (a) =>
      !a.sanctionType &&
      (searchQuery === "" ||
        a.userPseudo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.reason.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  // Group by fingerprint to detect multi-accounts
  const fpGroups: Record<string, FraudAlert[]> = {};
  for (const a of activeAlerts) {
    if (!fpGroups[a.fingerprint]) fpGroups[a.fingerprint] = [];
    fpGroups[a.fingerprint].push(a);
  }
  const multiAccountGroups = Object.values(fpGroups).filter(
    (g) => g.length > 1,
  );

  const handleConfirm = (motif: string) => {
    if (!dialogConfig) return;
    const adminId = "admin_current";

    if (dialogConfig.action === "lever") {
      liftSanction(dialogConfig.alertId, adminId, motif);
    } else if (dialogConfig.action === "bloquer") {
      applySanction(dialogConfig.alertId, "BLOCAGE_IMMEDIAT", adminId, motif);
    } else if (dialogConfig.action === "geler7") {
      applySanction(dialogConfig.alertId, "GEL_TEMPORAIRE", adminId, motif, 7);
    } else if (dialogConfig.action === "geler30") {
      applySanction(dialogConfig.alertId, "GEL_TEMPORAIRE", adminId, motif, 30);
    } else if (dialogConfig.action === "blacklister") {
      applySanction(dialogConfig.alertId, "BLACKLIST_GLOBALE", adminId, motif);
    }

    setDialogConfig(null);
    reload();
  };

  const handleIgnore = (alertId: string) => {
    ignoreAlert(alertId, "admin_current");
    reload();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
      data-ocid="fraud.panel"
    >
      {/* ── Stats ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon="🚨"
          label="Alertes actives"
          value={activeAlerts.length}
          color="oklch(0.55 0.22 25)"
          ocid="fraud.card"
        />
        <StatCard
          icon="🔒"
          label="Comptes bloqués"
          value={blockedAccounts.length}
          color="oklch(0.52 0.18 280)"
          ocid="fraud.card"
        />
        <StatCard
          icon="❄️"
          label="Comptes gelés"
          value={frozenAccounts.length}
          color="oklch(0.58 0.15 220)"
          ocid="fraud.card"
        />
        <StatCard
          icon="🌍"
          label="Blacklist globale"
          value={blacklisted.length}
          color="oklch(0.52 0.12 160)"
          ocid="fraud.card"
        />
      </div>

      {/* ── Multi-comptes highlight ─────────────────────────────────────── */}
      {multiAccountGroups.length > 0 && (
        <div className="rounded-xl border border-red-500/30 bg-red-900/10 p-4">
          <h3 className="text-red-400 font-semibold flex items-center gap-2 mb-3">
            <span>👥</span> Détection Multi-comptes — Même Device
          </h3>
          <div className="space-y-2">
            {multiAccountGroups.map((group) => (
              <div
                key={group[0].fingerprint}
                className="flex flex-wrap items-center gap-2 text-sm text-slate-300"
              >
                <span className="text-slate-500 text-xs font-mono">
                  {group[0].fingerprint.slice(0, 12)}...
                </span>
                <span className="text-red-400">→</span>
                {group.map((a) => (
                  <span
                    key={a.id}
                    className="px-2 py-0.5 rounded bg-red-800/30 text-red-300 text-xs font-medium"
                  >
                    {a.userPseudo}
                  </span>
                ))}
                <span className="text-slate-500">
                  ({group.length} comptes, même device)
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Tabs ───────────────────────────────────────────────────────── */}
      <Tabs defaultValue="detections">
        <TabsList className="bg-slate-800 border border-slate-700">
          <TabsTrigger
            value="detections"
            className="data-[state=active]:bg-teal-600 data-[state=active]:text-white text-slate-400"
            data-ocid="fraud.tab"
          >
            🔍 Détections ({filteredActive.length})
          </TabsTrigger>
          <TabsTrigger
            value="sanctions"
            className="data-[state=active]:bg-teal-600 data-[state=active]:text-white text-slate-400"
            data-ocid="fraud.tab"
          >
            ⚖️ Sanctions ({sanctionedAlerts.length})
          </TabsTrigger>
          <TabsTrigger
            value="audit"
            className="data-[state=active]:bg-teal-600 data-[state=active]:text-white text-slate-400"
            data-ocid="fraud.tab"
          >
            📋 Journal d'audit ({auditLog.length})
          </TabsTrigger>
        </TabsList>

        {/* ── Tab: Détections ──────────────────────────────────────────── */}
        <TabsContent value="detections" data-ocid="fraud.section">
          <div className="mb-3">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par utilisateur ou raison..."
              className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-500 max-w-sm"
              data-ocid="fraud.search_input"
            />
          </div>
          {filteredActive.length === 0 ? (
            <div
              className="py-12 text-center text-slate-500"
              data-ocid="fraud.empty_state"
            >
              Aucune alerte active
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-700">
              <Table data-ocid="fraud.table">
                <TableHeader>
                  <TableRow className="border-slate-700 hover:bg-transparent">
                    <TableHead className="text-slate-400">
                      Utilisateur
                    </TableHead>
                    <TableHead className="text-slate-400">Score</TableHead>
                    <TableHead className="text-slate-400">Raisons</TableHead>
                    <TableHead className="text-slate-400">
                      Fingerprint
                    </TableHead>
                    <TableHead className="text-slate-400">IP</TableHead>
                    <TableHead className="text-slate-400">Détecté le</TableHead>
                    <TableHead className="text-slate-400">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredActive.map((alert, i) => (
                    <TableRow
                      key={alert.id}
                      className="border-slate-700 hover:bg-slate-800/50"
                      data-ocid={`fraud.row.item.${i + 1}`}
                    >
                      <TableCell className="text-white font-medium">
                        {alert.userPseudo}
                      </TableCell>
                      <TableCell>
                        <FraudScoreBadge score={alert.fraudScore} />
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {alert.patterns.map((p) => (
                            <PatternBadge key={p} pattern={p} />
                          ))}
                        </div>
                        <p className="text-slate-400 text-xs mt-1 max-w-xs line-clamp-2">
                          {alert.reason}
                        </p>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-slate-500">
                        {alert.fingerprint.slice(0, 10)}...
                      </TableCell>
                      <TableCell className="text-slate-400 text-xs">
                        {alert.ipSimulated}
                      </TableCell>
                      <TableCell className="text-slate-400 text-xs">
                        {formatTs(alert.detectedAt)}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          <Button
                            size="sm"
                            onClick={() =>
                              setDialogConfig({
                                alertId: alert.id,
                                userPseudo: alert.userPseudo,
                                action: "bloquer",
                              })
                            }
                            className="bg-red-700/40 hover:bg-red-700/70 text-red-300 text-xs h-7 px-2"
                            data-ocid="fraud.primary_button"
                          >
                            🔒 Bloquer
                          </Button>
                          <Button
                            size="sm"
                            onClick={() =>
                              setDialogConfig({
                                alertId: alert.id,
                                userPseudo: alert.userPseudo,
                                action: "geler7",
                              })
                            }
                            className="bg-blue-700/40 hover:bg-blue-700/70 text-blue-300 text-xs h-7 px-2"
                            data-ocid="fraud.secondary_button"
                          >
                            ❄️ Geler 7j
                          </Button>
                          <Button
                            size="sm"
                            onClick={() =>
                              setDialogConfig({
                                alertId: alert.id,
                                userPseudo: alert.userPseudo,
                                action: "geler30",
                              })
                            }
                            className="bg-blue-800/40 hover:bg-blue-800/70 text-blue-300 text-xs h-7 px-2"
                            data-ocid="fraud.secondary_button"
                          >
                            ❄️ Geler 30j
                          </Button>
                          <Button
                            size="sm"
                            onClick={() =>
                              setDialogConfig({
                                alertId: alert.id,
                                userPseudo: alert.userPseudo,
                                action: "blacklister",
                              })
                            }
                            className="bg-purple-700/40 hover:bg-purple-700/70 text-purple-300 text-xs h-7 px-2"
                            data-ocid="fraud.delete_button"
                          >
                            🌍 Blacklist
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleIgnore(alert.id)}
                            className="text-slate-500 hover:text-slate-300 text-xs h-7 px-2"
                            data-ocid="fraud.secondary_button"
                          >
                            ✗ Ignorer
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        {/* ── Tab: Sanctions ───────────────────────────────────────────── */}
        <TabsContent value="sanctions" data-ocid="fraud.section">
          {sanctionedAlerts.length === 0 ? (
            <div
              className="py-12 text-center text-slate-500"
              data-ocid="fraud.empty_state"
            >
              Aucun compte sanctionné
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-700">
              <Table data-ocid="fraud.table">
                <TableHeader>
                  <TableRow className="border-slate-700 hover:bg-transparent">
                    <TableHead className="text-slate-400">
                      Utilisateur
                    </TableHead>
                    <TableHead className="text-slate-400">Type</TableHead>
                    <TableHead className="text-slate-400">
                      Date sanction
                    </TableHead>
                    <TableHead className="text-slate-400">Expiry</TableHead>
                    <TableHead className="text-slate-400">Motif</TableHead>
                    <TableHead className="text-slate-400">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sanctionedAlerts.map((alert, i) => (
                    <TableRow
                      key={alert.id}
                      className="border-slate-700 hover:bg-slate-800/50"
                      data-ocid={`fraud.sanctions.item.${i + 1}`}
                    >
                      <TableCell className="text-white font-medium">
                        {alert.userPseudo}
                      </TableCell>
                      <TableCell>
                        {alert.sanctionType && (
                          <SanctionBadge type={alert.sanctionType} />
                        )}
                      </TableCell>
                      <TableCell className="text-slate-400 text-xs">
                        {formatTs(alert.detectedAt)}
                      </TableCell>
                      <TableCell className="text-xs">
                        {alert.sanctionExpiry ? (
                          <span className="text-amber-400">
                            {formatTs(alert.sanctionExpiry)}
                          </span>
                        ) : (
                          <span className="text-slate-600">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-slate-400 text-xs max-w-xs line-clamp-2">
                        {alert.reason}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          onClick={() =>
                            setDialogConfig({
                              alertId: alert.id,
                              userPseudo: alert.userPseudo,
                              action: "lever",
                            })
                          }
                          className="bg-teal-700/40 hover:bg-teal-600/60 text-teal-300 text-xs h-7 px-2"
                          data-ocid="fraud.edit_button"
                        >
                          ✅ Lever
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        {/* ── Tab: Journal d'audit ─────────────────────────────────────── */}
        <TabsContent value="audit" data-ocid="fraud.section">
          {auditLog.length === 0 ? (
            <div
              className="py-12 text-center text-slate-500"
              data-ocid="fraud.empty_state"
            >
              Journal vide — les actions admin apparaissent ici
            </div>
          ) : (
            <div className="space-y-2">
              {[...auditLog].reverse().map((entry, i) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/60 border border-slate-700"
                  data-ocid={`fraud.audit.item.${i + 1}`}
                >
                  <div className="min-w-[140px] text-xs text-slate-500">
                    {formatTs(entry.timestamp)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-white text-sm font-medium">
                        {entry.action}
                      </span>
                      <span className="text-teal-400 text-xs">
                        → {entry.targetUserId.slice(0, 12)}...
                      </span>
                      {entry.sanctionType && (
                        <SanctionBadge type={entry.sanctionType} />
                      )}
                    </div>
                    <p className="text-slate-400 text-xs mt-0.5">
                      {entry.motif}
                    </p>
                  </div>
                  <div className="text-xs text-slate-600">{entry.adminId}</div>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <SanctionDialog
        config={dialogConfig}
        onClose={() => setDialogConfig(null)}
        onConfirm={handleConfirm}
      />
    </motion.div>
  );
}

// ── Stat Card ─────────────────────────────────────────────────────────────────

function StatCard({
  icon,
  label,
  value,
  color,
  ocid,
}: {
  icon: string;
  label: string;
  value: number;
  color: string;
  ocid: string;
}) {
  return (
    <Card
      className="bg-slate-800/60 border-slate-700 overflow-hidden"
      data-ocid={ocid}
    >
      <CardHeader className="pb-2 pt-4 px-4">
        <CardTitle className="text-slate-400 text-xs font-medium flex items-center gap-2">
          <span className="text-lg">{icon}</span>
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <div className="text-3xl font-bold" style={{ color }}>
          {value}
        </div>
      </CardContent>
    </Card>
  );
}
