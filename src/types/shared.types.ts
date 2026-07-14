// ------------------------------------------------------------------------------

/**
 * 테이블 컬럼 정의 타입
 */
export type Align = 'left' | 'center' | 'right'

export type StudentStatus = '재원' | '휴원' | '퇴원'
export type instructorStatus = '재직' | '퇴직'

export type ColumnDef<T> = {
  id: string
  header: React.ReactNode

  accessor?: keyof T | ((row: T) => React.ReactNode)
  render?: (row: T, rowIndex: number) => React.ReactNode

  /** ✅ fr 비율 (flex처럼) */
  flex?: number // 기본 1
  /** ✅ 최소 너비 (이 밑으로는 가로 스크롤) */
  minWidth?: number | string

  cellPadding?: string // ✅ ex) "15px 0" | "0" | "0 6px"
  headerPadding?: string // ✅ 헤더도 같이 필요하면

  align?: Align
  headerAlign?: Align
  nowrap?: boolean
  cellOverflowVisible?: boolean
  title?: (row: T) => string

  sortable?: boolean
  sortValue?: (row: T) => string | number | Date | null | undefined
}

// ------------------------------------------------------------------------------
