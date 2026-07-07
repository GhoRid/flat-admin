import SearchIcon from "@svgs/common/Search.svg?react";
import React, { useMemo, useState } from "react";

type SearchBarProps = {
  value?: string;
  onChange?: (v: string) => void;
  onSearch?: (v: string) => void;
  placeholder?: string;
};

export default function SearchBar({
  value,
  onChange,
  onSearch,
  placeholder = "검색어를 입력해주세요.",
}: SearchBarProps) {
  const isControlled = useMemo(() => value !== undefined, [value]);
  const [inner, setInner] = useState("");
  const v = isControlled ? value! : inner;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isControlled) setInner(e.target.value);
    onChange?.(e.target.value);
  };

  const doSearch = () => onSearch?.(v);

  return (
    <div className="group flex h-[50px] items-center gap-[5px] rounded-[10px] border border-app-gray100 px-[15px] transition-colors duration-200 focus-within:border-app-black">
      <input
        className="w-full bg-transparent text-14 outline-none placeholder:text-app-gray500 placeholder:opacity-50"
        type="text"
        value={v}
        onChange={handleChange}
        onKeyDown={(e) => {
          if (e.key === "Enter") doSearch();
        }}
        placeholder={placeholder}
        aria-label={placeholder}
      />

      <SearchIcon className="size-[30px] text-app-gray500 opacity-50 transition-all duration-200 group-focus-within:text-app-black group-focus-within:opacity-100" />
    </div>
  );
}
