import React, { useEffect, useMemo, useState } from 'react';

import { Search, FolderSearch, Loader2 } from 'lucide-react';
import api from '../lib/api';
import StudentProfileCard from '../components/StudentProfileCard';

const BRANCHES = [
  { value: 'EC', label: 'EC – Electronics & Comm.' },
  { value: 'CS', label: 'CS – Computer Science' }, 
  { value: 'CS-AI', label: 'CS-AI' },
  { value: 'CS-AIML', label: 'CS-AIML' },
  { value: 'CS-DS', label: 'CS-DS' },
  { value: 'CS-IOT', label: 'CS-IOT' },
  { value: 'CS-CYS', label: 'CS-CYS' },
  { value: 'IT', label: 'IT' },
  { value: 'ME', label: 'ME – Mechanical' },
  { value: 'BCA', label: 'BCA' },
  { value: 'BBA', label: 'BBA' },
  { value: 'MBA', label: 'MBA' },
  { value: 'MCA', label: 'MCA' },
];
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 7 }, (_, i) => CURRENT_YEAR - i + 1);

function StudentCard({ s }) {
  const [imgOk, setImgOk] = useState(true);
  return (
    <div className="psit-card p-5 text-center" data-testid="student-card">
      <div className="w-28 h-32 mx-auto rounded-md overflow-hidden bg-slate-100 mb-4 grid place-items-center">
        {imgOk ? (
          <img
            src={s.imageUrl}
            alt={s.name}
            className="w-full h-full object-cover"
            onError={() => setImgOk(false)}
          />
        ) : (
          <div className="w-full h-full grid place-items-center text-slate-300 font-bold text-2xl" style={{ fontFamily: 'Cabinet Grotesk' }}>
            {s.name?.slice(0, 1) || '?'}
          </div>
        )}
      </div>
      <div className="font-bold text-slate-900 truncate" title={s.name} data-testid="student-card-name">{s.name}</div>
      <div className="text-xs text-slate-500 mt-0.5">{s.branch} · {s.rollNo}</div>
      <div className="mt-3 flex flex-wrap gap-1 justify-center">
        {s.companies?.length ? s.companies.slice(0, 3).map((c, i) => (
          <span key={i} className="psit-badge psit-badge-accent" data-testid="student-card-company">{c}</span>
        )) : (
          <span className="psit-badge psit-badge-neutral">Unplaced</span>
        )}
      </div>
    </div>
  );
}

export default function PlacedStudents() {
  const [year, setYear] = useState(CURRENT_YEAR);
  const [branch, setBranch] = useState('CS');
  const [search, setSearch] = useState('');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [touched, setTouched] = useState(false);

  const load = async () => {
    setLoading(true);
    setError('');
    setTouched(true);
    try {
      const { data } = await api.get('/students', { params: { year, branch } });
      setStudents(data.students || []);
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to load students');
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  const filtered = useMemo(() => {
    if (!search) return students;
    const q = search.toLowerCase();
    return students.filter((s) =>
      (s.name || '').toLowerCase().includes(q) ||
      (s.rollNo || '').toLowerCase().includes(q) ||
      (s.companies || []).some((c) => c.toLowerCase().includes(q))
    );
  }, [students, search]);

  return (
    <div className="space-y-6" data-testid="students-page">
      <StudentProfileCard /> 
      <div>
        <div className="psit-overline">Placements</div>
        <h1 className="mt-1 text-3xl sm:text-4xl font-bold text-slate-900" style={{ fontFamily: 'Cabinet Grotesk' }}>
          Placed Students
        </h1>
        <p className="mt-2 text-slate-600">Browse students placed across companies. Filter by batch year and branch.</p>
      </div>

      {/* Filters */}
      <div className="psit-card p-4 sm:p-5 flex flex-col sm:flex-row gap-3 items-stretch sm:items-end">
        <div className="flex-1 min-w-0">
          <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Batch Year</label>
          <select
            data-testid="students-year-select"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="psit-input"
          >
            {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <div className="flex-1 min-w-0">
          <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Branch</label>
          <select
            data-testid="students-branch-select"
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
            className="psit-input"
          >
            {BRANCHES.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}
          </select>
        </div>
        <div className="flex-1 min-w-0">
          <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Search</label>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              data-testid="students-search-input"
              className="psit-input pl-9"
              placeholder="Search by name, roll no., company…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <button
          data-testid="students-load-button"
          className="psit-btn-accent sm:self-end"
          onClick={load}
          disabled={loading}
        >
          {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
          {loading ? 'Loading…' : 'Search'}
        </button>
      </div>

      {/* Result count */}
      <div className="text-sm text-slate-600" data-testid="students-result-count">
        {loading ? 'Loading students…' : touched ? `${filtered.length} student${filtered.length === 1 ? '' : 's'} found` : 'Apply filters to begin.'}
      </div>

      {error && (
        <div className="psit-card p-4 text-sm text-red-700 bg-red-50 border-red-200">{error}</div>
      )}

      {/* Grid / skeleton / empty */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="psit-card p-5">
              <div className="w-28 h-32 mx-auto skel mb-4" />
              <div className="skel h-4 w-3/4 mx-auto mb-2" />
              <div className="skel h-3 w-1/2 mx-auto" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="psit-card p-12 text-center" data-testid="students-empty">
          <FolderSearch className="w-12 h-12 mx-auto text-slate-300" />
          <h3 className="mt-4 text-lg font-bold text-slate-900" style={{ fontFamily: 'Cabinet Grotesk' }}>
            No placements found
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Try a different year or branch combination — PSIT ERP may not have records for this selection.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5" data-testid="students-grid">
          {filtered.map((s) => <StudentCard key={s.id} s={s} />)}
        </div>
      )}
    </div>
  );
}
