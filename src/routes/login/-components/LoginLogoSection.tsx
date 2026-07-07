import FlatLogo from '@svgs/logos/FlatLogo.svg?react'

export default function LoginLogoSection() {
  return (
    <div className="flex flex-col items-center gap-5 px-2.5 py-[30px]">
      <FlatLogo />

      <p className="text-14 font-normal text-app-black">
        체대입시 원장을 위한 통합 관리 솔루션
      </p>
    </div>
  )
}
