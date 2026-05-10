'use client';

import { useState, useEffect } from 'react';
import { Copy, Check, RefreshCw, ExternalLink, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

interface LeadFormSettingsProps {
    organizationId: string;
}

export function LeadFormSettings({ organizationId }: LeadFormSettingsProps) {
    const [token, setToken] = useState<string | null>(null);
    const [copied, setCopied] = useState<string | null>(null);
    const [generating, setGenerating] = useState(false);
    const [loading, setLoading] = useState(true);

    // Load existing token on mount
    useEffect(() => {
        async function loadToken() {
            try {
                const res = await fetch(`/api/leads/submit?org_id=${organizationId}`, { method: 'GET' });
                if (res.ok) {
                    const data = await res.json();
                    setToken(data.api_token || null);
                }
            } catch { /* no token yet */ }
            setLoading(false);
        }
        loadToken();
    }, [organizationId]);

    const formUrl = token
        ? `${typeof window !== 'undefined' ? window.location.origin : ''}/lead-form?org=${organizationId}&token=${token}`
        : '';

    const iframeCode = token
        ? `<iframe src="${formUrl}" width="100%" height="700" frameborder="0" style="border-radius: 16px; box-shadow: 0 4px 24px rgba(0,0,0,0.08);"></iframe>`
        : '';

    async function generateToken() {
        setGenerating(true);
        try {
            const res = await fetch('/api/leads/submit', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ org_id: organizationId }),
            });
            const data = await res.json();
            if (data.api_token) {
                setToken(data.api_token);
            }
        } catch (err) {
            console.error('Failed to generate token:', err);
        } finally {
            setGenerating(false);
        }
    }

    async function copyToClipboard(text: string, label: string) {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(label);
            setTimeout(() => setCopied(null), 2000);
        } catch {
            // Fallback
            const textarea = document.createElement('textarea');
            textarea.value = text;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            setCopied(label);
            setTimeout(() => setCopied(null), 2000);
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <QrCode className="w-5 h-5" />
                    טופס קליטת לידים
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <p className="text-sm text-muted-foreground">
                    צור/י טופס ציבורי שאפשר לשתף — כל פנייה שנשלחת דרכו תיכנס אוטומטית ללידים שלך.
                    אפשר לשתף קישור ישיר או להטמיע את הטופס באתר שלך.
                </p>

                {!token ? (
                    <div className="text-center py-6">
                        <p className="text-muted-foreground mb-4">
                            עדיין לא נוצר טוקן גישה לארגון זה
                        </p>
                        <Button onClick={generateToken} disabled={generating}>
                            {generating ? (
                                <RefreshCw className="w-4 h-4 ml-2 animate-spin" />
                            ) : null}
                            צור טוקן גישה
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {/* Direct Link */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">קישור ישיר לטופס</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    readOnly
                                    value={formUrl}
                                    className="flex-1 px-3 py-2 text-sm border rounded-lg bg-muted/30"
                                />
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => copyToClipboard(formUrl, 'link')}
                                >
                                    {copied === 'link' ? (
                                        <Check className="w-4 h-4 text-green-500" />
                                    ) : (
                                        <Copy className="w-4 h-4" />
                                    )}
                                </Button>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => window.open(formUrl, '_blank')}
                                >
                                    <ExternalLink className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Iframe Embed */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">הטמעה באתר (iframe)</label>
                            <div className="flex gap-2">
                                <textarea
                                    readOnly
                                    value={iframeCode}
                                    className="flex-1 px-3 py-2 text-xs border rounded-lg bg-muted/30 font-mono min-h-[60px]"
                                />
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => copyToClipboard(iframeCode, 'iframe')}
                                    className="shrink-0 self-start"
                                >
                                    {copied === 'iframe' ? (
                                        <Check className="w-4 h-4 text-green-500" />
                                    ) : (
                                        <Copy className="w-4 h-4" />
                                    )}
                                </Button>
                            </div>
                        </div>

                        {/* API Token */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">API Token</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    readOnly
                                    value={token}
                                    className="flex-1 px-3 py-2 text-sm border rounded-lg bg-muted/30 font-mono"
                                />
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => copyToClipboard(token, 'token')}
                                >
                                    {copied === 'token' ? (
                                        <Check className="w-4 h-4 text-green-500" />
                                    ) : (
                                        <Copy className="w-4 h-4" />
                                    )}
                                </Button>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                לשימוש בAPI — שלח/י POST ל<code className="bg-muted px-1 rounded">/api/leads/submit</code> עם org_id, api_token, וname
                            </p>
                        </div>

                        {/* Regenerate */}
                        <div className="pt-2 border-t">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={generateToken}
                                disabled={generating}
                                className="text-muted-foreground"
                            >
                                {generating ? (
                                    <RefreshCw className="w-4 h-4 ml-2 animate-spin" />
                                ) : (
                                    <RefreshCw className="w-4 h-4 ml-2" />
                                )}
                                רענן טוקן (הקישור הישן יפסיק לעבוד)
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
