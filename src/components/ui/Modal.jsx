import { useEffect } from "react";
import { X } from "lucide-react";
import styles from "./ui.module.css";
import Button from "./Button";

export default function Modal({
  open,
  title,
  children,
  onClose,
  footer,
  wide = false,
}) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className={styles.modalBackdrop}
      onClick={() => onClose?.()}
      role="presentation"
    >
      <div
        className={`${styles.modal} ${wide ? styles.modalWide : ""}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <header className={styles.modalHeader}>
          <h2>{title}</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onClose?.()}
            aria-label="Close"
            disabled={!onClose}
          >
            <X size={16} />
          </Button>
        </header>
        <div className={styles.modalBody}>{children}</div>
        {footer ? <footer className={styles.modalFooter}>{footer}</footer> : null}
      </div>
    </div>
  );
}
