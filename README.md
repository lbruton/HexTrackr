# HexTrackr

A comprehensive web application for tracking and managing Hexagon service tickets within the VulnTrackr project ecosystem.

## Features

### 📋 **Ticket Management**
- **Create Tickets**: Add new tickets with comprehensive details
- **Edit Tickets**: Modify existing ticket information
- **View Tickets**: Detailed ticket viewing with all information
- **Delete Tickets**: Remove tickets with confirmation
- **Status Tracking**: Track ticket status (Open, In Progress, Completed, Closed)

### 🖥️ **User Interface**
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Bootstrap 5**: Modern, clean interface with professional styling
- **Modal Forms**: User-friendly popup forms for data entry
- **Real-time Search**: Instant search across all ticket fields
- **Advanced Filtering**: Filter by status and location
- **Statistics Dashboard**: Live statistics with visual cards

### 🔧 **Device Management**
- **Multiple Devices**: Add multiple devices per ticket (host01, host30, host03, etc.)
- **Dynamic Fields**: Add/remove device fields as needed
- **Device Tags**: Visual display of all devices associated with a ticket

### 📊 **Export Capabilities**
- **CSV Export**: Comma-separated values for spreadsheet applications
- **Excel Export**: Native Excel format (.xlsx) with proper formatting
- **JSON Export**: Machine-readable data format for integrations
- **PDF Export**: Professional PDF reports with tables
- **HTML Export**: Standalone HTML reports for sharing

### 🏷️ **Data Fields**
- **Date Submitted**: When the ticket was created
- **Date Due**: Target completion date
- **Hexagon Ticket #**: Primary ticket identifier
- **Service Now #**: Secondary ticketing system reference
- **Location**: Physical or logical location
- **Devices**: Multiple device entries (host01, host30, host03, etc.)
- **Supervisor**: Assigned supervisor
- **Tech**: Assigned technician
- **Status**: Current ticket status
- **Notes**: Additional comments and details

### 🎯 **Advanced Features**
- **Overdue Detection**: Automatic highlighting of overdue tickets
- **Local Storage**: Data persistence in browser storage
- **Search Highlighting**: Highlighted search terms in results
- **Responsive Tables**: Mobile-friendly table display
- **Toast Notifications**: User feedback for actions
- **Form Validation**: Ensures data integrity

## Technical Specifications

### **Technology Stack**
- **HTML5**: Semantic markup with accessibility features
- **CSS3**: Modern styling with animations and responsive design
- **JavaScript ES6+**: Modern JavaScript with classes and modules
- **Bootstrap 5**: UI framework for responsive design
- **Font Awesome**: Icon library for visual elements

### **External Libraries**
- **SheetJS (XLSX)**: Excel file generation
- **jsPDF**: PDF generation
- **jsPDF-AutoTable**: PDF table formatting

### **Browser Compatibility**
- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## Installation

1. **Clone or Download**: Copy the `hexagontickets/` folder to your web server
2. **No Build Process**: Pure HTML/CSS/JavaScript - no compilation needed
3. **Open in Browser**: Navigate to `index.html` in your web browser

## File Structure

```
hexagontickets/
├── index.html          # Main application page
├── app.js              # JavaScript application logic
├── styles.css          # Custom styling and themes
└── README.md           # This documentation file
```

## Usage Guide

### **Adding a New Ticket**
1. Click the "Add New Ticket" button
2. Fill in all required fields:
   - Date Submitted (defaults to today)
   - Date Due (defaults to 7 days from today)
   - Hexagon Ticket # (required)
   - Location (required)
   - Supervisor (required)
   - Tech (required)
   - Status (required)
3. Add devices using the device management system:
   - Enter first device name (e.g., "host01")
   - Click the "+" button to add more devices
   - Add additional devices (e.g., "host30", "host03")
   - Use the "-" button to remove devices
4. Optionally add Service Now # and Notes
5. Click "Save Ticket"

### **Managing Devices**
- **Single Device**: Enter one device name
- **Multiple Devices**: Click "+" to add more device fields
- **Remove Devices**: Click "-" to remove device fields
- **Examples**: host01, host30, host03, server-prod-01, etc.

### **Searching and Filtering**
- **Search Box**: Type any text to search across all fields
- **Status Filter**: Filter by ticket status
- **Location Filter**: Filter by location (auto-populated from existing tickets)
- **Real-time Results**: Filters apply instantly

### **Exporting Data**
1. Apply any desired filters
2. Click the appropriate export button:
   - **CSV**: For Excel, Google Sheets, or other spreadsheet applications
   - **Excel**: Native Excel format with proper formatting
   - **JSON**: For programmatic access or data integration
   - **PDF**: Professional reports for printing or sharing
   - **HTML**: Standalone web pages for email or web sharing

### **Viewing and Editing**
- **View**: Click the eye icon to see all ticket details
- **Edit**: Click the pencil icon to modify ticket information
- **Delete**: Click the trash icon to remove tickets (with confirmation)

## Data Management

### **Storage**
- Data is stored in browser's local storage
- Persists between browser sessions
- No server-side database required

### **Backup**
- Export to JSON format for backup purposes
- Import functionality can be added if needed
- Data survives browser cache clears

### **Security**
- Client-side only application
- No data transmitted to external servers
- Suitable for sensitive internal use

## Customization

### **Styling**
- Modify `styles.css` for custom colors and themes
- Bootstrap variables can be overridden
- Responsive breakpoints can be adjusted

### **Fields**
- Add new fields by modifying the form in `index.html`
- Update JavaScript in `app.js` to handle new fields
- Export functions automatically include new fields

### **Validation**
- HTML5 validation is used by default
- Custom validation can be added in JavaScript
- Required fields are marked with `required` attribute

## Troubleshooting

### **Common Issues**
1. **Data Loss**: Export regularly as backup
2. **Browser Support**: Use modern browsers for best experience
3. **Mobile Display**: Some features optimized for desktop
4. **Large Datasets**: Performance may vary with hundreds of tickets

### **Performance**
- Optimized for up to 1000 tickets
- Search and filtering are client-side
- Export operations handle large datasets efficiently

## Integration

### **API Integration**
- JSON export provides data for external systems
- Can be integrated with ServiceNow or other ticketing systems
- RESTful API can be added for server integration

### **Workflow Integration**
- Designed to complement existing VulnTrackr workflows
- Can be embedded in larger applications
- Supports iframe embedding

## Support

For questions, issues, or feature requests related to the Hexagon Tickets Management System, please refer to the main VulnTrackr project documentation or contact the development team.

---

**Version**: 1.0.0  
**Last Updated**: August 20, 2025  
**Part of**: VulnTrackr Project Ecosystem
