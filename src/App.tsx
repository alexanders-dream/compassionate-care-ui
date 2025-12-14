import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { SiteDataProvider } from "@/contexts/SiteDataContext";
import ScrollToTop from "@/components/ScrollToTop";
import Index from "./pages/Index";
import Services from "./pages/Services";
import About from "./pages/About";
import Contact from "./pages/Contact";
import RequestVisit from "./pages/RequestVisit";
import ProviderReferral from "./pages/ProviderReferral";
import Conditions from "./pages/Conditions";
import Testimonials from "./pages/Testimonials";
import Resources from "./pages/Resources";
import Insurance from "./pages/Insurance";
import Community from "./pages/Community";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Accessibility from "./pages/Accessibility";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <SiteDataProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ScrollToTop />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/services" element={<Services />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/request-visit" element={<RequestVisit />} />
              <Route path="/refer" element={<ProviderReferral />} />
              <Route path="/conditions" element={<Conditions />} />
              <Route path="/testimonials" element={<Testimonials />} />
              <Route path="/resources" element={<Resources />} />
              <Route path="/insurance" element={<Insurance />} />
              <Route path="/community" element={<Community />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/accessibility" element={<Accessibility />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<BlogPost />} />
              <Route path="/admin" element={<Admin />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </SiteDataProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
