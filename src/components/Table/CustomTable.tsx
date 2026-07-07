import React, { useMemo, useState } from "react";
import type { ColumnDef } from "../../types/shared.types";

type Align = "left" | "center" | "right";
type SortDir = "asc" | "desc";
type SortState = { id: string; dir: SortDir } | null;

type CustomTableProps<T> = {
  columns: ColumnDef<T>[];
  data: T[];

  /** row key 생성 */
  rowKey?: keyof T | ((row: T, index: number) => React.Key);

  /** 비어있을 때 표시 */
  emptyText?: React.ReactNode;

  /** 헤더 고정 */
  stickyHeader?: boolean;

  //** 테두리 표시 여부 */
  containerBorderVisible?: boolean;
  borderVisible?: boolean;

  /** 헤더 배경색 */
  headerColor?: string;
  /** 헤더 스타일 */
  headerStyle?: React.CSSProperties;

  /** 테이블 최소 너비(가로 스크롤 유도) */
  minTableWidth?: number | string;

  /** 테이블 내부(왼쪽 내용 영역) 최대 너비 */
  tableInnerMaxWidth?: number;
  /** 테이블 컬럼 사이 간격 */
  tableColumnGap?: number | string;

  /**  초기 정렬 */
  defaultSort?: { id: string; dir?: SortDir };

  className?: string;
  rightColumnId?: string;
  rightColumnWidth?: number | string;

  /** 행 클릭 이벤트 핸들러 */
  onRowClick?: (row: T, rowIndex: number) => void;
  isRowClickable?: (row: T, rowIndex: number) => boolean;
  rowBackgroundColor?: (row: T, rowIndex: number) => string | undefined;
};

const RIGHT_COL_W = 44; // px

const toCssSize = (value: number | string) =>
  typeof value === "number" ? `${value}px` : value;

const getTextAlignClass = (align: Align) => {
  if (align === "center") return "text-center";
  if (align === "right") return "text-right";
  return "text-left";
};

const getJustifyClass = (align: Align) => {
  if (align === "center") return "justify-center";
  if (align === "right") return "justify-end";
  return "justify-start";
};

export default function CustomTable<T>({
  columns, // 데이터 항목 정의
  data, // 실제 데이터 배열
  rowKey,
  emptyText = "데이터가 없습니다.",

  defaultSort,
  className,

  stickyHeader = true,
  headerColor = "var(--color-app-gray50)",
  headerStyle,
  containerBorderVisible = true,
  borderVisible = true,

  minTableWidth = "100%",
  tableInnerMaxWidth = 1400,
  tableColumnGap = 0,

  rightColumnId = "actions",
  rightColumnWidth = RIGHT_COL_W,

  onRowClick,
  isRowClickable,
  rowBackgroundColor,
}: CustomTableProps<T>) {
  const [sort, setSort] = useState<SortState>(
    defaultSort ? { id: defaultSort.id, dir: defaultSort.dir ?? "asc" } : null,
  );

  const getKey = (row: T, index: number) => {
    if (!rowKey) return index;
    if (typeof rowKey === "function") return rowKey(row, index);
    const v = (row as any)[rowKey];
    return (v as React.Key) ?? index;
  };

  const contentColumns = useMemo(
    () => columns.filter((c) => c.id !== rightColumnId),
    [columns, rightColumnId],
  );

  const dataGridTemplate = useMemo(() => {
    return contentColumns
      .map((c) => {
        const flex = (c as any).flex ?? 1;
        const min = c.minWidth ?? 0;
        const minStr = typeof min === "number" ? `${min}px` : min;
        return `minmax(${minStr}, ${flex}fr)`;
      })
      .join(" ");
  }, [contentColumns]);

  const rightCol = useMemo(
    () => columns.find((c) => c.id === rightColumnId),
    [columns, rightColumnId],
  );
  const hasRight = !!rightCol;

  const sortedData = useMemo(() => {
    if (!sort) return data;

    const col = columns.find((c) => c.id === sort.id);
    if (!col || !col.sortable) return data;

    const getSortVal = (row: T) => {
      const v = col.sortValue?.(row);

      if (v instanceof Date) return v.getTime();
      if (typeof v === "number") return v;
      if (typeof v === "string") {
        const t = Date.parse(v);
        if (!Number.isNaN(t) && /[-/.]/.test(v)) return t;
        return v.toLowerCase();
      }
      if (v == null) {
        if (typeof col.accessor === "string") {
          const raw = (row as any)[col.accessor];
          if (typeof raw === "number") return raw;
          if (typeof raw === "string") return raw.toLowerCase();
        }
        return "";
      }
      return v as any;
    };

    const copy = [...data];
    copy.sort((a, b) => {
      const av = getSortVal(a);
      const bv = getSortVal(b);

      if (typeof av === "number" && typeof bv === "number") {
        return sort.dir === "asc" ? av - bv : bv - av;
      }

      const as = String(av);
      const bs = String(bv);
      const cmp = as.localeCompare(bs, "ko");
      return sort.dir === "asc" ? cmp : -cmp;
    });

    return copy;
  }, [data, sort, columns]);

  const onClickHeader = (col: ColumnDef<T>) => {
    if (col.sortable !== true) return;

    setSort((prev) => {
      if (!prev || prev.id !== col.id) return { id: col.id, dir: "desc" };
      if (prev.dir === "desc") return { id: col.id, dir: "asc" };
      return null;
    });
  };

  const contentGridStyle: React.CSSProperties = {
    maxWidth: tableInnerMaxWidth,
    gridTemplateColumns: dataGridTemplate,
    columnGap: toCssSize(tableColumnGap),
  };

  return (
    <div
      className={`w-full overflow-hidden rounded-[10px] border ${
        containerBorderVisible ? "border-app-gray100" : "border-transparent"
      } ${className ?? ""}`}
    >
      <table
        className="w-full table-fixed"
        style={{ minWidth: toCssSize(minTableWidth) }}
      >
        <thead className={`w-full ${stickyHeader ? "sticky top-0 z-[5]" : ""}`}>
          <tr
            className="border-b border-app-gray100"
            style={{ backgroundColor: headerColor, ...headerStyle }}
          >
            <th
              className="sticky w-full p-0 text-left"
              style={headerStyle}
            >
              <div
                className="grid w-full items-center pr-[5px] pl-5"
                style={contentGridStyle}
              >
                {contentColumns.map((col) => {
                  const sortable = col.sortable === true;
                  const active = sort?.id === col.id;
                  const dir = active ? sort?.dir : undefined;
                  const headerAlign = (col.headerAlign ?? col.align ?? "left") as Align;

                  return (
                    <div
                      key={col.id}
                      className={`min-w-0 py-[15px] whitespace-nowrap ${getTextAlignClass(
                        headerAlign,
                      )}`}
                    >
                      <button
                        type="button"
                        onClick={() => sortable && onClickHeader(col)}
                        className={`inline-flex w-full items-center gap-1.5 bg-transparent text-14 font-medium text-app-gray500 ${
                          sortable ? "cursor-pointer" : "cursor-default"
                        } ${active ? "opacity-100" : "opacity-85"} ${getJustifyClass(
                          headerAlign,
                        )}`}
                        style={{ padding: col.headerPadding ?? 0 }}
                      >
                        <span>{col.header}</span>
                        {sortable && (
                          <SortIcon
                            active={active}
                            dir={dir}
                          />
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </th>

            {hasRight && (
              <th
                aria-label="actions"
                className="p-0"
                style={{ width: toCssSize(rightColumnWidth), ...headerStyle }}
              />
            )}
          </tr>
        </thead>

        <tbody>
          {sortedData.length === 0 ? (
            <tr>
              <td
                colSpan={2}
                className="px-4 py-[18px] text-center text-app-gray500 opacity-60"
              >
                {emptyText}
              </td>
            </tr>
          ) : (
            sortedData.map((row, rowIndex) => {
              const rowClickable = !!onRowClick && (isRowClickable?.(row, rowIndex) ?? true);

              return (
                <tr
                  key={getKey(row, rowIndex)}
                  className={`transition-colors last:border-b-0 hover:bg-app-gray50 ${
                    borderVisible ? "border-b border-app-gray100" : "border-b border-transparent"
                  } ${
                    rowClickable
                      ? "cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-app-black [&_td]:cursor-pointer [&_td_*]:cursor-pointer"
                      : ""
                  }`}
                  style={{ backgroundColor: rowBackgroundColor?.(row, rowIndex) }}
                  onClick={() => {
                    if (!rowClickable) return;
                    onRowClick?.(row, rowIndex);
                  }}
                  tabIndex={rowClickable ? 0 : -1}
                  onKeyDown={(e) => {
                    if (!rowClickable) return;
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onRowClick?.(row, rowIndex);
                    }
                  }}
                  aria-label={rowClickable ? "테이블 행 열기" : undefined}
                >
                  <td className="w-full p-0 align-middle">
                    <div
                      className="grid w-full items-center pr-[5px] pl-5"
                      style={contentGridStyle}
                    >
                      {contentColumns.map((col) => {
                        const val =
                          col.render?.(row, rowIndex) ??
                          (typeof col.accessor === "function"
                            ? col.accessor(row)
                            : col.accessor
                              ? ((row as any)[col.accessor] as React.ReactNode)
                              : "");

                        const title = col.title?.(row);
                        const align = (col.align ?? "left") as Align;

                        return (
                          <div
                            key={col.id}
                            className={`flex min-h-[45px] min-w-0 items-center text-14 ${getTextAlignClass(
                              align,
                            )} ${col.cellOverflowVisible ? "overflow-visible" : "overflow-hidden"} ${
                              col.nowrap && !col.cellOverflowVisible
                                ? "truncate whitespace-nowrap"
                                : ""
                            }`}
                            style={{ padding: col.cellPadding ?? "5px 0" }}
                            title={title}
                          >
                            {val}
                          </div>
                        );
                      })}
                    </div>
                  </td>

                  {hasRight && (
                    <td
                      className="w-11 py-0 pr-3 pl-0 align-middle"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex h-full items-center justify-end">
                        {columns.find((c) => c.id === rightColumnId)?.render!(row, rowIndex)}
                      </div>
                    </td>
                  )}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

function SortIcon({ active, dir }: { active: boolean; dir?: SortDir }) {
  return (
    <span className="pointer-events-none inline-flex flex-col gap-0.5">
      <span
        className={`h-0 w-0 border-x-4 border-b-[6px] border-x-transparent border-b-app-gray500 ${
          !active ? "opacity-25" : dir === "asc" ? "opacity-90" : "opacity-25"
        }`}
      />
      <span
        className={`h-0 w-0 border-x-4 border-t-[6px] border-x-transparent border-t-app-gray500 ${
          !active ? "opacity-25" : dir === "desc" ? "opacity-90" : "opacity-25"
        }`}
      />
    </span>
  );
}
