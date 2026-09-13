// @ts-nocheck -- faithful port of the approved interactive MVP; typed Inertia props live at the page boundary.
import { createContext, useContext, useEffect, useRef, useState } from "react";
import TeamPerformance, { createTeamSeed } from "./TeamPerformance";
import { router } from "@inertiajs/react";
import {
  LayoutDashboard,
  LayoutGrid,
  Users,
  ListTodo,
  AlertTriangle,
  Clock,
  GitBranch,
  RotateCcw,
  X,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  CalendarDays,
  Flag,
  Zap,
  MessageSquare,
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle2,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  Search,
  Archive,
  LogOut,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

/* PBM Ops application UI. */

const ACCENT = "#4F39F6";

const COLOR = {
  accent: ACCENT,
  emerald: "#34D399",
  amber: "#FBBF24",
  rose: "#FB7185",
  zinc: "#A1A1AA",
  pink: "#F472B6",
  sky: "#38BDF8",
  violet: "#A78BFA",
  orange: "#FB923C",
};

function rgba(hex, alpha) {
  const n = hex.replace("#", "");
  const r = parseInt(n.substring(0, 2), 16);
  const g = parseInt(n.substring(2, 4), 16);
  const b = parseInt(n.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function pillStyle(color) {
  return {
    backgroundColor: rgba(color, 0.12),
    color,
    border: `1px solid ${rgba(color, 0.28)}`,
  };
}

/* -------------------------- data model: delivery -------------------------- */

const STATUSES = [
  {
    id: "intake",
    label: "Intake & Backlog",
    short: "Intake",
    color: "#71717a",
  },
  {
    id: "strategy",
    label: "Strategy & Copy",
    short: "Strategy",
    color: "#818cf8",
  },
  {
    id: "design",
    label: "Design & Backend",
    short: "Design & Backend",
    color: COLOR.violet,
  },
  {
    id: "frontend",
    label: "Frontend Build",
    short: "Frontend",
    color: COLOR.sky,
  },
  { id: "staging", label: "Staging", short: "Staging", color: COLOR.amber },
  {
    id: "qa",
    label: "Internal QA & Testing",
    short: "QA",
    color: COLOR.emerald,
  },
  {
    id: "review",
    label: "Client Review & Revision",
    short: "Review",
    color: COLOR.rose,
  },
  { id: "done", label: "Live & Done", short: "Done", color: "#52525b" },
];
const STATUS_BY_ID = Object.fromEntries(STATUSES.map((s) => [s.id, s]));

const PIC = {
  coo: {
    name: "COO",
    role: "COO",
    initials: "CO",
    color: COLOR.orange,
  },
  developer: {
    name: "Developer",
    role: "Developer",
    initials: "DE",
    color: COLOR.sky,
  },
  creative: {
    name: "Creative",
    role: "Creative",
    initials: "CR",
    color: COLOR.pink,
  },
  "digital-marketer": {
    name: "Digital Marketer",
    role: "Digital Marketer",
    initials: "DM",
    color: COLOR.violet,
  },
  "project-manager": {
    name: "Project Manager",
    role: "Project Manager",
    initials: "PM",
    color: COLOR.emerald,
  },
  cmo: { name: "CMO", role: "CMO", initials: "CM", color: COLOR.violet },
  "marketing-manager": {
    name: "Marketing Manager",
    role: "Marketing Manager",
    initials: "MM",
    color: COLOR.amber,
  },
  "content-specialist": {
    name: "Content Specialist",
    role: "Content Specialist",
    initials: "CS",
    color: COLOR.pink,
  },
  "appointment-setter": {
    name: "Appointment Setter",
    role: "Appointment Setter",
    initials: "AS",
    color: COLOR.sky,
  },
};

const SEED_CLIENTS = [
  {
    id: "fullbright",
    name: "Fullbright",
    contract: "3-Month Retainer",
    cycle: 2,
    phase: "Optimization & QA Routing",
    health: "on-track",
    revision: 1,
    bottleneck: "Menunggu approval client untuk routing domain baru",
  },
  {
    id: "shaundju",
    name: "Shaundju Academy",
    contract: "2-Month Retainer",
    cycle: 1,
    phase: "Build LP Variasi 1",
    health: "delayed",
    revision: 2,
    bottleneck: "Copy hero section masih revisi ke-2 dari Digital Marketer",
  },
  {
    id: "gumpreneur",
    name: "Gumpreneur",
    contract: "1-Month Retainer",
    cycle: 3,
    phase: "Client Review & Approval",
    health: "blocked",
    revision: 3,
    bottleneck: "Menunggu keputusan pricing final dari COO",
  },
  {
    id: "gorden",
    name: "Gorden Wallpaper Solo",
    contract: "Project-Based",
    cycle: 1,
    phase: "Onboarding & Tech Setup",
    health: "on-track",
    revision: 0,
    bottleneck: "Setup domain & tracking pixel",
  },
  {
    id: "menjangan",
    name: "Menjangan Island Trip",
    contract: "3-Month Retainer",
    cycle: 2,
    phase: "Monthly Reporting",
    health: "on-track",
    revision: 0,
    bottleneck: "Compile laporan performa bulan ini",
  },
];
const CLIENT_COLOR = {
  fullbright: ACCENT,
  shaundju: COLOR.sky,
  gumpreneur: COLOR.rose,
  gorden: COLOR.violet,
  menjangan: COLOR.emerald,
};

const SEED_TASKS = [
  {
    id: 1,
    name: "Fix Cloudflare routing",
    client: "fullbright",
    status: "qa",
    pic: "developer",
    due: "2026-09-02",
    cycle: 2,
    revision: 0,
    priority: "normal",
    type: "feature",
    brief:
      "Perbaiki konfigurasi routing Cloudflare yang menyebabkan cache tidak ter-invalidate setelah deploy. Cek juga page rules untuk /checkout.",
  },
  {
    id: 2,
    name: "Revisi hero copy round 2",
    client: "shaundju",
    status: "review",
    pic: "digital-marketer",
    due: "2026-08-30",
    cycle: 1,
    revision: 2,
    priority: "urgent",
    type: "feature",
    brief:
      "Client minta headline lebih menonjolkan hasil (before/after), bukan fitur produk. Revisi ke-2 setelah draft pertama ditolak.",
  },
  {
    id: 3,
    name: "Approval pricing section",
    client: "gumpreneur",
    status: "review",
    pic: "coo",
    due: "2026-08-29",
    cycle: 3,
    revision: 3,
    priority: "urgent",
    type: "feature",
    brief:
      "Client masih menahan approval karena struktur pricing 3-tier dianggap membingungkan. Perlu sign-off sebelum bisa lanjut ke build.",
  },
  {
    id: 4,
    name: "Setup domain & tracking pixel",
    client: "gorden",
    status: "intake",
    pic: "developer",
    due: "2026-09-05",
    cycle: 1,
    revision: 0,
    priority: "normal",
    type: "feature",
    brief:
      "Pasang domain custom client ke VPS, setup Cloudflare, dan pasang tracking pixel (Meta + TikTok) sebelum landing page mulai dibangun.",
  },
  {
    id: 5,
    name: "Compile laporan bulanan",
    client: "menjangan",
    status: "staging",
    pic: "digital-marketer",
    due: "2026-09-01",
    cycle: 2,
    revision: 0,
    priority: "normal",
    type: "feature",
    brief:
      "Compile data performa bulan Agustus (traffic, lead, konversi) jadi laporan PDF untuk dikirim ke client akhir bulan.",
  },
  {
    id: 6,
    name: "UI polish variasi 2",
    client: "fullbright",
    status: "design",
    pic: "creative",
    due: "2026-09-04",
    cycle: 2,
    revision: 1,
    priority: "normal",
    type: "feature",
    brief:
      "Rapikan spacing dan hierarchy visual di variasi 2, terutama section testimonial yang masih terlalu padat.",
  },
  {
    id: 7,
    name: "Build LP variasi 1 frontend",
    client: "shaundju",
    status: "frontend",
    pic: "developer",
    due: "2026-09-03",
    cycle: 1,
    revision: 0,
    priority: "normal",
    type: "feature",
    brief:
      "Build halaman landing page variasi 1 dari desain Figma yang sudah di-approve, termasuk responsive mobile.",
  },
  {
    id: 8,
    name: "Strategy ulang funnel pricing",
    client: "gumpreneur",
    status: "strategy",
    pic: "digital-marketer",
    due: "2026-08-31",
    cycle: 3,
    revision: 3,
    priority: "urgent",
    type: "feature",
    brief:
      "Funnel pricing saat ini konversinya rendah. Perlu strategi baru — kemungkinan reposisi value prop dari 'harga' ke 'ROI/hasil'.",
  },
  {
    id: 9,
    name: "LP live QA final",
    client: "menjangan",
    status: "done",
    pic: "creative",
    due: "2026-08-25",
    cycle: 1,
    revision: 0,
    priority: "normal",
    type: "feature",
    brief:
      "QA akhir sebelum landing page Menjangan resmi live — cek semua CTA, form booking, dan loading speed.",
  },
  {
    id: 10,
    name: "Monthly report client call",
    client: "fullbright",
    status: "done",
    pic: "coo",
    due: "2026-08-20",
    cycle: 1,
    revision: 0,
    priority: "normal",
    type: "feature",
    brief:
      "Call bulanan dengan client untuk presentasi laporan performa dan rencana cycle berikutnya.",
  },
  {
    id: 11,
    name: "Audit tracking pixel",
    client: "fullbright",
    status: "qa",
    pic: "developer",
    due: "2026-09-02",
    cycle: 2,
    revision: 0,
    priority: "normal",
    type: "feature",
    brief:
      "Pastikan event Meta Pixel & GA4 (PageView, Lead, Purchase) masih tercatat benar setelah perubahan routing.",
  },
  {
    id: 12,
    name: "Checkout error 500 — LP down",
    client: "fullbright",
    status: "qa",
    pic: "developer",
    due: "2026-08-29",
    cycle: 2,
    revision: 0,
    priority: "urgent",
    type: "hotfix",
    brief:
      "Checkout page Fullbright return error 500 sejak tadi malam, kemungkinan dari perubahan routing terakhir. Perlu di-patch/rollback secepatnya — skip strategy/design, ini emergency fix bukan task baru.",
  },
];

/* -------------------------- data model: marketing performance -------------------------- */
/* One row per client per cycle. Cycle 0 = baseline awal kontrak setelah
   varian landing page pertama diluncurkan dan sudah mengumpulkan data.
   variants: [{ id, label, isControl, targetVisit, realVisit, bounceRate,
   leadRate, intentRate }] — one control + N test variants. The cycle-level
   fields (targetVisit, leadRate, etc.) represent the cycle's overall
   numbers; variants give the breakdown behind that number. */

const SEED_CYCLES = [
  {
    id: "fb-1",
    client: "fullbright",
    cycle: 1,
    periode: "1–31 Jul 2026",
    targetVisit: 5000,
    realVisit: 4820,
    bounceRate: 52,
    leadRate: 3.2,
    intentRate: 8.1,
    layer: "Hero Section",
    bottleneck: "—",
    primaryMetric: "Lead Rate",
    hypothesis:
      "Headline value prop yang lebih spesifik akan menaikkan lead rate.",
    optimization: "A/B test 3 varian headline.",
    updateDate: "2026-07-31",
    status: "Baseline",
    variants: [
      {
        id: "fb-1-c",
        label: "Control (Original)",
        isControl: true,
        targetVisit: 1250,
        realVisit: 1210,
        bounceRate: 57,
        leadRate: 2.7,
        intentRate: 6.9,
      },
      {
        id: "fb-1-a",
        label: "Varian A — Headline Benefit-Driven",
        isControl: false,
        targetVisit: 1250,
        realVisit: 1205,
        bounceRate: 48,
        leadRate: 3.8,
        intentRate: 9.5,
      },
      {
        id: "fb-1-b",
        label: "Varian B — Headline Sosial Proof",
        isControl: false,
        targetVisit: 1250,
        realVisit: 1200,
        bounceRate: 51,
        leadRate: 3.1,
        intentRate: 8.0,
      },
      {
        id: "fb-1-c2",
        label: "Varian C — Headline Urgency",
        isControl: false,
        targetVisit: 1250,
        realVisit: 1205,
        bounceRate: 52,
        leadRate: 3.1,
        intentRate: 7.9,
      },
    ],
  },
  {
    id: "fb-2",
    client: "fullbright",
    cycle: 2,
    periode: "1–28 Agu 2026",
    targetVisit: 5200,
    realVisit: 5390,
    bounceRate: 44,
    leadRate: 4.6,
    intentRate: 10.3,
    layer: "Pricing Section",
    bottleneck: "Pricing dianggap mahal tanpa social proof.",
    primaryMetric: "Lead Rate",
    hypothesis:
      "Testimonial dekat pricing akan menurunkan bounce & menaikkan lead.",
    optimization: "Tambah 3 testimonial + trust badge.",
    updateDate: "2026-08-27",
    status: "Improving",
    variants: [
      {
        id: "fb-2-c",
        label: "Control (Tanpa Testimonial)",
        isControl: true,
        targetVisit: 1750,
        realVisit: 1810,
        bounceRate: 50,
        leadRate: 3.9,
        intentRate: 8.8,
      },
      {
        id: "fb-2-a",
        label: "Varian A — Testimonial Dekat Pricing",
        isControl: false,
        targetVisit: 1750,
        realVisit: 1795,
        bounceRate: 41,
        leadRate: 5.0,
        intentRate: 11.2,
      },
      {
        id: "fb-2-b",
        label: "Varian B — Trust Badge di Atas CTA",
        isControl: false,
        targetVisit: 1700,
        realVisit: 1785,
        bounceRate: 42,
        leadRate: 4.9,
        intentRate: 10.9,
      },
    ],
  },

  {
    id: "sj-1",
    client: "shaundju",
    cycle: 1,
    periode: "1–31 Agu 2026",
    targetVisit: 3000,
    realVisit: 2650,
    bounceRate: 61,
    leadRate: 1.8,
    intentRate: 4.2,
    layer: "Hero Section",
    bottleneck: "Copy hero belum final, masih revisi ke-2.",
    primaryMetric: "Lead Rate",
    hypothesis:
      "Copy lebih emosional & spesifik target audience menaikkan intent rate.",
    optimization: "Revisi headline + subheadline round 2 (in progress).",
    updateDate: "2026-08-27",
    status: "Baseline",
    variants: [
      {
        id: "sj-1-c",
        label: "Control (Copy Lama)",
        isControl: true,
        targetVisit: 1000,
        realVisit: 900,
        bounceRate: 66,
        leadRate: 1.4,
        intentRate: 3.1,
      },
      {
        id: "sj-1-a",
        label: "Varian A — Headline Emosional",
        isControl: false,
        targetVisit: 1000,
        realVisit: 880,
        bounceRate: 58,
        leadRate: 2.1,
        intentRate: 5.0,
      },
      {
        id: "sj-1-b",
        label: "Varian B — Headline Spesifik Audience",
        isControl: false,
        targetVisit: 1000,
        realVisit: 870,
        bounceRate: 60,
        leadRate: 1.9,
        intentRate: 4.5,
      },
    ],
  },

  {
    id: "gp-1",
    client: "gumpreneur",
    cycle: 1,
    periode: "1–31 Mei 2026",
    targetVisit: 4000,
    realVisit: 3900,
    bounceRate: 48,
    leadRate: 5.1,
    intentRate: 12.0,
    layer: "Hero Section",
    bottleneck: "—",
    primaryMetric: "Lead Rate",
    hypothesis: "Landing page awal, belum ada hipotesis spesifik.",
    optimization: "Build landing page awal.",
    updateDate: "2026-05-31",
    status: "Baseline",
    variants: [
      {
        id: "gp-1-c",
        label: "Control",
        isControl: true,
        targetVisit: 1350,
        realVisit: 1310,
        bounceRate: 51,
        leadRate: 4.6,
        intentRate: 10.8,
      },
      {
        id: "gp-1-a",
        label: "Varian A",
        isControl: false,
        targetVisit: 1350,
        realVisit: 1300,
        bounceRate: 46,
        leadRate: 5.5,
        intentRate: 13.0,
      },
      {
        id: "gp-1-b",
        label: "Varian B",
        isControl: false,
        targetVisit: 1300,
        realVisit: 1290,
        bounceRate: 47,
        leadRate: 5.2,
        intentRate: 12.2,
      },
    ],
  },
  {
    id: "gp-2",
    client: "gumpreneur",
    cycle: 2,
    periode: "1–30 Jun 2026",
    targetVisit: 4200,
    realVisit: 4050,
    bounceRate: 55,
    leadRate: 4.0,
    intentRate: 9.0,
    layer: "Pricing Section",
    bottleneck: "Harga dianggap kemahalan dibanding kompetitor.",
    primaryMetric: "Lead Rate",
    hypothesis: "Reposisi value prop ke ROI, bukan harga.",
    optimization: "A/B test framing pricing.",
    updateDate: "2026-06-30",
    status: "Declining",
    variants: [
      {
        id: "gp-2-c",
        label: "Control (Harga Langsung)",
        isControl: true,
        targetVisit: 1400,
        realVisit: 1360,
        bounceRate: 58,
        leadRate: 3.6,
        intentRate: 8.0,
      },
      {
        id: "gp-2-a",
        label: "Varian A — Framing ROI",
        isControl: false,
        targetVisit: 1400,
        realVisit: 1345,
        bounceRate: 52,
        leadRate: 4.3,
        intentRate: 9.8,
      },
      {
        id: "gp-2-b",
        label: "Varian B — Paket Bundling",
        isControl: false,
        targetVisit: 1400,
        realVisit: 1345,
        bounceRate: 55,
        leadRate: 4.1,
        intentRate: 9.2,
      },
    ],
  },
  {
    id: "gp-3",
    client: "gumpreneur",
    cycle: 3,
    periode: "1–31 Agu 2026",
    targetVisit: 4200,
    realVisit: 3700,
    bounceRate: 59,
    leadRate: 3.1,
    intentRate: 7.0,
    layer: "Pricing Section",
    bottleneck:
      "Menunggu keputusan pricing final dari client — testing tertahan.",
    primaryMetric: "Lead Rate",
    hypothesis: "Belum bisa diuji, masih menunggu keputusan internal client.",
    optimization: "On hold.",
    updateDate: "2026-08-28",
    status: "Declining",
    variants: [
      {
        id: "gp-3-c",
        label: "Control",
        isControl: true,
        targetVisit: 2200,
        realVisit: 1950,
        bounceRate: 60,
        leadRate: 3.0,
        intentRate: 6.8,
      },
      {
        id: "gp-3-a",
        label: "Varian A",
        isControl: false,
        targetVisit: 2000,
        realVisit: 1750,
        bounceRate: 58,
        leadRate: 3.2,
        intentRate: 7.2,
      },
    ],
  },

  {
    id: "gw-0",
    client: "gorden",
    cycle: 0,
    periode: "20–31 Agu 2026",
    targetVisit: 1200,
    realVisit: 1095,
    bounceRate: 58,
    leadRate: 2.4,
    intentRate: 6.1,
    layer: "Hero Section",
    bottleneck: "Belum ada pembanding untuk baseline awal kontrak.",
    primaryMetric: "Lead Rate",
    hypothesis:
      "Performa varian pertama menjadi baseline untuk cycle optimasi berikutnya.",
    optimization:
      "Launch varian pertama dan kumpulkan data baseline awal kontrak.",
    updateDate: "2026-08-27",
    status: "Baseline",
    variants: [
      {
        id: "gw-0-control",
        label: "Varian 1 — Baseline awal kontrak",
        isControl: true,
        targetVisit: 1200,
        realVisit: 1095,
        bounceRate: 58,
        leadRate: 2.4,
        intentRate: 6.1,
      },
    ],
  },

  {
    id: "mj-1",
    client: "menjangan",
    cycle: 1,
    periode: "1–30 Jun 2026",
    targetVisit: 6000,
    realVisit: 6210,
    bounceRate: 39,
    leadRate: 6.8,
    intentRate: 15.0,
    layer: "Hero + Gallery",
    bottleneck: "—",
    primaryMetric: "Lead Rate",
    hypothesis: "Galeri foto pantai memperkuat trust.",
    optimization: "Tambah galeri + testimoni traveler.",
    updateDate: "2026-06-30",
    status: "Baseline",
    variants: [
      {
        id: "mj-1-c",
        label: "Control (Tanpa Galeri)",
        isControl: true,
        targetVisit: 2000,
        realVisit: 2050,
        bounceRate: 44,
        leadRate: 5.9,
        intentRate: 13.0,
      },
      {
        id: "mj-1-a",
        label: "Varian A — Galeri Foto Pantai",
        isControl: false,
        targetVisit: 2000,
        realVisit: 2080,
        bounceRate: 37,
        leadRate: 7.1,
        intentRate: 15.8,
      },
      {
        id: "mj-1-b",
        label: "Varian B — Galeri + Testimoni Traveler",
        isControl: false,
        targetVisit: 2000,
        realVisit: 2080,
        bounceRate: 36,
        leadRate: 7.4,
        intentRate: 16.2,
      },
    ],
  },
  {
    id: "mj-2",
    client: "menjangan",
    cycle: 2,
    periode: "1–31 Jul 2026",
    targetVisit: 6200,
    realVisit: 6480,
    bounceRate: 35,
    leadRate: 8.1,
    intentRate: 18.0,
    layer: "Booking Form",
    bottleneck: "—",
    primaryMetric: "Lead Rate",
    hypothesis: "Simplifikasi form booking menaikkan completion rate.",
    optimization: "Kurangi field form dari 8 ke 4.",
    updateDate: "2026-08-20",
    status: "Improving",
    variants: [
      {
        id: "mj-2-c",
        label: "Control (Form 8 Field)",
        isControl: true,
        targetVisit: 2070,
        realVisit: 2150,
        bounceRate: 40,
        leadRate: 6.5,
        intentRate: 15.0,
      },
      {
        id: "mj-2-a",
        label: "Varian A — Form 4 Field",
        isControl: false,
        targetVisit: 2070,
        realVisit: 2170,
        bounceRate: 32,
        leadRate: 9.0,
        intentRate: 19.5,
      },
      {
        id: "mj-2-b",
        label: "Varian B — Form 4 Field + Autofill",
        isControl: false,
        targetVisit: 2060,
        realVisit: 2160,
        bounceRate: 33,
        leadRate: 8.8,
        intentRate: 19.5,
      },
    ],
  },
];

const CYCLE_STATUS_COLOR = {
  Baseline: COLOR.zinc,
  Improving: COLOR.emerald,
  Declining: COLOR.rose,
  Setup: COLOR.zinc,
};

/* -------------------------- data model: feedback loop -------------------------- */

const PHASE_META = {
  30: { label: "30% · Strategi", short: "30%", color: COLOR.sky },
  50: { label: "50% · Desain UI/UX", short: "50%", color: COLOR.violet },
  90: { label: "90% · Staging", short: "90%", color: COLOR.amber },
};
const PRIORITY_META = {
  1: { label: "P1", color: COLOR.rose },
  2: { label: "P2", color: COLOR.amber },
  3: { label: "P3", color: COLOR.zinc },
};
const FROM_TYPE_COLOR = { pm: COLOR.violet, owner: ACCENT, client: COLOR.sky };

const SEED_FEEDBACK = [
  {
    id: "fb-fb1",
    client: "fullbright",
    date: "2026-07-10",
    phase: 30,
    from: "Project Manager",
    fromType: "pm",
    topic: "Approve strategi & worksheet framework",
    details:
      "Worksheet funnel sudah sesuai, tapi minta tambahan hipotesis untuk layer pricing di cycle berikutnya.",
    priority: 2,
    action: "Ditambahkan ke hipotesis cycle 2.",
  },
  {
    id: "fb-fb2",
    client: "fullbright",
    date: "2026-08-05",
    phase: 50,
    from: "Project Manager",
    fromType: "client",
    topic: "Review desain UI/UX",
    details:
      "Warna CTA kurang kontras di mobile, minta diganti lebih mencolok.",
    priority: 2,
    action: "Warna CTA diubah ke oranye, sudah direview ulang.",
  },
  {
    id: "fb-fb3",
    client: "fullbright",
    date: "2026-08-26",
    phase: 90,
    from: "COO",
    fromType: "owner",
    topic: "Final review sebelum production",
    details:
      "Loading speed di staging masih 4.2 detik, terlalu lambat untuk mobile.",
    priority: 1,
    action: "",
  },

  {
    id: "fb-sj1",
    client: "shaundju",
    date: "2026-08-15",
    phase: 30,
    from: "Project Manager",
    fromType: "pm",
    topic: "Approve worksheet framework",
    details:
      "Framework oke, tapi copy hero masih generic, perlu lebih spesifik ke target audience bootcamp.",
    priority: 2,
    action: "Revisi headline round 1 sudah dikirim ke client.",
  },
  {
    id: "fb-sj2",
    client: "shaundju",
    date: "2026-08-27",
    phase: 30,
    from: "Project Manager",
    fromType: "client",
    topic: "Revisi hero copy",
    details:
      'Headline masih belum menonjolkan hasil belajar, minta versi yang lebih "before/after".',
    priority: 1,
    action: "",
  },

  {
    id: "fb-gp1",
    client: "gumpreneur",
    date: "2026-06-20",
    phase: 50,
    from: "Project Manager",
    fromType: "client",
    topic: "Review desain pricing section",
    details:
      "Struktur 3-tier pricing dianggap membingungkan, minta disederhanakan.",
    priority: 1,
    action: "Diajukan 2 alternatif layout, menunggu keputusan client.",
  },
  {
    id: "fb-gp2",
    client: "gumpreneur",
    date: "2026-08-20",
    phase: 50,
    from: "COO",
    fromType: "owner",
    topic: "Follow up keputusan pricing",
    details:
      "Sudah 2 minggu belum ada keputusan dari client soal pricing, funnel jadi stuck.",
    priority: 1,
    action: "",
  },

  {
    id: "fb-gw1",
    client: "gorden",
    date: "2026-08-27",
    phase: 30,
    from: "Project Manager",
    fromType: "pm",
    topic: "Kickoff strategi awal",
    details:
      "Belum ada worksheet karena masih tahap setup teknis (domain & tracking).",
    priority: 3,
    action: "Menunggu setup selesai sebelum mulai strategi.",
  },

  {
    id: "fb-mj1",
    client: "menjangan",
    date: "2026-06-15",
    phase: 30,
    from: "Project Manager",
    fromType: "client",
    topic: "Approve worksheet framework",
    details: "Framework disetujui, tambahkan section galeri foto.",
    priority: 3,
    action: "Galeri ditambahkan ke worksheet.",
  },
  {
    id: "fb-mj2",
    client: "menjangan",
    date: "2026-07-25",
    phase: 50,
    from: "COO",
    fromType: "owner",
    topic: "Review desain sebelum lanjut build",
    details: "Desain gallery bagus, tapi form booking terlalu panjang.",
    priority: 2,
    action: "Form disederhanakan dari 8 field jadi 4 field.",
  },
  {
    id: "fb-mj3",
    client: "menjangan",
    date: "2026-08-19",
    phase: 90,
    from: "Project Manager",
    fromType: "client",
    topic: "Final approval sebelum live",
    details:
      "Semua oke, tinggal pastikan booking form terhubung ke WhatsApp admin.",
    priority: 2,
    action: "Integrasi WhatsApp sudah dites, berfungsi normal.",
  },
];

/* -------------------------- helpers: delivery -------------------------- */

function getClient(id, clients = SEED_CLIENTS) {
  return clients.find((c) => c.id === id);
}
function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function isOverdue(task) {
  return task.status !== "done" && task.due < todayISO();
}
function taskCompletionDate(task) {
  return task.completedAt || (task.status === "done" ? task.due : null);
}
function taskReportDue(task) {
  return task.dueAtCompletion || task.due;
}
function dateShift(iso, days) {
  const value = new Date(`${iso}T00:00:00`);
  value.setDate(value.getDate() + days);
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`;
}
export function deliveryPeriodBounds(anchor = todayISO(), mode = "weekly") {
  validDate(anchor, "Tanggal laporan");
  const value = new Date(`${anchor}T00:00:00`);
  if (mode === "monthly") {
    const start = `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-01`;
    const end = new Date(value.getFullYear(), value.getMonth() + 1, 0);
    return {
      start,
      end: `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, "0")}-${String(end.getDate()).padStart(2, "0")}`,
    };
  }
  const mondayOffset = (value.getDay() + 6) % 7;
  const start = dateShift(anchor, -mondayOffset);
  return { start, end: dateShift(start, 6) };
}
export function taskDeliveryReport(
  tasks,
  anchor = todayISO(),
  mode = "weekly",
  asOf = todayISO(),
) {
  const bounds = deliveryPeriodBounds(anchor, mode);
  const scheduled = tasks.filter((task) => {
    const due = taskReportDue(task);
    return due >= bounds.start && due <= bounds.end;
  });
  const done = scheduled.filter((task) => task.status === "done");
  const late = scheduled.filter((task) => {
    const completed = taskCompletionDate(task);
    return completed
      ? completed > taskReportDue(task)
      : taskReportDue(task) < asOf;
  });
  const onTime = done.filter(
    (task) => taskCompletionDate(task) <= taskReportDue(task),
  );
  return {
    ...bounds,
    total: scheduled.length,
    done: done.length,
    onTime: onTime.length,
    overdue: late.length,
    outstanding: scheduled.length - done.length,
    completionRate: scheduled.length
      ? Math.round((done.length / scheduled.length) * 100)
      : 0,
    tasks: scheduled,
  };
}
function doneTaskVisible(task, window) {
  if (task.status !== "done" || window === "all") return true;
  const completed = taskCompletionDate(task);
  if (!completed) return false;
  const bounds = deliveryPeriodBounds(todayISO(), window);
  return completed >= bounds.start && completed <= bounds.end;
}
function daysUntil(iso) {
  const ms = new Date(`${iso}T00:00:00`) - new Date(`${todayISO()}T00:00:00`);
  return Math.round(ms / 86400000);
}
function formatDate(iso) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
  });
}
function urgencyColor(task) {
  if (task.status === "done") return null;
  if (task.type === "hotfix") return COLOR.rose;
  if (isOverdue(task)) return COLOR.rose;
  if (daysUntil(task.due) <= 2) return COLOR.amber;
  return null;
}

/* -------------------------- helpers: marketing performance -------------------------- */

function cyclesFor(clientId, cycles = SEED_CYCLES) {
  return cycles
    .filter((c) => c.client === clientId)
    .sort((a, b) => a.cycle - b.cycle);
}
function deltaPP(a, b) {
  if (a == null || b == null) return null;
  return +(a - b).toFixed(1);
}
function growthPct(a, b) {
  if (a == null || b == null || b === 0) return null;
  return Math.round(((a - b) / b) * 100);
}
function computeFlag(clientId, cycles = SEED_CYCLES) {
  const withData = cyclesFor(clientId, cycles).filter(
    (c) => c.leadRate != null,
  );
  if (withData.length === 0) return "setup";
  if (withData.length === 1) return "new";
  const last = withData[withData.length - 1];
  const prev = withData[withData.length - 2];
  if (last.leadRate < prev.leadRate) {
    if (withData.length >= 3) {
      const prev2 = withData[withData.length - 3];
      if (prev.leadRate < prev2.leadRate) return "at-risk";
    }
    return "watch";
  }
  return "healthy";
}
const FLAG_META = {
  "at-risk": {
    label: "Perlu Intervensi",
    color: COLOR.rose,
    icon: AlertTriangle,
  },
  watch: { label: "Perlu Dipantau", color: COLOR.amber, icon: Clock },
  healthy: { label: "Aman", color: COLOR.emerald, icon: CheckCircle2 },
  new: { label: "Baru Mulai", color: COLOR.zinc, icon: Clock },
  setup: { label: "Setup", color: COLOR.zinc, icon: Clock },
};
/* higher = more concerning — default table sort surfaces these first */
const SEVERITY_RANK = { "at-risk": 4, watch: 3, new: 2, setup: 1, healthy: 0 };

function testVariantCount(cycle) {
  return cycle.variants.filter((v) => !v.isControl).length;
}
function getWinnerVariant(variants) {
  const withData = variants.filter((v) => v.leadRate != null);
  if (!withData.length) return null;
  return withData.reduce((best, v) => (v.leadRate > best.leadRate ? v : best));
}

/* -------------------------- shared primitives -------------------------- */

const HEALTH_META = {
  "on-track": { label: "On Schedule", color: COLOR.emerald },
  delayed: { label: "Delayed", color: COLOR.amber },
  blocked: { label: "Blocked", color: COLOR.rose },
};

function HealthBadge({ health }) {
  const m = HEALTH_META[health];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 font-medium"
      style={{ ...pillStyle(m.color), fontSize: 11 }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: m.color }}
      />
      {m.label}
    </span>
  );
}

function RevisionBadge({ revision, total = 3 }) {
  const color =
    revision >= total
      ? COLOR.rose
      : revision >= total - 1
        ? COLOR.amber
        : COLOR.zinc;
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 font-medium"
      style={{ ...pillStyle(color), fontSize: 10 }}
    >
      <RotateCcw className="h-2.5 w-2.5" />
      {revision}/{total}
    </span>
  );
}

function CycleTag({ cycle, total = 3 }) {
  if (cycle === 0) {
    return (
      <span
        className="inline-flex items-center gap-1 rounded-full bg-zinc-800 px-1.5 py-0.5 font-medium text-zinc-400"
        style={{ fontSize: 10 }}
      >
        <GitBranch className="h-2.5 w-2.5" />
        Cycle 0 · Baseline Awal
      </span>
    );
  }
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full bg-zinc-800 px-1.5 py-0.5 font-medium text-zinc-400"
      style={{ fontSize: 10 }}
    >
      <GitBranch className="h-2.5 w-2.5" />
      Cycle {cycle}/{total}
    </span>
  );
}

function PriorityTag({ priority }) {
  const urgent = priority === "urgent";
  const color = urgent ? COLOR.rose : COLOR.zinc;
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 font-medium"
      style={{ ...pillStyle(color), fontSize: 10 }}
    >
      <Flag className="h-2.5 w-2.5" />
      {urgent ? "Urgent" : "Normal"}
    </span>
  );
}

function PicChip({ id }) {
  const p = PIC[id];
  return (
    <span
      className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full font-semibold text-zinc-950"
      style={{ backgroundColor: p.color, fontSize: 9 }}
      title={`${p.name} · ${p.role}`}
    >
      {p.initials}
    </span>
  );
}

function DeltaTag({ value, suffix = "pp" }) {
  if (value == null)
    return (
      <span className="text-zinc-600" style={{ fontSize: 12 }}>
        —
      </span>
    );
  const flat = value === 0;
  const positive = value > 0;
  const color = flat ? COLOR.zinc : positive ? COLOR.emerald : COLOR.rose;
  const Icon = flat ? Minus : positive ? TrendingUp : TrendingDown;
  return (
    <span
      className="inline-flex items-center gap-1 font-medium tabular-nums"
      style={{ color, fontSize: 13 }}
    >
      <Icon className="h-3.5 w-3.5" />
      {positive ? "+" : ""}
      {value}
      {suffix}
    </span>
  );
}

function FilterChip({ active, label, color = COLOR.zinc, onClick }) {
  return (
    <button
      onClick={onClick}
      className="rounded-full border px-2.5 py-1 font-medium transition-colors"
      style={{
        fontSize: 12,
        borderColor: active ? color : "#27272a",
        backgroundColor: active ? rgba(color, 0.12) : "transparent",
        color: active ? color : "#a1a1aa",
      }}
    >
      {label}
    </button>
  );
}

function GroupTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0].payload;
  return (
    <div
      className="rounded-lg border border-zinc-800 bg-zinc-950 p-2.5"
      style={{ boxShadow: "0 8px 24px rgba(0,0,0,0.45)", maxWidth: 200 }}
    >
      <p className="mb-1 font-medium text-zinc-200" style={{ fontSize: 12 }}>
        {d.name} · {d.value} task
      </p>
      <ul className="space-y-0.5">
        {d.tasks.slice(0, 4).map((t) => (
          <li
            key={t.id}
            className="truncate text-zinc-500"
            style={{ fontSize: 11 }}
          >
            {t.name}
          </li>
        ))}
        {d.tasks.length > 4 && (
          <li className="text-zinc-600" style={{ fontSize: 11 }}>
            +{d.tasks.length - 4} lainnya
          </li>
        )}
        {d.tasks.length === 0 && (
          <li className="text-zinc-700" style={{ fontSize: 11 }}>
            Tidak ada task
          </li>
        )}
      </ul>
    </div>
  );
}

function TrendTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  const visible = payload.filter((p) => p.value != null);
  if (!visible.length) return null;
  return (
    <div
      className="rounded-lg border border-zinc-800 bg-zinc-950 p-2.5"
      style={{ boxShadow: "0 8px 24px rgba(0,0,0,0.45)" }}
    >
      <p className="mb-1 font-medium text-zinc-400" style={{ fontSize: 11 }}>
        {label}
      </p>
      {visible.map((p) => (
        <p
          key={p.dataKey}
          className="flex items-center gap-1.5"
          style={{ fontSize: 12 }}
        >
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: p.color || p.fill || p.stroke }}
          />
          <span className="text-zinc-400">{p.name}:</span>
          <span className="font-medium text-zinc-100">{p.value}%</span>
        </p>
      ))}
    </div>
  );
}

/* -------------------------- KPI card (Ops Hub) -------------------------- */

function KpiCard({
  icon: Icon,
  label,
  value,
  hint,
  color = COLOR.accent,
  onClick,
  active,
}) {
  const Tag = onClick ? "button" : "div";
  return (
    <Tag
      onClick={onClick}
      className={
        "w-full rounded-xl border border-zinc-800 bg-zinc-900 p-4 text-left transition-colors" +
        (onClick
          ? " hover:border-zinc-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500"
          : "")
      }
      style={
        active
          ? { borderColor: color, backgroundColor: rgba(color, 0.08) }
          : undefined
      }
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">
          {label}
        </span>
        <span
          className="flex h-7 w-7 items-center justify-center rounded-lg"
          style={{ backgroundColor: rgba(color, 0.14) }}
        >
          <Icon className="h-3.5 w-3.5" style={{ color }} />
        </span>
      </div>
      <p
        className="mt-3 text-3xl font-semibold tabular-nums text-zinc-50"
        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
      >
        {value}
      </p>
      <p className="mt-1 text-xs text-zinc-500">{hint}</p>
    </Tag>
  );
}

function PageHeader({ icon: Icon, eyebrow, title, description, actions }) {
  return (
    <header className="flex flex-wrap items-start justify-between gap-4 border-b border-zinc-800 pb-5">
      <div className="max-w-3xl">
        <div
          className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em]"
          style={{ color: ACCENT }}
        >
          <Icon className="h-4 w-4" />
          {eyebrow}
        </div>
        <h1
          className="mt-2 text-2xl font-semibold text-zinc-50"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          {title}
        </h1>
        <p className="mt-2 text-sm leading-6 text-zinc-400">{description}</p>
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </header>
  );
}

function SectionHeader({ title, description, action }) {
  return (
    <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h2 className="text-lg font-semibold text-zinc-100">{title}</h2>
        {description && (
          <p className="mt-1 text-sm text-zinc-500">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}

function Pager({ page, pageCount, total, from, to, onChange }) {
  if (!total) return null;
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-800 px-4 py-3 text-sm text-zinc-500">
      <span>
        Menampilkan {from}–{to} dari {total} data
      </span>
      <div className="flex items-center gap-2">
        <button
          className="ops-button"
          aria-label="Halaman sebelumnya"
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="min-w-20 text-center text-zinc-300">
          {page} / {pageCount}
        </span>
        <button
          className="ops-button"
          aria-label="Halaman berikutnya"
          disabled={page >= pageCount}
          onClick={() => onChange(page + 1)}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

/* -------------------------- task card + cell (Execution Board) -------------------------- */

function TaskCard({ task, dimmed, onClick }) {
  const { can } = useOps();
  const overdue = isOverdue(task);
  const urgency = urgencyColor(task);
  const urgent = task.priority === "urgent";
  const pic = PIC[task.pic];
  return (
    <button
      data-card-size="full"
      data-urgency={urgent ? "urgent" : "normal"}
      draggable={can("update", "tasks")}
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", String(task.id));
        e.dataTransfer.effectAllowed = "move";
      }}
      onClick={onClick}
      className={`w-full rounded-lg border p-2.5 text-left transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 ${
        urgent
          ? "border-rose-500/60 bg-rose-950/35 hover:border-rose-400"
          : "border-zinc-800 bg-zinc-900 hover:border-zinc-700"
      }`}
      style={{
        opacity: dimmed ? 0.25 : 1,
        ...(urgency ? { borderLeftWidth: 3, borderLeftColor: urgency } : {}),
      }}
    >
      {urgent && (
        <span
          className="mb-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-bold uppercase tracking-wider"
          style={{ ...pillStyle(COLOR.rose), fontSize: 10 }}
        >
          <Flag className="h-3 w-3" />
          Urgent
        </span>
      )}
      <div className="flex items-start justify-between gap-2">
        <p
          className="font-medium leading-snug text-zinc-100"
          style={{ fontSize: 13 }}
        >
          {task.name}
        </p>
        <div className="flex shrink-0 items-center gap-1">
          {task.type === "hotfix" && (
            <Zap className="h-3 w-3" style={{ color: COLOR.rose }} />
          )}
        </div>
      </div>

      <div
        className="mt-2 flex items-center gap-1.5 text-zinc-500"
        style={{ fontSize: 11 }}
      >
        <CalendarDays className="h-3 w-3" />
        <span
          style={{
            color: overdue ? COLOR.rose : undefined,
            fontWeight: overdue ? 600 : 400,
          }}
        >
          {formatDate(task.due)}
        </span>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <PriorityTag priority={task.priority} />
        <CycleTag cycle={task.cycle} />
        {task.revision > 0 && <RevisionBadge revision={task.revision} />}
      </div>

      <div className="mt-2.5 flex items-center gap-1.5 border-t border-zinc-800 pt-2">
        <PicChip id={task.pic} />
        <span className="text-zinc-400" style={{ fontSize: 11 }}>
          {pic.name}
        </span>
      </div>
    </button>
  );
}

function CompactTaskRow({ task, dimmed, onClick }) {
  const { can } = useOps();
  const urgent = task.priority === "urgent";
  const overdue = isOverdue(task);
  return (
    <button
      data-card-size="compact"
      data-urgency={urgent ? "urgent" : "normal"}
      draggable={can("update", "tasks")}
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", String(task.id));
        e.dataTransfer.effectAllowed = "move";
      }}
      onClick={onClick}
      className={`flex w-full items-center gap-1.5 rounded-md border px-2 py-1.5 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 ${
        urgent
          ? "border-rose-500/60 bg-rose-950/35 hover:border-rose-400"
          : "border-zinc-800 bg-zinc-900 hover:border-zinc-700"
      }`}
      style={{
        opacity: dimmed ? 0.25 : 1,
        ...(urgent ? { borderLeftWidth: 3, borderLeftColor: COLOR.rose } : {}),
      }}
    >
      <PicChip id={task.pic} />
      {task.type === "hotfix" && (
        <Zap className="h-3 w-3 shrink-0" style={{ color: COLOR.rose }} />
      )}
      {urgent && (
        <span
          className="inline-flex shrink-0 items-center gap-0.5 rounded-full px-1.5 py-0.5 font-bold uppercase tracking-wide"
          style={{ ...pillStyle(COLOR.rose), fontSize: 9 }}
        >
          <Flag className="h-2.5 w-2.5" />
          Urgent
        </span>
      )}
      <span
        className="min-w-0 flex-1 truncate text-zinc-200"
        style={{ fontSize: 11.5 }}
      >
        {task.name}
      </span>
      <span
        className="shrink-0 tabular-nums"
        style={{ fontSize: 10, color: overdue ? COLOR.rose : "#71717a" }}
      >
        {formatDate(task.due)}
      </span>
    </button>
  );
}

function TaskCell({ tasks, dimmedPic, onOpenTask }) {
  const [showFull, setShowFull] = useState(false);
  if (tasks.length === 0) return null;
  const dense = tasks.length >= 2;
  const useCompact = dense && !showFull;

  return (
    <div className="space-y-1.5">
      {tasks.map((t) =>
        useCompact ? (
          <CompactTaskRow
            key={t.id}
            task={t}
            dimmed={Boolean(dimmedPic) && t.pic !== dimmedPic}
            onClick={() => onOpenTask(t)}
          />
        ) : (
          <TaskCard
            key={t.id}
            task={t}
            dimmed={Boolean(dimmedPic) && t.pic !== dimmedPic}
            onClick={() => onOpenTask(t)}
          />
        ),
      )}
      {dense && (
        <button
          onClick={() => setShowFull((s) => !s)}
          className="w-full rounded-md border border-dashed border-zinc-800 py-1 text-center text-zinc-600 hover:border-zinc-700 hover:text-zinc-400"
          style={{ fontSize: 10 }}
        >
          {showFull ? "Ringkas" : `${tasks.length} task — lihat detail lengkap`}
        </button>
      )}
    </div>
  );
}

function ClientProgressBar({ clientId }) {
  const { TASKS } = useOps();
  const tasks = TASKS.filter((t) => t.client === clientId);
  const total = tasks.length;
  const done = tasks.filter((t) => t.status === "done").length;
  const review = tasks.filter((t) => t.status === "review").length;
  const active = total - done - review;
  const segs = [
    { value: done, color: COLOR.emerald },
    { value: review, color: COLOR.amber },
    { value: active, color: "#3f3f46" },
  ];
  return (
    <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
      {segs.map(
        (s, i) =>
          s.value > 0 && (
            <div
              key={i}
              style={{
                width: `${(s.value / total) * 100}%`,
                backgroundColor: s.color,
              }}
            />
          ),
      )}
    </div>
  );
}

function PicFilterSelect({ activePic, onChange }) {
  return (
    <label className="mb-4 flex max-w-xs items-center gap-3 text-sm text-zinc-400">
      <span className="shrink-0">Filter PIC</span>
      <select
        className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-200 focus:border-violet-500 focus:outline-none"
        aria-label="Filter PIC execution board"
        value={activePic || ""}
        onChange={(event) => onChange(event.target.value || null)}
      >
        <option value="">Semua PIC</option>
        {Object.entries(PIC).map(([id, person]) => (
          <option key={id} value={id}>
            {person.name}
          </option>
        ))}
      </select>
    </label>
  );
}

function HotfixBanner({ tasks, onOpenTask }) {
  const items = tasks.filter((t) => t.type === "hotfix" && t.status !== "done");
  if (items.length === 0) return null;
  return (
    <div
      className="mb-4 rounded-xl p-3"
      style={{
        backgroundColor: rgba(COLOR.rose, 0.08),
        border: `1px solid ${rgba(COLOR.rose, 0.28)}`,
      }}
    >
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
        <span
          className="flex items-center gap-1.5 font-medium"
          style={{ color: COLOR.rose, fontSize: 12.5 }}
        >
          <Zap className="h-3.5 w-3.5" />
          {items.length} Hotfix aktif — di luar workflow normal
        </span>
        {items.map((t) => (
          <button
            key={t.id}
            onClick={() => onOpenTask(t)}
            className="underline decoration-dotted hover:text-zinc-100"
            style={{ fontSize: 12, color: "#e4e4e7" }}
          >
            {t.name}
          </button>
        ))}
      </div>
    </div>
  );
}

function ViewToggle({ mode, onChange }) {
  const opt = (key, Icon, label) => (
    <button
      onClick={() => onChange(key)}
      className="flex items-center gap-1.5 rounded-full px-3 py-1.5 font-medium transition-colors"
      style={{
        fontSize: 12,
        ...(mode === key
          ? { backgroundColor: ACCENT, color: "#fff" }
          : { color: "#a1a1aa" }),
      }}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  );
  return (
    <div className="flex items-center gap-1 rounded-full border border-zinc-800 bg-zinc-900 p-1">
      {opt("kanban", LayoutGrid, "Board")}
      {opt("calendar", CalendarDays, "Calendar")}
    </div>
  );
}

function DetailField({ label, value, sub, icon, valueColor }) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-2.5">
      <div
        className="flex items-center gap-1.5 text-zinc-500"
        style={{ fontSize: 10 }}
      >
        {icon}
        {label}
      </div>
      <p
        className="mt-1 font-medium"
        style={{ fontSize: 13, color: valueColor || "#f4f4f5" }}
      >
        {value}
      </p>
      {sub && (
        <p className="text-zinc-500" style={{ fontSize: 10 }}>
          {sub}
        </p>
      )}
    </div>
  );
}

function TaskDetailModal({ task, onClose }) {
  const { getClient, openEditor, askDelete, moveTask, can } = useOps();
  if (!task) return null;
  return (
    <Modal title={task.name} onClose={onClose}>
      <p className="mb-5 text-sm text-zinc-400">
        {getClient(task.client).name} · {PIC[task.pic].name} ·{" "}
        {formatDate(task.due)}
      </p>
      {can("update", "tasks") ? (
        <label>
          Status task
          <select
            value={task.status}
            onChange={(e) => moveTask(task.id, e.target.value)}
          >
            {STATUSES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
      ) : (
        <DetailField label="Status" value={STATUS_BY_ID[task.status].label} />
      )}
      <div className="my-5 flex flex-wrap gap-2">
        <CycleTag cycle={task.cycle} />
        <RevisionBadge revision={task.revision} />
        <PriorityTag priority={task.priority} />
        {task.type === "hotfix" && (
          <span className="text-rose-300">Hotfix</span>
        )}
        {task.blocked && <span className="text-rose-300">Blocked</span>}
      </div>
      <p className="whitespace-pre-wrap text-sm leading-7 text-zinc-200">
        {task.brief || "Belum ada brief."}
      </p>
      {can("update", "tasks") && (
        <div className="mt-6 flex gap-2">
          <button
            className="ops-button ops-primary"
            onClick={() => {
              onClose();
              openEditor("tasks", task);
            }}
          >
            Edit task
          </button>
          <button
            className="ops-button ops-danger"
            onClick={() => {
              onClose();
              askDelete("tasks", task);
            }}
          >
            Hapus task
          </button>
        </div>
      )}
    </Modal>
  );
}

/* -------------------------- calendar view -------------------------- */

const WEEKDAY_LABELS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Ming"];

function getMonthMatrix(year, monthIndex) {
  const firstDay = new Date(year, monthIndex, 1);
  const startOffset = (firstDay.getDay() + 6) % 7; // Monday-first
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

function CalendarView({ activePic, onOpenTask }) {
  const { TASKS, CLIENT_COLOR } = useOps();
  const [cursor, setCursor] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  );
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const weeks = derive(() => getMonthMatrix(year, month), [year, month]);
  const monthLabel = cursor.toLocaleDateString("id-ID", {
    month: "long",
    year: "numeric",
  });
  const todayStr = todayISO();

  function tasksOnDay(day) {
    if (!day) return [];
    const iso = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return TASKS.filter((t) => t.due === iso);
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCursor(new Date(year, month - 1, 1))}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-800 text-zinc-400 hover:bg-zinc-900"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span
            className="font-medium text-zinc-100"
            style={{ fontSize: 14, minWidth: 150, textAlign: "center" }}
          >
            {monthLabel}
          </span>
          <button
            onClick={() => setCursor(new Date(year, month + 1, 1))}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-800 text-zinc-400 hover:bg-zinc-900"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        <select
          aria-label="Bulan kalender"
          className="ops-button"
          value={`${year}-${String(month + 1).padStart(2, "0")}`}
          onChange={(e) => setCursor(new Date(`${e.target.value}-01T00:00:00`))}
        >
          {[
            ...new Set([
              todayISO().slice(0, 7),
              `${year}-${String(month + 1).padStart(2, "0")}`,
              ...TASKS.map((t) => t.due.slice(0, 7)),
            ]),
          ]
            .sort()
            .map((m) => (
              <option key={m} value={m}>
                {new Date(`${m}-01T00:00:00`).toLocaleDateString("id-ID", {
                  month: "long",
                  year: "numeric",
                })}
              </option>
            ))}
        </select>
        <button
          onClick={() =>
            setCursor(
              new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            )
          }
          className="rounded-full border border-zinc-800 px-3 py-1 text-zinc-400 hover:bg-zinc-900"
          style={{ fontSize: 12 }}
        >
          Hari ini
        </button>
      </div>

      <p className="mb-3 text-sm text-zinc-400">
        {
          TASKS.filter((t) =>
            t.due.startsWith(`${year}-${String(month + 1).padStart(2, "0")}`),
          ).length
        }{" "}
        task bulan ini · tanggal mengikuti deadline. Pilih bulan lain untuk
        melihat riwayat.
      </p>
      <div className="overflow-x-auto rounded-xl border border-zinc-800">
        <div style={{ minWidth: 840 }}>
          <div className="grid grid-cols-7 border-b border-zinc-800 bg-zinc-950">
            {WEEKDAY_LABELS.map((d) => (
              <div
                key={d}
                className="p-2 text-center text-zinc-500"
                style={{ fontSize: 11 }}
              >
                {d}
              </div>
            ))}
          </div>
          {weeks.map((week, wi) => (
            <div key={wi} className="grid grid-cols-7">
              {week.map((day, di) => {
                const dayTasks = tasksOnDay(day);
                const iso = day
                  ? `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
                  : null;
                const isToday = iso === todayStr;
                return (
                  <div
                    key={di}
                    className="border-b border-r border-zinc-900 p-1.5 last:border-r-0"
                    style={{
                      minHeight: 96,
                      backgroundColor: day ? undefined : "#0a0a0c",
                    }}
                  >
                    {day && (
                      <>
                        <span
                          className="inline-flex h-5 w-5 items-center justify-center rounded-full tabular-nums"
                          style={{
                            fontSize: 11,
                            ...(isToday
                              ? {
                                  backgroundColor: ACCENT,
                                  color: "#fff",
                                  fontWeight: 600,
                                }
                              : { color: "#71717a" }),
                          }}
                        >
                          {day}
                        </span>
                        <div className="mt-1 space-y-1">
                          {dayTasks.map((t) => {
                            const dimmed =
                              Boolean(activePic) && t.pic !== activePic;
                            const c = CLIENT_COLOR[t.client] || ACCENT;
                            return (
                              <button
                                key={t.id}
                                onClick={() => onOpenTask(t)}
                                className="flex w-full items-center gap-1 truncate rounded px-1 py-0.5 text-left hover:opacity-80"
                                style={{
                                  fontSize: 10,
                                  opacity: dimmed ? 0.3 : 1,
                                  backgroundColor: rgba(c, 0.15),
                                  color: c,
                                }}
                              >
                                {t.type === "hotfix" && (
                                  <Zap className="h-2.5 w-2.5 shrink-0" />
                                )}
                                <span className="truncate">{t.name}</span>
                              </button>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* -------------------------- Monthly Execution Board -------------------------- */

function ExecutionBoard({ highlightClient, onHighlightHandled }) {
  const { CLIENTS, TASKS, openEditor, moveTask, can } = useOps();
  const [viewMode, setViewMode] = useState("kanban");
  const [activePic, setActivePic] = useState(null);
  const [doneWindow, setDoneWindow] = useState("weekly");
  const [pulseId, setPulseId] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const rowRefs = useRef({});

  useEffect(() => {
    if (!highlightClient) return;
    setViewMode("kanban");
    const el = rowRefs.current[highlightClient];
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    setPulseId(highlightClient);
    const t1 = setTimeout(() => setPulseId(null), 1800);
    const t2 = setTimeout(
      () => onHighlightHandled && onHighlightHandled(),
      100,
    );
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [highlightClient]);

  const boardTasks = TASKS.filter((task) => doneTaskVisible(task, doneWindow));
  const hiddenDoneCount = TASKS.filter(
    (task) => task.status === "done" && !doneTaskVisible(task, doneWindow),
  ).length;
  const statusCounts = derive(() => {
    const m = {};
    STATUSES.forEach((s) => {
      m[s.id] = boardTasks.filter((t) => t.status === s.id).length;
    });
    return m;
  }, []);

  const gridTemplate = `210px repeat(${STATUSES.length}, minmax(190px, 1fr))`;

  return (
    <section className="space-y-5">
      <PageHeader
        icon={LayoutGrid}
        eyebrow="Execution Board"
        title="Task delivery per client dan tahap"
        description="Pantau pekerjaan aktif, pindahkan status, dan buka detail task. Task selesai lama tetap tersimpan untuk laporan, tetapi disembunyikan dari board secara otomatis."
        actions={<ViewToggle mode={viewMode} onChange={setViewMode} />}
      />

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-800 bg-zinc-900/70 p-4">
        <div className="flex flex-wrap items-center gap-2">
          {can("create", "tasks") && (
            <button
              className="ops-button ops-primary"
              disabled={!CLIENTS.length}
              onClick={() => openEditor("tasks")}
            >
              + Tambah task
            </button>
          )}
          <span className="self-center text-sm text-zinc-400">
            {can("update", "tasks")
              ? "Tarik kartu ke kolom lain, atau ubah status melalui detail task."
              : "Akses read-only sesuai role Anda."}
          </span>
        </div>
        <label className="flex items-center gap-2 text-sm text-zinc-400">
          <Archive className="h-4 w-4 text-zinc-500" />
          Task Done
          <select
            className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-200 focus:border-violet-500 focus:outline-none"
            aria-label="Tampilkan task Done"
            value={doneWindow}
            onChange={(event) => setDoneWindow(event.target.value)}
          >
            <option value="weekly">Minggu ini</option>
            <option value="monthly">Bulan ini</option>
            <option value="all">Semua riwayat</option>
          </select>
          {hiddenDoneCount > 0 && (
            <span className="rounded-full bg-zinc-800 px-2 py-1 text-xs text-zinc-500">
              {hiddenDoneCount} tersimpan
            </span>
          )}
        </label>
      </div>
      {!CLIENTS.length && (
        <p className="ops-empty">
          Belum ada client. Tambahkan client melalui tab Clients.
        </p>
      )}
      <HotfixBanner tasks={TASKS} onOpenTask={setSelectedTask} />
      <PicFilterSelect activePic={activePic} onChange={setActivePic} />

      {viewMode === "kanban" ? (
        <div className="overflow-x-auto rounded-xl border border-zinc-800">
          <div style={{ minWidth: 1820 }}>
            <div className="grid" style={{ gridTemplateColumns: gridTemplate }}>
              <div className="sticky left-0 z-10 border-b border-r border-zinc-800 bg-zinc-950 p-3 text-xs font-medium uppercase tracking-wide text-zinc-500">
                Client
              </div>
              {STATUSES.map((s) => (
                <div key={s.id} className="border-b border-zinc-800 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                      {s.short}
                    </span>
                    <span
                      className="tabular-nums text-zinc-600"
                      style={{ fontSize: 11 }}
                    >
                      {statusCounts[s.id]}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {CLIENTS.map((client) => {
              const clientTasks = boardTasks.filter(
                (t) => t.client === client.id,
              );
              const openCount = clientTasks.filter(
                (t) => t.status !== "done",
              ).length;
              const overdueCount = clientTasks.filter(isOverdue).length;
              const pulsing = pulseId === client.id;
              return (
                <div
                  key={client.id}
                  ref={(el) => {
                    rowRefs.current[client.id] = el;
                  }}
                  className="grid transition-colors"
                  style={{
                    gridTemplateColumns: gridTemplate,
                    ...(pulsing
                      ? {
                          boxShadow: `inset 0 0 0 1px ${ACCENT}`,
                          backgroundColor: rgba(ACCENT, 0.07),
                        }
                      : {}),
                  }}
                >
                  <div className="sticky left-0 z-10 flex flex-col justify-center gap-1.5 border-b border-r border-zinc-800 bg-zinc-950 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-zinc-100">
                        {client.name}
                      </span>
                      <HealthBadge health={client.health} />
                    </div>
                    <ClientProgressBar clientId={client.id} />
                    <span className="text-zinc-500" style={{ fontSize: 11 }}>
                      {openCount} open
                      {overdueCount > 0 && (
                        <span style={{ color: COLOR.rose }}>
                          {" "}
                          · {overdueCount} overdue
                        </span>
                      )}
                    </span>
                  </div>
                  {STATUSES.map((s) => {
                    const cellTasks = clientTasks.filter(
                      (t) => t.status === s.id,
                    );
                    return (
                      <div
                        key={s.id}
                        onDragOver={(e) => {
                          if (!can("update", "tasks")) return;
                          e.preventDefault();
                          e.dataTransfer.dropEffect = "move";
                        }}
                        onDrop={(e) => {
                          if (!can("update", "tasks")) return;
                          e.preventDefault();
                          const task = TASKS.find(
                            (t) =>
                              String(t.id) ===
                              e.dataTransfer.getData("text/plain"),
                          );
                          if (task && task.client === client.id)
                            moveTask(task.id, s.id);
                        }}
                        className="border-b border-l border-zinc-900 p-2"
                        style={{ minHeight: 100 }}
                      >
                        <TaskCell
                          tasks={cellTasks}
                          dimmedPic={activePic}
                          onOpenTask={setSelectedTask}
                        />
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <CalendarView activePic={activePic} onOpenTask={setSelectedTask} />
      )}

      <TaskDetailModal
        task={TASKS.find((t) => t.id === selectedTask?.id)}
        onClose={() => setSelectedTask(null)}
      />
    </section>
  );
}

/* -------------------------- Macro oversight table -------------------------- */

function MacroTable({ onSelectClient }) {
  const { CLIENTS } = useOps();
  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-800">
      <table
        className="border-collapse text-sm"
        style={{ width: "100%", minWidth: 940 }}
      >
        <thead>
          <tr className="border-b border-zinc-800 text-left text-xs uppercase tracking-wide text-zinc-500">
            <th className="p-3 font-medium">Client</th>
            <th className="p-3 font-medium">Contract</th>
            <th className="p-3 font-medium">Cycle</th>
            <th className="p-3 font-medium">Macro Phase</th>
            <th className="p-3 font-medium">Health</th>
            <th className="p-3 font-medium">Revision</th>
            <th className="p-3 font-medium">Bottleneck</th>
            <th className="p-3" />
          </tr>
        </thead>
        <tbody>
          {CLIENTS.map((c) => (
            <tr
              key={c.id}
              onClick={() => onSelectClient && onSelectClient(c.id)}
              className="cursor-pointer border-b border-zinc-900 last:border-0 hover:bg-zinc-900"
              title="Lihat swimlane client ini di Execution Board"
            >
              <td className="p-3 font-medium text-zinc-100">{c.name}</td>
              <td className="p-3 text-zinc-400">{c.contract}</td>
              <td className="p-3">
                <CycleTag cycle={c.cycle} />
              </td>
              <td className="p-3 text-zinc-400">{c.phase}</td>
              <td className="p-3">
                <HealthBadge health={c.health} />
              </td>
              <td className="p-3">
                <RevisionBadge revision={c.revision} />
              </td>
              <td
                className="truncate p-3 text-zinc-500"
                style={{ maxWidth: 240 }}
                title={c.bottleneck}
              >
                {c.bottleneck}
              </td>
              <td className="p-3">
                <ChevronRight className="h-4 w-4 text-zinc-700" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* -------------------------- status donut + workload bar -------------------------- */

function StatusDonut() {
  const { TASKS } = useOps();
  const openTasks = TASKS.filter((t) => t.status !== "done");
  const data = STATUSES.filter((s) => s.id !== "done")
    .map((s) => {
      const items = openTasks.filter((t) => t.status === s.id);
      return {
        id: s.id,
        name: s.short,
        value: items.length,
        tasks: items,
        color: s.color,
      };
    })
    .filter((d) => d.value > 0);

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-medium text-zinc-200">
        <LayoutGrid className="h-4 w-4" style={{ color: ACCENT }} />
        Tasks by Workflow Stage
      </div>
      <div className="flex items-center gap-4">
        <div style={{ width: 132, height: 132, flexShrink: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius={40}
                outerRadius={62}
                paddingAngle={2}
                stroke="none"
              >
                {data.map((d) => (
                  <Cell key={d.id} fill={d.color} />
                ))}
              </Pie>
              <Tooltip content={<GroupTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <ul className="flex-1 space-y-1.5">
          {data.map((d) => (
            <li
              key={d.id}
              className="flex items-center justify-between"
              style={{ fontSize: 12 }}
            >
              <span className="flex items-center gap-2 text-zinc-400">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: d.color }}
                />
                {d.name}
              </span>
              <span className="font-medium tabular-nums text-zinc-200">
                {d.value}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function WorkloadBar() {
  const { TASKS } = useOps();
  const openTasks = TASKS.filter((t) => t.status !== "done");
  const data = Object.entries(PIC).map(([id, p]) => {
    const items = openTasks.filter((t) => t.pic === id);
    return {
      id,
      name: p.name,
      value: items.length,
      tasks: items,
      color: p.color,
    };
  });

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-medium text-zinc-200">
        <Users className="h-4 w-4" style={{ color: ACCENT }} />
        Open Tasks by Assignee
      </div>
      <div style={{ height: 168 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ left: 4, right: 20, top: 4, bottom: 4 }}
          >
            <XAxis type="number" hide allowDecimals={false} />
            <YAxis
              type="category"
              dataKey="name"
              width={125}
              tick={{ fill: "#a1a1aa", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              content={<GroupTooltip />}
              cursor={{ fill: "rgba(255,255,255,0.03)" }}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={16}>
              {data.map((d) => (
                <Cell key={d.id} fill={d.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function HealthDonut() {
  const { CLIENTS } = useOps();
  const data = [
    {
      id: "on-track",
      name: "On Schedule",
      value: CLIENTS.filter((c) => c.health === "on-track").length,
      color: COLOR.emerald,
    },
    {
      id: "delayed",
      name: "Delayed",
      value: CLIENTS.filter((c) => c.health === "delayed").length,
      color: COLOR.amber,
    },
    {
      id: "blocked",
      name: "Blocked",
      value: CLIENTS.filter((c) => c.health === "blocked").length,
      color: COLOR.rose,
    },
  ].filter((d) => d.value > 0);

  return (
    <div className="flex items-center gap-3">
      <div style={{ width: 52, height: 52, flexShrink: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              innerRadius={15}
              outerRadius={25}
              stroke="none"
              paddingAngle={2}
            >
              {data.map((d) => (
                <Cell key={d.id} fill={d.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="space-y-0.5">
        {data.map((d) => (
          <li
            key={d.id}
            className="flex items-center gap-1.5 text-zinc-400"
            style={{ fontSize: 11 }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: d.color }}
            />
            {d.value} {d.name}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* -------------------------- at-risk list -------------------------- */

function AtRiskList({ filter, onClearFilter }) {
  const { TASKS, getClient } = useOps();
  let items = TASKS.filter(
    (t) =>
      t.status !== "done" &&
      (t.blocked || t.revision >= 3 || t.status === "review" || isOverdue(t)),
  );
  if (filter === "overdue") items = items.filter(isOverdue);
  if (filter === "review") items = items.filter((t) => t.status === "review");
  items = [...items].sort((a, b) => a.due.localeCompare(b.due));

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
      <div className="mb-1 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm font-medium text-zinc-200">
          <AlertTriangle className="h-4 w-4" style={{ color: COLOR.rose }} />
          Overdue & At-Risk Tasks
        </div>
        {filter !== "all" && (
          <button
            onClick={onClearFilter}
            className="flex items-center gap-1 rounded-full px-2 py-0.5 font-medium"
            style={{ ...pillStyle(ACCENT), fontSize: 11 }}
          >
            {filter === "overdue" ? "Overdue only" : "Client Review only"}
            <X className="h-3 w-3" />
          </button>
        )}
      </div>
      {items.length === 0 ? (
        <p className="py-6 text-center text-sm text-zinc-600">
          Tidak ada task yang cocok filter ini.
        </p>
      ) : (
        <ul className="divide-y divide-zinc-900">
          {items.map((t) => {
            const client = getClient(t.client);
            const overdue = isOverdue(t);
            return (
              <li
                key={t.id}
                className="flex flex-wrap items-center justify-between gap-2 py-2.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm text-zinc-100">{t.name}</p>
                  <p className="text-xs text-zinc-500">{client.name}</p>
                </div>
                <div className="flex items-center gap-2">
                  {overdue && (
                    <span
                      className="rounded-full px-2 py-0.5 font-medium"
                      style={{ ...pillStyle(COLOR.rose), fontSize: 10 }}
                    >
                      Overdue
                    </span>
                  )}
                  {t.status === "review" && (
                    <span
                      className="rounded-full px-2 py-0.5 font-medium"
                      style={{ ...pillStyle(COLOR.amber), fontSize: 10 }}
                    >
                      Client Review
                    </span>
                  )}
                  {t.revision >= 3 && <RevisionBadge revision={t.revision} />}
                  <PicChip id={t.pic} />
                  <span
                    className="tabular-nums"
                    style={{
                      fontSize: 12,
                      color: overdue ? COLOR.rose : "#71717a",
                    }}
                  >
                    {formatDate(t.due)}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/* -------------------------- Executive Operations Hub -------------------------- */

function DeliveryReport({ tasks }) {
  const [mode, setMode] = useState("weekly");
  const [anchor, setAnchor] = useState(todayISO());
  const report = taskDeliveryReport(tasks, anchor, mode);
  const roleRows = Object.keys(PIC)
    .map((role) => ({
      role,
      ...taskDeliveryReport(
        tasks.filter((task) => task.pic === role),
        anchor,
        mode,
      ),
    }))
    .filter((row) => row.total > 0);
  const periodLabel = `${new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" }).format(new Date(`${report.start}T00:00:00`))} – ${new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" }).format(new Date(`${report.end}T00:00:00`))}`;

  function shiftPeriod(offset) {
    if (mode === "weekly") {
      setAnchor(dateShift(anchor, offset * 7));
      return;
    }
    const value = new Date(`${anchor}T00:00:00`);
    value.setDate(1);
    value.setMonth(value.getMonth() + offset);
    setAnchor(
      `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-01`,
    );
  }

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/55 p-5">
      <SectionHeader
        title="Laporan Delivery"
        description="Total task dihitung berdasarkan deadline pada periode terpilih. Task selesai tidak dihapus agar hasil mingguan dan bulanan tetap dapat dievaluasi."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <select
              className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-200"
              aria-label="Periode laporan delivery"
              value={mode}
              onChange={(event) => setMode(event.target.value)}
            >
              <option value="weekly">Mingguan</option>
              <option value="monthly">Bulanan</option>
            </select>
            <button
              className="ops-button"
              aria-label="Periode sebelumnya"
              onClick={() => shiftPeriod(-1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <input
              className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-200"
              aria-label="Tanggal acuan laporan delivery"
              type="date"
              value={anchor}
              onChange={(event) => setAnchor(event.target.value)}
            />
            <button
              className="ops-button"
              aria-label="Periode berikutnya"
              onClick={() => shiftPeriod(1)}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        }
      />
      <p className="mb-4 text-sm font-medium text-violet-300">{periodLabel}</p>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <KpiCard
          icon={ListTodo}
          label="Total Task"
          value={report.total}
          hint="Deadline di periode ini"
        />
        <KpiCard
          icon={CheckCircle2}
          label="Task Done"
          value={report.done}
          hint={`${report.completionRate}% selesai`}
          color={COLOR.emerald}
        />
        <KpiCard
          icon={Flag}
          label="Selesai Tepat Waktu"
          value={report.onTime}
          hint="Completed ≤ deadline"
          color={COLOR.sky}
        />
        <KpiCard
          icon={AlertTriangle}
          label="Over Deadline"
          value={report.overdue}
          hint="Terlambat atau belum selesai"
          color={COLOR.rose}
        />
        <KpiCard
          icon={Clock}
          label="Belum Selesai"
          value={report.outstanding}
          hint="Carry-over periode"
          color={COLOR.amber}
        />
      </div>
      <div className="mt-5 overflow-x-auto rounded-lg border border-zinc-800">
        <table className="w-full min-w-[620px] text-left text-sm">
          <thead className="bg-zinc-950/70 text-xs uppercase tracking-wide text-zinc-500">
            <tr>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Total</th>
              <th className="px-4 py-3 font-medium">Done</th>
              <th className="px-4 py-3 font-medium">Tepat waktu</th>
              <th className="px-4 py-3 font-medium">Over deadline</th>
              <th className="px-4 py-3 font-medium">Belum selesai</th>
            </tr>
          </thead>
          <tbody>
            {roleRows.map((row) => (
              <tr key={row.role} className="border-t border-zinc-800">
                <td className="px-4 py-3 font-medium text-zinc-200">
                  {PIC[row.role].name}
                </td>
                <td className="px-4 py-3 tabular-nums text-zinc-400">
                  {row.total}
                </td>
                <td className="px-4 py-3 tabular-nums text-emerald-300">
                  {row.done}
                </td>
                <td className="px-4 py-3 tabular-nums text-sky-300">
                  {row.onTime}
                </td>
                <td className="px-4 py-3 tabular-nums text-rose-300">
                  {row.overdue}
                </td>
                <td className="px-4 py-3 tabular-nums text-amber-300">
                  {row.outstanding}
                </td>
              </tr>
            ))}
            {!roleRows.length && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-zinc-600">
                  Tidak ada task dengan deadline pada periode ini.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ExecutiveHub({ onGoToClient }) {
  const { CLIENTS, TASKS } = useOps();
  const [riskFilter, setRiskFilter] = useState("all");

  const kpis = derive(() => {
    const activeClients = CLIENTS.length;
    const openTasks = TASKS.filter((t) => t.status !== "done").length;
    const overdueTasks = TASKS.filter(isOverdue).length;
    const clientReview = TASKS.filter((t) => t.status === "review").length;
    return { activeClients, openTasks, overdueTasks, clientReview };
  }, []);

  function toggleFilter(key) {
    setRiskFilter((prev) => (prev === key ? "all" : key));
  }

  return (
    <section className="space-y-8">
      <PageHeader
        icon={LayoutDashboard}
        eyebrow="Operations Hub"
        title="Command center delivery"
        description="Lihat kondisi operasional hari ini, laporan task per periode, workload tim, dan client yang membutuhkan keputusan."
      />

      <div>
        <div className="mb-3 flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span
              className="absolute inline-flex h-full w-full animate-ping rounded-full"
              style={{ backgroundColor: ACCENT, opacity: 0.6 }}
            />
            <span
              className="relative inline-flex h-2 w-2 rounded-full"
              style={{ backgroundColor: ACCENT }}
            />
          </span>
          <span className="text-xs font-medium text-zinc-500">
            Live — klik Overdue / Client Review untuk filter list di bawah
          </span>
        </div>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <KpiCard
            icon={Users}
            label="Active Clients"
            value={kpis.activeClients}
            hint="Semua client terdaftar"
          />
          <KpiCard
            icon={ListTodo}
            label="Open Tasks"
            value={kpis.openTasks}
            hint="Semua task belum selesai, termasuk overdue"
          />
          <KpiCard
            icon={AlertTriangle}
            label="Overdue Tasks"
            value={kpis.overdueTasks}
            hint="Lewat due date"
            color={COLOR.rose}
            active={riskFilter === "overdue"}
            onClick={() => toggleFilter("overdue")}
          />
          <KpiCard
            icon={Clock}
            label="Client Review"
            value={kpis.clientReview}
            hint="Menunggu review client"
            color={COLOR.amber}
            active={riskFilter === "review"}
            onClick={() => toggleFilter("review")}
          />
        </div>
      </div>

      <DeliveryReport tasks={TASKS} />

      <div>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-medium text-zinc-300">
            Macro Project Oversight
          </h2>
          <HealthDonut />
        </div>
        <MacroTable onSelectClient={onGoToClient} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <StatusDonut />
        <WorkloadBar />
      </div>

      <AtRiskList
        filter={riskFilter}
        onClearFilter={() => setRiskFilter("all")}
      />
    </section>
  );
}

/* -------------------------- KPI Dashboard (marketing performance) -------------------------- */

function Sparkline({ data, color }) {
  const withData = data.filter((d) => d.value != null);
  if (withData.length < 2) {
    return (
      <span className="text-zinc-700" style={{ fontSize: 11 }}>
        —
      </span>
    );
  }
  return (
    <div
      style={{ width: 72, height: 26 }}
      title={withData.map((d) => `${d.value}%`).join(" → ")}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
          <Bar
            dataKey="value"
            fill={color}
            radius={[1, 1, 0, 0]}
            isAnimationActive={false}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function SortHeader({ label, sortKey: key, sortState, onSort }) {
  const active = sortState.key === key;
  return (
    <th
      className="cursor-pointer select-none p-3 text-left font-medium"
      onClick={() => onSort(key)}
    >
      <span
        className="inline-flex items-center gap-1"
        style={{ color: active ? "#e4e4e7" : undefined }}
      >
        {label}
        {active ? (
          sortState.dir === "asc" ? (
            <ArrowUp className="h-3 w-3" />
          ) : (
            <ArrowDown className="h-3 w-3" />
          )
        ) : (
          <ArrowUpDown className="h-3 w-3" style={{ opacity: 0.3 }} />
        )}
      </span>
    </th>
  );
}

/* per-variant breakdown (control + test variants) shown when a Cycle Log
   row is expanded */
function VariantTable({ variants }) {
  if (!variants || variants.length === 0) {
    return (
      <div
        className="border-t border-zinc-800 bg-zinc-950 p-4 text-zinc-600"
        style={{ fontSize: 12 }}
      >
        Belum ada varian yang diuji untuk cycle ini.
      </div>
    );
  }
  const winner = getWinnerVariant(variants);
  return (
    <div className="overflow-x-auto border-t border-zinc-800 bg-zinc-950 p-3">
      <table
        className="border-collapse text-sm"
        style={{ width: "100%", minWidth: 760 }}
      >
        <thead>
          <tr className="border-b border-zinc-800 text-left text-xs uppercase tracking-wide text-zinc-500">
            <th className="p-2 font-medium">Varian</th>
            <th className="p-2 font-medium">Tipe</th>
            <th className="p-2 font-medium">Target Visit</th>
            <th className="p-2 font-medium">Real Visit</th>
            <th className="p-2 font-medium">Bounce Rate</th>
            <th className="p-2 font-medium">Lead Rate</th>
            <th className="p-2 font-medium">Intent Rate</th>
          </tr>
        </thead>
        <tbody>
          {variants.map((v) => (
            <tr key={v.id} className="border-b border-zinc-900 last:border-0">
              <td className="p-2 font-medium text-zinc-100">
                <span className="flex items-center gap-1.5">
                  {v.label}
                  {winner && v.id === winner.id && (
                    <span
                      className="rounded-full px-1.5 py-0.5 font-medium"
                      style={{ ...pillStyle(COLOR.emerald), fontSize: 9 }}
                    >
                      Lead rate tertinggi
                    </span>
                  )}
                </span>
              </td>
              <td className="p-2">
                <span
                  className="rounded-full px-1.5 py-0.5 font-medium"
                  style={{
                    ...pillStyle(v.isControl ? COLOR.zinc : ACCENT),
                    fontSize: 10,
                  }}
                >
                  {v.isControl ? "Control" : "Test"}
                </span>
              </td>
              <td className="p-2 tabular-nums text-zinc-400">
                {v.targetVisit ?? "—"}
              </td>
              <td className="p-2 tabular-nums text-zinc-400">
                {v.realVisit ?? "—"}
              </td>
              <td className="p-2 tabular-nums text-zinc-400">
                {v.bounceRate != null ? `${v.bounceRate}%` : "—"}
              </td>
              <td className="p-2 tabular-nums font-medium text-zinc-100">
                {v.leadRate != null ? `${v.leadRate}%` : "—"}
              </td>
              <td className="p-2 tabular-nums text-zinc-400">
                {v.intentRate != null ? `${v.intentRate}%` : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const CYCLE_STATUSES = ["Baseline", "Improving", "Declining", "Setup"];

function CycleLogFilters({
  clientFilter,
  statusFilter,
  onClientChange,
  onStatusChange,
}) {
  const { CLIENTS } = useOps();
  return (
    <div className="mb-4 flex flex-wrap gap-3 rounded-xl border border-zinc-800 bg-zinc-900/55 p-4">
      <label className="grid gap-1.5 text-xs font-medium uppercase tracking-wide text-zinc-500">
        Client
        <select
          className="min-w-52 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm normal-case tracking-normal text-zinc-200"
          aria-label="Filter client cycle log"
          value={clientFilter || ""}
          onChange={(event) => onClientChange(event.target.value || null)}
        >
          <option value="">Semua client</option>
          {CLIENTS.map((client) => (
            <option key={client.id} value={client.id}>
              {client.name}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-1.5 text-xs font-medium uppercase tracking-wide text-zinc-500">
        Status
        <select
          className="min-w-44 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm normal-case tracking-normal text-zinc-200"
          aria-label="Filter status cycle log"
          value={statusFilter || ""}
          onChange={(event) => onStatusChange(event.target.value || null)}
        >
          <option value="">Semua status</option>
          {CYCLE_STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}

/* one row of the flat Cycle Log; clicking it expands into the variant
   breakdown table (control + test variants) for that specific cycle */
function CycleLogRow({ cycle: c, expanded, onToggle }) {
  const { CYCLES, CLIENT_COLOR, openEditor, askDelete, can } = useOps();
  const accent = CYCLE_STATUS_COLOR[c.status] || COLOR.zinc;
  return (
    <>
      <tr
        onClick={onToggle}
        className="cursor-pointer border-b border-zinc-900 hover:bg-zinc-900"
        title="Klik untuk lihat breakdown per varian"
      >
        <td className="p-3">
          <ChevronRight
            className="h-3.5 w-3.5 text-zinc-600 transition-transform"
            style={{ transform: expanded ? "rotate(90deg)" : "none" }}
          />
        </td>
        <td
          className="p-3 font-medium text-zinc-100"
          style={{
            borderLeftWidth: 3,
            borderLeftColor: CLIENT_COLOR[c.clientId],
          }}
        >
          {c.clientName}
        </td>
        <td className="p-3">
          <CycleTag cycle={c.cycle} />
        </td>
        <td className="whitespace-nowrap p-3 text-zinc-400">{c.periode}</td>
        <td className="p-3">
          <p className="font-medium tabular-nums text-zinc-100">
            {c.leadRate != null ? `${c.leadRate}% lead` : "Belum terukur"}
          </p>
          <p className="mt-1 text-xs text-zinc-500">
            {c.realVisit ?? "—"} visit · {testVariantCount(c)} varian uji
          </p>
        </td>
        <td className="p-3">
          <p className="text-zinc-300">{c.layer || "—"}</p>
          <p
            className="mt-1 max-w-56 truncate text-xs text-zinc-500"
            title={c.bottleneck}
          >
            {c.bottleneck || "Tanpa bottleneck"}
          </p>
        </td>
        <td className="p-3">
          <span
            className="rounded-full px-2 py-0.5 font-medium"
            style={{ ...pillStyle(accent), fontSize: 10 }}
          >
            {c.status}
          </span>
          <div className="mt-2">
            <DeltaTag value={deltaPP(c.leadRate, c.prevLeadRate)} />
          </div>
        </td>
        <td className="whitespace-nowrap p-3 text-zinc-500">
          {formatDate(c.updateDate)}
        </td>
        <td className="p-3 text-right">
          {can("update", "cycles") && (
            <div className="flex justify-end gap-1">
              <button
                className="ops-button"
                onClick={(e) => {
                  e.stopPropagation();
                  openEditor(
                    "cycles",
                    CYCLES.find((x) => x.id === c.id),
                  );
                }}
              >
                Edit
              </button>
              <button
                className="ops-button ops-danger"
                onClick={(e) => {
                  e.stopPropagation();
                  askDelete("cycles", c);
                }}
              >
                Hapus
              </button>
            </div>
          )}
        </td>
      </tr>
      {expanded && (
        <tr>
          <td colSpan={9} className="p-0">
            <div className="grid gap-4 border-t border-zinc-800 bg-zinc-950 px-5 py-4 text-sm md:grid-cols-2 xl:grid-cols-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-zinc-600">
                  Traffic
                </p>
                <p className="mt-1 text-zinc-300">
                  Target {c.targetVisit ?? "—"} · Real {c.realVisit ?? "—"}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-zinc-600">
                  Rates
                </p>
                <p className="mt-1 text-zinc-300">
                  Bounce {c.bounceRate ?? "—"}% · Lead {c.leadRate ?? "—"}% ·
                  Intent {c.intentRate ?? "—"}%
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-zinc-600">
                  Hipotesis
                </p>
                <p className="mt-1 text-zinc-300">{c.hypothesis || "—"}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-zinc-600">
                  Optimasi
                </p>
                <p className="mt-1 text-zinc-300">{c.optimization || "—"}</p>
              </div>
            </div>
            <VariantTable variants={c.variants} />
          </td>
        </tr>
      )}
    </>
  );
}

/* flat, filterable log across every client's cycles. Filter Status=
   Declining with Client=Semua Client to see every struggling cycle
   across the whole roster at once — a per-client view could never
   show that in one place. Click a row for its variant breakdown. */
function CycleLogTable({ clientFilter, statusFilter }) {
  const { CLIENTS, cyclesFor } = useOps();
  const [expandedId, setExpandedId] = useState(null);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const rows = derive(() => {
    let items = CLIENTS.flatMap((client) => {
      const cycles = cyclesFor(client.id);
      return cycles.map((c, i) => ({
        ...c,
        clientId: client.id,
        clientName: client.name,
        prevLeadRate: i > 0 ? cycles[i - 1].leadRate : null,
      }));
    });
    if (clientFilter) items = items.filter((r) => r.clientId === clientFilter);
    if (statusFilter) items = items.filter((r) => r.status === statusFilter);
    if (query.trim()) {
      const needle = query.trim().toLowerCase();
      items = items.filter((item) =>
        [
          item.clientName,
          item.periode,
          item.layer,
          item.bottleneck,
          item.hypothesis,
        ]
          .join(" ")
          .toLowerCase()
          .includes(needle),
      );
    }
    return items.sort((a, b) => b.updateDate.localeCompare(a.updateDate));
  }, [clientFilter, statusFilter, query]);
  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
  const safePage = Math.min(page, pageCount);
  const visibleRows = rows.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize,
  );

  useEffect(() => setPage(1), [clientFilter, statusFilter, query]);

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/40">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 p-4">
        <label className="relative block w-full max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-600" />
          <input
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 py-2 pl-9 pr-3 text-sm text-zinc-200 focus:border-violet-500 focus:outline-none"
            aria-label="Cari cycle log"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Cari client, periode, layer, atau hipotesis"
          />
        </label>
        <span className="text-sm text-zinc-500">
          {rows.length} cycle ditemukan
        </span>
      </div>
      <div className="overflow-x-auto">
        <table
          className="border-collapse text-sm"
          style={{ width: "100%", minWidth: 1080 }}
        >
          <thead>
            <tr className="border-b border-zinc-800 text-left text-xs uppercase tracking-wide text-zinc-500">
              <th className="p-2.5" style={{ width: 28 }} />
              <th className="p-2.5 font-medium">Client</th>
              <th className="p-2.5 font-medium">Cycle</th>
              <th className="p-2.5 font-medium">Periode</th>
              <th className="p-2.5 font-medium">Performance</th>
              <th className="p-2.5 font-medium">Fokus Saat Ini</th>
              <th className="p-2.5 font-medium">Status</th>
              <th className="p-2.5 font-medium">Tanggal Update</th>
              <th className="p-2.5 font-medium text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((c) => (
              <CycleLogRow
                key={c.id}
                cycle={c}
                expanded={expandedId === c.id}
                onToggle={() =>
                  setExpandedId((prev) => (prev === c.id ? null : c.id))
                }
              />
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={9} className="p-8 text-center text-zinc-600">
                  Tidak ada cycle yang cocok dengan filter ini.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <Pager
        page={safePage}
        pageCount={pageCount}
        total={rows.length}
        from={(safePage - 1) * pageSize + 1}
        to={Math.min(safePage * pageSize, rows.length)}
        onChange={setPage}
      />
    </div>
  );
}

function CycleLogSection({
  clientFilter,
  statusFilter,
  onClientChange,
  onStatusChange,
  sectionRef,
}) {
  const { CLIENTS, openEditor, can } = useOps();
  return (
    <div
      ref={sectionRef}
      className="rounded-xl border border-zinc-800 bg-zinc-900/45 p-5"
    >
      <SectionHeader
        title="Cycle Log"
        description="Riwayat cycle terbaru ditampilkan lebih dulu. Cari atau filter data, lalu klik row untuk membuka detail dan seluruh varian."
        action={
          can("create", "cycles") && (
            <button
              className="ops-button ops-primary"
              disabled={!CLIENTS.length}
              onClick={() =>
                openEditor("cycles", null, {
                  client: clientFilter || CLIENTS[0]?.id,
                })
              }
            >
              + Tambah cycle log
            </button>
          )
        }
      />
      <CycleLogFilters
        clientFilter={clientFilter}
        statusFilter={statusFilter}
        onClientChange={onClientChange}
        onStatusChange={onStatusChange}
      />
      <CycleLogTable clientFilter={clientFilter} statusFilter={statusFilter} />
    </div>
  );
}

function SummaryRow({ row, onClick }) {
  const { openEditor, askDelete, can } = useOps();
  const meta = FLAG_META[row.flag];
  const FlagIcon = meta.icon;
  const trendData = row.cycles.map((c) => ({ value: c.leadRate }));

  return (
    <tr
      onClick={onClick}
      className="cursor-pointer border-b border-zinc-900 transition-colors hover:bg-zinc-900"
      title="Lihat riwayat cycle client ini di Cycle Log"
    >
      <td className="p-3 font-medium text-zinc-100">
        {row.client.name}
        {can("update", "cycles") && (
          <div className="mt-2 flex gap-1">
            {row.last.id ? (
              <>
                <button
                  className="ops-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    openEditor("cycles", row.last);
                  }}
                >
                  Edit cycle
                </button>
                <button
                  className="ops-button ops-danger"
                  onClick={(e) => {
                    e.stopPropagation();
                    askDelete("cycles", row.last);
                  }}
                >
                  Hapus
                </button>
              </>
            ) : (
              <button
                className="ops-button"
                onClick={(e) => {
                  e.stopPropagation();
                  openEditor("cycles", null, { client: row.client.id });
                }}
              >
                + Cycle
              </button>
            )}
          </div>
        )}
      </td>
      <td className="p-3">
        {row.last.id ? (
          <CycleTag cycle={row.last.cycle} />
        ) : (
          <span className="text-zinc-500">Belum ada</span>
        )}
      </td>
      <td className="p-3">
        <span
          className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium"
          style={{ ...pillStyle(meta.color), fontSize: 11 }}
        >
          <FlagIcon className="h-3 w-3" />
          {meta.label}
        </span>
      </td>
      <td
        className="truncate p-3 text-zinc-500"
        style={{ maxWidth: 200, fontSize: 12 }}
        title={row.last.bottleneck}
      >
        {row.last.bottleneck}
      </td>
      <td className="p-3 tabular-nums font-medium text-zinc-100">
        {row.last.leadRate != null ? `${row.last.leadRate}%` : "—"}
      </td>
      <td className="p-3">
        <Sparkline data={trendData} color={meta.color} />
      </td>
      <td className="p-3">
        <DeltaTag value={row.dPrev} />
      </td>
      <td className="p-3">
        {row.hasBaseline ? (
          <DeltaTag value={row.dBase} />
        ) : (
          <span className="text-zinc-600" style={{ fontSize: 12 }}>
            Baseline
          </span>
        )}
      </td>
      <td className="p-3">
        {row.gBase != null ? (
          <span
            className="tabular-nums font-medium"
            style={{
              fontSize: 13,
              color: row.gBase >= 0 ? COLOR.emerald : COLOR.rose,
            }}
          >
            {row.gBase >= 0 ? "+" : ""}
            {row.gBase}%
          </span>
        ) : (
          <span className="text-zinc-600" style={{ fontSize: 12 }}>
            —
          </span>
        )}
      </td>
      <td className="p-3 text-zinc-500" style={{ fontSize: 12.5 }}>
        {formatDate(row.last.updateDate)}
      </td>
      <td className="p-3">
        <ChevronRight className="h-3.5 w-3.5 text-zinc-700" />
      </td>
    </tr>
  );
}

function KpiSummaryTable({ onSelectClient }) {
  const { CLIENTS, cyclesFor, computeFlag } = useOps();
  const [sort, setSort] = useState({ key: "severity", dir: "desc" });

  const rows = derive(
    () =>
      CLIENTS.map((client) => {
        const cycles = cyclesFor(client.id);
        const last = cycles[cycles.length - 1] || {
          cycle: 0,
          leadRate: null,
          updateDate: todayISO(),
          bottleneck: "Belum ada cycle",
          status: "Setup",
        };
        const base = cycles[0] || last;
        const prev = cycles.length > 1 ? cycles[cycles.length - 2] : null;
        const hasBaseline = base !== last;
        const flag = computeFlag(client.id);
        return {
          client,
          cycles,
          last,
          hasBaseline,
          flag,
          dPrev: prev ? deltaPP(last.leadRate, prev.leadRate) : null,
          dBase: hasBaseline ? deltaPP(last.leadRate, base.leadRate) : null,
          gBase: hasBaseline ? growthPct(last.leadRate, base.leadRate) : null,
        };
      }),
    [],
  );

  function sortValue(row, key) {
    switch (key) {
      case "client":
        return row.client.name;
      case "cycle":
        return row.last.cycle;
      case "severity":
        return SEVERITY_RANK[row.flag];
      case "leadRate":
        return row.last.leadRate ?? -Infinity;
      case "dPrev":
        return row.dPrev ?? -Infinity;
      case "dBase":
        return row.dBase ?? -Infinity;
      case "growth":
        return row.gBase ?? -Infinity;
      case "update":
        return row.last.updateDate;
      default:
        return 0;
    }
  }

  const sorted = derive(() => {
    const copy = [...rows];
    copy.sort((a, b) => {
      const av = sortValue(a, sort.key);
      const bv = sortValue(b, sort.key);
      if (av < bv) return sort.dir === "asc" ? -1 : 1;
      if (av > bv) return sort.dir === "asc" ? 1 : -1;
      return 0;
    });
    return copy;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, sort]);

  function handleSort(key) {
    setSort((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { key, dir: key === "severity" ? "desc" : "asc" },
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-800">
      <table
        className="border-collapse text-sm"
        style={{ width: "100%", minWidth: 1040 }}
      >
        <thead>
          <tr className="border-b border-zinc-800 text-xs uppercase tracking-wide text-zinc-500">
            <SortHeader
              label="Client"
              sortKey="client"
              sortState={sort}
              onSort={handleSort}
            />
            <SortHeader
              label="Cycle"
              sortKey="cycle"
              sortState={sort}
              onSort={handleSort}
            />
            <SortHeader
              label="Status"
              sortKey="severity"
              sortState={sort}
              onSort={handleSort}
            />
            <th className="p-3 text-left font-medium">Bottleneck</th>
            <SortHeader
              label="Lead Rate"
              sortKey="leadRate"
              sortState={sort}
              onSort={handleSort}
            />
            <th className="p-3 text-left font-medium">Trend</th>
            <SortHeader
              label="Δ Cycle Lalu"
              sortKey="dPrev"
              sortState={sort}
              onSort={handleSort}
            />
            <SortHeader
              label="Δ Awal Kontrak"
              sortKey="dBase"
              sortState={sort}
              onSort={handleSort}
            />
            <SortHeader
              label="Growth"
              sortKey="growth"
              sortState={sort}
              onSort={handleSort}
            />
            <SortHeader
              label="Update"
              sortKey="update"
              sortState={sort}
              onSort={handleSort}
            />
            <th className="p-3" style={{ width: 32 }} />
          </tr>
        </thead>
        <tbody>
          {sorted.map((row) => (
            <SummaryRow
              key={row.client.id}
              row={row}
              onClick={() => onSelectClient(row.client.id)}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CombinedTrendChart() {
  const { CLIENTS, CYCLES, CLIENT_COLOR } = useOps();
  const cycleNumbers = [...new Set(CYCLES.map((c) => c.cycle))].sort(
    (a, b) => a - b,
  );
  const data = cycleNumbers.map((cycleNum) => {
    const point = { cycle: `Cycle ${cycleNum}` };
    CLIENTS.forEach((c) => {
      const rec = CYCLES.find((r) => r.client === c.id && r.cycle === cycleNum);
      point[c.id] = rec ? rec.leadRate : null;
    });
    return point;
  });

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-medium text-zinc-200">
        <TrendingUp className="h-4 w-4" style={{ color: ACCENT }} />
        Lead Rate per Client per Cycle
      </div>
      <div style={{ height: 240 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
          >
            <XAxis
              dataKey="cycle"
              tick={{ fill: "#71717a", fontSize: 11 }}
              axisLine={{ stroke: "#27272a" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "#71717a", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={34}
              unit="%"
            />
            <Tooltip
              content={<TrendTooltip />}
              cursor={{ fill: "rgba(255,255,255,0.03)" }}
            />
            {CLIENTS.map((c) => (
              <Bar
                key={c.id}
                dataKey={c.id}
                name={c.name}
                fill={CLIENT_COLOR[c.id]}
                radius={[3, 3, 0, 0]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-3 flex flex-wrap gap-3">
        {CLIENTS.map((c) => (
          <span
            key={c.id}
            className="flex items-center gap-1.5 text-zinc-400"
            style={{ fontSize: 11 }}
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: CLIENT_COLOR[c.id] }}
            />
            {c.name}
          </span>
        ))}
      </div>
    </div>
  );
}

function InterventionBanner({ flaggedClients, onSelectClient }) {
  const { cyclesFor } = useOps();
  if (flaggedClients.length === 0) {
    return (
      <div
        className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 p-4"
        style={{ color: COLOR.emerald }}
      >
        <CheckCircle2 className="h-4 w-4 shrink-0" />
        <span className="text-zinc-300" style={{ fontSize: 13 }}>
          Semua client aman — tidak ada yang butuh intervensi kamu saat ini.
        </span>
      </div>
    );
  }
  return (
    <div
      className="rounded-xl p-4"
      style={{
        backgroundColor: rgba(COLOR.rose, 0.08),
        border: `1px solid ${rgba(COLOR.rose, 0.28)}`,
      }}
    >
      <div
        className="flex items-center gap-2 font-medium"
        style={{ color: COLOR.rose, fontSize: 13 }}
      >
        <AlertTriangle className="h-4 w-4" />
        {flaggedClients.length} client butuh intervensi kamu
      </div>
      <ul className="mt-2 space-y-1">
        {flaggedClients.map((c) => {
          const cycles = cyclesFor(c.id);
          const last = cycles[cycles.length - 1];
          return (
            <li key={c.id}>
              <button
                onClick={() => onSelectClient(c.id)}
                className="text-left text-zinc-300 underline decoration-dotted hover:text-zinc-100"
                style={{ fontSize: 12.5 }}
              >
                {c.name}
              </button>
              <span className="text-zinc-500" style={{ fontSize: 12 }}>
                {" "}
                — Lead Rate turun 2 cycle berturut-turut · {last.bottleneck}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function KpiDashboard() {
  const { CLIENTS, computeFlag, openEditor, can } = useOps();
  const flaggedClients = derive(
    () => CLIENTS.filter((c) => computeFlag(c.id) === "at-risk"),
    [],
  );
  const [logClientFilter, setLogClientFilter] = useState(null);
  const [logStatusFilter, setLogStatusFilter] = useState(null);
  const logSectionRef = useRef(null);

  function focusClient(id) {
    setLogClientFilter(id);
    requestAnimationFrame(() => {
      logSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }

  return (
    <section className="space-y-6">
      <PageHeader
        icon={TrendingUp}
        eyebrow="Client Performance KPI"
        title="Performa client per cycle"
        description="Bandingkan hasil landing page, temukan client yang perlu intervensi, lalu buka Cycle Log untuk melihat detail dan varian pengujian."
        actions={
          can("create", "cycles") && (
            <button
              className="ops-button ops-primary"
              disabled={!CLIENTS.length}
              onClick={() => openEditor("cycles")}
            >
              + Tambah cycle KPI
            </button>
          )
        }
      />
      {!CLIENTS.length && (
        <p className="ops-empty">
          Belum ada client. Tambahkan client untuk mulai mencatat cycle.
        </p>
      )}
      <InterventionBanner
        flaggedClients={flaggedClients}
        onSelectClient={focusClient}
      />

      <KpiSummaryTable onSelectClient={focusClient} />

      <CombinedTrendChart />

      <CycleLogSection
        clientFilter={logClientFilter}
        statusFilter={logStatusFilter}
        onClientChange={setLogClientFilter}
        onStatusChange={setLogStatusFilter}
        sectionRef={logSectionRef}
      />
    </section>
  );
}

/* -------------------------- Feedback Loop -------------------------- */

function FeedbackBanner({ items, onSelectPriority }) {
  const openP1 = items.filter((f) => f.priority === 1 && !f.action).length;
  if (openP1 === 0) {
    return (
      <div
        className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 p-4"
        style={{ color: COLOR.emerald }}
      >
        <CheckCircle2 className="h-4 w-4 shrink-0" />
        <span className="text-zinc-300" style={{ fontSize: 13 }}>
          Tidak ada feedback prioritas 1 yang masih menggantung.
        </span>
      </div>
    );
  }
  return (
    <button
      onClick={() => onSelectPriority(1)}
      className="w-full rounded-xl p-4 text-left"
      style={{
        backgroundColor: rgba(COLOR.rose, 0.08),
        border: `1px solid ${rgba(COLOR.rose, 0.28)}`,
      }}
    >
      <span
        className="flex items-center gap-2 font-medium"
        style={{ color: COLOR.rose, fontSize: 13 }}
      >
        <AlertTriangle className="h-4 w-4" />
        {openP1} feedback P1 belum ditindaklanjuti — klik untuk filter
      </span>
    </button>
  );
}

function FeedbackFilters({
  clientFilter,
  phaseFilter,
  priorityFilter,
  onClientChange,
  onPhaseChange,
  onPriorityChange,
}) {
  const { CLIENTS } = useOps();
  return (
    <div className="mb-4 grid gap-3 rounded-xl border border-zinc-800 bg-zinc-900/55 p-4 sm:grid-cols-3">
      <label className="grid gap-1.5 text-xs font-medium uppercase tracking-wide text-zinc-500">
        Client
        <select
          className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm normal-case tracking-normal text-zinc-200"
          aria-label="Filter client feedback"
          value={clientFilter || ""}
          onChange={(event) => onClientChange(event.target.value || null)}
        >
          <option value="">Semua client</option>
          {CLIENTS.map((client) => (
            <option key={client.id} value={client.id}>
              {client.name}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-1.5 text-xs font-medium uppercase tracking-wide text-zinc-500">
        Checkpoint
        <select
          className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm normal-case tracking-normal text-zinc-200"
          aria-label="Filter checkpoint feedback"
          value={phaseFilter || ""}
          onChange={(event) =>
            onPhaseChange(
              event.target.value ? Number(event.target.value) : null,
            )
          }
        >
          <option value="">Semua checkpoint</option>
          {[30, 50, 90].map((phase) => (
            <option key={phase} value={phase}>
              {PHASE_META[phase].label}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-1.5 text-xs font-medium uppercase tracking-wide text-zinc-500">
        Prioritas
        <select
          className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm normal-case tracking-normal text-zinc-200"
          aria-label="Filter prioritas feedback"
          value={priorityFilter || ""}
          onChange={(event) =>
            onPriorityChange(
              event.target.value ? Number(event.target.value) : null,
            )
          }
        >
          <option value="">Semua prioritas</option>
          {[1, 2, 3].map((priority) => (
            <option key={priority} value={priority}>
              {PRIORITY_META[priority].label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}

function FeedbackTable({ clientFilter, phaseFilter, priorityFilter }) {
  const {
    FEEDBACK,
    getClient,
    openEditor,
    openFeedbackAction,
    openFeedbackDetails,
    askDelete,
    can,
  } = useOps();
  const [query, setQuery] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const rows = derive(() => {
    let items = FEEDBACK.map((f) => ({
      ...f,
      clientName: getClient(f.client).name,
    }));
    if (clientFilter) items = items.filter((f) => f.client === clientFilter);
    if (phaseFilter) items = items.filter((f) => f.phase === phaseFilter);
    if (priorityFilter)
      items = items.filter((f) => f.priority === priorityFilter);
    if (actionFilter === "open") items = items.filter((f) => !f.action);
    if (actionFilter === "done") items = items.filter((f) => Boolean(f.action));
    if (query.trim()) {
      const needle = query.trim().toLowerCase();
      items = items.filter((item) =>
        [item.clientName, item.from, item.topic, item.details, item.action]
          .join(" ")
          .toLowerCase()
          .includes(needle),
      );
    }
    return items.sort((a, b) => b.date.localeCompare(a.date));
  }, [clientFilter, phaseFilter, priorityFilter, actionFilter, query]);
  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
  const safePage = Math.min(page, pageCount);
  const visibleRows = rows.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize,
  );

  useEffect(
    () => setPage(1),
    [clientFilter, phaseFilter, priorityFilter, actionFilter, query],
  );

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/40">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 p-4">
        <label className="relative block w-full max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-600" />
          <input
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 py-2 pl-9 pr-3 text-sm text-zinc-200 focus:border-violet-500 focus:outline-none"
            aria-label="Cari feedback"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Cari client, topik, detail, atau tindak lanjut"
          />
        </label>
        <div className="flex items-center gap-3">
          <select
            className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-200"
            aria-label="Filter tindak lanjut feedback"
            value={actionFilter}
            onChange={(event) => setActionFilter(event.target.value)}
          >
            <option value="all">Semua tindak lanjut</option>
            <option value="open">Belum ditindaklanjuti</option>
            <option value="done">Sudah ditindaklanjuti</option>
          </select>
          <span className="text-sm text-zinc-500">{rows.length} feedback</span>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table
          className="border-collapse text-sm"
          style={{ width: "100%", minWidth: 1040 }}
        >
          <thead>
            <tr className="border-b border-zinc-800 text-left text-xs uppercase tracking-wide text-zinc-500">
              <th className="p-3 font-medium">Client & Checkpoint</th>
              <th className="p-3 font-medium">Feedback</th>
              <th className="p-3 font-medium">From</th>
              <th className="p-3 font-medium">Priority</th>
              <th className="p-3 font-medium">Tindak Lanjut</th>
              <th className="p-3 font-medium text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((f) => {
              const pMeta = PRIORITY_META[f.priority];
              const phaseMeta = PHASE_META[f.phase];
              return (
                <tr
                  key={f.id}
                  className="border-b border-zinc-900 last:border-0 hover:bg-zinc-900"
                >
                  <td
                    className="p-3 font-medium text-zinc-100"
                    style={{ borderLeftWidth: 3, borderLeftColor: pMeta.color }}
                  >
                    {f.clientName}
                    <div className="mt-2 flex items-center gap-2">
                      <span
                        className="rounded-full px-2 py-0.5 font-medium"
                        style={{ ...pillStyle(phaseMeta.color), fontSize: 10 }}
                      >
                        {phaseMeta.short}
                      </span>
                      <span className="whitespace-nowrap text-xs font-normal text-zinc-500">
                        {formatDate(f.date)}
                      </span>
                    </div>
                  </td>
                  <td className="p-3">
                    <p className="font-medium text-zinc-200">{f.topic}</p>
                    <p
                      className="mt-1 max-w-md truncate text-xs text-zinc-500"
                      title={f.details}
                    >
                      {f.details}
                    </p>
                  </td>
                  <td className="p-3">
                    <span
                      className="flex items-center gap-1.5 text-zinc-300"
                      style={{ fontSize: 12.5 }}
                    >
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: FROM_TYPE_COLOR[f.fromType] }}
                      />
                      {f.from}
                    </span>
                  </td>
                  <td className="p-3">
                    <span
                      className="rounded-full px-2 py-0.5 font-medium"
                      style={{ ...pillStyle(pMeta.color), fontSize: 10 }}
                    >
                      {pMeta.label}
                    </span>
                  </td>
                  <td
                    className="truncate p-3"
                    style={{ maxWidth: 220, fontSize: 12 }}
                    title={f.action || undefined}
                  >
                    {f.action ? (
                      <span className="text-zinc-500">{f.action}</span>
                    ) : (
                      <span
                        className="font-medium"
                        style={{ color: COLOR.rose }}
                      >
                        Belum ditindaklanjuti
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex justify-end gap-1">
                      {can("update", "feedback") ? (
                        <>
                          <button
                            className="ops-button"
                            onClick={() => openEditor("feedback", f)}
                          >
                            Detail / Edit
                          </button>
                          <button
                            className="ops-button ops-danger"
                            onClick={() => askDelete("feedback", f)}
                          >
                            Hapus
                          </button>
                        </>
                      ) : can("update-action", "feedback") ? (
                        <button
                          className="ops-button"
                          onClick={() => openFeedbackAction(f)}
                        >
                          Edit tindak lanjut
                        </button>
                      ) : (
                        <button
                          className="ops-button"
                          onClick={() => openFeedbackDetails(f)}
                        >
                          Lihat detail
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-zinc-600">
                  Tidak ada feedback yang cocok filter ini.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <Pager
        page={safePage}
        pageCount={pageCount}
        total={rows.length}
        from={(safePage - 1) * pageSize + 1}
        to={Math.min(safePage * pageSize, rows.length)}
        onChange={setPage}
      />
    </div>
  );
}

function FeedbackLoop() {
  const { CLIENTS, FEEDBACK, openEditor, can } = useOps();
  const [clientFilter, setClientFilter] = useState(null);
  const [phaseFilter, setPhaseFilter] = useState(null);
  const [priorityFilter, setPriorityFilter] = useState(null);

  return (
    <section className="space-y-6">
      <PageHeader
        icon={MessageSquare}
        eyebrow="Feedback Loop"
        title="Feedback dan tindak lanjut"
        description="Kelola feedback client pada checkpoint 30%, 50%, dan 90%. Gunakan filter dan pencarian untuk fokus pada item yang masih perlu ditindaklanjuti."
        actions={
          can("create", "feedback") && (
            <button
              className="ops-button ops-primary"
              disabled={!CLIENTS.length}
              onClick={() => openEditor("feedback")}
            >
              + Tambah feedback
            </button>
          )
        }
      />
      <FeedbackBanner items={FEEDBACK} onSelectPriority={setPriorityFilter} />

      <div>
        <FeedbackFilters
          clientFilter={clientFilter}
          phaseFilter={phaseFilter}
          priorityFilter={priorityFilter}
          onClientChange={setClientFilter}
          onPhaseChange={setPhaseFilter}
          onPriorityChange={setPriorityFilter}
        />
        <FeedbackTable
          clientFilter={clientFilter}
          phaseFilter={phaseFilter}
          priorityFilter={priorityFilter}
        />
      </div>
    </section>
  );
}

/* -------------------------- tab button -------------------------- */

function TabButton({ active, onClick, icon: Icon, children }) {
  return (
    <button
      onClick={onClick}
      className={
        "flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 " +
        (active ? "text-white" : "text-zinc-400 hover:text-zinc-200")
      }
      style={active ? { backgroundColor: ACCENT } : undefined}
    >
      <Icon className="h-3.5 w-3.5" />
      {children}
    </button>
  );
}

/* ------------------------------- shared store ------------------------------- */
const derive = (compute) => compute();
const OpsContext = createContext(null);
const ROLE_IDS = Object.keys(PIC);
const TAB_META = [
  { id: "board", label: "Execution Board", icon: LayoutGrid },
  { id: "hub", label: "Operations Hub", icon: LayoutDashboard },
  { id: "kpi", label: "Client Performance KPI", icon: TrendingUp },
  { id: "team", label: "Team Performance KPI", icon: Users },
  { id: "feedback", label: "Feedback Loop", icon: MessageSquare },
  { id: "clients", label: "Clients", icon: Users },
  { id: "users", label: "Users & Roles", icon: Users },
];
const ABILITY_META = [
  { id: "clients.manage", label: "CRUD client" },
  { id: "tasks.manage", label: "CRUD dan pindah task" },
  { id: "cycles.manage", label: "CRUD Client Performance KPI" },
  { id: "feedback.manage", label: "CRUD feedback" },
  { id: "feedback.update_action", label: "Edit tindak lanjut feedback" },
  { id: "users.manage", label: "CRUD user dan assign role" },
  { id: "team_reports.submit", label: "Isi KPI tim sendiri" },
  { id: "team_kpi.manage", label: "Kelola KPI Settings" },
  { id: "role_permissions.manage", label: "Kelola permission role" },
];
const ACTION_ABILITY = {
  clients: "clients.manage",
  tasks: "tasks.manage",
  cycles: "cycles.manage",
  feedback: "feedback.manage",
  users: "users.manage",
  "team-reports": "team_reports.submit",
  "team-settings": "team_kpi.manage",
  "role-permissions": "role_permissions.manage",
};
function canWithProfile(profile, action, resource) {
  if (!profile) return false;
  if (action === "view") return profile.tabs?.includes(resource) || false;
  const ability =
    resource === "feedback" && action === "update-action"
      ? "feedback.update_action"
      : ACTION_ABILITY[resource];
  return Boolean(ability && profile.abilities?.includes(ability));
}
export function canRole(role, action, resource, profiles = []) {
  const profile = Array.isArray(profiles)
    ? profiles.find((item) => item.role === role)
    : profiles?.role === role
      ? profiles
      : null;
  return canWithProfile(profile, action, resource);
}
const accessDenied = () => {
  throw new Error("Role Anda tidak memiliki izin untuk tindakan ini.");
};
const uid = () =>
  globalThis.crypto?.randomUUID?.() ||
  `record-${Date.now()}-${Math.random().toString(36).slice(2)}`;
const clone = (data) => JSON.parse(JSON.stringify(data));
const useOps = () => useContext(OpsContext);
const KIND_LABEL = {
  clients: "client",
  tasks: "task",
  cycles: "cycle",
  feedback: "feedback",
  users: "user",
};
const FIELDS = [
  ["targetVisit", "Target visit"],
  ["realVisit", "Real visit"],
  ["bounceRate", "Bounce rate (%)"],
  ["leadRate", "Lead rate (%)"],
  ["intentRate", "Intent rate (%)"],
];

export function aggregateVariants(variants) {
  const sum = (key) =>
    variants.every((v) => v[key] == null)
      ? null
      : variants.reduce((n, v) => n + (v[key] ?? 0), 0);
  const realVisit = sum("realVisit");
  const weighted = (key) => {
    const measured = variants.filter((v) => (v.realVisit ?? 0) > 0);
    return !realVisit || measured.some((v) => v[key] == null)
      ? null
      : +(
          measured.reduce((n, v) => n + v[key] * v.realVisit, 0) / realVisit
        ).toFixed(2);
  };
  return {
    targetVisit: sum("targetVisit"),
    realVisit,
    bounceRate: weighted("bounceRate"),
    leadRate: weighted("leadRate"),
    intentRate: weighted("intentRate"),
  };
}
function requireText(value, label) {
  if (typeof value !== "string" || !value.trim())
    throw new Error(`${label} wajib diisi.`);
}
function numberCheck(
  value,
  label,
  max = Infinity,
  integer = false,
  optional = false,
) {
  if (optional && value == null) return;
  if (
    !Number.isFinite(value) ||
    value < 0 ||
    value > max ||
    (integer && !Number.isInteger(value))
  )
    throw new Error(
      `${label} harus ${integer ? "bilangan bulat" : "angka"} antara 0 dan ${max === Infinity ? "tak terbatas" : max}.`,
    );
}
function validDate(value, label) {
  const date = new Date(`${value}T12:00:00`);
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(value) ||
    !Number.isFinite(+date) ||
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}` !==
      value
  )
    throw new Error(`${label} tidak valid.`);
}
export function saveRecord(data, kind, input) {
  if (!KIND_LABEL[kind]) throw new Error("Jenis data tidak valid.");
  const record = clone(input);
  record.id ||= uid();
  for (const [key, value] of Object.entries(record))
    if (typeof value === "string") record[key] = value.trim();
  const existing = data[kind].find((x) => x.id === record.id);
  if (
    ["tasks", "cycles", "feedback"].includes(kind) &&
    !data.clients.some((c) => c.id === record.client)
  )
    throw new Error("Pilih client yang tersedia.");
  if (kind === "clients") {
    requireText(record.name, "Nama client");
    requireText(record.contract, "Kontrak");
    if (
      data.clients.some(
        (c) =>
          c.id !== record.id &&
          c.name.toLowerCase() === record.name.toLowerCase(),
      )
    )
      throw new Error("Nama client sudah digunakan.");
  }
  if (kind === "tasks") {
    requireText(record.name, "Judul task");
    validDate(record.due, "Deadline");
    if (!STATUS_BY_ID[record.status] || !PIC[record.pic])
      throw new Error("Status atau role task tidak valid.");
    if (
      !["normal", "urgent"].includes(record.priority) ||
      !["feature", "hotfix"].includes(record.type)
    )
      throw new Error("Priority atau tipe tidak valid.");
    numberCheck(record.cycle, "Cycle delivery", 999, true);
    numberCheck(record.revision, "Revisi", Infinity, true);
    record.createdAt = existing?.createdAt || record.createdAt || todayISO();
    if (record.status === "done") {
      record.completedAt =
        existing?.status === "done" && existing.completedAt
          ? existing.completedAt
          : record.completedAt || todayISO();
      record.dueAtCompletion =
        existing?.status === "done" && existing.dueAtCompletion
          ? existing.dueAtCompletion
          : record.dueAtCompletion || record.due;
    } else {
      record.completedAt = null;
      record.dueAtCompletion = null;
    }
  }
  if (kind === "cycles") {
    numberCheck(record.cycle, "Nomor cycle", 999, true);
    requireText(record.periode, "Periode");
    validDate(record.updateDate, "Tanggal update");
    if (
      data.cycles.some(
        (c) =>
          c.id !== record.id &&
          c.client === record.client &&
          c.cycle === record.cycle,
      )
    )
      throw new Error(
        "Nomor cycle sudah ada untuk client ini. Edit cycle tersebut atau gunakan nomor lain.",
      );
    if (!CYCLE_STATUSES.includes(record.status))
      throw new Error("Status cycle tidak valid.");
    if (
      !Array.isArray(record.variants) ||
      record.variants.filter((v) => v.isControl).length !== 1
    )
      throw new Error("Cycle harus memiliki tepat satu control.");
    if (record.cycle === 0 && record.variants.length !== 1)
      throw new Error("Cycle 0 harus memiliki tepat satu varian baseline.");
    if (record.cycle > 0 && record.variants.length < 2)
      throw new Error(
        "Cycle uji membutuhkan control dan minimal satu varian uji.",
      );
    const labels = new Set();
    const ids = new Set();
    record.variants.forEach((v) => {
      v.label = v.label.trim();
      requireText(v.label, "Nama varian");
      if (labels.has(v.label.toLowerCase()))
        throw new Error("Nama setiap varian harus berbeda.");
      labels.add(v.label.toLowerCase());
      v.id ||= uid();
      if (ids.has(v.id)) throw new Error("ID varian duplikat.");
      ids.add(v.id);
      FIELDS.forEach(([key, label]) =>
        numberCheck(
          v[key],
          label,
          key.includes("Rate") ? 100 : Infinity,
          !key.includes("Rate"),
          true,
        ),
      );
      if (record.cycle === 0 && FIELDS.some(([key]) => v[key] == null))
        throw new Error(
          "Cycle 0 adalah baseline awal kontrak dan semua datanya wajib diisi.",
        );
    });
    Object.assign(record, aggregateVariants(record.variants));
    if (record.cycle === 0) record.status = "Baseline";
    // Discard display-only fields copied from expanded table rows.
    delete record.clientName;
    delete record.clientId;
    delete record.prevLeadRate;
  }
  if (kind === "feedback") {
    requireText(record.topic, "Topik");
    requireText(record.details, "Feedback");
    validDate(record.date, "Tanggal");
    if (
      !PHASE_META[record.phase] ||
      !PRIORITY_META[record.priority] ||
      !ROLE_IDS.some((r) => PIC[r].name === record.from)
    )
      throw new Error("Checkpoint, priority, atau role tidak valid.");
    delete record.clientName;
  }
  if (kind === "users") {
    requireText(record.name, "Nama user");
    record.email = record.email.toLowerCase();
    if (!/^[a-z0-9][a-z0-9._%+\-]*@gmail\.com$/.test(record.email))
      throw new Error("Gunakan alamat login @gmail.com yang valid.");
    if (!PIC[record.role]) throw new Error("Role tidak valid.");
    if (
      data.users.some(
        (u) => u.id !== record.id && u.email.toLowerCase() === record.email,
      )
    )
      throw new Error("Email sudah digunakan.");
    if (
      existing?.role === "coo" &&
      existing.active &&
      (!record.active || record.role !== "coo") &&
      !data.users.some(
        (u) => u.id !== record.id && u.active && u.role === "coo",
      )
    )
      throw new Error("Harus ada minimal satu COO aktif.");
  }
  return {
    ...data,
    [kind]: existing
      ? data[kind].map((x) => (x.id === record.id ? record : x))
      : [...data[kind], record],
  };
}
export function deleteRecord(data, kind, id) {
  if (!KIND_LABEL[kind]) throw new Error("Jenis data tidak valid.");
  const record = data[kind].find((x) => x.id === id);
  if (!record) throw new Error("Data sudah tidak tersedia.");
  if (
    kind === "users" &&
    record.active &&
    record.role === "coo" &&
    !data.users.some((u) => u.id !== id && u.active && u.role === "coo")
  )
    throw new Error("COO aktif terakhir tidak dapat dihapus.");
  const next = { ...data, [kind]: data[kind].filter((x) => x.id !== id) };
  if (kind === "clients")
    for (const relation of ["tasks", "cycles", "feedback"])
      next[relation] = data[relation].filter((x) => x.client !== id);
  return next;
}
export function moveTaskRecord(data, id, status) {
  const task = data.tasks.find((t) => t.id === id);
  if (!task) throw new Error("Task tidak tersedia.");
  return saveRecord(data, "tasks", { ...task, status });
}
export function deliveryClients(data) {
  return data.clients.map((client) => {
    const tasks = data.tasks.filter((t) => t.client === client.id),
      open = tasks.filter((t) => t.status !== "done");
    const blocked = open.find((t) => t.blocked),
      overdue = open.find(isOverdue),
      review = open.find((t) => t.status === "review");
    const focus = blocked || overdue || review || open[0];
    return {
      ...client,
      health: blocked ? "blocked" : overdue ? "delayed" : "on-track",
      phase: focus
        ? STATUS_BY_ID[focus.status].label
        : tasks.length
          ? "Live & Done"
          : "Belum ada task",
      cycle: Math.max(
        0,
        ...tasks.map((t) => t.cycle),
        ...data.cycles
          .filter((c) => c.client === client.id)
          .map((c) => c.cycle),
      ),
      revision: Math.max(0, ...tasks.map((t) => t.revision)),
      notes: client.bottleneck || "",
      bottleneck: focus && (blocked || overdue || review) ? focus.name : "—",
    };
  });
}
function firstError(errors) {
  const value = Object.values(errors || {})[0];
  return Array.isArray(value) ? value[0] : value || "Perubahan gagal disimpan.";
}

function inertiaMutation(url, method, payload = {}) {
  return new Promise((resolve, reject) => {
    router.visit(url, {
      method,
      data: payload,
      preserveScroll: true,
      preserveState: true,
      onSuccess: () => resolve(),
      onError: (errors) => reject(new Error(firstError(errors))),
    });
  });
}

function OpsProvider({
  children,
  authUser,
  serverUsers = [],
  serverOperations = {},
  serverTeam,
  serverPermissions = { current: null, roles: [] },
  flash = {},
}) {
  const incomingData = () => ({
    version: 9,
    clients: serverOperations.clients || [],
    tasks: serverOperations.tasks || [],
    cycles: serverOperations.cycles || [],
    feedback: serverOperations.feedback || [],
    users: serverUsers,
    team:
      serverTeam ||
      createTeamSeed(serverUsers, serverOperations.clients || []),
  });
  const [data, setData] = useState(incomingData);
  const dataRef = useRef(data);
  const [editor, setEditor] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [notice, setNotice] = useState(flash.success || "");
  const currentUser = authUser ? { ...authUser, active: true } : null;
  const can = (action, resource) =>
    currentUser
      ? canRole(currentUser.role, action, resource, serverPermissions.current)
      : false;

  useEffect(() => {
    const next = incomingData();
    dataRef.current = next;
    setData(next);
  }, [serverOperations, serverUsers, serverTeam]);

  useEffect(() => {
    setNotice(flash.success || "");
  }, [flash.success]);

  function login(email, password, callbacks = {}) {
    router.post(
      "/login",
      { email, password },
      {
        preserveScroll: true,
        ...callbacks,
      },
    );
  }

  function logout() {
    setEditor(null);
    setConfirm(null);
    router.post("/logout");
  }

  function openEditor(kind, record = null, preset = {}) {
    const action = record ? "update" : "create";
    if (!can(action, kind)) accessDenied();
    setEditor({ kind, record, preset });
  }

  function openFeedbackAction(record) {
    if (!can("update-action", "feedback")) accessDenied();
    setEditor({ kind: "feedback-action", record, preset: {} });
  }

  function openFeedbackDetails(record) {
    if (!can("view", "feedback")) accessDenied();
    setEditor({ kind: "feedback-read", record, preset: {} });
  }

  async function save(kind, record) {
    const existing = dataRef.current[kind]?.some(
      (item) => String(item.id) === String(record.id),
    );
    const action = existing ? "update" : "create";
    if (!can(action, kind)) accessDenied();

    const next = saveRecord(dataRef.current, kind, record);
    const validated = existing
      ? next[kind].find((item) => String(item.id) === String(record.id))
      : next[kind].at(-1);
    const url = existing ? `/${kind}/${record.id}` : `/${kind}`;
    const method = existing ? "put" : "post";
    const payload =
      kind === "users"
        ? {
            name: record.name,
            email: validated.email,
            password: record.password || "",
            role: validated.role,
            active: validated.active,
          }
        : validated;

    await inertiaMutation(url, method, payload);
    setNotice(`${KIND_LABEL[kind]} berhasil disimpan.`);
    setEditor(null);
  }

  async function saveFeedbackAction(id, action) {
    if (!can("update-action", "feedback")) accessDenied();
    if (!dataRef.current.feedback.some((item) => item.id === id))
      throw new Error("Feedback tidak tersedia.");
    await inertiaMutation(`/feedback/${id}/action`, "patch", { action });
    setNotice("Tindak lanjut feedback berhasil diperbarui.");
    setEditor(null);
  }

  async function remove(kind, id) {
    if (!can("delete", kind)) accessDenied();
    await inertiaMutation(`/${kind}/${id}`, "delete");
    setNotice(`${KIND_LABEL[kind]} berhasil dihapus.`);
    setConfirm(null);
  }

  async function moveTask(id, status) {
    if (!can("update", "tasks")) accessDenied();
    const task = dataRef.current.tasks.find(
      (item) => String(item.id) === String(id),
    );
    if (!task) throw new Error("Task tidak tersedia.");
    await inertiaMutation(`/tasks/${id}/status`, "patch", { status });
    setNotice(
      "Status task diperbarui; Operations Hub dan kalender ikut berubah.",
    );
  }

  async function teamDispatch(command) {
    if (command.type === "save") {
      if (!can("submit", "team-reports")) accessDenied();
      await inertiaMutation("/team-reports", "post", command.report);
      setNotice("Team Performance KPI diperbarui.");
      return;
    }
    if (command.type === "save-definition") {
      if (!can("manage", "team-settings")) accessDenied();
      const definition = command.definition;
      const exists = dataRef.current.team.definitions.some(
        (item) => item.id === definition.id,
      );
      await inertiaMutation(
        exists
          ? `/team-kpi-definitions/${definition.id}`
          : "/team-kpi-definitions",
        exists ? "put" : "post",
        definition,
      );
      setNotice("Pengaturan KPI diperbarui.");
      return;
    }
    if (command.type === "delete-definition") {
      if (!can("manage", "team-settings")) accessDenied();
      await inertiaMutation(
        `/team-kpi-definitions/${command.definitionId}`,
        "delete",
      );
      setNotice("KPI berhasil dihapus. Riwayat lama tetap utuh.");
      return;
    }
    throw new Error("Tindakan Team Performance tidak tersedia.");
  }

  async function saveRolePermissions(profile) {
    if (!can("manage", "role-permissions")) accessDenied();
    await inertiaMutation(`/role-permissions/${profile.role}`, "put", {
      tabs: profile.tabs,
      abilities: profile.abilities,
      reportRoles: profile.reportRoles,
    });
    setNotice(`Permission ${PIC[profile.role].name} berhasil diperbarui.`);
  }

  useEffect(() => {
    const context =
      typeof document === "undefined" ? undefined : document.modelContext;
    if (!context?.registerTool || !currentUser) return;
    const lifecycle = new AbortController();
    const register = (tool) => {
      try {
        void Promise.resolve(
          context.registerTool(tool, { signal: lifecycle.signal }),
        ).catch(() => {});
      } catch {}
    };
    register({
      name: "read_current_role_permissions",
      title: "Read current role permissions",
      description:
        "Read the signed-in PBM Ops role, visible tabs, and allowed data changes.",
      inputSchema: { type: "object", properties: {}, additionalProperties: false },
      annotations: { readOnlyHint: true, untrustedContentHint: false },
      execute() {
        return {
          role: PIC[currentUser.role].name,
          visibleTabs: TAB_META.filter((tab) =>
            can("view", tab.id),
          ).map((tab) => tab.label),
          abilities: serverPermissions.current?.abilities || [],
          readableReportRoles: serverPermissions.current?.reportRoles || [],
        };
      },
    });
    return () => lifecycle.abort();
  }, [currentUser?.id, currentUser?.role, serverPermissions.current]);

  const clients = deliveryClients(data);
  const value = {
    teamDispatch,
    data,
    CLIENTS: clients,
    TASKS: data.tasks,
    CYCLES: data.cycles,
    FEEDBACK: data.feedback,
    CLIENT_COLOR: Object.fromEntries(
      clients.map((client, index) => [
        client.id,
        CLIENT_COLOR[client.id] ||
          Object.values(COLOR)[index % Object.values(COLOR).length],
      ]),
    ),
    getClient: (id) =>
      getClient(id, clients) || { name: "Client tidak tersedia" },
    cyclesFor: (id) => cyclesFor(id, data.cycles),
    computeFlag: (id) => computeFlag(id, data.cycles),
    currentUser,
    permissionProfile: serverPermissions.current,
    rolePermissions: serverPermissions.roles || [],
    can,
    login,
    logout,
    storageError: "",
    notice,
    editor,
    setEditor,
    confirm,
    setConfirm,
    openEditor,
    openFeedbackAction,
    openFeedbackDetails,
    askDelete: (kind, record) => {
      if (!can("delete", kind)) accessDenied();
      setConfirm({ kind, record });
    },
    save,
    saveFeedbackAction,
    remove,
    moveTask,
    saveRolePermissions,
  };
  return <OpsContext.Provider value={value}>{children}</OpsContext.Provider>;
}

function Modal({ title, onClose, children }) {
  const ref = useRef(null);
  useEffect(() => {
    const d = ref.current;
    const previous = document.activeElement;
    d.showModal();
    return () => {
      d.close();
      previous?.focus?.();
    };
  }, []);
  return (
    <dialog
      className="ops-dialog"
      ref={ref}
      aria-labelledby="ops-dialog-title"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          const r = e.currentTarget.getBoundingClientRect();
          if (
            e.clientX < r.left ||
            e.clientX > r.right ||
            e.clientY < r.top ||
            e.clientY > r.bottom
          )
            onClose();
        }
      }}
    >
      <header className="mb-6 flex items-center justify-between gap-4">
        <h2 id="ops-dialog-title" className="text-xl font-semibold">
          {title}
        </h2>
        <button
          type="button"
          className="ops-button"
          aria-label="Tutup dialog"
          onClick={onClose}
        >
          <X size={18} />
        </button>
      </header>
      {children}
    </dialog>
  );
}
function InputField({
  label,
  value,
  onChange,
  type = "text",
  required = false,
  options,
  min,
  max,
  step,
}) {
  return (
    <label>
      {label}
      {options ? (
        <select
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          required={required}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      ) : type === "textarea" ? (
        <textarea
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          required={required}
        />
      ) : (
        <input
          type={type}
          value={value ?? ""}
          onChange={(e) =>
            onChange(
              type === "number"
                ? e.target.value === ""
                  ? null
                  : Number(e.target.value)
                : e.target.value,
            )
          }
          required={required}
          min={min}
          max={max}
          step={step}
        />
      )}
    </label>
  );
}
const optionsFrom = (map) =>
  Object.entries(map).map(([value, item]) => ({
    value,
    label: item.name || item.label,
  }));
function defaultRecord(kind, data, preset = {}) {
  const client = preset.client || data.clients[0]?.id || "";
  const variant = (control) => ({
    id: uid(),
    label: control ? "Control" : "Varian A",
    isControl: control,
    targetVisit: null,
    realVisit: null,
    bounceRate: null,
    leadRate: null,
    intentRate: null,
  });
  const defaults = {
    clients: { name: "", contract: "Project-Based", bottleneck: "" },
    tasks: {
      name: "",
      client,
      status: "intake",
      pic: "project-manager",
      due: todayISO(),
      cycle: 0,
      revision: 0,
      priority: "normal",
      type: "feature",
      brief: "",
      blocked: false,
      createdAt: todayISO(),
      completedAt: null,
      dueAtCompletion: null,
    },
    cycles: {
      client,
      cycle:
        Math.max(
          0,
          ...data.cycles.filter((c) => c.client === client).map((c) => c.cycle),
        ) + 1,
      periode: "",
      updateDate: todayISO(),
      status: "Baseline",
      layer: "",
      bottleneck: "",
      primaryMetric: "Lead Rate",
      hypothesis: "",
      optimization: "",
      variants: [variant(true), variant(false)],
    },
    feedback: {
      client,
      date: todayISO(),
      phase: 30,
      from: "Project Manager",
      fromType: "pm",
      topic: "",
      details: "",
      priority: 2,
      action: "",
    },
    users: {
      name: "",
      email: "",
      password: "",
      role: "developer",
      active: true,
    },
  };
  return { ...defaults[kind], ...preset };
}
function FeedbackActionEditor({ record, onClose }) {
  const { saveFeedbackAction, getClient } = useOps();
  const [action, setAction] = useState(record.action || "");
  const [error, setError] = useState("");
  return (
    <Modal title="Perbarui tindak lanjut" onClose={onClose}>
      <div className="mb-5 rounded-xl border border-zinc-800 bg-zinc-900 p-4">
        <p className="text-xs uppercase tracking-wide text-zinc-500">
          {getClient(record.client).name} · {PHASE_META[record.phase].label}
        </p>
        <p className="mt-2 font-medium text-zinc-100">{record.topic}</p>
        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-zinc-400">
          {record.details}
        </p>
      </div>
      <form
        onSubmit={async (event) => {
          event.preventDefault();
          try {
            await saveFeedbackAction(record.id, action);
          } catch (e) {
            setError(e.message);
          }
        }}
      >
        <InputField
          label="Action / tindak lanjut"
          type="textarea"
          value={action}
          onChange={setAction}
        />
        <p className="mt-2 text-xs text-zinc-500">
          Field feedback lainnya hanya dapat diubah oleh COO atau Project
          Manager.
        </p>
        {error && (
          <p role="alert" className="mt-4 text-sm text-rose-300">
            {error}
          </p>
        )}
        <footer className="mt-6 flex justify-end gap-2 border-t border-zinc-800 pt-5">
          <button type="button" className="ops-button" onClick={onClose}>
            Batal
          </button>
          <button type="submit" className="ops-button ops-primary">
            Simpan tindak lanjut
          </button>
        </footer>
      </form>
    </Modal>
  );
}
function FeedbackReadModal({ record, onClose }) {
  const { getClient } = useOps();
  return (
    <Modal title={record.topic} onClose={onClose}>
      <div className="grid gap-4 sm:grid-cols-2">
        <DetailField label="Client" value={getClient(record.client).name} />
        <DetailField
          label="Checkpoint"
          value={PHASE_META[record.phase].label}
        />
        <DetailField label="Dari" value={record.from} />
        <DetailField
          label="Priority"
          value={PRIORITY_META[record.priority].label}
        />
      </div>
      <div className="mt-5 rounded-xl border border-zinc-800 bg-zinc-900 p-4">
        <p className="text-xs uppercase tracking-wide text-zinc-500">
          Feedback
        </p>
        <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-zinc-200">
          {record.details}
        </p>
      </div>
      <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-900 p-4">
        <p className="text-xs uppercase tracking-wide text-zinc-500">
          Tindak lanjut
        </p>
        <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-zinc-200">
          {record.action || "Belum ditindaklanjuti"}
        </p>
      </div>
    </Modal>
  );
}
function RecordEditor({ kind, record, preset, onClose }) {
  const { data, save } = useOps();
  const [draft, setDraft] = useState(() =>
      clone(record || defaultRecord(kind, data, preset)),
    ),
    [error, setError] = useState("");
  const set = (key, value) => setDraft((d) => ({ ...d, [key]: value }));
  const field = (key, label, type = "text", extra = {}) => (
    <InputField
      key={key}
      label={label}
      value={draft[key]}
      onChange={(v) => set(key, v)}
      type={type}
      {...extra}
    />
  );
  const clientField = () =>
    field("client", "Client", "text", {
      required: true,
      options: data.clients.map((c) => ({ value: c.id, label: c.name })),
    });
  async function submit(e) {
    e.preventDefault();
    try {
      await save(kind, draft);
    } catch (e) {
      setError(e.message);
    }
  }
  return (
    <Modal
      title={`${record ? "Edit" : "Tambah"} ${KIND_LABEL[kind]}`}
      onClose={onClose}
    >
      <form onSubmit={submit}>
        <div className="grid gap-4 sm:grid-cols-2">
          {kind === "clients" && (
            <>
              {field("name", "Nama client", "text", { required: true })}
              {field("contract", "Kontrak", "text", { required: true })}
              <div className="sm:col-span-2">
                {field("bottleneck", "Catatan operasional", "textarea")}
              </div>
              <p className="text-sm text-zinc-400 sm:col-span-2">
                Health, tahap, revisi, dan progress dihitung otomatis dari
                Execution Board.
              </p>
            </>
          )}
          {kind === "users" && (
            <>
              {field("name", "Nama user", "text", { required: true })}
              {field("email", "Email login (@gmail.com)", "email", {
                required: true,
              })}
              {field(
                "password",
                record
                  ? "Password baru (kosongkan jika tidak berubah)"
                  : "Password awal",
                "password",
                { required: !record },
              )}
              {field("role", "Role", "text", { options: optionsFrom(PIC) })}
              <label className="ops-inline-label">
                <input
                  type="checkbox"
                  checked={draft.active}
                  onChange={(e) => set("active", e.target.checked)}
                />
                User aktif
              </label>
              <p className="text-sm text-zinc-400 sm:col-span-2">
                Nama akun boleh berada di alamat Gmail. Semua halaman
                operasional menampilkan role. Permission langsung mengikuti role
                yang dipilih.
              </p>
            </>
          )}
          {kind === "tasks" && (
            <>
              {field("name", "Judul task", "text", { required: true })}
              {clientField()}
              {field("status", "Status", "text", {
                options: STATUSES.map((s) => ({ value: s.id, label: s.label })),
              })}
              {field("pic", "Penanggung jawab (role)", "text", {
                options: optionsFrom(PIC),
              })}
              {field("due", "Deadline", "date", { required: true })}
              {field("cycle", "Cycle delivery", "number", {
                required: true,
                min: 0,
                max: 999,
                step: 1,
              })}
              {field("revision", "Jumlah revisi", "number", {
                required: true,
                min: 0,
                step: 1,
              })}
              {field("priority", "Priority", "text", {
                options: [
                  { value: "normal", label: "Normal" },
                  { value: "urgent", label: "Urgent" },
                ],
              })}
              {field("type", "Tipe task", "text", {
                options: [
                  { value: "feature", label: "Feature" },
                  { value: "hotfix", label: "Hotfix" },
                ],
              })}
              <label className="ops-inline-label">
                <input
                  type="checkbox"
                  checked={!!draft.blocked}
                  onChange={(e) => set("blocked", e.target.checked)}
                />
                Task terhambat (Blocked)
              </label>
              <div className="sm:col-span-2">
                {field("brief", "Brief / detail task", "textarea")}
              </div>
            </>
          )}
          {kind === "feedback" && (
            <>
              {clientField()}
              {field("date", "Tanggal", "date", { required: true })}
              <InputField
                label="Checkpoint"
                value={draft.phase}
                onChange={(v) => set("phase", Number(v))}
                options={optionsFrom(PHASE_META)}
              />
              {field("from", "Dari role", "text", {
                options: ROLE_IDS.map((r) => ({
                  value: PIC[r].name,
                  label: PIC[r].name,
                })),
              })}
              {field("fromType", "Sumber feedback", "text", {
                options: [
                  { value: "pm", label: "Internal / PM" },
                  { value: "owner", label: "COO" },
                  { value: "client", label: "Client (dicatat oleh role)" },
                ],
              })}
              <InputField
                label="Priority"
                value={draft.priority}
                onChange={(v) => set("priority", Number(v))}
                options={optionsFrom(PRIORITY_META)}
              />
              {field("topic", "Topik", "text", { required: true })}
              <div className="sm:col-span-2">
                {field("details", "Detail feedback", "textarea", {
                  required: true,
                })}
              </div>
              <div className="sm:col-span-2">
                {field(
                  "action",
                  "Tindak lanjut (kosong = belum ditindaklanjuti)",
                  "textarea",
                )}
              </div>
            </>
          )}
          {kind === "cycles" && (
            <>
              {clientField()}
              {field("cycle", "Nomor cycle (0 = baseline awal)", "number", {
                required: true,
                min: 0,
                max: 999,
                step: 1,
              })}
              {field("periode", "Periode, contoh: 1–30 Sep 2026", "text", {
                required: true,
              })}
              {field("updateDate", "Tanggal update", "date", {
                required: true,
              })}
              {field("status", "Status improvement", "text", {
                options: CYCLE_STATUSES.map((s) => ({ value: s, label: s })),
              })}
              {field("primaryMetric", "Metrik primer", "text", {
                options: [
                  "Lead Rate",
                  "Bounce Rate",
                  "Intent Rate",
                  "Real Visit",
                ].map((s) => ({ value: s, label: s })),
              })}
              {field("layer", "Layer aktif")}
              {field("bottleneck", "Bottleneck")}
              {field("hypothesis", "Hipotesis", "textarea")}
              {field("optimization", "Optimasi dilakukan", "textarea")}
            </>
          )}
        </div>
        {kind === "cycles" && (
          <div className="mt-6 space-y-4">
            <div className="flex flex-wrap justify-between gap-2">
              <h3 className="font-semibold">Control & varian uji</h3>
              <button
                type="button"
                className="ops-button"
                disabled={draft.cycle === 0}
                onClick={() =>
                  set("variants", [
                    ...draft.variants,
                    {
                      id: uid(),
                      label: `Varian ${draft.variants.length}`,
                      isControl: false,
                      targetVisit: null,
                      realVisit: null,
                      bounceRate: null,
                      leadRate: null,
                      intentRate: null,
                    },
                  ])
                }
              >
                + Tambah varian uji
              </button>
            </div>
            <p className="text-sm text-zinc-400">
              Tepat satu control. Kosong berarti belum ada data; 0 berarti hasil
              nol. Total visit dijumlahkan, rate dibobot berdasarkan real visit.
            </p>
            {draft.variants.map((v, index) => (
              <fieldset
                key={v.id}
                className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4"
              >
                <legend className="px-2 text-sm text-zinc-300">
                  {v.isControl ? "Control" : `Varian uji ${index}`}
                </legend>
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                  <label className="ops-inline-label">
                    <input
                      type="radio"
                      name="control"
                      checked={v.isControl}
                      onChange={() =>
                        set(
                          "variants",
                          draft.variants.map((x) => ({
                            ...x,
                            isControl: x.id === v.id,
                          })),
                        )
                      }
                    />
                    Jadikan control
                  </label>
                  <button
                    type="button"
                    className="ops-button ops-danger"
                    disabled={v.isControl}
                    onClick={() =>
                      set(
                        "variants",
                        draft.variants.filter((x) => x.id !== v.id),
                      )
                    }
                  >
                    Hapus varian
                  </button>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <InputField
                    label="Nama varian"
                    value={v.label}
                    required
                    onChange={(label) =>
                      set(
                        "variants",
                        draft.variants.map((x) =>
                          x.id === v.id ? { ...x, label } : x,
                        ),
                      )
                    }
                  />
                  {FIELDS.map(([key, label]) => (
                    <InputField
                      key={key}
                      label={label}
                      type="number"
                      min={0}
                      max={key.includes("Rate") ? 100 : undefined}
                      step={key.includes("Rate") ? "any" : 1}
                      value={v[key]}
                      onChange={(value) =>
                        set(
                          "variants",
                          draft.variants.map((x) =>
                            x.id === v.id ? { ...x, [key]: value } : x,
                          ),
                        )
                      }
                    />
                  ))}
                </div>
              </fieldset>
            ))}
            {draft.cycle === 0 && (
              <p className="text-sm text-amber-300">
                Cycle 0 adalah baseline awal kontrak: sisakan satu varian
                pertama dan isi seluruh data kunjungan serta rate-nya.
              </p>
            )}
            <div className="rounded-xl border border-zinc-800 p-4 text-sm text-zinc-300">
              Ringkasan cycle:{" "}
              {Object.entries(aggregateVariants(draft.variants)).map(
                ([key, value]) => (
                  <span key={key} className="mr-4 inline-block">
                    {FIELDS.find((f) => f[0] === key)[1]}:{" "}
                    <strong>{value ?? "—"}</strong>
                  </span>
                ),
              )}
            </div>
          </div>
        )}
        {error && (
          <p
            role="alert"
            className="mt-5 rounded-lg border border-rose-800 p-3 text-sm text-rose-300"
          >
            {error}
          </p>
        )}
        <footer className="mt-6 flex justify-end gap-2 border-t border-zinc-800 pt-5">
          <button type="button" className="ops-button" onClick={onClose}>
            Batal
          </button>
          <button type="submit" className="ops-button ops-primary">
            Simpan {KIND_LABEL[kind]}
          </button>
        </footer>
      </form>
    </Modal>
  );
}
function DeleteDialog({ kind, record, onClose }) {
  const { data, remove } = useOps(),
    [error, setError] = useState("");
  return (
    <Modal title={`Hapus ${KIND_LABEL[kind]}?`} onClose={onClose}>
      <p className="text-zinc-300">
        {record.name ||
          record.email ||
          record.topic ||
          `${getClient(record.client, data.clients)?.name} · Cycle ${record.cycle}`}
      </p>
      {kind === "clients" ? (
        <p className="mt-3 text-sm leading-7 text-rose-300">
          Client ini memiliki{" "}
          {data.tasks.filter((t) => t.client === record.id).length} task,{" "}
          {data.cycles.filter((t) => t.client === record.id).length} cycle, dan{" "}
          {data.feedback.filter((t) => t.client === record.id).length} feedback.
          Semua data terkait tersebut ikut dihapus.
        </p>
      ) : (
        <p className="mt-3 text-sm text-zinc-400">
          Data ini akan dihapus dari database.
          {kind === "cycles"
            ? " Task delivery tetap ada; metrik dan varian cycle ini akan hilang dari KPI serta Cycle Log."
            : ""}
          {kind === "users" ? " Task tetap ditugaskan ke role yang sama." : ""}
        </p>
      )}
      {error && (
        <p role="alert" className="mt-4 text-rose-300">
          {error}
        </p>
      )}
      <div className="mt-6 flex justify-end gap-2">
        <button className="ops-button" onClick={onClose}>
          Batal
        </button>
        <button
          className="ops-button ops-danger"
          onClick={async () => {
            try {
              await remove(kind, record.id);
            } catch (e) {
              setError(e.message);
            }
          }}
        >
          Ya, hapus {KIND_LABEL[kind]}
        </button>
      </div>
    </Modal>
  );
}
function EditorHost() {
  const { editor, setEditor, confirm, setConfirm } = useOps();
  return (
    <>
      {editor?.kind === "feedback-action" && (
        <FeedbackActionEditor
          key={`feedback-action-${editor.record.id}`}
          record={editor.record}
          onClose={() => setEditor(null)}
        />
      )}
      {editor?.kind === "feedback-read" && (
        <FeedbackReadModal
          key={`feedback-read-${editor.record.id}`}
          record={editor.record}
          onClose={() => setEditor(null)}
        />
      )}
      {editor &&
        !["feedback-action", "feedback-read"].includes(editor.kind) && (
          <RecordEditor
            key={`${editor.kind}-${editor.record?.id || "new"}`}
            {...editor}
            onClose={() => setEditor(null)}
          />
        )}
      {confirm && (
        <DeleteDialog {...confirm} onClose={() => setConfirm(null)} />
      )}
    </>
  );
}
function ClientManager() {
  const { CLIENTS, data, openEditor, askDelete } = useOps();
  return (
    <section>
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wider text-violet-400">
            Client directory
          </p>
          <h1 className="mt-1 text-2xl font-semibold">Clients</h1>
          <p className="mt-2 text-sm text-zinc-400">
            Kelola client dan kontrak. Progress mengikuti task yang sedang
            dikerjakan.
          </p>
        </div>
        <button
          className="ops-button ops-primary"
          onClick={() => openEditor("clients")}
        >
          + Tambah client
        </button>
      </header>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {CLIENTS.map((c) => (
          <article
            key={c.id}
            className="rounded-xl border border-zinc-800 bg-zinc-900 p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-lg font-semibold">{c.name}</h2>
              <HealthBadge health={c.health} />
            </div>
            <p className="mt-2 text-sm text-zinc-400">{c.contract}</p>
            <p className="my-4 text-sm text-zinc-300">{c.phase}</p>
            <ClientProgressBar clientId={c.id} />
            <div className="my-4 flex flex-wrap gap-3 text-sm text-zinc-400">
              <span>
                {data.tasks.filter((t) => t.client === c.id).length} task
              </span>
              <span>
                {data.cycles.filter((t) => t.client === c.id).length} cycle
              </span>
              <span>
                {data.feedback.filter((t) => t.client === c.id).length} feedback
              </span>
            </div>
            <p className="mb-4 text-sm text-zinc-400">{c.bottleneck}</p>
            <div className="flex gap-2">
              <button
                className="ops-button"
                onClick={() =>
                  openEditor(
                    "clients",
                    data.clients.find((x) => x.id === c.id),
                  )
                }
              >
                Edit client
              </button>
              <button
                className="ops-button ops-danger"
                onClick={() => askDelete("clients", c)}
              >
                Hapus
              </button>
            </div>
          </article>
        ))}
      </div>
      {!CLIENTS.length && (
        <p className="ops-empty">
          Belum ada client. Tambahkan client pertama untuk mulai membuat task,
          cycle, dan feedback.
        </p>
      )}
    </section>
  );
}
function RolePermissionEditor({ profile, onClose, onSave }) {
  const [draft, setDraft] = useState(() => clone(profile));
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const toggle = (key, id) =>
    setDraft((current) => ({
      ...current,
      [key]: current[key].includes(id)
        ? current[key].filter((item) => item !== id)
        : [...current[key], id],
    }));

  async function submit() {
    if (!draft.tabs.length) {
      setError("Pilih minimal satu tab yang dapat dibuka.");
      return;
    }
    setSaving(true);
    try {
      await onSave(draft);
      onClose();
    } catch (caught) {
      setError(caught.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      title={`Permission ${PIC[draft.role].name}`}
      onClose={saving ? () => {} : onClose}
    >
      <p className="mb-5 text-sm leading-6 text-zinc-400">
        Atur tab, tindakan, dan cakupan rekap Team Performance untuk seluruh user
        dengan role ini.
      </p>
      {error && (
        <p className="mb-4 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-200">
          {error}
        </p>
      )}
      <div className="space-y-6">
        <fieldset>
          <legend className="mb-3 text-sm font-semibold text-zinc-100">
            Tab yang dapat dibuka
          </legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {TAB_META.map((tab) => (
              <label
                key={tab.id}
                className="ops-inline-label rounded-lg border border-zinc-800 bg-zinc-900 p-3 text-sm"
              >
                <input
                  type="checkbox"
                  checked={draft.tabs.includes(tab.id)}
                  onChange={() => toggle("tabs", tab.id)}
                />
                {tab.label}
              </label>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend className="mb-3 text-sm font-semibold text-zinc-100">
            Otoritas
          </legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {ABILITY_META.map((ability) => (
              <label
                key={ability.id}
                className="ops-inline-label rounded-lg border border-zinc-800 bg-zinc-900 p-3 text-sm"
              >
                <input
                  type="checkbox"
                  checked={draft.abilities.includes(ability.id)}
                  onChange={() => toggle("abilities", ability.id)}
                />
                {ability.label}
              </label>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend className="mb-1 text-sm font-semibold text-zinc-100">
            Rekap KPI tim yang dapat dilihat
          </legend>
          <p className="mb-3 text-xs text-zinc-500">
            Laporan milik sendiri selalu dapat dilihat.
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {ROLE_IDS.map((role) => (
              <label
                key={role}
                className="ops-inline-label rounded-lg border border-zinc-800 bg-zinc-900 p-3 text-sm"
              >
                <input
                  type="checkbox"
                  checked={draft.reportRoles.includes(role)}
                  disabled={role === draft.role}
                  onChange={() => toggle("reportRoles", role)}
                />
                {PIC[role].name}
              </label>
            ))}
          </div>
        </fieldset>
      </div>
      <div className="mt-6 flex justify-end gap-2">
        <button className="ops-button" disabled={saving} onClick={onClose}>
          Batal
        </button>
        <button
          className="ops-button ops-primary"
          disabled={saving}
          onClick={submit}
        >
          {saving ? "Menyimpan..." : "Simpan permission"}
        </button>
      </div>
    </Modal>
  );
}

function UserManager() {
  const {
    data,
    currentUser,
    can,
    rolePermissions,
    saveRolePermissions,
    openEditor,
    askDelete,
  } = useOps();
  const [editingPermission, setEditingPermission] = useState(null);
  const canManageUsers = can("update", "users");
  const canManagePermissions = can("manage", "role-permissions");
  return (
    <section>
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wider text-violet-400">
            Team access
          </p>
          <h1 className="mt-1 text-2xl font-semibold">Users & Roles</h1>
          <p className="mt-2 text-sm text-zinc-400">
            Kelola akun Gmail dan role. Penugasan task mengikuti role, bukan
            nama pribadi.
          </p>
        </div>
        {canManageUsers && (
          <button
            className="ops-button ops-primary"
            onClick={() => openEditor("users")}
          >
            + Tambah user
          </button>
        )}
      </header>
      <div className="overflow-x-auto rounded-xl border border-zinc-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-900 text-zinc-400">
            <tr>
              <th className="p-4">Email login</th>
              <th className="p-4">Role</th>
              <th className="p-4">Status</th>
              <th className="p-4">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {data.users.map((u) => (
              <tr key={u.id} className="border-t border-zinc-800">
                <td className="p-4">
                  {u.email}
                  {u.id === currentUser.id && (
                    <span className="ml-2 text-xs text-violet-400">
                      Sesi aktif
                    </span>
                  )}
                </td>
                <td className="p-4">
                  <span className="flex items-center gap-2">
                    <PicChip id={u.role} />
                    {PIC[u.role].name}
                  </span>
                </td>
                <td className="p-4">{u.active ? "Aktif" : "Nonaktif"}</td>
                <td className="p-4">
                  {canManageUsers ? (
                    <div className="flex gap-2">
                      <button
                        className="ops-button"
                        onClick={() => openEditor("users", u)}
                      >
                        Edit role / akun
                      </button>
                      <button
                        className="ops-button ops-danger"
                        onClick={() => askDelete("users", u)}
                      >
                        Hapus
                      </button>
                    </div>
                  ) : (
                    <span className="text-zinc-500">Lihat saja</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-sm text-zinc-400">
        Minimal satu COO aktif. Setiap akun memakai email dan password Laravel;
        akses halaman dan tindakan mengikuti role yang dipilih.
      </p>
      {canManagePermissions && (
        <div className="mt-8 mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">Permission per role</h2>
            <p className="mt-1 text-sm text-zinc-400">
              Perubahan langsung berlaku untuk seluruh user dengan role terkait.
            </p>
          </div>
        </div>
      )}
      {canManagePermissions && (
        <div className="overflow-x-auto rounded-xl border border-zinc-800">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-zinc-900 text-zinc-400">
            <tr>
              <th className="p-4">Role</th>
              <th className="p-4">Tab</th>
              <th className="p-4">Hak perubahan</th>
              <th className="p-4">Cakupan rekap KPI</th>
              <th className="p-4">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {rolePermissions.map((profile) => (
              <tr key={profile.role} className="border-t border-zinc-800">
                <td className="p-4 font-medium text-zinc-100">
                  {PIC[profile.role].name}
                </td>
                <td className="p-4 text-zinc-400">
                  {TAB_META.filter((tab) => profile.tabs.includes(tab.id))
                    .map((tab) => tab.label)
                    .join(", ") || "Tidak ada"}
                </td>
                <td className="p-4 text-zinc-400">
                  {ABILITY_META.filter((item) =>
                    profile.abilities.includes(item.id),
                  )
                    .map((item) => item.label)
                    .join(", ") || "Lihat saja"}
                </td>
                <td className="p-4 text-zinc-400">
                  {profile.reportRoles
                    .map((role) => PIC[role]?.name)
                    .filter(Boolean)
                    .join(", ")}
                </td>
                <td className="p-4">
                  <button
                    className="ops-button"
                    onClick={() => setEditingPermission(profile)}
                  >
                    Edit permission
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}
      {editingPermission && (
        <RolePermissionEditor
          key={editingPermission.role}
          profile={editingPermission}
          onClose={() => setEditingPermission(null)}
          onSave={saveRolePermissions}
        />
      )}
    </section>
  );
}
function Login() {
  const { login, data } = useOps(),
    [email, setEmail] = useState("coo@gmail.com"),
    [password, setPassword] = useState(""),
    [processing, setProcessing] = useState(false),
    [error, setError] = useState("");
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 p-6 text-zinc-100">
      <section className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-8">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 font-bold">
          P
        </span>
        <h1 className="mt-6 text-3xl font-semibold">Masuk ke PBM Ops</h1>
        <p className="mt-3 text-sm leading-6 text-zinc-400">
          Sistem operasional agency. Masuk menggunakan akun Gmail yang sudah
          terdaftar.
        </p>
        <form
          className="mt-6 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            setError("");
            login(email, password, {
              onStart: () => setProcessing(true),
              onFinish: () => setProcessing(false),
              onError: (errors) =>
                setError(firstError(errors) || "Login gagal."),
            });
          }}
        >
          <label className="grid gap-2 text-sm">
            Email Gmail
            <input
              className="login-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="username"
            />
          </label>
          <label className="grid gap-2 text-sm">
            Password
            <input
              className="login-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </label>
          {error && (
            <p role="alert" className="text-sm text-rose-300">
              {error}
            </p>
          )}
          <button
            className="ops-button ops-primary w-full"
            type="submit"
            disabled={processing}
          >
            {processing ? "Memproses…" : "Masuk"}
          </button>
        </form>
        <div className="mt-6 border-t border-zinc-800 pt-5">
          <p className="mb-3 text-xs uppercase tracking-wider text-zinc-400">
            Akun demo tersedia
          </p>
          <div className="flex flex-wrap gap-2">
            {data.users
              .filter((u) => u.active)
              .map((u) => (
                <button
                  className="ops-button"
                  key={u.id}
                  onClick={() => {
                    setEmail(u.email);
                    setPassword("password");
                  }}
                  title={u.email}
                >
                  {PIC[u.role].name}
                </button>
              ))}
          </div>
        </div>
        <p className="mt-5 text-xs leading-5 text-zinc-500">
          Gunakan akses cepat di atas untuk meninjau workspace berdasarkan role.
        </p>
      </section>
    </main>
  );
}

/* -------------------------- app shell -------------------------- */

function AppShell() {
  const {
    currentUser,
    permissionProfile,
    logout,
    storageError,
    notice,
    can,
    data,
    teamDispatch,
  } = useOps();
  const [tab, setTab] = useState("board");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [highlightClient, setHighlightClient] = useState(null);

  useEffect(() => {
    if (currentUser && !can("view", tab)) {
      const fallback = TAB_META.find((item) => can("view", item.id));
      if (fallback) setTab(fallback.id);
    }
  }, [currentUser?.role, permissionProfile, tab]);

  if (!currentUser) return <Login />;

  function goToClient(clientId) {
    setTab("board");
    setHighlightClient(clientId);
  }

  function selectTab(nextTab) {
    setTab(nextTab);
    setMobileNavOpen(false);
  }

  const visibleTabs = TAB_META.filter((item) => can("view", item.id));
  const activeTab =
    visibleTabs.find((item) => item.id === tab) || visibleTabs[0];
  const ActiveTabIcon = activeTab.icon;

  return (
    <div
      className="relative min-h-screen w-full bg-zinc-950 text-zinc-100"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&display=swap');
        ::selection { background: ${rgba(ACCENT, 0.35)}; }
      `}</style>

      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-72 opacity-40"
        style={{
          background: `radial-gradient(600px circle at 20% 0%, ${rgba(ACCENT, 0.16)}, transparent 70%)`,
        }}
      />

      <header className="relative border-b border-zinc-900">
        <div className="mx-auto hidden max-w-[1400px] items-center justify-between gap-3 px-6 py-4 xl:flex">
          <div className="flex items-center gap-2.5">
            <span
              className="flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold text-white"
              style={{
                backgroundColor: ACCENT,
                fontFamily: "'Space Grotesk', sans-serif",
              }}
            >
              P
            </span>
            <span className="text-sm font-semibold tracking-tight text-zinc-100">
              PBM Ops
            </span>
          </div>

          <nav className="flex flex-wrap items-center gap-1 rounded-full border border-zinc-800 bg-zinc-900 p-1">
            {visibleTabs.map((item) => (
              <TabButton
                key={item.id}
                active={tab === item.id}
                onClick={() => selectTab(item.id)}
                icon={item.icon}
              >
                {item.label}
              </TabButton>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <span
              className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-800 text-zinc-300"
              style={{ fontSize: 11, fontWeight: 500 }}
            >
              {PIC[currentUser.role].initials}
            </span>
            <span className="text-xs text-zinc-400">
              {PIC[currentUser.role].name}
            </span>
            <button className="ops-button" onClick={logout}>
              Keluar
            </button>
          </div>
        </div>

        <div className="mx-auto max-w-[1400px] px-4 py-3 xl:hidden">
          <div className="flex items-center justify-between gap-3">
            <div className="flex shrink-0 items-center gap-2.5">
              <span
                className="flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold text-white"
                style={{
                  backgroundColor: ACCENT,
                  fontFamily: "'Space Grotesk', sans-serif",
                }}
              >
                P
              </span>
              <span className="text-sm font-semibold tracking-tight text-zinc-100">
                PBM Ops
              </span>
            </div>

            <div className="flex min-w-0 items-center gap-2">
              <div
                className="flex min-w-0 items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 px-2.5 py-1.5"
                aria-label={`Role aktif: ${PIC[currentUser.role].name}`}
              >
                <span
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-zinc-300"
                  style={{ fontSize: 10, fontWeight: 600 }}
                >
                  {PIC[currentUser.role].initials}
                </span>
                <span className="truncate text-xs text-zinc-300">
                  {PIC[currentUser.role].name}
                </span>
              </div>
              <button
                className="ops-button shrink-0 px-2.5"
                onClick={logout}
                aria-label="Keluar dari PBM Ops"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Keluar</span>
              </button>
            </div>
          </div>

          <nav className="relative mt-3" aria-label="Breadcrumb navigation">
            <ol className="flex min-w-0 items-center gap-2 text-sm">
              <li className="shrink-0 text-zinc-500">Workspace</li>
              <li aria-hidden="true">
                <ChevronRight className="h-4 w-4 text-zinc-700" />
              </li>
              <li className="min-w-0 flex-1">
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-2 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2.5 text-left text-zinc-100"
                  aria-expanded={mobileNavOpen}
                  aria-controls="mobile-navigation-menu"
                  onClick={() => setMobileNavOpen((open) => !open)}
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <ActiveTabIcon className="h-4 w-4 shrink-0" />
                    <span className="truncate font-medium">
                      {activeTab.label}
                    </span>
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-zinc-500 transition-transform ${mobileNavOpen ? "rotate-180" : ""}`}
                  />
                </button>
              </li>
            </ol>

            {mobileNavOpen && (
              <div
                id="mobile-navigation-menu"
                className="absolute inset-x-0 top-full z-40 mt-2 rounded-xl border border-zinc-800 bg-zinc-950 p-2 shadow-2xl shadow-black/50"
              >
                <p className="px-3 pb-2 pt-1 text-xs font-medium uppercase tracking-wider text-zinc-600">
                  Pilih halaman
                </p>
                <div className="grid gap-1 sm:grid-cols-2">
                  {visibleTabs.map((item) => {
                    const Icon = item.icon;
                    const active = item.id === tab;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                          active
                            ? "bg-violet-600 text-white"
                            : "text-zinc-300 hover:bg-zinc-900"
                        }`}
                        onClick={() => selectTab(item.id)}
                      >
                        <Icon className="h-4 w-4" />
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </nav>
        </div>
      </header>

      <main className="relative mx-auto max-w-[1400px] px-6 py-8">
        {(storageError || notice) && (
          <div className="mb-5 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-zinc-300">
            <span role="status">{storageError || notice}</span>
          </div>
        )}
        {tab === "board" && (
          <ExecutionBoard
            highlightClient={highlightClient}
            onHighlightHandled={() => setHighlightClient(null)}
          />
        )}
        {tab === "hub" && can("view", "hub") && (
          <ExecutiveHub onGoToClient={goToClient} />
        )}
        {tab === "kpi" && can("view", "kpi") && <KpiDashboard />}
        {tab === "team" && (
          <TeamPerformance
            team={data.team}
            users={data.users}
            currentUser={currentUser}
            reportRoles={permissionProfile?.reportRoles || [currentUser.role]}
            canSubmit={can("submit", "team-reports")}
            canManageSettings={can("manage", "team-settings")}
            dispatch={teamDispatch}
          />
        )}
        {tab === "feedback" && can("view", "feedback") && <FeedbackLoop />}
        {tab === "clients" && can("view", "clients") && <ClientManager />}
        {tab === "users" && can("view", "users") && <UserManager />}
        <EditorHost />
      </main>
    </div>
  );
}

const APP_CSS =
  ".pbm-prototype { color-scheme: dark; font-family: Inter, system-ui, sans-serif; background: #09090b; }\nbutton,select { cursor:pointer; }\nbutton:disabled { cursor:not-allowed; opacity:.45; }\ninput,select,textarea { color-scheme:dark; }\nbutton:focus-visible,a:focus-visible { outline:2px solid #a78bfa; outline-offset:3px; }\n.ops-dialog::backdrop { background:rgb(0 0 0 / .76); backdrop-filter:blur(4px); }\n.ops-dialog { margin:auto; max-height:90dvh; width:min(850px,calc(100% - 24px)); overflow:auto; border:1px solid #3f3f46; border-radius:20px; padding:24px; background:#09090b; color:#f4f4f5; }\n.ops-dialog input:not([type=radio]):not([type=checkbox]),.ops-dialog select,.ops-dialog textarea,.login-input { width:100%; background:#18181b; border:1px solid #3f3f46; border-radius:8px; padding:10px 12px; color:#f4f4f5; }\n.ops-dialog label { display:grid; gap:7px; font-size:14px; color:#d4d4d8; }\n.ops-dialog textarea { min-height:88px; resize:vertical; }\n.ops-button { display:inline-flex; align-items:center; justify-content:center; gap:6px; border:1px solid #3f3f46; border-radius:8px; padding:8px 12px; font-size:14px; background:#18181b; color:#e4e4e7; }\n.ops-button:hover { background:#27272a; }\n.ops-primary { background:#4f39f6; border-color:#4f39f6; color:white; }\n.ops-primary:hover { background:#634efb; }\n.ops-danger { color:#fda4af; border-color:#9f1239; }\n.ops-empty { padding:32px; border:1px dashed #3f3f46; border-radius:12px; color:#a1a1aa; text-align:center; }\n@media(max-width:640px) { main { padding:20px 12px !important; } .ops-dialog { padding:18px; } }\n.ops-dialog label.ops-inline-label { display:flex; align-items:center; gap:8px; }\n";
export default function App({
  authUser,
  serverUsers,
  serverOperations,
  serverTeam,
  serverPermissions,
  flash,
}) {
  return (
    <OpsProvider
      authUser={authUser}
      serverUsers={serverUsers}
      serverOperations={serverOperations}
      serverTeam={serverTeam}
      serverPermissions={serverPermissions}
      flash={flash}
    >
      <style>{APP_CSS}</style>
      <AppShell />
    </OpsProvider>
  );
}
