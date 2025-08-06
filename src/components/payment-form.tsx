"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { storageService } from '@/lib/storage';
import { Payment, WalletType } from '@/types/payment';
import { toast } from 'sonner';

interface PaymentFormProps {
  onPaymentAdded?: (payment: Payment) => void;
}

export function PaymentForm({ onPaymentAdded }: PaymentFormProps) {
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    place: '',
    wallet: '' as WalletType | '',
    date: new Date().toISOString().split('T')[0],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.amount || !formData.description || !formData.place || !formData.wallet) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    setIsSubmitting(true);

    try {
      const payment = storageService.addPayment({
        amount: parseFloat(formData.amount),
        description: formData.description,
        place: formData.place,
        wallet: formData.wallet as WalletType,
        date: formData.date,
      });

      toast.success('Pago registrado exitosamente');
      
      // Reset form
      setFormData({
        amount: '',
        description: '',
        place: '',
        wallet: '',
        date: new Date().toISOString().split('T')[0],
      });

      onPaymentAdded?.(payment);
    } catch (error) {
      toast.error('Error al registrar el pago');
      console.error('Error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const walletOptions = [
    { value: 'mercadopago', label: 'Mercado Pago' },
    { value: 'cuenta-dni', label: 'Cuenta DNI' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Registrar Nuevo Pago</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Monto ($)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="wallet">Billetera</Label>
              <Select
                value={formData.wallet}
                onValueChange={(value) => setFormData({ ...formData, wallet: value as WalletType })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una billetera" />
                </SelectTrigger>
                <SelectContent>
                  {walletOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Input
              id="description"
              placeholder="¿Qué compraste?"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="place">Lugar</Label>
            <Input
              id="place"
              placeholder="¿Dónde realizaste el pago?"
              value={formData.place}
              onChange={(e) => setFormData({ ...formData, place: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Fecha</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Registrando...' : 'Registrar Pago'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
