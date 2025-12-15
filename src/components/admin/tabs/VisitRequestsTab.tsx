import { useState } from "react";
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
    Mail, Send, CalendarDays, CheckCircle2, ArrowUpDown, Search, Filter
} from "lucide-react";
import { VisitRequest } from "@/contexts/SiteDataContext";

interface VisitRequestsTabProps {
    visitRequests: VisitRequest[];
    onUpdateStatus: (id: string, status: VisitRequest["status"]) => void;
    onSchedule: (request: VisitRequest) => void;
    onEmail: (request: VisitRequest) => void;
}

const VisitRequestsTab = ({
    visitRequests,
    onUpdateStatus,
    onSchedule,
    onEmail
}: VisitRequestsTabProps) => {
    const [filterStatus, setFilterStatus] = useState<string>("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [sortField, setSortField] = useState<"name" | "date" | "status">("date");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

    const getStatusRowClass = (status: string) => {
        // This logic was in Admin.tsx, defining here or importing common utils
        // Assuming simple mapping or CSS classes are global/tailwind
        const statusClasses: Record<string, string> = {
            pending: "bg-yellow-50 dark:bg-yellow-900/10",
            contacted: "bg-blue-50 dark:bg-blue-900/10",
            scheduled: "bg-amber-50 dark:bg-amber-900/10",
            completed: "bg-green-50 dark:bg-green-900/10",
            confirmed: "bg-purple-50 dark:bg-purple-900/10",
            cancelled: "bg-red-50 dark:bg-red-900/10",
            "no-show": "bg-gray-100 dark:bg-gray-800"
        };
        return statusClasses[status] || "";
    };

    const toggleSort = (field: "name" | "date" | "status") => {
        if (field === sortField) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortDirection("asc");
        }
    };

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

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <h2 className="text-lg md:text-xl font-semibold flex items-center gap-2">
                    <Mail className="h-5 w-5 text-primary" />
                    Visit Requests ({visitRequests.length})
                </h2>

                {/* Added Search/Filter Controls that were missing in original layout */}
                <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search requests..."
                            className="pl-8"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger className="w-full sm:w-[150px]">
                            <Filter className="h-4 w-4 mr-2" />
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="contacted">Contacted</SelectItem>
                            <SelectItem value="scheduled">Scheduled</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-3">
                {filteredVisitRequests.map(request => (
                    <Card key={request.id} className={`p-4 ${getStatusRowClass(request.status)}`}>
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <p className="font-medium">{request.firstName} {request.lastName}</p>
                                <p className="text-xs text-muted-foreground">{request.email}</p>
                            </div>
                            <Select
                                value={request.status}
                                onValueChange={(value) => onUpdateStatus(request.id, value as VisitRequest["status"])}
                            >
                                <SelectTrigger className="w-28 h-8 text-xs">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="contacted">Contacted</SelectItem>
                                    <SelectItem value="scheduled">Scheduled</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                            <Badge variant="outline" className="capitalize">{request.woundType}</Badge>
                            <span>{new Date(request.submittedAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex gap-2">
                            {request.status !== "scheduled" && request.status !== "completed" && (
                                <Button variant="default" size="sm" onClick={() => onSchedule(request)} className="flex-1 text-xs">
                                    <CalendarDays className="h-3 w-3 mr-1" /> Schedule
                                </Button>
                            )}
                            <Button variant="outline" size="sm" onClick={() => onEmail(request)} className="flex-1 text-xs">
                                <Send className="h-3 w-3 mr-1" /> {request.emailSent ? "Resend" : "Email"}
                            </Button>
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
                        <TableRow>
                            <TableHead
                                className="cursor-pointer hover:bg-muted/50 select-none"
                                onClick={() => toggleSort("name")}
                            >
                                <div className="flex items-center gap-1">
                                    Name
                                    <ArrowUpDown className={`h-3.5 w-3.5 ${sortField === "name" ? "text-primary" : "text-muted-foreground"}`} />
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
                                    <ArrowUpDown className={`h-3.5 w-3.5 ${sortField === "status" ? "text-primary" : "text-muted-foreground"}`} />
                                </div>
                            </TableHead>
                            <TableHead
                                className="cursor-pointer hover:bg-muted/50 select-none"
                                onClick={() => toggleSort("date")}
                            >
                                <div className="flex items-center gap-1">
                                    Submitted
                                    <ArrowUpDown className={`h-3.5 w-3.5 ${sortField === "date" ? "text-primary" : "text-muted-foreground"}`} />
                                </div>
                            </TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredVisitRequests.map(request => (
                            <TableRow key={request.id} className={getStatusRowClass(request.status)}>
                                <TableCell className="font-medium">
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
                                    <Select
                                        value={request.status}
                                        onValueChange={(value) => onUpdateStatus(request.id, value as VisitRequest["status"])}
                                    >
                                        <SelectTrigger className="w-32">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="pending">Pending</SelectItem>
                                            <SelectItem value="contacted">Contacted</SelectItem>
                                            <SelectItem value="scheduled">Scheduled</SelectItem>
                                            <SelectItem value="completed">Completed</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </TableCell>
                                <TableCell>{new Date(request.submittedAt).toLocaleDateString()}</TableCell>
                                <TableCell className="text-right space-x-1">
                                    {request.status !== "scheduled" && request.status !== "completed" && (
                                        <Button variant="default" size="sm" onClick={() => onSchedule(request)} className="gap-1">
                                            <CalendarDays className="h-3 w-3" /> Schedule
                                        </Button>
                                    )}
                                    <Button variant="outline" size="sm" onClick={() => onEmail(request)} className="gap-1">
                                        <Send className="h-3 w-3" /> {request.emailSent ? "Resend" : "Email"}
                                    </Button>
                                    {request.emailSent && <CheckCircle2 className="h-4 w-4 text-green-500 inline ml-1" />}
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
        </div>
    );
};

export default VisitRequestsTab;
