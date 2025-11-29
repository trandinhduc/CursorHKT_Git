/**
 * Province Service
 *
 * This service provides methods for province-related operations with Supabase.
 */

import { supabaseClient } from "@/services/auth/supabase-service";
import type {
  CreateProvinceDto,
  Province,
  UpdateProvinceDto,
} from "@/types";

export const provinceService = {
  /**
   * Get all provinces
   *
   * @param activeOnly If true, only return active provinces
   * @returns Array of provinces
   */
  async getAllProvinces(activeOnly: boolean = true): Promise<Province[]> {
    let query = supabaseClient
      .from("provinces")
      .select("*")
      .order("display_order", { ascending: true })
      .order("name", { ascending: true });

    if (activeOnly) {
      query = query.eq("is_active", true);
    }

    const { data, error } = await query;

    if (error) throw error;

    return data.map((item) => this.mapProvinceFromDb(item));
  },

  /**
   * Get province by ID
   *
   * @param id Province ID
   * @returns Province or null if not found
   */
  async getProvinceById(id: string): Promise<Province | null> {
    const { data, error } = await supabaseClient
      .from("provinces")
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

    return data ? this.mapProvinceFromDb(data) : null;
  },

  /**
   * Get province by name
   *
   * @param name Province name
   * @returns Province or null if not found
   */
  async getProvinceByName(name: string): Promise<Province | null> {
    const { data, error } = await supabaseClient
      .from("provinces")
      .select("*")
      .eq("name", name)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // No rows returned
        return null;
      }
      throw error;
    }

    return data ? this.mapProvinceFromDb(data) : null;
  },

  /**
   * Create a new province
   *
   * @param provinceData Province data to create
   * @returns Created province
   */
  async createProvince(provinceData: CreateProvinceDto): Promise<Province> {
    const insertData = {
      name: provinceData.name.trim(),
      code: provinceData.code?.trim() || null,
      display_order: provinceData.displayOrder ?? 0,
      is_active: provinceData.isActive ?? true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabaseClient
      .from("provinces")
      .insert(insertData)
      .select()
      .single();

    if (error) throw error;

    return this.mapProvinceFromDb(data);
  },

  /**
   * Update province by ID
   *
   * @param id Province ID
   * @param updateData Data to update
   * @returns Updated province
   */
  async updateProvince(
    id: string,
    updateData: UpdateProvinceDto
  ): Promise<Province> {
    const updatePayload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (updateData.name !== undefined) {
      updatePayload.name = updateData.name.trim();
    }
    if (updateData.code !== undefined) {
      updatePayload.code = updateData.code?.trim() || null;
    }
    if (updateData.displayOrder !== undefined) {
      updatePayload.display_order = updateData.displayOrder;
    }
    if (updateData.isActive !== undefined) {
      updatePayload.is_active = updateData.isActive;
    }

    const { data, error } = await supabaseClient
      .from("provinces")
      .update(updatePayload)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return this.mapProvinceFromDb(data);
  },

  /**
   * Delete province by ID
   *
   * @param id Province ID
   */
  async deleteProvince(id: string): Promise<void> {
    const { error } = await supabaseClient
      .from("provinces")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },

  /**
   * Map database row to Province type
   */
  mapProvinceFromDb(dbRow: {
    id: string;
    name: string;
    code: string | null;
    display_order: number | null;
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
  }): Province {
    return {
      id: dbRow.id,
      name: dbRow.name,
      code: dbRow.code || undefined,
      displayOrder: dbRow.display_order ?? undefined,
      isActive: dbRow.is_active,
      createdAt: dbRow.created_at,
      updatedAt: dbRow.updated_at,
    };
  },
};

