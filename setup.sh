#!/bin/bash

# =============================================================================
# Marketing CRM - Automated Setup Script (Linux/Mac)
# =============================================================================
# This script automates the complete setup process for Marketing CRM
# =============================================================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Icons
CHECKMARK="${GREEN}✓${NC}"
CROSS="${RED}✗${NC}"
ARROW="${BLUE}→${NC}"
ROCKET="${CYAN}🚀${NC}"

# Print functions
print_header() {
    echo ""
    echo -e "${CYAN}=============================================================================${NC}"
    echo -e "${CYAN}  $1${NC}"
    echo -e "${CYAN}=============================================================================${NC}"
    echo ""
}

print_step() {
    echo -e "${BLUE}▶${NC} $1"
}

print_success() {
    echo -e "${CHECKMARK} $1"
}

print_error() {
    echo -e "${CROSS} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC}  $1"
}

print_info() {
    echo -e "${ARROW} $1"
}

# Error handler
error_exit() {
    print_error "$1"
    echo ""
    echo -e "${RED}Setup failed! Please check the error above and try again.${NC}"
    echo -e "${YELLOW}For help, see SETUP.md or run: npm run setup:validate${NC}"
    echo ""
    exit 1
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# =============================================================================
# STEP 1: Check Prerequisites
# =============================================================================
check_prerequisites() {
    print_header "STEP 1: Checking Prerequisites"

    # Check Node.js
    print_step "Checking Node.js..."
    if command_exists node; then
        NODE_VERSION=$(node --version)
        print_success "Node.js installed: $NODE_VERSION"

        # Check if version is 20.x or higher
        NODE_MAJOR=$(echo "$NODE_VERSION" | cut -d'.' -f1 | sed 's/v//')
        if [ "$NODE_MAJOR" -lt 20 ]; then
            print_warning "Node.js version $NODE_VERSION is below recommended v20.x"
            print_info "Please upgrade: https://nodejs.org"
        fi
    else
        error_exit "Node.js is not installed. Please install from: https://nodejs.org"
    fi

    # Check npm
    print_step "Checking npm..."
    if command_exists npm; then
        NPM_VERSION=$(npm --version)
        print_success "npm installed: v$NPM_VERSION"
    else
        error_exit "npm is not installed. It should come with Node.js"
    fi

    # Check Docker
    print_step "Checking Docker..."
    if command_exists docker; then
        DOCKER_VERSION=$(docker --version)
        print_success "Docker installed: $DOCKER_VERSION"
    else
        error_exit "Docker is not installed. Please install from: https://docker.com"
    fi

    # Check Docker Compose
    print_step "Checking Docker Compose..."
    if docker compose version >/dev/null 2>&1; then
        COMPOSE_VERSION=$(docker compose version)
        print_success "Docker Compose installed: $COMPOSE_VERSION"
    else
        error_exit "Docker Compose is not installed or not available"
    fi

    # Check if Docker is running
    print_step "Checking if Docker is running..."
    if docker info >/dev/null 2>&1; then
        print_success "Docker daemon is running"
    else
        error_exit "Docker daemon is not running. Please start Docker and try again"
    fi

    echo ""
}

# =============================================================================
# STEP 2: Install Dependencies
# =============================================================================
install_dependencies() {
    print_header "STEP 2: Installing Dependencies"

    print_step "Running npm install..."
    if npm install; then
        print_success "Dependencies installed successfully"
    else
        error_exit "Failed to install dependencies"
    fi

    echo ""
}

# =============================================================================
# STEP 3: Configure Environment
# =============================================================================
configure_environment() {
    print_header "STEP 3: Configuring Environment"

    if [ -f .env ]; then
        print_warning ".env file already exists"
        echo -n "Do you want to overwrite it? (y/N): "
        read -r OVERWRITE
        if [[ ! $OVERWRITE =~ ^[Yy]$ ]]; then
            print_info "Keeping existing .env file"
            echo ""
            return
        fi
    fi

    print_step "Creating .env file from template..."
    if cp .env.example .env; then
        print_success ".env file created"
    else
        error_exit "Failed to create .env file"
    fi

    print_info "Environment variables configured:"
    print_info "  DATABASE_URL: mysql://crm_user:secret@localhost:3308/crm_single"
    print_info "  NEXTAUTH_URL: http://localhost:3000"
    print_warning "  NEXTAUTH_SECRET: Using default (change for production!)"

    echo ""
}

# =============================================================================
# STEP 4: Start MySQL Container
# =============================================================================
start_mysql() {
    print_header "STEP 4: Starting MySQL Database"

    # Check if container already exists
    if docker ps -a --format '{{.Names}}' | grep -q '^crm_mysql$'; then
        print_warning "MySQL container already exists"

        # Check if it's running
        if docker ps --format '{{.Names}}' | grep -q '^crm_mysql$'; then
            print_info "MySQL container is already running"
        else
            print_step "Starting existing MySQL container..."
            docker start crm_mysql
            print_success "MySQL container started"
        fi
    else
        print_step "Creating and starting MySQL container..."
        if docker compose up -d; then
            print_success "MySQL container created and started"
        else
            error_exit "Failed to start MySQL container"
        fi
    fi

    # Wait for MySQL to be ready
    print_step "Waiting for MySQL to be ready..."
    sleep 5

    # Test connection
    MAX_RETRIES=30
    RETRY=0
    while [ $RETRY -lt $MAX_RETRIES ]; do
        if docker exec crm_mysql mysql -u crm_user -psecret -e "SELECT 1" >/dev/null 2>&1; then
            print_success "MySQL is ready"
            break
        fi
        RETRY=$((RETRY + 1))
        echo -n "."
        sleep 1
    done

    if [ $RETRY -eq $MAX_RETRIES ]; then
        error_exit "MySQL failed to start within 30 seconds"
    fi

    echo ""
}

# =============================================================================
# STEP 5: Database Migration
# =============================================================================
run_migration() {
    print_header "STEP 5: Running Database Migration"

    print_step "Generating Prisma Client..."
    if npx prisma generate; then
        print_success "Prisma Client generated"
    else
        error_exit "Failed to generate Prisma Client"
    fi

    print_step "Pushing database schema..."
    if npx prisma db push --skip-generate; then
        print_success "Database schema created"
    else
        error_exit "Failed to push database schema"
    fi

    echo ""
}

# =============================================================================
# STEP 6: Seed Data
# =============================================================================
seed_data() {
    print_header "STEP 6: Seeding Initial Data"

    print_step "Running seed script..."
    if npm run seed:all; then
        print_success "Database seeded successfully"
    else
        error_exit "Failed to seed database"
    fi

    echo ""
}

# =============================================================================
# STEP 7: Validate Setup
# =============================================================================
validate_setup() {
    print_header "STEP 7: Validating Setup"

    print_step "Running validation checks..."
    if npm run setup:validate; then
        print_success "Setup validation passed"
    else
        error_exit "Setup validation failed"
    fi

    echo ""
}

# =============================================================================
# STEP 8: Final Instructions
# =============================================================================
show_final_instructions() {
    print_header "🎉 Setup Complete!"

    echo -e "${GREEN}✓ Marketing CRM has been successfully set up!${NC}"
    echo ""
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "${YELLOW}📋 Default Credentials:${NC}"
    echo -e "   ${ARROW} URL:      ${CYAN}http://localhost:3000${NC}"
    echo -e "   ${ARROW} Email:    ${CYAN}admin@example.com${NC}"
    echo -e "   ${ARROW} Password: ${CYAN}password${NC}"
    echo ""
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "${YELLOW}🚀 Next Steps:${NC}"
    echo ""
    echo -e "   ${GREEN}1.${NC} Start the development server:"
    echo -e "      ${CYAN}npm run dev${NC}"
    echo ""
    echo -e "   ${GREEN}2.${NC} Open your browser:"
    echo -e "      ${CYAN}http://localhost:3000${NC}"
    echo ""
    echo -e "   ${GREEN}3.${NC} Login with default credentials (see above)"
    echo ""
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "${YELLOW}📚 Useful Commands:${NC}"
    echo ""
    echo -e "   ${CYAN}npm run dev${NC}              - Start development server"
    echo -e "   ${CYAN}npm run build${NC}            - Build for production"
    echo -e "   ${CYAN}npm run setup:validate${NC}   - Validate setup"
    echo -e "   ${CYAN}npm run db:reset${NC}         - Reset database + re-seed"
    echo -e "   ${CYAN}npx prisma studio${NC}        - Open database GUI"
    echo -e "   ${CYAN}docker compose down${NC}      - Stop MySQL container"
    echo ""
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "${YELLOW}📖 Documentation:${NC}"
    echo ""
    echo -e "   ${ARROW} Setup Guide:   ${CYAN}SETUP.md${NC}"
    echo -e "   ${ARROW} Project Docs:  ${CYAN}CLAUDE.md${NC}"
    echo ""
    echo -e "${GREEN}Happy coding! 🚀${NC}"
    echo ""
}

# =============================================================================
# Main Execution
# =============================================================================
main() {
    clear

    echo ""
    echo -e "${CYAN}"
    echo "  ███╗   ███╗ █████╗ ██████╗ ██╗  ██╗███████╗████████╗██╗███╗   ██╗ ██████╗      ██████╗██████╗ ███╗   ███╗"
    echo "  ████╗ ████║██╔══██╗██╔══██╗██║ ██╔╝██╔════╝╚══██╔══╝██║████╗  ██║██╔════╝     ██╔════╝██╔══██╗████╗ ████║"
    echo "  ██╔████╔██║███████║██████╔╝█████╔╝ █████╗     ██║   ██║██╔██╗ ██║██║  ███╗    ██║     ██████╔╝██╔████╔██║"
    echo "  ██║╚██╔╝██║██╔══██║██╔══██╗██╔═██╗ ██╔══╝     ██║   ██║██║╚██╗██║██║   ██║    ██║     ██╔══██╗██║╚██╔╝██║"
    echo "  ██║ ╚═╝ ██║██║  ██║██║  ██║██║  ██╗███████╗   ██║   ██║██║ ╚████║╚██████╔╝    ╚██████╗██║  ██║██║ ╚═╝ ██║"
    echo "  ╚═╝     ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝   ╚═╝   ╚═╝╚═╝  ╚═══╝ ╚═════╝      ╚═════╝╚═╝  ╚═╝╚═╝     ╚═╝"
    echo -e "${NC}"
    echo -e "${CYAN}                               Automated Setup Script${NC}"
    echo ""

    check_prerequisites
    install_dependencies
    configure_environment
    start_mysql
    run_migration
    seed_data
    validate_setup
    show_final_instructions
}

# Run main function
main
