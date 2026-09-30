import React from 'react';
import {
  formatTemperature,
  getCompassDirection,
  getWmoCondition,
} from '../services/weatherApi';
import { TemperatureUnit, WeatherIntelligenceReport } from '../types/weather';
import { WeatherIcon } from './WeatherIcon';

interface CurrentWeatherPanelProps {
  report: WeatherIntelligenceReport;
  unit: TemperatureUnit;
}

export const CurrentWeatherPanel: React.FC<CurrentWeatherPanelProps> = ({ report, unit }) => {
  const { location, current, daily } = report;
  const today = daily[0];
  const condition = getWmoCondition(current.weatherCode);
  const windDir = getCompassDirection(current.windDirection);

  const uvSeverityLabel =
    current.uvIndex >= 8
      ? 'Very High'
      : current.uvIndex >= 6
      ? 'High'
      : current.uvIndex >= 3
      ? 'Moderate'
      : 'Low';

  const sunriseTime = today?.sunrise?.split('T')[1] || '06:00';
  const sunsetTime = today?.sunset?.split('T')[1] || '18:15';
  const localObsTime = current.time.replace('T', ' ');

  return (
    <section aria-label="Current Meteorological Conditions" className="mb-8">
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        {/* Top Primary Weather Anchor */}
        <div className="p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 border-b border-slate-100">
          <div>
            {/* Unboxed geographic metadata with typographic separators */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mb-2">
              <span className="font-medium text-slate-700">
                {[location.admin1, location.country].filter(Boolean).join(', ') || 'Global Station'}
              </span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">
                {location.latitude.toFixed(4)}°N, {location.longitude.toFixed(4)}°E
              </span>
              {location.elevation !== undefined && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono tabular-nums">Elev {location.elevation}m</span>
                </>
              )}
              {location.timezone && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>{location.timezone}</span>
                </>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              {location.name}
            </h1>

            <p className="mt-1 text-xs text-slate-500 font-mono tabular-nums">
              Observation Timestamp: {localObsTime} ({current.isDay ? 'Daylight Cycle' : 'Night Cycle'})
            </p>
          </div>

          {/* Primary Temperature & Condition Readout */}
          <div className="flex items-center gap-5">
            <div className="p-3.5 bg-slate-50 rounded-xl">
              <WeatherIcon code={current.weatherCode} className="w-11 h-11" />
            </div>
            <div>
              <div className="flex items-baseline gap-3">
                <span className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-900 font-mono tabular-nums">
                  {formatTemperature(current.temperature, unit)}
                </span>
                <span className="text-base font-semibold text-slate-700">{condition.label}</span>
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500 font-mono tabular-nums">
                <span>Feels like {formatTemperature(current.apparentTemperature, unit)}</span>
                {today && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span>
                      High {formatTemperature(today.temperatureMax, unit)} / Low{' '}
                      {formatTemperature(today.temperatureMin, unit)}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Hairline-Divided Telemetry Grid (Single Elevation, Zero Nested Boxes) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 bg-slate-50/40">
          <div className="p-4 sm:p-5">
            <div className="text-xs text-slate-500">Relative Humidity</div>
            <div className="mt-1.5 text-lg font-semibold text-slate-900 font-mono tabular-nums">
              {current.relativeHumidity}%
            </div>
            <div className="mt-0.5 text-xs text-slate-500">
              {current.relativeHumidity >= 75
                ? 'Humid air mass'
                : current.relativeHumidity <= 30
                ? 'Dry air mass'
                : 'Optimal comfort'}
            </div>
          </div>

          <div className="p-4 sm:p-5">
            <div className="text-xs text-slate-500">Wind Velocity</div>
            <div className="mt-1.5 text-lg font-semibold text-slate-900 font-mono tabular-nums">
              {current.windSpeed.toFixed(1)} km/h {windDir}
            </div>
            <div className="mt-0.5 text-xs text-slate-500 font-mono tabular-nums">
              Gusts to {current.windGusts.toFixed(1)} km/h
            </div>
          </div>

          <div className="p-4 sm:p-5">
            <div className="text-xs text-slate-500">Surface Pressure</div>
            <div className="mt-1.5 text-lg font-semibold text-slate-900 font-mono tabular-nums">
              {current.surfacePressure.toFixed(0)} hPa
            </div>
            <div className="mt-0.5 text-xs text-slate-500">
              {current.surfacePressure >= 1018
                ? 'High pressure ridge'
                : current.surfacePressure <= 1005
                ? 'Low pressure trough'
                : 'Standard barometric'}
            </div>
          </div>

          <div className="p-4 sm:p-5">
            <div className="text-xs text-slate-500">Solar UV Index</div>
            <div className="mt-1.5 text-lg font-semibold text-slate-900 font-mono tabular-nums">
              {current.uvIndex.toFixed(1)} · {uvSeverityLabel}
            </div>
            <div className="mt-0.5 text-xs text-slate-500 font-mono tabular-nums">
              Daily Peak: {today ? today.uvIndexMax.toFixed(1) : current.uvIndex.toFixed(1)}
            </div>
          </div>

          <div className="p-4 sm:p-5">
            <div className="text-xs text-slate-500">Precipitation & Cloud</div>
            <div className="mt-1.5 text-lg font-semibold text-slate-900 font-mono tabular-nums">
              {current.precipitation.toFixed(1)} mm
            </div>
            <div className="mt-0.5 text-xs text-slate-500 font-mono tabular-nums">
              Cloud Cover: {current.cloudCover}%
            </div>
          </div>

          <div className="p-4 sm:p-5">
            <div className="text-xs text-slate-500">Solar Horizon</div>
            <div className="mt-1.5 text-lg font-semibold text-slate-900 font-mono tabular-nums">
              {sunriseTime}
            </div>
            <div className="mt-0.5 text-xs text-slate-500 font-mono tabular-nums">
              Sunset: {sunsetTime}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
