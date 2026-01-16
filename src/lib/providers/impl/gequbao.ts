import axios from 'axios';
import * as cheerio from 'cheerio';
import { MusicItem, MusicProvider, PlayInfo } from '@/types/music';

const HEADERS_PAGE = {
  'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
  'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8',
  'cache-control': 'max-age=0',
  'priority': 'u=0, i',
  'referer': 'https://www.gequbao.com/',
  'sec-ch-ua': '"Google Chrome";v="143", "Chromium";v="143", "Not A(Brand";v="24"',
  'sec-ch-ua-mobile': '?0',
  'sec-ch-ua-platform': '"Windows"',
  'sec-fetch-dest': 'document',
  'sec-fetch-mode': 'navigate',
  'sec-fetch-site': 'same-origin',
  'sec-fetch-user': '?1',
  'upgrade-insecure-requests': '1',
  'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36',
};

const HEADERS_API = {
  'accept': 'application/json, text/javascript, */*; q=0.01',
  'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8',
  'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
  'origin': 'https://www.gequbao.com',
  'priority': 'u=1, i',
  'sec-ch-ua': '"Google Chrome";v="143", "Chromium";v="143", "Not A(Brand";v="24"',
  'sec-ch-ua-mobile': '?0',
  'sec-ch-ua-platform': '"Windows"',
  'sec-fetch-dest': 'empty',
  'sec-fetch-mode': 'cors',
  'sec-fetch-site': 'same-origin',
  'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36',
  'x-requested-with': 'XMLHttpRequest',
};

export class GequbaoProvider implements MusicProvider {
  name = 'gequbao';

  async search(query: string): Promise<MusicItem[]> {
    try {
      const url = `https://www.gequbao.com/s/${encodeURIComponent(query)}`;
      const { data } = await axios.get(url, { headers: HEADERS_PAGE, timeout: 10000 });
      const $ = cheerio.load(data);
      const items: MusicItem[] = [];

      $('a[href^="/music/"]').each((_, el) => {
        const $a = $(el);
        const href = $a.attr('href') || '';
        const match = href.match(/\/music\/([0-9]+)/);
        if (!match) return;

        const id = match[1];
        // 清理标题中的多余空白符
        const rawTitle = $a.text();
        const title = rawTitle.replace(/\s+/g, ' ').trim();

        // 过滤干扰项
        if (!title || ['播放&下载', '播放', '下载'].includes(title) || title.startsWith('网友刚刚下载了')) {
          return;
        }

        let artist = '';
        // 尝试从父级查找歌手
        const $parent = $a.closest('li, div, tr');
        if ($parent.length) {
          const $artist = $parent.find('a[href*="/singer/"], a[href*="/artist/"]');
          if ($artist.length) {
             artist = $artist.text().replace(/\s+/g, ' ').trim();
          }

          // 尝试文本分割
          if (!artist) {
            const txt = $parent.text().replace(/\s+/g, ' ').trim();
            if (txt.includes(' - ')) {
              const parts = txt.split(' - ').filter(s => s.trim());
              if (parts.length >= 2 && parts[0].includes(title)) {
                artist = parts[1].trim();
              }
            }
          }
        }

        // 尝试标题分割
        if (!artist) {
          const sep = title.includes(' - ') ? ' - ' : '-';
          if (title.includes(sep)) {
            const parts = title.split(sep, 2).map(s => s.trim());
            if (parts.length === 2) {
              // 注意：此处不直接修改title，保持原标题显示，但在数据中记录
              artist = parts[1];
            }
          }
        }

        items.push({
          id,
          title,
          artist: artist || '未知歌手',
          provider: this.name,
        });
      });

      // 去重
      const seen = new Set();
      const dedup: MusicItem[] = [];
      for (const item of items) {
        const key = `${item.id}-${item.title}`;
        if (!seen.has(key)) {
          seen.add(key);
          dedup.push(item);
        }
      }
      return dedup;
    } catch (error) {
      console.error('Gequbao search error:', error);
      return [];
    }
  }

  async getPlayInfo(id: string): Promise<PlayInfo> {
    try {
      const pageUrl = `https://www.gequbao.com/music/${id}`;
      const { data: html } = await axios.get(pageUrl, {
        headers: { ...HEADERS_PAGE, referer: 'https://www.gequbao.com/' },
        timeout: 10000,
      });

      // 提取 window.appData
      const match = html.match(/window\.appData\s*=\s*(\{[\s\S]*?\});/);
      let playId = '';
      let cover = '';
      
      if (match) {
        try {
          const appData = JSON.parse(match[1]);
          playId = appData.play_id;
          cover = appData.mp3_cover || '';
        } catch (e) {
          console.error('JSON parse error', e);
        }
      }

      // 如果没匹配到或解析失败，尝试备用正则提取
      if (!playId) {
        // 这里可以实现更复杂的括号匹配逻辑，暂略，假设MVP场景正则足够
      }

      if (!playId) throw new Error('Failed to extract play_id');

      // 请求API
      const { data: apiRes } = await axios.post(
        'https://www.gequbao.com/api/play-url',
        `id=${encodeURIComponent(playId)}`,
        {
          headers: { ...HEADERS_API, referer: pageUrl },
          timeout: 10000,
        }
      );

      if (apiRes.code === 1 && apiRes.data?.url) {
        return {
          url: apiRes.data.url,
          type: 'mp3', // 默认为mp3，实际可从url后缀判断
          cover: cover
        };
      }
      
      throw new Error(apiRes.msg || 'API error');
    } catch (error) {
      console.error('Gequbao getPlayInfo error:', error);
      throw error;
    }
  }
}
