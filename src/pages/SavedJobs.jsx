import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";

function SavedJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  
  // Form state
  const [companyName, setCompanyName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [jobUrl, setJobUrl] = useState("");
  const [status, setStatus] = useState("saved");
  
  // Edit state
  const [editingJobId, setEditingJobId] = useState(null);
  const [editForm, setEditForm] = useState({ companyName: "", jobTitle: "", jobUrl: "", status: "" });

  const fetchJobs = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("saved_jobs")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (data) setJobs(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleCreateJob = async (e) => {
    e.preventDefault();
    if (!companyName.trim() || !jobTitle.trim()) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: newJob, error } = await supabase.from("saved_jobs").insert({
        user_id: user.id,
        company_name: companyName.trim(),
        job_title: jobTitle.trim(),
        job_url: jobUrl.trim() || null,
        status,
      }).select().single();

      if (error) throw error;
      
      setJobs([newJob, ...jobs]);
      setIsAdding(false);
      
      // Reset form
      setCompanyName("");
      setJobTitle("");
      setJobUrl("");
      setStatus("saved");
    } catch (err) {
      console.error(err);
      alert("Failed to save job");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this job track?")) return;
    await supabase.from("saved_jobs").delete().eq("id", id);
    setJobs(jobs.filter(j => j.id !== id));
  };

  const handleStatusChange = async (id, newStatus) => {
    const { data, error } = await supabase.from("saved_jobs").update({ status: newStatus }).eq("id", id).select().single();
    if (!error && data) {
      setJobs(jobs.map(j => j.id === id ? data : j));
    }
  };

  const startEditing = (job) => {
    setEditingJobId(job.id);
    setEditForm({
      companyName: job.company_name,
      jobTitle: job.job_title,
      jobUrl: job.job_url || "",
      status: job.status
    });
  };

  const handleSaveEdit = async (id) => {
    if (!editForm.companyName.trim() || !editForm.jobTitle.trim()) return;
    try {
      const { data, error } = await supabase.from("saved_jobs").update({
        company_name: editForm.companyName.trim(),
        job_title: editForm.jobTitle.trim(),
        job_url: editForm.jobUrl.trim() || null,
        status: editForm.status
      }).eq("id", id).select().single();
      
      if (error) throw error;
      setJobs(jobs.map(j => j.id === id ? data : j));
      setEditingJobId(null);
    } catch (err) {
      console.error(err);
      alert("Failed to update job.");
    }
  };

  const statusColors = {
    saved: "bg-slate-100 text-slate-700",
    applied: "bg-blue-50 text-blue-700",
    interviewing: "bg-purple-50 text-purple-700",
    offered: "bg-emerald-50 text-emerald-700",
    rejected: "bg-rose-50 text-rose-700",
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-12 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Tracked Jobs</h1>
          <p className="mt-2 text-sm text-slate-500">Monitor your active applications and target roles.</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="rounded-xl bg-[var(--color-primary)] px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90 shadow-sm"
        >
          {isAdding ? "Cancel" : "+ New Job"}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleCreateJob} className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm animate-fade-in-up">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="mb-1.5 block text-[13px] font-semibold text-slate-700">Company *</label>
              <input required value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="e.g. Google" className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]" />
            </div>
            <div>
              <label className="mb-1.5 block text-[13px] font-semibold text-slate-700">Role Title *</label>
              <input required value={jobTitle} onChange={e => setJobTitle(e.target.value)} placeholder="e.g. Software Engineer" className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]" />
            </div>
            <div>
              <label className="mb-1.5 block text-[13px] font-semibold text-slate-700">Link (Optional)</label>
              <input value={jobUrl} onChange={e => setJobUrl(e.target.value)} placeholder="https://..." className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]" />
            </div>
            <div>
              <label className="mb-1.5 block text-[13px] font-semibold text-slate-700">Status</label>
              <select value={status} onChange={e => setStatus(e.target.value)} className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]">
                <option value="saved">Saved / Planning</option>
                <option value="applied">Applied</option>
                <option value="interviewing">Interviewing</option>
                <option value="offered">Offered</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
          <div className="mt-5 flex justify-end">
            <button type="submit" className="rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800">
              Save Job Match
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center p-12"><div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--color-primary)] border-t-transparent"></div></div>
      ) : jobs.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <p className="text-sm font-medium text-slate-500">No jobs tracked yet.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {jobs.map(job => (
            <div key={job.id} className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
              
              {editingJobId === job.id ? (
                <div className="flex flex-col gap-3">
                  <div>
                    <input 
                      value={editForm.companyName} 
                      onChange={e => setEditForm({...editForm, companyName: e.target.value})} 
                      className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-bold text-slate-900 focus:border-[var(--color-primary)] focus:outline-none" 
                      placeholder="Company"
                    />
                  </div>
                  <div>
                    <input 
                      value={editForm.jobTitle} 
                      onChange={e => setEditForm({...editForm, jobTitle: e.target.value})} 
                      className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 focus:border-[var(--color-primary)] focus:outline-none" 
                      placeholder="Role"
                    />
                  </div>
                  <div>
                    <input 
                      value={editForm.jobUrl} 
                      onChange={e => setEditForm({...editForm, jobUrl: e.target.value})} 
                      className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-[var(--color-primary)] focus:border-[var(--color-primary)] focus:outline-none" 
                      placeholder="Link (optional)"
                    />
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button onClick={() => handleSaveEdit(job.id)} className="flex-1 rounded-lg bg-[var(--color-primary)] py-1.5 text-xs font-semibold text-white hover:opacity-90">Save</button>
                    <button onClick={() => setEditingJobId(null)} className="flex-1 rounded-lg bg-slate-100 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200">Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="absolute right-4 top-4 flex items-center gap-1">
                    <button 
                      onClick={() => startEditing(job)}
                      className="rounded p-1.5 text-slate-400 hover:bg-slate-50 hover:text-[var(--color-primary)]"
                      title="Edit Job"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    </button>
                    <button 
                      onClick={() => handleDelete(job.id)}
                      className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500"
                      title="Delete Job"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                  
                  <div className="pr-16">
                    <h3 className="line-clamp-1 font-bold text-slate-900" title={job.company_name}>{job.company_name}</h3>
                    <p className="mt-1 line-clamp-1 text-sm font-medium text-slate-600" title={job.job_title}>{job.job_title}</p>
                  </div>
                  
                  <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-5">
                    <select 
                      value={job.status} 
                      onChange={(e) => handleStatusChange(job.id, e.target.value)}
                      className={`cursor-pointer rounded-full px-3 py-1 text-xs font-semibold focus:outline-none focus:ring-0 ${statusColors[job.status] || statusColors.saved}`}
                    >
                        <option value="saved">Saved</option>
                        <option value="applied">Applied</option>
                        <option value="interviewing">Interviewing</option>
                        <option value="offered">Offered</option>
                        <option value="rejected">Rejected</option>
                    </select>

                    {job.job_url && (
                      <a href={job.job_url} target="_blank" rel="noreferrer" className="text-xs font-semibold text-[var(--color-primary)] hover:underline truncate ml-2 max-w-[120px]">
                        View Post ↗
                      </a>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SavedJobs;
