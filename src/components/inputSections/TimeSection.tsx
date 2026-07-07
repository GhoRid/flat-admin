import ClockIcon from "@svgs/common/Clock.svg?react";
import { useState } from "react";
import TimePickerModal from "../modal/TimePickerModal";

type TimeSectionProps = {
  id?: string;
  title?: string;
  value: string;
  onChange: (next: string) => void;
  disabled?: boolean;
};

export default function TimeSection({ id, title, value, onChange, disabled = false }: TimeSectionProps) {
  const [open, setOpen] = useState(false);

  return (
    <section id={id ?? title?.replace(/\s+/g, "-").toLowerCase()}>
      {title && <h3 className="mb-2.5 text-14 text-app-gray500">{title}</h3>}

      <button
        className="flex h-10 w-full items-center justify-between rounded-[10px] border border-app-gray100 bg-app-white px-2.5 text-left text-14 text-app-black disabled:cursor-not-allowed disabled:bg-app-gray50 disabled:text-app-gray300 [&_svg]:size-[22px] [&_svg]:text-app-gray500 [&_svg]:opacity-50"
        type="button"
        disabled={disabled}
        onClick={() => {
          if (disabled) return;
          setOpen(true);
        }}
      >
        <span>{value}</span>
        <ClockIcon />
      </button>

      <TimePickerModal
        isOpen={open && !disabled}
        value={value}
        onClose={() => setOpen(false)}
        onChange={onChange}
      />
    </section>
  );
}
