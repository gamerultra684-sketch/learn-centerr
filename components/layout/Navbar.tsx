'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  FaSun, FaMoon, FaBars, FaTimes, FaHome, FaTachometerAlt,
  FaQuestionCircle, FaLayerGroup, FaStickyNote, FaLightbulb,
  FaCog, FaUser, FaBook, FaFolder, FaSignOutAlt, FaSignInAlt,
  FaUserPlus, FaChevronDown,
} from 'react-icons/fa';
import { useAuth } from '@/lib/auth-context';

// ── Navbar — exact port from header.php ──────────────────────────

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const pathname = usePathname();
  const [isDark, setIsDark] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Sync dark mode with <html> class on mount
  useEffect(() => {
    const stored = localStorage.getItem('lc_theme');
    const dark = stored === 'dark' || (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches);
    setIsDark(dark);
    document.documentElement.classList.toggle('dark', dark);
  }, []);

  // Close user menu on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  function toggleTheme() {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('lc_theme', next ? 'dark' : 'light');
  }

  const navLinks = [
    { href: '/',          label: 'Beranda',   icon: <FaHome /> },
    ...(user ? [{ href: '/dashboard', label: 'Dashboard', icon: <FaTachometerAlt /> }] : []),
    { href: '/quiz',        label: 'Quiz',      icon: <FaQuestionCircle /> },
    { href: '/flashcards',  label: 'Flashcard', icon: <FaLayerGroup /> },
    { href: '/notes',       label: 'Catatan',   icon: <FaStickyNote /> },
    { href: '/learning',    label: 'Metode',    icon: <FaLightbulb /> },
  ];

  const avatar = user?.avatar
    ? `/uploads/${user.avatar}`
    : '/images/default-avatar.png';

  return (
    <>
      {/* ── TOP NAV ── */}
      <div className="fixed top-4 inset-x-0 z-50 flex justify-center pointer-events-none px-4">
        <nav className="pointer-events-auto glass-panel rounded-full px-4 border border-white/20 shadow-2xl transition-all duration-300 w-full max-w-7xl relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent pointer-events-none" />
          <div className="flex justify-between h-14 items-center">

            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2 group pl-2">
                <img src="/images/logo.png" alt="Learn Center Logo" className="w-8 h-8 object-contain transform group-hover:-rotate-12 group-hover:scale-110 transition-all drop-shadow-sm" />
                <span className="text-lg font-bold text-slate-900 dark:text-white hidden sm:block">Learn <span className="text-indigo-600 dark:text-fuchsia-400">Center</span></span>
              </Link>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-1">
              {navLinks.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                    pathname === l.href
                      ? 'bg-indigo-500/10 dark:bg-fuchsia-500/20 text-indigo-600 dark:text-fuchsia-400'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-500/10 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {l.label}
                </Link>
              ))}
              {user && isAdmin && (
                <Link
                  href="/admin"
                  className="px-4 py-2 rounded-full text-sm font-semibold text-fuchsia-600 dark:text-fuchsia-400 hover:bg-fuchsia-500/10 transition-colors"
                >
                  Admin
                </Link>
              )}
            </div>

            {/* Right side */}
            <div className="flex items-center gap-2 pr-2">

              {/* Theme toggle */}
              <button
                id="themeToggle"
                onClick={toggleTheme}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-500/10 transition-colors text-slate-600 dark:text-slate-300"
                aria-label="Toggle theme"
              >
                {isDark
                  ? <FaMoon className="text-blue-400" />
                  : <FaSun className="text-amber-500" />
                }
              </button>

              {user ? (
                /* User dropdown */
                <div className="relative" ref={userMenuRef}>
                  <button
                    id="userMenuBtn"
                    onClick={(e) => { e.stopPropagation(); setUserMenuOpen((v) => !v); }}
                    className="flex items-center space-x-2 p-1 pl-2 pr-3 rounded-full hover:bg-slate-500/10 transition-colors border border-transparent hover:border-white/10"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={avatar}
                      alt="Avatar"
                      className="w-7 h-7 rounded-full object-cover border border-indigo-500/50"
                      onError={(e) => { (e.target as HTMLImageElement).src = '/images/default-avatar.png'; }}
                    />
                    <span className="hidden lg:block text-sm font-semibold text-slate-800 dark:text-slate-200">{user.username}</span>
                    <FaChevronDown className="text-xs hidden lg:block text-slate-500" />
                  </button>

                  {userMenuOpen && (
                    <div
                      id="userMenu"
                      className="absolute right-0 mt-3 w-48 glass-panel rounded-2xl shadow-2xl py-2 z-50 border border-white/20"
                    >
                      <Link href="/profile"   onClick={() => setUserMenuOpen(false)} className="flex items-center px-4 py-2 text-sm hover:bg-slate-500/10 transition-colors text-slate-700 dark:text-slate-200">
                        <FaUser className="mr-2 text-indigo-400" /> Profil
                      </Link>
                      <Link href="/notes"     onClick={() => setUserMenuOpen(false)} className="flex items-center px-4 py-2 text-sm hover:bg-slate-500/10 transition-colors text-slate-700 dark:text-slate-200">
                        <FaBook className="mr-2 text-fuchsia-400" /> Catatan Saya
                      </Link>
                      <Link href="/dashboard" onClick={() => setUserMenuOpen(false)} className="flex items-center px-4 py-2 text-sm hover:bg-slate-500/10 transition-colors text-slate-700 dark:text-slate-200">
                        <FaFolder className="mr-2 text-cyan-400" /> Folder
                      </Link>
                      <hr className="my-2 border-slate-500/20" />
                      <button
                        onClick={() => { logout(); setUserMenuOpen(false); }}
                        className="w-full flex items-center px-4 py-2 text-sm text-red-500 hover:bg-red-500/10 transition-colors"
                      >
                        <FaSignOutAlt className="mr-2" /> Keluar
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-2">
                  <Link href="/login"    className="px-4 py-1.5 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-fuchsia-400 transition-colors rounded-full hover:bg-slate-500/10">
                    Masuk
                  </Link>
                  <Link href="/register" className="px-5 py-1.5 text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-full transition-colors shadow-lg hover:shadow-indigo-500/25">
                    Daftar
                  </Link>
                </div>
              )}

              {/* Hamburger (mobile) */}
              <button
                id="mobileMenuBtn"
                onClick={() => setMobileOpen(true)}
                className="md:hidden w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-500/10 transition-colors text-slate-700 dark:text-slate-200"
              >
                <FaBars />
              </button>
            </div>
          </div>
        </nav>
      </div>

      {/* ── MOBILE MENU ── */}
      <div
        id="mobileMenu"
        className={`fixed inset-0 z-50 md:hidden items-stretch ${mobileOpen ? 'flex menu-open' : 'hidden'}`}
      >
        <div
          id="mobileMenuOverlay"
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />

        <div
          id="mobilePanel"
          className="absolute right-0 top-0 bottom-0 w-[280px] bg-white/95 dark:bg-slate-950/95 backdrop-blur-2xl shadow-2xl flex flex-col z-50 border-l border-white/20 dark:border-slate-800"
          style={{ transform: mobileOpen ? 'translateX(0)' : 'translateX(100%)', transition: 'transform 0.3s ease' }}
        >
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center space-x-2">
              <img src="/images/logo.png" alt="Learn Center Logo" className="w-8 h-8 object-contain" />
              <span className="text-xl font-bold gradient-text">Learn Center</span>
            </div>
            <button
              id="closeMobileMenu"
              onClick={() => setMobileOpen(false)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <FaTimes />
            </button>
          </div>

          {/* Links */}
          <div className="p-4 space-y-1 overflow-y-auto flex-1">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setMobileOpen(false)}
                className="flex items-center px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm font-medium"
              >
                <span className="mr-3 text-gray-400 w-5 text-center">{l.icon}</span>
                {l.label}
              </Link>
            ))}

            {user && (
              <>
                <hr className="my-3 border-gray-200 dark:border-gray-800" />
                <Link href="/profile"    onClick={() => setMobileOpen(false)} className="flex items-center px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm font-medium">
                  <FaUser className="mr-3 text-gray-400 w-5 text-center" /> Profil
                </Link>
                <Link href="/notes"      onClick={() => setMobileOpen(false)} className="flex items-center px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm font-medium">
                  <FaBook className="mr-3 text-gray-400 w-5 text-center" /> Catatan Saya
                </Link>
                {isAdmin && (
                  <Link href="/admin"    onClick={() => setMobileOpen(false)} className="flex items-center px-4 py-3 rounded-lg text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors text-sm font-medium">
                    <FaCog className="mr-3 w-5 text-center" /> Admin Panel
                  </Link>
                )}
                <button
                  onClick={() => { logout(); setMobileOpen(false); }}
                  className="w-full flex items-center px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-sm font-medium"
                >
                  <FaSignOutAlt className="mr-3 w-5 text-center" /> Keluar
                </button>
              </>
            )}

            {!user && (
              <>
                <hr className="my-3 border-gray-200 dark:border-gray-800" />
                <Link href="/login"    onClick={() => setMobileOpen(false)} className="flex items-center px-4 py-3 rounded-lg text-primary-600 hover:bg-primary-50 transition-colors text-sm font-medium">
                  <FaSignInAlt className="mr-3 w-5 text-center" /> Masuk
                </Link>
                <Link href="/register" onClick={() => setMobileOpen(false)} className="flex items-center justify-center px-4 py-3 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors text-sm font-medium">
                  <FaUserPlus className="mr-3 w-5 text-center" /> Daftar
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── MOBILE BOTTOM NAV ── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 glass border-t border-white/20 dark:border-gray-700/50 flex justify-around items-center px-2 py-1">
        <Link href="/" className="flex flex-col items-center justify-center w-full py-1 text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400">
          <FaHome className="text-lg mb-1" />
          <span className="text-[10px] font-medium">Beranda</span>
        </Link>
        {user ? (
          <>
            <Link href="/dashboard" className="flex flex-col items-center justify-center w-full py-1 text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400">
              <FaTachometerAlt className="text-lg mb-1" />
              <span className="text-[10px] font-medium">Dashboard</span>
            </Link>
            <Link href="/quiz" className="flex flex-col items-center justify-center w-full py-1 text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400">
              <FaQuestionCircle className="text-lg mb-1" />
              <span className="text-[10px] font-medium">Quiz</span>
            </Link>
            <Link href="/profile" className="flex flex-col items-center justify-center w-full py-1 text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400">
              <FaUser className="text-lg mb-1" />
              <span className="text-[10px] font-medium">Profil</span>
            </Link>
          </>
        ) : (
          <>
            <Link href="/quiz" className="flex flex-col items-center justify-center w-full py-1 text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400">
              <FaQuestionCircle className="text-lg mb-1" />
              <span className="text-[10px] font-medium">Quiz</span>
            </Link>
            <Link href="/login" className="flex flex-col items-center justify-center w-full py-1 text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400">
              <FaSignInAlt className="text-lg mb-1" />
              <span className="text-[10px] font-medium">Masuk</span>
            </Link>
          </>
        )}
      </div>
    </>
  );
}
