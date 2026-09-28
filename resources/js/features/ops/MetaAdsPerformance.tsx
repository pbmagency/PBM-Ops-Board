import { ExternalLink, RefreshCw } from "lucide-react";

const META_ADS_DASHBOARD_URL =
  "https://pbm-performance-dashboard.agencypbm.chatgpt.site";

export default function MetaAdsPerformance() {
  return (
    <section aria-labelledby="meta-ads-title">
      <header className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-violet-400">
            Marketing performance
          </p>
          <h1 id="meta-ads-title" className="mt-1 text-2xl font-semibold">
            Meta Ads
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-400">
            Performa bulanan dan rincian harian akun PBM. Hari tanpa delivery
            tidak ditampilkan karena campaign sedang off atau pause.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-2 text-xs font-medium text-emerald-300">
            <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
            Diperbarui otomatis setiap hari
          </span>
          <a
            className="ops-button"
            href={META_ADS_DASHBOARD_URL}
            target="_blank"
            rel="noreferrer"
          >
            Buka layar penuh
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>
      </header>

      <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl shadow-black/20">
        <iframe
          className="block h-[76dvh] min-h-[680px] w-full bg-white"
          src={META_ADS_DASHBOARD_URL}
          title="Dashboard performa Meta Ads PBM"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
          referrerPolicy="no-referrer"
        />
      </div>
    </section>
  );
}
