# PowerShell script to kill any running Next.js/node dev servers and start the webapp
# Usage: Right-click and 'Run with PowerShell' or run in terminal: ./run-webapp.ps1

# Kill node processes (Next.js dev servers)
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
Get-Process -Name npx -ErrorAction SilentlyContinue | Stop-Process -Force

# Optionally kill anything listening on port 3000
$connections = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue
foreach ($conn in $connections) {
    try { Stop-Process -Id $conn.OwningProcess -Force } catch {} 
}

# Start the Next.js dev server
cd "$PSScriptRoot"
npm run dev
