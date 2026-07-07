import ALogo from '@svgs/logos/loadingLogo/a_logo.svg?react'
import FLogo from '@svgs/logos/loadingLogo/f_lofgo.svg?react'
import LLogo from '@svgs/logos/loadingLogo/l_logo.svg?react'
import TLogo from '@svgs/logos/loadingLogo/t_logo.svg?react'

const logos = [
  { key: 'f', Icon: FLogo },
  { key: 'l', Icon: LLogo },
  { key: 'a', Icon: ALogo },
  { key: 't', Icon: TLogo },
]

export default function Loading() {
  return (
    <>
      <style>
        {`
          @keyframes logo-bounce {
            0%,
            100% {
              opacity: 0.45;
              transform: translateY(0);
            }

            25% {
              opacity: 1;
              transform: translateY(-10px);
            }

            50% {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .logo-bounce {
            animation: logo-bounce 0.96s ease-in-out infinite;
          }
        `}
      </style>

      <div
        role="status"
        aria-label="Loading"
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/50"
      >
        <div className="flex flex-col items-center gap-10">
          <div className="flex items-center gap-2">
            {logos.map(({ key, Icon }, index) => (
              <div
                key={key}
                className="logo-bounce size-[47px] [&_svg]:block [&_svg]:size-full"
                style={{
                  animationDelay: `${index * 0.12}s`,
                }}
              >
                <Icon />
              </div>
            ))}
          </div>

          <p className="mt-4 text-14 text-app-black">
            데이터를 불러오는 중입니다. 조금만 기다려주세요.
          </p>
        </div>
      </div>
    </>
  )
}
