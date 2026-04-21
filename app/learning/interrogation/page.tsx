'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FaArrowLeft, FaQuestion, FaLightbulb, FaCheck, FaRedo } from 'react-icons/fa';
import GlassCard from '@/components/ui/GlassCard';

export default function InterrogationPage() {
  const [topic, setTopic] = useState('');
  const [fact, setFact] = useState('');
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [whyAnswer, setWhyAnswer] = useState('');

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 relative z-10">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/learning" className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary-600 transition-colors">
          <FaArrowLeft /> Kembali ke Metode Pembelajaran
        </Link>
      </div>

      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white text-3xl shadow-lg mb-4">
          <FaQuestion />
        </div>
        <h1 className="text-3xl font-bold mb-2">Elaborative Interrogation</h1>
        <p className="text-gray-500 dark:text-gray-400">Teknik bertanya "Mengapa?" untuk menghubungkan informasi baru dengan pengetahuan yang sudah ada.</p>
      </div>

      <GlassCard>
        {/* Step Indicator */}
        <div className="flex justify-between items-center mb-8 relative">
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-800 -z-10 -translate-y-1/2"></div>
          <div className="absolute top-1/2 left-0 h-1 bg-primary-500 -z-10 -translate-y-1/2 transition-all duration-500" style={{ width: `${((step - 1) / 2) * 100}%` }}></div>
          
          {[
            { num: 1, label: 'Pilih Fakta' },
            { num: 2, label: 'Tanya Mengapa' },
            { num: 3, label: 'Koneksi' }
          ].map((s) => (
            <div key={s.num} className="text-center bg-white dark:bg-gray-900 px-2">
              <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center text-sm font-bold mb-1 transition-colors ${step >= s.num ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-400 dark:bg-gray-800'}`}>
                {s.num}
              </div>
              <div className={`text-xs font-medium ${step >= s.num ? 'text-primary-600' : 'text-gray-400'}`}>{s.label}</div>
            </div>
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-xl font-bold">Langkah 1: Identifikasi Fakta</h2>
            <p className="text-sm text-gray-500">Pilih satu fakta, konsep, atau aturan yang ingin Anda hafal. Contoh: "Fotosintesis menghasilkan oksigen."</p>
            
            <div>
              <label className="auth-label">Topik (Opsional)</label>
              <input value={topic} onChange={(e) => setTopic(e.target.value)}
                className="w-full px-4 py-3 glass rounded-xl border border-white/20 dark:border-gray-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Biologi Dasar..." />
            </div>
            
            <div>
              <label className="auth-label">Fakta / Konsep</label>
              <textarea value={fact} onChange={(e) => setFact(e.target.value)} required rows={3}
                className="w-full px-4 py-3 glass rounded-xl border border-white/20 dark:border-gray-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                placeholder="Tuliskan fakta yang ingin dipelajari..." />
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-gray-800">
              <button onClick={() => setStep(2)} disabled={!fact.trim()}
                className="px-6 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50 font-medium transition-colors">
                Lanjut
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-xl font-bold">Langkah 2: Tanyakan Mengapa</h2>
            <div className="p-4 rounded-xl bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800">
              <span className="text-xs font-bold text-orange-500 uppercase tracking-wider mb-1 block">Fakta Anda:</span>
              <p className="font-medium text-lg text-gray-800 dark:text-gray-200">"{fact}"</p>
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Sekarang, jawablah pertanyaan ini: <strong>Mengapa fakta tersebut benar atau masuk akal?</strong> Jelaskan dengan menghubungkannya ke pengetahuan yang sudah Anda ketahui sebelumnya.
            </p>

            <div>
              <textarea value={whyAnswer} onChange={(e) => setWhyAnswer(e.target.value)} required rows={4}
                className="w-full px-4 py-3 glass rounded-xl border border-white/20 dark:border-gray-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                placeholder="Karena..." />
            </div>

            <div className="flex justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
              <button onClick={() => setStep(1)} className="px-6 py-2 text-gray-500 hover:text-gray-700 font-medium transition-colors">
                Kembali
              </button>
              <button onClick={() => setStep(3)} disabled={!whyAnswer.trim()}
                className="px-6 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50 font-medium transition-colors">
                Konfirmasi
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-fade-in text-center">
            <div className="w-20 h-20 mx-auto bg-green-100 dark:bg-green-900/30 text-green-500 rounded-full flex items-center justify-center text-4xl mb-4">
              <FaLightbulb />
            </div>
            <h2 className="text-2xl font-bold">Koneksi Berhasil Dibentuk!</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Dengan menjelaskan <strong>"Mengapa"</strong>, otak Anda membuat jalur saraf baru yang menghubungkan informasi ini ke memori jangka panjang. Fakta ini akan jauh lebih mudah diingat.
            </p>

            <div className="text-left p-6 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 space-y-4">
              <div>
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Fakta:</span>
                <p className="font-medium">{fact}</p>
              </div>
              <div className="pl-4 border-l-2 border-primary-500">
                <span className="text-xs font-bold text-primary-500 uppercase tracking-wider block">Alasan Anda:</span>
                <p className="text-gray-700 dark:text-gray-300 italic">"{whyAnswer}"</p>
              </div>
            </div>

            <div className="pt-8">
              <button onClick={() => { setFact(''); setWhyAnswer(''); setStep(1); }}
                className="px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 font-medium transition-colors inline-flex items-center gap-2">
                <FaRedo /> Lakukan dengan Fakta Lain
              </button>
            </div>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
