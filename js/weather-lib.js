/* Shared weather helpers (Open-Meteo, no API key) + header chip + live readouts. */
(function () {
  "use strict";
  var LB = (window.LBBC = window.LBBC || {});

  var PLACES = [
    { id: "long-beach",     name: "Long Beach",     lat: 40.5884, lon: -73.6579 },
    { id: "point-lookout",  name: "Point Lookout",  lat: 40.5937, lon: -73.5768 },
    { id: "lido-beach",     name: "Lido Beach",     lat: 40.5884, lon: -73.6180 },
    { id: "atlantic-beach", name: "Atlantic Beach", lat: 40.5898, lon: -73.7254 },
    { id: "rockaway-beach", name: "Rockaway Beach", lat: 40.5848, lon: -73.8160 },
    { id: "arverne",        name: "Arverne",        lat: 40.5895, lon: -73.7893 },
    { id: "lawrence",       name: "Lawrence",       lat: 40.6159, lon: -73.7324 },
    { id: "cedarhurst",     name: "Cedarhurst",     lat: 40.6226, lon: -73.7243 }
  ];
  var DIRS = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  var CACHE_MS = 10 * 60 * 1000;

  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }
  function place(id) { return PLACES.filter(function (p) { return p.id === id; })[0] || PLACES[0]; }
  function currentPlace() { return place(store("lbbc-place")); }
  function setPlace(id) { store("lbbc-place", id); }

  /* ---- units (data is always fetched imperial; converted for display) ---- */
  function units() { return store("lbbc-units") === "metric" ? "metric" : "imperial"; }
  function setUnits(u) { store("lbbc-units", u); }
  function temp(f) { return units() === "metric" ? Math.round((f - 32) * 5 / 9) : Math.round(f); }
  function tempUnit() { return units() === "metric" ? "°C" : "°F"; }
  function speed(mph) { return units() === "metric" ? Math.round(mph * 1.609) : Math.round(mph); }
  function speedUnit() { return units() === "metric" ? "km/h" : "mph"; }
  function dirName(deg) { return DIRS[Math.round(deg / 45) % 8]; }

  /* ---- ride score: 0-100, inputs in °F / mph / % / in / UV index ---- */
  function score(p) {
    var s = 100;
    s -= Math.max(0, p.wind - 6) * 2.4;
    s -= Math.max(0, p.gust - 18) * 1.1;
    if (p.feels < 55) s -= (55 - p.feels) * 1.6; else if (p.feels > 78) s -= (p.feels - 78) * 2.2;
    s -= (p.pop || 0) * 0.35;
    if (p.precip > 0.01) s -= 20 + Math.min(p.precip * 40, 25);
    if (p.uv > 8) s -= (p.uv - 8) * 2;
    if (!p.day) s -= 12;
    s = Math.max(0, Math.min(100, Math.round(s)));
    var tone = s >= 80 ? "prime" : s >= 60 ? "good" : s >= 40 ? "fair" : "skip";
    var label = { prime: "Prime", good: "Good", fair: "Fair", skip: "Skip it" }[tone];
    return { score: s, tone: tone, label: label };
  }

  /* ---- weather codes ---- */
  function describe(code) {
    if (code === 0) return "Clear";
    if (code <= 2) return "Partly cloudy";
    if (code === 3) return "Overcast";
    if (code === 45 || code === 48) return "Fog";
    if (code >= 51 && code <= 57) return "Drizzle";
    if (code >= 61 && code <= 67) return "Rain";
    if (code >= 71 && code <= 77) return "Snow";
    if (code >= 80 && code <= 82) return "Showers";
    if (code === 85 || code === 86) return "Snow showers";
    if (code >= 95) return "Thunderstorm";
    return "Cloudy";
  }
  function icon(code, day) {
    var p = '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">';
    var sun = '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>';
    var moon = '<path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z"/>';
    var cloud = '<path d="M7 18h10a4 4 0 0 0 .6-7.95A5.5 5.5 0 0 0 7 9.5 4.25 4.25 0 0 0 7 18z"/>';
    var g;
    if (code === 0) g = day ? sun : moon;
    else if (code <= 2) g = (day ? '<circle cx="8" cy="8" r="3"/><path d="M8 1.5v1.2M1.5 8h1.2M3.4 3.4l.9.9M12.6 3.4l-.9.9"/>' : '<path d="M10 4a4 4 0 1 0 4 5"/>') + '<path d="M9 20h8a3.5 3.5 0 0 0 .5-6.96A4.8 4.8 0 0 0 9 12.8 3.6 3.6 0 0 0 9 20z"/>';
    else if (code === 3) g = cloud;
    else if (code === 45 || code === 48) g = '<path d="M4 9h16M3 13h18M5 17h14"/>';
    else if (code >= 71 && code <= 77 || code === 85 || code === 86) g = cloud + '<path d="M9 21v0M12 22v0M15 21v0" stroke-width="2.5"/>';
    else if (code >= 95) g = cloud + '<path d="M12 13l-2 4h3l-2 4"/>';
    else if (code >= 51) g = cloud + '<path d="M8 20l-1 2M12 20l-1 2M16 20l-1 2"/>';
    else g = cloud;
    return p + g + "</svg>";
  }

  /* ---- fetch + normalize ---- */
  function url(p) {
    return "https://api.open-meteo.com/v1/forecast?latitude=" + p.lat + "&longitude=" + p.lon +
      "&current=temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,weather_code,is_day,wind_speed_10m,wind_direction_10m,wind_gusts_10m,uv_index" +
      "&hourly=temperature_2m,apparent_temperature,precipitation_probability,precipitation,weather_code,is_day,wind_speed_10m,wind_direction_10m,wind_gusts_10m,uv_index" +
      "&daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,precipitation_probability_max,precipitation_sum,wind_speed_10m_max,wind_gusts_10m_max,uv_index_max,sunrise,sunset" +
      "&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch&timezone=auto&forecast_days=7";
  }
  function normalize(raw, p) {
    var c = raw.current, h = raw.hourly, d = raw.daily;
    var hourKey = c.time.slice(0, 13);
    var idx = 0;
    for (var i = 0; i < h.time.length; i++) { if (h.time[i].slice(0, 13) === hourKey) { idx = i; break; } }
    var now = {
      temp: c.temperature_2m, feels: c.apparent_temperature, humidity: c.relative_humidity_2m, precip: c.precipitation,
      code: c.weather_code, day: !!c.is_day, wind: c.wind_speed_10m, dir: c.wind_direction_10m, gust: c.wind_gusts_10m,
      uv: c.uv_index, pop: h.precipitation_probability[idx] || 0
    };
    now.ride = score(now);
    var hours = [];
    for (var j = idx; j < Math.min(idx + 24, h.time.length); j++) {
      var hr = { time: h.time[j], temp: h.temperature_2m[j], feels: h.apparent_temperature[j], pop: h.precipitation_probability[j] || 0, precip: h.precipitation[j] || 0, code: h.weather_code[j], day: !!h.is_day[j], wind: h.wind_speed_10m[j], dir: h.wind_direction_10m[j], gust: h.wind_gusts_10m[j], uv: h.uv_index[j] || 0 };
      hr.ride = score(hr);
      hours.push(hr);
    }
    var days = d.time.map(function (t, k) {
      var avg = (d.apparent_temperature_max[k] + d.temperature_2m_min[k]) / 2;
      var day = { date: t, code: d.weather_code[k], hi: d.temperature_2m_max[k], lo: d.temperature_2m_min[k], pop: d.precipitation_probability_max[k] || 0, precip: d.precipitation_sum[k] || 0, wind: d.wind_speed_10m_max[k], gust: d.wind_gusts_10m_max[k], uv: d.uv_index_max[k] || 0, sunrise: d.sunrise[k], sunset: d.sunset[k] };
      day.ride = score({ feels: avg, wind: day.wind * 0.75, gust: day.gust, pop: day.pop, precip: day.precip > 0.1 ? day.precip : 0, uv: day.uv, day: true });
      return day;
    });
    return { place: p, now: now, hours: hours, days: days, updated: Date.now() };
  }
  function load(p) {
    var key = "lbbc-wx-" + p.id;
    try {
      var hit = JSON.parse(sessionStorage.getItem(key));
      if (hit && Date.now() - hit.t < CACHE_MS) return Promise.resolve(normalize(hit.raw, p));
    } catch (e) {}
    var ctl = typeof AbortController !== "undefined" ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctl) ctl.abort(); }, 9000);
    return fetch(url(p), ctl ? { signal: ctl.signal } : undefined).then(function (r) {
      clearTimeout(timer);
      if (!r.ok) throw new Error("Weather service returned " + r.status);
      return r.json();
    }).then(function (raw) {
      if (!raw.current || !raw.hourly || !raw.daily) throw new Error("Unexpected weather data");
      try { sessionStorage.setItem(key, JSON.stringify({ t: Date.now(), raw: raw })); } catch (e) {}
      return normalize(raw, p);
    });
  }

  LB.wx = { PLACES: PLACES, place: place, currentPlace: currentPlace, setPlace: setPlace, load: load, score: score, describe: describe, icon: icon, dirName: dirName,
    units: units, setUnits: setUnits, temp: temp, tempUnit: tempUnit, speed: speed, speedUnit: speedUnit };

  /* ---- header chip, hero readouts, home teaser ---- */
  function paint(data) {
    var n = data.now;
    var chip = document.querySelector(".wx-chip");
    if (chip) {
      chip.dataset.tone = n.ride.tone;
      chip.querySelector(".wx-chip__temp").textContent = temp(n.temp) + tempUnit();
      chip.querySelector(".wx-chip__wind").textContent = dirName(n.dir) + " " + speed(n.wind);
      chip.querySelector(".wx-chip__score").textContent = n.ride.score;
      chip.setAttribute("aria-label", "Ride weather in " + data.place.name + ": " + temp(n.temp) + tempUnit() + ", wind " + dirName(n.dir) + " " + speed(n.wind) + " " + speedUnit() + ", ride score " + n.ride.score + " (" + n.ride.label + ")");
    }
    var set = function (sel, text) { document.querySelectorAll(sel).forEach(function (el) { el.textContent = text; }); };
    set('[data-wx="readout-a"]', temp(n.temp) + tempUnit() + " · " + dirName(n.dir) + " " + speed(n.wind) + " " + speedUnit());
    set('[data-wx="readout-b"]', "Ride score " + n.ride.score + " · " + n.ride.label);
    set('[data-wx="teaser"]', n.ride.label + " · " + n.ride.score + " / 100");
    set('[data-wx="teaser-detail"]', data.place.name + ": " + describe(n.code) + ", " + temp(n.temp) + tempUnit() + ", wind " + dirName(n.dir) + " " + speed(n.wind) + " " + speedUnit() + ".");
  }
  LB.wx.paint = paint;

  document.addEventListener("DOMContentLoaded", function () {
    if (document.body.hasAttribute("data-wx-page")) return; // weather page drives its own load
    if (!document.querySelector(".wx-chip")) return;
    load(currentPlace()).then(paint).catch(function () {});
  });
})();
