'use client';

export default function AnimatedBackground() {
  return (
    <div
      className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none"
      style={{
        background: `
          radial-gradient(ellipse 70% 60% at 80% 10%, rgba(196, 181, 253, 0.55) 0%, transparent 70%),
          radial-gradient(ellipse 80% 70% at 10% 20%, rgba(147, 197, 253, 0.45) 0%, transparent 70%),
          radial-gradient(ellipse 90% 80% at 50% 90%, rgba(249, 168, 212, 0.55) 0%, transparent 65%),
          #f8fafc
        `,
      }}
    >
      {/* Animated accent blob — blue left */}
      <div
        className="absolute rounded-full"
        style={{
          top: '-5%',
          left: '-5%',
          width: '45%',
          height: '45%',
          background: 'rgba(147, 197, 253, 0.4)',
          filter: 'blur(70px)',
          animation: 'blob 18s infinite',
        }}
      />
      {/* Animated accent blob — purple right */}
      <div
        className="absolute rounded-full"
        style={{
          top: '0%',
          right: '-5%',
          width: '45%',
          height: '45%',
          background: 'rgba(196, 181, 253, 0.45)',
          filter: 'blur(70px)',
          animation: 'blob 22s infinite 5s',
        }}
      />
      {/* Animated accent blob — pink bottom */}
      <div
        className="absolute rounded-full"
        style={{
          bottom: '-10%',
          left: '20%',
          width: '60%',
          height: '55%',
          background: 'rgba(249, 168, 212, 0.45)',
          filter: 'blur(80px)',
          animation: 'blob 25s infinite 10s',
        }}
      />
    </div>
  );
}
