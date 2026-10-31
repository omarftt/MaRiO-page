/* MaRiO project page — leaderboard table, task gallery, qualitative explorer. */
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

  function getJSON(url) {
    return fetch(url).then(function (r) {
      if (!r.ok) throw new Error(url + ': ' + r.status);
      return r.json();
    });
  }

  /* ---------------------------------------------------------------- leaderboard */

  function buildLeaderboard(host, data) {
    var cols = data.columns.concat(['Overall', 'Avg']);
    var table = el('table', 'mtable lb');

    var thead = el('thead');
    var r1 = el('tr');
    var th = el('th', 'ta-l', 'Model');
    th.rowSpan = 2;
    r1.appendChild(th);
    Object.keys(data.groups).forEach(function (g) {
      var c = el('th', 'grp', g);
      c.colSpan = data.groups[g].length;
      r1.appendChild(c);
    });
    ['Overall', 'Avg.'].forEach(function (t) {
      var c = el('th', null, t);
      c.rowSpan = 2;
      r1.appendChild(c);
    });
    thead.appendChild(r1);

    var r2 = el('tr');
    data.columns.forEach(function (c) { r2.appendChild(el('th', null, c + '.')); });
    thead.appendChild(r2);
    table.appendChild(thead);

    var tbody = el('tbody');

    function addRow(row, extraCls) {
      var tr = el('tr', extraCls || null);
      tr.appendChild(el('td', 'ta-l model', row.model));
      cols.forEach(function (c) {
        var td = el('td', null, row[c].toFixed(1));
        var g = row.grp && row.grp[c];
        if (g === 1) td.classList.add('g1');
        else if (g === 2) td.classList.add('g2');
        if (row.glb && row.glb[c] === 1) td.classList.add('global');
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    }

    data.reference.forEach(function (row, i) {
      addRow(row, i === 0 ? 'ref human' : 'ref');
    });

    data.blocks.forEach(function (block) {
      var tr = el('tr', 'blockhead');
      var td = el('td', 'ta-l');
      td.colSpan = cols.length + 1;
      td.appendChild(el('span', 'pin', block.name));
      tr.appendChild(td);
      tbody.appendChild(tr);
      block.rows.forEach(function (row) { addRow(row); });
    });

    table.appendChild(tbody);
    host.innerHTML = '';
    host.appendChild(table);
  }

  /* ------------------------------------------------------------- shared pieces */

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
      img.width = 640;
      img.alt = 'Agent ' + (i + 1) + "'s view of the scene";
      pic.appendChild(src);
      pic.appendChild(img);
      fig.appendChild(pic);
      fig.appendChild(el('figcaption', null, 'Agent ' + (i + 1)));
      wrap.appendChild(fig);
    });
    return wrap;
  }

  function metaRow(item, withAgentChip) {
    var meta = el('div', 'q-meta');
    meta.appendChild(el('span', 'chip ' + item.group, item.task));
    if (withAgentChip !== false) meta.appendChild(el('span', 'chip', item.agents + ' agents'));
    return meta;
  }

  /* ------------------------------------------------------------- task gallery */

  function buildGallery(host, items) {
    var tabsHost = host.querySelector('.gal-tabs');
    var panel = host.querySelector('.gal-panel');
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

      var meta = metaRow(item, pool.length < 2);
      if (pool.length > 1) {
        var sw = el('span', 'exp-nav seg');
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
          sw.appendChild(b);
        });
        meta.appendChild(sw);
      }
      panel.appendChild(meta);
      panel.appendChild(viewStrip(item));
      panel.appendChild(el('p', 'q-text', item.question));

      var opts = el('div', 'opts');
      var revealed = false;
      var buttons = [];

      function reveal() {
        if (revealed) return;
        revealed = true;
        panel.classList.add('revealed');
        buttons.forEach(function (b) {
          b.classList.add(b.dataset.choice === item.answer ? 'is-answer' : 'is-wrong');
        });
        btn.disabled = true;
        btn.textContent = 'Answer shown';
        note.textContent = 'Correct answer: ' + item.answer;
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
      var btn = el('button', 'reveal', 'Reveal answer');
      btn.type = 'button';
      btn.addEventListener('click', reveal);
      var note = el('span', 'answer-note', 'Pick an option, or reveal it.');
      row.appendChild(btn);
      row.appendChild(note);
      panel.appendChild(row);
      panel.classList.remove('revealed');
    }

    tasks.forEach(function (t) {
      var group = items.filter(function (i) { return i.task === t; })[0].group;
      var b = el('button', 'gal-tab');
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

  /* --------------------------------------------------------- qualitative explorer */

  function buildExplorer(host, items) {
    host.innerHTML = '';
    var bar = el('div', 'exp-bar');
    var panel = el('div', 'exp-panel');

    var taskSel = el('select');
    taskSel.setAttribute('aria-label', 'Filter by task');
    var optAll = el('option', null, 'All tasks');
    optAll.value = '';
    taskSel.appendChild(optAll);
    TASK_ORDER.forEach(function (t) {
      if (!items.some(function (i) { return i.task === t; })) return;
      var o = el('option', null, t);
      o.value = t;
      taskSel.appendChild(o);
    });

    var agentSel = el('select');
    agentSel.setAttribute('aria-label', 'Filter by number of agents');
    [['', 'Any'], ['2', '2 agents'], ['3', '3 agents']].forEach(function (p) {
      var o = el('option', null, p[1]);
      o.value = p[0];
      agentSel.appendChild(o);
    });

    var lblT = el('label', null, 'Task');
    var lblA = el('label', null, 'Agents');
    bar.appendChild(lblT); bar.appendChild(taskSel);
    bar.appendChild(lblA); bar.appendChild(agentSel);

    var nav = el('div', 'exp-nav');
    var prev = el('button', null, '← Prev');
    var count = el('span', 'exp-count', '');
    var next = el('button', null, 'Next →');
    prev.type = next.type = 'button';
    nav.appendChild(prev); nav.appendChild(count); nav.appendChild(next);
    bar.appendChild(nav);

    host.appendChild(bar);
    host.appendChild(panel);

    var idx = 0;

    function pool() {
      return items.filter(function (i) {
        return (!taskSel.value || i.task === taskSel.value) &&
               (!agentSel.value || String(i.agents) === agentSel.value);
      });
    }

    function render() {
      var list = pool();
      if (!list.length) {
        panel.innerHTML = '';
        panel.appendChild(el('p', 'loading', 'No example matches that combination.'));
        count.textContent = '0 of 0';
        prev.disabled = next.disabled = true;
        return;
      }
      if (idx >= list.length) idx = 0;
      if (idx < 0) idx = list.length - 1;
      var item = list[idx];

      count.textContent = (idx + 1) + ' of ' + list.length;
      prev.disabled = next.disabled = list.length < 2;

      panel.innerHTML = '';
      panel.appendChild(metaRow(item));
      panel.appendChild(viewStrip(item));
      panel.appendChild(el('p', 'q-text', item.question));

      var preds = el('div', 'preds');
      preds.appendChild(el('h4', null, 'Ground truth and model predictions'));

      function line(cls, who, answer, mark) {
        var d = el('div', 'pred ' + cls);
        d.appendChild(el('span', 'who', who));
        d.appendChild(el('span', 'ans', answer));
        d.appendChild(el('span', 'mark', mark));
        return d;
      }
      preds.appendChild(line('gt', 'Ground truth', item.answer, '✓'));
      item.predictions.forEach(function (p) {
        preds.appendChild(line(p.correct ? 'ok' : 'bad', p.model, p.answer, p.correct ? '✓' : '✗'));
      });
      panel.appendChild(preds);
    }

    prev.addEventListener('click', function () { idx -= 1; render(); });
    next.addEventListener('click', function () { idx += 1; render(); });
    taskSel.addEventListener('change', function () { idx = 0; render(); });
    agentSel.addEventListener('change', function () { idx = 0; render(); });

    render();
  }

  /* ---------------------------------------------------------------- bibtex copy */

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

  /* ---------------------------------------------------------------------- boot */

  document.addEventListener('DOMContentLoaded', function () {
    wireBibtex();

    var lb = document.getElementById('leaderboard');
    if (lb) {
      getJSON('static/data/leaderboard.json')
        .then(function (d) { buildLeaderboard(lb, d); })
        .catch(function (e) {
          lb.innerHTML = '<p class="loading">Could not load the results table.</p>';
          console.error(e);
        });
    }

    var gal = document.getElementById('gallery');
    var exp = document.getElementById('explorer');
    if (gal || exp) {
      getJSON('static/data/examples.json')
        .then(function (d) {
          if (gal) buildGallery(gal, d.items);
          if (exp) buildExplorer(exp, d.items);
        })
        .catch(function (e) {
          if (gal) gal.innerHTML = '<p class="loading">Could not load the examples.</p>';
          if (exp) exp.innerHTML = '<p class="loading">Could not load the examples.</p>';
          console.error(e);
        });
    }
  });
})();
