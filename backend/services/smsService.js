import Kavenegar from 'kavenegar';
import env from '../config/env.js';
import AppError from '../utils/AppError.js';

const api = env.SMS_API_KEY?.trim()
  ? Kavenegar.KavenegarApi({ apikey: env.SMS_API_KEY.trim() })
  : null;

export const isSmsConfigured = () =>
  Boolean(api && env.SMS_SENDER?.trim());

export const sendSms = async ({ phone, message }) => {
  if (!isSmsConfigured()) {
    throw new AppError('SMS service is not configured', 503);
  }

  if (!phone?.trim() || !message?.trim()) {
    throw new AppError('Phone number and message are required to send SMS', 400);
  }

  return new Promise((resolve, reject) => {
    try {
      api.Send(
        {
          receptor: phone.trim(),
          sender: env.SMS_SENDER.trim(),
          message: message.trim(),
        },
        (response, status) => {
          const providerStatus = response?.return?.status;
          const providerMessage = response?.return?.message || 'Unknown provider error';

          if (status !== 200 || providerStatus !== 200) {
            reject(
              new AppError(
                `Kavenegar error (HTTP ${status ?? 'unknown'}, status ${providerStatus ?? 'unknown'}): ${providerMessage}`,
                502,
              ),
            );
            return;
          }

          resolve(response);
        },
      );
    } catch (error) {
      reject(
        new AppError(
          `Could not send SMS through Kavenegar: ${error.message}`,
          502,
        ),
      );
    }
  });
};
