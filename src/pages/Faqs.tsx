import { Helmet } from "react-helmet-async";
import Layout from "@/components/layout/Layout";
import { HelpCircle, Phone } from "lucide-react";
import { useSiteData } from "@/contexts/SiteDataContext";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Faqs = () => {
    const { faqs } = useSiteData();

    return (
        <Layout>
            <Helmet>
                <title>Frequently Asked Questions | AR Advanced Woundcare Solutions</title>
                <meta
                    name="description"
                    content="Find answers to common questions about wound care services, insurance, appointments, and what to expect during your visit."
                />
            </Helmet>

            {/* Hero Section */}
            <section className="bg-[#EBF4FA] dark:bg-background py-16 md:py-24">
                <div className="container-main text-center">
                    <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6">
                        Frequently Asked <span className="text-primary">Questions</span>
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Common questions about our wound care services and what to expect.
                    </p>
                </div>
            </section>

            {/* FAQs List */}
            <section className="py-16 md:py-24 bg-background">
                <div className="container-main">
                    <div className="max-w-3xl mx-auto space-y-4">
                        {faqs.map((faq, index) => (
                            <div key={index} className="bg-card rounded-xl p-6 shadow-soft hover:shadow-elegant transition-shadow">
                                <div className="flex gap-4">
                                    <div className="shrink-0 mt-1">
                                        <HelpCircle className="w-6 h-6 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-foreground text-lg mb-2">{faq.question}</h3>
                                        <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Contact CTA */}
            <section className="py-16 md:py-24 bg-warm dark:bg-card/50">
                <div className="container-main">
                    <div className="bg-card rounded-2xl p-8 md:p-12 shadow-soft text-center max-w-4xl mx-auto">
                        <Phone className="w-12 h-12 text-primary mx-auto mb-4" />
                        <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-4">
                            Still Have Questions?
                        </h2>
                        <p className="text-muted-foreground max-w-xl mx-auto mb-6">
                            Our patient care team is here to help. Contact us for personalized support
                            and answers to your specific questions.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button size="lg" asChild className="text-white">
                                <Link to="/contact">Contact Us</Link>
                            </Button>
                            <Button size="lg" variant="outline" asChild>
                                <a href="tel:+18001234567">Call (800) 123-4567</a>
                            </Button>
                        </div>
                    </div>
                </div>
            </section>
        </Layout>
    );
};

export default Faqs;
