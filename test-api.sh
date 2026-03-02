#!/bin/bash

# Script untuk testing API dengan curl commands
# Jalankan dengan: bash test-api.sh

API_URL="http://localhost:5000/api"

echo "=========================================="
echo "Testing Lapangan Booking API"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function untuk test endpoint
test_endpoint() {
  local method=$1
  local endpoint=$2
  local data=$3
  local token=$4
  
  echo -e "${BLUE}Testing: $method $endpoint${NC}"
  
  if [ -z "$token" ]; then
    if [ "$method" = "GET" ]; then
      curl -X $method "$API_URL$endpoint" \
        -H "Content-Type: application/json"
    else
      curl -X $method "$API_URL$endpoint" \
        -H "Content-Type: application/json" \
        -d "$data"
    fi
  else
    if [ "$method" = "GET" ]; then
      curl -X $method "$API_URL$endpoint" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $token"
    else
      curl -X $method "$API_URL$endpoint" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $token" \
        -d "$data"
    fi
  fi
  
  echo -e "\n${GREEN}✓ Complete${NC}\n"
  echo "---"
  echo ""
}

# 1. Health Check
echo -e "${GREEN}1. Health Check${NC}"
test_endpoint "GET" "/health"

# 2. Register User
echo -e "${GREEN}2. Register User${NC}"
USER_DATA='{
  "nama": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "user"
}'
test_endpoint "POST" "/auth/register" "$USER_DATA"

# 3. Register Admin
echo -e "${GREEN}3. Register Admin${NC}"
ADMIN_DATA='{
  "nama": "Admin User",
  "email": "admin@example.com",
  "password": "admin123",
  "role": "admin"
}'
test_endpoint "POST" "/auth/register" "$ADMIN_DATA"

# 4. Login
echo -e "${GREEN}4. Login${NC}"
LOGIN_DATA='{
  "email": "john@example.com",
  "password": "password123"
}'
test_endpoint "POST" "/auth/login" "$LOGIN_DATA"

# 5. Get All Lapangan
echo -e "${GREEN}5. Get All Lapangan${NC}"
test_endpoint "GET" "/lapangan"

# 6. Check Availability
echo -e "${GREEN}6. Check Lapangan Availability${NC}"
test_endpoint "GET" "/lapangan/availability/check?tanggal=2024-01-15"

echo "=========================================="
echo "Testing completed!"
echo "=========================================="
echo ""
echo "Note:"
echo "- Replace token values with actual JWT tokens from login/register"
echo "- Replace IDs in requests with actual data from responses"
echo "- Some tests require valid token (see script for details)"
