import MoreIcon from "@svgs/common/More.svg?react";
import { useCallback, useRef } from "react";

type Anchor = { top: number; right: number };

type Props<T> = {
  row: T;
  onOpen: (payload: { row: T; anchor: Anchor }) => void;
};

export default function TableRowActionButton<T>({ row, onOpen }: Props<T>) {
  const btnRef = useRef<HTMLButtonElement>(null);

  const handleOpen = useCallback(() => {
    const el = btnRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();

    onOpen({
      row,
      anchor: {
        top: rect.top,
        right: rect.right,
      },
    });
  }, [row, onOpen]);

  return (
    <button
      className="rounded-full p-2 text-app-gray500 hover:bg-app-gray50 [&_svg]:size-[18px]"
      ref={btnRef}
      type="button"
      onClick={handleOpen}
      data-row-action="true"
    >
      <MoreIcon />
    </button>
  );
}
