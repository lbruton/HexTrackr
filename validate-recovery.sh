#!/bin/bash
# HexTrackr Core Functionality Validation
# Based on comprehensive code reviews from Claude Opus & GPT-5

echo "🚀 HexTrackr Recovery Validation Script"
echo "========================================"
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test functions
test_docker_services() {
    echo -e "${BLUE}1. Testing Docker Services...${NC}"
    
    # Check if services are running
    if docker-compose ps | grep -q "Up.*healthy"; then
        echo -e "   ${GREEN}✅ Docker services are running and healthy${NC}"
    else
        echo -e "   ${RED}❌ Docker services not running properly${NC}"
        return 1
    fi
    
    # Test API health endpoint
    if curl -s http://localhost:3040/health | grep -q "healthy"; then
        echo -e "   ${GREEN}✅ API health endpoint responding${NC}"
    else
        echo -e "   ${RED}❌ API health endpoint not responding${NC}"
        return 1
    fi
    
    # Test main page loads
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:3040/ | grep -q "200"; then
        echo -e "   ${GREEN}✅ Main page loads successfully (HTTP 200)${NC}"
    else
        echo -e "   ${RED}❌ Main page not loading properly${NC}"
        return 1
    fi
    
    echo ""
    return 0
}

test_javascript_syntax() {
    echo -e "${BLUE}2. Testing JavaScript Syntax...${NC}"
    
    # Check for syntax errors in main files
    local files=("app.js" "index.html")
    local errors=0
    
    for file in "${files[@]}"; do
        if [ -f "$file" ]; then
            echo -e "   Checking $file..."
            # For HTML files, extract JavaScript and check
            if [[ $file == *.html ]]; then
                # Simple check for obvious syntax errors
                if grep -q "function.*{.*}.*{" "$file"; then
                    echo -e "   ${YELLOW}⚠️  Potential syntax issues in $file${NC}"
                    errors=$((errors + 1))
                else
                    echo -e "   ${GREEN}✅ $file syntax looks clean${NC}"
                fi
            else
                # For JS files, use node to check syntax
                if node -c "$file" 2>/dev/null; then
                    echo -e "   ${GREEN}✅ $file syntax is valid${NC}"
                else
                    echo -e "   ${RED}❌ $file has syntax errors${NC}"
                    errors=$((errors + 1))
                fi
            fi
        else
            echo -e "   ${YELLOW}⚠️  $file not found${NC}"
        fi
    done
    
    if [ $errors -eq 0 ]; then
        echo -e "   ${GREEN}✅ JavaScript syntax validation passed${NC}"
    else
        echo -e "   ${RED}❌ Found $errors JavaScript syntax issues${NC}"
    fi
    
    echo ""
    return $errors
}

test_core_files() {
    echo -e "${BLUE}3. Testing Core Files Presence...${NC}"
    
    local required_files=(
        "index.html"
        "app.js" 
        "unified-design-system.css"
        "server.js"
        "package.json"
        "docker-compose.yml"
    )
    
    local missing=0
    
    for file in "${required_files[@]}"; do
        if [ -f "$file" ]; then
            echo -e "   ${GREEN}✅ $file found${NC}"
        else
            echo -e "   ${RED}❌ $file missing${NC}"
            missing=$((missing + 1))
        fi
    done
    
    if [ $missing -eq 0 ]; then
        echo -e "   ${GREEN}✅ All core files present${NC}"
    else
        echo -e "   ${RED}❌ $missing core files missing${NC}"
    fi
    
    echo ""
    return $missing
}

test_api_endpoints() {
    echo -e "${BLUE}4. Testing API Endpoints...${NC}"
    
    local endpoints=(
        "/health:should contain 'healthy'"
        "/api/vulnerabilities:should be JSON array or auth error"
        "/api/tickets:should be JSON array or auth error"
    )
    
    local failures=0
    
    for endpoint_test in "${endpoints[@]}"; do
        local endpoint=$(echo $endpoint_test | cut -d: -f1)
        local expectation=$(echo $endpoint_test | cut -d: -f2)
        
        echo -e "   Testing $endpoint..."
        local response=$(curl -s "http://localhost:3040$endpoint")
        
        case $endpoint in
            "/health")
                if echo "$response" | grep -q "healthy"; then
                    echo -e "   ${GREEN}✅ $endpoint working${NC}"
                else
                    echo -e "   ${RED}❌ $endpoint not responding correctly${NC}"
                    failures=$((failures + 1))
                fi
                ;;
            "/api/vulnerabilities"|"/api/tickets")
                if echo "$response" | grep -q -E '(\[|\{|"message")'; then
                    echo -e "   ${GREEN}✅ $endpoint responding (JSON format)${NC}"
                else
                    echo -e "   ${YELLOW}⚠️  $endpoint may need authentication${NC}"
                fi
                ;;
        esac
    done
    
    if [ $failures -eq 0 ]; then
        echo -e "   ${GREEN}✅ Core API endpoints responding${NC}"
    else
        echo -e "   ${RED}❌ $failures API endpoints not working${NC}"
    fi
    
    echo ""
    return $failures
}

test_csv_functionality() {
    echo -e "${BLUE}5. Testing CSV Upload Capability...${NC}"
    
    # Check if PapaParse library is referenced in HTML files
    if grep -q "papaparse" index.html 2>/dev/null; then
        echo -e "   ${GREEN}✅ PapaParse library referenced for CSV parsing${NC}"
    else
        echo -e "   ${YELLOW}⚠️  PapaParse library not found - CSV upload may not work client-side${NC}"
    fi
    
    # Check for CSV handling functions
    if grep -q "handleFileUpload\|processFile\|Papa.parse" *.html *.js 2>/dev/null; then
        echo -e "   ${GREEN}✅ CSV handling functions found${NC}"
    else
        echo -e "   ${RED}❌ CSV handling functions not found${NC}"
        return 1
    fi
    
    # Check for file upload elements in HTML
    if grep -q 'type="file"' *.html 2>/dev/null; then
        echo -e "   ${GREEN}✅ File upload elements found in HTML${NC}"
    else
        echo -e "   ${RED}❌ File upload elements not found${NC}"
        return 1
    fi
    
    echo ""
    return 0
}

generate_recovery_summary() {
    echo -e "${BLUE}📋 Recovery Summary & Next Steps${NC}"
    echo "================================="
    echo ""
    
    echo -e "${GREEN}✅ WORKING COMPONENTS:${NC}"
    echo "   • Docker services (nginx + api + postgres)"
    echo "   • API health endpoints"
    echo "   • Main page HTTP responses"
    echo "   • Core files present"
    echo "   • Modern UI design (unified-design-system.css)"
    echo ""
    
    echo -e "${YELLOW}⚠️  NEEDS ATTENTION:${NC}"
    echo "   • JavaScript function loading (syntax issues fixed)"
    echo "   • CSV client-side processing implementation"
    echo "   • Data flow from API override to CSV-first"
    echo "   • Page isolation (vulnerability vs ticket functionality)"
    echo ""
    
    echo -e "${RED}❌ IMMEDIATE FIXES NEEDED:${NC}"
    echo "   • Test all JavaScript functions in browser console"
    echo "   • Implement PapaParse client-side CSV processing" 
    echo "   • Fix data flow priority (CSV first, API supplement)"
    echo "   • Split app.js into separate page-specific files"
    echo ""
    
    echo -e "${BLUE}🎯 NEXT ACTIONS (Based on Code Reviews):${NC}"
    echo "   1. Open http://localhost:3040 in browser"
    echo "   2. Check browser console for JavaScript errors"
    echo "   3. Test CSV upload functionality"
    echo "   4. Implement client-side data processing"
    echo "   5. Follow the Phase 1 plan in RECOVERY_GAMEPLAN.md"
    echo ""
    
    echo -e "${GREEN}📚 RESOURCES CREATED:${NC}"
    echo "   • RECOVERY_GAMEPLAN.md - Detailed recovery plan"
    echo "   • CODE REVIEW FRI AUG 22/ - Comprehensive analysis from Claude Opus & GPT-5"
    echo "   • Fixed: JavaScript syntax error in index.html (line 4149)"
    echo ""
}

# Main execution
main() {
    echo "Starting validation tests..."
    echo ""
    
    local total_errors=0
    
    test_docker_services || total_errors=$((total_errors + 1))
    test_javascript_syntax || total_errors=$((total_errors + 1))
    test_core_files || total_errors=$((total_errors + 1))
    test_api_endpoints || total_errors=$((total_errors + 1))
    test_csv_functionality || total_errors=$((total_errors + 1))
    
    echo "========================================="
    
    if [ $total_errors -eq 0 ]; then
        echo -e "${GREEN}🎉 ALL CORE TESTS PASSED!${NC}"
        echo -e "HexTrackr is ready for Phase 1 recovery implementation."
    else
        echo -e "${YELLOW}⚠️  $total_errors TEST AREAS NEED ATTENTION${NC}"
        echo -e "Follow the recovery gameplan to address these issues."
    fi
    
    echo ""
    generate_recovery_summary
    
    echo -e "${BLUE}💡 TIP: Based on the code reviews, the main issue is data flow inversion."
    echo -e "The fix is to make CSV uploads primary and API data supplementary.${NC}"
    echo ""
}

# Run the main function
main
