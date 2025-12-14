import { Award, Clock, Users, MapPin } from "lucide-react";

const stats = [
  {
    icon: Users,
    value: "10,000+",
    label: "Patients Served",
  },
  {
    icon: Clock,
    value: "15+",
    label: "Years Experience",
  },
  {
    icon: Award,
    value: "98%",
    label: "Patient Satisfaction",
  },
  {
    icon: MapPin,
    value: "50+",
    label: "Service Areas",
  },
];

const TrustSection = () => {
  return (
    <section className="py-12 bg-gradient-to-r from-primary via-blue-600 to-blue-700 text-primary-foreground relative overflow-hidden">
      {/* Premium decorative elements - positioned behind content */}
      <div className="absolute -left-20 top-1/2 -translate-y-1/2 w-96 h-96 bg-white/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -right-20 top-0 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute left-1/3 -bottom-20 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
      <div className="container-main relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/20 mb-3">
                <stat.icon size={24} className="text-white" />
              </div>
              <div className="text-3xl md:text-4xl font-bold mb-1">{stat.value}</div>
              <div className="text-sm opacity-80">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustSection;
