/**
 * Seed config via the deployed REST API.
 * 
 * Usage: node scripts/seed-config-api.js <admin-password>
 */

const API_BASE = "https://albaysan-online.onrender.com";
const USERNAME = "AlbilsanOwner12231475";
const PRODUCT_ID = "6ab2ebf5289aaab56327c37a";

async function main() {
  const password = process.argv[2];
  if (!password) {
    console.error("Usage: node seed-config-api.js <admin-password>");
    process.exit(1);
  }

  // 1. Login
  console.log("🔑 Logging in...");
  const loginRes = await fetch(`${API_BASE}/api/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: USERNAME, password }),
  });

  if (!loginRes.ok) {
    console.error("❌ Login failed:", await loginRes.text());
    process.exit(1);
  }

  const { token } = await loginRes.json();
  console.log("✅ Logged in");

  // 2. Fetch current product to verify
  const getRes = await fetch(`${API_BASE}/api/products/${PRODUCT_ID}?raw=true`);
  const product = await getRes.json();
  console.log(`📦 Product: ${product.name} (${product.price} د.أ)`);

  // 3. Update with config data
  console.log("🧩 Seeding configuration...");
  const configPayload = {
    configurable: true,
    pieces: [
      {
        name: "تنورة",
        sortOrder: 0,
        options: [
          {
            name: "نمط التنورة",
            required: true,
            sortOrder: 0,
            values: [
              {
                label: "كلوش",
                priceAdjustment: 0,
                descriptionOverride: null,
                isDefault: true,
                sortOrder: 0,
                active: true,
              },
              {
                label: "دبل كلوش",
                priceAdjustment: 3,
                descriptionOverride: null,
                isDefault: false,
                sortOrder: 1,
                active: true,
              },
              {
                label: "بليسيه",
                priceAdjustment: 5,
                descriptionOverride: "تونيك ستريت مفتوح من الجنب مع تنورة بليسيه فاخرة — قماش عالي الجودة مع طيّات أنيقة",
                isDefault: false,
                sortOrder: 2,
                active: true,
              },
            ],
          },
        ],
      },
      {
        name: "بلوزة",
        sortOrder: 1,
        options: [
          {
            name: "نمط الكمّ",
            required: false,
            sortOrder: 0,
            values: [
              {
                label: "ربطة",
                priceAdjustment: 0,
                descriptionOverride: null,
                isDefault: true,
                sortOrder: 0,
                active: true,
              },
              {
                label: "بالون",
                priceAdjustment: 2,
                descriptionOverride: null,
                isDefault: false,
                sortOrder: 1,
                active: true,
              },
              {
                label: "أساسي",
                priceAdjustment: 0,
                descriptionOverride: null,
                isDefault: false,
                sortOrder: 2,
                active: true,
              },
            ],
          },
        ],
      },
    ],
  };

  const updateRes = await fetch(`${API_BASE}/api/products/${PRODUCT_ID}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(configPayload),
  });

  if (!updateRes.ok) {
    console.error("❌ Update failed:", await updateRes.text());
    process.exit(1);
  }

  const updated = await updateRes.json();
  console.log(`✅ Configuration seeded!`);
  console.log(`   configurable: ${updated.configurable}`);
  console.log(`   pieces: ${updated.pieces?.length || 0}`);
  console.log("");
  console.log("🧩 Configuration:");
  console.log("   Piece 1: تنورة → نمط التنورة (كلوش +0 | دبل كلوش +3 | بليسيه +5)");
  console.log("   Piece 2: بلوزة → نمط الكمّ (ربطة +0 | بالون +2 | أساسي +0)");
  console.log("");
  console.log(`🔗 Test at: https://albaysan-onlinefrontend.onrender.com/products/${PRODUCT_ID}`);
}

main().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});
