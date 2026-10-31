/* MaRiO project page: one example explorer, plus BibTeX copy. */
(function () {
  'use strict';

  var LETTERS = ['A', 'B', 'C', 'D'];
  var TASK_ORDER = [
    'Distance Awareness', 'Occlusion / Visibility', 'Relative Position',
    'Egocentric Motion', 'Navigation'
  ];

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function viewStrip(item) {
    var wrap = el('div', 'views n' + item.agents);
    item.images.forEach(function (stem, i) {
      var fig = el('figure', 'view a' + (i + 1));
      var pic = el('picture');
      var src = el('source');
      src.srcset = 'static/images/tasks/' + stem + '.webp';
      src.type = 'image/webp';
      var img = el('img');
      img.src = 'static/images/tasks/' + stem + '.jpg';
      img.loading = 'lazy';
      img.alt = "Agent " + (i + 1) + "'s view of the scene";
      pic.appendChild(src); pic.appendChild(img);
      fig.appendChild(pic);
      fig.appendChild(el('figcaption', null, 'Agent ' + (i + 1)));
      wrap.appendChild(fig);
    });
    return wrap;
  }

  function build(host, items) {
    host.innerHTML = '';
    var tabsHost = el('div', 'exp-tabs');
    var panel = el('div', 'exp-panel');
    tabsHost.setAttribute('role', 'tablist');
    tabsHost.setAttribute('aria-label', 'Reasoning tasks');
    host.appendChild(tabsHost);
    host.appendChild(panel);

    var tasks = TASK_ORDER.filter(function (t) {
      return items.some(function (i) { return i.task === t; });
    });
    var state = { task: tasks[0], agents: {} };

    function render() {
      Array.prototype.forEach.call(tabsHost.children, function (b) {
        b.setAttribute('aria-selected', String(b.dataset.task === state.task));
      });

      var pool = items.filter(function (i) { return i.task === state.task; })
                      .sort(function (a, b) { return a.agents - b.agents; });
      var want = state.agents[state.task] || pool[0].agents;
      var item = pool.filter(function (i) { return i.agents === want; })[0] || pool[0];

      panel.innerHTML = '';
      panel.classList.remove('revealed');

      if (pool.length > 1) {
        var bar = el('div', 'exp-bar');
        var seg = el('span', 'seg');
        pool.forEach(function (p) {
          var on = p.agents === item.agents;
          var b = el('button', on ? 'is-on' : null, p.agents + ' agents');
          b.type = 'button';
          b.setAttribute('aria-pressed', String(on));
          b.addEventListener('click', function () {
            if (on) return;
            state.agents[state.task] = p.agents;
            render();
          });
          seg.appendChild(b);
        });
        bar.appendChild(seg);
        panel.appendChild(bar);
      }

      panel.appendChild(viewStrip(item));
      panel.appendChild(el('p', 'q-text', item.question));

      var opts = el('div', 'opts');
      var buttons = [];
      var revealed = false;
      var btn, note, preds;

      function reveal() {
        if (revealed) return;
        revealed = true;
        panel.classList.add('revealed');
        buttons.forEach(function (b) {
          b.classList.add(b.dataset.choice === item.answer ? 'is-answer' : 'is-wrong');
        });
        btn.disabled = true;
        btn.textContent = 'Answer shown';
        note.textContent = '';
        preds.hidden = false;
      }

      item.choices.forEach(function (choice, i) {
        var b = el('button', 'opt');
        b.type = 'button';
        b.dataset.choice = choice;
        b.appendChild(el('span', 'letter', LETTERS[i] + ')'));
        b.appendChild(el('span', null, choice));
        b.addEventListener('click', reveal);
        buttons.push(b);
        opts.appendChild(b);
      });
      panel.appendChild(opts);

      var row = el('div', 'reveal-row');
      btn = el('button', 'reveal', 'Reveal answer');
      btn.type = 'button';
      btn.addEventListener('click', reveal);
      note = el('span', 'answer-note', 'Pick an option, or reveal it, to see what the models answered.');
      row.appendChild(btn); row.appendChild(note);
      panel.appendChild(row);

      preds = el('div', 'preds');
      preds.hidden = true;
      preds.appendChild(el('h4', null, 'What the models answered'));
      item.predictions.forEach(function (p) {
        var d = el('div', 'pred ' + (p.correct ? 'ok' : 'bad'));
        d.appendChild(el('span', 'who', p.model));
        d.appendChild(el('span', 'ans', p.answer));
        d.appendChild(el('span', 'mark', p.correct ? '✓' : '✗'));
        preds.appendChild(d);
      });
      panel.appendChild(preds);
    }

    tasks.forEach(function (t) {
      var group = items.filter(function (i) { return i.task === t; })[0].group;
      var b = el('button', 'exp-tab');
      b.type = 'button';
      b.setAttribute('role', 'tab');
      b.dataset.task = t;
      b.appendChild(el('span', 'dot ' + group));
      b.appendChild(el('span', null, t));
      b.addEventListener('click', function () { state.task = t; render(); });
      tabsHost.appendChild(b);
    });

    render();
  }

  function wireBibtex() {
    var btn = document.querySelector('[data-action="copy-bibtex"]');
    var code = document.getElementById('bibtex');
    if (!btn || !code || !navigator.clipboard) return;
    btn.addEventListener('click', function () {
      navigator.clipboard.writeText(code.textContent).then(function () {
        var old = btn.textContent;
        btn.textContent = 'Copied';
        setTimeout(function () { btn.textContent = old; }, 1600);
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    wireBibtex();
    var host = document.getElementById('explorer');
    if (!host) return;
    fetch('static/data/examples.json')
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (d) { build(host, d.items); })
      .catch(function (e) {
        host.innerHTML = '<p class="loading">Could not load the examples.</p>';
        console.error(e);
      });
  });
})();
