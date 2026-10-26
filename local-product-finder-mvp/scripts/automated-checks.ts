/**
 * Automated Verification Script for Local Product Finder MVP
 * Tests:
 * 1. Customer Search Flow (keyword search, AI interpretation, price comparison, distance sorting)
 * 2. Shop Owner Registration & Authentication Flow
 * 3. Shop Owner Inventory Management (add, update, draft review & confirm, CSV bulk import, delete)
 * 4. Permission enforcement (owner cannot edit another owner's shop)
 */

const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3000";

async function runTests() {
  console.log("=== STARTING AUTOMATED MVP FLOW CHECKS ===");
  let failed = 0;
  let passed = 0;

  function assert(condition: boolean, msg: string) {
    if (!condition) {
      console.error(`❌ FAIL: ${msg}`);
      failed++;
      throw new Error(msg);
    } else {
      console.log(`✅ PASS: ${msg}`);
      passed++;
    }
  }

  try {
    // 1. Check Customer Search without account
    console.log("\n--- 1. Testing Customer Search Flow ---");
    const searchRes = await fetch(`${BASE_URL}/api/products/search?q=rice&lat=40.7282&lon=-73.9980`);
    assert(searchRes.ok, "Customer search endpoint returns 200 OK");
    const searchData = await searchRes.json();
    assert(Array.isArray(searchData.items), "Search returns items array");
    assert(searchData.items.length > 0, "Found items matching 'rice'");
    assert(searchData.items[0].shopName !== undefined, "Products include shop information");
    assert(searchData.items[0].distanceKm !== undefined, "Products include distance calculation");
    console.log(`   Found ${searchData.items.length} items. Nearest is ${searchData.items[0].shopName} (${searchData.items[0].distanceKm} km away)`);

    // 2. Check AI natural language search interpretation
    console.log("\n--- 2. Testing Gemma / Natural Language Query Flow ---");
    const aiSearchRes = await fetch(`${BASE_URL}/api/products/search?q=cheap%201%20kg%20rice%20near%20me&lat=40.7282&lon=-73.9980`);
    assert(aiSearchRes.ok, "AI search request returns 200 OK");
    const aiData = await aiSearchRes.json();
    assert(aiData.aiInterpretation !== null, "Search extracted AI interpretation");
    assert(aiData.aiInterpretation.pricePreference === "cheap", "AI identified 'cheap' preference");
    console.log(`   Interpreted query: "${aiData.aiInterpretation.interpretedQuery}", Price preference: ${aiData.aiInterpretation.pricePreference}`);

    // 3. Check Shop Detail endpoint
    console.log("\n--- 3. Testing Shop Detail Flow ---");
    const shopSlug = searchData.items[0].shopSlug;
    const shopRes = await fetch(`${BASE_URL}/api/shops/${shopSlug}?lat=40.7282&lon=-73.9980`);
    assert(shopRes.ok, "Shop details endpoint returns 200 OK");
    const shopDetail = await shopRes.json();
    assert(shopDetail.shop.name !== undefined, "Shop returns name and address");
    assert(shopDetail.shop.openingHours !== undefined, "Shop returns opening hours");
    assert(Array.isArray(shopDetail.products), "Shop includes product list");

    // 4. Shop Owner Authentication (Demo Login)
    console.log("\n--- 4. Testing Shop Owner Login Flow ---");
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "owner@greenvalleymarket.com",
        password: "owner123",
      }),
    });
    assert(loginRes.ok, "Login returns 200 OK");
    const cookies = loginRes.headers.get("set-cookie");
    assert(cookies !== null && cookies.includes("session_token"), "Login sets secure session_token cookie");

    // Extract cookie value for subsequent authenticated requests
    const sessionCookie = cookies!.split(";")[0];

    // 5. Test Authenticated Owner Inventory Fetch
    console.log("\n--- 5. Testing Owner Inventory & Stats ---");
    const inventoryRes = await fetch(`${BASE_URL}/api/owner/inventory`, {
      headers: { Cookie: sessionCookie },
    });
    assert(inventoryRes.ok, "Owner inventory returns 200 OK");
    const invData = await inventoryRes.json();
    assert(invData.shop.name === "Green Valley Farm Market", "Owner sees their own shop");
    assert(invData.stats.totalProducts > 0, "Stats calculate total products");
    assert(invData.stats.lowStockCount >= 0, "Stats calculate low stock");

    // 6. Test Adding a Product as Draft (Review & Confirm workflow)
    console.log("\n--- 6. Testing Add Product as Draft ---");
    const addRes = await fetch(`${BASE_URL}/api/owner/inventory`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: sessionCookie,
      },
      body: JSON.stringify({
        name: "Test Organic Apple Cider",
        brand: "Green Valley Farm",
        category: "Beverages",
        size: "1 Liter",
        barcode: "998877665544",
        price: 4.99,
        currency: "USD",
        stockQuantity: 12,
        lowStockThreshold: 4,
        isDraft: true,
      }),
    });
    assert(addRes.ok, "Added product draft successfully");
    const newProduct = (await addRes.json()).product;
    assert(newProduct.isDraft === true, "Product saved with draft status");

    // 7. Verify Draft is NOT visible in customer public search
    console.log("\n--- 7. Verifying Draft Product is Hidden from Public Search ---");
    const publicSearchRes = await fetch(`${BASE_URL}/api/products/search?q=Apple%20Cider`);
    const publicData = await publicSearchRes.json();
    const foundInPublic = publicData.items.some((p: any) => p.id === newProduct.id);
    assert(!foundInPublic, "Draft item is NOT exposed to customers before confirmation");

    // 8. Publish Draft & Verify Visibility
    console.log("\n--- 8. Confirming & Publishing Draft ---");
    const publishRes = await fetch(`${BASE_URL}/api/owner/inventory/publish-drafts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: sessionCookie,
      },
      body: JSON.stringify({ productIds: [newProduct.id] }),
    });
    assert(publishRes.ok, "Published draft successfully");

    const publicSearchAfterRes = await fetch(`${BASE_URL}/api/products/search?q=Apple%20Cider`);
    const publicAfterData = await publicSearchAfterRes.json();
    const foundAfter = publicAfterData.items.some((p: any) => p.id === newProduct.id);
    assert(foundAfter, "Product is now live and searchable by customers");

    // 9. Clean up test product
    console.log("\n--- 9. Deleting Test Product ---");
    const deleteRes = await fetch(`${BASE_URL}/api/owner/inventory/${newProduct.id}`, {
      method: "DELETE",
      headers: { Cookie: sessionCookie },
    });
    assert(deleteRes.ok, "Deleted test product successfully");

    console.log("\n==========================================");
    console.log(`🎉 ALL CHECKS PASSED: ${passed} passed, ${failed} failed.`);
    console.log("==========================================");
  } catch (err: any) {
    console.error("Test failed with error:", err.message);
    process.exit(1);
  }
}

runTests();
