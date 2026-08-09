import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  RiBarChartBoxLine,
  RiBarChartGroupedLine,
  RiFileTextLine,
  RiShieldCheckLine,
  RiUserSearchLine,
  RiUserSettingsLine,
  RiDatabase2Line,
  RiFileAddLine,
  RiHeartPulseLine,
  RiDashboard3Line,
  RiGroupLine,
  RiBuilding4Line,
  RiArrowDownSLine,
  RiArrowRightSLine,
  RiSparklingFill,
  RiTestTubeLine
} from '@remixicon/react';
import { useAuth } from '../../contexts/AuthContext';
import { isAdmin, isGuest, hasRole } from '../../utils/authRoles';
import { APP_NAV_ICON } from './appNavStyles';
import { cn } from '@/lib/utils';

const ACCENT_COLORS = [
  { id: 'blue', light: 'oklch(0.6 0.18 250)', dark: 'oklch(0.7 0.14 250)', hex: '#3b82f6', name: 'Blue', navBg: '#090d16' },
  { id: 'purple', light: 'oklch(0.55 0.22 290)', dark: 'oklch(0.68 0.16 290)', hex: '#8b5cf6', name: 'Purple', navBg: '#110e1b' },
  { id: 'pink', light: 'oklch(0.6 0.22 345)', dark: 'oklch(0.72 0.16 345)', hex: '#ec4899', name: 'Pink', navBg: '#160e14' },
  { id: 'orange', light: 'oklch(0.5 0.13 46)', dark: 'oklch(0.72 0.11 52)', hex: '#f97316', name: 'Orange', navBg: '#141210' },
  { id: 'yellow', light: 'oklch(0.75 0.16 75)', dark: 'oklch(0.82 0.14 75)', hex: '#eab308', name: 'Yellow', navBg: '#141310' },
  { id: 'green', light: 'oklch(0.65 0.18 140)', dark: 'oklch(0.74 0.13 140)', hex: '#22c55e', name: 'Green', navBg: '#0c1510' },
];

export default function SidebarNav() {
  const { user } = useAuth();
  const location = useLocation();
  const adminUser = isAdmin(user);
  const guestUser = isGuest(user);
  const pdmoUser = hasRole(user, 'pdmo');

  const [selectedColor, setSelectedColor] = useState(() => localStorage.getItem('app-accent-color') || 'orange');

  // Group Expand/Collapse States
  const [openGroups, setOpenGroups] = useState({
    dashboards: true,
    patients: true,
    forms: true,
    data: true
  });

  const toggleGroup = (groupKey) => {
    setOpenGroups(prev => ({ ...prev, [groupKey]: !prev[groupKey] }));
  };

  useEffect(() => {
    const handleLayoutChange = () => {
      setSelectedColor(localStorage.getItem('app-accent-color') || 'orange');
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
      'flex items-center gap-2.5 px-3 py-2 transition-all duration-200 cursor-pointer text-xs font-semibold relative outline-none focus:outline-none border-0',
      isActive
        ? 'bg-card text-foreground font-bold border-l-2 border-l-primary rounded-none mr-[-1px] z-10'
        : 'text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-foreground rounded-none mr-2'
    );
  };

  return (
    <aside
      className="w-56 shrink-0 flex flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground py-3 pl-3 pr-0 select-none transition-all duration-300 overflow-y-auto no-scrollbar"
    >
      {/* Brand logo */}
      <NavLink to="/dashboard" className="flex items-center gap-2 px-3 py-2 mb-2 border-b border-sidebar-border mr-3 shrink-0 select-none">
        <img src="/logo.png" alt="NCHADS Logo" className="h-6 w-auto object-contain shrink-0" />
        <span className="text-xs font-bold text-sidebar-foreground tracking-tight">ART Portal</span>
      </NavLink>

      {/* Nav Links Container */}
      <nav className="flex flex-col gap-1 flex-1 font-khmer pr-1" aria-label="Sidebar">
        
        {/* GROUP 1: DASHBOARDS & SECTORS */}
        <div className="flex flex-col">
          <button
            type="button"
            onClick={() => toggleGroup('dashboards')}
            className="flex items-center justify-between px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-sidebar-foreground/50 hover:text-sidebar-foreground transition-colors mr-3"
          >
            <span>ផ្ទាំងព័ត៌មាន (Dashboards)</span>
            {openGroups.dashboards ? <RiArrowDownSLine className="size-3.5 opacity-60" /> : <RiArrowRightSLine className="size-3.5 opacity-60" />}
          </button>

          {openGroups.dashboards && (
            <div className="flex flex-col gap-1 pl-1">
              <NavLink to="/reports" className={({ isActive }) => getLinkClass(isActive)}>
                <RiBarChartBoxLine className={APP_NAV_ICON} />
                <span>ART Reports</span>
              </NavLink>

              <NavLink
                to="/reports?view=kp"
                className={({ isActive }) => getLinkClass(isActive || location.search.includes('view=kp'))}
              >
                <RiGroupLine className={APP_NAV_ICON} />
                <span>ក្រុមប្រជាជន KP</span>
              </NavLink>

              <NavLink
                to="/reports?view=pntt"
                className={({ isActive }) => getLinkClass(isActive || location.search.includes('view=pntt'))}
              >
                <RiHeartPulseLine className={APP_NAV_ICON} />
                <span>PNTT ដៃគូ & កូន</span>
              </NavLink>

              <NavLink to="/pmtct-infant" className={({ isActive }) => getLinkClass(isActive)}>
                <RiHeartPulseLine className={APP_NAV_ICON} />
                <span>ទារក EID (Infant)</span>
              </NavLink>
            </div>
          )}
        </div>

        {!guestUser && (
          <>
            {/* GROUP 2: PATIENT CARE */}
            <div className="flex flex-col mt-2">
              <button
                type="button"
                onClick={() => toggleGroup('patients')}
                className="flex items-center justify-between px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-sidebar-foreground/50 hover:text-sidebar-foreground transition-colors mr-3"
              >
                <span>អ្នកជំងឺ (Patient 360°)</span>
                {openGroups.patients ? <RiArrowDownSLine className="size-3.5 opacity-60" /> : <RiArrowRightSLine className="size-3.5 opacity-60" />}
              </button>

              {openGroups.patients && (
                <div className="flex flex-col gap-1 pl-1">
                  <NavLink to="/patient-360" className={({ isActive }) => getLinkClass(isActive)}>
                    <RiUserSearchLine className={APP_NAV_ICON} />
                    <span>ព័ត៌មាន ៣៦០°</span>
                  </NavLink>
                  <NavLink to="/lab-app" className={({ isActive }) => getLinkClass(isActive)}>
                    <RiTestTubeLine className={APP_NAV_ICON} />
                    <span>លទ្ធផលតេស្ត Lab</span>
                  </NavLink>
                </div>
              )}
            </div>

            {/* GROUP 3: PATIENT REGISTRATION FORMS */}
            <div className="flex flex-col mt-2">
              <button
                type="button"
                onClick={() => toggleGroup('forms')}
                className="flex items-center justify-between px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-sidebar-foreground/50 hover:text-sidebar-foreground transition-colors mr-3"
              >
                <span>ទម្រង់អ្នកជំងឺ (Forms)</span>
                {openGroups.forms ? <RiArrowDownSLine className="size-3.5 opacity-60" /> : <RiArrowRightSLine className="size-3.5 opacity-60" />}
              </button>

              {openGroups.forms && (
                <div className="flex flex-col gap-1 pl-1">
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
                </div>
              )}
            </div>

            {/* GROUP 4: DATA & ANALYTICS */}
            <div className="flex flex-col mt-2">
              <button
                type="button"
                onClick={() => toggleGroup('data')}
                className="flex items-center justify-between px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-sidebar-foreground/50 hover:text-sidebar-foreground transition-colors mr-3"
              >
                <span>វិភាគទិន្នន័យ (Data)</span>
                {openGroups.data ? <RiArrowDownSLine className="size-3.5 opacity-60" /> : <RiArrowRightSLine className="size-3.5 opacity-60" />}
              </button>

              {openGroups.data && (
                <div className="flex flex-col gap-1 pl-1">
                  <NavLink to="/visualize" className={({ isActive }) => getLinkClass(isActive)}>
                    <RiBarChartGroupedLine className={APP_NAV_ICON} />
                    <span>វិភាគ (Visualize)</span>
                  </NavLink>

                  {!pdmoUser && (
                    <>
                      <NavLink to="/country-analytics" className={({ isActive }) => getLinkClass(isActive)}>
                        <RiDatabase2Line className={APP_NAV_ICON} />
                        <span>ឃ្លាំងទិន្នន័យ (Analytics)</span>
                      </NavLink>

                      <NavLink to="/dqa" className={({ isActive }) => getLinkClass(isActive)}>
                        <RiShieldCheckLine className={APP_NAV_ICON} />
                        <span>DQA គុណភាពទិន្នន័យ</span>
                      </NavLink>

                      <NavLink to="/documents" className={({ isActive }) => getLinkClass(isActive)}>
                        <RiFileTextLine className={APP_NAV_ICON} />
                        <span>API Reference</span>
                      </NavLink>
                    </>
                  )}

                  {adminUser && (
                    <NavLink to="/admin" className={({ isActive }) => getLinkClass(isActive)}>
                      <RiUserSettingsLine className={APP_NAV_ICON} />
                      <span>Admin Management</span>
                    </NavLink>
                  )}
                </div>
              )}
            </div>

          </>
        )}
      </nav>
    </aside>
  );
}
