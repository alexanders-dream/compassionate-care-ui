import { useState, useMemo, useEffect } from "react";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
    User, Send, CalendarDays, CheckCircle2, ArrowUpDown, Search, Filter, Trash2, Calendar, Phone, Eye, ChevronDown, ArrowDown, ArrowUp
} from "lucide-react";
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
    const [filterStatus, setFilterStatus] = useState<string>("all");
    const [filterUrgency, setFilterUrgency] = useState<string>("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [sortField, setSortField] = useState<"name" | "date" | "status" | "providerName" | "woundType" | "urgency">("date");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
    const [itemToDelete, setItemToDelete] = useState<string | null>(null);

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
        const styles: Record<string, { bg: string; text: string; label: string }> = {
            pending: { bg: "bg-amber-100", text: "text-amber-700", label: "Pending" },
            contacted: { bg: "bg-blue-100", text: "text-blue-700", label: "Contacted" },
            scheduled: { bg: "bg-indigo-100", text: "text-indigo-700", label: "Scheduled" },
            completed: { bg: "bg-green-100", text: "text-green-700", label: "Completed" }
        };
        const style = styles[status] || { bg: "bg-gray-100", text: "text-gray-700", label: status };
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
                <h2 className="text-lg md:text-xl font-semibold flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    Provider Referrals ({referrals.length})
                </h2>

                {/* Search and Filter Controls - Simplified */}
                <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                    <div className="relative w-full md:min-w-[280px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search patients..."
                            className="pl-9 h-10 bg-background"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    {/* Mobile: Equal grid for urgency and sort */}
                    <div className="grid grid-cols-2 gap-2 md:flex md:gap-2">
                        {/* Urgency filter */}
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
                        {/* Sort control (mobile only visible, but hidden on desktop) */}
                        <div className="md:hidden">
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
                    </div>
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
                    <Card key={referral.id} className={`overflow-hidden shadow-lg ring-1 ring-slate-900/5 dark:ring-slate-100/10 rounded-xl bg-white dark:bg-slate-800 ${referral.urgency === "urgent" ? "border-l-4 border-l-red-500" : ""}`}>
                        {/* Header with Patient Name, Status, and Urgency */}
                        <div className="px-4 py-3">
                            <div className="flex items-start justify-between gap-3 mb-2">
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-base truncate">
                                        {referral.patientFirstName} {referral.patientLastName}
                                    </h3>
                                </div>
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <div className="shrink-0">
                                                <Select
                                                    value={referral.status}
                                                    onValueChange={(value) => onUpdateStatus(referral.id, value as ProviderReferralSubmission["status"])}
                                                >
                                                    <SelectTrigger className="w-auto h-auto border-0 bg-transparent hover:bg-muted/50 p-0 [&>svg]:hidden">
                                                        {getStatusBadge(referral.status, false)}
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="pending" className="text-sm font-medium">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                                                                <span className="text-amber-700">Pending</span>
                                                            </div>
                                                        </SelectItem>
                                                        <SelectItem value="contacted" className="text-sm font-medium">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                                                <span className="text-blue-700">Contacted</span>
                                                            </div>
                                                        </SelectItem>
                                                        <SelectItem value="scheduled" className="text-sm font-medium">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
                                                                <span className="text-indigo-700">Scheduled</span>
                                                            </div>
                                                        </SelectItem>
                                                        <SelectItem value="completed" className="text-sm font-medium">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                                                <span className="text-green-700">Completed</span>
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
                                                        {format(new Date(appointments.find(a => a.providerReferralId === referral.id)!.appointmentDate), "MMM d")} @ {appointments.find(a => a.providerReferralId === referral.id)!.appointmentTime}
                                                    </span>
                                                </div>
                                            </TooltipContent>
                                        )}
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                            <Badge
                                variant={referral.urgency === "urgent" ? "destructive" : "secondary"}
                                className={referral.urgency === "urgent" ? "text-xs font-semibold uppercase" : "text-xs font-semibold uppercase bg-gray-100 text-gray-600 hover:bg-gray-100"}
                            >
                                {referral.urgency}
                            </Badge>
                        </div>

                        {/* Provider Info Section */}
                        <div className="px-4 py-2">
                            <div className="flex items-center gap-2 mb-1">
                                <User className="h-4 w-4 text-muted-foreground shrink-0" />
                                <span className="text-sm font-medium">{referral.providerName}</span>
                            </div>
                            <p className="text-xs text-muted-foreground ml-6">{referral.practiceName}</p>
                        </div>

                        {/* Contact Info Section - Clickable link */}
                        {referral.patientPhone && (
                            <div className="px-4 py-2">
                                <a
                                    href={`tel:${referral.patientPhone}`}
                                    className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline"
                                >
                                    <Phone className="h-4 w-4 shrink-0" />
                                    <span>{referral.patientPhone}</span>
                                </a>
                            </div>
                        )}

                        {/* Details Section */}
                        <div className="px-4 py-2 space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Wound Type</span>
                                <Badge variant="outline" className="capitalize font-medium">
                                    {referral.woundType}
                                </Badge>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Submitted</span>
                                <span className="font-medium">
                                    {new Date(referral.submittedAt).toLocaleDateString()}
                                </span>
                            </div>
                        </div>

                        {/* Actions Section */}
                        <div className="px-4 py-3 space-y-2">
                            {/* Primary Action */}
                            {referral.status !== "scheduled" && referral.status !== "completed" && (
                                <Button
                                    size="lg"
                                    onClick={() => onSchedule(referral)}
                                    className="w-full font-semibold bg-blue-600 text-white hover:bg-blue-700 border-transparent shadow-sm"
                                >
                                    Schedule
                                </Button>
                            )}

                            {/* Action Buttons - View and Delete */}
                            <div className="grid grid-cols-2 gap-3">
                                <Button
                                    variant="outline"
                                    onClick={() => handleView(referral)}
                                    className="w-full h-11 border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800 flex items-center justify-center gap-2"
                                >
                                    <Eye className="h-4 w-4" />
                                    <span>View</span>
                                </Button>
                                <RoleGate allowedRoles={['admin']}>
                                    <Button
                                        variant="outline"
                                        onClick={() => setItemToDelete(referral.id)}
                                        className="w-full h-11 border-red-300 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/30 flex items-center justify-center gap-2"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        <span>Delete</span>
                                    </Button>
                                </RoleGate>
                            </div>
                        </div>
                    </Card>
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
                                <div className="flex items-center gap-1">
                                    Patient
                                    <ArrowUpDown className="h-3.5 w-3.5 text-primary" />
                                </div>
                            </TableHead>
                            <TableHead
                                className="cursor-pointer hover:bg-muted/50 select-none"
                                onClick={() => toggleSort("providerName")}
                            >
                                <div className="flex items-center gap-1">
                                    Provider
                                    <ArrowUpDown className="h-3.5 w-3.5 text-primary" />
                                </div>
                            </TableHead>
                            <TableHead
                                className="cursor-pointer hover:bg-muted/50 select-none"
                                onClick={() => toggleSort("woundType")}
                            >
                                <div className="flex items-center gap-1">
                                    Wound Type
                                    <ArrowUpDown className="h-3.5 w-3.5 text-primary" />
                                </div>
                            </TableHead>
                            <TableHead
                                className="cursor-pointer hover:bg-muted/50 select-none"
                                onClick={() => toggleSort("status")}
                            >
                                <div className="flex items-center gap-1">
                                    Status
                                    <ArrowUpDown className="h-3.5 w-3.5 text-primary" />
                                </div>
                            </TableHead>
                            <TableHead
                                className="cursor-pointer hover:bg-muted/50 select-none"
                                onClick={() => toggleSort("urgency")}
                            >
                                <div className="flex items-center gap-1">
                                    Urgency
                                    <ArrowUpDown className="h-3.5 w-3.5 text-primary" />
                                </div>
                            </TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedReferrals.map((referral, index) => (
                            <TableRow key={referral.id} className={index % 2 === 1 ? "bg-muted/50" : ""}>
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
                                                                    <span className="text-amber-700">Pending</span>
                                                                </div>
                                                            </SelectItem>
                                                            <SelectItem value="contacted" className="text-sm font-medium">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                                                    <span className="text-blue-700">Contacted</span>
                                                                </div>
                                                            </SelectItem>
                                                            <SelectItem value="scheduled" className="text-sm font-medium">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
                                                                    <span className="text-indigo-700">Scheduled</span>
                                                                </div>
                                                            </SelectItem>
                                                            <SelectItem value="completed" className="text-sm font-medium">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                                                    <span className="text-green-700">Completed</span>
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
                                    {referral.status !== "scheduled" && referral.status !== "completed" && (
                                        <Button size="sm" onClick={() => onSchedule(referral)} className="gap-1 bg-blue-600 text-white hover:bg-blue-700 border-transparent shadow-sm">
                                            <CalendarDays className="h-3 w-3" /> Schedule
                                        </Button>
                                    )}
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                        onClick={() => handleView(referral)}
                                        title="View Details"
                                    >
                                        <Eye className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                        onClick={() => window.location.href = `tel:${referral.patientPhone}`}
                                        disabled={!referral.patientPhone}
                                        title="Call Patient"
                                    >
                                        <Phone className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                        onClick={() => window.location.href = `mailto:${referral.providerEmail}`}
                                        disabled={!referral.providerEmail}
                                        title="Email Provider"
                                    >
                                        <Send className="h-4 w-4" />
                                    </Button>
                                    <RoleGate allowedRoles={['admin']}>
                                        <Button variant="ghost" size="sm" onClick={() => setItemToDelete(referral.id)} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </RoleGate>
                                    {referral.emailSent && <CheckCircle2 className="h-4 w-4 text-blue-500 inline ml-1" />}
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
