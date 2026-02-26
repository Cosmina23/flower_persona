#!/usr/bin/env bash
set -euo pipefail

#──────────────────────────────────────────────────────────────
# deploy.sh — Deploy Flower Quiz to Azure Container Apps
#──────────────────────────────────────────────────────────────
# Prerequisites:
#   - Azure CLI (az) installed and logged in
#   - Docker installed and running
#
# Usage:
#   chmod +x deploy.sh
#   ./deploy.sh
#
# Override defaults with environment variables:
#   RESOURCE_GROUP=mygroup LOCATION=westeurope ./deploy.sh
#──────────────────────────────────────────────────────────────

# ── Configuration (override via env vars) ──
RESOURCE_GROUP="${RESOURCE_GROUP:-flower-quiz-rg}"
LOCATION="${LOCATION:-westeurope}"
ACR_NAME="${ACR_NAME:-flowerquizacr$(date +%s | tail -c 6)}"
ENVIRONMENT_NAME="${ENVIRONMENT_NAME:-flower-quiz-env}"
BACKEND_APP="${BACKEND_APP:-flower-backend}"
FRONTEND_APP="${FRONTEND_APP:-flower-frontend}"

echo "╔═══════════════════════════════════════════════╗"
echo "║   Flower Quiz — Azure Container Apps Deploy   ║"
echo "╚═══════════════════════════════════════════════╝"
echo ""
echo "Resource Group : $RESOURCE_GROUP"
echo "Location       : $LOCATION"
echo "ACR            : $ACR_NAME"
echo ""

# ── 1. Create Resource Group ──
echo "▸ Creating resource group..."
az group create \
  --name "$RESOURCE_GROUP" \
  --location "$LOCATION" \
  --output none

# ── 2. Create Azure Container Registry ──
echo "▸ Creating container registry..."
az acr create \
  --resource-group "$RESOURCE_GROUP" \
  --name "$ACR_NAME" \
  --sku Basic \
  --admin-enabled true \
  --output none

ACR_LOGIN_SERVER=$(az acr show --name "$ACR_NAME" --query loginServer -o tsv)
ACR_USERNAME=$(az acr credential show --name "$ACR_NAME" --query username -o tsv)
ACR_PASSWORD=$(az acr credential show --name "$ACR_NAME" --query "passwords[0].value" -o tsv)

echo "  Registry: $ACR_LOGIN_SERVER"

# ── 3. Build & Push Backend Image ──
echo "▸ Building and pushing backend image..."
az acr build \
  --registry "$ACR_NAME" \
  --image flower-backend:latest \
  --file backend/Dockerfile \
  backend/

# ── 4. Create Container Apps Environment ──
echo "▸ Creating Container Apps environment..."
az containerapp env create \
  --name "$ENVIRONMENT_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --location "$LOCATION" \
  --output none

# ── 5. Deploy Backend (external — simple for short-lived app) ──
echo "▸ Deploying backend container app..."

# Read env vars from backend/.env (skip comments and empty lines)
ENV_VARS=""
if [ -f backend/.env ]; then
  while IFS='=' read -r key value; do
    [[ -z "$key" || "$key" == \#* ]] && continue
    value="${value%\"}"
    value="${value#\"}"
    ENV_VARS="$ENV_VARS $key=$value"
  done < backend/.env
fi

az containerapp create \
  --name "$BACKEND_APP" \
  --resource-group "$RESOURCE_GROUP" \
  --environment "$ENVIRONMENT_NAME" \
  --image "$ACR_LOGIN_SERVER/flower-backend:latest" \
  --registry-server "$ACR_LOGIN_SERVER" \
  --registry-username "$ACR_USERNAME" \
  --registry-password "$ACR_PASSWORD" \
  --target-port 8000 \
  --ingress external \
  --min-replicas 1 \
  --max-replicas 1 \
  --env-vars $ENV_VARS \
  --output none

BACKEND_FQDN=$(az containerapp show \
  --name "$BACKEND_APP" \
  --resource-group "$RESOURCE_GROUP" \
  --query "properties.configuration.ingress.fqdn" -o tsv)

echo "  Backend URL: https://$BACKEND_FQDN"

# ── 6. Build Frontend with backend URL baked in, then deploy ──
echo "▸ Building frontend image with VITE_API_URL=https://$BACKEND_FQDN ..."

# Write a temporary .env for the Vite build
echo "VITE_API_URL=https://$BACKEND_FQDN" > frontend/.env.production

az acr build \
  --registry "$ACR_NAME" \
  --image flower-frontend:latest \
  --file frontend/Dockerfile \
  frontend/

# Clean up temp env file
rm -f frontend/.env.production

echo "▸ Deploying frontend container app..."
az containerapp create \
  --name "$FRONTEND_APP" \
  --resource-group "$RESOURCE_GROUP" \
  --environment "$ENVIRONMENT_NAME" \
  --image "$ACR_LOGIN_SERVER/flower-frontend:latest" \
  --registry-server "$ACR_LOGIN_SERVER" \
  --registry-username "$ACR_USERNAME" \
  --registry-password "$ACR_PASSWORD" \
  --target-port 80 \
  --ingress external \
  --min-replicas 1 \
  --max-replicas 1 \
  --output none

FRONTEND_URL=$(az containerapp show \
  --name "$FRONTEND_APP" \
  --resource-group "$RESOURCE_GROUP" \
  --query "properties.configuration.ingress.fqdn" -o tsv)

echo ""
echo "╔═══════════════════════════════════════════════╗"
echo "║              DEPLOYMENT COMPLETE              ║"
echo "╠═══════════════════════════════════════════════╣"
echo "║  App URL: https://$FRONTEND_URL"
echo "╚═══════════════════════════════════════════════╝"
echo ""
echo "To tear down all resources when done:"
echo "  az group delete --name $RESOURCE_GROUP --yes --no-wait"
