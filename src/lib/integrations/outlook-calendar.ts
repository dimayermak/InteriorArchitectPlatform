'use server';

/**
 * Microsoft Outlook Calendar Integration
 * 
 * OAuth 2.0 flow for Microsoft Graph API
 * Requires MICROSOFT_CLIENT_ID, MICROSOFT_CLIENT_SECRET, MICROSOFT_REDIRECT_URI
 */

const MICROSOFT_AUTH_URL = 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize';
const MICROSOFT_TOKEN_URL = 'https://login.microsoftonline.com/common/oauth2/v2.0/token';
const GRAPH_API = 'https://graph.microsoft.com/v1.0';

const SCOPES = [
    'Calendars.ReadWrite',
    'offline_access',
];

interface MicrosoftTokens {
    access_token: string;
    refresh_token?: string;
    expires_in: number;
    token_type: string;
}

interface OutlookEvent {
    id?: string;
    subject: string;
    body?: { contentType: string; content: string };
    start: { dateTime: string; timeZone: string };
    end: { dateTime: string; timeZone: string };
    location?: { displayName: string };
    attendees?: Array<{ emailAddress: { address: string; name?: string } }>;
}

/**
 * Generate Microsoft OAuth authorization URL
 */
export async function getMicrosoftAuthUrl(redirectUri?: string): Promise<string> {
    const clientId = process.env.MICROSOFT_CLIENT_ID;
    const redirect = redirectUri || process.env.MICROSOFT_REDIRECT_URI;

    if (!clientId || !redirect) {
        throw new Error('Microsoft OAuth credentials not configured');
    }

    const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirect,
        response_type: 'code',
        scope: SCOPES.join(' '),
        response_mode: 'query',
    });

    return `${MICROSOFT_AUTH_URL}?${params.toString()}`;
}

/**
 * Exchange authorization code for tokens
 */
export async function exchangeMicrosoftCode(code: string, redirectUri?: string): Promise<MicrosoftTokens> {
    const clientId = process.env.MICROSOFT_CLIENT_ID;
    const clientSecret = process.env.MICROSOFT_CLIENT_SECRET;
    const redirect = redirectUri || process.env.MICROSOFT_REDIRECT_URI;

    if (!clientId || !clientSecret || !redirect) {
        throw new Error('Microsoft OAuth credentials not configured');
    }

    const response = await fetch(MICROSOFT_TOKEN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            code,
            client_id: clientId,
            client_secret: clientSecret,
            redirect_uri: redirect,
            grant_type: 'authorization_code',
        }),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Token exchange failed: ${error}`);
    }

    return response.json();
}

/**
 * Refresh access token using refresh token
 */
export async function refreshMicrosoftToken(refreshToken: string): Promise<MicrosoftTokens> {
    const clientId = process.env.MICROSOFT_CLIENT_ID;
    const clientSecret = process.env.MICROSOFT_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        throw new Error('Microsoft OAuth credentials not configured');
    }

    const response = await fetch(MICROSOFT_TOKEN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            refresh_token: refreshToken,
            client_id: clientId,
            client_secret: clientSecret,
            grant_type: 'refresh_token',
        }),
    });

    if (!response.ok) {
        throw new Error('Token refresh failed');
    }

    return response.json();
}

/**
 * Create event in Outlook Calendar
 */
export async function createOutlookEvent(
    accessToken: string,
    event: OutlookEvent
): Promise<OutlookEvent> {
    const response = await fetch(
        `${GRAPH_API}/me/calendar/events`,
        {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(event),
        }
    );

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to create event: ${error}`);
    }

    return response.json();
}

/**
 * Update event in Outlook Calendar
 */
export async function updateOutlookEvent(
    accessToken: string,
    eventId: string,
    event: Partial<OutlookEvent>
): Promise<OutlookEvent> {
    const response = await fetch(
        `${GRAPH_API}/me/calendar/events/${eventId}`,
        {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(event),
        }
    );

    if (!response.ok) {
        throw new Error('Failed to update event');
    }

    return response.json();
}

/**
 * Delete event from Outlook Calendar
 */
export async function deleteOutlookEvent(
    accessToken: string,
    eventId: string
): Promise<void> {
    const response = await fetch(
        `${GRAPH_API}/me/calendar/events/${eventId}`,
        {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        }
    );

    if (!response.ok && response.status !== 404) {
        throw new Error('Failed to delete event');
    }
}

/**
 * List events from Outlook Calendar
 */
export async function listOutlookEvents(
    accessToken: string,
    startDateTime?: string,
    endDateTime?: string
): Promise<OutlookEvent[]> {
    let url = `${GRAPH_API}/me/calendar/events?$orderby=start/dateTime`;

    if (startDateTime && endDateTime) {
        url = `${GRAPH_API}/me/calendarview?startDateTime=${startDateTime}&endDateTime=${endDateTime}&$orderby=start/dateTime`;
    }

    const response = await fetch(url, {
        headers: {
            'Authorization': `Bearer ${accessToken}`,
        },
    });

    if (!response.ok) {
        throw new Error('Failed to list events');
    }

    const data = await response.json();
    return data.value || [];
}

/**
 * Convert Meeting to Outlook Event format
 */
export function meetingToOutlookEvent(meeting: {
    title: string;
    description?: string | null;
    scheduled_at: string;
    duration_minutes: number;
    location?: string | null;
}): OutlookEvent {
    const start = new Date(meeting.scheduled_at);
    const end = new Date(start.getTime() + meeting.duration_minutes * 60 * 1000);

    return {
        subject: meeting.title,
        body: meeting.description ? {
            contentType: 'text',
            content: meeting.description,
        } : undefined,
        start: { dateTime: start.toISOString().slice(0, -1), timeZone: 'Asia/Jerusalem' },
        end: { dateTime: end.toISOString().slice(0, -1), timeZone: 'Asia/Jerusalem' },
        location: meeting.location ? { displayName: meeting.location } : undefined,
    };
}
