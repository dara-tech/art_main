import { useState } from 'react';
import {
  RiSidebarFoldLine,
  RiSidebarUnfoldLine,
  RiFilter3Line,
  RiUser3Line,
  RiGroupLine,
  RiCloseLine,
  RiRefreshLine,
  RiCheckLine,
  RiStackLine,
  RiMedicineBottleLine,
  RiShieldCheckLine,
  RiHeartPulseLine
} from '@remixicon/react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const SEX_OPTIONS = [
  { id: 'all', label: 'ទាំងអស់ (All)' },
  { id: 'male', label: 'ប្រុស (Male)' },
  { id: 'female', label: 'ស្រី (Female)' }
];

const AGE_OPTIONS = [
  { id: 'all', label: 'គ្រប់អាយុ (All Ages)' },
  { id: 'child', label: 'កុមារ ≤ ១៤ ឆ្នាំ (Children ≤14)' },
  { id: 'adult', label: '១៥ ឆ្នាំឡើង (Adults ≥15)' }
];

const KP_OPTIONS = [
  { id: 'all', label: 'ទូទៅ (All / General)' },
  { id: 'msm', label: 'MSM (បុរសរួមភេទជាមួយបុរស)' },
  { id: 'tg', label: 'TG (ស្រ្តីប្តូរភេទ)' },
  { id: 'pwid', label: 'PWID (អ្នកប្រើប្រាស់គ្រឿងញៀន)' },
  { id: 'ew', label: 'EW / FSW (បុគ្គលិកកម្សាន្ត)' }
];

const PROGRAM_OPTIONS = [
  { id: 'all', label: 'គ្រប់កម្មវិធី (All Programs)' },
  { id: 'art', label: 'ART (ការព្យាបាល & ថែទាំ)' },
  { id: 'vl', label: 'VL / EAC (បន្ទុកវីរុស)' },
  { id: 'mmd', label: 'MMD / TLD (ថ្នាំរយៈពេលវែង)' },
  { id: 'tpt', label: 'TPT (ការថែទាំរបេង)' },
  { id: 'retention', label: 'Retention (ការបន្តព្យាបាល)' },
  { id: 'infant', label: 'EID / Infant (ទារក)' }
];

export default function VisualizeFilterSidebar({
  isOpen,
  onToggle,
  filters = {},
  onFiltersChange,
  onResetFilters,
  activeFilterCount = 0,
  totalResultsCount = 0
}) {
  const currentSex = filters.sex || 'all';
  const currentAge = filters.ageGroup || 'all';
  const currentKp = filters.kpGroup || 'all';
  const currentProgram = filters.programCategory || 'all';

  const updateFilter = (key, value) => {
    if (onFiltersChange) {
      onFiltersChange({
        ...filters,
        [key]: value
      });
    }
  };

  return (
    <aside
      className={cn(
        'relative border-l border-sidebar-border bg-sidebar text-sidebar-foreground transition-all duration-300 flex flex-col shrink-0 min-h-0 select-none font-khmer z-20',
        isOpen ? 'w-80 min-w-[20rem]' : 'w-10 min-w-[2.5rem]'
      )}
    >
      {/* Sidebar Toggle Bar when Collapsed */}
      {!isOpen ? (
        <div className="flex flex-col items-center py-3 gap-3 h-full bg-sidebar">
          <button
            type="button"
            onClick={onToggle}
            className="flex h-8 w-8 items-center justify-center rounded-none border border-sidebar-border bg-sidebar-accent/30 text-sidebar-foreground/75 hover:bg-primary/10 hover:text-primary hover:border-primary/40 transition-colors cursor-pointer"
            title="បើកផ្ទាំងតម្រង Profile (Expand Filter Sidebar)"
          >
            <RiSidebarUnfoldLine className="size-4" />
          </button>
          <div className="flex-1 flex items-center justify-center">
            <span
              onClick={onToggle}
              className="rotate-90 whitespace-nowrap text-[11px] font-bold text-sidebar-foreground/75 tracking-wider cursor-pointer hover:text-sidebar-foreground uppercase flex items-center gap-1.5"
            >
              <RiFilter3Line className="size-3 text-primary -rotate-90" />
              តម្រង Profile
              {activeFilterCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 bg-primary text-primary-foreground text-[9px] font-bold -rotate-90">
                  {activeFilterCount}
                </span>
              )}
            </span>
          </div>
        </div>
      ) : (
        /* Sidebar Content when Expanded */
        <div className="flex flex-col h-full min-h-0 w-full bg-sidebar">
          {/* Header */}
          <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-sidebar-border bg-sidebar-accent/40 shrink-0">
            <div className="flex items-center gap-2">
              <RiFilter3Line className="size-4 text-primary shrink-0" />
              <span className="text-xs font-bold text-sidebar-foreground">តម្រង Profile & ប្រជាសាស្ត្រ</span>
              {activeFilterCount > 0 && (
                <span className="px-1.5 py-0.5 text-[10px] font-bold bg-primary/10 text-primary border border-primary/30">
                  {activeFilterCount} សកម្ម
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={onToggle}
              className="flex h-7 w-7 items-center justify-center border border-border/60 bg-muted/20 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
              title="បិទផ្ទាំងតម្រង (Collapse Sidebar)"
            >
              <RiSidebarFoldLine className="size-4" />
            </button>
          </div>

          {/* Filter Body - Scrollable */}
          <div className="flex-1 min-h-0 overflow-y-auto p-3.5 space-y-4 no-scrollbar">
            {/* Section 1: Sex Filter */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-foreground/90 uppercase tracking-wider">
                <RiUser3Line className="size-3.5 text-sky-500" />
                <span>ភេទ (Sex Filter)</span>
              </div>
              <div className="grid grid-cols-1 gap-1">
                {SEX_OPTIONS.map((opt) => {
                  const isActive = currentSex === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => updateFilter('sex', opt.id)}
                      className={cn(
                        'flex items-center justify-between px-2.5 py-1.5 text-xs font-medium border text-left transition-all cursor-pointer rounded-none',
                        isActive
                          ? 'border-sky-500 bg-sky-500/10 text-sky-700 dark:text-sky-300 font-bold'
                          : 'border-sidebar-border bg-sidebar text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                      )}
                    >
                      <span>{opt.label}</span>
                      {isActive && <RiCheckLine className="size-3.5 text-sky-500" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Section 2: Age Group Filter */}
            <div className="space-y-1.5 border-t border-border/60 pt-3">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-foreground/90 uppercase tracking-wider">
                <RiStackLine className="size-3.5 text-indigo-500" />
                <span>ក្រុមអាយុ (Age Group)</span>
              </div>
              <div className="grid grid-cols-1 gap-1">
                {AGE_OPTIONS.map((opt) => {
                  const isActive = currentAge === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => updateFilter('ageGroup', opt.id)}
                      className={cn(
                        'flex items-center justify-between px-2.5 py-1.5 text-xs font-medium border text-left transition-all cursor-pointer rounded-none',
                        isActive
                          ? 'border-indigo-500 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 font-bold'
                          : 'border-sidebar-border bg-sidebar text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                      )}
                    >
                      <span>{opt.label}</span>
                      {isActive && <RiCheckLine className="size-3.5 text-indigo-500" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Section 3: Key Population (KP) */}
            <div className="space-y-1.5 border-t border-border/60 pt-3">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-foreground/90 uppercase tracking-wider">
                <RiGroupLine className="size-3.5 text-amber-500" />
                <span>ក្រុមប្រជាជនគន្លឹះ (KP Group)</span>
              </div>
              <div className="grid grid-cols-1 gap-1">
                {KP_OPTIONS.map((opt) => {
                  const isActive = currentKp === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => updateFilter('kpGroup', opt.id)}
                      className={cn(
                        'flex items-center justify-between px-2.5 py-1.5 text-xs font-medium border text-left transition-all cursor-pointer rounded-none',
                        isActive
                          ? 'border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-300 font-bold'
                          : 'border-sidebar-border bg-sidebar text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                      )}
                    >
                      <span className="truncate">{opt.label}</span>
                      {isActive && <RiCheckLine className="size-3.5 text-amber-500 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Section 4: Program Category Filter */}
            <div className="space-y-1.5 border-t border-border/60 pt-3">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-foreground/90 uppercase tracking-wider">
                <RiMedicineBottleLine className="size-3.5 text-emerald-500" />
                <span>ប្រភេទកម្មវិធី (Program Type)</span>
              </div>
              <div className="grid grid-cols-1 gap-1">
                {PROGRAM_OPTIONS.map((opt) => {
                  const isActive = currentProgram === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => updateFilter('programCategory', opt.id)}
                      className={cn(
                        'flex items-center justify-between px-2.5 py-1.5 text-xs font-medium border text-left transition-all cursor-pointer rounded-none',
                        isActive
                          ? 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold'
                          : 'border-sidebar-border bg-sidebar text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                      )}
                    >
                      <span className="truncate">{opt.label}</span>
                      {isActive && <RiCheckLine className="size-3.5 text-emerald-500 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer - Actions */}
          <div className="p-3 border-t border-border/80 bg-muted/15 shrink-0 flex flex-col gap-2">
            {activeFilterCount > 0 ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onResetFilters}
                className="w-full flex items-center justify-center gap-1.5 text-xs font-bold text-rose-600 border-rose-200 bg-rose-50/50 hover:bg-rose-100 hover:text-rose-700 dark:bg-rose-950/20 dark:border-rose-900/50 rounded-none cursor-pointer"
              >
                <RiRefreshLine className="size-3.5" />
                <span>សម្អាតតម្រងទាំងអស់ ({activeFilterCount})</span>
              </Button>
            ) : (
              <div className="text-[11px] text-muted-foreground text-center font-medium">
                គ្មានតម្រងទិន្នន័យត្រូវបានជ្រើសរើសទេ
              </div>
            )}
          </div>
        </div>
      )}
    </aside>
  );
}
