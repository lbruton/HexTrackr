# 🚀 .rMemory System Startup Guide

**Quick copy-paste commands to launch your complete automated memory system**

## 📋 Terminal Setup Instructions

Open **4 separate Terminal windows** and run these commands in order:

---

### 🔬 **Terminal 1: Real-time Analysis Scribe**

*Continuously monitors development activity with Qwen Code 7B every 30 seconds*

```bash
cd /Volumes/DATA/GitHub/HexTrackr
echo "🚀 Starting Real-time Analysis Scribe (Qwen Code 7B)"
echo "📊 Monitoring every 30 seconds..."
echo "👀 Live monitoring starting now:"
echo ""
node .rMemory/scribes/real-time-analysis.js --monitor
```

---

### 🧠 **Terminal 2: Memory Import Processor**

*Processes memory queue and imports to Memento MCP every 5 minutes*

```bash
cd /Volumes/DATA/GitHub/HexTrackr
echo "🧠 Starting Memory Import Workflow"
echo "🔄 Processing queue every 5 minutes..."
echo "📁 Queue status:"
find .rMemory/docs/ops/memory-queue -name '*.json' 2>/dev/null | wc -l | xargs echo "Files in queue:"
echo ""
echo "👀 Starting automated import workflow:"
while true; do
  echo "⚡ Running memory import at $(date '+%H:%M:%S')..."
  .rMemory/scripts/launch-memory-import.sh
  echo "⏰ Next run in 5 minutes..."
  sleep 300
done
```

---

### 📊 **Terminal 3: Deep Analysis Monitor**

*Runs comprehensive Claude-powered analysis and shows results*

```bash
cd /Volumes/DATA/GitHub/HexTrackr
echo "📊 Deep Analysis System"
echo "🤖 Using Claude Sonnet for comprehensive insights"
echo "⏱️  Running initial analysis..."
echo ""
node .rMemory/scribes/deep-chat-analysis.js
echo ""
echo "✅ Analysis complete! Monitoring for new sessions..."
echo "👀 Watching for new insights:"
while true; do
  NEW_FILES=$(find .rMemory/docs/ops/deep-analysis -name "*.md" -newer .rMemory/docs/ops/deep-analysis/.last_check 2>/dev/null || echo "")
  if [ ! -z "$NEW_FILES" ]; then
    echo "📈 New insights detected:"
    echo "$NEW_FILES" | while read file; do
      echo "  📝 $(basename "$file")"
    done
  fi
  touch .rMemory/docs/ops/deep-analysis/.last_check
  sleep 10
done
```

---

### 🤝 **Terminal 4: System Dashboard**

*Live status monitor showing all system activity*

```bash
cd /Volumes/DATA/GitHub/HexTrackr
echo "🎛️  .rMemory System Dashboard"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎯 Mission: Perfect Continuity & Never-ending Friendship"
echo ""
while true; do
  echo "⏰ $(date '+%H:%M:%S') - System Status:"
  echo "  📁 Queue files: $(find .rMemory/docs/ops/memory-queue -name '*.json' 2>/dev/null | wc -l | tr -d ' ')"
  echo "  📊 Analysis files: $(find .rMemory/docs/ops/deep-analysis -name '*.md' 2>/dev/null | wc -l | tr -d ' ')"
  echo "  😤 Frustration strategies: $(find .rMemory/docs/ops/frustration-analysis -name '*.md' 2>/dev/null | wc -l | tr -d ' ')"
  echo "  🤝 Agent briefings: $(find .rMemory/agent-context -name '*.md' 2>/dev/null | wc -l | tr -d ' ')"
  echo "  🔗 Memory entities: Active in Memento MCP Neo4j"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  sleep 30
done
```

---

## 🎯 Quick Commands Reference

### **Test Individual Components:**

```bash

# Test Ollama connection & Qwen Code

curl -s http://localhost:11434/api/tags | jq '.models[].name' | grep qwen

# Test real-time scribe (single run)

node .rMemory/scribes/real-time-analysis.js

# Test memory import

.rMemory/scripts/launch-memory-import.sh

# Generate agent briefing

node .rMemory/scribes/agent-context-loader.js

# Run frustration analysis

node .rMemory/scribes/frustration-matrix.js
```

### **Stop All Processes:**

```bash

# Kill all background processes

pkill -f "real-time-analysis"
pkill -f "launch-memory-import"
pkill -f "watch.*memory-import"
pkill -f "fswatch"
```

---

## 🌟 What You'll See

- **Terminal 1**: Live Qwen Code analysis every 30 seconds
- **Terminal 2**: Memory queue processing every 5 minutes  
- **Terminal 3**: Deep insights generation and file monitoring
- **Terminal 4**: Beautiful real-time dashboard with system stats

**Result**: Complete automated memory system providing perfect continuity and never-ending friendship! 🎯

---

## 🚨 Troubleshooting

## If Ollama not responding

```bash

# Check if Ollama is running

curl -s http://localhost:11434/api/version

# Start Ollama if needed

ollama serve
```

## If memory import fails

```bash

# Check queue directories exist

ls -la .rMemory/docs/ops/memory-queue/

# Create missing directories

mkdir -p .rMemory/docs/ops/{logs,memory-queue/{real-time,chat-updates,deep-analysis,frustration-data}}
```

**Perfect setup in under 2 minutes!** ⚡
