'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaPlus, FaSearch, FaStickyNote, FaEye, FaLock, FaGlobe, FaFolder, FaFolderOpen, FaTrash } from 'react-icons/fa';
import GlassCard from '@/components/ui/GlassCard';
import Badge from '@/components/ui/Badge';
import { formatDate, stripHtml, truncate } from '@/lib/utils';
import { useAuth } from '@/lib/auth-context';

export default function NotesPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [notes, setNotes] = useState<any[]>([]);
  const [folders, setFolders] = useState<any[]>([]);
  const [activeFolder, setActiveFolder] = useState<string | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [loadingFolders, setLoadingFolders] = useState(true);
  const [newFolderName, setNewFolderName] = useState('');

  useEffect(() => {
    fetchFolders();
  }, []);

  useEffect(() => {
    fetchNotes(activeFolder);
  }, [activeFolder]);

  async function fetchFolders() {
    setLoadingFolders(true);
    try {
      const res = await fetch('/api/folders');
      const json = await res.json();
      if (json.data) setFolders(json.data);
    } catch (err) {
      console.error('Failed to fetch folders', err);
    } finally {
      setLoadingFolders(false);
    }
  }

  async function fetchNotes(folderId: string | null) {
    setLoading(true);
    try {
      let url = '/api/notes';
      if (folderId) url += `?folder_id=${folderId}`;
      const res = await fetch(url);
      const json = await res.json();
      if (json.data) setNotes(json.data);
    } catch (err) {
      console.error('Failed to fetch notes', err);
    } finally {
      setLoading(false);
    }
  }

  async function createFolder(e: React.FormEvent) {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    try {
      const res = await fetch('/api/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newFolderName })
      });
      if (res.ok) {
        setNewFolderName('');
        fetchFolders();
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function deleteFolder(id: string) {
    if (!confirm('Hapus folder ini? Catatan di dalamnya tidak akan terhapus, hanya dikeluarkan dari folder.')) return;
    try {
      await fetch(`/api/folders/${id}`, { method: 'DELETE' });
      if (activeFolder === id) setActiveFolder(null);
      fetchFolders();
    } catch (err) {
      console.error(err);
    }
  }

  const filtered = notes.filter((n) =>
    n.title?.toLowerCase().includes(search.toLowerCase()) ||
    (n.subject ?? '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
      
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Sidebar Folders */}
        <div className="w-full md:w-64 flex-shrink-0 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-bold text-lg text-gray-800 dark:text-gray-200">Folder Saya</h2>
          </div>
          
          <div className="space-y-1">
            <button
              onClick={() => setActiveFolder(null)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-sm font-medium ${
                activeFolder === null 
                  ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400' 
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/50'
              }`}
            >
              <FaStickyNote /> Semua Catatan
            </button>
            
            {loadingFolders ? (
              <p className="text-xs text-gray-500 py-2 px-4">Memuat folder...</p>
            ) : (
              folders.map((f) => (
                <div key={f.id} className="group relative flex items-center">
                  <button
                    onClick={() => setActiveFolder(f.id)}
                    className={`flex-1 flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-sm font-medium ${
                      activeFolder === f.id 
                        ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400' 
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/50'
                    }`}
                  >
                    {activeFolder === f.id ? <FaFolderOpen /> : <FaFolder />} {f.name}
                  </button>
                  <button onClick={() => deleteFolder(f.id)} className="absolute right-2 opacity-0 group-hover:opacity-100 p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all">
                    <FaTrash className="text-xs" />
                  </button>
                </div>
              ))
            )}
          </div>

          <form onSubmit={createFolder} className="mt-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Folder baru..."
                className="flex-1 min-w-0 px-3 py-2 text-sm glass rounded-lg border border-white/20 dark:border-gray-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button type="submit" disabled={!newFolderName.trim()} className="px-3 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-primary-500 hover:text-white transition-colors disabled:opacity-50">
                <FaPlus className="text-xs" />
              </button>
            </div>
          </form>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold mb-1">
                {activeFolder ? folders.find(f => f.id === activeFolder)?.name : 'Semua Catatan'}
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Kelola dan jelajahi catatan pribadi Anda</p>
            </div>
            <Link href={`/notes/create${activeFolder ? `?folder_id=${activeFolder}` : ''}`} className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors text-sm font-medium">
              <FaPlus /> Buat Catatan
            </Link>
          </div>

          {/* Search */}
          <div className="relative mb-6">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari catatan..."
              className="w-full pl-11 pr-4 py-3 glass rounded-xl border border-white/20 dark:border-gray-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {loading ? (
            <div className="text-center py-20">
              <p className="text-gray-500">Memuat catatan...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 glass rounded-2xl">
              <FaStickyNote className="text-5xl text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500">Belum ada catatan ditemukan di kategori ini</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {filtered.map((note) => (
                <GlassCard key={note.id} hover className="flex flex-col">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {note.is_public
                        ? <Badge variant="success"><FaGlobe className="mr-1 text-[10px]" />Publik</Badge>
                        : <Badge variant="warning"><FaLock className="mr-1 text-[10px]" />Pribadi</Badge>
                      }
                      {note.subject && <Badge variant="info">{note.subject}</Badge>}
                    </div>
                  </div>
                  <h3 className="font-bold text-lg mb-2 line-clamp-2">{note.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 flex-1 line-clamp-3">
                    {truncate(stripHtml(note.content || ''), 120)}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-400 pt-3 border-t border-gray-100 dark:border-gray-700">
                    <span>{formatDate(note.created_at, { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    <Link href={`/notes/${note.id}`} className="flex items-center gap-1 text-primary-600 hover:text-primary-700 font-medium">
                      <FaEye /> Baca
                    </Link>
                  </div>
                </GlassCard>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
