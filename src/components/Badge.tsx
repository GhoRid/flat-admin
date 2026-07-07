import type { CSSProperties, ReactNode } from "react";

type BadgeProps = {
  children: ReactNode;
  color?: string;
  backgroundColor?: string;
  borderColor?: string;
  height?: number | string;
  padding?: string;
  borderRadius?: number | string;
  fontWeight?: number;
};

const toCssSize = (value: number | string) => (typeof value === "number" ? `${value}px` : value);

export default function Badge({
  children,
  color = "var(--color-app-black)",
  backgroundColor = "var(--color-app-gray50)",
  borderColor = "transparent",
  height = 25,
  padding = "0 8px",
  borderRadius = 8,
  fontWeight = 400,
}: BadgeProps) {
  const style: CSSProperties = {
    color,
    backgroundColor,
    borderColor,
    height: toCssSize(height),
    padding,
    borderRadius: toCssSize(borderRadius),
    fontWeight,
  };

  return (
    <span
      className="inline-flex w-fit items-center justify-center border text-14 leading-none"
      style={style}
    >
      {children}
    </span>
  );
}
