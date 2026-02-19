import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const OPENAI_KEY = process.env.OPENAI_API_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Natural language → structured action via OpenAI
interface ParsedCommand {
    action: 'create_task' | 'create_lead' | 'add_time' | 'create_meeting' | 'update_project_status' | 'unknown';
    data: Record<string, string | number | boolean | null>;
    summary_he: string; // Hebrew summary of what will be done
}

async function parseCommandWithAI(message: string, organizationId: string): Promise<ParsedCommand> {
    if (!OPENAI_KEY) {
        return { action: 'unknown', data: {}, summary_he: 'מפתח OpenAI לא מוגדר' };
    }

    // Fetch org data needed for context (project names, client names)
    const [{ data: projects }, { data: clients }] = await Promise.all([
        supabase.from('projects').select('id, name').eq('organization_id', organizationId).limit(20),
        supabase.from('clients').select('id, name').eq('organization_id', organizationId).limit(20),
    ]);

    const projectList = (projects || []).map((p: { id: string; name: string }) => `${p.name} (id: ${p.id})`).join(', ');
    const clientList = (clients || []).map((c: { id: string; name: string }) => `${c.name} (id: ${c.id})`).join(', ');

    const systemPrompt = `אתה עוזר AI לפלטפורמת ניהול אדריכלים ומעצבי פנים.

פרויקטים קיימים: ${projectList || 'אין'}
לקוחות קיימים: ${clientList || 'אין'}

משתמש כותב פקודה בשפה חופשית. עליך לפרש אותה לאחת מהפעולות הבאות ולהחזיר JSON בלבד:

{
  "action": "create_task" | "create_lead" | "add_time" | "create_meeting" | "update_project_status" | "unknown",
  "data": { ... שדות רלוונטיים ... },
  "summary_he": "תיאור קצר בעברית של מה שתבוצע"
}

שדות אפשריים לכל פעולה:
- create_task: { title, project_id?, description?, priority: "low"|"medium"|"high"|"urgent" }
- create_lead: { name, company?, budget?, description?, status: "new" }
- add_time: { description, hours, project_id?, date }
- create_meeting: { title, scheduled_at (ISO), location?, meeting_type }
- update_project_status: { project_id, status: "planning"|"active"|"on_hold"|"completed"|"cancelled" }
- unknown: {} (אם לא הבנת)

ענה JSON בלבד ללא markdown.`;

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${OPENAI_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: 'gpt-4o-mini',
            temperature: 0,
            response_format: { type: 'json_object' },
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: message },
            ],
        }),
    });

    if (!res.ok) {
        throw new Error(`OpenAI error: ${res.status}`);
    }

    const json = await res.json();
    try {
        return JSON.parse(json.choices[0].message.content) as ParsedCommand;
    } catch {
        return { action: 'unknown', data: {}, summary_he: 'לא הצלחתי לפרש את הפקודה' };
    }
}

async function executeCommand(
    parsed: ParsedCommand,
    organizationId: string,
    userId: string
): Promise<{ success: boolean; result: Record<string, unknown>; message_he: string }> {
    const d = parsed.data;

    switch (parsed.action) {
        case 'create_task': {
            const today = new Date().toISOString().split('T')[0];
            const { data, error } = await supabase.from('tasks').insert({
                organization_id: organizationId,
                created_by: userId,
                project_id: d.project_id || null,
                title: d.title || 'משימה חדשה',
                description: d.description || null,
                priority: d.priority || 'medium',
                status: 'todo',
                due_date: d.due_date || null,
            }).select().single();
            if (error) throw new Error(error.message);
            return { success: true, result: data, message_he: `✅ משימה "${d.title}" נוצרה בהצלחה` };
        }

        case 'create_lead': {
            const { data, error } = await supabase.from('leads').insert({
                organization_id: organizationId,
                created_by: userId,
                name: d.name || 'ליד חדש',
                company: d.company || null,
                budget: d.budget ? Number(d.budget) : null,
                description: d.description || null,
                status: 'new',
            }).select().single();
            if (error) throw new Error(error.message);
            return { success: true, result: data, message_he: `✅ ליד "${d.name}" נוצר בהצלחה` };
        }

        case 'add_time': {
            const { data, error } = await supabase.from('time_entries').insert({
                organization_id: organizationId,
                user_id: userId,
                project_id: d.project_id || null,
                description: d.description || null,
                hours: Number(d.hours) || 1,
                date: d.date || new Date().toISOString().split('T')[0],
                billable: true,
            }).select().single();
            if (error) throw new Error(error.message);
            return { success: true, result: data, message_he: `✅ ${d.hours} שעות נרשמו בהצלחה` };
        }

        case 'create_meeting': {
            const { data, error } = await supabase.from('meetings').insert({
                organization_id: organizationId,
                created_by: userId,
                title: d.title || 'פגישה',
                scheduled_at: d.scheduled_at || new Date().toISOString(),
                location: d.location || null,
                meeting_type: d.meeting_type || 'other',
                status: 'scheduled',
            }).select().single();
            if (error) throw new Error(error.message);
            return { success: true, result: data, message_he: `✅ פגישה "${d.title}" נוצרה בהצלחה` };
        }

        case 'update_project_status': {
            const { data, error } = await supabase.from('projects').update({
                status: d.status,
                updated_at: new Date().toISOString(),
            }).eq('id', d.project_id as string).eq('organization_id', organizationId).select().single();
            if (error) throw new Error(error.message);
            return { success: true, result: data, message_he: `✅ סטטוס הפרויקט עודכן ל"${d.status}"` };
        }

        default:
            return { success: false, result: {}, message_he: '❓ לא הצלחתי לפרש את הפקודה. נסה לנסח אחרת.' };
    }
}

export async function POST(req: NextRequest) {
    try {
        const { message, organizationId, userId } = await req.json();

        if (!message || !organizationId || !userId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Parse the intent
        const parsed = await parseCommandWithAI(message, organizationId);

        // Execute the action
        const result = await executeCommand(parsed, organizationId, userId);

        return NextResponse.json({
            action: parsed.action,
            summary_he: parsed.summary_he,
            ...result,
        });
    } catch (err) {
        console.error('[AI Command]', err);
        return NextResponse.json(
            { error: err instanceof Error ? err.message : 'Internal error', success: false, message_he: '❌ אירעה שגיאה בעיבוד הפקודה' },
            { status: 500 }
        );
    }
}
