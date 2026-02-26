#──────────────────────────────────────────────────────────────
# deploy.ps1 — Deploy Flower Quiz to Azure Container Apps
#──────────────────────────────────────────────────────────────
# Prerequisites:
#   - Azure CLI (az) installed and logged in
#   - Docker installed and running
#
# Usage:
#   .\deploy.ps1
#
# Override defaults:
#   $env:RESOURCE_GROUP="mygroup"; .\deploy.ps1
#──────────────────────────────────────────────────────────────

$ErrorActionPreference = "Stop"

# ── Configuration ──
$ResourceGroup    = if ($env:RESOURCE_GROUP)    { $env:RESOURCE_GROUP }    else { "flower-quiz-rg" }
$Location         = if ($env:LOCATION)          { $env:LOCATION }          else { "westeurope" }
$Suffix           = Get-Date -Format "HHmmss"
$AcrName          = if ($env:ACR_NAME)          { $env:ACR_NAME }          else { "flowerquizacr$Suffix" }
$EnvironmentName  = if ($env:ENVIRONMENT_NAME)  { $env:ENVIRONMENT_NAME }  else { "flower-quiz-env" }
$BackendApp       = if ($env:BACKEND_APP)       { $env:BACKEND_APP }       else { "flower-backend" }
$FrontendApp      = if ($env:FRONTEND_APP)      { $env:FRONTEND_APP }      else { "flower-frontend" }

Write-Host ""
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host " Flower Quiz - Azure Container Apps    " -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host "Resource Group : $ResourceGroup"
Write-Host "Location       : $Location"
Write-Host "ACR            : $AcrName"
Write-Host ""

# ── 1. Create Resource Group ──
Write-Host ">> Creating resource group..." -ForegroundColor Yellow
az group create --name $ResourceGroup --location $Location --output none

# ── 2. Create Azure Container Registry ──
Write-Host ">> Creating container registry..." -ForegroundColor Yellow
az acr create --resource-group $ResourceGroup --name $AcrName --sku Basic --admin-enabled true --output none

$AcrLoginServer = az acr show --name $AcrName --query loginServer -o tsv
$AcrUsername = az acr credential show --name $AcrName --query username -o tsv
$AcrPassword = az acr credential show --name $AcrName --query "passwords[0].value" -o tsv

Write-Host "   Registry: $AcrLoginServer"

# ── 3. Build & Push Backend Image ──
Write-Host ">> Building and pushing backend image..." -ForegroundColor Yellow
az acr build --registry $AcrName --image flower-backend:latest --file backend/Dockerfile backend/

# ── 4. Create Container Apps Environment ──
Write-Host ">> Creating Container Apps environment..." -ForegroundColor Yellow
az containerapp env create --name $EnvironmentName --resource-group $ResourceGroup --location $Location --output none

# ── 5. Deploy Backend (external — simple for short-lived app) ──
Write-Host ">> Deploying backend container app..." -ForegroundColor Yellow

$EnvVars = @()
if (Test-Path "backend/.env") {
    Get-Content "backend/.env" | ForEach-Object {
        $line = $_.Trim()
        if ($line -and -not $line.StartsWith("#")) {
            $EnvVars += $line
        }
    }
}

az containerapp create `
    --name $BackendApp `
    --resource-group $ResourceGroup `
    --environment $EnvironmentName `
    --image "$AcrLoginServer/flower-backend:latest" `
    --registry-server $AcrLoginServer `
    --registry-username $AcrUsername `
    --registry-password $AcrPassword `
    --target-port 8000 `
    --ingress external `
    --min-replicas 1 `
    --max-replicas 1 `
    --env-vars $EnvVars `
    --output none

$BackendFqdn = az containerapp show --name $BackendApp --resource-group $ResourceGroup --query "properties.configuration.ingress.fqdn" -o tsv
Write-Host "   Backend URL: https://$BackendFqdn"

# ── 6. Build Frontend with backend URL baked in, then deploy ──
Write-Host ">> Building frontend with VITE_API_URL=https://$BackendFqdn ..." -ForegroundColor Yellow

# Write temporary .env for the Vite build
"VITE_API_URL=https://$BackendFqdn" | Out-File -FilePath "frontend/.env.production" -Encoding utf8

az acr build --registry $AcrName --image flower-frontend:latest --file frontend/Dockerfile frontend/

# Clean up temp env file
Remove-Item -Path "frontend/.env.production" -ErrorAction SilentlyContinue

Write-Host ">> Deploying frontend container app..." -ForegroundColor Yellow
az containerapp create `
    --name $FrontendApp `
    --resource-group $ResourceGroup `
    --environment $EnvironmentName `
    --image "$AcrLoginServer/flower-frontend:latest" `
    --registry-server $AcrLoginServer `
    --registry-username $AcrUsername `
    --registry-password $AcrPassword `
    --target-port 80 `
    --ingress external `
    --min-replicas 1 `
    --max-replicas 1 `
    --output none

$FrontendUrl = az containerapp show --name $FrontendApp --resource-group $ResourceGroup --query "properties.configuration.ingress.fqdn" -o tsv

Write-Host ""
Write-Host "=======================================" -ForegroundColor Green
Write-Host "        DEPLOYMENT COMPLETE            " -ForegroundColor Green
Write-Host "=======================================" -ForegroundColor Green
Write-Host "App URL: https://$FrontendUrl" -ForegroundColor Green
Write-Host ""
Write-Host "To tear down all resources when done:"
Write-Host "  az group delete --name $ResourceGroup --yes --no-wait"
