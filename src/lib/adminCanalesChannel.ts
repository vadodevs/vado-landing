export type AdminChannel = 'facebook' | 'whatsapp' | 'instagram' | 'bot-test';

const CHANNELS: readonly AdminChannel[] = ['facebook', 'whatsapp', 'instagram', 'bot-test'];

export function isAdminChannel(s: string): s is AdminChannel {
  return (CHANNELS as readonly string[]).includes(s);
}
