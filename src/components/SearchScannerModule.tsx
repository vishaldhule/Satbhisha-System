import React, { useState } from 'react';
import { Search, Globe, Link, ExternalLink, ShieldCheck, Loader2, Sparkles, Copy, Check, FileText } from 'lucide-react';
import { playToolChime } from '../utils/audioSfx';

interface ScrapeResult {
  status: string;
  url: string;
  hostname: string;
  title: string;
  description: string;
  summary: string;
  wordCount: number;
  links: { title: string; href: string }[];
  scannedAt: string;
}

interface SearchScannerModuleProps {
  onSendToChat?: (text: string) => void;
}

export const SearchScannerModule: React.FC<SearchScannerModuleProps> = ({ onSendToChat }) => {
  const [urlInput, setUrlInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [scanResult, setScanResult] = useState<ScrapeResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const sampleUrls = [
    { name: 'Wikipedia: Artificial Intelligence', url: 'https://en.wikipedia.org/wiki/Artificial_intelligence' },
    { name: 'Pulse of AI HQ', url: 'https://pulseofai.com' },
    { name: 'GitHub Blog', url: 'https://github.blog' },
  ];

  const handleScanUrl = async (targetUrl?: string) => {
    const urlToScan = targetUrl || urlInput.trim();
    if (!urlToScan) return;

    setIsLoading(true);
    setError(null);
    setScanResult(null);
    playToolChime();

    try {
      const res = await fetch('/api/web/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlToScan }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to scan webpage');
      }

      setScanResult(data);
    } catch (err: any) {
      setError(err.message || 'An error occurred during URL extraction.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(searchQuery.trim())}`;
    window.open(googleUrl, '_blank', 'noopener,noreferrer');
  };

  const handleCopySummary = () => {
    if (!scanResult?.summary) return;
    navigator.clipboard.writeText(scanResult.summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto p-4 sm:p-6 max-w-5xl mx-auto w-full space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/80 border border-cyan-500/30 backdrop-blur-xl shadow-lg">
        <div>
          <div className="flex items-center space-x-2">
            <Globe className="w-5 h-5 text-cyan-400 animate-spin-slow" />
            <h2 className="text-lg font-bold text-slate-100 font-tech tracking-wide uppercase">
              Intelligent Search & URL Scanner
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            SSRF-guarded deep web crawler with page metadata extraction, article parsing, and AI summarization.
          </p>
        </div>
        <div className="flex items-center space-x-2 text-[11px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-3 py-1.5 rounded-xl w-fit">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>SSRF GUARD ACTIVE // ZERO LEAK</span>
        </div>
      </div>

      {/* URL Scanner Box */}
      <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
        <h3 className="text-xs font-bold text-cyan-400 font-tech uppercase tracking-wider flex items-center gap-2">
          <Link className="w-4 h-4 text-cyan-400" />
          <span>Deep Webpage Inspector</span>
        </h3>

        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="url"
              placeholder="Paste any website URL (e.g. https://en.wikipedia.org/wiki/AI)..."
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleScanUrl()}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-400 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none transition-all"
            />
          </div>
          <button
            onClick={() => handleScanUrl()}
            disabled={isLoading || !urlInput.trim()}
            className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold font-tech uppercase transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(0,229,255,0.3)] disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>{isLoading ? 'Scanning...' : 'Scan & Analyze'}</span>
          </button>
        </div>

        {/* Quick sample chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[10px] text-slate-500 font-mono">Quick Targets:</span>
          {sampleUrls.map((s, idx) => (
            <button
              key={idx}
              onClick={() => {
                setUrlInput(s.url);
                handleScanUrl(s.url);
              }}
              className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-cyan-500/50 text-slate-300 transition-all cursor-pointer"
            >
              {s.name}
            </button>
          ))}
        </div>
      </div>

      {/* External Search Bar */}
      <form onSubmit={handleSearchSubmit} className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
        <h3 className="text-xs font-bold text-slate-300 font-tech uppercase tracking-wider flex items-center gap-2">
          <Search className="w-4 h-4 text-cyan-400" />
          <span>Global Search Query</span>
        </h3>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search topic or question across the live web..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-400 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none transition-all"
          />
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 text-xs font-tech font-bold uppercase transition-all flex items-center gap-2 cursor-pointer"
          >
            <Search className="w-4 h-4" />
            <span>Search</span>
          </button>
        </div>
      </form>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/50 text-rose-300 text-xs font-mono">
          ⚠️ {error}
        </div>
      )}

      {/* Result Display */}
      {scanResult && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-cyan-500/40 space-y-5 shadow-2xl animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest">
                TARGET TELEMETRY // {scanResult.hostname}
              </span>
              <h3 className="text-base font-bold text-slate-100 font-tech mt-0.5">{scanResult.title}</h3>
              <a
                href={scanResult.url}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-mono text-cyan-400 hover:underline flex items-center gap-1 mt-1 break-all"
              >
                <span>{scanResult.url}</span>
                <ExternalLink className="w-3 h-3 flex-shrink-0" />
              </a>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono text-slate-400 bg-slate-950 px-3 py-1 rounded-lg border border-slate-800">
                {scanResult.wordCount} words
              </span>
              <button
                onClick={handleCopySummary}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 text-xs font-mono transition-all cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* AI Executive Summary */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <h4 className="text-xs font-bold text-cyan-300 font-tech uppercase tracking-wide">
                Executive Intelligence Brief
              </h4>
            </div>
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 font-sans leading-relaxed whitespace-pre-wrap">
              {scanResult.summary}
            </div>
          </div>

          {/* Key Links */}
          {scanResult.links && scanResult.links.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-800/80">
              <h4 className="text-xs font-bold text-slate-400 font-tech uppercase tracking-wide">
                Key Extracted References ({scanResult.links.length})
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {scanResult.links.map((link, idx) => (
                  <a
                    key={idx}
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 rounded-lg bg-slate-950/60 hover:bg-slate-800 border border-slate-800/80 hover:border-cyan-500/40 text-xs font-mono text-slate-300 transition-all flex items-center justify-between group"
                  >
                    <span className="truncate pr-2">{link.title || link.href}</span>
                    <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-cyan-400 flex-shrink-0" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Forward to Chat action */}
          {onSendToChat && (
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => {
                  onSendToChat(
                    `I analyzed ${scanResult.url} ("${scanResult.title}"). Summary: ${scanResult.summary.slice(0, 300)}... What do you think about this?`
                  );
                }}
                className="px-4 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 text-xs font-tech font-bold uppercase transition-all cursor-pointer flex items-center gap-2"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Discuss in Chat</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
