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
        (entries, status, providerMessage) => {
          if (status !== 200) {
            reject(
              new AppError(
                `Kavenegar error (status ${status ?? 'unknown'}): ${providerMessage || entries?.error || 'Unknown provider error'}`,
                502,
              ),
            );
            return;
          }

          resolve({
            entries,
            status,
            message: providerMessage,
          });
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
