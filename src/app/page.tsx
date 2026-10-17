'use client';

import { useState } from 'react';

export default function Home() {
  const [rfpTitle, setRfpTitle] = useState('');
  const [requirements, setRequirements] = useState('');
  const [streamData, setStreamData] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStreamData('');

    try {
      const response = await fetch('/api/rfp/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rfpTitle, requirements }),
      });

      if (!response.ok) {
        setStreamData('Hata: Yetkisiz erişim veya sunucu hatası.');
        setLoading(false);
        return;
      }

      if (!response.body) return;

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data: ')) {
            try {
              const json = JSON.parse(trimmed.replace('data: ', ''));
              if (json.text) {
                setStreamData((prev) => prev + json.text);
              }
            } catch (err) {
              // Hatalı paketleri pas geç
            }
          }
        }
      }
    } catch (error) {
      console.error('SSE hatasi:', error);
      setStreamData('Bağlantı hatası oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Kurumsal Header */}
        <header className="border-b border-slate-800 pb-6 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center font-bold text-lg text-white shadow-lg shadow-indigo-500/20">
                RFP
              </div>
              <h1 className="text-2xl font-bold text-slate-100 tracking-tight">
                BidFlow <span className="text-indigo-400 font-normal">AI</span>
              </h1>
            </div>
            <p className="text-slate-400 text-sm mt-1">
              Kurumsal İhale Analizi ve Otomatik Teklif Oluşturma Platformu
            </p>
          </div>
          <div className="flex items-center gap-2 bg-slate-800/80 px-3.5 py-1.5 rounded-full border border-slate-700/60 text-xs text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Enterprise Engine v1.0</span>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Sol Kolon: İhale Giriş Formu */}
          <form onSubmit={handleGenerate} className="bg-slate-800/60 backdrop-blur p-6 rounded-2xl border border-slate-700/60 space-y-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-700/50 pb-3">
              <h2 className="text-lg font-semibold text-slate-200">İhale & Şartname Detayları</h2>
              <span className="text-xs text-indigo-400 font-medium bg-indigo-500/10 px-2.5 py-1 rounded-md border border-indigo-500/20">
                AI Analiz Modu
              </span>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">İhale Başlığı</label>
              <input
                type="text"
                required
                placeholder="Örn: İzmir Bilişim Altyapı İhalesi"
                value={rfpTitle}
                onChange={(e) => setRfpTitle(e.target.value)}
                className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500 transition placeholder:text-slate-600"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Kritik Şartname Maddeleri & Gereksinimler</label>
              <textarea
                rows={6}
                required
                placeholder="Örn: 7/24 teknik destek, KVKK uyumluluğu, %99.9 uptime taahhüdü..."
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500 transition placeholder:text-slate-600"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-3 rounded-xl transition shadow-lg shadow-indigo-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  <span>Teklif Taslağı Oluşturuluyor...</span>
                </>
              ) : (
                'AI Teklif Taslağı Oluştur'
              )}
            </button>
          </form>

          {/* Sağ Kolon: Canlı SSE Yanıt Ekranı */}
          <div className="bg-slate-800/60 backdrop-blur p-6 rounded-2xl border border-slate-700/60 flex flex-col shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-700/50 pb-3 mb-4">
              <h2 className="text-lg font-semibold text-slate-200">Canlı Teklif Çıktısı</h2>
              <span className="text-xs text-emerald-400 font-medium bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                SSE Stream
              </span>
            </div>

            <div className="flex-1 bg-slate-950/80 rounded-xl p-4 font-mono text-sm text-slate-300 overflow-y-auto whitespace-pre-wrap border border-slate-800 min-h-[300px] shadow-inner">
              {streamData || <span className="text-slate-600">Teklif taslağı oluşturmak için şartname detaylarını girip butona tıklayın...</span>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
