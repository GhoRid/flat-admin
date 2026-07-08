export type DocumentTab = 'business-license' | 'bankbook-copy'

type DocumentPreviewPanelProps = {
  activeTab: DocumentTab
  onTabChange: (tab: DocumentTab) => void
}

const DOCUMENT_TABS: Array<{
  label: string
  value: DocumentTab
}> = [
  {
    label: '사업자등록증',
    value: 'business-license',
  },
  {
    label: '통장 사본',
    value: 'bankbook-copy',
  },
]

export default function DocumentPreviewPanel({
  activeTab,
  onTabChange,
}: DocumentPreviewPanelProps) {
  return (
    <div className="min-h-170 h-full rounded-2xl bg-app-gray700 p-3">
      <div className="grid h-10 grid-cols-2 rounded-[10px] bg-app-gray100 p-1">
        {DOCUMENT_TABS.map((tab) => {
          const isActive = activeTab === tab.value

          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => onTabChange(tab.value)}
              className={[
                'h-full rounded-[10px] text-14 font-normal transition-colors duration-150',
                isActive
                  ? 'bg-white text-app-black'
                  : 'bg-transparent text-app-black',
              ].join(' ')}
            >
              {tab.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
