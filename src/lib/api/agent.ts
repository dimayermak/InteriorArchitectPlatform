import { createClient } from '@/lib/supabase/client';

// ============================================
// Types
// ============================================

export interface AgentAction {
    id: string;
    organization_id: string;
    agent_type: 'project_manager' | 'financial' | 'lead_nurture' | 'supplier' | 'scheduling' | 'briefing';
    action_type: 'alert' | 'draft_email' | 'create_task' | 'update_status' | 'escalate' | 'suggest' | 'auto_action' | 'briefing';
    entity_type?: string;
    entity_id?: string;
    title: string;
    description?: string;
    severity: 'info' | 'warning' | 'critical';
    status: 'pending' | 'approved' | 'executed' | 'dismissed';
    payload: Record<string, unknown>;
    approved_by?: string;
    approved_at?: string;
    executed_at?: string;
    created_at: string;
}

export interface AgentSettings {
    id: string;
    organization_id: string;
    enabled_agents: string[];
    notification_channels: string[];
    notification_email?: string;
    daily_briefing_time: string;
    auto_actions: Record<string, boolean>;
    language: string;
    created_at: string;
    updated_at: string;
}

export interface DailyBriefing {
    briefing: string;
    stats: {
        active_projects: number;
        new_leads: number;
        pending_revenue: number;
        todays_meetings: number;
        critical_alerts: number;
        warning_alerts: number;
        info_alerts: number;
    };
    alerts: AgentAction[];
    meetings: Array<{
        title: string;
        scheduled_at: string;
        location?: string;
        type: string;
    }>;
    logged: number;
}

// ============================================
// Agent Actions — direct DB queries
// ============================================

export async function getAgentActions(
    organizationId: string,
    options?: { status?: string; limit?: number; agentType?: string }
): Promise<AgentAction[]> {
    const supabase = createClient();

    let query = supabase
        .from('agent_actions_log')
        .select('*')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false })
        .limit(options?.limit || 50);

    if (options?.status) query = query.eq('status', options.status);
    if (options?.agentType) query = query.eq('agent_type', options.agentType);

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data || [];
}

export async function getPendingActions(organizationId: string): Promise<AgentAction[]> {
    return getAgentActions(organizationId, { status: 'pending' });
}

export async function approveAction(actionId: string, userId: string): Promise<AgentAction> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('agent_actions_log')
        .update({
            status: 'approved',
            approved_by: userId,
            approved_at: new Date().toISOString(),
        })
        .eq('id', actionId)
        .select()
        .single();

    if (error) throw new Error(error.message);
    return data;
}

export async function dismissAction(actionId: string): Promise<AgentAction> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('agent_actions_log')
        .update({ status: 'dismissed' })
        .eq('id', actionId)
        .select()
        .single();

    if (error) throw new Error(error.message);
    return data;
}

// ============================================
// Agent Settings
// ============================================

export async function getAgentSettings(organizationId: string): Promise<AgentSettings | null> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('agent_settings')
        .select('*')
        .eq('organization_id', organizationId)
        .single();

    if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        throw new Error(error.message);
    }
    return data;
}

export async function upsertAgentSettings(
    organizationId: string,
    settings: Partial<Omit<AgentSettings, 'id' | 'organization_id' | 'created_at' | 'updated_at'>>
): Promise<AgentSettings> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('agent_settings')
        .upsert(
            {
                organization_id: organizationId,
                ...settings,
                updated_at: new Date().toISOString(),
            },
            { onConflict: 'organization_id' }
        )
        .select()
        .single();

    if (error) throw new Error(error.message);
    return data;
}

// ============================================
// Edge Function API — trigger analysis
// ============================================

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

async function callAgentBrain(endpoint: string, organizationId: string): Promise<unknown> {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/agent-brain/${endpoint}`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ organization_id: organizationId }),
    });

    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || `Agent brain call failed: ${response.status}`);
    }

    return response.json();
}

export async function triggerDailyBriefing(organizationId: string): Promise<DailyBriefing> {
    return callAgentBrain('daily-briefing', organizationId) as Promise<DailyBriefing>;
}

export async function triggerProjectAnalysis(organizationId: string) {
    return callAgentBrain('analyze-projects', organizationId);
}

export async function triggerLeadAnalysis(organizationId: string) {
    return callAgentBrain('analyze-leads', organizationId);
}

export async function triggerFinanceAnalysis(organizationId: string) {
    return callAgentBrain('analyze-finance', organizationId);
}

// ============================================
// Agent Stats (for dashboard)
// ============================================

export async function getAgentStats(organizationId: string): Promise<{
    totalActions: number;
    pendingActions: number;
    criticalAlerts: number;
    actionsToday: number;
}> {
    const supabase = createClient();
    const today = new Date().toISOString().split('T')[0];

    const [allResult, pendingResult, criticalResult, todayResult] = await Promise.all([
        supabase.from('agent_actions_log').select('id', { count: 'exact', head: true }).eq('organization_id', organizationId),
        supabase.from('agent_actions_log').select('id', { count: 'exact', head: true }).eq('organization_id', organizationId).eq('status', 'pending'),
        supabase.from('agent_actions_log').select('id', { count: 'exact', head: true }).eq('organization_id', organizationId).eq('severity', 'critical').eq('status', 'pending'),
        supabase.from('agent_actions_log').select('id', { count: 'exact', head: true }).eq('organization_id', organizationId).gte('created_at', `${today}T00:00:00`),
    ]);

    return {
        totalActions: allResult.count || 0,
        pendingActions: pendingResult.count || 0,
        criticalAlerts: criticalResult.count || 0,
        actionsToday: todayResult.count || 0,
    };
}
