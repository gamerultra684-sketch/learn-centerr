'use client';

// Animated blobs background — exact port from header.php
// Uses inline styles so keyframes work in both Tailwind v3 & v4

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
      {/* Blue blob — top left */}
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
          background: 'rgba(96,165,250,0.25)',
          mixBlendMode: 'multiply',
        }}
      />
      {/* Purple blob — top right */}
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
          background: 'rgba(192,132,252,0.25)',
          mixBlendMode: 'multiply',
        }}
      />
      {/* Pink blob — bottom center */}
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
          background: 'rgba(249,168,212,0.25)',
          mixBlendMode: 'multiply',
        }}
      />
    </div>
  );
}
