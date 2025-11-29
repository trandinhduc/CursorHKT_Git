/**
 * Support Service
 *
 * This service provides methods for help support-related operations with Supabase.
 * Manages the relationship between help_records and teams.
 */

import { supabaseClient } from "@/services/auth/supabase-service";
import type {
  HelpSupport,
  CreateHelpSupportDto,
  UpdateHelpSupportDto,
  SupportStatus,
} from "@/types";

export const supportService = {
  /**
   * Get support status for a help record by a specific team
   *
   * @param helpRecordId Help record ID
   * @param teamId Team ID (phone number)
   * @returns Help support or null if not found
   */
  async getSupportByTeam(
    helpRecordId: string,
    teamId: string
  ): Promise<HelpSupport | null> {
    const { data, error } = await supabaseClient
      .from("help_supports")
      .select("*")
      .eq("help_record_id", helpRecordId)
      .eq("team_id", teamId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // No rows returned
        return null;
      }
      throw error;
    }

    return data ? this.mapSupportFromDb(data) : null;
  },

  /**
   * Get all supports for a help record
   *
   * @param helpRecordId Help record ID
   * @returns Array of help supports
   */
  async getSupportsByHelpRecord(helpRecordId: string): Promise<HelpSupport[]> {
    const { data, error } = await supabaseClient
      .from("help_supports")
      .select("*")
      .eq("help_record_id", helpRecordId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return data.map((item) => this.mapSupportFromDb(item));
  },

  /**
   * Get all supports by a team
   *
   * @param teamId Team ID (phone number)
   * @returns Array of help supports
   */
  async getSupportsByTeam(teamId: string): Promise<HelpSupport[]> {
    const { data, error } = await supabaseClient
      .from("help_supports")
      .select("*")
      .eq("team_id", teamId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return data.map((item) => this.mapSupportFromDb(item));
  },

  /**
   * Get support status for a help record by a specific team
   * Returns 'none' if no support exists
   *
   * @param helpRecordId Help record ID
   * @param teamId Team ID (phone number)
   * @returns Support status or 'none'
   */
  async getSupportStatus(
    helpRecordId: string,
    teamId: string
  ): Promise<SupportStatus | "none"> {
    const support = await this.getSupportByTeam(helpRecordId, teamId);
    return support ? support.status : "none";
  },

  /**
   * Create a new support relationship
   *
   * @param supportData Support data to create
   * @returns Created help support
   */
  async createSupport(supportData: CreateHelpSupportDto): Promise<HelpSupport> {
    const insertData = {
      help_record_id: supportData.helpRecordId,
      team_id: supportData.teamId,
      status: (supportData.status || "pending") as SupportStatus,
      notes: supportData.notes || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabaseClient
      .from("help_supports")
      .insert(insertData)
      .select()
      .single();

    if (error) {
      // If support already exists (unique constraint), return existing
      if (error.code === "23505") {
        return this.getSupportByTeam(
          supportData.helpRecordId,
          supportData.teamId
        ) as Promise<HelpSupport>;
      }
      throw error;
    }

    return this.mapSupportFromDb(data);
  },

  /**
   * Update support status
   *
   * @param helpRecordId Help record ID
   * @param teamId Team ID (phone number)
   * @param updateData Data to update
   * @returns Updated help support
   */
  async updateSupport(
    helpRecordId: string,
    teamId: string,
    updateData: UpdateHelpSupportDto
  ): Promise<HelpSupport> {
    const updatePayload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (updateData.status !== undefined) {
      updatePayload.status = updateData.status;
    }
    if (updateData.notes !== undefined) {
      updatePayload.notes = updateData.notes || null;
    }

    const { data, error } = await supabaseClient
      .from("help_supports")
      .update(updatePayload)
      .eq("help_record_id", helpRecordId)
      .eq("team_id", teamId)
      .select()
      .single();

    if (error) throw error;

    return this.mapSupportFromDb(data);
  },

  /**
   * Delete support relationship
   *
   * @param helpRecordId Help record ID
   * @param teamId Team ID (phone number)
   */
  async deleteSupport(helpRecordId: string, teamId: string): Promise<void> {
    const { error } = await supabaseClient
      .from("help_supports")
      .delete()
      .eq("help_record_id", helpRecordId)
      .eq("team_id", teamId);

    if (error) throw error;
  },

  /**
   * Create or update support (upsert)
   * If support exists, update it; otherwise create new
   *
   * @param supportData Support data
   * @returns Help support
   */
  async upsertSupport(
    supportData: CreateHelpSupportDto & Partial<UpdateHelpSupportDto>
  ): Promise<HelpSupport> {
    const existing = await this.getSupportByTeam(
      supportData.helpRecordId,
      supportData.teamId
    );

    if (existing) {
      // Update existing
      return this.updateSupport(supportData.helpRecordId, supportData.teamId, {
        status: supportData.status,
        notes: supportData.notes,
      });
    } else {
      // Create new
      return this.createSupport({
        helpRecordId: supportData.helpRecordId,
        teamId: supportData.teamId,
        status: supportData.status || "pending",
        notes: supportData.notes,
      });
    }
  },

  /**
   * Map database row to HelpSupport type
   */
  mapSupportFromDb(dbRow: {
    id: string;
    help_record_id: string;
    team_id: string;
    status: string;
    notes: string | null;
    created_at?: string;
    updated_at?: string;
  }): HelpSupport {
    return {
      id: dbRow.id,
      helpRecordId: dbRow.help_record_id,
      teamId: dbRow.team_id,
      status: dbRow.status as SupportStatus,
      notes: dbRow.notes || undefined,
      createdAt: dbRow.created_at,
      updatedAt: dbRow.updated_at,
    };
  },
};

