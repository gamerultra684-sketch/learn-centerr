'use client';

import { useState, type FormEvent, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaArrowLeft, FaPlus, FaTrash, FaSpinner } from 'react-icons/fa';
import { useAuth } from '@/lib/auth-context';
import GlassCard from '@/components/ui/GlassCard';

interface Card { id?: string; front: string; back: string; }

export default function EditFlashcardPage({ params }: { params: Promise<{ id: string }> }) {
  const { user, isAdmin, isLoading } = useAuth();
  const router = useRouter();
  const unwrappedParams = use(params);
  const deckId = unwrappedParams.id;

  const [meta, setMeta] = useState({ title:'', subject:'', description:'', is_active: true });
  const [cards, setCards] = useState<Card[]>([{ front:'', back:'' }]);
  const [saving, setSaving] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => { if (!isLoading && (!user || !isAdmin)) router.push('/login'); }, [user, isAdmin, isLoading, router]);

  useEffect(() => {
    if (isAdmin && deckId) {
      Promise.all([
        fetch(`/api/admin/flashcards/${deckId}`).then(res => res.json()),
        fetch(`/api/flashcards/${deckId}`).then(res => res.json()) // To get the cards via the public endpoint
      ])
      .then(([deckJson, cardsJson]) => {
        if (deckJson.data) {
          setMeta({
            title: deckJson.data.title || '',
            subject: deckJson.data.subject || '',
            description: deckJson.data.description || '',
            is_active: deckJson.data.is_active ?? true
          });
        }
        if (cardsJson.data && cardsJson.data.flashcards && cardsJson.data.flashcards.length > 0) {
          setCards(cardsJson.data.flashcards.map((c: any) => ({
            id: c.id,
            front: c.front,
            back: c.back
          })));
        } else {
          setCards([{ front:'', back:'' }]);
        }
      })
      .catch(console.error)
      .finally(() => setFetching(false));
    }
  }, [isAdmin, deckId]);

  function updateMeta(k: string, v: any) { setMeta((m) => ({ ...m, [k]: v })); }
  function updateCard(i: number, k: string, v: string) {
    setCards((cs) => cs.map((c, idx) => idx === i ? { ...c, [k]: v } : c));
  }
  function addCard() { setCards((cs) => [...cs, { front:'', back:'' }]); }
  function removeCard(i: number) { setCards((cs) => cs.filter((_, idx) => idx !== i)); }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      // 1. Update Deck
      const dRes = await fetch(`/api/admin/flashcards/${deckId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(meta)
      });
      const dJson = await dRes.json();
      if (!dRes.ok) throw new Error(dJson.error || 'Failed to update deck');

      // 2. Save Cards (Replaces all)
      const cRes = await fetch(`/api/flashcards/${deckId}/cards`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cards)
      });
      if (!cRes.ok) throw new Error('Failed to update cards');

      router.push('/admin/flashcards');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (isLoading || !user || !isAdmin) return null;
  if (fetching) return <div className="text-center py-20"><FaSpinner className="animate-spin inline mr-2" /> Memuat data...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/flashcards" className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary-600"><FaArrowLeft /> Kelola Flashcard</Link>
        <span className="text-gray-300 dark:text-gray-600">/</span>
        <h1 className="text-2xl font-bold">Edit Deck Flashcard</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <GlassCard>
          <h2 className="font-bold text-lg mb-4">Informasi Deck</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="auth-label">Judul Deck</label>
              <input value={meta.title} onChange={(e) => updateMeta('title', e.target.value)} required
                className="w-full px-4 py-3 glass rounded-xl border border-white/20 dark:border-gray-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Misal: Anatomi Tubuh Manusia" />
            </div>
            <div>
              <label className="auth-label">Mata Pelajaran</label>
              <input value={meta.subject} onChange={(e) => updateMeta('subject', e.target.value)} required
                className="w-full px-4 py-3 glass rounded-xl border border-white/20 dark:border-gray-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Biologi, Sejarah..." />
            </div>
            <div>
              <label className="auth-label">Status</label>
              <div className="flex items-center gap-2 mt-2">
                <input type="checkbox" checked={meta.is_active} onChange={(e) => updateMeta('is_active', e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Aktifkan deck agar dapat dipelajari</span>
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="auth-label">Deskripsi</label>
              <textarea value={meta.description} onChange={(e) => updateMeta('description', e.target.value)} rows={2}
                className="w-full px-4 py-3 glass rounded-xl border border-white/20 dark:border-gray-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                placeholder="Deskripsi singkat mengenai isi deck ini..." />
            </div>
          </div>
        </GlassCard>

        {cards.map((c, i) => (
          <GlassCard key={i}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold">Kartu #{i + 1}</h3>
              {cards.length > 1 && (
                <button type="button" onClick={() => removeCard(i)} className="text-red-500 hover:text-red-600 p-1"><FaTrash /></button>
              )}
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="auth-label text-sm text-gray-500">Sisi Depan (Pertanyaan/Istilah)</label>
                <textarea value={c.front} onChange={(e) => updateCard(i, 'front', e.target.value)} required rows={3}
                  className="w-full px-4 py-3 glass rounded-xl border border-white/20 dark:border-gray-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none text-center font-medium"
                  placeholder="Ketik istilah..." />
              </div>
              <div>
                <label className="auth-label text-sm text-gray-500">Sisi Belakang (Jawaban/Definisi)</label>
                <textarea value={c.back} onChange={(e) => updateCard(i, 'back', e.target.value)} required rows={3}
                  className="w-full px-4 py-3 glass rounded-xl border border-white/20 dark:border-gray-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none text-center"
                  placeholder="Ketik definisi..." />
              </div>
            </div>
          </GlassCard>
        ))}

        <button type="button" onClick={addCard}
          className="w-full flex items-center justify-center gap-2 py-3 glass rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-medium border-2 border-dashed border-gray-300 dark:border-gray-600">
          <FaPlus /> Tambah Kartu
        </button>

        <div className="flex justify-end">
          <button type="submit" disabled={saving}
            className="flex items-center gap-2 px-8 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-60 transition-colors font-medium">
            {saving ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : null}
            Perbarui Deck Flashcard
          </button>
        </div>
      </form>
    </div>
  );
}
