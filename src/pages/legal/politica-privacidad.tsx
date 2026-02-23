import { PageTitle } from '@/components/PageTitle';
import MainLayout from '@/components/layout/MainLayout';
import { CenterContainer } from '@/components/layout/CenterContainer';

export default function PoliticaDePrivacidad() {
  return (
    <>
      <PageTitle title="Privacy Policy | Vado" />
      <MainLayout>
        <section className="bg-background py-12 md:py-16 lg:py-20">
          <CenterContainer>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Privacy Policy</h1>
            <div className="prose prose-neutral mt-8 max-w-none dark:prose-invert">
              {/* Add your Privacy Policy content here */}
            </div>
          </CenterContainer>
        </section>
      </MainLayout>
    </>
  );
}
