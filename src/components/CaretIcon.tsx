import CaretLeft from "@svgs/common/CaretLeft.svg?react";

type Dir = "up" | "right" | "down" | "left";

const rot: Record<Dir, number> = { up: 90, right: 180, down: 270, left: 0 };

const CaretIcon = ({
  color = "#000",
  direction = "down",
  className,
  size,
}: {
  color?: string;
  direction?: Dir;
  className?: string;
  size?: number;
}) => {
  return (
    <CaretLeft
      className={className}
      style={{
        color: color,
        transform: `rotate(${rot[direction]}deg)`,
        width: size,
        height: size,
      }}
    />
  );
};

export default CaretIcon;
