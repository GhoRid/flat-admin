export type StepStatus = 'before' | 'progress' | 'done'

type StatusSelectorProps = {
  value: StepStatus
  onChange: (status: StepStatus) => void
}

const STATUS_OPTIONS: Array<{
  label: string
  value: StepStatus
}> = [
  {
    label: '진행 전',
    value: 'before',
  },
  {
    label: '진행 중',
    value: 'progress',
  },
  {
    label: '완료',
    value: 'done',
  },
]

const ACTIVE_STATUS_CLASS: Record<StepStatus, string> = {
  before: 'border-app-gray100 bg-app-gray50 text-app-black',
  progress: 'border-app-red bg-app-red text-white',
  done: 'border-app-primary bg-app-primary text-app-black',
}

export default function StatusSelector({
  value,
  onChange,
}: StatusSelectorProps) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-14 font-medium text-app-gray500">상태</p>

      <div className="flex gap-2">
        {STATUS_OPTIONS.map((option) => {
          const isActive = value === option.value

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={[
                'h-9 rounded-[10px] border px-4 text-15 font-medium transition-colors',
                isActive
                  ? ACTIVE_STATUS_CLASS[option.value]
                  : 'border-app-gray100 bg-white text-app-gray300',
              ].join(' ')}
            >
              {option.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
