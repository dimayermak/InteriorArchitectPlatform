import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function getServiceClient() {
    return createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );
}

// ===== HELPERS =====
function businessDaysFromNow(days: number): Date {
    const d = new Date();
    let added = 0;
    while (added < days) {
        d.setDate(d.getDate() + 1);
        if (d.getDay() !== 6) added++; // Skip Shabbat
    }
    d.setHours(10, 0, 0, 0);
    return d;
}

function daysBetween(d1: Date, d2: Date): number {
    return Math.floor(Math.abs(d1.getTime() - d2.getTime()) / (1000 * 60 * 60 * 24));
}

// ===== PROJECT ANALYZER — EXPANDED =====
async function analyzeProjects(supabase: any, orgId: string) {
    const alerts: any[] = [];
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    const { data: allProjects } = await supabase
        .from('projects')
        .select('id, name, status, start_date, end_date, budget, client_id, assigned_to, type, created_at')
        .eq('organization_id', orgId)
        .is('deleted_at', null);

    const activeProjects = (allProjects || []).filter((p: any) => p.status === 'active');
    const planningProjects = (allProjects || []).filter((p: any) => p.status === 'planning');

    // 1. Project deadline approaching (< 14 days)
    for (const p of activeProjects) {
        if (p.end_date) {
            const daysLeft = daysBetween(new Date(p.end_date), now);
            const isPast = new Date(p.end_date) < now;
            if (isPast) {
                alerts.push({
                    agent_type: 'project_manager', action_type: 'escalate', entity_type: 'project', entity_id: p.id,
                    title: `⏰ פרויקט "${p.name}" חרג מדדליין`,
                    description: `הפרויקט היה אמור להסתיים ב-${p.end_date} (לפני ${daysLeft} יום). יש לעדכן את הסטטוס או להגדיר דדליין חדש.`,
                    severity: 'critical',
                    payload: { project_name: p.name, end_date: p.end_date, days_overdue: daysLeft, execute_type: 'create_task', task_title: `עדכון דדליין — ${p.name}`, task_description: `הפרויקט חרג מהדדליין (${p.end_date}). יש לעדכן לוח זמנים ולעדכן את הלקוח.`, task_priority: 'urgent', task_due_date: businessDaysFromNow(1).toISOString().split('T')[0] }
                });
            } else if (daysLeft <= 14) {
                alerts.push({
                    agent_type: 'project_manager', action_type: 'alert', entity_type: 'project', entity_id: p.id,
                    title: `📅 "${p.name}" — ${daysLeft} ימים לדדליין`,
                    description: `דדליין: ${p.end_date}. נותרו ${daysLeft} ימים. ודא שכל המשימות מתקדמות בהתאם.`,
                    severity: daysLeft <= 5 ? 'critical' : 'warning',
                    payload: { project_name: p.name, days_left: daysLeft, execute_type: 'create_task', task_title: `בדיקת התקדמות לפני דדליין — ${p.name}`, task_description: `נותרו ${daysLeft} ימים לסיום הפרויקט. יש לוודא שכל המשימות מתקדמות.`, task_priority: daysLeft <= 5 ? 'urgent' : 'high', task_due_date: businessDaysFromNow(1).toISOString().split('T')[0] }
                });
            }
        }
    }

    // 2. Project in planning too long (> 14 days)
    for (const p of planningProjects) {
        const daysInPlanning = daysBetween(new Date(p.created_at), now);
        if (daysInPlanning > 14) {
            alerts.push({
                agent_type: 'project_manager', action_type: 'suggest', entity_type: 'project', entity_id: p.id,
                title: `📋 "${p.name}" בתכנון כבר ${daysInPlanning} יום`,
                description: `הפרויקט בסטטוס "תכנון" מזה ${daysInPlanning} יום. שקול להעביר לפעיל או לעדכן את הסטטוס.`,
                severity: daysInPlanning > 30 ? 'warning' : 'info',
                payload: { project_name: p.name, days_in_planning: daysInPlanning, execute_type: 'create_task', task_title: `סקירת פרויקט בתכנון — ${p.name}`, task_description: `הפרויקט נמצא בתכנון ${daysInPlanning} ימים. יש לסקור ולהחליט אם להתחיל או לבטל.`, task_priority: 'medium', task_due_date: businessDaysFromNow(3).toISOString().split('T')[0] }
            });
        }
    }

    // 3. Project without budget defined
    for (const p of activeProjects) {
        if (!p.budget || p.budget <= 0) {
            alerts.push({
                agent_type: 'financial', action_type: 'alert', entity_type: 'project', entity_id: p.id,
                title: `💰 "${p.name}" — לא הוגדר תקציב`,
                description: `פרויקט פעיל ללא תקציב מוגדר. חשוב להגדיר תקציב למעקב פיננסי.`,
                severity: 'warning',
                payload: { project_name: p.name, execute_type: 'create_task', task_title: `הגדרת תקציב — ${p.name}`, task_description: `יש להגדיר תקציב לפרויקט לצורך מעקב פיננסי ובקרת עלויות.`, task_priority: 'high', task_due_date: businessDaysFromNow(2).toISOString().split('T')[0] }
            });
        }
    }

    // 4. Project without assigned team member
    for (const p of activeProjects) {
        if (!p.assigned_to) {
            alerts.push({
                agent_type: 'project_manager', action_type: 'alert', entity_type: 'project', entity_id: p.id,
                title: `👤 "${p.name}" — ללא אחראי`,
                description: `פרויקט פעיל ללא צוות משויך. יש להקצות אחראי.`,
                severity: 'warning',
                payload: { project_name: p.name, execute_type: 'create_task', task_title: `שיוך אחראי — ${p.name}`, task_description: `פרויקט ללא אחראי. יש לשייך חבר צוות אחראי.`, task_priority: 'high', task_due_date: businessDaysFromNow(1).toISOString().split('T')[0] }
            });
        }
    }

    // 5. Overdue tasks
    const { data: overdueTasks } = await supabase
        .from('tasks').select('id, title, due_date, project_id, status, priority')
        .eq('organization_id', orgId).is('deleted_at', null)
        .lt('due_date', todayStr).not('status', 'in', '(done,cancelled)');

    if (overdueTasks?.length > 0) {
        const byProject: Record<string, any[]> = {};
        for (const t of overdueTasks) {
            const pid = t.project_id || 'no_project';
            if (!byProject[pid]) byProject[pid] = [];
            byProject[pid].push(t);
        }
        for (const [projectId, tasks] of Object.entries(byProject)) {
            const urgentCount = tasks.filter((t: any) => t.priority === 'urgent' || t.priority === 'high').length;
            alerts.push({
                agent_type: 'project_manager', action_type: 'escalate', entity_type: 'project',
                entity_id: projectId === 'no_project' ? null : projectId,
                title: `⚠️ ${tasks.length} משימות באיחור${urgentCount > 0 ? ` (${urgentCount} דחופות)` : ''}`,
                description: tasks.map((t: any) => `• ${t.title} (דדליין: ${t.due_date})`).join('\n'),
                severity: urgentCount > 0 ? 'critical' : 'warning',
                payload: { overdue_task_ids: tasks.map((t: any) => t.id), count: tasks.length, execute_type: 'escalate_tasks' }
            });
        }
    }

    // 6. Budget burn rate
    for (const project of activeProjects) {
        if (!project.budget || project.budget <= 0) continue;
        const { data: expenses } = await supabase.from('expenses').select('amount').eq('project_id', project.id).eq('status', 'approved');
        const totalSpent = (expenses || []).reduce((s: number, e: any) => s + (e.amount || 0), 0);
        const burnRate = (totalSpent / project.budget) * 100;
        if (burnRate >= 80) {
            alerts.push({
                agent_type: 'financial', action_type: 'alert', entity_type: 'project', entity_id: project.id,
                title: `🔥 "${project.name}" — ${Math.round(burnRate)}% מהתקציב נוצל`,
                description: `₪${totalSpent.toLocaleString()} מתוך ₪${project.budget.toLocaleString()}. ${burnRate >= 95 ? 'חריגה צפויה!' : 'עקוב אחרי הוצאות.'}`,
                severity: burnRate >= 95 ? 'critical' : 'warning',
                payload: { budget: project.budget, spent: totalSpent, burn_rate: burnRate, project_name: project.name, execute_type: 'create_review_task' }
            });
        }
    }

    // 7. Missing site supervision (14+ days)
    for (const project of activeProjects) {
        const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const { data: recentReports } = await supabase.from('supervision_reports').select('id').eq('project_id', project.id).gte('date', fourteenDaysAgo).limit(1);
        if (!recentReports || recentReports.length === 0) {
            const visitDate = businessDaysFromNow(3); // 3 business days out
            alerts.push({
                agent_type: 'scheduling', action_type: 'suggest', entity_type: 'project', entity_id: project.id,
                title: `📅 ביקור פיקוח נדרש — "${project.name}"`,
                description: `לא בוצע ביקור באתר ב-14 הימים האחרונים. מומלץ לתאם ביקור.`,
                severity: 'info',
                payload: { project_name: project.name, client_id: project.client_id, execute_type: 'create_meeting', meeting_type: 'site_supervision', suggested_date: visitDate.toISOString(), suggested_duration_minutes: 120, suggested_title: `ביקור פיקוח — ${project.name}` }
            });
        }
    }

    // 8. Stalled phases
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { data: inProgressPhases } = await supabase.from('project_phases').select('id, name, project_id').eq('status', 'in_progress');
    if (inProgressPhases) {
        for (const phase of inProgressPhases) {
            const { data: recentTasks } = await supabase.from('tasks').select('id').eq('phase_id', phase.id).gt('updated_at', sevenDaysAgo).limit(1);
            if (!recentTasks || recentTasks.length === 0) {
                alerts.push({
                    agent_type: 'project_manager', action_type: 'alert', entity_type: 'project', entity_id: phase.project_id,
                    title: `🚧 שלב "${phase.name}" תקוע — אין פעילות 7+ ימים`,
                    description: `השלב בסטטוס "בביצוע" אבל אין משימות שעודכנו ב-7 הימים האחרונים.`,
                    severity: 'warning',
                    payload: { phase_id: phase.id, phase_name: phase.name, execute_type: 'create_review_task', project_name: phase.name }
                });
            }
        }
    }

    // 9. Project without any tasks
    for (const p of activeProjects) {
        const { data: projectTasks } = await supabase.from('tasks').select('id').eq('project_id', p.id).is('deleted_at', null).limit(1);
        if (!projectTasks || projectTasks.length === 0) {
            alerts.push({
                agent_type: 'project_manager', action_type: 'suggest', entity_type: 'project', entity_id: p.id,
                title: `📝 "${p.name}" — ללא משימות`,
                description: `פרויקט פעיל ללא משימות מוגדרות. צור משימות ראשוניות כדי להתחיל לעקוב אחרי ההתקדמות.`,
                severity: 'warning',
                payload: { project_name: p.name, execute_type: 'create_task', task_title: `הגדרת משימות ראשוניות — ${p.name}`, task_description: `אין משימות בפרויקט. יש להגדיר план עבודה ומשימות ראשוניות.`, task_priority: 'high', task_due_date: businessDaysFromNow(2).toISOString().split('T')[0] }
            });
        }
    }

    return alerts;
}

// ===== LEAD ANALYZER — EXPANDED =====
async function analyzeLeads(supabase: any, orgId: string) {
    const alerts: any[] = [];
    const now = new Date();

    const { data: allLeads } = await supabase
        .from('leads')
        .select('id, name, status, value, source, score, created_at, updated_at')
        .eq('organization_id', orgId)
        .is('deleted_at', null);

    if (!allLeads) return alerts;

    // 1. New leads not contacted (> 3 days)
    const newLeads = allLeads.filter((l: any) => l.status === 'new');
    for (const lead of newLeads) {
        const daysSince = daysBetween(new Date(lead.created_at), now);
        if (daysSince >= 3) {
            alerts.push({
                agent_type: 'lead_nurture', action_type: 'suggest', entity_type: 'lead', entity_id: lead.id,
                title: `📞 "${lead.name}" — ${daysSince} ימים ללא מענה`,
                description: `ליד חדש ממקור "${lead.source || 'לא ידוע'}" ממתין ${daysSince} ימים. ${lead.value ? `ערך: ₪${lead.value.toLocaleString()}.` : ''} יש ליצור קשר.`,
                severity: daysSince > 7 ? 'warning' : 'info',
                payload: { lead_name: lead.name, days_waiting: daysSince, execute_type: 'create_task', task_title: `פולו-אפ ללקוח — ${lead.name}`, task_description: `ליד "${lead.name}" ממתין ${daysSince} ימים. מקור: ${lead.source || 'לא ידוע'}. יש ליצור קשר ראשוני.`, task_priority: daysSince > 7 ? 'high' : 'medium', task_due_date: businessDaysFromNow(1).toISOString().split('T')[0] }
            });
        }
    }

    // 2. Leads in "proposal" for too long (> 7 days)
    const proposalLeads = allLeads.filter((l: any) => l.status === 'proposal');
    for (const lead of proposalLeads) {
        const daysSince = daysBetween(new Date(lead.updated_at), now);
        if (daysSince >= 7) {
            alerts.push({
                agent_type: 'lead_nurture', action_type: 'alert', entity_type: 'lead', entity_id: lead.id,
                title: `📄 "${lead.name}" — הצעה ממתינה ${daysSince} ימים`,
                description: `הצעת מחיר נשלחה לפני ${daysSince} ימים ולא התקבלה תשובה. מומלץ לעקוב.`,
                severity: daysSince > 14 ? 'warning' : 'info',
                payload: { lead_name: lead.name, execute_type: 'create_task', task_title: `מעקב הצעת מחיר — ${lead.name}`, task_description: `הצעה ממתינה ${daysSince} ימים. יש ליצור קשר ולשמוע תגובה.`, task_priority: 'high', task_due_date: businessDaysFromNow(1).toISOString().split('T')[0] }
            });
        }
    }

    // 3. Leads in "negotiation" with no recent activity
    const negotiationLeads = allLeads.filter((l: any) => l.status === 'negotiation');
    for (const lead of negotiationLeads) {
        const daysSince = daysBetween(new Date(lead.updated_at), now);
        if (daysSince >= 5) {
            alerts.push({
                agent_type: 'lead_nurture', action_type: 'alert', entity_type: 'lead', entity_id: lead.id,
                title: `🤝 "${lead.name}" — מו"מ ללא התקדמות`,
                description: `הליד בשלב מו"מ ללא עדכון ${daysSince} ימים. ${lead.value ? `ערך: ₪${lead.value.toLocaleString()}.` : ''}`,
                severity: 'warning',
                payload: { lead_name: lead.name, execute_type: 'create_meeting', meeting_type: 'consultation', suggested_date: businessDaysFromNow(2).toISOString(), suggested_duration_minutes: 60, suggested_title: `פגישת מו"מ — ${lead.name}` }
            });
        }
    }

    // 4. Qualified leads without meeting scheduled
    const qualifiedLeads = allLeads.filter((l: any) => l.status === 'qualified');
    for (const lead of qualifiedLeads) {
        const daysSince = daysBetween(new Date(lead.updated_at), now);
        if (daysSince >= 5) {
            alerts.push({
                agent_type: 'lead_nurture', action_type: 'suggest', entity_type: 'lead', entity_id: lead.id,
                title: `🎯 "${lead.name}" — ליד מתאים ללא פגישה`,
                description: `ליד בדירוג ${lead.score}/100 מתאים ולא תואמה פגישה. מומלץ לתאם ייעוץ ראשוני.`,
                severity: 'info',
                payload: { lead_name: lead.name, score: lead.score, execute_type: 'create_meeting', meeting_type: 'consultation', suggested_date: businessDaysFromNow(3).toISOString(), suggested_duration_minutes: 60, suggested_title: `ייעוץ ראשוני — ${lead.name}` }
            });
        }
    }

    // 5. High-value leads
    const highValueLeads = allLeads.filter((l: any) => l.value && l.value > 100000 && ['new', 'contacted'].includes(l.status));
    for (const lead of highValueLeads) {
        alerts.push({
            agent_type: 'lead_nurture', action_type: 'escalate', entity_type: 'lead', entity_id: lead.id,
            title: `🔥 ליד VIP: ${lead.name} (₪${lead.value.toLocaleString()})`,
            description: `ליד בעל ערך גבוה דורש תשומת לב מיידית!`,
            severity: 'critical',
            payload: { lead_name: lead.name, value: lead.value, execute_type: 'create_task', task_title: `⚡ VIP — ${lead.name} (₪${lead.value.toLocaleString()})`, task_description: `ליד VIP דורש טיפול מיידי!`, task_priority: 'urgent', task_due_date: new Date().toISOString().split('T')[0] }
        });
    }

    // 6. Won leads without a project
    const wonLeads = allLeads.filter((l: any) => l.status === 'won');
    for (const lead of wonLeads) {
        const { data: clientProject } = await supabase.from('projects').select('id').eq('organization_id', orgId).is('deleted_at', null).limit(1);
        // Simple check — if won lead exists, suggest creating project
        const daysSinceWon = daysBetween(new Date(lead.updated_at), now);
        if (daysSinceWon >= 3 && daysSinceWon <= 30) {
            alerts.push({
                agent_type: 'project_manager', action_type: 'suggest', entity_type: 'lead', entity_id: lead.id,
                title: `🏗️ "${lead.name}" — נסגר לפני ${daysSinceWon} ימים`,
                description: `ליד שנסגר בהצלחה. ודא שנפתח פרויקט ושנחתם הסכם.`,
                severity: daysSinceWon > 7 ? 'warning' : 'info',
                payload: { lead_name: lead.name, execute_type: 'create_task', task_title: `פתיחת פרויקט — ${lead.name}`, task_description: `ליד "${lead.name}" נסגר בהצלחה. יש לפתוח פרויקט, לחתום הסכם ולתאם פגישת אפיון.`, task_priority: 'high', task_due_date: businessDaysFromNow(2).toISOString().split('T')[0] }
            });
        }
    }

    return alerts;
}

// ===== FINANCE ANALYZER =====
async function analyzeFinance(supabase: any, orgId: string) {
    const alerts: any[] = [];
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    // 1. Overdue invoices
    const { data: overdueInvoices } = await supabase
        .from('invoices').select('id, invoice_number, total, due_date, client_id, project_id, status')
        .eq('organization_id', orgId).eq('status', 'sent').lt('due_date', todayStr);
    if (overdueInvoices?.length > 0) {
        const totalOverdue = overdueInvoices.reduce((s: number, i: any) => s + (i.total || 0), 0);
        alerts.push({
            agent_type: 'financial', action_type: 'alert', entity_type: 'invoice', entity_id: overdueInvoices[0].id,
            title: `🚨 ${overdueInvoices.length} חשבוניות באיחור (₪${totalOverdue.toLocaleString()})`,
            description: overdueInvoices.map((i: any) => `• ${i.invoice_number}: ₪${i.total.toLocaleString()} — ${daysBetween(new Date(i.due_date), now)} ימי איחור`).join('\n'),
            severity: totalOverdue > 50000 ? 'critical' : 'warning',
            payload: { invoice_ids: overdueInvoices.map((i: any) => i.id), total_overdue: totalOverdue, execute_type: 'create_task', task_title: `מעקב תשלום — ${overdueInvoices.length} חשבוניות (₪${totalOverdue.toLocaleString()})`, task_description: overdueInvoices.map((i: any) => `• ${i.invoice_number}: ₪${i.total.toLocaleString()}`).join('\n'), task_priority: totalOverdue > 50000 ? 'urgent' : 'high', task_due_date: businessDaysFromNow(1).toISOString().split('T')[0] }
        });
    }

    // 2. Draft invoices not sent (> 3 days)
    const { data: draftInvoices } = await supabase
        .from('invoices').select('id, invoice_number, total, created_at')
        .eq('organization_id', orgId).eq('status', 'draft');
    if (draftInvoices?.length > 0) {
        const oldDrafts = draftInvoices.filter((i: any) => daysBetween(new Date(i.created_at), now) > 3);
        if (oldDrafts.length > 0) {
            const totalDraft = oldDrafts.reduce((s: number, i: any) => s + (i.total || 0), 0);
            alerts.push({
                agent_type: 'financial', action_type: 'suggest', entity_type: 'invoice', entity_id: null,
                title: `📨 ${oldDrafts.length} חשבוניות טיוטה לא נשלחו (₪${totalDraft.toLocaleString()})`,
                description: `טיוטות ישנות שלא נשלחו ללקוח. כסף שממתין על השולחן!`,
                severity: 'warning',
                payload: { execute_type: 'create_task', task_title: `שליחת ${oldDrafts.length} חשבוניות טיוטה`, task_description: `יש ${oldDrafts.length} חשבוניות בסטטוס טיוטה שלא נשלחו. סה"כ: ₪${totalDraft.toLocaleString()}.`, task_priority: 'high', task_due_date: businessDaysFromNow(1).toISOString().split('T')[0] }
            });
        }
    }

    // 3. Invoices due soon (next 3 days)
    const threeDaysOut = businessDaysFromNow(3).toISOString().split('T')[0];
    const { data: soonDue } = await supabase
        .from('invoices').select('id, invoice_number, total, due_date, client_id')
        .eq('organization_id', orgId).eq('status', 'sent').gte('due_date', todayStr).lte('due_date', threeDaysOut);
    if (soonDue?.length > 0) {
        alerts.push({
            agent_type: 'financial', action_type: 'alert', entity_type: 'invoice', entity_id: null,
            title: `⏰ ${soonDue.length} חשבוניות מגיעות לפירעון בקרוב`,
            description: soonDue.map((i: any) => `• ${i.invoice_number}: ₪${i.total.toLocaleString()} — עד ${i.due_date}`).join('\n'),
            severity: 'info',
            payload: { execute_type: 'create_task', task_title: `מעקב תשלומים — ${soonDue.length} חשבוניות`, task_description: `יש לוודא שהתשלומים נכנסים בזמן.`, task_priority: 'medium', task_due_date: businessDaysFromNow(1).toISOString().split('T')[0] }
        });
    }

    // 4. Expenses pending approval
    const { data: pendingExpenses } = await supabase
        .from('expenses').select('id, description, amount').eq('organization_id', orgId).eq('status', 'pending');
    if (pendingExpenses?.length > 0) {
        const totalPending = pendingExpenses.reduce((s: number, e: any) => s + (e.amount || 0), 0);
        alerts.push({
            agent_type: 'financial', action_type: 'alert', entity_type: 'expense', entity_id: null,
            title: `💳 ${pendingExpenses.length} הוצאות ממתינות לאישור (₪${totalPending.toLocaleString()})`,
            description: pendingExpenses.slice(0, 5).map((e: any) => `• ${e.description}: ₪${e.amount.toLocaleString()}`).join('\n'),
            severity: pendingExpenses.length > 5 ? 'warning' : 'info',
            payload: { execute_type: 'create_task', task_title: `אישור הוצאות — ${pendingExpenses.length} ממתינות`, task_description: `יש ${pendingExpenses.length} הוצאות בסטטוס ממתין. סה"כ: ₪${totalPending.toLocaleString()}.`, task_priority: 'medium', task_due_date: businessDaysFromNow(2).toISOString().split('T')[0] }
        });
    }

    // 5. Revenue pipeline summary
    const { data: pendingInvoices } = await supabase
        .from('invoices').select('total, status').eq('organization_id', orgId).in('status', ['draft', 'sent']);
    if (pendingInvoices?.length > 0) {
        const totalPending = pendingInvoices.reduce((s: number, i: any) => s + (i.total || 0), 0);
        const draftTotal = pendingInvoices.filter((i: any) => i.status === 'draft').reduce((s: number, i: any) => s + (i.total || 0), 0);
        if (totalPending > 0) {
            alerts.push({
                agent_type: 'financial', action_type: 'suggest', entity_type: 'invoice', entity_id: null,
                title: `📊 Pipeline: ₪${totalPending.toLocaleString()} (₪${draftTotal.toLocaleString()} בטיוטה)`,
                description: `סה"כ כספים ממתינים: ₪${totalPending.toLocaleString()}.`,
                severity: 'info',
                payload: { total_pending: totalPending, draft_total: draftTotal }
            });
        }
    }

    return alerts;
}

// ===== CLIENT ANALYZER — NEW =====
async function analyzeClients(supabase: any, orgId: string) {
    const alerts: any[] = [];
    const now = new Date();

    const { data: clients } = await supabase
        .from('clients').select('id, name, email, phone, status, created_at, updated_at')
        .eq('organization_id', orgId).is('deleted_at', null);
    if (!clients) return alerts;

    // 1. Inactive clients — potential re-engagement
    const inactiveClients = clients.filter((c: any) => c.status === 'inactive');
    for (const client of inactiveClients) {
        alerts.push({
            agent_type: 'lead_nurture', action_type: 'suggest', entity_type: 'client', entity_id: client.id,
            title: `🔄 "${client.name}" — לקוח לא פעיל`,
            description: `לקוח בסטטוס לא פעיל. שקול לשלוח הודעה או הצעה חדשה לחיזוק הקשר.`,
            severity: 'info',
            payload: { client_name: client.name, execute_type: 'create_task', task_title: `חיזוק קשר — ${client.name}`, task_description: `לקוח לא פעיל. שלח הודעת "מה שלומך" או הצעה לשדרוג/פרויקט חדש.`, task_priority: 'low', task_due_date: businessDaysFromNow(5).toISOString().split('T')[0] }
        });
    }

    // 2. Active clients without projects
    const activeClients = clients.filter((c: any) => c.status === 'active');
    for (const client of activeClients) {
        const { data: clientProjects } = await supabase
            .from('projects').select('id').eq('client_id', client.id).is('deleted_at', null).limit(1);
        if (!clientProjects || clientProjects.length === 0) {
            alerts.push({
                agent_type: 'lead_nurture', action_type: 'suggest', entity_type: 'client', entity_id: client.id,
                title: `🏠 "${client.name}" — לקוח פעיל ללא פרויקט`,
                description: `לקוח פעיל אבל אין לו פרויקט מוגדר. שקול ליצור פרויקט.`,
                severity: 'info',
                payload: { client_name: client.name, execute_type: 'create_task', task_title: `יצירת פרויקט — ${client.name}`, task_description: `לקוח פעיל ללא פרויקט משויך. תאם שיחה ופתח פרויקט.`, task_priority: 'medium', task_due_date: businessDaysFromNow(3).toISOString().split('T')[0] }
            });
        }
    }

    // 3. Clients without contact info
    for (const client of activeClients) {
        if (!client.email && !client.phone) {
            alerts.push({
                agent_type: 'project_manager', action_type: 'alert', entity_type: 'client', entity_id: client.id,
                title: `📱 "${client.name}" — חסרים פרטי קשר`,
                description: `ללקוח אין אימייל או טלפון מעודכנים. יש להשלים את הפרטים.`,
                severity: 'warning',
                payload: { client_name: client.name, execute_type: 'create_task', task_title: `השלמת פרטי קשר — ${client.name}`, task_description: `חסרים אימייל וטלפון. יש לעדכן את כרטיס הלקוח.`, task_priority: 'medium', task_due_date: businessDaysFromNow(2).toISOString().split('T')[0] }
            });
        }
    }

    return alerts;
}

// ===== SCHEDULING ANALYZER — NEW =====
async function analyzeScheduling(supabase: any, orgId: string) {
    const alerts: any[] = [];
    const now = new Date();

    // 1. Meetings today (agenda summary)
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59).toISOString();
    const { data: todayMeetings } = await supabase
        .from('meetings').select('id, title, start_time, end_time, type, location, status')
        .eq('organization_id', orgId).gte('start_time', startOfDay).lte('start_time', endOfDay).eq('status', 'scheduled');

    if (todayMeetings?.length > 0) {
        const typeMap: Record<string, string> = { office: 'במשרד', site_supervision: 'ביקור באתר', shopping: 'קניות', consultation: 'ייעוץ' };
        alerts.push({
            agent_type: 'scheduling', action_type: 'alert', entity_type: 'meeting', entity_id: null,
            title: `🗓️ ${todayMeetings.length} פגישות היום`,
            description: todayMeetings.map((m: any) => {
                const time = new Date(m.start_time).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });
                return `• ${time} — ${m.title} (${typeMap[m.type] || m.type})${m.location ? ` | ${m.location}` : ''}`;
            }).join('\n'),
            severity: 'info',
            payload: { meeting_count: todayMeetings.length }
        });
    }

    // 2. Meetings without summary (completed but no summary filed)
    const { data: noSummaryMeetings } = await supabase
        .from('meetings').select('id, title, start_time, type')
        .eq('organization_id', orgId).eq('status', 'completed').is('summary', null);
    if (noSummaryMeetings?.length > 0) {
        for (const m of noSummaryMeetings.slice(0, 3)) {
            alerts.push({
                agent_type: 'project_manager', action_type: 'suggest', entity_type: 'meeting', entity_id: m.id,
                title: `📝 פגישה ללא סיכום — "${m.title}"`,
                description: `הפגישה הסתיימה אבל לא נכתב סיכום. תעד את הנקודות העיקריות.`,
                severity: 'info',
                payload: { meeting_title: m.title, execute_type: 'create_task', task_title: `סיכום פגישה — ${m.title}`, task_description: `יש לכתוב סיכום לפגישה ולשתף עם הגורמים הרלוונטיים.`, task_priority: 'medium', task_due_date: businessDaysFromNow(1).toISOString().split('T')[0] }
            });
        }
    }

    // 3. Supervision reports in draft (not sent)
    const { data: draftReports } = await supabase
        .from('supervision_reports').select('id, project_id, date')
        .eq('organization_id', orgId).eq('status', 'draft');
    if (draftReports?.length > 0) {
        alerts.push({
            agent_type: 'project_manager', action_type: 'alert', entity_type: 'supervision_report', entity_id: null,
            title: `📋 ${draftReports.length} דו"חות פיקוח בטיוטה`,
            description: `דו"חות פיקוח שלא נשלחו ללקוח. חשוב לשלוח בהקדם.`,
            severity: 'warning',
            payload: { report_count: draftReports.length, execute_type: 'create_task', task_title: `שליחת ${draftReports.length} דו"חות פיקוח`, task_description: `יש ${draftReports.length} דו"חות פיקוח בטיוטה שצריך לשלוח ללקוחות.`, task_priority: 'high', task_due_date: businessDaysFromNow(1).toISOString().split('T')[0] }
        });
    }

    // 4. Purchase orders pending delivery
    const { data: pendingPOs } = await supabase
        .from('purchase_orders').select('id, order_number, supplier_id, total_amount, order_date, status')
        .eq('organization_id', orgId).in('status', ['ordered', 'shipped']);
    if (pendingPOs?.length > 0) {
        for (const po of pendingPOs) {
            const daysSinceOrder = daysBetween(new Date(po.order_date), now);
            if (daysSinceOrder > 14) {
                alerts.push({
                    agent_type: 'project_manager', action_type: 'alert', entity_type: 'purchase_order', entity_id: po.id,
                    title: `📦 הזמנה #${po.order_number || po.id.slice(0, 8)} — ${daysSinceOrder} ימים`,
                    description: `הזמנת רכש (₪${(po.total_amount || 0).toLocaleString()}) בהמתנה ${daysSinceOrder} ימים. בדוק מצב אספקה.`,
                    severity: daysSinceOrder > 30 ? 'warning' : 'info',
                    payload: { execute_type: 'create_task', task_title: `מעקב הזמנה #${po.order_number || po.id.slice(0, 8)}`, task_description: `הזמנה ממתינה ${daysSinceOrder} ימים. יש לבדוק מתי הסחורה מגיעה.`, task_priority: 'medium', task_due_date: businessDaysFromNow(1).toISOString().split('T')[0] }
                });
            }
        }
    }

    return alerts;
}


// ===== DAILY BRIEFING =====
async function generateDailyBriefing(supabase: any, orgId: string) {
    const [projectAlerts, leadAlerts, financeAlerts, clientAlerts, schedulingAlerts] = await Promise.all([
        analyzeProjects(supabase, orgId),
        analyzeLeads(supabase, orgId),
        analyzeFinance(supabase, orgId),
        analyzeClients(supabase, orgId),
        analyzeScheduling(supabase, orgId),
    ]);

    const allAlerts = [...projectAlerts, ...leadAlerts, ...financeAlerts, ...clientAlerts, ...schedulingAlerts];

    // Stats
    const { data: activeProjects } = await supabase.from('projects').select('id').eq('organization_id', orgId).eq('status', 'active').is('deleted_at', null);
    const { data: newLeads } = await supabase.from('leads').select('id').eq('organization_id', orgId).in('status', ['new', 'contacted']).is('deleted_at', null);
    const { data: pendingInvoices } = await supabase.from('invoices').select('total').eq('organization_id', orgId).eq('status', 'sent');
    const pendingTotal = (pendingInvoices || []).reduce((s: number, i: any) => s + (i.total || 0), 0);

    const criticalAlerts = allAlerts.filter(a => a.severity === 'critical');
    const warningAlerts = allAlerts.filter(a => a.severity === 'warning');
    const infoAlerts = allAlerts.filter(a => a.severity === 'info');

    let briefing = `בוקר טוב! 🌅 הנה סיכום הסטודיו שלך:\n\n`;
    briefing += `📊 ${activeProjects?.length || 0} פרויקטים פעילים | ${newLeads?.length || 0} לידים חדשים | ₪${pendingTotal.toLocaleString()} ממתין\n\n`;
    if (criticalAlerts.length > 0) { briefing += `🔴 דורש טיפול מיידי (${criticalAlerts.length}):\n`; criticalAlerts.forEach(a => { briefing += `• ${a.title}\n`; }); briefing += '\n'; }
    if (warningAlerts.length > 0) { briefing += `⚠️ שים לב (${warningAlerts.length}):\n`; warningAlerts.forEach(a => { briefing += `• ${a.title}\n`; }); briefing += '\n'; }
    if (infoAlerts.length > 0) { briefing += `💡 המלצות (${infoAlerts.length}):\n`; infoAlerts.forEach(a => { briefing += `• ${a.title}\n`; }); briefing += '\n'; }

    return {
        briefing,
        stats: { active_projects: activeProjects?.length || 0, new_leads: newLeads?.length || 0, pending_revenue: pendingTotal, critical_alerts: criticalAlerts.length, warning_alerts: warningAlerts.length, info_alerts: infoAlerts.length },
        alerts: allAlerts,
    };
}

// ===== LOG ACTIONS =====
async function logActions(supabase: any, orgId: string, alerts: any[]) {
    if (alerts.length === 0) return { logged: 0 };
    const rows = alerts.map(a => ({
        organization_id: orgId, agent_type: a.agent_type, action_type: a.action_type,
        entity_type: a.entity_type, entity_id: a.entity_id, title: a.title,
        description: a.description, severity: a.severity, status: 'pending', payload: a.payload || {}
    }));
    const { error } = await supabase.from('agent_actions_log').insert(rows);
    if (error) { console.error('Failed to log actions:', error); return { logged: 0, error: error.message }; }
    return { logged: rows.length };
}

// ===== EXECUTE ACTION =====
async function executeAction(supabase: any, actionId: string, userId?: string) {
    const { data: action, error: fetchError } = await supabase.from('agent_actions_log').select('*').eq('id', actionId).single();
    if (fetchError || !action) throw new Error(`Action not found: ${actionId}`);
    if (action.status === 'executed') return { already_executed: true, action };

    const payload = action.payload || {};
    const orgId = action.organization_id;
    const executeType = payload.execute_type;
    let created: any = null;
    let createdType = '';

    switch (executeType) {
        case 'create_meeting': {
            const startTime = new Date(payload.suggested_date || businessDaysFromNow(3).toISOString());
            const durationMin = payload.suggested_duration_minutes || 120;
            const endTime = new Date(startTime.getTime() + durationMin * 60 * 1000);
            const meetingData: any = {
                organization_id: orgId, title: payload.suggested_title || action.title,
                type: payload.meeting_type || 'site_supervision',
                start_time: startTime.toISOString(), end_time: endTime.toISOString(),
                scheduled_at: startTime.toISOString(), duration_minutes: durationMin,
                status: 'scheduled', description: `נוצר ע"י סוכן AI — ${action.description || ''}`,
            };
            if (action.entity_type === 'project' && action.entity_id) meetingData.project_id = action.entity_id;
            if (payload.client_id) meetingData.client_id = payload.client_id;
            if (userId) meetingData.created_by = userId;
            const { data: meeting, error: meetingError } = await supabase.from('meetings').insert(meetingData).select().single();
            if (meetingError) throw new Error(`Failed to create meeting: ${meetingError.message}`);
            created = meeting; createdType = 'meeting'; break;
        }
        case 'create_task': {
            const taskData: any = {
                organization_id: orgId, title: payload.task_title || action.title,
                description: payload.task_description || action.description || '',
                status: 'todo', priority: payload.task_priority || 'medium',
                due_date: payload.task_due_date || businessDaysFromNow(3).toISOString().split('T')[0],
                metadata: { created_by_agent: true, action_id: actionId },
            };
            if (action.entity_type === 'project' && action.entity_id) taskData.project_id = action.entity_id;
            if (userId) { taskData.assigned_to = userId; taskData.created_by = userId; }
            const { data: task, error: taskError } = await supabase.from('tasks').insert(taskData).select().single();
            if (taskError) throw new Error(`Failed to create task: ${taskError.message}`);
            created = task; createdType = 'task'; break;
        }
        case 'escalate_tasks': {
            const taskIds = payload.overdue_task_ids || [];
            if (taskIds.length > 0) {
                const { error: escError } = await supabase.from('tasks').update({ priority: 'urgent', updated_at: new Date().toISOString() }).in('id', taskIds);
                if (escError) throw new Error(`Failed to escalate tasks: ${escError.message}`);
                created = { escalated_count: taskIds.length, task_ids: taskIds }; createdType = 'escalation';
            }
            break;
        }
        case 'create_review_task': {
            const taskData: any = {
                organization_id: orgId, title: `סקירה — ${payload.project_name || payload.phase_name || action.title}`,
                description: action.description || '', status: 'todo', priority: 'high',
                due_date: businessDaysFromNow(2).toISOString().split('T')[0],
                metadata: { created_by_agent: true, action_id: actionId },
            };
            if (action.entity_type === 'project' && action.entity_id) taskData.project_id = action.entity_id;
            if (userId) { taskData.assigned_to = userId; taskData.created_by = userId; }
            const { data: task, error: taskError } = await supabase.from('tasks').insert(taskData).select().single();
            if (taskError) throw new Error(`Failed to create review task: ${taskError.message}`);
            created = task; createdType = 'task'; break;
        }
        default: { createdType = 'acknowledged'; created = null; break; }
    }

    // Mark as executed
    const updateData: any = { status: 'executed', executed_at: new Date().toISOString() };
    if (userId) { updateData.approved_by = userId; updateData.approved_at = new Date().toISOString(); }
    await supabase.from('agent_actions_log').update(updateData).eq('id', actionId);

    const resultMessages: Record<string, string> = {
        meeting: `נוצרה פגישה: "${created?.title || ''}" ל-${created?.scheduled_at ? new Date(created.scheduled_at).toLocaleDateString('he-IL') : ''}`,
        task: `נוצרה משימה: "${created?.title || ''}" (עד ${created?.due_date || ''})`,
        escalation: `${created?.escalated_count || 0} משימות הוסלמו לעדיפות דחופה`,
        acknowledged: 'סומן כטופל',
    };

    return { success: true, created_type: createdType, created, message_he: resultMessages[createdType] || 'בוצע' };
}

// ===== MAIN HANDLER =====
Deno.serve(async (req: Request) => {
    if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

    try {
        const url = new URL(req.url);
        const path = url.pathname.split('/').pop();
        const supabase = getServiceClient();
        const body = await req.json().catch(() => ({}));
        const orgId = body.organization_id;

        if (path === 'execute-action') {
            const { action_id, user_id } = body;
            if (!action_id) return new Response(JSON.stringify({ error: 'action_id is required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
            const result = await executeAction(supabase, action_id, user_id);
            return new Response(JSON.stringify(result), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        if (!orgId) return new Response(JSON.stringify({ error: 'organization_id is required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

        let result: any;
        switch (path) {
            case 'analyze-projects': { const a = await analyzeProjects(supabase, orgId); const l = await logActions(supabase, orgId, a); result = { alerts: a, logged: l.logged }; break; }
            case 'analyze-leads': { const a = await analyzeLeads(supabase, orgId); const l = await logActions(supabase, orgId, a); result = { alerts: a, logged: l.logged }; break; }
            case 'analyze-finance': { const a = await analyzeFinance(supabase, orgId); const l = await logActions(supabase, orgId, a); result = { alerts: a, logged: l.logged }; break; }
            case 'analyze-clients': { const a = await analyzeClients(supabase, orgId); const l = await logActions(supabase, orgId, a); result = { alerts: a, logged: l.logged }; break; }
            case 'analyze-scheduling': { const a = await analyzeScheduling(supabase, orgId); const l = await logActions(supabase, orgId, a); result = { alerts: a, logged: l.logged }; break; }
            case 'daily-briefing': { const b = await generateDailyBriefing(supabase, orgId); const l = await logActions(supabase, orgId, b.alerts); result = { ...b, logged: l.logged }; break; }
            case 'get-actions': {
                const status = body.status || 'pending';
                const { data: actions } = await supabase.from('agent_actions_log').select('*').eq('organization_id', orgId).eq('status', status).order('created_at', { ascending: false }).limit(body.limit || 50);
                result = { actions: actions || [] }; break;
            }
            case 'update-action': {
                const { action_id, new_status, approved_by } = body;
                if (!action_id || !new_status) return new Response(JSON.stringify({ error: 'action_id and new_status required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
                const updateData: any = { status: new_status };
                if (new_status === 'approved') { updateData.approved_by = approved_by; updateData.approved_at = new Date().toISOString(); }
                if (new_status === 'executed') { updateData.executed_at = new Date().toISOString(); }
                const { data: updated, error: updateError } = await supabase.from('agent_actions_log').update(updateData).eq('id', action_id).select().single();
                if (updateError) throw updateError;
                result = { action: updated }; break;
            }
            default:
                return new Response(JSON.stringify({ error: 'Unknown endpoint', available: ['analyze-projects', 'analyze-leads', 'analyze-finance', 'analyze-clients', 'analyze-scheduling', 'daily-briefing', 'get-actions', 'update-action', 'execute-action'] }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        return new Response(JSON.stringify(result), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    } catch (error) {
        console.error('Agent brain error:', error);
        return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
});
