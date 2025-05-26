// components/Footer.jsx
'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Twitter, Github, ExternalLink } from 'lucide-react';

const Footer = () => {
  const footerLinks = [
    {
      title: 'Product',
      links: [
        { name: 'Features', href: '/features' },
        { name: 'Token Discovery', href: '/discovery' },
        { name: 'Trending Memes', href: '/trending' },
        { name: 'API Access', href: '/api' }
      ]
    },
    {
      title: 'Resources',
      links: [
        { name: 'Documentation', href: '/docs' },
        { name: 'API Export', href: '/api-export' },
        { name: 'Market Data', href: '/market-data' },
        { name: 'FAQ', href: '/faq' }
      ]
    },
    {
      title: 'Company',
      links: [
        { name: 'About', href: '/about' },
        { name: 'Blog', href: '/blog' },
        { name: 'Contact', href: '/contact' },
        { name: 'Careers', href: '/careers' }
      ]
    }
  ];

  return (
    <footer className="bg-slate-900 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="col-span-1 lg:col-span-2"
          >
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-teal-400 bg-clip-text text-transparent">
                OKX Launch
              </span>
              <span className="ml-1 text-sm text-teal-500 font-medium">Analytics</span>
            </Link>
            <p className="text-gray-400 mt-4 max-w-md">
              A comprehensive analytics platform for token launches on OKX Chain. 
              Discover new tokens, track meme coins, and make informed trading decisions.
            </p>
            <div className="flex space-x-4 mt-6">
              <motion.a 
                href="https://twitter.com" 
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1 }}
                className="bg-slate-800 p-2 rounded-full text-gray-400 hover:text-teal-400"
              >
                <Twitter size={18} />
              </motion.a>
              <motion.a 
                href="https://github.com" 
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1 }}
                className="bg-slate-800 p-2 rounded-full text-gray-400 hover:text-teal-400"
              >
                <Github size={18} />
              </motion.a>
              <motion.a 
                href="https://okx.com" 
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1 }}
                className="bg-slate-800 p-2 rounded-full text-gray-400 hover:text-teal-400"
              >
                <ExternalLink size={18} />
              </motion.a>
            </div>
          </motion.div>

          {/* Links */}
          {footerLinks.map((section, index) => (
            <motion.div 
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="col-span-1"
            >
              <h3 className="text-white font-semibold mb-4">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link 
                      href={link.href}
                      className="text-gray-400 hover:text-teal-400 transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
        
        <div className="border-t border-slate-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm">
              © {new Date().getFullYear()} OKX Token Launch Analytics. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="/privacy" className="text-gray-500 hover:text-teal-400 text-sm">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-gray-500 hover:text-teal-400 text-sm">
                Terms of Service
              </Link>
              <Link href="/cookies" className="text-gray-500 hover:text-teal-400 text-sm">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;