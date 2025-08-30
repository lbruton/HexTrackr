#!/bin/bash

# StackTrackr Project Audit - Multi-Agent Assessment
# Generates comprehensive project audit from all available LLMs

echo "🏗️  StackTrackr Project Audit"
echo "============================="
echo "Date: $(date)"
echo "Repository: StackTrackr"
echo "Branch: main"
echo ""

# Create output directory
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
AUDIT_DIR="/Volumes/DATA/GitHub/rEngine/rAgents/output/project-audit-$TIMESTAMP"
mkdir -p "$AUDIT_DIR"

# Load environment variables from rEngine
if [ -f "/Volumes/DATA/GitHub/rEngine/rEngine/.env" ]; then
    source "/Volumes/DATA/GitHub/rEngine/rEngine/.env"
    echo "✅ Loaded API keys from rEngine/.env"
else
    echo "⚠️  No API keys found - Ollama only mode"
fi

# Project audit prompt
AUDIT_PROMPT="You are conducting a comprehensive project audit of StackTrackr - a client-side inventory management application for collectibles. ANALYZE: 1) Architecture & Design Patterns - Code organization and modularity, JavaScript patterns and best practices, Client-side architecture effectiveness. 2) Code Quality & Maintainability - Code readability and documentation, Naming conventions and consistency, Technical debt and refactoring opportunities. 3) Performance & Optimization - JavaScript performance bottlenecks, DOM manipulation efficiency, Memory usage and potential leaks. 4) Security Assessment - Client-side security vulnerabilities, Data handling and storage security, Input validation and sanitization. 5) Testing & Reliability - Test coverage assessment, Error handling robustness, Edge case considerations. 6) Scalability & Future-Proofing - Extensibility for new features, Technology stack longevity, Migration and upgrade paths. 7) User Experience & Accessibility - Interface usability, Accessibility compliance, Cross-browser compatibility. 8) DevOps & Deployment - Build process efficiency, Deployment strategy, Monitoring and maintenance. Provide specific recommendations with file names and line numbers, severity levels (Critical, High, Medium, Low), implementation effort estimates, and priority rankings for fixes. Focus on actionable insights."

echo "📋 Audit Focus Areas:"
echo "   • Architecture & Design Patterns"
echo "   • Code Quality & Maintainability" 
echo "   • Performance & Optimization"
echo "   • Security Assessment"
echo "   • Testing & Reliability"
echo "   • Scalability & Future-Proofing"
echo "   • User Experience & Accessibility"
echo "   • DevOps & Deployment"
echo ""

# Function to audit with each LLM
audit_with_llm() {
    local provider=$1
    local model=$2
    local output_base="$AUDIT_DIR/${provider}_${model}"
    
    echo "🤖 Auditing with $provider ($model)..."
    local start_time=$(date +%s)
    
    case $provider in
        "ollama")
            echo "   📡 Connecting to Ollama..."
            # Escape the prompt for JSON
            ESCAPED_PROMPT=$(echo "$AUDIT_PROMPT" | sed 's/"/\\"/g' | tr '\n' ' ')
            curl -X POST http://localhost:11434/api/generate \
                -H "Content-Type: application/json" \
                -d "{
                    \"model\": \"$model\",
                    \"prompt\": \"$ESCAPED_PROMPT\",
                    \"stream\": false
                }" > "$output_base.json" 2>/dev/null
            
            if [ $? -eq 0 ]; then
                # Extract and format response
                jq -r '.response' "$output_base.json" > "$output_base.md" 2>/dev/null
                local end_time=$(date +%s)
                local duration=$((end_time - start_time))
                local word_count=$(wc -w < "$output_base.md" 2>/dev/null || echo "0")
                
                echo "   ✅ Completed in ${duration}s (${word_count} words)"
                
                # Create metadata
                echo "{
                    \"provider\": \"$provider\",
                    \"model\": \"$model\",
                    \"duration_seconds\": $duration,
                    \"word_count\": $word_count,
                    \"timestamp\": \"$(date -Iseconds)\",
                    \"status\": \"success\"
                }" > "$output_base.meta.json"
            else
                echo "   ❌ Failed to connect to Ollama"
                echo "Connection failed" > "$output_base.md"
                echo "{\"provider\": \"$provider\", \"model\": \"$model\", \"status\": \"failed\", \"error\": \"connection_failed\"}" > "$output_base.meta.json"
            fi
            ;;
            
        "openai")
            if [ -n "$OPENAI_API_KEY" ]; then
                echo "   📡 Connecting to OpenAI..."
                curl -X POST https://api.openai.com/v1/chat/completions \
                    -H "Content-Type: application/json" \
                    -H "Authorization: Bearer $OPENAI_API_KEY" \
                    -d "{
                        \"model\": \"$model\",
                        \"messages\": [{\"role\": \"user\", \"content\": \"$AUDIT_PROMPT\"}],
                        \"max_tokens\": 4000
                    }" > "$output_base.json" 2>/dev/null
                
                if [ $? -eq 0 ] && jq -e '.choices[0].message.content' "$output_base.json" >/dev/null 2>&1; then
                    jq -r '.choices[0].message.content' "$output_base.json" > "$output_base.md"
                    local end_time=$(date +%s)
                    local duration=$((end_time - start_time))
                    local word_count=$(wc -w < "$output_base.md" 2>/dev/null || echo "0")
                    
                    echo "   ✅ Completed in ${duration}s (${word_count} words)"
                    
                    echo "{
                        \"provider\": \"$provider\",
                        \"model\": \"$model\",
                        \"duration_seconds\": $duration,
                        \"word_count\": $word_count,
                        \"timestamp\": \"$(date -Iseconds)\",
                        \"status\": \"success\"
                    }" > "$output_base.meta.json"
                else
                    echo "   ❌ OpenAI API error"
                    echo "API error" > "$output_base.md"
                    echo "{\"provider\": \"$provider\", \"model\": \"$model\", \"status\": \"failed\", \"error\": \"api_error\"}" > "$output_base.meta.json"
                fi
            else
                echo "   ⚠️  Skipping OpenAI (no API key)"
                echo "No API key configured" > "$output_base.md"
                echo "{\"provider\": \"$provider\", \"model\": \"$model\", \"status\": \"skipped\", \"error\": \"no_api_key\"}" > "$output_base.meta.json"
            fi
            ;;
            
        "anthropic")
            if [ -n "$ANTHROPIC_API_KEY" ]; then
                echo "   📡 Connecting to Claude..."
                curl -X POST https://api.anthropic.com/v1/messages \
                    -H "Content-Type: application/json" \
                    -H "x-api-key: $ANTHROPIC_API_KEY" \
                    -H "anthropic-version: 2023-06-01" \
                    -d "{
                        \"model\": \"$model\",
                        \"max_tokens\": 4000,
                        \"messages\": [{\"role\": \"user\", \"content\": \"$AUDIT_PROMPT\"}]
                    }" > "$output_base.json" 2>/dev/null
                
                if [ $? -eq 0 ] && jq -e '.content[0].text' "$output_base.json" >/dev/null 2>&1; then
                    jq -r '.content[0].text' "$output_base.json" > "$output_base.md"
                    local end_time=$(date +%s)
                    local duration=$((end_time - start_time))
                    local word_count=$(wc -w < "$output_base.md" 2>/dev/null || echo "0")
                    
                    echo "   ✅ Completed in ${duration}s (${word_count} words)"
                    
                    echo "{
                        \"provider\": \"$provider\",
                        \"model\": \"$model\",
                        \"duration_seconds\": $duration,
                        \"word_count\": $word_count,
                        \"timestamp\": \"$(date -Iseconds)\",
                        \"status\": \"success\"
                    }" > "$output_base.meta.json"
                else
                    echo "   ❌ Claude API error"
                    echo "API error" > "$output_base.md"
                    echo "{\"provider\": \"$provider\", \"model\": \"$model\", \"status\": \"failed\", \"error\": \"api_error\"}" > "$output_base.meta.json"
                fi
            else
                echo "   ⚠️  Skipping Claude (no API key)"
                echo "No API key configured" > "$output_base.md"
                echo "{\"provider\": \"$provider\", \"model\": \"$model\", \"status\": \"skipped\", \"error\": \"no_api_key\"}" > "$output_base.meta.json"
            fi
            ;;
            
        "google")
            if [ -n "$GOOGLE_AI_API_KEY" ]; then
                echo "   📡 Connecting to Gemini..."
                curl -X POST "https://generativelanguage.googleapis.com/v1beta/models/$model:generateContent?key=$GOOGLE_AI_API_KEY" \
                    -H "Content-Type: application/json" \
                    -d "{
                        \"contents\": [{
                            \"parts\": [{\"text\": \"$AUDIT_PROMPT\"}]
                        }]
                    }" > "$output_base.json" 2>/dev/null
                
                if [ $? -eq 0 ] && jq -e '.candidates[0].content.parts[0].text' "$output_base.json" >/dev/null 2>&1; then
                    jq -r '.candidates[0].content.parts[0].text' "$output_base.json" > "$output_base.md"
                    local end_time=$(date +%s)
                    local duration=$((end_time - start_time))
                    local word_count=$(wc -w < "$output_base.md" 2>/dev/null || echo "0")
                    
                    echo "   ✅ Completed in ${duration}s (${word_count} words)"
                    
                    echo "{
                        \"provider\": \"$provider\",
                        \"model\": \"$model\",
                        \"duration_seconds\": $duration,
                        \"word_count\": $word_count,
                        \"timestamp\": \"$(date -Iseconds)\",
                        \"status\": \"success\"
                    }" > "$output_base.meta.json"
                else
                    echo "   ❌ Gemini API error"
                    echo "API error" > "$output_base.md"
                    echo "{\"provider\": \"$provider\", \"model\": \"$model\", \"status\": \"failed\", \"error\": \"api_error\"}" > "$output_base.meta.json"
                fi
            else
                echo "   ⚠️  Skipping Gemini (no API key)"
                echo "No API key configured" > "$output_base.md"
                echo "{\"provider\": \"$provider\", \"model\": \"$model\", \"status\": \"skipped\", \"error\": \"no_api_key\"}" > "$output_base.meta.json"
            fi
            ;;
    esac
    echo ""
}

# Run audits with all available models
echo "🚀 Starting multi-agent project audit..."
echo ""

# Ollama models (always try local first)
audit_with_llm "ollama" "qwen2.5:3b"
audit_with_llm "ollama" "gemma2:2b"
audit_with_llm "ollama" "qwen2:7b"
audit_with_llm "ollama" "llama3:8b"

# Cloud providers
audit_with_llm "openai" "gpt-4o-mini"
audit_with_llm "anthropic" "claude-3-5-sonnet-20241022"
audit_with_llm "google" "gemini-1.5-flash"

echo "📊 Generating consolidated reports..."

# Create consolidated markdown report
cat > "$AUDIT_DIR/CONSOLIDATED_AUDIT.md" << 'EOF'
# StackTrackr Project Audit Report

**Date:** $(date)  
**Repository:** StackTrackr  
**Branch:** main  
**Audit Type:** Multi-Agent Assessment  

## Executive Summary

This comprehensive audit was conducted by multiple AI agents to provide diverse perspectives on the StackTrackr project's architecture, code quality, security, performance, and maintainability.

## Methodology

The audit utilized the following AI models:
- **Ollama (Local):** qwen2.5:3b, gemma2:2b, qwen2:7b, llama3:8b
- **OpenAI:** gpt-4o-mini  
- **Anthropic:** claude-3-5-sonnet
- **Google:** gemini-1.5-flash

Each agent independently assessed the project across 8 key areas:
1. Architecture & Design Patterns
2. Code Quality & Maintainability
3. Performance & Optimization
4. Security Assessment
5. Testing & Reliability
6. Scalability & Future-Proofing
7. User Experience & Accessibility
8. DevOps & Deployment

---

EOF

# Add individual agent reports
for md_file in "$AUDIT_DIR"/*.md; do
    if [ -f "$md_file" ] && [ "$(basename "$md_file")" != "CONSOLIDATED_AUDIT.md" ]; then
        filename=$(basename "$md_file" .md)
        echo "## Agent Report: $filename" >> "$AUDIT_DIR/CONSOLIDATED_AUDIT.md"
        echo "" >> "$AUDIT_DIR/CONSOLIDATED_AUDIT.md"
        cat "$md_file" >> "$AUDIT_DIR/CONSOLIDATED_AUDIT.md"
        echo "" >> "$AUDIT_DIR/CONSOLIDATED_AUDIT.md"
        echo "---" >> "$AUDIT_DIR/CONSOLIDATED_AUDIT.md"
        echo "" >> "$AUDIT_DIR/CONSOLIDATED_AUDIT.md"
    fi
done

# Create consolidated JSON metadata
echo "📋 Creating machine-readable summary..."

# Collect all metadata
jq -s '.' "$AUDIT_DIR"/*.meta.json > "$AUDIT_DIR/audit_metadata.json" 2>/dev/null

# Create summary JSON
cat > "$AUDIT_DIR/audit_summary.json" << EOF
{
    "audit_info": {
        "timestamp": "$(date -Iseconds)",
        "repository": "StackTrackr",
        "branch": "main",
        "audit_type": "multi_agent_assessment",
        "output_directory": "$AUDIT_DIR"
    },
    "agents_used": $(jq -s '[.[] | {provider: .provider, model: .model, status: .status}]' "$AUDIT_DIR"/*.meta.json 2>/dev/null || echo "[]"),
    "performance_summary": $(jq -s '{
        total_agents: length,
        successful_audits: [.[] | select(.status == "success")] | length,
        failed_audits: [.[] | select(.status == "failed")] | length,
        skipped_audits: [.[] | select(.status == "skipped")] | length,
        total_words: [.[] | .word_count // 0] | add,
        average_duration: ([.[] | .duration_seconds // 0] | add) / length
    }' "$AUDIT_DIR"/*.meta.json 2>/dev/null || echo "{}")
}
EOF

echo "✅ Project audit complete!"
echo ""
echo "📁 Output Location: $AUDIT_DIR"
echo "📄 Consolidated Report: $AUDIT_DIR/CONSOLIDATED_AUDIT.md"
echo "📊 Machine Data: $AUDIT_DIR/audit_summary.json"
echo "🔍 Individual Reports: $AUDIT_DIR/*_*.md"
echo ""

# Show summary
if [ -f "$AUDIT_DIR/audit_summary.json" ]; then
    echo "📈 Audit Summary:"
    jq -r '
        "   Agents Used: " + (.performance_summary.total_agents // 0 | tostring) + 
        " (✅ " + (.performance_summary.successful_audits // 0 | tostring) + 
        " successful, ❌ " + (.performance_summary.failed_audits // 0 | tostring) + 
        " failed, ⚠️  " + (.performance_summary.skipped_audits // 0 | tostring) + " skipped)" +
        "\n   Total Words: " + (.performance_summary.total_words // 0 | tostring) +
        "\n   Avg Duration: " + ((.performance_summary.average_duration // 0) | floor | tostring) + "s"
    ' "$AUDIT_DIR/audit_summary.json" 2>/dev/null || echo "   Summary generation failed"
fi

echo ""
echo "🎯 Ready for review and action planning!"
