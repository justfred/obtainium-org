// Biography client enhancements — progressive: every control is a working
// link without JS; this just upgrades "next" and "random" to act in-place.


const WF_BASE = window.WF_BASE || "/";
const manifestPromise = fetch(WF_BASE + "threads.json")
  .then((r) => (r.ok ? r.json() : { threads: {}, all: [] }))
  .catch(() => ({ threads: {}, all: [] }));

function pickRandom(list, notUrl) {
  if (!list || !list.length) return null;
  if (list.length === 1) return list[0];
  let choice;
  do {
    choice = list[Math.floor(Math.random() * list.length)];
  } while (choice.url === notUrl && list.length > 1);
  return choice;
}

function nextIn(list, currentUrl) {
  if (!list || !list.length) return null;
  const i = list.findIndex((a) => a.url === currentUrl);
  if (i === -1) return list[0];
  return list[(i + 1) % list.length];
}

manifestPromise.then((manifest) => {
  const here = location.pathname;

  // Brand + header random links → go directly to a random article.
  for (const id of ["brand-random", "header-random"]) {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener("click", (e) => {
        const pick = pickRandom(manifest.all, here);
        if (pick) { e.preventDefault(); location.href = pick.url; }
      });
    }
  }

  // Comment link — set subject to current page title.
  const commentLink = document.getElementById("comment-link");
  if (commentLink) {
    const title = document.title.replace(/\s*·.*$/, "").trim();
    commentLink.href = `mailto:justfred@obtainium.org?subject=${encodeURIComponent(title)}`;
  }

  // Inline entity glyphs + thread-nav controls.
  document.addEventListener("click", (e) => {
    const rand = e.target.closest(".ent-rand, .tn-rand");
    const next = e.target.closest(".ent-next");
    const node = rand || next;
    if (!node) return;
    const holder = node.closest("[data-thread]");
    const slug = holder && holder.getAttribute("data-thread");
    const list = manifest.threads[slug];
    if (!list) return; // fall through to the href
    const target = rand ? pickRandom(list, here) : nextIn(list, here);
    if (target) {
      e.preventDefault();
      location.href = target.url;
    }
  });

  // Front page: random story (photo-led when one has a picture).
  const featured = document.getElementById("featured");
  if (featured) {
    const withImg = manifest.all.filter((a) => a.img);
    const render = () => {
      const pick = pickRandom(withImg.length && Math.random() < 0.75 ? withImg : manifest.all, null);
      featured.innerHTML = pick
        ? `<a class="feature-card${pick.img ? " has-img" : ""}" href="${pick.url}">${pick.img ? `<img src="${pick.img}" alt="">` : ""}<span class="feature-go">Read →</span><span class="feature-title">${pick.title}</span><span class="feature-source">${[pick.date && pick.date.slice(0, 4), pick.source].filter(Boolean).join(" · ")}</span></a>`
        : `<p>No articles yet.</p>`;
    };
    render();
    const reroll = document.getElementById("reroll");
    if (reroll) reroll.addEventListener("click", render);
    const ms = parseInt(document.body.dataset.rotate || "0", 10);
    if (ms > 0) setInterval(render, ms);
  }

  // On this day: same month-day, any year (Jan 1 is a year-only placeholder, so
  // it's skipped). Nothing today → widen to the nearest days, up to a week.
  const otd = document.getElementById("onthisday");
  if (otd) {
    const today = new Date();
    const md = (d) => d.toISOString().slice(5, 10);
    const dated = manifest.all.filter((a) => a.date && a.date.slice(5) !== "01-01");
    let hits = [], span = 0;
    for (; span <= 3 && !hits.length; span++) {
      const days = new Set();
      for (let k = -span; k <= span; k++) days.add(md(new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate() + k))));
      hits = dated.filter((a) => days.has(a.date.slice(5)));
    }
    hits.sort((a, b) => a.date.localeCompare(b.date));
    document.getElementById("otd-date").textContent =
      today.toLocaleDateString(undefined, { month: "long", day: "numeric" }) + (span > 1 ? " · this week" : "");
    otd.innerHTML = hits.length
      ? `<ul class="otd">${hits.map((a) => `<li><span class="otd-year">${a.date.slice(0, 4)}</span><a href="${a.url}">${a.title}</a></li>`).join("")}</ul>`
      : `<p class="front-sub">Nothing on this date yet.</p>`;
  }

  // Faces: show a random handful of the portraits (all are in the HTML for no-JS).
  const faces = document.getElementById("faces");
  if (faces) {
    const items = [...faces.children];
    const show = () => {
      const order = items.map((li) => [Math.random(), li]).sort((a, b) => a[0] - b[0]);
      order.forEach(([, li], i) => { li.hidden = i >= 8; faces.appendChild(li); });
    };
    show();
    const more = document.getElementById("faces-reroll");
    if (more) more.addEventListener("click", show);
  }
});
