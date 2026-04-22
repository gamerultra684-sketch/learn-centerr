'use client';

// Exact match to header.php animated gradient blob background
// Light mode: soft blue/purple/pink blobs on white (multiply blend)
// Dark mode:  deep purple/blue blobs on dark (screen blend)
export default function AnimatedBackground() {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: -1,
        overflow: 'hidden',
        pointerEvents: 'none',
      }}
    >
      {/* Blob 1 — top-left, blue */}
      <div
        style={{
          position: 'absolute',
          top: '-10%',
          left: '-10%',
          width: '40%',
          height: '40%',
          borderRadius: '50%',
          filter: 'blur(80px)',
          animation: 'blob 7s infinite',
          background: 'rgba(147,197,253,0.45)',
        }}
      />
      {/* Blob 2 — top-right, purple */}
      <div
        style={{
          position: 'absolute',
          top: '20%',
          right: '-10%',
          width: '35%',
          height: '35%',
          borderRadius: '50%',
          filter: 'blur(80px)',
          animation: 'blob 8s infinite 2s',
          background: 'rgba(216,180,254,0.45)',
        }}
      />
      {/* Blob 3 — bottom-center, pink */}
      <div
        style={{
          position: 'absolute',
          bottom: '-20%',
          left: '20%',
          width: '50%',
          height: '50%',
          borderRadius: '50%',
          filter: 'blur(80px)',
          animation: 'blob 9s infinite 4s',
          background: 'rgba(249,168,212,0.40)',
        }}
      />
    </div>
  );
}
