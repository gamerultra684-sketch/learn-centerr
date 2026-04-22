'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import {
  FaPlay, FaInfoCircle,
  FaQuestionCircle, FaLayerGroup, FaStickyNote, FaLightbulb,
  FaCheckCircle, FaArrowRight,
  FaCheck, FaBrain,
  FaStar, FaStarHalfAlt,
} from 'react-icons/fa';

// ── Learning Methods — ported from functions.php getLearningMethods() ─────
const learningMethods = [
  {
    id: 'feynman',
    name: 'Teknik Feynman',
    description: 'Ajarkan kembali apa yang Anda pelajari dengan kata-kata sederhana untuk menguji pemahaman mendalam.',
    icon: 'brain',
    color: 'from-blue-400 to-blue-600',
    steps: ['Pilih konsep yang ingin dipelajari', 'Jelaskan dengan bahasa sederhana', 'Identifikasi celah pengetahuan'],
  },
  {
    id: 'blurting',
    name: 'Blurting Method',
    description: 'Tulis semua yang Anda ingat tentang suatu topik tanpa melihat catatan untuk memperkuat memori.',
    icon: 'pencil-alt',
    color: 'from-purple-400 to-purple-600',
    steps: ['Baca materi sekali dengan seksama', 'Tutup buku dan tulis semua yang diingat', 'Bandingkan dengan sumber asli'],
  },
  {
    id: 'mindpalace',
    name: 'Mind Palace',
    description: 'Visualisasikan informasi di lokasi-lokasi yang familiar untuk meningkatkan daya ingat jangka panjang.',
    icon: 'home',
    color: 'from-green-400 to-green-600',
    steps: ['Pilih lokasi yang familiar', 'Tempatkan informasi di setiap sudut', 'Bayangkan berjalan melalui lokasi tersebut'],
  },
  {
    id: 'sq3r',
    name: 'Metode SQ3R',
    description: 'Survey, Question, Read, Recite, Review — pendekatan sistematis untuk membaca aktif dan memahami teks.',
    icon: 'book-open',
    color: 'from-orange-400 to-orange-600',
    steps: ['Survey: lihat sekilas keseluruhan', 'Question: buat pertanyaan dari judul', 'Read, Recite, Review'],
  },
  {
    id: 'pomodoro',
    name: 'Teknik Pomodoro',
    description: 'Belajar dalam interval 25 menit diikuti istirahat singkat untuk menjaga fokus dan produktivitas.',
    icon: 'clock',
    color: 'from-red-400 to-red-600',
    steps: ['Set timer 25 menit', 'Fokus belajar tanpa gangguan', 'Istirahat 5 menit setelah setiap sesi'],
  },
  {
    id: 'spaced',
    name: 'Spaced Repetition',
    description: 'Ulang materi pada interval yang semakin panjang untuk memindahkan informasi ke memori jangka panjang.',
    icon: 'calendar-alt',
    color: 'from-teal-400 to-teal-600',
    steps: ['Pelajari materi baru', 'Ulang setelah 1 hari, lalu 3 hari, lalu 1 minggu', 'Gunakan flashcard untuk efisiensi'],
  },
];

const testimonials = [
  { name: 'Ahmad Rizki', role: 'Mahasiswa Teknik', initial: 'A', color: 'from-blue-400 to-blue-600', rating: 5, text: '"Teknik Feynman di Learn Center sangat membantu saya memahami konsep-konsep sulit. Nilai ujian saya meningkat signifikan!"' },
  { name: 'Siti Nurhaliza', role: 'Siswa SMA', initial: 'S', color: 'from-pink-400 to-pink-600', rating: 5, text: '"Flashcard-nya sangat interaktif dan mudah digunakan. Saya bisa belajar kapan saja, di mana saja. Highly recommended!"' },
  { name: 'Budi Santoso', role: 'Pekerja Profesional', initial: 'B', color: 'from-green-400 to-green-600', rating: 4.5, text: '"Fitur catatannya luar biasa. Saya bisa mengorganisir materi belajar dengan rapi dan berbagi dengan teman-teman."' },
];

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="overflow-x-hidden">

      {/* ─────────────────────── HERO ─────────────────────── */}
      <section className="relative overflow-hidden min-h-[90vh] flex items-center z-10">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">

            {/* Left — Content */}
            <div className="text-center lg:text-left animate-fade-in">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-sm font-medium mb-6">
                <FaStar className="mr-2 text-yellow-400" />
                Platform Belajar #1 di Indonesia
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                Belajar Lebih
                <span className="block gradient-text">Cerdas &amp; Efektif</span>
              </h1>

              <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-xl mx-auto lg:mx-0">
                Tingkatkan pembelajaran Anda dengan berbagai metode terbukti seperti Teknik Feynman, Blurting Method, dan Mind Palace.
                Quiz interaktif, flashcard, dan catatan pintar dalam satu platform.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <Link
                  href="/quiz"
                  className="px-8 py-4 bg-gradient-to-r from-primary-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-primary-500/30 transform hover:-translate-y-1 transition-all btn-ripple flex items-center justify-center"
                >
                  <FaPlay className="mr-2" />
                  Mulai Belajar
                </Link>
                <Link
                  href="#features"
                  className="px-8 py-4 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-semibold border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all flex items-center justify-center"
                >
                  <FaInfoCircle className="mr-2" />
                  Pelajari Lebih
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
                {[
                  { value: '10K+', label: 'Pengguna Aktif' },
                  { value: '500+', label: 'Quiz Tersedia' },
                  { value: '50+',  label: 'Deck Flashcard' },
                ].map((s) => (
                  <div key={s.label}>
                    <div className="text-2xl sm:text-3xl font-bold gradient-text">{s.value}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — Floating illustration (hidden on mobile) */}
            <div className="relative hidden lg:block">
              <div className="relative z-10 animate-float">
                {/* Main card */}
                <div className="glass rounded-2xl p-6 transform rotate-3 hover:rotate-0 transition-transform duration-500 shadow-[0_8px_32px_rgba(0,0,0,0.1)]">
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                  </div>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
                    <div className="flex space-x-2 mt-4">
                      <div className="h-8 bg-primary-500 rounded-lg w-20" />
                      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg w-20" />
                    </div>
                  </div>
                </div>

                {/* Floating badge — correct */}
                <div className="absolute -top-8 -right-8 glass rounded-xl p-4 shadow-[0_8px_32px_rgba(0,0,0,0.1)] animate-bounce-slow">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                      <FaCheck className="text-green-500" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold">Jawaban Benar!</div>
                      <div className="text-xs text-gray-500">+10 poin</div>
                    </div>
                  </div>
                </div>

                {/* Floating badge — streak */}
                <div className="absolute -bottom-4 -left-8 glass rounded-xl p-4 shadow-[0_8px_32px_rgba(0,0,0,0.1)] animate-pulse-slow">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                      <FaBrain className="text-purple-500" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold">Streak 7 Hari</div>
                      <div className="text-xs text-gray-500">Pertahankan!</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Spinning dashed ring */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] border-2 border-dashed border-primary-200 dark:border-primary-800 rounded-full animate-spin-slow" />
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────── FEATURES ─────────────────────── */}
      <section id="features" className="py-20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Fitur Unggulan</h2>
            <p className="max-w-2xl mx-auto text-gray-600 dark:text-gray-400">
              Semua yang Anda butuhkan untuk belajar dengan efektif dalam satu platform
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: <FaQuestionCircle className="text-white text-2xl" />, title: 'Quiz Interaktif', desc: 'Mode Study dan Exam dengan berbagai tipe soal: PG, Essay, Benar/Salah', color: 'from-blue-400 to-blue-600', href: '/quiz', cta: 'Coba Quiz' },
              { icon: <FaLayerGroup className="text-white text-2xl" />, title: 'Flashcard', desc: 'Kartu belajar interaktif dengan animasi flip dan navigasi swipe di mobile', color: 'from-purple-400 to-purple-600', href: '/flashcards', cta: 'Lihat Deck' },
              { icon: <FaStickyNote className="text-white text-2xl" />, title: 'Catatan Pintar', desc: 'Editor rich text dengan upload file, folder management, dan sharing', color: 'from-green-400 to-green-600', href: '/notes', cta: 'Buat Catatan' },
              { icon: <FaLightbulb className="text-white text-2xl" />, title: 'Metode Belajar', desc: 'Pelajari dan praktikkan teknik Feynman, Blurting, Mind Palace, dan lainnya', color: 'from-orange-400 to-orange-600', href: '/learning', cta: 'Eksplorasi' },
            ].map((f) => (
              <div key={f.title} className="group card-hover glass rounded-2xl p-6 text-center shadow-[0_8px_32px_rgba(0,0,0,0.1)]">
                <div className={`w-16 h-16 mx-auto mb-4 bg-gradient-to-br ${f.color} rounded-2xl flex items-center justify-center transform group-hover:scale-110 transition-transform`}>
                  {f.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{f.title}</h3>
                <p className="text-sm mb-4 text-gray-600 dark:text-gray-400">{f.desc}</p>
                <Link href={f.href} className="text-sm font-medium text-primary-600 hover:underline">
                  {f.cta} <FaArrowRight className="inline ml-1" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────── LEARNING METHODS ─────────────────────── */}
      <section className="py-20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Metode Pembelajaran</h2>
            <p className="max-w-2xl mx-auto text-gray-600 dark:text-gray-400">
              Gunakan metode belajar terbukti yang digunakan oleh para ahli dan pembelajar sukses
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {learningMethods.map((method, index) => (
              <div
                key={method.id}
                className="group card-hover glass rounded-2xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.1)]"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`h-2 bg-gradient-to-r ${method.color}`} />
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${method.color} flex items-center justify-center mr-4`}>
                      <FaBrain className="text-white text-xl" />
                    </div>
                    <h3 className="text-xl font-semibold">{method.name}</h3>
                  </div>
                  <p className="mb-4 text-gray-600 dark:text-gray-400">{method.description}</p>
                  <div className="space-y-2 mb-4">
                    {method.steps.map((step) => (
                      <div key={step} className="flex items-start text-sm">
                        <FaCheckCircle className="mt-0.5 mr-2 flex-shrink-0 text-green-500" />
                        <span className="text-gray-600 dark:text-gray-400">{step}</span>
                      </div>
                    ))}
                  </div>
                  <Link
                    href={`/learning`}
                    className="block w-full py-3 text-center rounded-lg font-medium transition-colors bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    Pelajari Lebih Lanjut
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────── HOW IT WORKS ─────────────────────── */}
      <section className="py-20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Cara Kerja</h2>
            <p className="max-w-2xl mx-auto text-gray-600 dark:text-gray-400">Mulai belajar dalam 3 langkah mudah</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'Pilih Materi', desc: 'Pilih dari ratusan quiz, flashcard deck, atau buat catatan Anda sendiri', gradient: 'from-primary-500 to-primary-600', shadow: 'shadow-primary-500/30' },
              { step: '2', title: 'Belajar & Latihan', desc: 'Gunakan mode Study untuk belajar atau Exam untuk menguji pemahaman', gradient: 'from-purple-500 to-purple-600', shadow: 'shadow-purple-500/30' },
              { step: '3', title: 'Lacak Progres', desc: 'Pantau perkembangan Anda dengan statistik dan analisis detail', gradient: 'from-green-500 to-green-600', shadow: 'shadow-green-500/30' },
            ].map((item, i) => (
              <div key={item.step} className="relative text-center">
                <div className={`w-20 h-20 mx-auto mb-6 bg-gradient-to-br ${item.gradient} rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg ${item.shadow}`}>
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{item.desc}</p>
                {/* Arrow connector */}
                {i < 2 && (
                  <div className="hidden md:block absolute top-10 left-full w-full" style={{ zIndex: 0 }}>
                    <svg className="w-full h-8 text-gray-300 dark:text-gray-700" viewBox="0 0 100 20" fill="none">
                      <path d="M0 10 H90 M85 5 L90 10 L85 15" stroke="currentColor" strokeWidth="2" fill="none" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────── TESTIMONIALS ─────────────────────── */}
      <section className="py-20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Apa Kata Mereka</h2>
            <p className="max-w-2xl mx-auto text-gray-600 dark:text-gray-400">
              Pengalaman pengguna yang telah menggunakan Learn Center
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((t) => (
              <div key={t.name} className="glass rounded-2xl p-6 card-hover shadow-[0_8px_32px_rgba(0,0,0,0.1)]">
                <div className="flex items-center mb-4">
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center text-white font-bold text-lg`}>
                    {t.initial}
                  </div>
                  <div className="ml-4">
                    <div className="font-semibold">{t.name}</div>
                    <div className="text-sm text-gray-500">{t.role}</div>
                  </div>
                </div>
                <div className="flex mb-3 text-yellow-400">
                  {Array.from({ length: Math.floor(t.rating) }).map((_, i) => (
                    <FaStar key={i} />
                  ))}
                  {t.rating % 1 !== 0 && <FaStarHalfAlt />}
                </div>
                <p className="text-gray-600 dark:text-gray-400">{t.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────── CTA ─────────────────────── */}
      <section className="py-20 relative z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center glass p-12 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.1)]">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Siap untuk Meningkatkan Belajar Anda?</h2>
          <p className="text-lg mb-8 text-gray-600 dark:text-gray-400">
            Bergabung dengan ribuan pengguna lainnya dan mulai perjalanan belajar Anda hari ini
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <Link
                href="/dashboard"
                className="px-8 py-4 bg-white text-primary-600 rounded-xl font-semibold hover:bg-gray-100 transition-colors btn-ripple"
              >
                Dashboard Saya
              </Link>
            ) : (
              <>
                <Link
                  href="/register"
                  className="px-8 py-4 bg-white text-primary-600 rounded-xl font-semibold hover:bg-gray-100 transition-colors btn-ripple"
                >
                  Daftar Gratis
                </Link>
                <Link
                  href="/login"
                  className="px-8 py-4 glass text-gray-800 dark:text-white rounded-xl font-semibold hover:bg-white/10 transition-colors border border-gray-200 dark:border-gray-700"
                >
                  Masuk
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Scroll to top */}
      <button
        id="scrollToTop"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-8 right-8 w-12 h-12 bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-lg z-50 flex items-center justify-center transition-colors"
        aria-label="Scroll to top"
      >
        ↑
      </button>
    </div>
  );
}
