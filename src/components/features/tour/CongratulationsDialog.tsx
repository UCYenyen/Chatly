"use client";

import { PartyPopper } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useTour } from "./TourProvider";

export function CongratulationsDialog() {
  const { state, start, skip } = useTour();

  const open = state.phase === "congrats";

  const handleOpenChange = (next: boolean): void => {
    if (!next) skip();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent showCloseButton={false} className="sm:max-w-md">
        <DialogHeader className="items-center text-center">
          <div className="mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-secondary-fixed/15">
            <PartyPopper className="h-7 w-7 text-secondary-fixed" />
          </div>
          <DialogTitle className="text-2xl font-headline">Selamat! 🎉</DialogTitle>
          <DialogDescription className="text-base leading-relaxed">
            Pembayaran Anda berhasil dan langganan kini aktif. Anda sekarang bisa
            mengakses dashboard penuh Chatly — kelola bisnis, latih AI, dan pantau
            transaksi pelanggan Anda.
          </DialogDescription>
        </DialogHeader>
        <p className="text-center text-sm text-outline">
          Baru pertama kali? Kami siap memandu Anda langkah demi langkah.
        </p>
        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button onClick={start} className="w-full">
            Mulai Tutorial
          </Button>
          <Button onClick={skip} variant="ghost" className="w-full text-outline">
            Lewati, saya sudah paham
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
