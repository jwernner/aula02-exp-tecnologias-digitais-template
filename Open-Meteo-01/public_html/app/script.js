const el = (id) => document.getElementById(id);

const statusBox = el("status");
const resultBox = el("result");
const rawJson = el("rawJson");

const tempEl = el("temp");
const windEl = el("wind");
const timeEl = el("time");

function setStatus(type, message) {
  statusBox.className = `status ${type}`;
  statusBox.textContent = message;
}

function showResult(show) {
  resultBox.classList.toggle("hidden", !show);
}

function validateLatLon(lat, lon) {
  if (Number.isNaN(lat) || Number.isNaN(lon)) return "Latitude/longitude inválidas.";
  if (lat < -90 || lat > 90) return "Latitude deve estar entre -90 e 90.";
  if (lon < -180 || lon > 180) return "Longitude deve estar entre -180 e 180.";
  return null;
}

async function fetchWeather() {
  const lat = parseFloat(el("lat").value);
  const lon = parseFloat(el("lon").value);
  const tz = el("tz").value?.trim() || "America/Sao_Paulo";

  const err = validateLatLon(lat, lon);
  if (err) {
    setStatus("error", err);
    showResult(false);
    return;
  }

  // Endpoint Open-Meteo (sem API key)
  const url =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${encodeURIComponent(lat)}` +
    `&longitude=${encodeURIComponent(lon)}` +
    `&current_weather=true` +
    `&timezone=${encodeURIComponent(tz)}`;

  setStatus("loading", "Consultando API…");
  showResult(false);

  try {
    const t0 = performance.now();
    const resp = await fetch(url);
    const t1 = performance.now();

    if (!resp.ok) {
      throw new Error(`HTTP ${resp.status} — ${resp.statusText}`);
    }

    const data = await resp.json();

    // Campos principais (current_weather)
    const cw = data.current_weather;
    if (!cw) {
      throw new Error("Resposta sem current_weather.");
    }

    tempEl.textContent = `${cw.temperature} °C`;
    windEl.textContent = `${cw.windspeed} km/h`;
    timeEl.textContent = `${cw.time}`;

    rawJson.textContent = JSON.stringify(
      { endpoint: url, latency_ms: Math.round(t1 - t0), data },
      null,
      2
    );

    setStatus("ok", `OK — resposta em ~${Math.round(t1 - t0)} ms`);
    showResult(true);

  } catch (e) {
    setStatus("error", `Erro: ${e.message}`);
    rawJson.textContent = "";
    showResult(false);
  }
}

el("btnFetch").addEventListener("click", fetchWeather);

el("btnSP").addEventListener("click", () => {
  el("lat").value = "-23.5505";
  el("lon").value = "-46.6333";
  el("tz").value = "America/Sao_Paulo";
});

el("btnFLN").addEventListener("click", () => {
  el("lat").value = "-27.5949";
  el("lon").value = "-48.5482";
  el("tz").value = "America/Sao_Paulo";
});

// Primeira execução opcional (comente se não quiser)
fetchWeather();
