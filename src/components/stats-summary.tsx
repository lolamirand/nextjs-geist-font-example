"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { storageService } from '@/lib/storage';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface StatsSummaryProps {
  refreshTrigger?: number;
}

export function StatsSummary({ refreshTrigger }: StatsSummaryProps) {
  const [stats, setStats] = useState({
    totalAmount: 0,
    totalPayments: 0,
    byWallet: {} as Record<string, number>,
    byMonth: {} as Record<string, number>,
  });

  useEffect(() => {
    const loadedStats = storageService.getPaymentStats();
    setStats(loadedStats);
  }, [refreshTrigger]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
    }).format(amount);
  };

  // Prepare data for charts
  const walletData = [
    { name: 'Mercado Pago', value: stats.byWallet['mercadopago'], color: '#0066CC' },
    { name: 'Cuenta DNI', value: stats.byWallet['cuenta-dni'], color: '#00AA44' },
  ].filter(item => item.value > 0);

  const monthlyData = Object.entries(stats.byMonth)
    .map(([month, amount]) => ({ month, amount }))
    .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime())
    .slice(-6); // Last 6 months

  const COLORS = ['#0066CC', '#00AA44', '#FF6B35', '#F7931E'];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Gastado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {formatCurrency(stats.totalAmount)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Pagos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalPayments}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Promedio por Pago
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalPayments > 0 
                ? formatCurrency(stats.totalAmount / stats.totalPayments)
                : formatCurrency(0)
              }
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      {stats.totalPayments > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Wallet Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Distribución por Billetera</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={walletData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${formatCurrency(value)}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {walletData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Monthly Spending */}
          {monthlyData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Gastos por Mes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="month" 
                        tick={{ fontSize: 12 }}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis 
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => `$${value.toLocaleString()}`}
                      />
                      <Tooltip 
                        formatter={(value) => [formatCurrency(Number(value)), 'Monto']}
                        labelStyle={{ color: '#000' }}
                      />
                      <Bar dataKey="amount" fill="#0066CC" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Wallet Breakdown */}
      {walletData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Resumen por Billetera</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {walletData.map((wallet) => (
                <div key={wallet.name} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: wallet.color }}
                    />
                    <span className="font-medium">{wallet.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{formatCurrency(wallet.value)}</div>
                    <div className="text-sm text-muted-foreground">
                      {((wallet.value / stats.totalAmount) * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
