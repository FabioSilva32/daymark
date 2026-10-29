'use client';

import React, { useState } from 'react';
import { useDaymark } from '@/context/DaymarkContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Lock, User, Mail, ShieldAlert, Sparkles, Eye, EyeOff, LogIn, UserPlus } from 'lucide-react';

export function AuthScreen() {
  const { login, register, accounts } = useDaymark();
  const [tab, setTab] = useState<'signin' | 'signup'>(accounts.length === 0 ? 'signup' : 'signin');

  React.useEffect(() => {
    if (accounts.length === 0) {
      setTab('signup');
    }
  }, [accounts.length]);

  // Sign In State
  const [signInUsername, setSignInUsername] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [showSignInPw, setShowSignInPw] = useState(false);
  const [signInError, setSignInError] = useState<string | null>(null);
  const [signInLoading, setSignInLoading] = useState(false);

  // Sign Up State
  const [signUpName, setSignUpName] = useState('');
  const [signUpUsername, setSignUpUsername] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpConfirm, setSignUpConfirm] = useState('');
  const [showSignUpPw, setShowSignUpPw] = useState(false);
  const [avatarColor, setAvatarColor] = useState('#E50914');
  const [signUpError, setSignUpError] = useState<string | null>(null);
  const [signUpLoading, setSignUpLoading] = useState(false);

  const COLOR_OPTIONS = [
    { label: 'CineLog Red', value: '#E50914' },
    { label: 'Cobalt Blue', value: '#3B82F6' },
    { label: 'Emerald Green', value: '#10B981' },
    { label: 'Amber Gold', value: '#F59E0B' },
    { label: 'Royal Purple', value: '#8B5CF6' },
  ];

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setSignInError(null);
    if (!signInUsername.trim()) {
      setSignInError('Please enter your username or email');
      return;
    }

    setSignInLoading(true);
    const res = login(signInUsername.trim(), signInPassword);
    setSignInLoading(false);
    if (!res.success) {
      setSignInError(res.error || 'Invalid credentials');
    }
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setSignUpError(null);

    if (!signUpName.trim()) {
      setSignUpError('Please enter your name');
      return;
    }
    if (!signUpUsername.trim()) {
      setSignUpError('Please enter a username');
      return;
    }
    if (signUpPassword && signUpPassword.length < 4) {
      setSignUpError('Password must be at least 4 characters');
      return;
    }
    if (signUpPassword !== signUpConfirm) {
      setSignUpError('Passwords do not match');
      return;
    }

    setSignUpLoading(true);
    const res = register({
      name: signUpName.trim(),
      username: signUpUsername.trim(),
      email: signUpEmail.trim() || undefined,
      password: signUpPassword || undefined,
      avatarColor,
    });
    setSignUpLoading(false);
    if (!res.success) {
      setSignUpError(res.error || 'Failed to create account');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#000000] p-4 select-none">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1C0D0E]/60 via-[#000000] to-[#000000] pointer-events-none" />

      <div className="relative w-full max-w-md bg-[#0F0F0F] border border-[#242424] rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="flex flex-col items-center justify-center mb-2">
            <img src="/icon.svg" alt="Daymark" className="w-14 h-14 rounded-2xl shadow-2xl mb-2.5" />
            <span className="text-xl font-heading font-black tracking-wider text-white">DAYMARK</span>
          </div>
          <p className="text-xs text-[#777777]">Personal Command Centre &bull; Secure Authentication</p>
        </div>

        {/* Auth Tabs */}
        <div className="flex border-b border-[#242424] mb-6">
          <button
            type="button"
            onClick={() => {
              setTab('signin');
              setSignInError(null);
            }}
            className={`flex-1 pb-3 text-xs font-semibold tracking-wide transition-colors flex items-center justify-center gap-1.5 border-b-2 ${
              tab === 'signin'
                ? 'border-[#E50914] text-white'
                : 'border-transparent text-[#777777] hover:text-[#CCCCCC]'
            }`}
          >
            <LogIn size={14} />
            <span>Sign In</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('signup');
              setSignUpError(null);
            }}
            className={`flex-1 pb-3 text-xs font-semibold tracking-wide transition-colors flex items-center justify-center gap-1.5 border-b-2 ${
              tab === 'signup'
                ? 'border-[#E50914] text-white'
                : 'border-transparent text-[#777777] hover:text-[#CCCCCC]'
            }`}
          >
            <UserPlus size={14} />
            <span>Create Account</span>
          </button>
        </div>

        {/* SIGN IN FORM */}
        {tab === 'signin' && (
          <form onSubmit={handleSignIn} className="space-y-4">
            {signInError && (
              <div className="flex items-start gap-2 p-3 bg-[#2A0E10] border border-[#E50914]/40 rounded-xl text-xs text-[#FFAAAA]">
                <ShieldAlert size={15} className="text-[#E50914] shrink-0 mt-0.5" />
                <span>{signInError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-[#AAAAAA] mb-1.5">Username or Email</label>
              <div className="flex items-center px-3 py-2 bg-[#141414] border border-[#282828] focus-within:border-[#E50914] rounded-xl text-xs text-white">
                <User size={14} className="text-[#666666] mr-2 shrink-0" />
                <input
                  type="text"
                  placeholder="e.g. alexandre"
                  value={signInUsername}
                  onChange={(e) => setSignInUsername(e.target.value)}
                  className="bg-transparent border-0 p-0 text-xs text-white placeholder-[#555555] outline-none focus:outline-none w-full"
                  autoFocus
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#AAAAAA] mb-1.5">Password</label>
              <div className="flex items-center px-3 py-2 bg-[#141414] border border-[#282828] focus-within:border-[#E50914] rounded-xl text-xs text-white">
                <Lock size={14} className="text-[#666666] mr-2 shrink-0" />
                <input
                  type={showSignInPw ? 'text' : 'password'}
                  placeholder="Enter password"
                  value={signInPassword}
                  onChange={(e) => setSignInPassword(e.target.value)}
                  className="bg-transparent border-0 p-0 text-xs text-white placeholder-[#555555] outline-none focus:outline-none w-full"
                />
                <button
                  type="button"
                  onClick={() => setShowSignInPw(!showSignInPw)}
                  className="text-[#666666] hover:text-[#AAAAAA] ml-1.5"
                >
                  {showSignInPw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={signInLoading}
              className="w-full bg-[#E50914] hover:bg-[#C11119] text-white font-semibold py-2.5 rounded-xl text-xs transition-colors mt-2"
            >
              {signInLoading ? 'Signing In...' : 'Sign In'}
            </Button>

            {/* Registered accounts quick preview */}
            <div className="pt-3 border-t border-[#1F1F1F] text-center">
              {accounts.length > 0 ? (
                <p className="text-[11px] text-[#666666]">
                  Existing accounts on this device: {accounts.map((a) => a.username).join(', ')}
                </p>
              ) : (
                <p className="text-[11px] text-[#888888]">
                  No accounts yet. Switch to <span className="text-[#E50914] font-semibold cursor-pointer underline hover:text-[#FF3333]" onClick={() => setTab('signup')}>Create Account</span> to get started!
                </p>
              )}
            </div>
          </form>
        )}

        {/* SIGN UP FORM */}
        {tab === 'signup' && (
          <form onSubmit={handleSignUp} className="space-y-3.5">
            {signUpError && (
              <div className="flex items-start gap-2 p-3 bg-[#2A0E10] border border-[#E50914]/40 rounded-xl text-xs text-[#FFAAAA]">
                <ShieldAlert size={15} className="text-[#E50914] shrink-0 mt-0.5" />
                <span>{signUpError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-[#AAAAAA] mb-1">Full Name *</label>
              <div className="flex items-center px-3 py-2 bg-[#141414] border border-[#282828] focus-within:border-[#E50914] rounded-xl text-xs text-white">
                <Sparkles size={14} className="text-[#666666] mr-2 shrink-0" />
                <input
                  type="text"
                  placeholder="e.g. Lucas"
                  value={signUpName}
                  onChange={(e) => setSignUpName(e.target.value)}
                  required
                  className="bg-transparent border-0 p-0 text-xs text-white placeholder-[#555555] outline-none focus:outline-none w-full"
                  autoFocus
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#AAAAAA] mb-1">Username *</label>
              <div className="flex items-center px-3 py-2 bg-[#141414] border border-[#282828] focus-within:border-[#E50914] rounded-xl text-xs text-white">
                <User size={14} className="text-[#666666] mr-2 shrink-0" />
                <input
                  type="text"
                  placeholder="e.g. Fabio or Alex_99"
                  value={signUpUsername}
                  onChange={(e) => setSignUpUsername(e.target.value.replace(/\s+/g, '_'))}
                  required
                  className="bg-transparent border-0 p-0 text-xs text-white placeholder-[#555555] outline-none focus:outline-none w-full"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#AAAAAA] mb-1">Email (Optional)</label>
              <div className="flex items-center px-3 py-2 bg-[#141414] border border-[#282828] focus-within:border-[#E50914] rounded-xl text-xs text-white">
                <Mail size={14} className="text-[#666666] mr-2 shrink-0" />
                <input
                  type="email"
                  placeholder="e.g. lucas@example.com"
                  value={signUpEmail}
                  onChange={(e) => setSignUpEmail(e.target.value)}
                  className="bg-transparent border-0 p-0 text-xs text-white placeholder-[#555555] outline-none focus:outline-none w-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-[#AAAAAA] mb-1">Password</label>
                <div className="flex items-center px-3 py-2 bg-[#141414] border border-[#282828] focus-within:border-[#E50914] rounded-xl text-xs text-white">
                  <Lock size={13} className="text-[#666666] mr-1.5 shrink-0" />
                  <input
                    type={showSignUpPw ? 'text' : 'password'}
                    placeholder="Min 4 chars"
                    value={signUpPassword}
                    onChange={(e) => setSignUpPassword(e.target.value)}
                    className="bg-transparent border-0 p-0 text-xs text-white placeholder-[#555555] outline-none focus:outline-none w-full"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#AAAAAA] mb-1">Confirm</label>
                <div className="flex items-center px-3 py-2 bg-[#141414] border border-[#282828] focus-within:border-[#E50914] rounded-xl text-xs text-white">
                  <Lock size={13} className="text-[#666666] mr-1.5 shrink-0" />
                  <input
                    type={showSignUpPw ? 'text' : 'password'}
                    placeholder="Confirm"
                    value={signUpConfirm}
                    onChange={(e) => setSignUpConfirm(e.target.value)}
                    className="bg-transparent border-0 p-0 text-xs text-white placeholder-[#555555] outline-none focus:outline-none w-full"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#AAAAAA] mb-1.5">Profile Accent Color</label>
              <div className="flex items-center gap-2">
                {COLOR_OPTIONS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setAvatarColor(c.value)}
                    style={{ backgroundColor: c.value }}
                    className={`w-7 h-7 rounded-full transition-transform ${
                      avatarColor === c.value ? 'ring-2 ring-white scale-110' : 'opacity-70 hover:opacity-100'
                    }`}
                    title={c.label}
                  />
                ))}
              </div>
            </div>

            <Button
              type="submit"
              disabled={signUpLoading}
              className="w-full bg-[#E50914] hover:bg-[#C11119] text-white font-semibold py-2.5 rounded-xl text-xs transition-colors mt-2"
            >
              {signUpLoading ? 'Creating Account...' : 'Create Account & Sign In'}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
