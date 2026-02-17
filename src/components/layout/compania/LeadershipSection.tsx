import { useTranslation } from 'react-i18next';
import { CenterContainer } from '@/components/layout/CenterContainer';

const LEADERSHIP_IMAGES = [
  '/team-vado/vado-team-1.jpeg',
  '/team-vado/vado-team-2.jpeg',
  '/team-vado/vado-team-3.jpeg',
  '/team-vado/vado-team-4.jpeg',
];

const PERSON_KEYS = ['person1', 'person2', 'person3', 'person4'] as const;

export function LeadershipSection() {
  const { t } = useTranslation();
  const title = t('cultureYTalentoPage.leadership.title');
  const titleWords = title.split(' ');

  return (
    <section className="bg-white py-10 md:py-16 lg:py-20">
      <CenterContainer>
        <h2 className="mb-8 text-2xl leading-tight font-bold text-[#19314c] md:text-3xl lg:text-4xl">
          {titleWords.length <= 1 ? (
            title
          ) : (
            <>
              {titleWords[0]} <span className="text-primary">{titleWords.slice(1).join(' ')}</span>
            </>
          )}
        </h2>

        <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-4 md:gap-6">
          {PERSON_KEYS.map((key, index) => (
            <article key={key} className="flex aspect-square flex-col gap-0 bg-white">
              <div className="min-h-0 flex-1 overflow-hidden rounded-2xl">
                <img
                  src={LEADERSHIP_IMAGES[index]}
                  alt=""
                  className="h-full w-full object-cover"
                  width={280}
                  height={280}
                  loading="lazy"
                />
              </div>
              <div className="text-muted-foreground flex shrink-0 flex-col justify-center py-4 text-center text-sm font-medium md:text-base">
                {t(`cultureYTalentoPage.leadership.${key}.name`)}
              </div>
            </article>
          ))}
        </div>
      </CenterContainer>
    </section>
  );
}
