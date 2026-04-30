#!/bin/bash
# Final end-to-end CRUD verification — creates real entities in order,
# chains IDs so Staff/Location/Program have valid references.

API="http://localhost:5000/api/v1"
T=$(curl -s -X POST -H "Content-Type: application/json" \
  -d '{"email":"admin@proactiv.com","password":"Admin@123456"}' \
  "$API/auth/login" | grep -oE '"accessToken":"[^"]+"' | head -1 | cut -d'"' -f4)
AUTH="Authorization: Bearer $T"
JSON="Content-Type: application/json"
RND=$(date +%s)$((RANDOM % 100))
# Country code must be exactly 2 letters — derive from timestamp seconds
CODE2="$(printf '%02d' $((RANDOM % 26)) | tr '0-9' 'A-Z' | head -c 1)$(printf '%02d' $((RANDOM % 26)) | tr '0-9' 'A-Z' | head -c 1)"
# Simpler: use two random uppercase letters via /dev/urandom
CODE2=$(tr -dc 'A-Z' < /dev/urandom | head -c 2)

# Extract id (handles both `_id` and `id` response fields)
id_of() { echo "$1" | grep -oE '"id":"[^"]+"' | head -1 | cut -d'"' -f4; }

status() {
  local label="$1" code="$2" body="$3"
  printf "[%s] %-30s %s\n" "$code" "$label" "$(echo "$body" | head -c 140)"
}

echo "== Roles (GET) =="
R=$(curl -s -w "__CODE__%{http_code}" -H "$AUTH" "$API/iam/roles")
status "GET /iam/roles" "${R##*__CODE__}" "${R%__CODE__*}"

echo ""
echo "== Country =="
CR=$(curl -s -w "__CODE__%{http_code}" -X POST -H "$AUTH" -H "$JSON" \
  -d "{\"name\":\"E2E-C$RND\",\"code\":\"$CODE2\",\"languages\":[\"EN\"],\"currency\":\"USD\",\"timezone\":\"UTC\",\"isActive\":true}" \
  "$API/countries")
CCODE="${CR##*__CODE__}"; CBODY="${CR%__CODE__*}"
CID=$(id_of "$CBODY")
status "POST /countries" "$CCODE" "$CBODY"
echo "    CID=$CID"

echo ""
echo "== BusinessUnit =="
BR=$(curl -s -w "__CODE__%{http_code}" -X POST -H "$AUTH" -H "$JSON" \
  -d "{\"name\":\"E2E-BU$RND\",\"code\":\"EB${RND:0:3}\",\"type\":\"GYM\",\"countryId\":\"$CID\",\"isActive\":true}" \
  "$API/business-units")
BCODE="${BR##*__CODE__}"; BBODY="${BR%__CODE__*}"
BID=$(id_of "$BBODY")
status "POST /business-units" "$BCODE" "$BBODY"
echo "    BID=$BID"

echo ""
echo "== Location =="
LR=$(curl -s -w "__CODE__%{http_code}" -X POST -H "$AUTH" -H "$JSON" \
  -d "{
    \"name\":\"E2E-Loc$RND\",\"code\":\"ELOC-$RND\",
    \"businessUnitId\":\"$BID\",\"countryId\":\"$CID\",
    \"address\":{\"street\":\"1 Main\",\"city\":\"City\",\"postalCode\":\"00000\",\"country\":\"E2E-C$RND\"},
    \"contactInfo\":{\"email\":\"l$RND@t.com\",\"phone\":\"+15551234567\"},
    \"capacity\":50,
    \"operatingHours\":{\"monday\":{\"open\":\"09:00\",\"close\":\"17:00\",\"closed\":false},\"tuesday\":{\"open\":\"09:00\",\"close\":\"17:00\",\"closed\":false},\"wednesday\":{\"open\":\"09:00\",\"close\":\"17:00\",\"closed\":false},\"thursday\":{\"open\":\"09:00\",\"close\":\"17:00\",\"closed\":false},\"friday\":{\"open\":\"09:00\",\"close\":\"17:00\",\"closed\":false},\"saturday\":{\"open\":\"10:00\",\"close\":\"14:00\",\"closed\":false},\"sunday\":{\"open\":\"10:00\",\"close\":\"14:00\",\"closed\":true}}
  }" \
  "$API/locations")
LCODE="${LR##*__CODE__}"; LBODY="${LR%__CODE__*}"
LID=$(id_of "$LBODY")
status "POST /locations" "$LCODE" "$LBODY"
echo "    LID=$LID"

echo ""
echo "== Staff (nested + payrollInfo + idType defaults) =="
EMPID="EMP-$RND"
SR=$(curl -s -w "__CODE__%{http_code}" -X POST -H "$AUTH" -H "$JSON" \
  -d "{
    \"personalInfo\":{\"firstName\":\"Jake\",\"lastName\":\"E$RND\",\"dateOfBirth\":\"1990-01-01\",\"gender\":\"other\",\"nationality\":\"Unknown\",\"idNumber\":\"$EMPID\",\"idType\":\"national_id\"},
    \"contactInfo\":{\"email\":\"jake$RND@t.com\",\"phone\":\"+15551234567\",\"address\":{\"street\":\"N/A\",\"city\":\"N/A\",\"state\":\"N/A\",\"country\":\"N/A\",\"postalCode\":\"00000\"},\"emergencyContact\":{\"name\":\"N/A\",\"relationship\":\"N/A\",\"phone\":\"+10000000000\"}},
    \"staffType\":\"coach\",
    \"businessUnitId\":\"$BID\",
    \"locationIds\":[\"$LID\"],
    \"primaryLocationId\":\"$LID\",
    \"payrollInfo\":{\"employeeId\":\"$EMPID\",\"currency\":\"USD\",\"paymentMethod\":\"bank_transfer\"}
  }" \
  "$API/staff")
SCODE="${SR##*__CODE__}"; SBODY="${SR%__CODE__*}"
status "POST /staff" "$SCODE" "$SBODY"

echo ""
echo "== Program (corrected schema: ageType, minParticipants, pricingType) =="
PR=$(curl -s -w "__CODE__%{http_code}" -X POST -H "$AUTH" -H "$JSON" \
  -d "{
    \"name\":\"E2E-Prog$RND\",
    \"description\":\"Test program description\",\"shortDescription\":\"Short\",
    \"programType\":\"regular\",\"category\":\"gymnastics\",
    \"businessUnitId\":\"$BID\",\"locationIds\":[\"$LID\"],
    \"ageGroups\":[{\"minAge\":5,\"maxAge\":10,\"ageType\":\"years\",\"description\":\"Ages 5-10\"}],
    \"skillLevels\":[\"beginner\"],
    \"capacityRules\":{\"minParticipants\":1,\"maxParticipants\":15,\"coachToParticipantRatio\":10,\"waitlistCapacity\":5,\"allowOverbooking\":false},
    \"eligibilityRules\":{\"ageRestrictions\":{\"minAge\":5,\"maxAge\":10,\"ageType\":\"years\",\"description\":\"Ages 5-10\"},\"medicalClearanceRequired\":false,\"parentalConsentRequired\":true},
    \"pricingModel\":{\"basePrice\":99,\"currency\":\"USD\",\"pricingType\":\"per_term\"},
    \"classTemplates\":[{\"name\":\"Default\",\"description\":\"Standard\",\"duration\":60,\"activities\":[\"Warm-up\",\"Practice\"],\"learningObjectives\":[\"Skill development\"]}],
    \"sessionDuration\":60,\"sessionsPerWeek\":1,\"termDuration\":12,
    \"availableDays\":[\"monday\",\"wednesday\"],
    \"availableTimeSlots\":[{\"startTime\":\"16:00\",\"endTime\":\"17:00\",\"days\":[\"monday\",\"wednesday\"]}],
    \"isActive\":true,\"isPublic\":true
  }" \
  "$API/programs")
PCODE="${PR##*__CODE__}"; PBODY="${PR%__CODE__*}"
status "POST /programs" "$PCODE" "$PBODY"

echo ""
echo "== User =="
UR=$(curl -s -w "__CODE__%{http_code}" -X POST -H "$AUTH" -H "$JSON" \
  -d "{\"email\":\"u$RND@t.com\",\"password\":\"Test@12345\",\"firstName\":\"T\",\"lastName\":\"U\",\"phone\":\"+15551234567\",\"role\":\"COACH\"}" \
  "$API/users")
UCODE="${UR##*__CODE__}"; UBODY="${UR%__CODE__*}"
status "POST /users" "$UCODE" "$UBODY"

echo ""
echo "== DONE =="
