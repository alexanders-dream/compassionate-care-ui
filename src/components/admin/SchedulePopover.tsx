import { useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SchedulePopoverProps {
    onSchedule: (date: Date) => void;
    trigger?: React.ReactNode;
    align?: "center" | "start" | "end";
}

export function SchedulePopover({ onSchedule, trigger, align = "end" }: SchedulePopoverProps) {
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [time, setTime] = useState("10:00");
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
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
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
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align={align}>
                <div className="p-4 space-y-4 bg-background border rounded-md shadow-md w-80">
                    <div className="space-y-2">
                        <h4 className="font-medium leading-none">Schedule Post</h4>
                        <p className="text-xs text-muted-foreground">
                            Set a date and time to publish this post.
                        </p>
                    </div>
                    <div className="flex flex-col gap-4">
                        <div className="border rounded-md p-2">
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={setDate}
                                initialFocus
                                disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="time" className="text-xs">
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
                        <Button onClick={handleSchedule} className="w-full">
                            Confirm Schedule
                        </Button>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}
