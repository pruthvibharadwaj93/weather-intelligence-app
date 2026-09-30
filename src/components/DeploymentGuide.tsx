import React, { useState } from 'react';
import { Check, Copy, ExternalLink, Terminal } from 'lucide-react';
import { ValidationProgress, WeatherIntelligenceReport } from '../types/weather';

interface DeploymentGuideProps {
  validationProgress: ValidationProgress;
  report: WeatherIntelligenceReport | null;
  onTriggerSearch: (city: string) => void;
}

export const DeploymentGuide: React.FC<DeploymentGuideProps> = ({
  validationProgress,
  report,
  onTriggerSearch,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyText = (key: string, value: string) => {
    navigator.clipboard.writeText(value);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const chennaiTested = validationProgress.validCitiesSearched.some(
    (c) => c.toLowerCase() === 'chennai'
  );
  const londonTested = validationProgress.validCitiesSearched.some(
    (c) => c.toLowerCase() === 'london'
  );
  const twoValidTested = validationProgress.validCitiesSearched.length >= 2;

  return (
    <section aria-label="Cloudflare Pages Deployment and Verification Guide" className="mb-10">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-900">
          04. GitHub & Cloudflare Pages Deployment Readiness
        </h2>
        <p className="text-xs text-slate-500">
          Configuration reference, live API endpoint verification, and troubleshooting guide for Level 2 submission
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1: Cloudflare Build Settings & SPA Redirects */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="text-xs text-slate-500 mb-1">Step 4 & Step 6 · Build Configuration</div>
            <h3 className="text-base font-semibold text-slate-900">
              Cloudflare Pages Settings (Vite)
            </h3>
            <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
              Connect the GitHub repository pushed directly from Google AI Studio to Cloudflare Workers & Pages using these exact build parameters:
            </p>

            <div className="mt-4 divide-y divide-slate-100 border border-slate-200 rounded-lg bg-slate-50/50">
              <div className="p-3 flex items-center justify-between gap-2">
                <div>
                  <div className="text-xs text-slate-500">Framework Preset</div>
                  <div className="text-sm font-mono font-semibold text-slate-900">Vite</div>
                </div>
              </div>

              <div className="p-3 flex items-center justify-between gap-2">
                <div>
                  <div className="text-xs text-slate-500">Build Command</div>
                  <div className="text-sm font-mono font-semibold text-slate-900">npm run build</div>
                </div>
                <button
                  type="button"
                  onClick={() => copyText('buildCmd', 'npm run build')}
                  className="px-2.5 py-1 text-xs font-medium bg-white border border-slate-200 rounded hover:bg-slate-100 text-slate-700 flex items-center gap-1 cursor-pointer"
                >
                  {copiedKey === 'buildCmd' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Copy
                    </>
                  )}
                </button>
              </div>

              <div className="p-3 flex items-center justify-between gap-2">
                <div>
                  <div className="text-xs text-slate-500">Build Output Directory</div>
                  <div className="text-sm font-mono font-semibold text-slate-900">dist</div>
                </div>
                <button
                  type="button"
                  onClick={() => copyText('distDir', 'dist')}
                  className="px-2.5 py-1 text-xs font-medium bg-white border border-slate-200 rounded hover:bg-slate-100 text-slate-700 flex items-center gap-1 cursor-pointer"
                >
                  {copiedKey === 'distDir' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Copy
                    </>
                  )}
                </button>
              </div>

              <div className="p-3 flex items-center justify-between gap-2">
                <div>
                  <div className="text-xs text-slate-500">SPA Routing (wrangler.jsonc)</div>
                  <div className="text-xs font-mono font-semibold text-slate-900">
                    not_found_handling: "single-page-application"
                  </div>
                </div>
                <span className="text-xs text-emerald-700 font-medium">Configured</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500">
            Zero private API keys or secrets required. Uses public Open-Meteo endpoints.
          </div>
        </div>

        {/* Column 2: Interactive Validation Checklist */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="text-xs text-slate-500 mb-1">Step 7 – Step 11 · Live Validation</div>
            <h3 className="text-base font-semibold text-slate-900">
              Mandatory Test Verification
            </h3>
            <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
              Run each test scenario below and capture screenshots showing the live URL, valid city weather, and invalid city error handling:
            </p>

            <div className="mt-4 space-y-2.5">
              <div className="p-3 rounded-lg border border-slate-200 flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-semibold text-slate-900">
                    1. Valid City Test A: Chennai
                  </div>
                  <div className="text-xs text-slate-500">
                     Status: {chennaiTested ? 'Verified in session' : 'Click to test'}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onTriggerSearch('Chennai')}
                  className="px-3 py-1.5 text-xs font-medium bg-slate-900 text-white rounded-md hover:bg-slate-800 whitespace-nowrap cursor-pointer"
                >
                  Run Chennai
                </button>
              </div>

              <div className="p-3 rounded-lg border border-slate-200 flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-semibold text-slate-900">
                    2. Valid City Test B: London
                  </div>
                  <div className="text-xs text-slate-500">
                    Status: {londonTested ? 'Verified in session' : 'Click to test'}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onTriggerSearch('London')}
                  className="px-3 py-1.5 text-xs font-medium bg-slate-900 text-white rounded-md hover:bg-slate-800 whitespace-nowrap cursor-pointer"
                >
                  Run London
                </button>
              </div>

              <div className="p-3 rounded-lg border border-slate-200 flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-semibold text-slate-900">
                    3. Invalid City / Error State Test
                  </div>
                  <div className="text-xs text-slate-500">
                    Status:{' '}
                    {validationProgress.invalidCityTested
                      ? 'Error banner verified'
                      : 'Click to trigger'}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onTriggerSearch('NotARealCity_XYZ999')}
                  className="px-3 py-1.5 text-xs font-medium bg-amber-600 text-white rounded-md hover:bg-amber-700 whitespace-nowrap cursor-pointer"
                >
                  Run Invalid City
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 font-mono tabular-nums">
            Progress: {twoValidTested ? '2/2' : `${validationProgress.validCitiesSearched.length}/2`} Valid Cities ·{' '}
            {validationProgress.invalidCityTested ? '1/1' : '0/1'} Error State
          </div>
        </div>

        {/* Column 3: Open-Meteo Endpoint Inspector & Local CLI Reference */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="text-xs text-slate-500 mb-1">Human-in-the-Loop · API & CLI Audit</div>
            <h3 className="text-base font-semibold text-slate-900">
              Active Open-Meteo Endpoints & CLI
            </h3>
            <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
              Verify the live public endpoints and local verification commands required for your evidence package:
            </p>

            <div className="mt-4 space-y-3">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>1. Geocoding API Endpoint</span>
                  {report && (
                    <a
                      href={report.geocodingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sky-700 hover:underline flex items-center gap-1"
                    >
                      Inspect JSON <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
                <div className="text-[11px] font-mono text-slate-600 break-all">
                  https://geocoding-api.open-meteo.com/v1/search
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>2. Forecast API Endpoint</span>
                  {report && (
                    <a
                      href={report.forecastUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sky-700 hover:underline flex items-center gap-1"
                    >
                      Inspect JSON <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
                <div className="text-[11px] font-mono text-slate-600 break-all">
                  https://api.open-meteo.com/v1/forecast
                </div>
              </div>

              <div className="p-3 bg-slate-900 text-slate-100 rounded-lg">
                <div className="flex items-center gap-1.5 text-xs font-medium text-slate-300 mb-1.5">
                  <Terminal className="w-3.5 h-3.5 text-sky-400" />
                  <span>Local Build & Version Evidence Commands</span>
                </div>
                <pre className="text-[11px] font-mono text-slate-200 overflow-x-auto leading-relaxed">
{`node -v && npm -v
npm install
npm run dev
npm run build`}
                </pre>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500">
            ZIP submission format: <code className="font-mono text-slate-700">empid_emp_name_appbuilding_L2.zip</code>
          </div>
        </div>
      </div>

      {/* Troubleshooting Reference Table from Help Guide */}
      <div className="mt-6 bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900">
            GitHub-to-Cloudflare Pages Deployment Troubleshooting Matrix
          </h3>
          <span className="text-xs text-slate-500">Level 2 Help Guide Reference</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-600 bg-slate-50/30">
                <th className="py-2.5 px-4 font-semibold">Issue</th>
                <th className="py-2.5 px-4 font-semibold">Likely Cause</th>
                <th className="py-2.5 px-4 font-semibold">Recommended Resolution</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              <tr>
                <td className="py-2.5 px-4 font-medium text-slate-900">
                  Google AI Studio cannot connect to GitHub
                </td>
                <td className="py-2.5 px-4">
                  GitHub permission, SSO, repository, or organization access issue
                </td>
                <td className="py-2.5 px-4">
                  Reach out to the IT Helpdesk with the exact error screenshot.
                </td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 font-medium text-slate-900">
                  Cloudflare build fails
                </td>
                <td className="py-2.5 px-4">
                  Build command, Node version, dependencies, or output directory mismatch
                </td>
                <td className="py-2.5 px-4">
                  Verify <code className="font-mono text-slate-900">package.json</code> and set Cloudflare build command to <code className="font-mono text-slate-900">npm run build</code> and output directory to <code className="font-mono text-slate-900">dist</code>.
                </td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 font-medium text-slate-900">
                  Invalid <code className="font-mono text-slate-900">_redirects</code> infinite loop [code: 100324] or 404 on refresh
                </td>
                <td className="py-2.5 px-4">
                  Cloudflare Workers/Pages rejects <code className="font-mono text-slate-900">/* /index.html 200</code> in <code className="font-mono text-slate-900">_redirects</code> due to HTML extension stripping
                </td>
                <td className="py-2.5 px-4">
                  Removed <code className="font-mono text-slate-900">_redirects</code> and configured <code className="font-mono text-slate-900">wrangler.jsonc</code> with <code className="font-mono text-slate-900">"not_found_handling": "single-page-application"</code>.
                </td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 font-medium text-slate-900">
                  Weather data does not load
                </td>
                <td className="py-2.5 px-4">
                  Network, API endpoint, or invalid city query
                </td>
                <td className="py-2.5 px-4">
                  Check browser console, verify Open-Meteo endpoints are reachable, and test with <code className="font-mono text-slate-900">Chennai</code> or <code className="font-mono text-slate-900">London</code>.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};
