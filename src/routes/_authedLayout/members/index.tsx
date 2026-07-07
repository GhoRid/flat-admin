import FilterDropdown from '#/components/FilterDropdown'
import TableSearchBar from '#/components/SearchBar'
import CustomTable from '#/components/Table/CustomTable'
import type { ColumnDef } from '#/types/shared.types'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authedLayout/members/')({
  component: RouteComponent,
})

type TableType = {
  /** 학원명 */
  academyName: string

  /** 대표자 */
  owner: string

  /** 연락처 */
  phoneNumber: string

  /** 가입일 */
  joinedAt: string
}

type MemberFilter = 'all'

const members: TableType[] = []

const memberColumns: ColumnDef<TableType>[] = [
  {
    id: 'academyName',
    header: '학원명',
    accessor: 'academyName',
    flex: 1,
    minWidth: 180,
    nowrap: true,
    sortable: true,
  },
  {
    id: 'owner',
    header: '대표자',
    accessor: 'owner',
    flex: 0.8,
    minWidth: 120,
    nowrap: true,
  },
  {
    id: 'phoneNumber',
    header: '연락처',
    accessor: 'phoneNumber',
    flex: 1,
    minWidth: 150,
    nowrap: true,
  },
  {
    id: 'joinedAt',
    header: '가입일',
    accessor: 'joinedAt',
    flex: 0.8,
    minWidth: 120,
    nowrap: true,
    sortable: true,
  },
]

const memberFilterOptions = [
  {
    value: 'all',
    label: '전체',
  },
] satisfies Array<{ value: MemberFilter; label: string }>

function RouteComponent() {
  return (
    <div className="p-6 flex flex-col gap-4">
      <div className="flex h-8 items-center justify-between">
        <h3 className="text-18 font-medium">회원 관리</h3>

        <div className="flex h-full items-center gap-2">
          <TableSearchBar />
          <FilterDropdown<MemberFilter>
            defaultValue="all"
            options={memberFilterOptions}
            offValue="all"
          />
        </div>
      </div>

      <CustomTable
        columns={memberColumns}
        data={members}
        rowKey={(_, index) => index}
      />
    </div>
  )
}
