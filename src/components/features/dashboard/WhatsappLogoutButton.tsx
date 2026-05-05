"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface WhatsappLogoutButtonProps {
  isAuthenticated: boolean;
  isLoading: boolean;
  onLogout: () => Promise<void>;
}

export function WhatsappLogoutButton({
  isAuthenticated,
  isLoading,
  onLogout,
}: WhatsappLogoutButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  if (!isAuthenticated) {
    return null;
  }

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await onLogout();
      setIsOpen(false);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="destructive"
          disabled={isLoading || isLoggingOut}
          className="gap-2"
        >
          <LogOut className="w-4 h-4" />
          Logout WhatsApp
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Logout WhatsApp?</AlertDialogTitle>
          <AlertDialogDescription>
            Anda akan logout dari akun WhatsApp Anda. Silakan scan QR code
            kembali jika ingin mengubah akun.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex gap-2 justify-end">
          <AlertDialogCancel disabled={isLoggingOut}>
            Batal
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="bg-destructive hover:bg-destructive/90"
          >
            {isLoggingOut ? "Logging out..." : "Logout"}
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
