export type TemperatureUnit = 'celsius' | 'fahrenheit';

export interface GeocodingLocation {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  elevation?: number;
  country?: string;
  country_code?: string;
  admin1?: string;
  timezone?: string;
  population?: number;
}

export interface CurrentWeather {
  time: string;
  temperature: number;
  apparentTemperature: number;
  relativeHumidity: number;
  isDay: boolean;
  precipitation: number;
  weatherCode: number;
  cloudCover: number;
  surfacePressure: number;
  windSpeed: number;
  windDirection: number;
  windGusts: number;
  uvIndex: number;
}

export interface HourlyForecastPoint {
  time: string;
  temperature: number;
  apparentTemperature: number;
  precipitationProbability: number;
  precipitation: number;
  weatherCode: number;
  windSpeed: number;
  uvIndex: number;
  relativeHumidity: number;
}

export interface DailyForecastDay {
  date: string;
  weatherCode: number;
  temperatureMax: number;
  temperatureMin: number;
  apparentTemperatureMax: number;
  apparentTemperatureMin: number;
  sunrise: string;
  sunset: string;
  uvIndexMax: number;
  precipitationSum: number;
  precipitationProbabilityMax: number;
  windSpeedMax: number;
  windDirectionDominant: number;
}

export type RecommendationSeverity = 'optimal' | 'advisory' | 'caution';

export interface PlanningRecommendation {
  id: string;
  category: string;
  title: string;
  severity: RecommendationSeverity;
  actionSummary: string;
  rationale: string;
  triggerMetric: string;
}

export interface WeatherIntelligenceReport {
  location: GeocodingLocation;
  current: CurrentWeather;
  hourly: HourlyForecastPoint[];
  daily: DailyForecastDay[];
  recommendations: PlanningRecommendation[];
  fetchedAt: string;
  geocodingUrl: string;
  forecastUrl: string;
}

export interface ValidationProgress {
  validCitiesSearched: string[];
  invalidCityTested: boolean;
  lastErrorTested?: string;
}
