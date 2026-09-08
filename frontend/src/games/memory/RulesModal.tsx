import type { TranslationKey } from "../../i18n/translations";
import { ClomoRules } from "../../mascot/ClomoRules";

/** One bubble per sentence — see ClomoRules for the pagination. */
const STEPS: readonly TranslationKey[] = [
  "memory.rules.step1",
  "memory.rules.step2",
  "memory.rules.step3",
];

export function RulesModal({ onStart }: { onStart: () => void }) {
  return <ClomoRules steps={STEPS} onStart={onStart} />;
}
