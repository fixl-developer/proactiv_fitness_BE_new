#!/bin/bash
# Final comprehensive admin CRUD test — v3 with all paths corrected

API="http://localhost:5000/api/v1"
T=$(curl -s -X POST -H "Content-Type: application/json" \
  -d '{"email":"admin@proactiv.com","password":"Admin@123456"}' \
  "$API/auth/login" | grep -oE '"accessToken":"[^"]+"' | head -1 | cut -d'"' -f4)
AUTH="Authorization: Bearer $T"
JSON="Content-Type: application/json"
RND=$((RANDOM % 1000000))

test_it() {
  local label="$1" path="$2" body="$3"
  local R=$(curl -s --max-time 12 -w "\n__CODE__%{http_code}" -X POST -H "$AUTH" -H "$JSON" -d "$body" "$API$path")
  local CODE=$(echo "$R" | grep __CODE__ | sed 's/.*__CODE__//')
  local MSG=$(echo "$R" | grep -v __CODE__ | head -c 180)
  printf "[%s] %-40s — %s\n" "$CODE" "$label" "$MSG"
}

echo "=== USERS ==="
test_it "Users (UPPERCASE role)" "/users" \
  "{\"email\":\"t${RND}@t.com\",\"password\":\"Test@12345\",\"firstName\":\"T\",\"lastName\":\"U\",\"phone\":\"+15551234567\",\"role\":\"COACH\"}"

echo ""
echo "=== BCMS ==="
test_it "Countries (2-char code + langs)" "/countries" \
  "{\"name\":\"Test${RND}\",\"code\":\"T${RND:0:1}\",\"languages\":[\"EN\"],\"currency\":\"USD\",\"timezone\":\"UTC\",\"isActive\":true}"
test_it "BusinessUnits (GYM)" "/business-units" \
  "{\"name\":\"BU${RND}\",\"code\":\"B${RND:0:3}\",\"type\":\"GYM\",\"countryId\":\"507f1f77bcf86cd799439011\",\"isActive\":true}"
test_it "Payment Gateway" "/payment-gateways" \
  "{\"name\":\"Gw${RND}\",\"provider\":\"stripe\",\"apiKey\":\"x\",\"isActive\":true}"

echo ""
echo "=== CMS (all admin endpoints - post validate-fix) ==="
test_it "CMS hero-slides" "/admin/cms/hero-slides" \
  "{\"title\":\"S${RND}\",\"image\":\"https://placehold.co/800\",\"order\":1,\"isActive\":true}"
test_it "CMS stats" "/admin/cms/stats" \
  "{\"label\":\"L${RND}\",\"value\":100,\"order\":1,\"isActive\":true}"
test_it "CMS services" "/admin/cms/services" \
  "{\"title\":\"Svc${RND}\",\"description\":\"d\",\"image\":\"https://placehold.co/400\",\"href\":\"/x\",\"order\":1,\"isActive\":true}"
test_it "CMS testimonials" "/admin/cms/testimonials" \
  "{\"name\":\"N${RND}\",\"role\":\"Parent\",\"rating\":5,\"text\":\"Excellent\",\"order\":1,\"isActive\":true}"
test_it "CMS partners" "/admin/cms/partners" \
  "{\"name\":\"P${RND}\",\"logo\":\"https://placehold.co/200\",\"order\":1,\"isActive\":true}"
test_it "CMS ai-features" "/admin/cms/ai-features" \
  "{\"title\":\"AI${RND}\",\"description\":\"d\",\"icon\":\"🤖\",\"order\":1,\"isActive\":true}"
test_it "CMS faqs" "/admin/cms/faqs" \
  "{\"question\":\"Q${RND}?\",\"answer\":\"A\",\"category\":\"general\",\"order\":1,\"isActive\":true}"

echo ""
echo "=== DONE ==="
