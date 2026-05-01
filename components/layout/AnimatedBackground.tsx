'use client';

export default function AnimatedBackground() {
  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none transition-opacity duration-500 bg-[#f8fafc] dark:bg-[#030712]">
      {/* Light Blue Blob */}
      <div
        className="absolute bg-blue-200/50 dark:bg-blue-900/30 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[150px] dark:blur-[180px] opacity-70"
        style={{
          top: '-15%', left: '-10%',
          width: '60%', height: '60%',
          animation: 'blob 18s infinite',
        }}
      />
      {/* Light Purple Blob */}
      <div
        className="absolute bg-purple-200/50 dark:bg-purple-900/30 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[150px] dark:blur-[180px] opacity-70"
        style={{
          top: '20%', right: '-15%',
          width: '65%', height: '65%',
          animation: 'blob 22s infinite 5s',
        }}
      />
      {/* Light Pink Blob */}
      <div
        className="absolute bg-pink-200/50 dark:bg-pink-900/30 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[160px] dark:blur-[200px] opacity-70"
        style={{
          bottom: '-25%', left: '15%',
          width: '75%', height: '75%',
          animation: 'blob 25s infinite 10s',
        }}
      />
    </div>
  );
}
