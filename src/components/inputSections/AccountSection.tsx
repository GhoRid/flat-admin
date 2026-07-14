type AccountSectionProps = {
  bankOptions: string[]
  bankName: string
  accountNumber: string
  onBankNameChange: (next: string) => void
  onAccountNumberChange: (next: string) => void
}

export default function AccountSection({
  bankOptions,
  bankName,
  accountNumber,
  onBankNameChange,
  onAccountNumberChange,
}: AccountSectionProps) {
  return (
    <section className="flex flex-col gap-2">
      <h3 className="text-14 font-medium text-app-gray500">계좌번호</h3>
      <div className="grid grid-cols-[1fr_1.6fr] gap-1">
        <select
          value={bankName}
          onChange={(e) => onBankNameChange(e.target.value)}
          className={inputClassName}
        >
          <option value="">은행 선택</option>
          {bankOptions.map((bank) => (
            <option key={bank} value={bank}>
              {bank}
            </option>
          ))}
        </select>

        <input
          value={accountNumber}
          onChange={(e) => onAccountNumberChange(e.target.value)}
          placeholder="계좌번호를 입력해주세요."
          className={inputClassName}
        />
      </div>
    </section>
  )
}

const inputClassName =
  'h-10 w-full rounded-[10px] border border-app-gray100 bg-white px-4 text-14 text-app-black outline-none placeholder:text-app-gray300 focus:border-app-black'
