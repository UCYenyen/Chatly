"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Plus, X, UserX, Loader2 } from "lucide-react";
import { useContactIgnoreList } from "@/hooks/use-contact-ignore-list";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { RecentChatterDTO } from "@/types/ignore-list.md";

interface WhatsappIgnoreListProps {
  businessId: string;
}

const addContactSchema = z.object({
  phoneNumber: z
    .string()
    .min(8, "Nomor telepon terlalu pendek")
    .regex(/[0-9]/, "Masukkan nomor telepon yang valid"),
});

type AddContactValues = z.infer<typeof addContactSchema>;

function formatLastChat(iso: string): string {
  const then = new Date(iso).getTime();
  const diffDays = Math.floor((Date.now() - then) / (1000 * 60 * 60 * 24));
  if (diffDays <= 0) return "hari ini";
  if (diffDays === 1) return "kemarin";
  return `${diffDays} hari lalu`;
}

export function WhatsappIgnoreList({ businessId }: WhatsappIgnoreListProps) {
  const {
    ignoreList,
    recentChatters,
    isLoading,
    error,
    addContact,
    removeContact,
  } = useContactIgnoreList(businessId);

  const form = useForm<AddContactValues>({
    resolver: zodResolver(addContactSchema),
    defaultValues: { phoneNumber: "" },
  });

  const onAdd = async (values: AddContactValues) => {
    try {
      await addContact(values.phoneNumber);
      toast.success(`${values.phoneNumber} ditambahkan ke daftar abaikan`);
      form.reset();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menambahkan kontak");
    }
  };

  const onIgnoreChatter = async (chatter: RecentChatterDTO) => {
    try {
      await addContact(chatter.phoneNumber);
      toast.success(`${chatter.phoneNumber} diabaikan`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal mengabaikan kontak");
    }
  };

  const onRemove = async (phoneNumber: string) => {
    try {
      await removeContact(phoneNumber);
      toast.success(`${phoneNumber} dihapus dari daftar abaikan`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menghapus kontak");
    }
  };

  const visibleChatters = recentChatters.filter((chatter) => !chatter.isIgnored);

  return (
    <Card className="bg-surface-container-low border-outline-variant/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-on-surface">
          <UserX className="w-5 h-5" />
          Kontak yang Diabaikan
        </CardTitle>
        <CardDescription>
          Bot tidak akan membalas pesan dari kontak ini. Pengaturan tersimpan
          per bisnis dan tetap berlaku sampai Anda menghapusnya.
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-6">
        <form
          onSubmit={form.handleSubmit(onAdd)}
          className="flex flex-col gap-2"
        >
          <div className="flex gap-2">
            <Input
              placeholder="Tambah nomor untuk diabaikan, mis. 0812..."
              disabled={form.formState.isSubmitting}
              {...form.register("phoneNumber")}
            />
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              Tambah
            </Button>
          </div>
          {form.formState.errors.phoneNumber && (
            <p className="text-sm text-error">
              {form.formState.errors.phoneNumber.message}
            </p>
          )}
        </form>

        {error && <p className="text-sm text-error">{error}</p>}

        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-on-surface">
            Daftar abaikan ({ignoreList.length})
          </p>
          {isLoading ? (
            <div className="flex items-center gap-2 text-sm text-outline">
              <Loader2 className="w-4 h-4 animate-spin" /> Memuat...
            </div>
          ) : ignoreList.length === 0 ? (
            <p className="text-sm text-outline">Belum ada kontak yang diabaikan.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {ignoreList.map((contact) => (
                <li
                  key={contact.id}
                  className="flex items-center justify-between rounded-lg border border-outline-variant/30 bg-surface-container px-3 py-2"
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-on-surface">
                      {contact.label ?? contact.phoneNumber}
                    </span>
                    {contact.label && (
                      <span className="text-xs text-outline">
                        {contact.phoneNumber}
                      </span>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Hapus ${contact.phoneNumber} dari daftar abaikan`}
                    onClick={() => onRemove(contact.phoneNumber)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {visibleChatters.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium text-on-surface">
              Kontak yang pernah chat
            </p>
            <ul className="flex flex-col gap-2">
              {visibleChatters.map((chatter) => (
                <li
                  key={chatter.phoneNumber}
                  className="flex items-center justify-between rounded-lg border border-outline-variant/30 bg-surface-container px-3 py-2"
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-on-surface">
                      {chatter.phoneNumber}
                    </span>
                    <span className="text-xs text-outline">
                      chat terakhir {formatLastChat(chatter.lastMessageAt)}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onIgnoreChatter(chatter)}
                  >
                    <UserX className="w-4 h-4" />
                    Abaikan
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
