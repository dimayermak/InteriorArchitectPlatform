'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    getAgentSettings,
    upsertAgentSettings,
    type AgentSettings,
} from '@/lib/api/agent';

const AGENT_OPTIONS = [
    { key: 'project_manager', label: 'מנהל פרויקטים', description: 'מזהה משימות באיחור, בעיות תקציב, ושלבים תקועים', icon: '📋' },
    { key: 'financial', label: 'שומר פיננסי', description: 'עוקב אחרי חשבוניות, תזרים מזומנים וחריגות תקציב', icon: '💰' },
    { key: 'lead_nurture', label: 'טיפוח לידים', description: 'ניקוד לידים, תזכורות מעקב, וזיהוי לידים בעלי ערך גבוה', icon: '📥' },
    { key: 'scheduling', label: 'עוזר תזמון', description: 'תזכורות ביקורי אתר, הכנה לפגישות, וסיכומים', icon: '📅' },
    { key: 'briefing', label: 'תדרוך יומי', description: 'סיכום בוקר של כל הסטודיו — פרויקטים, לידים, כספים', icon: '🌅' },
];

const AUTO_ACTION_OPTIONS = [
    { key: 'create_followup_task', label: 'יצירת משימות המשך', description: 'כשמשימה באיחור, צור משימת מעקב אוטומטית' },
    { key: 'auto_score_leads', label: 'ניקוד לידים אוטומטי', description: 'חישוב ניקוד לידים חדשים על בסיס ערך ומקור' },
    { key: 'send_payment_reminder', label: 'תזכורת תשלום', description: 'שלח טיוטת תזכורת עבור חשבוניות באיחור' },
    { key: 'draft_supervision_report', label: 'טיוטת דוח פיקוח', description: 'הכן טיוטת דוח פיקוח לאחר ביקור באתר' },
    { key: 'send_meeting_summary', label: 'סיכום פגישה', description: 'צור סיכום אוטומטי לאחר סיום פגישה' },
];

interface AgentSettingsPanelProps {
    organizationId: string;
    isOpen: boolean;
    onClose: () => void;
}

export default function AgentSettingsPanel({ organizationId, isOpen, onClose }: AgentSettingsPanelProps) {
    const [settings, setSettings] = useState<AgentSettings | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'error'>('idle');

    // Local state for editable fields
    const [enabledAgents, setEnabledAgents] = useState<string[]>(['project_manager', 'financial', 'briefing']);
    const [notificationChannels, setNotificationChannels] = useState<string[]>(['in_app', 'email']);
    const [notificationEmail, setNotificationEmail] = useState('');
    const [briefingTime, setBriefingTime] = useState('08:00');
    const [autoActions, setAutoActions] = useState<Record<string, boolean>>({
        create_followup_task: false,
        auto_score_leads: true,
        send_payment_reminder: false,
        draft_supervision_report: false,
        send_meeting_summary: false,
    });

    const fetchSettings = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await getAgentSettings(organizationId);
            if (data) {
                setSettings(data);
                setEnabledAgents(data.enabled_agents);
                setNotificationChannels(data.notification_channels);
                setNotificationEmail(data.notification_email || '');
                setBriefingTime(data.daily_briefing_time);
                setAutoActions(data.auto_actions);
            }
        } catch (err) {
            console.error('Failed to fetch settings:', err);
        } finally {
            setIsLoading(false);
        }
    }, [organizationId]);

    const handleSave = async () => {
        setIsSaving(true);
        setSaveStatus('idle');
        try {
            const updated = await upsertAgentSettings(organizationId, {
                enabled_agents: enabledAgents,
                notification_channels: notificationChannels,
                notification_email: notificationEmail || undefined,
                daily_briefing_time: briefingTime,
                auto_actions: autoActions,
            });
            setSettings(updated);
            setSaveStatus('saved');
            setTimeout(() => setSaveStatus('idle'), 2000);
        } catch (err) {
            console.error('Failed to save settings:', err);
            setSaveStatus('error');
        } finally {
            setIsSaving(false);
        }
    };

    const toggleAgent = (key: string) => {
        setEnabledAgents(prev =>
            prev.includes(key) ? prev.filter(a => a !== key) : [...prev, key]
        );
    };

    const toggleAutoAction = (key: string) => {
        setAutoActions(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const toggleChannel = (channel: string) => {
        setNotificationChannels(prev =>
            prev.includes(channel) ? prev.filter(c => c !== channel) : [...prev, channel]
        );
    };

    useEffect(() => {
        if (isOpen) fetchSettings();
    }, [isOpen, fetchSettings]);

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 60,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(4px)',
            direction: 'rtl',
        }} onClick={onClose}>
            <div
                style={{
                    width: '560px',
                    maxHeight: '85vh',
                    background: '#16161a',
                    borderRadius: '16px',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
                }}
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div style={{
                    padding: '24px',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '24px' }}>⚙️</span>
                        <h2 style={{ color: '#f5f5f5', fontSize: '18px', fontWeight: 600, margin: 0 }}>
                            הגדרות סוכן AI
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#888',
                            fontSize: '18px',
                            cursor: 'pointer',
                            padding: '4px 8px',
                        }}
                    >
                        ✕
                    </button>
                </div>

                {/* Content */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
                    {isLoading ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
                            טוען הגדרות...
                        </div>
                    ) : (
                        <>
                            {/* Active Agents */}
                            <section style={{ marginBottom: '28px' }}>
                                <h3 style={{ color: '#f5f5f5', fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>
                                    🤖 סוכנים פעילים
                                </h3>
                                {AGENT_OPTIONS.map(agent => (
                                    <label
                                        key={agent.key}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                            padding: '12px',
                                            marginBottom: '6px',
                                            background: enabledAgents.includes(agent.key) ? 'rgba(167, 139, 250, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                                            borderRadius: '10px',
                                            border: `1px solid ${enabledAgents.includes(agent.key) ? 'rgba(167, 139, 250, 0.2)' : 'rgba(255, 255, 255, 0.06)'}`,
                                            cursor: 'pointer',
                                            transition: 'all 0.15s',
                                        }}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={enabledAgents.includes(agent.key)}
                                            onChange={() => toggleAgent(agent.key)}
                                            style={{ accentColor: '#a78bfa', width: '16px', height: '16px' }}
                                        />
                                        <span style={{ fontSize: '20px' }}>{agent.icon}</span>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ color: '#f5f5f5', fontSize: '13px', fontWeight: 500 }}>{agent.label}</div>
                                            <div style={{ color: '#888', fontSize: '11px' }}>{agent.description}</div>
                                        </div>
                                    </label>
                                ))}
                            </section>

                            {/* Notification Channels */}
                            <section style={{ marginBottom: '28px' }}>
                                <h3 style={{ color: '#f5f5f5', fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>
                                    📬 ערוצי התראה
                                </h3>
                                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                                    {[
                                        { key: 'in_app', label: '🔔 באפליקציה' },
                                        { key: 'email', label: '📧 אימייל' },
                                    ].map(channel => (
                                        <button
                                            key={channel.key}
                                            onClick={() => toggleChannel(channel.key)}
                                            style={{
                                                padding: '10px 20px',
                                                background: notificationChannels.includes(channel.key)
                                                    ? 'rgba(167, 139, 250, 0.15)'
                                                    : 'rgba(255, 255, 255, 0.03)',
                                                color: notificationChannels.includes(channel.key) ? '#a78bfa' : '#888',
                                                border: `1px solid ${notificationChannels.includes(channel.key) ? 'rgba(167, 139, 250, 0.3)' : 'rgba(255, 255, 255, 0.08)'}`,
                                                borderRadius: '8px',
                                                fontSize: '13px',
                                                cursor: 'pointer',
                                                fontWeight: 500,
                                                transition: 'all 0.15s',
                                            }}
                                        >
                                            {channel.label}
                                        </button>
                                    ))}
                                </div>
                                {notificationChannels.includes('email') && (
                                    <input
                                        type="email"
                                        value={notificationEmail}
                                        onChange={e => setNotificationEmail(e.target.value)}
                                        placeholder="אימייל להתראות (אופציונלי)"
                                        style={{
                                            width: '100%',
                                            padding: '10px 14px',
                                            background: 'rgba(255, 255, 255, 0.03)',
                                            border: '1px solid rgba(255, 255, 255, 0.08)',
                                            borderRadius: '8px',
                                            color: '#f5f5f5',
                                            fontSize: '13px',
                                            outline: 'none',
                                            direction: 'ltr',
                                        }}
                                    />
                                )}
                            </section>

                            {/* Daily Briefing Time */}
                            <section style={{ marginBottom: '28px' }}>
                                <h3 style={{ color: '#f5f5f5', fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>
                                    🌅 שעת תדרוך יומי
                                </h3>
                                <input
                                    type="time"
                                    value={briefingTime}
                                    onChange={e => setBriefingTime(e.target.value)}
                                    style={{
                                        padding: '10px 14px',
                                        background: 'rgba(255, 255, 255, 0.03)',
                                        border: '1px solid rgba(255, 255, 255, 0.08)',
                                        borderRadius: '8px',
                                        color: '#f5f5f5',
                                        fontSize: '14px',
                                        outline: 'none',
                                        direction: 'ltr',
                                    }}
                                />
                            </section>

                            {/* Auto Actions */}
                            <section style={{ marginBottom: '12px' }}>
                                <h3 style={{ color: '#f5f5f5', fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>
                                    ⚡ פעולות אוטומטיות
                                </h3>
                                <p style={{ color: '#888', fontSize: '11px', marginBottom: '12px' }}>
                                    פעולות שהסוכן יבצע ללא אישור ידני
                                </p>
                                {AUTO_ACTION_OPTIONS.map(opt => (
                                    <label
                                        key={opt.key}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                            padding: '10px 12px',
                                            marginBottom: '4px',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            background: autoActions[opt.key] ? 'rgba(34, 197, 94, 0.06)' : 'transparent',
                                        }}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={autoActions[opt.key] || false}
                                            onChange={() => toggleAutoAction(opt.key)}
                                            style={{ accentColor: '#22c55e', width: '16px', height: '16px' }}
                                        />
                                        <div style={{ flex: 1 }}>
                                            <div style={{ color: '#f5f5f5', fontSize: '13px', fontWeight: 500 }}>{opt.label}</div>
                                            <div style={{ color: '#888', fontSize: '11px' }}>{opt.description}</div>
                                        </div>
                                    </label>
                                ))}
                            </section>
                        </>
                    )}
                </div>

                {/* Footer */}
                <div style={{
                    padding: '16px 24px',
                    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}>
                    <div style={{ fontSize: '12px', color: saveStatus === 'saved' ? '#22c55e' : saveStatus === 'error' ? '#ef4444' : '#666' }}>
                        {saveStatus === 'saved' ? '✅ נשמר בהצלחה' : saveStatus === 'error' ? '❌ שגיאה בשמירה' : ''}
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                            onClick={onClose}
                            style={{
                                padding: '10px 20px',
                                background: 'rgba(255, 255, 255, 0.05)',
                                color: '#888',
                                border: '1px solid rgba(255, 255, 255, 0.08)',
                                borderRadius: '8px',
                                fontSize: '13px',
                                cursor: 'pointer',
                            }}
                        >
                            ביטול
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            style={{
                                padding: '10px 24px',
                                background: isSaving ? '#333' : 'linear-gradient(135deg, #a78bfa, #7c3aed)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '13px',
                                fontWeight: 600,
                                cursor: isSaving ? 'not-allowed' : 'pointer',
                            }}
                        >
                            {isSaving ? '⏳ שומר...' : '💾 שמור הגדרות'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
