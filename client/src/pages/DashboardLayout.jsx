import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';

import { LayoutDashboard, Users, Building2, GraduationCap, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../lib/auth';
import StudentProfileCard from '../components/StudentProfileCard';

const navLinks = [
  { to: '/dashboard', label: 'Overview', icon: LayoutDashboard, testid: 'nav-overview' },
  { to: '/dashboard/students', label: 'Placed Students', icon: Users, testid: 'nav-students' },
  { to: '/dashboard/drives', label: 'Placement Drives', icon: Building2, testid: 'nav-drives' },
];

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const onLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[var(--psit-bg)]">
      {/* Mobile top bar */}
      <header className="lg:hidden sticky top-0 z-40 flex items-center justify-between h-14 px-4 bg-white border-b border-slate-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md grid place-items-center" style={{ background: 'var(--psit-primary)' }}>
            <GraduationCap className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold tracking-tight" style={{ fontFamily: 'Cabinet Grotesk' }}>PSIT Unofficial</span>
        </div>
        <button
          data-testid="mobile-menu-toggle"
          onClick={() => setMobileOpen((v) => !v)}
          className="p-2 rounded-md hover:bg-slate-100"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Sidebar */}
      <aside
        data-testid="sidebar"
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-slate-200 flex flex-col
                    transform transition-transform duration-200 lg:translate-x-0
                    ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className="h-16 px-5 hidden lg:flex items-center gap-2 border-b border-slate-200">
          <div className="w-9 h-9 rounded-md grid place-items-center" style={{ background: 'var(--psit-primary)' }}>
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-bold tracking-tight text-slate-900" style={{ fontFamily: 'Cabinet Grotesk' }}>
              PSIT Unofficial
            </div>
            <div className="text-[10px] uppercase tracking-widest text-slate-500">Placement Portal</div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto no-scrollbar">
          <div className="psit-overline px-3 mb-2 mt-10 md:mt-0">Menu</div>
          {navLinks.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/dashboard'}
              data-testid={l.testid}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5  rounded-md text-sm font-medium transition-colors
                 ${isActive
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`
              }
            >
              <l.icon className="w-4 h-4" />
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-slate-200 p-3">
          <div className="px-3 py-2 mb-2">
            <div className="text-xs text-slate-500">Signed in as</div>
            <div data-testid="signed-in-username" className="text-sm font-semibold text-slate-900 truncate">
              {user?.username || '—'}
            </div>
            <div className="text-[11px] uppercase tracking-wider text-slate-400">{user?.role}</div>
          </div>
          <button
            data-testid="logout-button"
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 text-sm font-semibold rounded-md
                       border border-slate-200 text-slate-700 hover:bg-slate-50 h-9"
          >
            <LogOut className="w-4 h-4" /> Sign out
          </button>
        </div>
      </aside>


      {/* Backdrop for mobile */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-20 bg-slate-900/40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Main */}
      <main className="lg:pl-64 min-h-screen">
        <div className="px-5 sm:px-8 lg:px-12 py-8 max-w-7xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
