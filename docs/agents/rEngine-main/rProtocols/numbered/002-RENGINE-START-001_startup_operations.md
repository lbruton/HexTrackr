# 002-RENGINE-START-001: rEngine Startup & Operations Protocol

**Protocol ID**: RENGINE-START-001  
**Version**: 1.0  
**Priority**: 2 (Execute after memory sync)  
**Status**: ACTIVE  
**Required**: YES  

## 🎯 **Purpose**

Core AI orchestration server startup/shutdown procedures. Docker-based system with health monitoring.

## 🚀 **Quick Start Commands**

```bash

# Start rEngine platform

docker-compose up rEngine

# Check health status

curl http://localhost:4034/health

# View logs  

docker logs rEngine

# Enhanced platform startup

./docker/rengine-manager.sh start enhanced
```

## 📋 **Protocol Steps**

### **Startup Sequence**

1. **Prerequisites Check**: Verify Docker and memory sync complete
2. **Start Services**: `docker-compose up rEngine` or enhanced mode
3. **Health Verification**: Confirm all endpoints responding
4. **Log Monitoring**: Check for startup errors

### **Health Monitoring**

1. **Primary Endpoint**: <http://localhost:4034/health>
2. **Secondary Services**: Ports 4035, 4036 for enhanced mode
3. **MCP Integration**: Verify MCP server connectivity
4. **Performance Check**: Response times and resource usage

### **Shutdown Procedure**

1. **Graceful Stop**: `docker-compose down`
2. **Data Persistence**: Ensure memory saved
3. **Log Archive**: Store important operational logs
4. **State Verification**: Confirm clean shutdown

## ⚠️ **Critical Requirements**

- **Memory sync must complete first** (Protocol 001)
- **Docker must be operational**
- **Health checks before proceeding** to other protocols
- **Monitor logs for errors**

## 🔗 **Related Protocols**

- **001-MEMORY-MGT-001**: Must complete first
- **003-SCRIBE-SYS-001**: Starts after rEngine operational
- **Enhanced Docker Setup**: See docker-compose-enhanced.yml

---
*Foundation protocol - required for all AI orchestration operations*
