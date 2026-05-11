#!/bin/bash

# Add :SiteCode parameter to SQL files that don't have it
for file in $(find . -name "*.sql" -exec grep -L ":SiteCode" {} \; | grep -v "variables.sql"); do
    echo "Processing: $file"
    
    # Create backup
    cp "$file" "$file.bak"
    
    # Add :SiteCode parameter to WHERE clauses
    # Pattern 1: WHERE condition AND condition
    sed -i.tmp 's/WHERE \([^;]*\)$/WHERE \1 AND (:SiteCode IS NULL OR ClinicID LIKE CONCAT(:SiteCode, '"'"'%'"'"'))/g' "$file"
    
    # Pattern 2: WHERE condition (without AND at the end)
    sed -i.tmp2 's/WHERE \([^;]*\) AND \([^;]*\)$/WHERE \1 AND \2 AND (:SiteCode IS NULL OR ClinicID LIKE CONCAT(:SiteCode, '"'"'%'"'"'))/g' "$file"
    
    # Clean up temp files
    rm -f "$file.tmp" "$file.tmp2"
    
    echo "Updated: $file"
done

echo "Done adding :SiteCode parameter to all SQL files"
