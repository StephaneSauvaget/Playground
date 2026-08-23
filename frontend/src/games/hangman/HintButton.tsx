import { useState } from "react";
import { useI18n } from "../../i18n/I18nContext";

export function HintButton({ hint }: { hint: string }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);

  return (
    <div className="hint-control">
      <button
        type="button"
        className="hint-button"
        aria-expanded={open}
        aria-label={open ? t("hangman.hintHide") : t("hangman.hintShow")}
        onClick={() => setOpen((current) => !current)}
      >
        ?
      </button>
      {open && <div className="hint-popover">{hint}</div>}
    </div>
  );
}
