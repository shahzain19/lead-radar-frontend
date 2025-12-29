import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
    fetchLeads,
    syncAllSources,
    syncProductHunt,
    syncIndieHackers,
    syncGitHub,
    syncReddit,
    updateLead,
    batchUpdateLeads,
    analyzeLeadWithAI,
    generateOutreach,
    exportToCSV,
    type Lead,
    type LeadSource,
    type LeadAnalysis,
    type OutreachDraft
} from '../api';
import { LeadRow } from '../components/leads/LeadRow';
import { LeadsToolbar } from '../components/leads/LeadsToolbar';


export default function Leads() {
    const { user, signOut } = useAuth();
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState<string | null>(null);
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [filterSource, setFilterSource] = useState<LeadSource>('all');
    const [highScoreOnly, setHighScoreOnly] = useState(false);
    const [selectedLeads, setSelectedLeads] = useState<string[]>([]);

    // UI State
    const [expandedLeadId, setExpandedLeadId] = useState<string | null>(null);

    // AI States
    const [activeAiLead, setActiveAiLead] = useState<string | null>(null);
    const [analysisResult, setAnalysisResult] = useState<LeadAnalysis | null>(null);
    const [draftResult, setDraftResult] = useState<OutreachDraft | null>(null);
    const [aiActionType, setAiActionType] = useState<'analyze' | 'draft' | null>(null);

    const loadLeads = async () => {
        setLoading(true);
        try {
            const data = await fetchLeads(
                highScoreOnly ? 70 : undefined,
                filterStatus === 'all' ? undefined : filterStatus,
                filterSource
            );
            setLeads(data);
        } catch (error) {
            console.error('Failed to fetch leads:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSync = async (source: string) => {
        setSyncing(source);
        try {
            switch (source) {
                case 'all': await syncAllSources(); break;
                case 'producthunt': await syncProductHunt(); break;
                case 'indiehackers': await syncIndieHackers(); break;
                case 'github': await syncGitHub(); break;
                case 'reddit': await syncReddit(); break;
            }
            await loadLeads();
        } catch (error) {
            console.error('Sync failed:', error);
        } finally {
            setSyncing(null);
        }
    };

    useEffect(() => {
        loadLeads();
    }, [filterStatus, filterSource, highScoreOnly]);

    const handleStatusUpdate = async (id: string, status: string) => {
        setLeads(current => current.map(l => l.id === id ? { ...l, status: status as any } : l));
        try {
            await updateLead(id, { status });
        } catch (error) {
            console.error('Update failed:', error);
            // Revert on failure could go here
        }
    };

    const handleNotesUpdate = async (id: string, notes: string) => {
        setLeads(current => current.map(l => l.id === id ? { ...l, notes } : l));
        try {
            await updateLead(id, { notes });
        } catch (error) {
            console.error('Notes update failed:', error);
        }
    };

    const handleBatchAction = async (status: string) => {
        try {
            await batchUpdateLeads(selectedLeads, status);
            await loadLeads();
            setSelectedLeads([]);
        } catch (error) {
            console.error('Batch update failed:', error);
        }
    };

    const handleAnalyze = async (leadId: string) => {
        setActiveAiLead(leadId);
        setAiActionType('analyze');
        setAnalysisResult(null);
        try {
            const result = await analyzeLeadWithAI(leadId);
            setAnalysisResult(result);
        } catch (error) {
            console.error('Analysis failed:', error);
        } finally {
            if (activeAiLead === leadId && aiActionType === 'analyze') {
                // Optimization: Keep the result but stop loading
            }
        }
    };

    const handleGenerateDraft = async (leadId: string, channel: 'email' | 'twitter' | 'linkedin') => {
        setActiveAiLead(leadId);
        setAiActionType('draft');
        setDraftResult(null);
        try {
            const result = await generateOutreach(leadId, channel);
            setDraftResult(result);
        } catch (error) {
            console.error('Draft generation failed:', error);
        }
    };

    const toggleSelect = (id: string) => {
        setSelectedLeads(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const selectAll = () => {
        if (selectedLeads.length === leads.length) {
            setSelectedLeads([]);
        } else {
            setSelectedLeads(leads.map(l => l.id));
        }
    };

    return (
        <div className="min-h-screen">
            {/* Header */}
            <header className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <span className="text-lg font-bold tracking-tight text-gray-900">Lead Radar 📡</span>
                        <nav className="flex gap-6 text-sm font-medium">
                            <Link to="/dashboard" className="text-gray-500 hover:text-gray-900 transition-colors">Dashboard</Link>
                            <Link to="/leads" className="text-gray-900">Leads</Link>
                        </nav>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-500 hidden md:block">{user?.email}</span>
                        <button onClick={signOut} className="text-sm px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                            Sign out
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-8">

                <LeadsToolbar
                    selectedCount={selectedLeads.length}
                    filterSource={filterSource}
                    onFilterSourceChange={setFilterSource}
                    filterStatus={filterStatus}
                    onFilterStatusChange={setFilterStatus}
                    highScoreOnly={highScoreOnly}
                    onHighScoreOnlyChange={setHighScoreOnly}
                    syncing={syncing}
                    onSync={handleSync}
                    onBatchAction={handleBatchAction}
                    onClearSelection={() => setSelectedLeads([])}
                />

                {/* Main Content Area */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    {/* Table Header */}
                    <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-gray-50/80 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        <div className="col-span-1 flex items-center">
                            <input type="checkbox" checked={leads.length > 0 && selectedLeads.length === leads.length} onChange={selectAll} className="rounded border-gray-300" />
                        </div>
                        <div className="col-span-3">Product / Tagline</div>
                        <div className="col-span-2">Links</div>
                        <div className="col-span-1">Source</div>
                        <div className="col-span-1">Score</div>
                        <div className="col-span-2">Status</div>
                        <div className="col-span-1">Launch</div>
                        <div className="col-span-1">Traction</div>
                    </div>

                    {/* Table Body */}
                    {loading ? (
                        <div className="p-12 text-center text-gray-400">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-2"></div>
                            <p>Loading your leads...</p>
                        </div>
                    ) : leads.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="inline-flex justify-center items-center w-16 h-16 rounded-full bg-gray-100 mb-4 text-3xl">📭</div>
                            <h3 className="text-lg font-medium text-gray-900">No leads found</h3>
                            <p className="text-gray-500 mb-4">Try adjusting your filters or syncing new leads.</p>
                            <button onClick={() => handleSync('all')} className="text-blue-600 font-medium hover:underline">Sync All Sources</button>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {leads.map(lead => (
                                <LeadRow
                                    key={lead.id}
                                    lead={lead}
                                    isSelected={selectedLeads.includes(lead.id)}
                                    isExpanded={expandedLeadId === lead.id}
                                    onToggleSelect={toggleSelect}
                                    onToggleExpand={(id) => setExpandedLeadId(expandedLeadId === id ? null : id)}
                                    onStatusUpdate={handleStatusUpdate}
                                    onNotesUpdate={handleNotesUpdate}
                                    onAnalyze={handleAnalyze}
                                    onGenerateDraft={handleGenerateDraft}
                                    analyzing={activeAiLead === lead.id && aiActionType === 'analyze' && !analysisResult}
                                    analysisResult={activeAiLead === lead.id ? analysisResult : null}
                                    generatingDraft={activeAiLead === lead.id && aiActionType === 'draft' && !draftResult}
                                    draftResult={activeAiLead === lead.id ? draftResult : null}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer Stats */}
                <div className="mt-4 flex justify-between text-xs text-gray-400 px-2">
                    <span>Showing {leads.length} leads</span>
                    <button onClick={() => exportToCSV(leads)} className="hover:text-gray-600 transition-colors">Download CSV</button>
                </div>
            </main>
        </div>
    );
}
