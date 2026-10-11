import React, { useState, useMemo } from "react";
import { Head, router } from "@inertiajs/react";
import {
  Activity,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Clock,
  Download,
  Eye,
  FlaskConical,
  Globe,
  Layers,
  LayoutDashboard,
  MessageCircle,
  MousePointerClick,
  RefreshCw,
  ShoppingCart,
  Sparkles,
  TrendingUp,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

interface ProjectItem {
  key: string;
  name: string;
  badge: string;
}

interface StatsData {
  total_visits: number;
  unique_visitors: number;
  engaged: number;
  engagement_rate: number;
  intent: number;
  intent_rate: number;
  direct_checkouts: number;
  direct_checkout_rate: number;
  whatsapp_leads: number;
  whatsapp_lead_rate: number;
  total_leads: number;
  total_lead_rate: number;
  total_leads_from_intent_rate: number;
}

interface FunnelStep {
  stage: string;
  count: number;
  percentage: number;
  dropoff_rate: number;
}

interface ChartItem {
  date: string;
  raw_date: string;
  visits: number;
  engaged: number;
  intent: number;
  leads: number;
}

interface ProjectBreakdownItem {
  key: string;
  name: string;
  visits: number;
  unique_visitors: number;
  intent: number;
  direct_checkouts: number;
  whatsapp_leads: number;
  leads: number;
  conversion_rate: number;
}

interface PerformanceMatrixItem {
  landing_source: string;
  project_key: string;
  project_name: string;
  visits: number;
  bounced: number;
  bounce_rate: number;
  engagement: number;
  engagement_rate: number;
  direct_checkouts: number;
  direct_checkout_rate: number;
  whatsapp_leads: number;
  whatsapp_lead_rate: number;
  total_leads: number;
  total_lead_rate: number;
  is_winner: boolean;
}

interface ReferralItem {
  referral_source: string;
  count: number;
}

interface UtmItem {
  utm_campaign: string;
  count: number;
}

interface RecentEventItem {
  id: string | number;
  project_key: string;
  session_id: string;
  event_type: string;
  referral_source: string | null;
  utm_source: string | null;
  utm_campaign: string | null;
  event_data: any;
  occurred_at: string;
}

interface SyncStatusRecord {
  id: number;
  project_key: string;
  project_name: string;
  last_synced_at: string | null;
  total_events_synced: number;
  last_batch_count: number;
  last_status: string;
  last_error_message: string | null;
}

interface Props {
  selectedProject: string;
  dateRange: string;
  projectsList: ProjectItem[];
  stats: StatsData;
  funnel: FunnelStep[];
  chartData: ChartItem[];
  projectBreakdown: ProjectBreakdownItem[];
  performanceMatrix: PerformanceMatrixItem[];
  projectMatrices: Record<string, PerformanceMatrixItem[]>;
  referralData: ReferralItem[];
  utmCampaignData: UtmItem[];
  recentEvents: RecentEventItem[];
  syncStatuses: Record<string, SyncStatusRecord>;
  availableProjects: string[];
}

export default function CentralizedAnalytics({
  selectedProject,
  dateRange,
  projectsList,
  stats,
  funnel,
  chartData,
  projectBreakdown,
  performanceMatrix,
  projectMatrices,
  referralData,
  utmCampaignData,
  recentEvents,
  syncStatuses,
  availableProjects,
}: Props) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "ab_labs" | "overview">("all");
  const [matrixSubProject, setMatrixSubProject] = useState<string>(
    selectedProject === "all" ? "project-pbm" : selectedProject
  );
  const [matrixViewMode, setMatrixViewMode] = useState<"cards" | "table">("cards");

  const handleProjectSelect = (projKey: string) => {
    router.get(
      "/analytics",
      { project: projKey, range: dateRange },
      { preserveState: true, replace: true }
    );
    if (projKey !== "all") {
      setMatrixSubProject(projKey);
    }
  };

  const handleRangeSelect = (range: string) => {
    router.get(
      "/analytics",
      { project: selectedProject, range },
      { preserveState: true, replace: true }
    );
  };

  const handleExport = () => {
    window.location.href = `/analytics/export?project=${selectedProject}&range=${dateRange}`;
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    router.get(
      "/analytics",
      { project: selectedProject, range: dateRange, refresh: "1" },
      {
        preserveState: true,
        preserveScroll: true,
        onFinish: () => setIsRefreshing(false),
      }
    );
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("id-ID").format(num || 0);
  };

  const formatRelativeTime = (isoString: string | null | undefined) => {
    if (!isoString) return "Belum pernah sync";
    try {
      const date = new Date(isoString);
      const diffSec = Math.floor((Date.now() - date.getTime()) / 1000);
      if (diffSec < 60) return "Baru saja";
      if (diffSec < 3600) return `${Math.floor(diffSec / 60)} menit lalu`;
      if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} jam lalu`;
      return `${Math.floor(diffSec / 86400)} hari lalu`;
    } catch {
      return isoString;
    }
  };

  const currentProjectName =
    projectsList.find((p) => p.key === selectedProject)?.name || "All Projects";

  // Active matrix data for A/B Labs section
  const currentMatrixList = useMemo(() => {
    if (selectedProject !== "all") {
      return performanceMatrix || [];
    }
    if (matrixSubProject && projectMatrices[matrixSubProject]) {
      return projectMatrices[matrixSubProject];
    }
    return performanceMatrix || [];
  }, [selectedProject, matrixSubProject, performanceMatrix, projectMatrices]);

  const activeMatrixWinner = useMemo(() => {
    return currentMatrixList.find((item) => item.is_winner);
  }, [currentMatrixList]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-purple-600/30">
      <Head title={`Centralized Analytics & A/B Labs — ${currentProjectName}`} />

      {/* Radial ambient glow */}
      <div className="pointer-events-none fixed inset-x-0 top-0 h-96 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(168,85,247,0.18),transparent_70%)]" />

      {/* Top Header Navigation */}
      <header className="sticky top-0 z-40 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 shadow-md shadow-purple-500/20">
              <FlaskConical className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold tracking-tight text-white text-base">
                  PBM Ops Board
                </span>
                <span className="rounded-full bg-purple-500/10 px-2 py-0.5 text-[10px] font-semibold text-purple-400 border border-purple-500/20">
                  Analytics &amp; A/B Labs
                </span>
              </div>
              <p className="text-xs text-zinc-400 hidden sm:block">
                Centralized Performance Matrix &amp; Multi-Web Routings
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/90 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white transition shadow-sm"
              title="Refresh Data"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`}
              />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <button
              onClick={handleExport}
              className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/90 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white transition shadow-sm"
            >
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Export Routing CSV</span>
            </button>

            <a
              href="/"
              className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-800/90 hover:bg-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-200 transition"
            >
              <LayoutDashboard className="h-3.5 w-3.5" />
              <span>Ops Board</span>
            </a>
          </div>
        </div>

        {/* Project Selector Bar */}
        <div className="border-t border-zinc-800/60 bg-zinc-900/40">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 overflow-x-auto px-4 py-2 sm:px-6">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mr-1 hidden md:inline">
                Web:
              </span>
              {projectsList.map((project) => {
                const isActive = selectedProject === project.key;
                return (
                  <button
                    key={project.key}
                    onClick={() => handleProjectSelect(project.key)}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-all ${
                      isActive
                        ? "bg-purple-600 text-white shadow-sm shadow-purple-600/30 font-semibold"
                        : "text-zinc-400 hover:bg-zinc-800/70 hover:text-zinc-200"
                    }`}
                  >
                    <Globe className="h-3.5 w-3.5 opacity-70" />
                    <span>{project.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Date Range Selector */}
            <div className="flex items-center gap-1 bg-zinc-900 rounded-lg p-0.5 border border-zinc-800/80">
              {[
                { label: "7 Hari", value: "7" },
                { label: "30 Hari", value: "30" },
                { label: "90 Hari", value: "90" },
                { label: "1 Tahun", value: "365" },
              ].map((item) => (
                <button
                  key={item.value}
                  onClick={() => handleRangeSelect(item.value)}
                  className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
                    dateRange === item.value
                      ? "bg-zinc-800 text-white shadow"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Section View Mode Tabs (All / A-B Labs / Analytics) */}
        <div className="border-t border-zinc-800/40 bg-zinc-950/60 px-4 py-1.5 sm:px-6">
          <div className="mx-auto flex max-w-7xl items-center gap-2">
            {[
              { id: "all", label: "Dashboard Lengkap (Semua)", icon: Layers },
              {
                id: "ab_labs",
                label: "A/B Labs (Performance Matrix)",
                icon: Trophy,
              },
              { id: "overview", label: "Analytics Overview", icon: BarChart3 },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium transition ${
                    isActive
                      ? "bg-purple-950/60 text-purple-300 border border-purple-500/40"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 space-y-8">
        {/* ========================================================================= */}
        {/* SECTION 1: A/B LABS PERFORMANCE MATRIX (MATCHING USER SCREENSHOT) */}
        {/* ========================================================================= */}
        {(activeTab === "all" || activeTab === "ab_labs") && (
          <section className="space-y-4">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 backdrop-blur-md shadow-xl">
              {/* Header Matching Image */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-zinc-800/80">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30">
                    <Trophy className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                      Performance Matrix
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        A/B Labs
                      </span>
                    </h2>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Landing page comparison sorted by Total Lead Rate
                    </p>
                  </div>
                </div>

                {/* Sub-project Switcher (when All Projects is chosen) */}
                <div className="flex flex-wrap items-center gap-2">
                  {selectedProject === "all" && (
                    <div className="flex items-center gap-1 bg-zinc-950/80 p-1 rounded-xl border border-zinc-800">
                      {[
                        { key: "project-pbm", label: "Project PBM" },
                        { key: "lp-gorden", label: "LP Gorden" },
                        { key: "lp-menjangan", label: "LP Menjangan" },
                        { key: "ecourse-ka-tsan", label: "Ecourse Ka Tsan" },
                      ].map((item) => (
                        <button
                          key={item.key}
                          onClick={() => setMatrixSubProject(item.key)}
                          className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                            matrixSubProject === item.key
                              ? "bg-purple-600 text-white font-semibold shadow-sm"
                              : "text-zinc-400 hover:text-zinc-200"
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Toggle Cards / Table */}
                  <div className="flex items-center gap-1 bg-zinc-950/80 p-1 rounded-xl border border-zinc-800">
                    <button
                      onClick={() => setMatrixViewMode("cards")}
                      className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                        matrixViewMode === "cards"
                          ? "bg-zinc-800 text-white"
                          : "text-zinc-400 hover:text-zinc-200"
                      }`}
                    >
                      Cards
                    </button>
                    <button
                      onClick={() => setMatrixViewMode("table")}
                      className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                        matrixViewMode === "table"
                          ? "bg-zinc-800 text-white"
                          : "text-zinc-400 hover:text-zinc-200"
                      }`}
                    >
                      Tabel
                    </button>
                  </div>
                </div>
              </div>

              {/* Information pill about active A/B testing project */}
              <div className="flex items-center justify-between text-xs text-zinc-400 mb-3 px-1">
                <span>
                  Menampilkan routing aktif untuk:{" "}
                  <strong className="text-purple-300">
                    {selectedProject === "all"
                      ? projectsList.find((p) => p.key === matrixSubProject)?.name || matrixSubProject
                      : currentProjectName}
                  </strong>{" "}
                  ({currentMatrixList.length} routing variants diuji)
                </span>
                {activeMatrixWinner && (
                  <span className="flex items-center gap-1 text-purple-400 font-medium">
                    <Trophy className="h-3 w-3" />
                    Winner saat ini:{" "}
                    <code className="bg-purple-950/80 px-1 py-0.5 rounded text-white font-bold">
                      {activeMatrixWinner.landing_source}
                    </code>{" "}
                    ({activeMatrixWinner.total_lead_rate}% CR)
                  </span>
                )}
              </div>

              {/* CARDS VIEW: EXACTLY AS SHOWN IN THE USER PHOTO */}
              {matrixViewMode === "cards" && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {currentMatrixList.map((item) => {
                    const isWinner = item.is_winner;
                    const isHighBounce = item.bounce_rate > 80;

                    return (
                      <div
                        key={item.landing_source}
                        className={`rounded-2xl border p-5 transition-all relative ${
                          isWinner
                            ? "border-purple-500 bg-purple-950/15 shadow-xl shadow-purple-950/30 ring-1 ring-purple-500/40"
                            : "border-zinc-800/80 bg-zinc-950/60 hover:border-zinc-700"
                        }`}
                      >
                        {/* Card Header */}
                        <div className="flex items-center justify-between mb-4">
                          <span className="font-mono text-base font-bold text-white tracking-tight">
                            {item.landing_source}
                          </span>
                          {isWinner && (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-600 px-3 py-1 text-xs font-semibold text-white shadow-md shadow-purple-600/40">
                              <Trophy className="h-3.5 w-3.5" />
                              Winner
                            </span>
                          )}
                        </div>

                        {/* 2-Column Metrics Grid Matching Photo */}
                        <div className="grid grid-cols-2 gap-y-3.5 gap-x-4 text-xs">
                          {/* Row 1: Visits & Bounce */}
                          <div>
                            <span className="text-zinc-400">Visits:</span>{" "}
                            <span className="font-bold text-white text-sm">
                              {formatNumber(item.visits)}
                            </span>
                          </div>
                          <div>
                            <span className="text-zinc-400">Bounce (full range):</span>{" "}
                            <span
                              className={`font-semibold ${
                                isHighBounce ? "text-rose-400" : "text-zinc-200"
                              }`}
                            >
                              {item.bounce_rate.toFixed(1)}%
                            </span>
                          </div>

                          {/* Row 2: Engagement & Direct Checkout */}
                          <div>
                            <span className="text-zinc-400">Engagement:</span>{" "}
                            <span className="font-semibold text-zinc-200">
                              {item.engagement_rate.toFixed(1)}%
                            </span>
                          </div>
                          <div>
                            <span className="text-zinc-400">Direct Checkout:</span>{" "}
                            <span className="font-semibold text-sky-400">
                              {item.direct_checkout_rate.toFixed(2)}%
                            </span>
                          </div>

                          {/* Row 3: WhatsApp Lead Rate & Total Leads CR */}
                          <div>
                            <span className="text-zinc-400 block mb-1">
                              WhatsApp Lead Rate:
                            </span>
                            <span className="inline-block rounded-md bg-zinc-800/90 px-2 py-0.5 text-xs font-medium text-emerald-300 border border-zinc-700">
                              {item.whatsapp_lead_rate.toFixed(2)}%
                            </span>
                          </div>
                          <div>
                            <span className="text-zinc-400 block mb-1">
                              Total Leads CR:
                            </span>
                            <span
                              className={`inline-block rounded-md px-2.5 py-0.5 text-xs font-bold ${
                                isWinner
                                  ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                                  : "bg-zinc-800/90 text-zinc-200 border border-zinc-700"
                              }`}
                            >
                              {item.total_lead_rate.toFixed(2)}%
                            </span>
                          </div>
                        </div>

                        {/* Leads Count Breakdown footer */}
                        <div className="mt-4 pt-3 border-t border-zinc-800/60 flex items-center justify-between text-[11px] text-zinc-400">
                          <span>
                            Direct: <strong className="text-white">{item.direct_checkouts}</strong>
                          </span>
                          <span>
                            WA: <strong className="text-white">{item.whatsapp_leads}</strong>
                          </span>
                          <span>
                            Total: <strong className="text-emerald-400 font-bold">{item.total_leads}</strong>
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* TABLE VIEW: FOR DETAILED DATA COMPARISON */}
              {matrixViewMode === "table" && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-zinc-800 text-zinc-400 uppercase text-[10px] tracking-wider">
                      <tr>
                        <th className="pb-3 font-semibold">Routing / Landing Page</th>
                        <th className="pb-3 font-semibold text-right">Visits</th>
                        <th className="pb-3 font-semibold text-right">Bounce Rate</th>
                        <th className="pb-3 font-semibold text-right">Engagement</th>
                        <th className="pb-3 font-semibold text-right">Direct Checkout</th>
                        <th className="pb-3 font-semibold text-right">WA Lead Rate</th>
                        <th className="pb-3 font-semibold text-right">Total Leads CR</th>
                        <th className="pb-3 font-semibold text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/60">
                      {currentMatrixList.map((item) => (
                        <tr
                          key={item.landing_source}
                          className={`hover:bg-zinc-800/30 transition-colors ${
                            item.is_winner ? "bg-purple-950/20 font-semibold" : ""
                          }`}
                        >
                          <td className="py-3 font-mono text-zinc-200">
                            {item.landing_source}
                          </td>
                          <td className="py-3 text-right text-zinc-300">
                            {formatNumber(item.visits)}
                          </td>
                          <td className="py-3 text-right text-zinc-300">
                            {item.bounce_rate.toFixed(1)}%
                          </td>
                          <td className="py-3 text-right text-zinc-300">
                            {item.engagement_rate.toFixed(1)}%
                          </td>
                          <td className="py-3 text-right text-sky-400">
                            {item.direct_checkout_rate.toFixed(2)}% ({item.direct_checkouts})
                          </td>
                          <td className="py-3 text-right text-emerald-400">
                            {item.whatsapp_lead_rate.toFixed(2)}% ({item.whatsapp_leads})
                          </td>
                          <td className="py-3 text-right font-bold text-white">
                            <span
                              className={`rounded-md px-2 py-0.5 text-xs ${
                                item.is_winner
                                  ? "bg-purple-600 text-white"
                                  : "bg-zinc-800 text-zinc-300"
                              }`}
                            >
                              {item.total_lead_rate.toFixed(2)}%
                            </span>
                          </td>
                          <td className="py-3 text-right">
                            {item.is_winner ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-400">
                                <Trophy className="h-3 w-3" /> Winner
                              </span>
                            ) : (
                              <span className="text-zinc-500 text-[11px]">Variant</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ========================================================================= */}
        {/* SECTION 2: DETAILED ANALYTICS OVERVIEW (MATCHING ADMIN DASHBOARD) */}
        {/* ========================================================================= */}
        {(activeTab === "all" || activeTab === "overview") && (
          <section className="space-y-6">
            {/* Sync Status Hub */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4 backdrop-blur-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 pb-3 border-b border-zinc-800/60">
                <div className="flex items-center gap-2">
                  <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <h2 className="text-sm font-semibold text-zinc-200">
                    Status API Analytics Project
                  </h2>
                </div>
                <p className="text-xs text-zinc-400">
                  Board memperbarui data dari API project setiap 5 menit
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  {
                    key: "ecourse-ka-tsan",
                    name: "Ecourse Ka Tsan",
                  },
                  { key: "lp-gorden", name: "LP Gorden" },
                  { key: "lp-menjangan", name: "LP Menjangan" },
                  { key: "project-pbm", name: "Project PBM" },
                ].map((p) => {
                  const status = syncStatuses[p.key];
                  const isSelected = selectedProject === p.key;

                  return (
                    <div
                      key={p.key}
                      onClick={() => handleProjectSelect(p.key)}
                      className={`cursor-pointer rounded-xl border p-3 transition-all ${
                        isSelected
                          ? "border-purple-500 bg-purple-950/20 ring-1 ring-purple-500/30"
                          : "border-zinc-800/70 bg-zinc-950/40 hover:border-zinc-700 hover:bg-zinc-900/60"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-zinc-200 truncate">
                          {p.name}
                        </span>
                        <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full border ${status?.last_status === "error" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" : availableProjects.includes(p.key) ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border-rose-500/20"}`}>
                          {status?.last_status === "error" ? "API gagal" : availableProjects.includes(p.key) ? "Tersedia" : "Tidak tersedia"}
                        </span>
                      </div>

                      <div className="mt-2 flex items-baseline justify-between text-xs">
                        <span className="text-zinc-500">Terakhir diambil:</span>
                        <span className="font-medium text-zinc-300">
                          {formatRelativeTime(status?.last_synced_at)}
                        </span>
                      </div>

                      <div className="mt-1 flex items-baseline justify-between text-xs">
                        <span className="text-zinc-500">Visits pada feed:</span>
                        <span className="font-semibold text-purple-400">
                          {formatNumber(status?.total_events_synced || 0)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* KPI Cards: Complete with Direct Checkout, WhatsApp Leads, etc. */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1: Visits & Unique Visitors */}
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
                <div className="flex items-center justify-between text-zinc-400">
                  <span className="text-xs font-medium uppercase tracking-wider">
                    Total Visits
                  </span>
                  <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                    <Eye className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-3xl font-bold tracking-tight text-white">
                    {formatNumber(stats.total_visits)}
                  </span>
                </div>
                <div className="mt-2 text-xs text-zinc-400 flex items-center justify-between">
                  <span>Unique Visitors:</span>
                  <strong className="text-zinc-200">
                    {formatNumber(stats.unique_visitors)}
                  </strong>
                </div>
              </div>

              {/* Card 2: Engagement & Intent */}
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
                <div className="flex items-center justify-between text-zinc-400">
                  <span className="text-xs font-medium uppercase tracking-wider">
                    Engagement &amp; Intent
                  </span>
                  <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400">
                    <Activity className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-3xl font-bold tracking-tight text-white">
                    {stats.engagement_rate}%
                  </span>
                  <span className="text-xs text-zinc-400 font-medium">
                    Engaged ({formatNumber(stats.engaged)})
                  </span>
                </div>
                <div className="mt-2 text-xs text-zinc-400 flex items-center justify-between">
                  <span>Purchase Intent (Clicks):</span>
                  <strong className="text-amber-400">
                    {stats.intent_rate}% ({stats.intent})
                  </strong>
                </div>
              </div>

              {/* Card 3: Direct Checkout */}
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
                <div className="flex items-center justify-between text-zinc-400">
                  <span className="text-xs font-medium uppercase tracking-wider text-sky-400">
                    Direct Checkout
                  </span>
                  <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400">
                    <ShoppingCart className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-3xl font-bold tracking-tight text-white">
                    {formatNumber(stats.direct_checkouts)}
                  </span>
                  <span className="text-xs font-semibold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-full border border-sky-500/20">
                    {stats.direct_checkout_rate}% Rate
                  </span>
                </div>
                <div className="mt-2 text-xs text-zinc-400">
                  <span>Pembayaran langsung / Checkout redirect</span>
                </div>
              </div>

              {/* Card 4: WhatsApp Leads & Total Leads */}
              <div className="rounded-2xl border border-zinc-800 bg-gradient-to-br from-purple-950/30 to-zinc-900/80 p-5">
                <div className="flex items-center justify-between text-zinc-400">
                  <span className="text-xs font-medium uppercase tracking-wider text-emerald-400">
                    Total Leads Acquired
                  </span>
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                    <TrendingUp className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-3xl font-bold tracking-tight text-white">
                    {formatNumber(stats.total_leads)}
                  </span>
                  <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    {stats.total_lead_rate}% Total CR
                  </span>
                </div>
                <div className="mt-2 text-xs text-zinc-400 flex items-center justify-between">
                  <span>
                    WA Leads: <strong className="text-white">{stats.whatsapp_leads}</strong>
                  </span>
                  <span>
                    Direct: <strong className="text-white">{stats.direct_checkouts}</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Daily Trend Chart & Conversion Funnel */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Daily Trend Chart */}
              <div className="lg:col-span-2 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-semibold text-white">
                      Tren Harian Traffic &amp; Leads ({currentProjectName})
                    </h3>
                    <p className="text-xs text-zinc-400">
                      Pergerakan kunjungan dan perolehan leads per tanggal
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="flex items-center gap-1.5 text-zinc-400">
                      <span className="h-2 w-2 rounded-full bg-purple-500" /> Visits
                    </span>
                    <span className="flex items-center gap-1.5 text-zinc-400">
                      <span className="h-2 w-2 rounded-full bg-emerald-400" /> Leads
                    </span>
                  </div>
                </div>

                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={chartData}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#a855f7" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#a855f7" stopOpacity={0.0} />
                        </linearGradient>
                        <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                      <XAxis
                        dataKey="date"
                        stroke="#71717a"
                        tick={{ fontSize: 11 }}
                        tickLine={false}
                      />
                      <YAxis stroke="#71717a" tick={{ fontSize: 11 }} tickLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#18181b",
                          borderColor: "#27272a",
                          borderRadius: "0.5rem",
                          fontSize: "12px",
                          color: "#f4f4f5",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="visits"
                        name="Visits"
                        stroke="#a855f7"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorVisits)"
                      />
                      <Area
                        type="monotone"
                        dataKey="leads"
                        name="Leads"
                        stroke="#10b981"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorLeads)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Conversion Funnel */}
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-white">
                    Conversion Funnel
                  </h3>
                  <p className="text-xs text-zinc-400 mb-4">
                    Alur konversi dari kunjungan hingga leads
                  </p>

                  <div className="space-y-2.5">
                    {funnel.map((step) => (
                      <div
                        key={step.stage}
                        className="rounded-xl border border-zinc-800/80 bg-zinc-950/60 p-2.5"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-zinc-300">
                            {step.stage}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-white">
                              {formatNumber(step.count)}
                            </span>
                            <span className="text-[10px] text-zinc-400">
                              ({step.percentage}%)
                            </span>
                          </div>
                        </div>

                        <div className="mt-1.5 h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-purple-500 transition-all duration-500"
                            style={{ width: `${Math.min(100, step.percentage)}%` }}
                          />
                        </div>

                        {step.dropoff_rate > 0 && (
                          <div className="mt-1 text-right text-[10px] text-rose-400">
                            Drop: {step.dropoff_rate}%
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-zinc-800/80 text-xs text-zinc-400 flex items-center justify-between">
                  <span>Intent to Lead CV Rate:</span>
                  <span className="font-semibold text-emerald-400">
                    {stats.total_leads_from_intent_rate}%
                  </span>
                </div>
              </div>
            </div>

            {/* Cross-Project Performance Matrix Summary (when viewing All Projects) */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-white">
                    Perbandingan Performa Antar 4 Proyek Web
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Perbandingan metrik utama dari masing-masing platform
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-zinc-800 text-zinc-400 uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="pb-3 font-semibold">Proyek</th>
                      <th className="pb-3 font-semibold text-right">Total Visits</th>
                      <th className="pb-3 font-semibold text-right">Unique Visitors</th>
                      <th className="pb-3 font-semibold text-right">Direct Checkout</th>
                      <th className="pb-3 font-semibold text-right">WhatsApp Leads</th>
                      <th className="pb-3 font-semibold text-right">Total Leads</th>
                      <th className="pb-3 font-semibold text-right">Conversion Rate</th>
                      <th className="pb-3 font-semibold text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60">
                    {projectBreakdown.map((row) => (
                      <tr
                        key={row.key}
                        className="hover:bg-zinc-800/30 transition-colors"
                      >
                        <td className="py-3 font-medium text-zinc-200 flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-purple-500" />
                          {row.name}
                        </td>
                        <td className="py-3 text-right text-zinc-300">
                          {formatNumber(row.visits)}
                        </td>
                        <td className="py-3 text-right text-zinc-300">
                          {formatNumber(row.unique_visitors)}
                        </td>
                        <td className="py-3 text-right text-sky-400 font-medium">
                          {formatNumber(row.direct_checkouts)}
                        </td>
                        <td className="py-3 text-right text-emerald-400 font-medium">
                          {formatNumber(row.whatsapp_leads)}
                        </td>
                        <td className="py-3 text-right text-emerald-400 font-bold">
                          {formatNumber(row.leads)}
                        </td>
                        <td className="py-3 text-right">
                          <span className="rounded-full bg-purple-500/10 px-2 py-0.5 text-xs font-semibold text-purple-300 border border-purple-500/20">
                            {row.conversion_rate}%
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <button
                            onClick={() => handleProjectSelect(row.key)}
                            className="inline-flex items-center gap-1 text-[11px] font-medium text-purple-400 hover:text-purple-300 transition"
                          >
                            Buka <ArrowRight className="h-3 w-3" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Traffic Sources & Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Traffic Sources */}
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
                <h3 className="text-sm font-semibold text-white mb-1">
                  Top Traffic Sources
                </h3>
                <p className="text-xs text-zinc-400 mb-4">
                  Sumber rujukan pengunjung terbanyak
                </p>

                {referralData.length === 0 ? (
                  <div className="py-8 text-center text-xs text-zinc-500">
                    Belum ada data referral tercatat
                  </div>
                ) : (
                  <div className="space-y-2">
                    {referralData.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-xs rounded-lg bg-zinc-950/60 p-2.5 border border-zinc-800/60"
                      >
                        <span className="font-medium text-zinc-300 truncate max-w-[200px]">
                          {item.referral_source || "Direct / Unknown"}
                        </span>
                        <span className="font-semibold text-purple-400">
                          {formatNumber(item.count)} visits
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Activity Table */}
              <div className="lg:col-span-2 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-semibold text-white">
                      Event Terbaru dari API Project
                    </h3>
                    <p className="text-xs text-zinc-400">
                      20 aktivitas terbaru dari feed project yang tersedia
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-zinc-800 text-zinc-400 uppercase text-[10px] tracking-wider">
                      <tr>
                        <th className="pb-2.5 font-semibold">Waktu</th>
                        <th className="pb-2.5 font-semibold">Proyek</th>
                        <th className="pb-2.5 font-semibold">Tipe Event</th>
                        <th className="pb-2.5 font-semibold">Landing / Routing</th>
                        <th className="pb-2.5 font-semibold">Session ID</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/40">
                      {recentEvents.map((ev) => {
                        const eventBadgeColor =
                          ev.event_type === "conversion"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : ev.event_type === "payment"
                            ? "bg-sky-500/10 text-sky-400 border-sky-500/20"
                            : ev.event_type === "cta_click"
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                            : ev.event_type === "visit"
                            ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                            : "bg-zinc-800 text-zinc-300 border-zinc-700";

                        const routing =
                          ev.event_data?.landing_source ||
                          ev.event_data?.page ||
                          "-";

                        return (
                          <tr
                            key={ev.id}
                            className="hover:bg-zinc-800/20 transition-colors"
                          >
                            <td className="py-2.5 text-zinc-400 whitespace-nowrap">
                              {new Date(ev.occurred_at).toLocaleTimeString("id-ID", {
                                hour: "2-digit",
                                minute: "2-digit",
                                second: "2-digit",
                              })}
                            </td>
                            <td className="py-2.5 font-medium text-zinc-200 whitespace-nowrap">
                              {ev.project_key}
                            </td>
                            <td className="py-2.5">
                              <span
                                className={`rounded px-1.5 py-0.5 text-[10px] font-medium border ${eventBadgeColor}`}
                              >
                                {ev.event_type}
                              </span>
                            </td>
                            <td className="py-2.5 font-mono text-zinc-300 truncate max-w-[150px]">
                              {routing}
                            </td>
                            <td className="py-2.5 text-zinc-500 font-mono text-[11px] truncate max-w-[120px]">
                              {ev.session_id.substring(0, 12)}...
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
