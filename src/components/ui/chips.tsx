type ChipOption<T extends string> = {
  value: T;
  label: string;
};

interface ChipGroupProps<T extends string> {
  label: string;
  options: Array<ChipOption<T>>;
  value?: T;
  onChange: (value: T) => void;
}

interface MultiChipGroupProps<T extends string> {
  label: string;
  options: Array<ChipOption<T>>;
  values: T[];
  onChange: (values: T[]) => void;
}

export function ChipGroup<T extends string>({ label, options, value, onChange }: ChipGroupProps<T>) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-600 mb-2 select-none">{label}</label>
      <div className="flex gap-2 overflow-x-auto pb-1 snap-x snap-mandatory md:flex-wrap md:overflow-visible md:pb-0">
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={`min-h-12 shrink-0 snap-start rounded-2xl px-4 py-2 text-sm font-medium transition ${
                selected
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-white border border-slate-200 text-slate-700 shadow-sm hover:bg-slate-50"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function MultiChipGroup<T extends string>({
  label,
  options,
  values,
  onChange,
}: MultiChipGroupProps<T>) {
  function toggleValue(nextValue: T) {
    if (values.includes(nextValue)) {
      onChange(values.filter((value) => value !== nextValue));
      return;
    }

    onChange([...values, nextValue]);
  }

  return (
    <div>
      <label className="block text-xs font-medium text-slate-600 mb-2 select-none">{label}</label>
      <div className="flex gap-2 overflow-x-auto pb-1 snap-x snap-mandatory md:flex-wrap md:overflow-visible md:pb-0">
        {options.map((option) => {
          const selected = values.includes(option.value);
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => toggleValue(option.value)}
              className={`min-h-12 shrink-0 snap-start rounded-2xl px-4 py-2 text-sm font-medium transition ${
                selected
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-white border border-slate-200 text-slate-700 shadow-sm hover:bg-slate-50"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
