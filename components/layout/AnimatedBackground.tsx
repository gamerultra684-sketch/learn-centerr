'use client';

export default function AnimatedBackground() {
  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none transition-opacity duration-500 bg-[#f8fafc] dark:bg-[#030712]">
      {/* Deep Purple/Fuchsia Blob */}
      <div
        className="absolute bg-fuchsia-400/20 dark:bg-fuchsia-600/30 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[150px] dark:blur-[180px] opacity-70"
        style={{
          top: '-15%', left: '-10%',
          width: '60%', height: '60%',
          animation: 'blob 18s infinite',
        }}
      />
      {/* Cyan/Teal Blob */}
      <div
        className="absolute bg-cyan-400/20 dark:bg-cyan-500/25 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[150px] dark:blur-[180px] opacity-70"
        style={{
          top: '20%', right: '-15%',
          width: '65%', height: '65%',
          animation: 'blob 22s infinite 5s',
        }}
      />
      {/* Indigo Blob */}
      <div
        className="absolute bg-indigo-400/20 dark:bg-indigo-600/30 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[160px] dark:blur-[200px] opacity-70"
        style={{
          bottom: '-25%', left: '15%',
          width: '75%', height: '75%',
          animation: 'blob 25s infinite 10s',
        }}
      />
    </div>
  );
}
