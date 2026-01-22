import { MusicProvider } from '@/types/music';
import { GequbaoProvider } from './impl/gequbao';
import { GequhaiProvider } from './impl/gequhai';
import { BuguProvider } from './impl/bugu';
import { QQProvider } from './impl/qq';
import { QQMp3Provider } from './impl/qqmp3';
import { MiguProvider } from './impl/migu';
import { LivepooProvider } from './impl/livepoo';

const providers: Record<string, MusicProvider> = {
  gequbao: new GequbaoProvider(),
  gequhai: new GequhaiProvider(),
  bugu: new BuguProvider(),
  qq: new QQProvider(),
  qqmp3: new QQMp3Provider(),
  migu: new MiguProvider(),
  livepoo: new LivepooProvider(),
};

export function getProvider(name: string = 'gequbao'): MusicProvider {
  return providers[name] || providers['gequbao'];
}

export function getAllProviders(): MusicProvider[] {
  return Object.values(providers);
}
