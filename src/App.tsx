/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useEffect, useState } from 'react';
import { CurrentWeatherPanel } from './components/CurrentWeatherPanel';
import { DeploymentGuide } from './components/DeploymentGuide';
import { ForecastSection } from './components/ForecastSection';
import { RecommendationsPanel } from './components/RecommendationsPanel';
import { SearchBar } from './components/SearchBar';
import { WeatherCharts } from './components/WeatherCharts';
import { fetchWeatherIntelligence, searchCities } from './services/weatherApi';
import {
  GeocodingLocation,
  TemperatureUnit,
  ValidationProgress,
  WeatherIntelligenceReport,
} from './types/weather';

export default function App() {
  const [unit, setUnit] = useState<TemperatureUnit>('celsius');
  const [report, setReport] = useState<WeatherIntelligenceReport | null>(null);
  const [candidateLocations, setCandidateLocations] = useState<GeocodingLocation[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [validationProgress, setValidationProgress] = useState<ValidationProgress>({
    validCitiesSearched: [],
    invalidCityTested: false,
  });

  const loadWeatherForLocation = useCallback(
    async (location: GeocodingLocation, geocodingUrl?: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const intelligence = await fetchWeatherIntelligence(location, geocodingUrl);
        setReport(intelligence);
        setValidationProgress((prev) => {
          const exists = prev.validCitiesSearched.some(
            (c) => c.toLowerCase() === location.name.toLowerCase()
          );
          return {
            ...prev,
            validCitiesSearched: exists
              ? prev.validCitiesSearched
              : [...prev.validCitiesSearched, location.name],
          };
        });
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : 'Unable to retrieve forecast data from Open-Meteo.';
        setError(message);
        setValidationProgress((prev) => ({
          ...prev,
          invalidCityTested: true,
          lastErrorTested: message,
        }));
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const handleCitySearch = useCallback(
    async (query: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const { results, requestUrl } = await searchCities(query);
        setCandidateLocations(results);
        await loadWeatherForLocation(results[0], requestUrl);
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : `City not found: Could not resolve "${query}".`;
        setError(message);
        setCandidateLocations([]);
        setValidationProgress((prev) => ({
          ...prev,
          invalidCityTested: true,
          lastErrorTested: message,
        }));
        setIsLoading(false);
      }
    },
    [loadWeatherForLocation]
  );

  useEffect(() => {
    handleCitySearch('Chennai');
  }, [handleCitySearch]);

  const toggleUnit = () => {
    setUnit((prev) => (prev === 'celsius' ? 'fahrenheit' : 'celsius'));
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Top Bar Contract: 3 Zones (Brand Wordmark — 4 Nav Links — 1 Primary Action) */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xs border-b border-slate-200">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Zone 1: Single text element wordmark */}
          <a
            href="#top"
            className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap"
          >
            Weather Intelligence
          </a>

          {/* Zone 2: 4 Clean Text Navigation Links */}
          <nav
            aria-label="Primary Navigation"
            className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600"
          >
            <a
              href="#current-weather"
              className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap"
            >
              Current Weather
            </a>
            <a
              href="#forecast-section"
              className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap"
            >
              7-Day Forecast
            </a>
            <a
              href="#analytics-charts"
              className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap"
            >
              Trend Charts
            </a>
            <a
              href="#planning-intelligence"
              className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap"
            >
              Recommendations
            </a>
            <a
              href="#deployment-guide"
              className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap"
            >
              Cloudflare Guide
            </a>
          </nav>

          {/* Zone 3: 1 Primary Action (Unit Toggle) */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleUnit}
              aria-label="Toggle temperature unit between Celsius and Fahrenheit"
              className="px-3.5 py-2 text-xs font-semibold text-slate-900 bg-slate-100 border border-slate-200 rounded-lg hover:bg-slate-200 transition-colors whitespace-nowrap cursor-pointer font-mono tabular-nums"
            >
              Unit: {unit === 'celsius' ? '°C (Metric)' : '°F (Imperial)'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Container (1280px desktop presence) */}
      <main id="top" className="flex-1 max-w-[1280px] w-full mx-auto px-4 sm:px-6 py-8">
        {/* City Search & Validation Bar */}
        <SearchBar
          onSearch={handleCitySearch}
          onSelectLocation={(loc) => loadWeatherForLocation(loc)}
          candidateLocations={candidateLocations}
          activeLocation={report?.location || null}
          isLoading={isLoading}
          error={error}
          onClearError={() => setError(null)}
          validationProgress={validationProgress}
        />

        {/* Loading Skeleton State */}
        {isLoading && !report && (
          <div className="space-y-6 animate-pulse" aria-busy="true" aria-label="Loading weather telemetry">
            <div className="bg-white border border-slate-200 rounded-xl p-8 h-56" />
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
              {Array.from({ length: 7 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white border border-slate-200 rounded-xl p-4 h-40"
                />
              ))}
            </div>
          </div>
        )}

        {/* Main Weather Intelligence Modules */}
        {report && (
          <div className={isLoading ? 'opacity-60 transition-opacity' : 'transition-opacity'}>
            <div id="current-weather" className="scroll-mt-20">
              <CurrentWeatherPanel report={report} unit={unit} />
            </div>

            <div id="forecast-section" className="scroll-mt-20">
              <ForecastSection daily={report.daily} unit={unit} />
            </div>

            <div id="analytics-charts" className="scroll-mt-20">
              <WeatherCharts
                hourly={report.hourly}
                daily={report.daily}
                unit={unit}
              />
            </div>

            <div id="planning-intelligence" className="scroll-mt-20">
              <RecommendationsPanel
                recommendations={report.recommendations}
                cityName={report.location.name}
              />
            </div>
          </div>
        )}

        {/* GitHub & Cloudflare Pages Deployment Verification Guide */}
        <div id="deployment-guide" className="scroll-mt-20">
          <DeploymentGuide
            validationProgress={validationProgress}
            report={report}
            onTriggerSearch={handleCitySearch}
          />
        </div>
      </main>

      {/* Quiet Editorial Footer */}
      <footer className="bg-white border-t border-slate-200 py-6">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            Weather Intelligence Application · Powered by Public Open-Meteo Geocoding & Forecast APIs
          </div>
          <div className="flex items-center gap-3">
            <span>Zero Private Keys Required</span>
            <span aria-hidden="true">·</span>
            <span>Cloudflare Pages Ready (npm run build → dist)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
