const escapeHtml = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

const formatMoney = (n) => {
  const num = Number(n || 0);
  return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const formatDate = (d) => {
  if (!d) return '—';
  try {
    return new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' });
  } catch {
    return '—';
  }
};

const getDurationLabel = (durationType, totalDays) => {
  const type = String(durationType || '').toLowerCase();
  const label = type === 'yearly' ? 'Yearly' : type === 'monthly' ? 'Monthly' : 'Custom';
  return `${label} (${Number(totalDays || 0)} days)`;
};

const buildHtml = ({
  businessName,
  receiptId,
  clientName,
  clientWhatsApp,
  clientEmail,
  subscriptionName,
  durationLabel,
  startDate,
  endDate,
  sellingPrice,
  paymentStatus,
  profit,
}) => {
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Receipt</title>
    <style>
      :root{
        --bg:#f7f8ff;
        --card:#ffffff;
        --text:#0f172a;
        --muted:#64748b;
        --primary:#4f46e5;
        --primary2:#06b6d4;
        --green:#10b981;
        --amber:#f59e0b;
        --red:#ef4444;
        --border:rgba(15,23,42,.10);
      }
      *{ box-sizing:border-box; }
      body{
        margin:0;
        font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji","Segoe UI Emoji";
        background: radial-gradient(900px 300px at 10% 0%, rgba(79,70,229,.16), transparent 60%),
                    radial-gradient(700px 260px at 90% 10%, rgba(6,182,212,.14), transparent 55%),
                    var(--bg);
        color:var(--text);
      }
      .page{
        padding:28px;
      }
      .receipt{
        width: 100%;
        max-width: 980px;
        margin: 0 auto;
        background: var(--card);
        border: 1px solid var(--border);
        border-radius: 20px;
        overflow:hidden;
        box-shadow: 0 18px 60px rgba(2,6,23,.06);
      }
      .header{
        position:relative;
        padding:22px 26px;
        background: linear-gradient(90deg, rgba(79,70,229,.95), rgba(6,182,212,.85));
        color:#fff;
      }
      .header:after{
        content:"";
        position:absolute;
        inset:-60px -60px auto auto;
        width:220px;
        height:220px;
        background: rgba(255,255,255,.14);
        border-radius: 50%;
        filter: blur(0px);
        transform: rotate(12deg);
      }
      .business{
        font-size: 18px;
        font-weight: 800;
        letter-spacing: .2px;
        position:relative;
        z-index:1;
      }
      .metaRow{
        position:relative;
        z-index:1;
        margin-top: 10px;
        display:flex;
        align-items:flex-start;
        justify-content:space-between;
        gap:16px;
      }
      .receiptId{
        background: rgba(255,255,255,.16);
        border: 1px solid rgba(255,255,255,.22);
        padding: 8px 12px;
        border-radius: 14px;
        font-size: 12px;
        font-weight: 700;
      }
      .grid{
        padding: 22px 26px 26px;
        display:grid;
        grid-template-columns: 1fr 1fr;
        gap: 14px;
      }
      .box{
        border: 1px solid var(--border);
        border-radius: 16px;
        padding: 14px 14px 12px;
        background: #fff;
      }
      .boxTitle{
        font-size: 12px;
        font-weight: 800;
        letter-spacing:.14em;
        text-transform: uppercase;
        color: var(--muted);
        margin-bottom: 10px;
      }
      .kv{
        display:flex;
        align-items:flex-start;
        justify-content:space-between;
        gap: 14px;
        margin: 7px 0;
      }
      .k{ color: var(--muted); font-size: 12px; font-weight: 700; }
      .v{ color: var(--text); font-size: 14px; font-weight: 800; text-align:right; max-width: 60%; }
      .subscription{
        grid-column: 1 / -1;
      }
      .footer{
        padding: 0 26px 24px;
        display:flex;
        align-items:flex-end;
        justify-content:space-between;
        gap: 12px;
        color: var(--muted);
        font-size: 12px;
      }
      .pill{
        display:inline-flex;
        align-items:center;
        gap:8px;
        border-radius: 999px;
        padding: 8px 12px;
        border: 1px solid var(--border);
        background: rgba(2,6,23,.02);
        font-weight:800;
        color: var(--text);
      }
      .dot{
        width:10px;
        height:10px;
        border-radius: 50%;
        background: var(--green);
        box-shadow: 0 0 0 6px rgba(16,185,129,.15);
      }
      .dot.pending{ background: var(--amber); box-shadow: 0 0 0 6px rgba(245,158,11,.15); }
      .dot.partially_paid{ background: #8b5cf6; box-shadow: 0 0 0 6px rgba(139,92,246,.14); }
      .dot.paid{ background: var(--green); }
      .price{
        font-size: 22px;
        font-weight: 900;
      }
      @media print {
        .page{ padding: 0; }
        .header:after{ display:none; }
      }
    </style>
  </head>
  <body>
    <div class="page">
      <div class="receipt">
        <div class="header">
          <div class="business">${escapeHtml(businessName || 'Business')}</div>
          <div class="metaRow">
            <div>
              <div style="font-size:12px;opacity:.9;font-weight:700;letter-spacing:.08em;text-transform:uppercase">Subscription Receipt</div>
              <div style="margin-top:6px;font-size:14px;opacity:.95;font-weight:800">${escapeHtml(subscriptionName || 'Subscription')}</div>
            </div>
            <div class="receiptId">Receipt #${escapeHtml(receiptId || '—')}</div>
          </div>
        </div>

        <div class="grid">
          <div class="box">
            <div class="boxTitle">Client info</div>
            <div class="kv"><div class="k">Name</div><div class="v">${escapeHtml(clientName || '—')}</div></div>
            <div class="kv"><div class="k">WhatsApp</div><div class="v">${escapeHtml(clientWhatsApp || '—')}</div></div>
            <div class="kv"><div class="k">Email</div><div class="v">${escapeHtml(clientEmail || '—')}</div></div>
          </div>

          <div class="box">
            <div class="boxTitle">Subscription info</div>
            <div class="kv"><div class="k">Duration</div><div class="v">${escapeHtml(durationLabel || '—')}</div></div>
            <div class="kv"><div class="k">Start</div><div class="v">${escapeHtml(formatDate(startDate))}</div></div>
            <div class="kv"><div class="k">End</div><div class="v">${escapeHtml(formatDate(endDate))}</div></div>
          </div>

          <div class="box subscription">
            <div class="boxTitle">Payment</div>
            <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:16px;flex-wrap:wrap">
              <div>
                <div class="pill" style="margin-bottom:12px">
                  <span class="dot ${escapeHtml(paymentStatus || 'pending')}" aria-hidden="true"></span>
                  <span>${escapeHtml(String(paymentStatus || 'pending'))}</span>
                </div>
                <div style="color:var(--muted);font-weight:700;font-size:12px;letter-spacing:.14em;text-transform:uppercase">Selling price</div>
                <div class="price">${escapeHtml(formatMoney(sellingPrice))}</div>
                <div style="margin-top:6px;color:var(--muted);font-weight:700;font-size:12px">
                  Profit: <span style="color:var(--primary);font-weight:900">${escapeHtml(formatMoney(profit))}</span>
                </div>
              </div>
              <div style="min-width:240px">
                <div style="border:1px solid var(--border);border-radius:16px;padding:12px 14px;background:rgba(79,70,229,.03)">
                  <div style="color:var(--muted);font-weight:800;font-size:12px;letter-spacing:.14em;text-transform:uppercase;margin-bottom:8px">Thank you</div>
                  <div style="font-size:13px;font-weight:700;line-height:1.6">
                    Receipt generated automatically by ManageMySubs.
                    Keep this for your records.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="footer">
          <div>Generated at ${escapeHtml(new Date().toLocaleString())}</div>
          <div style="font-weight:800">ManageMySubs</div>
        </div>
      </div>
    </div>
  </body>
</html>`;
};

const generateReceiptPdf = async (data) => {
  // Lazy-load to avoid crashing server boot if dependencies are not installed yet.
  const puppeteer = require('puppeteer');
  const html = buildHtml(data);

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const buffer = await page.pdf({ format: 'A4', printBackground: true, margin: { top: 20, right: 18, bottom: 18, left: 18 } });
    return buffer;
  } finally {
    await browser.close();
  }
};

module.exports = { generateReceiptPdf };

