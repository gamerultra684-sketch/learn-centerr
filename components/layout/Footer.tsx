'use client';

import Link from 'next/link';

// Inline SVG icons so they always render (react-icons brand icons can be missing)
const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);
const TwitterIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
    <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
  </svg>
);
const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);
const YoutubeIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
    <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="white" />
  </svg>
);

const GraduationIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white">
    <path d="M22 9L12 5 2 9l10 4 10-4zm-10 7l-7-2.8V17c0 2.2 3.1 4 7 4s7-1.8 7-4v-3.8L12 16z" />
  </svg>
);

const EnvelopeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 mr-2 flex-shrink-0 text-primary-500">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const PhoneIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 mr-2 flex-shrink-0 text-primary-500">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.82a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 15.92z" />
  </svg>
);

const MapIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 mr-2 flex-shrink-0 text-primary-500">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

export default function Footer() {
  const year = new Date().getFullYear();

  const socialLinks = [
    { icon: <FacebookIcon />,  href: '#', label: 'Facebook' },
    { icon: <TwitterIcon />,   href: '#', label: 'Twitter' },
    { icon: <InstagramIcon />, href: '#', label: 'Instagram' },
    { icon: <YoutubeIcon />,   href: '#', label: 'YouTube' },
  ];

  return (
    <footer className="glass border-t-0 mt-auto relative z-10 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-purple-600 rounded-xl flex items-center justify-center">
                <GraduationIcon />
              </div>
              <span className="text-xl font-bold gradient-text">Learn Center</span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              Platform belajar modern dengan berbagai metode pembelajaran efektif untuk membantu Anda mencapai potensi terbaik.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-primary-500 hover:text-white transition-colors"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Menu */}
          <div>
            <h3 className="font-semibold mb-4">Menu Cepat</h3>
            <ul className="space-y-2 text-sm">
              {[
                { label: 'Beranda',   href: '/' },
                { label: 'Quiz',      href: '/quiz' },
                { label: 'Flashcard', href: '/flashcards' },
                { label: 'Catatan',   href: '/notes' },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-gray-600 dark:text-gray-400 hover:text-primary-600 transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Learning Methods */}
          <div>
            <h3 className="font-semibold mb-4">Metode Belajar</h3>
            <ul className="space-y-2 text-sm">
              {[
                { label: 'Teknik Feynman',  href: '/learning?method=feynman' },
                { label: 'Blurting Method', href: '/learning?method=blurting' },
                { label: 'Mind Palace',     href: '/learning/mind-palace' },
                { label: 'Pomodoro',        href: '/learning?method=pomodoro' },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-gray-600 dark:text-gray-400 hover:text-primary-600 transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4">Hubungi Kami</h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li className="flex items-center"><EnvelopeIcon /> support@learncenter.com</li>
              <li className="flex items-center"><PhoneIcon /> +62 123 4567 890</li>
              <li className="flex items-center"><MapIcon /> Jakarta, Indonesia</li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-200 dark:border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            &copy; {year} Learn Center. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0 text-sm">
            <a href="#" className="text-gray-500 dark:text-gray-400 hover:text-primary-600 transition-colors">
              Kebijakan Privasi
            </a>
            <a href="#" className="text-gray-500 dark:text-gray-400 hover:text-primary-600 transition-colors">
              Syarat &amp; Ketentuan
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
