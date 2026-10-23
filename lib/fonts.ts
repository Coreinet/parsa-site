import { Familjen_Grotesk, JetBrains_Mono, Newsreader, Noto_Kufi_Arabic, Vazirmatn } from 'next/font/google';

// latin-ext covers Turkish (ğ, ş, ı, İ); the browser only downloads it on pages that use those letters.
export const display = Familjen_Grotesk({ subsets: ['latin', 'latin-ext'], variable: '--font-familjen', display: 'swap' });
export const prose = Newsreader({ subsets: ['latin', 'latin-ext'], variable: '--font-newsreader', style: ['normal', 'italic'], display: 'swap' });
export const mono = JetBrains_Mono({ subsets: ['latin', 'latin-ext'], variable: '--font-jetbrains', display: 'swap' });
/**
 * Persian script. Arabic subset only, so its unicode-range matches Persian letters alone and
 * Latin text keeps the fonts above. Not preloaded: English pages never download it.
 */
export const persian = Vazirmatn({ subsets: ['arabic'], variable: '--font-vazir', display: 'swap', preload: false });
/** Persian headings: geometric Kufi, to sit next to Familjen Grotesk. Same subset rule as above. */
export const persianDisplay = Noto_Kufi_Arabic({ subsets: ['arabic'], variable: '--font-kufi', display: 'swap', preload: false });

export const fontVariables = `${display.variable} ${prose.variable} ${mono.variable} ${persian.variable} ${persianDisplay.variable}`;
