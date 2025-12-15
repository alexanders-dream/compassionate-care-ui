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
    User, Send, CalendarDays, CheckCircle2, ArrowUpDown, Search, Filter
} from "lucide-react";
import { ProviderReferralSubmission } from "@/contexts/SiteDataContext";

interface ReferralsTabProps {
    referrals: ProviderReferralSubmission[];
    onUpdateStatus: (id: string, status: ProviderReferralSubmission["status"]) => void;
    onSchedule: (referral: ProviderReferralSubmission) => void;
    onEmail: (referral: ProviderReferralSubmission) => void;
}

const ReferralsTab = ({
    referrals,
    onUpdateStatus,
    onSchedule,
    onEmail
}: ReferralsTabProps) => {
    const [filterStatus, setFilterStatus] = useState<string>("all");
    const [filterUrgency, setFilterUrgency] = useState<string>("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [sortField, setSortField] = useState<"name" | "date" | "status">("date");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

    const getStatusRowClass = (status: string) => {
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
            }
            return sortDirection === "asc" ? comparison : -comparison;
        });

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <h2 className="text-lg md:text-xl font-semibold flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    Provider Referrals ({referrals.length})
                </h2>

                <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search referrals..."
                            className="pl-8"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Select value={filterUrgency} onValueChange={setFilterUrgency}>
                        <SelectTrigger className="w-full sm:w-[130px]">
                            <Filter className="h-4 w-4 mr-2" />
                            <SelectValue placeholder="Urgency" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Urgencies</SelectItem>
                            <SelectItem value="routine">Routine</SelectItem>
                            <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger className="w-full sm:w-[150px]">
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
                {filteredReferrals.map(referral => (
                    <Card key={referral.id} className={`p-4 ${getStatusRowClass(referral.status)} ${referral.urgency === "urgent" ? "border-l-4 border-l-red-500" : ""}`}>
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <p className="font-medium">{referral.patientFirstName} {referral.patientLastName}</p>
                                <p className="text-xs text-muted-foreground">{referral.providerName} • {referral.practiceName}</p>
                            </div>
                            <Badge variant={referral.urgency === "urgent" ? "destructive" : "secondary"} className="text-xs">
                                {referral.urgency}
                            </Badge>
                        </div>
                        <div className="flex items-center justify-between mb-3">
                            <Badge variant="outline" className="capitalize text-xs">{referral.woundType}</Badge>
                            <Select
                                value={referral.status}
                                onValueChange={(value) => onUpdateStatus(referral.id, value as ProviderReferralSubmission["status"])}
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
                        <div className="flex gap-2">
                            {referral.status !== "scheduled" && referral.status !== "completed" && (
                                <Button variant="default" size="sm" onClick={() => onSchedule(referral)} className="flex-1 text-xs">
                                    <CalendarDays className="h-3 w-3 mr-1" /> Schedule
                                </Button>
                            )}
                            <Button variant="outline" size="sm" onClick={() => onEmail(referral)} className="flex-1 text-xs">
                                <Send className="h-3 w-3 mr-1" /> {referral.emailSent ? "Resend" : "Email"}
                            </Button>
                        </div>
                    </Card>
                ))}
                {filteredReferrals.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                        {referrals.length === 0 ? "No provider referrals yet" : "No results match your filters"}
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
                                    Patient
                                    <ArrowUpDown className={`h-3.5 w-3.5 ${sortField === "name" ? "text-primary" : "text-muted-foreground"}`} />
                                </div>
                            </TableHead>
                            <TableHead>Provider</TableHead>
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
                            <TableHead>Urgency</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredReferrals.map(referral => (
                            <TableRow key={referral.id} className={getStatusRowClass(referral.status)}>
                                <TableCell className="font-medium">{referral.patientFirstName} {referral.patientLastName}</TableCell>
                                <TableCell>
                                    <div className="text-sm">
                                        <div>{referral.providerName}</div>
                                        <div className="text-muted-foreground text-xs">{referral.practiceName}</div>
                                    </div>
                                </TableCell>
                                <TableCell className="capitalize">{referral.woundType}</TableCell>
                                <TableCell>
                                    <Select
                                        value={referral.status}
                                        onValueChange={(value) => onUpdateStatus(referral.id, value as ProviderReferralSubmission["status"])}
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
                                <TableCell>
                                    <Badge variant={referral.urgency === "urgent" ? "destructive" : "secondary"}>
                                        {referral.urgency}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right space-x-1">
                                    {referral.status !== "scheduled" && referral.status !== "completed" && (
                                        <Button variant="default" size="sm" onClick={() => onSchedule(referral)} className="gap-1">
                                            <CalendarDays className="h-3 w-3" /> Schedule
                                        </Button>
                                    )}
                                    <Button variant="outline" size="sm" onClick={() => onEmail(referral)} className="gap-1">
                                        <Send className="h-3 w-3" /> {referral.emailSent ? "Resend" : "Email"}
                                    </Button>
                                    {referral.emailSent && <CheckCircle2 className="h-4 w-4 text-green-500 inline ml-1" />}
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
        </div>
    );
};

export default ReferralsTab;
