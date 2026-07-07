import React, { useMemo, useState } from "react";
import styled, { css } from "styled-components";
import { colors } from "../../styles/colors";
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

export default function CustomTable<T>({
  columns, // 데이터 항목 정의
  data, // 실제 데이터 배열
  rowKey,
  emptyText = "데이터가 없습니다.",

  defaultSort,
  className,

  stickyHeader = true,
  headerColor = colors.light_gray,
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

  // 왼쪽 "내용 영역" 그리드는 actions 제외
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

    // 정렬 값 추출기
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
      // ✅ 정렬 없음 -> (1)desc -> (2)asc -> (3)정렬 없음
      if (!prev || prev.id !== col.id) return { id: col.id, dir: "desc" };
      if (prev.dir === "desc") return { id: col.id, dir: "asc" };
      return null;
    });
  };

  return (
    <TableContainer
      className={className}
      $borderVisible={containerBorderVisible}
    >
      <Table
        $minWidth={minTableWidth}
        style={{ ["--data-cols" as any]: dataGridTemplate }}
      >
        <Thead
          $sticky={stickyHeader}
          $headerColor={headerColor}
        >
          <Tr
            $borderVisible={true}
            style={headerStyle}
          >
            <HeaderContentTh style={headerStyle}>
              <ContentGrid
                $maxW={tableInnerMaxWidth}
                $columnGap={tableColumnGap}
              >
                {contentColumns.map((col) => {
                  const sortable = col.sortable === true;
                  const active = sort?.id === col.id;
                  const dir = active ? sort?.dir : undefined;
                  const headerAlign = (col.headerAlign ?? col.align ?? "left") as Align;

                  return (
                    <HeaderCell
                      key={col.id}
                      $align={headerAlign}
                    >
                      <HeaderButton
                        type="button"
                        onClick={() => sortable && onClickHeader(col)}
                        $sortable={sortable}
                        $active={active}
                        $align={headerAlign}
                        $padding={col.headerPadding}
                      >
                        <span>{col.header}</span>
                        {sortable && (
                          <SortIcon
                            $active={active}
                            $dir={dir}
                          />
                        )}
                      </HeaderButton>
                    </HeaderCell>
                  );
                })}
              </ContentGrid>
            </HeaderContentTh>

            {hasRight && (
              <HeaderActionTh
                aria-label="actions"
                $rightColumnWidth={rightColumnWidth}
                style={headerStyle}
              />
            )}
          </Tr>
        </Thead>

        <Tbody>
          {sortedData.length === 0 ? (
            <Tr>
              <EmptyTd colSpan={2}>{emptyText}</EmptyTd>
            </Tr>
          ) : (
            sortedData.map((row, rowIndex) => {
              const rowClickable = !!onRowClick && (isRowClickable?.(row, rowIndex) ?? true);

              return (
                <Tr
                  key={getKey(row, rowIndex)}
                  $borderVisible={borderVisible}
                  $clickable={rowClickable}
                  $backgroundColor={rowBackgroundColor?.(row, rowIndex)}
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
                  aria-label={rowClickable ? "테이블 행 열기" : undefined} // ✅ 스크린리더용 (원하면 row값 넣어도 됨)
                >
                  {/* ✅ 왼쪽 "내용"만 tableInnerMaxWidth 1400으로 묶임 */}
                  <ContentTd>
                    <ContentGrid
                      $maxW={tableInnerMaxWidth}
                      $columnGap={tableColumnGap}
                    >
                      {contentColumns.map((col) => {
                        if (col.id === rightColumnId) return null;
                        // columns에서 정의한 render / accessor 순으로 값 추출
                        // col에서 render함수에 row데이터를 전달. render가 없으면 accessor로서 row에서 값 추출
                        const val =
                          col.render?.(row, rowIndex) ??
                          // accessor가 함수면 실행, 아니면 key로 추출
                          (typeof col.accessor === "function"
                            ? col.accessor(row)
                            : col.accessor
                              ? ((row as any)[col.accessor] as React.ReactNode)
                              : "");

                        const title = col.title?.(row);

                        return (
                          <Cell
                            key={col.id}
                            $align={(col.align ?? "left") as Align}
                            $nowrap={!!col.nowrap}
                            $padding={col.cellPadding}
                            $overflowVisible={!!col.cellOverflowVisible}
                            title={title}
                          >
                            {val}
                          </Cell>
                        );
                      })}
                    </ContentGrid>
                  </ContentTd>

                  {hasRight && (
                    <RightTd onClick={(e) => e.stopPropagation()}>
                      <RightCell>
                        {columns.find((c) => c.id === rightColumnId)?.render!(row, rowIndex)}
                      </RightCell>
                    </RightTd>
                  )}
                </Tr>
              );
            })
          )}
        </Tbody>
      </Table>
    </TableContainer>
  );
}

const TableContainer = styled.div<{ $borderVisible: boolean }>`
  width: 100%;
  overflow: hidden;

  border-radius: 10px;
  border: 1px solid ${({ $borderVisible }) => ($borderVisible ? colors.gray : "transparent")};
`;

const Table = styled.table<{ $minWidth: number | string }>`
  width: 100%;

  min-width: ${({ $minWidth }) => (typeof $minWidth === "number" ? `${$minWidth}px` : $minWidth)};

  table-layout: fixed;

  /* 내부(왼쪽) 그리드 컬럼 템플릿 */
  --data-cols: 1fr;
`;

const Thead = styled.thead<{ $sticky: boolean; $headerColor: string }>`
  width: 100%;

  ${({ $sticky }) =>
    $sticky &&
    css`
      position: sticky;
      top: 0;
      z-index: 5;
    `}

  tr {
    background-color: ${({ $headerColor }) => $headerColor ?? colors.light_gray};
  }
`;

const Tbody = styled.tbody`
  tr {
    transition: background-color 0.2s ease-in-out;
  }
`;

const Tr = styled.tr<{
  $borderVisible?: boolean;
  $clickable?: boolean;
  $backgroundColor?: string;
}>`
  border-bottom: 1px solid ${({ $borderVisible }) => ($borderVisible ? colors.gray : "transparent")};
  background-color: ${({ $backgroundColor }) => $backgroundColor ?? "transparent"};

  tbody &:last-of-type {
    border-bottom: none;
  }

  /* tbody 안에 있는 tr만 hover 적용 */
  tbody &:hover:not(:has([data-row-action="true"]:hover)) {
    background-color: ${colors.light_gray};
  }

  ${({ $clickable }) =>
    $clickable &&
    css`
      tbody &,
      tbody & td,
      tbody & td * {
        cursor: pointer !important;
      }

      tbody &:focus-visible {
        outline: 2px solid ${colors.app_black};
        outline-offset: -2px;
      }
    `}
`;

const HeaderContentTh = styled.th`
  width: 100%;
  padding: 0;
  text-align: left;
  position: sticky;
`;

const HeaderActionTh = styled.th<{ $rightColumnWidth: number | string }>`
  width: ${({ $rightColumnWidth }) =>
    typeof $rightColumnWidth === "number" ? `${$rightColumnWidth}px` : $rightColumnWidth};
  padding: 0;
`;

const ContentTd = styled.td`
  padding: 0;
  vertical-align: middle;
  width: 100%;
`;

const ContentGrid = styled.div<{ $maxW: number; $columnGap: number | string }>`
  /* 왼쪽만 묶어서 폭 제한 */
  max-width: ${({ $maxW }) => $maxW}px;
  width: 100%;

  padding: 0 5px 0 20px;

  display: grid;
  grid-template-columns: var(--data-cols);
  column-gap: ${({ $columnGap }) =>
    typeof $columnGap === "number" ? `${$columnGap}px` : $columnGap};
  align-items: center;
`;

const HeaderCell = styled.div<{ $align: Align }>`
  padding: 15px 0;
  min-width: 0;

  text-align: ${({ $align }) => $align};
  white-space: nowrap;
`;

const HeaderButton = styled.button<{
  $sortable: boolean;
  $active: boolean;
  $padding?: string;
  $align: Align;
}>`
  width: 100%;
  display: inline-flex;
  align-items: center;
  justify-content: ${({ $align }) =>
    $align === "right" ? "flex-end" : $align === "center" ? "center" : "flex-start"};
  gap: 6px;

  background: transparent;
  border: 0;
  padding: ${({ $padding }) => $padding ?? "0"};

  cursor: ${({ $sortable }) => ($sortable ? "pointer" : "default")};
  opacity: ${({ $active }) => ($active ? 1 : 0.85)};

  span {
    font-size: 14px;
    font-weight: 500;
    color: ${colors.dark_gray};
  }
`;

const SortIcon = styled.span<{ $dir?: SortDir; $active: boolean }>`
  display: inline-flex;
  flex-direction: column;
  gap: 2px;
  pointer-events: none;

  &::before,
  &::after {
    content: "";
    width: 0;
    height: 0;
    border-left: 4px solid transparent;
    border-right: 4px solid transparent;
  }

  /* ▲ (asc) */
  &::before {
    border-bottom: 6px solid ${colors.dark_gray};
    opacity: ${({ $active, $dir }) => (!$active ? 0.25 : $dir === "asc" ? 0.9 : 0.25)};
  }

  /* ▼ (desc) */
  &::after {
    border-top: 6px solid ${colors.dark_gray};
    opacity: ${({ $active, $dir }) => (!$active ? 0.25 : $dir === "desc" ? 0.9 : 0.25)};
  }
`;

const Cell = styled.div<{
  $align: Align;
  $nowrap: boolean;
  $padding?: string;
  $overflowVisible: boolean;
}>`
  min-height: 45px;
  padding: ${({ $padding }) => $padding ?? "5px 0"};
  font-size: 14px;
  text-align: ${({ $align }) => $align};

  min-width: 0;
  display: flex;
  align-items: center;

  overflow: ${({ $overflowVisible }) => ($overflowVisible ? "visible" : "hidden")};

  ${({ $nowrap, $overflowVisible }) =>
    $nowrap &&
    !$overflowVisible &&
    css`
      white-space: nowrap;
      text-overflow: ellipsis;
    `}
`;

const EmptyTd = styled.td`
  padding: 18px 16px;
  text-align: center;
  color: ${colors.dark_gray};
  opacity: 0.6;
`;

const RightTd = styled.td`
  width: 44px;
  padding: 0 12px 0 0;
  vertical-align: middle;
`;

const RightCell = styled.div`
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-end;
`;
