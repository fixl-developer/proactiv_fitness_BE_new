# Quick Script: Create Only New Module Branches (Phase 13-17)
# For users who already have Phase 1-12 branches

Write-Host "Creating New Module Branches (Phase 13-17)" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Check if we're in a git repository
if (-not (Test-Path .git)) {
    Write-Host "Error: Not a git repository" -ForegroundColor Red
    exit 1
}

# Get current branch
$currentBranch = git branch --show-current
Write-Host "Current branch: $currentBranch" -ForegroundColor Yellow
Write-Host ""

# Ensure we're on develop branch
if ($currentBranch -ne "develop") {
    Write-Host "Warning: Not on develop branch" -ForegroundColor Yellow
    $response = Read-Host "Switch to develop branch? (y/n)"
    if ($response -eq "y") {
        Write-Host "Switching to develop branch..." -ForegroundColor Cyan
        git checkout develop
        if ($LASTEXITCODE -ne 0) {
            Write-Host "Failed to switch to develop branch" -ForegroundColor Red
            exit 1
        }
    } else {
        Write-Host "Aborted" -ForegroundColor Red
        exit 1
    }
}

# Pull latest changes
Write-Host "Pulling latest changes from develop..." -ForegroundColor Cyan
git pull origin develop
if ($LASTEXITCODE -ne 0) {
    Write-Host "Warning: Failed to pull from origin" -ForegroundColor Yellow
}
Write-Host ""

# Define only new module phases (13-17)
$phases = @(
    @{Number=13; Name="ai-intelligence"; Description="AI and Intelligence"},
    @{Number=14; Name="engagement-experience"; Description="Engagement and Experience"},
    @{Number=15; Name="global-scale"; Description="Global and Scale"},
    @{Number=16; Name="search-discovery"; Description="Search and Discovery"},
    @{Number=17; Name="community-knowledge-advanced"; Description="Community and Knowledge Advanced"}
)

Write-Host "Creating $($phases.Count) new module branches..." -ForegroundColor Cyan
Write-Host ""

$successCount = 0
$failCount = 0
$skippedCount = 0

foreach ($phase in $phases) {
    $branchName = "feature/phase$($phase.Number)-$($phase.Name)"
    
    Write-Host "[$($phase.Number - 12)/5] Creating: $branchName" -ForegroundColor White
    Write-Host "    Description: $($phase.Description)" -ForegroundColor Gray
    
    # Check if branch already exists locally
    $branchExists = git branch --list $branchName
    
    if ($branchExists) {
        Write-Host "    Branch already exists, skipping..." -ForegroundColor Yellow
        $skippedCount++
    } else {
        # Create branch from develop
        git checkout -b $branchName develop 2>$null
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "    Branch created successfully" -ForegroundColor Green
            
            # Push to remote
            Write-Host "    Pushing to remote..." -ForegroundColor Cyan
            git push -u origin $branchName 2>$null
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "    Pushed to remote successfully" -ForegroundColor Green
                $successCount++
            } else {
                Write-Host "    Failed to push to remote" -ForegroundColor Yellow
                $successCount++
            }
        } else {
            Write-Host "    Failed to create branch" -ForegroundColor Red
            $failCount++
        }
    }
    
    Write-Host ""
}

# Switch back to develop
Write-Host "Switching back to develop branch..." -ForegroundColor Cyan
git checkout develop

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Summary:" -ForegroundColor Cyan
Write-Host "   Successfully created: $successCount branches" -ForegroundColor Green
Write-Host "   Skipped (already exist): $skippedCount branches" -ForegroundColor Yellow
Write-Host "   Failed: $failCount branches" -ForegroundColor Red
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

if ($successCount -gt 0) {
    Write-Host "New module branches created!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next Steps - Deploy Modules:" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Phase 13: AI and Intelligence" -ForegroundColor Yellow
    Write-Host "  git checkout feature/phase13-ai-intelligence" -ForegroundColor Gray
    Write-Host "  git add src/modules/ai-coach src/modules/nutrition src/modules/virtual-training src/modules/wearables" -ForegroundColor Gray
    Write-Host "  git commit -m `"feat(phase-13): add AI modules`"" -ForegroundColor Gray
    Write-Host "  git push origin feature/phase13-ai-intelligence" -ForegroundColor Gray
    Write-Host ""
} else {
    Write-Host "No new branches were created" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Done!" -ForegroundColor Green
