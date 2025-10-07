# =============================================================================
# Marketing CRM - Automated Setup Script (Windows PowerShell)
# =============================================================================
# This script automates the complete setup process for Marketing CRM
# =============================================================================

# Requires PowerShell 5.1 or higher
#Requires -Version 5.1

# Stop on errors
$ErrorActionPreference = "Stop"

# Colors
$ColorRed = "Red"
$ColorGreen = "Green"
$ColorYellow = "Yellow"
$ColorBlue = "Blue"
$ColorCyan = "Cyan"

# Functions
function Print-Header {
    param([string]$Message)
    Write-Host ""
    Write-Host "=============================================================================" -ForegroundColor Cyan
    Write-Host "  $Message" -ForegroundColor Cyan
    Write-Host "=============================================================================" -ForegroundColor Cyan
    Write-Host ""
}

function Print-Step {
    param([string]$Message)
    Write-Host "▶ $Message" -ForegroundColor Blue
}

function Print-Success {
    param([string]$Message)
    Write-Host "✓ $Message" -ForegroundColor Green
}

function Print-Error {
    param([string]$Message)
    Write-Host "✗ $Message" -ForegroundColor Red
}

function Print-Warning {
    param([string]$Message)
    Write-Host "⚠  $Message" -ForegroundColor Yellow
}

function Print-Info {
    param([string]$Message)
    Write-Host "→ $Message" -ForegroundColor Gray
}

function Exit-WithError {
    param([string]$Message)
    Print-Error $Message
    Write-Host ""
    Write-Host "Setup failed! Please check the error above and try again." -ForegroundColor Red
    Write-Host "For help, see SETUP.md or run: npm run setup:validate" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

function Test-CommandExists {
    param([string]$Command)
    $null = Get-Command $Command -ErrorAction SilentlyContinue
    return $?
}

# =============================================================================
# STEP 1: Check Prerequisites
# =============================================================================
function Step1-CheckPrerequisites {
    Print-Header "STEP 1: Checking Prerequisites"

    # Check Node.js
    Print-Step "Checking Node.js..."
    if (Test-CommandExists "node") {
        $nodeVersion = node --version
        Print-Success "Node.js installed: $nodeVersion"

        # Check if version is 20.x or higher
        $nodeMajor = [int]($nodeVersion -replace 'v(\d+)\..*', '$1')
        if ($nodeMajor -lt 20) {
            Print-Warning "Node.js version $nodeVersion is below recommended v20.x"
            Print-Info "Please upgrade: https://nodejs.org"
        }
    }
    else {
        Exit-WithError "Node.js is not installed. Please install from: https://nodejs.org"
    }

    # Check npm
    Print-Step "Checking npm..."
    if (Test-CommandExists "npm") {
        $npmVersion = npm --version
        Print-Success "npm installed: v$npmVersion"
    }
    else {
        Exit-WithError "npm is not installed. It should come with Node.js"
    }

    # Check Docker
    Print-Step "Checking Docker..."
    if (Test-CommandExists "docker") {
        $dockerVersion = docker --version
        Print-Success "Docker installed: $dockerVersion"
    }
    else {
        Exit-WithError "Docker is not installed. Please install from: https://docker.com"
    }

    # Check Docker Compose
    Print-Step "Checking Docker Compose..."
    try {
        $composeVersion = docker compose version 2>&1
        if ($LASTEXITCODE -eq 0) {
            Print-Success "Docker Compose installed: $composeVersion"
        }
        else {
            Exit-WithError "Docker Compose is not available"
        }
    }
    catch {
        Exit-WithError "Docker Compose is not installed or not available"
    }

    # Check if Docker is running
    Print-Step "Checking if Docker is running..."
    try {
        docker info 2>&1 | Out-Null
        if ($LASTEXITCODE -eq 0) {
            Print-Success "Docker daemon is running"
        }
        else {
            Exit-WithError "Docker daemon is not running. Please start Docker Desktop and try again"
        }
    }
    catch {
        Exit-WithError "Docker daemon is not running. Please start Docker Desktop and try again"
    }

    Write-Host ""
}

# =============================================================================
# STEP 2: Install Dependencies
# =============================================================================
function Step2-InstallDependencies {
    Print-Header "STEP 2: Installing Dependencies"

    Print-Step "Running npm install..."
    try {
        npm install
        if ($LASTEXITCODE -eq 0) {
            Print-Success "Dependencies installed successfully"
        }
        else {
            Exit-WithError "Failed to install dependencies"
        }
    }
    catch {
        Exit-WithError "Failed to install dependencies: $_"
    }

    Write-Host ""
}

# =============================================================================
# STEP 3: Configure Environment
# =============================================================================
function Step3-ConfigureEnvironment {
    Print-Header "STEP 3: Configuring Environment"

    if (Test-Path .env) {
        Print-Warning ".env file already exists"
        $overwrite = Read-Host "Do you want to overwrite it? (y/N)"
        if ($overwrite -notmatch '^[Yy]$') {
            Print-Info "Keeping existing .env file"
            Write-Host ""
            return
        }
    }

    Print-Step "Creating .env file from template..."
    try {
        Copy-Item .env.example .env -Force
        Print-Success ".env file created"
    }
    catch {
        Exit-WithError "Failed to create .env file: $_"
    }

    Print-Info "Environment variables configured:"
    Print-Info "  DATABASE_URL: mysql://crm_user:secret@localhost:3308/crm_single"
    Print-Info "  NEXTAUTH_URL: http://localhost:3000"
    Print-Warning "  NEXTAUTH_SECRET: Using default (change for production!)"

    Write-Host ""
}

# =============================================================================
# STEP 4: Start MySQL Container
# =============================================================================
function Step4-StartMySQL {
    Print-Header "STEP 4: Starting MySQL Database"

    # Check if container already exists
    $containerExists = docker ps -a --format "{{.Names}}" | Select-String -Pattern "^crm_mysql$"

    if ($containerExists) {
        Print-Warning "MySQL container already exists"

        # Check if it's running
        $containerRunning = docker ps --format "{{.Names}}" | Select-String -Pattern "^crm_mysql$"

        if ($containerRunning) {
            Print-Info "MySQL container is already running"
        }
        else {
            Print-Step "Starting existing MySQL container..."
            docker start crm_mysql
            Print-Success "MySQL container started"
        }
    }
    else {
        Print-Step "Creating and starting MySQL container..."
        try {
            docker compose up -d
            if ($LASTEXITCODE -eq 0) {
                Print-Success "MySQL container created and started"
            }
            else {
                Exit-WithError "Failed to start MySQL container"
            }
        }
        catch {
            Exit-WithError "Failed to start MySQL container: $_"
        }
    }

    # Wait for MySQL to be ready
    Print-Step "Waiting for MySQL to be ready..."
    Start-Sleep -Seconds 5

    # Test connection
    $maxRetries = 30
    $retry = 0
    $connected = $false

    while ($retry -lt $maxRetries) {
        try {
            docker exec crm_mysql mysql -u crm_user -psecret -e "SELECT 1" 2>&1 | Out-Null
            if ($LASTEXITCODE -eq 0) {
                Print-Success "MySQL is ready"
                $connected = $true
                break
            }
        }
        catch {
            # Continue waiting
        }

        $retry++
        Write-Host "." -NoNewline
        Start-Sleep -Seconds 1
    }

    if (-not $connected) {
        Exit-WithError "MySQL failed to start within 30 seconds"
    }

    Write-Host ""
}

# =============================================================================
# STEP 5: Database Migration
# =============================================================================
function Step5-RunMigration {
    Print-Header "STEP 5: Running Database Migration"

    Print-Step "Generating Prisma Client..."
    try {
        npx prisma generate
        if ($LASTEXITCODE -eq 0) {
            Print-Success "Prisma Client generated"
        }
        else {
            Exit-WithError "Failed to generate Prisma Client"
        }
    }
    catch {
        Exit-WithError "Failed to generate Prisma Client: $_"
    }

    Print-Step "Pushing database schema..."
    try {
        npx prisma db push --skip-generate
        if ($LASTEXITCODE -eq 0) {
            Print-Success "Database schema created"
        }
        else {
            Exit-WithError "Failed to push database schema"
        }
    }
    catch {
        Exit-WithError "Failed to push database schema: $_"
    }

    Write-Host ""
}

# =============================================================================
# STEP 6: Seed Data
# =============================================================================
function Step6-SeedData {
    Print-Header "STEP 6: Seeding Initial Data"

    Print-Step "Running seed script..."
    try {
        npm run seed:all
        if ($LASTEXITCODE -eq 0) {
            Print-Success "Database seeded successfully"
        }
        else {
            Exit-WithError "Failed to seed database"
        }
    }
    catch {
        Exit-WithError "Failed to seed database: $_"
    }

    Write-Host ""
}

# =============================================================================
# STEP 7: Validate Setup
# =============================================================================
function Step7-ValidateSetup {
    Print-Header "STEP 7: Validating Setup"

    Print-Step "Running validation checks..."
    try {
        npm run setup:validate
        if ($LASTEXITCODE -eq 0) {
            Print-Success "Setup validation passed"
        }
        else {
            Exit-WithError "Setup validation failed"
        }
    }
    catch {
        Exit-WithError "Setup validation failed: $_"
    }

    Write-Host ""
}

# =============================================================================
# STEP 8: Final Instructions
# =============================================================================
function Step8-ShowFinalInstructions {
    Print-Header "🎉 Setup Complete!"

    Write-Host "✓ Marketing CRM has been successfully set up!" -ForegroundColor Green
    Write-Host ""
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "📋 Default Credentials:" -ForegroundColor Yellow
    Write-Host "   → URL:      " -NoNewline; Write-Host "http://localhost:3000" -ForegroundColor Cyan
    Write-Host "   → Email:    " -NoNewline; Write-Host "admin@example.com" -ForegroundColor Cyan
    Write-Host "   → Password: " -NoNewline; Write-Host "password" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "🚀 Next Steps:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "   1. Start the development server:" -ForegroundColor Green
    Write-Host "      npm run dev" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "   2. Open your browser:" -ForegroundColor Green
    Write-Host "      http://localhost:3000" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "   3. Login with default credentials (see above)" -ForegroundColor Green
    Write-Host ""
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "📚 Useful Commands:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "   npm run dev              " -NoNewline; Write-Host "- Start development server" -ForegroundColor Gray
    Write-Host "   npm run build            " -NoNewline; Write-Host "- Build for production" -ForegroundColor Gray
    Write-Host "   npm run setup:validate   " -NoNewline; Write-Host "- Validate setup" -ForegroundColor Gray
    Write-Host "   npm run db:reset         " -NoNewline; Write-Host "- Reset database + re-seed" -ForegroundColor Gray
    Write-Host "   npx prisma studio        " -NoNewline; Write-Host "- Open database GUI" -ForegroundColor Gray
    Write-Host "   docker compose down      " -NoNewline; Write-Host "- Stop MySQL container" -ForegroundColor Gray
    Write-Host ""
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "📖 Documentation:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "   → Setup Guide:   " -NoNewline; Write-Host "SETUP.md" -ForegroundColor Cyan
    Write-Host "   → Project Docs:  " -NoNewline; Write-Host "CLAUDE.md" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Happy coding! 🚀" -ForegroundColor Green
    Write-Host ""
}

# =============================================================================
# Main Execution
# =============================================================================
function Main {
    Clear-Host

    Write-Host ""
    Write-Host "  ███╗   ███╗ █████╗ ██████╗ ██╗  ██╗███████╗████████╗██╗███╗   ██╗ ██████╗      ██████╗██████╗ ███╗   ███╗" -ForegroundColor Cyan
    Write-Host "  ████╗ ████║██╔══██╗██╔══██╗██║ ██╔╝██╔════╝╚══██╔══╝██║████╗  ██║██╔════╝     ██╔════╝██╔══██╗████╗ ████║" -ForegroundColor Cyan
    Write-Host "  ██╔████╔██║███████║██████╔╝█████╔╝ █████╗     ██║   ██║██╔██╗ ██║██║  ███╗    ██║     ██████╔╝██╔████╔██║" -ForegroundColor Cyan
    Write-Host "  ██║╚██╔╝██║██╔══██║██╔══██╗██╔═██╗ ██╔══╝     ██║   ██║██║╚██╗██║██║   ██║    ██║     ██╔══██╗██║╚██╔╝██║" -ForegroundColor Cyan
    Write-Host "  ██║ ╚═╝ ██║██║  ██║██║  ██║██║  ██╗███████╗   ██║   ██║██║ ╚████║╚██████╔╝    ╚██████╗██║  ██║██║ ╚═╝ ██║" -ForegroundColor Cyan
    Write-Host "  ╚═╝     ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝   ╚═╝   ╚═╝╚═╝  ╚═══╝ ╚═════╝      ╚═════╝╚═╝  ╚═╝╚═╝     ╚═╝" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "                               Automated Setup Script (Windows)" -ForegroundColor Cyan
    Write-Host ""

    Step1-CheckPrerequisites
    Step2-InstallDependencies
    Step3-ConfigureEnvironment
    Step4-StartMySQL
    Step5-RunMigration
    Step6-SeedData
    Step7-ValidateSetup
    Step8-ShowFinalInstructions
}

# Run main function
Main
