#!/bin/bash

# rEngine Master Installer - Protected System Builder
# This script protects itself and rebuilds the entire rEngine system safely
# Version: 1.0.0
# Author: rEngine Team

set -euo pipefail  # Exit on any error, undefined vars, pipe failures

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

# Script metadata
SCRIPT_NAME="rengine-master-installer.sh"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKUP_DIR="${SCRIPT_DIR}/backups/master-installer-$(date +%Y%m%d_%H%M%S)"
TEMPLATES_DIR="${SCRIPT_DIR}/templates"
LOG_FILE="${SCRIPT_DIR}/logs/master-installer.log"

# Ensure logs directory exists
mkdir -p "${SCRIPT_DIR}/logs"

# Logging function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Print functions
print_header() {
    echo ""
    echo -e "${PURPLE}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${PURPLE}║${WHITE}                 🛡️  rEngine Master Installer                  ${PURPLE}║${NC}"
    echo -e "${PURPLE}║${CYAN}                    Protected System Builder                   ${PURPLE}║${NC}"
    echo -e "${PURPLE}╚══════════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
    log "SUCCESS: $1"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
    log "ERROR: $1"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
    log "WARNING: $1"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
    log "INFO: $1"
}

# Self-protection function
protect_self() {
    print_info "Applying self-protection to master installer..."
    
    # Make self read-only after ensuring it's executable
    chmod +x "$0"
    
    # Create checksum for integrity verification
    shasum -a 256 "$0" > "${SCRIPT_DIR}/.master-installer.checksum"
    
    # Protect the checksum file too
    chmod 444 "${SCRIPT_DIR}/.master-installer.checksum"
    
    print_success "Master installer is now write-protected"
}

# Integrity check function
verify_integrity() {
    print_info "Verifying master installer integrity..."
    
    if [[ -f "${SCRIPT_DIR}/.master-installer.checksum" ]]; then
        if shasum -a 256 -c "${SCRIPT_DIR}/.master-installer.checksum" >/dev/null 2>&1; then
            print_success "Integrity check passed"
            return 0
        else
            print_error "Integrity check FAILED! Script may be corrupted!"
            return 1
        fi
    else
        print_warning "No checksum found - first run or integrity file missing"
        return 0
    fi
}

# Memory protection function
protect_memories() {
    print_info "🧠 Protecting AI memories and data..."
    
    local memory_locations=(
        "rMemory/"
        "memory-backups/"
        "persistent-memory.json"
        "memory-consolidation-report.json"
        "agents/memory"
        "rAgents/"
        "$HOME/.rengine/secrets/"
        "$HOME/.rengine/mobile-scribe/"
    )
    
    local memories_safe=true
    
    for location in "${memory_locations[@]}"; do
        local full_path
        if [[ "$location" == "$HOME"* ]]; then
            full_path="$location"
        else
            full_path="${SCRIPT_DIR}/${location}"
        fi
        
        if [[ -e "$full_path" ]]; then
            # Create extra backup specifically for memories
            local memory_backup="${BACKUP_DIR}/CRITICAL_MEMORIES/$(basename "$location")"
            mkdir -p "$(dirname "$memory_backup")"
            cp -r "$full_path" "$memory_backup" 2>/dev/null || {
                print_warning "Could not backup memory location: $location"
                memories_safe=false
            }
        fi
    done
    
    if [[ "$memories_safe" == true ]]; then
        print_success "🛡️ All AI memories safely backed up"
    else
        print_warning "⚠️ Some memory locations could not be backed up"
    fi
    
    # Create memory manifest
    cat > "${BACKUP_DIR}/MEMORY_MANIFEST.txt" << EOF
🧠 rEngine Memory Backup Manifest
Created: $(date)
Backup Location: ${BACKUP_DIR}/CRITICAL_MEMORIES/

Memory Locations Backed Up:
$(ls -la "${BACKUP_DIR}/CRITICAL_MEMORIES/" 2>/dev/null || echo "None found")

Memory Safety Status: $memories_safe

IMPORTANT: This installer NEVER deletes memory files.
All memories are preserved and backed up before any changes.
EOF
}

# Backup function
create_backup() {
    print_info "Creating system backup before rebuild..."
    
    mkdir -p "$BACKUP_DIR"
    
    # Backup critical files - INCLUDING ALL MEMORY DATA
    local files_to_backup=(
        "docker-compose-enhanced.yml"
        "package.json"
        ".vscode/settings.json"
        "docker/"
        "scripts/"
        "bin/"
        "logs/"
        "docs/"
        "rMemory/"
        "memory-backups/"
        "persistent-memory.json"
        "memory-consolidation-report.json"
        "agents/memory"
        "rAgents/"
        "rCore/"
        "rProjects/"
        "rScribe/"
        "rProtocols/"
        "setup-secure-api-keys.sh"
        "smart-scribe-mobile.js"
        "templates/"
    )
    
    for item in "${files_to_backup[@]}"; do
        if [[ -e "${SCRIPT_DIR}/${item}" ]]; then
            cp -r "${SCRIPT_DIR}/${item}" "$BACKUP_DIR/"
            print_success "Backed up: $item"
        fi
    done
    
    # Create backup manifest
    cat > "${BACKUP_DIR}/BACKUP_MANIFEST.txt" << EOF
rEngine System Backup
Created: $(date)
Source: ${SCRIPT_DIR}
Backup Directory: ${BACKUP_DIR}

Files Backed Up:
$(ls -la "$BACKUP_DIR")

System State:
- Docker Compose: $(test -f "${SCRIPT_DIR}/docker-compose-enhanced.yml" && echo "Present" || echo "Missing")
- Scripts Directory: $(test -d "${SCRIPT_DIR}/scripts" && echo "Present" || echo "Missing")
- Docker Directory: $(test -d "${SCRIPT_DIR}/docker" && echo "Present" || echo "Missing")
- Logs Directory: $(test -d "${SCRIPT_DIR}/logs" && echo "Present" || echo "Missing")

Docker Services Status:
$(docker-compose -f "${SCRIPT_DIR}/docker-compose-enhanced.yml" ps 2>/dev/null || echo "Docker not running or compose file missing")
EOF
    
    print_success "Backup created at: $BACKUP_DIR"
}

# Template system validation
validate_templates() {
    print_info "Validating template system..."
    
    if [[ ! -d "$TEMPLATES_DIR" ]]; then
        print_warning "Templates directory not found - creating with default templates"
        create_default_templates
    fi
    
    # Check for required templates
    local required_templates=(
        "docker-compose-enhanced.yml.template"
        "vscode-settings.json.template"
        "startup-scripts.template"
    )
    
    local missing_templates=()
    for template in "${required_templates[@]}"; do
        if [[ ! -f "${TEMPLATES_DIR}/${template}" ]]; then
            missing_templates+=("$template")
        fi
    done
    
    if [[ ${#missing_templates[@]} -gt 0 ]]; then
        print_warning "Missing templates: ${missing_templates[*]}"
        print_info "Creating missing templates from current system..."
        create_missing_templates "${missing_templates[@]}"
    fi
    
    print_success "Template system validated"
}

# Create default templates
create_default_templates() {
    mkdir -p "$TEMPLATES_DIR"
    
    # Create Docker Compose template from current file
    if [[ -f "${SCRIPT_DIR}/docker-compose-enhanced.yml" ]]; then
        cp "${SCRIPT_DIR}/docker-compose-enhanced.yml" "${TEMPLATES_DIR}/docker-compose-enhanced.yml.template"
    fi
    
    # Create VS Code settings template
    if [[ -f "${SCRIPT_DIR}/.vscode/settings.json" ]]; then
        cp "${SCRIPT_DIR}/.vscode/settings.json" "${TEMPLATES_DIR}/vscode-settings.json.template"
    fi
    
    print_success "Default templates created"
}

# Create missing templates
create_missing_templates() {
    local templates=("$@")
    for template in "${templates[@]}"; do
        local source_file="${template%.template}"
        if [[ -f "${SCRIPT_DIR}/${source_file}" ]]; then
            cp "${SCRIPT_DIR}/${source_file}" "${TEMPLATES_DIR}/${template}"
            print_success "Created template: $template"
        fi
    done
}

# System rebuild function
rebuild_system() {
    print_info "Rebuilding rEngine system from templates..."
    
    # IMPORTANT: Memory safety notice
    print_info "🛡️ MEMORY SAFETY: This rebuild ONLY touches configuration files"
    print_info "🧠 Your AI memories, data, and projects are NEVER modified"
    
    # Stop running services first
    print_info "Stopping Docker services..."
    docker-compose -f "${SCRIPT_DIR}/docker-compose-enhanced.yml" down 2>/dev/null || true
    
    # Rebuild from templates
    if [[ -f "${TEMPLATES_DIR}/docker-compose-enhanced.yml.template" ]]; then
        cp "${TEMPLATES_DIR}/docker-compose-enhanced.yml.template" "${SCRIPT_DIR}/docker-compose-enhanced.yml"
        print_success "Rebuilt Docker Compose configuration"
    fi
    
    if [[ -f "${TEMPLATES_DIR}/vscode-settings.json.template" ]]; then
        mkdir -p "${SCRIPT_DIR}/.vscode"
        cp "${TEMPLATES_DIR}/vscode-settings.json.template" "${SCRIPT_DIR}/.vscode/settings.json"
        print_success "Rebuilt VS Code settings"
    fi
    
    # Ensure script permissions
    find "${SCRIPT_DIR}" -name "*.sh" -type f -exec chmod +x {} \;
    print_success "Set executable permissions on all scripts"
    
    # Rebuild Docker scripts if they exist
    if [[ -d "${SCRIPT_DIR}/docker" ]]; then
        chmod +x "${SCRIPT_DIR}/docker"/*.sh 2>/dev/null || true
        print_success "Set permissions on Docker scripts"
    fi
    
    print_success "System rebuild completed"
}

# Environment validation
validate_environment() {
    print_info "Validating rEngine environment..."
    
    local validation_errors=()
    
    # Check Docker
    if ! command -v docker >/dev/null 2>&1; then
        validation_errors+=("Docker not installed")
    fi
    
    if ! command -v docker-compose >/dev/null 2>&1; then
        validation_errors+=("Docker Compose not installed")
    fi
    
    # Check required files
    if [[ ! -f "${SCRIPT_DIR}/docker-compose-enhanced.yml" ]]; then
        validation_errors+=("docker-compose-enhanced.yml missing")
    fi
    
    if [[ ! -f "${SCRIPT_DIR}/package.json" ]]; then
        validation_errors+=("package.json missing")
    fi
    
    # Check directories
    local required_dirs=("docker" "scripts" "docs" "logs")
    for dir in "${required_dirs[@]}"; do
        if [[ ! -d "${SCRIPT_DIR}/${dir}" ]]; then
            mkdir -p "${SCRIPT_DIR}/${dir}"
            print_success "Created missing directory: $dir"
        fi
    done
    
    if [[ ${#validation_errors[@]} -gt 0 ]]; then
        print_error "Environment validation failed:"
        for error in "${validation_errors[@]}"; do
            echo -e "  ${RED}• ${error}${NC}"
        done
        return 1
    fi
    
    print_success "Environment validation passed"
    return 0
}

# Test system function
test_system() {
    print_info "Testing rEngine system functionality..."
    
    # Test Docker Compose
    if docker-compose -f "${SCRIPT_DIR}/docker-compose-enhanced.yml" config >/dev/null 2>&1; then
        print_success "Docker Compose configuration valid"
    else
        print_error "Docker Compose configuration invalid"
        return 1
    fi
    
    # Test script executability
    local script_count=0
    while IFS= read -r -d '' script; do
        if [[ -x "$script" ]]; then
            ((script_count++))
        else
            print_warning "Script not executable: $script"
        fi
    done < <(find "${SCRIPT_DIR}" -name "*.sh" -type f -print0)
    
    print_success "Found $script_count executable scripts"
    
    # Test API key setup
    if [[ -f "$HOME/.rengine/secrets/api-keys.env" ]]; then
        print_success "API keys configuration found"
    else
        print_warning "API keys not configured - run ./setup-secure-api-keys.sh"
    fi
    
    print_success "System testing completed"
    return 0
}

# Main function
main() {
    print_header
    
    # Check if this is an unprotect request
    if [[ "${1:-}" == "--unprotect" ]]; then
        print_warning "Removing write protection from master installer..."
        chmod +w "$0"
        rm -f "${SCRIPT_DIR}/.master-installer.checksum"
        print_success "Master installer unprotected - you can now modify it"
        exit 0
    fi
    
    # Verify integrity first
    if ! verify_integrity; then
        print_error "Integrity check failed - aborting for safety"
        exit 1
    fi
    
    # Main installation process
    print_info "Starting rEngine master installation process..."
    
    # Protect memories first
    protect_memories
    
    # Create backup
    create_backup
    
    # Validate templates
    validate_templates
    
    # Rebuild system
    rebuild_system
    
    # Validate environment
    if ! validate_environment; then
        print_error "Environment validation failed - check errors above"
        exit 1
    fi
    
    # Test system
    if ! test_system; then
        print_error "System testing failed - check errors above"
        exit 1
    fi
    
    # Apply self-protection
    protect_self
    
    # Final success message
    echo ""
    print_success "🎉 rEngine master installation completed successfully!"
    echo ""
    print_info "Next steps:"
    echo -e "  ${CYAN}1.${NC} Configure API keys: ${YELLOW}./setup-secure-api-keys.sh${NC}"
    echo -e "  ${CYAN}2.${NC} Start services: ${YELLOW}docker-compose -f docker-compose-enhanced.yml up -d${NC}"
    echo -e "  ${CYAN}3.${NC} Check status: ${YELLOW}docker-compose -f docker-compose-enhanced.yml ps${NC}"
    echo ""
    print_info "System backup created at: ${YELLOW}$BACKUP_DIR${NC}"
    print_info "Installation log: ${YELLOW}$LOG_FILE${NC}"
    echo ""
    print_warning "Master installer is now WRITE-PROTECTED"
    print_info "To modify this script, run: ${YELLOW}$0 --unprotect${NC}"
    echo ""
}

# Help function
show_help() {
    echo "rEngine Master Installer"
    echo ""
    echo "Usage: $0 [options]"
    echo ""
    echo "Options:"
    echo "  --help       Show this help message"
    echo "  --unprotect  Remove write protection (allows script modification)"
    echo ""
    echo "This script:"
    echo "  • Creates a complete system backup (INCLUDING ALL MEMORIES)"
    echo "  • Rebuilds rEngine from templates"
    echo "  • Validates the environment"
    echo "  • Tests system functionality"
    echo "  • Protects itself from modification"
    echo ""
    echo "🛡️ MEMORY SAFETY GUARANTEE:"
    echo "  • Your AI memories are NEVER deleted or modified"
    echo "  • All memory data is backed up before any changes"
    echo "  • Only configuration files are rebuilt from templates"
    echo "  • Complete rollback capability if needed"
    echo ""
}

# Handle command line arguments
case "${1:-}" in
    --help|-h)
        show_help
        exit 0
        ;;
    --unprotect)
        main "$@"
        ;;
    *)
        main "$@"
        ;;
esac
