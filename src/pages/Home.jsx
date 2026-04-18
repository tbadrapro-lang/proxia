import Navbar from '../components/Navbar';
import Hero from '../sections/Hero';
import LogoMarquee from '../components/LogoMarquee';
import Services from '../sections/Services';
import PourQui from '../sections/PourQui';
import Realisations from '../sections/Realisations';
import Process from '../sections/Process';
import Reservation from '../sections/Reservation';
import Tarifs from '../sections/Tarifs';
import Temoignages from '../sections/Temoignages';
import FAQ from '../sections/FAQ';
import Contact from '../sections/Contact';
import Footer from '../components/Footer';
import AvatarKone from '../components/AvatarKone';
import StickyMobileCTA from '../components/StickyMobileCTA';
import { Toaster } from 'react-hot-toast';

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <section id="accueil"><Hero /></section>
        <LogoMarquee />
        <section id="services"><Services /></section>
        <section id="pour-qui"><PourQui /></section>
        <section id="realisations"><Realisations /></section>
        <section id="process"><Process /></section>
        <section id="reservation"><Reservation /></section>
        <section id="tarifs"><Tarifs /></section>
        <section id="temoignages"><Temoignages /></section>
        <section id="faq"><FAQ /></section>
        <section id="contact"><Contact /></section>
      </main>
      <Footer />
      <AvatarKone />
      <StickyMobileCTA />
      <Toaster position="bottom-right" />
    </>
  );
}
