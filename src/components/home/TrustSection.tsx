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
    <section className="py-12 bg-[#0B2545] text-primary-foreground">
      <div className="container-main">
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
