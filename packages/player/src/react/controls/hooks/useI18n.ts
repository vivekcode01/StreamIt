import { useCallback, useContext } from "react";
import { ParamsContext } from "../context/ParamsProvider";
import { defaultLangMap, langMap } from "../i18n";
import type { LangKey } from "../i18n";

export function useI18n() {
  const { lang } = useContext(ParamsContext);

  const getText = useCallback(
    (key: LangKey) => langMap[lang ?? "eng"][key] ?? defaultLangMap[key],
    [lang, langMap],
  );

  return getText;
}
