#!/usr/bin/env python3
"""
Convert FHFA Excel loan limits to JavaScript data file
"""

import pandas as pd
import json

# Read the Excel file
df = pd.read_excel('fullcountyloanlimitlist2026_hera-based_final_flat.xlsx')

# The actual headers are in row 0 (index 0)
# Extract proper column names from first row
headers = df.iloc[0].tolist()
df.columns = headers

# Remove the header row from data
df = df.iloc[1:].reset_index(drop=True)

# Rename columns for easier access
df.columns = ['FIPS_State', 'FIPS_County', 'County', 'State', 'CBSA', 'One_Unit', 'Two_Unit', 'Three_Unit', 'Four_Unit']

# Clean up data
df['County'] = df['County'].str.strip().str.title()
df['State'] = df['State'].str.strip().str.upper()
df['One_Unit'] = pd.to_numeric(df['One_Unit'], errors='coerce')

# Remove any rows with NaN in critical columns
df = df.dropna(subset=['State', 'County', 'One_Unit'])

# Get baseline limit (most common limit)
baseline_limit = int(df['One_Unit'].mode()[0])

print(f"Baseline conforming limit for 2026: ${baseline_limit:,}")
print(f"Total counties: {len(df)}")
print(f"Total states: {df['State'].nunique()}")

# Group by state
states_data = {}

for state in sorted(df['State'].unique()):
    state_df = df[df['State'] == state]
    
    # Get counties for this state
    counties = {}
    for _, row in state_df.iterrows():
        county_name = row['County'].replace(' County', '').replace(' COUNTY', '').strip()
        
        # Escape single quotes for JavaScript
        county_name = county_name.replace("'", "\\'")
        
        limit = int(row['One_Unit'])
        
        # Only include counties with non-baseline limits to reduce file size
        if limit != baseline_limit:
            counties[county_name] = limit
    
    # Map state code to full name
    state_names = {
        'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas',
        'CA': 'California', 'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware',
        'DC': 'District of Columbia', 'FL': 'Florida', 'GA': 'Georgia', 'HI': 'Hawaii',
        'ID': 'Idaho', 'IL': 'Illinois', 'IN': 'Indiana', 'IA': 'Iowa',
        'KS': 'Kansas', 'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine',
        'MD': 'Maryland', 'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota',
        'MS': 'Mississippi', 'MO': 'Missouri', 'MT': 'Montana', 'NE': 'Nebraska',
        'NV': 'Nevada', 'NH': 'New Hampshire', 'NJ': 'New Jersey', 'NM': 'New Mexico',
        'NY': 'New York', 'NC': 'North Carolina', 'ND': 'North Dakota', 'OH': 'Ohio',
        'OK': 'Oklahoma', 'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island',
        'SC': 'South Carolina', 'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas',
        'UT': 'Utah', 'VT': 'Vermont', 'VA': 'Virginia', 'WA': 'Washington',
        'WV': 'West Virginia', 'WI': 'Wisconsin', 'WY': 'Wyoming', 'PR': 'Puerto Rico',
        'VI': 'Virgin Islands', 'GU': 'Guam', 'AS': 'American Samoa', 'MP': 'Northern Mariana Islands'
    }
    
    state_full_name = state_names.get(state, state)
    
    states_data[state_full_name] = {
        'baseline': baseline_limit,
        'counties': counties if counties else {}
    }

# Generate JavaScript file
js_content = f"""// FHFA Conforming Loan Limits Data - 2026
// Generated from: fullcountyloanlimitlist2026_hera-based_final_flat.xlsx
// Last updated: December 2025

const LoanLimitsData = {{
    year: 2026,
    
    // Baseline conforming loan limit for 2026 (single-family home)
    baseline: {baseline_limit},
    
    // State-by-state data
    // Only counties with limits different from baseline are listed
    states: {{
"""

for state_name in sorted(states_data.keys()):
    state_info = states_data[state_name]
    js_content += f"        '{state_name}': {{\n"
    js_content += f"            baseline: {state_info['baseline']},\n"
    
    if state_info['counties']:
        js_content += "            counties: {\n"
        for county_name in sorted(state_info['counties'].keys()):
            limit = state_info['counties'][county_name]
            # County names are already escaped, use them directly
            js_content += f"                '{county_name}': {limit},\n"
        js_content += "            }\n"
    else:
        js_content += "            counties: {}\n"
    
    js_content += "        },\n"

js_content += """    }
};

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LoanLimitsData;
}
"""

# Write to file
with open('js/loan-limits-data.js', 'w') as f:
    f.write(js_content)

print("\n✅ Successfully generated js/loan-limits-data.js")
print(f"   Baseline limit: ${baseline_limit:,}")
print(f"   States included: {len(states_data)}")
print(f"   High-cost counties: {sum(len(s['counties']) for s in states_data.values())}")

# Show some statistics
high_limit_counties = df[df['One_Unit'] > baseline_limit].sort_values('One_Unit', ascending=False).head(10)
print("\n📊 Top 10 highest loan limits:")
for _, row in high_limit_counties.iterrows():
    print(f"   {row['County']}, {row['State']}: ${int(row['One_Unit']):,}")
