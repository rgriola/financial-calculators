# Financial Calculators

A secure, responsive financial calculator application built with vanilla JavaScript, HTML, and CSS. Features mortgage payment calculations and rent-to-mortgage comparisons with real-time mortgage rate data from API Ninjas.

## 🏠 Mortgage Calculator Features

- **Secure Implementation** - Follows CSP compliance and security best practices
- **Real-time Validation** - Input validation with visual feedback
- **Interactive Info Tooltips** - Educational content about mortgage terms
- **Live Mortgage Rates** - Current 30-year and 15-year fixed rates via API
- **Conforming vs Jumbo Detection** - Automatic loan type classification based on FHFA 2026 limits
- **County-Specific Limits** - Select property location to get accurate loan limits
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Accessibility Compliant** - ARIA labels and keyboard navigation

## 💰 Rent-to-Mortgage Calculator Features

- **Multi-Term Comparison** - 15-year, 30-year, and 50-year loan options
- **Live Rate Integration** - Uses current mortgage rates from API
- **Reverse Calculation** - Determines affordable mortgage from rent payment
- **Total Interest Display** - Shows lifetime interest costs for each term
- **Sticky Panel Design** - Always visible while scrolling
- **Smart Rate Estimation** - Estimates rates when API data unavailable

## 📊 Calculations Provided

### Mortgage Calculator
✅ **Monthly Payment** - Principal and interest payment amount  
✅ **Total Interest Paid** - Total interest over loan lifetime  
✅ **Total Amount Paid** - Principal + Interest combined  
✅ **Interest vs Principal Ratio** - Percentage breakdown  
✅ **Payment Count** - Total number of monthly payments  
✅ **Conforming vs Jumbo** - Automatic loan type detection based on FHFA 2026 limits  
✅ **County Loan Limits** - Real data for all 3,235 counties nationwide  

### Rent-to-Mortgage Calculator
✅ **15-Year Fixed** - Maximum principal with current rent payment  
✅ **30-Year Fixed** - Maximum principal with current rent payment  
✅ **50-Year Fixed** - Maximum principal with current rent payment (estimated rate)  
✅ **Total Interest Comparison** - Lifetime interest costs across terms  
✅ **Rate Display** - Shows current or estimated rates used  

## 🚀 Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection (for live mortgage rates)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/rgriola/financial-calculators.git
cd financial-calculators
```

2. Open `index.html` in your web browser or serve with a local server:
```bash
# Using Python 3
python -m http.server 8000

# Using Node.js (if you have http-server installed)
npx http-server

# Using PHP
php -S localhost:8000
```

3. Open your browser to `http://localhost:8000`

## 🏗️ Project Structure

```
financial-calculators/
├── index.html                   # Main HTML file
├── styles.css                   # All styling and responsive design
├── js/                          # ES6 Modular JavaScript architecture
│   ├── app.js                   # Main entry point (ES6 module)
│   ├── config.js                # Consolidated configuration & error handling
│   ├── utils.js                 # Utility functions (debounce, formatting, etc.)
│   ├── security-utils.js        # Security and sanitization utilities
│   ├── validation.js            # Input validation with field-specific errors
│   ├── ui-manager.js            # UI updates and interactions (with loading states)
│   ├── mortgage-calculator.js   # Core mortgage calculation logic
│   ├── rent-calculator.js       # Rent-to-mortgage calculations
│   ├── credit-card-calculator.js # Credit card payoff calculator
│   ├── mortgage-rates.js        # API service for live mortgage rates
│   ├── loan-limits-data.js      # 2026 FHFA loan limits data
│   ├── loan-limits.js           # Loan limit calculation logic
│   ├── location-search.js       # Property location search
│   ├── storage-manager.js       # Local storage management
│   └── analytics.js             # Analytics tracking
├── README.md                    # Project documentation
├── .gitignore                   # Git ignore rules
└── LICENSE (optional)           # MIT License
```

## 🔒 Security Features

- **Content Security Policy (CSP)** - Prevents XSS attacks
- **ES6 Module Architecture** - Modern, secure module loading
- **Centralized Error Handling** - Consistent error management across all modules
- **Modular Architecture** - Separation of concerns for security
- **Input Sanitization** - All user inputs are validated and sanitized
- **HTML Injection Prevention** - No innerHTML usage, textContent only
- **API Key Security** - Secure API communication with rate limiting
- **Validation Boundaries** - Strict input limits and type checking
- **Debounced Validation** - Prevents excessive validation calls

## 🎨 Design Features

- **Two-Column Layout** - Mortgage calculator left, rent calculator right
- **Compact Rate Display** - Horizontal mortgage rates section
- **Modern UI** - Clean, professional interface with gradients
- **Smooth Animations** - CSS transitions and hover effects
- **Visual Feedback** - Real-time input validation with color coding
- **Placeholder System** - Shows expected results before calculation
- **Mobile Responsive** - Adapts to all screen sizes with stacking layout
- **Sticky Panels** - Rent calculator stays visible while scrolling

## 📱 Browser Support

- Chrome 70+
- Firefox 65+
- Safari 12+
- Edge 79+

## 🔧 Configuration

### API Configuration
The mortgage rates are fetched from API Ninjas. The service includes:
- Automatic caching (1-hour duration)
- Retry logic (3 attempts with exponential backoff)
- Error handling and graceful fallbacks
- Loading states and user feedback
- Rate limiting to prevent API abuse

### Validation Limits
- **Mortgage Principal**: $1,000 - $10,000,000
- **Interest Rate**: 0.01% - 30%
- **Loan Term**: 1 - 50 years
- **Rent Amount**: $500 - $20,000

### Rate Estimation Logic
- **15-Year Rate**: API rate or 30-year rate - 0.3%
- **30-Year Rate**: Direct from API
- **50-Year Rate**: 30-year rate + 0.5% (estimated)

## 🌐 Live Demo

Visit the live application: **https://rgriola.github.io/financial-calculators/**

## 🚀 Development & Deployment

### Local Development
```bash
# Clone and navigate to project
git clone https://github.com/rgriola/financial-calculators.git
cd financial-calculators

# Start local server (choose one)
## use live server that is installed. 
python -m http.server 5500        # Python
npx http-server                   # Node.js
php -S localhost:5500            # PHP

# Open browser to http://localhost:5500
```

### GitHub Pages Deployment
This project is configured for automatic GitHub Pages deployment:

1. Push your changes to the `main` branch
2. Go to repository Settings → Pages
3. Select "Deploy from a branch"
4. Choose "main" branch and "/ (root)" folder
5. Your calculator will be live at `https://rgriola.github.io/financial-calculators/`

## 🧪 Testing

### Manual Testing Checklist
- [ ] Mortgage calculation with valid inputs
- [ ] Input validation (min/max values)
- [ ] Rent-to-mortgage calculations for all terms
- [ ] Mobile responsive layout
- [ ] API rate fetching and caching
- [ ] Error handling for network issues
- [ ] CSP compliance (no console security errors)
- [ ] Accessibility (keyboard navigation, screen readers)

### Browser Testing
Test across all supported browsers:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 🏷️ Features by Version

### v2.0 (Current)
- ✅ Rent-to-mortgage calculator with multi-term comparison
- ✅ Modular JavaScript architecture
- ✅ Enhanced security with CSP compliance
- ✅ Responsive two-column layout
- ✅ Compact mortgage rates display

### v1.0 (Previous)
- ✅ Basic mortgage payment calculator
- ✅ Live mortgage rates from API
- ✅ Input validation and sanitization
- ✅ Interactive info tooltips

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow existing code structure and naming conventions
- Maintain CSP compliance (no inline scripts/styles)
- Add appropriate error handling and validation
- Test on multiple browsers and screen sizes
- Update README if adding new features

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **API Ninjas** - For providing reliable mortgage rate data
- **Material Design Icons** - For UI icon inspiration
- **MDN Web Docs** - For web standards reference and best practices

## 🐛 Bug Reports & Feature Requests

If you find a bug or have a feature request, please create an issue with:

### Bug Reports
- Steps to reproduce the issue
- Expected behavior vs actual behavior
- Browser and version information
- Screenshots (if applicable)
- Console error messages (if any)

### Feature Requests
- Clear description of the proposed feature
- Use case and benefits
- Implementation suggestions (optional)

## 📈 Roadmap

### Planned Features
- [ ] Amortization schedule display
- [ ] PMI (Private Mortgage Insurance) calculator
- [ ] Property tax and insurance estimates
- [ ] Comparison of multiple loan scenarios
- [ ] Export results to PDF
- [ ] Dark mode theme option

### Under Consideration
- [ ] Refinancing calculator
- [ ] Home affordability calculator
- [ ] Investment property calculator
- [ ] International currency support

---

Built with ❤️ by [rgriola](https://github.com/rgriola) | Last updated: November 2024