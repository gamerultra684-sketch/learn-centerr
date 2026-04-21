'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FaArrowLeft, FaDumbbell, FaBookOpen, FaPen, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import GlassCard from '@/components/ui/GlassCard';

export default function PracticeTestingPage() {
  const [topic, setTopic] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [step, setStep] = useState<1 | 2>(1);
  const [userAnswer, setUserAnswer] = useState('');
  const [selfScore, setSelfScore] = useState<'perfect' | 'partial' | 'wrong' | null>(null);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 relative z-10">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/learning" className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary-600 transition-colors">
          <FaArrowLeft /> Kembali ke Metode Pembelajaran
        </Link>
      </div>

      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-600 text-white text-3xl shadow-lg mb-4">
          <FaDumbbell />
        </div>
        <h1 className="text-3xl font-bold mb-2">Practice Testing</h1>
        <p className="text-gray-500 dark:text-gray-400">Uji diri Anda secara mandiri tanpa melihat materi (Active Recall) untuk memperkuat ingatan.</p>
      </div>

      <GlassCard>
        {step === 1 && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-xl font-bold border-b border-gray-100 dark:border-gray-800 pb-4">Persiapan Latihan</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Pikirkan satu topik yang baru saja Anda pelajari. Buatlah satu pertanyaan mandiri tentang topik tersebut, lalu tutup materi Anda sebelum menjawabnya di langkah selanjutnya.
            </p>
            
            <div>
              <label className="auth-label text-sm text-gray-500">Mata Pelajaran / Topik</label>
              <input value={topic} onChange={(e) => setTopic(e.target.value)}
                className="w-full px-4 py-3 glass rounded-xl border border-white/20 dark:border-gray-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium"
                placeholder="Misal: Sejarah Kemerdekaan..." />
            </div>
            
            <div>
              <label className="auth-label text-sm text-gray-500">Buat Pertanyaan Pengujian</label>
              <textarea value={questionText} onChange={(e) => setQuestionText(e.target.value)} required rows={3}
                className="w-full px-4 py-3 glass rounded-xl border border-white/20 dark:border-gray-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none font-medium"
                placeholder="Tuliskan pertanyaan yang menantang diri Anda untuk mengingat materi..." />
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl flex items-start gap-3 mt-4">
              <FaBookOpen className="text-blue-500 mt-1 flex-shrink-0" />
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <strong>Ingat:</strong> Jangan melihat buku atau catatan saat melanjutkan ke langkah berikutnya. Paksa otak Anda untuk bekerja mengambil memori tersebut.
              </p>
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-gray-800">
              <button onClick={() => setStep(2)} disabled={!questionText.trim()}
                className="px-8 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50 font-bold transition-colors">
                Mulai Menjawab
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-xl font-bold border-b border-gray-100 dark:border-gray-800 pb-4">Sesi Menjawab</h2>
            
            <div className="p-5 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 mb-6">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Pertanyaan Anda:</span>
              <p className="font-semibold text-lg">{questionText}</p>
            </div>

            {!selfScore ? (
              <>
                <div>
                  <label className="auth-label text-sm text-gray-500 flex items-center gap-2"><FaPen className="text-xs"/> Tuliskan Jawaban Anda (Tanpa Melihat Materi)</label>
                  <textarea value={userAnswer} onChange={(e) => setUserAnswer(e.target.value)} required rows={5}
                    className="w-full px-4 py-3 glass rounded-xl border border-white/20 dark:border-gray-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                    placeholder="Cobalah untuk mengingat dan menuliskan sedetail mungkin..." />
                </div>

                <div className="flex justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
                  <button onClick={() => setStep(1)} className="px-6 py-2 text-gray-500 hover:text-gray-700 font-medium transition-colors">
                    Batal
                  </button>
                  <button onClick={() => setSelfScore('partial')} disabled={!userAnswer.trim()}
                    className="px-8 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50 font-bold transition-colors">
                    Periksa Jawaban
                  </button>
                </div>
              </>
            ) : (
              <div className="space-y-6">
                <div>
                  <label className="auth-label text-sm text-gray-500 block mb-2">Jawaban Anda:</label>
                  <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 italic text-gray-700 dark:text-gray-300">
                    {userAnswer}
                  </div>
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-xl border border-yellow-200 dark:border-yellow-800/50">
                  <h4 className="font-bold text-yellow-800 dark:text-yellow-500 mb-2">Evaluasi Diri (Self-Scoring)</h4>
                  <p className="text-sm text-yellow-700 dark:text-yellow-400 mb-4">Sekarang buka materi catatan Anda. Bandingkan jawaban Anda di atas dengan fakta aslinya. Seberapa akurat ingatan Anda?</p>
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button onClick={() => { alert('Hebat! Mengingat dengan benar memperkuat memori secara signifikan.'); setStep(1); setQuestionText(''); setUserAnswer(''); setSelfScore(null); }} 
                      className="flex-1 flex flex-col items-center gap-2 p-3 rounded-lg border-2 border-green-500 hover:bg-green-50 text-green-700 transition-colors">
                      <FaCheckCircle className="text-xl" />
                      <span className="font-bold text-sm">Sangat Akurat</span>
                    </button>
                    <button onClick={() => { alert('Bagus, Anda mengingat sebagian. Pelajari ulang bagian yang terlewat.'); setStep(1); setQuestionText(''); setUserAnswer(''); setSelfScore(null); }}
                      className="flex-1 flex flex-col items-center gap-2 p-3 rounded-lg border-2 border-yellow-500 hover:bg-yellow-50 text-yellow-700 transition-colors">
                      <FaCheckCircle className="text-xl opacity-50" />
                      <span className="font-bold text-sm">Hanya Sebagian</span>
                    </button>
                    <button onClick={() => { alert('Tidak masalah! Ini bukti bahwa Anda perlu meninjau kembali materi ini.'); setStep(1); setQuestionText(''); setUserAnswer(''); setSelfScore(null); }}
                      className="flex-1 flex flex-col items-center gap-2 p-3 rounded-lg border-2 border-red-500 hover:bg-red-50 text-red-700 transition-colors">
                      <FaTimesCircle className="text-xl" />
                      <span className="font-bold text-sm">Salah / Lupa</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </GlassCard>
    </div>
  );
}
