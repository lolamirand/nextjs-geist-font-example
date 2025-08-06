"use client";

import { useState, useEffect } from 'react';
import { Payment, WalletType } from '@/types/payment';
import { storageService } from '@/lib/storage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface PaymentListProps {
  refreshTrigger?: number;
}

export function PaymentList({ refreshTrigger }: PaymentListProps) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [walletFilter, setWalletFilter] = useState<WalletType | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const loadPayments = () => {
    const loadedPayments = storageService.getPayments();
    setPayments(loadedPayments);
    setFilteredPayments(loadedPayments);
  };

  useEffect(() => {
    loadPayments();
  }, [refreshTrigger]);

  useEffect(() => {
    let filtered = payments;

    // Filter by wallet
    if (walletFilter !== 'all') {
      filtered = filtered.filter(payment => payment.wallet === walletFilter);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(payment =>
        payment.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.place.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    setFilteredPayments(filtered);
  }, [payments, walletFilter, searchTerm]);

  const handleDeletePayment = (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este pago?')) {
      const success = storageService.deletePayment(id);
      if (success) {
        toast.success('Pago eliminado exitosamente');
        loadPayments();
      } else {
        toast.error('Error al eliminar el pago');
      }
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getWalletBadgeColor = (wallet: WalletType) => {
    switch (wallet) {
      case 'mercadopago':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'cuenta-dni':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getWalletLabel = (wallet: WalletType) => {
    switch (wallet) {
      case 'mercadopago':
        return 'Mercado Pago';
      case 'cuenta-dni':
        return 'Cuenta DNI';
      default:
        return wallet;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Historial de Pagos</CardTitle>
        
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <div className="flex-1">
            <Label htmlFor="search">Buscar</Label>
            <Input
              id="search"
              placeholder="Buscar por descripción o lugar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="sm:w-48">
            <Label htmlFor="wallet-filter">Filtrar por billetera</Label>
            <Select value={walletFilter} onValueChange={(value) => setWalletFilter(value as WalletType | 'all')}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las billeteras</SelectItem>
                <SelectItem value="mercadopago">Mercado Pago</SelectItem>
                <SelectItem value="cuenta-dni">Cuenta DNI</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {filteredPayments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {payments.length === 0 
              ? 'No hay pagos registrados aún. ¡Agrega tu primer pago!'
              : 'No se encontraron pagos con los filtros aplicados.'
            }
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPayments.map((payment) => (
              <div
                key={payment.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={getWalletBadgeColor(payment.wallet)}>
                      {getWalletLabel(payment.wallet)}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {formatDate(payment.date)}
                    </span>
                  </div>
                  
                  <h3 className="font-semibold">{payment.description}</h3>
                  <p className="text-sm text-muted-foreground">📍 {payment.place}</p>
                </div>
                
                <div className="text-right">
                  <div className="text-lg font-bold text-primary">
                    {formatCurrency(payment.amount)}
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeletePayment(payment.id)}
                    className="mt-2"
                  >
                    Eliminar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
