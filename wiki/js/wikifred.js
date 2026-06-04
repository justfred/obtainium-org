// WikiFred client enhancements — progressive: every control is a working
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

  // Welcome page feature.
  const featured = document.getElementById("featured");
  if (featured) {
    const render = () => {
      const pick = pickRandom(manifest.all, null);
      featured.innerHTML = pick
        ? `<a class="feature-card" href="${pick.url}"><span class="feature-go">Read →</span><span class="feature-title">${pick.title}</span></a>`
        : `<p>No articles yet.</p>`;
    };
    render();
    const reroll = document.getElementById("reroll");
    if (reroll) reroll.addEventListener("click", render);
    const ms = parseInt(document.body.dataset.rotate || "0", 10);
    if (ms > 0) setInterval(render, ms);
  }
});
