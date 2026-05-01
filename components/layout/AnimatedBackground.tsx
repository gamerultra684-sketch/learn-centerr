'use client';

export default function AnimatedBackground() {
  return (
    <div
      className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none"
      style={{ backgroundColor: '#f8fafc' }}
    >
      {/* Blue Blob — top left */}
      <div
        className="absolute rounded-full"
        style={{
          top: '-10%',
          left: '-10%',
          width: '55%',
          height: '55%',
          background: 'radial-gradient(circle, rgba(147,197,253,0.7) 0%, rgba(196,181,253,0.3) 70%, transparent 100%)',
          filter: 'blur(80px)',
          animation: 'blob 18s infinite',
        }}
      />
      {/* Purple Blob — top right */}
      <div
        className="absolute rounded-full"
        style={{
          top: '5%',
          right: '-10%',
          width: '50%',
          height: '50%',
          background: 'radial-gradient(circle, rgba(196,181,253,0.7) 0%, rgba(249,168,212,0.3) 70%, transparent 100%)',
          filter: 'blur(80px)',
          animation: 'blob 22s infinite 5s',
        }}
      />
      {/* Pink Blob — bottom center */}
      <div
        className="absolute rounded-full"
        style={{
          bottom: '-10%',
          left: '15%',
          width: '65%',
          height: '65%',
          background: 'radial-gradient(circle, rgba(249,168,212,0.65) 0%, rgba(147,197,253,0.2) 70%, transparent 100%)',
          filter: 'blur(90px)',
          animation: 'blob 25s infinite 10s',
        }}
      />
    </div>
  );
}
