/* E-Systems Design System — panel client
   No framework, no build step at runtime. Bundled by tools/build-wizard.js. */
"use strict";

var I18N = /* @I18N@ */ {};
var LANG = localStorage.getItem("dsLang") || "id";
var S = null;          /* latest /api/state */
var OV = null;         /* latest /api/overview */
var UPD = null;        /* latest update check */
var PAGE = "home";

/* ------------------------------------------------------------- helpers */
function $(id) { return document.getElementById(id); }
function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
function esc(s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
function t(k, vars) {
  var d = I18N[LANG] || I18N.id, s = d[k] != null ? d[k] : (I18N.id[k] != null ? I18N.id[k] : k);
  if (vars) for (var v in vars) s = s.split("{" + v + "}").join(vars[v]);
  return s;
}
/* server-side strings arrive as {id,en} pairs */
function tx(v) { return v && typeof v === "object" ? (v[LANG] || v.id || v.en || "") : (v || ""); }
function icon(name, cls) { return '<svg class="ic ' + (cls || "") + '"><use href="#i-' + name + '"/></svg>'; }
function fmtDate(iso) { try { return new Date(iso).toLocaleString(LANG === "id" ? "id-ID" : "en-GB", { dateStyle: "medium", timeStyle: "short" }); } catch (e) { return iso; } }

function api(path, data) {
  var opt = data === undefined ? {} : { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) };
  return fetch(path, opt).then(function (r) { return r.json(); }).catch(function () { return { error: t("err.generic") }; });
}

function toast(msg, bad) {
  var e = el("div", "toast" + (bad ? " bad" : ""), icon(bad ? "circle-x" : "circle-check") + "<span>" + esc(msg) + "</span>");
  $("toasts").appendChild(e);
  setTimeout(function () { e.remove(); }, 2600);
}

function copy(text, okMsg) {
  function done() { toast(okMsg || t("act.copied")); }
  if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, fallback);
  else fallback();
  function fallback() {
    var ta = document.createElement("textarea"); ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
    document.body.appendChild(ta); ta.select();
    try { document.execCommand("copy"); } catch (e) {}
    ta.remove(); done();
  }
}

/* ------------------------------------------------------------ language */
function applyI18n() {
  document.documentElement.lang = LANG;
  var nodes = document.querySelectorAll("[data-i18n]");
  for (var i = 0; i < nodes.length; i++) nodes[i].textContent = t(nodes[i].getAttribute("data-i18n"));
  var btns = document.querySelectorAll(".langsw button");
  for (var j = 0; j < btns.length; j++) btns[j].classList.toggle("sel", btns[j].getAttribute("data-lang") === LANG);
}
function setLang(l) { LANG = l; localStorage.setItem("dsLang", l); applyI18n(); render(); }

/* ---------------------------------------------------------------- nav */
function go(page) {
  PAGE = page;
  var secs = document.querySelectorAll("section[data-page]");
  for (var i = 0; i < secs.length; i++) secs[i].hidden = secs[i].getAttribute("data-page") !== page;
  var nb = document.querySelectorAll(".navb");
  for (var j = 0; j < nb.length; j++) nb[j].classList.toggle("sel", nb[j].getAttribute("data-nav") === page);
  window.scrollTo(0, 0);
  if (page === "health") renderHealth();
  if (page === "versions") renderVersions();
  if (page === "docs") renderDocs();
}

/* -------------------------------------------------------------- modal */
var mOnClose = null;
function modal(opts) {
  $("mTitle").textContent = opts.title || "";
  $("mDesc").textContent = opts.desc || "";
  $("mBody").innerHTML = opts.body || "";
  $("modal").classList.toggle("wide", !!opts.wide);
  var f = $("mFoot"); f.innerHTML = "";
  (opts.buttons || []).forEach(function (b) {
    var btn = el("button", "btn " + (b.kind || ""), (b.icon ? icon(b.icon) : "") + "<span>" + esc(b.label) + "</span>");
    btn.onclick = function () { if (b.keepOpen !== true) closeModal(); if (b.onClick) b.onClick(); };
    f.appendChild(btn);
  });
  $("scrim").classList.add("on");
  mOnClose = opts.onClose || null;
  if (opts.after) opts.after();
  var first = $("mFoot").querySelector("button.primary") || $("mFoot").querySelector("button");
  if (first) first.focus();
}
function closeModal() { $("scrim").classList.remove("on"); if (mOnClose) { var f = mOnClose; mOnClose = null; f(); } }

/* ----------------------------------------------------------- progress */
function withProgress(progId, promise) {
  var box = $(progId); if (!box) return promise;
  var fill = box.querySelector(".fill"), lbl = box.querySelector(".lbl");
  box.style.display = "block"; fill.style.width = "4%"; lbl.textContent = "…";
  var timer = setInterval(function () {
    fetch("/api/progress").then(function (r) { return r.json(); }).then(function (p) {
      if (p.active && p.total) {
        fill.style.width = Math.max(6, Math.round(p.current / p.total * 100)) + "%";
        lbl.textContent = t("log.step") + " " + p.current + " " + t("log.of") + " " + p.total + " — " + tx(p.label);
      }
    }).catch(function () {});
  }, 220);
  return promise.then(function (r) {
    clearInterval(timer); fill.style.width = "100%";
    setTimeout(function () { box.style.display = "none"; fill.style.width = "0"; }, 700);
    return r;
  }, function (e) { clearInterval(timer); box.style.display = "none"; throw e; });
}

function renderLog(node, res) {
  var h = "";
  (res.log || []).forEach(function (l) {
    var cls = l.ok ? "ok" : (l.manual ? "mn" : "no");
    var ic = l.ok ? "circle-check" : (l.manual ? "circle-alert" : "circle-x");
    h += '<div class="l ' + cls + '">' + icon(ic) + "<span>" + esc(tx(l.title)) + "</span></div>";
    if (l.output && l.output !== "done") h += '<div class="out">' + esc(l.output) + "</div>";
  });
  if (res.before && res.after) h += '<div class="out">' + esc(res.before) + " \u2192 " + esc(res.after) + "</div>";
  h += '<div class="l ' + (res.ok ? "ok" : "no") + '">' + icon(res.ok ? "circle-check" : "circle-x") +
       "<b>" + esc(res.ok ? t("log.done") : t("log.stopped")) + "</b></div>";
  node.innerHTML = h;
}

/* ==================================================== plan + execution */
function showPlan(opts) {
  var plan = opts.plan;
  var h = '<div class="steps">';
  (plan.steps || []).forEach(function (s, i) {
    var cls = s.skip ? "skip" : (s.manual ? "manual" : "");
    h += '<div class="s ' + cls + '"><span class="n">' + (i + 1) + "</span><span>" + esc(tx(s.title));
    if (s.cmd) h += "<br><code>" + esc(String(s.cmd).split(" & ")[0]) + "</code>";
    if (s.commitMsg) h += '<br><code>git commit -m "' + esc(s.commitMsg) + '"</code>';
    if (s.write || s.append) h += "<br><code>" + esc(s.write || s.append) + "</code>";
    if (s.preview) h += "<br><code>" + esc(s.preview) + "</code>";
    h += "</span>";
    if (s.write || s.append || s.preview) h += '<span class="peek"><button class="btn ghost" data-peek="' + esc(s.write || s.append || "") + '" data-line="' + esc(s.preview || "") + '">' + icon("eye") + "</button></span>";
    h += "</div>";
  });
  h += "</div>";
  if (plan.notTouched && plan.notTouched.length) {
    h += '<div class="nt keep"><b>' + icon("shield-check") + esc(t("plan.notTouched")) + "</b><ul>" +
         plan.notTouched.map(function (x) { return "<li>" + esc(tx(x)) + "</li>"; }).join("") + "</ul></div>";
  }
  if (plan.remains && plan.remains.length) {
    h += '<div class="nt rest"><b>' + icon("info") + esc(t("plan.remains")) + "</b><ul>" +
         plan.remains.map(function (x) { return "<li>" + esc(tx(x)) + "</li>"; }).join("") + "</ul></div>";
  }
  modal({
    title: opts.title || t("plan.title"),
    desc: opts.desc || t("plan.lead"),
    body: h, wide: true,
    buttons: [
      { label: t("act.cancel"), kind: "ghost" },
      { label: opts.confirmLabel || t("act.confirm"), kind: "primary", icon: "play", onClick: opts.onConfirm },
    ],
    after: function () {
      var peeks = $("mBody").querySelectorAll("[data-peek]");
      for (var i = 0; i < peeks.length; i++) {
        peeks[i].onclick = function () {
          var f = this.getAttribute("data-peek"), line = this.getAttribute("data-line");
          if (!f) { modal({ title: t("plan.preview"), body: '<pre class="block">' + esc(line) + "</pre>", buttons: [{ label: t("act.close"), kind: "ghost" }] }); return; }
          api("/api/payload", { file: f }).then(function (r) {
            modal({
              title: f, desc: t("plan.preview"), wide: true,
              body: '<pre class="block">' + esc(r.content || r.error || "") + "</pre>",
              buttons: [{ label: t("act.copy"), icon: "copy", keepOpen: true, onClick: function () { copy(r.content || ""); } }, { label: t("act.close"), kind: "ghost" }],
            });
          });
        };
      }
    },
  });
}

/* ============================================================ HOME page */
function attnItems() {
  var out = [];
  if (!S) return out;
  if (S.legacy && S.legacy.found) out.push({ k: "d", ic: "triangle-alert", title: t("attn.legacy.title"), desc: t("attn.legacy.body") + " (" + S.legacy.items.length + ")", acts: [{ label: t("act.clean"), go: "setup" }] });
  if (S.unmanaged) out.push({ k: "w", ic: "file-text", title: t("attn.unmanaged.title"), desc: t("attn.unmanaged.body"), acts: [{ label: t("act.adopt"), fn: doAdopt, primary: true }] });
  (S.drift || []).filter(function (d) { return d.klass === "contract"; }).forEach(function (d) {
    out.push({ k: "w", ic: "file-diff", title: d.path + " — " + t("attn.drift.title"), desc: t("attn.drift.contract"),
      acts: [{ label: t("act.viewDiff"), fn: function () { showDiff(d.path); } }, { label: t("act.restore"), fn: function () { doRestore(d.path); } }, { label: t("act.sendDesigner"), fn: function () { changeRequest(d.path); } }] });
  });
  if (S.halfWired) out.push({ k: "w", ic: "circle-alert", title: t("attn.halfwired.title"), desc: t("attn.halfwired.body"), acts: [{ label: t("act.fix"), go: "setup" }] });
  if (UPD && UPD.behind > 0) out.push({ k: "i", ic: "arrow-up-circle", title: t("attn.update.title") + " — " + UPD.behind + " " + t("attn.update.body"), desc: "", acts: [{ label: t("act.reviewImpact"), go: "versions", primary: true }] });
  if (S.panelOutdated) out.push({ k: "i", ic: "refresh-cw", title: t("attn.selfupdate.title"), desc: t("attn.selfupdate.body") + " (" + S.panelLatest + ")", acts: [{ label: t("act.updatePanel"), fn: doSelfUpdate }] });
  (S.drift || []).filter(function (d) { return d.klass === "living"; }).forEach(function (d) {
    out.push({ k: "i", ic: "git-branch", title: d.path, desc: t("attn.drift.living"),
      acts: [{ label: t("act.sendDesigner"), fn: function () { changeRequest(d.path); }, primary: true }, { label: t("act.viewDiff"), fn: function () { showDiff(d.path); } }, { label: t("act.restore"), fn: function () { doRestore(d.path); } }] });
  });
  if (S.dirty && S.level === "not-installed") out.push({ k: "i", ic: "circle-alert", title: t("attn.dirty.title"), desc: t("attn.dirty.body"), acts: [] });
  return out;
}

function renderHome() {
  /* status line */
  var sl = $("statusline"); sl.innerHTML = "";
  if (!S) return;
  if (S.level === "not-installed") sl.appendChild(el("span", "pill", esc(t("status.notInstalled"))));
  else {
    sl.appendChild(el("span", "pill ok", icon("circle-check") + esc(t("status.installed"))));
    sl.appendChild(el("span", "pill acc", esc(t("status.level") + " " + S.level)));
    if (OV && OV.version) sl.appendChild(el("span", "pill mono", "v" + esc(OV.version)));
    if (S.subCommit) sl.appendChild(el("span", "pill mono", esc(S.subCommit)));
  }

  var items = attnItems();

  /* verdict */
  var v = $("verdict");
  if (S.level === "not-installed") v.innerHTML = "";
  else if (!items.length) v.innerHTML = '<div class="verdict ok">' + icon("circle-check") + "<span>" + esc(t("status.healthy")) + "</span></div>";
  else v.innerHTML = '<div class="verdict warn">' + icon("triangle-alert") + "<span>" + items.length + " " + esc(items.length === 1 ? t("status.attention.one") : t("status.attention")) + "</span></div>";

  /* attention cards — rendered ONLY when true */
  var a = $("attn");
  if (!items.length) { a.style.display = "none"; a.innerHTML = ""; }
  else {
    a.style.display = "block"; a.innerHTML = "";
    items.forEach(function (it) {
      var row = el("div", "row " + it.k);
      var acts = it.acts.map(function (x, i) { return '<button class="btn ' + (x.primary ? "primary" : "") + '" data-a="' + i + '">' + esc(x.label) + "</button>"; }).join("");
      row.innerHTML = icon(it.ic) + '<div style="flex:1"><div class="t">' + esc(it.title) + "</div>" +
        (it.desc ? '<div class="d2">' + esc(it.desc) + "</div>" : "") +
        (acts ? '<div class="acts">' + acts + "</div>" : "") + "</div>";
      var bs = row.querySelectorAll("[data-a]");
      for (var i = 0; i < bs.length; i++) (function (b, spec) {
        b.onclick = function () { if (spec.go) go(spec.go); else if (spec.fn) spec.fn(); };
      })(bs[i], it.acts[+bs[i].getAttribute("data-a")]);
      a.appendChild(row);
    });
  }

  /* nav dots */
  var flags = { setup: !!(S.legacy && S.legacy.found) || S.level === "not-installed", health: (S.drift || []).length > 0 || S.unmanaged, versions: !!(UPD && UPD.behind > 0) };
  ["setup", "health", "versions"].forEach(function (n) {
    var b = document.querySelector('.navb[data-nav="' + n + '"]');
    if (b) b.classList.toggle("flag", !!flags[n]);
  });

  /* body */
  var b = $("homeBody");
  if (S.level === "not-installed") {
    b.innerHTML = '<div class="card"><div class="body"><p class="hint">' + esc(t("home.notInstalled.body")) +
      '</p><div class="actions"><button class="btn primary" id="goSetup">' + icon("download") + "<span>" + esc(t("home.notInstalled.cta")) + "</span></button></div></div></div>";
    $("goSetup").onclick = function () { go("setup"); };
    return;
  }

  var o = OV || {};
  var h = '<div class="card"><div class="body"><h2>' + esc(t("home.stack.title")) + "</h2><dl class=\"props\">";
  function row(k, val) { if (val == null || val === "") return; h += "<dt>" + esc(k) + "</dt><dd>" + val + "</dd>"; }
  row(t("home.stack.tokens"), o.tokenCount);
  row(t("home.stack.specs"), o.specs != null ? o.specs + (o.pages != null ? ' <span style="color:var(--faint)">(' + (o.specs - o.pages) + " + " + o.pages + " pages)</span>" : "") : null);
  row(t("home.stack.reference"), o.reference);
  row(t("home.stack.catalog"), o.catalog);
  row(t("home.stack.typeface"), o.typeface ? esc(o.typeface) : null);
  row(t("home.stack.icons"), o.icons ? esc(o.icons) : null);
  row(t("home.stack.commit"), o.commit ? '<span class="mono">' + esc(o.commit) + "</span>" : null);
  h += '</dl><div class="note">' + icon("info") + " " + esc(t("home.stack.note")) + "</div></div></div>";

  /* managed files — collapsed */
  var man = (S.manifest && S.manifest.managed) || [];
  if (man.length) {
    h += '<details class="fold card"><summary>' + icon("file-text", "chev") + "<span>" + esc(t("home.managed")) +
      '</span><span class="count">' + man.length + '</span></summary><div class="body">' + managedTable(man) + "</div></details>";
  }
  if (o.changelogHead) {
    h += '<details class="fold card"><summary>' + icon("history", "chev") + "<span>" + esc(t("home.whatsnew")) + " v" + esc(o.version || "") +
      '</span></summary><div class="body"><pre class="block">' + esc(o.changelogHead) + "</pre></div></details>";
  }
  b.innerHTML = h;
}

function managedTable(man) {
  var rows = man.map(function (m) {
    var d = (S.drift || []).filter(function (x) { return x.path === m.path; })[0];
    var st = d ? '<span class="pill warn">' + esc(d.state) + "</span>" : '<span class="pill ok">ok</span>';
    return "<tr><td class=\"mono\">" + esc(m.path) + "</td><td>" + esc(m.mode) + "</td><td>" + st + "</td></tr>";
  }).join("");
  return '<div class="tablewrap"><table class="dt"><thead><tr><th>file</th><th>mode</th><th>state</th></tr></thead><tbody>' + rows + "</tbody></table></div>";
}

/* ========================================================== HEALTH page */
function renderHealth() {
  var b = $("healthBody");
  if (!S || S.level === "not-installed") { b.innerHTML = '<div class="empty">' + icon("info") + esc(t("docs.locked")) + "</div>"; return; }

  var drift = S.drift || [];
  var h = "";

  /* doctor */
  h += '<div class="card"><div class="body"><h2>' + esc(t("health.doctor")) + '</h2><p class="hint">' + esc(t("health.doctor.hint")) +
    '</p><div class="actions"><button class="btn" id="btnDoctor">' + icon("heart-pulse") + "<span>" + esc(t("health.doctor.run")) + "</span></button></div>" +
    '<div id="doctorOut"></div></div></div>';

  /* drift */
  h += '<div class="card"><div class="body"><h2>' + esc(t("health.drift")) + "</h2>";
  if (!drift.length) h += '<div class="empty">' + icon("circle-check") + esc(t("health.drift.none")) + "</div>";
  else {
    h += '<div class="tablewrap"><table class="dt"><thead><tr><th>file</th><th>state</th><th></th></tr></thead><tbody>';
    drift.forEach(function (d) {
      h += '<tr><td class="mono">' + esc(d.path) + '</td><td><span class="pill ' + (d.klass === "contract" ? "warn" : "acc") + '">' + esc(d.state) + "</span></td>" +
        '<td style="text-align:right;white-space:nowrap">' +
        '<button class="btn ghost" data-diff="' + esc(d.path) + '">' + icon("file-diff") + "</button> " +
        '<button class="btn ghost" data-cr="' + esc(d.path) + '">' + icon("mail") + "</button> " +
        '<button class="btn ghost" data-res="' + esc(d.path) + '">' + icon("rotate-ccw") + "</button></td></tr>";
    });
    h += "</tbody></table></div>";
  }
  h += "</div></div>";

  /* receipt */
  var man = (S.manifest && S.manifest.managed) || [];
  h += '<details class="fold card"><summary>' + icon("shield-check", "chev") + "<span>" + esc(t("health.receipt")) +
    '</span><span class="count">' + man.length + '</span></summary><div class="body"><p class="hint">' + esc(t("health.receipt.hint")) + "</p>" +
    (man.length ? managedTable(man) : '<div class="empty">' + icon("info") + "—</div>") +
    '<div class="actions"><button class="btn ghost" id="btnExportReceipt">' + icon("copy") + "<span>" + esc(t("act.export")) + "</span></button></div></div></details>";

  /* adoption log */
  var hist = (S.history || []);
  h += '<details class="fold card"><summary>' + icon("activity", "chev") + "<span>" + esc(t("health.adoption")) +
    '</span><span class="count">' + hist.length + '</span></summary><div class="body" id="histBox"></div></details>';

  /* repo url */
  h += '<details class="fold card"><summary>' + icon("git-branch", "chev") + "<span>" + esc(t("health.repo")) + '</span></summary><div class="body">' +
    '<p class="hint">' + esc(t("health.repo.hint")) + "</p>" +
    '<label class="field"><span>URL</span><input type="text" id="newRepoUrl" spellcheck="false" value="' + esc(S.originUrl || "") + '"></label>' +
    '<div class="actions"><button class="btn" id="btnMoveRemote">' + icon("git-branch") + "<span>" + esc(t("health.repo.action")) + "</span></button></div></div></details>";

  /* uninstall */
  h += '<div class="card"><div class="body"><h2>' + esc(t("health.uninstall")) + '</h2><p class="hint">' + esc(t("health.uninstall.hint")) +
    '</p><div class="actions"><button class="btn danger" id="btnRevert">' + icon("trash-2") + "<span>" + esc(t("health.uninstall")) + "</span></button></div>" +
    '<div class="prog" id="maintProg"><div class="bar"><div class="fill"></div></div><div class="lbl"></div></div><div class="log" id="maintLog"></div></div></div>';

  b.innerHTML = h;

  $("btnDoctor").onclick = function () {
    var o = $("doctorOut"); o.innerHTML = '<div class="empty">' + icon("loader") + "…</div>";
    api("/api/doctor", {}).then(function (d) {
      o.innerHTML = '<pre class="block" style="margin-top:10px">' + esc(d.output || "") + "</pre>";
    });
  };
  $("btnExportReceipt").onclick = function () { copy(JSON.stringify(S.manifest || {}, null, 2)); };
  $("btnMoveRemote").onclick = function () {
    var url = $("newRepoUrl").value.trim(); if (!url) return;
    api("/api/remote-plan", { url: url }).then(function (plan) {
      if (plan.error) return toast(tx(plan.error), true);
      showPlan({ plan: plan, onConfirm: function () {
        withProgress("maintProg", api("/api/remote-apply", { url: url })).then(function (r) {
          if (r.error) return toast(tx(r.error), true);
          renderLog($("maintLog"), r); refresh();
        });
      } });
    });
  };
  $("btnRevert").onclick = function () {
    api("/api/revert-plan", { commit: false }).then(function (plan) {
      if (plan.error) return toast(tx(plan.error), true);
      showPlan({ plan: plan, title: t("health.uninstall"), confirmLabel: t("act.confirm"), onConfirm: function () {
        withProgress("maintProg", api("/api/revert", { commit: false })).then(function (r) {
          if (r.error) return toast(tx(r.error), true);
          renderLog($("maintLog"), r); refresh();
        });
      } });
    });
  };
  bindRowActions(b);
  paginate($("histBox"), hist.map(function (x) {
    return "<tr><td>" + esc(fmtDate(x.at)) + '</td><td><span class="pill">' + esc(x.event) + "</span></td><td>" + esc(x.level != null ? "L" + x.level : "") +
      '</td><td class="mono">' + esc(x.dsCommit || "") + "</td></tr>";
  }), ["when", "event", "level", "commit"]);
}

function bindRowActions(scope) {
  ["diff", "cr", "res"].forEach(function (kind) {
    var bs = scope.querySelectorAll("[data-" + kind + "]");
    for (var i = 0; i < bs.length; i++) (function (btn) {
      var p = btn.getAttribute("data-" + kind);
      btn.onclick = function () { if (kind === "diff") showDiff(p); else if (kind === "cr") changeRequest(p); else doRestore(p); };
    })(bs[i]);
  });
}

/* ------------------------------------------------------------ paginate */
function paginate(node, rowsHtml, headers, perDefault) {
  if (!node) return;
  var per = perDefault || 10, page = 0;
  function draw() {
    if (!rowsHtml.length) { node.innerHTML = '<div class="empty">' + icon("info") + "—</div>"; return; }
    var pages = Math.max(1, Math.ceil(rowsHtml.length / per));
    if (page >= pages) page = pages - 1;
    var slice = rowsHtml.slice(page * per, page * per + per).join("");
    var pager = "";
    for (var i = 0; i < pages; i++) pager += '<button class="' + (i === page ? "sel" : "") + '" data-p="' + i + '">' + (i + 1) + "</button>";
    node.innerHTML = '<div class="tablewrap"><table class="dt"><thead><tr>' +
      headers.map(function (x) { return "<th>" + esc(x) + "</th>"; }).join("") + "</tr></thead><tbody>" + slice + "</tbody></table>" +
      '<div class="tablefoot"><span>' + rowsHtml.length + ' rows</span><span class="spacer"></span>' +
      '<select class="perpage"><option>10</option><option>25</option><option>50</option></select>' +
      (pages > 1 ? '<div class="pager">' + pager + "</div>" : "") + "</div></div>";
    node.querySelector(".perpage").value = String(per);
    node.querySelector(".perpage").onchange = function () { per = Math.min(50, +this.value || 10); page = 0; draw(); };
    var pb = node.querySelectorAll(".pager button");
    for (var j = 0; j < pb.length; j++) pb[j].onclick = function () { page = +this.getAttribute("data-p"); draw(); };
  }
  draw();
}

/* ======================================================== VERSIONS page */
function renderVersions() {
  var b = $("versBody");
  if (!S || S.level === "not-installed") { b.innerHTML = '<div class="empty">' + icon("info") + esc(t("docs.locked")) + "</div>"; return; }
  var o = OV || {};
  var h = '<div class="card"><div class="body"><h2>' + esc(t("ver.current")) + '</h2><dl class="props">' +
    "<dt>version</dt><dd>v" + esc(o.version || "—") + "</dd>" +
    '<dt>commit</dt><dd class="mono">' + esc(o.commit || "—") + "</dd></dl>" +
    '<div class="actions"><button class="btn" id="btnCheck">' + icon("refresh-cw") + "<span>" + esc(t("ver.check")) + "</span></button></div>" +
    '<div id="updBox"></div></div></div>';

  var rb = S.rollback;
  h += '<div class="card"><div class="body"><h2>' + esc(t("ver.rollback")) + '</h2><p class="hint">' + esc(t("ver.rollback.hint")) + "</p>" +
    (rb && rb.fromCommit
      ? '<dl class="props"><dt>previous</dt><dd class="mono">' + esc(rb.fromCommit) + "</dd><dt>at</dt><dd>" + esc(fmtDate(rb.at)) + "</dd></dl>" +
        '<div class="actions"><button class="btn" id="btnRollback">' + icon("rotate-ccw") + "<span>" + esc(t("ver.rollback")) + "</span></button></div>"
      : '<div class="empty">' + icon("info") + "—</div>") +
    '<div class="prog" id="verProg"><div class="bar"><div class="fill"></div></div><div class="lbl"></div></div><div class="log" id="verLog"></div></div></div>';

  if (o.changelogHead) {
    h += '<details class="fold card"><summary>' + icon("history", "chev") + "<span>" + esc(t("ver.changelog")) + '</span></summary><div class="body"><pre class="block">' + esc(o.changelogHead) + "</pre></div></details>";
  }
  b.innerHTML = h;

  $("btnCheck").onclick = function () {
    var box = $("updBox"); box.innerHTML = '<div class="empty">' + icon("loader") + "…</div>";
    api("/api/check-update", {}).then(function (r) {
      UPD = r;
      if (r.error) { box.innerHTML = '<div class="callout warn" style="margin-top:12px">' + icon("triangle-alert") + "<div>" + esc(tx(r.error)) + "</div></div>"; return; }
      if (r.upToDate) { box.innerHTML = '<div class="callout ok" style="margin-top:12px">' + icon("circle-check") + "<div>" + esc(t("ver.upToDate")) + "</div></div>"; renderHome(); return; }
      var lst = (r.newCommits || []).map(function (c) { return "<li><code>" + esc(c) + "</code></li>"; }).join("");
      box.innerHTML = '<div class="callout acc" style="margin-top:12px">' + icon("arrow-up-circle") + "<div><b>" + esc(t("ver.available")) + " — " + r.behind + "</b><ul style=\"margin:6px 0 0;padding-left:18px\">" + lst + "</ul></div></div>" +
        '<div class="actions"><button class="btn primary" id="btnImpact">' + icon("file-diff") + "<span>" + esc(t("act.reviewImpact")) + "</span></button></div>";
      $("btnImpact").onclick = showImpact;
      renderHome();
    });
  };
  if (rb && rb.fromCommit) $("btnRollback").onclick = function () {
    api("/api/rollback-plan", {}).then(function (plan) {
      if (plan.error) return toast(tx(plan.error), true);
      showPlan({ plan: plan, title: t("ver.rollback"), onConfirm: function () {
        withProgress("verProg", api("/api/rollback", {})).then(function (r) {
          if (r.error) return toast(tx(r.error), true);
          renderLog($("verLog"), r); refresh();
        });
      } });
    });
  };
}

function showImpact() {
  modal({ title: t("ver.impact"), body: '<div class="empty">' + icon("loader") + "…</div>", wide: true, buttons: [{ label: t("act.close"), kind: "ghost" }] });
  api("/api/impact", {}).then(function (r) {
    if (r.error) { $("mBody").innerHTML = '<div class="callout warn">' + icon("triangle-alert") + "<div>" + esc(tx(r.error)) + "</div></div>"; return; }
    var h = "";
    h += '<dl class="props"><dt>version</dt><dd>v' + esc(r.fromVersion || "?") + " \u2192 v" + esc(r.toVersion || "?") + " <span class=\"pill " + (r.bump === "major" ? "warn" : "acc") + '">' + esc(r.bump || "") + "</span></dd>" +
      "<dt>tokens</dt><dd>+" + (r.tokensAdded || 0) + " / \u2212" + (r.tokensRemoved || []).length + "</dd>" +
      "<dt>specs</dt><dd>+" + (r.specsAdded || 0) + " / \u2212" + (r.specsRemoved || []).length + "</dd></dl>";
    if (r.bump === "major") h += '<div class="callout warn">' + icon("triangle-alert") + "<div>MAJOR</div></div>";
    var affected = r.affected || [];
    if (!(r.tokensRemoved || []).length && !(r.specsRemoved || []).length) {
      h += '<div class="callout ok">' + icon("circle-check") + "<div>" + esc(t("ver.impact.none")) + "</div></div>";
    } else {
      h += '<div class="callout warn">' + icon("triangle-alert") + "<div>" + esc(t("ver.impact.removed")) + " <b>" +
        esc((r.tokensRemoved || []).concat(r.specsRemoved || []).slice(0, 6).join(", ")) + "</b>" +
        (affected.length ? " — " + esc(t("ver.impact.usedIn")) + " <b>" + affected.length + "</b> " + esc(t("ver.impact.files")) : "") + "</div></div>";
      if (affected.length) h += '<div id="impactTable"></div>';
    }
    h += '<div class="actions"><button class="btn primary" id="btnDoUpdate">' + icon("arrow-up-circle") + "<span>" + esc(t("ver.update")) + "</span></button></div>";
    $("mBody").innerHTML = h;
    if (affected.length) paginate($("impactTable"), affected.map(function (f) {
      return '<tr><td class="mono">' + esc(f.file) + "</td><td>" + esc(f.hits) + "</td></tr>";
    }), ["file", "hits"]);
    $("btnDoUpdate").onclick = function () {
      closeModal();
      api("/api/update-plan", {}).then(function (plan) {
        if (plan.error) return toast(tx(plan.error), true);
        showPlan({ plan: plan, title: t("ver.update"), onConfirm: function () {
          withProgress("verProg", api("/api/update", { commit: false })).then(function (res) {
            if (res.error) return toast(tx(res.error), true);
            renderLog($("verLog"), res); refresh();
          });
        } });
      });
    };
  });
}

/* ============================================================ DIFF / CR */
function showDiff(path) {
  modal({ title: path, desc: t("diff.title"), wide: true, body: '<div class="empty">' + icon("loader") + "…</div>",
    buttons: [{ label: t("act.close"), kind: "ghost" }] });
  api("/api/diff", { file: path }).then(function (r) {
    if (r.error) { $("mBody").innerHTML = '<div class="callout warn">' + icon("triangle-alert") + "<div>" + esc(tx(r.error)) + "</div></div>"; return; }
    var lines = (r.diff || "").split("\n").map(function (l) {
      var c = l[0] === "+" ? "a" : l[0] === "-" ? "r" : l[0] === "@" ? "h" : "";
      return '<span class="' + c + '">' + esc(l) + "</span>";
    }).join("\n");
    $("mBody").innerHTML = '<div class="callout">' + icon("info") + "<div>" + esc(t("diff.restoreNote")) + " " + esc(r.wizardVersion || "") + ". " + esc(t("diff.backupNote")) + "</div></div>" +
      '<pre class="block diff">' + (lines || "—") + "</pre>";
    $("mFoot").innerHTML = "";
    [{ l: t("act.restore"), k: "", f: function () { closeModal(); doRestore(path); } },
     { l: t("act.sendDesigner"), k: "primary", f: function () { closeModal(); changeRequest(path); } },
     { l: t("act.close"), k: "ghost", f: closeModal }].forEach(function (b) {
      var btn = el("button", "btn " + b.k, esc(b.l)); btn.onclick = b.f; $("mFoot").appendChild(btn);
    });
  });
}

function doRestore(path) {
  api("/api/restore-plan", { file: path }).then(function (plan) {
    if (plan.error) return toast(tx(plan.error), true);
    showPlan({ plan: plan, title: t("act.restore") + " — " + path, onConfirm: function () {
      api("/api/restore", { file: path }).then(function (r) {
        if (r.error) return toast(tx(r.error), true);
        toast(t("log.done")); refresh();
      });
    } });
  });
}

function changeRequest(path) {
  modal({
    title: t("cr.title"), desc: t("cr.lead"),
    body: '<label class="field"><span>' + esc(t("cr.reason")) + '</span><textarea id="crReason" placeholder="' + esc(t("cr.reason.ph")) + '"></textarea></label>',
    buttons: [
      { label: t("act.cancel"), kind: "ghost" },
      { label: t("cr.send"), kind: "primary", icon: "mail", onClick: function () {} },
    ],
    after: function () {
      var btns = $("mFoot").querySelectorAll("button");
      btns[1].onclick = function () {
        var reason = ($("crReason") || {}).value || "";
        api("/api/change-request", { file: path, reason: reason, lang: LANG }).then(function (r) {
          closeModal();
          if (r.error) return toast(tx(r.error), true);
          copy(r.body, t("cr.clipboard"));
          toast(t("cr.saved") + " " + r.savedTo);
          if (r.mailto) window.location.href = r.mailto;
          refresh();
        });
      };
    },
  });
}

function doAdopt() {
  api("/api/adopt-plan", {}).then(function (plan) {
    if (plan.error) return toast(tx(plan.error), true);
    showPlan({ plan: plan, title: t("act.adopt"), onConfirm: function () {
      api("/api/adopt", {}).then(function (r) {
        if (r.error) return toast(tx(r.error), true);
        toast(t("log.done")); refresh();
      });
    } });
  });
}

function doSelfUpdate() {
  api("/api/panel-update-plan", {}).then(function (plan) {
    if (plan.error) return toast(tx(plan.error), true);
    showPlan({ plan: plan, title: t("act.updatePanel"), onConfirm: function () {
      api("/api/panel-update", {}).then(function (r) {
        if (r.error) return toast(tx(r.error), true);
        modal({ title: t("act.updatePanel"), body: "<p>" + esc(tx(r.message)) + "</p>", buttons: [{ label: t("act.close"), kind: "ghost" }] });
      });
    } });
  });
}

/* ============================================================ DOCS page */
function renderDocs() {
  var b = $("docsBody");
  if (!S || S.level === "not-installed" || !OV) { b.innerHTML = '<div class="empty">' + icon("info") + esc(t("docs.locked")) + "</div>"; return; }
  var h = '<div class="doclist">';
  if (OV.hasGallery) h += '<a class="primary" href="/ds/reference/gallery.html" target="_blank" rel="noopener">' + icon("image") + "<span>" + esc(t("docs.gallery")) + "</span></a>";
  (OV.docs || []).forEach(function (f) { h += '<a href="/ds/' + encodeURIComponent(f) + '" target="_blank" rel="noopener">' + icon("file-text") + "<span>" + esc(f) + "</span></a>"; });
  h += "</div>";
  b.innerHTML = h;
}

/* ========================================================= PROMPTS page */
var promptsDrawn = false;
function renderPrompts() {
  var lib = $("promptLib");
  if (!S || S.level === "not-installed") { lib.innerHTML = '<div class="empty">' + icon("lock") + esc(t("prompts.locked")) + "</div>"; promptsDrawn = false; return; }
  if (promptsDrawn) return;
  var list = S.prompts || []; if (!list.length) return;
  promptsDrawn = true;
  var bodies = {}, cats = [], byCat = {};
  list.forEach(function (p) { bodies[p.id] = p.body; if (!byCat[p.cat]) { byCat[p.cat] = []; cats.push(p.cat); } byCat[p.cat].push(p); });

  function phOf(id) { var m = bodies[id].match(/\[[^\]\n]+\]/g) || [], u = []; m.forEach(function (x) { if (u.indexOf(x) < 0) u.push(x); }); return u; }
  function filled(id) {
    var txt = bodies[id], box = $("pf-" + id);
    if (box) { var ins = box.querySelectorAll("[data-ph]"); for (var i = 0; i < ins.length; i++) { var v = ins[i].value.trim(); if (v) txt = txt.split(ins[i].getAttribute("data-ph")).join(v); } }
    return txt;
  }
  function refresh1(id) {
    var pre = $("pb-" + id); if (pre) pre.textContent = filled(id);
    var box = $("pf-" + id); if (!box) return;
    var ins = box.querySelectorAll("[data-ph]"), left = 0;
    for (var i = 0; i < ins.length; i++) if (!ins[i].value.trim()) left++;
    var bd = $("pn-" + id);
    if (bd) { bd.textContent = left ? left + " " + t("prompts.fill") : t("prompts.ready"); bd.className = "badge" + (left ? "" : " ok"); }
  }

  var h = "";
  cats.forEach(function (c) {
    h += '<div class="cat">' + esc(c) + "</div>";
    byCat[c].forEach(function (p) {
      var phs = phOf(p.id), f = "";
      if (phs.length) {
        f = '<div class="pfields" id="pf-' + p.id + '">';
        phs.forEach(function (ph) {
          var lab = ph.slice(1, -1), big = /DESCRIBE|PASTE/.test(lab);
          f += '<label class="' + (big ? "wide" : "") + '"><span>' + esc(lab.charAt(0) + lab.slice(1).toLowerCase()) + "</span>" +
            (big ? '<textarea rows="2" data-ph="' + esc(ph) + '"></textarea>' : '<input type="text" data-ph="' + esc(ph) + '">') + "</label>";
        });
        f += "</div>";
      }
      h += '<details class="pcard"><summary>' + icon("chevron-right", "chev") +
        '<span><span class="ttl">' + esc(p.title) + '</span><br><span class="sub">' + esc(p.desc) + "</span></span>" +
        (phs.length ? '<span class="badge" id="pn-' + p.id + '"></span>' : "") + "</summary>" +
        '<div class="body">' + f +
        '<div class="actions" style="margin-top:0"><button class="btn primary" data-pc="' + p.id + '">' + icon("copy") + "<span>" + esc(t("act.copy")) + "</span></button></div>" +
        '<pre class="block" id="pb-' + p.id + '" style="margin-top:10px"></pre></div></details>';
    });
  });
  lib.innerHTML = h;
  list.forEach(function (p) { refresh1(p.id); });
  lib.addEventListener("input", function (e) {
    var n = e.target; if (!n.getAttribute || !n.getAttribute("data-ph")) return;
    var box = n.parentNode; while (box && (!box.id || box.id.indexOf("pf-") !== 0)) box = box.parentNode;
    if (box) refresh1(box.id.slice(3));
  });
  lib.addEventListener("click", function (e) {
    var b = e.target.closest ? e.target.closest("[data-pc]") : null;
    if (b) copy(filled(b.getAttribute("data-pc")));
  });
}

/* =============================================================== SETUP */
function renderSetup() {
  if (!S) return;
  $("repoUrl").value = $("repoUrl").value || S.defaultRepoUrl || "";
  var installed = S.level !== "not-installed";
  $("alreadyBanner").style.display = installed ? "flex" : "none";
  $("btnProcess").querySelector("span").textContent = installed ? t("setup.recheck") : t("setup.process");

  var lg = S.legacy || {};
  if (lg.found && lg.items && lg.items.length) {
    $("legacyCard").style.display = "block";
    $("legacyPhrase").textContent = lg.confirmPhrase;
    $("legacyList").innerHTML = '<div class="tablewrap" style="margin-bottom:4px"><table class="dt"><tbody>' +
      lg.items.map(function (i) { return '<tr><td class="mono">' + esc(i.path) + "</td><td>" + esc(tx(i.note)) + "</td></tr>"; }).join("") + "</tbody></table></div>";
  } else $("legacyCard").style.display = "none";

  var lk = S.locked || {};
  $("btnProcess").disabled = !!lk.install;
  $("lockNote").style.display = lk.install ? "flex" : "none";

  var mail = S.maintainerEmail;
  var ask = $("askCode");
  if (mail) {
    ask.href = "mailto:" + mail + "?subject=" + encodeURIComponent("[Design System] Level 1 access code request") +
      "&body=" + encodeURIComponent("Repo: " + (S.originUrl || S.root) + "\n\nHi, could I get the Level 1 access code for the design system? Thanks!");
    ask.style.display = "";
  } else ask.style.display = "none";
}

/* ============================================================== state */
function render() {
  applyI18n();
  renderHome(); renderSetup(); renderPrompts();
  if (PAGE === "health") renderHealth();
  if (PAGE === "versions") renderVersions();
  if (PAGE === "docs") renderDocs();
  $("wizVer").textContent = S ? "v" + S.wizardVersion : "";
}

function refresh() {
  return api("/api/state").then(function (s) {
    S = s;
    if (s.level !== "not-installed") return api("/api/overview").then(function (o) { OV = o; render(); });
    OV = null; render();
  });
}

/* ================================================================ init */
document.querySelectorAll(".navb").forEach(function (b) { b.onclick = function () { go(b.getAttribute("data-nav")); }; });
document.querySelectorAll(".langsw button").forEach(function (b) { b.onclick = function () { setLang(b.getAttribute("data-lang")); }; });
document.querySelectorAll("#levels label").forEach(function (l) {
  l.onclick = function () {
    document.querySelectorAll("#levels label").forEach(function (x) { x.classList.remove("sel"); });
    l.classList.add("sel"); l.querySelector("input").checked = true;
    $("l1box").style.display = l.getAttribute("data-v") === "1" ? "block" : "none";
  };
});
$("scrim").onclick = function (e) { if (e.target === $("scrim")) closeModal(); };
document.addEventListener("keydown", function (e) { if (e.key === "Escape" && $("scrim").classList.contains("on")) closeModal(); });

function cfg() {
  return {
    repoUrl: $("repoUrl").value.trim(),
    level: (document.querySelector('input[name=lv]:checked') || {}).value || "0",
    commit: $("doCommit").checked,
    accessCode: $("l1code").value.trim(),
  };
}

$("btnProcess").onclick = function () {
  api("/api/plan", cfg()).then(function (plan) {
    if (plan.error) return toast(tx(plan.error), true);
    showPlan({ plan: plan, onConfirm: function () {
      var b = $("btnProcess"); b.disabled = true;
      withProgress("installProg", api("/api/apply", cfg())).then(function (res) {
        if (res.error) { toast(tx(res.error), true); b.disabled = false; return; }
        renderLog($("installLog"), res);
        $("doneRibbon").style.display = res.ok ? "flex" : "none";
        if (!res.ok) b.disabled = false;
        refresh();
      });
    } });
  });
};

$("legacyConfirm").oninput = function () {
  var want = ((S && S.legacy && S.legacy.confirmPhrase) || "").toUpperCase();
  $("btnLegacy").disabled = this.value.trim().toUpperCase() !== want;
};
$("btnLegacy").onclick = function () {
  api("/api/legacy-plan", {}).then(function (plan) {
    if (plan.error) return toast(tx(plan.error), true);
    showPlan({ plan: plan, title: t("legacy.action"), onConfirm: function () {
      withProgress("legacyProg", api("/api/legacy-clean", { confirm: $("legacyConfirm").value })).then(function (r) {
        if (r.error) return toast(tx(r.error), true);
        renderLog($("legacyLog"), r); $("legacyConfirm").value = ""; $("btnLegacy").disabled = true; refresh();
      });
    } });
  });
};

$("btnClose").onclick = function () {
  api("/api/shutdown", {}).then(function () {
    document.body.innerHTML = '<div style="padding:80px;text-align:center;color:#787774;font-family:Fustat,sans-serif">' +
      t("nav.close") + " \u2713</div>";
  });
};

applyI18n();
refresh().then(function () { if (S && S.level === "not-installed") go("setup"); });
