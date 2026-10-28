(function () {
  "use strict";
  var wx = window.LBBC.wx;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var data = null;
  var HEADINGS = { N: 0, NE: 45, E: 90, SE: 135, S: 180, SW: 225, W: 270, NW: 315 };
  var heading = "E"; // Long Beach's boardwalk runs east-west
  try { heading = localStorage.getItem("lbbc-heading") || "E"; } catch (e) {}
  if (!(heading in HEADINGS)) heading = "E";

  function hourLabel(iso) { var h = +iso.slice(11, 13); return (h % 12 || 12) + (h < 12 ? " AM" : " PM"); }
  function clock(iso) { var h = +iso.slice(11, 13), m = iso.slice(14, 16); return (h % 12 || 12) + ":" + m + (h < 12 ? " AM" : " PM"); }
  function dayName(iso, i) { return i === 0 ? "Today" : new Date(iso + "T12:00:00").toLocaleDateString("en-US", { weekday: "short" }); }
  function segs(pct) { var n = Math.round(Math.max(0, Math.min(1, pct)) * 10), s = ""; for (var i = 0; i < 10; i++) s += '<i class="' + (i < n ? "on" : "") + '"></i>'; return '<div class="segs" aria-hidden="true">' + s + "</div>"; }
  function uvLevel(u) { return u < 3 ? "Low" : u < 6 ? "Moderate" : u < 8 ? "High" : u < 11 ? "Very high" : "Extreme"; }
  var CHECK = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';

  /* ---- best two-hour daylight window ---- */
  function bestWindow(hours) {
    var best = null;
    for (var i = 0; i < hours.length - 1; i++) {
      var a = hours[i], b = hours[i + 1];
      if (!a.day || !b.day) continue;
      var avg = (a.ride.score + b.ride.score) / 2;
      if (!best || avg > best.avg) best = { i: i, avg: Math.round(avg) };
    }
    return best;
  }

  /* ---- renderers ---- */
  function renderGauge() {
    var n = data.now, r = n.ride;
    var gauge = $("#gauge");
    gauge.dataset.tone = r.tone;
    $("#gauge-value").style.strokeDasharray = r.score + " 100";
    $("#gauge-needle").style.transform = "rotate(" + (-90 + r.score * 1.8) + "deg)";
    $("#gauge-num").textContent = r.score;
    var badge = $("#verdict-badge"); badge.textContent = r.label; badge.parentNode.dataset.tone = r.tone;
    $("#verdict-text").textContent = { prime: "Great time to ride.", good: "Good riding. Mind the wind.", fair: "Rideable. Dress for it.", skip: "Better to stay in or stay close to home." }[r.tone];
    var bw = bestWindow(data.hours);
    $("#window").innerHTML = bw ? "<span>Best window <b>" + hourLabel(data.hours[bw.i].time) + " to " + hourLabel(data.hours[bw.i + 1].time).replace(/^(\d+) /, "$1 ") + "</b></span><span>Score <b>" + bw.avg + "</b></span>" : "<span>No daylight window in the next 24 hours</span>";
    $("#now-desc").textContent = wx.describe(n.code) + " in " + data.place.name;
  }

  function renderWind() {
    var n = data.now, h = HEADINGS[heading];
    $("#compass-arrow").style.transform = "rotate(" + (n.dir + 180) + "deg)";
    $("#compass-rider").style.transform = "rotate(" + h + "deg)";
    var rel = (n.dir - h) * Math.PI / 180;
    var head = n.wind * Math.cos(rel), cross = n.wind * Math.sin(rel);
    var kind = Math.abs(head) < 2 ? "Mostly crosswind" : head > 0 ? "Headwind" : "Tailwind";
    $("#wind-main").textContent = kind + " " + wx.speed(Math.abs(head)) + " " + wx.speedUnit();
    var side = Math.abs(cross) < 2 ? "" : "Crosswind " + wx.speed(Math.abs(cross)) + " " + wx.speedUnit() + " from your " + (cross > 0 ? "right" : "left") + ". ";
    $("#wind-sub").textContent = side + "Wind from the " + wx.dirName(n.dir) + " at " + wx.speed(n.wind) + " " + wx.speedUnit() + ", gusting " + wx.speed(n.gust) + ".";
    document.querySelectorAll("#heading-group button").forEach(function (b) { b.setAttribute("aria-pressed", b.dataset.h === heading ? "true" : "false"); });
  }

  function renderComputer() {
    var n = data.now, d0 = data.days[0];
    var tiles = [
      ["Temp", wx.temp(n.temp), wx.tempUnit(), "Feels " + wx.temp(n.feels) + wx.tempUnit(), segs((n.temp - 20) / 80)],
      ["Wind", wx.speed(n.wind), wx.speedUnit(), "Gusts " + wx.speed(n.gust), segs(n.wind / 30)],
      ["Rain", Math.round(n.pop), "%", n.precip > 0 ? "Raining now" : "Chance this hour", segs(n.pop / 100)],
      ["UV", Math.round(n.uv * 10) / 10, "", uvLevel(n.uv), segs(n.uv / 11)],
      ["Humidity", Math.round(n.humidity), "%", "Relative", segs(n.humidity / 100)],
      ["Sunset", clock(d0.sunset).replace(/ (AM|PM)/, ""), clock(d0.sunset).slice(-2), "Rise " + clock(d0.sunrise), ""]
    ];
    $("#computer").innerHTML = tiles.map(function (t) {
      return '<div class="tile"><span class="label">' + t[0] + '</span><span class="tile__val">' + t[1] + "<small>" + t[2] + '</small></span><span class="tile__sub">' + t[3] + "</span>" + t[4] + "</div>";
    }).join("");
  }

  function renderHours() {
    var bw = bestWindow(data.hours);
    $("#hours").innerHTML = data.hours.map(function (h, i) {
      var best = bw && (i === bw.i || i === bw.i + 1);
      return '<li class="hour' + (best ? " best" : "") + '" data-tone="' + h.ride.tone + '" aria-label="' + hourLabel(h.time) + ", ride score " + h.ride.score + '">' +
        '<span class="hour__t">' + (i === 0 ? "Now" : hourLabel(h.time)) + "</span>" + wx.icon(h.code, h.day) +
        '<span class="hour__bar"><i style="height:' + Math.max(6, h.ride.score * 0.72) + 'px"></i></span>' +
        '<span class="hour__score">' + h.ride.score + "</span>" +
        "<span>" + wx.temp(h.temp) + "&deg;</span><span>" + wx.dirName(h.dir) + " " + wx.speed(h.wind) + "</span><span>" + Math.round(h.pop) + "%</span>" +
        '<span class="hour__tag">' + (best ? "Best" : "") + "</span></li>";
    }).join("");
  }

  function renderDays() {
    $("#days").innerHTML = data.days.map(function (d, i) {
      return '<li data-tone="' + d.ride.tone + '"><span class="day__name">' + dayName(d.date, i) + '</span>' +
        '<span class="day__desc">' + wx.icon(d.code, true) + wx.describe(d.code) + "</span>" +
        '<span class="day__meta"><span><b>' + wx.temp(d.hi) + "&deg;</b> / " + wx.temp(d.lo) + "&deg;</span><span>Wind <b>" + wx.speed(d.wind) + "</b> " + wx.speedUnit() + "</span><span>Rain <b>" + Math.round(d.pop) + "%</b></span></span>" +
        '<span class="badge">' + d.ride.score + "</span></li>";
    }).join("");
  }

  function renderGear() {
    var bw = bestWindow(data.hours);
    var ref = bw ? data.hours[bw.i] : data.hours[0];
    var f = ref.feels, items = [];
    items.push(f < 32 ? "Winter kit: thermal bibs, insulated jacket, lobster gloves, shoe covers, ear cover."
      : f < 45 ? "Cold: thermal jersey or jacket, long bibs, full-finger gloves, shoe covers."
      : f < 55 ? "Cool: arm and knee warmers, light jacket, long-finger gloves."
      : f < 70 ? "Mild: jersey and shorts. A light vest helps in the wind."
      : f < 85 ? "Warm: light jersey, sunscreen and an extra bottle."
      : "Hot: light colors, two bottles and electrolytes. Ride early or late.");
    var maxPop = Math.max.apply(null, data.hours.slice(0, 8).map(function (h) { return h.pop; }));
    var maxGust = Math.max.apply(null, data.hours.slice(0, 8).map(function (h) { return h.gust; }));
    if (maxPop >= 40 || data.now.precip > 0) items.push("Rain likely: pack a shell and use fenders if you have them. Wet roads mean longer braking.");
    if (maxGust >= 25) items.push("Gusty: stay low, keep hands near the brakes, and think twice about deep-section wheels.");
    if (data.days[0].uv >= 6) items.push("Strong sun: sunscreen and sunglasses.");
    items.push("Helmet on, tires pumped, water bottle full.");
    $("#gear-for").textContent = "Based on feels-like " + wx.temp(f) + wx.tempUnit() + (bw ? " in your best window" : " right now");
    $("#gear").innerHTML = items.map(function (t) { return "<li>" + CHECK + "<span>" + t + "</span></li>"; }).join("");
    var d0 = data.days[0];
    $("#sun").innerHTML = "<span>Sunrise <b>" + clock(d0.sunrise) + "</b></span><span>Sunset <b>" + clock(d0.sunset) + "</b></span>";
    $("#lights").innerHTML = [
      "Lights on if you ride within 45 minutes of dark, which starts around " + clock(d0.sunset) + ".",
      "Front white light and rear red light, steady or flashing. Wear something bright.",
      data.now.day ? "Daylight now." : "It is dark now. Use lights."
    ].map(function (t) { return "<li>" + CHECK + "<span>" + t + "</span></li>"; }).join("");
  }

  function renderMeta() {
    $("#updated").textContent = "Updated " + new Date(data.updated).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }) + " · Open-Meteo";
    wx.paint(data);
  }

  function render() { renderGauge(); renderWind(); renderComputer(); renderHours(); renderDays(); renderGear(); renderMeta(); }

  /* ---- load ---- */
  function go() {
    var status = $("#wx-status"), app = $("#wx-app");
    status.hidden = false; app.hidden = true;
    status.innerHTML = '<p class="label">Loading ride conditions...</p>';
    wx.load(wx.currentPlace()).then(function (d) {
      data = d; status.hidden = true; app.hidden = false; render();
    }).catch(function () {
      status.innerHTML = '<div class="wx-error"><p>We could not reach the weather service. Check your connection and try again.</p><button class="btn" type="button" id="retry">Try again</button></div>';
      $("#retry").addEventListener("click", go);
    });
  }

  /* ---- controls ---- */
  var sel = $("#place");
  wx.PLACES.forEach(function (p) { var o = document.createElement("option"); o.value = p.id; o.textContent = p.name; sel.appendChild(o); });
  sel.value = wx.currentPlace().id;
  sel.addEventListener("change", function () { wx.setPlace(sel.value); go(); });

  function syncUnits() { document.querySelectorAll("#units button").forEach(function (b) { b.setAttribute("aria-pressed", b.dataset.u === wx.units() ? "true" : "false"); }); }
  document.querySelectorAll("#units button").forEach(function (b) { b.addEventListener("click", function () { wx.setUnits(b.dataset.u); syncUnits(); if (data) render(); }); });
  syncUnits();

  var hg = $("#heading-group");
  Object.keys(HEADINGS).forEach(function (k) { var b = document.createElement("button"); b.type = "button"; b.dataset.h = k; b.textContent = k; b.setAttribute("aria-label", "Riding " + k); hg.appendChild(b); b.addEventListener("click", function () { heading = k; try { localStorage.setItem("lbbc-heading", k); } catch (e) {} if (data) renderWind(); }); });

  var tabs = document.querySelectorAll("[role=tab]");
  function selectTab(t) { tabs.forEach(function (x) { var on = x === t; x.setAttribute("aria-selected", on); x.tabIndex = on ? 0 : -1; $("#" + x.getAttribute("aria-controls")).hidden = !on; }); t.focus(); }
  tabs.forEach(function (t, i) {
    t.addEventListener("click", function () { selectTab(t); });
    t.addEventListener("keydown", function (e) { if (e.key === "ArrowRight") selectTab(tabs[(i + 1) % tabs.length]); if (e.key === "ArrowLeft") selectTab(tabs[(i + tabs.length - 1) % tabs.length]); });
  });

  go();
})();
