import React, { useState } from 'react';
import {
  formatTemperature,
  getCompassDirection,
  getWmoCondition,
} from '../services/weatherApi';
import { DailyForecastDay, TemperatureUnit } from '../types/weather';
import { WeatherIcon } from './WeatherIcon';

interface ForecastSectionProps {
  daily: DailyForecastDay[];
  unit: TemperatureUnit;
}

export const ForecastSection: React.FC<ForecastSectionProps> = ({ daily, unit }) => {
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  if (!daily || daily.length === 0) return null;

  const weekMin = Math.min(...daily.map((d) => d.temperatureMin));
  const weekMax = Math.max(...daily.map((d) => d.temperatureMax));
  const weekSpan = Math.max(weekMax - weekMin, 1);

  const selectedDay = daily[selectedIndex] || daily[0];
  const selectedCondition = getWmoCondition(selectedDay.weatherCode);

  const formatDayName = (dateStr: string, index: number) => {
    if (index === 0) return 'Today';
    const d = new Date(`${dateStr}T12:00:00`);
    return d.toLocaleDateString('en-US', { weekday: 'short' });
  };

  const formatShortDate = (dateStr: string) => {
    const d = new Date(`${dateStr}T12:00:00`);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <section aria-label="7-Day Weather Forecast" className="mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            01. 7-Day Meteorological Forecast
          </h2>
          <p className="text-xs text-slate-500">
            Daily temperature extremes, precipitation probability, solar UV peaks, and wind vectors
          </p>
        </div>

        {/* Interactive View Switcher */}
        <div className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-lg self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setViewMode('cards')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              viewMode === 'cards'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Forecast Cards
          </button>
          <button
            type="button"
            onClick={() => setViewMode('table')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              viewMode === 'table'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tabular Schedule
          </button>
        </div>
      </div>

      {viewMode === 'cards' ? (
        <>
          {/* 7-Day Forecast Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {daily.map((day, idx) => {
              const cond = getWmoCondition(day.weatherCode);
              const isSelected = idx === selectedIndex;
              const leftPct = ((day.temperatureMin - weekMin) / weekSpan) * 100;
              const widthPct = Math.max(
                ((day.temperatureMax - day.temperatureMin) / weekSpan) * 100,
                10
              );

              return (
                <button
                  key={day.date}
                  type="button"
                  onClick={() => setSelectedIndex(idx)}
                  className={`text-left p-4 rounded-xl border transition-colors cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-white border-sky-600 ring-2 ring-sky-600/15'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-sm font-semibold text-slate-900">
                        {formatDayName(day.date, idx)}
                      </span>
                      <span className="text-xs text-slate-400 font-mono tabular-nums">
                        {formatShortDate(day.date)}
                      </span>
                    </div>

                    <div className="my-3.5 flex items-center gap-2.5">
                      <WeatherIcon code={day.weatherCode} className="w-7 h-7 shrink-0" />
                      <span className="text-xs font-medium text-slate-700 leading-tight">
                        {cond.shortLabel}
                      </span>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-baseline justify-between font-mono tabular-nums text-xs mb-1.5">
                      <span className="text-slate-500">
                        {formatTemperature(day.temperatureMin, unit, false)}°
                      </span>
                      <span className="font-semibold text-slate-900 text-sm">
                        {formatTemperature(day.temperatureMax, unit)}
                      </span>
                    </div>

                    {/* Normalized Thermal Range Bar */}
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden relative mb-3">
                      <div
                        className="h-full bg-sky-600 rounded-full absolute top-0"
                        style={{
                          left: `${Math.min(Math.max(leftPct, 0), 90)}%`,
                          width: `${Math.min(widthPct, 100 - leftPct)}%`,
                        }}
                      />
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-mono tabular-nums">
                      <span>Rain {day.precipitationProbabilityMax}%</span>
                      <span>{day.precipitationSum.toFixed(1)}mm</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Selected Day Detailed Strip */}
          <div className="mt-3 bg-white border border-slate-200 rounded-xl px-5 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <WeatherIcon code={selectedDay.weatherCode} className="w-6 h-6 shrink-0" />
              <div>
                <div className="text-sm font-semibold text-slate-900">
                  {formatDayName(selectedDay.date, selectedIndex)} ({selectedDay.date}) —{' '}
                  {selectedCondition.label}
                </div>
                <div className="text-xs text-slate-500 font-mono tabular-nums mt-0.5">
                  High {formatTemperature(selectedDay.temperatureMax, unit)} (Feels{' '}
                  {formatTemperature(selectedDay.apparentTemperatureMax, unit)}) · Low{' '}
                  {formatTemperature(selectedDay.temperatureMin, unit)} (Feels{' '}
                  {formatTemperature(selectedDay.apparentTemperatureMin, unit)})
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 font-mono tabular-nums">
              <span>
                Precip: <strong className="text-slate-900">{selectedDay.precipitationSum.toFixed(1)} mm</strong> ({selectedDay.precipitationProbabilityMax}%)
              </span>
              <span aria-hidden="true">·</span>
              <span>
                Max Wind: <strong className="text-slate-900">{selectedDay.windSpeedMax.toFixed(1)} km/h</strong>{' '}
                {getCompassDirection(selectedDay.windDirectionDominant)}
              </span>
              <span aria-hidden="true">·</span>
              <span>
                Peak UV: <strong className="text-slate-900">{selectedDay.uvIndexMax.toFixed(1)}</strong>
              </span>
              <span aria-hidden="true">·</span>
              <span>
                Sun: {selectedDay.sunrise.split('T')[1] || '--:--'} –{' '}
                {selectedDay.sunset.split('T')[1] || '--:--'}
              </span>
            </div>
          </div>
        </>
      ) : (
        /* High-Density 7-Day Tabular Schedule */
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-xs font-semibold text-slate-600">
                  <th className="py-3 px-4">Day & Date</th>
                  <th className="py-3 px-4">Condition</th>
                  <th className="py-3 px-4 text-right">Min Temp</th>
                  <th className="py-3 px-4 text-right">Max Temp</th>
                  <th className="py-3 px-4 text-right">Rain Risk</th>
                  <th className="py-3 px-4 text-right">Precip Sum</th>
                  <th className="py-3 px-4 text-right">Peak Wind</th>
                  <th className="py-3 px-4 text-right">Max UV</th>
                  <th className="py-3 px-4 text-right">Sunrise / Sunset</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {daily.map((day, idx) => {
                  const cond = getWmoCondition(day.weatherCode);
                  return (
                    <tr
                      key={day.date}
                      onClick={() => setSelectedIndex(idx)}
                      className={`hover:bg-slate-50 transition-colors cursor-pointer ${
                        idx === selectedIndex ? 'bg-sky-50/40' : ''
                      }`}
                    >
                      <td className="py-2.5 px-4 font-medium text-slate-900 whitespace-nowrap">
                        {formatDayName(day.date, idx)}{' '}
                        <span className="text-xs text-slate-400 font-mono tabular-nums ml-1">
                          {day.date}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-slate-700 text-xs font-medium">
                          <WeatherIcon code={day.weatherCode} className="w-4 h-4 shrink-0" />
                          <span>{cond.label}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono tabular-nums text-slate-600">
                        {formatTemperature(day.temperatureMin, unit)}
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono tabular-nums font-semibold text-slate-900">
                        {formatTemperature(day.temperatureMax, unit)}
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono tabular-nums text-slate-700">
                        {day.precipitationProbabilityMax}%
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono tabular-nums text-slate-700">
                        {day.precipitationSum.toFixed(1)} mm
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono tabular-nums text-slate-700 whitespace-nowrap">
                        {day.windSpeedMax.toFixed(1)} km/h{' '}
                        {getCompassDirection(day.windDirectionDominant)}
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono tabular-nums text-slate-700">
                        {day.uvIndexMax.toFixed(1)}
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono tabular-nums text-xs text-slate-500 whitespace-nowrap">
                        {day.sunrise.split('T')[1] || '--'} / {day.sunset.split('T')[1] || '--'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
};
