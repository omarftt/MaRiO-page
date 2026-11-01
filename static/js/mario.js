/* MaRiO project page: the example explorer. */
(function () {
  'use strict';

  var LETTERS = ['A', 'B', 'C', 'D'];
  var TASK_ORDER = [
    'Distance Awareness', 'Occlusion', 'Relative Position',
    'Egocentric Motion', 'Navigation'
  ];

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function nCorrect(item) {
    return item.predictions.filter(function (p) { return p.correct; }).length;
  }

  function viewStrip(item) {
    var wrap = el('div', 'views n' + item.agents);
    item.images.forEach(function (im, i) {
      var fig = el('figure', 'view a' + (i + 1));
      var pic = el('picture');
      var src = el('source');
      src.srcset = 'static/images/tasks/' + im.stem + '.webp';
      src.type = 'image/webp';
      var img = el('img');
      img.src = 'static/images/tasks/' + im.stem + '.jpg';
      img.loading = 'lazy';
      img.width = im.w; img.height = im.h;
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
    var legend = el('div', 'exp-legend');
    var panel = el('div', 'exp-panel');
    tabsHost.setAttribute('aria-label', 'Choose a reasoning task');
    host.appendChild(tabsHost);
    host.appendChild(legend);
    host.appendChild(panel);

    var tasks = TASK_ORDER.filter(function (t) {
      return items.some(function (i) { return i.task === t; });
    });

    // open on the example models find hardest, so the stakes are visible first
    var hardest = items.slice().sort(function (a, b) { return nCorrect(a) - nCorrect(b); })[0];
    var state = { task: hardest.task, agents: {} };
    state.agents[hardest.task] = hardest.agents;

    // legend for the tab dots, plus a per-example model score
    var keyStatic = el('span', 'key');
    keyStatic.appendChild(el('span', 'dot static'));
    keyStatic.appendChild(el('span', null, 'static perception'));
    var keyComp = el('span', 'key');
    keyComp.appendChild(el('span', 'dot comp'));
    keyComp.appendChild(el('span', null, 'compositional'));
    var score = el('span', 'exp-score');
    legend.appendChild(keyStatic);
    legend.appendChild(keyComp);
    legend.appendChild(score);

    function render() {
      Array.prototype.forEach.call(tabsHost.children, function (b) {
        b.setAttribute('aria-pressed', String(b.dataset.task === state.task));
      });

      var pool = items.filter(function (i) { return i.task === state.task; })
                      .sort(function (a, b) { return a.agents - b.agents; });
      var want = state.agents[state.task] || pool[0].agents;
      var item = pool.filter(function (i) { return i.agents === want; })[0] || pool[0];

      var ok = nCorrect(item), total = item.predictions.length;
      score.textContent = ok + ' of ' + total + ' models got this right';
      score.className = 'exp-score ' + (ok === 0 ? 'none' : ok === total ? 'all' : 'some');

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
        var isReal = item.source !== 'Simulator';
        bar.appendChild(el('span', 'chip src' + (isReal ? ' real' : ''), item.source));
        panel.appendChild(bar);
      }

      panel.appendChild(viewStrip(item));
      panel.appendChild(el('p', 'q-text', item.question));

      var opts = el('div', 'opts');
      var buttons = [];
      var revealed = false;
      var btn, note, preds;
      var answerLetter = LETTERS[item.choices.indexOf(item.answer)];

      function reveal(picked) {
        if (revealed) return;
        revealed = true;
        panel.classList.add('revealed');
        buttons.forEach(function (b) {
          b.classList.add(b.dataset.choice === item.answer ? 'is-answer' : 'is-wrong');
          if (picked != null && b.dataset.choice === picked) b.classList.add('is-picked');
        });
        btn.disabled = true;
        btn.textContent = 'Answer shown';
        if (picked == null) {
          note.textContent = 'The answer is ' + answerLetter + '.';
        } else if (picked === item.answer) {
          note.innerHTML = 'You picked <b>' + answerLetter + '</b>, which is right.';
        } else {
          note.innerHTML = 'You picked <b>' + LETTERS[item.choices.indexOf(picked)] +
                           '</b>. The answer is <b>' + answerLetter + '</b>.';
        }
        preds.hidden = false;
      }

      item.choices.forEach(function (choice, i) {
        var b = el('button', 'opt');
        b.type = 'button';
        b.dataset.choice = choice;
        b.appendChild(el('span', 'letter', LETTERS[i] + ')'));
        b.appendChild(el('span', null, choice));
        b.addEventListener('click', function () { reveal(choice); });
        buttons.push(b);
        opts.appendChild(b);
      });
      panel.appendChild(opts);

      var row = el('div', 'reveal-row');
      btn = el('button', 'reveal', 'Reveal answer');
      btn.type = 'button';
      btn.addEventListener('click', function () { reveal(null); });
      note = el('span', 'answer-note pick-note', 'Pick an option to see how you do against the models.');
      row.appendChild(btn); row.appendChild(note);
      panel.appendChild(row);

      preds = el('div', 'preds');
      preds.hidden = true;
      preds.appendChild(el('h3', null, 'What the models answered'));
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
      b.dataset.task = t;
      b.appendChild(el('span', 'dot ' + group));
      b.appendChild(el('span', null, t));
      b.addEventListener('click', function () { state.task = t; render(); });
      tabsHost.appendChild(b);
    });

    render();
  }

  document.addEventListener('DOMContentLoaded', function () {
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
