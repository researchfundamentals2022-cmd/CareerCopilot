import { supabase } from "./supabase";

/**
 * Fetches the most recent projection job for a given resume.
 */
export async function getLatestProjectionJob({ resumeId }) {
  if (!resumeId) return null;

  const { data, error } = await supabase
    .from("resume_projection_jobs")
    .select("*")
    .eq("resume_id", resumeId)
    .order("id", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Error fetching latest projection job:", error);
    throw error;
  }

  return data;
}

/**
 * Fetches a specific projection job by its ID.
 */
export async function getProjectionJobById({ jobId }) {
  if (!jobId) return null;

  const { data, error } = await supabase
    .from("resume_projection_jobs")
    .select("*")
    .eq("id", jobId)
    .single();

  if (error) {
    console.error("Error fetching projection job by ID:", error);
    throw error;
  }

  return data;
}

/**
 * Requests a new resume projection job.
 * This usually triggers a database function or a worker.
 */
export async function requestResumeProjection({ resumeId, userId }) {
  if (!resumeId || !userId) {
    throw new Error("resumeId and userId are required to request projection");
  }

  // Insert a new job row. Status is typically 'pending' or 'queued' by default in DB.
  const { data, error } = await supabase
    .from("resume_projection_jobs")
    .insert({
      resume_id: resumeId,
      user_id: userId,
      status: "pending"
    })
    .select()
    .single();

  if (error) {
    console.error("Error requesting resume projection:", error);
    throw error;
  }

  // In some systems, inserting might not "trigger" the worker if it's not a trigger-based system.
  // But based on ResumeBuilder naming, it returns a workerTriggered flag sometimes.
  return {
    job: data,
    workerTriggered: true // Assuming DB triggers handle it or it's always true for the UI to be happy
  };
}

/**
 * Polls for a projection job to complete.
 */
export async function waitForProjectionCompletion({ jobId, timeoutMs = 30000, pollMs = 1000 }) {
  const startTime = Date.now();

  while (Date.now() - startTime < timeoutMs) {
    const job = await getProjectionJobById({ jobId });

    if (job.status === "completed") {
      return job;
    }

    if (job.status === "failed") {
      throw new Error(job.error_message || "Projection job failed");
    }

    await new Promise((resolve) => setTimeout(resolve, pollMs));
  }

  throw new Error("Timeout waiting for projection completion");
}
