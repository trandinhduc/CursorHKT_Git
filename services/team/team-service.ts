/**
 * Team Service
 *
 * This service provides methods for team-related operations with Supabase.
 */

import { supabaseClient } from "@/services/auth/supabase-service";
import type { CreateTeamDto, Team, UpdateTeamDto } from "@/types";

export const teamService = {
  /**
   * Create a new team
   *
   * @param teamData Team data to create
   * @returns Created team
   */
  async createTeam(teamData: CreateTeamDto): Promise<Team> {
    // Format phone number with country code if needed
    const cleanedPhone = teamData.phoneNumber.replace(/\s/g, "");
    const formattedPhone = cleanedPhone.startsWith("0")
      ? `+84${cleanedPhone.slice(1)}`
      : cleanedPhone.startsWith("84")
      ? `+${cleanedPhone}`
      : cleanedPhone.startsWith("+")
      ? cleanedPhone
      : `+84${cleanedPhone}`;

    const insertData = {
      phone_number: formattedPhone,
      team_leader_name: teamData.teamLeaderName.trim(),
      email: teamData.email.trim(),
      member_count: teamData.memberCount,
      essential_items: teamData.essentialItems,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabaseClient
      .from("teams")
      .insert(insertData)
      .select()
      .single();

    if (error) throw error;

    return this.mapTeamFromDb(data);
  },

  /**
   * Get team by phone number
   *
   * @param phoneNumber Phone number (primary key)
   * @returns Team or null if not found
   */
  async getTeamByPhone(phoneNumber: string): Promise<Team | null> {
    const { data, error } = await supabaseClient
      .from("teams")
      .select("*")
      .eq("phone_number", phoneNumber)
      .single();
    console.log("data", data);
    console.log("error", error);

    if (error) {
      if (error.code === "PGRST116") {
        // No rows returned
        return null;
      }
      throw error;
    }

    return data ? this.mapTeamFromDb(data) : null;
  },

  /**
   * Update team by phone number
   *
   * @param phoneNumber Phone number (primary key)
   * @param updateData Data to update
   * @returns Updated team
   */
  async updateTeam(
    phoneNumber: string,
    updateData: UpdateTeamDto
  ): Promise<Team> {
    const updatePayload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (updateData.teamLeaderName !== undefined) {
      updatePayload.team_leader_name = updateData.teamLeaderName.trim();
    }
    if (updateData.email !== undefined) {
      updatePayload.email = updateData.email.trim();
    }
    if (updateData.memberCount !== undefined) {
      updatePayload.member_count = updateData.memberCount;
    }
    if (updateData.essentialItems !== undefined) {
      updatePayload.essential_items = updateData.essentialItems;
    }

    const { data, error } = await supabaseClient
      .from("teams")
      .update(updatePayload)
      .eq("phone_number", phoneNumber)
      .select()
      .single();

    if (error) throw error;

    return this.mapTeamFromDb(data);
  },

  /**
   * Delete team by phone number
   *
   * @param phoneNumber Phone number (primary key)
   */
  async deleteTeam(phoneNumber: string): Promise<void> {
    const { error } = await supabaseClient
      .from("teams")
      .delete()
      .eq("phone_number", phoneNumber);

    if (error) throw error;
  },

  /**
   * Get all teams
   *
   * @returns Array of teams
   */
  async getAllTeams(): Promise<Team[]> {
    const { data, error } = await supabaseClient
      .from("teams")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return data.map((item) => this.mapTeamFromDb(item));
  },

  /**
   * Map database row to Team type
   */
  mapTeamFromDb(dbRow: {
    phone_number: string;
    team_leader_name: string;
    email: string;
    member_count: number;
    essential_items: string[];
    created_at?: string;
    updated_at?: string;
  }): Team {
    return {
      id: dbRow.phone_number, // Using phone_number as ID
      phoneNumber: dbRow.phone_number,
      teamLeaderName: dbRow.team_leader_name,
      email: dbRow.email,
      memberCount: dbRow.member_count,
      essentialItems: dbRow.essential_items as Team["essentialItems"],
      createdAt: dbRow.created_at,
      updatedAt: dbRow.updated_at,
    };
  },
};
