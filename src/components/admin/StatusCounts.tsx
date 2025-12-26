import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

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
    tooltip?: string;
}

interface StatusCountsProps {
    statusCounts: StatusCount[];
    activeFilter: string;
    onFilterChange: (status: string) => void;
    children?: React.ReactNode;
}

// Helper to extract Tailwind color values - HIGH CONTRAST VERSION
const getColorFromClass = (className: string): string => {
    const colorMap: Record<string, string> = {
        // Pending - Vivid Yellow/Orange
        'bg-amber-100': '#fcd34d',      // amber-300 for more vibrant base
        'bg-amber-200': '#fbbf24',      // amber-400 for active state
        'text-amber-700': '#92400e',    // amber-800 for darker text
        'text-amber-900': '#78350f',    // amber-900 for active text
        // Contacted - Vivid Blue
        'bg-blue-100': '#93c5fd',       // blue-300 for more vibrant base
        'bg-blue-200': '#60a5fa',       // blue-400 for active state
        'text-blue-700': '#1e40af',     // blue-800 for darker text
        'text-blue-900': '#1e3a8a',     // blue-900 for active text
        // Scheduled - Vivid Indigo/Purple
        'bg-indigo-100': '#a5b4fc',     // indigo-300 for more vibrant base
        'bg-indigo-200': '#818cf8',     // indigo-400 for active state
        'text-indigo-700': '#3730a3',   // indigo-800 for darker text
        'text-indigo-900': '#312e81',   // indigo-900 for active text
        // Completed - Vivid Green
        'bg-green-100': '#86efac',      // green-300 for more vibrant base
        'bg-green-200': '#4ade80',      // green-400 for active state
        'text-green-700': '#166534',    // green-800 for darker text
        'text-green-900': '#14532d',    // green-900 for active text
        // Gray
        'bg-gray-200': '#e5e7eb',
        'bg-gray-300': '#d1d5db',
        'text-gray-700': '#374151',
        'text-gray-900': '#111827',
        // Red
        'bg-red-100': '#fca5a5',        // red-300 for more vibrant base
        'bg-red-200': '#f87171',        // red-400 for active state
        'text-red-700': '#991b1b',      // red-800 for darker text
        'text-red-900': '#7f1d1d',      // red-900 for active text
        // Slate (All filter)
        'bg-slate-100': '#cbd5e1',      // slate-300 for more visible base
        'bg-slate-200': '#94a3b8',      // slate-400 for active state
        'text-slate-700': '#1e293b',    // slate-800 for darker text
        'text-slate-900': '#0f172a',    // slate-900 for active text
    };
    return colorMap[className] || '';
};

const StatusCounts = ({ statusCounts, activeFilter, onFilterChange, children }: StatusCountsProps) => {
    // Calculate total count
    const totalCount = statusCounts.reduce((sum, item) => sum + item.count, 0);

    // Define 'All' item with neutral gray styling
    const allItem: StatusCount = {
        status: "all",
        count: totalCount,
        label: "All",
        colorClasses: {
            bg: "bg-slate-100",
            text: "text-slate-700",
            activeBg: "bg-slate-200",
            activeText: "text-slate-900"
        },
        tooltip: "Show all submissions regardless of status"
    };

    // Combine 'All' with existing status counts
    const allStatusCounts = [allItem, ...statusCounts];

    // Define tooltips for each status
    const statusTooltips: Record<string, string> = {
        all: "Show all submissions regardless of status",
        pending: "New submissions awaiting initial contact",
        contacted: "Patient has been reached out to",
        scheduled: "Appointment has been scheduled",
        completed: "Visit or consultation has been completed"
    };

    return (
        <TooltipProvider>
            <div className="flex flex-wrap gap-2 mb-4">
                {allStatusCounts.map(({ status, count, label, colorClasses, tooltip }) => {
                    const isActive = activeFilter === status;

                    const bgColor = isActive
                        ? getColorFromClass(colorClasses.activeBg)
                        : getColorFromClass(colorClasses.bg);

                    const textColor = isActive
                        ? getColorFromClass(colorClasses.activeText)
                        : getColorFromClass(colorClasses.text);

                    const hoverBgColor = getColorFromClass(colorClasses.activeBg);

                    const tooltipText = tooltip || statusTooltips[status] || `Filter by ${label}`;

                    return (
                        <Tooltip key={status}>
                            <TooltipTrigger asChild>
                                <button
                                    onClick={() => onFilterChange(isActive ? "all" : status)}
                                    className={cn(
                                        "transition-all duration-200 group rounded-full",
                                        "focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0",
                                        "outline-none ring-0 border-0",
                                        isActive ? "scale-105" : "hover:scale-[1.02] active:scale-95"
                                    )}
                                    style={{ outline: 'none', boxShadow: 'none' }}
                                >
                                    <Badge
                                        className="border-0 px-3 py-1.5 text-sm font-semibold cursor-pointer flex items-center gap-1.5 transition-all outline-none ring-0 rounded-full"
                                        style={{
                                            backgroundColor: bgColor,
                                            color: textColor,
                                            outline: 'none',
                                            boxShadow: isActive
                                                ? '0 10px 20px -3px rgb(0 0 0 / 0.15), 0 4px 6px -2px rgb(0 0 0 / 0.1)'
                                                : '0 1px 2px 0 rgb(0 0 0 / 0.05)'
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!isActive) {
                                                e.currentTarget.style.backgroundColor = hoverBgColor;
                                                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -1px rgb(0 0 0 / 0.06)';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!isActive) {
                                                e.currentTarget.style.backgroundColor = bgColor;
                                                e.currentTarget.style.boxShadow = '0 1px 2px 0 rgb(0 0 0 / 0.05)';
                                            }
                                        }}
                                    >
                                        <span>{label}</span>
                                        <span className="font-bold">
                                            {count}
                                        </span>
                                    </Badge>
                                </button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" className="hidden sm:block max-w-[200px]">
                                <p className="text-xs">{tooltipText}</p>
                                {isActive && <p className="text-xs text-muted-foreground mt-1">Click to clear filter</p>}
                            </TooltipContent>
                        </Tooltip>
                    );
                })}
                {children}
            </div>
        </TooltipProvider>
    );
};

export default StatusCounts;
