#!/usr/bin/env bash

set -e

BASE_URL="http://localhost:4000"
EVENT_ID="5d4be570-4a6f-4f72-a444-a6f4cc929cf9"

# Load .env
set -a
source .env
set +a

EMAIL="$ADMIN_EMAIL"
PASSWORD="$ADMIN_PASSWORD"

echo "======================================"
echo "       CPSCL Alumni API Testing"
echo "======================================"

echo ""
echo "========== LOGIN =========="

LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$EMAIL\",
    \"password\": \"$PASSWORD\"
  }")

echo "$LOGIN_RESPONSE" | jq

TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.data.accessToken')

if [ -z "$TOKEN" ] || [ "$TOKEN" = "null" ]; then
  echo ""
  echo "❌ Login failed."
  echo "❌ Access token not found."
  exit 1
fi

echo ""
echo "✅ Login successful"
echo "✅ Access token received"

echo ""
echo "========== MISSING REQUIRED FIELDS =========="

curl -s -X POST "$BASE_URL/api/v1/events" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "description": "Testing validation"
  }' | jq

echo ""
echo "========== INVALID DATE RANGE =========="

curl -s -X POST "$BASE_URL/api/v1/events" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "Invalid Date Test",
    "slug": "invalid-date-test",
    "description": "Testing invalid event date range",
    "startsAt": "2026-12-20T16:00:00.000Z",
    "endsAt": "2026-12-20T10:00:00.000Z",
    "category": "reunion"
  }' | jq

echo ""
echo "========== DUPLICATE SLUG =========="

echo ""
echo "--- CREATE FIRST EVENT ---"

FIRST_EVENT_RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/events" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "CPSCL Test Event One",
    "slug": "cpscl-duplicate-test",
    "description": "First event for duplicate slug testing.",
    "startsAt": "2026-12-20T10:00:00.000Z",
    "endsAt": "2026-12-20T16:00:00.000Z",
    "category": "reunion"
  }')

echo "$FIRST_EVENT_RESPONSE" | jq

echo ""
echo "--- CREATE SECOND EVENT WITH SAME SLUG ---"

curl -s -X POST "$BASE_URL/api/v1/events" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "CPSCL Test Event Two",
    "slug": "cpscl-duplicate-test",
    "description": "Second event using the same slug.",
    "startsAt": "2026-12-21T10:00:00.000Z",
    "endsAt": "2026-12-21T16:00:00.000Z",
    "category": "reunion"
  }' | jq

echo ""
echo "========== GET ALL EVENTS =========="

curl -s "$BASE_URL/api/v1/events" \
  -H "Authorization: Bearer $TOKEN" | jq

echo ""
echo "========== GET ALL EVENTS =========="

curl -s "$BASE_URL/api/v1/events" \
  -H "Authorization: Bearer $TOKEN" | jq

echo ""
echo "========== GET SINGLE EVENT =========="

curl -s "$BASE_URL/api/v1/events/$EVENT_ID" \
  -H "Authorization: Bearer $TOKEN" | jq

echo ""
echo "========== UPDATE EVENT =========="

curl -s -X PATCH "$BASE_URL/api/v1/events/$EVENT_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "CPSCL Alumni Grand Reunion 2026",
    "description": "Annual grand reunion of CPSCL alumni.",
    "capacity": 300
  }' | jq
echo ""
echo "========== DELETE EVENT =========="

curl -s -X DELETE "$BASE_URL/api/v1/events/$EVENT_ID" \
  -H "Authorization: Bearer $TOKEN" | jq
echo ""
echo "======================================"
echo "       API TESTING COMPLETED"
echo "======================================"
