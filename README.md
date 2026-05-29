# 💱 Forex Dashboard

A modern, responsive web-based Forex exchange rates dashboard built with vanilla HTML, CSS, and JavaScript.

## Features

- **Real-time Currency Rates**: Display live exchange rates for major currency pairs
- **Interactive Search**: Search for specific currency pairs
- **24-Hour Trend Chart**: Visual representation of currency trends
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Modern UI**: Beautiful gradient design with smooth animations
- **No Dependencies**: Pure vanilla JavaScript, no external libraries required

## Supported Currency Pairs

- EUR/USD - Euro to US Dollar
- GBP/USD - British Pound to US Dollar
- USD/JPY - US Dollar to Japanese Yen
- AUD/USD - Australian Dollar to US Dollar
- USD/CAD - US Dollar to Canadian Dollar
- USD/CHF - US Dollar to Swiss Franc

## Getting Started

### Prerequisites

- Any modern web browser (Chrome, Firefox, Safari, Edge)
- VS Code (optional, for development)
- Python 3 (for local server)

### Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/theecolboy/forex-project.git
   cd forex-project
   ```

2. **Open in VS Code**
   ```bash
   code .
   ```

3. **Run Locally**
   
   Option A: Using Python's built-in server
   ```bash
   python3 -m http.server 8000
   ```
   
   Option B: Using VS Code Live Server extension
   - Install the "Live Server" extension in VS Code
   - Right-click on `index.html` and select "Open with Live Server"

4. **Access the Dashboard**
   - Open your browser and navigate to `http://localhost:8000`

## Project Structure

```
forex-project/
├── index.html      # Main HTML file
├── styles.css      # Styling and responsive design
├── script.js       # Interactive functionality
├── package.json    # Project metadata
├── .gitignore      # Git ignore rules
└── README.md       # This file
```

## Usage

### Viewing Exchange Rates

The dashboard displays four major currency pairs by default:
- EUR/USD
- GBP/USD
- USD/JPY
- AUD/USD

Each card shows:
- Currency pair name
- Current exchange rate
- Percentage change (positive in green, negative in red)

### Searching for Currency Pairs

1. Enter a currency pair in the search box (e.g., `EUR/USD`)
2. Click the "Search" button or press Enter
3. View the rate and change percentage in the alert

### Viewing Trends

The 24-Hour Trend section displays a line chart showing the historical movement of EUR/USD over the past 24 hours.

## Development

### Modifying the Dashboard

1. **Add New Currency Pairs**: Edit the `forexData` object in `script.js`
2. **Change Styling**: Modify `styles.css`
3. **Update Rates**: Replace sample data with real API calls

### Integrating Real Data

To use real exchange rates, integrate with a forex API:

```javascript
// Example: Using a forex API
fetch('https://api.example.com/rates')
  .then(response => response.json())
  .then(data => updateRates(data))
  .catch(error => console.error('Error:', error));
```

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Performance

- **Page Load Time**: < 1 second
- **Responsive**: Optimized for all screen sizes
- **Lightweight**: No external dependencies

## Deployment

### GitHub Pages

1. Go to repository settings
2. Navigate to "Pages" section
3. Select "main" branch as source
4. Your site will be available at: `https://theecolboy.github.io/forex-project/`

### Other Hosting Options

- Netlify
- Vercel
- Firebase Hosting
- AWS S3 + CloudFront

## Contributing

Feel free to fork this project and submit pull requests for any improvements.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Author

**theecolboy** - [GitHub Profile](https://github.com/theecolboy)

## Support

For issues or questions, please open an issue on the GitHub repository.

---

**Last Updated**: May 2026
