// Deterministic Open-Meteo payload for browser checks (no network needed).
module.exports = function mock() {
  const pad = (n) => String(n).padStart(2, "0");
  const base = new Date(); base.setMinutes(0, 0, 0);
  const t = (i) => { const d = new Date(base.getTime() + i * 3600e3); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:00`; };
  const N = 24 * 7 + 24;
  const time = Array.from({ length: N }, (_, i) => t(i - 2));
  const wave = (f) => time.map((_, i) => f(i));
  const day = (i) => { const h = +time[i].slice(11, 13); return h >= 6 && h < 18 ? 1 : 0; };
  const dates = Array.from({ length: 7 }, (_, i) => t(24 * i).slice(0, 10));
  return {
    current: { time: t(0), temperature_2m: 58, apparent_temperature: 55, relative_humidity_2m: 64, precipitation: 0, weather_code: 2, is_day: 1, wind_speed_10m: 12, wind_direction_10m: 300, wind_gusts_10m: 21, uv_index: 4.2 },
    hourly: {
      time, temperature_2m: wave((i) => 52 + 10 * Math.sin(i / 4)), apparent_temperature: wave((i) => 50 + 10 * Math.sin(i / 4)),
      precipitation_probability: wave((i) => (i * 7) % 60), precipitation: wave((i) => (i % 17 === 0 ? 0.05 : 0)), weather_code: wave((i) => [0, 2, 3, 61][i % 4]),
      is_day: wave(day), wind_speed_10m: wave((i) => 8 + 6 * Math.sin(i / 5) + 4), wind_direction_10m: wave((i) => (200 + i * 9) % 360),
      wind_gusts_10m: wave((i) => 16 + 8 * Math.sin(i / 5) + 6), uv_index: wave((i) => (day(i) ? 4 : 0))
    },
    daily: {
      time: dates, weather_code: dates.map((_, i) => [1, 3, 61, 0, 2, 80, 1][i]), temperature_2m_max: dates.map((_, i) => 60 + i), temperature_2m_min: dates.map((_, i) => 46 + i),
      apparent_temperature_max: dates.map((_, i) => 58 + i), precipitation_probability_max: dates.map((_, i) => 10 + i * 9), precipitation_sum: dates.map((_, i) => (i === 2 ? 0.4 : 0)),
      wind_speed_10m_max: dates.map((_, i) => 14 + i), wind_gusts_10m_max: dates.map((_, i) => 24 + i * 2), uv_index_max: dates.map(() => 5),
      sunrise: dates.map((d) => d + "T06:48"), sunset: dates.map((d) => d + "T17:12")
    }
  };
};
