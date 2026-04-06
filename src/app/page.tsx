import HomepageNavbar from "@/components/homepage/HomepageNavbar";
import HeroSection from "@/components/homepage/HeroSection";
import FeaturesSection from "@/components/homepage/FeaturesSection";
import AiSection from "@/components/homepage/AiSection";
import PricingSection from "@/components/homepage/PricingSection";
import CtaSection from "@/components/homepage/CtaSection";
import HomepageFooter from "@/components/homepage/HomepageFooter";

export default function Home() {
  return (
    <main className="bg-slate-950 text-slate-50 scroll-smooth">
      <HomepageNavbar />
      <HeroSection />
      <FeaturesSection />
      <AiSection />
      <PricingSection />
      <CtaSection />
      <HomepageFooter />
    </main>
  );
}
