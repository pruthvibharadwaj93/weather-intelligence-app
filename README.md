# Weather Intelligence App — Cloudflare Pages Deployment

A production-ready **Weather Intelligence Application** built in **Google AI Studio App Build** using React, TypeScript, Vite, and Tailwind CSS. It integrates directly with the public **Open-Meteo Geocoding API** and **Open-Meteo Forecast API** to provide real-time current weather telemetry, 24-hour and 7-day forecast analytics, interactive SVG charts, and deterministic rule-based planning recommendations.

---

## 1. Architecture & Project Structure

| File or Folder | Purpose |
| :--- | :--- |
| `src/` | React and TypeScript source code |
| `src/App.tsx` | Main application state, navigation, and layout orchestration |
| `src/types/weather.ts` | TypeScript interfaces for Open-Meteo Geocoding, Forecast, and Planning models |
| `src/services/weatherApi.ts` | Open-Meteo Geocoding and Forecast API integration and recommendation engine |
| `src/components/SearchBar.tsx` | City search bar, geocoding disambiguation, and quick-test validation triggers |
| `src/components/CurrentWeatherPanel.tsx` | Current meteorological conditions and atmospheric metrics |
| `src/components/ForecastSection.tsx` | 7-day daily forecast cards and detailed tabular schedule |
| `src/components/WeatherCharts.tsx` | Interactive 7-day trend and 24-hour hourly forecast SVG charts |
| `src/components/RecommendationsPanel.tsx` | Rule-based weather intelligence and operational planning recommendations |
| `src/components/DeploymentGuide.tsx` | Interactive GitHub-to-Cloudflare Pages deployment guide and validation tracker |
| `wrangler.jsonc` | Cloudflare SPA static assets configuration (`not_found_handling: "single-page-application"`) |
| `package.json` | Project dependencies and build scripts (`npm run dev`, `npm run build`) |
| `vite.config.ts` | Vite bundler configuration |

---

## 2. Public APIs Used (No API Keys Required)

This application complies strictly with Responsible AI and Access Guardrails by using **only public weather data from Open-Meteo** with zero client secrets or private API keys:

1. **Open-Meteo Geocoding API**
   - **Endpoint**: `https://geocoding-api.open-meteo.com/v1/search`
   - **Purpose**: Resolves city search queries into geographic coordinates (`latitude`, `longitude`), elevation, region, country, and timezone.
2. **Open-Meteo Forecast API**
   - **Endpoint**: `https://api.open-meteo.com/v1/forecast`
   - **Purpose**: Fetches current weather conditions, 24-hour hourly trends, and 7-day daily forecast data.

---

## 3. Local Development & Build Verification

To run and verify the project in an approved local environment:

```bash
# 1. Verify Node and npm versions
node -v
npm -v

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev

# 4. Run production build (outputs to ./dist)
npm run build
```

---

## 4. Google AI Studio to GitHub & Cloudflare Pages Deployment Guide

### Step 1: Connect Google AI Studio to GitHub
1. In **Google AI Studio App Build**, select the direct **GitHub connection** option.
2. Create or select the approved GitHub repository for the assignment.
3. Push the generated application source code to GitHub.
4. Open your GitHub repository and verify that `package.json`, `src/`, `public/_redirects`, `vite.config.ts`, and `README.md` are present.

### Step 2: Connect GitHub Repository to Cloudflare Pages
1. Log in to your approved **Cloudflare** account and navigate to **Workers & Pages**.
2. Click **Create** → **Pages** → **Connect to Git**.
3. Select the GitHub repository connected from Google AI Studio.
4. Configure the build settings for Vite:
   - **Framework preset**: `Vite` (or `None`)
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
5. Click **Save and Deploy** and capture the deployment log.

### Step 3: Validate the Live `pages.dev` Deployment
Open your live `https://<project-name>.pages.dev` URL and run the mandatory validation checks:
- **Valid City Search 1**: Search `Chennai` — verify current weather, 7-day forecast, charts, and planning recommendations update.
- **Valid City Search 2**: Search `London` — verify location metadata, forecast cards, and recommendations update.
- **Invalid City / Error State**: Search an invalid city (e.g., `xyz_invalid_city_999`) — verify the graceful "City not found" alert message displays without crashing the application.
- **Browser Refresh (`SPA Routing`)**: Refresh the browser on the live `pages.dev` URL — `public/_redirects` (`/* /index.html 200`) ensures the page reloads cleanly with status `200`.
- **Responsive Layout**: Resize the browser window to verify desktop and mobile usability.
