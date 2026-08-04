/* E-Systems Design System — panel client
   No framework, no build step at runtime. Bundled by tools/build-wizard.js. */
"use strict";

var I18N = /* @I18N@ */ {};
var LANG = localStorage.getItem("dsLang") || "id";
var THEME = localStorage.getItem("dsTheme") || "light"; /* light by default; dark is opt-in */
var S = null;          /* latest /api/state */
var OV = null;         /* latest /api/overview */
var UPD = null;        /* latest update check */
var PAGE = "home";

/* ------------------------------------------------------------- helpers */
function $(id) { return document.getElementById(id); }
/* create-or-reuse, so repeated renders never stack duplicates */
function elOnce(id, tag, cls, html) {
  var n = document.getElementById(id);
  if (!n) { n = document.createElement(tag); n.id = id; }
  if (cls) n.className = cls;
  if (html != null) n.innerHTML = html;
  return n;
}
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
function mailtoHref(email) {
  return "mailto:" + email +
    "?subject=" + encodeURIComponent("[Design System] " + (S && S.root ? S.root.split(/[\\/]/).pop() : "question")) +
    "&body=" + encodeURIComponent("Hi Raihan,\n\n\n\n---\nDesign system: v" + ((OV && OV.version) || "?") +
      "\nPanel: v" + ((S && S.wizardVersion) || "?") + "\nRepo: " + ((S && (S.originUrl || S.root)) || "?"));
}
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

/* ================================================= MARKDOWN RENDERER
   Small, dependency-free, and safe: the source is HTML-escaped BEFORE any
   markup is generated, so nothing in a document can inject an element. */
function mdToHtml(src) {
  if (!src) return "";
  var out = [];
  var lines = esc(src).replace(/\r\n?/g, "\n").split("\n");
  var i = 0;

  function inline(s) {
    return s
      .replace(/`([^`]+)`/g, function (m, c) { return "<code>" + c + "</code>"; })
      .replace(/\*\*\*([^*]+)\*\*\*/g, "<strong><em>$1</em></strong>")
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/(^|[^*])\*([^*\n]+)\*/g, "$1<em>$2</em>")
      .replace(/(^|[^_\w])_([^_\n]+)_/g, "$1<em>$2</em>")
      .replace(/~~([^~]+)~~/g, "<del>$1</del>")
      .replace(/!\[([^\]]*)\]\(([^)\s]+)[^)]*\)/g, "")
      .replace(/\[([^\]]+)\]\(([^)\s]+)[^)]*\)/g, function (m, txt, href) {
        if (!/^(https?:|mailto:|#|\.|\/)/.test(href)) return txt;
        var ext = /^https?:/.test(href);
        return '<a href="' + href + '"' + (ext ? ' target="_blank" rel="noopener noreferrer"' : "") + ">" + txt + "</a>";
      });
  }

  function isTableSep(s) { return /^\s*\|?[\s:|-]+\|[\s:|-]*$/.test(s) && s.indexOf("-") >= 0; }
  function cells(s) {
    var r = s.trim().replace(/^\|/, "").replace(/\|$/, "").split("|");
    return r.map(function (c) { return c.trim(); });
  }

  while (i < lines.length) {
    var l = lines[i];

    /* fenced code */
    var fence = l.match(/^\s*```+\s*([\w-]*)\s*$/);
    if (fence) {
      var lang = fence[1] || "", buf = [];
      i++;
      while (i < lines.length && !/^\s*```+\s*$/.test(lines[i])) { buf.push(lines[i]); i++; }
      i++;
      if (/^mermaid$/i.test(lang)) {
        out.push('<div class="mermaid-note">' + icon("git-branch") + "<span>" + esc(t("md.mermaid")) + "</span></div>");
      }
      out.push('<pre><code>' + buf.join("\n") + "</code></pre>");
      continue;
    }

    /* table */
    if (l.indexOf("|") >= 0 && i + 1 < lines.length && isTableSep(lines[i + 1])) {
      var head = cells(l);
      i += 2;
      var rows = [];
      while (i < lines.length && lines[i].indexOf("|") >= 0 && lines[i].trim()) { rows.push(cells(lines[i])); i++; }
      out.push("<table><thead><tr>" + head.map(function (c) { return "<th>" + inline(c) + "</th>"; }).join("") +
        "</tr></thead><tbody>" + rows.map(function (r) {
          return "<tr>" + head.map(function (_, k) { return "<td>" + inline(r[k] == null ? "" : r[k]) + "</td>"; }).join("") + "</tr>";
        }).join("") + "</tbody></table>");
      continue;
    }

    /* heading */
    var h = l.match(/^(#{1,6})\s+(.*)$/);
    if (h) { var lv = Math.min(h[1].length, 4); out.push("<h" + lv + ">" + inline(h[2].replace(/\s*#+\s*$/, "")) + "</h" + lv + ">"); i++; continue; }

    /* hr */
    if (/^\s*([-*_])\s*\1\s*\1[\s\-*_]*$/.test(l)) { out.push("<hr>"); i++; continue; }

    /* blockquote */
    if (/^\s*&gt;\s?/.test(l)) {
      var q = [];
      while (i < lines.length && /^\s*&gt;\s?/.test(lines[i])) { q.push(lines[i].replace(/^\s*&gt;\s?/, "")); i++; }
      out.push("<blockquote>" + mdToHtml__inner(q.join("\n")) + "</blockquote>");
      continue;
    }

    /* list */
    if (/^\s*([-*+]|\d+\.)\s+/.test(l)) {
      var ordered = /^\s*\d+\./.test(l), items = [];
      while (i < lines.length && /^\s*([-*+]|\d+\.)\s+/.test(lines[i])) {
        var body = lines[i].replace(/^\s*([-*+]|\d+\.)\s+/, "");
        i++;
        while (i < lines.length && /^\s{2,}\S/.test(lines[i]) && !/^\s*([-*+]|\d+\.)\s+/.test(lines[i])) { body += " " + lines[i].trim(); i++; }
        items.push("<li>" + inline(body) + "</li>");
      }
      out.push((ordered ? "<ol>" : "<ul>") + items.join("") + (ordered ? "</ol>" : "</ul>"));
      continue;
    }

    /* blank */
    if (!l.trim()) { i++; continue; }

    /* paragraph */
    var para = [];
    while (i < lines.length && lines[i].trim() && !/^(#{1,6}\s|\s*```|\s*&gt;\s?|\s*([-*+]|\d+\.)\s)/.test(lines[i]) &&
           !(lines[i].indexOf("|") >= 0 && i + 1 < lines.length && isTableSep(lines[i + 1]))) { para.push(lines[i]); i++; }
    if (para.length) out.push("<p>" + inline(para.join(" ")) + "</p>");
  }
  return out.join("\n");
}
/* blockquotes recurse; keep the escape from happening twice */
function mdToHtml__inner(escaped) {
  return escaped.split("\n\n").map(function (p) { return "<p>" + p.replace(/\n/g, " ") + "</p>"; }).join("");
}

var MD_SEQ = 0;
/* Preview / Raw switch. Preview is always the default view. */
function mdBlock(source, opts) {
  opts = opts || {};
  var id = "md" + (++MD_SEQ);
  return '<div class="mdwrap" data-mdid="' + id + '">' +
    '<div class="mdtabs"><button class="sel" data-md="' + id + '" data-view="p">' + icon("eye") + "<span>" + esc(t("md.preview")) + "</span></button>" +
    '<button data-md="' + id + '" data-view="r">' + icon("hash") + "<span>" + esc(t("md.raw")) + "</span></button></div>" +
    '<div class="md' + (opts.full ? " full" : "") + '" id="' + id + '-p">' + mdToHtml(source) + "</div>" +
    '<pre class="block" id="' + id + '-r" style="display:none">' + esc(source) + "</pre></div>";
}
document.addEventListener("click", function (e) {
  var b = e.target.closest ? e.target.closest("[data-md]") : null;
  if (!b) return;
  var id = b.getAttribute("data-md"), view = b.getAttribute("data-view");
  $(id + "-p").style.display = view === "p" ? "" : "none";
  $(id + "-r").style.display = view === "r" ? "" : "none";
  var sibs = b.parentNode.querySelectorAll("button");
  for (var i = 0; i < sibs.length; i++) sibs[i].classList.toggle("sel", sibs[i] === b);
});

/* ------------------------------------------------------------ language */
function applyI18n() {
  document.documentElement.lang = LANG;
  var nodes = document.querySelectorAll("[data-i18n]");
  for (var i = 0; i < nodes.length; i++) nodes[i].textContent = t(nodes[i].getAttribute("data-i18n"));
  var btns = document.querySelectorAll(".langsw button");
  for (var j = 0; j < btns.length; j++) btns[j].classList.toggle("sel", btns[j].getAttribute("data-lang") === LANG);
}
function setLang(l) { LANG = l; localStorage.setItem("dsLang", l); applyI18n(); render(); }

function applyTheme() {
  if (THEME === "auto") document.documentElement.removeAttribute("data-theme");
  else document.documentElement.setAttribute("data-theme", THEME);
}
function cycleTheme() {
  THEME = THEME === "auto" ? "light" : THEME === "light" ? "dark" : "auto";
  localStorage.setItem("dsTheme", THEME);
  applyTheme();
  toast(t("more.theme") + ": " + t("theme." + THEME));
}

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
  if (page === "about") renderAbout();
}

/* -------------------------------------------------------------- modal
 * Modals form a stack. Opening a detail view from inside another modal (the
 * eye button on a plan step, for instance) pushes onto it, and a Back button
 * appears automatically. Before v3.3.0 the detail view simply replaced the
 * plan, so the only way out was Close — which threw away the plan the user was
 * halfway through reading. */
var mStack = [];

function renderModal(opts) {
  $("mTitle").textContent = opts.title || "";
  $("mDesc").textContent = opts.desc || "";
  $("mBody").innerHTML = opts.body || "";
  $("modal").classList.toggle("wide", !!opts.wide);

  var f = $("mFoot"); f.innerHTML = "";
  if (mStack.length > 1) {
    var back = el("button", "btn ghost mback", icon("chevron-left") + "<span>" + esc(t("act.back")) + "</span>");
    back.onclick = modalBack;
    f.appendChild(back);
    f.appendChild(el("span", "mspacer"));
  }
  (opts.buttons || []).forEach(function (b) {
    var btn = el("button", "btn " + (b.kind || ""), (b.icon ? icon(b.icon) : "") + "<span>" + esc(b.label) + "</span>");
    btn.onclick = function () {
      if (b.keepOpen === true) { if (b.onClick) b.onClick(); return; }
      if (b.back === true) { modalBack(); if (b.onClick) b.onClick(); return; }
      closeModal();
      if (b.onClick) b.onClick();
    };
    f.appendChild(btn);
  });

  $("scrim").classList.add("on");
  if (opts.after) opts.after();
  var first = f.querySelector("button.primary") || f.querySelector("button:not(.mback)") || f.querySelector("button");
  if (first) first.focus();
}

/* open a modal, replacing the stack */
function modal(opts) { mStack = [opts]; renderModal(opts); }
/* open a modal on top of the current one, keeping a way back */
function modalPush(opts) { mStack.push(opts); renderModal(opts); }
function modalBack() {
  if (mStack.length < 2) return closeModal();
  mStack.pop();
  var prev = mStack[mStack.length - 1];
  renderModal(prev);
  if (prev.onReturn) prev.onReturn();
}
function closeModal() {
  $("scrim").classList.remove("on");
  var top = mStack[mStack.length - 1];
  mStack = [];
  if (top && top.onClose) top.onClose();
}
/* replace what is on top without losing what is underneath it */
function modalSwap(opts) {
  if (mStack.length) mStack[mStack.length - 1] = opts; else mStack = [opts];
  renderModal(opts);
}

/* ----------------------------------------------------------- progress */
function withProgress(progId, promise) {
  var box = $(progId); if (!box) return promise;
  var fill = box.querySelector(".fill"), lbl = box.querySelector(".lbl");
  box.style.display = "block"; fill.style.width = "4%"; lbl.textContent = "\u2026";
  var timer = setInterval(function () {
    fetch("/api/progress").then(function (r) { return r.json(); }).then(function (p) {
      if (p.active && p.total) {
        fill.style.width = Math.max(6, Math.round(p.current / p.total * 100)) + "%";
        lbl.textContent = t("log.step") + " " + p.current + " " + t("log.of") + " " + p.total + " \u2014 " + tx(p.label);
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
  (opts.nested ? modalPush : modal)({
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
          if (!f) {
            modalPush({ title: t("plan.preview"), body: '<pre class="block">' + esc(line) + "</pre>",
              buttons: [{ label: t("act.close"), kind: "ghost" }] });
            return;
          }
          modalPush({ title: f, desc: t("plan.preview"), wide: true, body: '<div class="empty">' + icon("loader") + "\u2026</div>", buttons: [] });
          api("/api/payload", { file: f }).then(function (r) {
            modalSwap({
              title: f, desc: t("plan.preview"), wide: true,
              body: /\.md$/.test(f) ? mdBlock(r.content || r.error || "") : '<pre class="block">' + esc(r.content || r.error || "") + "</pre>",
              buttons: [{ label: t("act.copy"), icon: "copy", keepOpen: true, onClick: function () { copy(r.content || ""); } }],
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
    out.push({ k: "w", ic: "file-diff", title: d.path + " \u2014 " + t("attn.drift.title"), desc: t("attn.drift.contract"),
      acts: [{ label: t("act.viewDiff"), fn: function () { showDiff(d.path); } }, { label: t("act.restore"), fn: function () { doRestore(d.path); } }, { label: t("act.sendDesigner"), fn: function () { changeRequest(d.path); } }] });
  });
  if (S.halfWired) out.push({ k: "w", ic: "circle-alert", title: t("attn.halfwired.title"), desc: t("attn.halfwired.body"), acts: [{ label: t("act.fix"), go: "setup" }] });
  if (UPD && UPD.behind > 0) out.push({ k: "i", ic: "arrow-up-circle", title: t("attn.update.title") + " \u2014 " + UPD.behind + " " + t("attn.update.body"), desc: "", acts: [{ label: t("act.reviewImpact"), go: "versions", primary: true }] });
  if (S.panelOutdated) out.push({ k: "i", ic: "refresh-cw", title: t("attn.selfupdate.title"), desc: t("attn.selfupdate.body") + " (" + S.panelLatest + ")", acts: [{ label: t("act.updatePanel"), fn: doSelfUpdate }] });
  (S.drift || []).filter(function (d) { return d.klass === "living"; }).forEach(function (d) {
    out.push({ k: "i", ic: "git-branch", title: d.path, desc: t("attn.drift.living"),
      acts: [{ label: t("act.sendDesigner"), fn: function () { changeRequest(d.path); }, primary: true }, { label: t("act.viewDiff"), fn: function () { showDiff(d.path); } }, { label: t("act.restore"), fn: function () { doRestore(d.path); } }] });
  });
  if (S.dirty && S.level === "not-installed") out.push({ k: "i", ic: "circle-alert", title: t("attn.dirty.title"), desc: t("attn.dirty.body"), acts: [] });
  return out;
}

function statCard(iconName, value, label, sub, accent) {
  return '<div class="stat' + (accent ? " acc" : "") + '"><div class="si">' + icon(iconName) + "</div>" +
    '<div class="sv">' + esc(value == null ? "\u2014" : value) + "</div>" +
    '<div class="sl">' + esc(label) + "</div>" +
    (sub ? '<div class="ss">' + esc(sub) + "</div>" : "") + "</div>";
}

function renderHome() {
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

  var v = $("verdict");
  if (S.level === "not-installed") v.innerHTML = "";
  else if (!items.length) v.innerHTML = '<div class="verdict ok">' + icon("circle-check") + "<span>" + esc(t("status.healthy")) + "</span></div>";
  else v.innerHTML = '<div class="verdict warn">' + icon("triangle-alert") + "<span>" + items.length + " " + esc(items.length === 1 ? t("status.attention.one") : t("status.attention")) + "</span></div>";

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

  var flags = { setup: !!(S.legacy && S.legacy.found) || S.level === "not-installed", health: (S.drift || []).length > 0 || S.unmanaged, versions: !!(UPD && UPD.behind > 0) };
  ["setup", "health", "versions"].forEach(function (n) {
    var b = document.querySelector('.navb[data-nav="' + n + '"]');
    if (b) b.classList.toggle("flag", !!flags[n]);
  });

  var b = $("homeBody");
  if (S.level === "not-installed") {
    b.innerHTML = '<div class="card"><div class="body"><p class="hint">' + esc(t("home.notInstalled.body")) +
      '</p><div class="actions"><button class="btn primary" id="goSetup">' + icon("download") + "<span>" + esc(t("home.notInstalled.cta")) + "</span></button>" +
      '<button class="btn ghost" id="goTour">' + icon("play") + "<span>" + esc(t("more.tour")) + "</span></button></div></div></div>";
    $("goSetup").onclick = function () { go("setup"); };
    $("goTour").onclick = startTour;
    return;
  }

  var o = OV || {};
  var h = '<div class="stats" data-tour="stats">' +
    statCard("palette", o.tokenCount, t("home.stack.tokens"), t("stat.tokens.sub"), true) +
    statCard("layout-grid", o.specs, t("home.stack.specs"), o.pages != null ? (o.specs - o.pages) + " + " + o.pages + " " + t("stat.pages") : "") +
    statCard("image", o.reference, t("home.stack.reference"), t("stat.reference.sub")) +
    statCard("book-marked", o.catalog, t("home.stack.catalog"), t("stat.catalog.sub")) +
    "</div>";

  h += '<div class="card"><div class="body"><h2>' + icon("boxes") + esc(t("home.stack.title")) + '</h2><dl class="props">';
  function row(k, val) { if (val == null || val === "") return; h += "<dt>" + esc(k) + "</dt><dd>" + val + "</dd>"; }
  row(t("home.stack.typeface"), o.typeface ? esc(o.typeface) : null);
  row(t("home.stack.icons"), o.icons ? esc(o.icons) : null);
  row(t("home.stack.commit"), o.commit ? '<span class="mono">' + esc(o.commit) + "</span>" : null);
  row(t("home.managed"), S.manifest ? S.manifest.managed.length + " " + t("home.files") : null);
  h += '</dl><div class="note">' + icon("info") + "<span>" + esc(t("home.stack.note")) + "</span></div></div></div>";

  h += adoptionCard();

  var man = (S.manifest && S.manifest.managed) || [];
  if (man.length) {
    h += '<details class="fold card"><summary>' + icon("file-text", "chev") + "<span>" + esc(t("home.managed")) +
      '</span><span class="count">' + man.length + '</span></summary><div class="body">' + managedTable(man) + "</div></details>";
  }
  if (o.changelogHead) {
    h += '<details class="fold card"><summary>' + icon("sparkles", "chev") + "<span>" + esc(t("home.whatsnew")) + " v" + esc(o.version || "") +
      '</span></summary><div class="body">' + mdBlock(o.changelogHead) + "</div></details>";
  }
  b.innerHTML = h;
}

/* Adoption counters.
 *
 * Three scopes behind one segmented control, because three different people ask
 * three different questions:
 *   TEAM     - every registered repo. This is the number a PM wants. It comes from
 *              design-system/.release/adoption.json, which ship.js now regenerates
 *              on every release, so a developer never has to run anything.
 *   THIS REPO- what happened here, by anyone.
 *   ME       - what this developer did, matched on the same non-identifying actor
 *              hash the report uses. No address is stored anywhere.
 *
 * The counts are cumulative and survive design system updates: .ds/history.jsonl
 * is append-only and committed, and uninstalling deliberately keeps it. Reinstalling
 * appends rather than starting over.
 *
 * None of this is telemetry. The panel makes no network request to produce it.  */
/* Default to the scope that actually HAS data. "team" was the hardcoded default, so a repo
   whose org report was never configured opened on a tab of permanent zeros while the
   developer's own cumulative counts sat one tab away, unread. A tab is only defaulted to when
   it can answer its own question. */
var ADOPT_SCOPE = localStorage.getItem("dsAdoptScope") || "";

function adoptionCard() {
  var a = (S && S.adoption) || {};
  var scope = ADOPT_SCOPE || (a.org ? "team" : "repo");
  if (scope === "team" && !a.org) scope = "repo";
  if (scope === "me" && !a.hasActor) scope = "repo";

  var src = scope === "team" ? (a.org || {}) : scope === "me" ? (a.mine || {}) : (a.repo || {});
  var cells;
  if (scope === "team") {
    cells = [
      [src.repos, "adopt.repos", "git-branch"],
      [src.installs, "adopt.installs", "download"],
      [src.updates, "adopt.updates", "arrow-up-circle"],
      [src.uninstalls, "adopt.uninstalls", "trash-2"],
      [src.devs, "adopt.devs", "user-round"],
      [src.requests, "adopt.requests", "mail"],
      [src.current, "adopt.current", "circle-check"],
      [src.behind, "adopt.behind", "clock", src.behind > 0],
    ];
  } else {
    cells = [
      [src.install, "adopt.installs", "download"],
      [src.update, "adopt.updates", "arrow-up-circle"],
      [src.rollback, "adopt.rollbacks", "rotate-ccw"],
      [src.uninstall, "adopt.uninstalls", "trash-2"],
      [src.request, "adopt.requests", "mail"],
      [src.adopt, "adopt.adopted", "shield-check"],
    ];
  }

  var tabs = [["team", "adopt.scope.team", !!a.org], ["repo", "adopt.scope.repo", true], ["me", "adopt.scope.me", !!a.hasActor]];
  var h = '<div class="card" data-tour="adoption"><div class="body">' +
    '<div class="adopthead"><h2>' + icon("activity") + esc(t("adopt.title")) + "</h2>" +
    '<div class="scopesw">' + tabs.map(function (x) {
      return '<button data-scope="' + x[0] + '"' + (x[2] ? "" : " disabled") +
        (scope === x[0] ? ' class="sel"' : "") + ">" + esc(t(x[1])) + "</button>";
    }).join("") + "</div></div>";

  h += '<div class="adopt">' + cells.map(function (c) {
    return '<div><div class="av2' + (c[3] ? " warn2" : "") + '">' + esc(c[0] == null ? 0 : c[0]) + "</div>" +
      '<div class="al">' + icon(c[2]) + "<span>" + esc(t(c[1])) + "</span></div></div>";
  }).join("") + "</div>";

  var note;
  if (scope === "team") {
    note = { ic: "clock", txt: t("adopt.org.hint") + (a.generatedAt ? " \u00b7 " + t("adopt.generated") + " " + fmtDate(a.generatedAt) : "") };
  } else if (scope === "me") {
    note = { ic: "shield-check", txt: t("adopt.me.hint") };
  } else {
    note = { ic: "git-commit-horizontal", txt: t("adopt.repo.hint") };
  }
  h += '<div class="note">' + icon(note.ic) + "<span>" + esc(note.txt) + "</span></div>";

  /* Say WHY the team tab is empty. "No repositories are listed yet" is actionable;
     a disabled tab with no explanation reads as a broken panel. */
  if (!a.org && scope !== "team") h += '<div class="note" style="border-top:none;padding-top:0">' + icon("info") +
    "<span>" + esc(t(a.configured === false ? "adopt.unconfigured" : "adopt.noteam")) + "</span></div>";

  return h + "</div></div>";
}

document.addEventListener("click", function (e) {
  var b = e.target.closest ? e.target.closest("[data-scope]") : null;
  if (!b || b.disabled) return;
  ADOPT_SCOPE = b.getAttribute("data-scope");
  localStorage.setItem("dsAdoptScope", ADOPT_SCOPE);
  renderHome();
});

function managedTable(man) {
  var rows = man.map(function (m) {
    var d = (S.drift || []).filter(function (x) { return x.path === m.path; })[0];
    var st = d ? '<span class="pill warn">' + esc(d.state) + "</span>" : '<span class="pill ok">ok</span>';
    return '<tr><td class="mono">' + esc(m.path) + "</td><td>" + esc(m.mode) + "</td><td>" + st + "</td></tr>";
  }).join("");
  return '<div class="tablewrap"><table class="dt"><thead><tr><th>file</th><th>mode</th><th>state</th></tr></thead><tbody>' + rows + "</tbody></table></div>";
}

/* ========================================================== HEALTH page */
function renderHealth() {
  var b = $("healthBody");
  if (!S || S.level === "not-installed") { b.innerHTML = '<div class="empty">' + icon("info") + esc(t("docs.locked")) + "</div>"; return; }

  var drift = S.drift || [];
  var h = "";

  h += '<div class="card"><div class="body"><h2>' + icon("heart-pulse") + esc(t("health.doctor")) + '</h2><p class="hint">' + esc(t("health.doctor.hint")) +
    '</p><div class="actions" style="margin-top:0"><button class="btn" id="btnDoctor">' + icon("play") + "<span>" + esc(t("health.doctor.run")) + "</span></button></div>" +
    '<div id="doctorOut"></div></div></div>';

  h += '<div class="card" data-tour="drift"><div class="body"><h2>' + icon("file-diff") + esc(t("health.drift")) + "</h2>";
  if (!drift.length) h += '<div class="empty">' + icon("circle-check") + esc(t("health.drift.none")) + "</div>";
  else {
    h += '<div class="tablewrap"><table class="dt"><thead><tr><th>file</th><th>state</th><th></th></tr></thead><tbody>';
    drift.forEach(function (d) {
      h += '<tr><td class="mono">' + esc(d.path) + '</td><td><span class="pill ' + (d.klass === "contract" ? "warn" : "acc") + '">' + esc(d.state) + "</span></td>" +
        '<td style="text-align:right;white-space:nowrap">' +
        '<button class="btn ghost" data-diff="' + esc(d.path) + '" title="' + esc(t("act.viewDiff")) + '">' + icon("file-diff") + "</button> " +
        '<button class="btn ghost" data-cr="' + esc(d.path) + '" title="' + esc(t("act.sendDesigner")) + '">' + icon("mail") + "</button> " +
        '<button class="btn ghost" data-res="' + esc(d.path) + '" title="' + esc(t("act.restore")) + '">' + icon("rotate-ccw") + "</button></td></tr>";
    });
    h += "</tbody></table></div>";
  }
  h += "</div></div>";

  var man = (S.manifest && S.manifest.managed) || [];
  h += '<details class="fold card"><summary>' + icon("shield-check", "chev") + "<span>" + esc(t("health.receipt")) +
    '</span><span class="count">' + man.length + '</span></summary><div class="body"><p class="hint">' + esc(t("health.receipt.hint")) + "</p>" +
    (man.length ? managedTable(man) : '<div class="empty">' + icon("info") + "\u2014</div>") +
    '<div class="actions"><button class="btn ghost" id="btnExportReceipt">' + icon("copy") + "<span>" + esc(t("act.export")) + "</span></button></div></div></details>";

  var hist = (S.history || []);
  h += '<details class="fold card"><summary>' + icon("activity", "chev") + "<span>" + esc(t("health.adoption")) +
    '</span><span class="count">' + hist.length + '</span></summary><div class="body" id="histBox"></div></details>';

  h += '<details class="fold card"><summary>' + icon("git-branch", "chev") + "<span>" + esc(t("health.repo")) + '</span></summary><div class="body">' +
    '<p class="hint">' + esc(t("health.repo.hint")) + "</p>" +
    '<label class="field" style="margin-top:0"><span>URL</span><input type="text" id="newRepoUrl" spellcheck="false" value="' + esc(S.originUrl || "") + '"></label>' +
    '<div class="actions"><button class="btn" id="btnMoveRemote">' + icon("git-branch") + "<span>" + esc(t("health.repo.action")) + "</span></button></div></div></details>";

  h += '<div class="card"><div class="body"><h2>' + icon("trash-2") + esc(t("health.uninstall")) + '</h2><p class="hint">' + esc(t("health.uninstall.hint")) +
    '</p><div class="actions" style="margin-top:0"><button class="btn danger" id="btnRevert">' + icon("trash-2") + "<span>" + esc(t("health.uninstall")) + "</span></button></div>" +
    '<div class="prog" id="maintProg"><div class="bar"><div class="fill"></div></div><div class="lbl"></div></div><div class="log" id="maintLog"></div></div></div>';

  b.innerHTML = h;

  $("btnDoctor").onclick = function () {
    var o = $("doctorOut"); o.innerHTML = '<div class="empty">' + icon("loader") + "\u2026</div>";
    api("/api/doctor", {}).then(function (d) {
      o.innerHTML = '<pre class="block" style="margin-top:11px">' + esc(d.output || "") + "</pre>";
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
    if (!rowsHtml.length) { node.innerHTML = '<div class="empty">' + icon("info") + "\u2014</div>"; return; }
    var pages = Math.max(1, Math.ceil(rowsHtml.length / per));
    if (page >= pages) page = pages - 1;
    var slice = rowsHtml.slice(page * per, page * per + per).join("");
    var pager = "";
    for (var i = 0; i < pages; i++) pager += '<button class="' + (i === page ? "sel" : "") + '" data-p="' + i + '">' + (i + 1) + "</button>";
    node.innerHTML = '<div class="tablewrap"><table class="dt"><thead><tr>' +
      headers.map(function (x) { return "<th>" + esc(x) + "</th>"; }).join("") + "</tr></thead><tbody>" + slice + "</tbody></table>" +
      '<div class="tablefoot"><span>' + rowsHtml.length + " " + esc(t("tbl.rows")) + '</span><span class="spacer"></span>' +
      '<select class="perpage" aria-label="' + esc(t("tbl.perPage")) + '"><option>10</option><option>25</option><option>50</option></select>' +
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
  var h = '<div class="card"><div class="body"><h2>' + icon("package") + esc(t("ver.current")) + '</h2><dl class="props">' +
    "<dt>version</dt><dd>v" + esc(o.version || "\u2014") + "</dd>" +
    '<dt>commit</dt><dd class="mono">' + esc(o.commit || "\u2014") + "</dd></dl>" +
    '<div class="actions"><button class="btn" id="btnCheck">' + icon("refresh-cw") + "<span>" + esc(t("ver.check")) + "</span></button></div>" +
    '<div id="updBox"></div></div></div>';

  var rb = S.rollback;
  h += '<div class="card"><div class="body"><h2>' + icon("rotate-ccw") + esc(t("ver.rollback")) + '</h2><p class="hint">' + esc(t("ver.rollback.hint")) + "</p>" +
    (rb && rb.fromCommit
      ? '<dl class="props"><dt>previous</dt><dd class="mono">' + esc(rb.fromCommit) + "</dd><dt>at</dt><dd>" + esc(fmtDate(rb.at)) + "</dd></dl>" +
        '<div class="actions"><button class="btn" id="btnRollback">' + icon("rotate-ccw") + "<span>" + esc(t("ver.rollback")) + "</span></button></div>"
      : '<div class="empty">' + icon("info") + esc(t("ver.noRollback")) + "</div>") +
    '<div class="prog" id="verProg"><div class="bar"><div class="fill"></div></div><div class="lbl"></div></div><div class="log" id="verLog"></div></div></div>';

  if (o.changelogHead) {
    h += '<details class="fold card"><summary>' + icon("history", "chev") + "<span>" + esc(t("ver.changelog")) + '</span></summary><div class="body">' + mdBlock(o.changelogHead) + "</div></details>";
  }
  b.innerHTML = h;

  $("btnCheck").onclick = function () {
    var box = $("updBox"); box.innerHTML = '<div class="empty">' + icon("loader") + "\u2026</div>";
    api("/api/check-update", {}).then(function (r) {
      UPD = r;
      if (r.error) { box.innerHTML = '<div class="callout warn" style="margin-top:13px">' + icon("triangle-alert") + "<div>" + esc(tx(r.error)) + "</div></div>"; return; }
      if (r.upToDate) { box.innerHTML = '<div class="callout ok" style="margin-top:13px">' + icon("circle-check") + "<div>" + esc(t("ver.upToDate")) + "</div></div>"; renderHome(); return; }
      var lst = (r.newCommits || []).map(function (c) { return "<li><code>" + esc(c) + "</code></li>"; }).join("");
      box.innerHTML = '<div class="callout acc" style="margin-top:13px">' + icon("arrow-up-circle") + "<div><b>" + esc(t("ver.available")) + " \u2014 " + r.behind + '</b><ul style="margin:6px 0 0;padding-left:18px">' + lst + "</ul></div></div>" +
        '<div class="actions" style="margin-top:0"><button class="btn primary" id="btnImpact">' + icon("file-diff") + "<span>" + esc(t("act.reviewImpact")) + "</span></button></div>";
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
  modal({ title: t("ver.impact"), body: '<div class="empty">' + icon("loader") + "\u2026</div>", wide: true, buttons: [{ label: t("act.close"), kind: "ghost" }] });
  api("/api/impact", {}).then(function (r) {
    if (r.error) { $("mBody").innerHTML = '<div class="callout warn">' + icon("triangle-alert") + "<div>" + esc(tx(r.error)) + "</div></div>"; return; }
    var h = '<dl class="props"><dt>version</dt><dd>v' + esc(r.fromVersion || "?") + " \u2192 v" + esc(r.toVersion || "?") + ' <span class="pill ' + (r.bump === "major" ? "warn" : "acc") + '">' + esc(r.bump || "") + "</span></dd>" +
      "<dt>tokens</dt><dd>+" + (r.tokensAdded || 0) + " / \u2212" + (r.tokensRemoved || []).length + "</dd>" +
      "<dt>specs</dt><dd>+" + (r.specsAdded || 0) + " / \u2212" + (r.specsRemoved || []).length + "</dd></dl>";
    var affected = r.affected || [];
    if (!(r.tokensRemoved || []).length && !(r.specsRemoved || []).length) {
      h += '<div class="callout ok">' + icon("circle-check") + "<div>" + esc(t("ver.impact.none")) + "</div></div>";
    } else {
      h += '<div class="callout warn">' + icon("triangle-alert") + "<div>" + esc(t("ver.impact.removed")) + " <b>" +
        esc((r.tokensRemoved || []).concat(r.specsRemoved || []).slice(0, 6).join(", ")) + "</b>" +
        (affected.length ? " \u2014 " + esc(t("ver.impact.usedIn")) + " <b>" + affected.length + "</b> " + esc(t("ver.impact.files")) : "") + "</div></div>";
      if (affected.length) h += '<div id="impactTable"></div>';
    }
    h += '<div class="actions"><button class="btn primary" id="btnDoUpdate">' + icon("arrow-up-circle") + "<span>" + esc(t("ver.update")) + "</span></button></div>";
    $("mBody").innerHTML = h;
    if (affected.length) paginate($("impactTable"), affected.map(function (f) {
      return '<tr><td class="mono">' + esc(f.file) + "</td><td>" + esc(f.hits) + "</td></tr>";
    }), ["file", "hits"]);
    $("btnDoUpdate").onclick = function () {
      api("/api/update-plan", {}).then(function (plan) {
        if (plan.error) return toast(tx(plan.error), true);
        showPlan({ plan: plan, nested: true, title: t("ver.update"), onConfirm: function () {
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
  modal({ title: path, desc: t("diff.title"), wide: true, body: '<div class="empty">' + icon("loader") + "\u2026</div>",
    buttons: [{ label: t("act.close"), kind: "ghost" }] });
  api("/api/diff", { file: path }).then(function (r) {
    if (r.error) { $("mBody").innerHTML = '<div class="callout warn">' + icon("triangle-alert") + "<div>" + esc(tx(r.error)) + "</div></div>"; return; }
    var lines = (r.diff || "").split("\n").map(function (l) {
      var c = l[0] === "+" ? "a" : l[0] === "-" ? "r" : l[0] === "@" ? "h" : "";
      return '<span class="' + c + '">' + esc(l) + "</span>";
    }).join("\n");
    $("mBody").innerHTML = '<div class="callout">' + icon("info") + "<div>" + esc(t("diff.restoreNote")) + " " + esc(r.wizardVersion || "") + ". " + esc(t("diff.backupNote")) + "</div></div>" +
      '<pre class="block diff">' + (lines || "\u2014") + "</pre>";
    modalSwap({
      title: path, desc: t("diff.title"), wide: true, body: $("mBody").innerHTML,
      buttons: [
        { label: t("act.restore"), icon: "rotate-ccw", keepOpen: true, onClick: function () { doRestore(path, true); } },
        { label: t("act.sendDesigner"), kind: "primary", icon: "mail", keepOpen: true, onClick: function () { changeRequest(path, true); } },
        { label: t("act.close"), kind: "ghost" },
      ],
    });
  });
}

function doRestore(path, nested) {
  api("/api/restore-plan", { file: path }).then(function (plan) {
    if (plan.error) return toast(tx(plan.error), true);
    showPlan({ plan: plan, nested: nested, title: t("act.restore") + " \u2014 " + path, onConfirm: function () {
      api("/api/restore", { file: path }).then(function (r) {
        if (r.error) return toast(tx(r.error), true);
        toast(t("log.done")); refresh();
      });
    } });
  });
}

function changeRequest(path, nested) {
  (nested ? modalPush : modal)({
    title: t("cr.title"), desc: t("cr.lead"),
    body: '<label class="field" style="margin-top:0"><span>' + esc(t("cr.reason")) + '</span><textarea id="crReason" placeholder="' + esc(t("cr.reason.ph")) + '"></textarea></label>',
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
  (OV.docs || []).forEach(function (f) { h += '<button data-doc="' + esc(f) + '">' + icon("file-text") + "<span>" + esc(f) + "</span></button>"; });
  h += "</div><div id="+'"docView"'+" style=\"margin-top:16px\"></div>";
  b.innerHTML = h;

  var openDoc = null;
  function closeDoc() {
    openDoc = null;
    $("docView").innerHTML = "";
    var all = b.querySelectorAll("[data-doc]");
    for (var k = 0; k < all.length; k++) all[k].classList.remove("sel");
  }

  var bs = b.querySelectorAll("[data-doc]");
  for (var i = 0; i < bs.length; i++) (function (btn) {
    btn.onclick = function () {
      var f = btn.getAttribute("data-doc");
      /* clicking the open document again closes it */
      if (openDoc === f) return closeDoc();
      openDoc = f;
      var all = b.querySelectorAll("[data-doc]");
      for (var k = 0; k < all.length; k++) all[k].classList.toggle("sel", all[k] === btn);
      var view = $("docView");
      view.innerHTML = '<div class="empty">' + icon("loader") + "\u2026</div>";
      fetch("/ds/" + f.split("/").map(encodeURIComponent).join("/")).then(function (r) { return r.text(); }).then(function (txt) {
        if (openDoc !== f) return; /* the user moved on while it loaded */
        view.innerHTML = '<div class="card docopen"><div class="dochead">' + icon("file-text") +
          "<span>" + esc(f) + '</span><button class="docx" id="docClose" aria-label="' + esc(t("act.close")) + '" title="' + esc(t("act.close")) + '">' +
          icon("x") + "</button></div>" +
          '<div class="body">' + mdBlock(txt, { full: true }) + "</div></div>";
        $("docClose").onclick = closeDoc;
        view.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    };
  })(bs[i]);
}

/* =========================================================== ABOUT page */
function renderAbout() {
  var o = OV || {};
  var m = (S && S.maintainer) || {};
  var name = m.name || "Raihan Allaam";
  var initials = name.split(/\s+/).map(function (w) { return w[0]; }).join("").slice(0, 2).toUpperCase();

  var handle = m.handle || "@alamehan";
  var site = m.url || "https://alamehan.github.io/";

  var h = '<div class="layers" style="margin-bottom:20px">' +
    '<div class="layer"><span class="lb">Truth</span><span class="lt"><b>' + esc(t("about.truth")) + "</b><span>" + esc(t("about.truth.d")) + "</span></span></div>" +
    '<div class="layer"><span class="lb">Reference</span><span class="lt"><b>' + esc(t("about.ref")) + "</b><span>" + esc(t("about.ref.d")) + "</span></span></div>" +
    '<div class="layer"><span class="lb">Binding</span><span class="lt"><b>' + esc(t("about.bind")) + "</b><span>" + esc(t("about.bind.d")) + "</span></span></div>" +
    "</div>";

  h += '<div class="card"><div class="body"><h2>' + icon("user-round") + esc(t("about.author")) + "</h2>" +
    '<div class="author"><div class="av">' + esc(initials) + "</div><div>" +
    '<div class="nm">' + esc(name) + ' <a class="handle" href="' + esc(site) + '" target="_blank" rel="noopener noreferrer" title="' + esc(site) + '">' + esc(handle) + "</a></div>" +
    '<div class="rl">' + esc(m.role || "UI/UX Designer, ITS Elabram") + "</div>" +
    (m.email ? '<div class="lk"><a href="' + esc(mailtoHref(m.email)) + '">' + icon("mail") + "<span>" + esc(t("about.contact")) + "</span></a>" +
      '<button class="btn ghost" id="copyMail" title="' + esc(m.email) + '">' + icon("copy") + "<span>" + esc(t("about.copyMail")) + "</span></button></div>" : "") +
    "</div></div>" +
    '<div class="note">' + icon("shield-check") + "<span>" + esc(t("about.offline")) + "</span></div></div></div>";

  h += '<div class="card"><div class="body"><h2>' + icon("info") + esc(t("about.build")) + '</h2><dl class="props">' +
    "<dt>" + esc(t("about.panelVer")) + "</dt><dd>v" + esc(S ? S.wizardVersion : "\u2014") + "</dd>" +
    "<dt>" + esc(t("about.dsVer")) + "</dt><dd>" + (o.version ? "v" + esc(o.version) : esc(t("status.notInstalled"))) + "</dd>" +
    "<dt>" + esc(t("about.builtFor")) + "</dt><dd>v" + esc(S ? S.builtForDs : "\u2014") + "</dd>" +
    "<dt>" + esc(t("about.typeface")) + "</dt><dd>Fustat \u00b7 DM Mono <span style=\"color:var(--faint)\">(SIL OFL 1.1)</span></dd>" +
    "<dt>" + esc(t("about.panelIcons")) + "</dt><dd>Lucide <span style=\"color:var(--faint)\">(ISC)</span></dd>" +
    "<dt>" + esc(t("about.productIcons")) + "</dt><dd>" + esc(o.icons || "Tabler") + " <span style=\"color:var(--faint)\">(MIT)</span></dd>" +
    '</dl><div class="note">' + icon("info") + "<span>" + esc(t("home.stack.note")) + "</span></div></div></div>";

  h += '<div class="actions"><button class="btn" id="aboutTour">' + icon("play") + "<span>" + esc(t("more.tour")) + "</span></button></div>";
  $("aboutBody").innerHTML = h;
  $("aboutTour").onclick = startTour;
  if ($("copyMail")) $("copyMail").onclick = function () { copy(m.email, t("about.mailCopied")); };
}

/* ========================================================= PROMPTS page */
var promptsDrawn = false;
var promptBodies = {};

/* Bound once, at load. Attaching these inside renderPrompts() added a fresh pair
   every time the library was redrawn - so after an uninstall and reinstall each
   copy fired twice. */
function promptFilled(id) {
  var txt = promptBodies[id] || "", box = $("pf-" + id);
  if (box) {
    var ins = box.querySelectorAll("[data-ph]");
    for (var i = 0; i < ins.length; i++) {
      var v = ins[i].value.trim();
      if (v) txt = txt.split(ins[i].getAttribute("data-ph")).join(v);
    }
  }
  return txt;
}
function promptRefresh(id) {
  var pre = $("pb-" + id); if (pre) pre.textContent = promptFilled(id);
  var box = $("pf-" + id); if (!box) return;
  var ins = box.querySelectorAll("[data-ph]"), left = 0;
  for (var i = 0; i < ins.length; i++) if (!ins[i].value.trim()) left++;
  var bd = $("pn-" + id);
  if (bd) { bd.textContent = left ? left + " " + t("prompts.fill") : t("prompts.ready"); bd.className = "badge" + (left ? "" : " ok"); }
}
document.addEventListener("input", function (e) {
  var n = e.target;
  if (!n.getAttribute || !n.getAttribute("data-ph")) return;
  var box = n.parentNode;
  while (box && (!box.id || box.id.indexOf("pf-") !== 0)) box = box.parentNode;
  if (box) promptRefresh(box.id.slice(3));
});
document.addEventListener("click", function (e) {
  var b = e.target.closest ? e.target.closest("[data-pc]") : null;
  if (b) copy(promptFilled(b.getAttribute("data-pc")));
});

function renderPrompts() {
  var lib = $("promptLib");
  var intro = $("promptIntro");
  if (!S || S.level === "not-installed") {
    intro.hidden = true;
    lib.innerHTML = '<div class="empty">' + icon("lock") + esc(t("prompts.locked")) + "</div>";
    promptsDrawn = false;
    return;
  }
  var list = S.prompts || [];
  if (!list.length) { intro.hidden = true; lib.innerHTML = '<div class="empty">' + icon("lock") + esc(t("prompts.locked")) + "</div>"; promptsDrawn = false; return; }
  intro.hidden = false;
  if (promptsDrawn) return;
  promptsDrawn = true;
  var cats = [], byCat = {};
  promptBodies = {};
  list.forEach(function (p) { promptBodies[p.id] = p.body; if (!byCat[p.cat]) { byCat[p.cat] = []; cats.push(p.cat); } byCat[p.cat].push(p); });

  function phOf(id) {
    var m = (promptBodies[id] || "").match(/\[[^\]\n]+\]/g) || [], u = [];
    m.forEach(function (x) { if (u.indexOf(x) < 0) u.push(x); });
    return u;
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
        '<pre class="block" id="pb-' + p.id + '" style="margin-top:11px"></pre></div></details>';
    });
  });
  lib.innerHTML = h;
  list.forEach(function (p) { promptRefresh(p.id); });
}

/* =============================================================== SETUP */
/* A comparison TABLE, not two cards.
 * The first attempt rendered two bordered boxes directly beneath two bordered
 * radio options, so it read as a second set of choices. A table is unambiguously
 * information. The selected column is tinted, nothing else. */
function levelCompare(active) {
  var rows = [
    ["setup.cmp.ai", "on", "on"],
    ["setup.cmp.gallery", "on", "on"],
    ["setup.cmp.classes", "off", "on"],
    ["setup.cmp.dark", "off", "on"],
    ["setup.cmp.build", "off", "cost:setup.cmp.build.v"],
    ["setup.cmp.code", "off", "on"],
  ];
  function cellHtml(v) {
    if (v === "on") return '<span class="on">' + icon("check") + "</span>";
    if (v === "off") return '<span class="off">\u2013</span>';
    return '<span class="cost">' + esc(t(v.slice(5))) + "</span>";
  }
  var h = '<div class="lvlwrap"><div class="lvlq">' + icon("info") + "<span>" + esc(t("setup.cmp.q")) + "</span></div>" +
    '<table class="lvl"><thead><tr><th></th>' +
    '<th class="' + (active === "0" ? "pick" : "") + '">' + esc(t("setup.level0.short")) + "</th>" +
    '<th class="' + (active === "1" ? "pick" : "") + '">' + esc(t("setup.level1.short")) + "</th></tr></thead><tbody>";
  rows.forEach(function (r) {
    h += "<tr><th>" + esc(t(r[0])) + "</th>" +
      '<td class="' + (active === "0" ? "pickcol" : "") + '">' + cellHtml(r[1]) + "</td>" +
      '<td class="' + (active === "1" ? "pickcol" : "") + '">' + cellHtml(r[2]) + "</td></tr>";
  });
  return h + "</tbody></table></div>";
}

function renderSetup() {
  if (!S) return;
  $("repoUrl").value = $("repoUrl").value || S.defaultRepoUrl || "";
  var installed = S.level !== "not-installed";
  $("btnProcess").querySelector("span").textContent = installed ? t("setup.recheck") : t("setup.process");

  var sel = (document.querySelector("input[name=lv]:checked") || {}).value || "0";
  $("lvlCompare").innerHTML = levelCompare(sel);

  /* ---- installed: the page becomes a receipt, and the form folds away ----
     The fold is permanent markup. An earlier version appended #setupForm into a
     container it later cleared with innerHTML = "", which destroyed the form node
     outright: after an uninstall renderSetup() then threw on a null reference,
     and because render() calls renderPrompts() after it, the Prompts tab kept
     stale content too. Two visible bugs, one piece of DOM surgery. Nothing is
     moved now. */
  var done = $("setupDone");
  var fold = $("setupFold");
  if (!installed) {
    done.innerHTML = "";
    fold.classList.add("always");   /* summary hidden, form always visible */
    fold.open = true;
    delete fold.dataset.touched;    /* so a reinstall starts folded again */
  } else {
    fold.classList.remove("always");
    if (!fold.dataset.touched) fold.open = false;
    var hint = elOnce("reinstallHint", "p", "hint", esc(t("setup.reinstall.hint")));
    if (hint.parentNode !== $("setupFoldBody")) $("setupFoldBody").insertBefore(hint, $("setupFoldBody").firstChild);
    var man = (S.manifest && S.manifest.managed) || [];
    var mf = S.manifest || {};
    var h = '<div class="donecard"><div class="dh">' + icon("circle-check", "ic-lg") + "<b>" + esc(t("setup.done.title")) + "</b></div>" +
      '<div class="dsub">' + esc(t("setup.done.sub")) + '</div><dl class="props">' +
      "<dt>" + esc(t("setup.done.level")) + "</dt><dd><b>" + esc(t("setup.level" + S.level + ".short")) + "</b> \u00b7 " + esc(t("setup.level" + S.level + ".tag")) + "</dd>" +
      "<dt>" + esc(t("setup.done.version")) + "</dt><dd>v" + esc(mf.dsVersion || (OV && OV.version) || "?") + ' <span class="mono" style="color:var(--faint)">' + esc(mf.dsCommit || "") + "</span></dd>" +
      "<dt>" + esc(t("setup.done.when")) + "</dt><dd>" + esc(mf.installedAt ? fmtDate(mf.installedAt) : "\u2014") + "</dd>" +
      "<dt>" + esc(t("setup.done.files")) + "</dt><dd>" + man.length + " " + esc(t("home.files")) + "</dd></dl></div>";

    /* the honest next step depends on where they are */
    if (String(S.level) === "0") {
      h += '<div class="nextup">' + icon("arrow-up-circle") + "<div><b>" + esc(t("setup.next.l1.t")) + "</b><p>" + esc(t("setup.next.l1.d")) +
        '</p><div class="acts"><button class="btn primary" id="goL1">' + icon("arrow-up-circle") + "<span>" + esc(t("setup.next.l1.cta")) + "</span></button>" +
        '<button class="btn ghost" id="goHealth2">' + icon("heart-pulse") + "<span>" + esc(t("nav.health")) + "</span></button></div></div></div>";
    } else {
      h += '<div class="nextup">' + icon("circle-check") + "<div><b>" + esc(t("setup.next.done.t")) + "</b><p>" + esc(t("setup.next.done.d")) +
        '</p><div class="acts"><button class="btn" id="goHealth2">' + icon("heart-pulse") + "<span>" + esc(t("nav.health")) + "</span></button>" +
        '<button class="btn ghost" id="goPrompts2">' + icon("library") + "<span>" + esc(t("nav.prompts")) + "</span></button></div></div></div>";
    }

    if (man.length) h += '<details class="fold card"><summary>' + icon("shield-check", "chev") + "<span>" + esc(t("setup.done.written")) +
      '</span><span class="count">' + man.length + '</span></summary><div class="body">' + managedTable(man) + "</div></details>";

    done.innerHTML = h;
    if ($("goL1")) $("goL1").onclick = function () {
      fold.dataset.touched = "1";
      fold.open = true;
      var l1 = document.querySelector('#levels label[data-v="1"]');
      if (l1) l1.click();
      fold.scrollIntoView({ behavior: "smooth", block: "center" });
    };
    if ($("goHealth2")) $("goHealth2").onclick = function () { go("health"); };
    if ($("goPrompts2")) $("goPrompts2").onclick = function () { go("prompts"); };
  }

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

  /* A bare mailto: link is a dead end when no mail client is registered - the
     click appears to do nothing at all. So this is a button that opens the draft
     AND copies the address, then says which it did. */
  var mail = S.maintainerEmail;
  var ask = $("askCode");
  if (mail) {
    ask.style.display = "";
    ask.title = mail;
    ask.onclick = function () {
      var href = "mailto:" + mail +
        "?subject=" + encodeURIComponent("[Design System] Level 1 access code \u2014 " + (S.root || "").split(/[\\/]/).pop()) +
        "&body=" + encodeURIComponent(
          "Hi Raihan,\n\nCould I get the Level 1 access code for this repo?\n\n---\nRepo: " +
          (S.originUrl || S.root || "?") + "\nDesign system: v" + ((OV && OV.version) || "?") +
          "\nPanel: v" + (S.wizardVersion || "?"));
      copy(mail, t("setup.l1code.copied"));
      try { window.location.href = href; } catch (e) {}
    };
  } else ask.style.display = "none";
}

/* ===================================================== GUIDED TOUR
 * Each step names the page it belongs to, so the tour navigates there before it
 * measures anything. In v3.3.0 the "hero" step had no page: when the panel
 * opened on Setup (which it does whenever the design system is not installed
 * yet), the tour tried to spotlight a hidden element, got a zero-sized rect, and
 * parked its card in the top-left corner pointing at nothing.
 *
 * Two guards now make that impossible:
 *   - every non-centred step declares `page`
 *   - visibleNode() refuses an element that is hidden or zero-sized, falling
 *     back to the pill-navigation button for that destination, and skipping the
 *     step only if even that is gone.
 */
var TOUR = [
  { centre: "welcome", k: "tour.welcome" },
  { page: "home", sel: '[data-tour="nav"]', k: "tour.nav" },
  { page: "home", sel: '[data-tour="hero"]', k: "tour.hero" },
  { page: "home", sel: '[data-tour="stats"]', fb: '.navb[data-nav="home"]', k: "tour.stats", needs: "installed" },
  { page: "home", sel: '[data-tour="adoption"]', fb: '.navb[data-nav="home"]', k: "tour.adoption", needs: "installed" },
  { page: "setup", sel: '[data-tour="level"]', fb: '.navb[data-nav="setup"]', k: "tour.level" },
  { page: "setup", sel: '[data-tour="process"]', fb: '.navb[data-nav="setup"]', k: "tour.process" },
  { page: "health", sel: '[data-tour="p-health"]', fb: '.navb[data-nav="health"]', k: "tour.health" },
  { page: "versions", sel: '[data-tour="p-versions"]', fb: '.navb[data-nav="versions"]', k: "tour.versions" },
  { page: "prompts", sel: '[data-tour="p-prompts"]', fb: '.navb[data-nav="prompts"]', k: "tour.prompts" },
  { page: "docs", sel: '[data-tour="p-docs"]', fb: '.navb[data-nav="docs"]', k: "tour.docs" },
  { page: "about", sel: '[data-tour="p-about"]', fb: '.navb[data-nav="about"]', k: "tour.about" },
  { page: "home", sel: '[data-tour="lang"]', k: "tour.lang" },
  { page: "home", sel: '[data-tour="more"]', k: "tour.more" },
  { centre: "finish", k: "tour.finish" },
];
var tourAt = 0, tourSteps = [], tourFrom = "home";

function visibleNode(step) {
  var cands = [step.sel, step.fb];
  for (var i = 0; i < cands.length; i++) {
    if (!cands[i]) continue;
    var n = document.querySelector(cands[i]);
    if (!n) continue;
    var r = n.getBoundingClientRect();
    if (n.offsetParent !== null && r.width > 2 && r.height > 2) return n;
  }
  return null;
}

function startTour() {
  closeMore();
  var installed = S && S.level !== "not-installed";
  tourSteps = TOUR.filter(function (x) { return !(x.needs === "installed" && !installed); });
  tourAt = 0;
  tourFrom = PAGE;
  $("tourScrim").classList.add("on");
  tourShow();
}

function endTour() {
  var v = $("tourCard").querySelector("video");
  if (v) { try { v.pause(); } catch (e) {} }
  $("tourScrim").classList.remove("on");
  $("tourCard").classList.remove("centered");
  localStorage.setItem("dsTourSeen", "1");
  if (tourFrom && tourFrom !== PAGE) go(tourFrom);
}

function tourProg() {
  var pct = tourSteps.length < 2 ? 100 : Math.round((tourAt + 1) / tourSteps.length * 100);
  return '<div class="tour-prog"><i style="width:' + pct + '%"></i></div>';
}

function tourNav(extra) {
  return tourProg() + '<div class="tf"><span class="sp"></span>' +
    '<button class="btn ghost" id="tSkip">' + esc(t("tour.skip")) + "</button>" +
    (tourAt > 0 ? '<button class="btn" id="tPrev">' + esc(t("tour.back")) + "</button>" : "") +
    '<button class="btn primary" id="tNext">' + esc(extra || (tourAt === tourSteps.length - 1 ? t("tour.done") : t("tour.next"))) + "</button></div>";
}

function tourBind(last) {
  $("tSkip").onclick = endTour;
  $("tNext").onclick = function () { if (last) return endTour(); tourAt++; tourShow(); };
  if ($("tPrev")) $("tPrev").onclick = function () { tourAt--; tourShow(); };
}

function tourShow() {
  var st = tourSteps[tourAt];
  if (!st) return endTour();
  if (st.centre) return tourCentre(st);

  var needsNav = st.page && PAGE !== st.page;
  if (needsNav) go(st.page);
  setTimeout(function () {
    var node = visibleNode(st);
    if (!node) {
      /* nothing to point at: move on rather than spotlighting a void */
      if (tourAt < tourSteps.length - 1) { tourAt++; return tourShow(); }
      return endTour();
    }
    node.scrollIntoView({ behavior: "smooth", block: "center" });
    setTimeout(function () { tourPlace(node, st); }, 250);
  }, needsNav ? 110 : 0);
}

/* Centred cards: the opening welcome (which can play the explainer) and the
   closing summary. Nothing to point at, so nothing is spotlighted. */
function tourCentre(st) {
  var hole = $("tourHole"), card = $("tourCard");
  hole.style.width = "0px"; hole.style.height = "0px";
  hole.style.left = "50%"; hole.style.top = "50%";
  card.classList.add("centered");
  card.style.left = ""; card.style.top = "";

  var last = tourAt === tourSteps.length - 1;
  var head = "", body = "";

  if (st.centre === "welcome") {
    var ex = (S && S.explainer) || {};
    head = '<div class="tbanner">' + icon("lightbulb") + "<span>" + esc(t("tour.video.banner")) + "</span>" +
      (ex.length ? "<b>" + esc(ex.length) + "</b>" : "") + "</div>";
    if (ex.video) {
      head += '<video class="tvid" controls preload="metadata" playsinline' +
        (ex.poster ? ' poster="/ds/' + ex.poster.split("/").map(encodeURIComponent).join("/") + '"' : "") +
        '><source src="/ds/' + ex.video.split("/").map(encodeURIComponent).join("/") + '"></video>';
    } else {
      head += '<div class="tvid tvid-soon">' + icon("play", "ic-xl") +
        "<b>" + esc(t("tour.video.soon")) + "</b><span>" + esc(t("tour.video.soon.d")) + "</span></div>";
    }
  } else {
    head = '<div class="tbanner ok">' + icon("circle-check") + "<span>" + esc(t("tour.finish.banner")) + "</span></div>";
    body = '<ul class="tlist"><li>' + t("tour.finish.a") + "</li><li>" + t("tour.finish.b") + "</li><li>" + t("tour.finish.c") + "</li></ul>";
  }

  card.innerHTML = '<div class="twelcome">' + head +
    '<div class="twrap"><div class="tstep">' + esc(t("tour.step")) + " " + (tourAt + 1) + "/" + tourSteps.length + "</div>" +
    "<h4>" + esc(t(st.k + ".t")) + "</h4><p>" + esc(t(st.k + ".d")) + "</p>" + body +
    tourNav(st.centre === "welcome" ? t("tour.begin") : t("tour.done")) + "</div></div>";
  tourBind(last);
}

function tourPlace(node, st) {
  $("tourCard").classList.remove("centered");
  var r = node.getBoundingClientRect(), pad = 8;
  var hole = $("tourHole"), card = $("tourCard");
  hole.style.left = (r.left - pad) + "px";
  hole.style.top = (r.top - pad) + "px";
  hole.style.width = (r.width + pad * 2) + "px";
  hole.style.height = (r.height + pad * 2) + "px";

  card.innerHTML = '<div class="tstep">' + esc(t("tour.step")) + " " + (tourAt + 1) + "/" + tourSteps.length + "</div>" +
    "<h4>" + esc(t(st.k + ".t")) + "</h4><p>" + esc(t(st.k + ".d")) + "</p>" + tourNav();

  var cw = Math.min(322, window.innerWidth - 32), ch = card.offsetHeight || 190;
  var below = r.bottom + 14, above = r.top - ch - 14;
  var top = (below + ch < window.innerHeight - 96) ? below : (above > 12 ? above : Math.max(12, (window.innerHeight - ch) / 2));
  var left = Math.min(Math.max(12, r.left + r.width / 2 - cw / 2), window.innerWidth - cw - 12);
  card.style.top = top + "px";
  card.style.left = left + "px";
  tourBind(tourAt === tourSteps.length - 1);
}

/* ============================================================== state */
function render() {
  applyI18n();
  renderHome(); renderSetup(); renderPrompts();
  if (PAGE === "health") renderHealth();
  if (PAGE === "versions") renderVersions();
  if (PAGE === "docs") renderDocs();
  if (PAGE === "about") renderAbout();
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
    $("lvlCompare").innerHTML = levelCompare(l.getAttribute("data-v"));
  };
});

function closeMore() { $("morePop").classList.remove("on"); $("btnMore").classList.remove("on"); $("btnMore").setAttribute("aria-expanded", "false"); }
$("btnMore").onclick = function (e) {
  e.stopPropagation();
  var on = $("morePop").classList.toggle("on");
  $("btnMore").classList.toggle("on", on);
  $("btnMore").setAttribute("aria-expanded", String(on));
};
document.addEventListener("click", function (e) { if (!e.target.closest || !e.target.closest(".morewrap")) closeMore(); });
$("btnTour").onclick = startTour;
$("btnTheme").onclick = function () { closeMore(); cycleTheme(); };

$("scrim").onclick = function (e) { if (e.target === $("scrim")) closeModal(); };
document.addEventListener("keydown", function (e) {
  if (e.key !== "Escape") return;
  if ($("tourScrim").classList.contains("on")) return endTour();
  if ($("morePop").classList.contains("on")) return closeMore();
  if ($("scrim").classList.contains("on")) return (mStack.length > 1 ? modalBack() : closeModal());
  if ($("docClose")) $("docClose").click();
});
window.addEventListener("resize", function () {
  if (!$("tourScrim").classList.contains("on")) return;
  var st = tourSteps[tourAt];
  if (st && st.welcome) return; /* centred by CSS; re-rendering would restart the video */
  tourShow();
});

function cfg() {
  return {
    repoUrl: $("repoUrl").value.trim(),
    level: (document.querySelector("input[name=lv]:checked") || {}).value || "0",
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
  closeMore();
  api("/api/shutdown", {}).then(function () {
    document.body.innerHTML = '<div style="padding:90px 24px;text-align:center;color:var(--muted);font-family:Fustat,sans-serif">' +
      esc(t("more.closed")) + "</div>";
  });
};

applyTheme();
applyI18n();
refresh().then(function () {
  if (S && S.level === "not-installed") go("setup");
  if (!localStorage.getItem("dsTourSeen")) setTimeout(startTour, 550);
});
