import { Helmet } from 'react-helmet-async';
import Navbar from '../components/Navbar';
import Hero from '../sections/Hero';
import LogoMarquee from '../components/LogoMarquee';
import CommercesProximite from '../sections/CommercesProximite';
import Services from '../sections/Services';
import Realisations from '../sections/Realisations';
import Avis from '../sections/Avis';
import Tarifs from '../sections/Tarifs';
import FAQ from '../sections/FAQ';
import Contact from '../sections/Contact';
import Footer from '../components/Footer';
import AvatarKone from '../components/AvatarKone';
import StickyMobileCTA from '../components/StickyMobileCTA';
import ScrollToTop from '../components/ScrollToTop';
import { Toaster } from 'react-hot-toast';

export default function Home() {
  return (
    <>
      <Helmet>
        <title>Proxia IA — Agence IA pour commerçants locaux | Île-de-France</title>
        <meta name="description" content="Proxia IA automatise votre présence digitale : site web, agent vocal, avis Google. Audit gratuit pour restaurants, salons et garages en Île-de-France." />
        <meta property="og:title" content="Proxia IA — Agence IA pour commerçants locaux | Île-de-France" />
        <meta property="og:description" content="Proxia IA automatise votre présence digitale : site web, agent vocal, avis Google. Audit gratuit pour restaurants, salons et garages en Île-de-France." />
        <meta property="og:url" content="https://proxia-ia.fr" />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://proxia-ia.fr" />
      </Helmet>
      <Navbar />
      <main>
        <section id="accueil"><Hero /></section>
        <LogoMarquee />
        <section id="services"><Services /></section>
        <section id="pour-qui"><CommercesProximite /></section>
        <section id="realisations"><Realisations /></section>
        <section id="avis"><Avis /></section>
        <section id="tarifs"><Tarifs /></section>
        <section id="faq"><FAQ /></section>
        <section id="contact"><Contact /></section>
      </main>
      <Footer />
      <AvatarKone />
      <StickyMobileCTA />
      <ScrollToTop />
      <Toaster position="bottom-right" />
    </>
  );
}
