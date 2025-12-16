import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Menu, X, Phone } from "lucide-react";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/services", label: "Services" },
    { href: "/blog", label: "Blog" },
    { href: "/about", label: "About Us" },
    { href: "/contact", label: "Contact" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Skip to content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:rounded-lg focus:outline-none"
      >
        Skip to main content
      </a>
      <header className="sticky top-0 z-50 w-full gradient-navy">
        <div className="container-main">
          <div className="flex h-16 md:h-20 items-center justify-between">
            {/* Logo */}
            <Link to="/" className="no-link-style flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">AR</span>
              </div>
              <div className="hidden sm:block">
                <span className="font-display font-semibold text-white">AR Advanced</span>
                <span className="block text-xs text-white/70 -mt-1">Woundcare Solutions</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`no-link-style text-sm font-medium transition-colors hover:text-white ${isActive(link.href) ? "text-white" : "text-white/80"
                    }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* CTA Buttons */}
            <div className="hidden md:flex items-center gap-3">
              <ThemeToggle />
              <Button variant="ghost" asChild className="border-2 border-white/80 text-white hover:bg-white/10 hover:text-white">
                <Link to="/refer" className="no-link-style">Refer a Patient</Link>
              </Button>
              <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Link to="/request-visit" className="no-link-style">Book a Visit</Link>
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 text-white focus-ring rounded-md"
              aria-label="Toggle menu"
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-white/20 gradient-navy">
            <nav className="container-main py-4 flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`no-link-style py-3 text-base font-medium transition-colors ${isActive(link.href) ? "text-white" : "text-white/80"
                    }`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="flex flex-col gap-3 pt-4 border-t border-white/20 mt-2">
                <Button variant="ghost" asChild className="w-full justify-center border-2 border-white/80 text-white hover:bg-white/10">
                  <Link to="/refer" onClick={() => setIsMenuOpen(false)} className="no-link-style">
                    Refer a Patient
                  </Link>
                </Button>
                <Button asChild className="w-full justify-center bg-primary text-primary-foreground hover:bg-primary/90">
                  <Link to="/request-visit" onClick={() => setIsMenuOpen(false)} className="no-link-style">
                    Book a Visit
                  </Link>
                </Button>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Mobile Floating Call Button */}
      <a
        href="tel:+18001234567"
        className="fixed bottom-6 right-6 z-50 md:hidden w-14 h-14 bg-primary rounded-full flex items-center justify-center shadow-elevated hover:bg-primary/90 transition-colors focus-ring"
        aria-label="Call now"
      >
        <Phone size={24} className="text-primary-foreground" />
      </a>
    </>
  );
};

export default Header;
