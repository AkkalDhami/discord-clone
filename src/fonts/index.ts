import {
  Inter,
  Roboto,
  Roboto_Mono,
  Fira_Sans,
  Fira_Mono,
  Fira_Code,
  Source_Code_Pro
} from "next/font/google";

export const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
export const roboto = Roboto({
  weight: ["400", "500", "700"],
  variable: "--font-roboto",
  subsets: ["latin"]
});
export const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"]
});
export const firaSans = Fira_Sans({
  variable: "--font-fira-sans",
  subsets: ["latin"],
  weight: ["400", "500", "700"]
});
export const firaMono = Fira_Mono({
  variable: "--font-fira-mono",
  subsets: ["latin"],
  weight: ["400", "500", "700"]
});
export const firaCode = Fira_Code({
  variable: "--font-fira-code",
  subsets: ["latin"],
  weight: ["400", "500", "700"]
});

export const sourceCodePro = Source_Code_Pro({
  variable: "--font-source-code",
  subsets: ["latin"]
});
