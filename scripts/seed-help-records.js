/**
 * Seed Help Records Script
 *
 * This script imports sample help records data into Supabase.
 * Run with: npx tsx scripts/seed-help-records.ts
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";

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

// Sample data for help records
const sampleHelpRecords = [
  // Records for self (is_for_self = true)
  {
    is_for_self: true,
    location_name: "Khu vực Quận 1, TP.HCM",
    adult_count: 2,
    child_count: 1,
    phone_number: "+84901234567",
    essential_items: ["Medical", "Food"],
    latitude: 10.7769,
    longitude: 106.7009,
    address: null,
    map_link: null,
  },
  {
    is_for_self: true,
    location_name: "Khu vực Quận 3, TP.HCM",
    adult_count: 1,
    child_count: 0,
    phone_number: "+84901234568",
    essential_items: ["Food", "Clothes"],
    latitude: 10.7833,
    longitude: 106.6833,
    address: null,
    map_link: null,
  },
  {
    is_for_self: true,
    location_name: "Khu vực Quận 5, TP.HCM",
    adult_count: 3,
    child_count: 2,
    phone_number: "+84901234569",
    essential_items: ["Medical", "Food", "Clothes"],
    latitude: 10.7544,
    longitude: 106.6689,
    address: null,
    map_link: null,
  },
  {
    is_for_self: true,
    location_name: "Khu vực Quận 7, TP.HCM",
    adult_count: 1,
    child_count: 1,
    phone_number: "+84901234570",
    essential_items: ["Food"],
    latitude: 10.7308,
    longitude: 106.7217,
    address: null,
    map_link: null,
  },
  {
    is_for_self: true,
    location_name: "Khu vực Quận 10, TP.HCM",
    adult_count: 2,
    child_count: 0,
    phone_number: "+84901234571",
    essential_items: ["Medical", "Tools"],
    latitude: 10.7733,
    longitude: 106.6667,
    address: null,
    map_link: null,
  },
  {
    is_for_self: true,
    location_name: "Khu vực Quận Bình Thạnh, TP.HCM",
    adult_count: 4,
    child_count: 1,
    phone_number: "+84901234572",
    essential_items: ["Food", "Clothes", "Tools"],
    latitude: 10.8019,
    longitude: 106.7147,
    address: null,
    map_link: null,
  },
  {
    is_for_self: true,
    location_name: "Khu vực Quận Tân Bình, TP.HCM",
    adult_count: 1,
    child_count: 2,
    phone_number: "+84901234573",
    essential_items: ["Medical", "Food"],
    latitude: 10.8014,
    longitude: 106.6525,
    address: null,
    map_link: null,
  },
  {
    is_for_self: true,
    location_name: "Khu vực Quận Phú Nhuận, TP.HCM",
    adult_count: 2,
    child_count: 1,
    phone_number: "+84901234574",
    essential_items: ["Clothes", "Food"],
    latitude: 10.8,
    longitude: 106.6833,
    address: null,
    map_link: null,
  },
  {
    is_for_self: true,
    location_name: "Khu vực Quận Gò Vấp, TP.HCM",
    adult_count: 3,
    child_count: 0,
    phone_number: "+84901234575",
    essential_items: ["Medical", "Tools"],
    latitude: 10.8383,
    longitude: 106.6883,
    address: null,
    map_link: null,
  },
  {
    is_for_self: true,
    location_name: "Khu vực Quận 12, TP.HCM",
    adult_count: 1,
    child_count: 1,
    phone_number: "+84901234576",
    essential_items: ["Food", "Clothes", "Medical"],
    latitude: 10.8633,
    longitude: 106.6533,
    address: null,
    map_link: null,
  },
  // Records for others (is_for_self = false)
  {
    is_for_self: false,
    location_name: "Nhà dân số 123 Đường Nguyễn Huệ, Quận 1",
    adult_count: 2,
    child_count: 0,
    phone_number: "+84901234577",
    essential_items: ["Food"],
    latitude: null,
    longitude: null,
    address: "123 Đường Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP.HCM",
    map_link: null,
  },
  {
    is_for_self: false,
    location_name: "Chung cư ABC, Quận 3",
    adult_count: 1,
    child_count: 1,
    phone_number: "+84901234578",
    essential_items: ["Medical", "Food"],
    latitude: null,
    longitude: null,
    address: "Chung cư ABC, 456 Đường Lê Văn Sỹ, Phường 12, Quận 3, TP.HCM",
    map_link: null,
  },
  {
    is_for_self: false,
    location_name: "Khu phố 5, Quận 5",
    adult_count: 3,
    child_count: 2,
    phone_number: "+84901234579",
    essential_items: ["Food", "Clothes", "Medical"],
    latitude: null,
    longitude: null,
    address: null,
    map_link: "https://maps.google.com/?q=10.7544,106.6689",
  },
  {
    is_for_self: false,
    location_name: "Nhà trọ số 789, Quận 7",
    adult_count: 1,
    child_count: 0,
    phone_number: "+84901234580",
    essential_items: ["Food", "Tools"],
    latitude: null,
    longitude: null,
    address: "789 Đường Nguyễn Thị Thập, Phường Tân Phú, Quận 7, TP.HCM",
    map_link: null,
  },
  {
    is_for_self: false,
    location_name: "Khu dân cư XYZ, Quận 10",
    adult_count: 2,
    child_count: 1,
    phone_number: "+84901234581",
    essential_items: ["Medical"],
    latitude: null,
    longitude: null,
    address: null,
    map_link: "https://maps.google.com/?q=10.7733,106.6667",
  },
  {
    is_for_self: false,
    location_name: "Chung cư DEF, Bình Thạnh",
    adult_count: 4,
    child_count: 1,
    phone_number: "+84901234582",
    essential_items: ["Food", "Clothes"],
    latitude: null,
    longitude: null,
    address:
      "Chung cư DEF, 321 Đường Xô Viết Nghệ Tĩnh, Phường 21, Quận Bình Thạnh, TP.HCM",
    map_link: null,
  },
  {
    is_for_self: false,
    location_name: "Nhà dân số 456, Tân Bình",
    adult_count: 1,
    child_count: 2,
    phone_number: "+84901234583",
    essential_items: ["Medical", "Food", "Clothes"],
    latitude: null,
    longitude: null,
    address: "456 Đường Cộng Hòa, Phường 13, Quận Tân Bình, TP.HCM",
    map_link: null,
  },
  {
    is_for_self: false,
    location_name: "Khu phố 2, Phú Nhuận",
    adult_count: 2,
    child_count: 0,
    phone_number: "+84901234584",
    essential_items: ["Food", "Tools"],
    latitude: null,
    longitude: null,
    address: null,
    map_link: "https://maps.google.com/?q=10.8000,106.6833",
  },
  {
    is_for_self: false,
    location_name: "Nhà trọ số 654, Gò Vấp",
    adult_count: 3,
    child_count: 1,
    phone_number: "+84901234585",
    essential_items: ["Medical", "Food"],
    latitude: null,
    longitude: null,
    address: "654 Đường Quang Trung, Phường 10, Quận Gò Vấp, TP.HCM",
    map_link: null,
  },
  {
    is_for_self: false,
    location_name: "Chung cư GHI, Quận 12",
    adult_count: 1,
    child_count: 1,
    phone_number: "+84901234586",
    essential_items: ["Clothes", "Food"],
    latitude: null,
    longitude: null,
    address:
      "Chung cư GHI, 987 Đường Tân Thới Hiệp, Phường Tân Thới Hiệp, Quận 12, TP.HCM",
    map_link: null,
  },
  {
    is_for_self: true,
    location_name: "Khu vực Quận 2, TP.HCM",
    adult_count: 2,
    child_count: 1,
    phone_number: "+84901234587",
    essential_items: ["Food", "Medical", "Clothes"],
    latitude: 10.7875,
    longitude: 106.7492,
    address: null,
    map_link: null,
  },
  {
    is_for_self: true,
    location_name: "Khu vực Quận 4, TP.HCM",
    adult_count: 1,
    child_count: 0,
    phone_number: "+84901234588",
    essential_items: ["Tools", "Food"],
    latitude: 10.7544,
    longitude: 106.695,
    address: null,
    map_link: null,
  },
  {
    is_for_self: true,
    location_name: "Khu vực Quận 6, TP.HCM",
    adult_count: 3,
    child_count: 2,
    phone_number: "+84901234589",
    essential_items: ["Medical", "Food", "Clothes", "Tools"],
    latitude: 10.75,
    longitude: 106.6333,
    address: null,
    map_link: null,
  },
  {
    is_for_self: false,
    location_name: "Nhà dân số 111, Quận 2",
    adult_count: 2,
    child_count: 0,
    phone_number: "+84901234590",
    essential_items: ["Food"],
    latitude: null,
    longitude: null,
    address:
      "111 Đường Nguyễn Duy Trinh, Phường Bình Trưng Tây, Quận 2, TP.HCM",
    map_link: null,
  },
  {
    is_for_self: false,
    location_name: "Khu phố 3, Quận 4",
    adult_count: 1,
    child_count: 1,
    phone_number: "+84901234591",
    essential_items: ["Medical", "Food"],
    latitude: null,
    longitude: null,
    address: null,
    map_link: "https://maps.google.com/?q=10.7544,106.6950",
  },
  {
    is_for_self: false,
    location_name: "Chung cư JKL, Quận 6",
    adult_count: 4,
    child_count: 1,
    phone_number: "+84901234592",
    essential_items: ["Food", "Clothes", "Medical"],
    latitude: null,
    longitude: null,
    address: "Chung cư JKL, 222 Đường Hậu Giang, Phường 4, Quận 6, TP.HCM",
    map_link: null,
  },
  {
    is_for_self: true,
    location_name: "Khu vực Quận 8, TP.HCM",
    adult_count: 1,
    child_count: 1,
    phone_number: "+84901234593",
    essential_items: ["Food", "Clothes"],
    latitude: 10.7333,
    longitude: 106.6333,
    address: null,
    map_link: null,
  },
  {
    is_for_self: true,
    location_name: "Khu vực Quận 9, TP.HCM",
    adult_count: 2,
    child_count: 0,
    phone_number: "+84901234594",
    essential_items: ["Medical", "Tools"],
    latitude: 10.8417,
    longitude: 106.7708,
    address: null,
    map_link: null,
  },
  {
    is_for_self: false,
    location_name: "Nhà trọ số 333, Quận 8",
    adult_count: 3,
    child_count: 2,
    phone_number: "+84901234595",
    essential_items: ["Food", "Medical", "Clothes"],
    latitude: null,
    longitude: null,
    address: "333 Đường Dương Đình Hội, Phường Phú Hữu, Quận 8, TP.HCM",
    map_link: null,
  },
  {
    is_for_self: false,
    location_name: "Khu dân cư MNO, Quận 9",
    adult_count: 1,
    child_count: 0,
    phone_number: "+84901234596",
    essential_items: ["Food", "Tools"],
    latitude: null,
    longitude: null,
    address: null,
    map_link: "https://maps.google.com/?q=10.8417,106.7708",
  },
];

async function seedHelpRecords() {
  console.log("Starting to seed help records...");
  console.log(`Total records to insert: ${sampleHelpRecords.length}`);

  try {
    // Insert records in batches to avoid overwhelming the database
    const batchSize = 10;
    let inserted = 0;

    for (let i = 0; i < sampleHelpRecords.length; i += batchSize) {
      const batch = sampleHelpRecords.slice(i, i + batchSize);

      const { data, error } = await supabase
        .from("help_records")
        .insert(batch)
        .select();

      if (error) {
        console.error(
          `Error inserting batch ${Math.floor(i / batchSize) + 1}:`,
          error
        );
        throw error;
      }

      inserted += batch.length;
      console.log(
        `Inserted batch ${Math.floor(i / batchSize) + 1}: ${
          batch.length
        } records (Total: ${inserted}/${sampleHelpRecords.length})`
      );
    }

    console.log("\n✅ Successfully seeded help records!");
    console.log(`Total records inserted: ${inserted}`);
  } catch (error) {
    console.error("\n❌ Error seeding help records:", error);
    process.exit(1);
  }
}

// Run the seed function
seedHelpRecords();
