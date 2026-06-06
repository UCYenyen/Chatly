"use client";

import { useState } from "react";
import { BellRing, CheckCircle2, MonitorSmartphone, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type EnableState =
  | "unsupported"
  | "idle"
  | "working"
  | "enabled"
  | "denied"
  | "error";

function pushSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

interface EnableAlertsClientProps {
  token: string;
  vapidPublicKey: string;
  businessName: string;
}

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(new ArrayBuffer(rawData.length));
  for (let i = 0; i < rawData.length; i += 1) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function EnableAlertsClient({
  token,
  vapidPublicKey,
  businessName,
}: EnableAlertsClientProps) {
  const [state, setState] = useState<EnableState>("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");

  async function enableAlerts(): Promise<void> {
    if (!pushSupported()) {
      setState("unsupported");
      return;
    }
    setState("working");
    setErrorMessage("");
    try {
      const registration = await navigator.serviceWorker.register(
        "/notify-sw.js",
      );
      await navigator.serviceWorker.ready;

      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setState("denied");
        return;
      }

      const existing = await registration.pushManager.getSubscription();
      const subscription =
        existing ??
        (await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
        }));

      const response = await fetch("/api/notify/register", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          token,
          subscription: subscription.toJSON(),
          userAgent: navigator.userAgent,
        }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as
          | { message?: string }
          | null;
        setErrorMessage(data?.message ?? "Gagal mendaftarkan perangkat.");
        setState("error");
        return;
      }

      setState("enabled");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Terjadi kesalahan.",
      );
      setState("error");
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
          <BellRing className="size-6 text-primary" />
        </div>
        <CardTitle>Notifikasi handover {businessName}</CardTitle>
        <CardDescription>
          Aktifkan notifikasi agar kamu langsung diberi tahu saat ada pelanggan
          yang perlu dibalas oleh manusia.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Alert>
          <MonitorSmartphone />
          <AlertTitle>Aktifkan di browser yang sama dengan WhatsApp Web</AlertTitle>
          <AlertDescription>
            Saat notifikasi diketuk, kamu akan diarahkan ke chat pelanggan di
            WhatsApp Web bisnis. Pastikan kamu mengaktifkan ini di browser dan
            perangkat tempat kamu membuka WhatsApp Web bisnis.
          </AlertDescription>
        </Alert>

        {state === "enabled" ? (
          <Alert>
            <CheckCircle2 />
            <AlertTitle>Notifikasi aktif</AlertTitle>
            <AlertDescription>
              Perangkat ini sudah terdaftar. Kamu bisa menutup halaman ini.
              Ulangi langkah ini di browser lain untuk menambah perangkat.
            </AlertDescription>
          </Alert>
        ) : null}

        {state === "denied" ? (
          <Alert variant="destructive">
            <TriangleAlert />
            <AlertTitle>Izin notifikasi diblokir</AlertTitle>
            <AlertDescription>
              Aktifkan izin notifikasi untuk situs ini di pengaturan browser,
              lalu muat ulang halaman.
            </AlertDescription>
          </Alert>
        ) : null}

        {state === "unsupported" ? (
          <Alert variant="destructive">
            <TriangleAlert />
            <AlertTitle>Browser tidak mendukung</AlertTitle>
            <AlertDescription>
              Browser ini tidak mendukung web push. Gunakan Chrome, Edge, atau
              Firefox versi terbaru di desktop.
            </AlertDescription>
          </Alert>
        ) : null}

        {state === "error" ? (
          <Alert variant="destructive">
            <TriangleAlert />
            <AlertTitle>Gagal mengaktifkan</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        ) : null}

        {state === "idle" || state === "working" || state === "error" ? (
          <Button
            onClick={enableAlerts}
            disabled={state === "working"}
            className="w-full"
          >
            {state === "working" ? "Mengaktifkan…" : "Aktifkan notifikasi"}
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
