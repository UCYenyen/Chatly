const AUTH_ERROR_TRANSLATIONS: Record<string, string> = {
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
  Unauthorized: "Anda tidak memiliki akses",
  "Session expired": "Sesi Anda telah berakhir, silakan login kembali",
  "Failed to send verification email": "Gagal mengirim email verifikasi",
  "Invalid verification code": "Kode verifikasi salah",
  "Verification code expired": "Kode verifikasi sudah kadaluarsa",
  "Email not verified": "Email belum diverifikasi",
  "Account suspended": "Akun Anda ditangguhkan",
  "Something went wrong": "Terjadi kesalahan pada server",
};

type UnknownRecord = Record<string, unknown>;

function asRecord(value: unknown): UnknownRecord | null {
  if (value && typeof value === "object") {
    return value as UnknownRecord;
  }
  return null;
}

function pickString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}

function translate(messageOrCode: string): string {
  return AUTH_ERROR_TRANSLATIONS[messageOrCode] ?? messageOrCode;
}

export function getAuthErrorMessage(error: unknown, fallback: string): string {
  if (!error) return fallback;

  if (typeof error === "string") {
    return translate(error);
  }

  if (error instanceof Error && error.message) {
    return translate(error.message);
  }

  const root = asRecord(error);
  if (!root) return fallback;

  const nestedError = asRecord(root.error);
  const body = asRecord(root.body);

  const candidates = [
    pickString(root.message),
    pickString(root.statusText),
    pickString(root.code),
    pickString(nestedError?.message),
    pickString(nestedError?.code),
    pickString(body?.message),
    pickString(body?.code),
  ].filter((value): value is string => Boolean(value));

  for (const candidate of candidates) {
    return translate(candidate);
  }

  return fallback;
}