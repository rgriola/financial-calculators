# Financial Calculators

A secure, responsive financial calculator application built with vanilla JavaScript, HTML, and CSS. Features mortgage payment calculations with real-time mortgage rate data from API Ninjas.

## 🏠 Mortgage Calculator Features

- **Secure Implementation** - Follows CSP compliance and security best practices
- **Real-time Validation** - Input validation with visual feedback
- **Interactive Info Tooltips** - Educational content about mortgage terms
- **Live Mortgage Rates** - Current 30-year and 15-year fixed rates via API
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Accessibility Compliant** - ARIA labels and keyboard navigation

## 📊 Calculations Provided

✅ **Monthly Payment** - Principal and interest payment amount  
✅ **Total Interest Paid** - Total interest over loan lifetime  
✅ **Total Amount Paid** - Principal + Interest combined  
✅ **Interest vs Principal Ratio** - Percentage breakdown  
✅ **Payment Count** - Total number of monthly payments  

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
├── index.html          # Main HTML file
├── styles.css          # All styling
├── app.js              # Mortgage calculator logic
├── mortgage-rates.js   # API service for live rates
├── .gitignore
├── README.md
└── LICENSE (optional)
```

## 🔒 Security Features

- **Content Security Policy (CSP)** - Prevents XSS attacks
- **Input Sanitization** - All user inputs are validated and sanitized
- **HTML Injection Prevention** - No innerHTML usage
- **API Key Security** - Secure API communication
- **Rate Limiting** - Cached API responses to prevent abuse

## 🎨 Design Features

- **Modern UI** - Clean, professional interface
- **Smooth Animations** - CSS transitions and hover effects
- **Visual Feedback** - Real-time input validation
- **Placeholder System** - Shows expected results before calculation
- **Mobile Responsive** - Adapts to all screen sizes

## 📱 Browser Support

- Chrome 70+
- Firefox 65+
- Safari 12+
- Edge 79+

## 🔧 Configuration

### API Configuration
The mortgage rates are fetched from API Ninjas. The service includes:
- Automatic caching (1-hour duration)
- Retry logic (3 attempts)
- Error handling and fallbacks
- Loading states and user feedback

### Validation Limits
- Principal: $1,000 - $10,000,000
- Interest Rate: 0.01% - 30%
- Loan Term: 1 - 50 years

## 🌐 Live Demo

Visit the live application: **https://rgriola.github.io/financial-calculators/**

## 🚀 GitHub Pages Deployment

This project is configured for automatic GitHub Pages deployment:

1. Push your changes to the `main` branch
2. Go to repository Settings → Pages
3. Select "Deploy from a branch"
4. Choose "main" branch and "/ (root)" folder
5. Your calculator will be live at `https://rgriola.github.io/financial-calculators/`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **API Ninjas** - For providing mortgage rate data
- **Material Design** - For icon inspiration
- **MDN Web Docs** - For web standards reference

## 🐛 Bug Reports

If you find a bug, please create an issue with:
- Steps to reproduce
- Expected behavior
- Actual behavior
- Browser and version
- Screenshots (if applicable)

---

Built with ❤️ by [rgriola](https://github.com/rgriola)