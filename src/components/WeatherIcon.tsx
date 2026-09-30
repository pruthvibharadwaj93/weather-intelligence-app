import React from 'react';
import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudRainWind,
  CloudSnow,
  CloudSun,
  Sun,
} from 'lucide-react';
import { getWmoCondition } from '../services/weatherApi';

interface WeatherIconProps {
  code: number;
  className?: string;
}

export const WeatherIcon: React.FC<WeatherIconProps> = ({ code, className = 'w-6 h-6' }) => {
  const { iconType } = getWmoCondition(code);

  switch (iconType) {
    case 'clear':
      return <Sun className={`${className} text-amber-500`} aria-hidden="true" />;
    case 'partly-cloudy':
      return <CloudSun className={`${className} text-sky-600`} aria-hidden="true" />;
    case 'cloudy':
      return <Cloud className={`${className} text-slate-500`} aria-hidden="true" />;
    case 'fog':
      return <CloudFog className={`${className} text-slate-400`} aria-hidden="true" />;
    case 'drizzle':
      return <CloudDrizzle className={`${className} text-sky-500`} aria-hidden="true" />;
    case 'rain':
      return <CloudRain className={`${className} text-blue-600`} aria-hidden="true" />;
    case 'heavy-rain':
      return <CloudRainWind className={`${className} text-blue-700`} aria-hidden="true" />;
    case 'snow':
      return <CloudSnow className={`${className} text-cyan-600`} aria-hidden="true" />;
    case 'thunderstorm':
      return <CloudLightning className={`${className} text-amber-600`} aria-hidden="true" />;
    default:
      return <CloudSun className={`${className} text-sky-600`} aria-hidden="true" />;
  }
};
