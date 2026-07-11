export function otpEmailTemplate(firstName: string, otpCode: string, expiryMinutes: number): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Verify Your Email – Astra</title>
  <style>
    body { margin: 0; padding: 0; background-color: #f4f6f8; font-family: 'Segoe UI', Arial, sans-serif; }
    .wrapper { max-width: 560px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 36px 40px; text-align: center; }
    .header h1 { margin: 0; color: #ffffff; font-size: 28px; letter-spacing: 2px; font-weight: 700; }
    .header p { margin: 6px 0 0; color: #a8b2d8; font-size: 13px; letter-spacing: 1px; }
    .body { padding: 40px; }
    .body p { color: #4a5568; font-size: 15px; line-height: 1.7; margin: 0 0 16px; }
    .otp-box { background: #f0f4ff; border: 2px dashed #4f6ef7; border-radius: 10px; text-align: center; padding: 28px 20px; margin: 28px 0; }
    .otp-box .label { font-size: 12px; color: #718096; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 10px; }
    .otp-code { font-size: 42px; font-weight: 800; letter-spacing: 10px; color: #1a1a2e; font-family: 'Courier New', monospace; }
    .expiry { text-align: center; font-size: 13px; color: #e53e3e; font-weight: 600; margin-top: -10px; margin-bottom: 24px; }
    .warning { background: #fffbeb; border-left: 4px solid #f6ad55; border-radius: 4px; padding: 12px 16px; font-size: 13px; color: #744210; margin-top: 20px; }
    .footer { background: #f4f6f8; padding: 24px 40px; text-align: center; border-top: 1px solid #e2e8f0; }
    .footer p { color: #a0aec0; font-size: 12px; margin: 0; line-height: 1.6; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>ASTRA</h1>
      <p>Email Verification</p>
    </div>
    <div class="body">
      <p>Hi <strong>${firstName}</strong>,</p>
      <p>Welcome to Astra! To complete your registration, please use the one-time password (OTP) below to verify your email address.</p>
      <div class="otp-box">
        <div class="label">Your OTP Code</div>
        <div class="otp-code">${otpCode}</div>
      </div>
      <p class="expiry">&#9203; This code expires in ${expiryMinutes} minutes.</p>
      <p>Enter this code on the verification screen to activate your account. If you did not create an account, you can safely ignore this email.</p>
      <div class="warning">
        <strong>Security notice:</strong> Astra will never ask for your OTP over phone or email. Do not share this code with anyone.
      </div>
    </div>
    <div class="footer">
      <p>This is an automated message. Please do not reply to this email.</p>
      <p>&copy; ${new Date().getFullYear()} Astra. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`
}
