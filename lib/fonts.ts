import { Familjen_Grotesk, JetBrains_Mono, Newsreader } from 'next/font/google';
import localFont from 'next/font/local';

// latin-ext covers Turkish (ğ, ş, ı, İ); the browser only downloads it on pages that use those letters.
export const display = Familjen_Grotesk({ subsets: ['latin', 'latin-ext'], variable: '--font-familjen', display: 'swap' });
export const prose = Newsreader({ subsets: ['latin', 'latin-ext'], variable: '--font-newsreader', style: ['normal', 'italic'], display: 'swap' });
export const mono = JetBrains_Mono({ subsets: ['latin', 'latin-ext'], variable: '--font-jetbrains', display: 'swap' });
/**
 * Persian: IRANYekanX (licensed, files in app/font). The FaNum cut draws 0–9 as Persian digits.
 * Only the Persian pages use it (see globals.css), so it is not preloaded and English and
 * Turkish pages never download it.
 */
export const persian = localFont({
  src: [
    { path: '../app/font/IRANYekanXFaNum-Regular.woff2', weight: '400', style: 'normal' },
    { path: '../app/font/IRANYekanXFaNum-Medium.woff2', weight: '500', style: 'normal' },
    { path: '../app/font/IRANYekanXFaNum-Bold.woff2', weight: '600 900', style: 'normal' }
  ],
  variable: '--font-yekan',
  display: 'swap',
  preload: false
});

export const fontVariables = `${display.variable} ${prose.variable} ${mono.variable} ${persian.variable}`;
