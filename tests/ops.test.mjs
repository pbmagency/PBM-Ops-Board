import test from "node:test";
import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import { transform } from "esbuild";
import React from "react";
import { create, act } from "react-test-renderer";

const source = await readFile(
  new URL("../src/pbm_ops_mvp.jsx", import.meta.url),
  "utf8",
);
const transformed = await transform(
  source + "\nexport {getMonthMatrix, todayISO, PIC, STATUSES, defaultRecord};",
  { loader: "jsx", format: "esm", jsx: "automatic" },
);
await writeFile(new URL("./.compiled.mjs", import.meta.url), transformed.code);
const app = await import("./.compiled.mjs");
const {
  createSeed,
  saveRecord,
  deleteRecord,
  moveTaskRecord,
  deliveryClients,
  aggregateVariants,
  defaultRecord,
  canRole,
  migrateData,
} = app;
const makeStore = () => {
  const store = new Map();
  return {
    getItem: (k) => store.get(k) || null,
    setItem: (k, v) => store.set(k, v),
    removeItem: (k) => store.delete(k),
    clear: () => store.clear(),
  };
};
globalThis.localStorage = makeStore();
globalThis.sessionStorage = makeStore();
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
globalThis.document = { activeElement: { focus() {} } };
globalThis.requestAnimationFrame = (fn) => fn();

test("seed uses five roles and Gmail accounts; all records satisfy validation", () => {
  let d = createSeed();
  assert.equal(Object.keys(app.PIC).length, 5);
  assert.ok(d.users.every((u) => u.email.endsWith("@gmail.com")));
  assert.ok(d.tasks.every((t) => app.PIC[t.pic]));
  assert.ok(
    !/Beatrice|Arif|Justin|Gio|Haryanto|Tsania|@pbm\.local/i.test(
      JSON.stringify(d),
    ),
  );
  for (const kind of ["clients", "tasks", "cycles", "feedback", "users"])
    for (const r of d[kind]) d = saveRecord(d, kind, r);
});
test("client create and rename flow to derived delivery; delete cascades exactly related records", () => {
  let d = createSeed();
  d = saveRecord(d, "clients", {
    id: "new",
    name: "New client",
    contract: "Retainer",
    bottleneck: "",
  });
  d = saveRecord(d, "clients", { ...d.clients.at(-1), name: "Renamed client" });
  assert.equal(deliveryClients(d).at(-1).name, "Renamed client");
  const before = createSeed();
  const next = deleteRecord(before, "clients", "fullbright");
  for (const k of ["tasks", "cycles", "feedback"])
    assert.deepEqual(
      next[k],
      before[k].filter((r) => r.client !== "fullbright"),
    );
  assert.equal(before.clients.length, 5);
  assert.equal(next.clients.length, 4);
});
test("task create, edit, all eight status transitions, overdue and blocked health, delete", () => {
  let d = createSeed();
  d = saveRecord(d, "tasks", {
    ...defaultRecord("tasks", d),
    id: "task-test",
    client: "gorden",
    name: "Test task",
    due: "2000-01-01",
    blocked: true,
  });
  assert.equal(
    deliveryClients(d).find((c) => c.id === "gorden").health,
    "blocked",
  );
  for (const s of app.STATUSES) {
    d = moveTaskRecord(d, "task-test", s.id);
    assert.equal(d.tasks.at(-1).status, s.id);
  }
  d = saveRecord(d, "tasks", {
    ...d.tasks.at(-1),
    name: "Renamed task",
    due: "2030-03-14",
  });
  assert.equal(d.tasks.at(-1).name, "Renamed task");
  d = deleteRecord(d, "tasks", "task-test");
  assert.ok(!d.tasks.some((t) => t.id === "task-test"));
  assert.throws(() => moveTaskRecord(d, 1, "invalid"), /Status/);
});
test("cycle CRUD accepts multiple variants, derives traffic and weighted rates, prevents duplicates", () => {
  let d = createSeed();
  const c = {
    ...defaultRecord("cycles", d),
    id: "cycle-test",
    cycle: 7,
    periode: "September 2026",
    variants: [
      {
        id: "control",
        label: "Control",
        isControl: true,
        targetVisit: 100,
        realVisit: 100,
        bounceRate: 50,
        leadRate: 2,
        intentRate: 10,
      },
      {
        id: "a",
        label: "A",
        isControl: false,
        targetVisit: 300,
        realVisit: 300,
        bounceRate: 30,
        leadRate: 6,
        intentRate: 20,
      },
      {
        id: "b",
        label: "B",
        isControl: false,
        targetVisit: 200,
        realVisit: 200,
        bounceRate: 40,
        leadRate: 4,
        intentRate: 15,
      },
    ],
  };
  d = saveRecord(d, "cycles", c);
  assert.equal(d.cycles.at(-1).realVisit, 600);
  assert.equal(d.cycles.at(-1).leadRate, 4.67);
  assert.throws(
    () => saveRecord(d, "cycles", { ...c, id: "duplicate" }),
    /sudah ada/,
  );
  d = saveRecord(d, "cycles", {
    ...d.cycles.at(-1),
    hypothesis: "Updated hypothesis",
  });
  assert.equal(d.cycles.at(-1).hypothesis, "Updated hypothesis");
  const tasks = d.tasks.length;
  d = deleteRecord(d, "cycles", c.id);
  assert.equal(d.tasks.length, tasks);
  assert.ok(!d.cycles.some((x) => x.id === c.id));
});
test("cycle 0 is measured baseline with one variant; invalid and missing rates are rejected", () => {
  const d = createSeed(),
    c = d.cycles.find((c) => c.cycle === 0);
  assert.equal(c.variants.length, 1);
  assert.equal(c.status, "Baseline");
  assert.equal(c.realVisit, 1095);
  assert.equal(c.leadRate, 2.4);
  assert.throws(
    () => saveRecord(d, "cycles", { ...c, variants: [] }),
    /control/,
  );
  assert.throws(
    () =>
      saveRecord(d, "cycles", {
        ...c,
        variants: [{ ...c.variants[0], leadRate: null }],
      }),
    /baseline awal/,
  );
  const measured = d.cycles[0];
  assert.throws(
    () =>
      saveRecord(d, "cycles", {
        ...measured,
        variants: measured.variants.map((v) => ({ ...v, bounceRate: 101 })),
      }),
    /100/,
  );
  assert.equal(aggregateVariants([{ realVisit: null }]).leadRate, null);
  assert.equal(aggregateVariants([{ realVisit: 10, leadRate: 0 }]).leadRate, 0);
});
test("feedback CRUD preserves full details and follow-up", () => {
  let d = createSeed();
  const f = {
    ...defaultRecord("feedback", d),
    id: "feedback-test",
    topic: "Review",
    details: "Complete detail",
  };
  d = saveRecord(d, "feedback", f);
  assert.equal(d.feedback.at(-1).action, "");
  d = saveRecord(d, "feedback", {
    ...f,
    action: "Sudah dikerjakan",
    priority: 1,
  });
  assert.equal(d.feedback.at(-1).action, "Sudah dikerjakan");
  d = deleteRecord(d, "feedback", f.id);
  assert.ok(!d.feedback.some((r) => r.id === f.id));
});
test("users can change role; invalid Gmail, duplicate login, last COO are rejected", () => {
  let d = createSeed();
  d = saveRecord(d, "users", {
    id: "person",
    email: "Name@gmail.com",
    role: "creative",
    active: true,
  });
  d = saveRecord(d, "users", {
    ...d.users.at(-1),
    role: "digital-marketer",
  });
  assert.equal(d.users.at(-1).role, "digital-marketer");
  assert.equal(d.users.at(-1).email, "name@gmail.com");
  assert.throws(
    () => saveRecord(d, "users", { ...d.users.at(-1), id: "other" }),
    /sudah digunakan/,
  );
  assert.throws(
    () =>
      saveRecord(d, "users", { ...d.users.at(-1), email: "name@pbm.local" }),
    /gmail/,
  );
  assert.throws(() => deleteRecord(d, "users", "user-coo"), /COO/);
  assert.throws(
    () => saveRecord(d, "users", { ...d.users[0], active: false }),
    /COO/,
  );
  d = deleteRecord(d, "users", "person");
  assert.ok(!d.users.some((u) => u.id === "person"));
});
test("role permission matrix follows delivery responsibilities", () => {
  for (const tab of ["board", "hub", "kpi", "feedback", "clients", "users"])
    assert.equal(canRole("coo", "view", tab), true);
  for (const resource of ["clients", "tasks", "cycles", "feedback", "users"])
    for (const action of ["create", "update", "delete"])
      assert.equal(canRole("coo", action, resource), true);
  for (const tab of ["board", "hub", "kpi", "feedback", "clients"])
    assert.equal(canRole("project-manager", "view", tab), true);
  assert.equal(canRole("project-manager", "view", "users"), false);
  assert.equal(canRole("project-manager", "update", "users"), false);
  assert.equal(canRole("developer", "view", "board"), true);
  assert.equal(canRole("developer", "view", "feedback"), true);
  assert.equal(canRole("developer", "update-action", "feedback"), true);
  assert.equal(canRole("developer", "update", "tasks"), false);
  assert.equal(canRole("creative", "view", "feedback"), true);
  assert.equal(canRole("creative", "update-action", "feedback"), true);
  assert.equal(canRole("digital-marketer", "view", "kpi"), true);
  assert.equal(canRole("digital-marketer", "create", "cycles"), true);
  assert.equal(canRole("digital-marketer", "update", "cycles"), true);
  assert.equal(canRole("digital-marketer", "delete", "cycles"), true);
  assert.equal(canRole("digital-marketer", "update-action", "feedback"), true);
  assert.equal(canRole("digital-marketer", "view", "hub"), false);
});
test("version 5 browser data migrates roles, session identities and baseline seed", () => {
  const old = createSeed();
  old.version = 5;
  old.tasks[0].pic = "founder";
  old.users[0] = {
    id: "user-founder",
    email: "founder@gmail.com",
    role: "founder",
    active: true,
  };
  old.users[3] = {
    id: "user-strategist",
    email: "strategist@gmail.com",
    role: "strategist",
    active: true,
  };
  const next = migrateData(old);
  assert.equal(next.version, 6);
  assert.equal(next.tasks[0].pic, "coo");
  assert.ok(next.users.some((u) => u.id === "user-coo" && u.role === "coo"));
  assert.ok(
    next.users.some(
      (u) => u.id === "user-digital-marketer" && u.role === "digital-marketer",
    ),
  );
  assert.equal(next.cycles.find((c) => c.id === "gw-0").realVisit, 1095);
});
test("calendar supports leap year and correct weekday alignment", () => {
  const feb = app.getMonthMatrix(2028, 1).flat();
  assert.equal(feb.filter(Boolean).length, 29);
  const sep = app.getMonthMatrix(2026, 8).flat();
  assert.equal(sep[0], null);
  assert.equal(sep[1], 1);
  assert.equal(sep.filter(Boolean).length, 30);
});

const textOf = (n) =>
  typeof n === "string" ? n : (n?.children || []).map(textOf).join("");
function byText(root, type, text) {
  return root.findAllByType(type).find((n) => textOf(n) === text);
}
const mockNode = () => ({
  showModal() {},
  close() {},
  focus() {},
  scrollIntoView() {},
  getBoundingClientRect() {
    return { width: 900, height: 600 };
  },
});
test("UI flows: login, create/rename client, create/update/delete task, every tab, persistence and calendar", async () => {
  localStorage.clear();
  sessionStorage.clear();
  let renderer;
  await act(async () => {
    renderer = create(React.createElement(app.default), {
      createNodeMock: mockNode,
    });
  });
  assert.ok(byText(renderer.root, "h1", "Masuk ke PBM Ops"));
  await act(async () =>
    renderer.root.findByType("form").props.onSubmit({ preventDefault() {} }),
  );
  assert.ok(byText(renderer.root, "h1", "Semua task, per client, per tahap"));
  async function click(text) {
    const b = byText(renderer.root, "button", text);
    assert.ok(b, `button ${text}`);
    await act(async () => b.props.onClick({ stopPropagation() {} }));
  }
  async function fill(label, value) {
    const l = renderer.root
      .findAllByType("label")
      .find((n) => textOf(n).startsWith(label));
    assert.ok(l, label);
    const input = l.findAll((n) =>
      ["input", "select", "textarea"].includes(n.type),
    )[0];
    await act(async () => input.props.onChange({ target: { value } }));
  }
  async function submit() {
    await act(async () =>
      renderer.root.findByType("form").props.onSubmit({ preventDefault() {} }),
    );
  }
  await click("Clients");
  await click("+ Tambah client");
  await fill("Nama client", "Client integrasi");
  await submit();
  let stored = JSON.parse(localStorage.getItem("pbm-ops-v5"));
  const client = stored.clients.at(-1);
  assert.equal(client.name, "Client integrasi");
  await click("KPI Dashboard");
  assert.ok(byText(renderer.root, "button", "+ Cycle"));
  await click("Execution Board");
  await click("+ Tambah task");
  await fill("Judul task", "Task integrasi");
  await fill("Client", client.id);
  await fill("Deadline", "2026-09-15");
  await submit();
  stored = JSON.parse(localStorage.getItem("pbm-ops-v5"));
  assert.equal(stored.tasks.at(-1).name, "Task integrasi");
  const card = renderer.root
    .findAllByType("button")
    .find((n) => n.props.draggable && textOf(n).includes("Task integrasi"));
  assert.ok(card);
  await act(async () => card.props.onClick());
  await fill("Status task", "done");
  assert.equal(
    JSON.parse(localStorage.getItem("pbm-ops-v5")).tasks.at(-1).status,
    "done",
  );
  await click("Tutup dialog").catch(async () => {
    const b = renderer.root
      .findAllByType("button")
      .find((n) => n.props["aria-label"] === "Tutup dialog");
    await act(async () => b.props.onClick());
  });
  for (const tab of [
    "Operations Hub",
    "KPI Dashboard",
    "Feedback Loop",
    "Users & Roles",
    "Execution Board",
  ])
    await click(tab);
  await click("Calendar");
  const month = renderer.root
    .findAllByType("select")
    .find((n) => n.props["aria-label"] === "Bulan kalender");
  await act(async () => month.props.onChange({ target: { value: "2026-09" } }));
  assert.ok(
    renderer.root
      .findAllByType("button")
      .some((n) => textOf(n).includes("Task integrasi")),
  );
  await act(async () => renderer.unmount());
  await act(async () => {
    renderer = create(React.createElement(app.default), {
      createNodeMock: mockNode,
    });
  });
  assert.ok(
    renderer.root
      .findAllByType("button")
      .some((n) => textOf(n).includes("Task integrasi")),
  );
  await act(async () => renderer.unmount());
});
test("all tabs render with no clients, cycles, tasks or feedback", async () => {
  const d = createSeed();
  for (const k of ["clients", "tasks", "cycles", "feedback"]) d[k] = [];
  localStorage.setItem("pbm-ops-v5", JSON.stringify(d));
  sessionStorage.setItem("pbm-ops-v5-session", "user-coo");
  let r;
  await act(async () => {
    r = create(React.createElement(app.default), { createNodeMock: mockNode });
  });
  for (const tab of [
    "Operations Hub",
    "KPI Dashboard",
    "Feedback Loop",
    "Clients",
    "Users & Roles",
    "Execution Board",
  ]) {
    const b = byText(r.root, "button", tab);
    await act(async () => b.props.onClick());
  }
  await act(async () => r.unmount());
});
test("execution board compacts a two-task cell and distinguishes urgent cards", async () => {
  localStorage.clear();
  sessionStorage.clear();
  const data = createSeed();
  data.tasks = data.tasks.slice(0, 2).map((task, index) => ({
    ...task,
    client: "fullbright",
    status: "qa",
    priority: index === 0 ? "urgent" : "normal",
  }));
  localStorage.setItem("pbm-ops-v5", JSON.stringify(data));
  sessionStorage.setItem("pbm-ops-v5-session", "user-coo");
  let renderer;
  await act(async () => {
    renderer = create(React.createElement(app.default), {
      createNodeMock: mockNode,
    });
  });
  const taskCards = renderer.root
    .findAllByType("button")
    .filter((node) => node.props["data-card-size"]);
  assert.equal(taskCards.length, 2);
  assert.ok(
    taskCards.every((node) => node.props["data-card-size"] === "compact"),
  );
  const urgent = taskCards.find(
    (node) => node.props["data-urgency"] === "urgent",
  );
  const normal = taskCards.find(
    (node) => node.props["data-urgency"] === "normal",
  );
  assert.ok(urgent.props.className.includes("border-rose-500/60"));
  assert.ok(textOf(urgent).includes("Urgent"));
  assert.ok(normal.props.className.includes("border-zinc-800"));
  await act(async () => renderer.unmount());
});
test("role-specific navigation and controls are enforced in the UI", async () => {
  async function renderRole(role) {
    localStorage.clear();
    sessionStorage.clear();
    const data = createSeed();
    localStorage.setItem("pbm-ops-v5", JSON.stringify(data));
    sessionStorage.setItem("pbm-ops-v5-session", `user-${role}`);
    let renderer;
    await act(async () => {
      renderer = create(React.createElement(app.default), {
        createNodeMock: mockNode,
      });
    });
    return renderer;
  }

  let r = await renderRole("developer");
  assert.ok(byText(r.root, "button", "Execution Board"));
  assert.ok(byText(r.root, "button", "Feedback Loop"));
  assert.equal(byText(r.root, "button", "Operations Hub"), undefined);
  assert.equal(byText(r.root, "button", "+ Tambah task"), undefined);
  assert.ok(
    r.root.findAllByType("button").filter((n) => n.props.draggable).length ===
      0,
  );
  await act(async () =>
    byText(r.root, "button", "Feedback Loop").props.onClick(),
  );
  assert.ok(byText(r.root, "button", "Edit tindak lanjut"));
  assert.equal(byText(r.root, "button", "+ Tambah feedback"), undefined);
  await act(async () => r.unmount());

  r = await renderRole("creative");
  await act(async () =>
    byText(r.root, "button", "Feedback Loop").props.onClick(),
  );
  assert.ok(byText(r.root, "button", "Edit tindak lanjut"));
  assert.equal(byText(r.root, "button", "+ Tambah feedback"), undefined);
  await act(async () => r.unmount());

  r = await renderRole("digital-marketer");
  assert.ok(byText(r.root, "button", "KPI Dashboard"));
  assert.equal(byText(r.root, "button", "Operations Hub"), undefined);
  await act(async () =>
    byText(r.root, "button", "KPI Dashboard").props.onClick(),
  );
  assert.ok(byText(r.root, "button", "+ Tambah cycle KPI"));
  await act(async () =>
    byText(r.root, "button", "Feedback Loop").props.onClick(),
  );
  assert.ok(byText(r.root, "button", "Edit tindak lanjut"));
  await act(async () => r.unmount());

  r = await renderRole("project-manager");
  for (const tab of [
    "Execution Board",
    "Operations Hub",
    "KPI Dashboard",
    "Feedback Loop",
    "Clients",
  ])
    assert.ok(byText(r.root, "button", tab), tab);
  assert.equal(byText(r.root, "button", "Users & Roles"), undefined);
  assert.ok(byText(r.root, "button", "+ Tambah task"));
  await act(async () => r.unmount());
});
test("WebMCP permission read and feedback action use the same authorized store", async () => {
  localStorage.clear();
  sessionStorage.clear();
  const data = createSeed();
  localStorage.setItem("pbm-ops-v5", JSON.stringify(data));
  sessionStorage.setItem("pbm-ops-v5-session", "user-developer");
  const registered = [];
  document.modelContext = {
    registerTool(tool) {
      registered.push(tool);
    },
  };
  let renderer;
  await act(async () => {
    renderer = create(React.createElement(app.default), {
      createNodeMock: mockNode,
    });
  });
  const access = registered.find(
    (tool) => tool.name === "read_current_role_permissions",
  );
  const update = registered.find(
    (tool) => tool.name === "update_feedback_action",
  );
  assert.equal(access.execute().role, "Developer");
  assert.deepEqual(access.execute().visibleTabs, [
    "Execution Board",
    "Feedback Loop",
  ]);
  assert.equal(access.execute().canManageKpi, false);
  assert.ok(update);
  const feedbackId = data.feedback[0].id;
  await act(async () =>
    update.execute({ feedbackId, action: "Ditindaklanjuti developer" }),
  );
  assert.equal(
    JSON.parse(localStorage.getItem("pbm-ops-v5")).feedback[0].action,
    "Ditindaklanjuti developer",
  );
  assert.throws(() => update.execute({ feedbackId: 7, action: "x" }), /teks/);
  await act(async () => renderer.unmount());
  delete document.modelContext;
});
