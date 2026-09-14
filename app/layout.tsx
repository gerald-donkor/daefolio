import type { Metadata } from 'next';
import './globals.css';
import './portfolio.css';
import './design-system.css';
import './themes.css';
import { ThemeProvider } from '@/components/theme-provider';
import { themeScript } from '@/lib/theme-script';
import { DisplayPreferences } from '@/components/display-preferences';
import { MotionProvider } from '@/components/motion-provider';
import localFont from 'next/font/local';
const manrope=localFont({src:'../node_modules/@fontsource-variable/manrope/files/manrope-latin-wght-normal.woff2',variable:'--font-manrope',display:'swap'});
const mono=localFont({src:'../node_modules/@fontsource-variable/geist-mono/files/geist-mono-latin-wght-normal.woff2',variable:'--font-geist-mono',display:'swap'});
const serif=localFont({src:[{path:'../node_modules/@fontsource/cormorant-garamond/files/cormorant-garamond-latin-400-normal.woff2',weight:'400',style:'normal'},{path:'../node_modules/@fontsource/cormorant-garamond/files/cormorant-garamond-latin-400-italic.woff2',weight:'400',style:'italic'}],variable:'--font-editorial',display:'swap'});
export const metadata: Metadata = { title: 'Gerald Donkor — Design Engineer', description: 'Thoughtful interfaces. Expressive motion. Precise engineering. Explore selected projects by Gerald Donkor, a design engineer based in Ghana.', icons: { icon: '/favicon.svg' } };
export default function RootLayout({children}: Readonly<{children:React.ReactNode}>) { return <html lang="en" suppressHydrationWarning className={`${manrope.variable} ${mono.variable} ${serif.variable}`}><body><script dangerouslySetInnerHTML={{ __html: themeScript }} /><ThemeProvider><MotionProvider>{children}<DisplayPreferences /></MotionProvider></ThemeProvider></body></html> }
