'use client';

export default function AnimatedBackground() {
  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none transition-opacity duration-300">
      {/* Cyan/Blue Aurora */}
      <div
        className="absolute bg-cyan-400/40 dark:bg-cyan-600/30 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[100px]"
        style={{
          top: '-20%', left: '-10%',
          width: '50%', height: '50%',
          animation: 'blob 10s infinite',
        }}
      />
      {/* Purple Aurora */}
      <div
        className="absolute bg-purple-400/40 dark:bg-purple-600/30 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[100px]"
        style={{
          top: '10%', right: '-20%',
          width: '60%', height: '60%',
          animation: 'blob 12s infinite 3s',
        }}
      />
      {/* Pink/Magenta Aurora */}
      <div
        className="absolute bg-pink-400/30 dark:bg-pink-600/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[120px]"
        style={{
          bottom: '-30%', left: '10%',
          width: '70%', height: '70%',
          animation: 'blob 14s infinite 5s',
        }}
      />
    </div>
  );
}
