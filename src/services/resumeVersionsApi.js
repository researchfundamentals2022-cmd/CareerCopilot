import { supabase } from "./supabase";

/**
 * Creates a new version snapshot for a given resume.
 * 
 * @param {string} resumeId - UUID of the resume
 * @param {string} userId - UUID of the user
 * @param {number} version - Numeric version from read model
 * @param {object} snapshotJson - Full document JSON of the resume
 * @param {string} source - Source of the version creation (e.g., 'manual_save')
 */
export async function createResumeVersionSnapshot({
  resumeId,
  userId,
  version,
  snapshotJson,
  source = "manual_save"
}) {
  if (!resumeId || !userId) {
    throw new Error("resumeId and userId are required to create a version snapshot");
  }

  const { data, error } = await supabase
    .from("resume_versions")
    .insert({
      resume_id: resumeId,
      user_id: userId,
      version: version,
      snapshot_json: snapshotJson,
      source: source,
      created_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating resume version snapshot:", error);
    throw error;
  }

  return data;
}

/**
 * Fetches all version snapshots for a given resume.
 */
export async function getResumeVersionHistory({ resumeId }) {
  if (!resumeId) return [];

  const { data, error } = await supabase
    .from("resume_versions")
    .select("*")
    .eq("resume_id", resumeId)
    .order("version", { ascending: false });

  if (error) {
    console.error("Error fetching resume version history:", error);
    throw error;
  }

  return data || [];
}
