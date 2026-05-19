import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Landing page contact form — no auth required.
// Saves leads to Harmonica's own org so Boss can see them in the dashboard.

const HARMONICA_ORG_ID = 'ulmankwcywixowwsvujf'; // Boss's main org

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, email, phone, studio_name, message, source } = body;

        if (!name?.trim()) {
            return NextResponse.json(
                { error: 'שדה שם הוא שדה חובה' },
                { status: 400 }
            );
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
        const supabase = createClient(supabaseUrl, serviceKey);

        // Build notes from all fields
        const notesParts = [
            message?.trim() || null,
            studio_name?.trim() ? `סטודיו: ${studio_name.trim()}` : null,
        ].filter(Boolean);

        const { error: leadError } = await supabase
            .from('leads')
            .insert({
                organization_id: HARMONICA_ORG_ID,
                name: name.trim(),
                email: email?.trim() || null,
                phone: phone?.trim() || null,
                company: studio_name?.trim() || null,
                source: source?.trim() || 'landing_page',
                status: 'new',
                notes: notesParts.join('\n') || null,
            });

        if (leadError) {
            console.error('Failed to create landing lead:', leadError);
            return NextResponse.json(
                { error: 'שגיאה בשמירת הפנייה' },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { success: true, message: 'Lead created successfully' },
            { status: 201 }
        );

    } catch (error) {
        console.error('Contact form error:', error);
        return NextResponse.json(
            { error: 'שגיאת שרת' },
            { status: 500 }
        );
    }
}

// Allow CORS for custom domain
export async function OPTIONS() {
    return new NextResponse(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        },
    });
}
