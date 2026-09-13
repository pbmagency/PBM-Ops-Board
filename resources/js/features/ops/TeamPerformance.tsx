// @ts-nocheck -- faithful port of the approved interactive MVP; server payloads are typed at the page boundary.
import { useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Plus,
  Settings,
  Users,
} from "lucide-react";

const ROLE_LABELS = {
  coo: "COO",
  "project-manager": "Project Manager",
  cmo: "CMO",
  "marketing-manager": "Marketing Manager",
  "digital-marketer": "Digital Marketer",
  creative: "Creative",
  developer: "Developer",
  "content-specialist": "Content Specialist",
  "appointment-setter": "Appointment Setter",
};
const PERIOD_LABEL = {
  weekly: "Minggu ini",
  monthly: "Progres bulan ini",
  quarterly: "Progres kuartal ini",
};
const copy = (value) => JSON.parse(JSON.stringify(value));
const panel = "rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5";
const field =
  "w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-base text-zinc-100 focus:border-violet-500 focus:outline-none";

export function teamWeek(
  date = new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Jakarta" }),
) {
  const value = new Date(date);
  value.setUTCHours(0, 0, 0, 0);
  value.setUTCDate(value.getUTCDate() - ((value.getUTCDay() + 6) % 7));
  return value.toISOString().slice(0, 10);
}

export function shiftTeamWeek(week, offset) {
  const value = new Date(`${week}T00:00:00Z`);
  value.setUTCDate(value.getUTCDate() + offset * 7);
  return value.toISOString().slice(0, 10);
}

function weekLabel(week) {
  const start = new Date(`${week}T00:00:00Z`);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 5);
  const format = (value) =>
    new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    }).format(value);
  return `${format(start)} – ${format(end)}`;
}

function kpi(
  id,
  role,
  name,
  target,
  unit,
  direction = "min",
  period = "weekly",
  high = null,
) {
  return {
    id,
    role,
    name,
    target,
    high,
    unit,
    direction,
    period,
    effective: "2026-01-05",
    active: true,
  };
}

export function teamDefinitions() {
  return [
    kpi("util", "coo", "Capacity Utilization", 70, "%", "range", "weekly", 85),
    kpi(
      "escalation",
      "coo",
      "Escalation Resolution Time",
      3,
      "hari kerja",
      "max",
    ),
    kpi(
      "allocation",
      "coo",
      "Alokasi Delivery",
      80,
      "%",
      "range",
      "monthly",
      90,
    ),
    kpi("audit", "coo", "QC Audit Pass Rate", 90, "%", "min", "monthly"),
    kpi("sop", "coo", "SOP Coverage", 100, "%", "min", "quarterly"),

    kpi("ontime-pm", "project-manager", "On-Time Delivery Rate", 90, "%", "gt"),
    kpi("qc-pm", "project-manager", "First-Time QC Pass Rate", 85, "%"),
    kpi(
      "turnaround",
      "project-manager",
      "Turnaround terhadap SLA",
      100,
      "% SLA",
      "max",
    ),
    kpi("blocker", "project-manager", "Blocker Aging", 2, "hari kerja", "max"),
    kpi(
      "churn",
      "project-manager",
      "Client Churn",
      0,
      "klien",
      "max",
      "monthly",
    ),
    kpi(
      "retention",
      "project-manager",
      "Client Retention Rate",
      90,
      "%",
      "min",
      "monthly",
    ),
    kpi(
      "csat",
      "project-manager",
      "Client Satisfaction",
      4.5,
      "/ 5",
      "min",
      "monthly",
    ),

    kpi("booked", "cmo", "Booked Meeting Internal", null, "meeting", "observe"),
    kpi(
      "cpbm",
      "cmo",
      "Cost per Booked Meeting",
      null,
      "Rp",
      "observe",
      "monthly",
    ),

    kpi("internal", "marketing-manager", "On-Time Aset Internal", 90, "%"),
    kpi(
      "marketing-cap",
      "marketing-manager",
      "Alokasi Marketing",
      20,
      "%",
      "min",
      "monthly",
    ),
    kpi(
      "calendar",
      "marketing-manager",
      "Kepatuhan Kalender Marketing",
      100,
      "%",
      "min",
      "monthly",
    ),

    kpi("daily-dm", "digital-marketer", "Kepatuhan Daily Report", 100, "%"),
    kpi(
      "experiment",
      "digital-marketer",
      "Siklus Eksperimen Selesai",
      3,
      "siklus",
      "min",
      "monthly",
    ),

    kpi("asset", "creative", "On-Time Asset Delivery", 100, "%"),
    kpi("approval", "creative", "First-Time Approval Rate", 80, "%"),
    kpi("daily-cr", "creative", "Kepatuhan Daily Report", 100, "%"),
    kpi(
      "revisions",
      "creative",
      "Revisi per Aset",
      2,
      "putaran",
      "max",
      "monthly",
    ),

    kpi("publish", "developer", "On-Time Publish Rate", 100, "%"),
    kpi("staging", "developer", "QC Pass Rate Staging", 85, "%"),

    kpi(
      "content",
      "content-specialist",
      "Publishing Consistency",
      100,
      "%",
      "min",
      "monthly",
    ),
    kpi("reach", "content-specialist", "Reach Growth", 0, "%", "gt", "monthly"),
    kpi(
      "engagement",
      "content-specialist",
      "Engagement Growth",
      10,
      "%",
      "min",
      "monthly",
    ),
    kpi(
      "organic",
      "content-specialist",
      "Lead Organik",
      null,
      "lead",
      "observe",
      "monthly",
    ),

    kpi("showup", "appointment-setter", "Show-Up Rate", 70, "%"),
    kpi(
      "schedule",
      "appointment-setter",
      "Speed to Schedule",
      4,
      "jam kerja",
      "max",
    ),
    kpi("noshow", "appointment-setter", "Tindak Lanjut No-Show", 100, "%"),
    kpi("log", "appointment-setter", "Kelengkapan Log Jadwal", 100, "%"),
  ];
}

export function teamMetricState(metric) {
  if (
    metric.value === null ||
    metric.value === "" ||
    metric.value === undefined
  )
    return "empty";
  if (metric.period !== "weekly") return "progress";
  if (metric.target === null || metric.direction === "observe")
    return "observe";
  const value = Number(metric.value);
  const target = Number(metric.target);
  const hit =
    metric.direction === "max"
      ? value <= target
      : metric.direction === "gt"
        ? value > target
        : metric.direction === "range"
          ? value >= target && value <= Number(metric.high)
          : value >= target;
  return hit ? "hit" : "miss";
}

function targetText(metric) {
  if (metric.target === null) return "Pantau angkanya";
  if (metric.direction === "range")
    return `${metric.target}–${metric.high} ${metric.unit}`;
  const sign = { min: "≥", max: "≤", gt: ">" }[metric.direction] || "";
  return `${sign} ${metric.target} ${metric.unit}`;
}

function effectiveDefinitions(definitions, role, week) {
  const selected = new Map();
  definitions
    .filter((item) => item.role === role && item.effective <= week)
    .forEach((item) => selected.set(item.id, item));
  return [...selected.values()].filter((item) => item.active);
}

export function newTeamReport(team, user, week) {
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(week) ||
    teamWeek(`${week}T00:00:00Z`) !== week
  )
    throw new Error("Periode laporan harus dimulai hari Senin.");
  return {
    id: `${user.id}:${week}`,
    userId: user.id,
    role: user.role,
    week,
    status: "draft",
    metrics: effectiveDefinitions(team.definitions, user.role, week).map(
      (item) => ({
        ...copy(item),
        value: null,
      }),
    ),
    summary: "",
    cause: "",
    plan: "",
    decision: "",
    demo: false,
    updatedAt: null,
  };
}

export function canTeamRead(actor, report, reportRoles = [actor?.role]) {
  if (!actor) return false;
  if (actor.id === report.userId) return true;
  return reportRoles.includes(report.role);
}

// Kept as an exported compatibility hook; written review is intentionally disabled.
export function canTeamReview() {
  return false;
}

export function createTeamSeed(users, _clients = [], now = teamWeek()) {
  const team = { definitions: teamDefinitions(), reports: [] };
  const lastWeek = shiftTeamWeek(teamWeek(now), -1);
  for (let offset = 3; offset >= 0; offset -= 1) {
    const week = shiftTeamWeek(lastWeek, -offset);
    users
      .filter((user) => user.active)
      .forEach((user, userIndex) => {
        const report = newTeamReport(team, user, week);
        report.metrics = report.metrics.map((metric, metricIndex) => {
          let value;
          if (metric.target === null) value = 4 + userIndex + offset;
          else if (metric.direction === "range")
            value = metric.target + 5 + offset;
          else if (metric.direction === "max")
            value = Math.max(
              0,
              +(metric.target * (0.8 + offset * 0.08)).toFixed(1),
            );
          else
            value = +(
              metric.target * (0.87 + (3 - offset) * 0.04) -
              (metricIndex === 0 && userIndex % 3 === 0 ? 4 : 0)
            ).toFixed(1);
          return { ...metric, value };
        });
        report.status = "saved";
        report.summary = "Prioritas utama minggu ini selesai sesuai rencana.";
        report.cause =
          "Kendala utama berasal dari antrean handoff yang terlambat.";
        report.plan = "Rapikan handoff dan selesaikan prioritas minggu depan.";
        report.decision = "Tidak ada keputusan tambahan untuk data contoh ini.";
        report.demo = true;
        report.updatedAt = `${week}T12:00:00.000Z`;
        team.reports.push(report);
      });
  }
  return team;
}

export function simplifyTeamData(oldTeam, users, now = teamWeek()) {
  const fresh = createTeamSeed(users, [], now);
  if (!oldTeam?.reports?.length) return fresh;
  fresh.reports = oldTeam.reports.flatMap((oldReport) => {
    const user = users.find((item) => item.id === oldReport.userId);
    if (!user) return [];
    const report = newTeamReport(fresh, user, oldReport.week);
    report.metrics = report.metrics.map((metric) => {
      const previous = oldReport.metrics?.find(
        (item) => item.id === metric.id && !item.clientId,
      );
      return {
        ...metric,
        value:
          previous?.value === "" || previous?.value === undefined
            ? null
            : (previous?.value ?? null),
      };
    });
    report.summary = String(oldReport.summary || "");
    report.cause = String(oldReport.cause || "");
    report.plan = String(oldReport.plan || "");
    report.decision = String(oldReport.decision || "");
    report.status = oldReport.status === "draft" ? "draft" : "saved";
    report.demo = Boolean(oldReport.demo);
    report.updatedAt = oldReport.updatedAt || oldReport.submittedAt || null;
    return [report];
  });
  return fresh;
}

function StatusBadge({ state }) {
  const styles = {
    hit: "border-emerald-400/25 bg-emerald-400/10 text-emerald-300",
    miss: "border-rose-400/25 bg-rose-400/10 text-rose-300",
    saved: "border-violet-400/25 bg-violet-400/10 text-violet-300",
    progress: "border-sky-400/25 bg-sky-400/10 text-sky-300",
    observe: "border-zinc-700 bg-zinc-800 text-zinc-300",
    empty: "border-zinc-800 bg-zinc-900 text-zinc-500",
  };
  const labels = {
    hit: "Hit target",
    miss: "Belum hit",
    saved: "Sudah diisi",
    progress: "Progres",
    observe: "Dipantau",
    empty: "Belum diisi",
  };
  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full border px-2.5 py-1 text-xs ${styles[state]}`}
    >
      {labels[state]}
    </span>
  );
}

function WeekSelector({ week, setWeek, reports }) {
  const weeks = [
    ...new Set([
      week,
      ...Array.from({ length: 12 }, (_, index) =>
        shiftTeamWeek(teamWeek(), 1 - index),
      ),
      ...reports.map((report) => report.week),
    ]),
  ]
    .sort()
    .reverse();
  return (
    <div className="flex items-center gap-2">
      <button
        className="ops-button"
        aria-label="Minggu sebelumnya"
        onClick={() => setWeek(shiftTeamWeek(week, -1))}
      >
        <ChevronLeft size={17} />
      </button>
      <select
        className={`${field} min-w-60`}
        aria-label="Periode laporan"
        value={week}
        onChange={(event) => setWeek(event.target.value)}
      >
        {weeks.map((item) => (
          <option key={item} value={item}>
            {weekLabel(item)}
          </option>
        ))}
      </select>
      <button
        className="ops-button"
        aria-label="Minggu berikutnya"
        onClick={() => setWeek(shiftTeamWeek(week, 1))}
      >
        <ChevronRight size={17} />
      </button>
    </div>
  );
}

export default function TeamPerformance({
  team,
  users,
  currentUser,
  reportRoles,
  canSubmit,
  canManageSettings,
  dispatch,
}) {
  const [week, setWeek] = useState(() => shiftTeamWeek(teamWeek(), -1));
  const [page, setPage] = useState("week");
  const [opened, setOpened] = useState(null);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const readableReports = team.reports.filter((report) =>
    canTeamRead(currentUser, report, reportRoles),
  );
  const visibleUsers = users.filter(
    (user) =>
      user.active &&
      canTeamRead(
        currentUser,
        { userId: user.id, role: user.role },
        reportRoles,
      ),
  );
  const rows = visibleUsers.map((user) => ({
    user,
    report: readableReports.find(
      (report) => report.userId === user.id && report.week === week,
    ),
  }));
  const ownStored = readableReports.find(
    (report) => report.userId === currentUser.id && report.week === week,
  );
  const ownReport = ownStored || newTeamReport(team, currentUser, week);
  const current = opened
    ? readableReports.find((report) => report.id === opened) ||
      (opened === ownReport.id ? ownReport : null)
    : null;

  async function save(report) {
    try {
      await dispatch({ type: "save", report });
      setError("");
      setNotice("Laporan minggu ini sudah tersimpan.");
      setOpened(null);
    } catch (caught) {
      setNotice("");
      setError(caught.message);
    }
  }

  async function changeSettings(command, message) {
    try {
      await dispatch(command);
      setError("");
      setNotice(message);
      return true;
    } catch (caught) {
      setNotice("");
      setError(caught.message);
      return false;
    }
  }

  function changeWeek(next) {
    setWeek(next);
    setOpened(null);
    setNotice("");
    setError("");
  }

  if (current)
    return (
      <ReportForm
        key={`${current.id}:${current.updatedAt}`}
        report={current}
        users={users}
        currentUser={currentUser}
        canSubmit={canSubmit}
        onBack={() => setOpened(null)}
        onSave={save}
      />
    );

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[.2em] text-violet-300">
            Kinerja tim internal
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">
            Team Performance KPI
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            Isi angka di akhir minggu, lalu gunakan hasilnya saat meeting Senin.
          </p>
        </div>
        <WeekSelector
          week={week}
          setWeek={changeWeek}
          reports={readableReports}
        />
      </div>

      <div className="flex gap-2 border-b border-zinc-800 pb-4">
        <button
          className={`ops-button ${page === "week" ? "ops-primary" : ""}`}
          onClick={() => setPage("week")}
        >
          Minggu Ini
        </button>
        <button
          className={`ops-button ${page === "history" ? "ops-primary" : ""}`}
          onClick={() => setPage("history")}
        >
          Riwayat
        </button>
        {canManageSettings && (
          <button
            className={`ops-button ${page === "settings" ? "ops-primary" : ""}`}
            onClick={() => setPage("settings")}
          >
            KPI Settings
          </button>
        )}
      </div>

      {notice && <p className="text-sm text-emerald-300">{notice}</p>}
      {error && (
        <p
          role="alert"
          className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-200"
        >
          {error}
        </p>
      )}

      {page === "settings" ? (
        <KpiSettings
          definitions={team.definitions}
          onSave={(definition) =>
            changeSettings(
              { type: "save-definition", definition },
              "Pengaturan KPI sudah tersimpan.",
            )
          }
          onDelete={(definitionId) =>
            changeSettings(
              { type: "delete-definition", definitionId },
              "KPI berhasil dihapus. Riwayat laporan lama tetap utuh.",
            )
          }
        />
      ) : page === "history" ? (
        <History reports={readableReports} users={users} onOpen={setOpened} />
      ) : (
        <WeekOverview
          rows={rows}
          week={week}
          currentUser={currentUser}
          ownReport={ownReport}
          ownStored={ownStored}
          canSubmit={canSubmit}
          onOpen={setOpened}
        />
      )}
    </section>
  );
}

function KpiSettings({ definitions, onSave, onDelete }) {
  const blank = {
    id: "",
    role: "developer",
    name: "",
    target: "",
    high: "",
    unit: "%",
    direction: "min",
    period: "weekly",
    active: true,
  };
  const [draft, setDraft] = useState(blank);
  const [editing, setEditing] = useState(false);
  const [roleFilter, setRoleFilter] = useState("all");
  const sorted = definitions
    .filter(
      (definition) =>
        roleFilter === "all" || definition.role === roleFilter,
    )
    .sort(
    (a, b) =>
      Object.keys(ROLE_LABELS).indexOf(a.role) -
        Object.keys(ROLE_LABELS).indexOf(b.role) ||
      a.name.localeCompare(b.name),
  );

  function open(definition = null) {
    const source = definition || {
      ...blank,
      role: roleFilter === "all" ? blank.role : roleFilter,
    };
    setDraft({
      ...source,
      target: source.target ?? "",
      high: source.high ?? "",
    });
    setEditing(true);
  }

  async function submit() {
    if (await onSave(draft)) {
      setEditing(false);
      setDraft(blank);
    }
  }

  return (
    <div className="space-y-5">
      <div
        className={`${panel} flex flex-wrap items-center justify-between gap-4`}
      >
        <div>
          <div className="flex items-center gap-2">
            <Settings className="text-violet-300" size={20} />
            <h2 className="text-xl font-semibold">KPI Settings</h2>
          </div>
          <p className="mt-2 text-sm text-zinc-400">
            Atur KPI per role. Perubahan berlaku pada laporan baru; riwayat lama
            tetap utuh.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            className={`${field} min-w-48`}
            aria-label="Filter KPI berdasarkan role"
            value={roleFilter}
            onChange={(event) => setRoleFilter(event.target.value)}
          >
            <option value="all">Semua role</option>
            {Object.entries(ROLE_LABELS).map(([id, label]) => (
              <option key={id} value={id}>
                {label}
              </option>
            ))}
          </select>
          <button className="ops-button ops-primary" onClick={() => open()}>
            <Plus size={17} />
            <span>Tambah KPI</span>
          </button>
        </div>
      </div>

      {editing && (
        <div className={panel}>
          <h3 className="text-lg font-semibold">
            {draft.id ? "Ubah KPI" : "Tambah KPI baru"}
          </h3>
          <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <label className="grid gap-2 text-sm text-zinc-300">
              Role
              <select
                className={field}
                aria-label="Role KPI"
                value={draft.role}
                onChange={(event) =>
                  setDraft({ ...draft, role: event.target.value })
                }
              >
                {Object.entries(ROLE_LABELS).map(([id, label]) => (
                  <option key={id} value={id}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 text-sm text-zinc-300 md:col-span-2">
              Nama KPI
              <input
                className={field}
                aria-label="Nama KPI"
                value={draft.name}
                onChange={(event) =>
                  setDraft({ ...draft, name: event.target.value })
                }
                placeholder="Contoh: Bug terselesaikan tepat waktu"
              />
            </label>
            <label className="grid gap-2 text-sm text-zinc-300">
              Target
              <input
                className={field}
                aria-label="Target KPI"
                type="number"
                min="0"
                step="any"
                value={draft.target}
                onChange={(event) =>
                  setDraft({ ...draft, target: event.target.value })
                }
                placeholder="Kosong = dipantau"
              />
            </label>
            <label className="grid gap-2 text-sm text-zinc-300">
              Unit
              <input
                className={field}
                aria-label="Unit KPI"
                value={draft.unit}
                onChange={(event) =>
                  setDraft({ ...draft, unit: event.target.value })
                }
                placeholder="%, hari, aset"
              />
            </label>
            <label className="grid gap-2 text-sm text-zinc-300">
              Cara menilai
              <select
                className={field}
                aria-label="Cara menilai KPI"
                value={draft.direction}
                onChange={(event) =>
                  setDraft({ ...draft, direction: event.target.value })
                }
              >
                <option value="min">Minimal target</option>
                <option value="max">Maksimal target</option>
                <option value="gt">Lebih besar dari target</option>
                <option value="range">Dalam rentang</option>
              </select>
            </label>
            {draft.direction === "range" && (
              <label className="grid gap-2 text-sm text-zinc-300">
                Batas atas
                <input
                  className={field}
                  aria-label="Batas atas KPI"
                  type="number"
                  min="0"
                  step="any"
                  value={draft.high}
                  onChange={(event) =>
                    setDraft({ ...draft, high: event.target.value })
                  }
                />
              </label>
            )}
            <label className="grid gap-2 text-sm text-zinc-300">
              Periode
              <select
                className={field}
                aria-label="Periode KPI"
                value={draft.period}
                onChange={(event) =>
                  setDraft({ ...draft, period: event.target.value })
                }
              >
                <option value="weekly">Mingguan</option>
                <option value="monthly">Bulanan</option>
                <option value="quarterly">Kuartalan</option>
              </select>
            </label>
          </div>
          <div className="mt-5 flex justify-end gap-2">
            <button className="ops-button" onClick={() => setEditing(false)}>
              Batal
            </button>
            <button className="ops-button ops-primary" onClick={submit}>
              Simpan KPI
            </button>
          </div>
        </div>
      )}

      <div className={`${panel} overflow-x-auto`}>
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="text-zinc-500">
            <tr>
              <th className="px-3 py-3 font-medium">Role</th>
              <th className="px-3 py-3 font-medium">Nama KPI</th>
              <th className="px-3 py-3 font-medium">Target</th>
              <th className="px-3 py-3 font-medium">Periode</th>
              <th className="px-3 py-3" />
            </tr>
          </thead>
          <tbody>
            {sorted.map((definition) => (
              <tr key={definition.id} className="border-t border-zinc-800">
                <td className="px-3 py-4">{ROLE_LABELS[definition.role]}</td>
                <td className="px-3 py-4 font-medium">{definition.name}</td>
                <td className="px-3 py-4">{targetText(definition)}</td>
                <td className="px-3 py-4">{PERIOD_LABEL[definition.period]}</td>
                <td className="px-3 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      className="ops-button"
                      onClick={() => open(definition)}
                    >
                      Ubah
                    </button>
                    <button
                      className="ops-button ops-danger"
                      onClick={() => {
                        if (
                          window.confirm(
                            `Hapus KPI “${definition.name}”? Riwayat laporan lama tetap tersimpan.`,
                          )
                        )
                          onDelete(definition.id);
                      }}
                    >
                      Hapus
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!sorted.length && (
          <p className="ops-empty m-4">Belum ada KPI untuk filter role ini.</p>
        )}
      </div>
    </div>
  );
}

function WeekOverview({
  rows,
  week,
  currentUser,
  ownReport,
  ownStored,
  canSubmit,
  onOpen,
}) {
  const [roleFilter, setRoleFilter] = useState("all");
  const roleOptions = [...new Set(rows.map(({ user }) => user.role))];
  const filteredRows = rows.filter(
    ({ user }) => roleFilter === "all" || user.role === roleFilter,
  );
  const reports = filteredRows.map((row) => row.report).filter(Boolean);
  const weeklyMetrics = reports.flatMap((report) =>
    report.metrics.filter((metric) => metric.period === "weekly"),
  );
  const hit = weeklyMetrics.filter(
    (metric) => teamMetricState(metric) === "hit",
  ).length;
  const misses = weeklyMetrics.filter(
    (metric) => teamMetricState(metric) === "miss",
  ).length;

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          [
            Users,
            "Laporan sudah diisi",
            `${reports.length}/${filteredRows.length}`,
            "text-violet-300",
          ],
          [CheckCircle2, "KPI mingguan hit target", hit, "text-emerald-300"],
          [AlertTriangle, "KPI perlu dibahas", misses, "text-rose-300"],
        ].map(([Icon, label, value, color]) => (
          <div className={panel} key={label}>
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-zinc-300">{label}</p>
              <Icon className={color} size={20} />
            </div>
            <p className={`mt-4 text-3xl font-semibold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-violet-500/30 bg-violet-500/10 p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-violet-200">Laporan saya</p>
            <p className="mt-1 text-lg font-semibold">
              {ROLE_LABELS[currentUser.role]} · {weekLabel(week)}
            </p>
            <p className="mt-2 text-sm text-zinc-400">
              {ownStored
                ? "Angka sudah tersimpan dan masih bisa diperbarui."
                : "Isi angka KPI dan empat catatan singkat sebelum meeting."}
            </p>
          </div>
          {canSubmit ? (
            <button
              className="ops-button ops-primary"
              onClick={() => onOpen(ownReport.id)}
            >
              {ownStored ? "Update KPI Saya" : "Isi KPI Saya"}
            </button>
          ) : (
            <span className="rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-400">
              Akses pengisian dinonaktifkan
            </span>
          )}
        </div>
      </div>

      {rows.some(({ user }) => user.id !== currentUser.id) && (
        <div className={`${panel} overflow-x-auto`}>
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold">Rekap tim minggu ini</h2>
              <p className="mt-1 text-sm text-zinc-400">
                Buka laporan untuk melihat angka dan bahan pembahasan meeting.
              </p>
            </div>
            <label className="grid gap-1 text-xs text-zinc-400">
              Filter role
              <select
                className={`${field} min-w-52`}
                aria-label="Filter rekap minggu ini berdasarkan role"
                value={roleFilter}
                onChange={(event) => setRoleFilter(event.target.value)}
              >
                <option value="all">Semua role</option>
                {roleOptions.map((role) => (
                  <option key={role} value={role}>
                    {ROLE_LABELS[role]}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead className="text-zinc-500">
              <tr>
                <th className="px-3 py-3 font-medium">Role</th>
                <th className="px-3 py-3 font-medium">Status</th>
                <th className="px-3 py-3 font-medium">Hit target</th>
                <th className="px-3 py-3 font-medium">Perlu dibahas</th>
                <th className="px-3 py-3" />
              </tr>
            </thead>
            <tbody>
              {filteredRows.map(({ user, report }) => {
                const metrics =
                  report?.metrics.filter(
                    (metric) => metric.period === "weekly",
                  ) || [];
                const assessed = metrics.filter((metric) =>
                  ["hit", "miss"].includes(teamMetricState(metric)),
                );
                return (
                  <tr key={user.id} className="border-t border-zinc-800">
                    <td className="px-3 py-4">
                      <p className="font-medium">{ROLE_LABELS[user.role]}</p>
                      <p className="mt-1 text-xs text-zinc-500">{user.email}</p>
                      {report?.demo && (
                        <span className="text-xs text-amber-300">
                          DATA DEMO
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-4">
                      <StatusBadge state={report ? "saved" : "empty"} />
                    </td>
                    <td className="px-3 py-4">
                      {assessed.length
                        ? `${assessed.filter((metric) => teamMetricState(metric) === "hit").length}/${assessed.length}`
                        : "—"}
                    </td>
                    <td className="px-3 py-4 text-zinc-400">
                      {metrics.find(
                        (metric) => teamMetricState(metric) === "miss",
                      )?.name || "—"}
                    </td>
                    <td className="px-3 py-4 text-right">
                      {report ? (
                        <button
                          className="ops-button"
                          onClick={() => onOpen(report.id)}
                        >
                          Lihat
                        </button>
                      ) : (
                        <span className="text-zinc-600">Belum diisi</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

function ReportForm({
  report,
  users,
  currentUser,
  canSubmit,
  onBack,
  onSave,
}) {
  const [draft, setDraft] = useState(() => copy(report));
  const own = report.userId === currentUser.id;
  const editable = own && canSubmit;
  const owner = users.find((user) => user.id === report.userId);

  function changeMetric(id, value) {
    setDraft((current) => ({
      ...current,
      metrics: current.metrics.map((metric) =>
        metric.id === id ? { ...metric, value } : metric,
      ),
    }));
  }

  return (
    <section className="space-y-5">
      <button className="ops-button" onClick={onBack}>
        ← Kembali
      </button>

      <div className={panel}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm text-violet-300">
              {ROLE_LABELS[report.role]} · {owner?.email || "Akun arsip"}
            </p>
            <h2 className="mt-1 text-2xl font-semibold">
              {weekLabel(report.week)}
            </h2>
          </div>
          <StatusBadge state={report.status === "saved" ? "saved" : "empty"} />
        </div>
        {editable && (
          <p className="mt-4 text-sm text-zinc-400">
            Masukkan angka aktual. Isi 0 jika hasilnya memang nol.
          </p>
        )}
      </div>

      {["weekly", "monthly", "quarterly"]
        .filter((period) =>
          draft.metrics.some((metric) => metric.period === period),
        )
        .map((period) => (
          <div key={period} className={panel}>
            <h3 className="text-lg font-semibold">{PERIOD_LABEL[period]}</h3>
            {period !== "weekly" && (
              <p className="mt-1 text-sm text-zinc-500">
                Isi angka terakhir yang tersedia untuk periode ini.
              </p>
            )}
            <div className="mt-4 divide-y divide-zinc-800">
              {draft.metrics
                .filter((metric) => metric.period === period)
                .map((metric) => (
                  <div
                    key={metric.id}
                    className="grid items-center gap-3 py-4 md:grid-cols-[1fr_190px_130px]"
                  >
                    <div>
                      <p className="font-medium">{metric.name}</p>
                      <p className="mt-1 text-sm text-zinc-500">
                        Target {targetText(metric)}
                      </p>
                    </div>
                    {editable ? (
                      <label className="flex items-center gap-2">
                        <span className="sr-only">{metric.name}</span>
                        <input
                          aria-label={metric.name}
                          className={field}
                          type="number"
                          min="0"
                          step="any"
                          value={metric.value ?? ""}
                          placeholder="0"
                          onChange={(event) =>
                            changeMetric(metric.id, event.target.value)
                          }
                        />
                        <span className="min-w-12 text-sm text-zinc-500">
                          {metric.unit}
                        </span>
                      </label>
                    ) : (
                      <p className="text-xl font-semibold">
                        {metric.value ?? "—"}{" "}
                        <span className="text-sm text-zinc-500">
                          {metric.unit}
                        </span>
                      </p>
                    )}
                    <StatusBadge state={teamMetricState(metric)} />
                  </div>
                ))}
            </div>
          </div>
        ))}

      {!draft.metrics.length && (
        <p className="ops-empty">Belum ada KPI untuk role ini.</p>
      )}

      <div className={`${panel} grid gap-5 md:grid-cols-2`}>
        {[
          ["summary", "Hasil utama minggu ini"],
          ["cause", "Penyebab belum hit target"],
          ["plan", "Rencana minggu depan"],
          ["decision", "Keputusan yang dibutuhkan saat meeting"],
        ].map(([key, label]) => (
          <label key={key} className="grid gap-2 text-sm text-zinc-300">
            {label}
            {editable ? (
              <textarea
                aria-label={label}
                className={`${field} min-h-28 resize-y`}
                value={draft[key]}
                placeholder={
                  key === "decision"
                    ? "Tulis ‘Tidak ada’ jika tidak membutuhkan keputusan."
                    : "Tulis singkat dan spesifik."
                }
                onChange={(event) =>
                  setDraft({ ...draft, [key]: event.target.value })
                }
              />
            ) : (
              <p className="min-h-14 whitespace-pre-wrap rounded-lg bg-zinc-950 p-3 text-zinc-300">
                {draft[key] || "—"}
              </p>
            )}
          </label>
        ))}
      </div>

      {editable && (
        <div className="flex justify-end">
          <button
            className="ops-button ops-primary px-5 py-3"
            onClick={() => onSave(draft)}
          >
            Simpan Laporan
          </button>
        </div>
      )}
    </section>
  );
}

function History({ reports, users, onOpen }) {
  const availableUsers = [...new Set(reports.map((report) => report.userId))];
  const [userId, setUserId] = useState(availableUsers[0] || "");
  const [metricId, setMetricId] = useState("");
  const ownReports = reports
    .filter((report) => report.userId === userId)
    .sort((a, b) => a.week.localeCompare(b.week));
  const metricOptions = [
    ...new Map(
      ownReports.flatMap((report) =>
        report.metrics.map((metric) => [metric.id, metric]),
      ),
    ).values(),
  ];
  const selectedMetric = metricOptions.some((metric) => metric.id === metricId)
    ? metricId
    : metricOptions[0]?.id;
  const points = ownReports.slice(-8).map((report) => ({
    report,
    metric: report.metrics.find((metric) => metric.id === selectedMetric),
  }));
  const numeric = points.flatMap(({ metric }) =>
    metric
      ? [metric.value, metric.target, metric.high]
          .filter((value) => value !== null && Number.isFinite(Number(value)))
          .map(Number)
      : [],
  );
  const low = Math.min(0, ...numeric);
  const high = Math.max(1, ...numeric);
  const x = (index) => 75 + (index * 610) / Math.max(1, points.length - 1);
  const y = (value) => 185 - ((Number(value) - low) / (high - low || 1)) * 135;
  const barColor = (metric) => {
    const state = teamMetricState(metric);
    if (state === "hit") return "#34d399";
    if (state === "miss") return "#fb7185";
    return "#a78bfa";
  };

  if (!reports.length)
    return (
      <p className="ops-empty">Riwayat muncul setelah laporan disimpan.</p>
    );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-3">
        <select
          className={`${field} !w-auto`}
          aria-label="Pilih anggota"
          value={userId}
          onChange={(event) => {
            setUserId(event.target.value);
            setMetricId("");
          }}
        >
          {availableUsers.map((id) => {
            const user = users.find((item) => item.id === id);
            return (
              <option key={id} value={id}>
                {ROLE_LABELS[user?.role]} · {user?.email || "Akun arsip"}
              </option>
            );
          })}
        </select>
        <select
          className={`${field} !w-auto`}
          aria-label="Pilih KPI"
          value={selectedMetric || ""}
          onChange={(event) => setMetricId(event.target.value)}
        >
          {metricOptions.map((metric) => (
            <option key={metric.id} value={metric.id}>
              {metric.name}
            </option>
          ))}
        </select>
      </div>

      <div className={panel}>
        <div className="flex items-center gap-2">
          <BarChart3 className="text-violet-300" size={20} />
          <h2 className="text-xl font-semibold">Tren 8 minggu terakhir</h2>
        </div>
        {points.some(({ metric }) => metric?.value != null) ? (
          <svg
            viewBox="0 0 750 225"
            className="mt-5 w-full"
            role="img"
            aria-label="Grafik batang tren KPI; angka lengkap tersedia pada tabel"
          >
            <line x1="45" x2="710" y1="185" y2="185" stroke="#3f3f46" />
            <text x="8" y="55" fill="#a1a1aa" fontSize="13">
              {high}
            </text>
            <text x="8" y="190" fill="#a1a1aa" fontSize="13">
              {low}
            </text>
            {points.map(({ report, metric }, index) => (
              <g key={report.id}>
                {metric?.value != null && (
                  <>
                    <rect
                      data-chart-bar="actual"
                      x={x(index) - 23}
                      y={y(metric.value)}
                      width="46"
                      height={Math.max(2, 185 - y(metric.value))}
                      rx="6"
                      fill={barColor(metric)}
                    />
                    {metric.target !== null && metric.period === "weekly" && (
                      <line
                        x1={x(index) - 27}
                        x2={x(index) + 27}
                        y1={y(metric.target)}
                        y2={y(metric.target)}
                        stroke="#fbbf24"
                        strokeWidth="3"
                      />
                    )}
                    <text
                      x={x(index)}
                      y={y(metric.value) - 12}
                      textAnchor="middle"
                      fill="#ddd6fe"
                      fontSize="13"
                    >
                      {metric.value}
                    </text>
                  </>
                )}
                <text
                  x={x(index)}
                  y="212"
                  textAnchor="middle"
                  fill="#a1a1aa"
                  fontSize="12"
                >
                  {report.week.slice(5)}
                </text>
              </g>
            ))}
          </svg>
        ) : (
          <p className="ops-empty mt-4">Belum ada angka untuk KPI ini.</p>
        )}
      </div>

      <div className={`${panel} overflow-x-auto`}>
        <table className="w-full min-w-[580px] text-left text-sm">
          <thead className="text-zinc-500">
            <tr>
              <th className="py-3 pr-4 font-medium">Minggu</th>
              <th className="py-3 pr-4 font-medium">Angka</th>
              <th className="py-3 pr-4 font-medium">Target</th>
              <th className="py-3 pr-4 font-medium">Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {[...points].reverse().map(({ report, metric }) => (
              <tr key={report.id} className="border-t border-zinc-800">
                <td className="py-4 pr-4">
                  {weekLabel(report.week)}
                  {report.demo && (
                    <span className="ml-2 text-xs text-amber-300">DEMO</span>
                  )}
                </td>
                <td className="py-4 pr-4">
                  {metric?.value ?? "—"} {metric?.unit}
                </td>
                <td className="py-4 pr-4">
                  {metric ? targetText(metric) : "—"}
                </td>
                <td className="py-4 pr-4">
                  {metric && <StatusBadge state={teamMetricState(metric)} />}
                </td>
                <td className="py-4 text-right">
                  <button
                    className="ops-button"
                    onClick={() => onOpen(report.id)}
                  >
                    Lihat
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
