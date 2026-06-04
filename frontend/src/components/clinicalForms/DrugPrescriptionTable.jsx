import { useState, useRef, useEffect } from 'react';
import { RiAddLine, RiDeleteBinLine, RiArrowDownSLine } from '@remixicon/react';
import { cn } from '@/lib/utils';
import { P360_TABLE_PAD, P360_TABLE_TEXT } from '../layout/appNavStyles';

const FREQ_OPTIONS = [
  { value: 'qd', label: '1 ដង/ថ្ងៃ (qd)' },
  { value: 'bid', label: '2 ដង/ថ្ងៃ (bid)' },
  { value: 'tid', label: '3 ដង/ថ្ងៃ (tid)' },
  { value: 'qid', label: '4 ដង/ថ្ងៃ (qid)' },
  { value: 'other', label: 'ផ្សេងៗ' },
];

const FORM_OPTIONS = [
  { value: 'tab', label: 'គ្រាប់' },
  { value: 'cap', label: 'គ្រាប់' },
  { value: 'liquid', label: 'ទឹក' },
  { value: 'inj', label: 'ចាក់' },
];

const STATUS_OPTIONS = [
  { value: '0', label: 'ចាប់ផ្តើម' },
  { value: '1', label: 'បញ្ឈប់' },
  { value: '2', label: 'បន្ត' },
];

function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

function SearchableDrugSelect({ value, onChange, options }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState(value || '');
  const wrapperRef = useRef(null);

  useEffect(() => {
    setSearch(value || '');
  }, [value]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
        if (search !== value) {
          onChange(search);
        }
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [wrapperRef, search, value, onChange]);

  const filteredOptions = options.filter(o => o.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="relative w-full min-w-[120px]" ref={wrapperRef}>
      <div className="relative">
        <input
          type="text"
          className="w-full rounded border border-transparent bg-transparent p-1 px-2 pr-7 hover:border-border/80 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setIsOpen(true);
            onChange(e.target.value);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="ឈ្មោះថ្នាំ..."
        />
        <div 
          className="absolute top-1/2 right-1 -translate-y-1/2 cursor-pointer p-1 text-muted-foreground hover:text-foreground"
          onClick={() => setIsOpen(!isOpen)}
        >
          <RiArrowDownSLine className="w-4 h-4" />
        </div>
      </div>
      
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 max-h-60 overflow-y-auto bg-popover text-popover-foreground border border-border rounded shadow-md text-sm">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((opt) => (
              <div 
                key={opt}
                className="px-3 py-2 hover:bg-muted cursor-pointer"
                onClick={() => {
                  setSearch(opt);
                  onChange(opt);
                  setIsOpen(false);
                }}
              >
                {opt}
              </div>
            ))
          ) : (
            <div className="px-3 py-2 text-muted-foreground italic">
              គ្មានលទ្ធផល...
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function DrugPrescriptionTable({ title, drugs = [], onChange, drugOptions = [] }) {
  const handleAddRow = () => {
    const newDrug = {
      _id: generateId(),
      DrugName: '',
      Dose: '',
      Quantity: '',
      Freq: 'qd',
      Form: 'tab',
      Status: '0',
      Da: new Date().toISOString().split('T')[0],
      Reason: '',
      Remark: ''
    };
    onChange([...drugs, newDrug]);
  };

  const getDrugId = (d) => d._id || d.ID || d.id;

  const handleRemoveRow = (id) => {
    onChange(drugs.filter((d) => getDrugId(d) !== id));
  };

  const handleChange = (id, field, value) => {
    onChange(drugs.map((d) => (getDrugId(d) === id ? { ...d, [field]: value } : d)));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h5 className={cn('font-medium text-foreground/90', P360_TABLE_TEXT)}>{title}</h5>
        <button
          type="button"
          onClick={handleAddRow}
          className="flex items-center gap-1 rounded bg-primary/10 px-2 py-1 text-xs font-semibold text-primary hover:bg-primary/20 transition-colors"
        >
          <RiAddLine className="size-4" />
          ថែមថ្មី
        </button>
      </div>

      <div className="overflow-x-auto rounded border border-border/80">
        <table className={cn("w-full text-left", P360_TABLE_TEXT)}>
          <thead className="bg-muted/50 text-muted-foreground">
            <tr>
              <th className={cn('font-medium py-2 whitespace-nowrap', P360_TABLE_PAD)}>ឈ្មោះថ្នាំ</th>
              <th className={cn('font-medium py-2 whitespace-nowrap', P360_TABLE_PAD)}>កម្រិត</th>
              <th className={cn('font-medium py-2 whitespace-nowrap w-20', P360_TABLE_PAD)}>ចំនួន</th>
              <th className={cn('font-medium py-2 whitespace-nowrap', P360_TABLE_PAD)}>ប្រេកង់</th>
              <th className={cn('font-medium py-2 whitespace-nowrap', P360_TABLE_PAD)}>ប្រភេទ</th>
              <th className={cn('font-medium py-2 whitespace-nowrap', P360_TABLE_PAD)}>ស្ថានភាព</th>
              <th className={cn('font-medium py-2 whitespace-nowrap', P360_TABLE_PAD)}>កាលបរិច្ឆេទ</th>
              <th className={cn('font-medium py-2 whitespace-nowrap', P360_TABLE_PAD)}>មូលហេតុ</th>
              <th className={cn('font-medium py-2 whitespace-nowrap w-10', P360_TABLE_PAD)}></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/80">
            {drugs.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-6 text-center text-muted-foreground italic text-sm">
                  មិនមានថ្នាំទេ
                </td>
              </tr>
            ) : (
              drugs.map((drug) => {
                const drugId = getDrugId(drug);
                return (
                <tr key={drugId} className="group hover:bg-muted/10">
                  <td className={P360_TABLE_PAD}>
                    <SearchableDrugSelect
                      value={drug.DrugName || ''}
                      onChange={(val) => handleChange(drugId, 'DrugName', val)}
                      options={drugOptions}
                    />
                  </td>
                  <td className={P360_TABLE_PAD}>
                    <input
                      type="text"
                      className="w-full min-w-[80px] rounded border border-transparent bg-transparent p-1 px-2 hover:border-border/80 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      value={drug.Dose || ''}
                      onChange={(e) => handleChange(drugId, 'Dose', e.target.value)}
                      placeholder="Dose..."
                    />
                  </td>
                  <td className={P360_TABLE_PAD}>
                    <input
                      type="text"
                      className="w-full min-w-[60px] rounded border border-transparent bg-transparent p-1 px-2 hover:border-border/80 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      value={drug.Quantity || ''}
                      onChange={(e) => handleChange(drugId, 'Quantity', e.target.value)}
                    />
                  </td>
                  <td className={P360_TABLE_PAD}>
                    <select
                      className="w-full rounded border border-transparent bg-transparent p-1 hover:border-border/80 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      value={drug.Freq || 'qd'}
                      onChange={(e) => handleChange(drugId, 'Freq', e.target.value)}
                    >
                      {FREQ_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </td>
                  <td className={P360_TABLE_PAD}>
                    <select
                      className="w-full rounded border border-transparent bg-transparent p-1 hover:border-border/80 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      value={drug.Form || 'tab'}
                      onChange={(e) => handleChange(drugId, 'Form', e.target.value)}
                    >
                      {FORM_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </td>
                  <td className={P360_TABLE_PAD}>
                    <select
                      className="w-full rounded border border-transparent bg-transparent p-1 hover:border-border/80 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      value={drug.Status || '0'}
                      onChange={(e) => handleChange(drugId, 'Status', e.target.value)}
                    >
                      {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </td>
                  <td className={P360_TABLE_PAD}>
                    <input
                      type="date"
                      className="w-full min-w-[120px] rounded border border-transparent bg-transparent p-1 px-2 hover:border-border/80 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      value={drug.Da || ''}
                      onChange={(e) => handleChange(drugId, 'Da', e.target.value)}
                    />
                  </td>
                  <td className={P360_TABLE_PAD}>
                    <input
                      type="text"
                      className="w-full min-w-[120px] rounded border border-transparent bg-transparent p-1 px-2 hover:border-border/80 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      value={drug.Reason || ''}
                      onChange={(e) => handleChange(drugId, 'Reason', e.target.value)}
                      placeholder="មូលហេតុ..."
                    />
                  </td>
                  <td className={cn('text-right', P360_TABLE_PAD)}>
                    <button
                      type="button"
                      onClick={() => handleRemoveRow(drugId)}
                      className="flex size-7 items-center justify-center rounded text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                      title="លុបថ្នាំ"
                    >
                      <RiDeleteBinLine className="size-4" />
                    </button>
                  </td>
                </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
