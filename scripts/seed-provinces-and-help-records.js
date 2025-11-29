/**
 * Seed Provinces and Help Records Script
 *
 * This script imports sample provinces and help records data into Supabase.
 * Run with: node scripts/seed-provinces-and-help-records.js
 *
 * This script will:
 * 1. Create provinces (Phú Yên, Bình Định, Khánh Hòa, Quảng Nam)
 * 2. Create sample help records for each province
 */

const { createClient } = require("@supabase/supabase-js");
const dotenv = require("dotenv");
const path = require("path");

// Load environment variables
dotenv.config({ path: path.join(__dirname, "../.env") });

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("Error: Missing Supabase environment variables");
  console.error(
    "Please ensure EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY are set in .env file"
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Province definitions
const provinces = [
  { name: "Phú Yên", code: "PY", display_order: 1 },
  { name: "Bình Định", code: "BD", display_order: 2 },
  { name: "Khánh Hòa", code: "KH", display_order: 3 },
  { name: "Quảng Nam", code: "QN", display_order: 4 },
];

// Sample help records for each province
const sampleHelpRecords = {
  "Phú Yên": [
    {
      is_for_self: true,
      location_name: "Thôn 12, Phú Yên",
      adult_count: 2,
      child_count: 1,
      phone_number: "+84901234501",
      essential_items: ["Food", "Medical"],
      latitude: 13.0883,
      longitude: 109.2942,
      address: null,
      map_link: null,
    },
    {
      is_for_self: false,
      location_name: "Xã Hòa Quang, Phú Yên",
      adult_count: 1,
      child_count: 1,
      phone_number: "+84901234502",
      essential_items: ["Food", "Medical"],
      address: "Xã Hòa Quang, huyện Phú Hòa, tỉnh Phú Yên",
      map_link: null,
      latitude: null,
      longitude: null,
    },
    {
      is_for_self: true,
      location_name: "Thôn 13, Phú Yên",
      adult_count: 1,
      child_count: 1,
      phone_number: "+84901234503",
      essential_items: ["Food", "Medical"],
      latitude: 13.1,
      longitude: 109.3,
      address: null,
      map_link: null,
    },
  ],
  "Bình Định": [
    {
      is_for_self: true,
      location_name: "Thôn 5, Bình Định",
      adult_count: 3,
      child_count: 2,
      phone_number: "+84901234504",
      essential_items: ["Food", "Clothes", "Medical"],
      latitude: 13.7758,
      longitude: 109.2233,
      address: null,
      map_link: null,
    },
    {
      is_for_self: false,
      location_name: "Xã Phước Mỹ, Bình Định",
      adult_count: 2,
      child_count: 0,
      phone_number: "+84901234505",
      essential_items: ["Food", "Tools"],
      address: "Xã Phước Mỹ, huyện Tuy Phước, tỉnh Bình Định",
      map_link: null,
      latitude: null,
      longitude: null,
    },
    {
      is_for_self: true,
      location_name: "Thôn 7, Bình Định",
      adult_count: 1,
      child_count: 1,
      phone_number: "+84901234506",
      essential_items: ["Medical", "Food"],
      latitude: 13.8,
      longitude: 109.25,
      address: null,
      map_link: null,
    },
  ],
  "Khánh Hòa": [
    {
      is_for_self: true,
      location_name: "Thôn 1, Khánh Hòa",
      adult_count: 2,
      child_count: 1,
      phone_number: "+84901234507",
      essential_items: ["Food", "Medical", "Clothes"],
      latitude: 12.2388,
      longitude: 109.1967,
      address: null,
      map_link: null,
    },
    {
      is_for_self: false,
      location_name: "Xã Ninh Đông, Khánh Hòa",
      adult_count: 4,
      child_count: 2,
      phone_number: "+84901234508",
      essential_items: ["Food", "Medical", "Tools"],
      address: "Xã Ninh Đông, huyện Ninh Hòa, tỉnh Khánh Hòa",
      map_link: null,
      latitude: null,
      longitude: null,
    },
    {
      is_for_self: true,
      location_name: "Thôn 3, Khánh Hòa",
      adult_count: 1,
      child_count: 0,
      phone_number: "+84901234509",
      essential_items: ["Food"],
      latitude: 12.25,
      longitude: 109.2,
      address: null,
      map_link: null,
    },
  ],
  "Quảng Nam": [
    {
      is_for_self: true,
      location_name: "Thôn 4, Quảng Nam",
      adult_count: 2,
      child_count: 1,
      phone_number: "+84901234510",
      essential_items: ["Food", "Medical"],
      latitude: 15.8801,
      longitude: 108.338,
      address: null,
      map_link: null,
    },
    {
      is_for_self: false,
      location_name: "Xã Đại Hưng, Quảng Nam",
      adult_count: 3,
      child_count: 1,
      phone_number: "+84901234511",
      essential_items: ["Food", "Clothes", "Medical"],
      address: "Xã Đại Hưng, huyện Đại Lộc, tỉnh Quảng Nam",
      map_link: null,
      latitude: null,
      longitude: null,
    },
    {
      is_for_self: true,
      location_name: "Thôn 6, Quảng Nam",
      adult_count: 1,
      child_count: 1,
      phone_number: "+84901234512",
      essential_items: ["Food", "Medical"],
      latitude: 15.9,
      longitude: 108.35,
      address: null,
      map_link: null,
    },
  ],
};

async function seedProvinces() {
  console.log("🌱 Seeding provinces...");

  const provinceIds = {};

  for (const province of provinces) {
    const { data, error } = await supabase
      .from("provinces")
      .upsert(
        {
          name: province.name,
          code: province.code,
          display_order: province.display_order,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "name",
          ignoreDuplicates: false,
        }
      )
      .select()
      .single();

    if (error) {
      console.error(`Error inserting province ${province.name}:`, error);
    } else {
      console.log(
        `✅ Created/Updated province: ${province.name} (ID: ${data.id})`
      );
      provinceIds[province.name] = data.id;
    }
  }

  return provinceIds;
}

async function seedHelpRecords(provinceIds) {
  console.log("\n🌱 Seeding help records...");

  let totalCreated = 0;

  for (const [provinceName, records] of Object.entries(sampleHelpRecords)) {
    const provinceId = provinceIds[provinceName];
    if (!provinceId) {
      console.error(`❌ Province ID not found for: ${provinceName}`);
      continue;
    }

    console.log(`\n📝 Creating help records for ${provinceName}...`);

    for (const record of records) {
      const insertData = {
        ...record,
        province_id: provinceId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("help_records")
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error(`❌ Error inserting help record:`, error);
      } else {
        console.log(`  ✅ Created: ${record.location_name}`);
        totalCreated++;
      }
    }
  }

  return totalCreated;
}

async function main() {
  console.log("🚀 Starting seed process...\n");

  try {
    // Step 1: Seed provinces
    const provinceIds = await seedProvinces();

    // Step 2: Seed help records
    const totalRecords = await seedHelpRecords(provinceIds);

    console.log("\n✨ Seed process completed!");
    console.log(`📊 Summary:`);
    console.log(`   - Provinces: ${Object.keys(provinceIds).length}`);
    console.log(`   - Help Records: ${totalRecords}`);
  } catch (error) {
    console.error("❌ Seed process failed:", error);
    process.exit(1);
  }
}

main();
