// Email templates for Resend. Inline styles only.

const BRAND = {
  navy: '#162140', navyDeep: '#0c3760', blueCard: '#1d4873',
  chalk: '#C2E2F2', white: '#ffffff', yellow: '#ffd400',
  highlight: '#49B4F2', blue: '#2e5073',
};

const MAP_ROWS = [
  ['THE PRODUCT', '00'], ['THE USER', '01'],
  ['THE OBSTACLE', '02a'], ['THE STRUGGLE', '02b'], ['THE JUST CAUSE', '02c'],
  ['THE SOLUTION', '03'], ['THE PROCESS', '04'], ['THE NEXT STEP', '05'],
  ['THE COST OF INACTION', '06'], ['THE TRANSFORMATION', '07'],
];

function esc(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function renderSignalMapEmail({ product, oneLiner, answers }) {
  const rows = MAP_ROWS.filter(([, key]) => answers[key]).map(([label, key]) => `
    <tr><td style="padding:0 0 12px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.blueCard};border-radius:8px;">
        <tr><td style="padding:18px 22px;">
          <div style="font-family:'Courier New',monospace;font-size:11px;letter-spacing:2px;color:${BRAND.highlight};text-transform:uppercase;margin-bottom:8px;">${esc(label)}</div>
          <div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.55;color:${BRAND.chalk};">${esc(answers[key])}</div>
        </td></tr>
      </table>
    </td></tr>`).join('');

  return `<!DOCTYPE html><html><body style="margin:0;padding:0;background:${BRAND.navyDeep};">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.navyDeep};padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:${BRAND.navy};border-radius:12px;overflow:hidden;">
        <tr><td style="padding:40px 40px 24px;">
          <div style="font-family:Arial,sans-serif;font-size:13px;letter-spacing:3px;color:${BRAND.highlight};text-transform:uppercase;">The Edge by Galvanite</div>
          <h1 style="font-family:Georgia,serif;font-size:30px;font-weight:normal;color:${BRAND.white};margin:16px 0 0;">Your Signal Map</h1>
          <p style="font-family:Arial,sans-serif;font-size:14px;color:${BRAND.chalk};margin:8px 0 0;">For ${esc(product)}</p>
        </td></tr>
        <tr><td style="padding:0 40px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.blueCard};border-radius:8px;margin-bottom:24px;">
            <tr><td style="padding:28px;">
              <div style="font-family:Arial,sans-serif;font-size:11px;letter-spacing:2px;color:${BRAND.highlight};text-transform:uppercase;margin-bottom:10px;">Your One-Liner</div>
              <div style="font-family:Georgia,serif;font-size:22px;line-height:1.4;color:${BRAND.white};">${esc(oneLiner)}</div>
            </td></tr>
          </table>
        </td></tr>
        <tr><td style="padding:0 40px 24px;"><table width="100%" cellpadding="0" cellspacing="0">${rows}</table></td></tr>
        <tr><td style="padding:8px 40px 40px;">
          <a href="https://www.galvanite.io?utm_source=edge&utm_medium=email" style="display:inline-block;background:${BRAND.yellow};color:${BRAND.navy};font-family:Arial,sans-serif;font-size:15px;font-weight:bold;text-decoration:none;padding:14px 28px;border-radius:6px;">See how we can build on this</a>
        </td></tr>
      </table>
    </td></tr></table></body></html>`;
}

export function renderLeadNotificationEmail({ product, email, oneLiner, answers }) {
  const rows = MAP_ROWS.filter(([, key]) => answers[key]).map(([label, key]) => `
    <tr><td style="padding:10px 0;border-bottom:1px solid #eee;">
      <div style="font-family:Arial,sans-serif;font-size:11px;letter-spacing:1px;color:#888;text-transform:uppercase;margin-bottom:4px;">${esc(label)}</div>
      <div style="font-family:Arial,sans-serif;font-size:14px;color:#111;line-height:1.5;">${esc(answers[key])}</div>
    </td></tr>`).join('');

  return `<!DOCTYPE html><html><body style="margin:0;padding:24px;background:#f4f4f4;font-family:Arial,sans-serif;">
    <table width="640" cellpadding="0" cellspacing="0" style="max-width:640px;margin:0 auto;background:#fff;border-radius:8px;">
      <tr><td style="padding:28px 32px;">
        <div style="font-size:12px;letter-spacing:2px;color:#999;text-transform:uppercase;">New Edge lead</div>
        <h1 style="font-size:22px;color:#111;margin:8px 0 4px;">${esc(product)}</h1>
        <p style="font-size:14px;color:#444;margin:0 0 20px;">
          From <a href="mailto:${esc(email)}" style="color:#1d4873;">${esc(email)}</a>
        </p>
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
