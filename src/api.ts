import axios from 'axios';

const API_BASE_URL = 'https://lead-radar-backend.vercel.app';

export interface Maker {
    name: string;
    username: string;
    twitter: string | null;
}

export interface GitHubOwner {
    username: string;
    url: string;
    type: string;
}

export interface Lead {
    id: string;
    source: 'producthunt' | 'indiehackers' | 'github' | 'reddit';
    product_name: string;
    tagline: string;
    website: string;
    upvotes: number;
    launch_date: string;
    score: number;
    status: 'new' | 'contacted' | 'replied' | 'rejected';
    notes: string | null;
    social_links?: {
        // Product Hunt
        product_hunt?: string;
        makers?: Maker[];
        // Indie Hackers
        indie_hackers?: string;
        revenue?: string | null;
        // GitHub
        github?: string;
        owner?: GitHubOwner;
        language?: string | null;
        topics?: string[];
        forks?: number;
        // Reddit
        reddit?: string; // Legacy field
        reddit_post?: string; // Reddit post permalink
        subreddit?: string;
        author?: string;
        extracted_links?: string[]; // Links extracted from post
    };
    created_at: string;
}

export type LeadSource = 'all' | 'producthunt' | 'indiehackers' | 'github' | 'reddit';

export const exportToCSV = (leads: Lead[]) => {
    const headers = ['Product', 'Source', 'Score', 'Status', 'Tagline', 'Website', 'Date'];
    const rows = leads.map(l => [
        l.product_name,
        l.source,
        l.score,
        l.status,
        `"${l.tagline?.replace(/"/g, '""')}"`, // Escape quotes
        l.website,
        l.launch_date
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'leads_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

export const fetchLeads = async (minScore?: number, status?: string, source?: string) => {
    const params: any = {};
    if (minScore !== undefined) params.minScore = minScore;
    if (status) params.status = status;
    if (source && source !== 'all') params.source = source;

    const response = await axios.get(`${API_BASE_URL}/leads`, { params });
    return response.data as Lead[];
};

export const updateLead = async (id: string, updates: Partial<{ status: string; notes: string }>) => {
    const response = await axios.patch(`${API_BASE_URL}/leads/${id}`, updates);
    return response.data;
};

export const batchUpdateLeads = async (ids: string[], status: string) => {
    const response = await axios.post(`${API_BASE_URL}/leads/batch`, { ids, status });
    return response.data;
};

// Sync functions for each source
export const syncProductHunt = async () => {
    const response = await axios.get(`${API_BASE_URL}/sync/producthunt`);
    return response.data;
};

export const syncIndieHackers = async () => {
    const response = await axios.get(`${API_BASE_URL}/sync/indiehackers`);
    return response.data;
};

export const syncGitHub = async () => {
    const response = await axios.get(`${API_BASE_URL}/sync/github`);
    return response.data;
};

export const syncReddit = async () => {
    const response = await axios.get(`${API_BASE_URL}/sync/reddit`);
    return response.data;
};

export const syncAllSources = async () => {
    const response = await axios.get(`${API_BASE_URL}/sync/all`);
    return response.data;
};

// Legacy alias for backwards compatibility
export const syncLeads = syncProductHunt;

// ============ AI FUNCTIONS ============

export interface LeadAnalysis {
    summary: string;
    painPoints: string[];
    marketingGaps: string[];
    outreachAngle: string;
    suggestedMessage: string;
    confidence: 'high' | 'medium' | 'low';
}

export interface OutreachDraft {
    subject: string;
    body: string;
    channel: 'email' | 'twitter' | 'linkedin';
}

export const analyzeLeadWithAI = async (leadId: string): Promise<LeadAnalysis> => {
    const response = await axios.post(`${API_BASE_URL}/ai/analyze/${leadId}`);
    return response.data.analysis;
};

export const generateOutreach = async (
    leadId: string,
    channel: 'email' | 'twitter' | 'linkedin' = 'email',
    context?: {
        agency_name?: string;
        service_focus?: string;
        tone?: 'friendly' | 'professional' | 'casual';
    }
): Promise<OutreachDraft> => {
    const response = await axios.post(`${API_BASE_URL}/ai/outreach/${leadId}`, {
        channel,
        ...context,
    });
    return response.data.draft;
};

export const prioritizeLeadsWithAI = async (ids: string[]): Promise<Array<{
    id: string;
    priority: number;
    reason: string;
}>> => {
    const response = await axios.post(`${API_BASE_URL}/ai/prioritize`, { ids });
    return response.data.prioritized;
};

// ============ UTILITY FUNCTIONS ============

export interface ScoreBreakdown {
    total: number;
    factors: Array<{
        name: string;
        points: number;
        reason: string;
    }>;
}

export interface DuplicateInfo {
    isDuplicate: boolean;
    duplicates: Array<{
        id: string;
        product_name: string;
        source: string;
        website: string | null;
        score: number;
        launch_date: string;
    }>;
}

export const getScoreBreakdown = async (leadId: string): Promise<ScoreBreakdown> => {
    const response = await axios.get(`${API_BASE_URL}/leads/${leadId}/score-breakdown`);
    return response.data.breakdown;
};

export const getDuplicateLeads = async (leadId: string): Promise<DuplicateInfo> => {
    const response = await axios.get(`${API_BASE_URL}/leads/${leadId}/duplicates`);
    return response.data;
};

export const getPossibleEmails = async (leadId: string): Promise<{ emails: string[] }> => {
    const response = await axios.get(`${API_BASE_URL}/leads/${leadId}/emails`);
    return response.data;
};

