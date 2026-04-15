"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

import { signInSchema, type SignInValues } from "@/validations/authValidation.md"; 
import { authClient } from "@/lib/utils/auth/auth-client";
import { getAuthErrorMessage } from "@/lib/utils/auth/get-auth-error-message";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { InputGroup } from "@/components/ui/input-group";

export default function SignInSection() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: SignInValues) {
    setIsPending(true);
    
    try {
      const { error } = await authClient.signIn.email({
        email: data.email,
        password: data.password,
        callbackURL: "/", 
        rememberMe: true,
      });

      if (error) {
        const message = getAuthErrorMessage(error, "Email atau password salah.");
        toast.error("Login Gagal", {
          description: message,
        });
        form.setError("root", { message });
      } else {
        toast.success("Login Berhasil", {
          description: "Mohon tunggu sebentar...",
        });
        
        router.refresh(); 
        router.push("/"); 
      }
    } catch (err) {
      toast.error("Terjadi Kesalahan", {
        description: "Silakan coba lagi nanti.",
      });
      console.error(err);
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Card className="w-112.5 max-w-[80%] glass-panel border-outline-variant/15 shadow-2xl"> 
      <CardHeader className="space-y-1">
        <CardTitle className="text-3xl font-headline font-bold text-on-surface text-center">Selamat Datang</CardTitle>
        <CardDescription className="text-center text-outline">
          Masuk untuk melakukan presensi
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          id="form-login"
          className="grid gap-4"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          {form.formState.errors.root && (
            <div className="bg-destructive/15 p-3 rounded-md flex items-center gap-2 text-sm text-destructive font-medium border border-destructive/20">
              {form.formState.errors.root.message}
            </div>
          )}

          <Field>
            <FieldLabel>Email</FieldLabel>
            <InputGroup>
              <Input
                placeholder="nama@email.com"
                type="email"
                disabled={isPending}
                {...form.register("email")}
              />
            </InputGroup>
            <FieldError>{form.formState.errors.email?.message}</FieldError>
          </Field>

          <Field>
            <div className="flex items-center justify-between">
              <FieldLabel>Password</FieldLabel>
              <Link
                href="/forgot-password"
                className="text-xs text-muted-foreground hover:text-primary underline-offset-4 hover:underline"
              >
                Lupa password?
              </Link>
            </div>
            
            {/* 3. Modifikasi Input Password */}
            <InputGroup className="relative">
              <Input
                type={showPassword ? "text" : "password"} // Toggle tipe input
                placeholder="••••••••"
                disabled={isPending}
                className="pr-10" // Tambah padding kanan agar teks tidak tertutup icon
                {...form.register("password")}
              />
              <Button
                type="button" // Penting: type button agar tidak submit form
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword((prev) => !prev)}
                disabled={isPending}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                )}
                <span className="sr-only">
                  {showPassword ? "Hide password" : "Show password"}
                </span>
              </Button>
            </InputGroup>
            
            <FieldError>{form.formState.errors.password?.message}</FieldError>
          </Field>

          <Button
            type="submit"
            className="w-full mt-2 bg-[#bff44c] text-[#141f00] hover:bg-[#a4d730] font-bold h-11 border border-[#a4d730] transition-all active:scale-95 shadow-md"
            disabled={isPending}
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isPending ? "Memproses..." : "Masuk"}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="flex flex-col space-y-4">
        <div className="relative w-full">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">
              Atau
            </span>
          </div>
        </div>

        <div className="text-center text-sm text-outline">
          Belum punya akun?{" "}
          <Link href="/sign-up" className="font-bold text-secondary-fixed underline underline-offset-4 hover:text-secondary-fixed/80 transition-colors">
            Daftar sekarang
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}