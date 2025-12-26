import React from 'react';
import { Card } from '@/components/ui/card';
import { useSwipeGesture } from '@/hooks/useSwipeGesture';
import { ChevronLeft, ChevronRight, Eye, CalendarDays } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SwipeableCardProps {
    children: React.ReactNode;
    className?: string;
    onSwipeLeft?: () => void;  // Schedule action
    onSwipeRight?: () => void; // View action
    showScheduleHint?: boolean; // Whether to show schedule hint on left swipe
}

export function SwipeableCard({
    children,
    className,
    onSwipeLeft,
    onSwipeRight,
    showScheduleHint = true
}: SwipeableCardProps) {
    const { swipeState, getSwipeHandlers, getSwipeStyles } = useSwipeGesture({
        threshold: 100,
        onSwipeLeft,
        onSwipeRight,
    });

    const swipeProgress = Math.min(Math.abs(swipeState.offsetX) / 100, 1);
    const isSwipingLeft = swipeState.isSwiping && swipeState.direction === 'left';
    const isSwipingRight = swipeState.isSwiping && swipeState.direction === 'right';

    return (
        <div className="relative overflow-hidden rounded-xl">
            {/* Left swipe indicator - Schedule (revealed on right side) */}
            {onSwipeLeft && showScheduleHint && (
                <div
                    className={cn(
                        "absolute inset-0 flex items-center justify-end px-6 bg-gradient-to-l from-blue-500/20 via-blue-500/10 to-transparent rounded-xl transition-opacity duration-150",
                        isSwipingLeft ? "opacity-100" : "opacity-0"
                    )}
                >
                    <div
                        className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-medium"
                        style={{ opacity: swipeProgress }}
                    >
                        <CalendarDays className="h-5 w-5" />
                        <span className="text-sm">Schedule</span>
                        <ChevronLeft className="h-4 w-4 animate-pulse" />
                    </div>
                </div>
            )}

            {/* Right swipe indicator - View (revealed on left side) */}
            {onSwipeRight && (
                <div
                    className={cn(
                        "absolute inset-0 flex items-center justify-start px-6 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent rounded-xl transition-opacity duration-150",
                        isSwipingRight ? "opacity-100" : "opacity-0"
                    )}
                >
                    <div
                        className="flex items-center gap-2 text-primary font-medium"
                        style={{ opacity: swipeProgress }}
                    >
                        <ChevronRight className="h-4 w-4 animate-pulse" />
                        <span className="text-sm">View</span>
                        <Eye className="h-5 w-5" />
                    </div>
                </div>
            )}

            {/* Card content with swipe transform */}
            <Card
                className={cn("relative touch-pan-y", className)}
                style={getSwipeStyles()}
                {...getSwipeHandlers()}
            >
                {children}
            </Card>
        </div>
    );
}
