import { toast } from 'sonner';

export function showError(message) {
  if (message) toast.error(message);
}

export function showSuccess(message) {
  if (message) toast.success(message);
}

export function showInfo(message) {
  if (message) toast(message);
}

export function confirmWithToast({
  message,
  confirmLabel = 'تأیید',
  cancelLabel = 'انصراف',
  onConfirm,
  type = 'warning',
}) {
  const show = type === 'error' ? toast.error : type === 'success' ? toast.success : toast.warning;

  show(message, {
    duration: Infinity,
    action: {
      label: confirmLabel,
      onClick: onConfirm,
    },
    cancel: {
      label: cancelLabel,
      onClick: () => {},
    },
  });
}
