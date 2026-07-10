type AddressSectionProps = {
  zipCode: string
  roadAddress: string
  detailAddress: string
  referenceAddress: string
  onDetailAddressChange: (next: string) => void
  onPostcodeClick: () => void
}

export default function AddressSection({
  zipCode,
  roadAddress,
  detailAddress,
  referenceAddress,
  onDetailAddressChange,
  onPostcodeClick,
}: AddressSectionProps) {
  return (
    <section className="flex flex-col gap-2">
      <h3 className="text-14 font-medium text-app-gray500">주소</h3>
      <div className="flex flex-col gap-2">
        <div className="grid grid-cols-[1fr_120px] gap-2">
          <input
            value={zipCode}
            placeholder="우편번호"
            readOnly
            className={inputClassName}
          />

          <button
            type="button"
            onClick={onPostcodeClick}
            className="h-10 whitespace-nowrap rounded-[10px] bg-app-gray50 px-3 text-14 font-medium text-app-black"
          >
            우편번호 찾기
          </button>
        </div>

        <input
          value={roadAddress}
          placeholder="도로명주소"
          readOnly
          className={inputClassName}
        />

        <div className="grid grid-cols-2 gap-2">
          <input
            value={detailAddress}
            onChange={(e) => onDetailAddressChange(e.target.value)}
            placeholder="상세 주소"
            className={inputClassName}
          />

          <input
            value={referenceAddress}
            placeholder="참고 항목"
            readOnly
            className={inputClassName}
          />
        </div>
      </div>
    </section>
  )
}

const inputClassName =
  'h-10 w-full rounded-[10px] border border-app-gray100 bg-white px-4 text-14 text-app-black outline-none placeholder:text-app-gray300 focus:border-app-black'
