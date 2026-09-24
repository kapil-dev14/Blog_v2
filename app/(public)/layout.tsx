import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Analytics } from "@vercel/analytics/next";

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Header />
      <Analytics />
      <main>{children}</main>
      <Footer />
    </>
  );
}>) {
  return (
    <>
      <Header />

      <main>{children}</main>

      <Footer />
    </>
  );
}
