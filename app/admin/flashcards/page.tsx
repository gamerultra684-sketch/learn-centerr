'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaArrowLeft, FaTrash, FaEdit, FaLayerGroup, FaPlus, FaSpinner } from 'react-icons/fa';
import { useAuth } from '@/lib/auth-context';
import GlassCard from '@/components/ui/GlassCard';
import Badge from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';

export default function AdminFlashcardsPage() {
  const { user, isAdmin, isLoading } = useAuth();
  const router = useRouter();
  const [decks, setDecks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { 
    if (!isLoading && (!user || !isAdmin)) router.push('/login'); 
  }, [user, isAdmin, isLoading, router]);

  useEffect(() => {
    if (isAdmin) fetchDecks();
  }, [isAdmin]);

  async function fetchDecks() {
    try {
      const res = await fetch('/api/admin/flashcards');
      const json = await res.json();
      if (json.data) setDecks(json.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Yakin ingin menghapus flashcard deck ini? Semua kartu di dalamnya akan terhapus.')) return;
    try {
      const res = await fetch(`/api/admin/flashcards/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setDecks((prev) => prev.filter((d) => d.id !== id));
      } else {
        alert('Gagal menghapus');
      }
    } catch (err) {
      alert('Error saat menghapus');
    }
  }

  if (isLoading || !user || !isAdmin) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary-600"><FaArrowLeft /> Admin</Link>
          <span className="text-gray-300 dark:text-gray-600">/</span>
          <h1 className="text-2xl font-bold">Kelola Flashcard</h1>
        </div>
        <Link href="/admin/flashcards/create" className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors text-sm font-medium">
          <FaPlus /> Buat Flashcard Baru
        </Link>
      </div>

      <GlassCard padding="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-gray-200 dark:border-gray-700">
                {['Deck','Subjek','Kartu','Status','Dibuat','Aksi'].map((h) => (
                  <th key={h} className="px-6 py-4 text-gray-500 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-400"><FaSpinner className="animate-spin inline mr-2" /> Memuat...</td></tr>
              ) : decks.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-400">Tidak ada data flashcard</td></tr>
              ) : decks.map((d) => (
                <tr key={d.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <FaLayerGroup className="text-purple-500 flex-shrink-0" />
                      <span className="font-medium">{d.title}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4"><Badge variant="purple">{d.subject}</Badge></td>
                  <td className="px-6 py-4">{d.card_count} kartu</td>
                  <td className="px-6 py-4"><Badge variant={d.is_active ? 'success' : 'danger'}>{d.is_active ? 'Aktif' : 'Nonaktif'}</Badge></td>
                  <td className="px-6 py-4 text-gray-500">{formatDate(d.created_at, { day:'numeric', month:'short', year:'numeric' })}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <Link href={`/admin/flashcards/edit/${d.id}`} className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                        <FaEdit />
                      </Link>
                      <button onClick={() => handleDelete(d.id)} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
