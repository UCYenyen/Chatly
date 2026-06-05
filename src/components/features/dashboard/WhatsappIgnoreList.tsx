"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Plus, X, UserX, Loader2, ChevronsUpDown } from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

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

export function WhatsappIgnoreList({ businessId }: WhatsappIgnoreListProps) {
  const {
    ignoreList,
    ignoreAll,
    setIgnoreAll,
    contacts,
    isContactsLoading,
    contactsError,
    loadContacts,
    isLoading,
    error,
    addContact,
    removeContact,
  } = useContactIgnoreList(businessId);

  const [pickerOpen, setPickerOpen] = useState(false);

  const form = useForm<AddContactValues>({
    resolver: zodResolver(addContactSchema),
    defaultValues: { phoneNumber: "" },
  });

  const ignoredSet = new Set(ignoreList.map((c) => c.phoneNumber));

  const onAdd = async (values: AddContactValues) => {
    try {
      await addContact(values.phoneNumber);
      toast.success(`${values.phoneNumber} ditambahkan ke daftar abaikan`);
      form.reset();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menambahkan kontak");
    }
  };

  const onPickContact = async (phoneNumber: string, name: string | null) => {
    setPickerOpen(false);
    try {
      await addContact(phoneNumber, name ?? undefined);
      toast.success(`${name ?? phoneNumber} diabaikan`);
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

  const handlePickerOpenChange = (open: boolean) => {
    setPickerOpen(open);
    if (open) void loadContacts();
  };

  const onToggleIgnoreAll = async (checked: boolean) => {
    try {
      await setIgnoreAll(checked);
      toast.success(
        checked
          ? "Bot dijeda — semua pesan masuk akan diabaikan"
          : "Bot aktif kembali"
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal memperbarui pengaturan");
    }
  };

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
        <div className="flex items-start gap-3 rounded-lg border border-outline-variant/30 bg-surface-container px-3 py-3">
          <Checkbox
            id="ignore-all"
            checked={ignoreAll}
            onCheckedChange={(checked) => onToggleIgnoreAll(checked === true)}
            className="mt-0.5"
          />
          <div className="flex flex-col gap-0.5">
            <Label htmlFor="ignore-all" className="text-on-surface">
              Abaikan semua pesan masuk
            </Label>
            <p className="text-xs text-outline">
              Jeda bot untuk semua kontak. Saat aktif, bot tidak membalas
              siapa pun dan pengaturan ini mengabaikan daftar di bawah.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Popover open={pickerOpen} onOpenChange={handlePickerOpenChange}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={pickerOpen}
                className="w-full justify-between"
              >
                Pilih dari kontak WhatsApp
                <ChevronsUpDown className="w-4 h-4 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-(--radix-popover-trigger-width) p-0"
              align="start"
            >
              <Command>
                <CommandInput placeholder="Cari nama atau nomor..." />
                <CommandList>
                  {isContactsLoading ? (
                    <div className="flex items-center gap-2 px-3 py-4 text-sm text-outline">
                      <Loader2 className="w-4 h-4 animate-spin" /> Memuat kontak...
                    </div>
                  ) : contactsError ? (
                    <div className="px-3 py-4 text-sm text-error">
                      {contactsError}
                    </div>
                  ) : (
                    <>
                      <CommandEmpty>Tidak ada kontak ditemukan.</CommandEmpty>
                      {contacts
                        .filter((c) => !ignoredSet.has(c.phoneNumber))
                        .map((contact) => (
                          <CommandItem
                            key={contact.phoneNumber}
                            value={`${contact.name ?? ""} ${contact.phoneNumber}`}
                            onSelect={() =>
                              onPickContact(contact.phoneNumber, contact.name)
                            }
                          >
                            <div className="flex flex-col">
                              <span className="text-sm text-on-surface">
                                {contact.name ?? contact.phoneNumber}
                              </span>
                              {contact.name && (
                                <span className="text-xs text-outline">
                                  {contact.phoneNumber}
                                </span>
                              )}
                            </div>
                          </CommandItem>
                        ))}
                    </>
                  )}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          <form
            onSubmit={form.handleSubmit(onAdd)}
            className="flex flex-col gap-2"
          >
            <div className="flex gap-2">
              <Input
                placeholder="Atau ketik nomor manual, mis. 0812..."
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
        </div>

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
      </CardContent>
    </Card>
  );
}
