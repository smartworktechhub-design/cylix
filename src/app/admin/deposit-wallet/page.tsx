'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '@/components/ui/table';
import { TREASURY_WALLET } from '@/lib/constants';
import { getAdminToken } from '@/lib/admin-auth';
import { Copy, RefreshCw, ExternalLink, Loader2, ArrowDown } from 'lucide-react';

interface Deposit {
  user: string;
  slot: string;
  amount: string;
  status: string;
  date: string;
}

export default function AdminDepositWallet() {
  useEffect(() => { document.title = 'Deposit Wallet — CYLIX Admin'; }, []);
  const [bnb, setBnb] = useState('0');
  const [usdt, setUsdt] = useState('0');
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [totalDeposits, setTotalDeposits] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyAddress = () => {
    navigator.clipboard.writeText(TREASURY_WALLET);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const fetchData = async () => {
    const token = getAdminToken();
    if (!token) return;
    try {
      const res = await fetch(`/api/admin/wallet-txs?token=${token}`);
      const data = await res.json();
      if (data.error) return;
      setBnb(data.bnb || '0');
      setUsdt(data.usdt || '0');
      setDeposits(data.deposits || []);
      setTotalDeposits(data.totalDeposits || 0);
    } catch (e) {
      console.error('Fetch failed:', e);
    }
  };

  const refresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchData().then(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 gap-2 text-[#A8B8D0]">
        <Loader2 size={18} className="animate-spin" /> Loading wallet data...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white font-heading">Deposit Wallet</h2>
        <div className="flex gap-2">
          <a
            href={`https://bscscan.com/address/${TREASURY_WALLET}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-cyan-400 border border-cyan-400/20 hover:bg-cyan-400/10 transition-colors"
          >
            BSCScan <ExternalLink size={12} />
          </a>
          <Button onClick={refresh} variant="ghost" size="sm" disabled={refreshing}>
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} /> Refresh
          </Button>
        </div>
      </div>

      <Card className="glass border border-white/10">
        <CardContent className="p-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="text-xs text-[#A8B8D0] mb-1">BSC USDT Wallet</p>
              <p className="font-mono text-sm text-white break-all">{TREASURY_WALLET}</p>
              <div className="flex items-center gap-3 mt-2">
                <Button onClick={copyAddress} variant="ghost" size="sm">
                  <Copy size={12} /> {copied ? 'Copied!' : 'Copy'}
                </Button>
              </div>
            </div>
            <div className="flex gap-6">
              <div className="text-right">
                <p className="text-xs text-[#A8B8D0]">USDT Balance</p>
                <p className="text-2xl font-bold text-green-400">{usdt}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-[#A8B8D0]">BNB (gas)</p>
                <p className="text-lg font-semibold text-yellow-400">{bnb}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-[#A8B8D0]">Total Deposits</p>
                <p className="text-lg font-semibold text-cyan-400">${totalDeposits.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="glass border border-white/10">
        <CardHeader>
          <span className="text-sm font-bold text-white">Deposits to Wallet (Last 50)</span>
        </CardHeader>
        <CardContent>
          {deposits.length === 0 ? (
            <p className="text-center text-[#A8B8D0] py-12">No deposits found</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10">
                    <TableHead className="text-white/70">Type</TableHead>
                    <TableHead className="text-white/70">User</TableHead>
                    <TableHead className="text-white/70">Slot</TableHead>
                    <TableHead className="text-white/70">Amount (USDT)</TableHead>
                    <TableHead className="text-white/70">Status</TableHead>
                    <TableHead className="text-white/70">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deposits.map((d, i) => {
                    const date = new Date(d.date);
                    return (
                      <TableRow key={i} className="border-white/5">
                        <TableCell>
                          <span className="inline-flex items-center gap-1 text-green-400 text-sm font-medium">
                            <ArrowDown size={14} /> IN
                          </span>
                        </TableCell>
                        <td className="px-4 py-3 text-sm text-white/70">{d.user}</td>
                        <td className="text-sm text-white/50">{d.slot}</td>
                        <TableCell className="text-sm font-bold text-green-400">
                          +${d.amount}
                        </TableCell>
                        <TableCell>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            d.status === 'active' ? 'bg-green-500/10 text-green-400' :
                            d.status === 'completed' ? 'bg-blue-500/10 text-blue-400' :
                            'bg-yellow-500/10 text-yellow-400'
                          }`}>
                            {d.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-[#A8B8D0]">
                          {date.toLocaleDateString()} {date.toLocaleTimeString()}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
