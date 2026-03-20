import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'sonner';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    template: '%s | HairVision 3D',
    default: 'HairVision 3D - Revolutionary Hair Styling Platform',
  },
  description: 'Transform your hair styling experience with AI-powered 3D visualization and real-time collaboration with stylists.',
  keywords: [
    '3D hair modeling',
    'AI hairstyling',
    'virtual hair try-on',
    'beauty salon booking',
    'hair simulation',
  ],
  authors: [{ name: 'HairVision Team' }],
  creator: 'HairVision 3D',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://hairvision3d.com',
    siteName: 'HairVision 3D',
    title: 'HairVision 3D - Revolutionary Hair Styling Platform',
    description: 'Transform your hair styling experience with AI-powered 3D visualization and real-time collaboration with stylists.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'HairVision 3D Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HairVision 3D - Revolutionary Hair Styling Platform',
    description: 'Transform your hair styling experience with AI-powered 3D visualization.',
    images: ['/twitter-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-site-verification',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <div id="root">
          {children}
        </div>
        <Toaster 
          position="top-right" 
          expand={false}
          richColors
          closeButton
        />
      </body>
    </html>
  );
}