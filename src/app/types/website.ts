export interface WebsiteData {
  businessName: string;
  industry: string;
  suburbLocation: string;
  cityLocation: string;
  contact: {
    phone: string;
    email: string;
    whatsappNumber: string;
  };
  branding: {
    primaryColor: string;   // The main glowing color hex code
    secondaryColor: string; // The supporting accent color hex code
    themeMode: 'dark' | 'light';
  };
  heroSection: {
    headline: string;
    subheadline: string;
    ctaText: string;
  };
  services: Array<{
    title: string;
    description: string;
    iconIdentifier: 'phone-inbound' | 'phone-outbound' | 'automation' | 'wrench' | 'laptop' | 'shield'; 
  }>;
  aboutUs: {
    story: string;
  };
}