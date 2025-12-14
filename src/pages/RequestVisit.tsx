import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Phone, Mail, Clock, CheckCircle2, Shield, Heart, MapPin } from "lucide-react";
import woundCareImage from "@/assets/wound-care-supplies.jpg";

const formSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  email: z.string().email("Valid email is required"),
  address: z.string().min(5, "Address is required for home visits"),
  preferredContact: z.string().min(1, "Please select a preferred contact method"),
  woundType: z.string().min(1, "Please select a wound type"),
  additionalInfo: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

const RequestVisit = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: FormData) => {
    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log("Form submitted:", data);
    setIsSubmitted(true);
    toast({
      title: "Request Submitted",
      description: "We'll contact you within 24 hours to schedule your visit.",
    });
  };

  if (isSubmitted) {
    return (
      <>
        <Helmet>
          <title>Request Submitted | AR Advanced Woundcare Solutions</title>
        </Helmet>
        <Layout>
          <section className="section-padding bg-gradient-to-b from-warm to-background">
            <div className="container-main">
              <div className="max-w-xl mx-auto text-center">
                <div className="w-20 h-20 mx-auto rounded-full bg-primary/20 flex items-center justify-center mb-6">
                  <CheckCircle2 size={40} className="text-primary" />
                </div>
                <h1 className="text-3xl md:text-4xl font-semibold text-foreground mb-4">
                  Thank You!
                </h1>
                <p className="text-lg text-muted-foreground mb-8">
                  Your visit request has been submitted successfully. Our care 
                  coordinator will contact you within 24 hours to schedule your appointment.
                </p>
                <div className="bg-card rounded-xl p-6 card-shadow">
                  <h3 className="font-semibold text-foreground mb-4">What's Next?</h3>
                  <ul className="text-left space-y-3 text-muted-foreground">
                    <li className="flex items-start gap-3">
                      <CheckCircle2 size={20} className="text-primary mt-0.5 shrink-0" />
                      <span>Our team will review your information</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 size={20} className="text-primary mt-0.5 shrink-0" />
                      <span>A care coordinator will call to schedule your visit</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 size={20} className="text-primary mt-0.5 shrink-0" />
                      <span>A certified specialist will visit you at the scheduled time</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>
        </Layout>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Request a Visit | AR Advanced Woundcare Solutions</title>
        <meta 
          name="description" 
          content="Request a wound care visit from AR Advanced Woundcare Solutions. Fill out our simple form and a care coordinator will contact you within 24 hours." 
        />
      </Helmet>
      <Layout>
        {/* Hero */}
        <section className="bg-gradient-to-b from-warm to-background py-12 md:py-16">
          <div className="container-main text-center">
            <h1 className="text-foreground mb-4">Request a Visit</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Take the first step toward healing. Fill out the form below and our 
              care team will contact you within 24 hours.
            </p>
          </div>
        </section>

        {/* Form Section */}
        <section className="pb-16 md:pb-24 -mt-4">
          <div className="container-main">
            <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
              {/* Form */}
              <div className="lg:col-span-2">
                <Card className="card-shadow">
                  <CardContent className="p-6 md:p-8">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                      {/* Name Row */}
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">First Name *</Label>
                          <Input
                            id="firstName"
                            {...register("firstName")}
                            placeholder="John"
                            className={errors.firstName ? "border-destructive" : ""}
                          />
                          {errors.firstName && (
                            <p className="text-sm text-destructive">{errors.firstName.message}</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Last Name *</Label>
                          <Input
                            id="lastName"
                            {...register("lastName")}
                            placeholder="Doe"
                            className={errors.lastName ? "border-destructive" : ""}
                          />
                          {errors.lastName && (
                            <p className="text-sm text-destructive">{errors.lastName.message}</p>
                          )}
                        </div>
                      </div>

                      {/* Contact Row */}
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone Number *</Label>
                          <Input
                            id="phone"
                            type="tel"
                            {...register("phone")}
                            placeholder="(555) 123-4567"
                            className={errors.phone ? "border-destructive" : ""}
                          />
                          {errors.phone && (
                            <p className="text-sm text-destructive">{errors.phone.message}</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email Address *</Label>
                          <Input
                            id="email"
                            type="email"
                            {...register("email")}
                            placeholder="john@example.com"
                            className={errors.email ? "border-destructive" : ""}
                          />
                          {errors.email && (
                            <p className="text-sm text-destructive">{errors.email.message}</p>
                          )}
                        </div>
                      </div>

                      {/* Address */}
                      <div className="space-y-2">
                        <Label htmlFor="address">
                          <span className="flex items-center gap-2">
                            <MapPin size={16} className="text-primary" />
                            Home Address *
                          </span>
                        </Label>
                        <Input
                          id="address"
                          {...register("address")}
                          placeholder="123 Main St, City, State ZIP"
                          className={errors.address ? "border-destructive" : ""}
                        />
                        {errors.address && (
                          <p className="text-sm text-destructive">{errors.address.message}</p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          Required for scheduling in-home wound care visits
                        </p>
                      </div>

                      {/* Selects Row */}
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Preferred Contact Method *</Label>
                          <Select onValueChange={(value) => setValue("preferredContact", value)}>
                            <SelectTrigger className={errors.preferredContact ? "border-destructive" : ""}>
                              <SelectValue placeholder="Select method" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="phone">Phone Call</SelectItem>
                              <SelectItem value="text">Text Message</SelectItem>
                              <SelectItem value="email">Email</SelectItem>
                            </SelectContent>
                          </Select>
                          {errors.preferredContact && (
                            <p className="text-sm text-destructive">{errors.preferredContact.message}</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label>Wound Type *</Label>
                          <Select onValueChange={(value) => setValue("woundType", value)}>
                            <SelectTrigger className={errors.woundType ? "border-destructive" : ""}>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="diabetic">Diabetic Ulcer</SelectItem>
                              <SelectItem value="pressure">Pressure Ulcer</SelectItem>
                              <SelectItem value="venous">Venous Ulcer</SelectItem>
                              <SelectItem value="surgical">Surgical Wound</SelectItem>
                              <SelectItem value="other">Other / Not Sure</SelectItem>
                            </SelectContent>
                          </Select>
                          {errors.woundType && (
                            <p className="text-sm text-destructive">{errors.woundType.message}</p>
                          )}
                        </div>
                      </div>

                      {/* Additional Info */}
                      <div className="space-y-2">
                        <Label htmlFor="additionalInfo">Additional Information (Optional)</Label>
                        <Textarea
                          id="additionalInfo"
                          {...register("additionalInfo")}
                          placeholder="Please share any additional details about your wound care needs, preferred appointment times, or other relevant information..."
                          rows={4}
                        />
                      </div>

                      {/* Submit */}
                      <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? "Submitting..." : "Submit Request"}
                      </Button>

                      <p className="text-xs text-muted-foreground text-center">
                        By submitting this form, you agree to our privacy policy. 
                        Your information will be kept confidential.
                      </p>
                    </form>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Image */}
                <div className="hidden lg:block rounded-xl overflow-hidden soft-shadow">
                  <img 
                    src={woundCareImage} 
                    alt="Professional wound care supplies and treatment"
                    className="w-full h-48 object-cover"
                  />
                </div>

                {/* Contact Card */}
                <Card className="bg-primary/10 border-0">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-foreground mb-4">Need Immediate Help?</h3>
                    <div className="space-y-4">
                      <a href="tel:+18001234567" className="flex items-center gap-3 text-foreground hover:text-primary transition-colors">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                          <Phone size={18} className="text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">(800) 123-4567</p>
                          <p className="text-xs text-muted-foreground">Call us directly</p>
                        </div>
                      </a>
                      <a href="mailto:info@arwoundcare.com" className="flex items-center gap-3 text-foreground hover:text-primary transition-colors">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                          <Mail size={18} className="text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">info@arwoundcare.com</p>
                          <p className="text-xs text-muted-foreground">Email us</p>
                        </div>
                      </a>
                    </div>
                  </CardContent>
                </Card>

                {/* Response Time */}
                <Card className="border-primary/20">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <Clock size={20} className="text-primary" />
                      <h3 className="font-semibold text-foreground">Response Time</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      We respond to all visit requests within 24 hours during business days.
                    </p>
                  </CardContent>
                </Card>

                {/* Trust Indicators */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Shield size={18} className="text-primary" />
                    <span>HIPAA Compliant & Secure</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Heart size={18} className="text-primary" />
                    <span>Compassionate Care Team</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </Layout>
    </>
  );
};

export default RequestVisit;
