export async function sendEmail({ to, subject, html }) {
  const apiKey = process.env.SMTP_PASS;
  if (!apiKey) {
    console.log('[mailer] Brevo API key no configurada. Email no enviado.');
    return;
  }

  const devTo = process.env.DEV_EMAIL_TO;
  const originalTo = to;

  if (devTo) {
    to = devTo;
    html += `<hr><p style="color:#888;font-size:12px;">Email originalmente destinado a: ${originalTo}</p>`;
  }

  const payload = {
    sender: { email: process.env.EMAIL_FROM || 'noreply@desapp.com' },
    to: [{ email: to }],
    subject,
    htmlContent: html,
  };

  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': apiKey,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Brevo API error ${res.status}: ${text}`);
  }
}
