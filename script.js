// ====== EDITÁ ACÁ: enlaces, teléfonos y canales de cada escuela ======
const DIRECCION = "San Martín 663, Barrio Parque Roma, Glew, Almirante Brown, Buenos Aires";
const MAPA = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(DIRECCION);

const ESCUELAS = [
  {
    id: "secundaria", nombre: "Escuela de Educación Secundaria N.º 7", corto: "Secundaria N.º 7",
    tipo: "Institución educativa pública de nivel secundario", tel: "02224-435919", color: "#3a86ff",
    enlaces: [
      { t: "Sitio web", s: "página propia", u: "#" },        // reemplazá # por la web de la escuela
      { t: "Instagram", s: "novedades", u: "#" },
      { t: "Facebook", s: "comunidad", u: "#" },
      { t: "Aula virtual", s: "clases", u: "#" },
      { t: "Cómo llegar", s: "Google Maps", u: MAPA },
    ],
    stream: ""  // pegá acá el enlace "embed" de YouTube. Ej: https://www.youtube.com/embed/ID_DEL_VIDEO
  },
  {
    id: "cec", nombre: "CEC N.º 802", corto: "CEC N.º 802",
    tipo: "Institución educativa pública", tel: "02224-425791", color: "#0aa07b",
    enlaces: [
      { t: "Sitio web", s: "página propia", u: "#" },
      { t: "Instagram", s: "novedades", u: "#" },
      { t: "Facebook", s: "comunidad", u: "#" },
      { t: "Talleres", s: "propuestas", u: "#" },
      { t: "Cómo llegar", s: "Google Maps", u: MAPA },
    ],
    stream: ""
  },
  {
    id: "jardin", nombre: "Jardín de Infantes N.º 909", corto: "Jardín N.º 909",
    tipo: "Institución educativa pública de nivel inicial", tel: "02224 43-0358", color: "#ef476f",
    enlaces: [
      { t: "Sitio web", s: "página propia", u: "#" },
      { t: "Instagram", s: "novedades", u: "#" },
      { t: "Facebook", s: "familias", u: "#" },
      { t: "Galería", s: "fotos de salas", u: "#" },
      { t: "Cómo llegar", s: "Google Maps", u: MAPA },
    ],
    stream: ""
  },
];

// ====== CHAT EN TIEMPO REAL ======
// Pegá acá la URL de tu Firebase Realtime Database (sin barra final).
// Ej: "https://escuelas-glew-default-rtdb.firebaseio.com"
// Vacío = modo local (el chat solo se ve entre pestañas de esta misma computadora).
const FIREBASE_URL = "";
const PALABRAS_PROHIBIDAS = ["idiota", "estupido", "estúpido"]; // ampliá esta lista
const ESPERA_MS = 3000;          // modo lento: segundos entre mensajes
const CLAVE_TRANSMISION = "glew2026"; // CAMBIALA: es la clave del panel para transmitir
const MAX_ESPECTADORES = 8;           // cada espectador consume tu subida de internet
const EMOTES = ["❤️", "👏", "😂", "🎓", "🔥", "🎉"];

// ====== Render ======
const $ = (s) => document.querySelector(s);
const telHref = (t) => "tel:+54" + t.replace(/\D/g, "").replace(/^0/, "");

// Navegación
const items = [["inicio","Inicio"], ...ESCUELAS.map(e => [e.id, e.corto]), ["streaming","Streaming"], ["marketing","Marketing"]];
$("#nav").innerHTML = items.map(([id, t]) => `<a href="#${id}">${t}</a>`).join("");

// Secciones de escuelas
$("#schoolList").innerHTML = ESCUELAS.map(e => `
  <article class="school" id="${e.id}" style="--c:${e.color}">
    <div class="school-side">
      <h3>${e.nombre}</h3>
      <span class="tag">${e.tipo}</span>
    </div>
    <div class="school-body">
      <ul class="info">
        <li><b>Dirección:</b> ${DIRECCION}</li>
        <li><b>Teléfono:</b> <a href="${telHref(e.tel)}">${e.tel}</a></li>
      </ul>
      <div class="links">
        ${e.enlaces.map(l => {
          const ext = l.u !== "#";
          return `<a href="${l.u}" ${ext ? 'target="_blank" rel="noopener"' : ''}><span>${l.t}</span><small>${l.s}</small></a>`;
        }).join("")}
      </div>
    </div>
  </article>`).join("");

// Streaming
$("#streamTabs").innerHTML = ESCUELAS.map((e, i) =>
  `<button role="tab" data-i="${i}" aria-selected="${i === 0}">${e.corto}</button>`).join("");

function showStream(i) {
  const e = ESCUELAS[i];
  document.querySelectorAll("#streamTabs button").forEach(b => b.setAttribute("aria-selected", b.dataset.i == i));
  chat.join(e);
  live.show(e);
}
$("#streamTabs").addEventListener("click", ev => { const b = ev.target.closest("button"); if (b) showStream(+b.dataset.i); });

// Laboratorio de marketing
$("#labSchool").innerHTML = ESCUELAS.map(e => `<option value="${e.id}">${e.corto}</option>`).join("");
const PLANTILLAS = {
  acto: (e, f) => `Te esperamos en el acto de ${e.nombre}.\n📅 ${f}\n📍 ${DIRECCION}\nVení con tu familia y seguí la transmisión en vivo en nuestras redes.\n#Glew #EscuelaPública #Comunidad`,
  inscripcion: (e, f) => `Inscripción abierta en ${e.nombre}.\n📅 ${f}\n📍 ${DIRECCION}\n📞 ${e.tel}\nSumate a nuestra comunidad educativa.\n#Inscripciones #Glew`,
  clase: (e, f) => `Clase abierta en ${e.nombre}.\n📅 ${f}\n📍 ${DIRECCION}\nVení a conocer cómo aprendemos todos los días.\n#ClaseAbierta #Glew`,
};
$("#labGo").addEventListener("click", () => {
  const e = ESCUELAS.find(x => x.id === $("#labSchool").value);
  const f = $("#labDate").value.trim() || "a confirmar";
  $("#labOut").value = PLANTILLAS[$("#labType").value](e, f);
});
$("#labCopy").addEventListener("click", async () => {
  const txt = $("#labOut").value;
  if (!txt) return;
  try { await navigator.clipboard.writeText(txt); $("#labCopy").textContent = "Texto copiado"; }
  catch { $("#labOut").select(); }
  setTimeout(() => $("#labCopy").textContent = "Copiar texto", 1800);
});

// Resalta la sección activa en el menú
const links = [...document.querySelectorAll("nav a")];
const io = new IntersectionObserver(es => es.forEach(en => {
  if (en.isIntersecting) links.forEach(a => a.classList.toggle("on", a.getAttribute("href") === "#" + en.target.id));
}), { rootMargin: "-40% 0px -55% 0px" });
document.querySelectorAll("main section, .school").forEach(s => io.observe(s));

// ====== Motor del chat (estilo Twitch/Kick) ======
const chat = (() => {
  const log = $("#chatLog"), status = $("#chatStatus"), btnNew = $("#chatNew");
  let room = null, es = null, bc = null, seen = new Set(), last = 0, stick = true;

  const colorDe = (n) => { let h = 0; for (const c of n) h = (h * 31 + c.charCodeAt(0)) % 360; return `hsl(${h} 80% 68%)`; };
  const limpio = (s) => { const d = document.createElement("div"); d.textContent = s; return d.innerHTML; };
  const filtrar = (s) => PALABRAS_PROHIBIDAS.reduce((t, p) => t.replace(new RegExp(p, "gi"), "*".repeat(p.length)), s);

  function pintar(m, id) {
    if (id && seen.has(id)) return;
    if (id) seen.add(id);
    const el = document.createElement("div");
    el.className = "msg" + (m.sys ? " sys" : "");
    el.innerHTML = m.sys ? limpio(m.m)
      : `<b style="color:${colorDe(m.n)}">${limpio(m.n)}</b>: ${limpio(m.m)}`;
    log.appendChild(el);
    while (log.children.length > 150) log.firstChild.remove();
    if (stick) log.scrollTop = log.scrollHeight; else btnNew.hidden = false;
  }

  function cerrar() { if (es) es.close(); if (bc) bc.close(); es = bc = null; }

  function setEstado(txt, ok) { status.textContent = txt; status.classList.toggle("ok", !!ok); }

  function join(escuela) {
    if (room === escuela.id) return;
    cerrar(); room = escuela.id; seen = new Set(); log.innerHTML = ""; stick = true; btnNew.hidden = true;
    $("#chatTitle").textContent = "Chat · " + escuela.corto;
    pintar({ sys: true, m: "Bienvenido al chat de " + escuela.corto + ". Sé respetuoso." });

    if (FIREBASE_URL) {
      const base = `${FIREBASE_URL}/chat/${room}.json`;
      es = new EventSource(`${base}?orderBy="$key"&limitToLast=50`);
      es.onopen = () => setEstado("en vivo", true);
      es.onerror = () => setEstado("reconectando…");
      const onPut = (ev) => {
        const { path, data } = JSON.parse(ev.data);
        if (!data) return;
        if (path === "/") Object.entries(data).forEach(([k, v]) => pintar(v, k));
        else pintar(data, path.slice(1));
      };
      es.addEventListener("put", onPut);
    } else {
      setEstado("modo local");
      bc = new BroadcastChannel("chat-" + room);
      bc.onmessage = (ev) => pintar(ev.data, ev.data.id);
    }
  }

  async function enviar(nombre, texto) {
    const m = { n: nombre, m: texto, t: Date.now() };
    if (FIREBASE_URL) {
      await fetch(`${FIREBASE_URL}/chat/${room}.json`, { method: "POST", body: JSON.stringify(m) });
    } else {
      m.id = "l" + m.t + Math.random();
      pintar(m, m.id);
      bc.postMessage(m);
    }
  }

  log.addEventListener("scroll", () => {
    stick = log.scrollTop + log.clientHeight >= log.scrollHeight - 20;
    if (stick) btnNew.hidden = true;
  });
  btnNew.addEventListener("click", () => { stick = true; log.scrollTop = log.scrollHeight; btnNew.hidden = true; });

  // Nombre guardado
  const inName = $("#chatName"), inMsg = $("#chatMsg"), hint = $("#chatHint");
  try { inName.value = localStorage.getItem("chatName") || ""; } catch {}

  $("#emotes").innerHTML = EMOTES.map(e => `<button type="button" aria-label="Emoji ${e}">${e}</button>`).join("");
  $("#emotes").addEventListener("click", ev => { if (ev.target.matches("button")) { inMsg.value += ev.target.textContent; inMsg.focus(); } });

  $("#chatForm").addEventListener("submit", async ev => {
    ev.preventDefault();
    const nombre = inName.value.trim().replace(/\s+/g, " ");
    const texto = filtrar(inMsg.value.trim());
    if (!nombre) { hint.textContent = "Escribí tu nombre para chatear."; inName.focus(); return; }
    if (!texto) return;
    const falta = ESPERA_MS - (Date.now() - last);
    if (falta > 0) { hint.textContent = `Modo lento: esperá ${Math.ceil(falta / 1000)} s.`; return; }
    last = Date.now();
    try { localStorage.setItem("chatName", nombre); } catch {}
    inMsg.value = ""; hint.textContent = "Sé respetuoso. Máx. 200 caracteres.";
    try { await enviar(nombre, texto); }
    catch { hint.textContent = "No se pudo enviar. Revisá la conexión."; }
  });

  return { join };
})();


// ====== TRANSMISIÓN EN VIVO DESDE LA PÁGINA (WebRTC) ======
// La señalización usa Firebase (si FIREBASE_URL está cargado) o BroadcastChannel (pruebas en pestañas).
const live = (() => {
  const ICE = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] };
  const myId = "u" + Math.random().toString(36).slice(2, 10);
  let esc = null, bus = null, role = "viewer", pcView = null, stream = null, raws = [];
  const pcs = new Map();

  function abrirBus(room, onMsg, onOpen) {
    if (FIREBASE_URL) {
      const url = `${FIREBASE_URL}/signal/${room}.json`;
      const es = new EventSource(url);
      es.onopen = () => onOpen && onOpen();
      es.addEventListener("put", ev => {
        const { path, data } = JSON.parse(ev.data);
        if (path === "/" || !data) return; // ignora mensajes viejos
        onMsg(data);
      });
      return {
        send: m => fetch(url, { method: "POST", body: JSON.stringify(m) }).catch(() => {}),
        close: () => es.close(),
        clear: () => fetch(url, { method: "DELETE" }).catch(() => {}),
      };
    }
    const bc = new BroadcastChannel("live-" + room);
    bc.onmessage = ev => onMsg(ev.data);
    setTimeout(() => onOpen && onOpen(), 0);
    return { send: m => bc.postMessage(m), close: () => bc.close(), clear: () => {} };
  }

  // Espera a que el navegador junte sus rutas de red (así no hace falta enviar candidatos sueltos)
  const listo = pc => new Promise(res => {
    if (pc.iceGatheringState === "complete") return res();
    const f = () => { if (pc.iceGatheringState === "complete") { pc.removeEventListener("icegatheringstatechange", f); res(); } };
    pc.addEventListener("icegatheringstatechange", f);
    setTimeout(res, 3000);
  });

  // ---------- Espectador ----------
  function setMsg(t, dot = true) {
    const m = $("#liveMsg"); if (!m) return;
    m.hidden = false;
    m.innerHTML = `<div class="player-msg">${dot ? '<span class="live-dot"></span>' : ""}<p>${t}</p></div>`;
  }
  const hello = () => bus && bus.send({ from: myId, type: "hello" });
  function cerrarVista() { if (pcView) pcView.close(); pcView = null; }

  async function onViewerMsg(m) {
    if (m.from === myId || (m.to && m.to !== myId)) return;
    if (m.type === "live-on") hello();
    else if (m.type === "live-off") { cerrarVista(); const v = $("#liveVideo"); if (v) v.srcObject = null; setMsg("La transmisión terminó. ¡Gracias por mirar!", false); }
    else if (m.type === "full") setMsg("La transmisión está llena en este momento. Probá de nuevo en unos minutos.", false);
    else if (m.type === "offer") {
      cerrarVista();
      const pc = pcView = new RTCPeerConnection(ICE);
      pc.ontrack = e => { const v = $("#liveVideo"); if (v) { v.srcObject = e.streams[0]; $("#liveMsg").hidden = true; $("#unmute").hidden = !v.muted; } };
      pc.onconnectionstatechange = () => { if (pc.connectionState === "failed") { setMsg("Se cortó la conexión. Reconectando…"); setTimeout(hello, 1500); } };
      await pc.setRemoteDescription(JSON.parse(m.data));
      await pc.setLocalDescription(await pc.createAnswer());
      await listo(pc);
      bus.send({ from: myId, to: m.from, type: "answer", data: JSON.stringify(pc.localDescription) });
    }
  }

  function show(e) {
    if (role === "host") return;
    esc = e; $("#bcSchool").textContent = e.corto;
    cerrarVista(); if (bus) { bus.close(); bus = null; }
    if (e.stream) { $("#player").innerHTML = `<iframe src="${e.stream}" title="Transmisión de ${e.corto}" allowfullscreen></iframe>`; return; }
    $("#player").innerHTML = '<video id="liveVideo" autoplay playsinline muted></video><button class="unmute" id="unmute" type="button" hidden>🔊 Activar sonido</button><div class="overlay" id="liveMsg"></div>';
    setMsg(`${e.corto} no está transmitiendo ahora. Cuando empiece, el video aparece solo.`);
    $("#unmute").onclick = () => { const v = $("#liveVideo"); v.muted = false; v.play(); $("#unmute").hidden = true; };
    bus = abrirBus(e.id, onViewerMsg, hello);
  }

  // ---------- Transmisor ----------
  const contar = () => {
    const n = [...pcs.values()].filter(p => p.connectionState === "connected").length;
    $("#bcInfo").textContent = `🔴 En vivo · ${n} espectador${n === 1 ? "" : "es"} conectado${n === 1 ? "" : "s"}`;
  };

  async function onHostMsg(m) {
    if (m.from === myId || (m.to && m.to !== myId)) return;
    if (m.type === "hello") {
      const prev = pcs.get(m.from); if (prev) { prev.close(); pcs.delete(m.from); }
      if (pcs.size >= MAX_ESPECTADORES) return bus.send({ from: myId, to: m.from, type: "full" });
      const pc = new RTCPeerConnection(ICE);
      pcs.set(m.from, pc);
      stream.getTracks().forEach(t => pc.addTrack(t, stream));
      pc.onconnectionstatechange = () => { if (["failed", "closed"].includes(pc.connectionState)) pcs.delete(m.from); contar(); };
      await pc.setLocalDescription(await pc.createOffer());
      await listo(pc);
      bus.send({ from: myId, to: m.from, type: "offer", data: JSON.stringify(pc.localDescription) });
    } else if (m.type === "answer") {
      const pc = pcs.get(m.from);
      if (pc && pc.signalingState === "have-local-offer") await pc.setRemoteDescription(JSON.parse(m.data));
    }
  }

  async function empezar(src) {
    if (!navigator.mediaDevices) throw new Error("Hace falta abrir la página con HTTPS.");
    if (src === "screen") {
      const pantalla = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
      const mic = await navigator.mediaDevices.getUserMedia({ audio: true }).catch(() => null);
      raws = [pantalla, mic].filter(Boolean);
      const ac = new AudioContext(), dest = ac.createMediaStreamDestination();
      raws.forEach(s => s.getAudioTracks().length && ac.createMediaStreamSource(new MediaStream(s.getAudioTracks())).connect(dest));
      stream = new MediaStream([...pantalla.getVideoTracks(), ...dest.stream.getAudioTracks()]);
    } else {
      stream = await navigator.mediaDevices.getUserMedia({ video: { width: { ideal: 960 }, height: { ideal: 540 }, frameRate: { ideal: 24 } }, audio: true });
      raws = [stream];
    }
    stream.getVideoTracks()[0].onended = detener;
    if (bus) { bus.close(); bus = null; }
    cerrarVista();
    if (FIREBASE_URL) await fetch(`${FIREBASE_URL}/signal/${esc.id}.json`, { method: "DELETE" }).catch(() => {});
    role = "host";
    bus = abrirBus(esc.id, onHostMsg, () => bus.send({ from: myId, type: "live-on" }));
    $("#player").innerHTML = '<video id="liveVideo" autoplay playsinline muted></video><div class="live-badge">EN VIVO</div>';
    $("#liveVideo").srcObject = stream;
    document.querySelectorAll("#streamTabs button").forEach(b => b.disabled = true);
    $("#bcStart").hidden = true; $("#bcStop").hidden = false; contar();
  }

  function detener() {
    if (role !== "host") return;
    bus.send({ from: myId, type: "live-off" });
    pcs.forEach(p => p.close()); pcs.clear();
    raws.forEach(s => s.getTracks().forEach(t => t.stop())); stream.getTracks().forEach(t => t.stop());
    const b = bus; setTimeout(() => { b.clear(); b.close(); }, 800);
    bus = null; role = "viewer";
    document.querySelectorAll("#streamTabs button").forEach(x => x.disabled = false);
    $("#bcStart").hidden = false; $("#bcStop").hidden = true; $("#bcInfo").textContent = "Transmisión terminada.";
    show(esc);
  }

  const entrar = () => {
    if ($("#bcPass").value === CLAVE_TRANSMISION) { $("#bcLock").hidden = true; $("#bcCtrl").hidden = false; }
    else $("#bcErr").textContent = "Clave incorrecta.";
  };
  $("#bcUnlock").onclick = entrar;
  $("#bcPass").addEventListener("keydown", ev => { if (ev.key === "Enter") entrar(); });
  $("#bcStart").onclick = async () => {
    $("#bcInfo").textContent = "Iniciando…";
    try { await empezar(document.querySelector("input[name=bcSrc]:checked").value); }
    catch (err) { $("#bcInfo").textContent = "No se pudo iniciar. Revisá los permisos de cámara, micrófono o pantalla (y que la página use HTTPS)."; }
  };
  $("#bcStop").onclick = detener;

  return { show };
})();

showStream(0);
