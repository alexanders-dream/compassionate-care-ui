import { useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ScheduleDialogProps {
    onSchedule: (date: Date) => void;
    trigger?: React.ReactNode;
    initialDate?: Date;
}

export function ScheduleDialog({ onSchedule, trigger, initialDate }: ScheduleDialogProps) {
    const [date, setDate] = useState<Date | undefined>(initialDate || new Date());
    const [time, setTime] = useState(initialDate ? format(initialDate, "HH:mm") : "10:00");
    const [isOpen, setIsOpen] = useState(false);

    const handleSchedule = () => {
        if (!date) return;

        const [hours, minutes] = time.split(":").map(Number);
        const scheduledDate = new Date(date);
        scheduledDate.setHours(hours);
        scheduledDate.setMinutes(minutes);
        scheduledDate.setSeconds(0);

        onSchedule(scheduledDate);
        setIsOpen(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button
                        variant={"outline"}
                        className={cn(
                            "w-[240px] justify-start text-left font-normal",
                            !date && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : <span>Pick a date</span>}
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Schedule Post</DialogTitle>
                    <DialogDescription>
                        Set a date and time to publish this post.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-4 py-4">
                    <div className="flex justify-center border rounded-md p-2">
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            initialFocus
                            disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                            className="p-0"
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="time">
                            Time
                        </Label>
                        <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <Input
                                id="time"
                                type="time"
                                value={time}
                                onChange={(e) => setTime(e.target.value)}
                                className="flex-1"
                            />
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleSchedule} className="w-full">
                        Confirm Schedule
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
