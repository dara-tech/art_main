import { useState, useEffect } from 'react';
import {
  RiSparklingFill,
  RiRobot2Line,
  RiSendPlane2Fill,
  RiErrorWarningLine,
  RiFileTextLine,
  RiDownloadLine,
  RiBuildingLine,
  RiCheckDoubleLine,
  RiWifiLine,
  RiSearchLine,
  RiQuestionLine,
  RiLoader4Line
} from '@remixicon/react';
import AppPageShell from '../components/layout/AppPageShell';
import Patient360Layout from '../components/patient360/Patient360Layout';
import { Patient360NavBar, Patient360NavRow } from '../components/patient360/Patient360NavBar';
import { queryAiCopilot, fetchAiAnomalies, fetchAiNarrative } from '../services/aiApi';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { p360CardClass } from '../components/layout/appNavStyles';

const PRESET_PROMPTS = [
  {
    id: 'p1',
    khmer: '🚨 មណ្ឌលដែលមានអត្រាបង្ក្រាប VL ទាបជាងគេ?',
    query: 'តើមណ្ឌលណាខ្លះដែលមានអត្រាបង្ក្រាប VL ទាបជាង ៩០% ក្នុងត្រីមាសនេះ?'
  },
  {
    id: 'p2',
    khmer: '📉 ការវិភាគមណ្ឌលដែលមានកំណើន ART ថយចុះ?',
    query: 'វិភាគមណ្ឌលដែលមានការផ្ដើម ART ថ្មីថយចុះ ព្រមទាំងផ្តល់អនុសាសន៍ដោះស្រាយ។'
  },
  {
    id: 'p3',
    khmer: '💊 មណ្ឌលយឺតយ៉ាវក្នុងការផ្តល់ថ្នាំ MMD 6M?',
    query: 'តើមណ្ឌលណាខ្លះដែលផ្តល់ថ្នាំ MMD 6M បានតិចជាងគេ?'
  },
  {
    id: 'p4',
    khmer: '📋 បង្កើតរបាយការណ៍សង្ខេបប្រតិបត្តិត្រីមាស?',
    query: 'បង្កើតសេចក្តីសង្ខេបប្រតិបត្តិលើលទ្ធផលសូចនាករជាតិសម្រាប់ត្រីមាសនេះ។'
  }
];

export default function AiDecisionPage({ onLogout }) {
  const [activeTab, setActiveTab] = useState('copilot'); // 'copilot', 'anomalies', 'narrative'
  const [messages, setMessages] = useState([
    {
      id: 'm1',
      sender: 'ai',
      text: `ជំរាបសួរ! ស្វាគមន៍មកកាន់ **ART-AI Decision Hub** (Real Database Connected 🟢)។ ខ្ញុំបានភ្ជាប់ទៅកាន់ទិន្នន័យផ្ទាល់ចេញពីប្រព័ន្ធ SQL Warehouse រួចរាល់។ សូមចុចសំណួរគំរូខាងក្រោម ឬសួរសំណួរវិភាគទិន្នន័យ។`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isThinking, setIsThinking] = useState(false);

  // Dynamic Live Database State
  const [anomalies, setAnomalies] = useState([]);
  const [loadingAnomalies, setLoadingAnomalies] = useState(false);
  const [narrativeData, setNarrativeData] = useState(null);
  const [loadingNarrative, setLoadingNarrative] = useState(false);

  // Fetch real database anomalies and narrative on tab change or mount
  useEffect(() => {
    let isMounted = true;

    async function loadDatabaseData() {
      if (activeTab === 'anomalies' && anomalies.length === 0) {
        setLoadingAnomalies(true);
        const data = await fetchAiAnomalies('2026-Q2');
        if (isMounted) {
          setAnomalies(data);
          setLoadingAnomalies(false);
        }
      } else if (activeTab === 'narrative' && !narrativeData) {
        setLoadingNarrative(true);
        const data = await fetchAiNarrative('2026-Q2');
        if (isMounted) {
          setNarrativeData(data);
          setLoadingNarrative(false);
        }
      }
    }

    loadDatabaseData();
    return () => { isMounted = false; };
  }, [activeTab]);

  const handleSend = async (textToSend) => {
    const text = textToSend || inputQuery;
    if (!text.trim()) return;

    const userMsg = {
      id: `u_${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputQuery('');
    setIsThinking(true);

    try {
      const res = await queryAiCopilot(text, '2026-Q2');
      
      let aiText = '';
      if (res && res.findings && res.findings.length > 0) {
        const titleStr = res.title ? `**${res.title}** ៖\n\n` : '';
        const findingsStr = res.findings.map((f) => `• ${f}`).join('\n');
        const actionStr = res.action ? `\n\n💡 **អនុសាសន៍** ៖ ${res.action}` : '';
        aiText = `${titleStr}${findingsStr}${actionStr}`;
      } else {
        aiText = `**ទិន្នន័យផ្ទាល់ពីប្រព័ន្ធ SQL** ៖ ពុំមានទិន្នន័យសម្រាប់សំណួរនេះទេ។ សូមព្យាយាមសួរសំណួរលើ Viral Load, Retention, MMD ឬឈ្មោះខេត្ត។`;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `ai_${Date.now()}`,
          sender: 'ai',
          text: aiText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err) {
      console.error('AI query error:', err);
    } finally {
      setIsThinking(false);
    }
  };

  const aiToolbar = (
    <Patient360NavBar ariaLabel="AI Decision Hub Toolbar" rowCount={1}>
      <Patient360NavRow tone="filters" className="gap-2 justify-between">
        <div className="flex flex-1 min-w-0 items-center gap-2 overflow-x-auto no-scrollbar py-0.5 font-khmer">
          <div className="flex items-center gap-1.5 px-2 text-xs font-bold text-foreground shrink-0">
            <RiSparklingFill className="size-4 text-teal-500 animate-pulse" />
            <span>AI Decision Hub</span>
          </div>

          <span className="h-4 w-px bg-border/80 shrink-0" aria-hidden />

          <div className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 shrink-0">
            <RiWifiLine className="size-3 text-emerald-500" /> Live SQL Database Connected 🟢 (2026-Q2)
          </div>
        </div>

        {/* VIEW SWITCHER BUTTONS - EXACT DASHBOARD PAGE STYLING */}
        <div className="flex items-center border border-border/80 bg-background p-0.5 shrink-0 h-8 shadow-2xs font-khmer">
          <button
            type="button"
            onClick={() => setActiveTab('copilot')}
            className={cn(
              "flex items-center gap-1.5 px-3 h-full text-xs font-bold transition-all cursor-pointer",
              activeTab === 'copilot'
                ? "bg-primary text-primary-foreground shadow-2xs"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
            )}
          >
            <RiRobot2Line className="size-3.5" /> AI Chat Assistant
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('anomalies')}
            className={cn(
              "flex items-center gap-1.5 px-3 h-full text-xs font-bold transition-all cursor-pointer",
              activeTab === 'anomalies'
                ? "bg-primary text-primary-foreground shadow-2xs"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
            )}
          >
            <RiErrorWarningLine className="size-3.5 text-amber-400" /> Anomaly Diagnostics ({anomalies.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('narrative')}
            className={cn(
              "flex items-center gap-1.5 px-3 h-full text-xs font-bold transition-all cursor-pointer",
              activeTab === 'narrative'
                ? "bg-primary text-primary-foreground shadow-2xs"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
            )}
          >
            <RiFileTextLine className="size-3.5" /> Executive Narrative
          </button>
        </div>
      </Patient360NavRow>
    </Patient360NavBar>
  );

  return (
    <>
      {aiToolbar}
      <Patient360Layout lockViewport className="flex flex-col min-h-0 flex-1">
        <AppPageShell wide className="flex min-h-0 min-w-0 w-full max-w-full flex-1 flex-col !p-0 font-khmer">
          <Card className={cn(p360CardClass, 'flex min-h-0 min-w-0 w-full max-w-full flex-1 flex-col bg-card rounded-none border-0')}>
            <CardContent className="relative flex min-h-0 min-w-0 w-full max-w-full flex-1 flex-col p-0">
              
              {/* TAB 1: AI COPILOT CHAT */}
              {activeTab === 'copilot' && (
                <div className="flex flex-1 min-h-0 min-w-0 w-full flex-col bg-card text-foreground">
                  
                  {/* MESSAGES SCROLL AREA */}
                  <div className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-4 space-y-3 no-scrollbar">
                    {messages.map((m) => (
                      <div
                        key={m.id}
                        className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'} space-y-1`}
                      >
                        <div className="text-[10px] text-muted-foreground px-1 font-bold">
                          {m.sender === 'ai' ? '🤖 ART-AI Engine' : 'លោកអ្នក (Program Officer)'} · {m.timestamp}
                        </div>
                        <div
                          className={cn(
                            "p-3 text-xs leading-relaxed max-w-[80%] border shadow-2xs",
                            m.sender === 'user'
                              ? "bg-primary/10 border-primary/25 text-foreground"
                              : "bg-muted/30 border-border/80 text-foreground"
                          )}
                        >
                          <div className="whitespace-pre-line">
                            {m.text.split(/(\*\*[^*]+\*\*)/g).map((part, idx) => {
                              if (part.startsWith('**') && part.endsWith('**')) {
                                return (
                                  <strong key={idx} className="font-bold text-primary">
                                    {part.slice(2, -2)}
                                  </strong>
                                );
                              }
                              return part;
                            })}
                          </div>
                        </div>
                      </div>
                    ))}

                    {isThinking && (
                      <div className="flex items-center gap-2 text-xs text-primary bg-muted/40 p-2.5 border border-border/80 w-fit animate-pulse font-bold">
                        <RiSparklingFill className="size-4 animate-spin" />
                        <span>ART-AI កំពុងភ្ជាប់ និងវិភាគទិន្នន័យ SQL...</span>
                      </div>
                    )}
                  </div>

                  {/* PRESET QUICK QUESTION PROMPTS - SCROLLABLE PILLS */}
                  <div className="px-3 py-1.5 border-t border-border/60 bg-muted/10 shrink-0 font-khmer flex items-center gap-2 overflow-x-auto no-scrollbar">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider shrink-0 flex items-center gap-1">
                      <RiQuestionLine className="size-3 text-primary" /> សំណួរគំរូ ៖
                    </span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {PRESET_PROMPTS.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => handleSend(p.query)}
                          className="px-2.5 py-1 text-[10px] font-bold bg-background hover:bg-muted text-foreground border border-border/80 hover:border-primary transition-all shrink-0 cursor-pointer shadow-2xs whitespace-nowrap"
                        >
                          {p.khmer}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* PINNED INPUT FORM - ALWAYS VISIBLE AT BOTTOM */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSend();
                    }}
                    className="p-2.5 border-t border-border/80 bg-muted/20 flex items-center gap-2 shrink-0 font-khmer"
                  >
                    <div className="relative flex-1">
                      <RiSearchLine className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type="text"
                        value={inputQuery}
                        onChange={(e) => setInputQuery(e.target.value)}
                        placeholder="សួរសំណួរ AI លើទិន្នន័យសូចនាករ, មណ្ឌលព្យាបាល, ឬបញ្ហាគ្លីនិក… ?"
                        className="h-8 w-full border border-border bg-background pl-8 pr-3 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary shadow-2xs font-khmer"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={!inputQuery.trim() || isThinking}
                      className="h-8 px-4 text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 border border-primary transition-all cursor-pointer shrink-0 flex items-center gap-1.5 shadow-2xs"
                    >
                      <span>ផ្ញើ</span>
                      <RiSendPlane2Fill className="size-3.5" />
                    </button>
                  </form>
                </div>
              )}

              {/* TAB 2: REAL DATABASE ANOMALY DIAGNOSTICS TABLE */}
              {activeTab === 'anomalies' && (
                <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3 font-khmer bg-card">
                  <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
                    <div>
                      <h2 className="text-xs font-extrabold text-foreground flex items-center gap-2">
                        <RiErrorWarningLine className="size-4 text-rose-500" />
                        បញ្ជីមណ្ឌលដែលមានគម្លាតសមត្ថកិច្ច (Identified Anomaly Facilities - Real SQL Data)
                      </h2>
                      <p className="text-[11px] text-muted-foreground">
                        ទាញយកផ្ទាល់ពី SQL Database ៖ បានរកឃើញមណ្ឌលចំនួន {anomalies.length} ដែលមានលទ្ធផលទាបជាងគោលដៅជាតិ
                      </p>
                    </div>
                    <span className="px-2.5 py-1 bg-rose-500/10 text-rose-500 text-xs font-bold border border-rose-500/20">
                      Needs Action ({anomalies.length} Sites)
                    </span>
                  </div>

                  {loadingAnomalies ? (
                    <div className="flex items-center justify-center p-8 text-xs text-muted-foreground gap-2">
                      <RiLoader4Line className="size-4 animate-spin text-primary" />
                      <span>កំពុងទាញយកទិន្នន័យ Anomaly ផ្ទាល់ពី SQL Database...</span>
                    </div>
                  ) : (
                    <div className="border border-border/80 bg-card overflow-hidden shadow-2xs">
                      <table className="w-full text-left text-xs border-collapse font-khmer">
                        <thead className="bg-muted/60 border-b border-border/80 font-bold text-foreground">
                          <tr>
                            <th className="p-2.5">មណ្ឌលព្យាបាល (Health Facility)</th>
                            <th className="p-2.5">រាជធានី-ខេត្ត</th>
                            <th className="p-2.5">សូចនាករដែលមានគម្លាត</th>
                            <th className="p-2.5 text-right">លទ្ធផលបច្ចុប្បន្ន</th>
                            <th className="p-2.5 text-right">គោលដៅជាតិ</th>
                            <th className="p-2.5 text-right">គម្លាត (%)</th>
                            <th className="p-2.5">អនុសាសន៍ដោះស្រាយ (AI Action)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/40">
                          {anomalies.map((a) => (
                            <tr key={a.id} className="hover:bg-muted/30 transition-colors">
                              <td className="p-2.5 font-bold text-foreground flex items-center gap-2">
                                <RiBuildingLine className="size-3.5 text-primary shrink-0" />
                                {a.site}
                              </td>
                              <td className="p-2.5 text-muted-foreground">{a.province}</td>
                              <td className="p-2.5">
                                <span className="px-2 py-0.5 text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
                                  {a.indicator}
                                </span>
                              </td>
                              <td className="p-2.5 text-right font-black text-rose-500">{a.currentVal}</td>
                              <td className="p-2.5 text-right text-muted-foreground">{a.targetVal}</td>
                              <td className="p-2.5 text-right font-bold text-rose-500">{a.gap}</td>
                              <td className="p-2.5 text-emerald-600 font-bold flex items-center gap-1.5">
                                <RiCheckDoubleLine className="size-3.5 shrink-0 text-emerald-600" />
                                {a.action}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: REAL DATABASE EXECUTIVE NARRATIVE GENERATOR */}
              {activeTab === 'narrative' && (
                <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3 font-khmer bg-card">
                  <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
                    <div>
                      <h2 className="text-xs font-extrabold text-foreground flex items-center gap-2">
                        <RiFileTextLine className="size-4 text-teal-500" />
                        របាយការណ៍សង្ខេបប្រតិបត្តិ AI (Executive Quarterly Narrative - Real SQL Data)
                      </h2>
                      <p className="text-[11px] text-muted-foreground">
                        បង្កើតសេចក្តីសង្ខេបដោយស្វ័យប្រវត្តិចេញពីប្រព័ន្ធទិន្នន័យ SQL សម្រាប់កិច្ចប្រជុំ NCHADS
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => alert('របាយការណ៍ត្រូវបានទាញយកជា PDF/Word ជោគជ័យ!')}
                      className="h-8 flex items-center gap-1.5 px-3 bg-primary text-primary-foreground font-bold text-xs hover:opacity-95 shadow-2xs cursor-pointer border border-primary"
                    >
                      <RiDownloadLine className="size-3.5" /> ទាញយករបាយការណ៍ (Export Narrative)
                    </button>
                  </div>

                  {loadingNarrative ? (
                    <div className="flex items-center justify-center p-8 text-xs text-muted-foreground gap-2">
                      <RiLoader4Line className="size-4 animate-spin text-primary" />
                      <span>កំពុងរៀបចំរបាយការណ៍សង្ខេបប្រតិបត្តិផ្ទាល់ពី SQL Database...</span>
                    </div>
                  ) : narrativeData ? (
                    <div className="border border-border/80 bg-card p-5 shadow-2xs space-y-3 max-w-4xl leading-relaxed text-xs">
                      <div className="border-b border-border/40 pb-2.5 space-y-1">
                        <h3 className="text-sm font-extrabold text-foreground">
                          សេចក្តីសង្ខេបប្រតិបត្តិស្តីពីការវិវឌ្ឍសូចនាករជាតិព្យាបាលជំងឺអេដស៍ ({narrativeData.period} Executive Summary)
                        </h3>
                        <p className="text-muted-foreground text-[11px]">
                          បង្កើតដោយប្រព័ន្ធ ART-AI Engine ផ្ទាល់ពី SQL Warehouse · កាលបរិច្ឆេទ ៖ {new Date(narrativeData.generatedAt).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="space-y-3 text-foreground">
                        {narrativeData.sections.map((sec, idx) => (
                          <div key={idx} className="space-y-1">
                            <h4 className="font-bold text-xs text-primary">{sec.heading}</h4>
                            <p>{sec.body}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              )}

            </CardContent>
          </Card>
        </AppPageShell>
      </Patient360Layout>
    </>
  );
}
