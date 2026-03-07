# Backend Phase Branches Creation Script
# Creates feature branches for Phases 1-17

Write-Host "🚀 Creating Backend Phase Branches (Phase 1-17)" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Check if we're in a git repository
if (-not (Test-Path .git)) {
    Write-Host "❌ Error: Not a git repository. Please run this from the backend root directory." -ForegroundColor Red
    exit 1
}

# Get current branch
$currentBranch = git branch --show-current
Write-Host "📍 Current branch: $currentBranch" -ForegroundColor Yellow
Write-Host ""

# Ensure we're on develop branch
if ($currentBranch -ne "develop") {
    Write-Host "⚠️  Warning: You're not on 'develop' branch." -ForegroundColor Yellow
    $response = Read-Host "Do you want to switch to 'develop' branch? (y/n)"
    if ($response -eq 'y') {
        Write-Host "🔄 Switching to develop branch..." -ForegroundColor Cyan
        git checkout develop
        if ($LASTEXITCODE -ne 0) {
            Write-Host "❌ Failed to switch to develop branch" -ForegroundColor Red
            exit 1
        }
    } else {
        Write-Host "❌ Aborted. Please switch to develop branch manually." -ForegroundColor Red
        exit 1
    }
}

# Pull latest changes
Write-Host "📥 Pulling latest changes from develop..." -ForegroundColor Cyan
git pull origin develop
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Warning: Failed to pull from origin. Continuing anyway..." -ForegroundColor Yellow
}
Write-Host ""

# Define phases with their descriptions
# Note: Phases 7-12 already exist, script will skip them
$phases = @(
    @{Number=1; Name="foundation-core-infrastructure"; Description="Foundation & Core Infrastructure (IAM, BCMS, MongoDB, Audit)"},
    @{Number=2; Name="core-operations"; Description="Core Operations (Programs, Scheduling, Rules)"},
    @{Number=3; Name="customer-money"; Description="Customer & Money (CRM, Booking, Billing, Payments)"},
    @{Number=4; Name="automation"; Description="Automation (Event Bus, Automation Engine)"},
    @{Number=5; Name="staff-attendance"; Description="Staff & Attendance (Coach Management, Check-in)"},
    @{Number=6; Name="safety-compliance"; Description="Safety & Compliance (Drop-off Safety, Incident Management)"},
    @{Number=7; Name="progress-retention"; Description="Progress & Retention (Athlete Passport, Certifications, ROI, Gamification) [EXISTS]"},
    @{Number=8; Name="enterprise-expansion"; Description="Enterprise Expansion (Franchise, Partner Portal, Wallet) [EXISTS]"},
    @{Number=9; Name="optimization-engines"; Description="Optimization Engines (Capacity, Family Scheduler, Dynamic Pricing, Forecast) [EXISTS]"},
    @{Number=10; Name="community-knowledge"; Description="Community & Knowledge (Community Ecosystem, SOP Hub) [EXISTS]"},
    @{Number=11; Name="data-sovereignty"; Description="Data Sovereignty & Portability (Export Packs, Exit Protocol) [EXISTS]"},
    @{Number=12; Name="infrastructure"; Description="Infrastructure & Operations (Integration Gateway, Reporting, Observability) [EXISTS]"},
    @{Number=13; Name="ai-intelligence"; Description="AI & Intelligence (AI Coach, Nutrition, Virtual Training, Wearables)"},
    @{Number=14; Name="engagement-experience"; Description="Engagement & Experience (Parent Tools, Marketplace, Referral)"},
    @{Number=15; Name="global-scale"; Description="Global & Scale (Multi-language, White-Label SaaS, API Platform)"},
    @{Number=16; Name="search-discovery"; Description="Search & Discovery (Universal Search, Semantic Search & RAG)"},
    @{Number=17; Name="community-knowledge-advanced"; Description="Community & Knowledge Advanced (Enhanced Community, SOP Management)"}
)

Write-Host "📋 Creating $($phases.Count) feature branches..." -ForegroundColor Cyan
Write-Host ""

$successCount = 0
$failCount = 0
$skippedCount = 0

foreach ($phase in $phases) {
    $branchName = "feature/phase-$($phase.Number)-$($phase.Name)"
    
    Write-Host "[$($phase.Number)/$($phases.Count)] Creating: $branchName" -ForegroundColor White
    Write-Host "    Description: $($phase.Description)" -ForegroundColor Gray
    
    # Check if branch already exists locally
    $branchExists = git branch --list $branchName
    
    if ($branchExists) {
        Write-Host "    ⚠️  Branch already exists locally, skipping..." -ForegroundColor Yellow
        $skippedCount++
    } else {
        # Create branch from develop
        git checkout -b $branchName develop 2>$null
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "    ✅ Branch created successfully" -ForegroundColor Green
            
            # Push to remote
            Write-Host "    📤 Pushing to remote..." -ForegroundColor Cyan
            git push -u origin $branchName 2>$null
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "    ✅ Pushed to remote successfully" -ForegroundColor Green
                $successCount++
            } else {
                Write-Host "    ⚠️  Failed to push to remote (branch created locally)" -ForegroundColor Yellow
                $successCount++
            }
        } else {
            Write-Host "    ❌ Failed to create branch" -ForegroundColor Red
            $failCount++
        }
    }
    
    Write-Host ""
}

# Switch back to develop
Write-Host "🔄 Switching back to develop branch..." -ForegroundColor Cyan
git checkout develop

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "📊 Summary:" -ForegroundColor Cyan
Write-Host "   ✅ Successfully created: $successCount branches" -ForegroundColor Green
Write-Host "   ⚠️  Skipped (already exist): $skippedCount branches" -ForegroundColor Yellow
Write-Host "   ❌ Failed: $failCount branches" -ForegroundColor Red
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

if ($successCount -gt 0) {
    Write-Host "🎉 Branch creation completed!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📝 Next Steps:" -ForegroundColor Cyan
    Write-Host "   1. Verify branches on GitHub" -ForegroundColor White
    Write-Host "   2. Start implementing features in respective phase branches" -ForegroundColor White
    Write-Host "   3. Create Pull Requests to merge into develop when ready" -ForegroundColor White
    Write-Host ""
    Write-Host "💡 To switch to a phase branch:" -ForegroundColor Cyan
    Write-Host "   git checkout feature/phase-X-name" -ForegroundColor Gray
    Write-Host ""
    Write-Host "💡 To list all phase branches:" -ForegroundColor Cyan
    Write-Host "   git branch | grep 'feature/phase'" -ForegroundColor Gray
} else {
    Write-Host "⚠️  No new branches were created." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "✨ Done!" -ForegroundColor Green
