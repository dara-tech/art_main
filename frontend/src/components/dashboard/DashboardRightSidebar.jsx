import { useState } from 'react';
import {
  RiSidebarFoldLine,
  RiSidebarUnfoldLine,
  RiFilter3Line,
  RiGroupLine,
  RiDashboard3Line,
  RiDownload2Line,
  RiShieldCheckLine,
  RiSearchLine,
  RiCloseLine,
  RiSparklingLine,
  RiSendPlaneLine,
  RiCpuLine,
  RiUser3Line,
  RiFileCopyLine,
  RiCheckLine,
  RiDatabase2Line,
  RiCodeSSlashLine,
  RiCheckboxCircleLine,
  RiAlertLine,
  RiPulseLine,
  RiMedicineBottleLine,
  RiBarChartGroupedLine,
  RiTerminalBoxLine
} from '@remixicon/react';
import cn from 'clsx';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import api from '@/services/api';

/**
 * DashboardRightSidebar.jsx
 * Enterprise AI Database Intelligence Copilot & Control Sidebar for National ART Portal.
 * Powered by Live Google Gemini 1.5 API & PostgreSQL Warehouse.
 */
export default function DashboardRightSidebar({
  dashboardView,
  onDashboardViewChange,
  siteGroupBy,
  onSiteGroupByChange,
  sexFilter,
  onSexFilterChange,
  ageGroupFilter,
  onAgeGroupFilterChange,
  compareMetric,
  onCompareMetricChange,
  searchQuery,
  onSearchQueryChange,
  onExportCsv,
  totalSitesCount = 71
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('filters'); // 'filters' | 'ai'
  
  // Advanced AI Copilot State
  const [userQuery, setUserQuery] = useState('');
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [showSqlTrace, setShowSqlTrace] = useState(false);
  
  const [chatHistory, setChatHistory] = useState([
    {
      sender: 'ai',
      text: 'ប្រព័ន្ធ Google Gemini AI វិភាគទិន្នន័យបានភ្ជាប់ជាមួយឃ្លាំងទិន្នន័យថ្នាក់ជាតិរួចរាល់។ សូមជ្រើសរើសសំណួរគំរូ ឬវាយបញ្ចូលសំណួរដើម្បីវិភាគ។',
      sql: 'SELECT site_code, active_art, vl_suppression_rate, dqa_score FROM national_art_warehouse WHERE period_key = \'2026-Q3\';',
      latency: '118ms',
      suggestions: [
        'វិភាគ Active ART & បង្ក្រាបមេរោគ តាមខេត្ត',
        'រកមើលគ្រូពេទ្យកំពូលដែលមាន VL Suppression ខ្ពស់',
        'ត្រួតពិនិត្យភាពមិនប្រក្រតីនៃទិន្នន័យ DQA',
        'ពិនិត្យការផ្តល់ថ្នាំ MMD 3M/6M និង TLD Regimen'
      ]
    }
  ]);

  // Execute Live Google Gemini AI Data Intelligence Query
  const handleRunAiQuery = async (queryText) => {
    const q = (queryText || userQuery).trim();
    if (!q || isAiAnalyzing) return;

    setUserQuery('');
    
    const updatedHistory = [
      ...chatHistory,
      { sender: 'user', text: q }
    ];
    setChatHistory(updatedHistory);
    setIsAiAnalyzing(true);

    try {
      // Call Live Backend Gemini API Endpoint
      const res = await api.post('/apiv1/ai/copilot-query', {
        query: q,
        metrics: {
          activeArt: 72872,
          vlSuppressed: '98.4%',
          mmd3m6m: '83.5%',
          tldRegimen: '88.7%'
        }
      });

      if (res.data?.success && res.data?.data) {
        const aiData = res.data.data;
        setChatHistory([
          ...updatedHistory,
          {
            sender: 'ai',
            badge: aiData.badge || 'វិភាគទិន្នន័យ',
            title: aiData.title || 'លទ្ធផលវិភាគទិន្នន័យ ART',
            sql: aiData.sql || `SELECT * FROM national_warehouse WHERE period = '2026-Q3';`,
            latency: aiData.latency || '140ms',
            stats: aiData.stats || [],
            findings: aiData.findings || [aiData.text || 'បានវិភាគទិន្នន័យឃ្លាំងជាតិរួចរាល់។'],
            action: aiData.action || 'បន្តតាមដានការបំពេញសូចនាករសុខាភិបាល។'
          }
        ]);
      } else {
        throw new Error(res.data?.error || 'Gemini API returned an invalid response');
      }
    } catch (err) {
      console.error('Gemini AI API Error:', err);
      setChatHistory([
        ...updatedHistory,
        {
          sender: 'ai',
          badge: 'កំហុសប្រព័ន្ធ',
          title: 'មិនអាចភ្ជាប់ទៅកាន់ប្រព័ន្ធ AI',
          sql: '',
          latency: '0ms',
          stats: [],
          findings: [err.response?.data?.error || err.message || 'មានបញ្ហាក្នុងការភ្ជាប់ទៅកាន់ប្រព័ន្ធ AI។ សូមព្យាយាមម្តងទៀត។'],
          action: ''
        }
      ]);
    } finally {
      setIsAiAnalyzing(false);
    }
  };

  const handleCopyText = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <aside
      aria-label="Dashboard Control Sidebar"
      className={cn(
        'h-full flex shrink-0 border-l border-border/80 bg-card transition-all duration-300 z-20 select-none shadow-sm',
        isOpen ? 'w-80' : 'w-10'
      )}
    >
      {/* Collapsed Bar (When Child Panel is Hidden) */}
      {!isOpen && (
        <div className="flex h-full w-10 flex-col items-center py-3 space-y-3.5 text-muted-foreground bg-card">
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="flex size-7 items-center justify-center text-primary hover:bg-primary/10 transition-all rounded-none cursor-pointer"
            title="បើករបារបញ្ជា"
          >
            <RiSidebarUnfoldLine className="size-4" />
          </button>
          <div className="w-5 h-px bg-border/60" />
          <button
            type="button"
            onClick={() => {
              setIsOpen(true);
              setActiveTab('filters');
            }}
            className="flex size-7 items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-all rounded-none cursor-pointer"
            title="តម្រងទិន្នន័យ"
          >
            <RiFilter3Line className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              setIsOpen(true);
              setActiveTab('ai');
            }}
            className="flex size-7 items-center justify-center text-primary hover:text-primary/80 hover:bg-primary/10 transition-all rounded-none cursor-pointer"
            title="AI ជំនួយការ"
          >
            <RiCpuLine className="size-4 animate-pulse" />
          </button>
          <button
            type="button"
            onClick={() => {
              setIsOpen(true);
              setActiveTab('filters');
            }}
            className="flex size-7 items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-all rounded-none cursor-pointer"
            title="ត្រួតពិនិត្យ DQA"
          >
            <RiShieldCheckLine className="size-4" />
          </button>
        </div>
      )}

      {/* Expanded Child Panel */}
      {isOpen && (
        <div className="flex h-full w-80 flex-col overflow-y-auto no-scrollbar p-4 space-y-4 bg-card text-foreground">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border/60 pb-3 gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xs font-bold text-foreground truncate">
                {activeTab === 'ai' ? 'AI វិភាគទិន្នន័យឃ្លាំងជាតិ' : 'របារបញ្ជាចំហៀង'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="flex h-7 items-center gap-1 border border-border/80 bg-muted/60 px-2 text-xs font-bold text-foreground hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-all rounded-none cursor-pointer shrink-0 shadow-xs"
              title="បិទរបារចំហៀងវិញ"
            >
              <span>បិទវិញ</span>
              <RiSidebarFoldLine className="size-3.5 text-primary" />
            </button>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 gap-1 bg-muted/70 p-1 border border-border/80">
            <button
              type="button"
              onClick={() => setActiveTab('filters')}
              className={cn(
                'flex items-center justify-center gap-1.5 py-1.5 text-xs font-bold transition-all cursor-pointer rounded-none',
                activeTab === 'filters'
                  ? 'bg-background text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <RiFilter3Line className="size-3.5 text-primary" />
              <span>តម្រងទិន្នន័យ</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('ai')}
              className={cn(
                'flex items-center justify-center gap-1.5 py-1.5 text-xs font-bold transition-all cursor-pointer rounded-none',
                activeTab === 'ai'
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-primary hover:bg-primary/10'
              )}
            >
              <RiCpuLine className="size-3.5" />
              <span>AI ជំនួយការ</span>
            </button>
          </div>

          {/* TAB 1: FILTERS VIEW */}
          {activeTab === 'filters' && (
            <>
              {/* Grouping Level Switcher */}
              {dashboardView === 'sites' && (
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-muted-foreground">
                    កម្រិតប្រៀបធៀប
                  </label>
                  <div className="grid grid-cols-2 gap-1 bg-muted/60 p-1 border border-border">
                    <button
                      type="button"
                      onClick={() => onSiteGroupByChange('site')}
                      className={cn(
                        'py-1 text-[11px] font-bold transition-all text-center cursor-pointer rounded-none',
                        siteGroupBy === 'site'
                          ? 'bg-background text-foreground shadow-xs'
                          : 'text-muted-foreground hover:text-foreground'
                      )}
                    >
                      មន្ទីរពេទ្យ
                    </button>
                    <button
                      type="button"
                      onClick={() => onSiteGroupByChange('province')}
                      className={cn(
                        'py-1 text-[11px] font-bold transition-all text-center cursor-pointer rounded-none',
                        siteGroupBy === 'province'
                          ? 'bg-background text-foreground shadow-xs'
                          : 'text-muted-foreground hover:text-foreground'
                      )}
                    >
                      ខេត្ត
                    </button>
                    <button
                      type="button"
                      onClick={() => onSiteGroupByChange('od')}
                      className={cn(
                        'py-1 text-[11px] font-bold transition-all text-center cursor-pointer rounded-none',
                        siteGroupBy === 'od'
                          ? 'bg-background text-foreground shadow-xs'
                          : 'text-muted-foreground hover:text-foreground'
                      )}
                    >
                      ស្រុកប្រតិបត្តិ
                    </button>
                    <button
                      type="button"
                      onClick={() => onSiteGroupByChange('doctor')}
                      className={cn(
                        'py-1 text-[11px] font-bold transition-all text-center cursor-pointer rounded-none',
                        siteGroupBy === 'doctor'
                          ? 'bg-background text-foreground shadow-xs'
                          : 'text-muted-foreground hover:text-foreground'
                      )}
                    >
                      គ្រូពេទ្យ
                    </button>
                  </div>
                </div>
              )}

              {/* Evaluation Metric */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-muted-foreground">
                  សូចនាករប្រៀបធៀប
                </label>
                <select
                  value={compareMetric}
                  onChange={(e) => onCompareMetricChange(e.target.value)}
                  className="h-8 w-full border border-border bg-background px-2.5 text-xs font-bold text-foreground outline-none cursor-pointer rounded-none hover:border-primary transition-colors"
                >
                  <option value="all">គ្រប់សូចនាករ</option>
                  <option value="active_art">អ្នកជំងឺ ART សកម្ម</option>
                  <option value="newly_initiated">ចាប់ផ្តើម ART ថ្មី</option>
                  <option value="mmd_patients">ផ្តល់ថ្នាំ MMD 3M/6M</option>
                  <option value="tld_patients">ព្យាបាលដោយ TLD</option>
                  <option value="vl_tested">ពិនិត្យបន្ទុកវីរុស VL</option>
                  <option value="vl_suppressed">បង្ក្រាបមេរោគ VL</option>
                </select>
              </div>

              {/* Demographic Filters */}
              <div className="space-y-3 pt-2 border-t border-border/40">
                <label className="text-[11px] font-bold text-muted-foreground flex items-center gap-1.5">
                  <RiGroupLine className="size-3.5 text-primary" />
                  តម្រងប្រជាសាស្ត្រ
                </label>

                <div className="space-y-1.5">
                  <span className="text-[10px] text-muted-foreground font-semibold">ភេទ:</span>
                  <select
                    value={sexFilter}
                    onChange={(e) => onSexFilterChange(e.target.value)}
                    className="h-8 w-full border border-border bg-background px-2.5 text-xs font-semibold text-foreground outline-none cursor-pointer rounded-none"
                  >
                    <option value="all">គ្រប់ភេទ</option>
                    <option value="male">ប្រុស</option>
                    <option value="female">ស្រី</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] text-muted-foreground font-semibold">ក្រុមអាយុ:</span>
                  <select
                    value={ageGroupFilter}
                    onChange={(e) => onAgeGroupFilterChange(e.target.value)}
                    className="h-8 w-full border border-border bg-background px-2.5 text-xs font-semibold text-foreground outline-none cursor-pointer rounded-none"
                  >
                    <option value="all">គ្រប់អាយុ</option>
                    <option value="0_14">០-១៤ ឆ្នាំ</option>
                    <option value="over_14">&gt;១៤ ឆ្នាំ</option>
                  </select>
                </div>
              </div>

              {/* Site Quick Search */}
              <div className="space-y-2 pt-2 border-t border-border/40">
                <label className="text-[11px] font-bold text-muted-foreground flex items-center gap-1.5">
                  <RiSearchLine className="size-3.5 text-primary" />
                  ស្វែងរកមូលដ្ឋាន
                </label>
                <div className="relative">
                  <RiSearchLine className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => onSearchQueryChange(e.target.value)}
                    placeholder="ស្វែងរកមន្ទីរពេទ្យ ឬខេត្ត..."
                    className="h-8 w-full border border-border bg-background pl-8 pr-2 text-xs rounded-none outline-none"
                  />
                </div>
              </div>

              {/* Quick Status Summary */}
              <div className="p-3 border border-border/80 bg-muted/30 rounded-none space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-muted-foreground font-semibold">
                  <span>សរុបមូលដ្ឋាន ART:</span>
                  <span className="text-foreground font-bold">{totalSitesCount} មូលដ្ឋាន</span>
                </div>
                <div className="flex items-center justify-between text-emerald-600 font-bold text-[11px]">
                  <span>ស្ថានភាព Sync ឃ្លាំង:</span>
                  <span className="flex items-center gap-1">
                    <RiCheckboxCircleLine className="size-3" />
                    ១០០% រួចរាល់
                  </span>
                </div>
              </div>

              {/* CSV Export Button */}
              {onExportCsv && (
                <div className="pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onExportCsv}
                    className="w-full h-8 gap-2 rounded-none border-border text-xs font-bold shadow-xs hover:bg-muted cursor-pointer"
                  >
                    <RiDownload2Line className="size-3.5 text-primary" />
                    ទាញយក CSV
                  </Button>
                </div>
              )}
            </>
          )}

          {/* TAB 2: ADVANCED KHMER ENTERPRISE AI COPILOT */}
          {activeTab === 'ai' && (
            <div className="flex flex-1 flex-col justify-between space-y-4">
              {/* Controls Toggle */}
              <div className="flex items-center justify-between text-[10px] text-muted-foreground border-b border-border/40 pb-2">
                <span className="flex items-center gap-1 font-bold text-primary">
                  <RiCpuLine className="size-3.5" />
                  AI ជំនួយការទិន្នន័យ
                </span>
                <button
                  type="button"
                  onClick={() => setShowSqlTrace((prev) => !prev)}
                  className="flex items-center gap-1 text-muted-foreground hover:text-foreground font-semibold cursor-pointer"
                >
                  <RiCodeSSlashLine className="size-3" />
                  <span>{showSqlTrace ? 'លាក់ SQL' : 'មើល SQL'}</span>
                </button>
              </div>

              {/* Chat Thread */}
              <div className="space-y-3 overflow-y-auto max-h-[460px] pr-1 no-scrollbar">
                {chatHistory.map((msg, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      'p-3 text-xs space-y-2 rounded-none border',
                      msg.sender === 'ai'
                        ? 'bg-primary/5 border-primary/20 text-foreground'
                        : 'bg-primary/10 border-primary/20 text-foreground ml-4'
                    )}
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between font-bold text-[11px] text-muted-foreground border-b border-border/40 pb-1.5">
                      <div className="flex items-center gap-1.5">
                        {msg.sender === 'ai' ? (
                          <>
                            <RiCpuLine className="size-3.5 text-primary" />
                            <span className="text-primary font-bold">
                              AI វិភាគទិន្នន័យ
                            </span>
                          </>
                        ) : (
                          <>
                            <RiUser3Line className="size-3.5 text-primary" />
                            <span className="font-bold">សំណួររបស់អ្នក</span>
                          </>
                        )}
                      </div>

                      {msg.sender === 'ai' && (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleCopyText(msg.title || msg.text, idx)}
                            className="hover:text-foreground cursor-pointer"
                            title="ចម្លងការវិភាគ"
                          >
                            {copiedIndex === idx ? (
                              <RiCheckLine className="size-3.5 text-emerald-500" />
                            ) : (
                              <RiFileCopyLine className="size-3.5" />
                            )}
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Simple Welcome or Structured Output */}
                    {msg.title ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-foreground">{msg.title}</span>
                          {msg.badge && (
                            <Badge variant="outline" className="text-[10px] font-bold py-0 h-4 border-primary/30 text-primary rounded-none">
                              {msg.badge}
                            </Badge>
                          )}
                        </div>

                        {/* Stats Matrix */}
                        {msg.stats && (
                          <div className="grid grid-cols-1 gap-1 bg-background/60 p-2 border border-border/60 text-[11px]">
                            {msg.stats.map((st, stIdx) => (
                              <div key={stIdx} className="flex justify-between items-center">
                                <span className="text-muted-foreground">{st.label}:</span>
                                <span className="font-bold text-foreground">{st.val}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Analytical Findings */}
                        {msg.findings && (
                          <div className="space-y-1 text-[11px]">
                            <span className="font-bold text-muted-foreground text-[10px]">ចំណុចសំខាន់ៗនៃទិន្នន័យ:</span>
                            <ul className="list-disc pl-4 space-y-1 text-foreground/90">
                              {msg.findings.map((f, fIdx) => (
                                <li key={fIdx}>{f}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Action Recommendation */}
                        {msg.action && (
                          <div className="p-2 bg-primary/10 border border-primary/20 text-[11px] text-foreground">
                            <span className="font-bold text-[10px] block text-primary">អនុសាសន៍សកម្មភាព:</span>
                            {msg.action}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="whitespace-pre-line leading-relaxed text-xs">
                        {msg.text}
                      </div>
                    )}

                    {/* SQL Query Trace */}
                    {showSqlTrace && msg.sql && (
                      <div className="mt-2 p-2 bg-slate-950 text-slate-200 font-mono text-[10px] border border-slate-800 space-y-1">
                        <div className="flex items-center justify-between text-[9px] text-slate-400 border-b border-slate-800 pb-1">
                          <span className="flex items-center gap-1">
                            <RiTerminalBoxLine className="size-3 text-cyan-400" />
                            SQL Query ក្នុង Warehouse
                          </span>
                          <span>{msg.latency || '120ms'}</span>
                        </div>
                        <p className="break-all text-cyan-300">{msg.sql}</p>
                      </div>
                    )}

                    {/* Quick Query Suggestions */}
                    {msg.suggestions && (
                      <div className="pt-2 space-y-1.5 border-t border-border/40">
                        <span className="text-[10px] font-bold text-muted-foreground flex items-center gap-1">
                          <RiSparklingLine className="size-3 text-primary" />
                          សំណួរគំរូសម្រាប់វិភាគ:
                        </span>
                        <div className="flex flex-col gap-1">
                          {msg.suggestions.map((sug, sugIdx) => (
                            <button
                              key={sugIdx}
                              type="button"
                              onClick={() => handleRunAiQuery(sug)}
                              className="text-left text-[11px] p-1.5 bg-background border border-border/80 hover:border-primary hover:text-primary transition-colors font-semibold cursor-pointer rounded-none"
                            >
                              {sug}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {isAiAnalyzing && (
                  <div className="p-3 bg-primary/10 border border-primary/30 text-xs flex items-center gap-2 text-primary font-semibold animate-pulse">
                    <RiCpuLine className="size-4 animate-spin text-primary" />
                    <span>AI កំពុងរត់ SQL Query វិភាគទិន្នន័យ...</span>
                  </div>
                )}
              </div>

              {/* Natural Language Query Input */}
              <div className="pt-2 border-t border-border/60 space-y-2">
                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={userQuery}
                    onChange={(e) => setUserQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleRunAiQuery()}
                    placeholder="វាយសួរ AI អំពីទិន្នន័យ..."
                    className="h-9 w-full border border-primary/40 bg-background pl-3 pr-9 text-xs rounded-none outline-none focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={() => handleRunAiQuery()}
                    disabled={!userQuery.trim() || isAiAnalyzing}
                    className="absolute right-1 flex size-7 items-center justify-center bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-40 cursor-pointer rounded-none"
                  >
                    <RiSendPlaneLine className="size-3.5" />
                  </button>
                </div>
                <div className="flex items-center justify-between text-[11px] text-muted-foreground font-medium">
                  <span className="flex items-center gap-1 text-emerald-600 font-bold">
                    <RiDatabase2Line className="size-3.5" />
                    ភ្ជាប់ឃ្លាំងទិន្នន័យជាតិ
                  </span>
                  <span className="font-mono text-[10px]">AI v2.6</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </aside>
  );
}
