const COMBINING_DIACRITICS_START = 0x0300;
const COMBINING_DIACRITICS_END = 0x036f;

export function stripAccents(text: string): string {
  return [...text.normalize("NFD")]
    .filter((char) => {
      const code = char.codePointAt(0)!;
      return code < COMBINING_DIACRITICS_START || code > COMBINING_DIACRITICS_END;
    })
    .join("");
}
