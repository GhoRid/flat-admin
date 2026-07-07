import { useId, useMemo, useState } from "react";
import CaretIcon from "../CaretIcon";
import OverlayDropdown from "../OverlayDropdown";

export type DropDownOption = {
  id: number | string;
  label: string;
  disabled?: boolean;
};

type DropDownSectionProps = {
  id: string;
  title?: string;

  options: DropDownOption[];
  value: DropDownOption | null;
  onChange: (next: DropDownOption) => void;

  placeholder?: string;
  disabled?: boolean;

  /** 옵션이 없을 때 보여줄 텍스트 */
  emptyText?: string;

  /** 외부에서 styled() 확장할 수 있게 */
  className?: string;

  /** 메뉴 높이 커스텀 */
  menuMaxHeight?: number;

  /** 화살표 아이콘 표시 여부 (기본: true) */
  chevronVisible?: boolean;

  /** 메뉴 상단 검색 표시 여부 (기본: false) */
  searchable?: boolean;
};

export default function DropDownSection({
  id,
  title,
  options,
  value,
  onChange,
  placeholder = "선택",
  disabled = false,
  emptyText = "선택 가능한 항목이 없습니다.",
  chevronVisible = true,
  className,
  menuMaxHeight = 220,
  searchable = false,
}: DropDownSectionProps) {
  const [openDropdown, setOpenDropdown] = useState(false);
  const [keyword, setKeyword] = useState("");
  const listboxId = useId();
  const showSearchValue = searchable && openDropdown;

  const filteredOptions = useMemo(() => {
    const trimmedKeyword = keyword.trim().toLowerCase();
    if (!searchable || trimmedKeyword.length === 0) return options;

    return options.filter((option) => option.label.toLowerCase().includes(trimmedKeyword));
  }, [keyword, options, searchable]);

  const closeDropdown = () => {
    setOpenDropdown(false);
    setKeyword("");
  };

  const triggerClassName = [
    "flex h-10 w-full items-center justify-between rounded-xl border border-app-gray100 bg-app-white px-2.5 text-14 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-gray100 disabled:cursor-not-allowed disabled:opacity-50",
    value === null ? "text-app-gray300" : "text-app-black",
  ].join(" ");

  return (
    <div
      className={[
        "relative",
        openDropdown ? "z-50" : "",
        className ?? id,
      ].join(" ")}
    >
      {title && <h3 className="mb-2.5 text-14 text-app-gray500">{title}</h3>}
      {searchable ? (
        <div
          className={triggerClassName}
          aria-expanded={openDropdown && !disabled}
          aria-controls={listboxId}
          aria-disabled={disabled}
        >
          <input
            className="h-full min-w-0 flex-1 bg-transparent p-0 text-14 text-app-black outline-none placeholder:text-app-gray300 disabled:cursor-not-allowed"
            value={showSearchValue ? keyword : (value?.label ?? "")}
            onChange={(event) => {
              setKeyword(event.target.value);
              if (!openDropdown) setOpenDropdown(true);
            }}
            onFocus={() => {
              if (!disabled) setOpenDropdown(true);
            }}
            placeholder={placeholder}
            disabled={disabled}
          />
          {chevronVisible && (
            <span
              className={[
                "inline-flex transition-transform duration-[180ms]",
                openDropdown ? "rotate-180" : "rotate-0",
              ].join(" ")}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                if (disabled) return;
                if (openDropdown) {
                  closeDropdown();
                  return;
                }
                setOpenDropdown(true);
              }}
            >
              <CaretIcon direction="down" color="var(--color-app-gray500)" />
            </span>
          )}
        </div>
      ) : (
        <button
          className={triggerClassName}
          type="button"
          onClick={() => {
            if (disabled) return;
            if (openDropdown) {
              closeDropdown();
              return;
            }
            setOpenDropdown(true);
          }}
          aria-expanded={openDropdown && !disabled}
          aria-controls={listboxId}
          disabled={disabled}
        >
          {value?.label ?? placeholder}
          {chevronVisible && (
            <span
              className={[
                "inline-flex transition-transform duration-[180ms]",
                openDropdown ? "rotate-180" : "rotate-0",
              ].join(" ")}
            >
              <CaretIcon direction="down" color="var(--color-app-gray500)" />
            </span>
          )}
        </button>
      )}

      <OverlayDropdown
        open={openDropdown && !disabled}
        items={filteredOptions}
        getItemKey={(option) => option.id}
        getItemLabel={(option) => option.label}
        isItemSelected={(option) => value?.id === option.id}
        isItemDisabled={(option) => Boolean(option.disabled)}
        onItemClick={(option) => {
          onChange(option);
          closeDropdown();
        }}
        emptyText={emptyText}
        onClose={closeDropdown}
        menuMaxHeight={menuMaxHeight}
        role="listbox"
        menuWidth="100%"
      />
    </div>
  );
}
