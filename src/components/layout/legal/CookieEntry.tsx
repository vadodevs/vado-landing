export type CookieEntryProps = {
  name: string;
  purpose: string;
  provider: string;
  serviceName: string;
  servicePolicyUrl?: string;
  type: string;
  expiresIn: string;
};

export function CookieEntry({
  name,
  purpose,
  provider,
  serviceName,
  servicePolicyUrl,
  type,
  expiresIn,
}: CookieEntryProps) {
  return (
    <div className="rounded-lg border bg-muted/40 p-4">
      <div className="grid grid-cols-[minmax(6rem,auto)_1fr] gap-x-4 gap-y-2 text-sm">
        <span className="shrink-0 font-semibold text-foreground">Name:</span>
        <span className="text-muted-foreground">{name}</span>
        <span className="shrink-0 font-semibold text-foreground">Purpose:</span>
        <span className="text-muted-foreground">{purpose}</span>
        <span className="shrink-0 font-semibold text-foreground">Provider:</span>
        <span className="text-muted-foreground">{provider}</span>
        <span className="shrink-0 font-semibold text-foreground">Service:</span>
        <span className="text-muted-foreground">
          {serviceName}
          {servicePolicyUrl && (
            <>
              {' '}
              <a
                href={servicePolicyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline"
              >
                View Service Privacy Policy
              </a>
            </>
          )}
        </span>
        <span className="shrink-0 font-semibold text-foreground">Type:</span>
        <span className="text-muted-foreground">{type}</span>
        <span className="shrink-0 font-semibold text-foreground">Expires in:</span>
        <span className="text-muted-foreground">{expiresIn}</span>
      </div>
    </div>
  );
}
