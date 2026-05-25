import Header from "../components/layouts/Header";
import Footer from "../components/layouts/Footer";
import CookieConsent from "../components/CookieConsent";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="min-h-screen">{children}</main>
      <Footer />
      <CookieConsent />
    </>
  );
}