'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Save, Wallet, Network, DollarSign, Sliders, TreePine, Loader2 } from 'lucide-react';
import { TREASURY_WALLET } from '@/lib/constants';
import { getAdminToken } from '@/lib/admin-auth';

export default function AdminSettings() {
  const [treasuryWallet, setTreasuryWallet] = useState(TREASURY_WALLET);
  const [chainId, setChainId] = useState('56');
  const [rpcUrl, setRpcUrl] = useState('https://bsc-dataseed.binance.org/');
  const [depositFee, setDepositFee] = useState('0.5');
  const [withdrawalFee, setWithdrawalFee] = useState('2.0');
  const [minWithdrawal, setMinWithdrawal] = useState('50');
  const [maxWithdrawal, setMaxWithdrawal] = useState('50000');
  const [referralBonus, setReferralBonus] = useState('10');
  const [network, setNetwork] = useState('bsc');
  const [rebuilding, setRebuilding] = useState(false);
  const [rebuildResult, setRebuildResult] = useState<string | null>(null);

  async function handleRebuildMatrix() {
    if (!confirm('This will DELETE all matrix tree data and rebuild from scratch. Continue?')) return;
    setRebuilding(true);
    setRebuildResult(null);
    try {
      const token = getAdminToken();
      const res = await fetch('/api/admin/rebuild-matrix', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setRebuildResult(`Rebuilt ${data.rebuilt} users. Errors: ${data.errors?.length || 0}`);
      } else {
        setRebuildResult(`Error: ${data.error}`);
      }
    } catch (e: any) {
      setRebuildResult(`Failed: ${e.message}`);
    }
    setRebuilding(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white font-heading">Platform Settings</h2>
          <p className="text-[#A8B8D0] text-sm mt-1">Configure platform parameters</p>
        </div>
        <Button>
          <Save size={16} />
          Save Settings
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Wallet size={16} className="text-[#00E5FF]" />
              <h3 className="text-white font-semibold font-heading">Treasury</h3>
            </div>
            <p className="text-[#A8B8D0] text-sm">Treasury wallet configuration</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Treasury Wallet Address"
              placeholder="0x..."
              value={treasuryWallet}
              onChange={(e) => setTreasuryWallet(e.target.value)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Network size={16} className="text-[#7B61FF]" />
              <h3 className="text-white font-semibold font-heading">Network</h3>
            </div>
            <p className="text-[#A8B8D0] text-sm">Blockchain network settings</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select
              label="Network"
              value={network}
              onChange={(e) => setNetwork(e.target.value)}
              options={[
                { value: 'bsc', label: 'Binance Smart Chain' },
                { value: 'ethereum', label: 'Ethereum' },
                { value: 'polygon', label: 'Polygon' },
                { value: 'arbitrum', label: 'Arbitrum' },
              ]}
            />
            <Input
              label="Chain ID"
              placeholder="56"
              value={chainId}
              onChange={(e) => setChainId(e.target.value)}
            />
            <Input
              label="RPC URL"
              placeholder="https://..."
              value={rpcUrl}
              onChange={(e) => setRpcUrl(e.target.value)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <DollarSign size={16} className="text-[#00FFB2]" />
              <h3 className="text-white font-semibold font-heading">Fees</h3>
            </div>
            <p className="text-[#A8B8D0] text-sm">Platform fee configuration</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Deposit Fee (%)"
                placeholder="0.5"
                value={depositFee}
                onChange={(e) => setDepositFee(e.target.value)}
              />
              <Input
                label="Withdrawal Fee (%)"
                placeholder="2.0"
                value={withdrawalFee}
                onChange={(e) => setWithdrawalFee(e.target.value)}
              />
            </div>
            <Input
              label="Referral Bonus (%)"
              placeholder="10"
              value={referralBonus}
              onChange={(e) => setReferralBonus(e.target.value)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sliders size={16} className="text-[#FFB800]" />
              <h3 className="text-white font-semibold font-heading">Limits</h3>
            </div>
            <p className="text-[#A8B8D0] text-sm">Transaction limits and thresholds</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Min Withdrawal (USD)"
                placeholder="50"
                value={minWithdrawal}
                onChange={(e) => setMinWithdrawal(e.target.value)}
              />
              <Input
                label="Max Withdrawal (USD)"
                placeholder="50000"
                value={maxWithdrawal}
                onChange={(e) => setMaxWithdrawal(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border border-[#FFB800]/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <TreePine size={16} className="text-[#FFB800]" />
            <h3 className="text-white font-semibold font-heading">Matrix Tree Rebuild</h3>
          </div>
          <p className="text-[#A8B8D0] text-sm">Rebuild all matrix tree data from scratch (fixes spillover propagation)</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-[#A8B8D0] text-xs">This will clear all matrix_tree and matrix_11 entries, then re-insert every user with proper upline propagation. Existing earnings are NOT affected.</p>
          <div className="flex items-center gap-3">
            <Button onClick={handleRebuildMatrix} disabled={rebuilding} className="bg-[#FFB800] text-black hover:bg-[#FFB800]/80">
              {rebuilding ? <Loader2 size={16} className="animate-spin mr-2" /> : <TreePine size={16} className="mr-2" />}
              {rebuilding ? 'Rebuilding...' : 'Rebuild Matrix Tree'}
            </Button>
            {rebuildResult && <span className="text-sm text-[#A8B8D0]">{rebuildResult}</span>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
