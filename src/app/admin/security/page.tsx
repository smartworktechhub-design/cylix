'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { formatDate, formatRelativeTime } from '@/lib/utils';
import { Shield, History, Users, Key, AlertTriangle, CheckCircle, XCircle, Globe } from 'lucide-react';

const loginHistory = [
  { id: 1, admin: 'admin@cylix.io', ip: '192.168.1.100', device: 'Chrome / Windows', location: 'New York, US', date: '2026-06-22T10:30:00', success: true },
  { id: 2, admin: 'admin@cylix.io', ip: '192.168.1.100', device: 'Chrome / Windows', location: 'New York, US', date: '2026-06-22T08:15:00', success: true },
  { id: 3, admin: 'super@cylix.io', ip: '10.0.0.45', device: 'Firefox / macOS', location: 'London, UK', date: '2026-06-21T22:00:00', success: true },
  { id: 4, admin: 'admin@cylix.io', ip: '203.0.113.50', device: 'Safari / iOS', location: 'Tokyo, JP', date: '2026-06-21T14:45:00', success: false },
  { id: 5, admin: 'super@cylix.io', ip: '10.0.0.45', device: 'Firefox / macOS', location: 'London, UK', date: '2026-06-21T09:30:00', success: true },
];

const activeSessions = [
  { id: 1, admin: 'admin@cylix.io', device: 'Chrome / Windows', ip: '192.168.1.100', lastActive: '2026-06-22T10:30:00', current: true },
  { id: 2, admin: 'super@cylix.io', device: 'Firefox / macOS', ip: '10.0.0.45', lastActive: '2026-06-22T09:15:00', current: false },
];

const adminPermissions = [
  { role: 'Super Admin', users: 2, permissions: ['All'] },
  { role: 'Admin', users: 4, permissions: ['Users', 'Packages', 'Withdrawals', 'Announcements'] },
  { role: 'Support', users: 6, permissions: ['Users (read)', 'Withdrawals (read)'] },
];

export default function AdminSecurity() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white font-heading">Security</h2>
        <p className="text-[#94A3B8] text-sm mt-1">Admin security and access management</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <History size={16} className="text-[#00E5FF]" />
              <h3 className="text-white font-semibold font-heading">Login History</h3>
            </div>
            <p className="text-[#94A3B8] text-sm">Recent admin login attempts</p>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeader>Admin</TableHeader>
                  <TableHeader>IP</TableHeader>
                  <TableHeader>Device</TableHeader>
                  <TableHeader>Location</TableHeader>
                  <TableHeader>Status</TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {loginHistory.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="text-xs text-[#00E5FF]">{entry.admin}</TableCell>
                    <TableCell className="font-mono text-xs text-[#94A3B8]">{entry.ip}</TableCell>
                    <TableCell className="text-xs text-[#94A3B8]">{entry.device}</TableCell>
                    <TableCell className="text-xs">{entry.location}</TableCell>
                    <TableCell>
                      {entry.success ? (
                        <Badge variant="success">
                          <CheckCircle size={10} className="mr-1" />
                          Success
                        </Badge>
                      ) : (
                        <Badge variant="danger">
                          <XCircle size={10} className="mr-1" />
                          Failed
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Globe size={16} className="text-[#7B61FF]" />
              <h3 className="text-white font-semibold font-heading">Active Sessions</h3>
            </div>
            <p className="text-[#94A3B8] text-sm">Currently active admin sessions</p>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeader>Admin</TableHeader>
                  <TableHeader>Device</TableHeader>
                  <TableHeader>IP</TableHeader>
                  <TableHeader>Last Active</TableHeader>
                  <TableHeader>Status</TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {activeSessions.map((session) => (
                  <TableRow key={session.id}>
                    <TableCell className="text-xs text-[#00E5FF]">{session.admin}</TableCell>
                    <TableCell className="text-xs text-[#94A3B8]">{session.device}</TableCell>
                    <TableCell className="font-mono text-xs text-[#94A3B8]">{session.ip}</TableCell>
                    <TableCell className="text-xs text-[#94A3B8]">{formatRelativeTime(session.lastActive)}</TableCell>
                    <TableCell>
                      {session.current ? (
                        <Badge variant="success">Current</Badge>
                      ) : (
                        <Badge variant="default">Active</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="mt-4">
              <Button variant="danger" size="sm">
                <XCircle size={14} />
                Revoke All Sessions
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Key size={16} className="text-[#FFB800]" />
            <h3 className="text-white font-semibold font-heading">Permission Settings</h3>
          </div>
          <p className="text-[#94A3B8] text-sm">Admin role permissions</p>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHead>
              <TableRow>
                <TableHeader>Role</TableHeader>
                <TableHeader>Users</TableHeader>
                <TableHeader>Permissions</TableHeader>
                <TableHeader>Actions</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {adminPermissions.map((role, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Shield size={14} className={i === 0 ? 'text-[#FFB800]' : 'text-[#94A3B8]'} />
                      <span className="text-white">{role.role}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono">{role.users}</TableCell>
                  <TableCell className="text-xs text-[#94A3B8]">{role.permissions.join(', ')}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">Edit</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-[#FF5C7A]" />
            <h3 className="text-white font-semibold font-heading">Audit Log</h3>
          </div>
          <p className="text-[#94A3B8] text-sm">Sensitive admin actions</p>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHead>
              <TableRow>
                <TableHeader>Admin</TableHeader>
                <TableHeader>Action</TableHeader>
                <TableHeader>Target</TableHeader>
                <TableHeader>Date</TableHeader>
                <TableHeader>IP</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell className="text-xs text-[#00E5FF]">admin@cylix.io</TableCell>
                <TableCell className="text-xs">User suspended</TableCell>
                <TableCell className="font-mono text-xs">0x3m4n...5o6p</TableCell>
                <TableCell className="text-xs text-[#94A3B8]">{formatDate('2026-06-22T10:30:00')}</TableCell>
                <TableCell className="font-mono text-xs text-[#94A3B8]">192.168.1.100</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="text-xs text-[#00E5FF]">super@cylix.io</TableCell>
                <TableCell className="text-xs">Package created</TableCell>
                <TableCell className="text-xs">Ultimate Package</TableCell>
                <TableCell className="text-xs text-[#94A3B8]">{formatDate('2026-06-21T14:45:00')}</TableCell>
                <TableCell className="font-mono text-xs text-[#94A3B8]">10.0.0.45</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="text-xs text-[#00E5FF]">admin@cylix.io</TableCell>
                <TableCell className="text-xs">Withdrawal approved</TableCell>
                <TableCell className="font-mono text-xs">0x7q8r...9s0t</TableCell>
                <TableCell className="text-xs text-[#94A3B8]">{formatDate('2026-06-20T16:00:00')}</TableCell>
                <TableCell className="font-mono text-xs text-[#94A3B8]">192.168.1.100</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
