/**
 * Help Service
 *
 * This service provides methods for help record operations with Supabase.
 */

import { supabaseClient } from "@/services/auth/supabase-service";
import type {
  CreateHelpRecordDto,
  HelpRecord,
  UpdateHelpRecordDto,
} from "@/types";

export const helpService = {
  /**
   * Create a new help record
   *
   * @param helpData Help record data to create
   * @returns Created help record
   */
  async createHelpRecord(helpData: CreateHelpRecordDto): Promise<HelpRecord> {
    // Format phone number with country code if needed
    const cleanedPhone = helpData.phoneNumber.replace(/\s/g, "");
    const formattedPhone = cleanedPhone.startsWith("0")
      ? `+84${cleanedPhone.slice(1)}`
      : cleanedPhone.startsWith("84")
      ? `+${cleanedPhone}`
      : cleanedPhone.startsWith("+")
      ? cleanedPhone
      : `+84${cleanedPhone}`;

    const insertData = {
      is_for_self: helpData.isForSelf,
      location_name: helpData.locationName.trim(),
      adult_count: helpData.adultCount,
      child_count: helpData.childCount,
      phone_number: formattedPhone,
      essential_items: helpData.essentialItems,
      latitude: helpData.latitude ?? null,
      longitude: helpData.longitude ?? null,
      address: helpData.address?.trim() ?? null,
      map_link: helpData.mapLink?.trim() ?? null,
      province_id: helpData.provinceId ?? null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabaseClient
      .from("help_records")
      .insert(insertData)
      .select()
      .single();

    if (error) throw error;

    return this.mapHelpRecordFromDb(data);
  },

  /**
   * Get help record by ID
   *
   * @param id Help record ID
   * @returns Help record or null if not found
   */
  async getHelpRecordById(id: string): Promise<HelpRecord | null> {
    const { data, error } = await supabaseClient
      .from("help_records")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // No rows returned
        return null;
      }
      throw error;
    }

    return data ? this.mapHelpRecordFromDb(data) : null;
  },

  /**
   * Get all help records
   *
   * @returns Array of help records
   */
  async getAllHelpRecords(): Promise<HelpRecord[]> {
    const { data, error } = await supabaseClient
      .from("help_records")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return data.map((item) => this.mapHelpRecordFromDb(item));
  },

  /**
   * Get help records with pagination
   *
   * @param page Page number (0-indexed)
   * @param limit Number of items per page
   * @param provinceId Optional province ID to filter by
   * @returns Object with data array and hasMore flag
   */
  async getHelpRecordsPaginated(
    page: number = 0,
    limit: number = 10,
    provinceId?: string | null
  ): Promise<{ data: HelpRecord[]; hasMore: boolean }> {
    const from = page * limit;
    const to = from + limit - 1;

    let query = supabaseClient
      .from("help_records")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false });

    // Filter by province if provided
    if (provinceId) {
      query = query.eq("province_id", provinceId);
    }

    const { data, error, count } = await query.range(from, to);

    if (error) throw error;

    const helpRecords = data.map((item) => this.mapHelpRecordFromDb(item));
    const totalCount = count ?? 0;
    const hasMore = to < totalCount - 1;

    return {
      data: helpRecords,
      hasMore,
    };
  },

  /**
   * Get help records by phone number
   *
   * @param phoneNumber Phone number
   * @returns Array of help records
   */
  async getHelpRecordsByPhone(phoneNumber: string): Promise<HelpRecord[]> {
    const { data, error } = await supabaseClient
      .from("help_records")
      .select("*")
      .eq("phone_number", phoneNumber)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return data.map((item) => this.mapHelpRecordFromDb(item));
  },

  /**
   * Get help records by province ID
   *
   * @param provinceId Province ID
   * @returns Array of help records
   */
  async getHelpRecordsByProvince(provinceId: string): Promise<HelpRecord[]> {
    const { data, error } = await supabaseClient
      .from("help_records")
      .select("*")
      .eq("province_id", provinceId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return data.map((item) => this.mapHelpRecordFromDb(item));
  },

  /**
   * Update help record by ID
   *
   * @param id Help record ID
   * @param updateData Data to update
   * @returns Updated help record
   */
  async updateHelpRecord(
    id: string,
    updateData: UpdateHelpRecordDto
  ): Promise<HelpRecord> {
    const updatePayload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (updateData.isForSelf !== undefined) {
      updatePayload.is_for_self = updateData.isForSelf;
    }
    if (updateData.locationName !== undefined) {
      updatePayload.location_name = updateData.locationName.trim();
    }
    if (updateData.adultCount !== undefined) {
      updatePayload.adult_count = updateData.adultCount;
    }
    if (updateData.childCount !== undefined) {
      updatePayload.child_count = updateData.childCount;
    }
    if (updateData.phoneNumber !== undefined) {
      const cleanedPhone = updateData.phoneNumber.replace(/\s/g, "");
      const formattedPhone = cleanedPhone.startsWith("0")
        ? `+84${cleanedPhone.slice(1)}`
        : cleanedPhone.startsWith("84")
        ? `+${cleanedPhone}`
        : cleanedPhone.startsWith("+")
        ? cleanedPhone
        : `+84${cleanedPhone}`;
      updatePayload.phone_number = formattedPhone;
    }
    if (updateData.essentialItems !== undefined) {
      updatePayload.essential_items = updateData.essentialItems;
    }
    if (updateData.latitude !== undefined) {
      updatePayload.latitude = updateData.latitude;
    }
    if (updateData.longitude !== undefined) {
      updatePayload.longitude = updateData.longitude;
    }
    if (updateData.address !== undefined) {
      updatePayload.address = updateData.address.trim();
    }
    if (updateData.mapLink !== undefined) {
      updatePayload.map_link = updateData.mapLink.trim();
    }
    if (updateData.provinceId !== undefined) {
      updatePayload.province_id = updateData.provinceId || null;
    }

    const { data, error } = await supabaseClient
      .from("help_records")
      .update(updatePayload)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return this.mapHelpRecordFromDb(data);
  },

  /**
   * Delete help record by ID
   *
   * @param id Help record ID
   */
  async deleteHelpRecord(id: string): Promise<void> {
    const { error } = await supabaseClient
      .from("help_records")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },

  /**
   * Map database row to HelpRecord type
   */
  mapHelpRecordFromDb(dbRow: {
    id: string;
    is_for_self: boolean;
    location_name: string;
    adult_count: number;
    child_count: number;
    phone_number: string;
    essential_items: string[];
    latitude?: number | null;
    longitude?: number | null;
    address?: string | null;
    map_link?: string | null;
    province_id?: string | null;
    created_at?: string;
    updated_at?: string;
  }): HelpRecord {
    return {
      id: dbRow.id,
      isForSelf: dbRow.is_for_self,
      locationName: dbRow.location_name,
      adultCount: dbRow.adult_count,
      childCount: dbRow.child_count,
      phoneNumber: dbRow.phone_number,
      essentialItems: dbRow.essential_items as HelpRecord["essentialItems"],
      latitude: dbRow.latitude ?? undefined,
      longitude: dbRow.longitude ?? undefined,
      address: dbRow.address ?? undefined,
      mapLink: dbRow.map_link ?? undefined,
      provinceId: dbRow.province_id ?? undefined,
      createdAt: dbRow.created_at,
      updatedAt: dbRow.updated_at,
    };
  },
};
