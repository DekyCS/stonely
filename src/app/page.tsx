import { Community } from "@/components/sections/community";
import { CTA } from "@/components/sections/cta";
import { Features } from "@/components/sections/features";
import { Footer } from "@/components/sections/footer";
import { Header } from "@/components/sections/header";
import { Hero } from "@/components/sections/hero";
import { Logos } from "@/components/sections/logos";
import { Statistics } from "@/components/sections/statistics";
import { Testimonials } from "@/components/sections/testimonials";
import { UseCases } from "@/components/sections/use-cases";

export default function Home() {
  return (
    <main>
      <Header />
      <Hero />
      <Logos />
      <UseCases />
      <Features />
      <Statistics />
      <Testimonials />
      <Community />
      <CTA />
      <Footer />
    </main>
  );
}
