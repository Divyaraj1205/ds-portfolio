import { AnimatePresence } from 'framer-motion';
import { lazy, startTransition, Suspense, useCallback, useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import About from './components/About';
import BackToTop from './components/BackToTop';
import Contact from './components/Contact';
import ContactModal from './components/ContactModal';
import CustomCursor from './components/CustomCursor';
import Experience from './components/Experience';
import Footer from './components/Footer';
import Hero from './components/Hero';
import Navbar from './components/Navbar';
import Preloader from './components/Preloader';
import ScrollProgress from './components/ScrollProgress';
import Skills from './components/Skills';
import Work from './components/Work';
import { ContactModalProvider } from './context/ContactModalContext';

// Split out of the main bundle -- it's a separate route nobody hits on a
// normal visit, so there's no reason its code should delay Home's own
// first paint.
const NotFound = lazy(() => import('./components/NotFound'));

function Home() {
  return (
    <>
      <Hero />
      <About />
      <Skills />
      <Work />
      <Experience />
      <Contact />
    </>
  );
}

export default function App() {
  const [loading, setLoading] = useState(true);
  const [contentReady, setContentReady] = useState(false);

  const handleLoaded = useCallback(() => {
    startTransition(() => setContentReady(true));
  }, []);
  const handleFinished = useCallback(() => setLoading(false), []);

  return (
    <BrowserRouter>
      <ContactModalProvider>
        {!loading && (
          <>
            <CustomCursor />
            <ScrollProgress />
          </>
        )}

        <AnimatePresence>
          {loading && <Preloader onLoaded={handleLoaded} onFinished={handleFinished} />}
        </AnimatePresence>

        {contentReady && (
          <>
            <Navbar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route
                path="*"
                element={
                  <Suspense fallback={null}>
                    <NotFound />
                  </Suspense>
                }
              />
            </Routes>
            <Footer />
            <BackToTop />
            <ContactModal />
          </>
        )}

        <div className="noise-overlay" aria-hidden="true" />
      </ContactModalProvider>
    </BrowserRouter>
  );
}
