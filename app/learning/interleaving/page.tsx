'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaArrowLeft, FaRandom, FaCheck, FaTimes, FaRedo } from 'react-icons/fa';
import GlassCard from '@/components/ui/GlassCard';
import Badge from '@/components/ui/Badge';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';

export default function InterleavingPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<string | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) router.push('/login');
    if (user) fetchQuestions();
  }, [user, isLoading, router]);

  async function fetchQuestions() {
    setLoading(true);
    setShowAnswer(false);
    setSelectedOpt(null);
    setCurrentIndex(0);
    try {
      const res = await fetch('/api/learning/interleaving?limit=10');
      const json = await res.json();
      if (json.data) setQuestions(json.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (isLoading || !user) return null;

  const currentQ = questions[currentIndex];

  function handleNext() {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOpt(null);
      setShowAnswer(false);
    }
  }

  function renderOptions() {
    if (!currentQ || !currentQ.options) return null;
    return (
      <div className="space-y-3 mb-6">
        {currentQ.options.map((opt: string, i: number) => {
          const chosen = selectedOpt === opt;
          let cls = 'border-2 border-transparent glass';
          
          if (chosen && !showAnswer) cls = 'border-2 border-primary-500 bg-primary-50 dark:bg-primary-900/20';
          
          return (
            <button key={i} onClick={() => !showAnswer && setSelectedOpt(opt)}
              className={`w-full flex items-center gap-4 p-4 rounded-xl text-left transition-all ${cls} ${!showAnswer && !chosen ? 'hover:border-primary-300' : ''}`}>
              <span className="w-8 h-8 rounded-full border-2 border-current flex items-center justify-center text-sm font-bold flex-shrink-0">
                {String.fromCharCode(65 + i)}
              </span>
              <span className="flex-1">{opt}</span>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 relative z-10">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/learning" className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary-600 transition-colors">
          <FaArrowLeft /> Kembali ke Metode Pembelajaran
        </Link>
      </div>

      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-3xl shadow-lg mb-4">
          <FaRandom />
        </div>
        <h1 className="text-3xl font-bold mb-2">Interleaving Practice</h1>
        <p className="text-gray-500 dark:text-gray-400">Latihan campuran dari berbagai mata pelajaran untuk memperkuat retensi memori.</p>
      </div>

      {loading ? (
        <div className="text-center py-20"><p className="text-gray-500">Menyiapkan soal acak...</p></div>
      ) : questions.length === 0 ? (
        <div className="text-center py-20"><p className="text-gray-500">Tidak ada soal yang tersedia.</p></div>
      ) : (
        <GlassCard>
          <div className="flex justify-between items-center mb-6">
            <Badge variant="purple">{currentQ.subject || 'Campuran'} • {currentQ.quiz_title}</Badge>
            <span className="text-sm font-bold text-gray-500">Soal {currentIndex + 1} dari {questions.length}</span>
          </div>

          <h2 className="text-xl font-bold mb-6">{currentQ.question}</h2>

          {renderOptions()}

          {showAnswer && currentQ.explanation && (
            <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 mb-6">
              <h4 className="font-bold text-blue-800 dark:text-blue-300 mb-1">Penjelasan Singkat</h4>
              <p className="text-sm text-blue-600 dark:text-blue-400">{currentQ.explanation}</p>
            </div>
          )}

          <div className="flex justify-between border-t border-gray-100 dark:border-gray-800 pt-6">
            <button onClick={fetchQuestions} className="px-4 py-2 text-gray-500 hover:text-gray-700 font-medium flex items-center gap-2">
              <FaRedo /> Acak Ulang
            </button>
            <div className="flex gap-3">
              {!showAnswer ? (
                <button 
                  onClick={() => setShowAnswer(true)} 
                  disabled={!selectedOpt}
                  className="px-6 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50 font-medium transition-colors"
                >
                  Cek Jawaban
                </button>
              ) : currentIndex < questions.length - 1 ? (
                <button 
                  onClick={handleNext} 
                  className="px-6 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 font-medium transition-colors"
                >
                  Selanjutnya
                </button>
              ) : (
                <button 
                  onClick={fetchQuestions} 
                  className="px-6 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 font-medium transition-colors"
                >
                  Selesai & Ulangi
                </button>
              )}
            </div>
          </div>
        </GlassCard>
      )}
    </div>
  );
}
