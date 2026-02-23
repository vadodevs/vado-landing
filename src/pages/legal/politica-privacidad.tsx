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
                <ol className="text-primary space-y-1 text-sm md:text-base">
                  {TOC_ITEMS.map((item) => (
                    <li key={item.id}>
                      <a
                        href={`#${item.id}`}
                        className="font-semibold tracking-tight uppercase hover:underline"
                      >
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ol>
              </section>

              <section className="flex flex-col gap-8" aria-labelledby="infocollect">
                <h2 id="infocollect" className="text-xl font-bold uppercase">
                  1. What information do we collect?
                </h2>

                <div className="flex flex-col gap-6">
                  <h3 id="personalinfo" className="text-lg font-bold">
                    Personal information you disclose to us
                  </h3>
                  <p>
                    <strong className="font-semibold">In Short:</strong> We collect personal
                    information that you provide to us.
                  </p>
                  <p>
                    We collect personal information that you voluntarily provide to us when you
                    register on the Services, express an interest in obtaining information about us
                    or our products and Services, when you participate in activities on the
                    Services, or otherwise when you contact us.
                  </p>
                  <p>
                    <strong className="font-semibold">Personal Information Provided by You.</strong>{' '}
                    The personal information that we collect depends on the context of your
                    interactions with us and the Services, the choices you make, and the products
                    and features you use. The personal information we collect may include the
                    following:
                  </p>
                  <ul className="list-disc space-y-1 pl-6">
                    <li>names</li>
                    <li>phone numbers</li>
                    <li>email addresses</li>
                    <li>job titles</li>
                    <li>usernames</li>
                    <li>passwords</li>
                  </ul>
                  <p>
                    <strong className="font-semibold">Sensitive Information.</strong> We do not
                    process sensitive information.
                  </p>
                  <p>
                    All personal information that you provide to us must be true, complete, and
                    accurate, and you must notify us of any changes to such personal information.
                  </p>
                </div>

                <div className="flex flex-col gap-6">
                  <h3 className="text-lg font-bold">Information automatically collected</h3>
                  <p>
                    <strong className="font-semibold">In Short:</strong> Some information — such as
                    your Internet Protocol (IP) address and/or browser and device characteristics —
                    is collected automatically when you visit our Services.
                  </p>
                  <p>
                    We automatically collect certain information when you visit, use, or navigate
                    the Services. This information does not reveal your specific identity (like your
                    name or contact information) but may include device and usage information, such
                    as your IP address, browser and device characteristics, operating system,
                    language preferences, referring URLs, device name, country, location,
                    information about how and when you use our Services, and other technical
                    information. This information is primarily needed to maintain the security and
                    operation of our Services, and for our internal analytics and reporting
                    purposes.
                  </p>
                  <p>
                    Like many businesses, we also collect information through cookies and similar
                    technologies.
                  </p>
                  <p className="font-semibold">The information we collect includes:</p>
                  <ul className="list-disc space-y-3 pl-6">
                    <li>
                      <strong className="font-semibold">Log and Usage Data.</strong> Log and usage
                      data is service-related, diagnostic, usage, and performance information our
                      servers automatically collect when you access or use our Services and which we
                      record in log files. Depending on how you interact with us, this log data may
                      include your IP address, device information, browser type, and settings and
                      information about your activity in the Services (such as the date/time stamps
                      associated with your usage, pages and files viewed, searches, and other
                      actions you take such as which features you use), device event information
                      (such as system activity, error reports (sometimes called &quot;crash
                      dumps&quot;), and hardware settings).
                    </li>
                    <li>
                      <strong className="font-semibold">Device Data.</strong> We collect device data
                      such as information about your computer, phone, tablet, or other device you
                      use to access the Services. Depending on the device used, this device data may
                      include information such as your IP address (or proxy server), device and
                      application identification numbers, location, browser type, hardware model,
                      Internet service provider and/or mobile carrier, operating system, and system
                      configuration information.
                    </li>
                    <li>
                      <strong className="font-semibold">Location Data.</strong> We collect location
                      data such as information about your device&apos;s location, which can be
                      either precise or imprecise. How much information we collect depends on the
                      type and settings of the device you use to access the Services. For example,
                      we may use GPS and other technologies to collect geolocation data that tells
                      us your current location (based on your IP address). You can opt out of
                      allowing us to collect this information either by refusing access to the
                      information or by disabling your Location setting on your device. However, if
                      you choose to opt out, you may not be able to use certain aspects of the
                      Services.
                    </li>
                  </ul>
                </div>

                <div className="flex flex-col gap-6" id="othersources">
                  <h3 className="text-lg font-bold">Information collected from other sources</h3>
                  <p>
                    <strong className="font-semibold">In Short:</strong> We may collect limited data
                    from public databases, marketing partners, and other outside sources.
                  </p>
                  <p>
                    In order to enhance our ability to provide relevant marketing, offers, and
                    services to you and update our records, we may obtain information about you from
                    other sources, such as public databases, joint marketing partners, affiliate
                    programs, data providers, and from other third parties. This information
                    includes mailing addresses, job titles, email addresses, phone numbers, intent
                    data (or user behavior data), Internet Protocol (IP) addresses, social media
                    profiles, social media URLs, and custom profiles, for purposes of targeted
                    advertising and event promotion.
                  </p>
                </div>
              </section>
              <section className="flex flex-col gap-6" aria-labelledby="infouse">
                <h2 id="infouse" className="text-xl font-bold uppercase">
                  2. How do we process your information?
                </h2>
                <p>
                  <span className="font-semibold">In Short:</span> We process your information to
                  provide, improve, and administer our Services, communicate with you, for security
                  and fraud prevention, and to comply with law. We may also process your information
                  for other purposes with your consent.
                </p>
                <p>
                  We process your personal information for a variety of reasons, depending on how
                  you interact with our Services, including:
                </p>
                <ul className="list-disc space-y-3 pl-6">
                  <li>
                    <span className="font-semibold">
                      To facilitate account creation and authentication and otherwise manage user
                      accounts.
                    </span>{' '}
                    We may process your information so you can create and log in to your account, as
                    well as keep your account in working order.
                  </li>
                  <li>
                    <span className="font-semibold">
                      To send you marketing and promotional communications.
                    </span>{' '}
                    We may process the personal information you send to us for our marketing
                    purposes, if this is in accordance with your marketing preferences. You can opt
                    out of our marketing emails at any time. For more information, see "
                    <a href="#privacyrights" className="text-primary">
                      What are your privacy rights?
                    </a>
                    " below.
                  </li>
                  <li>
                    <span className="font-semibold">To deliver targeted advertising to you.</span>{' '}
                    We may process your information to develop and display personalized content and
                    advertising tailored to your interests, location, and more.
                  </li>
                </ul>
              </section>

              <section className="flex flex-col gap-6" aria-labelledby="legalbases">
                <h2 id="legalbases" className="text-xl font-bold uppercase">
                  3. What legal bases do we rely on to process your information?
                </h2>
                <p>
                  <span className="font-semibold">In Short:</span> We only process your personal
                  information when we believe it is necessary and we have a valid legal reason
                  (i.e., legal basis) to do so under applicable law, like with your consent, to
                  comply with laws, to provide you with services to enter into or fulfill our
                  contractual obligations, to protect your rights, or to fulfill our legitimate
                  business interests.
                </p>
                <p className="font-semibold underline">
                  If you are located in Canada, this section applies to you.
                </p>
                <p>
                  We may process your information if you have given us specific permission (i.e.,
                  express consent) to use your personal information for a specific purpose, or in
                  situations where your permission can be inferred (i.e., implied consent). You can{' '}
                  <a href="#withdrawconsent" className="text-primary hover:underline">
                    withdraw your consent
                  </a>{' '}
                  at any time.
                </p>
                <p>
                  In some exceptional cases, we may be legally permitted under applicable law to
                  process your information without your consent, including, for example:
                </p>
                <ul className="list-disc space-y-2 pl-6">
                  <li>
                    If collection is clearly in the interests of an individual and consent cannot be
                    obtained in a timely way
                  </li>
                  <li>For investigations and fraud detection and prevention</li>
                  <li>For business transactions provided certain conditions are met</li>
                  <li>
                    If it is contained in a witness statement and the collection is necessary to
                    assess, process, or settle an insurance claim
                  </li>
                  <li>
                    For identifying injured, ill, or deceased persons and communicating with next of
                    kin
                  </li>
                  <li>
                    If we have reasonable grounds to believe an individual has been, is, or may be
                    victim of financial abuse
                  </li>
                  <li>
                    If it is reasonable to expect collection and use with consent would compromise
                    the availability or the accuracy of the information and the collection is
                    reasonable for purposes related to investigating a breach of an agreement or a
                    contravention of the laws of Canada or a province
                  </li>
                  <li>
                    If disclosure is required to comply with a subpoena, warrant, court order, or
                    rules of the court relating to the production of records
                  </li>
                  <li>
                    If it was produced by an individual in the course of their employment, business,
                    or profession and the collection is consistent with the purposes for which the
                    information was produced
                  </li>
                  <li>
                    If the collection is solely for journalistic, artistic, or literary purposes
                  </li>
                  <li>
                    If the information is publicly available and is specified by the regulations
                  </li>
                </ul>
              </section>

              <section className="flex flex-col gap-6" aria-labelledby="whoshare">
                <h2 id="whoshare" className="text-xl font-bold uppercase">
                  4. When and with whom do we share your personal information?
                </h2>
                <p>
                  <span className="font-semibold">In Short:</span> We may share information in
                  specific situations described in this section and/or with the following third
                  parties.
                </p>
                <p>We may need to share your personal information in the following situations:</p>
                <p>
                  <strong className="font-semibold">Business Transfers.</strong> We may share or
                  transfer your information in connection with, or during negotiations of, any
                  merger, sale of company assets, financing, or acquisition of all or a portion of
                  our business to another company.
                </p>
              </section>

              <section className="flex flex-col gap-6" aria-labelledby="cookies">
                <h2 id="cookies" className="text-xl font-bold uppercase">
                  5. Do we use cookies and other tracking technologies?
                </h2>
                <p>
                  <span className="font-semibold">In Short:</span> We may use cookies and other
                  tracking technologies to collect and store your information.
                </p>
                <p>
                  We may use cookies and similar tracking technologies (like web beacons and pixels)
                  to gather information when you interact with our Services. Some online tracking
                  technologies help us maintain the security of our Services and your account,
                  prevent crashes, fix bugs, save your preferences, and assist with basic site
                  functions.
                </p>
                <p>
                  We also permit third parties and service providers to use online tracking
                  technologies on our Services for analytics and advertising, including to help
                  manage and display advertisements, to tailor advertisements to your interests, or
                  to send abandoned shopping cart reminders (depending on your communication
                  preferences). The third parties and service providers use their technology to
                  provide advertising about products and services tailored to your interests which
                  may appear either on our Services or on other websites.
                </p>
                <p>
                  To the extent these online tracking technologies are deemed to be a
                  &quot;sale&quot;/&quot;sharing&quot; (which includes targeted advertising, as
                  defined under the applicable laws) under applicable US state laws, you can opt out
                  of these online tracking technologies by submitting a request as described below
                  under section{' '}
                  <a href="#uslaws" className="text-primary hover:underline">
                    &quot;Do United States residents have specific privacy rights?&quot;
                  </a>
                </p>
                <p>
                  Specific information about how we use such technologies and how you can refuse
                  certain cookies is set out in our{' '}
                  <a href={path('/cookies')} className="text-primary hover:underline">
                    Cookie Notice
                  </a>
                  .
                </p>
                <h3 className="text-lg font-bold">Google Analytics</h3>
                <p>
                  We may share your information with Google Analytics to track and analyze the use
                  of the Services. The Google Analytics Advertising Features that we may use
                  include: Remarketing with Google Analytics, Google Display Network Impressions
                  Reporting and Google Analytics Demographics and Interests Reporting. To opt out of
                  being tracked by Google Analytics across the Services, visit{' '}
                  <a
                    href="https://tools.google.com/dlpage/gaoptout"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    https://tools.google.com/dlpage/gaoptout
                  </a>
                  . You can opt out of Google Analytics Advertising Features through Ads Settings
                  and Ad Settings for mobile apps. Other opt out means include{' '}
                  <a
                    href="https://optout.networkadvertising.org/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    http://optout.networkadvertising.org/
                  </a>{' '}
                  and{' '}
                  <a
                    href="https://www.networkadvertising.org/mobile-choice"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    http://www.networkadvertising.org/mobile-choice
                  </a>
                  . For more information on the privacy practices of Google, please visit the{' '}
                  <a
                    href="https://policies.google.com/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Google Privacy &amp; Terms
                  </a>{' '}
                  page.
                </p>
              </section>

              <section className="flex flex-col gap-6" aria-labelledby="inforetain">
                <h2 id="inforetain" className="text-xl font-bold uppercase">
                  6. How long do we keep your information?
                </h2>
                <p>
                  <span className="font-semibold">In Short:</span> We keep your information for as
                  long as necessary to fulfill the purposes outlined in this Privacy Notice unless
                  otherwise required by law.
                </p>
                <p>
                  We will only keep your personal information for as long as it is necessary for the
                  purposes set out in this Privacy Notice, unless a longer retention period is
                  required or permitted by law (such as tax, accounting, or other legal
                  requirements). No purpose in this notice will require us keeping your personal
                  information for longer than the period of time in which users have an account with
                  us.
                </p>
                <p>
                  When we have no ongoing legitimate business need to process your personal
                  information, we will either delete or anonymize such information, or, if this is
                  not possible (for example, because your personal information has been stored in
                  backup archives), then we will securely store your personal information and
                  isolate it from any further processing until deletion is possible.
                </p>
              </section>

              <section className="flex flex-col gap-6" aria-labelledby="infosafe">
                <h2 id="infosafe" className="text-xl font-bold uppercase">
                  7. How do we keep your information safe?
                </h2>
                <p>
                  <span className="font-semibold">In Short:</span> We aim to protect your personal
                  information through a system of organizational and technical security measures.
                </p>
                <p>
                  We have implemented appropriate and reasonable technical and organizational
                  security measures designed to protect the security of any personal information we
                  process. However, despite our safeguards and efforts to secure your information,
                  no electronic transmission over the Internet or information storage technology can
                  be guaranteed to be 100% secure, so we cannot promise or guarantee that hackers,
                  cybercriminals, or other unauthorized third parties will not be able to defeat our
                  security and improperly collect, access, steal, or modify your information.
                  Although we will do our best to protect your personal information, transmission of
                  personal information to and from our Services is at your own risk. You should only
                  access the Services within a secure environment.
                </p>
              </section>

              <section className="flex flex-col gap-6" aria-labelledby="infominors">
                <h2 id="infominors" className="text-xl font-bold uppercase">
                  8. Do we collect information from minors?
                </h2>
                <p>
                  <span className="font-semibold">In Short:</span> We do not knowingly collect data
                  from or market to children under 18 years of age.
                </p>
                <p>
                  We do not knowingly collect, solicit data from, or market to children under 18
                  years of age, nor do we knowingly sell such personal information. By using the
                  Services, you represent that you are at least 18 or that you are the parent or
                  guardian of such a minor and consent to such minor dependent&apos;s use of the
                  Services. If we learn that personal information from users less than 18 years of
                  age has been collected, we will deactivate the account and take reasonable
                  measures to promptly delete such data from our records. If you become aware of any
                  data we may have collected from children under age 18, please contact us at{' '}
                  <a href="mailto:privacy@vadodevs.com" className="text-primary hover:underline">
                    privacy@vadodevs.com
                  </a>
                  .
                </p>
              </section>

              <section className="flex flex-col gap-6" aria-labelledby="privacyrights">
                <h2 id="privacyrights" className="text-xl font-bold uppercase">
                  9. What are your privacy rights?
                </h2>
                <p>
                  <span className="font-semibold">In Short:</span> Depending on your state of
                  residence in the US or in some regions, such as Canada, you have rights that allow
                  you greater access to and control over your personal information. You may review,
                  change, or terminate your account at any time, depending on your country,
                  province, or state of residence.
                </p>
                <p>
                  In some regions (like Canada), you have certain rights under applicable data
                  protection laws. These may include the right (i) to request access and obtain a
                  copy of your personal information, (ii) to request rectification or erasure; (iii)
                  to restrict the processing of your personal information; (iv) if applicable, to
                  data portability; and (v) not to be subject to automated decision-making. In
                  certain circumstances, you may also have the right to object to the processing of
                  your personal information. You can make such a request by contacting us by using
                  the contact details provided in the section{' '}
                  <a href="#contact" className="text-primary hover:underline">
                    &quot;How can you contact us about this notice?&quot;
                  </a>{' '}
                  below.
                </p>
                <p>
                  We will consider and act upon any request in accordance with applicable data
                  protection laws.
                </p>
                <p id="withdrawconsent">
                  <strong className="font-semibold">Withdrawing your consent:</strong> If we are
                  relying on your consent to process your personal information, which may be express
                  and/or implied consent depending on the applicable law, you have the right to
                  withdraw your consent at any time. You can withdraw your consent at any time by
                  contacting us by using the contact details provided in the section{' '}
                  <a href="#contact" className="text-primary hover:underline">
                    &quot;How can you contact us about this notice?&quot;
                  </a>{' '}
                  below.
                </p>
                <p>
                  However, please note that this will not affect the lawfulness of the processing
                  before its withdrawal nor, when applicable law allows, will it affect the
                  processing of your personal information conducted in reliance on lawful processing
                  grounds other than consent.
                </p>
                <p>
                  <strong className="font-semibold">
                    Opting out of marketing and promotional communications:
                  </strong>{' '}
                  You can unsubscribe from our marketing and promotional communications at any time
                  by clicking on the unsubscribe link in the emails that we send, replying
                  &quot;STOP&quot; or &quot;UNSUBSCRIBE&quot; to the SMS messages that we send, or
                  by contacting us using the details provided in the section{' '}
                  <a href="#contact" className="text-primary hover:underline">
                    &quot;How can you contact us about this notice?&quot;
                  </a>{' '}
                  below. You will then be removed from the marketing lists. However, we may still
                  communicate with you — for example, to send you service-related messages that are
                  necessary for the administration and use of your account, to respond to service
                  requests, or for other non-marketing purposes.
                </p>
                <h3 className="text-lg font-bold">Account Information</h3>
                <p>
                  If you would at any time like to review or change the information in your account
                  or terminate your account, you can:
                </p>
                <ul className="list-disc space-y-2 pl-6">
                  <li>Log in to your account settings and update your user account.</li>
                  <li>
                    Upon your request to terminate your account, we will deactivate or delete your
                    account and information from our active databases. However, we may retain some
                    information in our files to prevent fraud, troubleshoot problems, assist with
                    any investigations, enforce our legal terms and/or comply with applicable legal
                    requirements.
                  </li>
                </ul>
                <p>
                  <strong className="font-semibold">Cookies and similar technologies:</strong> Most
                  Web browsers are set to accept cookies by default. If you prefer, you can usually
                  choose to set your browser to remove cookies and to reject cookies. If you choose
                  to remove cookies or reject cookies, this could affect certain features or
                  services of our Services.
                </p>
                <p>
                  If you have questions or comments about your privacy rights, you may email us at{' '}
                  <a href="mailto:privacy@vadodevs.com" className="text-primary hover:underline">
                    privacy@vadodevs.com
                  </a>
                  .
                </p>
              </section>

              <section className="flex flex-col gap-6" aria-labelledby="DNT">
                <h2 id="DNT" className="text-xl font-bold uppercase">
                  10. Controls for Do-Not-Track features
                </h2>
                <p>
                  Most web browsers and some mobile operating systems and mobile applications
                  include a Do-Not-Track (&quot;DNT&quot;) feature or setting you can activate to
                  signal your privacy preference not to have data about your online browsing
                  activities monitored and collected. At this stage, no uniform technology standard
                  for recognizing and implementing DNT signals has been finalized. As such, we do
                  not currently respond to DNT browser signals or any other mechanism that
                  automatically communicates your choice not to be tracked online. If a standard for
                  online tracking is adopted that we must follow in the future, we will inform you
                  about that practice in a revised version of this Privacy Notice.
                </p>
                <p>
                  California law requires us to let you know how we respond to web browser DNT
                  signals. Because there currently is not an industry or legal standard for
                  recognizing or honoring DNT signals, we do not respond to them at this time.
                </p>
              </section>

              <section className="flex flex-col gap-6" aria-labelledby="uslaws">
                <h2 id="uslaws" className="text-xl font-bold uppercase">
                  11. Do United States residents have specific privacy rights?
                </h2>
                <p>
                  <span className="font-semibold">In Short:</span> If you are a resident of
                  California, Colorado, Connecticut, Delaware, Florida, Indiana, Iowa, Kentucky,
                  Minnesota, Montana, Nebraska, New Hampshire, New Jersey, Oregon, Tennessee, Texas,
                  Utah, or Virginia, you may have the right to request access to and receive details
                  about the personal information we maintain about you and how we have processed it,
                  correct inaccuracies, get a copy of, or delete your personal information. You may
                  also have the right to withdraw your consent to our processing of your personal
                  information. These rights may be limited in some circumstances by applicable law.
                  More information is provided below.
                </p>
                <h3 className="text-lg font-bold">Categories of Personal Information We Collect</h3>
                <p>
                  We have collected the following categories of personal information in the past
                  twelve (12) months:
                </p>
                <div className="overflow-x-auto">
                  <table className="border-border w-full min-w-[480px] border-collapse border text-sm">
                    <thead>
                      <tr className="bg-muted/60">
                        <th
                          scope="col"
                          className="border-border border px-4 py-3 text-left font-semibold"
                        >
                          Category
                        </th>
                        <th
                          scope="col"
                          className="border-border border px-4 py-3 text-left font-semibold"
                        >
                          Examples
                        </th>
                        <th
                          scope="col"
                          className="border-border border px-4 py-3 text-left font-semibold"
                        >
                          Collected
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border-border border px-4 py-3 font-medium">
                          A. Identifiers
                        </td>
                        <td className="border-border border px-4 py-3">
                          Contact details, such as real name, alias, postal address, telephone or
                          mobile contact number, unique personal identifier, online identifier,
                          Internet Protocol address, email address, and account name
                        </td>
                        <td className="border-border border px-4 py-3">YES</td>
                      </tr>
                      <tr className="bg-muted/30">
                        <td className="border-border border px-4 py-3 font-medium">
                          B. Personal information as defined in the California Customer Records
                          statute
                        </td>
                        <td className="border-border border px-4 py-3">
                          Name, contact information, education, employment, employment history, and
                          financial information
                        </td>
                        <td className="border-border border px-4 py-3">YES</td>
                      </tr>
                      <tr>
                        <td className="border-border border px-4 py-3 font-medium">
                          C. Protected classification characteristics under state or federal law
                        </td>
                        <td className="border-border border px-4 py-3">
                          Gender, age, date of birth, race and ethnicity, national origin, marital
                          status, and other demographic data
                        </td>
                        <td className="border-border border px-4 py-3">NO</td>
                      </tr>
                      <tr className="bg-muted/30">
                        <td className="border-border border px-4 py-3 font-medium">
                          D. Commercial information
                        </td>
                        <td className="border-border border px-4 py-3">
                          Transaction information, purchase history, financial details, and payment
                          information
                        </td>
                        <td className="border-border border px-4 py-3">NO</td>
                      </tr>
                      <tr>
                        <td className="border-border border px-4 py-3 font-medium">
                          E. Biometric information
                        </td>
                        <td className="border-border border px-4 py-3">
                          Fingerprints and voiceprints
                        </td>
                        <td className="border-border border px-4 py-3">NO</td>
                      </tr>
                      <tr className="bg-muted/30">
                        <td className="border-border border px-4 py-3 font-medium">
                          F. Internet or other similar network activity
                        </td>
                        <td className="border-border border px-4 py-3">
                          Browsing history, search history, online behavior, interest data, and
                          interactions with our and other websites, applications, systems, and
                          advertisements
                        </td>
                        <td className="border-border border px-4 py-3">NO</td>
                      </tr>
                      <tr>
                        <td className="border-border border px-4 py-3 font-medium">
                          G. Geolocation data
                        </td>
                        <td className="border-border border px-4 py-3">Device location</td>
                        <td className="border-border border px-4 py-3">NO</td>
                      </tr>
                      <tr className="bg-muted/30">
                        <td className="border-border border px-4 py-3 font-medium">
                          H. Audio, electronic, sensory, or similar information
                        </td>
                        <td className="border-border border px-4 py-3">
                          Images and audio, video or call recordings created in connection with our
                          business activities
                        </td>
                        <td className="border-border border px-4 py-3">YES</td>
                      </tr>
                      <tr>
                        <td className="border-border border px-4 py-3 font-medium">
                          I. Professional or employment-related information
                        </td>
                        <td className="border-border border px-4 py-3">
                          Business contact details in order to provide you our Services at a
                          business level or job title, work history, and professional qualifications
                          if you apply for a job with us
                        </td>
                        <td className="border-border border px-4 py-3">YES</td>
                      </tr>
                      <tr className="bg-muted/30">
                        <td className="border-border border px-4 py-3 font-medium">
                          J. Education Information
                        </td>
                        <td className="border-border border px-4 py-3">
                          Student records and directory information
                        </td>
                        <td className="border-border border px-4 py-3">YES</td>
                      </tr>
                      <tr>
                        <td className="border-border border px-4 py-3 font-medium">
                          K. Inferences drawn from collected personal information
                        </td>
                        <td className="border-border border px-4 py-3">
                          Inferences drawn from any of the collected personal information listed
                          above to create a profile or summary about, for example, an
                          individual&apos;s preferences and characteristics
                        </td>
                        <td className="border-border border px-4 py-3">NO</td>
                      </tr>
                      <tr className="bg-muted/30">
                        <td className="border-border border px-4 py-3 font-medium">
                          L. Sensitive personal Information
                        </td>
                        <td className="border-border border px-4 py-3" />
                        <td className="border-border border px-4 py-3">NO</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p>
                  We may also collect other personal information outside of these categories through
                  instances where you interact with us in person, online, or by phone or mail in the
                  context of:
                </p>
                <ul className="list-disc space-y-2 pl-6">
                  <li>Receiving help through our customer support channels;</li>
                  <li>Participation in customer surveys or contests; and</li>
                  <li>
                    Facilitation in the delivery of our Services and to respond to your inquiries.
                  </li>
                </ul>
                <p>
                  We will use and retain the collected personal information as needed to provide the
                  Services or for:
                </p>
                <ul className="list-disc space-y-2 pl-6">
                  <li>Category A — As long as the user has an account with us</li>
                  <li>Category B — As long as the user has an account with us</li>
                  <li>Category H — As long as the user has an account with us</li>
                  <li>Category I — As long as the user has an account with us</li>
                  <li>Category J — As long as the user has an account with us</li>
                </ul>
                <h3 className="text-lg font-bold">Sources of Personal Information</h3>
                <p>
                  Learn more about the sources of personal information we collect in{' '}
                  <a href="#infocollect" className="text-primary hover:underline">
                    &quot;What information do we collect?&quot;
                  </a>
                </p>
                <h3 className="text-lg font-bold">How We Use and Share Personal Information</h3>
                <p>
                  Learn more about how we use your personal information in the section,{' '}
                  <a href="#infouse" className="text-primary hover:underline">
                    &quot;How do we process your information?&quot;
                  </a>
                </p>
                <p>
                  <strong className="font-semibold">
                    Will your information be shared with anyone else?
                  </strong>{' '}
                  We may disclose your personal information with our service providers pursuant to a
                  written contract between us and each service provider. Learn more about how we
                  disclose personal information to in the section,{' '}
                  <a href="#whoshare" className="text-primary hover:underline">
                    &quot;When and with whom do we share your personal information?&quot;
                  </a>
                </p>
                <p>
                  We may use your personal information for our own business purposes, such as for
                  undertaking internal research for technological development and demonstration.
                  This is not considered to be &quot;selling&quot; of your personal information.
                </p>
                <p>
                  We have not disclosed, sold, or shared any personal information to third parties
                  for a business or commercial purpose in the preceding twelve (12) months. We will
                  not sell or share personal information in the future belonging to website
                  visitors, users, and other consumers.
                </p>
                <h3 className="text-lg font-bold">Your Rights</h3>
                <p>
                  You have rights under certain US state data protection laws. However, these rights
                  are not absolute, and in certain cases, we may decline your request as permitted
                  by law. These rights include:
                </p>
                <ul className="list-disc space-y-2 pl-6">
                  <li>Right to know whether or not we are processing your personal data</li>
                  <li>Right to access your personal data</li>
                  <li>Right to correct inaccuracies in your personal data</li>
                  <li>Right to request the deletion of your personal data</li>
                  <li>Right to obtain a copy of the personal data you previously shared with us</li>
                  <li>Right to non-discrimination for exercising your rights</li>
                  <li>
                    Right to opt out of the processing of your personal data if it is used for
                    targeted advertising (or sharing as defined under California&apos;s privacy
                    law), the sale of personal data, or profiling in furtherance of decisions that
                    produce legal or similarly significant effects (&quot;profiling&quot;)
                  </li>
                </ul>
                <p>
                  Depending upon the state where you live, you may also have the following rights:
                </p>
                <ul className="list-disc space-y-2 pl-6">
                  <li>
                    Right to access the categories of personal data being processed (as permitted by
                    applicable law, including Minnesota&apos;s privacy law)
                  </li>
                  <li>
                    Right to obtain a list of the categories of third parties to which we have
                    disclosed personal data (as permitted by applicable law, including
                    California&apos;s and Delaware&apos;s privacy law)
                  </li>
                  <li>
                    Right to obtain a list of specific third parties to which we have disclosed
                    personal data (as permitted by applicable law, including Minnesota&apos;s and
                    Oregon&apos;s privacy law)
                  </li>
                  <li>
                    Right to review, understand, question, and correct how personal data has been
                    profiled (as permitted by applicable law, including Minnesota&apos;s privacy
                    law)
                  </li>
                  <li>
                    Right to limit use and disclosure of sensitive personal data (as permitted by
                    applicable law, including California&apos;s privacy law)
                  </li>
                  <li>
                    Right to opt out of the collection of sensitive data and personal data collected
                    through the operation of a voice or facial recognition feature (as permitted by
                    applicable law, including Florida&apos;s privacy law)
                  </li>
                </ul>
                <h3 className="text-lg font-bold">How to Exercise Your Rights</h3>
                <p>
                  To exercise these rights, you can contact us by submitting a{' '}
                  <a
                    href="https://app.termly.io/dsar/d5e98040-a54b-44be-8e9d-73f7b5dfae88"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    data subject access request
                  </a>
                  , by emailing us at{' '}
                  <a href="mailto:privacy@vadodevs.com" className="text-primary hover:underline">
                    privacy@vadodevs.com
                  </a>
                  , or by referring to the contact details at the bottom of this document.
                </p>
                <p>
                  Under certain US state data protection laws, you can designate an authorized agent
                  to make a request on your behalf. We may deny a request from an authorized agent
                  that does not submit proof that they have been validly authorized to act on your
                  behalf in accordance with applicable laws.
                </p>
                <h3 className="text-lg font-bold">Request Verification</h3>
                <p>
                  Upon receiving your request, we will need to verify your identity to determine you
                  are the same person about whom we have the information in our system. We will only
                  use personal information provided in your request to verify your identity or
                  authority to make the request. However, if we cannot verify your identity from the
                  information already maintained by us, we may request that you provide additional
                  information for the purposes of verifying your identity and for security or
                  fraud-prevention purposes.
                </p>
                <p>
                  If you submit the request through an authorized agent, we may need to collect
                  additional information to verify your identity before processing your request and
                  the agent will need to provide a written and signed permission from you to submit
                  such request on your behalf.
                </p>
                <h3 className="text-lg font-bold">Appeals</h3>
                <p>
                  Under certain US state data protection laws, if we decline to take action
                  regarding your request, you may appeal our decision by emailing us at{' '}
                  <a href="mailto:privacy@vadodevs.com" className="text-primary hover:underline">
                    privacy@vadodevs.com
                  </a>
                  . We will inform you in writing of any action taken or not taken in response to
                  the appeal, including a written explanation of the reasons for the decisions. If
                  your appeal is denied, you may submit a complaint to your state attorney general.
                </p>
                <h3 className="text-lg font-bold">California &quot;Shine The Light&quot; Law</h3>
                <p>
                  California Civil Code Section 1798.83, also known as the &quot;Shine The
                  Light&quot; law, permits our users who are California residents to request and
                  obtain from us, once a year and free of charge, information about categories of
                  personal information (if any) we disclosed to third parties for direct marketing
                  purposes and the names and addresses of all third parties with which we shared
                  personal information in the immediately preceding calendar year. If you are a
                  California resident and would like to make such a request, please submit your
                  request in writing to us by using the contact details provided in the section{' '}
                  <a href="#contact" className="text-primary hover:underline">
                    &quot;How can you contact us about this notice?&quot;
                  </a>
                </p>
              </section>

              <section
                className="flex flex-col gap-6"
                aria-labelledby="policyupdates"
              >
                <h2 id="policyupdates" className="text-xl font-bold uppercase">
                  12. Do we make updates to this notice?
                </h2>
                <p>
                  <span className="font-semibold">In Short:</span> Yes, we will update this
                  notice as necessary to stay compliant with relevant laws.
                </p>
                <p>
                  We may update this Privacy Notice from time to time. The updated version
                  will be indicated by an updated &quot;Revised&quot; date at the top of this
                  Privacy Notice. If we make material changes to this Privacy Notice, we may
                  notify you either by prominently posting a notice of such changes or by
                  directly sending you a notification. We encourage you to review this
                  Privacy Notice frequently to be informed of how we are protecting your
                  information.
                </p>
              </section>

              <section
                className="flex flex-col gap-6"
                aria-labelledby="contact"
              >
                <h2 id="contact" className="text-xl font-bold uppercase">
                  13. How can you contact us about this notice?
                </h2>
                <p>
                  If you have questions or comments about this notice, you may email us at{' '}
                  <a href="mailto:privacy@vadodevs.com" className="text-primary hover:underline">
                    privacy@vadodevs.com
                  </a>{' '}
                  or contact us by post at:
                </p>
                <address className="not-italic">
                  Vado Devs LLC
                  <br />
                  8 The Green Ste B
                  <br />
                  Dover, DE 19901
                  <br />
                  United States
                </address>
              </section>

              <section
                className="flex flex-col gap-6"
                aria-labelledby="request"
              >
                <h2 id="request" className="text-xl font-bold uppercase">
                  14. How can you review, update, or delete the data we collect from you?
                </h2>
                <p>
                  Based on the applicable laws of your country or state of residence in the
                  US, you may have the right to request access to the personal information
                  we collect from you, details about how we have processed it, correct
                  inaccuracies, or delete your personal information. You may also have the
                  right to withdraw your consent to our processing of your personal
                  information. These rights may be limited in some circumstances by
                  applicable law. To request to review, update, or delete your personal
                  information, please fill out and submit a{' '}
                  <a
                    href="https://app.termly.io/dsar/d5e98040-a54b-44be-8e9d-73f7b5dfae88"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    data subject access request
                  </a>
                  .
                </p>
              </section>
            </article>
          </CenterContainer>
        </main>
      </MainLayout>
    </>
  );
}
