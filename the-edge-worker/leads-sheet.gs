/**
 * The Edge — lead capture endpoint (Google Apps Script web app).
 *
 * Receives POSTs from the Worker's recordLead() and appends one row per lead to
 * a Google Sheet. Handles both completed leads (type: "complete") and warm
 * mid-session drop-offs (type: "save").
 *
 * ── One-time setup ──────────────────────────────────────────────────────────
 * 1. Create a Google Sheet. In the first tab, add this header row (row 1):
 *      Timestamp | Type | Email | Product | Goal | Blocker | Tailwind |
 *      One-liner | User | Obstacle | Struggle | Just Cause | Solution |
 *      Process | Next Step | Cost | Transformation | Locked count | Resume URL
 * 2. Extensions → Apps Script. Replace the default file with this whole file.
 * 3. Set a shared secret below (SECRET) — any random string.
 * 4. Deploy → New deployment → type "Web app":
 *      - Execute as: Me
 *      - Who has access: Anyone
 *    Copy the resulting /exec URL.
 * 5. On the Worker, set two secrets (values are NOT committed to the repo):
 *      echo -n '<the /exec URL>' | npx wrangler secret put LEADS_WEBHOOK_URL
 *      echo -n '<the same SECRET>' | npx wrangler secret put LEADS_WEBHOOK_SECRET
 *    (or via the Cloudflare dashboard → Worker → Settings → Variables).
 * Done. Leads start landing in the Sheet on the next completion/save.
 */

const SECRET = 'CHANGE_ME'; // must match the Worker's LEADS_WEBHOOK_SECRET

// Answer keys in the column order of the header row above.
const ANSWER_KEYS = ['01', '02a', '02b', '02c', '03', '04', '05', '06', '07'];

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    if (SECRET && data.secret !== SECRET) {
      return ContentService.createTextOutput('forbidden');
    }

    const answers = data.answers || {};
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];

    const row = [
      data.completedAt || data.savedAt || new Date().toISOString(),
      data.type || '',
      data.email || '',
      data.product || answers['00'] || '',
      data.goal || '',
      data.blocker || '',
      data.tailwind || '',
      data.oneLiner || '',
    ];
    ANSWER_KEYS.forEach(function (k) { row.push(answers[k] || ''); });
    row.push(data.lockedCount != null ? data.lockedCount : '');
    row.push(data.resumeUrl || '');

    sheet.appendRow(row);
    return ContentService.createTextOutput('ok');
  } catch (err) {
    return ContentService.createTextOutput('error: ' + err);
  }
}
