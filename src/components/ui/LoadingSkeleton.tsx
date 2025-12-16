import { Skeleton } from "@/components/ui/skeleton";

export function CardSkeleton() {
    return (
        <div className="bg-card rounded-2xl p-6 shadow-soft animate-pulse">
            <Skeleton className="h-14 w-14 rounded-xl mb-4" />
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3 mt-2" />
        </div>
    );
}

export function TeamMemberSkeleton() {
    return (
        <div className="bg-card rounded-2xl overflow-hidden shadow-soft animate-pulse">
            <Skeleton className="aspect-[4/3] w-full" />
            <div className="p-6">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6 mt-2" />
            </div>
        </div>
    );
}

export function BlogPostSkeleton() {
    return (
        <div className="bg-card rounded-2xl overflow-hidden shadow-soft animate-pulse">
            <Skeleton className="aspect-video w-full" />
            <div className="p-6">
                <Skeleton className="h-4 w-24 mb-3" />
                <Skeleton className="h-6 w-full mb-2" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4 mt-2" />
            </div>
        </div>
    );
}

export function ServiceCardSkeleton() {
    return (
        <div className="bg-card rounded-2xl p-8 shadow-soft animate-pulse">
            <Skeleton className="w-14 h-14 rounded-xl mb-6" />
            <Skeleton className="h-6 w-3/4 mb-3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full mt-2" />
            <Skeleton className="h-4 w-2/3 mt-2" />
        </div>
    );
}

export function TestimonialSkeleton() {
    return (
        <div className="bg-card rounded-2xl p-6 shadow-soft animate-pulse">
            <Skeleton className="h-4 w-24 mb-4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full mt-2" />
            <Skeleton className="h-4 w-3/4 mt-2" />
            <div className="flex items-center gap-3 mt-6">
                <Skeleton className="w-12 h-12 rounded-full" />
                <div>
                    <Skeleton className="h-4 w-24 mb-1" />
                    <Skeleton className="h-3 w-16" />
                </div>
            </div>
        </div>
    );
}
