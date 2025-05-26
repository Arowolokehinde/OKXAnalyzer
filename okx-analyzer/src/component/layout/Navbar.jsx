// components/Navbar.jsx (Updated)
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Search, Bell, ChevronDown, Wallet } from 'lucide-react';
import { useWallet } from '@/context/WalletContext';
import WalletConnectButton from '../wallet/WalletConnectButton';
import WalletModal from '../wallet/WalletModal';

const Navbar = () => {
  const { isConnected } = useWallet();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  
  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobileMenuOpen]);

  const navLinks = [
    { 
      name: 'Dashboard', 
      href: '/',
      isActive: true
    },
    { 
      name: 'Token Discovery', 
      href: '/discovery',
      dropdown: [
        { name: 'New Listings', href: '/discovery/new' },
        { name: 'Trending Tokens', href: '/discovery/trending' },
        { name: 'Meme Coins', href: '/discovery/memes' },
        { name: 'DeFi Tokens', href: '/discovery/defi' }
      ]
    },
    { 
      name: 'Analytics', 
      href: '/analytics',
      dropdown: [
        { name: 'Market Overview', href: '/analytics/market' },
        { name: 'Token Comparison', href: '/analytics/compare' },
        { name: 'Volume Analysis', href: '/analytics/volume' },
        { name: 'Historical Data', href: '/analytics/historical' }
      ]
    },
    { 
      name: 'Watchlist', 
      href: '/watchlist' 
    },
    { 
      name: 'API', 
      href: '/api' 
    }
  ];

  const toggleDropdown = (index) => {
    if (activeDropdown === index) {
      setActiveDropdown(null);
    } else {
      setActiveDropdown(index);
    }
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setActiveDropdown(null);
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Animation variants
  const mobileMenuVariants = {
    hidden: { opacity: 0, height: 0, y: -20 },
    visible: { 
      opacity: 1, 
      height: 'auto', 
      y: 0,
      transition: {
        duration: 0.3,
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    },
    exit: { 
      opacity: 0, 
      height: 0, 
      y: -20,
      transition: {
        duration: 0.3,
        when: "afterChildren",
        staggerChildren: 0.05,
        staggerDirection: -1
      }
    }
  };
  
  const mobileItemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  };
  
  const dropdownVariants = {
    hidden: { opacity: 0, y: -5, height: 0 },
    visible: { 
      opacity: 1, 
      y: 0, 
      height: 'auto',
      transition: {
        duration: 0.2,
        when: "beforeChildren",
        staggerChildren: 0.05
      }
    },
    exit: { 
      opacity: 0, 
      y: -5, 
      height: 0,
      transition: {
        duration: 0.2
      }
    }
  };
  
  const dropdownItemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -10 }
  };

  return (
    <nav 
      className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-slate-900/95 backdrop-blur-md shadow-lg py-2' 
          : 'bg-transparent py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex-shrink-0"
          >
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-teal-400 bg-clip-text text-transparent">
                OKX Launch
              </span>
              <span className="ml-1 text-sm text-teal-500 font-medium">Analytics</span>
            </Link>
          </motion.div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link, index) => (
              <div key={link.name} className="relative group">
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  onClick={(e) => {
                    if (link.dropdown) {
                      e.stopPropagation();
                      toggleDropdown(index);
                    }
                  }}
                >
                  <button 
                    className={`px-4 py-2 rounded-md text-gray-300 hover:text-teal-400 transition-colors font-medium flex items-center ${
                      link.isActive ? 'text-teal-400' : ''
                    }`}
                  >
                    {link.name}
                    {link.dropdown && (
                      <ChevronDown 
                        className={`ml-1 h-4 w-4 transition-transform ${
                          activeDropdown === index ? 'rotate-180' : ''
                        }`} 
                      />
                    )}
                  </button>
                </motion.div>
                
                {/* Dropdown Menu */}
                {link.dropdown && (
                  <AnimatePresence>
                    {activeDropdown === index && (
                      <motion.div
                        className="absolute left-0 mt-1 w-56 rounded-md shadow-lg bg-slate-800 ring-1 ring-black ring-opacity-5 focus:outline-none"
                        variants={dropdownVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="py-1">
                          {link.dropdown.map((item) => (
                            <motion.div
                              key={item.name}
                              variants={dropdownItemVariants}
                            >
                              <Link 
                                href={item.href}
                                className="block px-4 py-2 text-sm text-gray-300 hover:bg-slate-700 hover:text-white"
                                onClick={() => setActiveDropdown(null)}
                              >
                                {item.name}
                              </Link>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </div>
            ))}
          </div>
          
          {/* Right section: Search, Notification & Wallet */}
          <div className="hidden md:flex items-center space-x-4">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-slate-800 p-2 rounded-full cursor-pointer hover:bg-slate-700"
            >
              <Search className="h-5 w-5 text-gray-300" />
            </motion.div>
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-slate-800 p-2 rounded-full cursor-pointer hover:bg-slate-700 relative"
            >
              <Bell className="h-5 w-5 text-gray-300" />
              <motion.span 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-0 right-0 h-2 w-2 bg-teal-500 rounded-full"
              ></motion.span>
            </motion.div>
            
            {/* Wallet Button */}
            <div className="hidden md:block">
              <WalletConnectButton />
            </div>
          </div>
          
          {/* Mobile menu button */}
          <div className="flex items-center md:hidden space-x-3">
            {/* Mobile Wallet Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsWalletModalOpen(true)}
              className={`flex items-center justify-center p-2 rounded-full ${
                isConnected 
                  ? 'bg-teal-500 text-white' 
                  : 'bg-slate-800 text-gray-300'
              }`}
            >
              <Wallet className="h-5 w-5" />
            </motion.button>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsMobileMenuOpen(!isMobileMenuOpen);
              }}
              className="text-gray-300 hover:text-white"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            variants={mobileMenuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="md:hidden bg-slate-900/95 backdrop-blur-md overflow-hidden"
          >
            <div className="px-4 pt-2 pb-3 space-y-1 sm:px-3">
              {navLinks.map((link, index) => (
                <motion.div 
                  key={link.name}
                  variants={mobileItemVariants}
                  className="border-b border-slate-800 py-2"
                >
                  <div 
                    className="flex justify-between items-center"
                    onClick={(e) => {
                      if (link.dropdown) {
                        e.preventDefault();
                        toggleDropdown(index);
                      } else {
                        setIsMobileMenuOpen(false);
                      }
                    }}
                  >
                    <Link
                      href={link.href}
                      className={`text-gray-300 hover:text-teal-400 block rounded-md text-base font-medium ${
                        link.isActive ? 'text-teal-400' : ''
                      }`}
                    >
                      {link.name}
                    </Link>
                    
                    {link.dropdown && (
                      <ChevronDown 
                        className={`h-5 w-5 text-gray-400 transition-transform ${
                          activeDropdown === index ? 'rotate-180' : ''
                        }`} 
                      />
                    )}
                  </div>
                  
                  {/* Mobile dropdown items */}
                  <AnimatePresence>
                    {link.dropdown && activeDropdown === index && (
                      <motion.div
                        variants={dropdownVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="mt-2 pl-4 space-y-1 border-l border-slate-800"
                      >
                        {link.dropdown.map((item) => (
                          <motion.div
                            key={item.name}
                            variants={dropdownItemVariants}
                          >
                            <Link
                              href={item.href}
                              className="block py-2 text-sm text-gray-400 hover:text-teal-400"
                              onClick={() => setIsMobileMenuOpen(false)}
                            >
                              {item.name}
                            </Link>
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
              <motion.div 
                variants={mobileItemVariants}
                className="pt-4 flex space-x-2"
              >
                <button className="flex-1 bg-slate-800 hover:bg-slate-700 text-white px-4 py-3 rounded-lg font-medium flex items-center justify-center space-x-2">
                  <Search className="h-4 w-4" />
                  <span>Search</span>
                </button>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsWalletModalOpen(true);
                  }}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-teal-500 text-white px-4 py-3 rounded-lg font-medium flex items-center justify-center space-x-2"
                >
                  <Wallet className="h-4 w-4" />
                  <span>{isConnected ? 'Wallet' : 'Connect'}</span>
                </button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Wallet Modal */}
      <WalletModal 
        isOpen={isWalletModalOpen} 
        onClose={() => setIsWalletModalOpen(false)} 
      />
    </nav>
  );
};

export default Navbar;