'use server';

/**
 * Google Calendar Integration
 * 
 * OAuth 2.0 flow for Google Calendar sync
 * Requires GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI
 */

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_CALENDAR_API = 'https://www.googleapis.com/calendar/v3';

const SCOPES = [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/calendar.events',
];

interface GoogleTokens {
    access_token: string;
    refresh_token?: string;
    expires_in: number;
    token_type: string;
}

interface GoogleEvent {
    id?: string;
    summary: string;
    description?: string;
    start: { dateTime: string; timeZone?: string };
    end: { dateTime: string; timeZone?: string };
    location?: string;
    attendees?: Array<{ email: string }>;
}

/**
 * Generate Google OAuth authorization URL
 */
export async function getGoogleAuthUrl(redirectUri?: string): Promise<string> {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const redirect = redirectUri || process.env.GOOGLE_REDIRECT_URI;

    if (!clientId || !redirect) {
        throw new Error('Google OAuth credentials not configured');
    }

    const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirect,
        response_type: 'code',
        scope: SCOPES.join(' '),
        access_type: 'offline',
        prompt: 'consent',
    });

    return `${GOOGLE_AUTH_URL}?${params.toString()}`;
}

/**
 * Exchange authorization code for tokens
 */
export async function exchangeGoogleCode(code: string, redirectUri?: string): Promise<GoogleTokens> {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirect = redirectUri || process.env.GOOGLE_REDIRECT_URI;

    if (!clientId || !clientSecret || !redirect) {
        throw new Error('Google OAuth credentials not configured');
    }

    const response = await fetch(GOOGLE_TOKEN_URL, {
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
export async function refreshGoogleToken(refreshToken: string): Promise<GoogleTokens> {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        throw new Error('Google OAuth credentials not configured');
    }

    const response = await fetch(GOOGLE_TOKEN_URL, {
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
 * Create event in Google Calendar
 */
export async function createGoogleEvent(
    accessToken: string,
    event: GoogleEvent,
    calendarId: string = 'primary'
): Promise<GoogleEvent> {
    const response = await fetch(
        `${GOOGLE_CALENDAR_API}/calendars/${calendarId}/events`,
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
 * Update event in Google Calendar
 */
export async function updateGoogleEvent(
    accessToken: string,
    eventId: string,
    event: Partial<GoogleEvent>,
    calendarId: string = 'primary'
): Promise<GoogleEvent> {
    const response = await fetch(
        `${GOOGLE_CALENDAR_API}/calendars/${calendarId}/events/${eventId}`,
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
 * Delete event from Google Calendar
 */
export async function deleteGoogleEvent(
    accessToken: string,
    eventId: string,
    calendarId: string = 'primary'
): Promise<void> {
    const response = await fetch(
        `${GOOGLE_CALENDAR_API}/calendars/${calendarId}/events/${eventId}`,
        {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        }
    );

    if (!response.ok && response.status !== 410) {
        throw new Error('Failed to delete event');
    }
}

/**
 * List events from Google Calendar
 */
export async function listGoogleEvents(
    accessToken: string,
    calendarId: string = 'primary',
    timeMin?: string,
    timeMax?: string
): Promise<GoogleEvent[]> {
    const params = new URLSearchParams({
        singleEvents: 'true',
        orderBy: 'startTime',
    });

    if (timeMin) params.append('timeMin', timeMin);
    if (timeMax) params.append('timeMax', timeMax);

    const response = await fetch(
        `${GOOGLE_CALENDAR_API}/calendars/${calendarId}/events?${params.toString()}`,
        {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        }
    );

    if (!response.ok) {
        throw new Error('Failed to list events');
    }

    const data = await response.json();
    return data.items || [];
}

/**
 * Convert Meeting to Google Event format
 */
export function meetingToGoogleEvent(meeting: {
    title: string;
    description?: string | null;
    scheduled_at: string;
    duration_minutes: number;
    location?: string | null;
}): GoogleEvent {
    const start = new Date(meeting.scheduled_at);
    const end = new Date(start.getTime() + meeting.duration_minutes * 60 * 1000);

    return {
        summary: meeting.title,
        description: meeting.description || undefined,
        start: { dateTime: start.toISOString() },
        end: { dateTime: end.toISOString() },
        location: meeting.location || undefined,
    };
}
