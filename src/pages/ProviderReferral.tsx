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
import { useProviderReferrals } from "@/hooks/useSupabaseData";
import {
  Phone, Mail, CheckCircle2, Building2, UserRound,
  FileText, Clock, ArrowRight, Handshake, MapPin
} from "lucide-react";

const formSchema = z.object({
  // Provider Info
  providerName: z.string().min(2, "Provider name is required"),
  practiceName: z.string().min(2, "Practice name is required"),
  providerPhone: z.string().min(10, "Valid phone number is required"),
  providerEmail: z.string().email("Valid email is required"),
  providerNPI: z.string().optional(),
  // Patient Info
  patientFirstName: z.string().min(2, "Patient first name is required"),
  patientLastName: z.string().min(2, "Patient last name is required"),
  patientPhone: z.string().min(10, "Patient phone is required"),
  patientAddress: z.string().min(5, "Patient address is required for home visits"),
  patientDOB: z.string().min(1, "Patient date of birth is required"),
  woundType: z.string().min(1, "Please select a wound type"),
  urgency: z.string().min(1, "Please select urgency level"),
  clinicalNotes: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

const benefits = [
  {
    icon: Clock,
    title: "Quick Response",
    description: "Patients are contacted within 24 hours",
  },
  {
    icon: FileText,
    title: "Progress Reports",
    description: "Regular clinical updates to referring providers",
  },
  {
    icon: Handshake,
    title: "Care Coordination",
    description: "Seamless communication with your practice",
  },
];

const ProviderReferral = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { submitReferral } = useProviderReferrals();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: FormData) => {
    const result = await submitReferral({
      provider_name: data.providerName,
      provider_organization: data.practiceName,
      provider_phone: data.providerPhone,
      provider_email: data.providerEmail,
      patient_name: `${data.patientFirstName} ${data.patientLastName}`,
      patient_phone: data.patientPhone,
      patient_address: data.patientAddress,
      wound_type: data.woundType,
      urgency: data.urgency,
      clinical_notes: data.clinicalNotes,
    });

    if (result.success) {
      setIsSubmitted(true);
    }
  };

  if (isSubmitted) {
    return (
      <>
        <Helmet>
          <title>Referral Submitted | AR Advanced Woundcare Solutions</title>
        </Helmet>
        <Layout>
          <section className="section-padding bg-[#EBF4FA]">
            <div className="container-main">
              <div className="max-w-xl mx-auto text-center">
                <div className="w-20 h-20 mx-auto rounded-full bg-primary/20 flex items-center justify-center mb-6">
                  <CheckCircle2 size={40} className="text-primary" />
                </div>
                <h1 className="text-3xl md:text-4xl font-semibold text-foreground mb-4">
                  Referral Received
                </h1>
                <p className="text-lg text-muted-foreground mb-8">
                  Thank you for your referral. We'll contact your patient within
                  24 hours and keep you updated on their care progress.
                </p>
                <div className="bg-card rounded-xl p-6 card-shadow text-left">
                  <h3 className="font-semibold text-foreground mb-4">What Happens Next</h3>
                  <ul className="space-y-3 text-muted-foreground">
                    <li className="flex items-start gap-3">
                      <CheckCircle2 size={20} className="text-primary mt-0.5 shrink-0" />
                      <span>Our team reviews the referral information</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 size={20} className="text-primary mt-0.5 shrink-0" />
                      <span>Patient is contacted to schedule their first visit</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 size={20} className="text-primary mt-0.5 shrink-0" />
                      <span>You receive a confirmation and ongoing progress reports</span>
                    </li>
                  </ul>
                </div>
                <Button asChild className="mt-8">
                  <a href="/refer">Submit Another Referral</a>
                </Button>
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
        <title>Provider Referral | AR Advanced Woundcare Solutions</title>
        <meta
          name="description"
          content="Refer your patients to AR Advanced Woundcare Solutions for expert wound care. Simple referral process with regular progress updates for referring providers."
        />
      </Helmet>
      <Layout>
        {/* Hero */}
        <section className="bg-[#EBF4FA] py-12 md:py-16">
          <div className="container-main">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary/10 rounded-full text-sm font-medium text-secondary mb-4">
                <Building2 size={16} />
                <span>For Healthcare Providers</span>
              </div>
              <h1 className="text-foreground mb-4">Refer a Patient</h1>
              <p className="text-lg text-muted-foreground">
                Partner with us to provide your patients with specialized wound care.
                We keep you informed every step of the way.
              </p>
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-8 border-b border-border">
          <div className="container-main">
            <div className="grid md:grid-cols-3 gap-6">
              {benefits.map((benefit) => (
                <div key={benefit.title} className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
                    <benefit.icon size={24} className="text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{benefit.title}</h3>
                    <p className="text-sm text-muted-foreground">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Form Section */}
        <section className="section-padding">
          <div className="container-main">
            <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
              {/* Form */}
              <div className="lg:col-span-2">
                <Card className="card-shadow">
                  <CardContent className="p-6 md:p-8">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                      {/* Provider Information */}
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <Building2 size={20} className="text-primary" />
                          <h2 className="text-xl font-semibold text-foreground">Provider Information</h2>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="providerName">Provider Name *</Label>
                            <Input
                              id="providerName"
                              {...register("providerName")}
                              placeholder="Dr. Jane Smith"
                              className={errors.providerName ? "border-destructive" : ""}
                            />
                            {errors.providerName && (
                              <p className="text-sm text-destructive">{errors.providerName.message}</p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="practiceName">Practice Name *</Label>
                            <Input
                              id="practiceName"
                              {...register("practiceName")}
                              placeholder="City Medical Group"
                              className={errors.practiceName ? "border-destructive" : ""}
                            />
                            {errors.practiceName && (
                              <p className="text-sm text-destructive">{errors.practiceName.message}</p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="providerPhone">Phone *</Label>
                            <Input
                              id="providerPhone"
                              type="tel"
                              {...register("providerPhone")}
                              placeholder="(555) 123-4567"
                              className={errors.providerPhone ? "border-destructive" : ""}
                            />
                            {errors.providerPhone && (
                              <p className="text-sm text-destructive">{errors.providerPhone.message}</p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="providerEmail">Email *</Label>
                            <Input
                              id="providerEmail"
                              type="email"
                              {...register("providerEmail")}
                              placeholder="provider@practice.com"
                              className={errors.providerEmail ? "border-destructive" : ""}
                            />
                            {errors.providerEmail && (
                              <p className="text-sm text-destructive">{errors.providerEmail.message}</p>
                            )}
                          </div>
                          <div className="space-y-2 sm:col-span-2">
                            <Label htmlFor="providerNPI">NPI Number (Optional)</Label>
                            <Input
                              id="providerNPI"
                              {...register("providerNPI")}
                              placeholder="1234567890"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Patient Information */}
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <UserRound size={20} className="text-primary" />
                          <h2 className="text-xl font-semibold text-foreground">Patient Information</h2>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="patientFirstName">Patient First Name *</Label>
                            <Input
                              id="patientFirstName"
                              {...register("patientFirstName")}
                              placeholder="John"
                              className={errors.patientFirstName ? "border-destructive" : ""}
                            />
                            {errors.patientFirstName && (
                              <p className="text-sm text-destructive">{errors.patientFirstName.message}</p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="patientLastName">Patient Last Name *</Label>
                            <Input
                              id="patientLastName"
                              {...register("patientLastName")}
                              placeholder="Doe"
                              className={errors.patientLastName ? "border-destructive" : ""}
                            />
                            {errors.patientLastName && (
                              <p className="text-sm text-destructive">{errors.patientLastName.message}</p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="patientPhone">Patient Phone *</Label>
                            <Input
                              id="patientPhone"
                              type="tel"
                              {...register("patientPhone")}
                              placeholder="(555) 987-6543"
                              className={errors.patientPhone ? "border-destructive" : ""}
                            />
                            {errors.patientPhone && (
                              <p className="text-sm text-destructive">{errors.patientPhone.message}</p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="patientDOB">Date of Birth *</Label>
                            <Input
                              id="patientDOB"
                              type="date"
                              {...register("patientDOB")}
                              className={errors.patientDOB ? "border-destructive" : ""}
                            />
                            {errors.patientDOB && (
                              <p className="text-sm text-destructive">{errors.patientDOB.message}</p>
                            )}
                          </div>
                          <div className="space-y-2 sm:col-span-2">
                            <Label htmlFor="patientAddress">
                              <span className="flex items-center gap-2">
                                <MapPin size={16} className="text-primary" />
                                Patient Address *
                              </span>
                            </Label>
                            <Input
                              id="patientAddress"
                              {...register("patientAddress")}
                              placeholder="123 Main St, City, State ZIP"
                              className={errors.patientAddress ? "border-destructive" : ""}
                            />
                            {errors.patientAddress && (
                              <p className="text-sm text-destructive">{errors.patientAddress.message}</p>
                            )}
                            <p className="text-xs text-muted-foreground">
                              Required for scheduling in-home wound care visits
                            </p>
                          </div>
                          <div className="space-y-2">
                            <Label>Wound Type *</Label>
                            <Select onValueChange={(value) => setValue("woundType", value)}>
                              <SelectTrigger className={errors.woundType ? "border-destructive" : ""}>
                                <SelectValue placeholder="Select wound type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="diabetic">Diabetic Ulcer</SelectItem>
                                <SelectItem value="pressure">Pressure Ulcer</SelectItem>
                                <SelectItem value="venous">Venous Ulcer</SelectItem>
                                <SelectItem value="arterial">Arterial Ulcer</SelectItem>
                                <SelectItem value="surgical">Surgical Wound</SelectItem>
                                <SelectItem value="traumatic">Traumatic Wound</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                            {errors.woundType && (
                              <p className="text-sm text-destructive">{errors.woundType.message}</p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label>Urgency Level *</Label>
                            <Select onValueChange={(value) => setValue("urgency", value)}>
                              <SelectTrigger className={errors.urgency ? "border-destructive" : ""}>
                                <SelectValue placeholder="Select urgency" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="routine">Routine (within 1 week)</SelectItem>
                                <SelectItem value="soon">Soon (within 48 hours)</SelectItem>
                                <SelectItem value="urgent">Urgent (within 24 hours)</SelectItem>
                              </SelectContent>
                            </Select>
                            {errors.urgency && (
                              <p className="text-sm text-destructive">{errors.urgency.message}</p>
                            )}
                          </div>
                          <div className="space-y-2 sm:col-span-2">
                            <Label htmlFor="clinicalNotes">Clinical Notes (Optional)</Label>
                            <Textarea
                              id="clinicalNotes"
                              {...register("clinicalNotes")}
                              placeholder="Relevant medical history, current treatments, medications, or other clinical details..."
                              rows={4}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Submit */}
                      <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? "Submitting Referral..." : "Submit Referral"}
                        <ArrowRight size={18} />
                      </Button>

                      <p className="text-xs text-muted-foreground text-center">
                        This referral form is HIPAA compliant. Patient information is
                        encrypted and handled in accordance with healthcare privacy regulations.
                      </p>
                    </form>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Provider Hotline */}
                <Card className="bg-primary/10 border-0">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-foreground mb-4">Provider Hotline</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      For urgent referrals or clinical questions, call our dedicated provider line.
                    </p>
                    <a
                      href="tel:+18001234568"
                      className="no-link-style flex items-center gap-3 p-3 bg-primary/20 rounded-lg hover:bg-primary/30 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <Phone size={18} className="text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">(800) 123-4568</p>
                        <p className="text-xs text-muted-foreground">Mon-Fri 7AM-7PM</p>
                      </div>
                    </a>
                  </CardContent>
                </Card>

                {/* Fax Referrals */}
                <Card className="border-primary/20">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-foreground mb-3">Prefer to Fax?</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Download our referral form and fax completed referrals to:
                    </p>
                    <p className="font-medium text-foreground mb-3">(800) 123-4569</p>
                    <Button variant="outline" size="sm" className="w-full">
                      <FileText size={16} />
                      Download Form (PDF)
                    </Button>
                  </CardContent>
                </Card>

                {/* Contact */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-foreground mb-3">Questions?</h3>
                    <a
                      href="mailto:referrals@arwoundcare.com"
                      className="flex items-center gap-2 text-primary hover:underline text-sm"
                    >
                      <Mail size={16} />
                      referrals@arwoundcare.com
                    </a>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </Layout>
    </>
  );
};

export default ProviderReferral;
