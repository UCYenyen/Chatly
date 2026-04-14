import { z } from "zod";

export const signInSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Email wajib diisi." })
    .email({ message: "Format email tidak valid." }),
  password: z
    .string()
    .min(1, { message: "Password wajib diisi." }) 
    .min(6, { message: "Password minimal 6 karakter." })
    .max(100, { message: "Password maksimal 100 karakter." }),
});

export type SignInValues = z.infer<typeof signInSchema>;

export const signUpSchema = z
  .object({
    name: z
      .string()
      .min(1, { message: "Nama lengkap wajib diisi." })
      .min(3, { message: "Nama minimal 3 karakter." }),
    email: z
      .string()
      .min(1, { message: "Email wajib diisi." })
      .email({ message: "Format email tidak valid." }),
    // phone: z
    // .string()
    // .min(1, { message: "Nomor telepon wajib diisi" })
    // .refine((val) => isValidPhoneNumber(val), {
    //   message: "Nomor telepon tidak valid",
    // }).optional(),
    password: z
      .string()
      .min(1, { message: "Password wajib diisi." })
      .min(6, { message: "Password minimal 6 karakter." }),
    confirmPassword: z
      .string()
      .min(1, { message: "Konfirmasi password wajib diisi." }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Password tidak cocok.",
    path: ["confirmPassword"],
  });

export type SignUpValues = z.infer<typeof signUpSchema>;