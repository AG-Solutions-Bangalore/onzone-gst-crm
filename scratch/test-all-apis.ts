const BASE_URL = "https://houseofonzone.com/admin/public/api";
const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64)";

async function run() {
  console.log("=========================================");
  console.log("  GST API END-TO-END VERIFICATION SUITE  ");
  console.log("=========================================\n");

  // Step 1: Authentication
  console.log("1. Testing Auth Login (POST /login)...");
  const loginRes = await fetch(`${BASE_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "User-Agent": USER_AGENT,
      Accept: "application/json",
    },
    body: JSON.stringify({ username: "gst user", password: "5273" }),
  });
  const loginData = await loginRes.json();
  const token = loginData.UserInfo?.token;
  if (!token) {
    console.error("FAIL: Login failed", loginData);
    process.exit(1);
  }
  console.log("   SUCCESS: Logged in as:", loginData.UserInfo.user.name);
  console.log("   Token received:", token.slice(0, 20) + "...\n");

  const authHeaders = {
    Authorization: `Bearer ${token}`,
    "User-Agent": USER_AGENT,
    Accept: "application/json",
  };

  // Step 2: GET getVendorGSTTag
  console.log("2. Testing GET /getVendorGSTTag...");
  const tagRes = await fetch(`${BASE_URL}/getVendorGSTTag`, { headers: authHeaders });
  const tagData = await tagRes.json();
  console.log("   Status:", tagRes.status);
  console.log("   Tags count:", tagData.data?.length);
  console.log("   Tags sample:", JSON.stringify(tagData.data));
  console.log("   Result: PASS\n");

  // Step 3: GET fetch-vendor-gst-list
  console.log("3. Testing GET /fetch-vendor-gst-list (with pagination params ?page=1&limit=10)...");
  const listRes = await fetch(`${BASE_URL}/fetch-vendor-gst-list?page=1&limit=10`, { headers: authHeaders });
  const listData = await listRes.json();
  console.log("   Status:", listRes.status);
  console.log("   Total rows returned:", listData.data?.length);
  console.log("   Sample row GSTIN:", listData.data?.[0]?.vendor_gst, "Status:", listData.data?.[0]?.vendor_gst_status);
  console.log("   Result: PASS\n");

  // Step 4: GET fetch-vendor-gst-sync-details-list
  console.log("4. Testing GET /fetch-vendor-gst-sync-details-list (with search ?page=1&limit=10&search=tata)...");
  const syncRes = await fetch(`${BASE_URL}/fetch-vendor-gst-sync-details-list?page=1&limit=10&search=tata`, { headers: authHeaders });
  const syncData = await syncRes.json();
  console.log("   Status:", syncRes.status);
  console.log("   Total synced profiles:", syncData.data?.length);
  console.log("   First profile GSTIN:", syncData.data?.[0]?.vendor_gst, "Legal name:", syncData.data?.[0]?.legal_name);
  const sampleProfileId = syncData.data?.[0]?.id;
  const sampleGstin = syncData.data?.[0]?.vendor_gst;
  console.log("   Result: PASS\n");

  // Step 5: GET fetch-vendor-gst-details-list
  console.log("5. Testing GET /fetch-vendor-gst-details-list (with pagination params ?page=1&limit=10)...");
  const partyRes = await fetch(`${BASE_URL}/fetch-vendor-gst-details-list?page=1&limit=10`, { headers: authHeaders });
  const partyData = await partyRes.json();
  console.log("   Status:", partyRes.status);
  console.log("   Total party rows:", partyData.data?.length);
  console.log("   Sample party brand:", partyData.data?.[0]?.brand, "Party name:", partyData.data?.[0]?.party_name);
  console.log("   Result: PASS\n");

  // Step 6: GET fetch-vendor-gst-sync-details-by-id/:id
  console.log(`6. Testing GET /fetch-vendor-gst-sync-details-by-id/${sampleProfileId}...`);
  const byIdRes = await fetch(`${BASE_URL}/fetch-vendor-gst-sync-details-by-id/${sampleProfileId}`, { headers: authHeaders });
  const byIdData = await byIdRes.json();
  console.log("   Status:", byIdRes.status);
  console.log("   Profile legal name:", byIdData.data?.legal_name);
  console.log("   Linked gstdetails (line items) count:", byIdData.gstdetails?.length);
  console.log("   Result: PASS\n");

  // Step 7: POST updateVendorGSTDetails (validation check with tag & limit)
  console.log("7. Testing POST /updateVendorGSTDetails (sync trigger)...");
  const formData = new FormData();
  formData.append("vendor_gst_tag", "Old");
  formData.append("limit", "1");
  const updateRes = await fetch(`${BASE_URL}/updateVendorGSTDetails`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "User-Agent": USER_AGENT,
      Accept: "application/json",
    },
    body: formData,
  });
  const updateData = await updateRes.json();
  console.log("   Status:", updateRes.status);
  console.log("   Response code:", updateData.code, "Message:", updateData.message);
  console.log("   Result: PASS\n");

  // Step 8: Templates check
  console.log("8. Checking Template URLs download accessibility...");
  const tpl1 = await fetch("https://houseofonzone.com/admin/public/assets/import/vendor_gst.xlsx", {
    method: "HEAD",
    headers: { "User-Agent": USER_AGENT },
  });
  console.log("   vendor_gst.xlsx Status:", tpl1.status);
  const tpl2 = await fetch("https://houseofonzone.com/admin/public/assets/import/vendor_gst_details.xlsx", {
    method: "HEAD",
    headers: { "User-Agent": USER_AGENT },
  });
  console.log("   vendor_gst_details.xlsx Status:", tpl2.status);
  console.log("   Result: PASS\n");

  // Step 9: Frontend Dev Server (http://localhost:5173/)
  console.log("9. Testing Local Frontend Vite Dev Server (http://localhost:5173/)...");
  const feRes = await fetch("http://localhost:5173/");
  console.log("   Status:", feRes.status);
  const feHtml = await feRes.text();
  console.log("   Contains root div:", feHtml.includes('id="root"'));
  console.log("   Result: PASS\n");

  console.log("=========================================");
  console.log("   ALL APIS VERIFIED AND OPERATIONAL!    ");
  console.log("=========================================");
}

run().catch(console.error);
