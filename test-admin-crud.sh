#!/bin/bash
# Admin CRUD smoke test — v2 with CORRECT paths & payloads matching backend
# Usage: bash test-admin-crud.sh

API="http://localhost:5000/api/v1"
EMAIL="admin@proactiv.com"
PASS="Admin@123456"

LOGIN_RESP=$(curl -s -X POST -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASS\"}" "$API/auth/login")
TOKEN=$(echo "$LOGIN_RESP" | grep -oE '"accessToken":"[^"]+"' | head -1 | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "LOGIN FAILED"; exit 1
fi
H_AUTH="Authorization: Bearer $TOKEN"
H_JSON="Content-Type: application/json"

test_create() {
  local label="$1" path="$2" body="$3"
  local resp code
  resp=$(curl -s -w "\n__CODE__%{http_code}" -X POST -H "$H_AUTH" -H "$H_JSON" \
    -d "$body" "$API$path")
  code=$(echo "$resp" | grep __CODE__ | sed 's/.*__CODE__//')
  local payload=$(echo "$resp" | grep -v __CODE__ | head -c 220)
  printf "[%s] %-48s — %s\n" "$code" "$label" "$payload"
}

RND=$((RANDOM % 1000000))

echo "=== USERS ==="
test_create "Users: create user (UPPERCASE role)" "/users" \
  "{\"email\":\"test${RND}@test.com\",\"password\":\"Test@12345\",\"firstName\":\"Test\",\"lastName\":\"User\",\"phone\":\"+15551234567\",\"role\":\"SUPPORT_STAFF\"}"

echo ""
echo "=== BUSINESS CONFIG ==="
test_create "Countries: create" "/countries" \
  "{\"name\":\"Testland${RND}\",\"code\":\"T${RND:0:2}\",\"languages\":[\"EN\"],\"currency\":\"USD\",\"timezone\":\"UTC\",\"isActive\":true}"
test_create "BusinessUnits: create (enum GYM)" "/business-units" \
  "{\"name\":\"TestBU${RND}\",\"code\":\"TB${RND:0:3}\",\"type\":\"GYM\",\"countryId\":\"507f1f77bcf86cd799439011\",\"isActive\":true}"
test_create "Payment Gateway" "/payment-gateways" \
  "{\"name\":\"Gateway${RND}\",\"provider\":\"stripe\",\"apiKey\":\"sk_test_xxx\",\"isActive\":true}"

echo ""
echo "=== CMS (correct path: /admin/cms) ==="
test_create "CMS Testimonials" "/admin/cms/testimonials" \
  "{\"name\":\"Jane Doe ${RND}\",\"role\":\"Parent\",\"rating\":5,\"text\":\"Excellent service for my children\",\"order\":1,\"isActive\":true}"
test_create "CMS Blog" "/admin/cms/blog-posts" \
  "{\"title\":\"Test Blog ${RND}\",\"slug\":\"test-blog-${RND}\",\"content\":\"Test content here\",\"author\":\"Admin\",\"category\":\"news\",\"isPublished\":true}"
test_create "CMS FAQs" "/admin/cms/faqs" \
  "{\"question\":\"Test q${RND}?\",\"answer\":\"Test answer\",\"category\":\"general\",\"order\":1,\"isActive\":true}"
test_create "CMS Hero Slide" "/admin/cms/hero-slides" \
  "{\"title\":\"Slide${RND}\",\"subtitle\":\"Test\",\"image\":\"https://placehold.co/800\",\"buttonText\":\"Go\",\"buttonLink\":\"/x\",\"order\":1,\"isActive\":true}"
test_create "CMS Services" "/admin/cms/services" \
  "{\"title\":\"Service${RND}\",\"description\":\"desc\",\"icon\":\"🏋️\",\"order\":1,\"isActive\":true}"
test_create "CMS Partners" "/admin/cms/partners" \
  "{\"name\":\"Partner${RND}\",\"logo\":\"https://placehold.co/200\",\"order\":1,\"isActive\":true}"

echo ""
echo "=== PROGRAMS ==="
test_create "Programs" "/programs" \
  "{\"name\":\"Prog${RND}\",\"shortDescription\":\"Short\",\"description\":\"Long description for a program\",\"programType\":\"REGULAR_CLASS\",\"category\":\"fitness\",\"businessUnitId\":\"507f1f77bcf86cd799439011\",\"locationIds\":[\"507f1f77bcf86cd799439012\"],\"ageGroup\":\"5-10\",\"duration\":60,\"price\":99,\"isActive\":true}"
test_create "Rules" "/rules" \
  "{\"name\":\"Rule${RND}\",\"category\":\"age\",\"conditions\":[{\"field\":\"student.age\",\"operator\":\"greater_than\",\"value\":\"3\"}],\"priority\":1,\"status\":\"active\",\"description\":\"Test\"}"

echo ""
echo "=== COMMUNICATIONS ==="
test_create "Notifications (admin path)" "/admin/notifications" \
  "{\"title\":\"Notif${RND}\",\"message\":\"Test\",\"type\":\"info\",\"recipients\":[\"all\"]}"
test_create "Notifications (direct)" "/notifications" \
  "{\"title\":\"Notif${RND}\",\"message\":\"Test\",\"type\":\"info\"}"
test_create "Notification Templates" "/notification-templates" \
  "{\"name\":\"Tpl${RND}\",\"subject\":\"S\",\"body\":\"B\",\"type\":\"email\"}"
test_create "CRM create family" "/crm/families" \
  "{\"name\":\"Family${RND}\",\"email\":\"f${RND}@test.com\",\"phone\":\"+15551234567\",\"status\":\"active\"}"

echo ""
echo "=== SUPPORT ==="
test_create "Support tickets" "/support/tickets" \
  "{\"title\":\"Ticket${RND}\",\"subject\":\"Ticket${RND}\",\"description\":\"Test desc\",\"priority\":\"medium\",\"status\":\"open\"}"
test_create "Knowledge base" "/support/knowledge" \
  "{\"title\":\"KB${RND}\",\"category\":\"faq\",\"content\":\"Test content\",\"isPublished\":true}"

echo ""
echo "=== SYSTEM ==="
test_create "Feature flag" "/feature-flags" \
  "{\"name\":\"flag-${RND}\",\"enabled\":true,\"description\":\"test\"}"
test_create "Integration gateway" "/integration-gateway/integrations" \
  "{\"name\":\"Int${RND}\",\"type\":\"payment\",\"url\":\"https://api.example.com\",\"apiKey\":\"x\",\"status\":\"active\"}"

echo ""
echo "=== BOOKINGS ==="
test_create "Bookings" "/bookings" \
  "{\"customerId\":\"507f1f77bcf86cd799439011\",\"programId\":\"507f1f77bcf86cd799439012\",\"scheduleId\":\"507f1f77bcf86cd799439013\",\"date\":\"2026-05-01\"}"

echo ""
echo "=== DONE ==="
