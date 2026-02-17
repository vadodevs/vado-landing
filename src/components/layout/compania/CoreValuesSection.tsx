import { useTranslation } from 'react-i18next';
import { CenterContainer } from '@/components/layout/CenterContainer';

const CARDS = [
  { id: 'adaptabilidad', icon: '/icons/idea.svg' },
  { id: 'excelencia', icon: '/icons/like.svg' },
  { id: 'transparencia', icon: '/icons/handshake.svg' },
] as const;

export function CoreValuesSection() {
  const { t } = useTranslation();

  return (
    <section className="bg-white py-12 md:py-16 lg:py-20">
      <CenterContainer>
        <h2 className="mb-8 text-left text-2xl leading-tight font-bold text-[#19314c] md:text-3xl lg:mb-10">
          {(() => {
            const title = t('cultureYTalentoPage.coreValues.title');
            const words = title.split(' ');
            if (words.length <= 1) return title;
            return (
              <>
                {words[0]} <span className="text-primary">{words.slice(1).join(' ')}</span>
              </>
            );
          })()}
        </h2>
        <div className="grid gap-6 sm:grid-cols-3 sm:gap-8">
          {CARDS.map(({ id, icon }) => (
            <div
              key={id}
              className="group h-[220px] w-full min-w-0 cursor-default sm:h-[260px]"
              style={{ perspective: '1000px' }}
            >
              <div
                className="relative h-full w-full transform-[rotateY(0deg)] transition-transform duration-500 group-hover:transform-[rotateY(180deg)]"
                style={{ transformStyle: 'preserve-3d' }}
              >
                {/* Front */}
                <div
                  className="border-border absolute inset-0 flex flex-col items-center justify-center gap-4 rounded-xl border bg-white px-4 py-6 shadow-sm"
                  style={{
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(0deg)',
                    WebkitBackfaceVisibility: 'hidden',
                  }}
                >
                  <img src={icon} alt="" className="size-20 sm:size-24" aria-hidden />
                  <span className="text-center text-base font-bold text-[#19314c] sm:text-lg">
                    {t(`cultureYTalentoPage.coreValues.${id}.title`)}
                  </span>
                </div>
                {/* Back */}
                <div
                  className="absolute inset-0 flex flex-col justify-center rounded-xl bg-[#19314c] px-5 py-6 text-left"
                  style={{
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                    WebkitBackfaceVisibility: 'hidden',
                  }}
                >
                  <p className="text-sm leading-relaxed text-white sm:text-base">
                    {t(`cultureYTalentoPage.coreValues.${id}.backDescription`)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CenterContainer>
    </section>
  );
}
