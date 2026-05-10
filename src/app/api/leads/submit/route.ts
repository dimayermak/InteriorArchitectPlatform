import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Public lead submission endpoint.
// Protected by an API token stored in the api_tokens table.

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { 
            org_id, 
            api_token, 
            name, 
            email, 
            phone, 
            company, 
            source, 
            notes,
            project_type,
            budget_range,
            location,
        } = body;

        if (!org_id || !api_token || !name) {
            return NextResponse.json(
                { error: 'Missing required fields: org_id, api_token, name' },
                { status: 400 }
            );
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // Verify token from api_tokens table
        const { data: tokenRecord, error: tokenError } = await supabase
            .from('api_tokens')
            .select('id, organization_id')
            .eq('token', api_token)
            .eq('organization_id', org_id)
            .eq('is_active', true)
            .single();

        if (tokenError || !tokenRecord) {
            return NextResponse.json(
                { error: 'Invalid API token' },
                { status: 403 }
            );
        }

        // Update last_used_at (fire and forget)
        supabase.from('api_tokens').update({ last_used_at: new Date().toISOString() }).eq('id', tokenRecord.id);

        // Build notes with extra metadata
        const extraNotes = [
            notes,
            project_type ? `סוג פרויקט: ${project_type}` : null,
            budget_range ? `טווח תקציב: ${budget_range}` : null,
            location ? `מיקום: ${location}` : null,
        ].filter(Boolean).join('\n');

        const { data: lead, error: leadError } = await supabase
            .from('leads')
            .insert({
                organization_id: org_id,
                name: name.trim(),
                email: email?.trim() || null,
                phone: phone?.trim() || null,
                company: company?.trim() || null,
                source: source?.trim() || 'web_form',
                status: 'new',
                notes: extraNotes || null,
            })
            .select()
            .single();

        if (leadError) {
            console.error('Failed to create lead:', leadError);
            return NextResponse.json(
                { error: 'Failed to create lead' },
                { status: 500 }
            );
        }

        return NextResponse.json({ 
            success: true, 
            lead_id: lead.id,
            message: 'Lead created successfully' 
        }, { status: 201 });

    } catch (error) {
        console.error('Lead submission error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// Generate a new API token for an organization
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { org_id } = body;

        if (!org_id) {
            return NextResponse.json(
                { error: 'Missing org_id' },
                { status: 400 }
            );
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // Deactivate old tokens
        await supabase
            .from('api_tokens')
            .update({ is_active: false })
            .eq('organization_id', org_id)
            .eq('name', 'lead_form');

        // Generate new token
        const newToken = generateToken();

        const { data, error } = await supabase
            .from('api_tokens')
            .insert({
                organization_id: org_id,
                name: 'lead_form',
                token: newToken,
                is_active: true,
            })
            .select()
            .single();

        if (error) {
            return NextResponse.json(
                { error: 'Failed to generate token' },
                { status: 500 }
            );
        }

        return NextResponse.json({ 
            success: true, 
            api_token: data.token 
        });

    } catch (error) {
        console.error('Token generation error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// Get current active token for an organization
export async function GET(request: NextRequest) {
    try {
        const orgId = request.nextUrl.searchParams.get('org_id');
        if (!orgId) {
            return NextResponse.json({ error: 'Missing org_id' }, { status: 400 });
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        const { data } = await supabase
            .from('api_tokens')
            .select('token, created_at')
            .eq('organization_id', orgId)
            .eq('name', 'lead_form')
            .eq('is_active', true)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        return NextResponse.json({ 
            api_token: data?.token || null,
            created_at: data?.created_at || null,
        });

    } catch {
        return NextResponse.json({ api_token: null });
    }
}

function generateToken(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => chars[byte % chars.length]).join('');
}
