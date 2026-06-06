import prisma from "@/lib/utils/prisma";
import { getVapidPublicKey } from "@/lib/utils/notifications/web-push";
import { EnableAlertsClient } from "@/components/features/notifications/EnableAlertsClient";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface PageProps {
  params: Promise<{ token: string }>;
}

export default async function NotifyRegisterPage({ params }: PageProps) {
  const { token } = await params;
  const vapidPublicKey = getVapidPublicKey();

  const admin = await prisma.notificationAdmin.findFirst({
    where: { inviteToken: token, status: "ACTIVE" },
    select: { id: true, business: { select: { name: true } } },
  });

  return (
    <main className="flex min-h-svh items-center justify-center bg-background p-6">
      {!admin || !vapidPublicKey ? (
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Undangan tidak berlaku</CardTitle>
            <CardDescription>
              {!vapidPublicKey
                ? "Notifikasi belum dikonfigurasi pada server ini."
                : "Link undangan ini sudah tidak valid atau telah dicabut oleh pemilik bisnis."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Hubungi pemilik bisnis untuk mendapatkan link undangan baru.
            </p>
          </CardContent>
        </Card>
      ) : (
        <EnableAlertsClient
          token={token}
          vapidPublicKey={vapidPublicKey}
          businessName={admin.business.name}
        />
      )}
    </main>
  );
}
