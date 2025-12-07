// Location search and autocomplete functionality

const LocationSearch = {
    selectedState: '',
    selectedCounty: '',
    stateData: {},
    stateCodeMap: {}, // Maps state codes to full names
    
    init: function() {
        console.log('=== Initializing LocationSearch ===');
        
        if (typeof LoanLimitService === 'undefined') {
            console.warn('LoanLimitService not available');
            return;
        }
        
        if (typeof LoanLimitsData === 'undefined') {
            console.warn('LoanLimitsData not available');
            return;
        }
        
        // State code to name mapping
        const stateCodeToName = {
            'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas',
            'CA': 'California', 'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware',
            'FL': 'Florida', 'GA': 'Georgia', 'HI': 'Hawaii', 'ID': 'Idaho',
            'IL': 'Illinois', 'IN': 'Indiana', 'IA': 'Iowa', 'KS': 'Kansas',
            'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine', 'MD': 'Maryland',
            'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota', 'MS': 'Mississippi',
            'MO': 'Missouri', 'MT': 'Montana', 'NE': 'Nebraska', 'NV': 'Nevada',
            'NH': 'New Hampshire', 'NJ': 'New Jersey', 'NM': 'New Mexico', 'NY': 'New York',
            'NC': 'North Carolina', 'ND': 'North Dakota', 'OH': 'Ohio', 'OK': 'Oklahoma',
            'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island', 'SC': 'South Carolina',
            'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas', 'UT': 'Utah',
            'VT': 'Vermont', 'VA': 'Virginia', 'WA': 'Washington', 'WV': 'West Virginia',
            'WI': 'Wisconsin', 'WY': 'Wyoming', 'DC': 'District of Columbia',
            'AS': 'American Samoa', 'GU': 'Guam', 'MP': 'Northern Mariana Islands',
            'PR': 'Puerto Rico', 'VI': 'Virgin Islands'
        };
        
        // Get all state names from data and create mapping
        const stateNames = LoanLimitService.getStates();
        this.stateData = {};
        this.stateCodeMap = {};
        
        stateNames.forEach(stateName => {
            const stateInfo = LoanLimitsData.states[stateName];
            if (stateInfo) {
                // Find the state code for this state name
                const stateCode = Object.keys(stateCodeToName).find(
                    code => stateCodeToName[code] === stateName
                );
                
                if (stateCode) {
                    this.stateData[stateCode] = {
                        code: stateCode,
                        name: stateName,
                        counties: Object.keys(stateInfo.counties || {}).sort()
                    };
                    this.stateCodeMap[stateCode] = stateName;
                } else {
                    console.warn('No state code found for:', stateName);
                }
            }
        });
        
        console.log('States loaded:', Object.keys(this.stateData).length);
        console.log('Sample states:', Object.keys(this.stateData).slice(0, 5).map(code => 
            `${code} (${this.stateData[code].name})`
        ));
        this.setupEventListeners();
    },
    
    setupEventListeners: function() {
        const stateInput = document.getElementById('stateSearch');
        const countyInput = document.getElementById('countySearch');
        const stateDropdown = document.getElementById('stateDropdown');
        const countyDropdown = document.getElementById('countyDropdown');
        
        if (!stateInput || !countyInput) {
            console.warn('Search inputs not found');
            return;
        }
        
        // State input handling
        stateInput.addEventListener('input', (e) => {
            const value = e.target.value.toUpperCase();
            console.log('State input:', value);
            
            if (value.length === 0) {
                this.hideDropdown(stateDropdown);
                this.clearSelection();
                return;
            }
            
            this.showStateMatches(value, stateDropdown);
        });
        
        stateInput.addEventListener('blur', () => {
            // Delay to allow click on dropdown
            setTimeout(() => {
                this.hideDropdown(stateDropdown);
            }, 200);
        });
        
        stateInput.addEventListener('focus', () => {
            if (stateInput.value) {
                this.showStateMatches(stateInput.value.toUpperCase(), stateDropdown);
            }
        });
        
        // Handle keyboard navigation for state input
        stateInput.addEventListener('keydown', (e) => {
            if (e.key === 'Tab' && this.selectedState) {
                // If user has selected a state and presses Tab, move to county
                e.preventDefault();
                countyInput.focus();
            } else if (e.key === 'Enter' && stateDropdown && !stateDropdown.classList.contains('hidden')) {
                // Select first match on Enter
                const firstItem = stateDropdown.querySelector('.dropdown-item');
                if (firstItem) {
                    const code = firstItem.dataset.code;
                    this.selectState(code);
                }
            }
        });
        
        // County input handling
        countyInput.addEventListener('input', (e) => {
            const value = e.target.value;
            console.log('County input:', value);
            
            if (!this.selectedState) {
                return;
            }
            
            if (value.length === 0) {
                // Show all counties when input is cleared
                this.showAllCounties(countyDropdown);
                this.selectedCounty = '';
                this.triggerLoanCheck();
                return;
            }
            
            this.showCountyMatches(value, countyDropdown);
        });
        
        countyInput.addEventListener('blur', () => {
            setTimeout(() => {
                this.hideDropdown(countyDropdown);
            }, 200);
        });
        
        countyInput.addEventListener('focus', () => {
            if (!this.selectedState) {
                return;
            }
            
            // Show all counties when focused
            if (countyInput.value) {
                this.showCountyMatches(countyInput.value, countyDropdown);
            } else {
                this.showAllCounties(countyDropdown);
            }
        });
        
        countyInput.addEventListener('click', () => {
            if (!this.selectedState) {
                return;
            }
            
            // Show all counties when clicked
            if (!countyInput.value) {
                this.showAllCounties(countyDropdown);
            }
        });
        
        // Handle keyboard navigation for county input
        countyInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && countyDropdown && !countyDropdown.classList.contains('hidden')) {
                // Select first match on Enter
                const firstItem = countyDropdown.querySelector('.dropdown-item');
                if (firstItem) {
                    const county = firstItem.dataset.county;
                    this.selectCounty(county);
                }
            }
        });
        
        console.log('Event listeners attached');
    },
    
    showStateMatches: function(searchTerm, dropdown) {
        const matches = Object.keys(this.stateData).filter(code => {
            const state = this.stateData[code];
            if (!state || !state.name) return false;
            
            return code.startsWith(searchTerm) || 
                   state.name.toUpperCase().includes(searchTerm);
        });
        
        console.log('State matches:', matches.length);
        
        if (matches.length === 0) {
            dropdown.innerHTML = '<div class="dropdown-no-results">No states found</div>';
            dropdown.classList.remove('hidden');
            return;
        }
        
        dropdown.innerHTML = matches.map(code => {
            const state = this.stateData[code];
            return `<div class="dropdown-item" data-code="${code}">${code} - ${state.name}</div>`;
        }).join('');
        
        // Add click handlers
        dropdown.querySelectorAll('.dropdown-item').forEach(item => {
            item.addEventListener('click', () => {
                const code = item.dataset.code;
                this.selectState(code);
            });
        });
        
        dropdown.classList.remove('hidden');
    },
    
    showCountyMatches: function(searchTerm, dropdown) {
        if (!this.selectedState) return;
        
        const stateInfo = this.stateData[this.selectedState];
        const searchUpper = searchTerm.toUpperCase();
        
        const matches = stateInfo.counties.filter(county => 
            county.toUpperCase().includes(searchUpper)
        );
        
        console.log('County matches:', matches.length);
        
        if (matches.length === 0) {
            dropdown.innerHTML = '<div class="dropdown-no-results">Whole State Same</div>';
            dropdown.classList.remove('hidden');
            return;
        }
        
        // Limit to 10 results
        const limitedMatches = matches.slice(0, 10);
        
        dropdown.innerHTML = limitedMatches.map(county => 
            `<div class="dropdown-item" data-county="${county}">${county}</div>`
        ).join('');
        
        if (matches.length > 10) {
            dropdown.innerHTML += '<div class="dropdown-no-results">Type more to narrow results...</div>';
        }
        
        // Add click handlers
        dropdown.querySelectorAll('.dropdown-item').forEach(item => {
            item.addEventListener('click', () => {
                const county = item.dataset.county;
                this.selectCounty(county);
            });
        });
        
        dropdown.classList.remove('hidden');
    },
    
    showAllCounties: function(dropdown) {
        if (!this.selectedState) return;
        
        const stateInfo = this.stateData[this.selectedState];
        const allCounties = stateInfo.counties;
        
        console.log('Showing all counties:', allCounties.length);
        
        if (allCounties.length === 0) {
            dropdown.innerHTML = '<div class="dropdown-no-results">Whole State Same</div>';
            dropdown.classList.remove('hidden');
            return;
        }
        
        // Limit to 15 results when showing all
        const limitedCounties = allCounties.slice(0, 15);
        
        dropdown.innerHTML = limitedCounties.map(county => 
            `<div class="dropdown-item" data-county="${county}">${county}</div>`
        ).join('');
        
        if (allCounties.length > 15) {
            dropdown.innerHTML += `<div class="dropdown-no-results">${allCounties.length - 15} more... Type to search</div>`;
        }
        
        // Add click handlers
        dropdown.querySelectorAll('.dropdown-item').forEach(item => {
            item.addEventListener('click', () => {
                const county = item.dataset.county;
                this.selectCounty(county);
            });
        });
        
        dropdown.classList.remove('hidden');
    },
    
    selectState: function(code) {
        console.log('State selected:', code);
        const stateInput = document.getElementById('stateSearch');
        const countyInput = document.getElementById('countySearch');
        const stateDropdown = document.getElementById('stateDropdown');
        
        this.selectedState = code;
        this.selectedCounty = '';
        
        if (stateInput) {
            stateInput.value = code;
        }
        
        if (countyInput) {
            countyInput.value = '';
            countyInput.disabled = false;
            countyInput.focus();
        }
        
        this.hideDropdown(stateDropdown);
        this.triggerLoanCheck();
    },
    
    selectCounty: function(county) {
        console.log('County selected:', county);
        const countyInput = document.getElementById('countySearch');
        const countyDropdown = document.getElementById('countyDropdown');
        
        this.selectedCounty = county;
        
        if (countyInput) {
            countyInput.value = county;
        }
        
        this.hideDropdown(countyDropdown);
        this.triggerLoanCheck();
    },
    
    clearSelection: function() {
        console.log('Clearing selection');
        const countyInput = document.getElementById('countySearch');
        const countyDropdown = document.getElementById('countyDropdown');
        
        this.selectedState = '';
        this.selectedCounty = '';
        
        if (countyInput) {
            countyInput.value = '';
            countyInput.disabled = true;
        }
        
        this.hideDropdown(countyDropdown);
        UIManager.hideLoanTypeIndicator();
    },
    
    hideDropdown: function(dropdown) {
        if (dropdown) {
            dropdown.classList.add('hidden');
        }
    },
    
    triggerLoanCheck: function() {
        const principalInput = document.getElementById('principal');
        
        if (!principalInput || !principalInput.value) {
            return;
        }
        
        const principal = parseFloat(principalInput.value.replace(/,/g, ''));
        
        if (!isNaN(principal) && principal > 0) {
            console.log('Triggering loan check with:', {
                principal,
                stateCode: this.selectedState,
                stateName: this.stateCodeMap[this.selectedState],
                county: this.selectedCounty
            });
            
            if (this.selectedState) {
                // Use the full state name for the loan limit service
                const stateName = this.stateCodeMap[this.selectedState];
                const loanTypeInfo = LoanLimitService.determineLoanType(
                    principal, 
                    stateName, 
                    this.selectedCounty
                );
                UIManager.updateLoanTypeIndicator(loanTypeInfo);
            }
        }
    },
    
    getSelectedState: function() {
        // Return the full state name for loan limit lookup
        return this.stateCodeMap[this.selectedState] || '';
    },
    
    getSelectedCounty: function() {
        return this.selectedCounty;
    }
};

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LocationSearch;
}
