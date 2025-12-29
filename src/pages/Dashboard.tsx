import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { fetchLeads, syncAllSources, type Lead } from '../api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

export default function Dashboard() {
    const { user, signOut } = useAuth();
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);

    useEffect(() => {
        loadLeads();
    }, []);

    const loadLeads = async () => {
        try {
            const data = await fetchLeads();
            setLeads(data);
        } catch (error) {
            console.error('Failed to load leads:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSync = async () => {
        setSyncing(true);
        try {
            await syncAllSources();
            await loadLeads();
        } catch (error) {
            console.error('Sync failed:', error);
        } finally {
            setSyncing(false);
        }
    };

    // Enhanced analytics calculations
    const stats = {
        total: leads.length,
        new: leads.filter(l => l.status === 'new').length,
        contacted: leads.filter(l => l.status === 'contacted').length,
        replied: leads.filter(l => l.status === 'replied').length,
        rejected: leads.filter(l => l.status === 'rejected').length,
        highScore: leads.filter(l => l.score >= 70).length,
        avgScore: leads.length > 0 ? Math.round(leads.reduce((acc, l) => acc + l.score, 0) / leads.length) : 0,
    };

    // Advanced metrics
    const conversionRate = stats.total > 0 ? ((stats.replied / stats.total) * 100) : 0;
    const responseRate = stats.contacted > 0 ? ((stats.replied / stats.contacted) * 100) : 0;
    const qualityScore = stats.total > 0 ? ((stats.highScore / stats.total) * 100) : 0;
    const pipelineHealth = stats.total > 0 ? (((stats.new + stats.contacted) / stats.total) * 100) : 0;

    // Source performance data
    const sourceData = [
        { 
            name: 'Product Hunt', 
            leads: leads.filter(l => l.source === 'producthunt').length,
            avgScore: leads.filter(l => l.source === 'producthunt').length > 0 
                ? Math.round(leads.filter(l => l.source === 'producthunt').reduce((acc, l) => acc + l.score, 0) / leads.filter(l => l.source === 'producthunt').length)
                : 0,
            replies: leads.filter(l => l.source === 'producthunt' && l.status === 'replied').length
        },
        { 
            name: 'Indie Hackers', 
            leads: leads.filter(l => l.source === 'indiehackers').length,
            avgScore: leads.filter(l => l.source === 'indiehackers').length > 0 
                ? Math.round(leads.filter(l => l.source === 'indiehackers').reduce((acc, l) => acc + l.score, 0) / leads.filter(l => l.source === 'indiehackers').length)
                : 0,
            replies: leads.filter(l => l.source === 'indiehackers' && l.status === 'replied').length
        },
        { 
            name: 'GitHub', 
            leads: leads.filter(l => l.source === 'github').length,
            avgScore: leads.filter(l => l.source === 'github').length > 0 
                ? Math.round(leads.filter(l => l.source === 'github').reduce((acc, l) => acc + l.score, 0) / leads.filter(l => l.source === 'github').length)
                : 0,
            replies: leads.filter(l => l.source === 'github' && l.status === 'replied').length
        }
    ].filter(s => s.leads > 0);

    // Pipeline flow data
    const pipelineData = [
        { stage: 'New', count: stats.new, percentage: stats.total > 0 ? (stats.new / stats.total * 100) : 0 },
        { stage: 'Contacted', count: stats.contacted, percentage: stats.total > 0 ? (stats.contacted / stats.total * 100) : 0 },
        { stage: 'Replied', count: stats.replied, percentage: stats.total > 0 ? (stats.replied / stats.total * 100) : 0 },
        { stage: 'Rejected', count: stats.rejected, percentage: stats.total > 0 ? (stats.rejected / stats.total * 100) : 0 }
    ];

    // Top performing leads
    const topLeads = leads
        .filter(l => l.score >= 70)
        .sort((a, b) => b.score - a.score)
        .slice(0, 3);

    // Action items
    const actionItems = [
        { 
            title: 'High-intent leads to contact', 
            count: leads.filter(l => l.status === 'new' && l.score >= 70).length,
            action: 'Contact now',
            priority: 'high'
        },
        { 
            title: 'Follow-ups needed', 
            count: leads.filter(l => l.status === 'contacted').length,
            action: 'Follow up',
            priority: 'medium'
        },
        { 
            title: 'Low-quality leads to review', 
            count: leads.filter(l => l.score < 40).length,
            action: 'Review',
            priority: 'low'
        }
    ].filter(item => item.count > 0);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Minimal Header */}
            <header className="bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <span className="font-semibold text-lg">Lead Radar</span>
                        <nav className="flex gap-6 text-sm">
                            <Link to="/dashboard" className="text-gray-900 font-medium">Dashboard</Link>
                            <Link to="/leads" className="text-gray-600 hover:text-gray-900 transition-colors">Leads</Link>
                        </nav>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleSync}
                            disabled={syncing}
                            className="px-3 py-1.5 bg-gray-900 text-white rounded-md text-sm hover:bg-gray-800 disabled:opacity-50 transition-colors"
                        >
                            {syncing ? 'Syncing...' : 'Sync'}
                        </button>
                        <div className="flex items-center gap-3 text-sm">
                            <span className="text-gray-500">{user?.email}</span>
                            <button onClick={signOut} className="text-gray-400 hover:text-gray-600 transition-colors">
                                Sign out
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-6">
                {loading ? (
                    <div className="py-32 text-center">
                        <div className="inline-block w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                        <p className="mt-4 text-gray-500">Loading dashboard...</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Key Metrics */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="bg-white p-5 rounded-xl border border-gray-100 hover:shadow-sm transition-shadow">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Total Leads</p>
                                        <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
                                    </div>
                                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                                        <div className="w-5 h-5 bg-blue-500 rounded"></div>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 mt-3">Pipeline health: {pipelineHealth.toFixed(0)}%</p>
                            </div>

                            <div className="bg-white p-5 rounded-xl border border-gray-100 hover:shadow-sm transition-shadow">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">High Intent</p>
                                        <p className="text-2xl font-bold text-emerald-600 mt-1">{stats.highScore}</p>
                                    </div>
                                    <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
                                        <div className="w-5 h-5 bg-emerald-500 rounded"></div>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 mt-3">Quality: {qualityScore.toFixed(0)}%</p>
                            </div>

                            <div className="bg-white p-5 rounded-xl border border-gray-100 hover:shadow-sm transition-shadow">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Conversion</p>
                                        <p className="text-2xl font-bold text-purple-600 mt-1">{conversionRate.toFixed(1)}%</p>
                                    </div>
                                    <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                                        <div className="w-5 h-5 bg-purple-500 rounded"></div>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 mt-3">Response: {responseRate.toFixed(0)}%</p>
                            </div>

                            <div className="bg-white p-5 rounded-xl border border-gray-100 hover:shadow-sm transition-shadow">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Avg Score</p>
                                        <p className="text-2xl font-bold text-orange-600 mt-1">{stats.avgScore}</p>
                                    </div>
                                    <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
                                        <div className="w-5 h-5 bg-orange-500 rounded"></div>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 mt-3">Out of 100</p>
                            </div>
                        </div>

                        {/* Action Items */}
                        {actionItems.length > 0 && (
                            <div className="bg-white rounded-xl border border-gray-100 p-6">
                                <h3 className="font-semibold text-gray-900 mb-4">Action Items</h3>
                                <div className="grid gap-3">
                                    {actionItems.map((item, index) => (
                                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-2 h-2 rounded-full ${
                                                    item.priority === 'high' ? 'bg-red-500' : 
                                                    item.priority === 'medium' ? 'bg-yellow-500' : 'bg-gray-400'
                                                }`}></div>
                                                <span className="text-sm font-medium text-gray-900">{item.title}</span>
                                                <span className="text-sm text-gray-500">({item.count})</span>
                                            </div>
                                            <Link 
                                                to="/leads" 
                                                className="text-xs px-3 py-1 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors"
                                            >
                                                {item.action}
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="grid lg:grid-cols-2 gap-6">
                            {/* Pipeline Flow */}
                            <div className="bg-white rounded-xl border border-gray-100 p-6">
                                <h3 className="font-semibold text-gray-900 mb-4">Pipeline Flow</h3>
                                {pipelineData.some(d => d.count > 0) ? (
                                    <ResponsiveContainer width="100%" height={200}>
                                        <BarChart data={pipelineData} layout="horizontal">
                                            <XAxis type="number" tick={{ fontSize: 12 }} />
                                            <YAxis dataKey="stage" type="category" tick={{ fontSize: 12 }} width={80} />
                                            <Tooltip formatter={(value, name) => [value, name === 'count' ? 'Leads' : name]} />
                                            <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-48 flex items-center justify-center text-gray-400">
                                        No pipeline data yet
                                    </div>
                                )}
                            </div>

                            {/* Source Performance */}
                            <div className="bg-white rounded-xl border border-gray-100 p-6">
                                <h3 className="font-semibold text-gray-900 mb-4">Source Performance</h3>
                                {sourceData.length > 0 ? (
                                    <div className="space-y-4">
                                        {sourceData.map((source, index) => (
                                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                <div>
                                                    <p className="font-medium text-gray-900">{source.name}</p>
                                                    <p className="text-sm text-gray-500">{source.leads} leads • Avg score: {source.avgScore}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-semibold text-gray-900">{source.replies}</p>
                                                    <p className="text-xs text-gray-500">replies</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="h-48 flex items-center justify-center text-gray-400">
                                        No source data yet
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Top Performing Leads */}
                        {topLeads.length > 0 && (
                            <div className="bg-white rounded-xl border border-gray-100 p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-semibold text-gray-900">Top Performing Leads</h3>
                                    <Link to="/leads" className="text-sm text-blue-600 hover:text-blue-700 transition-colors">
                                        View all →
                                    </Link>
                                </div>
                                <div className="grid gap-3">
                                    {topLeads.map(lead => (
                                        <div key={lead.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-900">{lead.product_name}</p>
                                                <p className="text-sm text-gray-600 mt-1 line-clamp-1">{lead.tagline}</p>
                                            </div>
                                            <div className="flex items-center gap-3 ml-4">
                                                <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded">
                                                    {lead.score}
                                                </span>
                                                <span className="text-xs text-gray-400 uppercase font-medium">
                                                    {lead.source === 'producthunt' ? 'PH' : lead.source === 'indiehackers' ? 'IH' : 'GH'}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}
