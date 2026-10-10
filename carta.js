/* =============================================================
   CARTA ASSOMBRADA — olhos que seguem, piscam, rosnado e abertura
   Não precisa mexer aqui. Os dados ficam no config.js.
   ============================================================= */
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var palco = $('palco');

  // Centro de cada pupila em px da imagem original (1254x1254) e o ângulo do "rasgo" do olho.
  var pupilas = [
    { el: $('pup-esq'), ang: 31.6 * Math.PI / 180 },
    { el: $('pup-dir'), ang: -27.6 * Math.PI / 180 }
  ];
  var ALCANCE_LONGO = 58; // quanto a pupila anda ao longo do olho
  var ALCANCE_CURTO = 13; // quanto anda para cima/baixo

  /* ---------- Escala: 1px da imagem original em px da tela ---------- */
  var escala = 1;
  function medir() {
    escala = palco.clientWidth / 1254;
    palco.style.setProperty('--u', escala + 'px');
  }
  medir();
  window.addEventListener('resize', medir);

  /* ---------- Para onde os olhos olham ---------- */
  var alvo = { x: 0, y: 0 };   // -1 a 1
  var atual = { x: 0, y: 0 };
  var ultimoToque = 0;
  var piscando = 1;            // 1 = aberto, 0 = fechado
  var arregalado = 1;
  var aberto = false;

  function olharPara(clientX, clientY) {
    var r = palco.getBoundingClientRect();
    var dx = (clientX - (r.left + r.width * 0.54)) / (r.width * 0.7);
    var dy = (clientY - (r.top + r.height * 0.36)) / (r.height * 0.7);
    var len = Math.hypot(dx, dy);
    if (len > 1) { dx /= len; dy /= len; }
    alvo.x = dx; alvo.y = dy;
    ultimoToque = performance.now();
  }
  window.addEventListener('pointermove', function (e) { olharPara(e.clientX, e.clientY); });
  window.addEventListener('pointerdown', function (e) { olharPara(e.clientX, e.clientY); });
  window.addEventListener('touchmove', function (e) {
    var t = e.touches[0]; if (t) olharPara(t.clientX, t.clientY);
  }, { passive: true });

  // Inclinar o celular: Android libera direto; no iPhone fica de fora (pediria permissão)
  if (window.DeviceOrientationEvent && typeof DeviceOrientationEvent.requestPermission !== 'function') {
    window.addEventListener('deviceorientation', function (e) {
      if (e.gamma == null || performance.now() - ultimoToque < 2500) return; // dedo tem prioridade
      alvo.x = Math.max(-1, Math.min(1, e.gamma / 30));
      alvo.y = Math.max(-1, Math.min(1, (e.beta - 45) / 30));
      ultimoToque = performance.now() - 1500;
    });
  }

  // Sem ninguém mexendo: olha em volta sozinho
  var proximaEspiada = 0;
  function espiar(agora) {
    if (agora - ultimoToque < 2000 || agora < proximaEspiada) return;
    if (Math.random() < 0.3) { alvo.x = 0; alvo.y = 0.15; } // encara quem está vendo
    else { alvo.x = Math.random() * 2 - 1; alvo.y = Math.random() * 1.2 - 0.6; }
    proximaEspiada = agora + 900 + Math.random() * 1900;
  }

  // Piscar de vez em quando
  function piscar() {
    var t0 = performance.now();
    (function passo(agora) {
      var t = (agora - t0) / 230;
      piscando = t >= 1 ? 1 : (t < 0.4 ? 1 - t / 0.4 : (t - 0.4) / 0.6);
      if (t < 1) requestAnimationFrame(passo);
    })(t0);
  }
  (function agendar() {
    setTimeout(function () { if (!aberto) piscar(); agendar(); }, 2200 + Math.random() * 3800);
  })();

  function desenhar(agora) {
    espiar(agora);
    atual.x += (alvo.x - atual.x) * 0.12;
    atual.y += (alvo.y - atual.y) * 0.12;
    pupilas.forEach(function (p) {
      var ux = Math.cos(p.ang), uy = Math.sin(p.ang); // ao longo do olho
      var nx = -uy, ny = ux;                          // atravessado
      var a = atual.x * ux + atual.y * uy;
      var b = atual.x * nx + atual.y * ny;
      var ox = (ux * a * ALCANCE_LONGO + nx * b * ALCANCE_CURTO) * escala;
      var oy = (uy * a * ALCANCE_LONGO + ny * b * ALCANCE_CURTO) * escala;
      var sy = Math.max(0.06, piscando) * arregalado;
      p.el.style.transform = 'translate(' + ox.toFixed(2) + 'px,' + oy.toFixed(2) + 'px) scale(' + arregalado + ',' + sy.toFixed(3) + ')';
    });
    requestAnimationFrame(desenhar);
  }
  requestAnimationFrame(desenhar);

  /* ---------- Som (gerado no navegador, sem arquivo de áudio) ---------- */
  var mudo = false;
  $('som').addEventListener('click', function (e) {
    e.stopPropagation();
    mudo = !mudo;
    this.setAttribute('aria-pressed', String(mudo));
    this.setAttribute('aria-label', mudo ? 'Ligar som' : 'Desligar som');
  });

  var ctx = null;
  function rosnar() {
    if (mudo) return;
    try {
      ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
      if (ctx.state === 'suspended') ctx.resume();
      var t = ctx.currentTime;
      var saida = ctx.createDynamicsCompressor();
      saida.connect(ctx.destination);

      // rosnado: duas ondas graves tremendo
      var corpo = ctx.createGain(); corpo.gain.value = 0.5;
      [68, 71.5].forEach(function (f) {
        var o = ctx.createOscillator(); o.type = 'sawtooth';
        o.frequency.setValueAtTime(f, t);
        o.frequency.exponentialRampToValueAtTime(f * 0.62, t + 1.4);
        o.connect(corpo); o.start(t); o.stop(t + 1.6);
      });
      var tremor = ctx.createOscillator(); tremor.frequency.value = 21;
      var tremorG = ctx.createGain(); tremorG.gain.value = 0.45;
      tremor.connect(tremorG).connect(corpo.gain); tremor.start(t); tremor.stop(t + 1.6);

      var filtro = ctx.createBiquadFilter(); filtro.type = 'lowpass'; filtro.Q.value = 7;
      filtro.frequency.setValueAtTime(1100, t);
      filtro.frequency.exponentialRampToValueAtTime(220, t + 1.5);
      var env = ctx.createGain();
      env.gain.setValueAtTime(0.0001, t);
      env.gain.exponentialRampToValueAtTime(0.9, t + 0.07);
      env.gain.exponentialRampToValueAtTime(0.0001, t + 1.55);
      corpo.connect(filtro).connect(env).connect(saida);

      // bafo: ruído soprado
      var n = ctx.sampleRate * 1.4, buf = ctx.createBuffer(1, n, ctx.sampleRate), d = buf.getChannelData(0);
      for (var i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
      var ruido = ctx.createBufferSource(); ruido.buffer = buf;
      var bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 520; bp.Q.value = 0.9;
      var envR = ctx.createGain();
      envR.gain.setValueAtTime(0.0001, t);
      envR.gain.exponentialRampToValueAtTime(0.35, t + 0.12);
      envR.gain.exponentialRampToValueAtTime(0.0001, t + 1.35);
      ruido.connect(bp).connect(envR).connect(saida); ruido.start(t);

      // pancada grave no começo
      var boom = ctx.createOscillator(); boom.type = 'sine';
      boom.frequency.setValueAtTime(90, t); boom.frequency.exponentialRampToValueAtTime(35, t + 0.5);
      var envB = ctx.createGain();
      envB.gain.setValueAtTime(0.8, t); envB.gain.exponentialRampToValueAtTime(0.0001, t + 0.6);
      boom.connect(envB).connect(saida); boom.start(t); boom.stop(t + 0.65);
    } catch (e) { /* sem som, segue normal */ }
  }

  /* ---------- Abrir: acorda, engole e vai para o convite ---------- */
  var semMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function animarArregalar(de, para, ms) {
    var t0 = performance.now();
    (function passo(agora) {
      var t = Math.min(1, (agora - t0) / ms);
      arregalado = de + (para - de) * (1 - Math.pow(1 - t, 3));
      if (t < 1) requestAnimationFrame(passo);
    })(t0);
  }

  function abrir() {
    if (aberto) return;
    aberto = true;
    rosnar();
    if (navigator.vibrate) navigator.vibrate([70, 40, 140]);
    alvo.x = 0; alvo.y = 0.15; ultimoToque = performance.now() + 5000; // encara
    animarArregalar(1, 1.45, 260);
    palco.classList.add('acordou');
    document.body.classList.add('abrindo');

    setTimeout(function () {
      palco.classList.add('engolindo');
      document.body.classList.add('saindo');
    }, semMovimento ? 300 : 900);

    // Leva o nome do convidado junto para o convite
    setTimeout(function () {
      location.href = 'convite.html' + location.search;
    }, semMovimento ? 800 : 1700);
  }

  palco.addEventListener('click', abrir);
  palco.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); abrir(); }
  });

  // Ao voltar pelo botão "voltar" do celular, a carta fecha de novo
  window.addEventListener('pageshow', function (e) {
    if (!e.persisted) return;
    aberto = false; arregalado = 1; ultimoToque = 0;
    palco.classList.remove('acordou', 'engolindo');
    document.body.classList.remove('abrindo', 'saindo');
  });
})();
