import type { TranslationKey } from "../../i18n/translations";
import { ClomoRules } from "../../mascot/ClomoRules";

/** One bubble per sentence — see ClomoRules for the pagination. */
const STEPS: readonly TranslationKey[] = [
  "hangman.rules.step1",
  "hangman.rules.step2",
  "hangman.rules.step3",
];

export function RulesModal({ onStart }: { onStart: () => void }) {
  return <ClomoRules steps={STEPS} onStart={onStart} />;
}
