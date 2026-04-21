'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaUsers, FaQuestionCircle, FaLayerGroup, FaStickyNote, FaCog, FaArrowRight, FaChartBar } from 'react-icons/fa';
import { useAuth } from '@/lib/auth-context';
import GlassCard from '@/components/ui/GlassCard';
import StatsCard from '@/components/ui/StatsCard';
import { formatDateTime, calcPercentage, calculateGrade, getGradeColor } from '@/lib/utils';

export default function AdminDashboard() {
  const { user, isAdmin, isLoading } = useAuth();
  const router = useRouter();

  const [stats, setStats] = useState({ total_users: 0, quiz_attempts: 0, avg_score: 0, total_notes: 0 });
  const [recentAttempts, setRecentAttempts] = useState<any[]>([]);
  const [adminLinks, setAdminLinks] = useState([
    { href: '/admin/users',     icon: <FaUsers />,         label: 'Kelola Pengguna',  count: 0, color: 'bg-blue-500' },
    { href: '/admin/quizzes',   icon: <FaQuestionCircle />,label: 'Kelola Quiz',       count: 0, color: 'bg-green-500' },
    { href: '/admin/flashcards',icon: <FaLayerGroup />,    label: 'Kelola Flashcard',  count: 0, color: 'bg-purple-500' },
    { href: '/admin/notes',     icon: <FaStickyNote />,    label: 'Kelola Catatan',    count: 0, color: 'bg-orange-500' },
  ]);

  useEffect(() => {
    if (!isLoading && (!user || !isAdmin)) {
      router.push('/login');
      return;
    }
    if (!isLoading && isAdmin) {
      loadData();
    }
  }, [user, isAdmin, isLoading, router]);

  async function loadData() {
    try {
      const [usersRes, quizzesRes, notesRes, attemptsRes] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/admin/quizzes'),
        fetch('/api/admin/notes-stats'),
        fetch('/api/admin/recent-attempts'),
      ]);

      const [usersJson, quizzesJson] = await Promise.all([
        usersRes.ok ? usersRes.json() : { data: [] },
        quizzesRes.ok ? quizzesRes.json() : { data: [] },
      ]);

      const usersCount = (usersJson.data || []).length;
      const quizzesCount = (quizzesJson.data || []).length;

      setAdminLinks(prev => prev.map(l => {
        if (l.href === '/admin/users') return { ...l, count: usersCount };
        if (l.href === '/admin/quizzes') return { ...l, count: quizzesCount };
        return l;
      }));

      setStats(prev => ({
        ...prev,
        total_users: usersCount,
      }));
    } catch (err) {
      console.error('Failed to load admin data:', err);
    }
  }

  if (isLoading || !user || !isAdmin) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full text-sm font-medium mb-2">
            <FaCog className="animate-spin-slow" /> Admin Panel
          </div>
          <h1 className="text-3xl font-bold">Panel Admin</h1>
          <p className="text-gray-500 dark:text-gray-400">Kelola konten, pengguna, dan pengaturan platform</p>
        </div>
        <Link href="/dashboard" className="px-4 py-2 glass rounded-xl text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
          Dashboard User
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard label="Total Pengguna" value={stats.total_users}
          icon={<FaUsers className="text-xl" />} colorClass="blue"
          iconBgClass="bg-blue-100/50 dark:bg-blue-900/40" iconColorClass="text-blue-600 dark:text-blue-400"
          gradientClass="from-blue-600 to-blue-400 dark:from-blue-400 dark:to-blue-300" overlayClass="bg-blue-500/10 dark:bg-blue-500/20" />
        <StatsCard label="Total Quiz" value={adminLinks.find(l => l.href === '/admin/quizzes')?.count ?? 0}
          icon={<FaQuestionCircle className="text-xl" />} colorClass="green"
          iconBgClass="bg-green-100/50 dark:bg-green-900/40" iconColorClass="text-green-600 dark:text-green-400"
          gradientClass="from-green-600 to-green-400 dark:from-green-400 dark:to-green-300" overlayClass="bg-green-500/10 dark:bg-green-500/20" />
        <StatsCard label="Rata-rata Nilai" value={`${stats.avg_score}%`}
          icon={<FaChartBar className="text-xl" />} colorClass="purple"
          iconBgClass="bg-purple-100/50 dark:bg-purple-900/40" iconColorClass="text-purple-600 dark:text-purple-400"
          gradientClass="from-purple-600 to-purple-400 dark:from-purple-400 dark:to-purple-300" overlayClass="bg-purple-500/10 dark:bg-purple-500/20" />
        <StatsCard label="Total Catatan" value={stats.total_notes}
          icon={<FaStickyNote className="text-xl" />} colorClass="orange"
          iconBgClass="bg-orange-100/50 dark:bg-orange-900/40" iconColorClass="text-orange-600 dark:text-orange-400"
          gradientClass="from-orange-600 to-orange-400 dark:from-orange-400 dark:to-orange-300" overlayClass="bg-orange-500/10 dark:bg-orange-500/20" />
      </div>

      {/* Admin nav cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {adminLinks.map((l) => (
          <Link key={l.href} href={l.href} className="glass rounded-2xl p-5 card-hover group border border-white/20 dark:border-gray-700/50 flex items-center gap-4">
            <div className={`w-12 h-12 ${l.color} rounded-xl flex items-center justify-center text-white text-xl flex-shrink-0 group-hover:scale-110 transition-transform`}>{l.icon}</div>
            <div>
              <div className="font-bold">{l.label}</div>
              <div className="text-sm text-gray-500">{l.count} item</div>
            </div>
            <FaArrowRight className="ml-auto text-gray-400 group-hover:text-primary-500 transition-colors" />
          </Link>
        ))}
      </div>

      {/* Quick links */}
      <GlassCard>
        <h2 className="text-xl font-bold mb-4">Aksi Cepat Admin</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <Link href="/admin/quizzes/create" className="flex items-center gap-3 p-4 rounded-xl bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors">
            <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center text-white flex-shrink-0">
              <FaQuestionCircle />
            </div>
            <div>
              <div className="font-medium text-sm">Buat Quiz Baru</div>
              <div className="text-xs text-gray-500">Tambah quiz untuk pengguna</div>
            </div>
          </Link>
          <Link href="/admin/notes" className="flex items-center gap-3 p-4 rounded-xl bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors">
            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white flex-shrink-0">
              <FaStickyNote />
            </div>
            <div>
              <div className="font-medium text-sm">Lihat Semua Catatan</div>
              <div className="text-xs text-gray-500">Moderasi catatan pengguna</div>
            </div>
          </Link>
          <Link href="/admin/users" className="flex items-center gap-3 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
            <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center text-white flex-shrink-0">
              <FaUsers />
            </div>
            <div>
              <div className="font-medium text-sm">Kelola Pengguna</div>
              <div className="text-xs text-gray-500">Ubah role dan kelola akun</div>
            </div>
          </Link>
        </div>
      </GlassCard>
    </div>
  );
}
