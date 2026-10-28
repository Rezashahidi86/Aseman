import env from '../config/env.js';
import AppError from '../utils/AppError.js';

export const isSmsConfigured = () =>
  Boolean(env.SMS_API_KEY?.trim() && env.SMS_SENDER?.trim());

export const sendSms = async ({ phone, message }) => {
  if (!isSmsConfigured()) {
    throw new AppError('SMS service is not configured', 503);
  }

  const endpoint = `https://api.kavenegar.com/v1/${encodeURIComponent(env.SMS_API_KEY)}/sms/send.json`;
  const body = new URLSearchParams({
    receptor: phone,
    message,
    sender: env.SMS_SENDER,
  });

  let response;
  let payload;

  try {
    response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
      signal: AbortSignal.timeout(10000),
    });
    payload = await response.json();
  } catch {
    throw new AppError('Could not connect to the SMS provider', 502);
  }

  if (!response.ok || payload?.return?.status !== 200) {
    throw new AppError('The SMS provider could not send the message', 502);
  }

  return payload;
};
