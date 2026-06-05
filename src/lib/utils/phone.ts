const MIN_PHONE_DIGITS = 8;

export function canonicalizePhone(input: string): string | null {
  const beforeDomain = input.split("@")[0]?.split(":")[0] ?? "";
  const withoutPlus = beforeDomain.trim().replace(/^\+/, "");
  const digitsOnly = withoutPlus.replace(/\D/g, "");

  if (digitsOnly.length === 0) {
    return null;
  }

  const indonesianNormalized = digitsOnly.startsWith("0")
    ? `62${digitsOnly.slice(1)}`
    : digitsOnly;

  if (indonesianNormalized.length < MIN_PHONE_DIGITS) {
    return null;
  }

  return indonesianNormalized;
}
