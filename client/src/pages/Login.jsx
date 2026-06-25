import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import toast , { Toaster } from 'react-hot-toast'
import { Loader2, GraduationCap, Lock, User, AlertCircle } from 'lucide-react';
import { useAuth } from '../lib/auth';

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (user) return <Navigate to="/dashboard" replace />;

 const onSubmit = async (e) => {
  e.preventDefault();

  setError("");
  setLoading(true);

  try {
    const res = await login(username.trim(), password);

    console.log("Login response:", res);

    if (res.ok) {
      navigate("/dashboard");
    } else {
      toast.error(res.message || "Login failed");
    }
  } catch (err) {
    console.error("Login Error:", err);

    toast.error(
      err.response?.data?.message ||
      err.message ||
      "Something went wrong. Please try again."
    );
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen w-full grid lg:grid-cols-2 bg-white">
      {/* ---- Left: form ---- */}
      <Toaster
  position="top-center"
  reverseOrder={false}
/>
      <div className="flex items-center justify-center px-6 py-12 lg:px-16">
        <div className="w-full max-w-md" data-testid="login-card">
          <div className="flex items-center gap-2 mb-10">
            <div className="w-10 h-10 rounded-md grid place-items-center" style={{ background: 'var(--psit-primary)' }}>
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-bold text-lg tracking-tight text-slate-900" style={{ fontFamily: 'Cabinet Grotesk' }}>
                PSIT Unofficial
              </div>
              <div className="text-xs text-slate-500">Placement Portal</div>
            </div>
          </div>

          <h1 className="text-4xl font-bold text-slate-900 leading-tight" style={{ fontFamily: 'Cabinet Grotesk' }}>
            Welcome back.
          </h1>
          <p className="mt-3 text-slate-600">
            Sign in with your <span className="font-semibold text-slate-800">PSIT ERP credentials</span> to explore
            placements, drives, and recruiter activity.
          </p>

          <form onSubmit={onSubmit} className="mt-10 space-y-5" data-testid="login-form">
            <div>
              <label htmlFor="username" className="block text-sm font-semibold text-slate-700 mb-2">
                University Roll Number
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="username"
                  data-testid="login-username-input"
                  type="text"
                  required
                  className="psit-input pl-9"
                  placeholder="e.g. 2401640310003"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={loading}
                  autoComplete="username"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-2">
                ERP Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="password"
                  data-testid="login-password-input"
                  type="password"
                  required
                  className="psit-input pl-9"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  autoComplete="current-password"
                />
              </div>
            </div>

            {error && (
              <div
                role="alert"
                data-testid="login-error"
                className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
              >
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              data-testid="login-submit-button"
              disabled={loading}
              className="psit-btn-accent w-full h-11"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Authenticating…
                </>
              ) : (
                'Sign in'
              )}
            </button>

            <p className="text-xs text-slate-500 text-center pt-2">
              We never store your ERP password in plain text. Sessions are cached securely for 24 hours.
            </p>
          </form>
        </div>
      </div>

      {/* ---- Right: hero image ---- */}
      <div className="relative hidden lg:block">
        <img
          src="https://images.unsplash.com/photo-1623051786552-e46ef84e6c07?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzR8MHwxfHNlYXJjaHwzfHxtb2Rlcm4lMjBnbGFzcyUyMGNvcnBvcmF0ZSUyMG9mZmljZSUyMGFyY2hpdGVjdHVyZSUyMGJ1aWxkaW5nfGVufDB8fHx8MTc4MjMxNDY2Nnww&ixlib=rb-4.1.0&q=85"
          alt="Modern office"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(10,37,64,0.78), rgba(15,23,42,0.55))' }} />
        <div className="relative h-full flex flex-col justify-end p-12 text-white">
          <div className="psit-overline text-white/70 mb-3">PSIT • Class of 2026</div>
          <h2 className="text-4xl font-bold leading-tight max-w-md" style={{ fontFamily: 'Cabinet Grotesk' }}>
            Every drive. Every recruiter. Every placed alum — in one place.
          </h2>
          <p className="mt-4 text-white/80 max-w-md">
            An unofficial, student-built lens into PSIT's placement universe — fast,
            searchable, and beautifully organized.
          </p>
        </div>
      </div>
    </div>
  );
}
