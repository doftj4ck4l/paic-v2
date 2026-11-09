import type { Mail } from "./email";

function layout(title: string, body: string) {
  return `<!doctype html>
<html lang="ms">
<body style="margin:0;padding:24px;background:#fafbff;font-family:'Segoe UI',Arial,sans-serif;color:#10112f;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;margin:0 auto;background:#ffffff;border:1px solid #e2e7f2;border-radius:20px;">
    <tr><td style="padding:28px 28px 8px;">
      <p style="margin:0;font-size:13px;font-weight:800;color:#007a66;">Pixelspace AI Classroom</p>
      <h1 style="margin:10px 0 0;font-size:20px;line-height:1.3;">${title}</h1>
    </td></tr>
    <tr><td style="padding:12px 28px 28px;font-size:14px;line-height:1.7;color:#3c4160;">${body}</td></tr>
    <tr><td style="padding:0 28px 28px;font-size:11px;line-height:1.6;color:#7c819c;">
      Emel ini dihantar secara automatik. Jika anda tidak meminta tindakan ini, abaikan emel ini.
    </td></tr>
  </table>
</body>
</html>`;
}

function button(url: string, label: string) {
  return `<p style="margin:20px 0;"><a href="${url}" style="display:inline-block;padding:12px 22px;border-radius:14px;background:#007a66;color:#ffffff;font-weight:700;font-size:14px;text-decoration:none;">${label}</a></p>
<p style="margin:0 0 8px;font-size:12px;color:#7c819c;">Jika butang tidak berfungsi, salin pautan ini ke pelayar anda:</p>
<p style="margin:0;font-size:12px;word-break:break-all;color:#00786a;">${url}</p>`;
}

export function resetPasswordEmail(name: string, url: string): Omit<Mail, "to"> {
  const title = "Tetapkan semula kata laluan";
  return {
    subject: "Pixelspace — Tetapkan semula kata laluan anda",
    text: `Hai ${name},\n\nKami menerima permintaan untuk menetapkan semula kata laluan akaun Pixelspace anda.\n\nBuka pautan ini untuk menetapkan kata laluan baharu (sah selama 30 minit, sekali guna):\n${url}\n\nJika anda tidak meminta ini, abaikan emel ini — kata laluan anda tidak berubah.`,
    html: layout(title, `<p style="margin:0;">Hai <strong>${name}</strong>,</p>
<p style="margin:12px 0 0;">Kami menerima permintaan untuk menetapkan semula kata laluan akaun Pixelspace anda. Pautan ini sah selama <strong>30 minit</strong> dan hanya boleh digunakan sekali.</p>
${button(url, "Tetapkan kata laluan baharu")}`),
  };
}

export function verifyEmailTemplate(name: string, url: string): Omit<Mail, "to"> {
  const title = "Sahkan emel anda";
  return {
    subject: "Pixelspace — Sahkan emel anda",
    text: `Hai ${name},\n\nTerima kasih kerana mendaftar di Pixelspace AI Classroom. Sahkan emel anda dengan membuka pautan ini:\n${url}\n\nJika anda tidak mendaftar, abaikan emel ini.`,
    html: layout(title, `<p style="margin:0;">Hai <strong>${name}</strong>,</p>
<p style="margin:12px 0 0;">Terima kasih kerana mendaftar di Pixelspace AI Classroom. Sahkan emel anda untuk melengkapkan akaun anda.</p>
${button(url, "Sahkan emel saya")}`),
  };
}
