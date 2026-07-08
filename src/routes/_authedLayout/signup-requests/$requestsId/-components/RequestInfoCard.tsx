import MailIcon from '@svgs/common/Mail.svg?react'
import PhoneIcon from '@svgs/common/Phone.svg?react'
import SmallUserIcon from '@svgs/person/SmallPerson.svg?react'

type InfoItem = {
  key: string
  label?: string
  value?: string
  icon: React.ReactNode
  wrap?: boolean
}

export default function RequestInfoCard() {
  const Items: InfoItem[] = [
    {
      key: 'school',
      label: '대표자',
      value: '이헌재',
      icon: <SmallUserIcon />,
    },
    {
      key: 'profile',
      label: '이메일',
      value: 'admin@gmail.com',
      icon: <MailIcon />,
    },
    {
      key: 'profile',
      label: '연락처',
      value: '010-1234-1234',
      icon: <PhoneIcon />,
    },
  ]

  return (
    <div className="flex flex-col gap-6 w-full justify-between rounded-xl border border-app-gray100 bg-white p-6 text-left">
      <div className="flex flex-col gap-4">
        <p className="text-18 font-medium text-app-black">
          피스톤 체대입시 북구점
        </p>

        <div className="flex items-center gap-2.5 text-14 font-normal text-app-gray500/50">
          <span>신청일</span>
          <span>2026-01-01</span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {Items.map((item) => (
          <div
            key={item.key}
            className={`flex items-center gap-2.5 text-14 font-normal text-app-gray500/50 ${
              item.wrap ? 'flex-wrap' : ''
            }`}
          >
            {item.icon}
            <span className="min-w-22 text-app-black">{item.label}</span>
            <span className="text-app-black">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
