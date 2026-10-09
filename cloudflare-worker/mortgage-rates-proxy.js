/**
 * Cloudflare Worker: Mortgage Rate Proxy
 *
 * Proxies requests to the FRED (Federal Reserve Economic Data) API so the
 * financial-calculators frontend can fetch current 30yr/15yr mortgage rates
 * without hitting CORS errors and without ever exposing a FRED API key in
 * client-side code.
 *
 * Deploy:
 *   1. npx wrangler deploy
 *   2. npx wrangler secret put FRED_API_KEY
 *      (free key: https://fredaccount.stlouisfed.org/apikeys)
 *   3. Update BASE_URL in js/mortgage-rates.js to your deployed worker URL.
 */

const FRED_BASE_URL = 'https://api.stlouisfed.org/fred/series/observations';

// Restrict which site(s) may call this worker.
const ALLOWED_ORIGIN = 'https://rgriola.github.io';

// FRED only updates these series weekly, so cache aggressively at the edge.
const CACHE_TTL_SECONDS = 3600;

async function fetchLatestRate(seriesId, apiKey) {
    const url = `${FRED_BASE_URL}?series_id=${seriesId}&api_key=${apiKey}&file_type=json&sort_order=desc&limit=1`;
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`FRED request failed for ${seriesId}: ${response.status}`);
    }

    const payload = await response.json();
    const observation = payload.observations && payload.observations[0];

    if (!observation || observation.value === '.') {
        throw new Error(`No data available for ${seriesId}`);
    }

    return { date: observation.date, value: observation.value };
}

function corsHeaders() {
    return {
        'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
    };
}

export default {
    async fetch(request, env, ctx) {
        if (request.method === 'OPTIONS') {
            return new Response(null, { headers: corsHeaders() });
        }

        const cache = caches.default;
        const cacheKey = new Request(request.url, request);
        const cached = await cache.match(cacheKey);
        if (cached) {
            return cached;
        }

        try {
            const [frm30, frm15] = await Promise.all([
                fetchLatestRate('MORTGAGE30US', env.FRED_API_KEY),
                fetchLatestRate('MORTGAGE15US', env.FRED_API_KEY)
            ]);

            // Shape matches what js/mortgage-rates.js already expects from the
            // previous API Ninjas integration, so the frontend sanitizer and
            // display logic needed no changes.
            const body = JSON.stringify([
                {
                    week: frm30.date,
                    data: {
                        frm_30: frm30.value,
                        frm_15: frm15.value,
                        week: frm30.date
                    }
                }
            ]);

            const response = new Response(body, {
                status: 200,
                headers: {
                    ...corsHeaders(),
                    'Cache-Control': `public, max-age=${CACHE_TTL_SECONDS}`
                }
            });

            ctx.waitUntil(cache.put(cacheKey, response.clone()));
            return response;
        } catch (error) {
            return new Response(JSON.stringify({ error: error.message }), {
                status: 502,
                headers: corsHeaders()
            });
        }
    }
};
