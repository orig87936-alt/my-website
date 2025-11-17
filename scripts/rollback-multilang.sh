#!/bin/bash
# Rollback script for multi-language translation feature
# This script rolls back the database migration and restores the previous state

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

# Show current migration version
show_current_version() {
    log_info "Current migration version:"
    cd "$BACKEND_DIR"
    alembic current
}

# Rollback migration
rollback_migration() {
    log_info "Rolling back database migration..."
    
    cd "$BACKEND_DIR"
    
    # Show current version
    log_info "Current migration version:"
    alembic current
    
    # Rollback one version
    log_warning "Rolling back to previous migration..."
    alembic downgrade -1
    
    # Show new version
    log_info "New migration version:"
    alembic current
    
    log_success "Migration rollback completed"
}

# Verify rollback
verify_rollback() {
    log_info "Verifying rollback..."
    
    cd "$BACKEND_DIR"
    
    # Check if new columns are removed
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
    
    if len(columns) > 0:
        print(f"WARNING: Expected 0 zh-tw columns after rollback, found {len(columns)}")
        print("Rollback may not have completed successfully")
    else:
        print("✅ Rollback verification successful - all new columns removed")
EOF
    
    if [ $? -eq 0 ]; then
        log_success "Rollback verification passed"
    else
        log_warning "Rollback verification completed with warnings"
    fi
}

# Restore from backup
restore_from_backup() {
    log_info "Available backups:"
    
    BACKUP_DIR="$PROJECT_ROOT/backups"
    
    if [ ! -d "$BACKUP_DIR" ]; then
        log_error "Backup directory not found: $BACKUP_DIR"
        return 1
    fi
    
    # List backups
    BACKUPS=($(ls -t "$BACKUP_DIR"/db_backup_*.sql 2>/dev/null))
    
    if [ ${#BACKUPS[@]} -eq 0 ]; then
        log_error "No backups found in $BACKUP_DIR"
        return 1
    fi
    
    echo ""
    for i in "${!BACKUPS[@]}"; do
        BACKUP_FILE="${BACKUPS[$i]}"
        BACKUP_NAME=$(basename "$BACKUP_FILE")
        BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
        echo "  [$i] $BACKUP_NAME ($BACKUP_SIZE)"
    done
    echo ""
    
    read -p "Select backup to restore (0-$((${#BACKUPS[@]}-1))) or 'q' to skip: " BACKUP_INDEX
    
    if [ "$BACKUP_INDEX" = "q" ]; then
        log_info "Skipping backup restore"
        return 0
    fi
    
    if [ "$BACKUP_INDEX" -ge 0 ] && [ "$BACKUP_INDEX" -lt ${#BACKUPS[@]} ]; then
        SELECTED_BACKUP="${BACKUPS[$BACKUP_INDEX]}"
        log_warning "This will restore database from: $(basename "$SELECTED_BACKUP")"
        log_warning "ALL CURRENT DATA WILL BE LOST!"
        read -p "Are you sure? (yes/N): " CONFIRM
        
        if [ "$CONFIRM" = "yes" ]; then
            log_info "Restoring database from backup..."
            
            # Extract database connection details
            DB_USER=$(echo $DATABASE_URL | sed -n 's/.*:\/\/\([^:]*\):.*/\1/p')
            DB_HOST=$(echo $DATABASE_URL | sed -n 's/.*@\([^:]*\):.*/\1/p')
            DB_NAME=$(echo $DATABASE_URL | sed -n 's/.*\/\([^?]*\).*/\1/p')
            
            if command -v psql &> /dev/null; then
                psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" < "$SELECTED_BACKUP"
                log_success "Database restored from backup"
            else
                log_error "psql not found, cannot restore backup"
                return 1
            fi
        else
            log_info "Backup restore cancelled"
        fi
    else
        log_error "Invalid backup index"
        return 1
    fi
}

# Main rollback flow
main() {
    echo ""
    echo "========================================="
    echo "  Multi-Language Translation Rollback"
    echo "========================================="
    echo ""
    
    # Show current state
    show_current_version
    
    # Confirm rollback
    log_warning "This will rollback the multi-language translation feature"
    log_warning "The following changes will be reverted:"
    echo "  - 30 new columns will be removed from articles table"
    echo "  - title_zh_tw, title_ja, title_es, title_fr, title_ar, title_hi"
    echo "  - summary_zh_tw, summary_ja, summary_es, summary_fr, summary_ar, summary_hi"
    echo "  - lead_zh_tw, lead_ja, lead_es, lead_fr, lead_ar, lead_hi"
    echo "  - content_zh_tw, content_ja, content_es, content_fr, content_ar, content_hi"
    echo "  - image_caption_zh_tw, image_caption_ja, image_caption_es, image_caption_fr, image_caption_ar, image_caption_hi"
    echo ""
    
    read -p "Continue with rollback? (yes/N): " -r
    if [ "$REPLY" != "yes" ]; then
        log_error "Rollback cancelled"
        exit 1
    fi
    
    # Rollback steps
    rollback_migration
    verify_rollback
    
    # Ask about backup restore
    echo ""
    log_info "Do you want to restore from a backup?"
    read -p "Restore from backup? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        restore_from_backup
    fi
    
    # Success message
    echo ""
    echo "========================================="
    log_success "Rollback completed! ✅"
    echo "========================================="
    echo ""
    echo "Next steps:"
    echo "  1. Verify the application is running correctly"
    echo "  2. Check that old functionality still works"
    echo "  3. Monitor logs for any errors"
    echo ""
    echo "To re-apply the migration later, run:"
    echo "  cd backend && alembic upgrade head"
    echo ""
}

# Run main function
main

