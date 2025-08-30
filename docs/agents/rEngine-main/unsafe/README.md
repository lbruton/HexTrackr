# ⚠️ UNSAFE UTILITIES DIRECTORY

## 🚨 WARNING: DANGEROUS SCRIPTS

This directory contains potentially destructive utilities that should only be used in specific circumstances with full understanding of their consequences.

## 📂 Contents

### `FULL_MEMORY_WIPE.sh` - Complete Memory Reset Utility

**Purpose**: Fresh rEngine installation for new user onboarding

**Use Case**: When setting up rEngine for a new person who doesn't want previous AI memories, conversations, or user data.

#### 🛡️ Safety Features

- **Non-executable by default** - Requires manual permission changes
- **Multiple confirmation prompts** - Must type exact phrases to proceed
- **Complete backup creation** - Everything is backed up before deletion
- **Unlock mechanism** - Must create unlock file first
- **Directory validation** - Ensures script is in correct location

#### 🗑️ What Gets Deleted

- **AI Memory Systems**: All conversations, learning, insights
- **User Data**: Projects, agent configurations, scribe history
- **System Logs**: All activity logs and history
- **External Storage**: Mobile app data (API keys cleared but not deleted)

#### ✅ What's Preserved

- **Configuration Files**: Docker Compose, VS Code settings
- **Scripts & Templates**: All system scripts and documentation
- **Infrastructure**: Core rEngine system intact

#### 🔓 How to Use

```bash

# 1. Unlock the script (safety mechanism)

touch ../.memory-wipe-unlocked

# 2. Make executable

chmod +x FULL_MEMORY_WIPE.sh

# 3. Run with extreme caution

./FULL_MEMORY_WIPE.sh
```

#### 📋 Confirmation Process

1. Must type: `DELETE ALL MEMORIES`
2. Must type: `I UNDERSTAND THIS IS PERMANENT`
3. Must type: `WIPE NOW`

#### 💾 Backup & Recovery

- Complete backup created before any deletion
- Backup location: `../backups/MEMORY_WIPE_BACKUP_[timestamp]/`
- Can be restored manually if needed
- Includes manifest of all backed-up items

#### 🔒 Post-Wipe Security

- Script automatically becomes non-executable again
- Unlock file is automatically removed
- Fresh API key template created (requires reconfiguration)

## ⚡ Quick Start After Wipe

```bash

# 1. Configure API keys

../setup-secure-api-keys.sh

# 2. Start fresh environment

cd ..
docker-compose -f docker-compose-enhanced.yml up -d

# 3. Verify fresh installation

# All services running with clean slate

```

## 🎯 Intended Workflow

1. **Existing User**: Uses normal rEngine with all memories intact
2. **New User Onboarding**: Run memory wipe for fresh start
3. **Fresh Environment**: New user gets clean rEngine with no previous data
4. **Backup Available**: Original data preserved if ever needed

## 🚨 Important Notes

- **This is irreversible** - Only the backup can restore data
- **API keys are cleared** - Will need reconfiguration
- **Fresh git state** - No impact on git repository
- **Complete reset** - Equivalent to fresh rEngine installation
- **Safety first** - Multiple safeguards prevent accidental execution

## 📞 Support

If you need to restore from backup or have issues:

1. Check backup directory for complete data dump
2. Restore individual directories as needed
3. Run master installer to rebuild configuration
4. Reconfigure API keys and test system

**Remember**: This tool is for intentional fresh starts, not regular maintenance! 🛡️
