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

type RequestInfoCardProps = {
  name?: string
  nameLabel?: string
  requestedAt?: string
  email?: string
  phoneNumber?: string
}

export default function RequestInfoCard({
  name = '피스톤 체대입시 북구점',
  nameLabel = '대표자',
  requestedAt = '2026-01-01',
  email = 'admin@gmail.com',
  phoneNumber = '010-1234-1234',
}: RequestInfoCardProps) {
  const Items: InfoItem[] = [
    {
      key: 'school',
      label: nameLabel,
      value: name,
      icon: <SmallUserIcon />,
    },
    email && {
      key: 'profile',
      label: '이메일',
      value: email,
      icon: <MailIcon />,
    },
    {
      key: 'phone',
      label: '연락처',
      value: phoneNumber,
      icon: <PhoneIcon />,
    },
  ].filter(Boolean) as InfoItem[]

  return (
    <div className="flex flex-col gap-6 w-full justify-between rounded-xl border border-app-gray100 bg-white p-6 text-left">
      <div className="flex flex-col gap-4">
        <p className="text-18 font-medium text-app-black">{name}</p>

        <div className="flex items-center gap-2.5 text-14 font-normal text-app-gray500/50">
          <span>신청일</span>
          <span>{requestedAt}</span>
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
