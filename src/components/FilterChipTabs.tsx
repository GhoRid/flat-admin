export type FilterTabItem<T extends string = string> = {
  value: T;
  label: string;
  count: number;
};

type FilterChipTabsProps<T extends string> = {
  tabs: FilterTabItem<T>[];
  activeTab: T;
  onChange: (tab: T) => void;
  showAll?: boolean;
  allValue?: T;
};

export default function FilterChipTabs<T extends string>({
  tabs,
  activeTab,
  onChange,
  showAll = true,
  allValue = "all" as T,
}: FilterChipTabsProps<T>) {
  const allTab = tabs.find((item) => item.value === allValue);
  const mainTabs = tabs.filter((item) => item.value !== allValue);

  const renderTab = (item: FilterTabItem<T>) => {
    const active = activeTab === item.value;

    return (
      <button
        className={[
          "inline-flex h-8 items-center gap-[5px] rounded-[20px] border px-2.5 text-14",
          active
            ? "border-app-gray100 bg-app-gray50 text-app-black"
            : "border-app-gray100 bg-app-white text-app-gray500",
        ].join(" ")}
        key={item.value}
        type="button"
        onClick={() => onChange(item.value)}
      >
        <span>{item.label}</span>
        <span className="text-app-gray300">{item.count}</span>
      </button>
    );
  };

  return (
    <div className="flex items-center gap-2.5">
      {mainTabs.map(renderTab)}

      {showAll && allTab && (
        <>
          <div className="h-6 w-px bg-app-gray100" />
          {renderTab(allTab)}
        </>
      )}
    </div>
  );
}
