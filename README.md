# HexTrackr - Vulnerability Management Platform

## 🎯 Overview

HexTrackr is a modern, client-side vulnerability management platform designed for security teams to track, analyze, and manage security vulnerabilities across their infrastructure. Built with a clean, responsive design and powerful CSV import/export capabilities.

## ✨ Key Features

- **📊 Interactive Dashboard**: Modern card-based vulnerability visualization
- **📁 CSV Import/Export**: Support for multiple vulnerability scanner formats
- **🔍 Advanced Filtering**: Search and filter by severity, asset, or vulnerability type
- **📈 VPR Analytics**: Vulnerability Priority Rating tracking and trends
- **💾 Local Storage**: Client-side data persistence (no external dependencies)
- **📱 Responsive Design**: Works on desktop, tablet, and mobile devices

## 🚀 Quick Start

### Simple Setup (Recommended)

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd HexTrackr
   ```

2. **Start a local web server**:
   ```bash
   # Using Python 3
   python3 -m http.server 8080
   
   # Using Node.js
   npx http-server -p 8080
   
   # Using PHP
   php -S localhost:8080
   ```

3. **Open in browser**:
   ```
   http://localhost:8080
   ```

### Features Available

- ✅ **CSV Upload**: Import vulnerability data from Tenable, Qualys, Nessus, etc.
- ✅ **Data Visualization**: Interactive charts and statistics
- ✅ **Export Options**: Download filtered data as CSV or JSON
- ✅ **Search & Filter**: Find specific vulnerabilities or assets
- ✅ **VPR Tracking**: Monitor vulnerability priority ratings

## 📋 Supported CSV Formats

HexTrackr supports standard vulnerability scanner outputs with these fields:

### Required Fields
- `hostname` - Asset hostname or name
- `ip_address` - Asset IP address
- `severity` - Vulnerability severity (Critical, High, Medium, Low)
- `plugin_name` - Vulnerability title/name

### Optional Fields  
- `plugin_id` - Scanner plugin ID
- `description` - Vulnerability description
- `definition.vpr.score` - VPR score (for Tenable)
- `first_found` - Discovery date
- `last_found` - Last seen date
- `state` - Vulnerability state (Open, Fixed, etc.)

### Example CSV Format
```csv
hostname,ip_address,plugin_id,plugin_name,severity,description,definition.vpr.score,first_found,last_found,state
web-server-01,192.168.1.10,19506,Apache HTTP Server Security Update,high,Apache security vulnerability,7.4,2024-01-15,2024-08-21,Open
db-server-01,192.168.1.20,11011,PostgreSQL Security Update,critical,PostgreSQL RCE vulnerability,9.2,2024-02-01,2024-08-20,Open
```

## 🛠 Development

### Project Structure
```
HexTrackr/
├── index.html              # Main application (single-page)
├── unified-design-system.css # Custom styling
├── test/                   # Sample data and test files
│   └── sample-vulnerabilities.csv
└── docs/                   # Documentation and guides
```

### Key Components

1. **Frontend**: Pure HTML/CSS/JavaScript with Bootstrap + Tailwind
2. **CSV Processing**: Papa Parse library for client-side parsing
3. **Charts**: ApexCharts for interactive visualizations
4. **Storage**: Browser localStorage for data persistence

### Adding Features

The application uses a modular JavaScript structure:

```javascript
// Event listeners for UI interactions
document.addEventListener('DOMContentLoaded', function() {
    // Button event handlers
    // File upload handling
    // Data processing functions
});

// Core functions
function handleFileUpload(event) { /* CSV processing */ }
function updateDashboard() { /* UI updates */ }
function exportData(format) { /* Data export */ }
```

## 📊 Usage Guide

### Importing Data

1. Click **"Upload More Data"** button
2. Select CSV file(s) from your vulnerability scanner
3. Review imported data in the dashboard
4. Use filters to analyze specific vulnerabilities

### Analyzing Vulnerabilities

- **Dashboard Cards**: View VPR scores by severity
- **Asset View**: See vulnerabilities grouped by asset
- **Vulnerability View**: Browse individual vulnerabilities
- **Table View**: Detailed spreadsheet-like interface

### Exporting Data

1. Apply desired filters
2. Click export button
3. Choose format (CSV, JSON, PDF)
4. Download filtered dataset

## 🔧 Configuration

### Browser Storage

Data is stored locally in your browser's localStorage. To clear data:

```javascript
// Open browser console and run:
localStorage.removeItem('vulnData');
localStorage.removeItem('vulnHistory');
```

### Large File Handling

For large CSV files (>50MB), consider:

1. **Pre-processing**: Split large files into smaller chunks
2. **Browser Memory**: Close other tabs to free memory
3. **Processing Time**: Allow time for parsing large datasets

## 📁 Sample Data

Sample vulnerability data is included in `/test/sample-vulnerabilities.csv` for testing and demonstration purposes.

## 🐛 Troubleshooting

### Common Issues

**CSV Upload Not Working**:
- Ensure file is valid CSV format
- Check that required fields are present
- Verify file size (<100MB recommended)

**Data Not Displaying**:
- Check browser console for errors
- Verify CSV headers match expected format
- Clear browser cache and reload

**Performance Issues**:
- Reduce dataset size for testing
- Close unnecessary browser tabs
- Use modern browser (Chrome, Firefox, Safari)

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For issues and questions:
- Check the troubleshooting section
- Review sample CSV format
- Open an issue on GitHub

---

**Version**: 2.3.0 (Simplified)  
**Last Updated**: $(date)  
**Status**: ✅ Stable - Ready for Production Use
