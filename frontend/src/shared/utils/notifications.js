import { toast } from 'sonner';

let activeToastId;
let activeConfirmation;
let shortcutsRegistered = false;

function confirmActiveToast() {
  if (!activeConfirmation) return;

  const confirm = activeConfirmation;
  const toastId = activeToastId;

  activeConfirmation = undefined;
  activeToastId = undefined;

  if (toastId !== undefined) toast.dismiss(toastId);
  confirm();
}

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

    const target = event.target;
    const isTextEntryTarget =
      target instanceof HTMLElement &&
      (target.isContentEditable ||
        target.closest(
          'input, textarea, select, [contenteditable="true"], [role="textbox"]',
        ));

    if (
      event.key === 'Enter' &&
      !event.repeat &&
      !event.altKey &&
      !event.ctrlKey &&
      !event.metaKey &&
      activeConfirmation &&
      !isTextEntryTarget
    ) {
      event.preventDefault();
      event.stopPropagation();
      confirmActiveToast();
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
        activeToastId = undefined;
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
