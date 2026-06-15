import Navbar from "./components/navbar";
import Hero from "./components/hero";
import Ticker from "./components/ticker";
import HowItWorks from "./components/how-it-works";
import PricingSection from "./components/pricing-section";
import ProductPreview from "./components/product-preview";
import FinalCta from "./components/final-cta";

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Ticker />
        <HowItWorks />
        <PricingSection />
        <ProductPreview />
        <FinalCta />
      </main>
    </>
  );
}
