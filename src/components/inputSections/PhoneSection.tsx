import { useMemo } from "react";
import { formatPhone, onlyDigits } from "../../utils/format";

type PhoneSectionProps = {
  id?: string;
  title: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
};

export default function PhoneSection({
  id,
  title,
  placeholder,
  value,
  onChange,
}: PhoneSectionProps) {
  const digits = useMemo(() => onlyDigits(value).slice(0, 11), [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(onlyDigits(e.target.value).slice(0, 11));
  };

  return (
    <section id={id ?? title.replace(/\s+/g, "-").toLowerCase()}>
      <h3 className="mb-2.5 text-14 text-app-gray500">{title}</h3>
      <div className="flex items-center">
        <input
          className="h-10 w-full rounded-[10px] border border-app-gray100 px-2.5 text-14 text-app-black outline-none placeholder:text-app-gray500 placeholder:opacity-50 focus:border-app-black"
          type="text"
          inputMode="numeric"
          autoComplete="tel"
          placeholder={placeholder}
          value={formatPhone(digits)}
          onChange={handleChange}
        />
      </div>
    </section>
  );
}
