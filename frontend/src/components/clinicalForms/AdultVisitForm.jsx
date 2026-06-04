import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { RiArrowLeftLine, RiArrowUpSLine, RiArrowDownSLine } from '@remixicon/react';
import { toast } from 'sonner';
import { EditableTextItem, EditableSelectChoiceItem, EditableYesNoHeader, EditableYesNoItem, FormPageCard, pageShortTitle } from './AdultRegistrationForm';
import DrugPrescriptionTable from './DrugPrescriptionTable';
import patient360Api from '../../services/patient360Api';
import { P360_TABLE_TEXT, p360CardClass, p360TabClass, appNavItemClass, P360_TABLE_PAD } from '../layout/appNavStyles';

export default function AdultVisitForm({ siteCode, clinicId, initialData, vid, onSaveComplete }) {
  const [formData, setFormData] = useState({ ClinicID: clinicId, ...initialData });
  const [isLoading, setIsLoading] = useState(vid && vid !== 'new');
  const [isSaving, setIsSaving] = useState(false);
  const [drugOptions, setDrugOptions] = useState([]);
  const navigate = useNavigate();

  const pages = [
    { id: 'visit-info', title: 'រូបភាពទី ១ — ព័ត៌មានការពិនិត្យ' },
    { id: 'treatment-plan', title: 'រូបភាពទី ២ — ផែនការការព្យាបាល' }
  ].map((p, i, arr) => ({ ...p, total: arr.length }));

  const [expanded, setExpanded] = useState(() => new Set(pages.map((p) => p.id)));
  const [activePage, setActivePage] = useState(pages[0].id);
  const pageRefs = useRef({});

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

  useEffect(() => {
    if (vid && vid !== 'new') {
      setIsLoading(true);
      patient360Api.getProfile(siteCode, clinicId, { program: 'adult', tab: 'timeline' })
        .then(res => {
          const visit = (res.sections?.adult?.visits || []).find(v => String(v.Vid) === String(vid));
          if (visit) {
            const arvDrugs = (res.sections?.adult?.arvDrugs || []).filter(d => String(d.Vid) === String(vid));
            const tbDrugs = (res.sections?.adult?.tbDrugs || []).filter(d => String(d.Vid) === String(vid));
            const oiDrugs = (res.sections?.adult?.oiDrugs || []).filter(d => String(d.Vid) === String(vid));
            setFormData(prev => ({ ...prev, ...visit, arvDrugs, tbDrugs, oiDrugs }));
          }
        })
        .catch(err => toast.error("Failed to load visit data"))
        .finally(() => setIsLoading(false));
    }
  }, [siteCode, clinicId, vid]);

  useEffect(() => {
    if (siteCode) {
      patient360Api.getDrugOptions(siteCode)
        .then(drugs => setDrugOptions(drugs))
        .catch(err => console.error("Failed to fetch drug options", err));
    }
  }, [siteCode]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  const handleSave = async () => {
    try {
      setIsSaving(true);
      if (vid && vid !== 'new') {
        await patient360Api.updateAdultVisit(siteCode, vid, formData);
        toast.success('Patient visit updated successfully');
      } else {
        const res = await patient360Api.createAdultVisit(siteCode, formData);
        toast.success('Patient visit recorded successfully');
        if (onSaveComplete) onSaveComplete(res.vid);
      }
    } catch (e) {
      toast.error(e.response?.data?.message || e.message || 'Failed to save visit form');
    } finally {
      setIsSaving(false);
    }
  };
  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground animate-pulse">កំពុងទាញយកទិន្នន័យ...</div>;
  }
  return (
    <div className="space-y-4">
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
              {allExpanded ? 'បង្រួមទាំងអស់' : 'ពង្រីកទាំងអស់'}
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className={cn(
                'px-4 py-1 rounded text-sm font-semibold shadow-sm transition-colors',
                isSaving ? 'bg-primary/50 text-primary-foreground/50' : 'bg-primary text-primary-foreground hover:bg-primary/90'
              )}
            >
              {isSaving ? 'កំពុងរក្សាទុក...' : 'រក្សាទុក'}
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 pb-12">
        <FormPageCard
          page={pages[0]}
          index={0}
          expanded={expanded.has(pages[0].id)}
          onToggle={() => togglePage(pages[0].id)}
          pageRef={(el) => (pageRefs.current[pages[0].id] = el)}
        >
          <section className="space-y-6">
              
              {/* Patient Information & Demographics */}
              <section>
                <h4 className={cn('border-b border-border/80 pb-2 mb-4 font-semibold text-foreground', P360_TABLE_TEXT)}>
                  ព័ត៌មានអ្នកជំងឺ និងប្រជាសាស្ត្រ
                </h4>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <EditableTextItem label="លេខកូដអ្នកជំងឺ" value={formData.ClinicID} disabled />
                  <EditableTextItem label="លេខ ART" value={formData.ARTnum} onChange={(v) => handleChange('ARTnum', v)} />
                  <EditableTextItem label="ថ្ងៃពិនិត្យ" type="date" value={formData.DatVisit ? formData.DatVisit.slice(0, 10) : ''} onChange={(v) => handleChange('DatVisit', v)} />
                  <EditableSelectChoiceItem 
                    label="ប្រភេទពិនិត្យ"
                    options={[{id: 1, label: 'មុនពេលណាត់'}, {id: 2, label: 'ទាន់ពេល'}, {id: 3, label: 'យឺតពេល'}]}
                    value={formData.TypeVisit}
                    onChange={(v) => handleChange('TypeVisit', v)}
                  />
                  <EditableSelectChoiceItem 
                    label="ស្ថានភាពមានផ្ទៃពោះ"
                    options={[{id: 0, label: 'ទេ'}, {id: 1, label: 'មាន'}]}
                    value={formData.PregStatus}
                    onChange={(v) => handleChange('PregStatus', v)}
                  />
                  <EditableSelectChoiceItem 
                    label="ស្ថានភាពស្ត្រី"
                    options={[{id: 0, label: 'ធម្មតា'}, {id: 1, label: 'បំបៅដោះកូន'}]}
                    value={formData.Womenstatus}
                    onChange={(v) => handleChange('Womenstatus', v)}
                  />
                </div>
              </section>

              {/* Physical Measurements */}
              <section>
                <h4 className={cn('border-b border-border/80 pb-2 mb-4 font-semibold text-foreground', P360_TABLE_TEXT)}>
                  សញ្ញាជីវិត និងរង្វាស់រាងកាយ
                </h4>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <EditableTextItem label="ទម្ងន់ (គក)" type="number" value={formData.Weight} onChange={(v) => handleChange('Weight', v)} />
                  <EditableTextItem label="កម្ពស់ (សម)" type="number" value={formData.Height} onChange={(v) => handleChange('Height', v)} />
                  <EditableTextItem label="កម្តៅ (°C)" type="number" value={formData.Temp} onChange={(v) => handleChange('Temp', v)} />
                  <EditableTextItem label="ចង្វាក់បេះដូង" type="number" value={formData.Pulse} onChange={(v) => handleChange('Pulse', v)} />
                  <EditableTextItem label="សម្ពាធឈាម" value={formData.Blood} onChange={(v) => handleChange('Blood', v)} />
                </div>
              </section>

              {/* Counseling */}
              <section>
                <h4 className={cn('border-b border-border/80 pb-2 mb-4 font-semibold text-foreground', P360_TABLE_TEXT)}>
                  ការផ្តល់ប្រឹក្សា និងផែនការគ្រួសារ
                </h4>
                <div className="grid gap-4 sm:grid-cols-2">
                  <EditableSelectChoiceItem 
                    label="ការការពារការចម្លងរោគ"
                    options={[{id: 'True', label: 'បានផ្តល់'}, {id: 'False', label: 'មិនបានផ្តល់'}]}
                    value={formData.Preven}
                    onChange={(v) => handleChange('Preven', v)}
                  />
                  <EditableSelectChoiceItem 
                    label="ការលេបថ្នាំទៀងទាត់"
                    options={[{id: 'True', label: 'បានផ្តល់'}, {id: 'False', label: 'មិនបានផ្តល់'}]}
                    value={formData.Adherence}
                    onChange={(v) => handleChange('Adherence', v)}
                  />
                  <EditableSelectChoiceItem 
                    label="ផែនការគ្រួសារ"
                    options={[{id: 'True', label: 'បានផ្តល់'}, {id: 'False', label: 'មិនបានផ្តល់'}]}
                    value={formData.Space}
                    onChange={(v) => handleChange('Space', v)}
                  />
                  <EditableSelectChoiceItem 
                    label="ការបង្ការការចម្លងរបេង"
                    options={[{id: 'True', label: 'បានផ្តល់'}, {id: 'False', label: 'មិនបានផ្តល់'}]}
                    value={formData.TBInfect}
                    onChange={(v) => handleChange('TBInfect', v)}
                  />
                  <EditableSelectChoiceItem 
                    label="ការស្វែងរកដៃគូ"
                    options={[{id: 'True', label: 'បានផ្តល់'}, {id: 'False', label: 'មិនបានផ្តល់'}]}
                    value={formData.Partner}
                    onChange={(v) => handleChange('Partner', v)}
                  />
                  <EditableSelectChoiceItem 
                    label="ការប្រើប្រាស់ស្រោមអនាម័យ"
                    options={[{id: 'True', label: 'បានផ្តល់'}, {id: 'False', label: 'មិនបានផ្តល់'}]}
                    value={formData.Condom}
                    onChange={(v) => handleChange('Condom', v)}
                  />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-muted/10 p-3 rounded-md border border-border/50 mt-4">
                  <EditableTextItem label="ស្រោម" value={formData.CMCondom} onChange={(v) => handleChange('CMCondom', v)} />
                  <EditableTextItem label="ថ្នាំ CoC" value={formData.CoC} onChange={(v) => handleChange('CoC', v)} />
                  <EditableTextItem label="ថ្នាំ PoC" value={formData.Poc} onChange={(v) => handleChange('Poc', v)} />
                  <EditableTextItem label="ថ្នាំចាក់" value={formData.CMVaccine} onChange={(v) => handleChange('CMVaccine', v)} />
                </div>
              </section>

              {/* Symptoms */}
              <section>
                <h4 className={cn('border-b border-border/80 pb-2 mb-4 font-semibold text-foreground', P360_TABLE_TEXT)}>
                  ការពិនិត្យរោគសញ្ញា
                </h4>
                <div className="overflow-hidden border border-border/80 rounded-md">
                   <EditableYesNoHeader />
                   <div className="divide-y divide-border/80">
                     <EditableYesNoItem flat index={1} label="ក្អក ឬ ហត់" value={formData.Cough === 'True' ? 1 : 0} onChange={(v) => handleChange('Cough', v === 1 ? 'True' : 'False')} />
                     <EditableYesNoItem flat index={2} label="គ្រុនក្តៅ" value={formData.Fever === 'True' ? 1 : 0} onChange={(v) => handleChange('Fever', v === 1 ? 'True' : 'False')} />
                     <EditableYesNoItem flat index={3} label="ស្រកទម្ងន់" value={formData.LossWeight === 'True' ? 1 : 0} onChange={(v) => handleChange('LossWeight', v === 1 ? 'True' : 'False')} />
                     <EditableYesNoItem flat index={4} label="បែកញើសយប់" value={formData.Sweet === 'True' ? 1 : 0} onChange={(v) => handleChange('Sweet', v === 1 ? 'True' : 'False')} />
                     <EditableYesNoItem flat index={5} label="នោមឈឺ ឬ ញឹកញាប់" value={formData.Urinate === 'True' ? 1 : 0} onChange={(v) => handleChange('Urinate', v === 1 ? 'True' : 'False')} />
                     <EditableYesNoItem flat index={6} label="ធ្លាក់ស ឬ ហូរទឹករំអិល" value={formData.Genital === 'True' ? 1 : 0} onChange={(v) => handleChange('Genital', v === 1 ? 'True' : 'False')} />
                     <EditableYesNoItem flat index={7} label="ដំបៅប្រដាប់បន្តពូជ" value={formData.Chemnah === 'True' ? 1 : 0} onChange={(v) => handleChange('Chemnah', v === 1 ? 'True' : 'False')} />
                   </div>
                </div>
              </section>

              {/* Hospitalization */}
              <section>
                <h4 className={cn('border-b border-border/80 pb-2 mb-4 font-semibold text-foreground', P360_TABLE_TEXT)}>
                  ការសម្រាកពេទ្យ
                </h4>
                <div className="grid gap-3 sm:grid-cols-2">
                  <EditableSelectChoiceItem 
                    label="បានសម្រាកពេទ្យ?"
                    options={[{id: 'True', label: 'បាទ/ចាស'}, {id: 'False', label: 'ទេ'}]}
                    value={formData.Hospital}
                    onChange={(v) => handleChange('Hospital', v)}
                  />
                  {formData.Hospital === 'True' && (
                    <>
                      <EditableTextItem 
                        label="ចំនួនប៉ុន្មានដង?" 
                        value={formData.NumHospital} 
                        onChange={(v) => handleChange('NumHospital', v)} 
                      />
                      <div className="sm:col-span-2">
                        <EditableTextItem 
                          label="មូលហេតុ" 
                          value={formData.ReasonHospital} 
                          onChange={(v) => handleChange('ReasonHospital', v)} 
                        />
                      </div>
                    </>
                  )}
                </div>
              </section>

              {/* Adherence */}
              <section>
                <h4 className={cn('border-b border-border/80 pb-2 mb-4 font-semibold text-foreground', P360_TABLE_TEXT)}>
                  ការប្រើប្រាស់ថ្នាំ ARV
                </h4>
                <div className="grid gap-3 sm:grid-cols-2">
                  <EditableSelectChoiceItem 
                    label="ភ្លេចលេបថ្នាំ ARV"
                    options={[{id: 1, label: 'មាន'}, {id: 0, label: 'គ្មាន'}]}
                    value={formData.MissARV}
                    onChange={(v) => handleChange('MissARV', v)}
                  />
                  {formData.MissARV === 1 && (
                    <EditableTextItem 
                      label="ចំនួនប៉ុន្មានដង?" 
                      value={formData.MissTime} 
                      onChange={(v) => handleChange('MissTime', v)} 
                    />
                  )}
                </div>
              </section>

              {/* Assessment */}
              <section>
                <h4 className={cn('border-b border-border/80 pb-2 mb-4 font-semibold text-foreground', P360_TABLE_TEXT)}>
                  ការវាយតម្លៃ
                </h4>
                <div className="grid gap-4 lg:grid-cols-2">
                  <EditableSelectChoiceItem 
                    label="ស្ថានភាពអ្នកជំងឺ"
                    options={[{id: 0, label: 'ធ្វើការបាន'}, {id: 1, label: 'ដើរបាន'}, {id: 2, label: 'ដេកលើគ្រែ'}]}
                    value={formData.Function}
                    onChange={(v) => handleChange('Function', v)}
                  />
                  <EditableSelectChoiceItem 
                    label="ចំណាត់ថ្នាក់តាមជំងឺ"
                    options={[{id: 1, label: 'ដំណាក់កាលទី១'}, {id: 2, label: 'ដំណាក់កាលទី២'}, {id: 3, label: 'ដំណាក់កាលទី៣'}, {id: 4, label: 'ដំណាក់កាលទី៤'}]}
                    value={formData.WHO}
                    onChange={(v) => handleChange('WHO', v)}
                  />
                  <EditableSelectChoiceItem 
                    label="លក្ខខណ្ឌចាប់ផ្តើម ARV"
                    options={[{id: 1, label: 'CD4 < 350'}, {id: 3, label: 'គូស្នេហ៍'}, {id: 5, label: 'មានផ្ទៃពោះ'}, {id: 6, label: 'របេង'}]}
                    value={formData.Eligible}
                    onChange={(v) => handleChange('Eligible', v)}
                  />
                  <EditableSelectChoiceItem 
                    label="ស្ថានភាពរបេង"
                    options={[{id: 1, label: 'សង្ស័យ'}, {id: 2, label: 'មិនមានរោគសញ្ញា'}, {id: 3, label: 'កំពុងព្យាបាល'}]}
                    value={formData.TB}
                    onChange={(v) => handleChange('TB', v)}
                  />
                  <EditableSelectChoiceItem 
                    label="ប្រភេទរបេង"
                    options={[{id: 0, label: 'សួត'}, {id: 1, label: 'ក្រៅសួត'}]}
                    value={formData.TypeTB}
                    onChange={(v) => handleChange('TypeTB', v)}
                  />
                  <EditableSelectChoiceItem 
                    label="លេខរបេង"
                    options={[{id: 0, label: 'ប្រភេទទី១'}, {id: 1, label: 'ប្រភេទទី២'}]}
                    value={formData.TBtreat}
                    onChange={(v) => handleChange('TBtreat', v)}
                  />
                  <div className="lg:col-span-2 grid sm:grid-cols-2">
                    <EditableTextItem 
                      label="ថ្ងៃចាប់ផ្តើមថ្នាំរបេង" 
                      type="date"
                      value={formData.DaTBtreat ? formData.DaTBtreat.slice(0, 10) : ''} 
                      onChange={(v) => handleChange('DaTBtreat', v)} 
                    />
                  </div>
                </div>
              </section>

          </section>
        </FormPageCard>

        <FormPageCard
          page={pages[1]}
          index={1}
          expanded={expanded.has(pages[1].id)}
          onToggle={() => togglePage(pages[1].id)}
          pageRef={(el) => (pageRefs.current[pages[1].id] = el)}
        >
          <section className="space-y-6">
              
              {/* Assessment Plan */}
              <section>
                <h4 className={cn('border-b border-border/80 pb-2 mb-4 font-semibold text-foreground', P360_TABLE_TEXT)}>
                  ផែនការការព្យាបាល
                </h4>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <EditableSelectChoiceItem 
                    label="របបថ្នាំ ARV"
                    options={[{id: 0, label: 'ខ្សែទី១'}, {id: 1, label: 'ខ្សែទី២'}, {id: 2, label: 'ខ្សែទី៣'}]}
                    value={formData.ARVreg}
                    onChange={(v) => handleChange('ARVreg', v)}
                  />
                  <EditableSelectChoiceItem 
                    label="លទ្ធផល TPT"
                    options={[{id: 0, label: 'បញ្ចប់'}, {id: 1, label: 'បោះបង់'}, {id: 2, label: 'របេង'}, {id: 3, label: 'ឈប់ដោយផលរំខាន'}]}
                    value={formData.TPTout}
                    onChange={(v) => handleChange('TPTout', v)}
                  />
                  <EditableSelectChoiceItem 
                    label="លទ្ធផលរបេង"
                    options={[{id: 0, label: 'ជាសះស្បើយ'}, {id: 1, label: 'ឈប់'}, {id: 2, label: 'បរាជ័យ'}, {id: 3, label: 'បោះបង់'}, {id: 4, label: 'មិនវាយតម្លៃ'}]}
                    value={formData.TBout}
                    onChange={(v) => handleChange('TBout', v)}
                  />
                  <EditableSelectChoiceItem 
                    label="តេស្តបញ្ជាក់ HIV មុន ART"
                    options={[{id: 'True', label: 'បាទ/ចាស'}, {id: 'False', label: 'ទេ'}]}
                    value={formData.TestHIV}
                    onChange={(v) => handleChange('TestHIV', v)}
                  />
                  <EditableSelectChoiceItem 
                    label="លទ្ធផលតេស្តបញ្ជាក់"
                    options={[{id: 0, label: 'វិជ្ជមាន'}, {id: 1, label: 'អវិជ្ជមាន'}]}
                    value={formData.ResultHIV}
                    onChange={(v) => handleChange('ResultHIV', v)}
                  />
                  <EditableSelectChoiceItem 
                    label="វេជ្ជបញ្ជា CD4"
                    options={[{id: 0, label: 'បាទ/ចាស'}, {id: 1, label: 'ទេ'}]}
                    value={formData.ReCD4}
                    onChange={(v) => handleChange('ReCD4', v)}
                  />
                  <EditableSelectChoiceItem 
                    label="វេជ្ជបញ្ជា Viral Load"
                    options={[{id: 0, label: 'បាទ/ចាស'}, {id: 1, label: 'ទេ'}]}
                    value={formData.ReVL}
                    onChange={(v) => handleChange('ReVL', v)}
                  />
                  <EditableSelectChoiceItem 
                    label="វេជ្ជបញ្ជា HCV"
                    options={[{id: 0, label: 'បាទ/ចាស'}, {id: 1, label: 'ទេ'}]}
                    value={formData.ReHCV}
                    onChange={(v) => handleChange('ReHCV', v)}
                  />
                  <EditableSelectChoiceItem 
                    label="តេស្ត CrAG"
                    options={[{id: 'True', label: 'បាទ/ចាស'}, {id: 'False', label: 'ទេ'}]}
                    value={formData.CrAG}
                    onChange={(v) => handleChange('CrAG', v)}
                  />
                  <EditableSelectChoiceItem 
                    label="លទ្ធផល CrAG"
                    options={[{id: 0, label: 'វិជ្ជមាន'}, {id: 1, label: 'អវិជ្ជមាន'}]}
                    value={formData.CrAGResult}
                    onChange={(v) => handleChange('CrAGResult', v)}
                  />
                  <EditableSelectChoiceItem 
                    label="VL Detectable"
                    options={[{id: 0, label: 'ទេ'}, {id: 1, label: 'លើកទី១'}, {id: 2, label: 'លើកទី២'}, {id: 3, label: 'លើកទី៣'}]}
                    value={formData.VLDetectable}
                    onChange={(v) => handleChange('VLDetectable', v)}
                  />
                </div>

                <div className="mt-6 border border-border/80 rounded-md overflow-hidden bg-background">
                  <div className={cn("bg-muted/30 py-2 px-3 border-b border-border/80 font-medium text-foreground", P360_TABLE_TEXT)}>
                    ផលរំខាននៃថ្នាំ
                  </div>
                  <EditableYesNoHeader />
                  <div className="divide-y divide-border/80">
                    <EditableYesNoItem flat index={1} label="ស្លេកស្លាំងខ្លាំង" value={formData.Moderate === 'True' ? 1 : 0} onChange={(v) => handleChange('Moderate', v === 1 ? 'True' : 'False')} />
                    <EditableYesNoItem flat index={2} label="ខ្សោយតម្រងនោម" value={formData.Renal === 'True' ? 1 : 0} onChange={(v) => handleChange('Renal', v === 1 ? 'True' : 'False')} />
                    <EditableYesNoItem flat index={3} label="រមាស់" value={formData.Rash === 'True' ? 1 : 0} onChange={(v) => handleChange('Rash', v === 1 ? 'True' : 'False')} />
                    <EditableYesNoItem flat index={4} label="រលាកថ្លើម" value={formData.Hepatitis === 'True' ? 1 : 0} onChange={(v) => handleChange('Hepatitis', v === 1 ? 'True' : 'False')} />
                    <EditableYesNoItem flat index={5} label="ស្ពឹកចុងដៃជើង" value={formData.Peripheral === 'True' ? 1 : 0} onChange={(v) => handleChange('Peripheral', v === 1 ? 'True' : 'False')} />
                    <EditableYesNoItem flat index={6} label="ខ្វះគ្រាប់ឈាមស" value={formData.Neutropenia === 'True' ? 1 : 0} onChange={(v) => handleChange('Neutropenia', v === 1 ? 'True' : 'False')} />
                    <EditableYesNoItem flat index={7} label="ឡើងជាតិខ្លាញ់" value={formData.Hyperlipidemia === 'True' ? 1 : 0} onChange={(v) => handleChange('Hyperlipidemia', v === 1 ? 'True' : 'False')} />
                    <EditableYesNoItem flat index={8} label="Lactic acidosis" value={formData.Lactic === 'True' ? 1 : 0} onChange={(v) => handleChange('Lactic', v === 1 ? 'True' : 'False')} />
                    <EditableYesNoItem flat index={9} label="លឿងស្បែក" value={formData.Jaundice === 'True' ? 1 : 0} onChange={(v) => handleChange('Jaundice', v === 1 ? 'True' : 'False')} />
                  </div>
                </div>
              </section>


              {/* Prescriptions */}
              <section>
                <h4 className={cn('border-b border-border/80 pb-2 mb-4 font-semibold text-foreground', P360_TABLE_TEXT)}>
                  វេជ្ជបញ្ជា
                </h4>
                <div className="space-y-6">
                  <DrugPrescriptionTable 
                    title="ថ្នាំ ARV"
                    drugs={formData.arvDrugs || []}
                    onChange={(drugs) => handleChange('arvDrugs', drugs)}
                    drugOptions={drugOptions}
                  />
                  
                  <DrugPrescriptionTable 
                    title="ថ្នាំរបេង"
                    drugs={formData.tbDrugs || []}
                    onChange={(drugs) => handleChange('tbDrugs', drugs)}
                    drugOptions={drugOptions}
                  />

                  <DrugPrescriptionTable 
                    title="ថ្នាំ OI ផ្សេងៗ"
                    drugs={formData.oiDrugs || []}
                    onChange={(drugs) => handleChange('oiDrugs', drugs)}
                    drugOptions={drugOptions}
                  />
                </div>
              </section>

              {/* Patient Status */}
              <section>
                <h4 className={cn('border-b border-border/80 pb-2 mb-4 font-semibold text-foreground', P360_TABLE_TEXT)}>
                  ស្ថានភាពអ្នកជំងឺ
                </h4>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <EditableSelectChoiceItem 
                    label="ស្ថានភាព"
                    options={[
                      {id: 1, label: 'ស្លាប់'},
                      {id: 2, label: 'បាត់បង់ការតាមដាន'},
                      {id: 3, label: 'បញ្ជូនចេញ'},
                      {id: 4, label: 'ឈប់ព្យាបាល'},
                      {id: 5, label: 'ផ្សេងៗ'}
                    ]}
                    value={formData.PatientStatus}
                    onChange={(v) => handleChange('PatientStatus', v)}
                  />
                  
                  {formData.PatientStatus === 1 && (
                    <>
                      <EditableSelectChoiceItem 
                        label="ទីកន្លែងស្លាប់"
                        options={[
                          {id: 1, label: 'មន្ទីរពេទ្យ'},
                          {id: 2, label: 'ផ្ទះ'},
                          {id: 3, label: 'ផ្សេងៗ'}
                        ]}
                        value={formData.PlaceDead}
                        onChange={(v) => handleChange('PlaceDead', v)}
                      />
                      <EditableSelectChoiceItem 
                        label="ប្រភេទមូលហេតុ"
                        options={[
                          {id: 1, label: 'ទាក់ទងនឹងមេរោគអេដស៍'},
                          {id: 2, label: 'មិនទាក់ទងនឹងមេរោគអេដស៍'},
                          {id: 3, label: 'មិនដឹង'}
                        ]}
                        value={formData.CauseDeathType}
                        onChange={(v) => handleChange('CauseDeathType', v)}
                      />
                      <EditableTextItem 
                        label="មូលហេតុស្លាប់"
                        value={formData.CauseDeath}
                        onChange={(v) => handleChange('CauseDeath', v)}
                      />
                    </>
                  )}

                  {formData.PatientStatus === 3 && (
                    <EditableTextItem 
                      label="បញ្ជូនទៅ"
                      value={formData.TransferOut}
                      onChange={(v) => handleChange('TransferOut', v)}
                    />
                  )}
                  
                  {formData.PatientStatus && formData.PatientStatus !== -1 && (
                    <EditableTextItem 
                      label="កាលបរិច្ឆេទ" 
                      type="date"
                      value={formData.OutcomeDate ? formData.OutcomeDate.slice(0, 10) : ''} 
                      onChange={(v) => handleChange('OutcomeDate', v)} 
                    />
                  )}
                </div>
              </section>

              {/* Next Appointment */}
              <section>
                <h4 className={cn('border-b border-border/80 pb-2 mb-4 font-semibold text-foreground', P360_TABLE_TEXT)}>
                  ការណាត់ជួបលើកក្រោយ
                </h4>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <EditableTextItem 
                    label="ថ្ងៃត្រូវមកលើកក្រោយ" 
                    type="date"
                    value={formData.DaApp ? formData.DaApp.slice(0, 10) : ''} 
                    onChange={(v) => handleChange('DaApp', v)} 
                  />
                </div>
              </section>

          </section>
        </FormPageCard>
      </div>
    </div>
  );
}
