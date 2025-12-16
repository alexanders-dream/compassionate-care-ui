/**
 * Site Configuration
 * Centralized configuration for contact information, branding, and site-wide settings.
 * Update these values to propagate changes across the entire site.
 */

export const siteConfig = {
    name: "AR Advanced Woundcare Solutions",
    shortName: "AR Advanced",
    tagline: "Woundcare Solutions",
    description: "Compassionate, expert wound care delivered with trust and clinical excellence.",

    phone: {
        main: "(800) 123-4567",
        provider: "(800) 987-6543",
        mainHref: "tel:+18001234567",
        providerHref: "tel:+18009876543",
    },

    email: {
        main: "info@arwoundcare.com",
        referrals: "referrals@arwoundcare.com",
        mainHref: "mailto:info@arwoundcare.com",
        referralsHref: "mailto:referrals@arwoundcare.com",
    },

    address: {
        street: "123 Healthcare Blvd, Suite 100",
        city: "Medical City",
        state: "ST",
        zip: "12345",
        full: "123 Healthcare Blvd, Suite 100, Medical City, ST 12345",
    },

    hours: {
        weekday: "Mon-Fri: 8:00 AM - 6:00 PM",
        saturday: "Sat: 9:00 AM - 2:00 PM",
        sunday: "Sun: Closed",
        formatted: [
            { days: "Monday - Friday", hours: "8:00 AM - 6:00 PM" },
            { days: "Saturday", hours: "9:00 AM - 2:00 PM" },
            { days: "Sunday", hours: "Closed" },
        ],
    },

    social: {
        facebook: "",
        twitter: "",
        linkedin: "",
        instagram: "",
    },

    features: {
        darkMode: true,
        blog: true,
        testimonials: true,
        providerReferrals: true,
    },
} as const;

export type SiteConfig = typeof siteConfig;
