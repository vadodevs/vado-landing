import { PageMeta } from '@/components/PageMeta';
import MainLayout from '@/components/layout/MainLayout';
import { CenterContainer } from '@/components/layout/CenterContainer';
import { useLocale } from '@/hooks/useLocale';

const PRIVACY_POLICY_TITLE = 'Privacy Policy';
const PRIVACY_POLICY_DESCRIPTION =
  'Privacy Notice for Vado Devs LLC: how we access, collect, store, use, and share your personal information when you use our services.';

const TOC_ITEMS = [
  { id: 'infocollect', label: '1. What information do we collect?' },
  { id: 'infouse', label: '2. How do we process your information?' },
  {
    id: 'legalbases',
    label: '3. What legal bases do we rely on to process your personal information?',
  },
  { id: 'whoshare', label: '4. When and with whom do we share your personal information?' },
  { id: 'cookies', label: '5. Do we use cookies and other tracking technologies?' },
  { id: 'inforetain', label: '6. How long do we keep your information?' },
  { id: 'infosafe', label: '7. How do we keep your information safe?' },
  { id: 'infominors', label: '8. Do we collect information from minors?' },
  { id: 'privacyrights', label: '9. What are your privacy rights?' },
  { id: 'DNT', label: '10. Controls for Do-Not-Track features' },
  {
    id: 'uslaws',
    label: '11. Do United States residents have specific privacy rights?',
  },
  { id: 'policyupdates', label: '12. Do we make updates to this notice?' },
  { id: 'contact', label: '13. How can you contact us about this notice?' },
  {
    id: 'request',
    label: '14. How can you review, update, or delete the data we collect from you?',
  },
];

export default function PoliticaDePrivacidad() {
  const { path } = useLocale();
  const canonicalPath = path('/politica-privacidad');

  return (
    <>
      <PageMeta
        title={`${PRIVACY_POLICY_TITLE} | Vado`}
        description={PRIVACY_POLICY_DESCRIPTION}
        canonicalPath={canonicalPath}
      />
      <MainLayout>
        <main
          id="main-content"
          className="bg-background py-12 md:py-16 lg:py-20"
          aria-label={PRIVACY_POLICY_TITLE}
        >
          <CenterContainer>
            <article
              className="flex flex-col gap-10"
              itemScope
              itemType="https://schema.org/WebPage"
            >
              <header className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold uppercase">{PRIVACY_POLICY_TITLE}</h1>
                <p className="text-muted-foreground font-semibold">
                  Last updated <time dateTime="2024-10-25">October 25, 2024</time>
                </p>
              </header>
              <section className="flex flex-col gap-8" aria-labelledby="intro">
                <h2 id="intro" className="sr-only">
                  Introduction
                </h2>
                <p>
                  This Privacy Notice for Vado Devs LLC (doing business as{' '}
                  <a href="mailto:privacy@vadodevs.com" className="text-primary">
                    privacy@vadodevs.com
                  </a>
                  ) (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;), describes how and why we
                  might access, collect, store, use, and/or share (&quot;process&quot;) your
                  personal information when you use our services (&quot;Services&quot;), including
                  when you:
                </p>
                <ul className="list-disc space-y-2 pl-6">
                  <li>
                    Visit our website at{' '}
                    <a href="https://www.vadodevs.com" className="text-primary">
                      https://www.vadodevs.com
                    </a>
                    , or any website of ours that links to this Privacy Notice
                  </li>
                  <li>
                    Engage with us in other related ways, including any sales, marketing, or events
                  </li>
                </ul>
              </section>
              <section className="flex flex-col gap-8" aria-labelledby="questions">
                <h2 id="questions" className="text-xl font-bold">
                  Questions or concerns?
                </h2>
                <p>
                  Reading this Privacy Notice will help you understand your privacy rights and
                  choices. We are responsible for making decisions about how your personal
                  information is processed. If you do not agree with our policies and practices,
                  please do not use our Services. If you still have any questions or concerns,
                  please contact us at{' '}
                  <a href="mailto:privacy@vadodevs.com" className="text-primary">
                    privacy@vadodevs.com
                  </a>
                  .
                </p>
              </section>
              <section className="flex flex-col gap-6" aria-labelledby="summary-key-points">
                <h2 id="summary-key-points" className="text-xl font-bold uppercase">
                  Summary of key points
                </h2>
                <p className="font-semibold italic">
                  This summary provides key points from our Privacy Notice, but you can find out
                  more details about any of these topics by clicking the link following each key
                  point or by using our{' '}
                  <a data-custom-class="link" href="#toc" className="text-primary">
                    table of contents
                  </a>{' '}
                  below to find the section you are looking for.
                </p>
                <div className="flex flex-col gap-4">
                  <p>
                    <span className="font-semibold">What personal information do we process?</span>{' '}
                    When you visit, use, or navigate our Services, we may process personal
                    information depending on how you interact with us and the Services, the choices
                    you make, and the products and features you use. Learn more about{' '}
                    <a data-custom-class="link" href="#personalinfo" className="text-primary">
                      personal information you disclose to us
                    </a>
                    .
                  </p>
                  <p>
                    <span className="font-semibold">
                      Do we process any sensitive personal information?
                    </span>{' '}
                    Some of the information may be considered &quot;special&quot; or
                    &quot;sensitive&quot; in certain jurisdictions, for example your racial or
                    ethnic origins, sexual orientation, and religious beliefs. We do not process
                    sensitive personal information.
                  </p>
                  <p>
                    <span className="font-semibold">
                      Do we collect any information from third parties?
                    </span>{' '}
                    We may collect information from public databases, marketing partners, social
                    media platforms, and other outside sources. Learn more about{' '}
                    <a href="#othersources" className="text-primary">
                      information collected from other sources
                    </a>
                    .
                  </p>
                  <p>
                    <span className="font-semibold">How do we process your information?</span> We
                    process your information to provide, improve, and administer our Services,
                    communicate with you, for security and fraud prevention, and to comply with law.
                    We may also process your information for other purposes with your consent. We
                    process your information only when we have a valid legal reason to do so. Learn
                    more about{' '}
                    <a href="#infouse" className="text-primary">
                      how we process your information
                    </a>
                    .
                  </p>
                  <p>
                    <span className="font-semibold">
                      In what situations and with which parties do we share personal information?
                    </span>{' '}
                    We may share information in specific situations and with specific third parties.
                    Learn more about{' '}
                    <a href="#whoshare" className="text-primary">
                      when and with whom we share your personal information
                    </a>
                    .
                  </p>

                  <p>
                    <span className="font-semibold">How do we keep your information safe?</span> We
                    have adequate organizational and technical processes and procedures in place to
                    protect your personal information. However, no electronic transmission over the
                    internet or information storage technology can be guaranteed to be 100% secure,
                    so we cannot promise or guarantee that hackers, cybercriminals, or other
                    unauthorized third parties will not be able to defeat our security and
                    improperly collect, access, steal, or modify your information. Learn more about{' '}
                    <a href="#infosafe" className="text-primary">
                      how we keep your information safe
                    </a>
                    .
                  </p>

                  <p>
                    <span className="font-semibold">How do you exercise your rights?</span>The
                    easiest way to exercise your rights is by submitting a{' '}
                    <a
                      href="https://app.termly.io/dsar/d5e98040-a54b-44be-8e9d-73f7b5dfae88"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary"
                    >
                      data subject access request
                    </a>
                    , or by contacting us. We will consider and act upon any request in accordance
                    with applicable data protection laws.
                  </p>

                  <p>
                    Want to learn more about what we do with any information we collect?{' '}
                    <a href="#toc" className="text-primary">
                      Review the Privacy Notice in full.
                    </a>
                  </p>
                </div>
              </section>
              <section className="flex flex-col gap-4" aria-labelledby="toc">
                <h2 id="toc" className="text-xl font-bold uppercase">
                  Table of contents
                </h2>
                <ol className="space-y-1 text-primary text-sm md:text-base">
                  {TOC_ITEMS.map((item) => (
                    <li key={item.id}>
                      <a
                        href={`#${item.id}`}
                        className="hover:underline font-semibold uppercase tracking-tight"
                      >
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ol>
              </section>
            </article>
          </CenterContainer>
        </main>
      </MainLayout>
    </>
  );
}
