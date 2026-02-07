import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const userAgent = request.headers.get('user-agent')?.toLowerCase() || '';
  
  // 1. 차단 대상 (나쁜 봇 및 자동화 툴)
  const badBots = [
    'axios', 'python-requests', 'node-fetch', 'curl', 'headlesschrome',
    'scrapy', 'postman', 'insomnia', 'guzzle', 'go-http-client'
  ];

  if (badBots.some(bot => userAgent.includes(badBots as any))) {
    return new NextResponse(
      JSON.stringify({ error: 'Access Denied: Automated tools are not allowed.' }),
      { status: 403, headers: { 'content-type': 'application/json' } }
    );
  }

  // 2. 가짜 구글봇 검문 로직
  // User-Agent는 Googlebot인데 IP가 구글 대역이 아니거나 일반 데이터센터인 경우 (간소화된 로직)
  if (userAgent.includes('googlebot') || userAgent.includes('yeti')) {
    // 실제 운영 시에는 여기에 Google/Naver IP CIDR 체크를 추가하여 가짜를 걸러냅니다.
    // 현재는 단순 통과시키되, 비정상적인 헤더(예: sec-ch-ua-platform 미존재 등)를 추가로 볼 수 있습니다.
  }

  return NextResponse.next();
}

// 매칭 경로 설정: API 및 상세 페이지 보호
export const config = {
  matcher: ['/api/:path*', '/marathon/:path*'],
};
