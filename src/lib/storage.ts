import { Payment } from '@/types/payment';

const STORAGE_KEY = 'virtual-wallet-payments';

export const storageService = {
  getPayments(): Payment[] {
    if (typeof window === 'undefined') return [];
    
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading payments:', error);
      return [];
    }
  },

  savePayments(payments: Payment[]): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payments));
    } catch (error) {
      console.error('Error saving payments:', error);
    }
  },

  addPayment(payment: Omit<Payment, 'id' | 'createdAt'>): Payment {
    const newPayment: Payment = {
      ...payment,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };

    const payments = this.getPayments();
    payments.push(newPayment);
    this.savePayments(payments);
    
    return newPayment;
  },

  updatePayment(id: string, updates: Partial<Payment>): Payment | null {
    const payments = this.getPayments();
    const index = payments.findIndex(p => p.id === id);
    
    if (index === -1) return null;
    
    payments[index] = { ...payments[index], ...updates };
    this.savePayments(payments);
    
    return payments[index];
  },

  deletePayment(id: string): boolean {
    const payments = this.getPayments();
    const filteredPayments = payments.filter(p => p.id !== id);
    
    if (filteredPayments.length === payments.length) return false;
    
    this.savePayments(filteredPayments);
    return true;
  },

  getPaymentStats() {
    const payments = this.getPayments();
    
    const stats = {
      totalAmount: 0,
      totalPayments: payments.length,
      byWallet: { 'mercadopago': 0, 'cuenta-dni': 0 } as Record<string, number>,
      byMonth: {} as Record<string, number>,
    };

    payments.forEach(payment => {
      stats.totalAmount += payment.amount;
      stats.byWallet[payment.wallet] += payment.amount;
      
      const monthKey = new Date(payment.date).toLocaleDateString('es-AR', { 
        year: 'numeric', 
        month: 'long' 
      });
      stats.byMonth[monthKey] = (stats.byMonth[monthKey] || 0) + payment.amount;
    });

    return stats;
  }
};
