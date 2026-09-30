import {
  CurrentWeather,
  DailyForecastDay,
  GeocodingLocation,
  HourlyForecastPoint,
  PlanningRecommendation,
  TemperatureUnit,
  WeatherIntelligenceReport,
} from '../types/weather';

const GEOCODING_API_BASE = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_API_BASE = 'https://api.open-meteo.com/v1/forecast';

export interface WmoConditionInfo {
  label: string;
  shortLabel: string;
  iconType:
    | 'clear'
    | 'partly-cloudy'
    | 'cloudy'
    | 'fog'
    | 'drizzle'
    | 'rain'
    | 'heavy-rain'
    | 'snow'
    | 'thunderstorm';
}

export function getWmoCondition(code: number): WmoConditionInfo {
  switch (code) {
    case 0:
      return { label: 'Clear Sky', shortLabel: 'Clear', iconType: 'clear' };
    case 1:
      return { label: 'Mainly Clear', shortLabel: 'Mainly Clear', iconType: 'partly-cloudy' };
    case 2:
      return { label: 'Partly Cloudy', shortLabel: 'Partly Cloudy', iconType: 'partly-cloudy' };
    case 3:
      return { label: 'Overcast', shortLabel: 'Overcast', iconType: 'cloudy' };
    case 45:
    case 48:
      return { label: 'Fog & Rime Deposit', shortLabel: 'Foggy', iconType: 'fog' };
    case 51:
    case 53:
    case 55:
      return { label: 'Light to Moderate Drizzle', shortLabel: 'Drizzle', iconType: 'drizzle' };
    case 56:
    case 57:
      return { label: 'Freezing Drizzle', shortLabel: 'Freezing Drizzle', iconType: 'drizzle' };
    case 61:
    case 63:
      return { label: 'Slight to Moderate Rain', shortLabel: 'Rain', iconType: 'rain' };
    case 65:
      return { label: 'Heavy Intensity Rain', shortLabel: 'Heavy Rain', iconType: 'heavy-rain' };
    case 66:
    case 67:
      return { label: 'Freezing Rain', shortLabel: 'Freezing Rain', iconType: 'heavy-rain' };
    case 71:
    case 73:
    case 75:
    case 77:
      return { label: 'Snowfall', shortLabel: 'Snow', iconType: 'snow' };
    case 80:
    case 81:
      return { label: 'Rain Showers', shortLabel: 'Showers', iconType: 'rain' };
    case 82:
      return { label: 'Violent Rain Showers', shortLabel: 'Heavy Showers', iconType: 'heavy-rain' };
    case 85:
    case 86:
      return { label: 'Snow Showers', shortLabel: 'Snow Showers', iconType: 'snow' };
    case 95:
    case 96:
    case 99:
      return { label: 'Thunderstorm Activity', shortLabel: 'Thunderstorm', iconType: 'thunderstorm' };
    default:
      return { label: 'Variable Conditions', shortLabel: 'Variable', iconType: 'partly-cloudy' };
  }
}

export function formatTemperature(celsius: number, unit: TemperatureUnit, includeUnit = true): string {
  const value = unit === 'fahrenheit' ? (celsius * 9) / 5 + 32 : celsius;
  const rounded = Math.round(value * 10) / 10;
  const formatted = Number.isInteger(rounded) ? `${rounded}` : rounded.toFixed(1);
  if (!includeUnit) return formatted;
  return `${formatted}°${unit === 'fahrenheit' ? 'F' : 'C'}`;
}

export function convertTempValue(celsius: number, unit: TemperatureUnit): number {
  const value = unit === 'fahrenheit' ? (celsius * 9) / 5 + 32 : celsius;
  return Math.round(value * 10) / 10;
}

export function getCompassDirection(degrees: number): string {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(((degrees %= 360) < 0 ? degrees + 360 : degrees) / 45) % 8;
  return directions[index];
}

export async function searchCities(query: string): Promise<{
  results: GeocodingLocation[];
  requestUrl: string;
}> {
  const trimmed = query.trim();
  if (!trimmed) {
    throw new Error('Please enter a valid city name to search.');
  }

  const params = new URLSearchParams({
    name: trimmed,
    count: '6',
    language: 'en',
    format: 'json',
  });
  const requestUrl = `${GEOCODING_API_BASE}?${params.toString()}`;

  const response = await fetch(requestUrl);
  if (!response.ok) {
    throw new Error(`Open-Meteo Geocoding API returned HTTP ${response.status}.`);
  }

  const data = await response.json();
  if (!data.results || !Array.isArray(data.results) || data.results.length === 0) {
    throw new Error(
      `City not found: No geographic coordinates matched "${trimmed}" in Open-Meteo Geocoding API.`
    );
  }

  return {
    results: data.results as GeocodingLocation[],
    requestUrl,
  };
}

export async function fetchWeatherIntelligence(
  location: GeocodingLocation,
  geocodingUrl?: string
): Promise<WeatherIntelligenceReport> {
  const params = new URLSearchParams({
    latitude: location.latitude.toString(),
    longitude: location.longitude.toString(),
    current: [
      'temperature_2m',
      'relative_humidity_2m',
      'apparent_temperature',
      'is_day',
      'precipitation',
      'weather_code',
      'cloud_cover',
      'surface_pressure',
      'wind_speed_10m',
      'wind_direction_10m',
      'wind_gusts_10m',
    ].join(','),
    hourly: [
      'temperature_2m',
      'apparent_temperature',
      'precipitation_probability',
      'precipitation',
      'weather_code',
      'wind_speed_10m',
      'uv_index',
      'relative_humidity_2m',
    ].join(','),
    daily: [
      'weather_code',
      'temperature_2m_max',
      'temperature_2m_min',
      'apparent_temperature_max',
      'apparent_temperature_min',
      'sunrise',
      'sunset',
      'uv_index_max',
      'precipitation_sum',
      'precipitation_probability_max',
      'wind_speed_10m_max',
      'wind_direction_10m_dominant',
    ].join(','),
    timezone: 'auto',
    forecast_days: '7',
  });

  const forecastUrl = `${FORECAST_API_BASE}?${params.toString()}`;
  const response = await fetch(forecastUrl);

  if (!response.ok) {
    throw new Error(`Open-Meteo Forecast API error: HTTP ${response.status}`);
  }

  const data = await response.json();

  // Determine current hour index for UV & hourly slice
  const currentIso = data.current?.time || '';
  const hourlyTimes: string[] = data.hourly?.time || [];
  let startIndex = hourlyTimes.findIndex((t) => t >= currentIso);
  if (startIndex === -1) startIndex = 0;

  const currentUv = data.hourly?.uv_index?.[startIndex] ?? data.daily?.uv_index_max?.[0] ?? 0;

  const current: CurrentWeather = {
    time: data.current.time,
    temperature: data.current.temperature_2m,
    apparentTemperature: data.current.apparent_temperature,
    relativeHumidity: data.current.relative_humidity_2m,
    isDay: data.current.is_day === 1,
    precipitation: data.current.precipitation,
    weatherCode: data.current.weather_code,
    cloudCover: data.current.cloud_cover,
    surfacePressure: data.current.surface_pressure,
    windSpeed: data.current.wind_speed_10m,
    windDirection: data.current.wind_direction_10m,
    windGusts: data.current.wind_gusts_10m,
    uvIndex: currentUv,
  };

  const hourly: HourlyForecastPoint[] = hourlyTimes
    .slice(startIndex, startIndex + 24)
    .map((time, idx) => {
      const i = startIndex + idx;
      return {
        time,
        temperature: data.hourly.temperature_2m[i] ?? 0,
        apparentTemperature: data.hourly.apparent_temperature[i] ?? 0,
        precipitationProbability: data.hourly.precipitation_probability[i] ?? 0,
        precipitation: data.hourly.precipitation[i] ?? 0,
        weatherCode: data.hourly.weather_code[i] ?? 0,
        windSpeed: data.hourly.wind_speed_10m[i] ?? 0,
        uvIndex: data.hourly.uv_index[i] ?? 0,
        relativeHumidity: data.hourly.relative_humidity_2m[i] ?? 0,
      };
    });

  const dailyTimes: string[] = data.daily?.time || [];
  const daily: DailyForecastDay[] = dailyTimes.slice(0, 7).map((date, idx) => ({
    date,
    weatherCode: data.daily.weather_code[idx] ?? 0,
    temperatureMax: data.daily.temperature_2m_max[idx] ?? 0,
    temperatureMin: data.daily.temperature_2m_min[idx] ?? 0,
    apparentTemperatureMax: data.daily.apparent_temperature_max[idx] ?? 0,
    apparentTemperatureMin: data.daily.apparent_temperature_min[idx] ?? 0,
    sunrise: data.daily.sunrise[idx] ?? '',
    sunset: data.daily.sunset[idx] ?? '',
    uvIndexMax: data.daily.uv_index_max[idx] ?? 0,
    precipitationSum: data.daily.precipitation_sum[idx] ?? 0,
    precipitationProbabilityMax: data.daily.precipitation_probability_max[idx] ?? 0,
    windSpeedMax: data.daily.wind_speed_10m_max[idx] ?? 0,
    windDirectionDominant: data.daily.wind_direction_10m_dominant[idx] ?? 0,
  }));

  const resolvedLocation: GeocodingLocation = {
    ...location,
    timezone: data.timezone || location.timezone,
    elevation: data.elevation ?? location.elevation,
  };

  const recommendations = buildPlanningRecommendations(current, hourly, daily);

  return {
    location: resolvedLocation,
    current,
    hourly,
    daily,
    recommendations,
    fetchedAt: new Date().toISOString(),
    geocodingUrl:
      geocodingUrl ||
      `${GEOCODING_API_BASE}?name=${encodeURIComponent(location.name)}&count=6&language=en&format=json`,
    forecastUrl,
  };
}

function buildPlanningRecommendations(
  current: CurrentWeather,
  hourly: HourlyForecastPoint[],
  daily: DailyForecastDay[]
): PlanningRecommendation[] {
  const today = daily[0];
  const next12h = hourly.slice(0, 12);
  const maxRainProbNext12h = Math.max(
    ...next12h.map((h) => h.precipitationProbability),
    today?.precipitationProbabilityMax ?? 0
  );
  const maxWindNext12h = Math.max(...next12h.map((h) => h.windSpeed), current.windSpeed);
  const maxUvToday = Math.max(current.uvIndex, today?.uvIndexMax ?? 0);

  const recommendations: PlanningRecommendation[] = [];

  // 1. Commute & Transit Readiness
  if (maxRainProbNext12h >= 60 || current.precipitation > 0.5 || current.weatherCode >= 61) {
    recommendations.push({
      id: 'commute-transit',
      category: 'Commute & Transit',
      title: 'Wet Surface & Rain Buffer Advised',
      severity: maxRainProbNext12h >= 80 || current.weatherCode >= 80 ? 'caution' : 'advisory',
      actionSummary:
        'Add 15–20 minutes to road transit times and carry waterproof outer gear for upcoming commutes.',
      rationale:
        'Elevated precipitation probability or active rainfall reduces braking traction and visibility along urban corridors.',
      triggerMetric: `${maxRainProbNext12h}% peak rain probability · ${current.precipitation} mm active precip`,
    });
  } else if (maxWindNext12h >= 35) {
    recommendations.push({
      id: 'commute-transit',
      category: 'Commute & Transit',
      title: 'Crosswind Advisory for Open Routes',
      severity: 'advisory',
      actionSummary:
        'Exercise caution on elevated bridges, coastal highways, and two-wheeled transit due to gusty winds.',
      rationale:
        'Sustained wind speeds exceeding 35 km/h can impact cyclist stability and high-profile vehicles.',
      triggerMetric: `${maxWindNext12h.toFixed(1)} km/h peak wind · Gusts ${current.windGusts.toFixed(1)} km/h`,
    });
  } else {
    recommendations.push({
      id: 'commute-transit',
      category: 'Commute & Transit',
      title: 'Clear Corridor Conditions',
      severity: 'optimal',
      actionSummary:
        'Standard transit schedules apply. Dry pavement and stable wind conditions across the next 12 hours.',
      rationale:
        'Low precipitation probability and moderate surface winds support uninterrupted road and pedestrian mobility.',
      triggerMetric: `${maxRainProbNext12h}% rain risk · ${current.windSpeed.toFixed(1)} km/h wind`,
    });
  }

  // 2. Outdoor Operations & Optimal Window
  const daytimeHours = hourly.slice(0, 16).filter((h) => {
    const hourNum = Number(h.time.split('T')[1]?.slice(0, 2) || 12);
    return hourNum >= 7 && hourNum <= 19;
  });

  const bestHour =
    daytimeHours.length > 0
      ? [...daytimeHours].sort((a, b) => {
          const scoreA =
            a.precipitationProbability * 1.5 + Math.abs(a.apparentTemperature - 22) * 2 + a.windSpeed * 0.5;
          const scoreB =
            b.precipitationProbability * 1.5 + Math.abs(b.apparentTemperature - 22) * 2 + b.windSpeed * 0.5;
          return scoreA - scoreB;
        })[0]
      : hourly[0];

  const bestTimeFormatted = bestHour?.time.split('T')[1] || '10:00';

  if (current.apparentTemperature >= 34) {
    recommendations.push({
      id: 'outdoor-window',
      category: 'Outdoor Scheduling',
      title: 'High Thermal Load — Shift Tasks to Early Morning',
      severity: 'caution',
      actionSummary: `Schedule strenuous outdoor activities near ${bestTimeFormatted} and enforce shaded hydration breaks.`,
      rationale:
        'Apparent temperature ("Feels Like") exceeds 34°C, increasing heat exhaustion risk during peak solar hours.',
      triggerMetric: `Feels like ${current.apparentTemperature.toFixed(1)}°C · ${current.relativeHumidity}% RH`,
    });
  } else if (current.apparentTemperature <= 6) {
    recommendations.push({
      id: 'outdoor-window',
      category: 'Outdoor Scheduling',
      title: 'Cold Exposure — Midday Activity Window Preferred',
      severity: 'advisory',
      actionSummary: `Target outdoor errands and field tasks around ${bestTimeFormatted} when ambient temperatures peak.`,
      rationale:
        'Low apparent temperatures combined with surface breeze accelerate convective heat loss during morning/evening hours.',
      triggerMetric: `Feels like ${current.apparentTemperature.toFixed(1)}°C · Best window ${bestTimeFormatted}`,
    });
  } else {
    recommendations.push({
      id: 'outdoor-window',
      category: 'Outdoor Scheduling',
      title: `Favorable Outdoor Window Around ${bestTimeFormatted}`,
      severity: 'optimal',
      actionSummary: `Ideal conditions for outdoor exercise, site inspections, or recreation around ${bestTimeFormatted}.`,
      rationale:
        'Comfortable thermal index paired with low precipitation probability makes daytime outdoor scheduling reliable.',
      triggerMetric: `${bestHour?.temperature.toFixed(1)}°C at ${bestTimeFormatted} · ${bestHour?.precipitationProbability ?? 0}% rain risk`,
    });
  }

  // 3. UV Radiation & Personal Exposure
  if (maxUvToday >= 7) {
    recommendations.push({
      id: 'uv-health',
      category: 'Solar & UV Protection',
      title: 'High UV Index — Broad-Spectrum SPF 30+ Required',
      severity: maxUvToday >= 9 ? 'caution' : 'advisory',
      actionSummary:
        'Apply SPF 30+ sunscreen, wear UV-blocking eyewear, and minimize direct solar exposure between 11:00 and 15:00.',
      rationale:
        'Daily UV index reaches high-to-extreme levels capable of causing unprotected skin damage within 20 minutes.',
      triggerMetric: `Max UV Index ${maxUvToday.toFixed(1)} · Cloud cover ${current.cloudCover}%`,
    });
  } else if (maxUvToday >= 3) {
    recommendations.push({
      id: 'uv-health',
      category: 'Solar & UV Protection',
      title: 'Moderate UV Exposure During Midday',
      severity: 'advisory',
      actionSummary:
        'Sunglasses and light sun protection recommended for extended midday outdoor periods.',
      rationale:
        'Moderate solar radiation levels require basic precautions during peak sun elevation.',
      triggerMetric: `Max UV Index ${maxUvToday.toFixed(1)} · Cloud cover ${current.cloudCover}%`,
    });
  } else {
    recommendations.push({
      id: 'uv-health',
      category: 'Solar & UV Protection',
      title: 'Low Solar UV Intensity',
      severity: 'optimal',
      actionSummary:
        'Minimal UV hazard today; no specialized sun protection required for normal outdoor duration.',
      rationale:
        'Peak UV index remains below 3 due to solar angle or atmospheric cloud attenuation.',
      triggerMetric: `Max UV Index ${maxUvToday.toFixed(1)} · Cloud cover ${current.cloudCover}%`,
    });
  }

  // 4. Apparel & Gear Advisory
  const tempDiff = (today?.temperatureMax ?? current.temperature) - (today?.temperatureMin ?? current.temperature);
  if ( current.temperature >= 28 ) {
    recommendations.push({
      id: 'apparel-gear',
      category: 'Apparel & Gear',
      title: 'Breathable Moisture-Wicking Fabrics',
      severity: maxRainProbNext12h >= 45 ? 'advisory' : 'optimal',
      actionSummary:
        maxRainProbNext12h >= 45
          ? 'Wear lightweight breathable clothing and pack a compact travel umbrella for afternoon showers.'
          : 'Opt for light cotton or moisture-wicking linen fabrics and carry a refillable water bottle.',
      rationale:
        'Warm ambient temperatures and humidity demand high-airflow clothing to maintain thermal comfort.',
      triggerMetric: `High ${today?.temperatureMax.toFixed(1)}°C / Low ${today?.temperatureMin.toFixed(1)}°C`,
    });
  } else if (current.temperature <= 12) {
    recommendations.push({
      id: 'apparel-gear',
      category: 'Apparel & Gear',
      title: 'Insulated Layering & Windproof Shell',
      severity: 'advisory',
      actionSummary:
        'Use a thermal base layer with an insulated mid-layer and wind-resistant outer jacket.',
      rationale:
        'Cool ambient air and wind chill require multi-layer insulation to retain core warmth outdoors.',
      triggerMetric: `Current ${current.temperature.toFixed(1)}°C · Diurnal swing ${tempDiff.toFixed(1)}°C`,
    });
  } else {
    recommendations.push({
      id: 'apparel-gear',
      category: 'Apparel & Gear',
      title: 'Versatile Light Layering Recommended',
      severity: 'optimal',
      actionSummary:
        tempDiff >= 8
          ? 'Dress in removable light layers (shirt + light jacket) to adapt to morning-to-afternoon temperature swings.'
          : 'Comfortable everyday attire works well; keep a light shell handy for evening breeze.',
      rationale:
        'Temperate conditions with moderate diurnal variation favor adaptable layering.',
      triggerMetric: `High ${today?.temperatureMax.toFixed(1)}°C · Low ${today?.temperatureMin.toFixed(1)}°C`,
    });
  }

  // 5. 7-Day Strategic Planning Outlook
  const bestDay = [...daily].sort((a, b) => {
    const scoreA = a.precipitationProbabilityMax * 1.2 + Math.abs(a.temperatureMax - 24) * 1.5 + a.windSpeedMax * 0.4;
    const scoreB = b.precipitationProbabilityMax * 1.2 + Math.abs(b.temperatureMax - 24) * 1.5 + b.windSpeedMax * 0.4;
    return scoreA - scoreB;
  })[0];

  const wetDaysCount = daily.filter((d) => d.precipitationProbabilityMax >= 55 || d.precipitationSum >= 2.5).length;
  const bestDayLabel = bestDay
    ? new Date(`${bestDay.date}T12:00:00`).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
      })
    : 'Upcoming Week';

  recommendations.push({
    id: 'weekly-outlook',
    category: '7-Day Strategic Outlook',
    title:
      wetDaysCount >= 3
        ? `${wetDaysCount} Rain-Prone Days Ahead — Best Day: ${bestDayLabel}`
        : `Stable Weekly Pattern — Peak Day: ${bestDayLabel}`,
    severity: wetDaysCount >= 4 ? 'advisory' : 'optimal',
    actionSummary: `Prioritize major outdoor logistics, travel, or events on ${bestDayLabel} (${bestDay?.precipitationProbabilityMax ?? 0}% rain risk, high of ${bestDay?.temperatureMax.toFixed(1)}°C).`,
    rationale: `Across the 7-day forecast horizon, ${wetDaysCount} of 7 days show ≥55% precipitation probability.`,
    triggerMetric: `${wetDaysCount}/7 wet days · Best day max ${bestDay?.temperatureMax.toFixed(1)}°C`,
  });

  return recommendations;
}
