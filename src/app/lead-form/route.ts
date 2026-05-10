import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Public embeddable lead form — serves an HTML page with a form
// URL: /lead-form?org=ORG_ID&token=API_TOKEN
// Can be used as: iframe src, direct link, or embedded on external sites

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const orgId = searchParams.get('org');
    const token = searchParams.get('token');

    if (!orgId || !token) {
        return new NextResponse('Missing org or token parameter', { status: 400 });
    }

    // Verify org exists and token is valid
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { data: org } = await supabase
        .from('organizations')
        .select('id, name')
        .eq('id', orgId)
        .single();

    if (!org) {
        return new NextResponse('Organization not found', { status: 404 });
    }

    // Verify token from api_tokens table
    const { data: tokenRecord } = await supabase
        .from('api_tokens')
        .select('id')
        .eq('token', token)
        .eq('organization_id', orgId)
        .eq('is_active', true)
        .single();

    if (!tokenRecord) {
        return new NextResponse('Invalid token', { status: 403 });
    }

    // Serve the form HTML
    const html = generateFormHTML(org.name, orgId, token);
    
    return new NextResponse(html, {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
}

function generateFormHTML(orgName: string, orgId: string, token: string): string {
    return `<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>יצירת קשר — ${orgName}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Rubik', sans-serif;
            background: #f8f9fc;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        .form-container {
            background: white;
            border-radius: 16px;
            box-shadow: 0 4px 24px rgba(0,0,0,0.08);
            padding: 32px;
            width: 100%;
            max-width: 480px;
        }
        .form-header {
            text-align: center;
            margin-bottom: 24px;
        }
        .form-header h1 {
            font-size: 24px;
            font-weight: 700;
            color: #1a1b2e;
            margin-bottom: 8px;
        }
        .form-header p {
            color: #6b7280;
            font-size: 14px;
        }
        .field {
            margin-bottom: 16px;
        }
        label {
            display: block;
            font-size: 14px;
            font-weight: 500;
            color: #374151;
            margin-bottom: 6px;
        }
        input, select, textarea {
            width: 100%;
            padding: 10px 14px;
            border: 1px solid #d1d5db;
            border-radius: 8px;
            font-size: 14px;
            direction: rtl;
            transition: border-color 0.2s, box-shadow 0.2s;
        }
        input:focus, select:focus, textarea:focus {
            outline: none;
            border-color: #8b5cf6;
            box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
        }
        textarea { min-height: 80px; resize: vertical; }
        .row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .submit-btn {
            width: 100%;
            padding: 12px;
            background: linear-gradient(135deg, #8b5cf6, #a855f7);
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.1s, box-shadow 0.2s;
            margin-top: 8px;
        }
        .submit-btn:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
        }
        .submit-btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none;
        }
        .success-msg {
            display: none;
            text-align: center;
            padding: 32px 16px;
        }
        .success-msg .icon {
            font-size: 48px;
            margin-bottom: 16px;
        }
        .success-msg h2 {
            font-size: 20px;
            color: #1a1b2e;
            margin-bottom: 8px;
        }
        .success-msg p {
            color: #6b7280;
            font-size: 14px;
        }
        .error-msg {
            background: #fef2f2;
            color: #dc2626;
            padding: 12px;
            border-radius: 8px;
            font-size: 14px;
            margin-bottom: 16px;
            display: none;
        }
        .powered-by {
            text-align: center;
            margin-top: 16px;
            font-size: 12px;
            color: #9ca3af;
        }
        .powered-by a { color: #8b5cf6; text-decoration: none; }
    </style>
</head>
<body>
    <div class="form-container">
        <div id="formSection">
            <div class="form-header">
                <h1>צור/י קשר</h1>
                <p>נשמח לשמוע על הפרויקט שלך — מלא/י פרטים ונחזור אליך בהקדם</p>
            </div>
            <div class="error-msg" id="errorMsg"></div>
            <form id="leadForm">
                <div class="field">
                    <label for="name">שם מלא *</label>
                    <input type="text" id="name" name="name" required placeholder="שם פרטי ומשפחה">
                </div>
                <div class="row">
                    <div class="field">
                        <label for="email">אימייל</label>
                        <input type="email" id="email" name="email" placeholder="name@example.com">
                    </div>
                    <div class="field">
                        <label for="phone">טלפון</label>
                        <input type="tel" id="phone" name="phone" placeholder="050-0000000">
                    </div>
                </div>
                <div class="field">
                    <label for="project_type">סוג הפרויקט</label>
                    <select id="project_type" name="project_type">
                        <option value="">בחר/י...</option>
                        <option value="interior_design">עיצוב פנים</option>
                        <option value="architecture">אדריכלות</option>
                        <option value="renovation">שיפוץ</option>
                        <option value="consultation">ייעוץ</option>
                        <option value="other">אחר</option>
                    </select>
                </div>
                <div class="field">
                    <label for="budget_range">טווח תקציב משוער</label>
                    <select id="budget_range" name="budget_range">
                        <option value="">בחר/י...</option>
                        <option value="under_50k">עד 50,000 ש"ח</option>
                        <option value="50k_150k">50,000 - 150,000 ש"ח</option>
                        <option value="150k_300k">150,000 - 300,000 ש"ח</option>
                        <option value="300k_500k">300,000 - 500,000 ש"ח</option>
                        <option value="over_500k">מעל 500,000 ש"ח</option>
                    </select>
                </div>
                <div class="field">
                    <label for="location">מיקום הפרויקט</label>
                    <input type="text" id="location" name="location" placeholder="עיר / אזור">
                </div>
                <div class="field">
                    <label for="notes">ספר/י לנו על הפרויקט</label>
                    <textarea id="notes" name="notes" placeholder="מה תרצו שנבין לפני הפגישה הראשונה?"></textarea>
                </div>
                <button type="submit" class="submit-btn" id="submitBtn">שליחה</button>
            </form>
        </div>
        <div class="success-msg" id="successMsg">
            <div class="icon">✨</div>
            <h2>תודה שפנית אלינו!</h2>
            <p>קיבלנו את הפרטים שלך ונחזור אליך תוך 24 שעות.</p>
        </div>
        <div class="powered-by">מופעל ע"י <a href="https://harmonica-ten.vercel.app" target="_blank">Harmonica</a></div>
    </div>
    <script>
        const form = document.getElementById('leadForm');
        const submitBtn = document.getElementById('submitBtn');
        const errorMsg = document.getElementById('errorMsg');
        const formSection = document.getElementById('formSection');
        const successMsg = document.getElementById('successMsg');

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            submitBtn.disabled = true;
            submitBtn.textContent = 'שולח...';
            errorMsg.style.display = 'none';

            const formData = new FormData(form);
            const data = {
                org_id: '${orgId}',
                api_token: '${token}',
                name: formData.get('name'),
                email: formData.get('email'),
                phone: formData.get('phone'),
                project_type: formData.get('project_type'),
                budget_range: formData.get('budget_range'),
                location: formData.get('location'),
                notes: formData.get('notes'),
                source: 'web_form',
            };

            try {
                const res = await fetch('/api/leads/submit', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data),
                });

                const result = await res.json();

                if (res.ok) {
                    formSection.style.display = 'none';
                    successMsg.style.display = 'block';
                } else {
                    errorMsg.textContent = result.error || 'שגיאה בשליחה, נסו שוב';
                    errorMsg.style.display = 'block';
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'שליחה';
                }
            } catch (err) {
                errorMsg.textContent = 'שגיאת רשת, נסו שוב';
                errorMsg.style.display = 'block';
                submitBtn.disabled = false;
                submitBtn.textContent = 'שליחה';
            }
        });
    </script>
</body>
</html>`;
}
