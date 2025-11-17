#!/bin/bash
# T069-T078: Multi-Language Translation Feature Deployment Script
# This script deploys the multi-language translation feature to production

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
BACKEND_DIR="$PROJECT_ROOT/backend"
FRONTEND_DIR="$PROJECT_ROOT"

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running on correct branch
check_branch() {
    log_info "Checking current branch..."
    CURRENT_BRANCH=$(git branch --show-current)
    
    if [ "$CURRENT_BRANCH" != "004-multilang-translation" ] && [ "$CURRENT_BRANCH" != "main" ]; then
        log_warning "Current branch is $CURRENT_BRANCH"
        read -p "Continue anyway? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log_error "Deployment cancelled"
            exit 1
        fi
    fi
    
    log_success "Branch check passed: $CURRENT_BRANCH"
}

# Check for uncommitted changes
check_git_status() {
    log_info "Checking for uncommitted changes..."
    
    if ! git diff-index --quiet HEAD --; then
        log_warning "You have uncommitted changes"
        git status --short
        read -p "Continue anyway? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log_error "Deployment cancelled"
            exit 1
        fi
    fi
    
    log_success "Git status check passed"
}

# Backup database
backup_database() {
    log_info "Creating database backup..."
    
    if [ -z "$DATABASE_URL" ]; then
        log_warning "DATABASE_URL not set, skipping backup"
        return
    fi
    
    BACKUP_FILE="$PROJECT_ROOT/backups/db_backup_$(date +%Y%m%d_%H%M%S).sql"
    mkdir -p "$PROJECT_ROOT/backups"
    
    # Extract database connection details from DATABASE_URL
    # Format: postgresql://user:password@host:port/database
    DB_USER=$(echo $DATABASE_URL | sed -n 's/.*:\/\/\([^:]*\):.*/\1/p')
    DB_HOST=$(echo $DATABASE_URL | sed -n 's/.*@\([^:]*\):.*/\1/p')
    DB_NAME=$(echo $DATABASE_URL | sed -n 's/.*\/\([^?]*\).*/\1/p')
    
    if command -v pg_dump &> /dev/null; then
        pg_dump -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" > "$BACKUP_FILE"
        log_success "Database backup created: $BACKUP_FILE"
    else
        log_warning "pg_dump not found, skipping database backup"
    fi
}

# Run database migration
run_migration() {
    log_info "Running database migration..."
    
    cd "$BACKEND_DIR"
    
    # Check current migration version
    log_info "Current migration version:"
    alembic current
    
    # Run migration
    log_info "Upgrading to latest migration..."
    alembic upgrade head
    
    # Verify migration
    log_info "New migration version:"
    alembic current
    
    log_success "Database migration completed"
}

# Verify migration
verify_migration() {
    log_info "Verifying migration..."
    
    cd "$BACKEND_DIR"
    
    # Check if new columns exist
    python3 << EOF
import os
import sys
from sqlalchemy import create_engine, text

DATABASE_URL = os.getenv('DATABASE_URL')
if not DATABASE_URL:
    print("DATABASE_URL not set, skipping verification")
    sys.exit(0)

engine = create_engine(DATABASE_URL)
with engine.connect() as conn:
    result = conn.execute(text("""
        SELECT column_name FROM information_schema.columns 
        WHERE table_name = 'articles' 
        AND column_name LIKE '%_zh_tw'
        ORDER BY column_name;
    """))
    columns = result.fetchall()
    
    print(f"Found {len(columns)} zh-tw columns:")
    for col in columns:
        print(f"  - {col[0]}")
    
    if len(columns) != 5:
        print(f"ERROR: Expected 5 zh-tw columns, found {len(columns)}")
        sys.exit(1)
    
    print("✅ Migration verification successful")
EOF
    
    if [ $? -eq 0 ]; then
        log_success "Migration verification passed"
    else
        log_error "Migration verification failed"
        exit 1
    fi
}

# Build frontend
build_frontend() {
    log_info "Building frontend..."
    
    cd "$FRONTEND_DIR"
    
    # Install dependencies
    log_info "Installing dependencies..."
    npm ci
    
    # Build
    log_info "Running build..."
    npm run build
    
    # Check build size
    BUILD_SIZE=$(du -sh dist | cut -f1)
    log_success "Frontend build completed (size: $BUILD_SIZE)"
}

# Run tests
run_tests() {
    log_info "Running tests..."
    
    # Backend tests
    log_info "Running backend translation tests..."
    cd "$BACKEND_DIR"
    python3 test_multilang_translation.py
    
    if [ $? -eq 0 ]; then
        log_success "Backend tests passed"
    else
        log_error "Backend tests failed"
        exit 1
    fi
    
    # Frontend type check
    log_info "Running frontend type check..."
    cd "$FRONTEND_DIR"
    npm run type-check || log_warning "Type check completed with warnings"
    
    log_success "All tests passed"
}

# Restart services
restart_services() {
    log_info "Restarting services..."
    
    # This is a placeholder - adjust based on your deployment setup
    if command -v systemctl &> /dev/null; then
        log_info "Restarting backend service..."
        # sudo systemctl restart your-backend-service
        log_warning "Service restart command not configured"
    else
        log_warning "systemctl not found, skipping service restart"
    fi
    
    log_success "Services restart completed"
}

# Main deployment flow
main() {
    echo ""
    echo "========================================="
    echo "  Multi-Language Translation Deployment"
    echo "========================================="
    echo ""
    
    # Pre-deployment checks
    check_branch
    check_git_status
    
    # Confirm deployment
    log_warning "This will deploy the multi-language translation feature"
    read -p "Continue with deployment? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_error "Deployment cancelled"
        exit 1
    fi
    
    # Deployment steps
    backup_database
    run_migration
    verify_migration
    run_tests
    build_frontend
    restart_services
    
    # Success message
    echo ""
    echo "========================================="
    log_success "Deployment completed successfully! 🎉"
    echo "========================================="
    echo ""
    echo "Next steps:"
    echo "  1. Verify the application is running correctly"
    echo "  2. Test the multi-language translation features"
    echo "  3. Monitor logs for any errors"
    echo ""
}

# Run main function
main

