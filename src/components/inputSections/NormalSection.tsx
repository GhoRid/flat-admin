import type { HTMLAttributes } from "react";

type NormalSectionProps = {
  id?: string;
  title?: string;
  placeholder: string;
  value: string;
  onChange: (next: string) => void;
  inputMode?: HTMLAttributes<HTMLInputElement>["inputMode"];
  errorMessage?: string;
  disabled?: boolean;
};

export default function NormalSection({
  id,
  title,
  placeholder,
  value,
  onChange,
  inputMode,
  errorMessage,
  disabled = false,
}: NormalSectionProps) {
  return (
    <section id={id ?? title?.replace(/\s+/g, "-").toLowerCase()}>
      {title && <h3 className="mb-2.5 text-14 text-app-gray500">{title}</h3>}
      <div className="flex flex-col items-center">
        <input
          className={[
            "h-10 w-full rounded-[10px] border px-2.5 text-14 text-app-black placeholder:text-app-gray500 placeholder:opacity-50",
            errorMessage ? "border-app-red" : "border-app-gray100",
          ].join(" ")}
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          inputMode={inputMode}
          disabled={disabled}
          readOnly={disabled}
        />
        {!!errorMessage && (
          <p className="mt-1.5 self-stretch text-12 text-app-red">{errorMessage}</p>
        )}
      </div>
    </section>
  );
}
