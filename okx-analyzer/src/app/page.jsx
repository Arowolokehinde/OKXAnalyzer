// app/page.jsx
'use client';

import { Suspense, useEffect, useState } from 'react';
import Navbar from '../component/layout/Navbar';
import Footer from '../component/layout/Footer';
import HeroSection from '../component/landing/HeroSection';
import StatsSection from '../component/landing/StatsSection';
import TokenDiscoverySection from '../component/landing/TokenDiscoverySection';
import FeaturesSection from '../component/landing/FeaturesSection';
import DataVisualizationSection from '../component/landing/DataVisualizationSection';
import CTASection from '../component/landing/CTASection';
import { motion } from 'framer-motion';

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Simulate initial loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);
  
  // For scroll to top button
  const toggleVisibility = () => {
    if (window.pageYOffset > 500) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);
  
  // Loading animation
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-slate-950 flex items-center justify-center z-50">
        <div className="text-center">
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.7, 1, 0.7],
              rotate: [0, 180, 360]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="w-16 h-16 rounded-full border-b-2 border-t-2 border-teal-500 mx-auto mb-6"
          ></motion.div>
          <motion.h2 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-teal-400 bg-clip-text text-transparent"
          >
            OKX Launch Analytics
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="text-gray-400 mt-2"
          >
            Loading your dashboard...
          </motion.p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 overflow-hidden">
      <Navbar />
      
      {/* Page Sections */}
      <HeroSection />
      <StatsSection />
      <TokenDiscoverySection />
      <DataVisualizationSection />
      <FeaturesSection />
      <CTASection />
      <Footer />
      
      {/* Mobile App Download Floating Button - Mobile Only */}
      <div className="fixed bottom-6 right-6 md:hidden z-40">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="h-14 w-14 rounded-full bg-gradient-to-r from-blue-600 to-teal-500 flex items-center justify-center shadow-lg shadow-blue-900/30"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        </motion.button>
      </div>

      {/* Scroll to Top Button - Appears when scrolling down */}
      <motion.button
        className={`fixed bottom-6 left-6 z-40 h-10 w-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center ${
          isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        } transition-opacity duration-300`}
        onClick={scrollToTop}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 11l7-7 7 7M5 19l7-7 7 7" />
        </svg>
      </motion.button>
    </main>
  );
}