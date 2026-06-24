export type PaymentMethod = "telebirr" | "cbe";

export const PAYMENT_METHODS: PaymentMethod[] = ["telebirr", "cbe"];

/** Edit these — shown on the book page when patient picks a payment method */
export const PAYMENT_ACCOUNTS = {
  accountName: "Nisir Hikimina",
  telebirr: "0947018285",
  cbe: "1000221781574",
} as const;

export function getPaymentAccount(method: PaymentMethod): string {
  return method === "telebirr"
    ? PAYMENT_ACCOUNTS.telebirr
    : PAYMENT_ACCOUNTS.cbe;
}

export function getPaymentAccountHolder(): string {
  return PAYMENT_ACCOUNTS.accountName;
}
