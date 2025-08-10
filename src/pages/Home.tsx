import React from 'react';
import Hero from '../components/Hero';
import OrganizationalStructure from '../components/OrganizationalStructure';
import ContactSection from '../components/ContactSection';
import Footer from '../components/Footer';

const Home = () => {
  return (
    <div className="min-h-screen">
      <Hero />
      <OrganizationalStructure />
      <ContactSection />
      <Footer />
    </div>
  );
};

export default Home;