import { useState } from 'react';
import { ClipboardEdit, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import {
  patchCompanySubmissionFields,
  type CompanyContact,
} from '@/lib/companyAdminContact';
import { parseCompanyLeadManualFeed } from '@/lib/companyLeadChannelLinks';
import { cn } from '@/lib/utils';

type Props = {
  contact: CompanyContact;
  disabled?: boolean;
  triggerClassName?: string;
  onApplied: (contact: CompanyContact) => void;
};

export function CompanyLeadManualFeedDialog({
  contact,
  disabled,
  triggerClassName,
  onApplied,
}: Props) {
  const [open, setOpen] = useState(false);
  const [instruction, setInstruction] = useState('');
  const [pending, setPending] = useState(false);

  const apply = async () => {
    const parsed = parseCompanyLeadManualFeed(instruction);
    if (!parsed.phone && !parsed.linkedinUrl) {
      toast.error('No se detectó teléfono ni LinkedIn', {
        description:
          'Incluye un número (p. ej. +52 55 1234 5678) o una URL de LinkedIn en la instrucción.',
      });
      return;
    }

    setPending(true);
    try {
      const result = await patchCompanySubmissionFields(contact.id, {
        ...(parsed.phone ? { phone: parsed.phone } : {}),
        ...(parsed.linkedinUrl ? { linkedinUrl: parsed.linkedinUrl } : {}),
      });

      const updatedFields: string[] = [];
      if (parsed.phone) updatedFields.push('teléfono');
      if (parsed.linkedinUrl) updatedFields.push('LinkedIn');

      if (!result.ok) {
        if (result.reason === 'no-config') {
          const local: CompanyContact = {
            ...contact,
            telefono: parsed.phone?.trim() || contact.telefono,
            linkedinUrl: parsed.linkedinUrl?.trim() || contact.linkedinUrl,
          };
          toast.success('Lead actualizado (demo)', {
            description:
              updatedFields.length > 0 ? `Campos: ${updatedFields.join(', ')}` : undefined,
          });
          onApplied(local);
          setInstruction('');
          setOpen(false);
          return;
        }
        toast.error('No se pudo aplicar', {
          description: 'Revisa la conexión e inténtalo de nuevo.',
        });
        return;
      }

      toast.success('Lead actualizado', {
        description: updatedFields.length > 0 ? `Campos: ${updatedFields.join(', ')}` : undefined,
      });
      onApplied(result.contact);
      setInstruction('');
      setOpen(false);
    } finally {
      setPending(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setInstruction('');
      }}
    >
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={cn('shrink-0 gap-1.5', triggerClassName)}
          disabled={disabled}
        >
          <ClipboardEdit className="h-3.5 w-3.5" aria-hidden />
          Alimentar manualmente
        </Button>
      </DialogTrigger>
      <DialogContent useAppDark className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Alimentar manualmente</DialogTitle>
          <DialogDescription>
            Escribe o pega el teléfono y/o el LinkedIn del lead. Se actualizan esos campos y los
            botones de canal se iluminan cuando hay dato.
          </DialogDescription>
        </DialogHeader>
        <Textarea
          value={instruction}
          onChange={(e) => setInstruction(e.target.value)}
          placeholder={
            'Ejemplos:\n• Agrega el teléfono +52 81 5453 6410\n• LinkedIn: https://www.linkedin.com/in/ana-lopez\n• Tel +52 55 1234 5678 y linkedin.com/company/acme'
          }
          className="min-h-[180px] resize-y font-mono text-sm"
          disabled={pending}
        />
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={pending}
            onClick={() => setOpen(false)}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={pending || instruction.trim().length < 3}
            onClick={() => void apply()}
          >
            {pending ? (
              <>
                <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" aria-hidden />
                Aplicando…
              </>
            ) : (
              'Aplicar'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
