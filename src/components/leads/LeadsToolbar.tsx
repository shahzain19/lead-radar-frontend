import type { LeadSource } from '../../api';

interface LeadsToolbarProps {
    selectedCount: number;
    filterSource: LeadSource;
    onFilterSourceChange: (source: LeadSource) => void;
    filterStatus: string;
    onFilterStatusChange: (status: string) => void;
    highScoreOnly: boolean;
    onHighScoreOnlyChange: (enabled: boolean) => void;
    syncing: string | null;
    onSync: (source: string) => void;
    onBatchAction: (action: string) => void;
    onClearSelection: () => void;
}

export function LeadsToolbar({
    selectedCount,
    filterSource,
    onFilterSourceChange,
    filterStatus,
    onFilterStatusChange,
    highScoreOnly,
    onHighScoreOnlyChange,
    syncing,
    onSync,
    onBatchAction,
    onClearSelection
}: LeadsToolbarProps) {
    return (
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Leads CRM</h1>

            {selectedCount > 0 ? (
                <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 animate-in fade-in slide-in-from-right-4">
                    <span className="text-sm font-medium text-blue-900 mr-2">{selectedCount} selected</span>
                    <div className="h-4 w-px bg-blue-200 mx-1"></div>
                    <button onClick={() => onBatchAction('contacted')} className="px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100 rounded transition-colors">Mark Contacted</button>
                    <button onClick={() => onBatchAction('replied')} className="px-2 py-1 text-xs font-medium text-green-700 hover:bg-green-100 rounded transition-colors">Replied</button>
                    <button onClick={() => onBatchAction('rejected')} className="px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-100 rounded transition-colors">Reject</button>
                    <button onClick={onClearSelection} className="ml-2 text-xs text-blue-400 hover:text-blue-600">Cancel</button>
                </div>
            ) : (
                <div className="flex items-center gap-3">
                    <select
                        value={filterStatus}
                        onChange={(e) => onFilterStatusChange(e.target.value)}
                        className="px-3 py-2 text-sm font-medium border border-gray-200 rounded-lg bg-white cursor-pointer hover:border-blue-300 focus:ring-2 focus:ring-blue-100 outline-none"
                    >
                        <option value="all">All Statuses</option>
                        <option value="new">New</option>
                        <option value="contacted">Contacted</option>
                        <option value="replied">Replied</option>
                        <option value="rejected">Rejected</option>
                    </select>

                    {/* Filter Group */}
                    <div className="flex items-center bg-white border border-gray-200 rounded-lg p-1 shadow-sm">
                        {(['all', 'producthunt', 'indiehackers', 'github', 'reddit'] as LeadSource[]).map(s => (
                            <button
                                key={s}
                                onClick={() => onFilterSourceChange(s)}
                                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${filterSource === s
                                        ? 'bg-gray-900 text-white shadow-sm'
                                        : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={() => onHighScoreOnlyChange(!highScoreOnly)}
                        className={`px-3 py-2 text-xs font-medium border rounded-lg transition-colors ${highScoreOnly
                                ? 'bg-green-50 border-green-200 text-green-700'
                                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        High Score (70+)
                    </button>

                    <div className="h-6 w-px bg-gray-300 mx-2"></div>

                    <select
                        value={syncing || ''}
                        onChange={(e) => e.target.value && onSync(e.target.value)}
                        disabled={!!syncing}
                        className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white cursor-pointer hover:border-blue-300 focus:ring-2 focus:ring-blue-100 outline-none"
                    >
                        <option value="">{syncing ? `Syncing ${syncing}...` : '⚡ Sync Leads'}</option>
                        <option value="all">Everything</option>
                        <option value="producthunt">Product Hunt</option>
                        <option value="indiehackers">Indie Hackers</option>
                        <option value="github">GitHub</option>
                        <option value="reddit">Reddit</option>
                    </select>
                </div>
            )}
        </div>
    );
}
