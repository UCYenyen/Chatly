export function getAppBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.APP_URL ||
    "http://localhost:3000"
  );
}

export function buildInviteUrl(inviteToken: string): string {
  return `${getAppBaseUrl()}/notify/register/${inviteToken}`;
}

export function buildClaimUrl(claimToken: string): string {
  return `${getAppBaseUrl()}/api/notify/claim?token=${claimToken}`;
}
