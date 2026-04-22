'use client';

export default function AnimatedBackground() {
  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none transition-opacity duration-300">
      <div
        className="absolute bg-primary-400/30 dark:bg-primary-900/40 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[80px]"
        style={{
          top: '-10%', left: '-10%',
          width: '40%', height: '40%',
          animation: 'blob 7s infinite',
        }}
      />
      <div
        className="absolute bg-purple-400/30 dark:bg-purple-900/40 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[80px]"
        style={{
          top: '20%', right: '-10%',
          width: '35%', height: '35%',
          animation: 'blob 8s infinite 2s',
        }}
      />
      <div
        className="absolute bg-pink-400/30 dark:bg-pink-900/40 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[80px]"
        style={{
          bottom: '-20%', left: '20%',
          width: '50%', height: '50%',
          animation: 'blob 9s infinite 4s',
        }}
      />
    </div>
  );
}
