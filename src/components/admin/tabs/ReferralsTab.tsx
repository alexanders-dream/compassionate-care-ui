import { useState, useMemo, useEffect } from "react";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { SwipeableCard } from "@/components/ui/swipeable-card";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
    User, Send, CalendarDays, CheckCircle2, ArrowUpDown, Search, Filter, Trash2, Calendar, Phone, Eye, ChevronDown, ArrowDown, ArrowUp, X, Clock
} from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

import { SubmissionDetailsDialog } from "../SubmissionDetailsDialog";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { format } from "date-fns";
import { Appointment } from "@/contexts/SiteDataContext";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ProviderReferralSubmission } from "@/contexts/SiteDataContext";
import StatusCounts from "../StatusCounts";
import AdminPagination from "../AdminPagination";
import RoleGate from "@/components/auth/RoleGate";
import { useAuth } from "@/contexts/AuthContext";
import { CardActionFooter } from "../CardActionFooter";

interface ReferralsTabProps {
    referrals: ProviderReferralSubmission[];
    appointments: Appointment[];
    onUpdateStatus: (id: string, status: ProviderReferralSubmission["status"]) => void;
    onSchedule: (referral: ProviderReferralSubmission) => void;
    onEmail: (referral: ProviderReferralSubmission) => void;
    onDelete: (id: string) => void;
}

const ReferralsTab = ({
    referrals,
    appointments,
    onUpdateStatus,
    onSchedule,
    onEmail,
    onDelete
}: ReferralsTabProps) => {
    const { hasRole } = useAuth();
    const [filterStatus, setFilterStatus] = useState<string>("all");
    const [filterUrgency, setFilterUrgency] = useState<string>("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [sortField, setSortField] = useState<"name" | "date" | "status" | "providerName" | "woundType" | "urgency">("date");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
    const [itemToDelete, setItemToDelete] = useState<string | null>(null);
    const [isFilterOpen, setIsFilterOpen] = useState(false);


    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [filterStatus, filterUrgency, searchQuery, sortField, sortDirection]);

    const [viewSubmission, setViewSubmission] = useState<ProviderReferralSubmission | null>(null);
    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

    const handleView = (referral: ProviderReferralSubmission) => {
        setViewSubmission(referral);
        setIsViewDialogOpen(true);
    };

    const getStatusBadge = (status: string, showIcon: boolean = false) => {
        // High contrast color scheme for better visibility
        const styles: Record<string, { bg: string; text: string; label: string }> = {
            pending: { bg: "bg-amber-300", text: "text-amber-900", label: "Pending" },
            contacted: { bg: "bg-blue-300", text: "text-blue-900", label: "Contacted" },
            scheduled: { bg: "bg-indigo-300", text: "text-indigo-900", label: "Scheduled" },
            completed: { bg: "bg-green-300", text: "text-green-900", label: "Completed" }
        };
        const style = styles[status] || { bg: "bg-gray-300", text: "text-gray-900", label: status };
        return (
            <Badge className={`${style.bg} ${style.text} hover:${style.bg} border-0 px-3 py-1.5 text-sm font-semibold ${showIcon ? 'flex items-center gap-1.5' : ''}`}>
                {style.label}
                {showIcon && <ChevronDown className="h-3.5 w-3.5" />}
            </Badge>
        );
    };

    const toggleSort = (field: "name" | "date" | "status" | "providerName" | "woundType" | "urgency") => {
        if (field === sortField) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortDirection("asc");
        }
    };

    const filteredReferrals = referrals
        .filter(ref => {
            const matchesStatus = filterStatus === "all" || ref.status === filterStatus;
            const matchesUrgency = filterUrgency === "all" || ref.urgency === filterUrgency;
            const matchesSearch = searchQuery === "" ||
                `${ref.patientFirstName} ${ref.patientLastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
                ref.providerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                ref.practiceName.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesStatus && matchesUrgency && matchesSearch;
        })
        .sort((a, b) => {
            let comparison = 0;
            switch (sortField) {
                case "name":
                    comparison = `${a.patientFirstName} ${a.patientLastName}`.localeCompare(`${b.patientFirstName} ${b.patientLastName}`);
                    break;
                case "date":
                    comparison = new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime();
                    break;
                case "status":
                    comparison = a.status.localeCompare(b.status);
                    break;
                case "providerName":
                    comparison = a.providerName.localeCompare(b.providerName);
                    break;
                case "woundType":
                    comparison = a.woundType.localeCompare(b.woundType);
                    break;
                case "urgency":
                    comparison = a.urgency.localeCompare(b.urgency);
                    break;
            }
            return sortDirection === "asc" ? comparison : -comparison;
        });

    // Paginate the filtered results
    const paginatedReferrals = filteredReferrals.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Calculate status counts
    const statusCounts = useMemo(() => [
        {
            status: "pending",
            count: referrals.filter(ref => ref.status === "pending").length,
            label: "Pending",
            colorClasses: {
                bg: "bg-amber-100",
                text: "text-amber-700",
                activeBg: "bg-amber-200",
                activeText: "text-amber-900"
            }
        },
        {
            status: "contacted",
            count: referrals.filter(ref => ref.status === "contacted").length,
            label: "Contacted",
            colorClasses: {
                bg: "bg-blue-100",
                text: "text-blue-700",
                activeBg: "bg-blue-200",
                activeText: "text-blue-900"
            }
        },
        {
            status: "scheduled",
            count: referrals.filter(ref => ref.status === "scheduled").length,
            label: "Scheduled",
            colorClasses: {
                bg: "bg-indigo-100",
                text: "text-indigo-700",
                activeBg: "bg-indigo-200",
                activeText: "text-indigo-900"
            }
        },
        {
            status: "completed",
            count: referrals.filter(ref => ref.status === "completed").length,
            label: "Completed",
            colorClasses: {
                bg: "bg-green-100",
                text: "text-green-700",
                activeBg: "bg-green-200",
                activeText: "text-green-900"
            }
        },
    ], [referrals]);

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
                {/* Title is now handled by the parent collapsible header */}

                {/* Mobile Search & Filter (Collapsible) */}
                <div className="md:hidden w-full">
                    <Collapsible open={isFilterOpen} onOpenChange={setIsFilterOpen} className="space-y-2">
                        <div className="flex items-center gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search patients..."
                                    className="pl-9 h-10 bg-background w-full"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <CollapsibleTrigger asChild>
                                <Button variant="outline" size="icon" className="h-10 w-10 shrink-0">
                                    {isFilterOpen ? (
                                        <X className="h-4 w-4" />
                                    ) : (
                                        <Filter className="h-4 w-4" />
                                    )}
                                    <span className="sr-only">Toggle filters</span>
                                </Button>
                            </CollapsibleTrigger>
                        </div>

                        <CollapsibleContent className="space-y-2 animate-in slide-in-from-top-1 fade-in-0 duration-200">
                            <div className="grid grid-cols-2 gap-2">
                                <Select value={filterUrgency} onValueChange={setFilterUrgency}>
                                    <SelectTrigger className="w-full h-10 bg-background">
                                        <Filter className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                                        <SelectValue placeholder="Urgency" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Urgency</SelectItem>
                                        <SelectItem value="routine">Routine</SelectItem>
                                        <SelectItem value="urgent">Urgent</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Select
                                    value={`${sortField}-${sortDirection}`}
                                    onValueChange={(value) => {
                                        const [field, direction] = value.split('-') as ["name" | "date" | "status", "asc" | "desc"];
                                        setSortField(field);
                                        setSortDirection(direction);
                                    }}
                                >
                                    <SelectTrigger className="w-full h-10 bg-background">
                                        {sortDirection === "asc" ? <ArrowUp className="h-4 w-4 mr-2 text-muted-foreground" /> : <ArrowDown className="h-4 w-4 mr-2 text-muted-foreground" />}
                                        <SelectValue placeholder="Sort" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                                        <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                                        <SelectItem value="date-asc">Date (Old-New)</SelectItem>
                                        <SelectItem value="date-desc">Date (New-Old)</SelectItem>
                                        <SelectItem value="status-asc">Status (A-Z)</SelectItem>
                                        <SelectItem value="status-desc">Status (Z-A)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CollapsibleContent>
                    </Collapsible>
                </div>

                {/* Desktop Search */}
                <div className="hidden md:flex flex-col md:flex-row gap-3 w-full md:w-auto">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="relative w-full md:min-w-[280px]">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search patients..."
                                        className="pl-9 h-10 bg-background"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                            </TooltipTrigger>
                            <TooltipContent side="bottom">
                                <p className="text-xs">Search by patient name, provider, or practice</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div>
                                    <Select value={filterUrgency} onValueChange={setFilterUrgency}>
                                        <SelectTrigger className="w-full md:min-w-[110px] h-10 bg-background">
                                            <Filter className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                                            <SelectValue placeholder="Urgency" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Urgency</SelectItem>
                                            <SelectItem value="routine">Routine</SelectItem>
                                            <SelectItem value="urgent">Urgent</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent side="bottom">
                                <p className="text-xs">Filter by referral urgency level</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </div>

            {/* Interactive Status Counters */}
            <StatusCounts
                statusCounts={statusCounts}
                activeFilter={filterStatus}
                onFilterChange={setFilterStatus}
            />

            {/* Mobile Cards */}
            <div className="md:hidden space-y-4">
                {paginatedReferrals.map(referral => (
                    <SwipeableCard
                        key={referral.id}
                        className={`overflow-hidden shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 bg-card transition-all active:scale-[0.99] ${referral.urgency === "urgent" ? "border-l-4 border-l-red-500" : referral.status === "pending" ? "border-l-4 border-l-amber-500" : ""}`}
                        onSwipeLeft={referral.status !== "scheduled" && referral.status !== "completed" ? () => onSchedule(referral) : undefined}
                        onSwipeRight={() => handleView(referral)}
                        showScheduleHint={referral.status !== "scheduled" && referral.status !== "completed"}
                    >
                        <CardContent className="p-4 space-y-4">
                            {/* Row 1: Header */}
                            <div className="flex justify-between items-start gap-3">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-bold text-lg text-foreground truncate">{referral.patientFirstName} {referral.patientLastName}</h3>
                                        <Badge
                                            variant={referral.urgency === "urgent" ? "destructive" : "secondary"}
                                            className={referral.urgency === "urgent" ? "text-[10px] h-5 px-1.5 font-bold uppercase" : "text-[10px] h-5 px-1.5 font-bold uppercase bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"}
                                        >
                                            {referral.urgency}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <User className="h-3.5 w-3.5" />
                                        <span className="truncate">Dr. {referral.providerName}</span>
                                    </div>
                                </div>
                                <div className="shrink-0">
                                    <Select
                                        value={referral.status}
                                        onValueChange={(value) => onUpdateStatus(referral.id, value as ProviderReferralSubmission["status"])}
                                    >
                                        <SelectTrigger className="w-auto border-0 bg-transparent p-0 h-auto gap-0 focus:ring-0 [&>svg]:hidden">
                                            {getStatusBadge(referral.status, true)}
                                        </SelectTrigger>
                                        <SelectContent align="end">
                                            <SelectItem value="pending">Pending</SelectItem>
                                            <SelectItem value="contacted">Contacted</SelectItem>
                                            <SelectItem value="scheduled">Scheduled</SelectItem>
                                            <SelectItem value="completed">Completed</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Row 2: Contact Chips */}
                            {(referral.patientPhone || referral.providerEmail) && (
                                <div className="flex flex-wrap gap-2">
                                    {referral.patientPhone && (
                                        <a href={`tel:${referral.patientPhone}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-medium hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 transition-colors">
                                            <Phone className="h-3 w-3" />
                                            {referral.patientPhone}
                                        </a>
                                    )}
                                    {/* Using provider email since patient email might not be available or redundant here, or could be patient email if available in type */}
                                </div>
                            )}

                            {/* Row 3: Details Grid */}
                            <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm bg-muted/40 p-3 rounded-lg border border-border/50">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <span className="font-medium text-foreground">Wound Type:</span>
                                </div>
                                <div className="text-right">
                                    <Badge variant="outline" className="capitalize">{referral.woundType}</Badge>
                                </div>
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Clock className="h-3.5 w-3.5 text-primary/70" />
                                    <span className="text-foreground">{new Date(referral.submittedAt).toLocaleDateString()}</span>
                                </div>
                                <div className="text-right text-muted-foreground truncate">
                                    {referral.practiceName}
                                </div>
                            </div>

                            {/* Row 4: Actions - moved to footer */}
                        </CardContent>
                        <CardActionFooter
                            actions={[
                                ...(referral.status !== "scheduled" && referral.status !== "completed" ? [{
                                    label: "Schedule",
                                    icon: CalendarDays,
                                    onClick: () => onSchedule(referral),
                                    className: "text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                }] : []),
                                {
                                    label: "View",
                                    icon: Eye,
                                    onClick: () => handleView(referral)
                                },
                                ...(hasRole(['admin']) ? [{
                                    label: "Delete",
                                    icon: Trash2,
                                    onClick: () => setItemToDelete(referral.id),
                                    className: "text-destructive hover:text-destructive hover:bg-destructive/10"
                                }] : [])
                            ]}
                        />
                    </SwipeableCard>
                ))}
                {filteredReferrals.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                        {referrals.length === 0 ? "No provider referrals yet" : "No results match your filters"}
                    </p>
                )}
                {/* Mobile Pagination */}
                <AdminPagination
                    currentPage={currentPage}
                    totalItems={filteredReferrals.length}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setCurrentPage}
                    onItemsPerPageChange={setItemsPerPage}
                />
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/50 hover:bg-muted/50 border-b-0">
                            <TableHead
                                className="cursor-pointer hover:bg-muted/50 select-none"
                                onClick={() => toggleSort("name")}
                            >
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <div className="flex items-center gap-1">
                                                Patient
                                                <ArrowUpDown className={`h-3.5 w-3.5 ${sortField === "name" ? "text-primary" : "text-muted-foreground"}`} />
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p className="text-xs">Click to sort by patient name {sortField === "name" ? `(${sortDirection === "asc" ? "A-Z" : "Z-A"})` : ""}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </TableHead>
                            <TableHead
                                className="cursor-pointer hover:bg-muted/50 select-none"
                                onClick={() => toggleSort("providerName")}
                            >
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <div className="flex items-center gap-1">
                                                Provider
                                                <ArrowUpDown className={`h-3.5 w-3.5 ${sortField === "providerName" ? "text-primary" : "text-muted-foreground"}`} />
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p className="text-xs">Click to sort by referring provider {sortField === "providerName" ? `(${sortDirection === "asc" ? "A-Z" : "Z-A"})` : ""}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </TableHead>
                            <TableHead
                                className="cursor-pointer hover:bg-muted/50 select-none"
                                onClick={() => toggleSort("woundType")}
                            >
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <div className="flex items-center gap-1">
                                                Wound Type
                                                <ArrowUpDown className={`h-3.5 w-3.5 ${sortField === "woundType" ? "text-primary" : "text-muted-foreground"}`} />
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p className="text-xs">Click to sort by wound type {sortField === "woundType" ? `(${sortDirection === "asc" ? "A-Z" : "Z-A"})` : ""}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </TableHead>
                            <TableHead
                                className="cursor-pointer hover:bg-muted/50 select-none"
                                onClick={() => toggleSort("status")}
                            >
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <div className="flex items-center gap-1">
                                                Status
                                                <ArrowUpDown className={`h-3.5 w-3.5 ${sortField === "status" ? "text-primary" : "text-muted-foreground"}`} />
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p className="text-xs">Click to sort by status {sortField === "status" ? `(${sortDirection === "asc" ? "A-Z" : "Z-A"})` : ""}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </TableHead>
                            <TableHead
                                className="cursor-pointer hover:bg-muted/50 select-none"
                                onClick={() => toggleSort("urgency")}
                            >
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <div className="flex items-center gap-1">
                                                Urgency
                                                <ArrowUpDown className={`h-3.5 w-3.5 ${sortField === "urgency" ? "text-primary" : "text-muted-foreground"}`} />
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p className="text-xs">Click to sort by urgency level {sortField === "urgency" ? `(${sortDirection === "asc" ? "routine first" : "urgent first"})` : ""}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </TableHead>
                            <TableHead className="text-right text-muted-foreground">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedReferrals.map((referral, index) => (
                            <TableRow key={referral.id} className={`${index % 2 === 1 ? "bg-muted/50" : ""} ${referral.urgency === "urgent" ? "border-l-4 border-l-red-500" : referral.status === "pending" ? "border-l-4 border-l-yellow-500" : ""} transition-all duration-100 ease-in-out hover:scale-[0.995] hover:bg-muted/80 relative border-b-0 ${referral.status === "pending" ? "hover:shadow-[inset_0_2px_4px_0_rgba(245,158,11,0.1)] dark:hover:shadow-[inset_0_2px_4px_0_rgba(180,83,9,0.2)]" :
                                    referral.status === "contacted" ? "hover:shadow-[inset_0_2px_4px_0_rgba(59,130,246,0.1)] dark:hover:shadow-[inset_0_2px_4px_0_rgba(30,64,175,0.2)]" :
                                        referral.status === "scheduled" ? "hover:shadow-[inset_0_2px_4px_0_rgba(99,102,241,0.1)] dark:hover:shadow-[inset_0_2px_4px_0_rgba(67,56,202,0.2)]" :
                                            "hover:shadow-[inset_0_2px_4px_0_rgba(34,197,94,0.1)] dark:hover:shadow-[inset_0_2px_4px_0_rgba(21,128,61,0.2)]"
                                }`}>
                                <TableCell className="font-bold">{referral.patientFirstName} {referral.patientLastName}</TableCell>
                                <TableCell>
                                    <div className="text-sm">
                                        <div>{referral.providerName}</div>
                                        <div className="text-muted-foreground text-xs">{referral.practiceName}</div>
                                    </div>
                                </TableCell>
                                <TableCell className="capitalize">{referral.woundType}</TableCell>
                                <TableCell>
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <div className="cursor-pointer">
                                                    <Select
                                                        value={referral.status}
                                                        onValueChange={(value) => onUpdateStatus(referral.id, value as ProviderReferralSubmission["status"])}
                                                    >
                                                        <SelectTrigger className="w-auto min-w-[130px] border-0 bg-transparent hover:bg-muted/50 h-auto p-0 [&>svg]:hidden">
                                                            {getStatusBadge(referral.status, true)}
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="pending" className="text-sm font-medium">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                                                                    <span className="text-amber-700 dark:text-amber-300">Pending</span>
                                                                </div>
                                                            </SelectItem>
                                                            <SelectItem value="contacted" className="text-sm font-medium">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                                                    <span className="text-blue-700 dark:text-blue-300">Contacted</span>
                                                                </div>
                                                            </SelectItem>
                                                            <SelectItem value="scheduled" className="text-sm font-medium">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
                                                                    <span className="text-indigo-700 dark:text-indigo-300">Scheduled</span>
                                                                </div>
                                                            </SelectItem>
                                                            <SelectItem value="completed" className="text-sm font-medium">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                                                    <span className="text-green-700 dark:text-green-300">Completed</span>
                                                                </div>
                                                            </SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </TooltipTrigger>
                                            {referral.status === "scheduled" && appointments.find(a => a.providerReferralId === referral.id) && (
                                                <TooltipContent>
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="h-4 w-4" />
                                                        <span>
                                                            {format(new Date(appointments.find(a => a.providerReferralId === referral.id)!.appointmentDate), "MMM d, yyyy")} at {appointments.find(a => a.providerReferralId === referral.id)!.appointmentTime}
                                                        </span>
                                                    </div>
                                                </TooltipContent>
                                            )}
                                        </Tooltip>
                                    </TooltipProvider>
                                </TableCell>
                                <TableCell>
                                    <Badge
                                        variant={referral.urgency === "urgent" ? "destructive" : "secondary"}
                                        className={referral.urgency === "urgent" ? "" : "bg-gray-100 text-gray-600 hover:bg-gray-100"}
                                    >
                                        {referral.urgency}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right space-x-1">
                                    <TooltipProvider>
                                        {referral.status !== "scheduled" && referral.status !== "completed" && (
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button size="sm" onClick={() => onSchedule(referral)} className="gap-1 bg-blue-600 text-white hover:bg-blue-700 border-transparent shadow-sm">
                                                        <CalendarDays className="h-3 w-3" /> Schedule
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p className="text-xs">Schedule an appointment for this referral</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        )}
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                                    onClick={() => handleView(referral)}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p className="text-xs">View full referral details</p>
                                            </TooltipContent>
                                        </Tooltip>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                                    onClick={() => window.location.href = `tel:${referral.patientPhone}`}
                                                    disabled={!referral.patientPhone}
                                                >
                                                    <Phone className="h-4 w-4" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p className="text-xs">{referral.patientPhone ? `Call ${referral.patientPhone}` : "No phone number available"}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                                    onClick={() => onEmail(referral)}
                                                    disabled={!referral.providerEmail}
                                                >
                                                    <Send className="h-4 w-4" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p className="text-xs">Send email to referring provider</p>
                                            </TooltipContent>
                                        </Tooltip>
                                        <RoleGate allowedRoles={['admin']}>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button variant="ghost" size="sm" onClick={() => setItemToDelete(referral.id)} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p className="text-xs">Delete this referral (cannot be undone)</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </RoleGate>
                                        {referral.emailSent && (
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <span className="inline-flex">
                                                        <CheckCircle2 className="h-4 w-4 text-blue-500 ml-1" />
                                                    </span>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p className="text-xs">Email has been sent to the provider</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        )}
                                    </TooltipProvider>
                                </TableCell>
                            </TableRow>
                        ))}
                        {filteredReferrals.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                                    {referrals.length === 0 ? "No provider referrals yet" : "No results match your filters"}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Desktop Pagination */}
            <div className="hidden md:block">
                <AdminPagination
                    currentPage={currentPage}
                    totalItems={filteredReferrals.length}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setCurrentPage}
                    onItemsPerPageChange={setItemsPerPage}
                />
            </div>

            <SubmissionDetailsDialog
                open={isViewDialogOpen}
                onOpenChange={setIsViewDialogOpen}
                submission={viewSubmission}
                type="referral"
                onEmail={onEmail}
                onSchedule={onSchedule}
            />

            <AlertDialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the referral.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                if (itemToDelete) {
                                    onDelete(itemToDelete);
                                    setItemToDelete(null);
                                }
                            }}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div >
    );
};

export default ReferralsTab;
