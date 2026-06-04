import { useCallback, useRef, useState, useEffect } from 'react';
import { RiArrowDownSLine, RiArrowUpSLine, RiCheckLine, RiArrowLeftLine } from '@remixicon/react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import {
  P360_TABLE_PAD,
  P360_TABLE_TEXT,
  appNavItemClass,
  p360CardClass,
  p360TabClass
} from '../layout/appNavStyles';
import patient360Api from '../../services/patient360Api';
import { toast } from 'sonner';

export function pageShortTitle(title, index) {
  const parts = String(title || '').split('—');
  return parts.length > 1 ? parts[1].trim() : `ទំព័រ ${index + 1}`;
}

export function EditableYesNoHeader({ questionLabel = 'សំណួរ' }) {
  return (
    <div
      className={cn(
        'grid grid-cols-[auto_1fr_auto] gap-x-3 border-b border-border/80 bg-muted/30 px-3 py-1.5 font-medium text-muted-foreground',
        P360_TABLE_TEXT
      )}
    >
      <span className="w-6 text-center">#</span>
      <span>{questionLabel}</span>
      <span className="flex gap-1.5">
        <span className="min-w-[2.75rem] text-center">បាទ/ចាស</span>
        <span className="min-w-[2.75rem] text-center">ទេ</span>
      </span>
    </div>
  );
}

export function EditableYesNoPill({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex min-w-[2.75rem] items-center justify-center border px-2 py-0.5 transition-colors',
        P360_TABLE_TEXT,
        active
          ? 'border-primary/40 bg-primary/10 font-medium text-foreground shadow-inner'
          : 'border-border/80 bg-muted/15 text-muted-foreground/60 hover:bg-muted/30 hover:text-foreground'
      )}
    >
      {children}
    </button>
  );
}

export function EditableOptionTile({ selected, label, onClick, compact }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full min-w-0 items-start gap-2 border px-2.5 transition-colors text-left focus:outline-none focus:ring-1 focus:ring-primary',
        compact ? 'py-1.5' : 'py-2',
        selected
          ? 'border-primary/40 bg-primary/10 text-foreground'
          : 'border-border/80 bg-muted/15 text-muted-foreground hover:bg-muted/30 hover:text-foreground'
      )}
    >
      <span
        className={cn(
          'mt-0.5 flex size-4 shrink-0 items-center justify-center border text-[10px]',
          selected
            ? 'border-primary bg-primary text-primary-foreground'
            : 'border-border/80 bg-background text-transparent'
        )}
        aria-hidden
      >
        {selected ? <RiCheckLine className="size-2.5" /> : null}
      </span>
      <span className={cn('min-w-0 flex-1 leading-snug', P360_TABLE_TEXT, selected && 'font-medium')}>
        {label}
      </span>
    </button>
  );
}

export function EditableTextItem({ label, value, onChange, placeholder, type = 'text', disabled = false }) {
  return (
    <div className={cn(
      "border border-border/80 px-3 py-2 flex flex-col h-full focus-within:ring-1 focus-within:ring-primary focus-within:border-primary/50 transition-colors",
      disabled ? "bg-muted/30 opacity-75" : "bg-muted/10"
    )}>
      <label className={cn('text-muted-foreground block', P360_TABLE_TEXT)}>{label}</label>
      <input
        type={type}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          'mt-1 block w-full bg-transparent outline-none focus:outline-none',
          P360_TABLE_TEXT,
          disabled ? 'text-muted-foreground cursor-not-allowed' : 'text-foreground placeholder:italic placeholder:text-muted-foreground/50'
        )}
      />
    </div>
  );
}

export function EditableSelectChoiceItem({ label, options, value, onChange, gridClassName }) {
  const dense = options.length > 8;

  return (
    <div className="space-y-2">
      {label ? (
        <h5 className={cn('font-medium text-foreground/90', P360_TABLE_TEXT)}>{label}</h5>
      ) : null}
      <ul className={cn(
        'grid gap-1.5', 
        gridClassName || (dense ? 'grid-cols-2 lg:grid-cols-3' : 'grid-cols-2')
      )}>
        {options.map((opt) => (
          <li key={opt.id ?? opt.label}>
            <EditableOptionTile 
              selected={value === opt.id} 
              label={opt.label} 
              compact={dense} 
              onClick={() => onChange(opt.id)}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

export function EditableYesNoItem({ label, index, flat = false, value, onChange }) {
  return (
    <div
      className={cn(
        'grid grid-cols-[auto_1fr_auto] items-center gap-x-3 px-3 py-2',
        P360_TABLE_TEXT,
        !flat && 'border border-border/80',
        flat && index != null && index % 2 === 0 ? 'bg-muted/15' : 'bg-background'
      )}
    >
      {index != null ? (
        <span className="flex size-6 shrink-0 items-center justify-center bg-muted/60 text-[10px] font-semibold tabular-nums text-muted-foreground">
          {index}
        </span>
      ) : (
        <span className="w-6 shrink-0" />
      )}
      <span className="min-w-0 leading-snug text-foreground">{label}</span>
      <div className="flex shrink-0 items-center gap-1.5">
        <EditableYesNoPill active={value === 1} onClick={() => onChange(1)}>បាទ/ចាស</EditableYesNoPill>
        <EditableYesNoPill active={value === 0} onClick={() => onChange(0)}>ទេ</EditableYesNoPill>
      </div>
    </div>
  );
}

export function FormPageCard({ page, index, expanded, onToggle, pageRef, children }) {
  return (
    <article
      ref={pageRef}
      id={`form-page-${page.id}`}
      className={cn(p360CardClass, 'scroll-mt-16 overflow-hidden shadow-sm')}
    >
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          'flex w-full min-h-8 items-center gap-2 border-b border-border/80 bg-muted/30 text-left font-medium text-foreground/90 hover:bg-muted/45',
          P360_TABLE_PAD,
          P360_TABLE_TEXT
        )}
      >
        <span className="shrink-0 tabular-nums text-muted-foreground">{index + 1}/{page.total}</span>
        <span className="min-w-0 flex-1 truncate">{pageShortTitle(page.title, index)}</span>
        {expanded ? (
          <RiArrowUpSLine className="size-4 shrink-0 text-muted-foreground" aria-hidden />
        ) : (
          <RiArrowDownSLine className="size-4 shrink-0 text-muted-foreground" aria-hidden />
        )}
      </button>

      {expanded ? (
        <div className={cn('space-y-4 py-3', P360_TABLE_PAD, P360_TABLE_TEXT)}>
          {children}
        </div>
      ) : null}
    </article>
  );
}

export default function AdultRegistrationForm({ siteCode, initialData, clinicId, onSaveComplete }) {
  const [formData, setFormData] = useState(initialData || {});
  const [isLoading, setIsLoading] = useState(clinicId && clinicId !== 'new');
  const [provinces, setProvinces] = useState([]);

  useEffect(() => {
    if (siteCode) {
      patient360Api.getProvinces(siteCode)
        .then(provs => setProvinces(provs))
        .catch(err => console.error("Failed to fetch provinces", err));
    }
  }, [siteCode]);

  useEffect(() => {
    if (clinicId && clinicId !== 'new') {
      setIsLoading(true);
      patient360Api.getProfile(siteCode, clinicId, { program: 'adult', tab: 'summary' })
        .then(res => {
          if (res.sections?.adult?.registration) {
            setFormData(prev => ({ ...prev, ...res.sections.adult.registration }));
          }
        })
        .catch(err => {
          toast.error("Failed to load patient data");
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [siteCode, clinicId]);

  const [isSaving, setIsSaving] = useState(false);
  const pageRefs = useRef({});
  const navigate = useNavigate();

  // 4 Pages matching legacy form tabs
  const pages = [
    { id: 'admin', title: 'រូបភាពទី ១ — ព័ត៌មានរដ្ឋបាល' },
    { id: 'clinical', title: 'រូបភាពទី ២ — ព័ត៌មានគ្លីនិក' },
    { id: 'tb', title: 'រូបភាពទី ៣ — ប្រវត្តិជំងឺរបេង' },
    { id: 'history', title: 'រូបភាពទី ៤ — ប្រវត្តិជំងឺ និង អាឡែហ្ស៊ី' }
  ].map((p, i, arr) => ({ ...p, total: arr.length }));

  const [expanded, setExpanded] = useState(() => new Set(pages.map((p) => p.id)));
  const [activePage, setActivePage] = useState(pages[0].id);

  const allExpanded = expanded.size === pages.length;

  const scrollToPage = useCallback((pageId) => {
    setActivePage(pageId);
    setExpanded((prev) => new Set(prev).add(pageId));
    requestAnimationFrame(() => {
      pageRefs.current[pageId]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, []);

  const togglePage = useCallback((pageId) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(pageId)) next.delete(pageId);
      else next.add(pageId);
      return next;
    });
    setActivePage(pageId);
  }, []);

  const toggleAll = useCallback(() => {
    if (allExpanded) setExpanded(new Set());
    else setExpanded(new Set(pages.map((p) => p.id)));
  }, [allExpanded, pages]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      if (clinicId && clinicId !== 'new') {
        await patient360Api.updateAdultRegistration(siteCode, clinicId, formData);
        toast.success('Patient registration updated successfully');
      } else {
        const res = await patient360Api.createAdultRegistration(siteCode, formData);
        toast.success('Patient registration created successfully');
        if (onSaveComplete) onSaveComplete(res.clinicId);
      }
    } catch (e) {
      toast.error(e.response?.data?.message || e.message || 'Failed to save form');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Sticky Navigation Bar matching VCCT styles */}
      <div className={cn(p360CardClass, 'sticky top-0 z-10 overflow-hidden shadow-sm bg-card/95 backdrop-blur-sm')}>
        <div
          className={cn(
            'flex min-h-8 flex-wrap items-center gap-1 border-b border-border/80 bg-muted/15 py-1.5',
            P360_TABLE_PAD
          )}
        >
          <button 
            type="button" 
            onClick={() => navigate(-1)} 
            className="flex items-center justify-center size-8 rounded-full hover:bg-muted/50 transition-colors mr-2 text-muted-foreground hover:text-foreground"
            title="ត្រលប់ក្រោយ"
          >
            <RiArrowLeftLine className="size-5" aria-hidden />
          </button>

          <span className={cn('mr-1 shrink-0 text-muted-foreground', P360_TABLE_TEXT)}>
           
          </span>
          {pages.map((page, index) => (
            <button
              key={page.id}
              type="button"
              onClick={() => scrollToPage(page.id)}
              className={p360TabClass(activePage === page.id)}
              title={page.title}
            >
              {index + 1}. {pageShortTitle(page.title, index)}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={toggleAll}
              className={cn(appNavItemClass(false))}
            >
              {allExpanded ? 'បិទទាំងអស់' : 'បើកទាំងអស់'}
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className={cn(
                'ml-2 px-3 py-1 rounded-md text-xs font-semibold shadow-sm transition-colors',
                isSaving ? 'bg-primary/50 text-primary-foreground/50' : 'bg-primary text-primary-foreground hover:bg-primary/90'
              )}
            >
              {isSaving ? 'កំពុងរក្សាទុក...' : 'រក្សាទុក'}
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-4 pb-12">
        {/* Page 1: Admin */}
        <FormPageCard
          page={pages[0]}
          index={0}
          expanded={expanded.has(pages[0].id)}
          onToggle={() => togglePage(pages[0].id)}
          pageRef={(el) => (pageRefs.current[pages[0].id] = el)}
        >
          <section className="space-y-3">
            <h4 className={cn('border-b border-border/80 pb-1 font-medium text-foreground/90', P360_TABLE_TEXT)}>
              ព័ត៌មានមូលដ្ឋាន
            </h4>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              <EditableTextItem 
                label="លេខកូដអ្នកជំងឺ" 
                value={formData.ClinicID} 
                onChange={(v) => handleChange('ClinicID', v)} 
                placeholder="ឧ. 0101-0001"
                disabled={clinicId && clinicId !== 'new'}
              />
              <EditableTextItem 
                label="ថ្ងៃចុះឈ្មោះ" 
                type="date"
                value={formData.DafirstVisit ? formData.DafirstVisit.slice(0, 10) : ''} 
                onChange={(v) => handleChange('DafirstVisit', v)} 
              />
              <EditableTextItem 
                label="លេខកូដចាស់" 
                value={formData.LClinicID} 
                onChange={(v) => handleChange('LClinicID', v)} 
              />
              <EditableTextItem 
                label="ថ្ងៃខែឆ្នាំកំណើត" 
                type="date"
                value={formData.DaBirth ? formData.DaBirth.slice(0, 10) : ''} 
                onChange={(v) => handleChange('DaBirth', v)} 
              />
              <EditableTextItem 
                label="លេខកូដចាស់ Site" 
                value={formData.SiteNameold} 
                onChange={(v) => handleChange('SiteNameold', v)} 
              />
              <EditableTextItem 
                label="លេខកូដ ART Site" 
                value={formData.SiteName} 
                onChange={(v) => handleChange('SiteName', v)} 
              />
              <EditableTextItem 
                label="សញ្ជាតិ" 
                type="number"
                value={formData.Nationality} 
                onChange={(v) => handleChange('Nationality', v ? Number(v) : null)} 
              />
              <div className="border border-border/80 px-3 py-2 flex flex-col h-full bg-muted/10 focus-within:ring-1 focus-within:ring-primary focus-within:border-primary/50 transition-colors">
                <label className={cn('text-muted-foreground block', P360_TABLE_TEXT)}>ខេត្ត</label>
                <select
                  className={cn(
                    'w-full min-w-0 bg-transparent py-0.5 outline-none font-medium text-foreground',
                    P360_TABLE_TEXT
                  )}
                  value={formData.Province || ''}
                  onChange={(e) => handleChange('Province', e.target.value)}
                >
                  <option value="">ជ្រើសរើសខេត្ត</option>
                  {provinces.map((p, i) => (
                    <option key={i} value={p.province_kh || p.province_en}>
                      {p.province_kh || p.province_en}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <EditableSelectChoiceItem 
                label="ភេទ"
                gridClassName="grid-cols-2"
                options={[
                  {id: 0, label: 'ស្រី'}, 
                  {id: 1, label: 'ប្រុស'}
                ]}
                value={formData.Sex}
                onChange={(v) => handleChange('Sex', v)}
              />

              <EditableSelectChoiceItem 
                label="ការអប់រំ"
                options={[
                  {id: 0, label: 'គ្មាន'}, 
                  {id: 1, label: 'បឋមសិក្សា'},
                  {id: 2, label: 'មធ្យមសិក្សា'},
                  {id: 3, label: 'ឧត្តមសិក្សា'}
                ]}
                value={formData.Education}
                onChange={(v) => handleChange('Education', v)}
              />
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-3 border-t border-border/80 pt-3">
              <div>
                <h5 className={cn('font-medium text-foreground/90 mb-2', P360_TABLE_TEXT)}>អក្ខរកម្ម</h5>
                <div className="grid gap-2">
                  <EditableSelectChoiceItem 
                    gridClassName="grid-cols-2"
                    options={[{id: 1, label: 'ចេះអាន'}, {id: 0, label: 'មិនចេះអាន'}]}
                    value={formData.Rea}
                    onChange={(v) => handleChange('Rea', v)}
                  />
                  <EditableSelectChoiceItem 
                    gridClassName="grid-cols-2"
                    options={[{id: 1, label: 'ចេះសរសេរ'}, {id: 0, label: 'មិនចេះសរសេរ'}]}
                    value={formData.Write}
                    onChange={(v) => handleChange('Write', v)}
                  />
                </div>
              </div>
              <div>
                <EditableSelectChoiceItem 
                  label="ផ្លាស់ជាផ្លូវការមកពី"
                  gridClassName="grid-cols-2"
                  options={[
                    {id: 1, label: 'បាទ/ចាស'}, 
                    {id: 0, label: 'ទេ'}
                  ]}
                  value={formData.OffIn}
                  onChange={(v) => handleChange('OffIn', v)}
                />
              </div>
            </div>
            <div className="mt-4 border-t border-border/80 pt-3">
              <EditableSelectChoiceItem 
                label="បញ្ជូនមកពី"
                options={[
                  {id: 0, label: 'មកដោយខ្លួនឯង'}, 
                  {id: 1, label: 'សហគមន៍'},
                  {id: 2, label: 'VCCT'},
                  {id: 3, label: 'PMTCT'},
                  {id: 4, label: 'កម្មវិធីរបេង'},
                  {id: 5, label: 'ធនាគារឈាម'},
                  {id: 6, label: 'ផ្សេងៗ'}
                ]}
                value={formData.Referred}
                onChange={(v) => handleChange('Referred', v)}
              />
              {formData.Referred === 6 && (
                <div className="mt-2 w-full sm:w-1/2">
                  <EditableTextItem 
                    label="បញ្ជូនមកពីកន្លែងផ្សេងទៀត" 
                    value={formData.Orefferred} 
                    onChange={(v) => handleChange('Orefferred', v)} 
                  />
                </div>
              )}
            </div>

            <div className="mt-4 border-t border-border/80 pt-3">
              <EditableSelectChoiceItem 
                label="ប្រភេទនៃការបោះបង់ ហើយត្រឡប់មកវិញ"
                gridClassName="grid-cols-2 sm:grid-cols-3"
                options={[
                  {id: 0, label: 'ក្នុងគ្លីនិក'}, 
                  {id: 1, label: 'ក្រៅគ្លីនិក'}
                ]}
                value={formData.TypeofReturn}
                onChange={(v) => handleChange('TypeofReturn', v)}
              />
            </div>
          </section>
        </FormPageCard>

        {/* Page 2: Clinical */}
        <FormPageCard
          page={pages[1]}
          index={1}
          expanded={expanded.has(pages[1].id)}
          onToggle={() => togglePage(pages[1].id)}
          pageRef={(el) => (pageRefs.current[pages[1].id] = el)}
        >
          <section className="space-y-3">
            <h4 className={cn('border-b border-border/80 pb-1 font-medium text-foreground/90', P360_TABLE_TEXT)}>
              ស្ថានភាពជំងឺ និង កូដសម្គាល់
            </h4>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              <EditableTextItem 
                label="ថ្ងៃធ្វើតេស្ត HIV" 
                type="date"
                value={formData.DaHIV ? formData.DaHIV.slice(0, 10) : ''} 
                onChange={(v) => handleChange('DaHIV', v)} 
              />
              <EditableTextItem 
                label="លេខកូដ VCCT" 
                value={formData.Vcctcode} 
                onChange={(v) => handleChange('Vcctcode', v)} 
              />
              <EditableTextItem 
                label="លេខកូដអតិថិជន VCCT" 
                value={formData.VcctID} 
                onChange={(v) => handleChange('VcctID', v)} 
              />
              <EditableTextItem 
                label="លេខកូដសម្គាល់កុមារ" 
                value={formData.PclinicID} 
                onChange={(v) => handleChange('PclinicID', v)} 
              />
            </div>
            
            <h4 className={cn('border-b border-border/80 pb-1 font-medium text-foreground/90 mt-6', P360_TABLE_TEXT)}>
              ប្រវត្តិនៃការប្រើប្រាស់ថ្នាំ ARV
            </h4>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              <EditableTextItem 
                label="ថ្ងៃចាប់ផ្តើម ART" 
                type="date"
                value={formData.DaART ? formData.DaART.slice(0, 10) : ''} 
                onChange={(v) => handleChange('DaART', v)} 
              />
              <EditableTextItem 
                label="លេខ ART" 
                value={formData.Artnum} 
                onChange={(v) => handleChange('Artnum', v)} 
              />
            </div>
            <div className="mt-4">
              <EditableSelectChoiceItem 
                label="ប្រវត្តិនៃការប្រើប្រាស់ថ្នាំ ARV ពីមុន"
                gridClassName="grid-cols-2 sm:grid-cols-3"
                options={[
                  {id: 0, label: 'មាន'}, 
                  {id: 1, label: 'គ្មាន'}
                ]}
                value={formData.ARVTreatHis}
                onChange={(v) => handleChange('ARVTreatHis', v)}
              />
            </div>
          </section>
        </FormPageCard>

        {/* Page 3: TB & TPT */}
        <FormPageCard
          page={pages[2]}
          index={2}
          expanded={expanded.has(pages[2].id)}
          onToggle={() => togglePage(pages[2].id)}
          pageRef={(el) => (pageRefs.current[pages[2].id] = el)}
        >
          <section className="space-y-3">
            <h4 className={cn('border-b border-border/80 pb-1 font-medium text-foreground/90', P360_TABLE_TEXT)}>
              ប្រវត្តិនៃជំងឺរបេងកន្លងមក
            </h4>
            
            <EditableSelectChoiceItem 
              options={[
                {id: 0, label: 'មាន'}, 
                {id: 1, label: 'គ្មាន'},
                {id: 2, label: 'មិនដឹង'}
              ]}
              value={formData.TbPast}
              onChange={(v) => handleChange('TbPast', v)}
            />

            {formData.TbPast === 0 && (
              <div className="mt-4 grid gap-4 lg:grid-cols-2 border border-border/80 p-3 bg-muted/5">
                <EditableSelectChoiceItem 
                  label="ប្រភេទនៃជំងឺរបេង"
                  gridClassName="grid-cols-2"
                  options={[
                    {id: 0, label: 'របេងសួត'}, 
                    {id: 1, label: 'របេងក្រៅសួត'}
                  ]}
                  value={formData.TypeTB}
                  onChange={(v) => handleChange('TypeTB', v)}
                />
                
                <EditableSelectChoiceItem 
                  label="លទ្ធផលជំងឺរបេង"
                  gridClassName="grid-cols-2"
                  options={[
                    {id: 0, label: 'វិជ្ជមាន'}, 
                    {id: 1, label: 'អវិជ្ជមាន'}
                  ]}
                  value={formData.ResultTB}
                  onChange={(v) => handleChange('ResultTB', v)}
                />

                <EditableTextItem 
                  label="ថ្ងៃខែឆ្នាំចាប់ផ្តើមឈឺរបេង" 
                  type="date"
                  value={formData.Daonset ? formData.Daonset.slice(0, 10) : ''} 
                  onChange={(v) => handleChange('Daonset', v)} 
                />
                
                <EditableSelectChoiceItem 
                  label="ការព្យាបាលរបេង"
                  options={[
                    {id: 0, label: 'ប្រភេទទី១'}, 
                    {id: 1, label: 'ប្រភេទទី២'},
                    {id: 2, label: 'ប្រភេទទី៣'},
                    {id: 3, label: 'ប្រភេទទី៤'},
                    {id: 4, label: 'មិនដឹង'}
                  ]}
                  value={formData.Tbtreat}
                  onChange={(v) => handleChange('Tbtreat', v)}
                />

                <EditableTextItem 
                  label="ថ្ងៃខែព្យាបាលរបេង" 
                  type="date"
                  value={formData.Datreat ? formData.Datreat.slice(0, 10) : ''} 
                  onChange={(v) => handleChange('Datreat', v)} 
                />

                <EditableSelectChoiceItem 
                  label="លទ្ធផលព្យាបាលរបេង"
                  options={[
                    {id: 0, label: 'កំពុងព្យាបាល'}, 
                    {id: 1, label: 'ជាសះស្បើយ'},
                    {id: 2, label: 'បញ្ជប់'},
                    {id: 3, label: 'បរាជ័យ'},
                    {id: 4, label: 'បោះបង់'},
                    {id: 5, label: 'មិនបានវាយតម្លៃ'}
                  ]}
                  value={formData.ResultTreat}
                  onChange={(v) => handleChange('ResultTreat', v)}
                />

                <EditableTextItem 
                  label="ថ្ងៃខែចេញលទ្ធផល" 
                  type="date"
                  value={formData.DaResultTreat ? formData.DaResultTreat.slice(0, 10) : ''} 
                  onChange={(v) => handleChange('DaResultTreat', v)} 
                />
              </div>
            )}

            <h4 className={cn('border-b border-border/80 pb-1 font-medium text-foreground/90 mt-6', P360_TABLE_TEXT)}>
              ការព្យាបាលបង្ការជំងឺរបេង
            </h4>
            <EditableSelectChoiceItem 
              options={[
                {id: 0, label: 'គ្មាន'}, 
                {id: 1, label: 'បានបញ្ចប់'},
                {id: 2, label: 'កំពុងព្យាបាល'}
              ]}
              value={formData.TPT}
              onChange={(v) => handleChange('TPT', v)}
            />

            {(formData.TPT === 1 || formData.TPT === 2) && (
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 mt-4 border border-border/80 p-3 bg-muted/5">
                <EditableTextItem 
                  label="ឈ្មោះថ្នាំបង្ការរបេង" 
                  value={formData.TPTdrug} 
                  onChange={(v) => handleChange('TPTdrug', v)} 
                />
                <EditableTextItem 
                  label="ថ្ងៃចាប់ផ្តើម TPT" 
                  type="date"
                  value={formData.DaStartTPT ? formData.DaStartTPT.slice(0, 10) : ''} 
                  onChange={(v) => handleChange('DaStartTPT', v)} 
                />
                <EditableTextItem 
                  label="ថ្ងៃបញ្ចប់ TPT" 
                  type="date"
                  value={formData.DaEndTPT ? formData.DaEndTPT.slice(0, 10) : ''} 
                  onChange={(v) => handleChange('DaEndTPT', v)} 
                />
              </div>
            )}
          </section>
        </FormPageCard>

        {/* Page 4: History & Allergies */}
        <FormPageCard
          page={pages[3]}
          index={3}
          expanded={expanded.has(pages[3].id)}
          onToggle={() => togglePage(pages[3].id)}
          pageRef={(el) => (pageRefs.current[pages[3].id] = el)}
        >
          <section className="space-y-3">
            <h4 className={cn('border-b border-border/80 pb-1 font-medium text-foreground/90', P360_TABLE_TEXT)}>
              ប្រវត្តិជំងឺ
            </h4>
            <div className="overflow-hidden border border-border/80 mt-2">
               <EditableYesNoHeader />
               <div className="divide-y divide-border/80">
                 <EditableYesNoItem index={1} label="ជំងឺទឹកនោមផ្អែម" flat value={formData.Diabete === 'Yes' ? 1 : 0} onChange={(v) => handleChange('Diabete', v ? 'Yes' : 'No')} />
                 <EditableYesNoItem index={2} label="ជំងឺលើសឈាម" value={formData.Hyper === 'Yes' ? 1 : 0} onChange={(v) => handleChange('Hyper', v ? 'Yes' : 'No')} />
                 <EditableYesNoItem index={3} label="លើសឬខ្វះជាតិលីពីត/ខ្លាញ់" flat value={formData.Abnormal === 'Yes' ? 1 : 0} onChange={(v) => handleChange('Abnormal', v ? 'Yes' : 'No')} />
                 <EditableYesNoItem index={4} label="ជំងឺខ្សោយតម្រងនោម" value={formData.Renal === 'Yes' ? 1 : 0} onChange={(v) => handleChange('Renal', v ? 'Yes' : 'No')} />
                 <EditableYesNoItem index={5} label="ស្លេកស្លាំង" flat value={formData.Anemia === 'Yes' ? 1 : 0} onChange={(v) => handleChange('Anemia', v ? 'Yes' : 'No')} />
                 <EditableYesNoItem index={6} label="ជំងឺថ្លើម" value={formData.Liver === 'Yes' ? 1 : 0} onChange={(v) => handleChange('Liver', v ? 'Yes' : 'No')} />
                 <EditableYesNoItem index={7} label="រលាកថ្លើមប្រភេទ B ឬ C" flat value={formData.HepBC === 'Yes' ? 1 : 0} onChange={(v) => handleChange('HepBC', v ? 'Yes' : 'No')} />
                 <EditableYesNoItem index={8} label="ប្រវត្តិព្យាបាលជំងឺផ្សេងៗ" value={formData.MedOther === 'Yes' ? 1 : 0} onChange={(v) => handleChange('MedOther', v ? 'Yes' : 'No')} />
               </div>
            </div>

            <h4 className={cn('border-b border-border/80 pb-1 font-medium text-foreground/90 mt-6', P360_TABLE_TEXT)}>
              អាឡែហ្ស៊ី
            </h4>
            <div className="mb-2">
              <EditableSelectChoiceItem 
                options={[
                  {id: 0, label: 'មានអាឡែហ្ស៊ី'}, 
                  {id: 1, label: 'គ្មាន'},
                  {id: 2, label: 'មិនដឹង'}
                ]}
                value={formData.Allergy}
                onChange={(v) => handleChange('Allergy', v)}
              />
            </div>
          </section>
        </FormPageCard>
      </div>
    </div>
  );
}
