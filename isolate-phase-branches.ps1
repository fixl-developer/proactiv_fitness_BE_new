# Script to Isolate Phase-Specific Code in Each Branch
# This will remove other phase modules from each branch

Write-Host "Isolating Phase-Specific Code in Branches" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Define phase modules
$phaseModules = @{
    "feature/phase13-ai-intelligence" = @("ai-coach", "nutrition", "virtual-training", "wearables")
    "feature/phase14-engagement-experience" = @("parent-engagement", "marketplace", "referral")
    "feature/phase15-global-scale" = @("i18n", "saas", "api-platform")
    "feature/phase16-search-discovery" = @("search", "semantic-search")
    "feature/phase17-community-knowledge-advanced" = @("community", "knowledge-hub")
}

# All Phase 13-17 modules
$allNewModules = @(
    "ai-coach", "nutrition", "virtual-training", "wearables",
    "parent-engagement", "marketplace", "referral",
    "i18n", "saas", "api-platform",
    "search", "semantic-search",
    "community", "knowledge-hub"
)

Write-Host "This script will:" -ForegroundColor Yellow
Write-Host "  1. Keep only phase-specific modules in each branch" -ForegroundColor White
Write-Host "  2. Remove other Phase 13-17 modules" -ForegroundColor White
Write-Host "  3. Keep all Phase 1-12 modules (base code)" -ForegroundColor White
Write-Host ""

$response = Read-Host "Do you want to continue? (y/n)"
if ($response -ne "y") {
    Write-Host "Aborted" -ForegroundColor Red
    exit 0
}

Write-Host ""

foreach ($branch in $phaseModules.Keys) {
    Write-Host "Processing: $branch" -ForegroundColor Cyan
    
    # Checkout branch
    git checkout $branch 2>$null | Out-Null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  Failed to checkout branch" -ForegroundColor Red
        continue
    }
    
    # Get modules to keep for this phase
    $keepModules = $phaseModules[$branch]
    Write-Host "  Keeping modules: $($keepModules -join ', ')" -ForegroundColor Green
    
    # Get modules to remove (other Phase 13-17 modules)
    $removeModules = $allNewModules | Where-Object { $_ -notin $keepModules }
    
    if ($removeModules.Count -gt 0) {
        Write-Host "  Removing modules: $($removeModules -join ', ')" -ForegroundColor Yellow
        
        foreach ($module in $removeModules) {
            $modulePath = "src/modules/$module"
            if (Test-Path $modulePath) {
                git rm -r $modulePath 2>$null | Out-Null
                if ($LASTEXITCODE -eq 0) {
                    Write-Host "    - Removed $module" -ForegroundColor Gray
                }
            }
        }
        
        # Commit changes
        $commitMsg = "chore: isolate $($branch.Split('/')[-1]) modules only"
        git commit -m $commitMsg 2>$null | Out-Null
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  Committed changes" -ForegroundColor Green
            
            # Push to remote
            Write-Host "  Pushing to remote..." -ForegroundColor Cyan
            git push origin $branch --force 2>$null | Out-Null
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "  Pushed successfully" -ForegroundColor Green
            } else {
                Write-Host "  Failed to push" -ForegroundColor Red
            }
        } else {
            Write-Host "  No changes to commit" -ForegroundColor Yellow
        }
    } else {
        Write-Host "  No modules to remove" -ForegroundColor Yellow
    }
    
    Write-Host ""
}

# Return to develop
Write-Host "Returning to develop branch..." -ForegroundColor Cyan
git checkout develop 2>$null | Out-Null

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Phase Isolation Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Each branch now contains:" -ForegroundColor Cyan
Write-Host "  - All Phase 1-12 modules (base code)" -ForegroundColor White
Write-Host "  - Only its own phase modules" -ForegroundColor White
Write-Host ""
Write-Host "Example:" -ForegroundColor Yellow
Write-Host "  Phase 13 branch: Phase 1-12 + ai-coach, nutrition, virtual-training, wearables" -ForegroundColor Gray
Write-Host "  Phase 14 branch: Phase 1-12 + parent-engagement, marketplace, referral" -ForegroundColor Gray
Write-Host ""
Write-Host "Done!" -ForegroundColor Green
