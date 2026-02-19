'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    getAgentActions,
    approveAction,
    dismissAction,
    triggerDailyBriefing,
    type AgentAction,
    type DailyBriefing,
} from '@/lib/api/agent';

// ============================================
// Agent Icon Map
// ============================================
const agentIcons: Record<string, string> = {
    project_manager: '📋',
    financial: '💰',
    lead_nurture: '📥',
    supplier: '🏭',
    scheduling: '📅',
    briefing: '🌅',
};

const severityStyles: Record<string, { bg: string; border: string; text: string; badge: string }> = {
    critical: {
        bg: 'background: rgba(239, 68, 68, 0.08)',
        border: 'border-right: 3px solid #ef4444',
        text: 'color: #ef4444',
        badge: 'background: #ef4444; color: white',
    },
    warning: {
        bg: 'background: rgba(245, 158, 11, 0.08)',
        border: 'border-right: 3px solid #f59e0b',
        text: 'color: #f59e0b',
        badge: 'background: #f59e0b; color: white',
    },
    info: {
        bg: 'background: rgba(59, 130, 246, 0.08)',
        border: 'border-right: 3px solid #3b82f6',
        text: 'color: #3b82f6',
        badge: 'background: #3b82f6; color: white',
    },
};

interface AgentActivityFeedProps {
    organizationId: string;
    userId: string;
    isOpen: boolean;
    onClose: () => void;
}

export default function AgentActivityFeed({ organizationId, userId, isOpen, onClose }: AgentActivityFeedProps) {
    const [actions, setActions] = useState<AgentAction[]>([]);
    const [briefing, setBriefing] = useState<DailyBriefing | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'feed' | 'briefing' | 'command'>('feed');
    const [loadingBriefing, setLoadingBriefing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [executingId, setExecutingId] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Command chat state
    const [commandInput, setCommandInput] = useState('');
    const [commandLoading, setCommandLoading] = useState(false);
    interface ChatMessage { role: 'user' | 'ai'; text: string; success?: boolean; }
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

    const fetchActions = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await getAgentActions(organizationId, { limit: 30 });
            setActions(data);
        } catch (err) {
            console.error('Failed to fetch agent actions:', err);
        } finally {
            setIsLoading(false);
        }
    }, [organizationId]);

    const handleGenerateBriefing = useCallback(async () => {
        setLoadingBriefing(true);
        try {
            const data = await triggerDailyBriefing(organizationId);
            setBriefing(data);
            // Refresh actions feed since briefing logs new actions
            await fetchActions();
        } catch (err) {
            console.error('Failed to generate briefing:', err);
        } finally {
            setLoadingBriefing(false);
        }
    }, [organizationId, fetchActions]);

    const handleApprove = async (actionId: string) => {
        setError(null);
        setSuccessMessage(null);
        setExecutingId(actionId);
        try {
            const result = await approveAction(actionId, userId);
            setActions(prev => prev.map(a => a.id === actionId ? { ...a, status: 'executed' as const } : a));
            // Show success message
            setSuccessMessage(result.message_he || 'בוצע בהצלחה ✓');
            setTimeout(() => setSuccessMessage(null), 5000);
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'שגיאה באישור הפעולה';
            setError(msg);
            console.error('Failed to execute action:', err);
            setTimeout(() => setError(null), 5000);
        } finally {
            setExecutingId(null);
        }
    };

    const handleDismiss = async (actionId: string) => {
        setError(null);
        try {
            await dismissAction(actionId);
            setActions(prev => prev.map(a => a.id === actionId ? { ...a, status: 'dismissed' as const } : a));
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'שגיאה בדחיית הפעולה';
            setError(msg);
            console.error('Failed to dismiss action:', err);
            setTimeout(() => setError(null), 5000);
        }
    };

    const handleSendCommand = async () => {
        const msg = commandInput.trim();
        if (!msg || commandLoading) return;
        setCommandInput('');
        setChatMessages(prev => [...prev, { role: 'user', text: msg }]);
        setCommandLoading(true);
        try {
            const res = await fetch('/api/ai/command', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: msg, organizationId, userId }),
            });
            const data = await res.json();
            setChatMessages(prev => [...prev, {
                role: 'ai',
                text: data.message_he || data.summary_he || 'בוצע בהצלחה',
                success: data.success,
            }]);
        } catch {
            setChatMessages(prev => [...prev, { role: 'ai', text: '❌ שגיאה בתקשורת', success: false }]);
        } finally {
            setCommandLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) fetchActions();
    }, [isOpen, fetchActions]);

    if (!isOpen) return null;

    const pendingActions = actions.filter(a => a.status === 'pending');
    const resolvedActions = actions.filter(a => a.status !== 'pending');

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'עכשיו';
        if (diffMins < 60) return `לפני ${diffMins} דק׳`;
        if (diffHours < 24) return `לפני ${diffHours} שע׳`;
        if (diffDays < 7) return `לפני ${diffDays} ימים`;
        return date.toLocaleDateString('he-IL');
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            bottom: 0,
            width: '420px',
            background: '#0f0f12',
            borderLeft: '1px solid rgba(255, 255, 255, 0.08)',
            zIndex: 50,
            display: 'flex',
            flexDirection: 'column',
            direction: 'rtl',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            boxShadow: '4px 0 24px rgba(0, 0, 0, 0.4)',
        }}>
            {/* Header */}
            <div style={{
                padding: '20px 24px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '24px' }}>🤖</span>
                    <div>
                        <h2 style={{ color: '#f5f5f5', fontSize: '16px', fontWeight: 600, margin: 0 }}>
                            סוכן AI
                        </h2>
                        <p style={{ color: '#888', fontSize: '12px', margin: '2px 0 0 0' }}>
                            {pendingActions.length > 0
                                ? `${pendingActions.length} פעולות ממתינות`
                                : 'הכל תקין ✨'}
                        </p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: '#888',
                        fontSize: '20px',
                        cursor: 'pointer',
                        padding: '4px 8px',
                        borderRadius: '6px',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                >
                    ✕
                </button>
            </div>

            {/* Tabs */}
            <div style={{
                display: 'flex',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                padding: '0 24px',
            }}>
                {[
                    { key: 'feed' as const, label: 'פעילות', icon: '📊' },
                    { key: 'briefing' as const, label: 'תדרוך', icon: '🌅' },
                    { key: 'command' as const, label: 'פקודה', icon: '💬' },
                ].map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        style={{
                            padding: '12px 16px',
                            background: 'none',
                            border: 'none',
                            color: activeTab === tab.key ? '#a78bfa' : '#888',
                            fontSize: '13px',
                            fontWeight: 500,
                            cursor: 'pointer',
                            borderBottom: activeTab === tab.key ? '2px solid #a78bfa' : '2px solid transparent',
                            transition: 'all 0.2s',
                        }}
                    >
                        {tab.icon} {tab.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
                {/* Error Banner */}
                {error && (
                    <div style={{
                        padding: '10px 14px',
                        background: 'rgba(239, 68, 68, 0.12)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: '8px',
                        marginBottom: '12px',
                        color: '#f87171',
                        fontSize: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                    }}>
                        <span>❌</span>
                        <span>{error}</span>
                        <button onClick={() => setError(null)} style={{ marginRight: 'auto', background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '14px' }}>✕</button>
                    </div>
                )}
                {/* Success Banner */}
                {successMessage && (
                    <div style={{
                        padding: '10px 14px',
                        background: 'rgba(34, 197, 94, 0.12)',
                        border: '1px solid rgba(34, 197, 94, 0.3)',
                        borderRadius: '8px',
                        marginBottom: '12px',
                        color: '#22c55e',
                        fontSize: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                    }}>
                        <span>✅</span>
                        <span>{successMessage}</span>
                        <button onClick={() => setSuccessMessage(null)} style={{ marginRight: 'auto', background: 'none', border: 'none', color: '#22c55e', cursor: 'pointer', fontSize: '14px' }}>✕</button>
                    </div>
                )}
                {activeTab === 'feed' ? (
                    <>
                        {isLoading ? (
                            <div style={{ textAlign: 'center', padding: '40px 0', color: '#888' }}>
                                <div style={{ fontSize: '32px', marginBottom: '12px', animation: 'spin 1s linear infinite' }}>⚙️</div>
                                <p>טוען פעילות...</p>
                            </div>
                        ) : (
                            <>
                                {/* Pending Section */}
                                {pendingActions.length > 0 && (
                                    <div style={{ marginBottom: '24px' }}>
                                        <h3 style={{ color: '#f59e0b', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
                                            ⏳ ממתין לאישור ({pendingActions.length})
                                        </h3>
                                        {pendingActions.map(action => (
                                            <ActionCard
                                                key={action.id}
                                                action={action}
                                                isExecuting={executingId === action.id}
                                                onApprove={handleApprove}
                                                onDismiss={handleDismiss}
                                                formatTime={formatTime}
                                            />
                                        ))}
                                    </div>
                                )}

                                {/* Resolved Section */}
                                {resolvedActions.length > 0 && (
                                    <div>
                                        <h3 style={{ color: '#666', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
                                            📜 היסטוריה
                                        </h3>
                                        {resolvedActions.slice(0, 10).map(action => (
                                            <ActionCard
                                                key={action.id}
                                                action={action}
                                                formatTime={formatTime}
                                            />
                                        ))}
                                    </div>
                                )}

                                {actions.length === 0 && (
                                    <div style={{ textAlign: 'center', padding: '60px 0', color: '#888' }}>
                                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🤖</div>
                                        <p style={{ fontSize: '14px', marginBottom: '8px' }}>הסוכן עדיין לא פעל</p>
                                        <p style={{ fontSize: '12px', color: '#666' }}>
                                            לחץ על &quot;תדרוך יומי&quot; כדי להפעיל סריקה ראשונה
                                        </p>
                                    </div>
                                )}
                            </>
                        )}
                    </>
                ) : (
                    /* Briefing Tab */
                    <div>
                        {!briefing ? (
                            <div style={{ textAlign: 'center', padding: '40px 0' }}>
                                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🌅</div>
                                <p style={{ color: '#ccc', fontSize: '14px', marginBottom: '20px' }}>
                                    קבל סיכום יומי של כל הפרויקטים, הלידים והפיננסים
                                </p>
                                <button
                                    onClick={handleGenerateBriefing}
                                    disabled={loadingBriefing}
                                    style={{
                                        padding: '12px 32px',
                                        background: loadingBriefing ? '#333' : 'linear-gradient(135deg, #a78bfa, #7c3aed)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '10px',
                                        fontSize: '14px',
                                        fontWeight: 600,
                                        cursor: loadingBriefing ? 'not-allowed' : 'pointer',
                                        transition: 'all 0.2s',
                                    }}
                                >
                                    {loadingBriefing ? '⏳ מנתח...' : '🚀 הפק תדרוך עכשיו'}
                                </button>
                            </div>
                        ) : (
                            <div>
                                {/* Stats Cards */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '20px' }}>
                                    {[
                                        { label: 'פרויקטים פעילים', value: briefing.stats.active_projects, icon: '🏗️' },
                                        { label: 'לידים חדשים', value: briefing.stats.new_leads, icon: '📥' },
                                        { label: 'ממתין לתשלום', value: `₪${briefing.stats.pending_revenue.toLocaleString()}`, icon: '💰' },
                                        { label: 'פגישות היום', value: briefing.stats.todays_meetings, icon: '📅' },
                                    ].map((stat, i) => (
                                        <div key={i} style={{
                                            padding: '14px',
                                            background: 'rgba(255, 255, 255, 0.03)',
                                            borderRadius: '10px',
                                            border: '1px solid rgba(255, 255, 255, 0.06)',
                                        }}>
                                            <div style={{ fontSize: '20px', marginBottom: '4px' }}>{stat.icon}</div>
                                            <div style={{ color: '#f5f5f5', fontSize: '18px', fontWeight: 700 }}>{stat.value}</div>
                                            <div style={{ color: '#888', fontSize: '11px' }}>{stat.label}</div>
                                        </div>
                                    ))}
                                </div>

                                {/* Alert Summary */}
                                {(briefing.stats.critical_alerts > 0 || briefing.stats.warning_alerts > 0) && (
                                    <div style={{
                                        padding: '14px',
                                        background: briefing.stats.critical_alerts > 0 ? 'rgba(239, 68, 68, 0.08)' : 'rgba(245, 158, 11, 0.08)',
                                        borderRadius: '10px',
                                        border: `1px solid ${briefing.stats.critical_alerts > 0 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)'}`,
                                        marginBottom: '20px',
                                    }}>
                                        <div style={{ color: briefing.stats.critical_alerts > 0 ? '#ef4444' : '#f59e0b', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>
                                            {briefing.stats.critical_alerts > 0 ? '🔴' : '⚠️'} {briefing.stats.critical_alerts + briefing.stats.warning_alerts} התראות פעילות
                                        </div>
                                        {briefing.alerts
                                            .filter(a => a.severity !== 'info')
                                            .slice(0, 5)
                                            .map((alert, i) => (
                                                <div key={i} style={{ color: '#ccc', fontSize: '12px', padding: '4px 0', borderTop: i > 0 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                                                    {alert.severity === 'critical' ? '🔴' : '🟡'} {alert.title}
                                                </div>
                                            ))}
                                    </div>
                                )}

                                {/* Refresh button */}
                                <button
                                    onClick={handleGenerateBriefing}
                                    disabled={loadingBriefing}
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        background: 'rgba(255, 255, 255, 0.05)',
                                        color: '#a78bfa',
                                        border: '1px solid rgba(167, 139, 250, 0.2)',
                                        borderRadius: '8px',
                                        fontSize: '13px',
                                        cursor: loadingBriefing ? 'not-allowed' : 'pointer',
                                    }}
                                >
                                    {loadingBriefing ? '⏳ מרענן...' : '🔄 רענן תדרוך'}
                                </button>
                            </div>
                        )}
                    </div>
                )}
                {/* Command Tab */}
                {activeTab === 'command' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {chatMessages.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '24px 16px' }}>
                                <div style={{ fontSize: '40px', marginBottom: '12px' }}>💬</div>
                                <h3 style={{ color: '#f5f5f5', fontSize: '15px', fontWeight: 600, margin: '0 0 8px 0' }}>פקודה בשפה חופשית</h3>
                                <p style={{ color: '#888', fontSize: '12px', margin: 0, lineHeight: 1.6 }}>כתוב פקודה בעברית והסוכן יבצע אותה</p>
                            </div>
                        )}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '12px' }}>
                            {chatMessages.map((m, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-start' : 'flex-end' }}>
                                    <div style={{ maxWidth: '80%', padding: '10px 14px', borderRadius: m.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px', background: m.role === 'user' ? 'rgba(255,255,255,0.07)' : m.success === false ? 'rgba(239,68,68,0.12)' : 'rgba(167,139,250,0.15)', border: m.role === 'user' ? '1px solid rgba(255,255,255,0.1)' : m.success === false ? '1px solid rgba(239,68,68,0.2)' : '1px solid rgba(167,139,250,0.2)', color: m.role === 'user' ? '#e5e5e5' : '#d4bbfc', fontSize: '13px', lineHeight: 1.5 }}>{m.text}</div>
                                </div>
                            ))}
                            {commandLoading && <div style={{ display: 'flex', justifyContent: 'flex-end' }}><div style={{ padding: '10px 18px', borderRadius: '14px 14px 14px 4px', background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.15)', color: '#a78bfa', fontSize: '18px', letterSpacing: '4px' }}>...</div></div>}
                        </div>
                        <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '12px' }}>
                            <textarea value={commandInput} onChange={e => setCommandInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendCommand(); } }} placeholder="כתוב פקודה... (Enter לשליחה)" rows={2} style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px', color: '#f5f5f5', fontSize: '13px', padding: '10px 14px', resize: 'none', outline: 'none', fontFamily: 'inherit', direction: 'rtl' }} />
                            <button onClick={handleSendCommand} disabled={commandLoading || !commandInput.trim()} style={{ width: '44px', height: '44px', borderRadius: '10px', background: (commandLoading || !commandInput.trim()) ? 'rgba(167,139,250,0.2)' : 'linear-gradient(135deg, #a78bfa, #7c3aed)', border: 'none', color: 'white', fontSize: '18px', cursor: (commandLoading || !commandInput.trim()) ? 'not-allowed' : 'pointer', flexShrink: 0, alignSelf: 'flex-end' }}>➤</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// ============================================
// Action Card Sub-component
// ============================================

function ActionCard({
    action,
    onApprove,
    onDismiss,
    formatTime,
    isExecuting,
}: {
    action: AgentAction;
    isExecuting?: boolean;
    onApprove?: (id: string) => void;
    onDismiss?: (id: string) => void;
    formatTime: (date: string) => string;
}) {
    const style = severityStyles[action.severity] || severityStyles.info;

    return (
        <div style={{
            padding: '14px',
            marginBottom: '8px',
            background: 'rgba(255, 255, 255, 0.02)',
            borderRadius: '10px',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            borderRight: `3px solid ${action.severity === 'critical' ? '#ef4444' : action.severity === 'warning' ? '#f59e0b' : '#3b82f6'}`,
            transition: 'all 0.15s',
        }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                    <span style={{ fontSize: '16px' }}>{agentIcons[action.agent_type] || '🤖'}</span>
                    <span style={{ color: '#f5f5f5', fontSize: '13px', fontWeight: 500, lineHeight: 1.3 }}>
                        {action.title}
                    </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                    <span style={{
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '10px',
                        fontWeight: 600,
                        background: action.severity === 'critical' ? '#ef4444' : action.severity === 'warning' ? '#f59e0b' : '#3b82f6',
                        color: 'white',
                    }}>
                        {action.severity === 'critical' ? 'קריטי' : action.severity === 'warning' ? 'אזהרה' : 'מידע'}
                    </span>
                    {action.status !== 'pending' && (
                        <span style={{
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontSize: '10px',
                            fontWeight: 600,
                            background: action.status === 'approved' ? '#22c55e' : '#666',
                            color: 'white',
                        }}>
                            {action.status === 'approved' ? 'אושר' : action.status === 'executed' ? 'בוצע' : 'נדחה'}
                        </span>
                    )}
                </div>
            </div>

            {action.description && (
                <p style={{ color: '#999', fontSize: '12px', margin: '6px 0', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                    {action.description.length > 200 ? action.description.slice(0, 200) + '...' : action.description}
                </p>
            )}

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px' }}>
                <span style={{ color: '#666', fontSize: '11px' }}>{formatTime(action.created_at)}</span>

                {action.status === 'pending' && onApprove && onDismiss && (
                    <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                            onClick={() => onApprove(action.id)}
                            disabled={isExecuting}
                            style={{
                                padding: '4px 12px',
                                background: isExecuting ? 'rgba(34, 197, 94, 0.3)' : 'rgba(34, 197, 94, 0.15)',
                                color: '#22c55e',
                                border: '1px solid rgba(34, 197, 94, 0.3)',
                                borderRadius: '6px',
                                fontSize: '11px',
                                fontWeight: 500,
                                cursor: isExecuting ? 'wait' : 'pointer',
                                opacity: isExecuting ? 0.7 : 1,
                            }}
                        >
                            {isExecuting ? '⏳ מבצע...' : '✓ אשר'}
                        </button>
                        <button
                            onClick={() => onDismiss(action.id)}
                            style={{
                                padding: '4px 12px',
                                background: 'rgba(255, 255, 255, 0.05)',
                                color: '#888',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '6px',
                                fontSize: '11px',
                                fontWeight: 500,
                                cursor: 'pointer',
                            }}
                        >
                            ✕ דחה
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
