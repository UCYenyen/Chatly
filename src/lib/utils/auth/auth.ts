import { betterAuth } from "better-auth";
import { admin } from "better-auth/plugins";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "@/lib/utils/prisma";
import { createAuthMiddleware, APIError } from "better-auth/api"
import nodemailer from "nodemailer";

const ERROR_TRANSLATIONS: Record<string, string> = {
    "User already exists": "Email ini sudah terdaftar",
    "Invalid email or password": "Email atau password salah",
    "Invalid password": "Password salah",
    "Password too short": "Password terlalu pendek",
    "Passwords do not match": "Password tidak cocok",
    "Failed to create user": "Gagal membuat pengguna baru",
    "Invalid token": "Token tidak valid atau sudah kadaluarsa",
    "User not found": "Pengguna tidak ditemukan",
    "Please verify your email address": "Mohon verifikasi email Anda terlebih dahulu",
    "Too many requests": "Terlalu banyak percobaan, coba lagi nanti",
    "Unauthorized": "Anda tidak memiliki akses",
    "Session expired": "Sesi Anda telah berakhir, silakan login kembali",
    "Failed to send verification email": "Gagal mengirim email verifikasi",
    "Invalid verification code": "Kode verifikasi salah",
    "Verification code expired": "Kode verifikasi sudah kadaluarsa",
    "Email not verified": "Email belum diverifikasi",
    "Account suspended": "Akun Anda ditangguhkan",
    "Something went wrong": "Terjadi kesalahan pada server",
};

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    autoSignIn: true,
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASSWORD,
        },
      });

      try {
        await transporter.sendMail({
          from: '"SEMBAKO BAYI" <no-reply@sembakobayi.com>',
          to: user.email,
          subject: "Verifikasi Akun Anda",
          html: `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
              <h2>Selamat Datang, ${user.name}!</h2>
              <p>Terima kasih telah mendaftar di Sembako Bayi. Silakan klik tombol di bawah ini untuk memverifikasi email Anda:</p>
              <a href="${url}" style="background-color: #3F3142; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Verifikasi Email
              </a>
              <p>Atau copy link ini: <br/> ${url}</p>
              <p>Kami menunggu kehadiran Anda di Sembako Bayi!</p>
            </div>
          `,
        });
        console.log("Email verifikasi terkirim ke:", user.email);
      } catch (error) {
        console.error("Gagal mengirim email:", error);
      }
    },
  },
  plugins: [
    admin({
      adminRole: "ADMIN",
      adminQrRole: "ADMIN_QR",
      activeStaffRole: "ACTIVE_STAFF",
      inactiveStaffRole: "INACTIVE_STAFF",
      defaultRole: "GUEST",
    }),
  ],
  hooks: {
        after: createAuthMiddleware(async (ctx) => {
            const returned = ctx.context.returned;

            if (returned instanceof APIError) {
                const originalMessage = returned.message;
                const errorCode = returned.body?.code;

                const translatedMessage = 
                    ERROR_TRANSLATIONS[originalMessage] || 
                    ERROR_TRANSLATIONS[errorCode || ""] || 
                    originalMessage;

                throw new APIError(returned.status, {
                    message: translatedMessage,
                    code: returned.body?.code
                });
            }
        }),
    },
});
