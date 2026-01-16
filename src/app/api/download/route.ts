import { NextRequest, NextResponse } from "next/server";
import { getProvider } from "@/lib/providers";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get("id");
  const filename = searchParams.get("filename");
  const providerName = searchParams.get("provider") || "gequbao";

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  try {
    // 1. 获取真实播放地址
    const provider = getProvider(providerName);
    const playInfo = await provider.getPlayInfo(id);
    if (!playInfo || !playInfo.url) {
      return NextResponse.json({ error: "Failed to get url" }, { status: 404 });
    }

    // 2. 请求音频流
    // 使用原生 fetch 以获取标准的 ReadableStream，完美兼容 NextResponse
    // 注意：不要设置 Referer 为 gequbao，因为目标 CDN 可能拒绝跨域 Referer。
    // 大多数 CDN 直链不带 Referer 即可访问。
    const response = await fetch(playInfo.url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      referrerPolicy: 'no-referrer'
    });

    if (!response.ok) {
      throw new Error(`Upstream error: ${response.status}`);
    }

    // 3. 构建响应头
    const headers = new Headers();
    headers.set("Content-Type", response.headers.get("content-type") || "audio/mpeg");
    
    const contentLength = response.headers.get("content-length");
    if (contentLength) {
      headers.set("Content-Length", contentLength);
    }
    
    // 设置下载文件名
    const safeFilename = filename 
      ? encodeURIComponent(filename).replace(/%20/g, '+')
      : `music-${id}.mp3`;
      
    headers.set("Content-Disposition", `attachment; filename="${safeFilename}"; filename*=UTF-8''${safeFilename}`);

    // 4. 返回流
    return new NextResponse(response.body, {
      status: 200,
      headers,
    });

  } catch (error) {
    console.error("Download error:", error);
    return NextResponse.json({ error: "Download failed" }, { status: 500 });
  }
}
