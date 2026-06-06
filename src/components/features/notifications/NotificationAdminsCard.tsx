"use client";

import { useState } from "react";
import { BellRing, Copy, Lock, Send, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useBusinessContext } from "@/components/features/business/BusinessProvider";
import { useNotificationAdmins, usePlanGate } from "@/hooks";
import { formatLimit } from "@/lib/utils/payment-gateway/plan-limits";
import { FeatureHelpButton } from "@/components/features/feature-unlock/FeatureHelpButton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { NotificationAdminDTO } from "@/types/notifications.md";

function planLabel(plan: string | null): string {
  if (!plan) return "lebih tinggi";
  return plan.charAt(0) + plan.slice(1).toLowerCase();
}

export function NotificationAdminsCard() {
  const { activeBusinessId } = useBusinessContext();
  const plan = usePlanGate();
  const { admins, isLoading, addAdmin, revokeAdmin, testAdmin } =
    useNotificationAdmins(activeBusinessId);

  const [label, setLabel] = useState("");
  const [adding, setAdding] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [testingId, setTestingId] = useState<string | null>(null);

  const locked = !plan.isLoading && !plan.hasFeature("adminNotification");
  const seatLimit = plan.numericLimit("adminSeats");
  const atLimit =
    !plan.isLoading && !plan.canAddMore("adminSeats", admins.length);

  const handleAdd = async () => {
    const trimmed = label.trim();
    if (trimmed.length < 2) {
      toast.error("Nama admin minimal 2 karakter");
      return;
    }
    setAdding(true);
    try {
      await addAdmin(trimmed);
      toast.success("Admin notifikasi ditambahkan");
      setLabel("");
      setDialogOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Gagal menambahkan admin",
      );
    } finally {
      setAdding(false);
    }
  };

  const handleCopy = async (admin: NotificationAdminDTO) => {
    try {
      await navigator.clipboard.writeText(admin.inviteUrl);
      toast.success("Link undangan disalin");
    } catch {
      toast.error("Gagal menyalin link");
    }
  };

  const handleTest = async (admin: NotificationAdminDTO) => {
    setTestingId(admin.id);
    try {
      const result = await testAdmin(admin.id);
      if (result.delivered > 0) {
        toast.success(
          `Notifikasi uji terkirim ke ${result.delivered} perangkat`,
        );
      } else {
        toast.error(
          "Tidak ada perangkat yang menerima. Perangkat mungkin kedaluwarsa.",
        );
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Gagal mengirim notifikasi uji",
      );
    } finally {
      setTestingId(null);
    }
  };

  const handleRevoke = async (admin: NotificationAdminDTO) => {
    try {
      await revokeAdmin(admin.id);
      toast.success(`${admin.label} dicabut`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Gagal mencabut admin",
      );
    }
  };

  return (
    <Card data-tour="notification-admins">
      <CardHeader>
        <div className="flex items-center gap-2">
          <BellRing className="size-5 text-primary" />
          <CardTitle>Admin notifikasi handover</CardTitle>
          <div className="ml-auto">
            <FeatureHelpButton topic="adminNotification" />
          </div>
        </div>
        <CardDescription>
          Tambahkan orang yang menerima notifikasi web saat percakapan dialihkan
          dari AI ke manusia. Notifikasi dibagikan secara adil dan dialihkan
          otomatis bila tidak ditanggapi.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {locked ? (
          <div className="flex items-start gap-3 rounded-lg border border-outline-variant bg-surface-container-low p-4">
            <Lock className="mt-0.5 size-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Fitur ini tersedia mulai paket{" "}
              {planLabel(plan.requiredPlanForFeature("adminNotification"))}.
              Upgrade paket untuk menambahkan admin notifikasi.
            </p>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="w-fit">
                {admins.length} / {formatLimit(seatLimit)} admin
              </Badge>
              {atLimit && (
                <span className="text-xs text-muted-foreground">
                  Batas admin paket tercapai. Upgrade untuk menambah lebih
                  banyak.
                </span>
              )}
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-fit" disabled={atLimit}>
                  Tambah admin
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Tambah admin notifikasi</DialogTitle>
                  <DialogDescription>
                    Beri nama admin, lalu bagikan link undangan kepadanya. Ia
                    membuka link itu di browser yang sama dengan WhatsApp Web
                    bisnis untuk mengaktifkan notifikasi.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="notification-admin-label">Nama admin</Label>
                  <Input
                    id="notification-admin-label"
                    value={label}
                    onChange={(event) => setLabel(event.target.value)}
                    placeholder="cth. Sari (CS pagi)"
                    maxLength={60}
                  />
                </div>
                <DialogFooter>
                  <Button onClick={handleAdd} disabled={adding}>
                    {adding ? "Menambahkan…" : "Tambah & buat link"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {isLoading ? (
              <p className="text-sm text-muted-foreground">Memuat…</p>
            ) : admins.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Belum ada admin notifikasi.
              </p>
            ) : (
              <ul className="flex flex-col divide-y divide-outline-variant">
                {admins.map((admin) => (
                  <li
                    key={admin.id}
                    className="flex items-center justify-between gap-3 py-3"
                  >
                    <div className="flex min-w-0 flex-col gap-1">
                      <span className="truncate text-sm font-medium text-on-surface">
                        {admin.label}
                      </span>
                      <Badge
                        variant={admin.deviceCount > 0 ? "default" : "outline"}
                        className="w-fit"
                      >
                        {admin.deviceCount > 0
                          ? `${admin.deviceCount} perangkat aktif`
                          : "Belum mendaftar"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTest(admin)}
                        disabled={
                          admin.deviceCount === 0 || testingId === admin.id
                        }
                      >
                        <Send className="size-4" />
                        {testingId === admin.id ? "Mengirim…" : "Tes"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopy(admin)}
                      >
                        <Copy className="size-4" />
                        Salin link
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`Cabut ${admin.label}`}
                          >
                            <Trash2 className="size-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Cabut {admin.label}?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Link undangan dinonaktifkan dan semua perangkatnya
                              berhenti menerima notifikasi. Tindakan ini tidak
                              bisa dibatalkan.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Batal</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleRevoke(admin)}
                            >
                              Cabut
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
