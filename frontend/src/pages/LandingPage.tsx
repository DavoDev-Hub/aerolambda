import Header from '@/components/flight/Header';
import HeroSection from '@/components/layout/HeroSection';
import FlightSearchForm from '@/components/flight/FlightSearchForm';

export default function LandingPage() {
  return (
    <main className="w-full min-h-screen flex flex-col">
      <Header />
      <HeroSection />
      <FlightSearchForm />
    </main>
  );
}