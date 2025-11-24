// Mortgage Rate API Service - Secure Implementation
// Following security.md guidelines for CSP compliance

const MortgageRateService = {
    // Configuration
    CONFIG: {
        API: {
            BASE_URL: 'https://api.api-ninjas.com/v1/mortgagerate',
            API_KEY: 'hyMdbs7+LtLGQlxojYt7bw==rlVbEB0k7px3qBe3',
            TIMEOUT: 10000, // 10 seconds
            RETRY_ATTEMPTS: 3,
            RETRY_DELAY: 1000 // 1 second
        },
        CACHE: {
            DURATION: 3600000, // 1 hour in milliseconds
            KEY: 'mortgage_rates_cache'
        }
    },

    // Cache management
    Cache: {
        set: function(data) {
            try {
                const cacheData = {
                    data: data,
                    timestamp: Date.now()
                };
                localStorage.setItem(MortgageRateService.CONFIG.CACHE.KEY, JSON.stringify(cacheData));
                console.log('Mortgage rates cached successfully');
            } catch (error) {
                console.warn('Failed to cache mortgage rates:', error);
            }
        },

        get: function() {
            try {
                const cached = localStorage.getItem(MortgageRateService.CONFIG.CACHE.KEY);
                if (!cached) return null;

                const cacheData = JSON.parse(cached);
                const isExpired = (Date.now() - cacheData.timestamp) > MortgageRateService.CONFIG.CACHE.DURATION;
                
                if (isExpired) {
                    localStorage.removeItem(MortgageRateService.CONFIG.CACHE.KEY);
                    return null;
                }

                console.log('Using cached mortgage rates');
                return cacheData.data;
            } catch (error) {
                console.warn('Failed to retrieve cached mortgage rates:', error);
                localStorage.removeItem(MortgageRateService.CONFIG.CACHE.KEY);
                return null;
            }
        },

        clear: function() {
            localStorage.removeItem(MortgageRateService.CONFIG.CACHE.KEY);
        }
    },

    // Security utilities
    SecurityUtils: {
        sanitizeRateData: function(data) {
            if (!data || typeof data !== 'object') return null;

            // Validate and sanitize the response structure
            if (!Array.isArray(data) || data.length === 0) return null;

            const rateData = data[0];
            if (!rateData || !rateData.data) return null;

            const sanitized = {
                week: this.sanitizeString(rateData.week),
                data: {
                    frm_30: this.sanitizeRate(rateData.data.frm_30),
                    frm_15: this.sanitizeRate(rateData.data.frm_15),
                    week: this.sanitizeString(rateData.data.week)
                }
            };

            // Validate that we have valid rates
            if (!sanitized.data.frm_30 || !sanitized.data.frm_15) return null;

            return sanitized;
        },

        sanitizeString: function(str) {
            if (!str || typeof str !== 'string') return '';
            return str.trim().replace(/[<>]/g, '');
        },

        sanitizeRate: function(rate) {
            if (!rate) return null;
            const numRate = parseFloat(rate);
            if (isNaN(numRate) || numRate < 0 || numRate > 50) return null;
            return numRate.toFixed(2);
        },

        formatDate: function(dateStr) {
            if (!dateStr) return 'Unknown';
            try {
                const date = new Date(dateStr);
                return date.toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                });
            } catch (error) {
                return dateStr;
            }
        }
    },

    // Fetch mortgage rates with retry logic
    fetchRates: async function() {
        console.log('Fetching mortgage rates...');

        // Check cache first
        const cachedData = this.Cache.get();
        if (cachedData) {
            this.displayRates(cachedData);
            return cachedData;
        }

        // Show loading state
        this.showLoadingState();

        let lastError = null;
        
        for (let attempt = 1; attempt <= this.CONFIG.API.RETRY_ATTEMPTS; attempt++) {
            try {
                console.log(`Attempting to fetch rates (attempt ${attempt}/${this.CONFIG.API.RETRY_ATTEMPTS})`);
                
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), this.CONFIG.API.TIMEOUT);

                const response = await fetch(this.CONFIG.API.BASE_URL, {
                    method: 'GET',
                    headers: {
                        'X-Api-Key': this.CONFIG.API.API_KEY,
                        'Accept': 'application/json'
                    },
                    signal: controller.signal
                });

                clearTimeout(timeoutId);

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                const rawData = await response.json();
                console.log('Raw API response:', rawData);

                const sanitizedData = this.SecurityUtils.sanitizeRateData(rawData);
                if (!sanitizedData) {
                    throw new Error('Invalid or malformed rate data received');
                }

                // Cache the successful response
                this.Cache.set(sanitizedData);
                
                // Display the rates
                this.displayRates(sanitizedData);
                this.hideLoadingState();
                
                return sanitizedData;

            } catch (error) {
                lastError = error;
                console.warn(`Attempt ${attempt} failed:`, error.message);

                if (attempt < this.CONFIG.API.RETRY_ATTEMPTS) {
                    console.log(`Retrying in ${this.CONFIG.API.RETRY_DELAY}ms...`);
                    await this.delay(this.CONFIG.API.RETRY_DELAY);
                }
            }
        }

        // All attempts failed
        console.error('Failed to fetch mortgage rates after all attempts:', lastError);
        this.showErrorState(lastError.message);
        return null;
    },

    // Display rates in the UI
    displayRates: function(rateData) {
        const ratesContainer = document.getElementById('mortgage-rates');
        if (!ratesContainer) {
            console.warn('Mortgage rates container not found');
            return;
        }

        // Clear loading state
        ratesContainer.classList.remove('loading', 'error');

        // Update rate displays using textContent for security
        const frm30Element = document.getElementById('rate-30yr');
        const frm15Element = document.getElementById('rate-15yr');
        const weekElement = document.getElementById('rates-week');

        if (frm30Element) {
            frm30Element.textContent = rateData.data.frm_30 + '%';
        }
        
        if (frm15Element) {
            frm15Element.textContent = rateData.data.frm_15 + '%';
        }

        if (weekElement) {
            weekElement.textContent = this.SecurityUtils.formatDate(rateData.data.week);
        }

        // Show the rates container
        ratesContainer.classList.remove('hidden');
        
        console.log('Mortgage rates displayed successfully');
    },

    // Show loading state
    showLoadingState: function() {
        const ratesContainer = document.getElementById('mortgage-rates');
        if (ratesContainer) {
            ratesContainer.classList.add('loading');
            ratesContainer.classList.remove('error', 'hidden');
        }

        // Update loading text
        const frm30Element = document.getElementById('rate-30yr');
        const frm15Element = document.getElementById('rate-15yr');
        const weekElement = document.getElementById('rates-week');

        if (frm30Element) frm30Element.textContent = '...';
        if (frm15Element) frm15Element.textContent = '...';
        if (weekElement) weekElement.textContent = 'Loading...';
    },

    // Show error state
    showErrorState: function(errorMessage) {
        const ratesContainer = document.getElementById('mortgage-rates');
        if (ratesContainer) {
            ratesContainer.classList.add('error');
            ratesContainer.classList.remove('loading', 'hidden');
        }

        // Update error text
        const frm30Element = document.getElementById('rate-30yr');
        const frm15Element = document.getElementById('rate-15yr');
        const weekElement = document.getElementById('rates-week');

        if (frm30Element) frm30Element.textContent = 'N/A';
        if (frm15Element) frm15Element.textContent = 'N/A';
        if (weekElement) weekElement.textContent = 'Failed to load';

        console.error('Error displaying mortgage rates:', errorMessage);
    },

    // Hide loading state
    hideLoadingState: function() {
        const ratesContainer = document.getElementById('mortgage-rates');
        if (ratesContainer) {
            ratesContainer.classList.remove('loading');
        }
    },

    // Utility delay function
    delay: function(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },

    // Refresh rates manually
    refreshRates: function() {
        console.log('Manually refreshing mortgage rates...');
        this.Cache.clear();
        return this.fetchRates();
    },

    // Initialize the rate service
    init: function() {
        console.log('Initializing Mortgage Rate Service...');
        
        // Setup refresh button if it exists
        const refreshButton = document.getElementById('refresh-rates');
        if (refreshButton) {
            refreshButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.refreshRates();
            });
        }

        // Auto-fetch rates on initialization
        this.fetchRates();
    }
};

// Export for use in other files if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MortgageRateService;
}