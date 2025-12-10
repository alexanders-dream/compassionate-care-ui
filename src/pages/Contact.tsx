import { Helmet } from "react-helmet-async";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Phone, Mail, MapPin, Clock } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().optional(),
  subject: z.string().min(2, "Subject is required"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type FormData = z.infer<typeof formSchema>;

const contactInfo = [
  {
    icon: Phone,
    title: "Phone",
    details: ["Main: (800) 123-4567", "Provider Line: (800) 987-6543"],
    action: { label: "Call Now", href: "tel:+18001234567" }
  },
  {
    icon: Mail,
    title: "Email",
    details: ["info@arwoundcare.com", "referrals@arwoundcare.com"],
    action: { label: "Send Email", href: "mailto:info@arwoundcare.com" }
  },
  {
    icon: MapPin,
    title: "Service Area",
    details: ["Greater Metro Area", "Surrounding Counties"],
    action: null
  },
  {
    icon: Clock,
    title: "Hours",
    details: ["Mon-Fri: 8:00 AM - 6:00 PM", "Sat: 9:00 AM - 2:00 PM"],
    action: null
  }
];

const Contact = () => {
  const { toast } = useToast();
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
    },
  });

  const onSubmit = (data: FormData) => {
    console.log("Contact form submitted:", data);
    toast({
      title: "Message Sent!",
      description: "We'll get back to you within 1 business day.",
    });
    form.reset();
  };

  return (
    <Layout>
      <Helmet>
        <title>Contact Us | AR Advanced Woundcare Solutions</title>
        <meta name="description" content="Contact AR Advanced Woundcare Solutions for questions about our services, to schedule a visit, or to discuss referral partnerships." />
      </Helmet>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-warm via-background to-primary/10 py-16 md:py-24">
        <div className="container-main text-center">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6">
            Get in <span className="text-primary">Touch</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Have questions about our services? Need to schedule a visit or discuss a referral? 
            We're here to help.
          </p>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-12 md:py-16">
        <div className="container-main">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactInfo.map((item, index) => (
              <div 
                key={index}
                className="bg-card rounded-2xl p-6 shadow-soft text-center"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                  {item.title}
                </h3>
                {item.details.map((detail, idx) => (
                  <p key={idx} className="text-sm text-muted-foreground">
                    {detail}
                  </p>
                ))}
                {item.action && (
                  <a 
                    href={item.action.href}
                    className="inline-block mt-3 text-sm font-medium text-primary hover:underline"
                  >
                    {item.action.label}
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-12 md:py-16 bg-warm">
        <div className="container-main">
          <div className="max-w-2xl mx-auto">
            <div className="bg-card rounded-2xl p-8 shadow-elegant">
              <h2 className="font-display text-2xl font-bold text-foreground mb-6 text-center">
                Send Us a Message
              </h2>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="Your name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email *</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="you@email.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone (Optional)</FormLabel>
                          <FormControl>
                            <Input type="tel" placeholder="(555) 123-4567" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="subject"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Subject *</FormLabel>
                          <FormControl>
                            <Input placeholder="How can we help?" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Message *</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Tell us more about your inquiry..."
                            className="min-h-[120px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" size="lg" className="w-full">
                    Send Message
                  </Button>
                </form>
              </Form>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Links CTA */}
      <section className="py-16 md:py-24">
        <div className="container-main text-center">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-4">
            Looking for Something Specific?
          </h2>
          <p className="text-muted-foreground mb-8">
            Use these quick links to get started.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <a href="/request-visit">Schedule a Visit</a>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <a href="/refer">Refer a Patient</a>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Contact;
