import { toast } from 'sonner';

let activeToastId;
let activeConfirmation;
let shortcutsRegistered = false;

function registerToastShortcuts() {
  if (shortcutsRegistered || typeof document === 'undefined') return;

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && activeToastId !== undefined) {
      event.preventDefault();
      event.stopPropagation();
      toast.dismiss(activeToastId);
      activeToastId = undefined;
      activeConfirmation = undefined;
      return;
    }

    if (event.key === 'Enter' && activeConfirmation) {
      event.preventDefault();
      event.stopPropagation();
      const confirm = activeConfirmation;
      activeConfirmation = undefined;
      confirm();
    }
  });

  shortcutsRegistered = true;
}

function trackToast(id, confirmation) {
  activeToastId = id;
  activeConfirmation = confirmation;
  registerToastShortcuts();
}

export function showError(message) {
  if (!message) return;
  trackToast(toast.error(message));
}

export function showSuccess(message) {
  if (!message) return;
  trackToast(toast.success(message));
}

export function showInfo(message) {
  if (!message) return;
  trackToast(toast(message));
}

export function confirmWithToast({
  message,
  confirmLabel = 'تأیید',
  cancelLabel = 'انصراف',
  onConfirm,
  type = 'warning',
}) {
  const show = type === 'error' ? toast.error : type === 'success' ? toast.success : toast.warning;
  const id = show(message, {
    duration: Infinity,
    action: {
      label: confirmLabel,
      onClick: () => {
        activeConfirmation = undefined;
        onConfirm?.();
      },
    },
    cancel: {
      label: cancelLabel,
      onClick: () => {
        activeConfirmation = undefined;
        activeToastId = undefined;
      },
    },
  });

  trackToast(id, onConfirm);
}
