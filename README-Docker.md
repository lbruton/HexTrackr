# HexTrackr Docker Deployment

## Quick Start

### Option 1: nginx (Recommended for Production)
```bash
# Build and run with Docker Compose
docker-compose up -d

# Or build manually
docker build -t hextrackr .
docker run -d -p 8080:80 -v $(pwd):/usr/share/nginx/html hextrackr
```

### Option 2: Node.js/Express (Better for Development)
```bash
# Build and run Node.js version
docker build -f Dockerfile.node -t hextrackr-node .
docker run -d -p 8080:8080 -v $(pwd):/app hextrackr-node

# Or run locally with live reload
npm install
npm run dev
```

## Development Workflow

With volume mounts enabled, you can:
- Edit any file (HTML, CSS, JS) in the project directory
- Changes are immediately reflected without rebuilding the container
- Perfect for development and testing

## Access Points

Once running, access the application at:
- **Tickets Management**: http://localhost:8080/tickets.html
- **Vulnerability Management**: http://localhost:8080/vulnerabilities-new.html
- **Help Documentation**: http://localhost:8080/help/

## File Upload Testing

The vulnerability management system can handle:
- Small test files: Use the included `test-vulnerabilities-small.csv`
- Large production files: 62MB+ Cisco vulnerability reports
- Multiple formats: CSV import with automatic column mapping

## Container Features

- **nginx version**: Ultra-lightweight (20MB), production-ready, CORS enabled
- **Node.js version**: Better error handling, compression, development-friendly
- **Volume mounts**: Live file updates without container rebuilds
- **Security headers**: XSS protection, content type sniffing prevention
- **Compression**: Gzip compression for faster loading

## Troubleshooting

If you encounter issues:
1. Ensure Docker is running
2. Check port 8080 is available
3. For large CSV files, increase Docker memory limits if needed
4. Use browser dev tools to monitor network and console for errors

## Performance Notes

For large vulnerability CSV files (62MB+):
- The container handles file processing client-side
- No server memory impact for file uploads
- Processing time depends on browser performance
- Consider chunked processing for very large datasets
