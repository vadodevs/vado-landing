import { useTranslation } from 'react-i18next';
import { AppShell } from '@/components/layout/app/AppShell';

type CompanyContact = {
  servicio: string;
  nombre: string;
  correo: string;
  empresa: string;
  telefono: string;
  mensaje: string;
};

const companyContacts: CompanyContact[] = [
  {
    servicio: 'Software a la medida',
    nombre: 'Perla Guerrero',
    correo: 'correo@ejemplo.com',
    empresa: 'Mi Empresa',
    telefono: '123 456 7890',
    mensaje: 'Cuentanos sobre ti o sobre tu proyecto...',
  },
  {
    servicio: 'Software a la medida',
    nombre: 'Luis Andrade',
    correo: 'luis@ejemplo.com',
    empresa: 'Nova Labs',
    telefono: '555 123 9988',
    mensaje: 'Buscamos apoyo para modernizar nuestra plataforma.',
  },
];

export default function AppCompanyPage() {
  const { t } = useTranslation();

  return (
    <AppShell
      pathWithoutLang="/app/company"
      title={t('sidebarDemo.navProfile')}
      description={t('seo.appCompany')}
    >
      <section id="profile" className="scroll-mt-24">
        <h2 className="mb-1 text-xl font-semibold text-foreground">Contactos de compañías</h2>
        <p className="mb-3 max-w-prose text-sm text-muted-foreground">
          Lista de contactos interesados en servicios de Vado.
        </p>

        <div className="space-y-2">
          {companyContacts.map((contact) => (
            <article
              key={`${contact.correo}-${contact.telefono}`}
              className="rounded-lg border border-border bg-card p-3 shadow-sm"
            >
              <p className="text-xs font-medium text-primary">{contact.servicio}</p>
              <h3 className="mt-0.5 text-base font-semibold text-foreground">{contact.nombre}</h3>
              <p className="text-xs text-muted-foreground">{contact.correo}</p>
              <p className="text-xs text-muted-foreground">{contact.empresa}</p>
              <p className="text-xs text-muted-foreground">{contact.telefono}</p>
              <p className="mt-2 rounded-md bg-muted px-2 py-1.5 text-xs text-muted-foreground">
                {contact.mensaje}
              </p>
            </article>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
