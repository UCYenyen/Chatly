"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus, Rocket, Building2, Zap, Briefcase, ShoppingBag, Terminal } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  name: z.string().min(2, "Nama bisnis minimal 2 karakter"),
  category: z.string().min(1, "Pilih kategori bisnis"),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function CreateBusinessModal({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      category: "",
      description: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    console.log("New Business Data:", values);
    toast.success("Bisnis baru berhasil dibuat!", {
      description: `${values.name} telah ditambahkan ke profil Anda.`,
    });
    
    setIsSubmitting(false);
    setOpen(false);
    form.reset();
  };

  const categories = [
    { label: "Software & Tech", value: "tech", icon: Terminal },
    { label: "Retail & E-commerce", value: "retail", icon: ShoppingBag },
    { label: "Professional Services", value: "pro", icon: Briefcase },
    { label: "Corporate", value: "corp", icon: Building2 },
    { label: "Startup / Inovasi", value: "startup", icon: Zap },
  ];

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
            {/* Business Name */}
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
                  form.formState.errors.name && "border-destructive focus:border-destructive focus:ring-destructive/20"
                )}
              />
              {form.formState.errors.name && (
                <p className="text-[10px] text-destructive mt-1 ml-1">{form.formState.errors.name.message}</p>
              )}
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label className="text-[11px] uppercase tracking-widest text-secondary font-bold ml-1">
                Kategori Bisnis
              </Label>
              <Select 
                onValueChange={(val) => form.setValue("category", val)}
                defaultValue={form.getValues("category")}
              >
                <SelectTrigger className="bg-surface-container-high/50 border-outline-variant/10 focus:border-secondary focus:ring-secondary/20 h-11 px-4 w-full">
                  <SelectValue placeholder="Pilih kategori..." />
                </SelectTrigger>
                <SelectContent className="bg-surface-container-high border-outline-variant/20 shadow-xl">
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value} className="focus:bg-secondary/10 focus:text-secondary py-3">
                      <div className="flex items-center gap-2">
                        <cat.icon className="w-4 h-4 text-outline" />
                        <span>{cat.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.category && (
                <p className="text-[10px] text-destructive mt-1 ml-1">{form.formState.errors.category.message}</p>
              )}
            </div>

            {/* Description */}
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

          <DialogFooter className="pt-4 gap-3 sm:gap-0">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
              className="hover:bg-surface-container-high text-outline font-bold"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-secondary text-secondary-foreground hover:bg-secondary/90 font-bold px-8 shadow-lg shadow-secondary/20"
            >
              {isSubmitting ? (
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
