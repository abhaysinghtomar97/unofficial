import React, { useEffect, useMemo, useState } from 'react';

import { Search, FolderSearch, ArrowUpDown, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import api from '../lib/api';
 
const PAGE_SIZE = 15;

function parseDate(s) {
  if (!s) return 0;
  const t = Date.parse(s);
  return Number.isNaN(t) ? 0 : t;
}

export default function PlacementDrives() {
  const [drives, setDrives] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [year, setYear] = useState('');
  const [search, setSearch] = useState('');
  const [sortDir, setSortDir] = useState('desc');
  const [page, setPage] = useState(1);

  useEffect(() => {
    let active = true;
    setLoading(true);
    api.get('/drives')
      .then((r) => active && setDrives(r.data.drives || []))
      .catch((e) => active && setError(e?.response?.data?.message || 'Failed to load drives'))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  const years = useMemo(() => {
    const set = new Set(drives.map((d) => String(d.year)));
    return Array.from(set).sort((a, b) => b.localeCompare(a));
  }, [drives]);

  const filtered = useMemo(() => {
    let rows = [...drives];
    if (year) rows = rows.filter((d) => String(d.year) === year);
    if (search) {
      const q = search.toLowerCase();
      rows = rows.filter((d) => (d.company || '').toLowerCase().includes(q));
    }
    rows.sort((a, b) => sortDir === 'desc' ? parseDate(b.date) - parseDate(a.date) : parseDate(a.date) - parseDate(b.date));
    return rows;
  }, [drives, year, search, sortDir]);

  useEffect(() => { setPage(1); }, [year, search, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-6" data-testid="drives-page">
      <div>
        <div className="psit-overline">Placements</div>
        <h1 className="mt-1 text-3xl sm:text-4xl font-bold text-slate-900" style={{ fontFamily: 'Cabinet Grotesk' }}>
          Placement Drives
        </h1>
        <p className="mt-2 text-slate-600">Every drive that visited the campus — searchable, sortable, paginated.</p>
      </div>

      <div className="psit-card p-4 sm:p-5 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <div className="flex-1 min-w-0">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              data-testid="drives-search-input"
              className="psit-input pl-9"
              placeholder="Search company…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <select
          data-testid="drives-year-select"
          className="psit-input sm:max-w-[180px]"
          value={year}
          onChange={(e) => setYear(e.target.value)}
        >
          <option value="">All Years</option>
          {years.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
        <button
          data-testid="drives-sort-toggle"
          onClick={() => setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'))}
          className="inline-flex items-center justify-center gap-2 h-10 rounded-md border border-slate-200 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          title="Toggle date sort"
        >
          <ArrowUpDown className="w-4 h-4" />
          Date {sortDir === 'desc' ? '↓' : '↑'}
        </button>
      </div>

      <div className="flex items-center justify-between text-sm text-slate-600">
        <span data-testid="drives-result-count">
          {loading ? 'Loading…' : `Total Drives: ${filtered.length}`}
        </span>
        {loading && <Loader2 className="w-4 h-4 animate-spin text-slate-400" />}
      </div>

      {error && (
        <div className="psit-card p-4 text-sm text-red-700 bg-red-50 border-red-200">{error}</div>
      )}

      <div className="psit-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs font-semibold tracking-wider text-slate-500 uppercase border-b border-slate-200">
              <tr>
                <th className="px-5 py-3">ID</th>
                <th className="px-5 py-3">Company</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Year</th>
                <th className="px-5 py-3">Students</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody data-testid="drives-table-body">
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="border-b border-slate-100">
                    {Array.from({ length: 6 }).map((__, j) => (
                      <td key={j} className="px-5 py-4"><div className="skel h-4 w-full" /></td>
                    ))}
                  </tr>
                ))
              ) : pageRows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center" data-testid="drives-empty">
                    <FolderSearch className="w-10 h-10 mx-auto text-slate-300" />
                    <div className="mt-3 font-bold text-slate-900" style={{ fontFamily: 'Cabinet Grotesk' }}>No drives match your filters</div>
                    <div className="text-sm text-slate-500">Adjust the year filter or search query.</div>
                  </td>
                </tr>
              ) : pageRows.map((d) => (
                <tr key={d.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors" data-testid="drives-row">
                  <td className="px-5 py-3.5 text-slate-500">{d.id}</td>
                  <td className="px-5 py-3.5 font-semibold text-slate-900">{d.company}</td>
                  <td className="px-5 py-3.5 text-slate-600">{d.date}</td>
                  <td className="px-5 py-3.5 text-slate-600">{d.year}</td>
                  <td className="px-5 py-3.5 text-slate-600">{d.students || '—'}</td>
                  <td className="px-5 py-3.5">
                    <span className={`psit-badge ${d.active ? 'psit-badge-success' : 'psit-badge-neutral'}`}>
                      {d.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!loading && filtered.length > 0 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-white">
            <div className="text-xs text-slate-500">
              Page <span className="font-semibold text-slate-700">{page}</span> of {totalPages}
            </div>
            <div className="flex items-center gap-2">
              <button
                data-testid="drives-prev-page"
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="h-9 px-3 inline-flex items-center gap-1 rounded-md border border-slate-200 text-sm text-slate-700 disabled:opacity-40 hover:bg-slate-50"
              >
                <ChevronLeft className="w-4 h-4" /> Prev
              </button>
              <button
                data-testid="drives-next-page"
                disabled={page === totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="h-9 px-3 inline-flex items-center gap-1 rounded-md border border-slate-200 text-sm text-slate-700 disabled:opacity-40 hover:bg-slate-50"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
