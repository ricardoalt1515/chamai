import { defineAuth } from "@aws-amplify/backend";

// Cognito email template constraints:
// - HTML must be inline (no <style> blocks, no external CSS) and table-based
//   for Outlook/Gmail compatibility.
// - Body has a hard 20 KB limit. This template is ~4 KB.
// - All asset URLs must be absolute HTTPS — email clients do not resolve
//   relative paths.
//
// Single source of truth for branding URLs. The logo is self-hosted from
// Next.js public/ to avoid third-party CDN dependencies and AVIF/format
// negotiation issues in Outlook.
const SITE_URL = "https://h2oassistant.com";
const APP_URL = `${SITE_URL}/login`;
const LOGO_URL = `${SITE_URL}/h2o-allegiant-email.png`;

const buildInvitationEmail = (username: string, code: string): string => `<!doctype html>
<html lang="en">
  <body style="margin:0;padding:0;background:#f4f6f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:#0f172a;">
    <div style="display:none;max-height:0;overflow:hidden;">You're invited to H2O Allegiant — your temporary credentials are inside.</div>
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#f4f6f8;padding:40px 16px;">
      <tr><td align="center">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="560" style="max-width:560px;background:#ffffff;border-radius:12px;border:1px solid #e6e8eb;overflow:hidden;">
          <tr><td align="center" style="padding:36px 40px 28px 40px;background:#ffffff;border-bottom:1px solid #f1f5f9;">
            <img src="${LOGO_URL}" alt="H2O Allegiant" width="140" height="auto" style="display:block;border:0;outline:none;text-decoration:none;max-width:140px;height:auto;" />
          </td></tr>
          <tr><td style="padding:36px 40px 8px 40px;">
            <h1 style="margin:0 0 12px 0;font-size:24px;line-height:1.25;font-weight:600;letter-spacing:-0.02em;color:#0f172a;">Welcome to H2O Allegiant</h1>
            <p style="margin:0 0 24px 0;font-size:15px;line-height:1.6;color:#475569;">An administrator created an account for you. Use the credentials below to sign in. After your first sign-in, you'll be prompted to set a permanent password.</p>
          </td></tr>
          <tr><td style="padding:0 40px;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#f8fafc;border:1px solid #e6e8eb;border-radius:8px;">
              <tr><td style="padding:16px 20px;">
                <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:#64748b;font-weight:600;">Username</div>
                <div style="font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:15px;color:#0f172a;margin-top:4px;">${username}</div>
              </td></tr>
              <tr><td style="border-top:1px solid #e6e8eb;"></td></tr>
              <tr><td style="padding:16px 20px;">
                <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:#64748b;font-weight:600;">Temporary password</div>
                <div style="font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:15px;color:#0f172a;margin-top:4px;">${code}</div>
              </td></tr>
            </table>
          </td></tr>
          <tr><td style="padding:28px 40px 8px 40px;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
              <td style="background:#0070E2;border-radius:8px;">
                <a href="${APP_URL}" style="display:inline-block;padding:12px 22px;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;letter-spacing:-0.005em;">Sign in to H2O Allegiant &rarr;</a>
              </td>
            </tr></table>
          </td></tr>
          <tr><td style="padding:20px 40px 32px 40px;">
            <p style="margin:0;font-size:13px;line-height:1.6;color:#64748b;">This invitation was sent to you because someone added you to an H2O Allegiant workspace. If this wasn't expected, you can ignore this email.</p>
          </td></tr>
          <tr><td style="padding:20px 40px;border-top:1px solid #e6e8eb;background:#fafbfc;">
            <p style="margin:0;font-size:12px;color:#94a3b8;line-height:1.5;">H2O Allegiant<br />This is an automated message. Please do not reply.</p>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;

export const auth = defineAuth({
  loginWith: {
    email: {
      userInvitation: {
        emailSubject: "Welcome to H2O Allegiant",
        emailBody: (username, code) => buildInvitationEmail(username(), code()),
      },
    },
  },
});
