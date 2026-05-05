"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Rocket } from "lucide-react";
import { toast } from "sonner";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCreateBusiness } from "@/hooks/use-create-business";
import { useBusinessContext } from "@/components/features/business/BusinessProvider";
import type { BusinessDTO } from "@/types/business.md";

const formSchema = z.object({
    name: z.string().min(2, "Nama bisnis minimal 2 karakter"),
    description: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface CreateBusinessModalProps {
    children: React.ReactNode;
    onCreated?: (business: BusinessDTO) => void;
}

export function CreateBusinessModal({ children, onCreated }: CreateBusinessModalProps) {
    const [open, setOpen] = useState<boolean>(false);
    const { createBusiness, isPending, error } = useCreateBusiness();
    const { refresh, setActiveBusinessId } = useBusinessContext();

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            description: "",
        },
    });

    const onSubmit = async (values: FormValues): Promise<void> => {
        const created = await createBusiness({
            name: values.name,
            description: values.description,
        });
        if (!created) return;

        toast.success("Bisnis baru berhasil dibuat!", {
            description: `${created.name} telah ditambahkan ke profil Anda.`,
        });

        await refresh();
        setActiveBusinessId(created.id);
        onCreated?.(created);
        setOpen(false);
        form.reset();
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-[480px] bg-surface-container-low/90 backdrop-blur-xl border-outline-variant/20 shadow-2xl p-0 overflow-hidden ring-1 ring-white/5">
                <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 via-transparent to-transparent pointer-events-none" />

                <DialogHeader className="p-8 pb-4">
                    <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center text-secondary mb-4 ring-1 ring-secondary/20">
                        <Rocket className="w-6 h-6" />
                    </div>
                    <DialogTitle className="text-2xl font-headline font-bold text-on-surface tracking-tight">
                        Buat Bisnis Baru
                    </DialogTitle>
                    <DialogDescription className="text-outline text-sm leading-relaxed mt-1">
                        Siapkan profil bisnis Anda untuk mulai mengintegrasikan asisten AI CS premium Chatly.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-8 pt-2">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-[11px] uppercase tracking-widest text-secondary font-bold ml-1">
                                Nama Bisnis
                            </Label>
                            <Input
                                id="name"
                                placeholder="Contoh: Chatly Global Corp"
                                {...form.register("name")}
                                className={cn(
                                    "bg-surface-container-high/50 border-outline-variant/10 focus:border-secondary focus:ring-secondary/20 h-11 px-4 transition-all",
                                    form.formState.errors.name && "border-destructive focus:border-destructive focus:ring-destructive/20",
                                )}
                            />
                            {form.formState.errors.name && (
                                <p className="text-[10px] text-destructive mt-1 ml-1">{form.formState.errors.name.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description" className="text-[11px] uppercase tracking-widest text-secondary font-bold ml-1">
                                Deskripsi Singkat (Opsional)
                            </Label>
                            <Textarea
                                id="description"
                                placeholder="Ceritakan sedikit tentang bisnis Anda..."
                                {...form.register("description")}
                                className="bg-surface-container-high/50 border-outline-variant/10 focus:border-secondary focus:ring-secondary/20 min-h-[100px] p-4 transition-all resize-none"
                            />
                        </div>
                    </div>

                    {error && <p className="text-[12px] text-destructive ml-1">{error}</p>}

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
                            type="submit"
                            disabled={isPending}
                            className="cursor-pointer bg-secondary text-secondary-foreground hover:bg-secondary/90 font-bold px-8 shadow-lg shadow-secondary/20"
                        >
                            {isPending ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-secondary-foreground/30 border-t-secondary-foreground rounded-full animate-spin" />
                                    <span>Sedang Diproses...</span>
                                </div>
                            ) : (
                                "Buat Bisnis"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
