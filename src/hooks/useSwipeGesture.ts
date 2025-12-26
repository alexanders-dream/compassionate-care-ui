import { useState, useCallback, useRef } from 'react';

interface SwipeState {
    isSwiping: boolean;
    offsetX: number;
    direction: 'left' | 'right' | null;
}

interface UseSwipeGestureOptions {
    threshold?: number;
    onSwipeLeft?: () => void;
    onSwipeRight?: () => void;
}

export function useSwipeGesture(options: UseSwipeGestureOptions = {}) {
    const { threshold = 100, onSwipeLeft, onSwipeRight } = options;

    const [swipeState, setSwipeState] = useState<SwipeState>({
        isSwiping: false,
        offsetX: 0,
        direction: null,
    });

    const startX = useRef<number>(0);
    const startY = useRef<number>(0);
    const isHorizontalSwipe = useRef<boolean | null>(null);

    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        startX.current = e.touches[0].clientX;
        startY.current = e.touches[0].clientY;
        isHorizontalSwipe.current = null;
        setSwipeState({ isSwiping: false, offsetX: 0, direction: null });
    }, []);

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        const currentX = e.touches[0].clientX;
        const currentY = e.touches[0].clientY;
        const diffX = currentX - startX.current;
        const diffY = currentY - startY.current;

        // Determine if this is a horizontal or vertical swipe (only once)
        if (isHorizontalSwipe.current === null) {
            if (Math.abs(diffX) > 10 || Math.abs(diffY) > 10) {
                isHorizontalSwipe.current = Math.abs(diffX) > Math.abs(diffY);
            }
        }

        // Only handle horizontal swipes
        if (isHorizontalSwipe.current === true) {
            // Prevent vertical scrolling while swiping horizontally
            e.preventDefault();

            const direction = diffX < 0 ? 'left' : 'right';
            setSwipeState({
                isSwiping: true,
                offsetX: diffX,
                direction,
            });
        }
    }, []);

    const handleTouchEnd = useCallback(() => {
        if (swipeState.isSwiping) {
            const passedThreshold = Math.abs(swipeState.offsetX) >= threshold;

            if (passedThreshold) {
                if (swipeState.direction === 'left' && onSwipeLeft) {
                    onSwipeLeft();
                } else if (swipeState.direction === 'right' && onSwipeRight) {
                    onSwipeRight();
                }
            }
        }

        // Reset state
        setSwipeState({ isSwiping: false, offsetX: 0, direction: null });
        isHorizontalSwipe.current = null;
    }, [swipeState, threshold, onSwipeLeft, onSwipeRight]);

    const getSwipeHandlers = useCallback(() => ({
        onTouchStart: handleTouchStart,
        onTouchMove: handleTouchMove,
        onTouchEnd: handleTouchEnd,
    }), [handleTouchStart, handleTouchMove, handleTouchEnd]);

    const getSwipeStyles = useCallback(() => {
        if (!swipeState.isSwiping) return {};

        const progress = Math.min(Math.abs(swipeState.offsetX) / threshold, 1);
        const opacity = 1 - (progress * 0.3);

        return {
            transform: `translateX(${swipeState.offsetX}px)`,
            opacity,
            transition: 'none',
        } as React.CSSProperties;
    }, [swipeState, threshold]);

    return {
        swipeState,
        getSwipeHandlers,
        getSwipeStyles,
    };
}
