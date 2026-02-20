const buildCredentialMessage = ({ name, email, password }) => {
  return `Hello ${name || "User"}, your account has been created.
Email: ${email}
Temporary password: ${password}
Please login and change this password immediately to a strong password you can remember.`;
};

export const sendCredentialsEmail = async ({ toEmail, name, password }) => {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL;

  if (!apiKey || !fromEmail) {
    return { sent: false, channel: "email", reason: "Email provider not configured" };
  }

  if (!toEmail) {
    return { sent: false, channel: "email", reason: "Recipient email missing" };
  }

  try {
    const message = buildCredentialMessage({
      name,
      email: toEmail,
      password,
    });

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [toEmail],
        subject: "Your account credentials",
        text: message,
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      return { sent: false, channel: "email", reason: `Email failed: ${errorText}` };
    }

    return { sent: true, channel: "email" };
  } catch (error) {
    return { sent: false, channel: "email", reason: error.message };
  }
};

export const sendCredentialsSms = async ({ toPhone, name, email, password }) => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromPhone = process.env.TWILIO_FROM_NUMBER;

  if (!accountSid || !authToken || !fromPhone) {
    return { sent: false, channel: "sms", reason: "SMS provider not configured" };
  }

  if (!toPhone) {
    return { sent: false, channel: "sms", reason: "Recipient phone missing" };
  }

  try {
    const message = buildCredentialMessage({ name, email, password });
    const endpoint = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;

    const body = new URLSearchParams({
      To: toPhone,
      From: fromPhone,
      Body: message,
    });

    const auth = Buffer.from(`${accountSid}:${authToken}`).toString("base64");

    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
    });

    if (!res.ok) {
      const errorText = await res.text();
      return { sent: false, channel: "sms", reason: `SMS failed: ${errorText}` };
    }

    return { sent: true, channel: "sms" };
  } catch (error) {
    return { sent: false, channel: "sms", reason: error.message };
  }
};
