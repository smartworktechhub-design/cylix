'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { Plus, Edit2, Trash2, Power, PowerOff, DollarSign, TrendingUp, Layers, CheckCircle } from 'lucide-react';

interface Package {
  id: number;
  name: string;
  price: number;
  dailyReturn: number;
  totalReturn: number;
  level: number;
  duration: number;
  enabled: boolean;
  totalPurchases: number;
}

const initialPackages: Package[] = [
  { id: 1, name: 'Basic', price: 100, dailyReturn: 1.5, totalReturn: 45, level: 1, duration: 30, enabled: true, totalPurchases: 823 },
  { id: 2, name: 'Starter', price: 500, dailyReturn: 2.0, totalReturn: 60, level: 2, duration: 30, enabled: true, totalPurchases: 512 },
  { id: 3, name: 'Premium', price: 2500, dailyReturn: 2.5, totalReturn: 75, level: 3, duration: 30, enabled: true, totalPurchases: 356 },
  { id: 4, name: 'Elite', price: 10000, dailyReturn: 3.0, totalReturn: 90, level: 4, duration: 30, enabled: false, totalPurchases: 156 },
  { id: 5, name: 'Ultimate', price: 50000, dailyReturn: 3.5, totalReturn: 105, level: 5, duration: 30, enabled: true, totalPurchases: 47 },
];

export default function AdminPackages() {
  const [packages, setPackages] = useState(initialPackages);

  const togglePackage = (id: number) => {
    setPackages((prev) =>
      prev.map((p) => (p.id === id ? { ...p, enabled: !p.enabled } : p))
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white font-heading">Package Management</h2>
          <p className="text-[#94A3B8] text-sm mt-1">{formatNumber(packages.length)} investment packages</p>
        </div>
        <Button>
          <Plus size={16} />
          Create Package
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {packages.map((pkg) => (
          <Card key={pkg.id} className={pkg.enabled ? '' : 'opacity-60'}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-white font-heading">{pkg.name}</h3>
                    <Badge variant="info">Level {pkg.level}</Badge>
                  </div>
                  <p className="text-[#94A3B8] text-xs mt-1">{formatNumber(pkg.totalPurchases)} purchases</p>
                </div>
                <button
                  onClick={() => togglePackage(pkg.id)}
                  className={`p-2 rounded-lg transition-colors ${
                    pkg.enabled
                      ? 'bg-[rgba(0,255,178,0.1)] text-[#00FFB2]'
                      : 'bg-[rgba(148,163,184,0.1)] text-[#94A3B8]'
                  }`}
                >
                  {pkg.enabled ? <Power size={16} /> : <PowerOff size={16} />}
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-[rgba(0,229,255,0.05)]">
                  <div className="flex items-center gap-2 text-[#94A3B8] text-sm">
                    <DollarSign size={14} />
                    Price
                  </div>
                  <span className="text-white font-mono font-semibold">{formatCurrency(pkg.price)}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-[rgba(0,229,255,0.05)]">
                  <div className="flex items-center gap-2 text-[#94A3B8] text-sm">
                    <TrendingUp size={14} />
                    Daily Return
                  </div>
                  <span className="text-[#00E5FF] font-mono">{pkg.dailyReturn}%</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-[rgba(0,229,255,0.05)]">
                  <div className="flex items-center gap-2 text-[#94A3B8] text-sm">
                    <CheckCircle size={14} />
                    Total Return
                  </div>
                  <span className="text-[#00FFB2] font-mono">{pkg.totalReturn}%</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2 text-[#94A3B8] text-sm">
                    <Layers size={14} />
                    Duration
                  </div>
                  <span className="text-white font-mono">{pkg.duration} days</span>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-[rgba(0,229,255,0.05)]">
                <Button variant="outline" size="sm" className="flex-1">
                  <Edit2 size={14} />
                  Edit
                </Button>
                <Button variant="ghost" size="sm" className="text-[#FF5C7A] flex-1">
                  <Trash2 size={14} />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
