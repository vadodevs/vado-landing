import { Link, useLocation } from 'wouter';
import { useTranslation } from 'react-i18next';
import { FaFacebook, FaInstagram, FaLinkedin, FaTiktok, FaYoutube } from 'react-icons/fa';
import { CenterContainer } from '@/components/layout/CenterContainer';
import { VadoLogo } from '@/assets/vado-logo';
import { cn } from '@/lib/utils';
import { useLocale } from '@/hooks/useLocale';

const SOCIAL_LINKS = [
  { Icon: FaFacebook, href: 'https://www.facebook.com/vadodevs', label: 'Facebook' },
  { Icon: FaInstagram, href: 'https://www.instagram.com/vadodevs', label: 'Instagram' },
  { Icon: FaLinkedin, href: 'https://www.linkedin.com/company/vado-devs', label: 'LinkedIn' },
  { Icon: FaTiktok, href: 'https://www.tiktok.com/@vado.devs', label: 'TikTok' },
  {
    Icon: FaYoutube,
    href: 'https://www.youtube.com/channel/UCDD5O0ACBG4_Q05eHDJSwxg',
    label: 'YouTube',
  },
] as const;

export function Footer() {
  const { t } = useTranslation();
  const { locale, path } = useLocale();
  const [location] = useLocation();
  const enPath = location.replace(/^\/[^/]+/, '/en');
  const esPath = location.replace(/^\/[^/]+/, '/es');

  return (
    <footer className="bg-[#112331] text-white">
      <CenterContainer className="py-10 md:py-12 lg:py-14">
        <div className="flex flex-col gap-10 md:flex-row md:flex-wrap md:justify-between md:gap-x-8 lg:gap-x-12">
          {/* Brand + social */}
          <div className="flex flex-col gap-4">
            <Link href={path('')} className="inline-block">
              <VadoLogo white />
            </Link>
            <p className="text-sm font-medium text-white/90">{t('footer.stayConnected')}</p>
            <div className="flex items-center gap-3">
              {SOCIAL_LINKS.map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border-primary hover:bg-primary/20 flex size-11 shrink-0 skew-x-12 items-center justify-center border-2 text-white transition-colors"
                  aria-label={label}
                >
                  <span className="-skew-x-12">
                    <Icon className="size-5" />
                  </span>
                </a>
              ))}
            </div>
          </div>

          {/* Policies */}
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-bold tracking-wide text-white uppercase">
              {t('footer.policiesHeading')}
            </h3>
            <nav className="flex flex-col gap-2">
              <Link
                href={path('/terminos')}
                className="text-sm text-white/90 transition-colors hover:text-white"
              >
                {t('footer.terms')}
              </Link>
              <Link
                href={path('/politica-privacidad')}
                className="text-sm text-white/90 transition-colors hover:text-white"
              >
                {t('footer.privacy')}
              </Link>
              <Link
                href={path('/cookies')}
                className="text-sm text-white/90 transition-colors hover:text-white"
              >
                {t('footer.cookies')}
              </Link>
            </nav>
          </div>

          {/* Contact */}
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-bold tracking-wide text-white uppercase">
              {t('footer.contactHeading')}
            </h3>
            <div className="flex flex-col gap-2 text-sm text-white/90">
              <a href="tel:+526621657082" className="transition-colors hover:text-white">
                +52 662 165 7082
              </a>
              <a href="tel:+15203976191" className="transition-colors hover:text-white">
                +1 520 397 6191
              </a>
              <a href="mailto:contact@vadodevs.com" className="transition-colors hover:text-white">
                contact@vadodevs.com
              </a>
            </div>
          </div>

          {/* Language */}
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-bold tracking-wide text-white uppercase">
              {t('footer.languageHeading')}
            </h3>
            <div className="flex items-center gap-2 text-sm">
              <Link
                href={enPath}
                className={cn(
                  'rounded px-2 py-1 font-medium transition-colors',
                  locale === 'en' ? 'font-semibold text-white' : 'text-white/70 hover:text-white',
                )}
              >
                EN
              </Link>
              <span className="text-white/50">|</span>
              <Link
                href={esPath}
                className={cn(
                  'rounded px-2 py-1 font-medium transition-colors',
                  locale === 'es' ? 'font-semibold text-white' : 'text-white/70 hover:text-white',
                )}
              >
                ES
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-white/20 pt-6 text-center text-sm text-white/80">
          {t('footer.copyright', { year: new Date().getFullYear() })}
        </div>
      </CenterContainer>
    </footer>
  );
}
