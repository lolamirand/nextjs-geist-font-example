export interface Payment {
  id: string;
  amount: number;
  description: string;
  place: string;
  wallet: 'mercadopago' | 'cuenta-dni';
  date: string;
  createdAt: string;
}

export type WalletType = Payment['wallet'];

export interface PaymentStats {
  totalAmount: number;
  totalPayments: number;
  byWallet: Record<WalletType, number>;
  byMonth: Record<string, number>;
}
