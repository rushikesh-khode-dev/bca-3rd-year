/* BCA E-Books — simple app: semester switch, book cards, PDF viewer */
(function () {
  "use strict";
  var BOOKS = window.BOOKS;
  var booksEl = document.getElementById("books");
  var seg = document.querySelector(".seg");
  document.getElementById("yr").textContent = new Date().getFullYear();

  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }

  var ICONS = {
    Theory: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 4h6a4 4 0 0 1 4 4v13a3 3 0 0 0-3-3H2z"/><path d="M22 4h-6a4 4 0 0 0-4 4v13a3 3 0 0 1 3-3h7z"/></svg>',
    Practical: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 18l6-6-6-6"/><path d="M8 6l-6 6 6 6"/></svg>',
    Project: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>'
  };
  var I_OPEN = '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></svg>';
  var I_DL = '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12M7 10l5 5 5-5M5 21h14"/></svg>';

  /* ---------- book cards ---------- */
  function card(b, i) {
    var cls = b.type.toLowerCase() + (b.file ? "" : " soon");
    return '<article class="book ' + cls + '" style="--i:' + i + '">' +
      '<div class="book-top"><div class="icon">' + ICONS[b.type] + '</div><div class="book-info">' +
        '<div class="tag-row">' + b.code + '<span class="tag">' + b.type + '</span></div>' +
        '<h3>' + esc(b.name) + '</h3>' +
        '<div class="meta">' + (b.file ? b.pages + ' pages · ' + b.sizeMB + ' MB' : 'Book not available yet') + '</div>' +
      '</div></div>' +
      '<div class="actions">' + (b.file ?
        '<a class="btn open" href="#/read/' + b.code + '">' + I_OPEN + 'Open</a>' +
        '<a class="btn dl" href="' + b.file + '" download>' + I_DL + 'Download</a>' :
        '<span class="btn">Coming soon</span>') +
      '</div></article>';
  }

  var currentSem = 0;
  function showSem(sem, animate) {
    sem = sem === 6 ? 6 : 5;
    seg.dataset.active = sem;
    document.getElementById("tab5").setAttribute("aria-selected", sem === 5);
    document.getElementById("tab6").setAttribute("aria-selected", sem === 6);
    if (sem === currentSem) return;
    currentSem = sem;
    try { localStorage.setItem("bca-sem", sem); } catch (e) {}

    var list = BOOKS.filter(function (b) { return b.sem === sem; });
    var groups = [["Theory", "Theory Books"], ["Practical", "Practical Books"], ["Project", "Project"]];
    var i = 0;
    var html = groups.map(function (g) {
      var items = list.filter(function (b) { return b.type === g[0]; });
      if (!items.length) return "";
      return '<div class="group"><div class="group-h"><h2>' + g[1] + '</h2><span>' + items.length + '</span></div><div class="grid">' +
        items.map(function (b) { return card(b, i++); }).join("") + '</div></div>';
    }).join("");

    if (animate) {
      booksEl.classList.add("switching");
      setTimeout(function () { booksEl.innerHTML = html; booksEl.classList.remove("switching"); }, 180);
    } else booksEl.innerHTML = html;
  }

  seg.addEventListener("click", function (e) {
    var b = e.target.closest("button[data-sem]"); if (!b) return;
    location.hash = "#/sem/" + b.dataset.sem;
  });

  /* ---------- PDF viewer (PDF.js — works on phones too) ---------- */
  var viewer = document.getElementById("viewer"), vPages = document.getElementById("vPages"), vBadge = document.getElementById("vBadge");
  var V = null;

  function openViewer(code) {
    var b = BOOKS.filter(function (x) { return x.code === code && x.file; })[0];
    if (!b) { location.hash = "#/sem/" + (currentSem || 5); return; }
    if (V && V.code === code) return;
    closeViewer(true);
    showSem(b.sem, false);

    document.getElementById("vName").textContent = b.name;
    document.getElementById("vMeta").textContent = b.code + " · " + b.pages + " pages";
    var dl = document.getElementById("vDl"); dl.href = b.file;
    viewer.hidden = false; viewer.classList.remove("closing");
    document.body.classList.add("viewing");
    vBadge.textContent = "";
    vPages.innerHTML = '<div class="vmsg"><b>Opening ' + esc(b.name) + '</b>' + b.sizeMB + ' MB · please wait<div class="vbar-progress"><i id="vProg"></i></div></div>';

    var st = V = { code: code, b: b, zoom: 1, dead: false, drawn: {} };

    function fallback() {
      // Use the browser's own PDF viewer if the built-in one can't run
      vPages.innerHTML = '<iframe class="vframe" src="' + b.file + '" title="' + esc(b.name) + '"></iframe>';
      vPages.style.padding = "0"; vPages.style.display = "flex";
    }
    vPages.style.padding = ""; vPages.style.display = "";
    if (!window.pdfjsLib || location.protocol === "file:") { fallback(); return; }
    pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

    var task = pdfjsLib.getDocument({ url: b.file });
    task.onProgress = function (d) { var p = document.getElementById("vProg"); if (p && d.total) p.style.width = Math.round(d.loaded / d.total * 100) + "%"; };
    task.promise.then(function (doc) {
      if (st.dead) { doc.destroy(); return; }
      st.doc = doc;
      return doc.getPage(1).then(function (p1) {
        var vp = p1.getViewport({ scale: 1 });
        st.ratio = vp.height / vp.width; st.baseW = vp.width;
        build();
      });
    }).catch(function () { if (!st.dead) fallback(); });

    function pageWidth() {
      var fit = Math.min(vPages.clientWidth - 28, 900);
      return Math.round(fit * st.zoom);
    }
    function build() {
      vPages.innerHTML = "";
      for (var n = 1; n <= st.doc.numPages; n++) {
        var d = document.createElement("div");
        d.className = "pg loading"; d.dataset.n = n;
        vPages.appendChild(d);
      }
      size();
      st.io = new IntersectionObserver(function (ents) {
        ents.forEach(function (e) { var n = +e.target.dataset.n; if (e.isIntersecting) draw(n); else undraw(n); });
      }, { root: vPages, rootMargin: "1200px 0px" });
      Array.prototype.forEach.call(vPages.children, function (el) { st.io.observe(el); });
      vPages.scrollTop = 0;
      updateBadge();
    }
    function size() {
      var w = pageWidth();
      Array.prototype.forEach.call(vPages.children, function (el) {
        el.style.width = w + "px"; el.style.height = Math.round(w * (el._ratio || st.ratio)) + "px";
      });
      Object.keys(st.drawn).forEach(function (n) { if (st.drawn[n]) { st.drawn[n] = false; draw(+n); } });
    }
    function draw(n) {
      if (st.dead || st.drawn[n]) return;
      st.drawn[n] = true;
      var el = vPages.children[n - 1];
      st.doc.getPage(n).then(function (pg) {
        if (st.dead || !st.drawn[n]) return;
        var base = pg.getViewport({ scale: 1 });
        el._ratio = base.height / base.width;
        var w = parseFloat(el.style.width);
        el.style.height = Math.round(w * el._ratio) + "px";
        var dpr = Math.min(window.devicePixelRatio || 1, 2.5);
        var vp = pg.getViewport({ scale: w / base.width * dpr });
        var cv = document.createElement("canvas");
        cv.width = Math.floor(vp.width); cv.height = Math.floor(vp.height);
        return pg.render({ canvasContext: cv.getContext("2d"), viewport: vp }).promise.then(function () {
          if (st.dead || !st.drawn[n]) return;
          var old = el.querySelector("canvas"); if (old) old.remove();
          el.appendChild(cv); el.classList.remove("loading");
        });
      }).catch(function () {});
    }
    function undraw(n) {
      if (!st.drawn[n]) return;
      st.drawn[n] = false;
      var el = vPages.children[n - 1];
      if (el) { var c = el.querySelector("canvas"); if (c) c.remove(); el.classList.add("loading"); }
    }
    function currentPage() {
      var mid = vPages.scrollTop + vPages.clientHeight * 0.4, els = vPages.children, lo = 0, hi = els.length - 1, ans = 1;
      while (lo <= hi) { var m = (lo + hi) >> 1; if (els[m].offsetTop <= mid) { ans = m + 1; lo = m + 1; } else hi = m - 1; }
      return ans;
    }
    function updateBadge() { if (st.doc) vBadge.textContent = "Page " + currentPage() + " of " + st.doc.numPages; }
    var tick = false;
    st.onScroll = function () { if (tick) return; tick = true; requestAnimationFrame(function () { tick = false; updateBadge(); }); };
    vPages.addEventListener("scroll", st.onScroll);
    st.zoomBy = function (f) {
      if (!st.doc) return;
      var p = currentPage(), el = vPages.children[p - 1], off = el ? (vPages.scrollTop - el.offsetTop) / el.offsetHeight : 0;
      st.zoom = Math.max(0.6, Math.min(st.zoom * f, 3));
      size();
      el = vPages.children[p - 1];
      if (el) vPages.scrollTop = el.offsetTop + off * el.offsetHeight;
    };
    st.onResize = function () { if (st.doc) { var p = currentPage(); size(); var el = vPages.children[p - 1]; if (el) vPages.scrollTop = el.offsetTop - 10; } };
    window.addEventListener("resize", st.onResize);
  }

  function closeViewer(instant) {
    if (!V) return;
    var st = V; V = null; st.dead = true;
    if (st.io) st.io.disconnect();
    vPages.removeEventListener("scroll", st.onScroll);
    window.removeEventListener("resize", st.onResize);
    if (st.doc) try { st.doc.destroy(); } catch (e) {}
    document.body.classList.remove("viewing");
    if (instant) { viewer.hidden = true; vPages.innerHTML = ""; return; }
    viewer.classList.add("closing");
    setTimeout(function () { if (!V) { viewer.hidden = true; vPages.innerHTML = ""; } }, 280);
  }

  document.getElementById("vClose").onclick = function () { location.hash = "#/sem/" + (currentSem || 5); };
  document.getElementById("zIn").onclick = function () { if (V && V.zoomBy) V.zoomBy(1.2); };
  document.getElementById("zOut").onclick = function () { if (V && V.zoomBy) V.zoomBy(1 / 1.2); };
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && V) document.getElementById("vClose").click(); });

  /* ---------- router ---------- */
  function route() {
    var p = location.hash.replace(/^#\/?/, "").split("/");
    if (p[0] === "read" && p[1]) { openViewer(p[1]); return; }
    closeViewer(false);
    var saved = 5; try { saved = +localStorage.getItem("bca-sem") || 5; } catch (e) {}
    var sem = p[0] === "sem" ? +p[1] : saved;
    var first = !currentSem;
    showSem(sem, !first);
  }
  window.addEventListener("hashchange", route);
  route();
})();
