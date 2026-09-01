"use client";

import { useState } from "react";
import { KATEGORIE_ICONS, ICON_KEYS } from "@/lib/kategorie-icons";

export function IconPicker({ value }: { value?: string }) {
  const [selected, setSelected] = useState(value ?? "");

  const knopf = (key: string, aktiv: boolean) =>
    `grid h-9 w-9 place-items-center rounded border transition [&_svg]:h-5 [&_svg]:w-5 ${
      aktiv
        ? "border-marke text-marke bg-blue-50"
        : "border-slate-200 text-slate-400 hover:border-slate-400"
    }`;

  return (
    <div className="basis-full">
      <input type="hidden" name="icon" value={selected} />
      <span className="text-xs text-slate-500">Icon</span>
      <div className="mt-1 flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => setSelected("")}
          title="Kein Icon"
          className={knopf("", selected === "") + " text-sm"}
        >
          –
        </button>
        {ICON_KEYS.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setSelected(key)}
            title={KATEGORIE_ICONS[key].label}
            className={knopf(key, selected === key)}
          >
            <span
              dangerouslySetInnerHTML={{ __html: KATEGORIE_ICONS[key].svg }}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
