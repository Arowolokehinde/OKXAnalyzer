// app/layout.jsx
import './globals.css';
import { Inter } from 'next/font/google';
import { WalletProviderWrapper } from '@/context/WalletContext';
import AnimatedBackground from '../component/animations/AnimatedBackground';
import Navbar from '../component/layout/Navbar';
import ToasterProvider from '../providers/ToasterProvider';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap' 
});

export const metadata = {
  title: 'OKX Token Launch Analytics Dashboard',
  description: 'Track new token launches, analyze meme coins, and discover early opportunities with real-time market data and trends.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable}`}>
      <body className="antialiased">
        <ToasterProvider />
        <WalletProviderWrapper>
          <AnimatedBackground variant="mixed" />
          <Navbar />
          <main className="relative z-10">
            {children}
          </main>
        </WalletProviderWrapper>
      </body>
    </html>
  );
}