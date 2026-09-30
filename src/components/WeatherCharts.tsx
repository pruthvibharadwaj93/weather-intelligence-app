import React, { useState } from 'react';
import {
  convertTempValue,
  formatTemperature,
} from '../services/weatherApi';
import {
  DailyForecastDay,
  HourlyForecastPoint,
  TemperatureUnit,
} from '../types/weather';

interface WeatherChartsProps {
  hourly: HourlyForecastPoint[];
  daily: DailyForecastDay[];
  unit: TemperatureUnit;
}

type ChartMetric = 'temperature' | 'precipitation' | 'wind-uv';

export const WeatherCharts: React.FC<WeatherChartsProps> = ({ hourly, daily, unit }) => {
  const [activeMetric, setActiveMetric] = useState<ChartMetric>('temperature');
  const [hoveredHourIdx, setHoveredHourIdx] = useState<number>(0);

  if (!hourly.length || !daily.length) return null;

  const hours24 = hourly.slice(0, 24);
  const selectedHour = hours24[hoveredHourIdx] || hours24[0];

  // SVG Geometry for 24-Hour Chart
  const svgWidth = 760;
  const svgHeight = 220;
  const padLeft = 42;
  const padRight = 24;
  const padTop = 26;
  const padBottom = 34;
  const plotWidth = svgWidth - padLeft - padRight;
  const plotHeight = svgHeight - padTop - padBottom;

  const getHourX = (index: number) =>
    padLeft + (index / Math.max(hours24.length - 1, 1)) * plotWidth;

  // Compute series based on activeMetric
  const tempValues = hours24.map((h) => convertTempValue(h.temperature, unit));
  const feelsValues = hours24.map((h) => convertTempValue(h.apparentTemperature, unit));
  const minTemp = Math.min(...tempValues, ...feelsValues) - 2;
  const maxTemp = Math.max(...tempValues, ...feelsValues) + 2;
  const tempRange = Math.max(maxTemp - minTemp, 4);

  const getTempY = (val: number) =>
    padTop + plotHeight - ((val - minTemp) / tempRange) * plotHeight;

  const getPctY = (pct: number) =>
    padTop + plotHeight - (Math.min(Math.max(pct, 0), 100) / 100) * plotHeight;

  const maxWind = Math.max(...hours24.map((h) => h.windSpeed), 25) + 5;
  const getWindY = (wind: number) =>
    padTop + plotHeight - (Math.min(Math.max(wind, 0), maxWind) / maxWind) * plotHeight;

  const tempPoints = tempValues.map((v, i) => `${getHourX(i)},${getTempY(v)}`).join(' ');
  const feelsPoints = feelsValues.map((v, i) => `${getHourX(i)},${getTempY(v)}`).join(' ');
  const tempAreaPoints = `${getHourX(0)},${padTop + plotHeight} ${tempPoints} ${getHourX(
    hours24.length - 1
  )},${padTop + plotHeight}`;

  const windPoints = hours24
    .map((h, i) => `${getHourX(i)},${getWindY(h.windSpeed)}`)
    .join(' ');

  // 7-Day Chart Geometry
  const dayMaxTemps = daily.map((d) => convertTempValue(d.temperatureMax, unit));
  const dayMinTemps = daily.map((d) => convertTempValue(d.temperatureMin, unit));
  const weekLow = Math.min(...dayMinTemps) - 2;
  const weekHigh = Math.max(...dayMaxTemps) + 2;
  const weekRange = Math.max(weekHigh - weekLow, 4);

  const getDayX = (index: number) =>
    padLeft + (index / Math.max(daily.length - 1, 1)) * plotWidth;
  const getDayTempY = (val: number) =>
    padTop + plotHeight - ((val - weekLow) / weekRange) * plotHeight;

  const dayMaxLine = dayMaxTemps.map((v, i) => `${getDayX(i)},${getDayTempY(v)}`).join(' ');
  const dayMinLine = dayMinTemps.map((v, i) => `${getDayX(i)},${getDayTempY(v)}`).join(' ');
  const dayEnvelopePolygon = [
    ...dayMaxTemps.map((v, i) => `${getDayX(i)},${getDayTempY(v)}`),
    ...[...dayMinTemps].reverse().map((v, revIdx) => {
      const origIdx = dayMinTemps.length - 1 - revIdx;
      return `${getDayX(origIdx)},${getDayTempY(v)}`;
    }),
  ].join(' ');

  const unitSymbol = unit === 'fahrenheit' ? '°F' : '°C';

  return (
    <section aria-label="Meteorological Trend Charts" className="mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            02. Forecast Analytics & Trend Charts
          </h2>
          <p className="text-xs text-slate-500">
            24-hour hourly trajectory and 7-day thermal envelope with precipitation probability
          </p>
        </div>

        {/* Metric Selector Controls */}
        <div className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-lg self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveMetric('temperature')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              activeMetric === 'temperature'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Temperature ({unitSymbol})
          </button>
          <button
            type="button"
            onClick={() => setActiveMetric('precipitation')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              activeMetric === 'precipitation'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Precipitation (%)
          </button>
          <button
            type="button"
            onClick={() => setActiveMetric('wind-uv')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              activeMetric === 'wind-uv'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Wind & UV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Chart: 24-Hour Hourly Forecast */}
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                24-Hour Hourly Progression
              </h3>
              <p className="text-xs text-slate-500">
                Hover or tap any hour to inspect telemetry
              </p>
            </div>
            <div className="text-xs font-mono tabular-nums text-slate-600">
              <span className="font-semibold text-slate-900">
                {selectedHour.time.split('T')[1] || selectedHour.time}
              </span>
              {' · '}
              <span>{formatTemperature(selectedHour.temperature, unit)}</span>
              {' · '}
              <span>Rain {selectedHour.precipitationProbability}%</span>
              {' · '}
              <span>Wind {selectedHour.windSpeed.toFixed(1)} km/h</span>
            </div>
          </div>

          <div className="mt-4">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-52 overflow-visible select-none"
              role="img"
              aria-label="24-hour weather progression chart"
            >
              {/* Horizontal Reference Grid Lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
                const y = padTop + ratio * plotHeight;
                let label = '';
                if (activeMetric === 'temperature') {
                  const val = maxTemp - ratio * tempRange;
                  label = `${Math.round(val)}°`;
                } else if (activeMetric === 'precipitation') {
                  label = `${Math.round((1 - ratio) * 100)}%`;
                } else {
                  label = `${Math.round((1 - ratio) * maxWind)}`;
                }
                return (
                  <g key={idx}>
                    <line
                      x1={padLeft}
                      y1={y}
                      x2={svgWidth - padRight}
                      y2={y}
                      stroke="#F1F5F9"
                      strokeWidth="1"
                    />
                    <text
                      x={padLeft - 8}
                      y={y + 4}
                      textAnchor="end"
                      className="fill-slate-400 text-[10px] font-mono"
                    >
                      {label}
                    </text>
                  </g>
                );
              })}

              {/* Metric Layer 1: Temperature & Apparent Temperature */}
              {activeMetric === 'temperature' && (
                <>
                  <polygon points={tempAreaPoints} fill="rgba(2, 132, 199, 0.08)" />
                  <polyline
                    fill="none"
                    stroke="#94A3B8"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                    points={feelsPoints}
                  />
                  <polyline
                    fill="none"
                    stroke="#0284C7"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={tempPoints}
                  />
                </>
              )}

              {/* Metric Layer 2: Precipitation Probability Bars */}
              {activeMetric === 'precipitation' &&
                hours24.map((h, i) => {
                  const x = getHourX(i);
                  const y = getPctY(h.precipitationProbability);
                  const barH = Math.max(padTop + plotHeight - y, 2);
                  const barW = Math.max(plotWidth / hours24.length - 6, 6);
                  return (
                    <rect
                      key={h.time}
                      x={x - barW / 2}
                      y={y}
                      width={barW}
                      height={barH}
                      rx="2"
                      fill={
                        i === hoveredHourIdx
                          ? '#0369A1'
                          : h.precipitationProbability >= 60
                          ? '#0284C7'
                          : '#38BDF8'
                      }
                    />
                  );
                })}

              {/* Metric Layer 3: Wind Speed & UV */}
              {activeMetric === 'wind-uv' && (
                <>
                  <polyline
                    fill="none"
                    stroke="#0F766E"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={windPoints}
                  />
                  {hours24.map((h, i) => {
                    const x = getHourX(i);
                    const uvHeight = (Math.min(h.uvIndex, 12) / 12) * (plotHeight * 0.65);
                    return (
                      <rect
                        key={h.time}
                        x={x - 3}
                        y={padTop + plotHeight - uvHeight}
                        width={6}
                        height={Math.max(uvHeight, 1)}
                        rx="1.5"
                        fill="rgba(217, 119, 6, 0.35)"
                      />
                    );
                  })}
                </>
              )}

              {/* Active Hour Indicator & Interactive Hit Targets */}
              {hours24.map((h, i) => {
                const x = getHourX(i);
                const isHovered = i === hoveredHourIdx;
                const dotY =
                  activeMetric === 'temperature'
                    ? getTempY(tempValues[i])
                    : activeMetric === 'precipitation'
                    ? getPctY(h.precipitationProbability)
                    : getWindY(h.windSpeed);

                const showLabel = i % 3 === 0 || i === hours24.length - 1;
                const hourStr = h.time.split('T')[1]?.slice(0, 5) || '';

                return (
                  <g
                    key={h.time}
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredHourIdx(i)}
                    onClick={() => setHoveredHourIdx(i)}
                  >
                    {isHovered && (
                      <line
                        x1={x}
                        y1={padTop}
                        x2={x}
                        y2={padTop + plotHeight}
                        stroke="#CBD5E1"
                        strokeWidth="1"
                        strokeDasharray="2 2"
                      />
                    )}
                    <circle
                      cx={x}
                      cy={dotY}
                      r={isHovered ? 4.5 : 2.5}
                      className={
                        isHovered
                          ? 'fill-slate-900 stroke-white stroke-2'
                          : 'fill-sky-600'
                      }
                    />
                    {showLabel && (
                      <text
                        x={x}
                        y={svgHeight - 8}
                        textAnchor="middle"
                        className="fill-slate-500 text-[10px] font-mono"
                      >
                        {hourStr}
                      </text>
                    )}
                    <rect
                      x={x - plotWidth / hours24.length / 2}
                      y={padTop}
                      width={plotWidth / hours24.length}
                      height={plotHeight}
                      fill="transparent"
                    />
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="mt-2 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
            {activeMetric === 'temperature' && (
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-sky-600 inline-block" /> Actual Temp ({unitSymbol})
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-slate-400 inline-block border-b border-dashed" /> Apparent "Feels Like"
                </span>
              </div>
            )}
            {activeMetric === 'precipitation' && (
              <span>Bars indicate hourly precipitation probability (%) from Open-Meteo</span>
            )}
            {activeMetric === 'wind-uv' && (
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-teal-700 inline-block" /> Wind Velocity (km/h)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 bg-amber-500/40 inline-block rounded-xs" /> Solar UV Index
                </span>
              </div>
            )}
            <span className="font-mono tabular-nums">
              RH: {selectedHour.relativeHumidity}% · UV: {selectedHour.uvIndex.toFixed(1)}
            </span>
          </div>
        </div>

        {/* Right Chart: 7-Day Thermal Envelope & Precipitation Risk */}
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                7-Day High / Low Thermal Envelope & Rain Risk
              </h3>
              <p className="text-xs text-slate-500">
                Daily maximum and minimum temperature spread with peak rain probability
              </p>
            </div>
            <div className="text-xs font-mono tabular-nums text-slate-600">
              <span>
                Week Range: {Math.round(weekLow + 2)}
                {unitSymbol} to {Math.round(weekHigh - 2)}
                {unitSymbol}
              </span>
            </div>
          </div>

          <div className="mt-4">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-52 overflow-visible select-none"
              role="img"
              aria-label="7-day temperature range and precipitation chart"
            >
              {/* Horizontal Reference Grid Lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
                const y = padTop + ratio * plotHeight;
                const val = weekHigh - ratio * weekRange;
                return (
                  <g key={idx}>
                    <line
                      x1={padLeft}
                      y1={y}
                      x2={svgWidth - padRight}
                      y2={y}
                      stroke="#F1F5F9"
                      strokeWidth="1"
                    />
                    <text
                      x={padLeft - 8}
                      y={y + 4}
                      textAnchor="end"
                      className="fill-slate-400 text-[10px] font-mono"
                    >
                      {Math.round(val)}°
                    </text>
                  </g>
                );
              })}

              {/* Precipitation probability background columns */}
              {daily.map((d, i) => {
                const x = getDayX(i);
                const colHeight = (d.precipitationProbabilityMax / 100) * (plotHeight * 0.45);
                return (
                  <g key={`rain-${d.date}`}>
                    <rect
                      x={x - 14}
                      y={padTop + plotHeight - colHeight}
                      width={28}
                      height={Math.max(colHeight, 2)}
                      rx="3"
                      fill="rgba(14, 165, 233, 0.14)"
                    />
                    {d.precipitationProbabilityMax > 0 && (
                      <text
                        x={x}
                        y={padTop + plotHeight - colHeight - 4}
                        textAnchor="middle"
                        className="fill-sky-700 text-[9px] font-mono"
                      >
                        {d.precipitationProbabilityMax}%
                      </text>
                    )}
                  </g>
                );
              })}

              {/* Thermal Envelope Shaded Band */}
              <polygon points={dayEnvelopePolygon} fill="rgba(15, 23, 42, 0.06)" />

              {/* Min Temp Line */}
              <polyline
                fill="none"
                stroke="#64748B"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={dayMinLine}
              />

              {/* Max Temp Line */}
              <polyline
                fill="none"
                stroke="#0F172A"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={dayMaxLine}
              />

              {/* Day Nodes & Labels */}
              {daily.map((d, i) => {
                const x = getDayX(i);
                const yMax = getDayTempY(dayMaxTemps[i]);
                const yMin = getDayTempY(dayMinTemps[i]);
                const dayLabel =
                  i === 0
                    ? 'Today'
                    : new Date(`${d.date}T12:00:00`).toLocaleDateString('en-US', {
                        weekday: 'short',
                      });

                return (
                  <g key={d.date}>
                    <circle cx={x} cy={yMax} r="3.5" className="fill-slate-900" />
                    <text
                      x={x}
                      y={yMax - 8}
                      textAnchor="middle"
                      className="fill-slate-900 text-[10px] font-mono font-semibold"
                    >
                      {Math.round(dayMaxTemps[i])}°
                    </text>

                    <circle cx={x} cy={yMin} r="3" className="fill-slate-500" />
                    <text
                      x={x}
                      y={yMin + 14}
                      textAnchor="middle"
                      className="fill-slate-500 text-[10px] font-mono"
                    >
                      {Math.round(dayMinTemps[i])}°
                    </text>

                    <text
                      x={x}
                      y={svgHeight - 8}
                      textAnchor="middle"
                      className="fill-slate-600 text-[10px] font-medium"
                    >
                      {dayLabel}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="mt-2 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-slate-900 inline-block" /> Daily High
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-slate-500 inline-block" /> Daily Low
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-sky-500/25 inline-block rounded-xs" /> Rain Probability (%)
              </span>
            </div>
            <span className="font-mono tabular-nums">7-Day Horizon</span>
          </div>
        </div>
      </div>
    </section>
  );
};
