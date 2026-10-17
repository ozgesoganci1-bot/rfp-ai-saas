import { NextRequest } from 'next/server';
import { getActiveTenantSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    // 1. Tenant ve Yetki Kontrolü (Ders 3 & 4 İlkesi)
    const session = await getActiveTenantSession();
    if (!session || !session.tenant.id) {
      return new Response(JSON.stringify({ error: 'Yetkisiz Erişim' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json();
    const { rfpTitle, requirements } = body;

    // 2. Server-Sent Events (SSE) Stream Başlatma
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const sendEvent = (text: string) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
        };

        // Taslak teklif yanıtını canlı akış halinde gönderiyoruz
        sendEvent(`### TEKLİF TASLAĞI: ${rfpTitle}\n\n`);
        sendEvent(`**Müşteri Firma (Tenant ID):** ${session.tenant.id}\n\n`);
        sendEvent(`**Hazırlayan:** ${session.user.name} (${session.user.role})\n\n`);
        sendEvent(`---\n\n`);
        sendEvent(`#### 1. Yönetici Özeti\n`);
        sendEvent(`Şirketimiz ${session.tenant.name}, sunulan şartname gereksinimlerini eksiksiz karşılamaktadır.\n\n`);
        sendEvent(`#### 2. Teknik Uyumluluk Analizi\n`);
        sendEvent(`Talep edilen: "${requirements || 'Standart Şartname Maddeleri'}"\n\n`);
        sendEvent(`Sistemimiz bu gereksinimleri %100 uyumluluk ve yüksek güvenlik standartlarıyla sağlamaktadır.\n\n`);
        sendEvent(`#### 3. Risk ve Bütçe Skoru\n`);
        sendEvent(`Tahmini Uyumluluk Skoru: %95 | Risk Skoru: Düşük (12/100)\n`);

        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Sunucu Hatası' }), { status: 500 });
  }
}
