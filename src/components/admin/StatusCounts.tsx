import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatusCount {
    status: string;
    count: number;
    label: string;
    colorClasses: {
        bg: string;
        text: string;
        activeBg: string;
        activeText: string;
    };
}

interface StatusCountsProps {
    statusCounts: StatusCount[];
    activeFilter: string;
    onFilterChange: (status: string) => void;
}

// Helper to extract Tailwind color values
const getColorFromClass = (className: string): string => {
    const colorMap: Record<string, string> = {
        'bg-amber-100': '#fef3c7',
        'bg-amber-200': '#fde68a',
        'text-amber-700': '#b45309',
        'text-amber-900': '#78350f',
        'bg-blue-100': '#dbeafe',
        'bg-blue-200': '#bfdbfe',
        'text-blue-700': '#1d4ed8',
        'text-blue-900': '#1e3a8a',
        'bg-indigo-100': '#e0e7ff',
        'bg-indigo-200': '#c7d2fe',
        'text-indigo-700': '#4338ca',
        'text-indigo-900': '#312e81',
        'bg-green-100': '#dcfce7',
        'bg-green-200': '#bbf7d0',
        'text-green-700': '#15803d',
        'text-green-900': '#14532d',
        'bg-gray-200': '#e5e7eb',
        'bg-gray-300': '#d1d5db',
        'text-gray-700': '#374151',
        'text-gray-900': '#111827',
        'bg-red-100': '#fee2e2',
        'bg-red-200': '#fecaca',
        'text-red-700': '#b91c1c',
        'text-red-900': '#7f1d1d',
        'bg-slate-100': '#f1f5f9',
        'bg-slate-200': '#e2e8f0',
        'text-slate-700': '#334155',
        'text-slate-900': '#0f172a',
    };
    return colorMap[className] || '';
};

const StatusCounts = ({ statusCounts, activeFilter, onFilterChange }: StatusCountsProps) => {
    // Calculate total count
    const totalCount = statusCounts.reduce((sum, item) => sum + item.count, 0);

    // Define 'All' item with neutral gray styling
    const allItem = {
        status: "all",
        count: totalCount,
        label: "All",
        colorClasses: {
            bg: "bg-slate-100",
            text: "text-slate-700",
            activeBg: "bg-slate-200",
            activeText: "text-slate-900"
        }
    };

    // Combine 'All' with existing status counts
    const allStatusCounts = [allItem, ...statusCounts];

    return (
        <div className="flex flex-wrap gap-2 mb-4">
            {allStatusCounts.map(({ status, count, label, colorClasses }) => {
                const isActive = activeFilter === status;

                const bgColor = isActive
                    ? getColorFromClass(colorClasses.activeBg)
                    : getColorFromClass(colorClasses.bg);

                const textColor = isActive
                    ? getColorFromClass(colorClasses.activeText)
                    : getColorFromClass(colorClasses.text);

                const hoverBgColor = getColorFromClass(colorClasses.activeBg);

                return (
                    <button
                        key={status}
                        onClick={() => onFilterChange(isActive ? "all" : status)}
                        className={cn(
                            "transition-all duration-200 group",
                            "focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0",
                            "outline-none ring-0 border-0",
                            isActive ? "scale-105" : "hover:scale-105 active:scale-95"
                        )}
                        style={{ outline: 'none', boxShadow: 'none' }}
                        title={`${isActive ? "Clear filter" : "Filter by"} ${label}`}
                    >
                        <Badge
                            className="border-0 px-3 py-1.5 text-sm font-semibold cursor-pointer flex items-center gap-1.5 transition-all outline-none ring-0"
                            style={{
                                backgroundColor: bgColor,
                                color: textColor,
                                outline: 'none',
                                boxShadow: isActive ? '0 10px 15px -3px rgb(0 0 0 / 0.1)' : '0 1px 2px 0 rgb(0 0 0 / 0.05)'
                            }}
                            onMouseEnter={(e) => {
                                if (!isActive) {
                                    e.currentTarget.style.backgroundColor = hoverBgColor;
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!isActive) {
                                    e.currentTarget.style.backgroundColor = bgColor;
                                }
                            }}
                        >
                            <span>{label}</span>
                            <span className={cn(
                                "font-bold",
                                isActive && "underline"
                            )}>
                                {count}
                            </span>
                        </Badge>
                    </button>
                );
            })}
        </div>
    );
};

export default StatusCounts;
