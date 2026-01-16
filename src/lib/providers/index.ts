import { MusicProvider } from '@/types/music';
import { GequbaoProvider } from './impl/gequbao';

const providers: Record<string, MusicProvider> = {
  gequbao: new GequbaoProvider(),
};

export function getProvider(name: string = 'gequbao'): MusicProvider {
  return providers[name] || providers['gequbao'];
}

export function getAllProviders(): MusicProvider[] {
  return Object.values(providers);
}
