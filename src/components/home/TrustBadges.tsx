import { Shield, Award, CheckCircle, Heart } from "lucide-react";

const badges = [
    {
        icon: Shield,
        label: "Secure & Confidential",
        description: "Your data is protected"
    },
    {
        icon: Award,
        label: "Certified Specialists",
        description: "WOCN & CWS certified"
    },
    {
        icon: CheckCircle,
        label: "Medicare Accepted",
        description: "Most insurances accepted"
    },
    {
        icon: Heart,
        label: "Patient-First Care",
        description: "98% satisfaction rate"
    },
];

export default function TrustBadges() {
    return (
        <section className="py-8 bg-muted/50 border-y border-border">
            <div className="container-main">
                <div className="flex flex-wrap justify-center gap-8 lg:gap-12">
                    {badges.map((badge) => (
                        <div
                            key={badge.label}
                            className="flex items-center gap-3 text-sm"
                        >
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                <badge.icon className="w-6 h-6 text-primary" aria-hidden="true" />
                            </div>
                            <div>
                                <p className="font-semibold text-foreground">{badge.label}</p>
                                <p className="text-xs text-muted-foreground">{badge.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
