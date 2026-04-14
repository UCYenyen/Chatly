"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff } from "lucide-react";
import Link from "next/link";

import { signUpSchema, type SignUpValues } from "@/validations/authValidation.md";
import { authClient } from "@/lib/utils/auth/auth-client";

import { Button } from "@/components/ui//button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui//card";
import {
  Field,
  FieldError,
  FieldLabel,
} from "@/components/ui//field";
import { Input } from "@/components/ui//input";
import { InputGroup } from "@/components/ui//input-group";

export function SignUpForm() {
  const [isPending, setIsPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(data: SignUpValues) {
    setIsPending(true);
    
    try {
      const { error } = await authClient.signUp.email({
        email: data.email,
        password: data.password,
        name: data.name,
      });

      if (error) {
        toast.error("Registrasi Gagal", {
          description: error.message || "Gagal membuat akun.",
        });
        form.setError("root", { message: error.message });
      } else {
        toast.success("Link Verifikasi Terkirim", {
          description: "Silakan cek email anda untuk verifikasi.",
        });
      }
    } catch (err) {
      toast.error("Terjadi Kesalahan", {
        description: "Gagal menghubungi server.",
      });
    } finally {
      setIsPending(false);
    }
  }

  return (
    <>
      <Card className="w-112.5 max-w-[80%] shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Buat Akun Baru</CardTitle>
          <CardDescription>
            Lengkapi data diri untuk mulai presensi
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            id="form-register"
            className="grid gap-4"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            {form.formState.errors.root && (
              <div className="bg-destructive/15 p-3 rounded-md flex items-center gap-2 text-sm text-destructive font-medium border border-destructive/20">
                {form.formState.errors.root.message}
              </div>
            )}

            <Field>
              <FieldLabel>Nama Lengkap</FieldLabel>
              <InputGroup>
                <Input 
                  placeholder="Contoh: Budi Santoso" 
                  disabled={isPending} 
                  {...form.register("name")} 
                />
              </InputGroup>
              <FieldError>{form.formState.errors.name?.message}</FieldError>
            </Field>

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
              <FieldLabel>Password</FieldLabel>
              <InputGroup className="relative">
                <Input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Minimal 6 karakter" 
                  disabled={isPending} 
                  className="pr-10" 
                  {...form.register("password")} 
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isPending}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  )}
                  <span className="sr-only">Toggle password visibility</span>
                </Button>
              </InputGroup>
              <FieldError>{form.formState.errors.password?.message}</FieldError>
            </Field>

            <Field>
              <FieldLabel>Konfirmasi Password</FieldLabel>
              <InputGroup className="relative">
                <Input 
                  type={showConfirmPassword ? "text" : "password"} 
                  placeholder="Ulangi password" 
                  disabled={isPending} 
                  className="pr-10" 
                  {...form.register("confirmPassword")} 
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isPending}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  )}
                  <span className="sr-only">Toggle confirm password visibility</span>
                </Button>
              </InputGroup>
              <FieldError>{form.formState.errors.confirmPassword?.message}</FieldError>
            </Field>

            <Button type="submit" className="w-full mt-2" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isPending ? "Memproses..." : "Daftar Sekarang"}
            </Button>
          </form>
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-4">
           <div className="text-center text-sm text-muted-foreground">
            Sudah punya akun?{" "}
            <Link href="/sign-in" className="font-medium text-primary underline underline-offset-4 hover:text-primary/80">
              Masuk disini
            </Link>
          </div>
        </CardFooter>
      </Card>
    </>
  );
}