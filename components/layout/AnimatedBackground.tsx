'use client';

export default function AnimatedBackground() {
  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none transition-opacity duration-300">
      {/* Soft Indigo Blob */}
      <div
        className="absolute bg-indigo-200/30 dark:bg-indigo-900/10 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[120px]"
        style={{
          top: '-10%', left: '-10%',
          width: '50%', height: '50%',
          animation: 'blob 15s infinite',
        }}
      />
      {/* Soft Blue Blob */}
      <div
        className="absolute bg-blue-200/30 dark:bg-slate-800/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[120px]"
        style={{
          top: '20%', right: '-10%',
          width: '60%', height: '60%',
          animation: 'blob 18s infinite 5s',
        }}
      />
      {/* Soft Slate Blob */}
      <div
        className="absolute bg-slate-200/30 dark:bg-slate-900/30 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[140px]"
        style={{
          bottom: '-20%', left: '10%',
          width: '70%', height: '70%',
          animation: 'blob 20s infinite 10s',
        }}
      />
    </div>
  );
}
