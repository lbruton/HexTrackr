# HexTrackr 🛠️

> A Network Administrator's personal toolkit for tracking maintenance tickets and vulnerability management

## What is HexTrackr?

HexTrackr started as a personal project to solve a real problem: managing network maintenance tickets across multiple systems while keeping track of vulnerability scans. If you're a network admin juggling ServiceNow tickets, Hexagon maintenance windows, and vulnerability reports from various scanners, this tool might be exactly what you need.

Built by a network administrator for network administrators, HexTrackr provides a unified dashboard for the daily chaos of network operations.

## 🚀 Quick Start

Get up and running in under 5 minutes with Docker:

```bash
# Clone the repository
git clone https://github.com/Lonnie-Bruton/HexTrackr.git
cd HexTrackr

# Start with Docker Compose (recommended)
docker-compose up -d

# Access the application
open http://localhost:8989
```

That's it! No complex setup, no database installation, just Docker and go.

## 🎯 Core Features

### Ticket Management 📋

- **Unified ticket tracking** across ServiceNow and Hexagon systems
- **Drag-and-drop device ordering** for maintenance sequences
- **Automatic XT# generation** for Hexagon tickets
- **Quick exports** to CSV, PDF, and markdown for field teams
- **Bundle downloads** with all supporting documentation

### Vulnerability Tracking 🛡️

- **CSV import** from any vulnerability scanner
- **Smart deduplication** to avoid counting the same vulnerability twice
- **VPR scoring** and trend analysis
- **CISA KEV tracking** for critical vulnerabilities
- **Real-time progress** for large imports (100k+ vulnerabilities)

### Why These Features Matter

Every feature in HexTrackr exists because I needed it. The drag-and-drop device ordering? That's for when you're planning maintenance windows. The markdown export? Perfect for pasting into tickets or emails. The vulnerability deduplication? Essential when you're importing from multiple scanners.

## 📊 Dashboard Preview

*[Screenshots coming soon - the UI uses AG-Grid for responsive tables and ApexCharts for trend visualization]*

## 🔧 Technical Stack

- **Frontend**: Vanilla JavaScript with AG-Grid and ApexCharts
- **Backend**: Node.js/Express monolith (keeping it simple)
- **Database**: SQLite (no DBA required!)
- **Deployment**: Docker Compose
- **Security**: PathValidator, rate limiting, and more

## 🛣️ Development Status

HexTrackr is actively used in production for daily network operations. Current version: **1.0.14**

### What's Working Great

- ✅ Complete ticket lifecycle management
- ✅ Vulnerability import and deduplication
- ✅ Dark/light theme with accessibility
- ✅ Real-time WebSocket updates
- ✅ Comprehensive backup/restore

### What's Coming Next (v1.0.15)

- 🔐 Authentication system (currently relies on network security)
- 🛡️ Enhanced security headers
- 📊 Custom dashboard widgets
- 🔌 API expansion for automation

## 🌟 The Vision

While HexTrackr serves perfectly as a personal toolkit today, the goal is to grow it into a full-featured platform that any network operations team can deploy. Each feature is being built with scalability in mind, but without sacrificing the simplicity that makes it useful right now.

## 🤝 Contributing

Found a bug? Have a feature idea? Contributions are welcome!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Follow the S-R-P-T methodology (see `/Planning/WORKFLOW.md`)
4. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
5. Push to the branch (`git push origin feature/AmazingFeature`)
6. Open a Pull Request

### Development Setup

```bash
# Install dependencies
npm install

# Run linters
npm run lint:all

# Run tests
docker-compose restart && npx playwright test

# Generate documentation
npm run docs:generate
```

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built with coffee ☕ and determination
- Inspired by the daily challenges of network administration
- Special thanks to the open source community

---

**Note**: This is a personal project that solves real problems. If it helps you manage your network operations better, that's awesome! If you want to help make it even better, contributions are always welcome.

*Built by a network admin who got tired of switching between screens* 🖥️
