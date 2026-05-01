'use client';

export default function AnimatedBackground() {
  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none transition-opacity duration-500 bg-[#f8fafc] dark:bg-[#030712]">
      {/* Light Blue Blob */}
      <div
        className="absolute bg-blue-300/60 dark:bg-blue-800/40 rounded-full blur-[100px] dark:blur-[120px]"
        style={{
          top: '-10%', left: '-10%',
          width: '50%', height: '50%',
          animation: 'blob 18s infinite',
        }}
      />
      {/* Light Purple Blob */}
      <div
        className="absolute bg-purple-300/60 dark:bg-purple-800/40 rounded-full blur-[100px] dark:blur-[120px]"
        style={{
          top: '10%', right: '-10%',
          width: '50%', height: '50%',
          animation: 'blob 22s infinite 5s',
        }}
      />
      {/* Light Pink Blob */}
      <div
        className="absolute bg-pink-300/60 dark:bg-pink-800/40 rounded-full blur-[100px] dark:blur-[120px]"
        style={{
          bottom: '-15%', left: '10%',
          width: '60%', height: '60%',
          animation: 'blob 25s infinite 10s',
        }}
      />
    </div>
  );
}
