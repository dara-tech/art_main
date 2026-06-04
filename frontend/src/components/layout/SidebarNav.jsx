import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  RiBarChartBoxLine,
  RiBarChartGroupedLine,
  RiFileTextLine,
  RiShieldCheckLine,
  RiUserSearchLine,
  RiUserSettingsLine,
  RiDatabase2Line,
  RiFileAddLine,
  RiStethoscopeLine
} from '@remixicon/react';
import { useAuth } from '../../contexts/AuthContext';
import { isAdmin, isGuest, hasRole } from '../../utils/authRoles';
import { APP_NAV_ICON } from './appNavStyles';
import { cn } from '@/lib/utils';

const ACCENT_COLORS = [
  { id: 'blue', light: 'oklch(0.6 0.18 250)', dark: 'oklch(0.7 0.14 250)', hex: '#3b82f6', name: 'Blue', navBg: '#121b2d' },
  { id: 'purple', light: 'oklch(0.55 0.22 290)', dark: 'oklch(0.68 0.16 290)', hex: '#8b5cf6', name: 'Purple', navBg: '#1c152a' },
  { id: 'pink', light: 'oklch(0.6 0.22 345)', dark: 'oklch(0.72 0.16 345)', hex: '#ec4899', name: 'Pink', navBg: '#2d121c' },
  { id: 'orange', light: 'oklch(0.5 0.13 46)', dark: 'oklch(0.72 0.11 52)', hex: '#f97316', name: 'Orange', navBg: '#2a1720' },
  { id: 'yellow', light: 'oklch(0.75 0.16 75)', dark: 'oklch(0.82 0.14 75)', hex: '#eab308', name: 'Yellow', navBg: '#2a2015' },
  { id: 'green', light: 'oklch(0.65 0.18 140)', dark: 'oklch(0.74 0.13 140)', hex: '#22c55e', name: 'Green', navBg: '#14241c' },
];

export default function SidebarNav() {
  const { user } = useAuth();
  const adminUser = isAdmin(user);
  const guestUser = isGuest(user);
  const pdmoUser = hasRole(user, 'pdmo');

  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const [selectedColor, setSelectedColor] = useState(() => localStorage.getItem('app-accent-color') || 'orange');
  const [sidebarHover, setSidebarHover] = useState(() => localStorage.getItem('app-sidebar-hover') === 'true');

  useEffect(() => {
    const handleLayoutChange = () => {
      setSelectedColor(localStorage.getItem('app-accent-color') || 'orange');
      setTheme(localStorage.getItem('theme') || 'light');
      setSidebarHover(localStorage.getItem('app-sidebar-hover') === 'true');
    };
    window.addEventListener('app-layout-style-changed', handleLayoutChange);
    window.addEventListener('app-accent-color-changed', handleLayoutChange);
    return () => {
      window.removeEventListener('app-layout-style-changed', handleLayoutChange);
      window.removeEventListener('app-accent-color-changed', handleLayoutChange);
    };
  }, []);

  const colorObj = ACCENT_COLORS.find(c => c.id === selectedColor) || ACCENT_COLORS[3];
  const sidebarBg = colorObj.navBg;

  const getLinkClass = (isActive) => {
    return cn(
      'flex items-center gap-3 px-3 py-2.5 transition-all duration-200 cursor-pointer text-xs font-semibold relative outline-none focus:outline-none border-0',
      isActive
        ? 'bg-card text-foreground rounded-l-xl rounded-r-none border-t border-b border-l border-border/25 mr-[-1px] z-10 ' +
          'before:content-[""] before:absolute before:right-0 before:-top-[12px] before:size-[12px] before:rounded-br-xl before:shadow-[3px_3px_0_3px_var(--card)] ' +
          'after:content-[""] after:absolute after:right-0 after:-bottom-[12px] after:size-[12px] after:rounded-tr-xl after:shadow-[3px_-3px_0_3px_var(--card)]'
        : 'text-white/70 hover:bg-white/5 hover:text-white rounded-xl mr-3'
    );
  };

  return (
    <aside
      className="w-52 shrink-0 flex flex-col border-r border-border/10 py-3 pl-3 pr-0 select-none transition-all duration-300"
      style={{ backgroundColor: sidebarBg }}
    >
      {/* Brand logo */}
      <div className="flex items-center gap-2 px-3 py-4 mb-4 border-b border-white/5 mr-3">
        <span className="bg-teal-600 text-white text-[10px] font-black px-2 py-0.5 rounded tracking-wider">
          ART
        </span>
        <span className="text-white text-xs font-bold tracking-tight">ART Portal</span>
      </div>

      {/* Nav Links */}
      <nav className="flex flex-col gap-1.5 flex-1" aria-label="Sidebar">
        <NavLink to="/reports" className={({ isActive }) => getLinkClass(isActive)}>
          <RiBarChartBoxLine className={APP_NAV_ICON} />
          <span>ART Reports</span>
        </NavLink>

        {!guestUser && (
          <>
            <NavLink to="/patient-360" className={({ isActive }) => getLinkClass(isActive)}>
              <RiUserSearchLine className={APP_NAV_ICON} />
              <span>៣៦០°</span>
            </NavLink>

            <div className="mt-4 mb-1 px-3 text-[10px] font-bold uppercase tracking-wider text-white/40">
              ទម្រង់អ្នកជំងឺ (Forms)
            </div>

            <NavLink to="/forms/adult" className={({ isActive }) => getLinkClass(isActive)}>
              <RiFileAddLine className={APP_NAV_ICON} />
              <span>មនុស្សពេញវ័យ (Adult)</span>
            </NavLink>

            <NavLink to="/forms/child" className={({ isActive }) => getLinkClass(isActive)}>
              <RiFileAddLine className={APP_NAV_ICON} />
              <span>កុមារ (Child)</span>
            </NavLink>

            <NavLink to="/forms/infant" className={({ isActive }) => getLinkClass(isActive)}>
              <RiFileAddLine className={APP_NAV_ICON} />
              <span>ទារក (Infant)</span>
            </NavLink>

            <div className="mt-4 mb-1 px-3 text-[10px] font-bold uppercase tracking-wider text-white/40">
              ទិន្នន័យ (Data)
            </div>

            <NavLink to="/visualize" className={({ isActive }) => getLinkClass(isActive)}>
              <RiBarChartGroupedLine className={APP_NAV_ICON} />
              <span>វិភាគ</span>
            </NavLink>

            {!pdmoUser && (
              <>
                <NavLink to="/country-analytics" className={({ isActive }) => getLinkClass(isActive)}>
                  <RiDatabase2Line className={APP_NAV_ICON} />
                  <span>ឃ្លាំងទិន្នន័យ</span>
                </NavLink>

                <NavLink to="/dqa" className={({ isActive }) => getLinkClass(isActive)}>
                  <RiShieldCheckLine className={APP_NAV_ICON} />
                  <span>DQA</span>
                </NavLink>

                <NavLink to="/documents" className={({ isActive }) => getLinkClass(isActive)}>
                  <RiFileTextLine className={APP_NAV_ICON} />
                  <span>API</span>
                </NavLink>
              </>
            )}

            {adminUser && (
              <NavLink to="/admin" className={({ isActive }) => getLinkClass(isActive)}>
                <RiUserSettingsLine className={APP_NAV_ICON} />
                <span>Admin</span>
              </NavLink>
            )}
          </>
        )}
      </nav>
    </aside>
  );
}
