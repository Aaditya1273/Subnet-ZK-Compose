import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import WalletProvider from '../src/components/WalletProvider';
import '../src/index.css';
import '../src/App.css';
import '@rainbow-me/rainbowkit/styles.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'FarmOracle - Africa\'s Autonomous AI Farming Oracle',
  description: 'Empowering African farmers with AI-driven insights and blockchain-backed transparency. Built for Africa Blockchain Festival 2025.',
  keywords: 'blockchain, AI, farming, agriculture, Africa, oracle, smart contracts, Web3',
  authors: [{ name: 'FarmOracle Team' }],
  openGraph: {
    title: 'FarmOracle - Africa\'s Autonomous AI Farming Oracle',
    description: 'Empowering African farmers with AI-driven insights and blockchain-backed transparency.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <WalletProvider>
          {children}
        </WalletProvider>
      </body>
    </html>
  );
}