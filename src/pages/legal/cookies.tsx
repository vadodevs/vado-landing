import { PageMeta } from '@/components/PageMeta';
import MainLayout from '@/components/layout/MainLayout';
import { CenterContainer } from '@/components/layout/CenterContainer';
import { CookieEntry } from '@/components/layout/legal/CookieEntry';
import { useLocale } from '@/hooks/useLocale';

const COOKIE_POLICY_TITLE = 'Cookie Policy';
const COOKIE_POLICY_DESCRIPTION =
  'Learn how Vado Devs LLC uses cookies and similar technologies on vadodevs.com. Essential, analytics, and advertising cookies, your rights, and how to manage them.';

export default function Cookies() {
  const { path } = useLocale();
  const canonicalPath = path('/info/cookies');

  return (
    <>
      <PageMeta
        title={`${COOKIE_POLICY_TITLE} | Vado`}
        description={COOKIE_POLICY_DESCRIPTION}
        canonicalPath={canonicalPath}
        ogType="website"
        pathWithoutLang="/info/cookies"
      />
      <MainLayout>
        <main id="main-content" className="bg-background py-12 md:py-16 lg:py-20" aria-label="Cookie Policy">
          <CenterContainer>
            <article className="flex flex-col gap-10" itemScope itemType="https://schema.org/WebPage">
              <header className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold uppercase">{COOKIE_POLICY_TITLE}</h1>
                <p className="text-muted-foreground font-semibold">
                  Last updated <time dateTime="2024-10-24">October 24, 2024</time>
                </p>
              </header>
              <section className="flex flex-col gap-8" aria-labelledby="intro">
                <h2 id="intro" className="sr-only">Introduction</h2>
                <p>
                  This Cookie Policy explains how Vado Devs LLC ("
                  <span className="font-semibold">Company</span>," "{' '}
                  <span className="font-semibold">staff members</span>," "{' '}
                  <span className="font-semibold">users</span>," and "
                  <span className="font-semibold">our</span>") uses cookies and similar technologies
                  to recognize you when you visit our website at{' '}
                  <a href="http://www.vadodevs.com" className="text-primary">
                    http://www.vadodevs.com
                  </a>{' '}
                  ("<span className="font-semibold">Website</span>"). It explains what these
                  technologies are and why we use them, as well as your rights to control our use of
                  them.
                </p>
                <p>
                  In some cases we may use cookies to collect personal information, or that becomes
                  personal information if we combine it with other information.
                </p>
              </section>
              <section className="flex flex-col gap-8" aria-labelledby="what-are-cookies">
                <h2 id="what-are-cookies" className="text-xl font-bold">What are cookies?</h2>
                <p>
                  Cookies are small data files that are placed on your computer or mobile device
                  when you visit a website. Cookies are widely used by website owners in order to
                  make their websites work, or to work more efficiently, as well as to provide
                  reporting information.
                </p>
                <p>
                  Cookies set by the website owner (in this case, Vado Devs LLC) are called
                  "first-party cookies." Cookies set by parties other than the website owner are
                  called "third-party cookies." Third-party cookies enable third-party features or
                  functionality to be provided on or through the website (e.g., advertising,
                  interactive content, and analytics). The parties that set these third-party
                  cookies can recognize your computer both when it visits the website in question
                  and also when it visits certain other websites.
                </p>
              </section>
              <section className="flex flex-col gap-8" aria-labelledby="why-cookies">
                <h2 id="why-cookies" className="text-xl font-bold">Why do we use cookies?</h2>
                <p>
                  Cookies are small data files that are placed on your computer or mobile device
                  when you visit a website. Cookies are widely used by website owners in order to
                  make their websites work, or to work more efficiently, as well as to provide
                  reporting information.
                </p>
              </section>
              <section className="flex flex-col gap-8" aria-labelledby="how-control-cookies">
                <h2 id="how-control-cookies" className="text-xl font-bold">How can I control cookies?</h2>
                <p>
                  You have the right to decide whether to accept or reject cookies. You can exercise
                  your cookie rights by setting your preferences in the Cookie Consent Manager. The
                  Cookie Consent Manager allows you to select which categories of cookies you accept
                  or reject. Essential cookies cannot be rejected as they are strictly necessary to
                  provide you with services.
                </p>
                <p>
                  The Cookie Consent Manager can be found in the notification banner and on our
                  Website. If you choose to reject cookies, you may still use our Website though
                  your access to some functionality and areas of our Website may be restricted. You
                  may also set or amend your web browser controls to accept or refuse cookies.
                </p>
                <p>
                  The specific types of first- and third-party cookies served through our Website
                  and the purposes they perform are described in the table below (please note that
                  the specific cookies served may vary depending on the specific Online Properties
                  you visit):
                </p>
              </section>

              <section className="flex flex-col gap-8" aria-labelledby="essential-cookies">
                <h2 id="essential-cookies" className="text-xl font-bold underline">Essential website cookies:</h2>
                <p className="text-muted-foreground">
                  These cookies are strictly necessary to provide you with services available
                  through our Website and to use some of its features, such as access to secure
                  areas.
                </p>
                <CookieEntry
                  name="__cf_bm"
                  purpose="Cloudflare places the cookie on end-user devices that access customer sites protected by Bot Management or Bot Fight Mode."
                  provider=".www.vadodevs.com"
                  serviceName="CloudFlare"
                  servicePolicyUrl="https://www.cloudflare.com/privacypolicy/"
                  type="http_cookie"
                  expiresIn="29 minutes"
                />
              </section>

              <section className="flex flex-col gap-8" aria-labelledby="analytics-cookies">
                <h2 id="analytics-cookies" className="text-xl font-bold underline">
                  Analytics and customization cookies:
                </h2>
                <p className="text-muted-foreground">
                  These cookies collect information that is used either in aggregate form to help us
                  understand how our Website is being used or how effective our marketing campaigns
                  are, or to help us customize our Website for you.
                </p>
                <div className="flex flex-col gap-4">
                  <CookieEntry
                    name="_ga_#"
                    purpose="Used to distinguish individual users by means of designation of a randomly generated number as client identifier, which allows calculation of visits and sessions."
                    provider=".vadodevs.com"
                    serviceName="Google Analytics"
                    servicePolicyUrl="https://business.safety.google/privacy/"
                    type="http_cookie"
                    expiresIn="1 year 1 month 4 days"
                  />
                  <CookieEntry
                    name="_ga"
                    purpose="Records a particular ID used to come up with data about website usage by the user."
                    provider=".vadodevs.com"
                    serviceName="Google Analytics"
                    servicePolicyUrl="https://business.safety.google/privacy/"
                    type="http_cookie"
                    expiresIn="1 year 1 month 4 days"
                  />
                </div>
              </section>

              <section className="flex flex-col gap-8" aria-labelledby="advertising-cookies">
                <h2 id="advertising-cookies" className="text-xl font-bold underline">Advertising cookies:</h2>
                <p className="text-muted-foreground">
                  These cookies are used to make advertising messages more relevant to you. They
                  perform functions like preventing the same ad from continuously reappearing,
                  ensuring that ads are properly displayed for advertisers, and in some cases
                  selecting advertisements that are based on your interests.
                </p>
                <div className="flex flex-col gap-4">
                  <CookieEntry
                    name="_gcl_au"
                    purpose="Used by Google AdSense for experimenting with advertisement efficiency across websites using their services."
                    provider=".vadodevs.com"
                    serviceName="Google AdSense"
                    servicePolicyUrl="https://policies.google.com/privacy"
                    type="http_cookie"
                    expiresIn="2 months 29 days"
                  />
                  <CookieEntry
                    name="lastExternalReferrerTime"
                    purpose="Detects how the user reached the website by registering their last URL-address."
                    provider="www.vadodevs.com"
                    serviceName="Meta Platforms, Inc"
                    servicePolicyUrl="https://www.facebook.com/privacy/policy"
                    type="html_local_storage"
                    expiresIn="persistent"
                  />
                  <CookieEntry
                    name="lastExternalReferrer"
                    purpose="Detects how the user reached the website by registering their last URL-address."
                    provider="www.vadodevs.com"
                    serviceName="Meta Platforms, Inc"
                    servicePolicyUrl="https://www.facebook.com/privacy/policy"
                    type="html_local_storage"
                    expiresIn="persistent"
                  />
                  <CookieEntry
                    name="_fbp"
                    purpose="Facebook tracking pixel used to identify visitors for personalized advertising."
                    provider=".vadodevs.com"
                    serviceName="Facebook"
                    servicePolicyUrl="https://www.facebook.com/privacy/policy"
                    type="http_cookie"
                    expiresIn="2 months 29 days"
                  />
                  <CookieEntry
                    name="test_cookie"
                    purpose="A session cookie used to check if the user's browser supports cookies."
                    provider=".doubleclick.net"
                    serviceName="DoubleClick"
                    servicePolicyUrl="https://business.safety.google/privacy/"
                    type="server_cookie"
                    expiresIn="15 minutes"
                  />
                </div>
              </section>

              <section className="flex flex-col gap-8" aria-labelledby="control-browser">
                <h2 id="control-browser" className="text-xl font-bold">How can I control cookies on my browser?</h2>
                <p>
                  As the means by which you can refuse cookies through your web browser controls
                  vary from browser to browser, you should visit your browser&apos;s help menu for
                  more information. The following is information about how to manage cookies on the
                  most popular browsers:
                </p>
                <ul className="list-[square] space-y-1 pl-6">
                  <li>
                    <a
                      href="https://support.google.com/chrome/answer/95647#zippy=%2Callow-or-block-cookies"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline"
                    >
                      Chrome
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://support.microsoft.com/en-us/windows/manage-cookies-in-microsoft-edge-view-allow-block-delete-and-use-168dab11-0753-043d-7c16-ede5947fc64d"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline"
                    >
                      Internet Explorer
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://support.mozilla.org/en-US/kb/enhanced-tracking-protection-firefox-desktop?redirectslug=enable-and-disable-cookies-website-preferences&redirectlocale=en-US"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline"
                    >
                      Firefox
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://support.apple.com/en-ie/guide/safari/sfri11471/mac"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline"
                    >
                      Safari
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://support.microsoft.com/en-us/microsoft-edge/microsoft-edge-browsing-data-and-privacy-bb8174ba-9d73-dcf2-9b4a-c582b4e640dd"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline"
                    >
                      Edge
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://help.opera.com/en/latest/web-preferences/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline"
                    >
                      Opera
                    </a>
                  </li>
                </ul>
                <p>
                  In addition, most advertising networks offer you a way to opt out of targeted
                  advertising. If you would like to find out more information, please visit:
                </p>
                <ul className="list-[square] space-y-1 pl-6">
                  <li>
                    <a
                      href="https://optout.aboutads.info"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline"
                    >
                      Digital Advertising Alliance
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://youradchoices.ca"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline"
                    >
                      Digital Advertising Alliance of Canada
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://www.youronlinechoices.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline"
                    >
                      European Interactive Digital Advertising Alliance
                    </a>
                  </li>
                </ul>
              </section>
              <section className="flex flex-col gap-8" aria-labelledby="web-beacons">
                <h2 id="web-beacons" className="text-xl font-bold">
                  What about other tracking technologies, like web beacons?
                </h2>
                <p>
                  Cookies are not the only way to recognize or track visitors to a website. We may
                  use other, similar technologies from time to time, like web beacons (sometimes
                  called "tracking pixels" or "clear gifs"). These are tiny graphics files that
                  contain a unique identifier that enables us to recognize when someone has visited
                  our Website or opened an email including them. This allows us, for example, to
                  monitor the traffic patterns of users from one page within a website to another,
                  to deliver or communicate with cookies, to understand whether you have come to the
                  website from an online advertisement displayed on a third-party website, to
                  improve site performance, and to measure the success of email marketing campaigns.
                  In many instances, these technologies are reliant on cookies to function properly,
                  and so declining cookies will impair their functioning.
                </p>
              </section>
              <section className="flex flex-col gap-8" aria-labelledby="flash-cookies">
                <h2 id="flash-cookies" className="text-xl font-bold">
                  Do you use Flash cookies or Local Shared Objects?
                </h2>
                <p>
                  Websites may also use so-called "Flash Cookies" (also known as Local Shared
                  Objects or "LSOs") to, among other things, collect and store information about
                  your use of our services, fraud prevention, and for other site operations.
                </p>
                <p>
                  If you do not want Flash Cookies stored on your computer, you can adjust the
                  settings of your Flash player to block Flash Cookies storage using the tools
                  contained in the{' '}
                  <a
                    href="https://www.macromedia.com/support/documentation/en/flashplayer/help/settings_manager07.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline"
                  >
                    {' '}
                    Website Storage Settings Panel
                  </a>
                  . You can also control Flash Cookies by going to the{' '}
                  <a
                    href="https://www.macromedia.com/support/documentation/en/flashplayer/help/settings_manager03.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline"
                  >
                    Global Storage Settings Panel
                  </a>
                  and following the instructions (which may include instructions that explain, for
                  example, how to delete existing Flash Cookies (referred to "information" on the
                  Macromedia site), how to prevent Flash LSOs from being placed on your computer
                  without your being asked, and (for Flash Player 8 and later) how to block Flash
                  Cookies that are not being delivered by the operator of the page you are on at the
                  time).
                </p>
                <p>
                  Please note that setting the Flash Player to restrict or limit acceptance of Flash
                  Cookies may reduce or impede the functionality of some Flash applications,
                  including, potentially, Flash applications used in connection with our services or
                  online content.
                </p>
              </section>
              <section className="flex flex-col gap-8" aria-labelledby="targeted-advertising">
                <h2 id="targeted-advertising" className="text-xl font-bold">Do you serve targeted advertising?</h2>
                <p>
                  Third parties may serve cookies on your computer or mobile device to serve
                  advertising through our Website. These companies may use information about your
                  visits to this and other websites in order to provide relevant advertisements
                  about goods and services that you may be interested in. They may also employ
                  technology that is used to measure the effectiveness of advertisements. They can
                  accomplish this by using cookies or web beacons to collect information about your
                  visits to this and other sites in order to provide relevant advertisements about
                  goods and services of potential interest to you. The information collected through
                  this process does not enable us or them to identify your name, contact details, or
                  other details that directly identify you unless you choose to provide these.
                </p>
              </section>
              <section className="flex flex-col gap-8" aria-labelledby="policy-updates">
                <h2 id="policy-updates" className="text-xl font-bold">How often will you update this Cookie Policy?</h2>
                <p>
                  We may update this Cookie Policy from time to time in order to reflect, for
                  example, changes to the cookies we use or for other operational, legal, or
                  regulatory reasons. Please therefore revisit this Cookie Policy regularly to stay
                  informed about our use of cookies and related technologies.
                </p>
                <p>The date at the top of this Cookie Policy indicates when it was last updated.</p>
              </section>
              <section className="flex flex-col gap-8" aria-labelledby="contact-info">
                <h2 id="contact-info" className="text-xl font-bold">Where can I get further information?</h2>
                <p className="text-muted-foreground">
                  If you have any questions about our use of cookies or other technologies, please
                  contact us at:
                </p>
                <address className="font-medium text-foreground not-italic">
                  Vado Devs LLC<br />
                  8 The Green Ste B<br />
                  Dover, DE 19901<br />
                  United States<br />
                  Phone: <a href="tel:+13082798206" className="text-primary underline">+1 308-279-8206</a>
                </address>
              </section>
            </article>
          </CenterContainer>
        </main>
      </MainLayout>
    </>
  );
}
