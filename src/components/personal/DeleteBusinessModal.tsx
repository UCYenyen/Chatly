'use client'

import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useDeleteBusiness } from '@/hooks/use-delete-business'
import { useBusinessContext } from '@/components/features/business/BusinessProvider'
import type { BusinessDTO } from '@/types/business.md'

interface DeleteBusinessModalProps {
    business: BusinessDTO
    children: React.ReactNode
    onDeleted?: () => void
}

export function DeleteBusinessModal({ business, children, onDeleted }: DeleteBusinessModalProps) {
    const [open, setOpen] = useState<boolean>(false)
    const { deleteBusiness, isPending } = useDeleteBusiness()
    const { refresh } = useBusinessContext()

    const handleDelete = async (): Promise<void> => {
        const success = await deleteBusiness(business.id)
        if (!success) return

        toast.success('Bisnis berhasil dihapus', {
            description: `${business.name} telah dihapus dari akun Anda.`
        })

        await refresh()
        onDeleted?.()
        setOpen(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-[480px] bg-surface-container-low/90 backdrop-blur-xl border-outline-variant/20 shadow-2xl p-0 overflow-hidden ring-1 ring-white/5">
                <div className="absolute inset-0 bg-gradient-to-br from-destructive/5 via-transparent to-transparent pointer-events-none" />

                <DialogHeader className="p-8 pb-4">
                    <div className="w-12 h-12 bg-destructive/10 rounded-xl flex items-center justify-center text-destructive mb-4 ring-1 ring-destructive/20">
                        <Trash2 className="w-6 h-6" />
                    </div>
                    <DialogTitle className="text-2xl font-headline font-bold text-on-surface tracking-tight">
                        Hapus Bisnis
                    </DialogTitle>
                    <DialogDescription className="text-outline text-sm leading-relaxed mt-1">
                        Apakah Anda yakin ingin menghapus <span className="font-bold text-on-surface">{business.name}</span>? Tindakan ini tidak dapat dibatalkan dan semua data terkait akan hilang permanen.
                    </DialogDescription>
                </DialogHeader>

                <div className="p-8 pt-2">
                    <DialogFooter className="pt-4 gap-3 sm:gap-0">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setOpen(false)}
                            className="cursor-pointer hover:bg-surface-container-high text-outline font-bold"
                        >
                            Batal
                        </Button>
                        <Button
                            type="button"
                            disabled={isPending}
                            onClick={handleDelete}
                            className="cursor-pointer bg-destructive text-destructive-foreground hover:bg-destructive/90 font-bold px-4 shadow-lg shadow-destructive/20"
                        >
                            {isPending ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-destructive-foreground/30 border-t-destructive-foreground rounded-full animate-spin" />
                                    <span>Menghapus...</span>
                                </div>
                            ) : (
                                'Hapus Permanen'
                            )}
                        </Button>
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    )
}
