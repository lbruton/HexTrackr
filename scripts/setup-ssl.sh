#!/bin/bash

# HexTrackr HTTPS/SSL Certificate Setup Script
# Generates self-signed certificates for development/testing
# Works cross-platform: macOS, Linux, Windows (with OpenSSL)

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default configuration
CERT_DIR="./certs"
CERT_VALIDITY_DAYS=3650  # 10 years
KEY_SIZE=4096

# Detect OS for platform-specific instructions
OS="unknown"
if [[ "$OSTYPE" == "darwin"* ]]; then
    OS="macOS"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    OS="Linux"
elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]]; then
    OS="Windows"
fi

echo "======================================"
echo "   HexTrackr HTTPS Certificate Setup"
echo "======================================"
echo ""
echo -e "${BLUE}🔍 Detected OS: $OS${NC}"
echo ""

# Check for OpenSSL
check_openssl() {
    if ! command -v openssl &> /dev/null; then
        echo -e "${RED}❌ OpenSSL is not installed${NC}"
        echo ""

        case $OS in
            "macOS")
                echo "OpenSSL should be available on macOS by default."
                echo "If missing, install via Homebrew:"
                echo "  brew install openssl"
                ;;
            "Linux")
                echo "Install OpenSSL:"
                echo "  sudo apt update && sudo apt install openssl    # Ubuntu/Debian"
                echo "  sudo yum install openssl                       # CentOS/RHEL"
                ;;
            "Windows")
                echo "Install OpenSSL for Windows:"
                echo "  - Download from: https://slproweb.com/products/Win32OpenSSL.html"
                echo "  - Or use Git Bash (includes OpenSSL)"
                ;;
        esac
        exit 1
    fi

    echo -e "${GREEN}✅ OpenSSL is available${NC}"
    openssl version
    echo ""
}

# Create certificate directory
setup_cert_directory() {
    if [ -d "$CERT_DIR" ]; then
        echo -e "${YELLOW}⚠️  Certificate directory already exists: $CERT_DIR${NC}"

        if [ -f "$CERT_DIR/cert.pem" ] && [ -f "$CERT_DIR/key.pem" ]; then
            echo ""
            echo "Existing certificates found:"
            echo "  Certificate: $CERT_DIR/cert.pem"
            echo "  Private Key: $CERT_DIR/key.pem"
            echo ""

            # Check certificate validity
            if openssl x509 -in "$CERT_DIR/cert.pem" -noout -checkend 86400 > /dev/null 2>&1; then
                echo -e "${GREEN}✅ Existing certificate is valid for at least 24 hours${NC}"
                read -p "Do you want to regenerate the certificate? (y/N): " -n 1 -r
                echo
                if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                    echo "Using existing certificate."
                    return 0
                fi
            else
                echo -e "${YELLOW}⚠️  Existing certificate is expired or invalid${NC}"
                echo "Regenerating certificate..."
            fi

            # Backup existing certificates
            backup_dir="$CERT_DIR/backup-$(date +%Y%m%d-%H%M%S)"
            mkdir -p "$backup_dir"
            cp "$CERT_DIR"/*.pem "$backup_dir/" 2>/dev/null || true
            echo "Backed up existing certificates to: $backup_dir"
        fi
    else
        echo -e "${GREEN}📁 Creating certificate directory: $CERT_DIR${NC}"
        mkdir -p "$CERT_DIR"
    fi
}

# Generate self-signed certificate
generate_certificate() {
    echo -e "${BLUE}🔐 Generating self-signed SSL certificate...${NC}"
    echo ""

    # Determine the CN (Common Name) for the certificate
    read -p "Enter the domain/hostname for the certificate (default: localhost): " domain
    domain=${domain:-localhost}

    # Generate certificate
    openssl req -x509 -newkey rsa:$KEY_SIZE \
        -keyout "$CERT_DIR/key.pem" \
        -out "$CERT_DIR/cert.pem" \
        -days $CERT_VALIDITY_DAYS \
        -nodes \
        -subj "/C=US/ST=State/L=City/O=HexTrackr/CN=$domain" \
        -addext "subjectAltName=DNS:$domain,DNS:localhost,IP:127.0.0.1"

    # Set proper permissions
    chmod 600 "$CERT_DIR/key.pem"
    chmod 644 "$CERT_DIR/cert.pem"

    # Set Docker-compatible ownership if in containerized environment
    if [ -n "${DOCKER_ENV:-}" ] || command -v docker &> /dev/null && docker info &> /dev/null; then
        echo "Setting Docker-compatible ownership..."
        # Try to set ownership for Docker user (1001:1001 is common Docker user)
        chown 1001:1001 "$CERT_DIR/key.pem" "$CERT_DIR/cert.pem" 2>/dev/null || {
            echo "Note: Could not set Docker ownership. Run 'sudo chown 1001:1001 certs/*.pem' if using Docker."
        }
    fi

    echo ""
    echo -e "${GREEN}✅ Certificate generated successfully!${NC}"
    echo ""
    echo "Certificate details:"
    echo "  Location: $CERT_DIR/"
    echo "  Domain: $domain"
    echo "  Validity: $CERT_VALIDITY_DAYS days ($(date -d "+$CERT_VALIDITY_DAYS days" +%Y-%m-%d) if on Linux)"
    echo "  Key Size: $KEY_SIZE bits"
    echo ""
}

# Platform-specific sed function
sed_update() {
    local pattern="$1"
    local file="$2"

    if [ "$OS" == "macOS" ]; then
        sed -i.backup "$pattern" "$file"
    else
        # Linux/other systems
        sed -i.backup "$pattern" "$file" 2>/dev/null || sed -i "$pattern" "$file"
    fi
}

# Update .env file
update_env_file() {
    echo -e "${BLUE}⚙️  Configuring environment variables...${NC}"

    # Check if .env exists
    if [ ! -f ".env" ]; then
        if [ -f ".env.example" ]; then
            cp ".env.example" ".env"
            echo "Created .env from .env.example"
        else
            # Create basic .env
            cat > .env <<EOF
NODE_ENV=development
PORT=8080
DATABASE_PATH=app/public/data/hextrackr.db
HEXTRACKR_VERSION=1.0.33
EOF
            echo "Created basic .env file"
        fi
    fi

    # Add or update HTTPS configuration
    if grep -q "USE_HTTPS" .env; then
        # Update existing HTTPS config using platform-specific sed
        sed_update 's/USE_HTTPS=.*/USE_HTTPS=true/' .env
        sed_update 's|SSL_KEY_PATH=.*|SSL_KEY_PATH=./certs/key.pem|' .env
        sed_update 's|SSL_CERT_PATH=.*|SSL_CERT_PATH=./certs/cert.pem|' .env
        echo "Updated existing HTTPS configuration in .env"
    else
        # Add HTTPS configuration
        cat >> .env <<EOF

# HTTPS Configuration (added by setup-ssl.sh)
USE_HTTPS=true
SSL_KEY_PATH=./certs/key.pem
SSL_CERT_PATH=./certs/cert.pem
EOF
        echo "Added HTTPS configuration to .env"
    fi

    echo -e "${GREEN}✅ Environment configured for HTTPS${NC}"
    echo ""
}

# Update docker-compose.yml for HTTPS support
update_docker_compose() {
    echo -e "${BLUE}🐳 Configuring Docker Compose for HTTPS...${NC}"

    if [ -f "docker-compose.yml" ]; then
        # Check existing configuration
        if grep -q "8443:" docker-compose.yml && grep -q "./certs:/app/certs" docker-compose.yml; then
            echo -e "${GREEN}✅ Docker Compose already configured for HTTPS${NC}"
            echo "  - HTTPS port mapping: 8443:8443"
            echo "  - Certificate volume mount: ./certs:/app/certs:ro"

            # Update HEXTRACKR_VERSION if needed
            if grep -q "HEXTRACKR_VERSION=1.0.31" docker-compose.yml; then
                echo "Updating HEXTRACKR_VERSION to 1.0.33..."
                sed_update 's/HEXTRACKR_VERSION=1.0.31/HEXTRACKR_VERSION=1.0.33/' docker-compose.yml
            fi
        else
            echo "Updating docker-compose.yml for HTTPS support..."

            # Create backup
            cp docker-compose.yml docker-compose.yml.backup

            # Add HTTPS port if missing
            if ! grep -q "8443:" docker-compose.yml; then
                if grep -q "8989:8080" docker-compose.yml; then
                    sed_update '/8989:8080/a\      - "8443:8443"  # HTTPS port' docker-compose.yml
                    echo "Added HTTPS port mapping"
                fi
            fi

            # Add certs volume if missing
            if ! grep -q "./certs:/app/certs" docker-compose.yml; then
                echo "Note: Certificate volume mount may need manual addition:"
                echo "      - ./certs:/app/certs:ro"
            fi
        fi
    else
        echo "No docker-compose.yml found. Creating reference configuration..."
        cat > docker-compose.https.yml <<EOF
# HTTPS-enabled Docker Compose configuration
# Copy this to docker-compose.yml or merge with existing configuration

version: '3.8'
services:
  hextrackr:
    build: .
    ports:
      - "8989:8080"     # HTTP
      - "8443:8443"     # HTTPS
    volumes:
      - ./certs:/app/certs:ro
    environment:
      - USE_HTTPS=true
      - SSL_KEY_PATH=/app/certs/key.pem
      - SSL_CERT_PATH=/app/certs/cert.pem
    restart: unless-stopped
EOF
        echo "Created docker-compose.https.yml as reference"
    fi

    echo -e "${GREEN}✅ Docker configuration checked${NC}"
    echo ""
}

# Update .gitignore
update_gitignore() {
    echo -e "${BLUE}🔒 Updating .gitignore for certificate security...${NC}"

    # Patterns to add
    cert_patterns=(
        "# SSL Certificates (added by setup-ssl.sh)"
        "certs/"
        "*.pem"
        "*.key"
        "*.crt"
        "*.p12"
        "*.pfx"
    )

    # Check if .gitignore exists
    if [ ! -f ".gitignore" ]; then
        echo "Creating .gitignore file..."
        touch .gitignore
    fi

    # Add certificate patterns if not already present
    added_patterns=0
    for pattern in "${cert_patterns[@]}"; do
        if ! grep -q "^$pattern$" .gitignore; then
            echo "$pattern" >> .gitignore
            ((added_patterns++))
        fi
    done

    if [ $added_patterns -gt 0 ]; then
        echo "Added $added_patterns certificate patterns to .gitignore"
    else
        echo "Certificate patterns already in .gitignore"
    fi

    echo -e "${GREEN}✅ Certificate files will be excluded from git${NC}"
    echo ""
}

# Display setup completion info
show_completion_info() {
    echo "======================================"
    echo -e "${GREEN}🎉 HTTPS Setup Complete!${NC}"
    echo "======================================"
    echo ""
    echo "Your HexTrackr installation is now configured for HTTPS."
    echo ""
    echo -e "${BLUE}📋 Next Steps:${NC}"
    echo ""
    echo "1. Start HexTrackr with HTTPS:"
    echo "   npm run dev                    # Local development"
    echo "   docker-compose up             # Docker development"
    echo ""
    echo "2. Access your application:"
    echo "   https://localhost:8080        # Local development"
    echo "   https://localhost:8443        # Docker HTTPS"
    echo "   http://localhost:8989         # Docker HTTP (still available)"
    echo ""
    echo -e "${BLUE}🌐 Production Nginx Example:${NC}"
    echo "   For production deployment, consider using Nginx as reverse proxy:"
    echo ""
    echo "   # /etc/nginx/sites-available/hextrackr"
    echo "   server {"
    echo "       listen 443 ssl;"
    echo "       server_name your-domain.com;"
    echo ""
    echo "       ssl_certificate /path/to/your/cert.pem;"
    echo "       ssl_certificate_key /path/to/your/key.pem;"
    echo ""
    echo "       location / {"
    echo "           proxy_pass http://localhost:8080;"
    echo "           proxy_set_header Host \$host;"
    echo "           proxy_set_header X-Real-IP \$remote_addr;"
    echo "           proxy_set_header X-Forwarded-Proto \$scheme;"
    echo "       }"
    echo "   }"
    echo ""
    echo -e "${YELLOW}⚠️  Browser Security Warning:${NC}"
    echo "   Your browser will show a security warning because this is"
    echo "   a self-signed certificate. This is normal for development."
    echo "   Click 'Advanced' → 'Proceed to localhost (unsafe)'"
    echo ""
    echo -e "${BLUE}📚 Documentation:${NC}"
    echo "   Complete HTTPS guide: docs-source/guides/https-setup.md"
    echo "   Web docs: http://localhost:8989/docs-html/#guides/https-setup"
    echo ""
    echo -e "${BLUE}🔧 Configuration Files:${NC}"
    echo "   Certificates: $CERT_DIR/"
    echo "   Environment: .env"
    echo "   Backup: $CERT_DIR/backup-* (if applicable)"
    echo ""
}

# Main execution
main() {
    check_openssl
    setup_cert_directory
    generate_certificate
    update_env_file
    update_docker_compose
    update_gitignore
    show_completion_info
}

# Handle script arguments
case "${1:-}" in
    --help|-h)
        echo "HexTrackr HTTPS Certificate Setup Script"
        echo ""
        echo "Usage: $0 [options]"
        echo ""
        echo "Options:"
        echo "  --help, -h     Show this help message"
        echo "  --force, -f    Force regenerate certificates"
        echo ""
        echo "This script generates self-signed SSL certificates for HexTrackr"
        echo "development and configures the application for HTTPS."
        exit 0
        ;;
    --force|-f)
        echo "Force mode: Will regenerate certificates without prompting"
        rm -rf "$CERT_DIR"
        main
        ;;
    "")
        main
        ;;
    *)
        echo "Unknown option: $1"
        echo "Use --help for usage information"
        exit 1
        ;;
esac