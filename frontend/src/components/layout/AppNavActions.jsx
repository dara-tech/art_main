import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import {
  RiBarChartBoxLine,
  RiBarChartGroupedLine,
  RiCodeSSlashLine,
  RiFileTextLine,
  RiShieldCheckLine,
  RiUserSearchLine,
  RiUserSettingsLine,
  RiDatabase2Line,
  RiApps2Line,
  RiDashboard3Line,
  RiHeartPulseLine,
  RiUserHeartLine,
  RiGroupLine,
  RiSparklingFill
} from '@remixicon/react';
import { 
  LogOut, 
  Sun, 
  Moon, 
  Search,
  CircleUser,
  Bookmark,
  Download,
  Puzzle,
  KeyRound,
  Settings,
  ChevronRight,
  ChevronDown,
  Check,
  X,
  Info,
  Trash2,
  ExternalLink,
  Library,
  Pencil,
  Eraser,
  FolderPlus,
  Palette,
  Merge,
  Zap,
  Sliders,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../contexts/AuthContext';
import { isAdmin, isGuest, hasRole } from '../../utils/authRoles';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { APP_NAV_ICON } from './appNavStyles';

function IncognitoIcon({ className }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M2 10h20" />
      <path d="M6 10c0-3 2-5 6-5s6 2 6 5" />
      <circle cx="8" cy="16" r="3" />
      <circle cx="16" cy="16" r="3" />
      <path d="M11 16h2" />
    </svg>
  );
}

const ACCENT_COLORS = [
  { 
    id: 'blue', 
    light: 'oklch(0.6 0.18 250)', 
    dark: 'oklch(0.7 0.14 250)', 
    ringLight: 'oklch(0.6 0.18 250)', 
    ringDark: 'oklch(0.7 0.14 250)',
    gradientEndLight: 'oklch(0.65 0.15 200)',
    gradientEndDark: 'oklch(0.75 0.12 200)',
    hex: '#3b82f6',
    name: 'Blue',
    navBg: '#090d16',
    navGradient: 'linear-gradient(135deg, #090d16 0%, #1e3a8a 50%, #1d4ed8 100%)'
  },
  { 
    id: 'purple', 
    light: 'oklch(0.55 0.22 290)', 
    dark: 'oklch(0.68 0.16 290)', 
    ringLight: 'oklch(0.55 0.22 290)', 
    ringDark: 'oklch(0.68 0.16 290)',
    gradientEndLight: 'oklch(0.65 0.2 330)',
    gradientEndDark: 'oklch(0.75 0.15 330)',
    hex: '#8b5cf6',
    name: 'Purple',
    navBg: '#110e1b',
    navGradient: 'linear-gradient(135deg, #110e1b 0%, #4c1d95 50%, #6d28d9 100%)'
  },
  { 
    id: 'pink', 
    light: 'oklch(0.6 0.22 345)', 
    dark: 'oklch(0.72 0.16 345)', 
    ringLight: 'oklch(0.6 0.22 345)', 
    ringDark: 'oklch(0.72 0.16 345)',
    gradientEndLight: 'oklch(0.6 0.22 20)',
    gradientEndDark: 'oklch(0.7 0.18 20)',
    hex: '#ec4899',
    name: 'Pink',
    navBg: '#160e14',
    navGradient: 'linear-gradient(135deg, #160e14 0%, #831843 50%, #be185d 100%)'
  },
  { 
    id: 'orange', 
    light: 'oklch(0.5 0.13 46)', 
    dark: 'oklch(0.72 0.11 52)', 
    ringLight: 'oklch(0.52 0.12 48)', 
    ringDark: 'oklch(0.72 0.11 52)',
    gradientEndLight: 'oklch(0.6 0.22 345)',
    gradientEndDark: 'oklch(0.72 0.16 345)',
    hex: '#f97316',
    name: 'Orange',
    navBg: '#141210',
    navGradient: 'linear-gradient(135deg, #141210 0%, #7c2d12 50%, #c2410c 100%)'
  },
  { 
    id: 'yellow', 
    light: 'oklch(0.75 0.16 75)', 
    dark: 'oklch(0.82 0.14 75)', 
    ringLight: 'oklch(0.75 0.16 75)', 
    ringDark: 'oklch(0.82 0.14 75)',
    gradientEndLight: 'oklch(0.65 0.18 140)',
    gradientEndDark: 'oklch(0.74 0.13 140)',
    hex: '#eab308',
    name: 'Yellow',
    navBg: '#141310',
    navGradient: 'linear-gradient(135deg, #141310 0%, #78350f 50%, #b45309 100%)'
  },
  { 
    id: 'green', 
    light: 'oklch(0.65 0.18 140)', 
    dark: 'oklch(0.74 0.13 140)', 
    ringLight: 'oklch(0.65 0.18 140)', 
    ringDark: 'oklch(0.74 0.13 140)',
    gradientEndLight: 'oklch(0.75 0.16 75)',
    gradientEndDark: 'oklch(0.82 0.14 75)',
    hex: '#22c55e',
    name: 'Green',
    navBg: '#0c1510',
    navGradient: 'linear-gradient(135deg, #0c1510 0%, #065f46 50%, #047857 100%)'
  },
];

const ALL_REPORT_INDICATORS = [
  { id: '1. Active ART patients in previous quarter', name: '1. Active ART patients' },
  { id: '2. Active Pre-ART patients in previous quarter', name: '2. Active Pre-ART patients' },
  { id: '3. Newly Enrolled', name: '3. Newly Enrolled' },
  { id: '4. Re-tested positive', name: '4. Re-tested positive' },
  { id: '5. Newly Initiated', name: '5. Newly Initiated' },
  { id: '5.1.1. New ART started: Same day', name: '5.1.1. Same day' },
  { id: '5.1.2. New ART started: 1-7 days', name: '5.1.2. 1-7 days' },
  { id: '5.1.3. New ART started: >7 days', name: '5.1.3. >7 days' },
  { id: '5.2. New ART started with TLD', name: '5.2. Started with TLD' },
  { id: '5.3. New ART patients who are pregnant', name: '5.3. Pregnant patients' },
  { id: '6. Transfer-in patients', name: '6. Transfer-in' },
  { id: '7. Lost and Return', name: '7. Lost and Return' },
  { id: '8. Number of patients started TPT in this quarter', name: '8. Started TPT' },
  { id: '9.1. Dead', name: '9.1. Dead' },
  { id: '9.2. Lost to follow up (LTFU)', name: '9.2. LTFU' },
  { id: '9.3. Transfer-out', name: '9.3. Transfer-out' },
  { id: '10. Active Pre-ART patients at end of this quarter', name: '10. Active Pre-ART' },
  { id: '11. Active ART patients at end of this quarter', name: '11. Active ART' },
  { id: '11.1. Eligible MMD', name: '11.1. Eligible MMD' },
  { id: '11.2. MMD', name: '11.2. MMD' },
  { id: '11.3. TLD', name: '11.3. TLD' },
  { id: '11.4. TPT Start', name: '11.4. TPT Start' },
  { id: '11.5. TPT Complete', name: '11.5. TPT Complete' },
  { id: '11.5.1. Started ART > 6 months', name: '11.5.1. Started ART > 6M' },
  { id: '11.6. Eligible for VL test', name: '11.6. Eligible for VL test' },
  { id: '11.7. VL tested in 12M', name: '11.7. VL tested in 12M' },
  { id: '11.8. VL suppression', name: '11.8. VL suppression' }
];

const SEARCHABLE_TABS = [
  { name: 'ART Reports Summary', path: '/reports', desc: 'Main reports and aggregate summaries', Icon: RiBarChartBoxLine },
  { name: 'Patient 360° Search', path: '/patient-360', desc: 'Comprehensive patient view', Icon: RiUserSearchLine },
  { name: 'Data Visualization', path: '/visualize', desc: 'Interactive analysis charts', Icon: RiBarChartGroupedLine },
  { name: 'Warehouse Analytics', path: '/country-analytics', desc: 'Warehouse performance trends', Icon: RiDatabase2Line },
  { name: 'Data Quality Assessment (DQA)', path: '/dqa', desc: 'Validation rules and audits', Icon: RiShieldCheckLine },
  { name: 'API Reference', path: '/documents', desc: 'ETL documentation & schema dictionary', Icon: RiFileTextLine },
  { name: 'Admin Management', path: '/admin', desc: 'User roles and sites registry', Icon: RiUserSettingsLine }
];

export default function AppNavActions({ onLogout, hideNav }) {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const displayName = user?.fullName || user?.name || user?.username || 'User';
  const adminUser = isAdmin(user);
  const guestUser = isGuest(user);
  const pdmoUser = hasRole(user, 'pdmo');

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isIncognito, setIsIncognito] = useState(() => {
    return localStorage.getItem('app-incognito') === 'true';
  });
  const [selectedColor, setSelectedColor] = useState(() => {
    return localStorage.getItem('app-accent-color') || 'orange';
  });

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [isAppMenuOpen, setIsAppMenuOpen] = useState(false);

  useEffect(() => {
    if (!isAppMenuOpen) return;
    const handleOutsideClick = (e) => {
      if (!e.target.closest('.app-menu-dropdown-container')) {
        setIsAppMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isAppMenuOpen]);

  const appMenuItems = [
    {
      label: 'Dashboard',
      path: '/dashboard',
      desc: 'ផ្ទាំងគ្រប់គ្រងទិន្នន័យ ART',
      Icon: RiDashboard3Line,
      allowed: true,
      gradient: 'bg-gradient-to-tr from-emerald-600 to-teal-500',
    },
    {
      label: 'PNTT Services',
      path: '/dashboard?view=pntt',
      desc: 'ផ្ទាំងព័ត៌មាន PNTT (Partner Testing)',
      Icon: RiUserHeartLine,
      allowed: true,
      gradient: 'bg-gradient-to-tr from-cyan-600 to-blue-500',
    },
    {
      label: 'Infant EID',
      path: '/pmtct-infant',
      desc: 'ទារក & បង្ការពីម្តាយទៅកូន',
      Icon: RiHeartPulseLine,
      allowed: true,
      gradient: 'bg-gradient-to-tr from-pink-500 to-rose-400',
    },
    {
      label: 'ART Reports',
      path: '/reports',
      desc: 'របាយការណ៍ & សង្ខេប',
      Icon: RiBarChartBoxLine,
      allowed: true,
      gradient: 'bg-gradient-to-tr from-blue-600 to-indigo-500',
    },
    {
      label: '៣៦០°',
      path: '/patient-360',
      desc: 'ព័ត៌មានអ្នកជំងឺ ៣៦០°',
      Icon: RiUserSearchLine,
      allowed: !guestUser,
      gradient: 'bg-gradient-to-tr from-teal-600 to-emerald-400',
    },
    {
      label: 'KP Population',
      path: '/dashboard?view=kp',
      desc: 'វិភាគក្រុមប្រជាជនគន្លឹះ KP',
      Icon: RiGroupLine,
      allowed: !guestUser,
      gradient: 'bg-gradient-to-tr from-indigo-600 to-purple-500',
    },
    {
      label: 'វិភាគ',
      path: '/visualize',
      desc: 'វិភាគទិន្នន័យ & រ៉ាត',
      Icon: RiBarChartGroupedLine,
      allowed: !guestUser,
      gradient: 'bg-gradient-to-tr from-amber-500 to-orange-500',
    },
    {
      label: 'ឃ្លាំងទិន្នន័យ',
      path: '/country-analytics',
      desc: 'Warehouse Analytics',
      Icon: RiDatabase2Line,
      allowed: !guestUser && !pdmoUser,
      gradient: 'bg-gradient-to-tr from-cyan-600 to-sky-400',
    },
    {
      label: 'DQA',
      path: '/dqa',
      desc: 'ត្រួតពិនិត្យគុណភាពទិន្នន័យ',
      Icon: RiShieldCheckLine,
      allowed: !guestUser && !pdmoUser,
      gradient: 'bg-gradient-to-tr from-rose-600 to-pink-500',
    },
    {
      label: 'API',
      path: '/documents',
      desc: 'API Reference & Doc',
      Icon: RiFileTextLine,
      allowed: !guestUser && !pdmoUser,
      gradient: 'bg-gradient-to-tr from-purple-600 to-violet-500',
    },
    {
      label: 'Admin',
      path: '/admin',
      desc: 'គ្រប់គ្រងប្រព័ន្ធ',
      Icon: RiUserSettingsLine,
      allowed: adminUser,
      gradient: 'bg-gradient-to-tr from-slate-700 to-slate-900',
    },
  ].filter((item) => item.allowed);

  // Modal active state
  const [activeModal, setActiveModal] = useState(null);
  
  // Profile edit states
  const [profileName, setProfileName] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [profileAvatarColor, setProfileAvatarColor] = useState('bg-amber-500');

  // Password change states
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Bookmarks state
  const [bookmarks, setBookmarks] = useState(() => {
    const stored = localStorage.getItem('app-bookmarks');
    if (stored) return JSON.parse(stored);
    return [
      { id: '1', name: 'ART Reports Summary', path: '/reports' },
      { id: '2', name: 'Patient 360° View', path: '/patient-360' }
    ];
  });

  // Extensions state
  const [extensions, setExtensions] = useState({
    autoRefresh: localStorage.getItem('ext-auto-refresh') === 'true',
    queryProfiler: localStorage.getItem('ext-profiler') === 'true',
    khmerOverlay: localStorage.getItem('ext-translation') === 'true'
  });

  // Settings states
  const [appLang, setAppLang] = useState(localStorage.getItem('app-lang') || 'kh');
  const [defaultPage, setDefaultPage] = useState(localStorage.getItem('app-default-page') || '/dashboard');
  const [sidebarHover, setSidebarHover] = useState(localStorage.getItem('app-sidebar-hover') === 'true');
  const [useAnalytics, setUseAnalytics] = useState(() => {
    return localStorage.getItem('app-use-analytics') === 'true';
  });
  const [layoutStyle, setLayoutStyle] = useState(() => {
    return localStorage.getItem('app-layout-style') || 'navbar';
  });
  const [maxChartSeries, setMaxChartSeries] = useState(() => {
    return Number(localStorage.getItem('app-max-chart-series')) || 6;
  });
  const [maxReportIndicators, setMaxReportIndicators] = useState(() => {
    return localStorage.getItem('app-max-report-indicators') || 'All';
  });
  const [enabledReportIndicators, setEnabledReportIndicators] = useState(() => {
    try {
      const stored = localStorage.getItem('app-enabled-report-indicators');
      return stored ? JSON.parse(stored) : ALL_REPORT_INDICATORS.map(ind => ind.id);
    } catch (e) {
      return ALL_REPORT_INDICATORS.map(ind => ind.id);
    }
  });
  const [isFullscreen, setIsFullscreen] = useState(() => typeof document !== 'undefined' && Boolean(document.fullscreenElement));
  const [isModalFullscreen, setIsModalFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      const docEl = document.documentElement;
      if (docEl.requestFullscreen) {
        docEl.requestFullscreen().catch(() => {});
      } else if (docEl.webkitRequestFullscreen) {
        docEl.webkitRequestFullscreen().catch(() => {});
      } else if (docEl.msRequestFullscreen) {
        docEl.msRequestFullscreen().catch(() => {});
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen().catch(() => {});
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen().catch(() => {});
      }
    }
  };

  useEffect(() => {
    if (activeModal === 'profile' && user) {
      setProfileName(user.fullName || user.name || '');
      setProfileEmail(user.email || (user.username?.includes('@') ? user.username : 'daracheol@gmail.com'));
      setProfileAvatarColor(user.avatarColor || 'bg-amber-500');
    }
    if (activeModal === 'reportConfig') {
      setMaxChartSeries(Number(localStorage.getItem('app-max-chart-series')) || 6);
      setMaxReportIndicators(localStorage.getItem('app-max-report-indicators') || 'All');
      try {
        const stored = localStorage.getItem('app-enabled-report-indicators');
        setEnabledReportIndicators(stored ? JSON.parse(stored) : ALL_REPORT_INDICATORS.map(ind => ind.id));
      } catch (e) {
        setEnabledReportIndicators(ALL_REPORT_INDICATORS.map(ind => ind.id));
      }
    }
    if (activeModal === 'settings') {
      setLayoutStyle(localStorage.getItem('app-layout-style') || 'navbar');
      setUseAnalytics(localStorage.getItem('app-use-analytics') === 'true');
    }
  }, [activeModal, user]);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const colorObj = ACCENT_COLORS.find(c => c.id === selectedColor) || ACCENT_COLORS[3];
    const isDark = theme === 'dark';
    const primaryVal = isDark ? colorObj.dark : colorObj.light;
    const ringVal = isDark ? colorObj.ringDark : colorObj.ringLight;
    const gradientEndVal = isDark ? colorObj.gradientEndDark : colorObj.gradientEndLight;

    document.documentElement.classList.remove('theme-gradient-flavor');
    document.documentElement.style.setProperty('--primary', primaryVal);
    document.documentElement.style.setProperty('--ring', ringVal);
    document.documentElement.style.setProperty('--sidebar-primary', primaryVal);
    document.documentElement.style.setProperty('--gradient-end', gradientEndVal);
    
    localStorage.setItem('app-accent-color', selectedColor);
    window.dispatchEvent(new Event('app-accent-color-changed'));
  }, [selectedColor, theme]);

  useEffect(() => {
    if (!isDropdownOpen) return;
    const handleOutsideClick = (e) => {
      if (!e.target.closest('.profile-dropdown-container')) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isDropdownOpen]);

  useEffect(() => {
    if (!isSearchOpen) return;
    const handleOutsideClick = (e) => {
      if (!e.target.closest('.search-dropdown-container')) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isSearchOpen]);

  const toggleIncognito = () => {
    const nextState = !isIncognito;
    setIsIncognito(nextState);
    localStorage.setItem('app-incognito', String(nextState));
    if (nextState) {
      toast.success('Incognito mode activated', {
        description: 'Your browsing history is private.',
        duration: 3000
      });
    } else {
      toast.info('Incognito mode deactivated', {
        duration: 2000
      });
    }
    setIsDropdownOpen(false);
  };

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const handleClearCache = async () => {
    setIsDropdownOpen(false);
    toast.loading('Clearing application cache and reloading queries...');
    try {
      try {
        await api.get('/apiv1/indicators-optimized/reload-queries');
      } catch (_) { /* ignore if backend endpoint not available */ }

      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
      }

      sessionStorage.clear();

      toast.dismiss();
      toast.success('Cache cleared successfully! Refreshing...');

      setTimeout(() => {
        window.location.reload();
      }, 400);
    } catch (e) {
      toast.dismiss();
      toast.error('Failed to clear cache: ' + e.message);
    }
  };

  const getInitials = (name) => {
    const cleanName = String(name || '').trim();
    if (!cleanName) return 'U';
    const parts = cleanName.split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const getTabClass = (isActive) => {
    return cn(
      'inline-flex shrink-0 items-center justify-center gap-1.5 h-8 px-4 text-[11px] font-medium transition-all relative rounded-t-[10px] select-none border-t border-l border-r outline-none focus:outline-none focus:ring-0',
      isActive
        ? 'bg-card text-foreground border-border/80 z-10 -mb-[1px]'
        : 'bg-transparent text-white/70 border-transparent hover:bg-white/10 hover:text-white border-b-transparent'
    );
  };

  const activeColorObj = ACCENT_COLORS.find(c => c.id === selectedColor) || ACCENT_COLORS[3];
  const headerBgStyle = isIncognito
    ? { backgroundColor: '#181617' }
    : { backgroundColor: activeColorObj.navBg };

  return (
    <header
      className="sticky top-0 z-50 flex h-10 shrink-0 items-end justify-between border-b border-border/80 px-2 pt-1 transition-all duration-300 shadow-md"
      style={headerBgStyle}
      aria-label="Global"
    >
      {!hideNav && (
        <div className="flex shrink-0 items-center h-8 mb-[2px] mr-2">
          <span className="bg-primary text-primary-foreground text-[10px] font-black px-2 py-0.5 rounded tracking-wider select-none shadow-xs">
            ART
          </span>
          <span className="text-xs font-bold text-white ml-2 tracking-tight">
            ART Portal
          </span>
        </div>
      )}
      <div className="flex-1" />

      <div className="flex shrink-0 items-center h-8 mb-[2px] gap-1 bg-transparent pr-1">
        {/* Search Dropdown Container */}
        <div className="relative search-dropdown-container flex items-center">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => {
              setIsSearchOpen(!isSearchOpen);
              setSearchQuery('');
            }}
            className="h-7 w-7 text-white/70 hover:bg-white/10 hover:text-white rounded-md flex items-center justify-center p-0 cursor-pointer outline-none focus:outline-none"
            title="ស្វែងរក (Search)"
            aria-label="Search"
          >
            <Search className="size-3.5 text-white/80" strokeWidth={2.5} />
          </Button>

          {isSearchOpen && (
            <div className="absolute right-0 top-8.5 w-[285px] bg-[#1d1b1c]/95 border-none rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.65)] backdrop-blur-md p-3.5 text-white z-50 select-none flex flex-col gap-2 animate-in fade-in slide-in-from-top-2 duration-150">
              {/* Tooltip arrow */}
              <div className="absolute -top-[5.5px] right-[10px] w-2.5 h-2.5 bg-[#1d1b1c] border-none rotate-45" />

              {/* Search Input */}
              <div className="relative flex items-center mb-1 mt-0.5">
                <Search className="absolute left-3 size-4 text-white/40" />
                <input
                  type="text"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search tabs..."
                  className="w-full bg-[#141213] border border-white/[0.08] focus:border-[#4285f4] focus:ring-1 focus:ring-[#4285f4]/50 rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder-white/30 outline-none transition-all"
                />
              </div>

              {/* Quick Actions */}
              <div className="flex flex-col gap-0.5">
                <button
                  type="button"
                  onClick={() => {
                    toast.success("Auto Organize", { description: "Tabs auto-organized successfully." });
                    setIsSearchOpen(false);
                  }}
                  className="flex w-full items-center gap-3 px-2.5 py-1.5 rounded-lg text-left text-xs text-white/90 hover:bg-white/[0.06] hover:text-white transition-all duration-150 group cursor-pointer"
                >
                  <Library className="size-4 text-white/60 group-hover:text-white transition-colors" />
                  <span className="flex-1 font-medium">Auto organize</span>
                  <Pencil className="size-3 text-white/30 group-hover:text-white/60 transition-colors" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    toast.success("Duplicate Tabs Removed", { description: "0 duplicate tabs found." });
                    setIsSearchOpen(false);
                  }}
                  className="flex w-full items-center gap-3 px-2.5 py-1.5 rounded-lg text-left text-xs text-white/90 hover:bg-white/[0.06] hover:text-white transition-all duration-150 group cursor-pointer"
                >
                  <Eraser className="size-4 text-white/60 group-hover:text-white transition-colors" />
                  <span className="flex-1 font-medium">Remove duplicate tabs</span>
                  <span className="text-[10px] text-white/30 group-hover:text-white/60 transition-colors">⇧ ⌘ D</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    toast.success("Create Tab Group", { description: "New tab group created." });
                    setIsSearchOpen(false);
                  }}
                  className="flex w-full items-center gap-3 px-2.5 py-1.5 rounded-lg text-left text-xs text-white/90 hover:bg-white/[0.06] hover:text-white transition-all duration-150 group cursor-pointer"
                >
                  <FolderPlus className="size-4 text-white/60 group-hover:text-white transition-colors" />
                  <span className="flex-1 font-medium">Create tab group</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    toast.info("Select Tab Style", { description: "Theme style settings." });
                    setIsSearchOpen(false);
                  }}
                  className="flex w-full items-center gap-3 px-2.5 py-1.5 rounded-lg text-left text-xs text-white/90 hover:bg-white/[0.06] hover:text-white transition-all duration-150 group cursor-pointer"
                >
                  <Palette className="size-4 text-white/60 group-hover:text-white transition-colors" />
                  <span className="flex-1 font-medium">Change tab style</span>
                  <ChevronRight className="size-3.5 text-white/30 group-hover:text-white/60 transition-colors" />
                </button>

                <div className="flex w-full items-center gap-3 px-2.5 py-1.5 rounded-lg text-left text-xs text-white/30 opacity-45 pointer-events-none">
                  <Merge className="size-4" />
                  <span className="flex-1 font-medium">Merge all windows</span>
                </div>
              </div>

              <div className="h-px bg-white/[0.06] my-1" />

              {/* Tabs list */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-semibold text-white/40 uppercase tracking-wider ml-2.5 mt-0.5">
                  All Tabs
                </span>

                <div className="flex flex-col gap-0.5 max-h-[180px] overflow-y-auto no-scrollbar">
                  {(() => {
                    const filteredTabs = SEARCHABLE_TABS.filter(tab => 
                      tab.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                      tab.desc.toLowerCase().includes(searchQuery.toLowerCase())
                    );
                    if (filteredTabs.length === 0) {
                      return <span className="text-[11px] text-white/40 py-4 text-center">No tabs found matching search.</span>;
                    }
                    return filteredTabs.map(tab => {
                      const isActivePage = window.location.pathname === tab.path;
                      const TabIcon = tab.Icon;
                      return (
                        <button
                          key={tab.path}
                          type="button"
                          onClick={() => {
                            navigate(tab.path);
                            setIsSearchOpen(false);
                          }}
                          className={cn(
                            "flex w-full items-center gap-3 px-2.5 py-2 rounded-lg text-left text-xs transition-all duration-150 group cursor-pointer",
                            isActivePage 
                              ? "bg-white/[0.06] text-white font-semibold" 
                              : "text-white/90 hover:bg-white/[0.04] hover:text-white"
                          )}
                        >
                          <div className={cn(
                            "flex size-6 shrink-0 items-center justify-center rounded-lg transition-colors",
                            isActivePage 
                              ? "bg-purple-500/25 text-purple-400" 
                              : "bg-white/5 text-white/50 group-hover:bg-white/10 group-hover:text-white/80"
                          )}>
                            <TabIcon className="size-3.5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="truncate">{tab.name}</div>
                            <div className={cn(
                              "text-[9px] truncate transition-colors",
                              isActivePage ? "text-purple-300" : "text-white/40 group-hover:text-white/55"
                            )}>{tab.desc}</div>
                          </div>
                        </button>
                      );
                    });
                  })()}
                </div>
              </div>

            </div>
          )}
        </div>

        {/* App Menu Icon Dropdown (Right between Search and toolbar icons) */}
        {!hideNav && (
          <div className="relative app-menu-dropdown-container flex items-center">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => setIsAppMenuOpen((prev) => !prev)}
              className="h-7 w-7 text-white/70 hover:bg-white/10 hover:text-white rounded-md flex items-center justify-center p-0 cursor-pointer outline-none focus:outline-none"
              title="App Menu (កម្មវិធីប្រព័ន្ធ)"
              aria-label="App Menu"
            >
              <RiApps2Line className="size-4 text-emerald-400" />
            </Button>

            {isAppMenuOpen && (
              <div className="absolute right-0 top-8.5 z-50 w-[350px] sm:w-[410px] rounded-2xl border border-border bg-card/95 p-3 shadow-2xl backdrop-blur-xl animate-in fade-in-50 zoom-in-95">
                <div className="px-2 py-1.5 mb-2 border-b border-border/60 flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <RiApps2Line className="size-4 text-primary" />
                    App Menu (កម្មវិធីប្រព័ន្ធ)
                  </span>
                  <span className="text-[10px] text-muted-foreground font-medium">ART Portal</span>
                </div>

                <div className="grid grid-cols-2 gap-2 max-h-[75vh] overflow-y-auto p-0.5">
                  {appMenuItems.map((item) => {
                    const currentPath = location.pathname + location.search;
                    const isActive = item.path.includes('?')
                      ? currentPath === item.path
                      : location.pathname === item.path && (!location.search.includes('view=') || item.path !== '/dashboard');
                    return (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={() => setIsAppMenuOpen(false)}
                        className={cn(
                          "flex items-center gap-2.5 p-2 rounded-xl text-xs font-medium transition-all border group",
                          isActive
                            ? "bg-primary/10 text-foreground font-semibold border-primary/45 ring-1 ring-primary/30 shadow-2xs"
                            : "border-transparent text-foreground/85 hover:bg-muted/80 hover:border-border/60 hover:text-foreground"
                        )}
                      >
                        {/* Apple iOS-Style Squircle App Icon Badge (Flat, No Shadow) */}
                        <div className={cn("flex size-9 shrink-0 items-center justify-center rounded-[11px] text-white transition-transform duration-200 group-hover:scale-105", item.gradient)}>
                          <item.Icon className="size-5 text-white" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="truncate font-bold text-xs leading-snug">{item.label}</span>
                          <span className="text-[10px] text-muted-foreground truncate font-normal leading-tight">{item.desc}</span>
                        </div>
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="w-px h-4 bg-white/15 mx-1" />
        
        {/* Profile Dropdown Container */}
        <div className="relative profile-dropdown-container flex items-center">
          {isIncognito && (
            <div className="mr-2 flex size-6 items-center justify-center rounded-full bg-purple-950/60 border border-purple-800/40 text-purple-400" title="Incognito Mode Active">
              <IncognitoIcon className="size-3.5" />
            </div>
          )}
          {/* Profile Dropdown Toggle Trigger Button */}
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className={cn(
              "flex size-6 shrink-0 select-none items-center justify-center rounded-full text-primary-foreground font-black text-[10px] shadow-sm hover:scale-105 transition-transform cursor-pointer border border-white/20 bg-primary",
              user?.avatarColor
            )}
            title={displayName}
          >
            {getInitials(displayName)}
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 top-8.5 w-[265px] bg-[#1d1b1c]/95 border-none rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.65)] backdrop-blur-md p-3.5 text-white z-50 select-none flex flex-col gap-1.5 animate-in fade-in slide-in-from-top-2 duration-150">
              {/* Account Info */}
              <div className="flex items-center gap-3 px-1 py-1.5 mb-0.5">
                <div className={cn(
                  "flex size-8 shrink-0 select-none items-center justify-center rounded-full text-primary-foreground font-bold text-xs shadow-inner bg-primary",
                  user?.avatarColor
                )}>
                  {getInitials(displayName)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] font-semibold truncate text-white leading-tight">
                    {user?.email || (user?.username ? (user.username.includes('@') ? user.username : `${user.username}@gmail.com`) : 'daracheol@gmail.com')}
                  </div>
                </div>
                <div className="flex size-4.5 items-center justify-center rounded-full bg-white text-[#1d1b1c]">
                  <Check className="size-3" strokeWidth={3.5} />
                </div>
              </div>

              {/* Profile Actions */}
              <button 
                type="button"
                onClick={() => {
                  setActiveModal('profile');
                  setIsDropdownOpen(false);
                }}
                className="flex w-full items-center gap-3 px-2 py-1.5 rounded-lg text-left text-xs text-white/90 hover:bg-white/[0.06] hover:text-white transition-all duration-150 group cursor-pointer"
              >
                <CircleUser className="size-4 text-white/60 group-hover:text-white transition-colors" />
                <span className="flex-1 font-medium">Edit or add profile</span>
              </button>

              <div className="h-px bg-white/[0.06] my-1" />

              {/* Menu Items */}
              <button 
                type="button"
                onClick={() => {
                  setActiveModal('bookmarks');
                  setIsDropdownOpen(false);
                }}
                className="flex w-full items-center gap-3 px-2 py-1.5 rounded-lg text-left text-xs text-white/90 hover:bg-white/[0.06] hover:text-white transition-all duration-150 group cursor-pointer"
              >
                <Bookmark className="size-4 text-white/60 group-hover:text-white transition-colors" />
                <span className="flex-1 font-medium">Bookmarks</span>
                <ChevronRight className="size-3.5 text-white/30 group-hover:text-white/60 transition-colors" />
              </button>

              <button 
                type="button"
                onClick={() => {
                  setActiveModal('downloads');
                  setIsDropdownOpen(false);
                }}
                className="flex w-full items-center gap-3 px-2 py-1.5 rounded-lg text-left text-xs text-white/90 hover:bg-white/[0.06] hover:text-white transition-all duration-150 group cursor-pointer"
              >
                <Download className="size-4 text-white/60 group-hover:text-white transition-colors" />
                <span className="flex-1 font-medium">Downloads</span>
                <ChevronRight className="size-3.5 text-white/30 group-hover:text-white/60 transition-colors" />
              </button>

              <button 
                type="button"
                onClick={() => {
                  setActiveModal('extensions');
                  setIsDropdownOpen(false);
                }}
                className="flex w-full items-center gap-3 px-2 py-1.5 rounded-lg text-left text-xs text-white/90 hover:bg-white/[0.06] hover:text-white transition-all duration-150 group cursor-pointer"
              >
                <Puzzle className="size-4 text-white/60 group-hover:text-white transition-colors" />
                <span className="flex-1 font-medium">Extensions</span>
                <ChevronRight className="size-3.5 text-white/30 group-hover:text-white/60 transition-colors" />
              </button>

              <button 
                type="button"
                onClick={() => {
                  setActiveModal('reportConfig');
                  setIsDropdownOpen(false);
                }}
                className="flex w-full items-center gap-3 px-2 py-1.5 rounded-lg text-left text-xs text-white/90 hover:bg-white/[0.06] hover:text-white transition-all duration-150 group cursor-pointer"
              >
                <Sliders className="size-4 text-white/60 group-hover:text-white transition-colors" />
                <span className="flex-1 font-medium">Report Config</span>
                <ChevronRight className="size-3.5 text-white/30 group-hover:text-white/60 transition-colors" />
              </button>

              <button 
                type="button"
                onClick={() => {
                  setActiveModal('passwords');
                  setIsDropdownOpen(false);
                }}
                className="flex w-full items-center gap-3 px-2 py-1.5 rounded-lg text-left text-xs text-white/90 hover:bg-white/[0.06] hover:text-white transition-all duration-150 group cursor-pointer"
              >
                <KeyRound className="size-4 text-white/60 group-hover:text-white transition-colors" />
                <span className="flex-1 font-medium">Passwords</span>
                <ChevronRight className="size-3.5 text-white/30 group-hover:text-white/60 transition-colors" />
              </button>

              <button 
                type="button"
                onClick={() => {
                  setActiveModal('settings');
                  setIsDropdownOpen(false);
                }}
                className="flex w-full items-center gap-3 px-2 py-1.5 rounded-lg text-left text-xs text-white/90 hover:bg-white/[0.06] hover:text-white transition-all duration-150 group cursor-pointer"
              >
                <Settings className="size-4 text-white/60 group-hover:text-white transition-colors" />
                <span className="flex-1 font-medium">Settings</span>
              </button>

              <button 
                type="button"
                onClick={handleClearCache}
                className="flex w-full items-center gap-3 px-2 py-1.5 rounded-lg text-left text-xs text-amber-400/90 hover:bg-white/[0.06] hover:text-amber-300 transition-all duration-150 group cursor-pointer"
              >
                <Trash2 className="size-4 text-amber-400/80 group-hover:text-amber-300 transition-colors" />
                <span className="flex-1 font-medium">Clear Cache</span>
              </button>

              <div className="h-px bg-white/[0.06] my-1" />

              {/* Incognito */}
              <button 
                type="button"
                onClick={toggleIncognito}
                className={cn(
                  "flex w-full items-center gap-3 px-2 py-1.5 rounded-lg text-left text-xs transition-all duration-150 group cursor-pointer",
                  isIncognito 
                    ? "bg-purple-950/40 text-purple-200 border border-purple-800/30 hover:bg-purple-900/40" 
                    : "text-white/90 hover:bg-white/[0.06] hover:text-white"
                )}
              >
                <IncognitoIcon className={cn("size-4 transition-colors", isIncognito ? "text-purple-400" : "text-white/60 group-hover:text-white")} />
                <span className="flex-1 font-medium">Incognito window</span>
                {isIncognito && (
                  <span className="text-[9px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded-full font-bold">ACTIVE</span>
                )}
              </button>

              {/* Theme Toggle (Dark Mode) */}
              <div className="flex w-full items-center justify-between px-2 py-1 rounded-lg text-xs text-white/90">
                <div className="flex items-center gap-3">
                  {theme === 'dark' ? (
                    <Moon className="size-4 text-purple-400" />
                  ) : (
                    <Sun className="size-4 text-amber-400" />
                  )}
                  <span className="font-medium">Dark Mode</span>
                </div>
                <button
                  type="button"
                  onClick={toggleTheme}
                  className={cn(
                    "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none",
                    theme === 'dark' ? "bg-primary" : "bg-white/10"
                  )}
                >
                  <span
                    className={cn(
                      "pointer-events-none inline-block size-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out",
                      theme === 'dark' ? "translate-x-4" : "translate-x-0"
                    )}
                  />
                </button>
              </div>

              <div className="h-px bg-white/[0.06] my-1" />

              {/* Accent Color Picker */}
              <div className="px-2 py-1">
                <div className="flex items-center justify-between text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-2">
                  <span>Accent Color</span>
                  <span className="text-primary font-bold">{ACCENT_COLORS.find(c => c.id === selectedColor)?.name || 'Gradient Flavor'}</span>
                </div>
                
                {/* Custom Gradient Slider */}
                <div className="relative w-full h-[6px] rounded-full bg-gradient-to-r from-[#3b82f6] via-[#8b5cf6] via-[#ec4899] via-[#f97316] via-[#eab308] to-[#22c55e] my-3">
                  {ACCENT_COLORS.map((color, index) => {
                    const isSelected = selectedColor === color.id;
                    const leftPct = 5 + (index / (ACCENT_COLORS.length - 1)) * 90;
                    return (
                      <button
                        key={color.id}
                        type="button"
                        onClick={() => {
                          setSelectedColor(color.id);
                          toast.success(`Accent color set to ${color.name}!`);
                        }}
                        style={{ left: `${leftPct}%` }}
                        className="absolute -translate-x-1/2 -translate-y-1/2 top-1/2 cursor-pointer flex items-center justify-center size-5 hover:scale-110 active:scale-95 transition-transform outline-none focus:outline-none"
                        title={color.name}
                      >
                        {isSelected ? (
                          <div className={`size-3.5 rounded-full shadow-[0_2px_5px_rgba(0,0,0,0.6)] border border-white/40 scale-110 transition-all duration-200 ${color.isGradient ? 'bg-gradient-to-tr from-blue-500 via-pink-500 to-amber-400 ring-2 ring-white' : 'bg-white'}`} />
                        ) : (
                          <div className="size-1.5 bg-[#181617]/70 rounded-full hover:scale-125 transition-all duration-150" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="h-px bg-white/[0.06] my-1" />

              {/* Sign out */}
              <button 
                type="button"
                onClick={() => {
                  setIsDropdownOpen(false);
                  onLogout();
                }}
                className="flex w-full items-center gap-3 px-2 py-1.5 rounded-lg text-left text-xs text-rose-400 hover:bg-rose-500/10 transition-all duration-150 group cursor-pointer"
              >
                <LogOut className="size-4 text-rose-400 group-hover:scale-105 transition-transform" />
                <span className="flex-1 font-semibold">Sign out</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal overlays */}
      {activeModal && (
        <div className="fixed inset-0 bg-[#0c0a0b]/75 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div
            className={cn(
              "flex flex-col overflow-hidden bg-card text-foreground rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.7)] border-none relative animate-in zoom-in-95 duration-200 transition-all",
              isModalFullscreen
                ? "fixed inset-3 w-auto h-auto max-w-none max-h-none z-50 rounded-2xl"
                : activeModal === 'reportConfig' ? "w-full max-w-xl flex-1 max-h-[85vh]" : "w-full max-w-md"
            )}
          >
            {/* Modal Header */}
            <div className="flex shrink-0 items-center justify-between gap-3 bg-[#2a1720] border-b border-white/10 px-5 py-3.5 text-white">
              <h3 className="text-sm font-bold flex items-center gap-2">
                {activeModal === 'profile' && <CircleUser className="size-4.5" stroke="url(#icon-gradient)" />}
                {activeModal === 'bookmarks' && <Bookmark className="size-4.5" stroke="url(#icon-gradient)" />}
                {activeModal === 'downloads' && <Download className="size-4.5" stroke="url(#icon-gradient)" />}
                {activeModal === 'extensions' && <Puzzle className="size-4.5" stroke="url(#icon-gradient)" />}
                {activeModal === 'reportConfig' && <Sliders className="size-4.5" stroke="url(#icon-gradient)" />}
                {activeModal === 'passwords' && <KeyRound className="size-4.5" stroke="url(#icon-gradient)" />}
                {activeModal === 'settings' && <Settings className="size-4.5" stroke="url(#icon-gradient)" />}
                
                {activeModal === 'profile' && 'Edit Profile'}
                {activeModal === 'bookmarks' && 'My Bookmarks'}
                {activeModal === 'downloads' && 'Downloads History'}
                {activeModal === 'extensions' && 'Manage Extensions'}
                {activeModal === 'reportConfig' && 'Report Configuration'}
                {activeModal === 'passwords' && 'Change Password'}
                {activeModal === 'settings' && 'Preferences & Settings'}
              </h3>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setIsModalFullscreen(!isModalFullscreen)}
                  className="inline-flex size-7 shrink-0 items-center justify-center rounded-md cursor-pointer text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                  title={isModalFullscreen ? "Exit Modal Fullscreen" : "Modal Fullscreen"}
                  aria-label={isModalFullscreen ? "Exit Modal Fullscreen" : "Modal Fullscreen"}
                >
                  {isModalFullscreen ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveModal(null);
                    setIsModalFullscreen(false);
                  }}
                  className="inline-flex size-7 shrink-0 items-center justify-center rounded-md cursor-pointer text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                  aria-label="Close"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="min-h-0 flex-1 overflow-y-auto p-5 bg-card text-foreground">
              
              {/* PROFILE MODAL */}
              {activeModal === 'profile' && (
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Full Name</label>
                    <input
                      type="text"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      placeholder="Enter full name"
                      className="bg-muted/40 border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary w-full"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Email Address</label>
                    <input
                      type="email"
                      value={profileEmail}
                      onChange={(e) => setProfileEmail(e.target.value)}
                      placeholder="Enter email address"
                      className="bg-muted/40 border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary w-full"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold text-muted-foreground">Avatar Color</label>
                    <div className="flex gap-3 mt-1">
                      {[
                        { class: 'bg-amber-500', name: 'Amber' },
                        { class: 'bg-blue-600', name: 'Blue' },
                        { class: 'bg-emerald-600', name: 'Emerald' },
                        { class: 'bg-indigo-600', name: 'Indigo' },
                        { class: 'bg-rose-600', name: 'Rose' },
                        { class: 'bg-purple-600', name: 'Purple' }
                      ].map((color) => (
                        <button
                          key={color.class}
                          type="button"
                          onClick={() => setProfileAvatarColor(color.class)}
                          className={cn(
                            "size-7 rounded-full cursor-pointer transition-all border-2",
                            color.class,
                            profileAvatarColor === color.class ? "border-foreground scale-110 shadow-lg" : "border-transparent hover:scale-105"
                          )}
                          title={color.name}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}


              {/* BOOKMARKS MODAL */}
              {activeModal === 'bookmarks' && (
                <div className="flex flex-col gap-3">
                  {bookmarks.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground">
                      No bookmarks saved yet. Click bookmark icons inside reports to save them here.
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {bookmarks.map((bookmark) => (
                        <div
                          key={bookmark.id}
                          className="flex items-center justify-between p-2.5 bg-muted/30 border border-border rounded-xl hover:bg-muted/50 transition-colors"
                        >
                          <button
                            type="button"
                            onClick={() => {
                              navigate(bookmark.path);
                              setActiveModal(null);
                            }}
                            className="flex-1 text-left font-medium text-foreground hover:text-primary transition-colors flex items-center gap-2 cursor-pointer"
                          >
                            <ExternalLink className="size-3.5 text-muted-foreground" />
                            {bookmark.name}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const updated = bookmarks.filter(b => b.id !== bookmark.id);
                              setBookmarks(updated);
                              localStorage.setItem('app-bookmarks', JSON.stringify(updated));
                              toast.success('Bookmark removed.');
                            }}
                            className="text-muted-foreground hover:text-destructive cursor-pointer p-1 rounded-md hover:bg-muted transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* DOWNLOADS MODAL */}
              {activeModal === 'downloads' && (
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-semibold text-muted-foreground mb-1 block">Recently Downloaded Reports</span>
                  {[
                    { filename: 'art_monthly_report_2026_q2.xlsx', size: '1.4 MB', date: '2h ago' },
                    { filename: 'dqa_validation_log_jun03.csv', size: '182 KB', date: '1d ago' },
                    { filename: 'indicator_sql_queries.zip', size: '544 KB', date: '3d ago' }
                  ].map((file) => (
                    <div
                      key={file.filename}
                      className="flex items-center justify-between p-2.5 bg-muted/30 border border-border rounded-xl hover:bg-muted/50 transition-all"
                    >
                      <div className="min-w-0 flex-1 mr-2">
                        <div className="font-semibold text-xs text-foreground truncate">{file.filename}</div>
                        <div className="text-[10px] text-muted-foreground flex gap-2 mt-0.5">
                          <span>{file.size}</span>
                          <span>•</span>
                          <span>{file.date}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const element = document.createElement("a");
                          const fileBlob = new Blob(["Mock file content for " + file.filename], {type: 'text/plain'});
                          element.href = URL.createObjectURL(fileBlob);
                          element.download = file.filename;
                          document.body.appendChild(element);
                          element.click();
                          document.body.removeChild(element);
                          toast.success(`Downloading ${file.filename}...`);
                        }}
                        className="flex size-7 items-center justify-center rounded-lg bg-muted text-muted-foreground hover:bg-primary hover:text-primary-foreground cursor-pointer transition-colors shrink-0"
                        title="Re-download"
                      >
                        <Download className="size-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* EXTENSIONS MODAL */}
              {activeModal === 'extensions' && (
                <div className="flex flex-col gap-1">
                  {[
                    { id: 'autoRefresh', label: 'Auto-Refresh Reports', desc: 'Periodically refreshes report data in the background every 5 minutes.', key: 'ext-auto-refresh' },
                    { id: 'queryProfiler', label: 'Query Performance Profiler', desc: 'Displays running time profile next to SQL queries under Indicator view.', key: 'ext-profiler' },
                    { id: 'khmerOverlay', label: 'Khmer Translation Overlay', desc: 'Translates specialized clinical and database terminology to Khmer.', key: 'ext-translation' }
                  ].map((ext) => (
                    <div
                      key={ext.id}
                      className="flex items-start justify-between py-3 border-b border-border last:border-0"
                    >
                      <div className="flex-1 pr-4">
                        <div className="font-semibold text-xs text-foreground">{ext.label}</div>
                        <div className="text-[11px] text-muted-foreground mt-0.5 leading-normal">{ext.desc}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const nextVal = !extensions[ext.id];
                          const updated = { ...extensions, [ext.id]: nextVal };
                          setExtensions(updated);
                          localStorage.setItem(ext.key, String(nextVal));
                          toast.success(`${ext.label} ${nextVal ? 'Enabled' : 'Disabled'}`);
                        }}
                        className={cn(
                          "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none",
                          extensions[ext.id] ? "bg-primary" : "bg-muted-foreground/30"
                        )}
                      >
                        <span
                          className={cn(
                            "pointer-events-none inline-block size-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out",
                            extensions[ext.id] ? "translate-x-4" : "translate-x-0"
                          )}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* PASSWORDS MODAL */}
              {activeModal === 'passwords' && (
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-muted-foreground">Current Password</label>
                    <input
                      type="password"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      placeholder="Enter current password"
                      className="bg-muted/40 border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary w-full"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-muted-foreground">New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="bg-muted/40 border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary w-full"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-muted-foreground">Confirm New Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Verify new password"
                      className="bg-muted/40 border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary w-full"
                    />
                  </div>
                </div>
              )}

              {/* SETTINGS MODAL */}
              {activeModal === 'settings' && (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between py-2 border-b border-border">
                    <div>
                      <div className="font-semibold text-xs text-foreground">Default Interface Language</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">App-wide translation settings.</div>
                    </div>
                    <Select
                      value={appLang}
                      onValueChange={(val) => {
                        setAppLang(val);
                        localStorage.setItem('app-lang', val);
                      }}
                    >
                      <SelectTrigger size="sm" className="w-[140px] bg-muted/40 border-border text-foreground text-xs">
                        <SelectValue placeholder="Select Language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kh">ភាសាខ្មែរ (Khmer)</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between py-2 border-b border-border">
                    <div>
                      <div className="font-semibold text-xs text-foreground">Default Landing Page</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">Where to redirect on login.</div>
                    </div>
                    <Select
                      value={defaultPage}
                      onValueChange={(val) => {
                        setDefaultPage(val);
                        localStorage.setItem('app-default-page', val);
                      }}
                    >
                      <SelectTrigger size="sm" className="w-[140px] bg-muted/40 border-border text-foreground text-xs">
                        <SelectValue placeholder="Select Page" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="/dashboard">Dashboard</SelectItem>
                        <SelectItem value="/reports">ART Reports</SelectItem>
                        <SelectItem value="/patient-360">Patient 360°</SelectItem>
                        <SelectItem value="/visualize">Visualize</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between py-2 border-b border-border">
                    <div>
                      <div className="font-semibold text-xs text-foreground">Navigation Layout Style</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">Toggle horizontal topbar nav or vertical left sidebar nav.</div>
                    </div>
                    <Select
                      value={layoutStyle}
                      onValueChange={(val) => {
                        setLayoutStyle(val);
                        localStorage.setItem('app-layout-style', val);
                        window.dispatchEvent(new Event('app-layout-style-changed'));
                      }}
                    >
                      <SelectTrigger size="sm" className="w-[140px] bg-muted/40 border-border text-foreground text-xs">
                        <SelectValue placeholder="Select Layout" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="navbar">Top Navbar</SelectItem>
                        <SelectItem value="sidebar">Left Sidebar</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between py-2 border-b border-border">
                    <div>
                      <div className="font-semibold text-xs text-foreground">Expand Sidebar on Hover</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">Toggle navigation hover effects.</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const nextHover = !sidebarHover;
                        setSidebarHover(nextHover);
                        localStorage.setItem('app-sidebar-hover', String(nextHover));
                      }}
                      className={cn(
                        "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none",
                        sidebarHover ? "bg-primary" : "bg-muted-foreground/30"
                      )}
                    >
                      <span
                        className={cn(
                          "pointer-events-none inline-block size-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out",
                          sidebarHover ? "translate-x-4" : "translate-x-0"
                        )}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between py-2 border-b border-border">
                    <div>
                      <div className="font-semibold text-xs text-foreground">Use Analytics Data (វិភាគ)</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">Speed up load times by querying pre-aggregated warehouse data.</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const nextVal = !useAnalytics;
                        setUseAnalytics(nextVal);
                        localStorage.setItem('app-use-analytics', String(nextVal));
                        window.dispatchEvent(new Event('app-use-analytics-changed'));
                      }}
                      className={cn(
                        "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none",
                        useAnalytics ? "bg-primary" : "bg-muted-foreground/30"
                      )}
                    >
                      <span
                        className={cn(
                          "pointer-events-none inline-block size-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out",
                          useAnalytics ? "translate-x-4" : "translate-x-0"
                        )}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between py-2">
                    <div>
                      <div className="font-semibold text-xs text-foreground flex items-center gap-1.5">
                        <span>Full Screen Mode</span>
                        <span className="text-[10px] text-primary bg-primary/10 px-1.5 py-0.5 rounded font-normal">ពេញអេក្រង់</span>
                      </div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">Toggle browser full screen mode for maximum viewing area.</div>
                    </div>
                    <button
                      type="button"
                      onClick={toggleFullScreen}
                      className={cn(
                        "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none",
                        isFullscreen ? "bg-primary" : "bg-muted-foreground/30"
                      )}
                    >
                      <span
                        className={cn(
                          "pointer-events-none inline-block size-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out",
                          isFullscreen ? "translate-x-4" : "translate-x-0"
                        )}
                      />
                    </button>
                  </div>
                </div>
              )}

              {/* REPORT CONFIG MODAL */}
              {activeModal === 'reportConfig' && (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between py-2 border-b border-border pb-3">
                    <div>
                      <div className="font-semibold text-xs text-foreground">Max Indicators on Chart</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">Configure the maximum number of indicators that can be displayed on the visualization chart at once.</div>
                    </div>
                    <Select
                      value={String(maxChartSeries)}
                      onValueChange={(val) => {
                        setMaxChartSeries(Number(val));
                      }}
                    >
                      <SelectTrigger size="sm" className="w-[100px] bg-muted/40 border-border text-foreground text-xs">
                        <SelectValue placeholder="Select limit" />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((num) => (
                          <SelectItem key={num} value={String(num)}>
                            {num}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-xs text-foreground">Select Indicators to Show in Table Report</div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">Toggle exactly which indicators display in the main reports table.</div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setEnabledReportIndicators(ALL_REPORT_INDICATORS.map(ind => ind.id))}
                          className="text-[10px] font-bold text-primary hover:underline cursor-pointer"
                        >
                          Select All
                        </button>
                        <span className="text-[10px] text-muted-foreground">|</span>
                        <button
                          type="button"
                          onClick={() => setEnabledReportIndicators([])}
                          className="text-[10px] font-bold text-rose-500 hover:underline cursor-pointer"
                        >
                          Clear
                        </button>
                      </div>
                    </div>
                    
                    <div className="max-h-[220px] overflow-y-auto border border-border bg-muted/10 p-2.5 rounded-xl flex flex-col gap-2.5 no-scrollbar">
                      {ALL_REPORT_INDICATORS.map((indicator) => {
                        const isChecked = enabledReportIndicators.includes(indicator.id);
                        return (
                          <label key={indicator.id} className="flex items-start gap-2.5 text-xs text-foreground/90 cursor-pointer select-none hover:text-foreground transition-colors">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {
                                if (isChecked) {
                                  setEnabledReportIndicators(enabledReportIndicators.filter(id => id !== indicator.id));
                                } else {
                                  setEnabledReportIndicators([...enabledReportIndicators, indicator.id]);
                                }
                              }}
                              className="mt-0.5 rounded border-border bg-card text-primary focus:ring-primary focus:ring-offset-0 cursor-pointer"
                            />
                            <span>{indicator.name}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Modal Footer Actions */}
            <div className="flex shrink-0 items-center justify-end gap-2 border-t border-border/80 bg-muted/20 px-5 py-3">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="min-w-[5.5rem] rounded-md font-bold text-xs h-8 cursor-pointer bg-background hover:bg-muted border border-border/80 text-foreground transition-all duration-150"
              >
                {activeModal === 'bookmarks' || activeModal === 'downloads' || activeModal === 'extensions' ? 'Close' : 'Cancel'}
              </button>

              {activeModal === 'profile' && (
                <button
                  type="button"
                  onClick={() => {
                    updateUser({ fullName: profileName, email: profileEmail, avatarColor: profileAvatarColor });
                    toast.success("Profile saved successfully.");
                    setActiveModal(null);
                  }}
                  className="min-w-[5.5rem] bg-primary text-primary-foreground hover:bg-primary/95 border border-primary rounded-md font-bold text-xs h-8 cursor-pointer transition-all duration-150"
                >
                  Save Changes
                </button>
              )}


              {activeModal === 'passwords' && (
                <button
                  type="button"
                  onClick={() => {
                    if (!oldPassword) {
                      toast.error("Please enter your current password.");
                      return;
                    }
                    if (newPassword.length < 6) {
                      toast.error("New password must be at least 6 characters.");
                      return;
                    }
                    if (newPassword !== confirmPassword) {
                      toast.error("Passwords do not match.");
                      return;
                    }
                    toast.success("Password changed successfully!");
                    setActiveModal(null);
                    setOldPassword('');
                    setNewPassword('');
                    setConfirmPassword('');
                  }}
                  className="min-w-[5.5rem] bg-primary text-primary-foreground hover:bg-primary/95 border border-primary rounded-md font-bold text-xs h-8 cursor-pointer transition-all duration-150"
                >
                  Update Password
                </button>
              )}

              {activeModal === 'settings' && (
                <button
                  type="button"
                  onClick={() => {
                    localStorage.setItem('app-use-analytics', String(useAnalytics));
                    window.dispatchEvent(new Event('app-use-analytics-changed'));
                    toast.success("Settings saved successfully.");
                    setActiveModal(null);
                  }}
                  className="min-w-[5.5rem] bg-primary text-primary-foreground hover:bg-primary/95 border border-primary rounded-md font-bold text-xs h-8 cursor-pointer transition-all duration-150"
                >
                  Save Settings
                </button>
              )}

              {activeModal === 'reportConfig' && (
                <button
                  type="button"
                  onClick={() => {
                    localStorage.setItem('app-max-chart-series', String(maxChartSeries));
                    localStorage.setItem('app-enabled-report-indicators', JSON.stringify(enabledReportIndicators));
                    window.dispatchEvent(new Event('app-max-chart-series-changed'));
                    window.dispatchEvent(new Event('app-enabled-report-indicators-changed'));
                    toast.success("Report configuration saved successfully.");
                    setActiveModal(null);
                  }}
                  className="min-w-[5.5rem] bg-primary text-primary-foreground hover:bg-primary/95 border border-primary rounded-md font-bold text-xs h-8 cursor-pointer transition-all duration-150"
                >
                  Save Config
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
