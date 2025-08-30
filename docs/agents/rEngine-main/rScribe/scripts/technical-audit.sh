#!/bin/bash

# StackTrackr Deep Technical Audit - Enterprise-Grade Code Review
# Target: GPT-4, Claude 3.5 Sonnet, Gemini 1.5 Pro
# Scope: Complete technical breakdown, architectural analysis, security audit

PROJECT_ROOT="/Volumes/DATA/GitHub/rEngine"
BENCHMARK_DIR="$PROJECT_ROOT/benchmark_results"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
RESULTS_DIR="$BENCHMARK_DIR/technical_audit_$TIMESTAMP"

# Load API keys
if [ -f "$PROJECT_ROOT/rEngine/.env" ]; then
    source "$PROJECT_ROOT/rEngine/.env"
else
    echo "Error: API keys not found"
    exit 1
fi

mkdir -p "$RESULTS_DIR"

echo "🔬 Starting Enterprise Technical Audit - $(date)"
echo "📊 Target Models: GPT-4, Claude 3.5, Gemini 1.5 Pro"
echo "📁 Results: $RESULTS_DIR"

# Prepare comprehensive codebase analysis
TECHNICAL_PROMPT="You are a Senior Principal Software Architect conducting a comprehensive technical audit of the StackTrackr codebase. This is not a conceptual review - analyze the ACTUAL CODE in detail.

## AUDIT SCOPE:

### 1. JAVASCRIPT ARCHITECTURE ANALYSIS
- Analyze every .js file in the codebase
- Document all functions, classes, and modules
- Map variable scope and lifecycle
- Identify design patterns and anti-patterns
- Review module dependencies and coupling

### 2. CODE QUALITY ASSESSMENT
- Performance bottlenecks and optimization opportunities
- Memory leak potential and resource management
- Error handling completeness and robustness
- Code maintainability and technical debt
- Browser compatibility and modern JS usage

### 3. SECURITY AUDIT
- Client-side vulnerabilities (XSS, injection, etc.)
- Data validation and sanitization
- localStorage security implications
- API endpoint security (if any)
- Sensitive data exposure risks

### 4. ARCHITECTURAL EVALUATION
- Separation of concerns implementation
- Data flow and state management
- Event handling architecture
- Performance optimization strategies
- Scalability limitations and recommendations

### 5. TECHNICAL DOCUMENTATION
- Create architectural diagrams (ASCII/text format)
- Document data structures and schemas
- Map function call hierarchies
- Identify critical path operations
- Performance profiling analysis

## DELIVERABLES REQUIRED:

1. **Executive Technical Summary** (200 words max)
2. **Detailed Code Analysis** (by file)
3. **Architectural Diagrams** (ASCII format)
4. **Security Audit Report**
5. **Performance Analysis**
6. **Refactoring Recommendations**
7. **Technical Debt Assessment**
8. **Modernization Roadmap**

## CODE FILES TO ANALYZE:

Core Application Files:
- js/init.js - Application initialization
- js/inventory.js - Core inventory management
- js/api.js - API and data operations
- js/filters.js - Filtering system
- js/search.js - Search functionality
- js/sorting.js - Data sorting
- js/pagination.js - Table pagination
- js/charts.js - Chart.js integration
- js/utils.js - Utility functions
- js/events.js - Event handling
- js/theme.js - Theme management
- js/state.js - State management
- js/constants.js - Application constants

Support Files:
- js/autocomplete.js - Search autocomplete
- js/customMapping.js - Data mapping
- js/detailsModal.js - Modal management
- js/encryption.js - Client-side encryption
- js/spot.js - Spot price integration
- js/changeLog.js - Change tracking
- js/versionCheck.js - Version management
- js/debugModal.js - Debug interface

## ANALYSIS REQUIREMENTS:

For EACH JavaScript file, provide:
1. **Function Inventory**: All functions with parameters/returns
2. **Variable Analysis**: Scope, lifecycle, potential conflicts
3. **Performance Profile**: Computational complexity, memory usage
4. **Security Review**: Vulnerability assessment
5. **Code Quality Score**: 1-10 with specific justification
6. **Refactoring Priority**: Critical/High/Medium/Low with rationale

## ARCHITECTURAL DIAGRAMS NEEDED:

1. **Data Flow Diagram**: How data moves through the application
2. **Function Call Hierarchy**: Dependencies and call chains
3. **Event Flow Diagram**: User interactions and system responses
4. **Module Dependency Graph**: File/function interdependencies
5. **Performance Bottleneck Map**: Critical path analysis

## OUTPUT FORMAT:

Structure your response as a professional technical audit document with:
- Executive summary with overall grade (A-F)
- Individual file assessments
- ASCII architectural diagrams
- Specific code recommendations with line numbers
- Performance optimization priorities
- Security risk matrix
- Implementation timeline for improvements

Be thorough, technical, and specific. Reference actual code patterns, variable names, and implementation details. This audit will guide a major refactoring effort.

## CODEBASE CONTEXT:
StackTrackr is a client-side precious metals inventory management application using vanilla JavaScript, localStorage persistence, and Chart.js for visualization. The application manages inventory data with advanced filtering, search, and export capabilities."

# Function to make OpenAI API call
call_openai() {
    local model="$1"
    local max_tokens="$2"
    
    echo "🤖 Querying OpenAI $model..."
    
    response=$(curl -s -w "\nHTTP_STATUS:%{http_code}" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $OPENAI_API_KEY" \
        -d "{
            \"model\": \"$model\",
            \"messages\": [
                {
                    \"role\": \"user\",
                    \"content\": $(echo "$TECHNICAL_PROMPT" | jq -Rs .)
                }
            ],
            \"max_tokens\": $max_tokens,
            \"temperature\": 0.1
        }" \
        "https://api.openai.com/v1/chat/completions")
    
    http_status=$(echo "$response" | tail -n1 | cut -d':' -f2)
    content=$(echo "$response" | sed '$d')
    
    if [ "$http_status" = "200" ]; then
        echo "$content" | jq -r '.choices[0].message.content' > "$RESULTS_DIR/openai_${model}_technical_audit.md"
        echo "✅ OpenAI $model audit complete"
    else
        echo "❌ OpenAI $model failed: HTTP $http_status"
        echo "$content" > "$RESULTS_DIR/openai_${model}_error.log"
    fi
}

# Function to make Claude API call
call_claude() {
    local model="$1"
    local max_tokens="$2"
    
    echo "🤖 Querying Claude $model..."
    
    response=$(curl -s -w "\nHTTP_STATUS:%{http_code}" \
        -H "Content-Type: application/json" \
        -H "x-api-key: $CLAUDE_API_KEY" \
        -H "anthropic-version: 2023-06-01" \
        -d "{
            \"model\": \"$model\",
            \"max_tokens\": $max_tokens,
            \"temperature\": 0.1,
            \"messages\": [
                {
                    \"role\": \"user\",
                    \"content\": $(echo "$TECHNICAL_PROMPT" | jq -Rs .)
                }
            ]
        }" \
        "https://api.anthropic.com/v1/messages")
    
    http_status=$(echo "$response" | tail -n1 | cut -d':' -f2)
    content=$(echo "$response" | sed '$d')
    
    if [ "$http_status" = "200" ]; then
        echo "$content" | jq -r '.content[0].text' > "$RESULTS_DIR/claude_${model}_technical_audit.md"
        echo "✅ Claude $model audit complete"
    else
        echo "❌ Claude $model failed: HTTP $http_status"
        echo "$content" > "$RESULTS_DIR/claude_${model}_error.log"
    fi
}

# Function to make Gemini API call
call_gemini() {
    local model="$1"
    local max_tokens="$2"
    
    echo "🤖 Querying Gemini $model..."
    
    response=$(curl -s -w "\nHTTP_STATUS:%{http_code}" \
        -H "Content-Type: application/json" \
        -d "{
            \"contents\": [
                {
                    \"parts\": [
                        {
                            \"text\": $(echo "$TECHNICAL_PROMPT" | jq -Rs .)
                        }
                    ]
                }
            ],
            \"generationConfig\": {
                \"maxOutputTokens\": $max_tokens,
                \"temperature\": 0.1
            }
        }" \
        "https://generativelanguage.googleapis.com/v1beta/models/$model:generateContent?key=$GEMINI_API_KEY")
    
    http_status=$(echo "$response" | tail -n1 | cut -d':' -f2)
    content=$(echo "$response" | sed '$d')
    
    if [ "$http_status" = "200" ]; then
        echo "$content" | jq -r '.candidates[0].content.parts[0].text' > "$RESULTS_DIR/gemini_${model}_technical_audit.md"
        echo "✅ Gemini $model audit complete"
    else
        echo "❌ Gemini $model failed: HTTP $http_status"
        echo "$content" > "$RESULTS_DIR/gemini_${model}_error.log"
    fi
}

# Execute technical audits with high token limits for detailed analysis
echo "🚀 Starting comprehensive technical audits..."

# OpenAI Models
call_openai "gpt-4o" 4000 &
call_openai "gpt-4-turbo" 4000 &

# Claude Models  
call_claude "claude-3-5-sonnet-20241022" 4000 &

# Gemini Models
call_gemini "gemini-1.5-pro" 4000 &

# Wait for all API calls to complete
wait

echo "⏱️  All technical audits completed at $(date)"

# Generate summary report
echo "📊 Generating Technical Audit Summary..."

cat > "$RESULTS_DIR/audit_summary.md" << EOF
# StackTrackr Enterprise Technical Audit Summary

**Audit Date:** $(date)
**Audit Scope:** Complete JavaScript codebase analysis
**Models Used:** GPT-4o, GPT-4-Turbo, Claude 3.5 Sonnet, Gemini 1.5 Pro

## Audit Results

### GPT-4o Technical Audit
$(if [ -f "$RESULTS_DIR/openai_gpt-4o_technical_audit.md" ]; then echo "✅ Complete"; else echo "❌ Failed"; fi)

### GPT-4-Turbo Technical Audit  
$(if [ -f "$RESULTS_DIR/openai_gpt-4-turbo_technical_audit.md" ]; then echo "✅ Complete"; else echo "❌ Failed"; fi)

### Claude 3.5 Sonnet Technical Audit
$(if [ -f "$RESULTS_DIR/claude_claude-3-5-sonnet-20241022_technical_audit.md" ]; then echo "✅ Complete"; else echo "❌ Failed"; fi)

### Gemini 1.5 Pro Technical Audit
$(if [ -f "$RESULTS_DIR/gemini_gemini-1.5-pro_technical_audit.md" ]; then echo "✅ Complete"; else echo "❌ Failed"; fi)

## Next Steps
1. Review individual audit reports
2. Prioritize critical issues identified by multiple models
3. Create implementation roadmap for improvements
4. Schedule follow-up technical review

EOF

echo "📁 Technical audit results available in: $RESULTS_DIR"
echo "📋 Summary report: $RESULTS_DIR/audit_summary.md"
echo "🔍 Individual audit files:"
ls -la "$RESULTS_DIR"/*.md 2>/dev/null || echo "No audit files generated"

echo "✅ Enterprise Technical Audit Complete!"
