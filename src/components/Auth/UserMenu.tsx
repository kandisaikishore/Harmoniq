import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogIn, LogOut, User as UserIcon, Bookmark, ChevronDown, CheckCircle, Shield } from 'lucide-react';

interface UserMenuProps {
  onOpenSavedModal?: () => void;
  savedCount?: number;
}

export const UserMenu: React.FC<UserMenuProps> = ({ onOpenSavedModal, savedCount = 0 }) => {
  const { user, loading, signIn, signOut, error } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignInClick = async () => {
    setIsSigningIn(true);
    try {
      await signIn();
    } finally {
      setIsSigningIn(false);
    }
  };

  if (loading) {
    return (
      <div className="w-8 h-8 rounded-full bg-slate-800 animate-pulse border border-slate-700" />
    );
  }

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleSignInClick}
          disabled={isSigningIn}
          className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 text-xs font-bold text-slate-100 flex items-center gap-2 shadow-sm transition-all active:scale-95 cursor-pointer disabled:opacity-50"
        >
          {/* Google G Icon */}
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span className="hidden sm:inline">Sign In with Google</span>
          <span className="sm:hidden">Sign In</span>
        </button>

        {error && (
          <span className="text-[10px] text-red-400 max-w-[120px] truncate" title={error}>
            {error}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 transition-all cursor-pointer"
      >
        {user.photoURL ? (
          <img
            src={user.photoURL}
            alt={user.displayName || 'User'}
            className="w-7 h-7 rounded-lg object-cover ring-1 ring-indigo-500/50"
          />
        ) : (
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-600 to-amber-500 text-white font-bold text-xs flex items-center justify-center">
            {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
          </div>
        )}

        <div className="hidden md:flex flex-col text-left">
          <span className="text-xs font-bold text-slate-100 max-w-[100px] truncate">
            {user.displayName || 'Musician'}
          </span>
          <span className="text-[9px] font-mono text-emerald-400 flex items-center gap-0.5">
            <CheckCircle className="w-2.5 h-2.5" />
            Signed In
          </span>
        </div>

        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
      </button>

      {/* Dropdown Menu */}
      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl py-2 z-50 backdrop-blur-xl animate-fade-in">
          {/* User Details */}
          <div className="px-4 py-2.5 border-b border-slate-800/80">
            <div className="font-bold text-xs text-white truncate">
              {user.displayName || 'Musician'}
            </div>
            <div className="text-[11px] text-slate-400 font-mono truncate">
              {user.email}
            </div>
            <div className="flex items-center gap-1 mt-1 text-[10px] text-indigo-400 font-medium">
              <Shield className="w-3 h-3 text-indigo-400" />
              <span>Firebase Authenticated</span>
            </div>
          </div>

          {/* Menu Items */}
          <div className="p-1 space-y-0.5">
            {onOpenSavedModal && (
              <button
                type="button"
                onClick={() => {
                  setDropdownOpen(false);
                  onOpenSavedModal();
                }}
                className="w-full px-3 py-2 text-left text-xs text-slate-200 hover:text-white hover:bg-slate-900 rounded-xl flex items-center justify-between transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Bookmark className="w-3.5 h-3.5 text-amber-400" />
                  <span>My Saved Progressions</span>
                </div>
                {savedCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold">
                    {savedCount}
                  </span>
                )}
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                setDropdownOpen(false);
                signOut();
              }}
              className="w-full px-3 py-2 text-left text-xs text-red-400 hover:text-red-300 hover:bg-red-950/40 rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
