import { Navbar } from './Navbar';
import { Footer } from './Footer';

type MainLayoutProps = {
  children: React.ReactNode;
};

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div>
      <Navbar />
      <div className="overflow-x-clip">{children}</div>
      <Footer />
    </div>
  );
}
