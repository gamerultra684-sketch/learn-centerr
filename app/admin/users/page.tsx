'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaArrowLeft, FaEdit, FaTrash, FaUserShield, FaUser, FaSearch } from 'react-icons/fa';
import { useAuth } from '@/lib/auth-context';
import GlassCard from '@/components/ui/GlassCard';
import Badge from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';

export default function ManageUsersPage() {
  const { user, isAdmin, isLoading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!isLoading && (!user || !isAdmin)) {
      router.push('/login');
      return;
    }
    if (!isLoading && isAdmin) {
      fetchUsers();
    }
  }, [user, isAdmin, isLoading, router]);

  async function fetchUsers() {
    try {
      const res = await fetch('/api/admin/users');
      const json = await res.json();
      if (json.data) setUsers(json.data);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  }

  if (isLoading || !user || !isAdmin) return null;

  const filtered = users.filter(u =>
    u.username?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin" className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary-600"><FaArrowLeft /> Admin</Link>
        <span className="text-gray-300 dark:text-gray-600">/</span>
        <h1 className="text-2xl font-bold">Kelola Pengguna</h1>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <GlassCard className="flex-1 mb-0">
          <p className="text-sm text-gray-500">Total: <span className="font-bold text-gray-800 dark:text-white">{users.length}</span> pengguna terdaftar</p>
        </GlassCard>
        <div className="relative">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari username..."
            className="pl-11 pr-4 py-3 glass rounded-xl border border-white/20 dark:border-gray-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      <GlassCard padding="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-gray-200 dark:border-gray-700">
                {['Avatar','Username','Role','Bergabung'].map((h) => (
                  <th key={h} className="px-6 py-4 text-gray-500 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {loading ? (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-400">Memuat...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-400">Tidak ada pengguna ditemukan</td></tr>
              ) : filtered.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {u.username?.[0]?.toUpperCase() ?? '?'}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium">{u.username}</td>
                  <td className="px-6 py-4">
                    <Badge variant={u.role === 'admin' ? 'danger' : 'info'}>
                      {u.role === 'admin' ? <FaUserShield className="mr-1" /> : <FaUser className="mr-1" />}
                      {u.role}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{formatDate(u.created_at, { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
