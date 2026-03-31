import { useState, useEffect, useRef } from 'react';

const WMO_ICON = (code) => {
  if (code === 0)   return '☀️';
  if (code <= 2)    return '🌤️';
  if (code === 3)   return '☁️';
  if (code <= 48)   return '🌫️';
  if (code <= 55)   return '🌦️';
  if (code <= 65)   return '🌧️';
  if (code <= 77)   return '🌨️';
  if (code <= 82)   return '🌧️';
  if (code <= 86)   return '🌨️';
  if (code <= 99)   return '⛈️';
  return '🌡️';
};

const WMO_LABEL = (code) => {
  if (code === 0)  return 'Clear';
  if (code <= 2)   return 'Partly cloudy';
  if (code === 3)  return 'Overcast';
  if (code <= 48)  return 'Foggy';
  if (code <= 55)  return 'Drizzle';
  if (code <= 65)  return 'Rain';
  if (code <= 77)  return 'Snow';
  if (code <= 82)  return 'Showers';
  if (code <= 86)  return 'Snow showers';
  if (code <= 99)  return 'Thunderstorm';
  return '';
};

const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Minimum px per day column to remain readable
const MIN_DAY_WIDTH = 52;

export default function WeatherForecast({ lat, lng }) {
  const [days, setDays]         = useState(null);
  const [location, setLocation] = useState(null);
  const [error, setError]       = useState(false);
  const [visibleCount, setVisibleCount] = useState(14);
  const rowRef = useRef(null);

  useEffect(() => {
    if (lat == null || lng == null) return;

    const weatherUrl =
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}` +
      `&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=14`;

    const geoUrl =
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`;

    fetch(weatherUrl)
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then((data) => {
        const { time, weathercode, temperature_2m_max, temperature_2m_min } = data.daily;
        setDays(time.map((t, i) => ({
          date:  new Date(t + 'T00:00:00'),
          code:  weathercode[i],
          max:   Math.round(temperature_2m_max[i]),
          min:   Math.round(temperature_2m_min[i]),
        })));
      })
      .catch(() => setError(true));

    fetch(geoUrl, { headers: { 'Accept-Language': 'ro' } })
      .then((r) => r.json())
      .then((data) => {
        const a = data.address || {};
        setLocation(a.village || a.town || a.city || a.county || a.state || null);
      })
      .catch(() => {});
  }, [lat, lng]);

  // Observe container width and calculate how many days fit
  useEffect(() => {
    const el = rowRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      const width = entry.contentRect.width;
      setVisibleCount(Math.max(1, Math.floor(width / MIN_DAY_WIDTH)));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [days]); // re-attach after days load so rowRef.current exists

  if (error || !days) return null;

  const visible = days.slice(0, visibleCount);

  return (
    <div className="weather-strip">
      <div className="weather-strip-label">
        {visible.length}-day forecast · near trailhead{location ? ` (${location})` : ''}
      </div>
      <div className="weather-strip-row" ref={rowRef}>
        {visible.map((d, i) => {
          const dow = d.date.getDay();
          const isWeekend = dow === 0 || dow === 6;
          let cls = 'weather-day';
          if (i === 0)       cls += ' weather-day--today';
          else if (isWeekend) cls += ' weather-day--weekend';
          return (
          <div key={i} className={cls}>
            <div className="weather-day-name">{i === 0 ? 'Today' : DAY_SHORT[d.date.getDay()]}</div>
            <div className="weather-day-icon" title={WMO_LABEL(d.code)}>{WMO_ICON(d.code)}</div>
            <div className="weather-day-temps">
              <span className="weather-temp-max">{d.max}°</span>
              <span className="weather-temp-min">{d.min}°</span>
            </div>
          </div>
          );
        })}
      </div>
    </div>
  );
}
