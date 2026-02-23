import { Saira } from "next/font/google";
import "./globals.css";

const saira = Saira({
  variable: "--font-saira",
  subsets: ["latin"],
});

export const metadata = {
  title: "YWAM Housing Assessment",
  description: "YWAM San Jose Costa Rica housing assessment platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${saira.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
