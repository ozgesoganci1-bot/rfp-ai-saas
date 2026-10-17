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

      if (!response.body) return;

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const json = JSON.parse(line.replace('data: ', ''));
              setStreamData((prev) => prev + json.text);
            } catch (err) {
              // JSON parse pas geç
            }
          }
        }
      }
    } catch (error) {
      console.error('SSE hatasi:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="border-b border-slate-800 pb-4">
          <h1 className="text-3xl font-bold text-indigo-400">RFP & Bid Response SaaS Panel</h1>
          <p className="text-slate-400 text-sm mt-1">
            YBS Sunucu Tabanlı Programlama Projesi | SSE Canlı Teklif Oluşturucu
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <form onSubmit={handleGenerate} className="bg-slate-800 p-6 rounded-xl border border-slate-700 space-y-4">
            <h2 className="text-xl font-semibold text-slate-200">İhale & Şartname Bilgisi</h2>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">İhale Başlığı</label>
              <input
                type="text"
                required
                placeholder="Örn: İzmir Bilişim Altyapı İhalesi"
                value={rfpTitle}
                onChange={(e) => setRfpTitle(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Kritik Şartname Maddeleri</label>
              <textarea
                rows={5}
                required
                placeholder="Örn: 7/24 destek, KVKK uyumluluğu, %99.9 uptime taahhüdü..."
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2.5 rounded-lg transition disabled:opacity-50"
            >
              {loading ? 'AI Teklif Üretiyor (Streaming)...' : 'AI Teklif Taslağı Oluştur'}
            </button>
          </form>

          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 flex flex-col">
            <h2 className="text-xl font-semibold text-slate-200 mb-4">Canlı AI Yanıtı (SSE)</h2>
            <div className="flex-1 bg-slate-950 rounded-lg p-4 font-mono text-sm text-slate-300 overflow-y-auto whitespace-pre-wrap border border-slate-800">
              {streamData || <span className="text-slate-600">Teklif oluşturmak için formu doldurun...</span>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
