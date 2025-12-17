import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, Clock } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary text-white">
      {/* Main Footer */}
      <div className="container-main py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand & Contact */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">AR</span>
              </div>
              <div>
                <span className="font-display font-semibold text-white">AR Advanced</span>
                <span className="block text-xs text-white/70 -mt-1">Woundcare Solutions</span>
              </div>
            </div>
            <p className="text-sm text-white/80 mb-6 leading-relaxed">
              Compassionate, expert wound care delivered with trust and clinical excellence.
            </p>
            <div className="space-y-3">
              <a
                href="tel:+18001234567"
                className="no-link-style flex items-center gap-3 text-sm text-white/90 hover:text-white transition-colors"
              >
                <Phone size={18} className="text-accent" />
                <span>(800) 123-4567</span>
              </a>
              <a
                href="mailto:info@arwoundcare.com"
                className="no-link-style flex items-center gap-3 text-sm text-white/90 hover:text-white transition-colors"
              >
                <Mail size={18} className="text-accent" />
                <span>info@arwoundcare.com</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4 text-white text-lg">Quick Links</h4>
            <ul className="space-y-2">
              {[
                { href: "/services", label: "Our Services" },
                { href: "/conditions", label: "Conditions We Treat" },
                { href: "/about", label: "About Us" },
                { href: "/testimonials", label: "Testimonials" },
                { href: "/resources", label: "Patient Resources" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="no-link-style text-sm text-white/80 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* For Providers */}
          <div>
            <h4 className="font-semibold mb-4 text-white text-lg">For Providers</h4>
            <ul className="space-y-2">
              {[
                { href: "/refer", label: "Refer a Patient" },
                { href: "/insurance", label: "Insurance & Payment" },
                { href: "/community", label: "Community Outreach" },
                { href: "/contact", label: "Contact Us" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="no-link-style text-sm text-white/80 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Hours & Location */}
          <div>
            <h4 className="font-semibold mb-4 text-white text-lg">Hours & Location</h4>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Clock size={18} className="text-accent mt-0.5 shrink-0" />
                <div className="text-sm text-white/80 leading-relaxed">
                  <p className="text-sm text-white/80 leading-relaxed">Mon - Fri: 8:00 AM - 6:00 PM</p>
                  <p className="text-sm text-white/80 leading-relaxed">Sat: 9:00 AM - 2:00 PM</p>
                  <p className="text-sm text-white/80 leading-relaxed">Sun: Closed</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin size={18} className="text-accent mt-0.5 shrink-0" />
                <div className="text-sm text-white/80 leading-relaxed">
                  <p className="text-sm text-white/80 leading-relaxed">123 Healthcare Blvd, Suite 100</p>
                  <p className="text-sm text-white/80 leading-relaxed">Medical City, ST 12345</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="container-main py-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-white/60">
            © {currentYear} AR Advanced Woundcare Solutions. All rights reserved.
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-white/60">
            <Link to="/privacy" className="no-link-style hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="no-link-style hover:text-white transition-colors">
              Terms of Service
            </Link>
            <Link to="/accessibility" className="no-link-style hover:text-white transition-colors">
              Accessibility
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
