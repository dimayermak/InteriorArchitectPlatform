import { NextRequest, NextResponse } from 'next/server';
import { generatePortalToken, getPortalLink } from '@/lib/api/portal';

export async function POST(req: NextRequest) {
    try {
        const { projectId } = await req.json();
        if (!projectId) {
            return NextResponse.json({ error: 'projectId is required' }, { status: 400 });
        }

        const token = await generatePortalToken(projectId);
        const baseUrl = req.nextUrl.origin;
        const link = `${baseUrl}/portal/${token}`;

        return NextResponse.json({ token, link });
    } catch (err) {
        console.error('Error generating portal token:', err);
        return NextResponse.json({ error: 'Failed to generate token' }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    try {
        const projectId = req.nextUrl.searchParams.get('projectId');
        if (!projectId) {
            return NextResponse.json({ error: 'projectId is required' }, { status: 400 });
        }

        const baseUrl = req.nextUrl.origin;
        const link = await getPortalLink(projectId, baseUrl);

        return NextResponse.json({ link });
    } catch (err) {
        console.error('Error fetching portal link:', err);
        return NextResponse.json({ error: 'Failed to fetch link' }, { status: 500 });
    }
}
