$SUPABASE_URL = "https://pksquptfamittagmkozt.supabase.co"
$SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBrc3F1cHRmYW1pdHRhZ21rb3p0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjE0MTQzNiwiZXhwIjoyMDk3NzE3NDM2fQ.yaswVmsbWhKUev6Q-iYSt1tDXURSf53koak60XdaYeE"
$headers = @{ "apikey" = $SERVICE_KEY; "Authorization" = "Bearer $SERVICE_KEY"; "Content-Type" = "application/json" }

$ROOT_ID = "3a5c0dc1-5946-434b-bd5b-f0b05df08bb3"
$ROOT_REF = "CXL4FLZK"
$COUNT = 150

# Real-looking BSC wallet addresses (generated hex)
function New-Wallet {
    $hex = "0123456789abcdef"
    $chars = @()
    for ($i = 0; $i -lt 40; $i++) { $chars += $hex[(Get-Random -Maximum 16)] }
    return "0x" + ($chars -join "")
}

function New-RefCode {
    $chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    $code = "CXL"
    for ($i = 0; $i -lt 5; $i++) { $code += $chars[(Get-Random -Maximum $chars.Length)] }
    return $code
}

Write-Host "=== STEP 1: Creating 150 users under $ROOT_REF ==="

$wallets = @()
$refCodes = @()
$usedWallets = @{}
$usedRefs = @{}

for ($i = 0; $i -lt $COUNT; $i++) {
    do { $w = New-Wallet } while ($usedWallets[$w])
    $usedWallets[$w] = $true
    $wallets += $w
    
    do { $r = New-RefCode } while ($usedRefs[$r])
    $usedRefs[$r] = $true
    $refCodes += $r
}

Write-Host "Generated $($wallets.Count) unique wallets and $($refCodes.Count) referral codes"

# Insert users in batches of 20
$createdUsers = @()
$batchSize = 20
for ($i = 0; $i -lt $COUNT; $i += $batchSize) {
    $end = [Math]::Min($i + $batchSize, $COUNT)
    $batch = @()
    for ($j = $i; $j -lt $end; $j++) {
        $batch += @{
            wallet = $wallets[$j]
            referral_code = $refCodes[$j]
            sponsor_id = $ROOT_ID
            is_active = $true
            total_invested = 0
            total_earned = 0
            ascension_balance = 0
            directs = 0
            team_size = 0
        }
    }
    $body = $batch | ConvertTo-Json -Depth 5 -Compress
    try {
        $result = Invoke-RestMethod -Uri "$SUPABASE_URL/rest/v1/users" -Method POST -Body $body -Headers $headers
        $createdUsers += $result
        Write-Host "  Batch $([int]($i/$batchSize)+1): Created $($result.Count) users (total: $($createdUsers.Count))"
    } catch {
        Write-Host "  Batch error at $i : $_" -ForegroundColor Red
    }
    Start-Sleep -Milliseconds 200
}

# Fetch all created user IDs
Write-Host "`nFetching created user IDs..."
$allUsers = Invoke-RestMethod -Uri "$SUPABASE_URL/rest/v1/users?sponsor_id=eq.$ROOT_ID&select=id,referral_code,wallet&order=created_at.asc&limit=$COUNT" -Headers $headers
Write-Host "Found $($allUsers.Count) users under CXL4FLZK"

# === STEP 2: Place in matrix tree (BFS spillover) ===
Write-Host "`n=== STEP 2: Placing users in 2x11 matrix tree ==="

# First ensure root node exists
$rootNode = Invoke-RestMethod -Uri "$SUPABASE_URL/rest/v1/matrix_tree?user_id=eq.$ROOT_ID&owner_id=eq.$ROOT_ID&select=id" -Headers $headers
if ($rootNode.Count -eq 0) {
    $rootInsert = @{ user_id = $ROOT_ID; owner_id = $ROOT_ID; parent_id = $null; side = $null; level = 1; position = 1 } | ConvertTo-Json -Compress
    Invoke-RestMethod -Uri "$SUPABASE_URL/rest/v1/matrix_tree" -Method POST -Body $rootInsert -Headers $headers
    Write-Host "Created root node for CXL4FLZK"
}

# Fetch all existing nodes in the tree
function Get-AllNodes {
    return Invoke-RestMethod -Uri "$SUPABASE_URL/rest/v1/matrix_tree?owner_id=eq.$ROOT_ID&select=id,user_id,parent_id,side,level,position&order=level,position" -Headers $headers
}

$allNodes = Get-AllNodes
Write-Host "Current tree nodes: $($allNodes.Count)"

$placed = 0
foreach ($user in $allUsers) {
    # BFS to find first empty position
    $nodes = Get-AllNodes
    $foundPos = $null
    
    foreach ($node in $nodes) {
        if ($node.level -ge 11) { continue }
        $hasLeft = $nodes | Where-Object { $_.parent_id -eq $node.id -and $_.side -eq "left" }
        $hasRight = $nodes | Where-Object { $_.parent_id -eq $node.id -and $_.side -eq "right" }
        
        if (-not $hasLeft) {
            $foundPos = @{ parentNodeId = $node.id; side = "left"; level = $node.level + 1 }
            break
        }
        if (-not $hasRight) {
            $foundPos = @{ parentNodeId = $node.id; side = "right"; level = $node.level + 1 }
            break
        }
    }
    
    if (-not $foundPos) {
        Write-Host "  Tree full! Could not place $($user.referral_code)" -ForegroundColor Yellow
        continue
    }
    
    $nodeCount = ($nodes | Where-Object { $_.parent_id -eq $foundPos.parentNodeId -and $_.side -eq $foundPos.side }).Count
    $position = $nodes.Count + 1
    
    $insertData = @{
        user_id = $user.id
        owner_id = $ROOT_ID
        parent_id = $foundPos.parentNodeId
        side = $foundPos.side
        level = $foundPos.level
        position = $position
    } | ConvertTo-Json -Compress
    
    try {
        Invoke-RestMethod -Uri "$SUPABASE_URL/rest/v1/matrix_tree" -Method POST -Body $insertData -Headers $headers
        $placed++
        if ($placed % 25 -eq 0) {
            Write-Host "  Placed $placed/$COUNT users (last: L$($foundPos.level) $($foundPos.side))"
        }
    } catch {
        Write-Host "  Insert error for $($user.referral_code): $_" -ForegroundColor Red
    }
    Start-Sleep -Milliseconds 50
}

Write-Host "Matrix placement done: $placed users placed"

# === STEP 2b: Add to matrix_11 for unilevel chain ===
Write-Host "`n=== STEP 2b: Adding to matrix_11 (unilevel chain) ==="

$added11 = 0
foreach ($user in $allUsers) {
    # Each user is in sponsor chain: sponsor = ROOT, so level 1
    $m11Insert = @{
        user_id = $user.id
        sponsor_id = $ROOT_ID
        level = 1
        total_earnings = 0
    } | ConvertTo-Json -Compress
    
    try {
        Invoke-RestMethod -Uri "$SUPABASE_URL/rest/v1/matrix_11" -Method POST -Body $m11Insert -Headers $headers
        $added11++
    } catch {
        # May already exist
    }
    Start-Sleep -Milliseconds 30
}
Write-Host "Added $added11 entries to matrix_11"

# === STEP 3: Purchase Slot 1 (Spark $5) for all ===
Write-Host "`n=== STEP 3: Purchasing Slot 1 (Spark $5) for all users ==="

$purchased = 0
$poolContributions = @()

foreach ($user in $allUsers) {
    $slotData = @{
        user_id = $user.id
        slot_id = "orbit-1"
        slot_name = "Spark"
        slot_orbit = 1
        invested = 5
        earned = 0
        daily_earned = 0.15
        max_cap = 10
        progress = 0
        status = "active"
    } | ConvertTo-Json -Compress
    
    try {
        Invoke-RestMethod -Uri "$SUPABASE_URL/rest/v1/user_slots" -Method POST -Body $slotData -Headers $headers
        $purchased++
        
        # Transaction
        $txData = @{
            user_id = $user.id
            type = "slot_purchase"
            amount = 5
            status = "completed"
            description = "Purchased Spark slot"
        } | ConvertTo-Json -Compress
        Invoke-RestMethod -Uri "$SUPABASE_URL/rest/v1/transactions" -Method POST -Body $txData -Headers $headers
        
        # Update user
        $patchBody = '{"total_invested": 5, "is_active": true}'
        Invoke-RestMethod -Uri "$SUPABASE_URL/rest/v1/users?id=eq.$($user.id)" -Method PATCH -Body $patchBody -Headers $headers
        
        # Apex pool contribution (10% of $5 = $0.50)
        $poolData = @{
            block_number = 0
            value = 0.50
            completed = $false
            distributed = $false
        } | ConvertTo-Json -Compress
        Invoke-RestMethod -Uri "$SUPABASE_URL/rest/v1/apex_pool_blocks" -Method POST -Body $poolData -Headers $headers
        
        if ($purchased % 25 -eq 0) {
            Write-Host "  Purchased $purchased/$COUNT slots"
        }
    } catch {
        Write-Host "  Slot error for $($user.referral_code): $_" -ForegroundColor Red
    }
    Start-Sleep -Milliseconds 50
}

Write-Host "Slot purchase done: $purchased users"

# === STEP 4: Update team sizes ===
Write-Host "`n=== STEP 4: Updating team sizes ==="
$treeNodes = Get-AllNodes
$treeCount = $treeNodes.Count
$directsCount = ($allUsers.Count)

# Update ROOT user
$updateData = @{
    directs = $directsCount
    team_size = [Math]::Max(0, $treeCount - 1)
} | ConvertTo-Json -Compress
Invoke-RestMethod -Uri "$SUPABASE_URL/rest/v1/users?id=eq.$ROOT_ID" -Method PATCH -Body $updateData -Headers $headers
Write-Host "Updated CXL4FLZK: directs=$directsCount, team_size=$($treeCount-1)"

# === STEP 5: Verify ===
Write-Host "`n=== STEP 5: VERIFICATION ==="

# Matrix tree stats
$finalTree = Get-AllNodes
Write-Host "`nMatrix Tree:"
Write-Host "  Total nodes: $($finalTree.Count)"
for ($lvl = 1; $lvl -le 11; $lvl++) {
    $count = ($finalTree | Where-Object { $_.level -eq $lvl }).Count
    if ($count -gt 0) {
        Write-Host "  Level ${lvl}: $count nodes (max: $( [Math]::Pow(2, $lvl) ))"
    }
}

# Slots
$slots = Invoke-RestMethod -Uri "$SUPABASE_URL/rest/v1/user_slots?slot_id=eq.orbit-1&select=status&limit=200" -Headers $headers
Write-Host "`nSlot Stats:"
Write-Host "  Active Slot 1 purchases: $($slots.Count)"

# Pool
$pool = Invoke-RestMethod -Uri "$SUPABASE_URL/rest/v1/apex_pool_blocks?distributed=eq.false&select=value" -Headers $headers
$totalPool = ($pool | Measure-Object -Property value -Sum).Sum
Write-Host "`nApex Pool:"
Write-Host "  Pending fund: `$$($totalPool.ToString('F2'))"
$half = $totalPool / 2
Write-Host "  Champions (50%): `$$($half.ToString('F2'))"
Write-Host "  Community (50%): `$$($half.ToString('F2'))"

# Transactions
$txCount = Invoke-RestMethod -Uri "$SUPABASE_URL/rest/v1/transactions?select=id&limit=1000" -Headers $headers
Write-Host "`nTransactions: $($txCount.Count)"

# Root stats
$rootUser = Invoke-RestMethod -Uri "$SUPABASE_URL/rest/v1/users?id=eq.$ROOT_ID&select=directs,team_size,total_invested" -Headers $headers
Write-Host "`nRoot User (CXL4FLZK):"
Write-Host "  Directs: $($rootUser[0].directs)"
Write-Host "  Team Size: $($rootUser[0].team_size)"

Write-Host "`n=== ALL DONE ==="
