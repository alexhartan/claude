// Email templates for Resend. Inline styles only.

const BRAND = {
  navy: '#162140', navyDeep: '#0c3760', blueCard: '#1d4873',
  chalk: '#C2E2F2', white: '#ffffff', yellow: '#ffd400',
  highlight: '#49B4F2', blue: '#2e5073',
};

const MAP_ROWS = [
  ['THE BRAND', '00'], ['THE USER', '01'],
  ['THE OBSTACLE', '02a'], ['THE STRUGGLE', '02b'], ['THE JUST CAUSE', '02c'],
  ['THE SOLUTION', '03'], ['THE PROCESS', '04'], ['TAKING ACTION', '05'],
  ['THE COST OF INACTION', '06'], ['THE TRANSFORMATION', '07'],
];

function esc(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// The model writes numbered steps and paired CTAs as one run-on sentence with
// no literal newline ("...context. 2. Chat to..."), so there's nothing for a
// plain \n->  <br/> pass to preserve. Insert breaks before rendering: before
// each inline "N. " list marker, and before a "Transitional CTA:" /
// "Direct CTA:" that isn't already at the very start of the answer.
function normalizeAnswerBreaks(s) {
  let t = String(s || '');
  t = t.replace(/\.\s+(\d{1,2}\.\s)/g, '.\n$1');
  t = t.replace(/([^\n])\s+((?:Direct|Transitional) CTA:)/gi, '$1\n$2');
  return t;
}

// Escape AND break onto separate lines (process steps, dual CTAs, two-part
// transformations should stack, not run together on one line).
function escNl(s) {
  return esc(normalizeAnswerBreaks(s)).replace(/\n/g, '<br/>');
}

// Light-card design on navy. Fonts are email-safe stands-ins for the brand set:
// headings/body in a Helvetica/Arial stack, map values in Georgia serif.
const EMAIL_UI = {
  bg: '#0E3154',            // outer navy
  cardText: '#1d3557',      // serif values on white
  cardHeading: '#31639c',   // card H1 blue
  label: '#4a7fd4',         // row labels
  bodyGray: '#4a5568',      // card paragraphs
  divider: '#e3e8ef',       // row dividers on white
  link: '#2563c4',
  footerMuted: '#7d93b2',
};
const CALL_URL = 'https://www.galvanite.io/discovery?utm_source=edge&utm_medium=email&utm_campaign=signal-map';
const LOGO_EDGE = 'https://edge.galvanite.io/email/edge-logo.png';
const LOGO_GALVANITE = 'https://edge.galvanite.io/email/galvanite-logo.png';

export function renderSignalMapEmail({ product, oneLiner, answers }) {
  const sans = `'Helvetica Neue',Helvetica,Arial,sans-serif`;

  const row = (label, value) => `
    <tr><td style="padding:22px 0;border-bottom:1px solid ${EMAIL_UI.divider};">
      <div style="font-family:${sans};font-size:12px;font-weight:bold;letter-spacing:2px;color:${EMAIL_UI.label};text-transform:uppercase;margin-bottom:8px;">${esc(label)}</div>
      <div style="font-family:Georgia,serif;font-size:22px;line-height:1.45;color:${EMAIL_UI.cardText};">${escNl(value)}</div>
    </td></tr>`;

  // THE BRAND first, then the chosen one-liner, then the remaining map rows.
  const rows = [
    answers['00'] ? row('The Brand', answers['00']) : '',
    oneLiner ? row('Your One-Liner', oneLiner) : '',
    ...MAP_ROWS.filter(([, key]) => key !== '00' && answers[key]).map(([label, key]) => row(label, answers[key])),
  ].join('');

  return `<!DOCTYPE html><html><body style="margin:0;padding:0;background:${EMAIL_UI.bg};">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:${EMAIL_UI.bg};">
    <tr><td align="center" style="padding:36px 16px 48px;">
      <table width="640" cellpadding="0" cellspacing="0" style="max-width:640px;">

        <tr><td style="padding:0 0 28px;">
          <img src="${LOGO_EDGE}" width="196" height="36" alt="The Edge by Galvanite" style="display:block;border:0;" />
        </td></tr>

        <tr><td style="background:#ffffff;border-radius:16px;padding:44px 44px 36px;">
          <h1 style="font-family:${sans};font-size:34px;font-weight:bold;color:${EMAIL_UI.cardHeading};margin:0 0 18px;">Your Signal Map is ready</h1>
          <p style="font-family:${sans};font-size:16px;line-height:1.6;color:${EMAIL_UI.bodyGray};margin:0 0 14px;">Great work! Your answers are now condensed into your own Signal Map. Save it, and put it to work across your website, pitch, and messaging.</p>
          <p style="font-family:${sans};font-size:16px;line-height:1.6;color:${EMAIL_UI.bodyGray};margin:0 0 8px;">And if you need help taking this to the next level, <a href="${CALL_URL}" style="color:${EMAIL_UI.link};font-weight:bold;text-decoration:none;">book a discovery call</a>.</p>
          <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid ${EMAIL_UI.divider};">${rows}</table>
        </td></tr>

        <tr><td style="padding:44px 0 8px;">
          <h2 style="font-family:${sans};font-size:30px;font-weight:bold;color:${BRAND.white};margin:0 0 14px;">Need help with implementation?</h2>
          <p style="font-family:${sans};font-size:16px;line-height:1.6;color:${BRAND.chalk};margin:0 0 26px;">If you're busy building product and need a hand turning this map into your marketing, let's have a discovery call and see how we can help.</p>
          <a href="${CALL_URL}" style="display:block;background:${BRAND.yellow};color:${BRAND.navy};font-family:${sans};font-size:16px;font-weight:bold;text-decoration:none;text-align:center;padding:17px 28px;border-radius:8px;">Book a Discovery Call with Alex</a>
        </td></tr>

        <tr><td style="padding:44px 0 0;">
          <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid rgba(255,255,255,0.14);">
            <tr>
              <td style="padding-top:13px;"><img src="${LOGO_GALVANITE}" width="163" height="29" alt="Galvanite" style="display:block;border:0;" /></td>
              <td align="right" style="padding-top:13px;font-family:${sans};font-size:13px;line-height:1.6;color:${EMAIL_UI.footerMuted};">&copy; ${new Date().getFullYear()} <a href="https://www.galvanite.io?utm_source=edge&utm_medium=email&utm_campaign=signal-map" style="color:${BRAND.white};text-decoration:none;">Galvanite.io</a><br/>All rights reserved.</td>
            </tr>
          </table>
        </td></tr>

      </table>
    </td></tr></table></body></html>`;
}

export function renderLeadNotificationEmail({ product, email, oneLiner, answers, context }) {
  const rows = MAP_ROWS.filter(([, key]) => answers[key]).map(([label, key]) => `
    <tr><td style="padding:10px 0;border-bottom:1px solid #eee;">
      <div style="font-family:Arial,sans-serif;font-size:11px;letter-spacing:1px;color:#888;text-transform:uppercase;margin-bottom:4px;">${esc(label)}</div>
      <div style="font-family:Arial,sans-serif;font-size:14px;color:#111;line-height:1.5;">${escNl(answers[key])}</div>
    </td></tr>`).join('');

  // Qualification intake (goal / blocker / tailwind). Surfaced at the top —
  // it's the fit signal, above the positioning detail.
  const ctx = context || {};
  const ctxItems = [['Goal', ctx.goal], ['Blocker', ctx.blocker], ['Tailwind', ctx.tailwind]]
    .filter(([, v]) => v)
    .map(([label, v]) => `
      <div style="margin-bottom:12px;">
        <div style="font-size:11px;letter-spacing:1px;color:#a67c00;text-transform:uppercase;margin-bottom:3px;font-weight:bold;">${esc(label)}</div>
        <div style="font-size:14px;color:#111;line-height:1.5;">${esc(v)}</div>
      </div>`).join('');
  const ctxBlock = ctxItems
    ? `<div style="background:#fff8e1;border:1px solid #ffe082;border-radius:6px;padding:16px 20px;margin-bottom:20px;">${ctxItems}</div>`
    : '';

  return `<!DOCTYPE html><html><body style="margin:0;padding:24px;background:#f4f4f4;font-family:Arial,sans-serif;">
    <table width="640" cellpadding="0" cellspacing="0" style="max-width:640px;margin:0 auto;background:#fff;border-radius:8px;">
      <tr><td style="padding:28px 32px;">
        <div style="font-size:12px;letter-spacing:2px;color:#999;text-transform:uppercase;">New Edge lead</div>
        <h1 style="font-size:22px;color:#111;margin:8px 0 4px;">${esc(product)}</h1>
        <p style="font-size:14px;color:#444;margin:0 0 20px;">
          From <a href="mailto:${esc(email)}" style="color:#1d4873;">${esc(email)}</a>
        </p>
        ${ctxBlock}
        <div style="background:#f4f7fb;border-radius:6px;padding:16px 20px;margin-bottom:20px;">
          <div style="font-size:11px;letter-spacing:1px;color:#888;text-transform:uppercase;margin-bottom:6px;">Chosen one-liner</div>
          <div style="font-size:16px;color:#111;line-height:1.4;">${esc(oneLiner)}</div>
        </div>
        <table width="100%" cellpadding="0" cellspacing="0">${rows}</table>
      </td></tr>
    </table>
  </body></html>`;
}

export function renderSaveProgressEmail({ resumeUrl, lockedCount }) {
  return `<!DOCTYPE html><html><body style="margin:0;padding:0;background:${BRAND.navyDeep};">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.navyDeep};padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:${BRAND.navy};border-radius:12px;">
        <tr><td style="padding:40px;">
          <div style="font-family:Arial,sans-serif;font-size:13px;letter-spacing:3px;color:${BRAND.highlight};text-transform:uppercase;">The Edge by Galvanite</div>
          <h1 style="font-family:Georgia,serif;font-size:28px;font-weight:normal;color:${BRAND.white};margin:16px 0 12px;">Pick up where you left off</h1>
          <p style="font-family:Arial,sans-serif;font-size:15px;line-height:1.6;color:${BRAND.chalk};margin:0 0 28px;">You're ${lockedCount} of 10 steps in. Your progress is saved.</p>
          <a href="${esc(resumeUrl)}" style="display:inline-block;background:${BRAND.yellow};color:${BRAND.navy};font-family:Arial,sans-serif;font-size:15px;font-weight:bold;text-decoration:none;padding:14px 28px;border-radius:6px;">Continue The Edge</a>
        </td></tr>
      </table>
    </td></tr></table></body></html>`;
}
