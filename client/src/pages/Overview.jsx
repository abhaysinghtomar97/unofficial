import React, { useEffect, useState } from 'react';

import { Building2, Users, TrendingUp, Trophy, ArrowRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom'; 

import api from '../lib/api';
import RecruiterMarquee from '../components/RecruiterMarquee';

function StatCard({ label, value, icon: Icon, hint, loading, testid }) {
  return (
    <div className="psit-card p-5" data-testid={testid}>
      <div className="flex items-start justify-between">
        <div>
          <div className="psit-overline">{label}</div>
          <div className="mt-3 text-3xl font-bold tracking-tight text-slate-900" style={{ fontFamily: 'Cabinet Grotesk' }}>
            {loading ? <span className="inline-block w-16 h-7 skel" /> : value}
          </div>
          {hint && <div className="text-xs text-slate-500 mt-1">{hint}</div>}
        </div>
        <div className="w-10 h-10 grid place-items-center rounded-md" style={{ background: 'rgba(0,85,255,0.08)' }}>
          <Icon className="w-5 h-5" style={{ color: 'var(--psit-accent)' }} />
        </div>
      </div>
    </div>
  );
}

export default function Overview() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    api.get('/stats')
      .then((r) => { if (active) setStats(r.data.stats); })
      .catch((e) => { if (active) setError(e?.response?.data?.message || 'Failed to load stats'); })
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  const yearEntries = Object.entries(stats?.drivesByYear || {}).sort((a, b) => b[0].localeCompare(a[0]));

  return (
    <div className="space-y-10" data-testid="overview-page">
      {/* Header */}
      <div>
        <div className="psit-overline">Dashboard</div>
        <h1 className="mt-1 text-3xl sm:text-4xl font-bold text-slate-900" style={{ fontFamily: 'Cabinet Grotesk' }}>
          Placement Pulse
        </h1>
        <p className="mt-2 text-slate-600 max-w-2xl">
          A live snapshot of PSIT's placement activity — drives, recruiters, and student outcomes,
          stitched together from the institute's ERP and public sources.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard label="Total Drives" value={stats?.totalDrives ?? '—'} icon={Building2} loading={loading} testid="stat-total-drives" />
        <StatCard label="Active Drives" value={stats?.activeDrives ?? '—'} icon={TrendingUp} loading={loading} testid="stat-active-drives" />
        <StatCard label="Unique Companies" value={stats?.uniqueCompanies ?? '—'} icon={Trophy} loading={loading} testid="stat-unique-companies" />
        <StatCard label="Recruiter Logos" value={stats?.totalRecruiters ?? '—'} icon={Users} loading={loading} testid="stat-recruiters" />
      </div>

      {error && (
        <div className="psit-card p-4 text-sm text-red-700 bg-red-50 border-red-200">{error}</div>
      )}

      {/* Quick links + drives-by-year */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 psit-card p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <div className="psit-overline">Drives by year</div>
              <h2 className="text-xl font-bold text-slate-900 mt-1" style={{ fontFamily: 'Cabinet Grotesk' }}>
                Recent placement activity
              </h2>
            </div>
            {loading && <Loader2 className="w-4 h-4 animate-spin text-slate-400" />}
          </div>
          <div className="space-y-3">
            {yearEntries.length === 0 && !loading && (
              <div className="text-sm text-slate-500">No drive data available.</div>
            )}
            {yearEntries.map(([year, count]) => {
              const max = Math.max(...yearEntries.map(([, c]) => c));
              const pct = Math.round((count / max) * 100);
              return (
                <div key={year} data-testid={`year-bar-${year}`}>
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="font-semibold text-slate-700">{year}</span>
                    <span className="text-slate-500">{count} drives</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: 'var(--psit-accent)' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="psit-card p-6 flex flex-col">
          <div className="psit-overline">Jump to</div>
          <h2 className="text-xl font-bold text-slate-900 mt-1" style={{ fontFamily: 'Cabinet Grotesk' }}>
            Explore data
          </h2>
          <div className="mt-5 space-y-3 flex-1">
            <Link
              to="/dashboard/students"
              data-testid="quick-link-students"
              className="flex items-center justify-between p-4 rounded-md border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition"
            >
              <div>
                <div className="font-semibold text-slate-900">Placed Students</div>
                <div className="text-xs text-slate-500">Browse alumni placements by year & branch</div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </Link>
            <Link
              to="/dashboard/drives"
              data-testid="quick-link-drives"
              className="flex items-center justify-between p-4 rounded-md border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition"
            >
              <div>
                <div className="font-semibold text-slate-900">Placement Drives</div>
                <div className="text-xs text-slate-500">Full company drive history with filters</div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </Link>
          </div>
        </div>
      </div>

      {/* Recruiters */}
      <div className="psit-card p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <div className="psit-overline">Our Recruiters</div>
            <h2 className="text-xl font-bold text-slate-900 mt-1" style={{ fontFamily: 'Cabinet Grotesk' }}>
              Companies that hire from PSIT
            </h2>
          </div>
        </div>
        <RecruiterMarquee />
      </div>
    </div>
  );
}
