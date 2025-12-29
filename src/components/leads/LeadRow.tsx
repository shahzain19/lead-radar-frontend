import { useState, memo, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import type { Lead, LeadAnalysis, OutreachDraft, ScoreBreakdown, DuplicateInfo } from '../../api';
import { getScoreBreakdown, getDuplicateLeads, getPossibleEmails } from '../../api';

interface LeadRowProps {
    lead: Lead;
    isSelected: boolean;
    isExpanded: boolean;
    onToggleSelect: (id: string) => void;
    onToggleExpand: (id: string) => void;
    onStatusUpdate: (id: string, status: string) => void;
    onNotesUpdate: (id: string, notes: string) => void;
    onAnalyze: (id: string) => void;
    onGenerateDraft: (id: string, channel: 'email' | 'twitter' | 'linkedin') => void;
    analyzing: boolean;
    analysisResult: LeadAnalysis | null;
    generatingDraft: boolean;
    draftResult: OutreachDraft | null;
}

export const LeadRow = memo(({
    lead,
    isSelected,
    isExpanded,
    onToggleSelect,
    onToggleExpand,
    onStatusUpdate,
    onNotesUpdate,
    onAnalyze,
    onGenerateDraft,
    analyzing,
    analysisResult,
    generatingDraft,
    draftResult
}: LeadRowProps) => {
    const [editingNotes, setEditingNotes] = useState(false);
    const [scoreBreakdown, setScoreBreakdown] = useState<ScoreBreakdown | null>(null);
    const [loadingBreakdown, setLoadingBreakdown] = useState(false);
    const [duplicateInfo, setDuplicateInfo] = useState<DuplicateInfo | null>(null);
    const [loadingDuplicates, setLoadingDuplicates] = useState(false);
    const [possibleEmails, setPossibleEmails] = useState<string[]>([]);
    const [loadingEmails, setLoadingEmails] = useState(false);

    // Load score breakdown when expanded
    useEffect(() => {
        if (isExpanded && !scoreBreakdown && !loadingBreakdown) {
            setLoadingBreakdown(true);
            getScoreBreakdown(lead.id)
                .then(setScoreBreakdown)
                .catch(console.error)
                .finally(() => setLoadingBreakdown(false));
        }
    }, [isExpanded, lead.id, scoreBreakdown, loadingBreakdown]);

    // Load duplicates when expanded
    useEffect(() => {
        if (isExpanded && !duplicateInfo && !loadingDuplicates) {
            setLoadingDuplicates(true);
            getDuplicateLeads(lead.id)
                .then(setDuplicateInfo)
                .catch(console.error)
                .finally(() => setLoadingDuplicates(false));
        }
    }, [isExpanded, lead.id, duplicateInfo, loadingDuplicates]);

    // Load emails when expanded
    useEffect(() => {
        if (isExpanded && possibleEmails.length === 0 && !loadingEmails) {
            setLoadingEmails(true);
            getPossibleEmails(lead.id)
                .then(data => setPossibleEmails(data.emails))
                .catch(console.error)
                .finally(() => setLoadingEmails(false));
        }
    }, [isExpanded, lead.id, possibleEmails.length, loadingEmails]);

    const sourceLabel = (source: string) => {
        switch (source) {
            case 'producthunt': return 'PH';
            case 'indiehackers': return 'IH';
            case 'github': return 'GH';
            case 'reddit': return 'RD';
            default: return source.substring(0, 2).toUpperCase();
        }
    };

    const statusColor = (status: string) => {
        switch (status) {
            case 'new': return 'bg-blue-100 text-blue-700';
            case 'contacted': return 'bg-yellow-100 text-yellow-700';
            case 'replied': return 'bg-green-100 text-green-700';
            case 'rejected': return 'bg-gray-100 text-gray-500 line-through';
            default: return 'bg-gray-100 text-gray-600';
        }
    };

    return (
        <div className="group border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
            <div
                className={`grid grid-cols-12 gap-4 px-4 py-3 items-center cursor-pointer ${isSelected ? 'bg-blue-50' : ''}`}
                onClick={() => onToggleExpand(lead.id)}
            >
                {/* Checkbox */}
                <div className="col-span-1 flex items-center" onClick={(e) => e.stopPropagation()}>
                    <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggleSelect(lead.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                </div>

                {/* Product Name & Tagline */}
                <div className="col-span-3 overflow-hidden">
                    <div className="font-medium text-gray-900 truncate" title={lead.product_name}>
                        {lead.product_name}
                    </div>
                    <div className="text-xs text-gray-500 truncate" title={lead.tagline}>
                        {lead.tagline}
                    </div>
                </div>

                {/* Links (New Column) */}
                <div className="col-span-2 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    {lead.website && (
                        <a
                            href={lead.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                            title="Visit Website"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                        </a>
                    )}
                    {(lead.social_links?.reddit_post || lead.social_links?.reddit) && (
                        <>
                            <a 
                                href={lead.social_links.reddit_post || lead.social_links.reddit || '#'} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="p-1.5 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-full transition-colors" 
                                title="Reddit Post"
                            >
                                <span className="text-xs font-bold">Post</span>
                            </a>
                            {lead.social_links.author && (
                                <a 
                                    href={`https://www.reddit.com/user/${lead.social_links.author}`} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="p-1.5 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-full transition-colors" 
                                    title={`Author: u/${lead.social_links.author}`}
                                >
                                    <span className="text-xs font-bold">u/</span>
                                </a>
                            )}
                            {lead.social_links.subreddit && (
                                <a 
                                    href={`https://www.reddit.com/r/${lead.social_links.subreddit}`} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="p-1.5 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-full transition-colors" 
                                    title={`Subreddit: r/${lead.social_links.subreddit}`}
                                >
                                    <span className="text-xs font-bold">r/</span>
                                </a>
                            )}
                        </>
                    )}
                    {lead.social_links?.product_hunt && (
                        <a href={lead.social_links.product_hunt} target="_blank" rel="noopener noreferrer" className="p-1.5 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-full transition-colors" title="Product Hunt">
                            <span className="text-xs font-bold">PH</span>
                        </a>
                    )}
                    {lead.social_links?.github && (
                        <a href={lead.social_links.github} target="_blank" rel="noopener noreferrer" className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors" title="GitHub Repo">
                            <span className="text-xs font-bold">GH</span>
                        </a>
                    )}
                </div>

                {/* Source */}
                <div className="col-span-1">
                    <span className="text-xs font-mono text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                        {sourceLabel(lead.source)}
                    </span>
                </div>

                {/* Score */}
                <div className="col-span-1">
                    <div className={`text-xs font-bold px-2 py-1 rounded inline-block ${lead.score >= 70 ? 'bg-green-100 text-green-700' :
                            lead.score >= 40 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'
                        }`}>
                        {lead.score}
                    </div>
                </div>

                {/* Status Selector */}
                <div className="col-span-2" onClick={(e) => e.stopPropagation()}>
                    <select
                        value={lead.status}
                        onChange={(e) => onStatusUpdate(lead.id, e.target.value)}
                        className={`text-xs w-full px-2 py-1.5 rounded border-0 cursor-pointer font-medium focus:ring-2 focus:ring-blue-100 transition-colors ${statusColor(lead.status)}`}
                    >
                        <option value="new">New</option>
                        <option value="contacted">Contacted</option>
                        <option value="replied">Replied</option>
                        <option value="rejected">Rejected</option>
                    </select>
                </div>

                {/* Date */}
                <div className="col-span-1 text-xs text-gray-500">
                    {formatDistanceToNow(new Date(lead.launch_date))}
                </div>

                {/* Upvotes */}
                <div className="col-span-1 text-xs font-medium text-gray-600">
                    👍 {lead.upvotes}
                </div>
            </div>

            {/* Expanded Content */}
            {isExpanded && (
                <div className="px-4 py-4 bg-gray-50 border-t border-gray-100 grid grid-cols-2 gap-6 animate-in slide-in-from-top-2 duration-200">
                    <div className="space-y-4">
                        {/* AI Actions */}
                        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">AI Analysis</h3>
                                {!analysisResult && (
                                    <button
                                        onClick={() => onAnalyze(lead.id)}
                                        disabled={analyzing}
                                        className="text-xs bg-purple-600 text-white px-3 py-1.5 rounded-md hover:bg-purple-700 disabled:opacity-50 transition-colors"
                                    >
                                        {analyzing ? 'Analyzing...' : 'Run Analysis'}
                                    </button>
                                )}
                            </div>

                            {analysisResult ? (
                                <div className="space-y-3 text-sm">
                                    <p className="text-gray-700 leading-relaxed">{analysisResult.summary}</p>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-red-50 p-2.5 rounded border border-red-100">
                                            <strong className="text-xs text-red-800 uppercase block mb-1">Pain Points</strong>
                                            <ul className="text-xs text-red-700 space-y-1 list-disc list-inside">
                                                {analysisResult.painPoints.slice(0, 3).map((p, i) => <li key={i}>{p}</li>)}
                                            </ul>
                                        </div>
                                        <div className="bg-green-50 p-2.5 rounded border border-green-100">
                                            <strong className="text-xs text-green-800 uppercase block mb-1">Outreach Angle</strong>
                                            <p className="text-xs text-green-700">{analysisResult.outreachAngle}</p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-6 text-gray-400 text-sm bg-gray-50/50 rounded border border-dashed border-gray-200">
                                    Run AI analysis to uncover pain points & strategy.
                                </div>
                            )}
                        </div>

                        {/* Outreach Writer */}
                        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">Outreach Writer</h3>
                            {!draftResult ? (
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        onClick={() => onGenerateDraft(lead.id, 'email')}
                                        disabled={generatingDraft}
                                        className="py-2 text-xs font-medium border border-gray-200 rounded hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 transition-colors"
                                    >
                                        Draft Email
                                    </button>
                                    <button
                                        onClick={() => onGenerateDraft(lead.id, 'twitter')}
                                        disabled={generatingDraft}
                                        className="py-2 text-xs font-medium border border-gray-200 rounded hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 transition-colors"
                                    >
                                        Draft DM
                                    </button>
                                </div>
                            ) : (
                                <div className="bg-gray-50 p-3 rounded text-sm font-mono text-gray-700 whitespace-pre-wrap border border-gray-200">
                                    {draftResult.channel === 'email' && <div className="mb-2 font-bold text-gray-900 border-b border-gray-200 pb-2">Subject: {draftResult.subject}</div>}
                                    {draftResult.body}
                                    <button onClick={() => { navigator.clipboard.writeText(draftResult.body); alert('Copied!') }} className="block w-full mt-3 py-1.5 text-center text-xs bg-white border border-gray-200 rounded text-gray-600 hover:text-blue-600 hover:border-blue-200 transition-colors">Copy to Clipboard</button>
                                </div>
                            )}
                            {generatingDraft && <p className="text-center text-xs text-gray-400 mt-2 animate-pulse">Writing draft...</p>}
                        </div>
                    </div>

                    <div className="space-y-4">
                        {/* Quick Links */}
                        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-3">Quick Links</h4>
                            <div className="space-y-2">
                                {lead.website && (
                                    <a
                                        href={lead.website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 hover:underline"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                        <span className="truncate">{lead.website}</span>
                                    </a>
                                )}
                                {(lead.social_links?.reddit_post || lead.social_links?.reddit) && (
                                    <a
                                        href={lead.social_links.reddit_post || lead.social_links.reddit || '#'}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 text-sm text-orange-600 hover:text-orange-800 hover:underline"
                                    >
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249z"/></svg>
                                        <span>Reddit Post</span>
                                    </a>
                                )}
                                {lead.social_links?.author && (
                                    <a
                                        href={`https://www.reddit.com/user/${lead.social_links.author}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 text-sm text-orange-600 hover:text-orange-800 hover:underline"
                                    >
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249z"/></svg>
                                        <span>Author: u/{lead.social_links.author}</span>
                                    </a>
                                )}
                                {lead.social_links?.subreddit && (
                                    <a
                                        href={`https://www.reddit.com/r/${lead.social_links.subreddit}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 text-sm text-orange-600 hover:text-orange-800 hover:underline"
                                    >
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249z"/></svg>
                                        <span>Subreddit: r/{lead.social_links.subreddit}</span>
                                    </a>
                                )}
                                {lead.social_links?.product_hunt && (
                                    <a
                                        href={lead.social_links.product_hunt}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 text-sm text-orange-500 hover:text-orange-700 hover:underline"
                                    >
                                        <span className="font-bold">PH</span>
                                        <span>Product Hunt</span>
                                    </a>
                                )}
                                {lead.social_links?.github && (
                                    <a
                                        href={lead.social_links.github}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900 hover:underline"
                                    >
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                                        <span>GitHub Repository</span>
                                    </a>
                                )}
                                {lead.social_links?.indie_hackers && (
                                    <a
                                        href={lead.social_links.indie_hackers}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 text-sm text-purple-600 hover:text-purple-800 hover:underline"
                                    >
                                        <span className="font-bold">IH</span>
                                        <span>Indie Hackers</span>
                                    </a>
                                )}
                                {lead.social_links?.extracted_links && lead.social_links.extracted_links.length > 0 && (
                                    <div className="pt-2 border-t border-gray-200">
                                        <div className="text-xs font-semibold text-gray-500 uppercase mb-2">Extracted Links</div>
                                        {lead.social_links.extracted_links.map((link, i) => (
                                            <a
                                                key={i}
                                                href={link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="block text-xs text-blue-600 hover:text-blue-800 hover:underline truncate mb-1"
                                            >
                                                {link}
                                            </a>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Score Breakdown */}
                        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-3">Score Breakdown</h4>
                            {loadingBreakdown ? (
                                <div className="text-xs text-gray-400">Loading...</div>
                            ) : scoreBreakdown ? (
                                <div className="space-y-2">
                                    <div className="text-sm font-bold text-gray-900 mb-2">
                                        Total Score: {scoreBreakdown.total}
                                    </div>
                                    {scoreBreakdown.factors.map((factor, i) => (
                                        <div key={i} className="flex items-start justify-between text-xs border-b border-gray-100 pb-2">
                                            <div className="flex-1">
                                                <div className="font-medium text-gray-700">{factor.name}</div>
                                                <div className="text-gray-500 text-xs mt-0.5">{factor.reason}</div>
                                            </div>
                                            <div className={`ml-2 font-bold ${factor.points > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                {factor.points > 0 ? '+' : ''}{factor.points}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-xs text-gray-400">Click to load score breakdown</div>
                            )}
                        </div>

                        {/* Duplicate Detection */}
                        {duplicateInfo && duplicateInfo.isDuplicate && duplicateInfo.duplicates.length > 0 && (
                            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 shadow-sm">
                                <h4 className="text-xs font-semibold text-yellow-800 uppercase mb-2">⚠️ Duplicate Leads Found</h4>
                                <div className="text-xs text-yellow-700 space-y-1">
                                    <p className="mb-2">This lead appears in {duplicateInfo.duplicates.length} other source(s):</p>
                                    {duplicateInfo.duplicates.map((dup) => (
                                        <div key={dup.id} className="bg-white p-2 rounded border border-yellow-200 mb-1">
                                            <div className="font-medium">{dup.product_name}</div>
                                            <div className="text-gray-600">Source: {dup.source} • Score: {dup.score}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Possible Emails */}
                        {possibleEmails.length > 0 && (
                            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                                <h4 className="text-xs font-semibold text-gray-500 uppercase mb-3">Possible Email Addresses</h4>
                                <div className="space-y-1">
                                    {possibleEmails.map((email, i) => (
                                        <div key={i} className="flex items-center justify-between text-xs">
                                            <a
                                                href={`mailto:${email}`}
                                                className="text-blue-600 hover:text-blue-800 hover:underline"
                                            >
                                                {email}
                                            </a>
                                            <button
                                                onClick={() => {
                                                    navigator.clipboard.writeText(email);
                                                    alert('Email copied!');
                                                }}
                                                className="text-gray-400 hover:text-gray-600"
                                                title="Copy email"
                                            >
                                                📋
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Notes */}
                        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden h-full flex flex-col">
                            <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                                <h4 className="text-xs font-semibold text-gray-500 uppercase">Notes</h4>
                                <button onClick={() => setEditingNotes(!editingNotes)} className="text-xs text-blue-600 hover:text-blue-800">
                                    {editingNotes ? 'Done' : 'Edit'}
                                </button>
                            </div>
                            {editingNotes ? (
                                <textarea
                                    autoFocus
                                    defaultValue={lead.notes || ''}
                                    onBlur={(e) => {
                                        onNotesUpdate(lead.id, e.target.value);
                                        setEditingNotes(false);
                                    }}
                                    className="w-full h-full p-4 text-sm focus:outline-none resize-none"
                                    placeholder="Add private notes..."
                                />
                            ) : (
                                <div
                                    onClick={() => setEditingNotes(true)}
                                    className="p-4 text-sm text-gray-600 h-full min-h-[150px] cursor-text"
                                >
                                    {lead.notes || <span className="text-gray-400 italic">No notes yet. Click to add...</span>}
                                </div>
                            )}
                        </div>

                        {/* Source Specific Data */}
                        {lead.source === 'producthunt' && lead.social_links?.makers && (
                            <div>
                                <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Makers</h4>
                                <div className="flex flex-wrap gap-2">
                                    {lead.social_links.makers.map((m, i) => (
                                        <div key={i} className="bg-white border border-gray-200 px-2 py-1 rounded text-xs flex items-center gap-1">
                                            <span className="font-medium">{m.name}</span>
                                            {m.twitter && <a href={m.twitter} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700">𝕏</a>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {lead.source === 'reddit' && lead.social_links?.subreddit && (
                            <div className="bg-orange-50 p-3 rounded-lg border border-orange-100">
                                <h4 className="text-xs font-semibold text-orange-800 uppercase mb-2">Reddit Context</h4>
                                <div className="text-xs text-orange-700 space-y-1">
                                    <div>
                                        Posted in{' '}
                                        <a
                                            href={`https://www.reddit.com/r/${lead.social_links.subreddit}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="font-bold hover:underline"
                                        >
                                            r/{lead.social_links.subreddit}
                                        </a>
                                    </div>
                                    {lead.social_links.author && (
                                        <div>
                                            Author:{' '}
                                            <a
                                                href={`https://www.reddit.com/user/${lead.social_links.author}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="font-bold hover:underline"
                                            >
                                                u/{lead.social_links.author}
                                            </a>
                                        </div>
                                    )}
                                    {(lead.social_links?.reddit_post || lead.social_links?.reddit) && (
                                        <div>
                                            <a
                                                href={lead.social_links.reddit_post || lead.social_links.reddit || '#'}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-orange-600 hover:text-orange-800 hover:underline"
                                            >
                                                View Original Post →
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
});
