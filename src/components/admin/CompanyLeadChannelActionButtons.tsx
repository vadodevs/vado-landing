import { Button } from '@/components/ui/button';
import { buttonVariants } from '@/components/ui/button-variants';
import {
  CompanyLinkedInIcon,
  CompanyWhatsAppIcon,
} from '@/components/admin/CompanyLeadChannelIcons';
import type { CompanyContact } from '@/lib/companyAdminContact';
import {
  pickCompanyLeadLinkedinUrl,
  pickCompanyLeadWhatsappUrl,
} from '@/lib/companyLeadChannelLinks';
import { cn } from '@/lib/utils';

const BTN_CLASS = 'h-9 shrink-0 gap-1.5';

type Props = {
  contact: CompanyContact;
  disabled?: boolean;
};

export function CompanyLeadChannelActionButtons({ contact, disabled }: Props) {
  const linkedinUrl = pickCompanyLeadLinkedinUrl(contact);
  const whatsappUrl = pickCompanyLeadWhatsappUrl(contact);

  return (
    <>
      {linkedinUrl && !disabled ? (
        <a
          href={linkedinUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), BTN_CLASS)}
          title="Abrir LinkedIn"
        >
          <CompanyLinkedInIcon className="text-[#0A66C2]" />
          LinkedIn
        </a>
      ) : (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={cn(BTN_CLASS, 'opacity-60')}
          disabled
          title="Sin perfil de LinkedIn guardado"
        >
          <CompanyLinkedInIcon className="text-[#0A66C2]" />
          LinkedIn
        </Button>
      )}

      {whatsappUrl && !disabled ? (
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), BTN_CLASS)}
          title="Abrir WhatsApp"
        >
          <CompanyWhatsAppIcon className="text-[#25D366]" />
          WhatsApp
        </a>
      ) : (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={cn(BTN_CLASS, 'opacity-60')}
          disabled
          title="Sin teléfono para WhatsApp"
        >
          <CompanyWhatsAppIcon className="text-[#25D366]" />
          WhatsApp
        </Button>
      )}
    </>
  );
}
