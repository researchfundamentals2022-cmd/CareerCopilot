import { supabase } from "./supabase";
import { fetchResumeReadModel } from "./resumeReadModelApi";

const VALID_FORMATS = new Set(["pdf", "docx"]);
const ACTIVE_STATUSES = ["queued", "processing"];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const normalizePositiveNumber = (value, fallback) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return parsed;
};

const normalizeFormat = (format) => String(format || "").trim().toLowerCase();

export const getExportJobById = async ({ jobId }) => {
  if (!jobId) throw new Error("jobId is required");

  const { data, error } = await supabase
    .from("resume_export_jobs")
    .select("*")
    .eq("id", jobId)
    .maybeSingle();

  if (error) throw error;
  return data || null;
};

export const queueResumeExportJob = async ({
  resumeId,
  userId,
  format,
  templateName = "classic",
  options = {},
  readModelVersion = null,
}) => {
  if (!resumeId) throw new Error("resumeId is required");
  if (!userId) throw new Error("userId is required");

  const normalizedFormat = normalizeFormat(format);
  if (!VALID_FORMATS.has(normalizedFormat)) {
    throw new Error("format must be pdf or docx");
  }

  let resolvedReadModelVersion = readModelVersion;

  if (resolvedReadModelVersion === null || resolvedReadModelVersion === undefined) {
    const readModelRow = await fetchResumeReadModel(resumeId);
    resolvedReadModelVersion = readModelRow?.version ?? null;
  }

  if (resolvedReadModelVersion === null || resolvedReadModelVersion === undefined) {
    throw new Error("No read model version available for export");
  }

  const { data: existing, error: existingError } = await supabase
    .from("resume_export_jobs")
    .select("*")
    .eq("resume_id", resumeId)
    .eq("format", normalizedFormat)
    .eq("template_name", templateName)
    .eq("read_model_version", resolvedReadModelVersion)
    .in("status", ACTIVE_STATUSES)
    .order("requested_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existingError) throw existingError;
  if (existing) return existing;

  const { data, error } = await supabase
    .from("resume_export_jobs")
    .insert({
      resume_id: resumeId,
      user_id: userId,
      format: normalizedFormat,
      template_name: templateName,
      read_model_version: resolvedReadModelVersion,
      options_json: options || {},
    })
    .select("*")
    .single();

  if (error) {
    if (error.code === "23505") {
      const { data: retryData, error: retryError } = await supabase
        .from("resume_export_jobs")
        .select("*")
        .eq("resume_id", resumeId)
        .eq("format", normalizedFormat)
        .eq("template_name", templateName)
        .eq("read_model_version", resolvedReadModelVersion)
        .in("status", ACTIVE_STATUSES)
        .order("requested_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (retryError) throw retryError;
      if (retryData) return retryData;
    }

    throw error;
  }

  return data;
};

export const listResumeExportJobs = async ({
  resumeId,
  limit = 10,
} = {}) => {
  let query = supabase
    .from("resume_export_jobs")
    .select("*")
    .order("requested_at", { ascending: false })
    .limit(normalizePositiveNumber(limit, 10));

  if (resumeId) {
    query = query.eq("resume_id", resumeId);
  }

  const { data, error } = await query;
  if (error) throw error;

  return data || [];
};

export const getLatestExportJob = async ({
  resumeId,
  format = null,
  templateName = null,
  readModelVersion = null,
} = {}) => {
  if (!resumeId) throw new Error("resumeId is required");

  let query = supabase
    .from("resume_export_jobs")
    .select("*")
    .eq("resume_id", resumeId)
    .order("requested_at", { ascending: false })
    .limit(1);

  if (format) {
    query = query.eq("format", normalizeFormat(format));
  }

  if (templateName) {
    query = query.eq("template_name", templateName);
  }

  if (readModelVersion !== null && readModelVersion !== undefined) {
    query = query.eq("read_model_version", readModelVersion);
  }

  const { data, error } = await query.maybeSingle();

  if (error) throw error;
  return data || null;
};

export const waitForExportCompletion = async ({
  jobId = null,
  resumeId = null,
  format = null,
  templateName = null,
  readModelVersion = null,
  timeoutMs = 30000,
  pollMs = 1000,
} = {}) => {
  if (!jobId && !resumeId) {
    throw new Error("jobId or resumeId is required");
  }

  const normalizedTimeoutMs = normalizePositiveNumber(timeoutMs, 30000);
  const normalizedPollMs = normalizePositiveNumber(pollMs, 1000);

  const startedAt = Date.now();

  while (Date.now() - startedAt < normalizedTimeoutMs) {
    const job = jobId
      ? await getExportJobById({ jobId })
      : await getLatestExportJob({
          resumeId,
          format,
          templateName,
          readModelVersion,
        });

    if (!job) {
      await sleep(normalizedPollMs);
      continue;
    }

    if (job.status === "completed") {
      return job;
    }

    if (job.status === "failed") {
      throw new Error(job.error_message || "Export job failed");
    }

    await sleep(normalizedPollMs);
  }

  throw new Error("Export job timed out");
};
