import { useState, useMemo } from "react";
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
    Mail, Send, CalendarDays, CheckCircle2, ArrowUpDown, Search, Trash2, Calendar, Phone, Eye, ChevronDown, ArrowDown, ArrowUp
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
import { VisitRequest } from "@/contexts/SiteDataContext";
import StatusCounts from "../StatusCounts";

interface VisitRequestsTabProps {
    visitRequests: VisitRequest[];
    appointments: Appointment[];
    onUpdateStatus: (id: string, status: VisitRequest["status"]) => void;
    onSchedule: (request: VisitRequest) => void;
    onEmail: (request: VisitRequest) => void;
    onDelete: (id: string) => void;
}

const VisitRequestsTab = ({
    visitRequests,
    appointments,
    onUpdateStatus,
    onSchedule,
    onEmail,
    onDelete
}: VisitRequestsTabProps) => {
    const [filterStatus, setFilterStatus] = useState<string>("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [sortField, setSortField] = useState<"name" | "date" | "status">("date");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
    const [itemToDelete, setItemToDelete] = useState<string | null>(null);

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

    const toggleSort = (field: "name" | "date" | "status") => {
        if (field === sortField) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortDirection("asc");
        }
    };

    const [viewSubmission, setViewSubmission] = useState<VisitRequest | null>(null);
    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

    const handleView = (request: VisitRequest) => {
        setViewSubmission(request);
        setIsViewDialogOpen(true);
    };

    const hasActiveFilters = filterStatus !== "all" || searchQuery !== "";
    const filteredVisitRequests = visitRequests
        .filter(vr => {
            const matchesStatus = filterStatus === "all" || vr.status === filterStatus;
            const matchesSearch = searchQuery === "" ||
                `${vr.firstName} ${vr.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
                vr.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                vr.woundType.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesStatus && matchesSearch;
        })
        .sort((a, b) => {
            let comparison = 0;
            switch (sortField) {
                case "name":
                    comparison = `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
                    break;
                case "date":
                    comparison = new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime();
                    break;
                case "status":
                    comparison = a.status.localeCompare(b.status);
                    break;
            }
            return sortDirection === "asc" ? comparison : -comparison;
        });

    // Calculate status counts
    const statusCounts = useMemo(() => [
        {
            status: "pending",
            count: visitRequests.filter(vr => vr.status === "pending").length,
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
            count: visitRequests.filter(vr => vr.status === "contacted").length,
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
            count: visitRequests.filter(vr => vr.status === "scheduled").length,
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
            count: visitRequests.filter(vr => vr.status === "completed").length,
            label: "Completed",
            colorClasses: {
                bg: "bg-green-100",
                text: "text-green-700",
                activeBg: "bg-green-200",
                activeText: "text-green-900"
            }
        },
    ], [visitRequests]);

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
                <h2 className="text-lg md:text-xl font-semibold flex items-center gap-2">
                    <Mail className="h-5 w-5 text-primary" />
                    Visit Requests ({visitRequests.length})
                </h2>

                {/* Search and Sort Controls - Simplified */}
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
                    {/* Mobile-only sort control */}
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

            {/* Interactive Status Counters */}
            <StatusCounts
                statusCounts={statusCounts}
                activeFilter={filterStatus}
                onFilterChange={setFilterStatus}
            />

            {/* Mobile Cards */}
            <div className="md:hidden space-y-4">
                {filteredVisitRequests.map(request => (
                    <Card key={request.id} className="overflow-hidden shadow-lg ring-1 ring-slate-900/5 dark:ring-slate-100/10 rounded-xl bg-white dark:bg-slate-800">
                        {/* Header with Name and Status */}
                        <div className="px-4 py-3">
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-base truncate">
                                        {request.firstName} {request.lastName}
                                    </h3>
                                </div>
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <div className="shrink-0">
                                                <Select
                                                    value={request.status}
                                                    onValueChange={(value) => onUpdateStatus(request.id, value as VisitRequest["status"])}
                                                >
                                                    <SelectTrigger className="w-auto h-auto border-0 bg-transparent hover:bg-muted/50 p-0 [&>svg]:hidden">
                                                        {getStatusBadge(request.status, false)}
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
                                        {request.status === "scheduled" && appointments.find(a => a.visitRequestId === request.id) && (
                                            <TooltipContent>
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-4 w-4" />
                                                    <span>
                                                        {format(new Date(appointments.find(a => a.visitRequestId === request.id)!.appointmentDate), "MMM d")} @ {appointments.find(a => a.visitRequestId === request.id)!.appointmentTime}
                                                    </span>
                                                </div>
                                            </TooltipContent>
                                        )}
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                        </div>

                        {/* Contact Info Section - Clickable links */}
                        <div className="px-4 py-2 space-y-1 text-sm">
                            <a
                                href={`mailto:${request.email}`}
                                className="flex items-center gap-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline"
                            >
                                <Mail className="h-4 w-4 shrink-0" />
                                <span className="truncate">{request.email}</span>
                            </a>
                            {request.phone && (
                                <a
                                    href={`tel:${request.phone}`}
                                    className="flex items-center gap-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline"
                                >
                                    <Phone className="h-4 w-4 shrink-0" />
                                    <span>{request.phone}</span>
                                </a>
                            )}
                        </div>

                        {/* Details Section */}
                        <div className="px-4 py-3 space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Wound Type</span>
                                <Badge variant="outline" className="capitalize font-medium">
                                    {request.woundType}
                                </Badge>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Submitted</span>
                                <span className="font-medium">
                                    {new Date(request.submittedAt).toLocaleDateString()}
                                </span>
                            </div>
                        </div>

                        {/* Actions Section */}
                        <div className="px-4 py-4 space-y-3">
                            {/* Primary Action */}
                            {request.status !== "scheduled" && request.status !== "completed" && (
                                <Button
                                    onClick={() => onSchedule(request)}
                                    className="w-full h-12 font-semibold bg-blue-600 text-white hover:bg-blue-700 border-transparent shadow-sm text-base"
                                >
                                    <CalendarDays className="h-5 w-5 mr-2" />
                                    Schedule Appointment
                                </Button>
                            )}

                            {/* Action Buttons - View and Delete */}
                            <div className="grid grid-cols-2 gap-3">
                                <Button
                                    variant="outline"
                                    onClick={() => handleView(request)}
                                    className="w-full h-11 border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800 flex items-center justify-center gap-2"
                                >
                                    <Eye className="h-4 w-4" />
                                    <span>View</span>
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => setItemToDelete(request.id)}
                                    className="w-full h-11 border-red-300 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/30 flex items-center justify-center gap-2"
                                >
                                    <Trash2 className="h-4 w-4" />
                                    <span>Delete</span>
                                </Button>
                            </div>
                        </div>
                    </Card>
                ))}
                {filteredVisitRequests.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                        {visitRequests.length === 0 ? "No visit requests yet" : "No results match your filters"}
                    </p>
                )}
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
                                    Name
                                    <ArrowUpDown className="h-3.5 w-3.5 text-primary" />
                                </div>
                            </TableHead>
                            <TableHead>Contact</TableHead>
                            <TableHead>Wound Type</TableHead>
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
                                onClick={() => toggleSort("date")}
                            >
                                <div className="flex items-center gap-1">
                                    Submitted
                                    <ArrowUpDown className="h-3.5 w-3.5 text-primary" />
                                </div>
                            </TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredVisitRequests.map((request, index) => (
                            <TableRow key={request.id} className={index % 2 === 1 ? "bg-muted/50" : ""}>
                                <TableCell className="font-bold">
                                    {request.firstName} {request.lastName}
                                </TableCell>
                                <TableCell>
                                    <div className="text-sm">
                                        <div>{request.email}</div>
                                        <div className="text-muted-foreground">{request.phone}</div>
                                    </div>
                                </TableCell>
                                <TableCell className="capitalize">{request.woundType}</TableCell>
                                <TableCell>
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <div className="cursor-pointer">
                                                    <Select
                                                        value={request.status}
                                                        onValueChange={(value) => onUpdateStatus(request.id, value as VisitRequest["status"])}
                                                    >
                                                        <SelectTrigger className="w-auto min-w-[130px] border-0 bg-transparent hover:bg-muted/50 h-auto p-0 [&>svg]:hidden">
                                                            {getStatusBadge(request.status, true)}
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
                                            {request.status === "scheduled" && appointments.find(a => a.visitRequestId === request.id) && (
                                                <TooltipContent>
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="h-4 w-4" />
                                                        <span>
                                                            {format(new Date(appointments.find(a => a.visitRequestId === request.id)!.appointmentDate), "MMM d, yyyy")} at {appointments.find(a => a.visitRequestId === request.id)!.appointmentTime}
                                                        </span>
                                                    </div>
                                                </TooltipContent>
                                            )}
                                        </Tooltip>
                                    </TooltipProvider>
                                </TableCell>
                                <TableCell>{new Date(request.submittedAt).toLocaleDateString()}</TableCell>
                                <TableCell className="text-right space-x-1">
                                    {request.status !== "scheduled" && request.status !== "completed" && (
                                        <Button size="sm" onClick={() => onSchedule(request)} className="gap-1 bg-blue-600 text-white hover:bg-blue-700 border-transparent shadow-sm">
                                            <CalendarDays className="h-3 w-3" /> Schedule
                                        </Button>
                                    )}
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                        onClick={() => handleView(request)}
                                        title="View Details"
                                    >
                                        <Eye className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                        onClick={() => window.location.href = `tel:${request.phone}`}
                                        disabled={!request.phone}
                                        title="Call Patient"
                                    >
                                        <Phone className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="sm" onClick={() => onEmail(request)} className="gap-1 text-muted-foreground hover:text-foreground">
                                        <Send className="h-3 w-3" /> {request.emailSent ? "Resend" : "Email"}
                                    </Button>
                                    <Button variant="ghost" size="sm" onClick={() => setItemToDelete(request.id)} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                    {request.emailSent && <CheckCircle2 className="h-4 w-4 text-blue-500 inline ml-1" />}
                                </TableCell>
                            </TableRow>
                        ))}
                        {filteredVisitRequests.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                                    {visitRequests.length === 0 ? "No visit requests yet" : "No results match your filters"}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <SubmissionDetailsDialog
                open={isViewDialogOpen}
                onOpenChange={setIsViewDialogOpen}
                submission={viewSubmission}
                type="visit"
                onEmail={onEmail}
                onSchedule={onSchedule}
            />

            <AlertDialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the visit request.
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

export default VisitRequestsTab;
