import { Navbar } from './Navbar';
import { Footer } from './Footer';

type MainLayoutProps = {
  children: React.ReactNode;
};

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div>
      <Navbar />
      <main id="main-content" className="overflow-x-clip pt-20">
        {children}
      </main>
      <Footer />
    </div>
  );
}
