# 🔄 Kuchisabishii-Swarm Session Restoration

## Quick Restoration Command

To restore your **Kuchisabishii-Swarm** session after closing Claude Code:

```bash
# Navigate to project directory
cd C:\Users\skato\my-projects\Kuchisabishii

# Run restoration script
cmd /c "scripts\restore-session.cmd"
```

## Manual Restoration Steps

If you prefer manual restoration:

### 1. Setup MCP Connection
```bash
claude mcp add claude-flow npx claude-flow@alpha mcp start
```

### 2. Navigate to Project
```bash
cd C:\Users\skato\my-projects\Kuchisabishii
```

### 3. Start Development Server
```bash
cd web && npm run dev
```

### 4. Initialize MCP Swarm
```bash
# In Claude Code, run these MCP commands:
mcp__ruv-swarm__swarm_init topology=mesh maxAgents=3
mcp__ruv-swarm__features_detect category=all
```

## Session State Verification

Your session includes:
- ✅ **Session ID**: `Kuchisabishii-Swarm`
- ✅ **Project Phase**: SPARC-complete-deployment-ready  
- ✅ **Swarm**: Mesh topology with 3 agents
- ✅ **Server**: Running on http://localhost:3001
- ✅ **Tech Stack**: Next.js + React Native + Supabase + MCP

## Session Files
- **State File**: `.kuchisabishii-session.json`
- **Restore Script**: `scripts\restore-session.cmd`
- **This Guide**: `RESTORE_SESSION.md`

## Validation
To verify session restoration worked:
1. Check that http://localhost:3001 loads the Kuchisabishii app
2. Confirm MCP swarm features are available
3. Verify emotional rating demo is functional

---
*Session created: 2025-08-08 | SPARC methodology with MCP swarm coordination*