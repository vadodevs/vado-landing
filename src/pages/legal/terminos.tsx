import { PageTitle } from '@/components/PageTitle';
import MainLayout from '@/components/layout/MainLayout';
import { CenterContainer } from '@/components/layout/CenterContainer';

export default function TerminosDelServicio() {
  return (
    <>
      <PageTitle title="Terms of Service | Vado" />
      <MainLayout>
        <section className="bg-background py-12 md:py-16 lg:py-20">
          <CenterContainer>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Terms of Service</h1>
            <div className="prose prose-neutral mt-8 max-w-none dark:prose-invert">
              {/* Add your Terms of Service content here */}
            </div>
          </CenterContainer>
        </section>
      </MainLayout>
    </>
  );
}
