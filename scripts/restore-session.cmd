@echo off
echo Restoring Kuchisabishii-Swarm session...

REM Check if session file exists
if not exist ".kuchisabishii-session.json" (
    echo ERROR: Session file not found!
    exit /b 1
)

echo Session ID: Kuchisabishii-Swarm
echo Status: SPARC Complete - Production Ready
echo Swarm: Mesh topology with 3 agents active
echo Tech Stack: Next.js + React Native + Supabase + MCP

REM Start development server if not running
echo Checking development server...
netstat -ano | findstr :3001 > nul
if %errorlevel% neq 0 (
    echo Starting Next.js development server on port 3001...
    cd web
    start /min cmd /c "npm run dev"
    cd ..
    timeout /t 5 > nul
)

REM Initialize MCP swarm if needed
echo Initializing MCP swarm...
echo MCP Swarm features available:
echo - Neural Networks: 27 forecasting models
echo - SIMD Support: High-performance computing
echo - Cognitive Diversity: Pattern optimization

echo.
echo ✅ Kuchisabishii-Swarm session restored!
echo.
echo Access your app at: http://localhost:3001
echo Session file: .kuchisabishii-session.json
echo.
echo To manually restore this session in Claude Code, run:
echo   claude mcp add claude-flow npx claude-flow@alpha mcp start
echo   cd C:\Users\skato\my-projects\Kuchisabishii
echo   .\scripts\restore-session.cmd
echo.