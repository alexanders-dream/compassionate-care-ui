import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { SiteDataProvider } from "@/contexts/SiteDataContext";
import { AuthProvider } from "@/contexts/AuthContext";
import ScrollToTop from "@/components/ScrollToTop";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import ErrorBoundary from "@/components/ErrorBoundary";
import LoadingSpinner from "@/components/ui/loading-spinner";
import Index from "./pages/Index";
import Services from "./pages/Services";
import About from "./pages/About";
import Contact from "./pages/Contact";
import RequestVisit from "./pages/RequestVisit";
import ProviderReferral from "./pages/ProviderReferral";
import Conditions from "./pages/Conditions";
import Testimonials from "./pages/Testimonials";
import Faqs from "./pages/Faqs";
import Resources from "./pages/Resources";
import Insurance from "./pages/Insurance";
import Community from "./pages/Community";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Accessibility from "./pages/Accessibility";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

// Lazy load heavy admin pages for better initial bundle size

const AdminLayout = lazy(() => import("./components/admin/AdminLayout"));
const SubmissionsPage = lazy(() => import("./pages/admin/SubmissionsPage"));
const AppointmentsPage = lazy(() => import("./pages/admin/AppointmentsPage"));

const ResourcesPage = lazy(() => import("./pages/admin/ResourcesPage"));
const SiteCopyPage = lazy(() => import("./pages/admin/SiteCopyPage"));
const BlogPage = lazy(() => import("./pages/admin/BlogPage"));
const TestimonialsPage = lazy(() => import("./pages/admin/TestimonialsPage"));
const ServicesPage = lazy(() => import("./pages/admin/ServicesPage"));
const TeamPage = lazy(() => import("./pages/admin/TeamPage"));
const FaqsPage = lazy(() => import("./pages/admin/FaqsPage"));
const ProfilePage = lazy(() => import("./pages/admin/ProfilePage"));
const InsurancePage = lazy(() => import("./pages/admin/InsurancePage"));
const NotificationsPage = lazy(() => import("./pages/admin/NotificationsPage"));
const EmailPatientsPage = lazy(() => import("./pages/admin/EmailPatientsPage"));
const BlogEditor = lazy(() => import("./pages/BlogEditor"));

const queryClient = new QueryClient();

// Loading fallback component for admin routes
const AdminLoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <LoadingSpinner size="lg" text="Loading admin dashboard..." />
  </div>
);

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SiteDataProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <ErrorBoundary>
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
                  <Route path="/faqs" element={<Faqs />} />
                  <Route path="/resources" element={<Resources />} />
                  <Route path="/insurance" element={<Insurance />} />
                  <Route path="/community" element={<Community />} />
                  <Route path="/privacy" element={<Privacy />} />
                  <Route path="/terms" element={<Terms />} />
                  <Route path="/accessibility" element={<Accessibility />} />
                  <Route path="/blog" element={<Blog />} />
                  <Route path="/blog/:slug" element={<BlogPost />} />
                  <Route path="/auth" element={<Auth />} />

                  {/* Admin Routes - All authenticated users can access, features differ by role */}
                  <Route path="/admin" element={
                    <ProtectedRoute>
                      <Suspense fallback={<AdminLoadingFallback />}>
                        <AdminLayout />
                      </Suspense>
                    </ProtectedRoute>
                  }>
                    <Route index element={<Navigate to="submissions" replace />} />
                    <Route path="submissions" element={<SubmissionsPage />} />
                    <Route path="appointments" element={<AppointmentsPage />} />

                    <Route path="resources" element={<ResourcesPage />} />
                    <Route path="site-copy" element={<SiteCopyPage />} />
                    <Route path="blog" element={<BlogPage />} />
                    <Route path="testimonials" element={<TestimonialsPage />} />
                    <Route path="services" element={<ServicesPage />} />
                    <Route path="team" element={<TeamPage />} />
                    <Route path="faqs" element={<FaqsPage />} />
                    <Route path="insurance" element={<InsurancePage />} />
                    <Route path="notifications" element={<NotificationsPage />} />
                    <Route path="email-patients" element={<EmailPatientsPage />} />
                    <Route path="profile" element={<ProfilePage />} />

                    {/* Blog Editor Routes */}
                    <Route path="blog/new" element={<BlogEditor />} />
                    <Route path="blog/:postId" element={<BlogEditor />} />
                  </Route>

                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </ErrorBoundary>
            </BrowserRouter>
          </TooltipProvider>
        </SiteDataProvider>
      </AuthProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;

