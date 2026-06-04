const fs = require('fs');

const code = `import { useCallback, useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { RiArrowLeftLine } from '@remixicon/react';
import { toast } from 'sonner';
import { EditableTextItem, EditableSelectChoiceItem, EditableYesNoHeader, EditableYesNoItem } from './AdultRegistrationForm';
import { DrugPrescriptionTable } from './DrugPrescriptionTable';
import patient360Api from '../../services/patient360Api';
import { P360_TABLE_TEXT } from '../layout/appNavStyles';

export default function AdultVisitForm({ siteCode, clinicId, initialData, vid, onSaveComplete }) {
  const [formData, setFormData] = useState({ ClinicID: clinicId, ...initialData });
  const [isLoading, setIsLoading] = useState(vid && vid !== 'new');
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('visit-info');
  const navigate = useNavigate();

  useEffect(() => {
    if (vid && vid !== 'new') {
      setIsLoading(true);
      patient360Api.getProfile(siteCode, clinicId, { program: 'adult', tab: 'summary' })
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
    return <div className="p-8 text-center text-muted-foreground animate-pulse">កំពុងទាញយកទិន្នន័យ... (Loading...)</div>;
  }

  return (
    <div className="space-y-4 max-w-[1200px] mx-auto pb-12">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border/80 bg-background/95 backdrop-blur py-3 px-4 shadow-sm">
        <div className="flex items-center gap-3">
          <button 
            type="button" 
            onClick={() => window.history.back()}
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-muted/60 transition-colors"
          >
            <RiArrowLeftLine className="size-5" />
          </button>
          <h2 className="text-lg font-semibold text-foreground tracking-tight">
            Adult Visit Form (ទម្រង់តាមដានអ្នកជំងឺ)
          </h2>
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className={cn(
            'px-4 py-1.5 rounded-md text-sm font-semibold shadow-sm transition-colors',
            isSaving ? 'bg-primary/50 text-primary-foreground/50' : 'bg-primary text-primary-foreground hover:bg-primary/90'
          )}
        >
          {isSaving ? 'កំពុងរក្សាទុក...' : 'រក្សាទុក (Save)'}
        </button>
      </div>

      {/* Custom Tabs Navigation */}
      <div className="px-4">
        <div className="flex border-b border-border/80 bg-muted/20">
          <button 
            type="button"
            className={cn(
              "px-6 py-3 font-medium text-sm transition-all relative outline-none",
              activeTab === 'visit-info' 
                ? "text-primary border-b-2 border-primary bg-background" 
                : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
            )}
            onClick={() => setActiveTab('visit-info')}
          >
            ព័ត៌មានការពិនិត្យ (Visit Information)
          </button>
          <button 
            type="button"
            className={cn(
              "px-6 py-3 font-medium text-sm transition-all relative outline-none",
              activeTab === 'treatment-plan' 
                ? "text-primary border-b-2 border-primary bg-background" 
                : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
            )}
            onClick={() => setActiveTab('treatment-plan')}
          >
            ផែនការការព្យាបាល (Treatment Plan)
          </button>
        </div>
      </div>

      {/* Tab Content Container */}
      <div className="px-4">
        <div className="bg-card border border-border/80 rounded-lg p-5 sm:p-6 shadow-sm">
          
          {/* TAB 1: VISIT INFORMATION */}
          {activeTab === 'visit-info' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
              
              {/* Patient Information & Demographics */}
              <section>
                <h4 className={cn('border-b border-border/80 pb-2 mb-4 font-semibold text-foreground', P360_TABLE_TEXT)}>
                  ព័ត៌មានអ្នកជំងឺ និងប្រជាសាស្ត្រ (Patient Info & Demographics)
                </h4>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <EditableTextItem label="លេខកូដអ្នកជំងឺ (Clinic ID)" value={formData.ClinicID} disabled />
                  <EditableTextItem label="លេខ ART (ART Number)" value={formData.ARTnum} onChange={(v) => handleChange('ARTnum', v)} />
                  <EditableTextItem label="ថ្ងៃពិនិត្យ (Visit Date)" type="date" value={formData.DatVisit ? formData.DatVisit.slice(0, 10) : ''} onChange={(v) => handleChange('DatVisit', v)} />
                  <EditableSelectChoiceItem 
                    label="ប្រភេទពិនិត្យ (Visit Type)"
                    options={[{id: 1, label: 'មុនពេលណាត់'}, {id: 2, label: 'ទាន់ពេល'}, {id: 3, label: 'យឺតពេល'}]}
                    value={formData.TypeVisit}
                    onChange={(v) => handleChange('TypeVisit', v)}
                  />
                  <EditableSelectChoiceItem 
                    label="ស្ថានភាពមានផ្ទៃពោះ (Pregnancy Status)"
                    options={[{id: 0, label: 'ទេ (No)'}, {id: 1, label: 'មាន (Yes)'}]}
                    value={formData.PregStatus}
                    onChange={(v) => handleChange('PregStatus', v)}
                  />
                  <EditableSelectChoiceItem 
                    label="ស្ថានភាពស្ត្រី (Women Status)"
                    options={[{id: 0, label: 'ធម្មតា (Normal)'}, {id: 1, label: 'បំបៅដោះកូន (Lactating)'}]}
                    value={formData.Womenstatus}
                    onChange={(v) => handleChange('Womenstatus', v)}
                  />
                </div>
              </section>

              {/* Physical Measurements */}
              <section>
                <h4 className={cn('border-b border-border/80 pb-2 mb-4 font-semibold text-foreground', P360_TABLE_TEXT)}>
                  សញ្ញាជីវិត និងរង្វាស់រាងកាយ (Physical Measurements)
                </h4>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <EditableTextItem label="ទម្ងន់ (Weight - kg)" type="number" value={formData.Weight} onChange={(v) => handleChange('Weight', v)} />
                  <EditableTextItem label="កម្ពស់ (Height - cm)" type="number" value={formData.Height} onChange={(v) => handleChange('Height', v)} />
                  <EditableTextItem label="កម្តៅ (Temperature - °C)" type="number" value={formData.Temp} onChange={(v) => handleChange('Temp', v)} />
                  <EditableTextItem label="ចង្វាក់បេះដូង (Pulse - bpm)" type="number" value={formData.Pulse} onChange={(v) => handleChange('Pulse', v)} />
                  <EditableTextItem label="សម្ពាធឈាម (Blood Pressure)" value={formData.Blood} onChange={(v) => handleChange('Blood', v)} />
                </div>
              </section>

              {/* Counseling */}
              <section>
                <h4 className={cn('border-b border-border/80 pb-2 mb-4 font-semibold text-foreground', P360_TABLE_TEXT)}>
                  ការផ្តល់ប្រឹក្សា និងផែនការគ្រួសារ (Counseling & Family Planning)
                </h4>
                <div className="grid gap-4 sm:grid-cols-2">
                  <EditableSelectChoiceItem 
                    label="ការការពារការចម្លងរោគ (Prevention)"
                    options={[{id: 'True', label: 'បានផ្តល់ (Provided)'}, {id: 'False', label: 'មិនបានផ្តល់ (Not provided)'}]}
                    value={formData.Preven}
                    onChange={(v) => handleChange('Preven', v)}
                  />
                  <EditableSelectChoiceItem 
                    label="ការលេបថ្នាំទៀងទាត់ (Adherence)"
                    options={[{id: 'True', label: 'បានផ្តល់ (Provided)'}, {id: 'False', label: 'មិនបានផ្តល់ (Not provided)'}]}
                    value={formData.Adherence}
                    onChange={(v) => handleChange('Adherence', v)}
                  />
                  <EditableSelectChoiceItem 
                    label="ផែនការគ្រួសារ (Spacing)"
                    options={[{id: 'True', label: 'បានផ្តល់ (Provided)'}, {id: 'False', label: 'មិនបានផ្តល់ (Not provided)'}]}
                    value={formData.Space}
                    onChange={(v) => handleChange('Space', v)}
                  />
                  <EditableSelectChoiceItem 
                    label="ការបង្ការការចម្លងរបេង (TB Infection Prevention)"
                    options={[{id: 'True', label: 'បានផ្តល់ (Provided)'}, {id: 'False', label: 'មិនបានផ្តល់ (Not provided)'}]}
                    value={formData.TBInfect}
                    onChange={(v) => handleChange('TBInfect', v)}
                  />
                  <EditableSelectChoiceItem 
                    label="ការស្វែងរកដៃគូ (Partner Testing)"
                    options={[{id: 'True', label: 'បានផ្តល់ (Provided)'}, {id: 'False', label: 'មិនបានផ្តល់ (Not provided)'}]}
                    value={formData.Partner}
                    onChange={(v) => handleChange('Partner', v)}
                  />
                  <EditableSelectChoiceItem 
                    label="ការប្រើប្រាស់ស្រោមអនាម័យ (Condom Use)"
                    options={[{id: 'True', label: 'បានផ្តល់ (Provided)'}, {id: 'False', label: 'មិនបានផ្តល់ (Not provided)'}]}
                    value={formData.Condom}
                    onChange={(v) => handleChange('Condom', v)}
                  />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-muted/10 p-3 rounded-md border border-border/50 mt-4">
                  <EditableTextItem label="ស្រោម (Condoms)" value={formData.CMCondom} onChange={(v) => handleChange('CMCondom', v)} />
                  <EditableTextItem label="ថ្នាំ CoC" value={formData.CoC} onChange={(v) => handleChange('CoC', v)} />
                  <EditableTextItem label="ថ្នាំ PoC" value={formData.Poc} onChange={(v) => handleChange('Poc', v)} />
                  <EditableTextItem label="ថ្នាំចាក់ (Injection)" value={formData.CMVaccine} onChange={(v) => handleChange('CMVaccine', v)} />
                </div>
              </section>

              {/* Symptoms */}
              <section>
                <h4 className={cn('border-b border-border/80 pb-2 mb-4 font-semibold text-foreground', P360_TABLE_TEXT)}>
                  ការពិនិត្យរោគសញ្ញា (Symptoms)
                </h4>
                <div className="overflow-hidden border border-border/80 rounded-md">
                   <EditableYesNoHeader />
                   <div className="divide-y divide-border/80">
                     <EditableYesNoItem index={1} label="ក្អក ឬ ហត់ (Cough or shortness of breath)" value={formData.Cough === 'True' ? 1 : 0} onChange={(v) => handleChange('Cough', v === 1 ? 'True' : 'False')} />
                     <EditableYesNoItem index={2} label="គ្រុនក្តៅ (Fever)" flat value={formData.Fever === 'True' ? 1 : 0} onChange={(v) => handleChange('Fever', v === 1 ? 'True' : 'False')} />
                     <EditableYesNoItem index={3} label="ស្រកទម្ងន់ (Weight loss)" value={formData.LossWeight === 'True' ? 1 : 0} onChange={(v) => handleChange('LossWeight', v === 1 ? 'True' : 'False')} />
                     <EditableYesNoItem index={4} label="បែកញើសយប់ (Night sweats)" flat value={formData.Sweet === 'True' ? 1 : 0} onChange={(v) => handleChange('Sweet', v === 1 ? 'True' : 'False')} />
                     <EditableYesNoItem index={5} label="នោមឈឺ ឬ ញឹកញាប់ (Painful or frequent urination)" value={formData.Urinate === 'True' ? 1 : 0} onChange={(v) => handleChange('Urinate', v === 1 ? 'True' : 'False')} />
                     <EditableYesNoItem index={6} label="ធ្លាក់ស ឬ ហូរទឹករំអិល (Vaginal discharge)" flat value={formData.Genital === 'True' ? 1 : 0} onChange={(v) => handleChange('Genital', v === 1 ? 'True' : 'False')} />
                     <EditableYesNoItem index={7} label="ដំបៅប្រដាប់បន្តពូជ (Genital ulcers)" value={formData.Chemnah === 'True' ? 1 : 0} onChange={(v) => handleChange('Chemnah', v === 1 ? 'True' : 'False')} />
                   </div>
                </div>
              </section>

              {/* Hospitalization */}
              <section>
                <h4 className={cn('border-b border-border/80 pb-2 mb-4 font-semibold text-foreground', P360_TABLE_TEXT)}>
                  ការសម្រាកពេទ្យ (Hospitalization)
                </h4>
                <div className="grid gap-3 sm:grid-cols-2">
                  <EditableSelectChoiceItem 
                    label="បានសម្រាកពេទ្យ? (Hospitalized?)"
                    options={[{id: 'True', label: 'បាទ/ចាស (Yes)'}, {id: 'False', label: 'ទេ (No)'}]}
                    value={formData.Hospital}
                    onChange={(v) => handleChange('Hospital', v)}
                  />
                  {formData.Hospital === 'True' && (
                    <>
                      <EditableTextItem 
                        label="ចំនួនប៉ុន្មានដង? (How many times?)" 
                        value={formData.NumHospital} 
                        onChange={(v) => handleChange('NumHospital', v)} 
                      />
                      <div className="sm:col-span-2">
                        <EditableTextItem 
                          label="មូលហេតុ (Reason)" 
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
                  ការប្រើប្រាស់ថ្នាំ ARV (ARV Adherence)
                </h4>
                <div className="grid gap-3 sm:grid-cols-2">
                  <EditableSelectChoiceItem 
                    label="ភ្លេចលេបថ្នាំ ARV (Missed ARV Doses)"
                    options={[{id: 1, label: 'មាន (Yes)'}, {id: 0, label: 'គ្មាន (No)'}]}
                    value={formData.MissARV}
                    onChange={(v) => handleChange('MissARV', v)}
                  />
                  {formData.MissARV === 1 && (
                    <EditableTextItem 
                      label="ចំនួនប៉ុន្មានដង? (How many times?)" 
                      value={formData.MissTime} 
                      onChange={(v) => handleChange('MissTime', v)} 
                    />
                  )}
                </div>
              </section>

              {/* Assessment */}
              <section>
                <h4 className={cn('border-b border-border/80 pb-2 mb-4 font-semibold text-foreground', P360_TABLE_TEXT)}>
                  ការវាយតម្លៃ (Assessment)
                </h4>
                <div className="grid gap-4 lg:grid-cols-2">
                  <EditableSelectChoiceItem 
                    label="ស្ថានភាពអ្នកជំងឺ (Function)"
                    options={[{id: 0, label: 'ធ្វើការបាន (Work)'}, {id: 1, label: 'ដើរបាន (Ambulatory)'}, {id: 2, label: 'ដេកលើគ្រែ (Bed bound)'}]}
                    value={formData.Function}
                    onChange={(v) => handleChange('Function', v)}
                  />
                  <EditableSelectChoiceItem 
                    label="ចំណាត់ថ្នាក់តាមជំងឺ (WHO Stage)"
                    options={[{id: 1, label: 'ដំណាក់កាលទី១'}, {id: 2, label: 'ដំណាក់កាលទី២'}, {id: 3, label: 'ដំណាក់កាលទី៣'}, {id: 4, label: 'ដំណាក់កាលទី៤'}]}
                    value={formData.WHO}
                    onChange={(v) => handleChange('WHO', v)}
                  />
                  <EditableSelectChoiceItem 
                    label="លក្ខខណ្ឌចាប់ផ្តើម ARV (Eligible for ARV)"
                    options={[{id: 1, label: 'CD4 < 350'}, {id: 3, label: 'គូស្នេហ៍ (Serodiscordant)'}, {id: 5, label: 'មានផ្ទៃពោះ (Pregnant)'}, {id: 6, label: 'របេង (TB Co-infection)'}]}
                    value={formData.Eligible}
                    onChange={(v) => handleChange('Eligible', v)}
                  />
                  <EditableSelectChoiceItem 
                    label="ស្ថានភាពរបេង (TB Status)"
                    options={[{id: 1, label: 'សង្ស័យ (Suspect)'}, {id: 2, label: 'មិនមានរោគសញ្ញា (No Symptoms)'}, {id: 3, label: 'កំពុងព្យាបាល (On Treatment)'}]}
                    value={formData.TB}
                    onChange={(v) => handleChange('TB', v)}
                  />
                  <EditableSelectChoiceItem 
                    label="ប្រភេទរបេង (Type of TB)"
                    options={[{id: 0, label: 'សួត (Pulmonary)'}, {id: 1, label: 'ក្រៅសួត (Extrapulmonary)'}]}
                    value={formData.TypeTB}
                    onChange={(v) => handleChange('TypeTB', v)}
                  />
                  <EditableSelectChoiceItem 
                    label="លេខរបេង (TB Number)"
                    options={[{id: 0, label: 'ប្រភេទទី១ (Category 1)'}, {id: 1, label: 'ប្រភេទទី២ (Category 2)'}]}
                    value={formData.TBtreat}
                    onChange={(v) => handleChange('TBtreat', v)}
                  />
                  <div className="lg:col-span-2 grid sm:grid-cols-2">
                    <EditableTextItem 
                      label="ថ្ងៃចាប់ផ្តើមថ្នាំរបេង (TB Treatment Start)" 
                      type="date"
                      value={formData.DaTBtreat ? formData.DaTBtreat.slice(0, 10) : ''} 
                      onChange={(v) => handleChange('DaTBtreat', v)} 
                    />
                  </div>
                </div>
              </section>

            </div>
          )}

          {/* TAB 2: TREATMENT PLAN */}
          {activeTab === 'treatment-plan' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
              
              {/* Assessment Plan */}
              <section>
                <h4 className={cn('border-b border-border/80 pb-2 mb-4 font-semibold text-foreground', P360_TABLE_TEXT)}>
                  ផែនការការព្យាបាល (Assessment Plan)
                </h4>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <EditableSelectChoiceItem 
                    label="របបថ្នាំ ARV (ARV Regimen)"
                    options={[{id: 0, label: 'ខ្សែទី១ (1st line)'}, {id: 1, label: 'ខ្សែទី២ (2nd line)'}, {id: 2, label: 'ខ្សែទី៣ (3rd line)'}]}
                    value={formData.ARVreg}
                    onChange={(v) => handleChange('ARVreg', v)}
                  />
                  <EditableSelectChoiceItem 
                    label="លទ្ធផល TPT (TPT Outcome)"
                    options={[{id: 0, label: 'បញ្ចប់ (Complete)'}, {id: 1, label: 'បោះបង់ (Loss)'}, {id: 2, label: 'របេង (TB)'}, {id: 3, label: 'ឈប់ដោយផលរំខាន (Stop)'}]}
                    value={formData.TPTout}
                    onChange={(v) => handleChange('TPTout', v)}
                  />
                  <EditableSelectChoiceItem 
                    label="លទ្ធផលរបេង (TB Outcome)"
                    options={[{id: 0, label: 'ជាសះស្បើយ (Cured)'}, {id: 1, label: 'ឈប់ (Stop)'}, {id: 2, label: 'បរាជ័យ (Failure)'}, {id: 3, label: 'បោះបង់ (Loss)'}, {id: 4, label: 'មិនវាយតម្លៃ (Not rated)'}]}
                    value={formData.TBout}
                    onChange={(v) => handleChange('TBout', v)}
                  />
                  <EditableSelectChoiceItem 
                    label="តេស្តបញ្ជាក់ HIV មុន ART"
                    options={[{id: 'True', label: 'បាទ/ចាស (Yes)'}, {id: 'False', label: 'ទេ (No)'}]}
                    value={formData.TestHIV}
                    onChange={(v) => handleChange('TestHIV', v)}
                  />
                  <EditableSelectChoiceItem 
                    label="លទ្ធផលតេស្តបញ្ជាក់ (Confirmatory)"
                    options={[{id: 0, label: 'វិជ្ជមាន (Positive)'}, {id: 1, label: 'អវិជ្ជមាន (Negative)'}]}
                    value={formData.ResultHIV}
                    onChange={(v) => handleChange('ResultHIV', v)}
                  />
                  <EditableSelectChoiceItem 
                    label="វេជ្ជបញ្ជា CD4 (CD4 Rx)"
                    options={[{id: 0, label: 'បាទ/ចាស (Yes)'}, {id: 1, label: 'ទេ (No)'}]}
                    value={formData.ReCD4}
                    onChange={(v) => handleChange('ReCD4', v)}
                  />
                  <EditableSelectChoiceItem 
                    label="វេជ្ជបញ្ជា Viral Load (VL Rx)"
                    options={[{id: 0, label: 'បាទ/ចាស (Yes)'}, {id: 1, label: 'ទេ (No)'}]}
                    value={formData.ReVL}
                    onChange={(v) => handleChange('ReVL', v)}
                  />
                  <EditableSelectChoiceItem 
                    label="វេជ្ជបញ្ជា HCV (HCV Rx)"
                    options={[{id: 0, label: 'បាទ/ចាស (Yes)'}, {id: 1, label: 'ទេ (No)'}]}
                    value={formData.ReHCV}
                    onChange={(v) => handleChange('ReHCV', v)}
                  />
                  <EditableSelectChoiceItem 
                    label="តេស្ត CrAG (CrAG Screening)"
                    options={[{id: 'True', label: 'បាទ/ចាស (Yes)'}, {id: 'False', label: 'ទេ (No)'}]}
                    value={formData.CrAG}
                    onChange={(v) => handleChange('CrAG', v)}
                  />
                  <EditableSelectChoiceItem 
                    label="លទ្ធផល CrAG (CrAG Result)"
                    options={[{id: 0, label: 'វិជ្ជមាន (Positive)'}, {id: 1, label: 'អវិជ្ជមាន (Negative)'}]}
                    value={formData.CrAGResult}
                    onChange={(v) => handleChange('CrAGResult', v)}
                  />
                  <EditableSelectChoiceItem 
                    label="VL Detectable (Adherence Couns.)"
                    options={[{id: 0, label: 'ទេ (No)'}, {id: 1, label: 'លើកទី១ (1st)'}, {id: 2, label: 'លើកទី២ (2nd)'}, {id: 3, label: 'លើកទី៣ (3rd)'}]}
                    value={formData.VLDetectable}
                    onChange={(v) => handleChange('VLDetectable', v)}
                  />
                </div>

                <div className="mt-6 border border-border/80 rounded-md overflow-hidden bg-background">
                  <div className="bg-muted/30 py-2 px-3 border-b border-border/80 font-medium text-foreground">
                    ផលរំខាននៃថ្នាំ (Medication Toxicity)
                  </div>
                  <EditableYesNoHeader />
                  <div className="divide-y divide-border/80">
                    <EditableYesNoItem index={1} label="ស្លេកស្លាំងខ្លាំង (Moderate/severe anemia AZT)" value={formData.Moderate === 'True' ? 1 : 0} onChange={(v) => handleChange('Moderate', v === 1 ? 'True' : 'False')} />
                    <EditableYesNoItem index={2} label="ខ្សោយតម្រងនោម (Renal Toxicity TDF)" flat value={formData.Renal === 'True' ? 1 : 0} onChange={(v) => handleChange('Renal', v === 1 ? 'True' : 'False')} />
                    <EditableYesNoItem index={3} label="រមាស់ (Rash NVP, EFV)" value={formData.Rash === 'True' ? 1 : 0} onChange={(v) => handleChange('Rash', v === 1 ? 'True' : 'False')} />
                    <EditableYesNoItem index={4} label="រលាកថ្លើម (Hepatitis NVP, INH)" flat value={formData.Hepatitis === 'True' ? 1 : 0} onChange={(v) => handleChange('Hepatitis', v === 1 ? 'True' : 'False')} />
                    <EditableYesNoItem index={5} label="ស្ពឹកចុងដៃជើង (Peripheral neuropathy)" value={formData.Peripheral === 'True' ? 1 : 0} onChange={(v) => handleChange('Peripheral', v === 1 ? 'True' : 'False')} />
                    <EditableYesNoItem index={6} label="ខ្វះគ្រាប់ឈាមស (Neutropenia AZT)" flat value={formData.Neutropenia === 'True' ? 1 : 0} onChange={(v) => handleChange('Neutropenia', v === 1 ? 'True' : 'False')} />
                    <EditableYesNoItem index={7} label="ឡើងជាតិខ្លាញ់ (Hyperlipidemia)" value={formData.Hyperlipidemia === 'True' ? 1 : 0} onChange={(v) => handleChange('Hyperlipidemia', v === 1 ? 'True' : 'False')} />
                    <EditableYesNoItem index={8} label="Lactic acidosis" flat value={formData.Lactic === 'True' ? 1 : 0} onChange={(v) => handleChange('Lactic', v === 1 ? 'True' : 'False')} />
                    <EditableYesNoItem index={9} label="លឿងស្បែក (Jaundice)" value={formData.Jaundice === 'True' ? 1 : 0} onChange={(v) => handleChange('Jaundice', v === 1 ? 'True' : 'False')} />
                  </div>
                </div>
              </section>

              {/* Next Appointment */}
              <section>
                <h4 className={cn('border-b border-border/80 pb-2 mb-4 font-semibold text-foreground', P360_TABLE_TEXT)}>
                  ការណាត់ជួបលើកក្រោយ (Next Appointment)
                </h4>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <EditableTextItem 
                    label="ថ្ងៃត្រូវមកលើកក្រោយ (Next Appt Date)" 
                    type="date"
                    value={formData.DaApp ? formData.DaApp.slice(0, 10) : ''} 
                    onChange={(v) => handleChange('DaApp', v)} 
                  />
                </div>
              </section>

              {/* Prescriptions */}
              <section>
                <h4 className={cn('border-b border-border/80 pb-2 mb-4 font-semibold text-foreground', P360_TABLE_TEXT)}>
                  វេជ្ជបញ្ជា (Prescriptions)
                </h4>
                <div className="space-y-6">
                  <DrugPrescriptionTable 
                    title="ថ្នាំ ARV (ARV Prescriptions)"
                    drugs={formData.arvDrugs || []}
                    onChange={(drugs) => handleChange('arvDrugs', drugs)}
                  />
                  
                  <DrugPrescriptionTable 
                    title="ថ្នាំរបេង (TB Prescriptions)"
                    drugs={formData.tbDrugs || []}
                    onChange={(drugs) => handleChange('tbDrugs', drugs)}
                  />

                  <DrugPrescriptionTable 
                    title="ថ្នាំ OI ផ្សេងៗ (OI Prescriptions)"
                    drugs={formData.oiDrugs || []}
                    onChange={(drugs) => handleChange('oiDrugs', drugs)}
                  />
                </div>
              </section>

              {/* Patient Status */}
              <section>
                <h4 className={cn('border-b border-border/80 pb-2 mb-4 font-semibold text-foreground', P360_TABLE_TEXT)}>
                  ស្ថានភាពអ្នកជំងឺ (Patient Status)
                </h4>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <EditableSelectChoiceItem 
                    label="ស្ថានភាព (Status)"
                    options={[
                      {id: 1, label: 'ស្លាប់ (Dead)'},
                      {id: 2, label: 'បាត់បង់ការតាមដាន (Lost to follow up)'},
                      {id: 3, label: 'បញ្ជូនចេញ (Transferred Out)'},
                      {id: 4, label: 'ឈប់ព្យាបាល (Stopped Treatment)'},
                      {id: 5, label: 'ផ្សេងៗ (Other)'}
                    ]}
                    value={formData.PatientStatus}
                    onChange={(v) => handleChange('PatientStatus', v)}
                  />
                  
                  {formData.PatientStatus === 1 && (
                    <>
                      <EditableSelectChoiceItem 
                        label="ទីកន្លែងស្លាប់ (Place of Death)"
                        options={[
                          {id: 1, label: 'មន្ទីរពេទ្យ (Hospital)'},
                          {id: 2, label: 'ផ្ទះ (Home)'},
                          {id: 3, label: 'ផ្សេងៗ (Other)'}
                        ]}
                        value={formData.PlaceDead}
                        onChange={(v) => handleChange('PlaceDead', v)}
                      />
                      <EditableSelectChoiceItem 
                        label="ប្រភេទមូលហេតុ (Cause of Death Type)"
                        options={[
                          {id: 1, label: 'ទាក់ទងនឹងមេរោគអេដស៍ (HIV Related)'},
                          {id: 2, label: 'មិនទាក់ទងនឹងមេរោគអេដស៍ (Non-HIV Related)'},
                          {id: 3, label: 'មិនដឹង (Unknown)'}
                        ]}
                        value={formData.CauseDeathType}
                        onChange={(v) => handleChange('CauseDeathType', v)}
                      />
                      <EditableTextItem 
                        label="មូលហេតុស្លាប់ (Cause of Death)"
                        value={formData.CauseDeath}
                        onChange={(v) => handleChange('CauseDeath', v)}
                      />
                    </>
                  )}

                  {formData.PatientStatus === 3 && (
                    <EditableTextItem 
                      label="បញ្ជូនទៅ (Transferred To)"
                      value={formData.TransferOut}
                      onChange={(v) => handleChange('TransferOut', v)}
                    />
                  )}
                  
                  {formData.PatientStatus && formData.PatientStatus !== -1 && (
                    <EditableTextItem 
                      label="កាលបរិច្ឆេទ (Outcome Date)" 
                      type="date"
                      value={formData.OutcomeDate ? formData.OutcomeDate.slice(0, 10) : ''} 
                      onChange={(v) => handleChange('OutcomeDate', v)} 
                    />
                  )}
                </div>
              </section>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}
`

fs.writeFileSync('frontend/src/components/clinicalForms/AdultVisitForm.jsx', code);
console.log('Replaced AdultVisitForm layout completely');
