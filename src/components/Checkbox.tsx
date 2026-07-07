import CheckIcon from "@svgs/common/Check.svg?react";
import type { ChangeEvent, MouseEvent } from "react";

type CheckboxProps = {
  checked: boolean;
  indeterminate?: boolean;
  ariaLabel: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onClick?: (e: MouseEvent<HTMLLabelElement>) => void;
};

export default function Checkbox({
  checked,
  indeterminate = false,
  ariaLabel,
  onChange,
  onClick,
}: CheckboxProps) {
  return (
    <label className="relative inline-flex cursor-pointer items-center" onClick={onClick}>
      <input
        className="peer absolute size-[18px] cursor-pointer opacity-0 focus-visible:[&+span]:outline-2 focus-visible:[&+span]:outline-offset-2 focus-visible:[&+span]:outline-app-black"
        type="checkbox"
        checked={checked}
        ref={(input) => {
          if (input) input.indeterminate = indeterminate;
        }}
        onChange={onChange}
        aria-label={ariaLabel}
      />
      <span
        className={[
          "relative inline-flex size-[18px] flex-none items-center justify-center rounded border text-app-gray500 [&_svg]:size-full [&_svg_path]:stroke-2",
          checked
            ? "border-app-gray500 bg-app-gray500 text-app-white"
            : "border-app-gray300 bg-app-white",
        ].join(" ")}
        aria-hidden="true"
      >
        {indeterminate ? (
          <span className="absolute top-1/2 left-1/2 h-[1.5px] w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-app-gray500" />
        ) : (
          <CheckIcon />
        )}
      </span>
    </label>
  );
}
