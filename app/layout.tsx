import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./landing.css";
import { ConnectivityStatus } from "@/components/connectivity-status";
import { ThemeToggle } from "@/components/theme-toggle";

export const metadata: Metadata = {
  metadataBase: new URL("https://pharmalens.example"),
  title: { default: "PharmaLens — Scan the pack. Spot the signs.", template: "%s | PharmaLens" },
  description: "Preliminary visual screening for pharmaceutical packaging marketed in Nigeria.",
  applicationName: "PharmaLens",
  manifest: "/manifest.webmanifest",
  icons: { icon: "/icon.svg", apple: "/icon.svg" },
  openGraph: { title: "PharmaLens", description: "Scan the pack. Spot the signs.", type: "website", images: ["/social-card.svg"] },
  twitter: { card: "summary_large_image", title: "PharmaLens", description: "Preliminary visual screening for pharmaceutical packaging." },
};

export const viewport: Viewport = { themeColor: "#063F3C", width: "device-width", initialScale: 1, viewportFit: "cover" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" suppressHydrationWarning><head><script dangerouslySetInnerHTML={{__html:`(()=>{try{const saved=localStorage.getItem('pharmalens-theme');const theme=saved==='dark'||saved==='light'?saved:(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');document.documentElement.dataset.theme=theme;document.documentElement.style.colorScheme=theme}catch{document.documentElement.dataset.theme='light'}})()`}}/></head><body><ConnectivityStatus/><ThemeToggle/>{children}<script dangerouslySetInnerHTML={{ __html: `if('serviceWorker' in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('/sw.js',{updateViaCache:'none'}).catch(()=>{}))}` }} /></body></html>;
}
