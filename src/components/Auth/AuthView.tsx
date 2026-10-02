import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Bot, Mail, Lock, User, Eye, EyeOff, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';

export const AuthView: React.FC = () => {
  const { login, register, loginWithGoogleDemo, loginAsGuest } = useAuth();
  const [isLoginTab, setIsLoginTab] = useState(true);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // UI state
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      if (isLoginTab) {
        const res = await login(email, password, rememberMe);
        if (!res.success) {
          setErrorMessage(res.error || 'Failed to sign in. Check email and password.');
        }
      } else {
        const res = await register(name, email, password);
        if (!res.success) {
          setErrorMessage(res.error || 'Failed to create account.');
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication error.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setErrorMessage('Please enter your email to receive reset instructions');
      return;
    }
    setForgotSuccess(true);
    setErrorMessage('');
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-900 via-neutral-900 to-black text-white p-4 select-none">
      {/* Background ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-neutral-900/90 border border-neutral-800 rounded-3xl shadow-2xl p-6 md:p-8 backdrop-blur-xl relative z-10 animate-fade-in">
        
        {/* App Branding */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-0.5 shadow-lg shadow-emerald-500/25 flex items-center justify-center mb-3">
            <div className="w-full h-full bg-neutral-950 rounded-[14px] flex items-center justify-center">
              <Bot className="w-8 h-8 text-emerald-400" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-1.5">
            AskMe <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Mobile AI</span>
          </h1>
          <p className="text-neutral-400 text-sm mt-1">
            {showForgotPassword
              ? 'Reset your password'
              : isLoginTab
              ? 'Sign in to start asking questions'
              : 'Create your account to save chats'}
          </p>
        </div>

        {/* Forgot Password Flow */}
        {showForgotPassword ? (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            {forgotSuccess ? (
              <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm p-4 rounded-xl text-center">
                <ShieldCheck className="w-8 h-8 mx-auto mb-2 text-emerald-400" />
                Password reset link sent to <strong>{email}</strong>!
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPassword(false);
                    setForgotSuccess(false);
                  }}
                  className="mt-4 block w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-medium transition"
                >
                  Back to Sign In
                </button>
              </div>
            ) : (
              <>
                {errorMessage && (
                  <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs p-3 rounded-xl">
                    {errorMessage}
                  </div>
                )}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-neutral-300">Your Email Address</label>
                  <div className="relative">
                    <Mail className="w-5 h-5 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      required
                      className="w-full pl-11 pr-4 py-3 bg-neutral-800/80 border border-neutral-700 rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-medium rounded-xl text-sm shadow-lg shadow-emerald-600/30 transition flex items-center justify-center gap-2"
                >
                  Send Reset Link
                </button>

                <button
                  type="button"
                  onClick={() => setShowForgotPassword(false)}
                  className="w-full text-center text-xs text-neutral-400 hover:text-white transition py-2"
                >
                  ← Back to Sign In
                </button>
              </>
            )}
          </form>
        ) : (
          <>
            {/* Tab Switcher: Sign In vs Sign Up */}
            <div className="grid grid-cols-2 p-1 bg-neutral-800/70 border border-neutral-700/60 rounded-xl mb-5">
              <button
                type="button"
                onClick={() => {
                  setIsLoginTab(true);
                  setErrorMessage('');
                }}
                className={`py-2 text-sm font-medium rounded-lg transition-all ${
                  isLoginTab
                    ? 'bg-neutral-900 text-white shadow-sm shadow-black/50'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsLoginTab(false);
                  setErrorMessage('');
                }}
                className={`py-2 text-sm font-medium rounded-lg transition-all ${
                  !isLoginTab
                    ? 'bg-neutral-900 text-white shadow-sm shadow-black/50'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                Sign Up
              </button>
            </div>

            {/* Error banner */}
            {errorMessage && (
              <div className="mb-4 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs p-3 rounded-xl">
                {errorMessage}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLoginTab && (
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-neutral-300">Full Name</label>
                  <div className="relative">
                    <User className="w-5 h-5 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe"
                      required={!isLoginTab}
                      className="w-full pl-11 pr-4 py-3 bg-neutral-800/80 border border-neutral-700 rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-neutral-300">Email Address</label>
                <div className="relative">
                  <Mail className="w-5 h-5 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@example.com"
                    required
                    className="w-full pl-11 pr-4 py-3 bg-neutral-800/80 border border-neutral-700 rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-neutral-300">Password</label>
                  {isLoginTab && (
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      className="text-xs text-emerald-400 hover:text-emerald-300 transition"
                    >
                      Forgot?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-5 h-5 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-11 pr-11 py-3 bg-neutral-800/80 border border-neutral-700 rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {isLoginTab && (
                <div className="flex items-center">
                  <input
                    id="remember"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-neutral-700 bg-neutral-800 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-0"
                  />
                  <label htmlFor="remember" className="ml-2 text-xs text-neutral-400 cursor-pointer">
                    Remember me on this mobile device
                  </label>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 active:scale-[0.99] text-white font-medium rounded-xl text-sm shadow-lg shadow-emerald-600/30 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>{isLoginTab ? 'Sign In' : 'Create Account'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Social / Quick Logins */}
            <div className="mt-5 pt-5 border-t border-neutral-800/80">
              <div className="relative flex justify-center text-xs uppercase mb-4">
                <span className="bg-neutral-900 px-3 text-neutral-500 font-medium tracking-wider">
                  Or Instant Access
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {/* 1-Click Demo Login */}
                <button
                  type="button"
                  onClick={() => {
                    setEmail('demo.user@chatgpt.mobile');
                    setPassword('demo1234');
                    login('demo.user@chatgpt.mobile', 'demo1234');
                  }}
                  className="w-full py-2.5 px-3 bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-800/50 rounded-xl text-xs font-medium text-emerald-300 flex items-center justify-center gap-1.5 transition"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  Quick Demo
                </button>

                {/* Google Sign-in */}
                <button
                  type="button"
                  onClick={loginWithGoogleDemo}
                  className="w-full py-2.5 px-3 bg-neutral-800 hover:bg-neutral-700/80 border border-neutral-700 rounded-xl text-xs font-medium text-neutral-200 flex items-center justify-center gap-1.5 transition"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.14z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.16 0 9.94 0 12c0 2.06.45 3.84 1.25 5.42l4.03-3.15z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                    />
                  </svg>
                  Google
                </button>
              </div>

              {/* Guest Access */}
              <button
                type="button"
                onClick={loginAsGuest}
                className="w-full mt-2 py-2 text-center text-xs text-neutral-400 hover:text-neutral-200 transition"
              >
                Continue as Guest without account →
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
};
