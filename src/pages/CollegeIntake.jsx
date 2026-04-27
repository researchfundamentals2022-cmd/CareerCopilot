import React, { useState } from 'react';
import { supabase } from '../services/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building, 
  User, 
  Mail, 
  Phone, 
  BookOpen, 
  Users, 
  Calendar, 
  CheckCircle, 
  Copy,
  ChevronRight,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { RiAwardFill } from 'react-icons/ri';

const InputWrapper = ({ label, icon: Icon, children, required = true }) => (
  <div className="space-y-1.5 focus-within:translate-y-[-1px] transition-transform duration-200">
    <label className="text-[10px] font-black uppercase tracking-widest text-[#35008B] ml-1 flex items-center gap-1">
      {label} {required && <span className="text-[#DAA520] text-sm leading-none">*</span>}
    </label>
    <div className="relative group">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#35008B] transition-colors">
        {Icon && <Icon className="h-4 w-4" />}
      </div>
      {children}
      <div className="absolute inset-0 rounded-xl bg-[#35008B]/5 opacity-0 group-focus-within:opacity-100 -z-10 blur-md transition-opacity pointer-events-none" />
    </div>
  </div>
);

const CollegeIntake = () => {
  const [formData, setFormData] = useState({
    facultyName: '',
    designation: '',
    email: '',
    mobileNumber: '',
    collegeName: '',
    collegeAbbreviation: '',
    branchName: '',
    expectedStudents: '',
    expectedDate: '',
  });

  const [loading, setLoading] = useState(false);
  const [successCode, setSuccessCode] = useState(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  
  // Management State
  const [searchMode, setSearchMode] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'collegeAbbreviation') {
      setFormData(prev => ({ ...prev, [name]: value.toUpperCase().replace(/\s+/g, '') }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setLoading(true);
    setError('');

    try {
      const { data, error: searchError } = await supabase
        .from('college_events')
        .select('*')
        .or(`email.eq.${searchQuery.trim()},access_code.eq.${searchQuery.trim().toUpperCase()}`)
        .maybeSingle();

      if (searchError) throw searchError;
      if (!data) throw new Error("No registration found with this email or code.");

      setFormData({
        facultyName: data.faculty_name,
        designation: data.designation,
        email: data.email,
        mobileNumber: data.mobile_number,
        collegeName: data.college_name,
        collegeAbbreviation: data.college_abbreviation,
        branchName: data.branch_name,
        expectedStudents: data.expected_students?.toString() || '',
        expectedDate: data.expected_date || '',
      });
      
      setEditId(data.id);
      setIsEditing(true);
      setSearchMode(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const generateAccessCode = (abbreviation) => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let randomStr = '';
    for (let i = 0; i < 4; i++) {
        randomStr += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `${abbreviation.toUpperCase()}-${randomStr}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = {
        faculty_name: formData.facultyName,
        designation: formData.designation,
        email: formData.email,
        mobile_number: formData.mobileNumber,
        college_name: formData.collegeName,
        college_abbreviation: formData.collegeAbbreviation,
        branch_name: formData.branchName,
        expected_students: formData.expectedStudents ? parseInt(formData.expectedStudents) : null,
        expected_date: formData.expectedDate || null,
      };

      if (isEditing && editId) {
        const { error: dbError } = await supabase
          .from('college_events')
          .update(payload)
          .eq('id', editId);
        
        if (dbError) throw dbError;
        
        // Fetch current code to show success
        const { data: currentData, error: fetchError } = await supabase
          .from('college_events')
          .select('access_code')
          .eq('id', editId)
          .single();
          
        if (fetchError) throw fetchError;
        setSuccessCode(currentData.access_code);
      } else {
        const generatedCode = generateAccessCode(formData.collegeAbbreviation);
        const { error: dbError } = await supabase
          .from('college_events')
          .insert([{ ...payload, access_code: generatedCode }]);

        if (dbError) throw dbError;
        setSuccessCode(generatedCode);
      }
    } catch (err) {
      setError(err.message || 'An error occurred while saving the details.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(successCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#fafafc] pt-2 pb-12 px-4 overflow-hidden relative">
      {/* Soft Background Accents */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-violet-100/30 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-orange-50/40 rounded-full blur-[100px] -z-10" />

      {/* Luxury Navigation */}
      <nav className="max-w-6xl mx-auto flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 bg-white border border-slate-200 rounded-2xl flex items-center justify-center shadow-sm">
             <RiAwardFill className="h-7 w-7 text-[#DAA520]" />
          </div>
          <div>
            <p className="text-[10px] font-black text-[#35008B] uppercase tracking-[0.2em]">Official Certificate Portal</p>
          </div>
        </div>
        
        {!successCode && !searchMode && (
          <button 
            onClick={() => setSearchMode(true)}
            className="text-[11px] font-bold uppercase tracking-widest text-[#35008B] hover:opacity-70 transition-all flex items-center gap-2"
          >
            Update Registration <ChevronRight className="w-3 h-3" />
          </button>
        )}
      </nav>

      <div className="max-w-6xl mx-auto">
        <AnimatePresence mode="wait">
          {searchMode ? (
            <motion.div
              key="search"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-xl mx-auto"
            >
              <div className="bg-white border-2 border-slate-100 p-8 md:p-12 rounded-[2.5rem] shadow-[0_40px_80px_-20px_rgba(53,0,139,0.12)] text-center relative overflow-hidden">
                <div className="mx-auto h-16 w-16 bg-[#35008B]/5 rounded-full flex items-center justify-center mb-4 border border-[#35008B]/10">
                   <RiAwardFill className="h-8 w-8 text-[#DAA520]" />
                </div>
                
                <h2 className="text-2xl font-black text-[#35008B] mb-2 uppercase tracking-tighter">Update Registration</h2>
                <p className="text-slate-500 text-xs mb-6 leading-relaxed font-medium">Verify your coordinator key to manage your campus honors.</p>
                
                <form onSubmit={handleSearch} className="space-y-6 text-left">
                  <div className="space-y-2 group">
                     <label className="text-[9px] font-black uppercase tracking-[0.2em] text-[#DAA520] ml-1">Authorization Key</label>
                     <div className="relative">
                        <input 
                          type="text"
                          placeholder="Unique code or email..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full px-8 py-4 bg-white border-2 border-slate-100 rounded-2xl focus:border-[#35008B] outline-hidden transition-all text-slate-900 text-base font-black tracking-tight placeholder:text-slate-300"
                        />
                     </div>
                  </div>
                  
                  <button 
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#35008B] text-white py-4 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.2em] hover:bg-[#28006a] transition-all transform active:scale-[0.98] shadow-2xl"
                  >
                    {loading ? "Verifying..." : "Update Registration"}
                  </button>
                  
                  <button 
                    type="button"
                    onClick={() => setSearchMode(false)}
                    className="w-full text-slate-400 font-bold py-2 text-[9px] hover:text-[#35008B] transition-colors uppercase tracking-[0.3em]"
                  >
                    Establish New Presence
                  </button>
                </form>

                {error && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 p-4 bg-red-50 border border-red-100 text-red-500 text-[10px] font-black uppercase tracking-widest rounded-2xl">
                    {error}
                  </motion.div>
                )}
              </div>
              <p className="mt-8 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-60">
                Secure Institutional Access • Career Copilot Multi-Campus
              </p>
            </motion.div>
          ) : !successCode ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="text-center mb-12">
                 <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#DAA520]/10 border border-[#DAA520]/20 text-[#DAA520] text-[10px] font-black uppercase tracking-widest mb-4">
                    <RiAwardFill className="w-3 h-3" />
                    Empowering Next-Gen Talent
                 </div>
                 <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-[#35008B] mb-4 leading-[0.9]">
                   {isEditing ? "Update" : "Honoring"} <br/>Your <span className="italic">Students.</span>
                 </h1>
                 <p className="text-slate-500 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed font-medium">
                   Set up your institution's profile to issue official, high-resolution certificates. Let's make their achievements permanent.
                 </p>
              </div>

              <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-2">
                  {/* Form Side */}
                  <div className="p-8 md:p-16">
                     <form onSubmit={handleSubmit} className="space-y-10">
                        {error && <div className="p-4 bg-red-50 text-red-500 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-red-100">{error}</div>}
                        
                        <div className="space-y-8">
                           <div>
                              <p className="text-[10px] font-black uppercase tracking-widest text-[#DAA520] mb-6">1. Coordinator Information</p>
                              <div className="space-y-5">
                                <InputWrapper label="Full Name" icon={User}>
                                  <input type="text" name="facultyName" required value={formData.facultyName} onChange={handleChange}
                                    className="w-full pl-11 pr-4 py-4 bg-white border border-slate-200 rounded-xl focus:border-[#35008B] outline-hidden transition-all text-sm font-bold placeholder:text-slate-300" placeholder="e.g. Prof. Vivek Sharma" />
                                </InputWrapper>
                                <InputWrapper label="Official Title" icon={Zap}>
                                  <input type="text" name="designation" required value={formData.designation} onChange={handleChange}
                                    className="w-full pl-11 pr-4 py-4 bg-white border border-slate-200 rounded-xl focus:border-[#35008B] outline-hidden transition-all text-sm font-bold placeholder:text-slate-300" placeholder="Head of Training & Placements" />
                                </InputWrapper>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                  <InputWrapper label="Work Email" icon={Mail}>
                                    <input type="email" name="email" required value={formData.email} onChange={handleChange}
                                      className="w-full pl-11 pr-4 py-4 bg-white border border-slate-200 rounded-xl focus:border-[#35008B] outline-hidden transition-all text-sm font-bold placeholder:text-slate-300" placeholder="name@college.edu" />
                                  </InputWrapper>
                                  <InputWrapper label="Contact Number" icon={Phone}>
                                    <input type="tel" name="mobileNumber" required value={formData.mobileNumber} onChange={handleChange}
                                      className="w-full pl-11 pr-4 py-4 bg-white border border-slate-200 rounded-xl focus:border-[#35008B] outline-hidden transition-all text-sm font-bold placeholder:text-slate-300" placeholder="+91 XXX-XXX-XXXX" />
                                  </InputWrapper>
                                </div>
                              </div>
                           </div>

                           <div>
                              <p className="text-[10px] font-black uppercase tracking-widest text-[#DAA520] mb-6">2. Institution Specification</p>
                              <div className="space-y-5">
                                <InputWrapper label="Institution Name (As printed on Certificate)" icon={Building}>
                                  <input type="text" name="collegeName" required value={formData.collegeName} onChange={handleChange}
                                    className="w-full pl-11 pr-4 py-5 bg-white border border-slate-200 rounded-xl focus:border-[#35008B] outline-hidden transition-all text-base font-black text-[#35008B] placeholder:text-slate-300" placeholder="e.g. Indian Institute of Technology" />
                                </InputWrapper>
                                
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                  <div className="md:col-span-1">
                                    <InputWrapper label="Abbreviation" icon={ShieldCheck}>
                                      <input type="text" name="collegeAbbreviation" required disabled={isEditing} value={formData.collegeAbbreviation} onChange={handleChange}
                                        className={`w-full pl-11 pr-4 py-4 rounded-xl outline-hidden transition-all text-sm font-black text-center ${isEditing ? 'bg-slate-100 opacity-50' : 'bg-white border border-slate-200 focus:border-[#35008B] text-[#35008B] uppercase'}`} placeholder="IITM" />
                                    </InputWrapper>
                                  </div>
                                  <div className="md:col-span-2">
                                    <InputWrapper label="Department / Branch" icon={BookOpen}>
                                      <input type="text" name="branchName" required value={formData.branchName} onChange={handleChange}
                                        className="w-full pl-11 pr-4 py-4 bg-white border border-slate-200 rounded-xl focus:border-[#35008B] outline-hidden transition-all text-sm font-bold placeholder:text-slate-300" placeholder="Computer Science & Engineering" />
                                    </InputWrapper>
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                   <InputWrapper label="Expected Students" icon={Users}>
                                      <input type="number" name="expectedStudents" required value={formData.expectedStudents} onChange={handleChange}
                                        className="w-full pl-11 pr-4 py-4 bg-white border border-slate-200 rounded-xl focus:border-[#35008B] outline-hidden transition-all text-sm font-bold" />
                                   </InputWrapper>
                                   <InputWrapper label="Issue Date" icon={Calendar}>
                                      <input type="date" name="expectedDate" required value={formData.expectedDate} onChange={handleChange}
                                        className="w-full pl-11 pr-4 py-4 bg-white border border-slate-200 rounded-xl focus:border-[#35008B] outline-hidden transition-all text-sm font-bold text-slate-500" />
                                   </InputWrapper>
                                </div>
                              </div>
                           </div>
                        </div>

                        <div className="pt-6">
                           <button
                             type="submit"
                             disabled={loading}
                             className="w-full py-5 bg-[#35008B] text-white rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] hover:bg-[#28006a] transition-all transform active:scale-95 shadow-2xl hover:shadow-violet-200"
                           >
                             {loading ? "Processing..." : isEditing ? "Save Corrections" : "Unlock Student Certificates"}
                           </button>
                        </div>
                     </form>
                  </div>

                  {/* Visual Side */}
                  <div className="hidden lg:flex bg-[#35008B] p-16 flex-col justify-center text-white relative overflow-hidden">
                     <div className="absolute top-0 right-0 w-96 h-96 bg-white/[0.03] rounded-full -translate-y-1/2 translate-x-1/2" />
                     <div className="relative z-10">
                        <RiAwardFill className="h-16 w-16 text-[#DAA520] mb-10" />
                        <h3 className="text-4xl font-black mb-6 leading-tight">Every achievement <br/>deserves to be <br/><span className="text-[#DAA520]">Celebrated.</span></h3>
                        <p className="text-white/60 leading-relaxed font-medium mb-12">
                           Your students are working hard to build their futures. Provide these details once, and we'll handle the rest with premium, verifiable certificates they'll be proud to share.
                        </p>
                        
                        <div className="space-y-6">
                           <div className="flex items-center gap-4">
                              <div className="h-1 w-12 bg-[#DAA520]" />
                              <p className="text-[10px] font-black uppercase tracking-widest">High-Resolution Downloads</p>
                           </div>
                           <div className="flex items-center gap-4">
                              <div className="h-1 w-12 bg-white/20" />
                              <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Official Signature & Seals</p>
                           </div>
                           <div className="flex items-center gap-4">
                              <div className="h-1 w-12 bg-white/20" />
                              <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Lifetime Verification Link</p>
                           </div>
                        </div>
                     </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-2xl mx-auto"
            >
              <div className="bg-white border-2 border-[#DAA520]/20 p-12 md:p-20 rounded-[4rem] shadow-[0_50px_100px_-20px_rgba(53,0,139,0.15)] relative overflow-hidden text-center">
                 {/* Top Honor Banner */}
                 <div className="absolute top-0 left-0 w-full h-3 bg-linear-to-r from-[#DAA520] via-[#35008B] to-[#DAA520]" />
                 
                 <motion.div 
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="mx-auto h-24 w-24 rounded-full bg-[#DAA520]/10 flex items-center justify-center mb-10 shadow-inner border-2 border-[#DAA520]/20"
                 >
                    <RiAwardFill className="h-12 w-12 text-[#DAA520]" />
                 </motion.div>

                 <p className="text-[11px] font-black uppercase tracking-[0.5em] text-[#35008B] mb-4">Honor Infrastructure Activated</p>
                 <h2 className="text-5xl md:text-6xl font-black tracking-tight text-slate-900 mb-6 leading-tight">Master Key <br/><span className="text-[#DAA520]">Issued.</span></h2>
                 <p className="text-slate-500 text-lg mb-12 font-medium">Your campus is now authorized to issue official certificates.</p>

                 {/* The Royal Velvet Code Box */}
                 <div className="relative group mb-14">
                   <div className="absolute -inset-1 bg-[#DAA520] rounded-[3rem] blur-2xl opacity-10 group-hover:opacity-20 transition-opacity" />
                   <div className="relative bg-[#35008B] border-4 border-[#DAA520]/30 p-12 md:p-16 rounded-[3rem] flex flex-col items-center shadow-2xl">
                     <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50 mb-6">Student Access Passcode</p>
                     <p className="text-7xl md:text-9xl font-black tracking-tighter text-white select-all mb-10 drop-shadow-[0_4px_12px_rgba(0,0,0,0.3)]">
                       {successCode}
                     </p>
                     
                     <button 
                       onClick={copyToClipboard}
                       className="flex items-center gap-3 px-10 py-4 bg-white text-[#35008B] rounded-full text-xs font-black uppercase tracking-[0.2em] shadow-[0_20px_40px_-10px_rgba(255,255,255,0.3)] hover:scale-105 active:scale-95 transition-all"
                     >
                       {copied ? <CheckCircle className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                       {copied ? "Key Copied to Clipboard" : "Copy Official Key"}
                     </button>
                   </div>
                 </div>

                 {/* Official Seals */}
                 <div className="grid grid-cols-2 gap-6 mb-12">
                    <div className="p-6 bg-slate-50 rounded-[2rem] text-left border border-slate-100 flex flex-col justify-center">
                       <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Authenticated Campus</p>
                       <p className="text-xl font-black text-[#35008B]">{formData.collegeAbbreviation}</p>
                    </div>
                    <div className="p-6 bg-slate-50 rounded-[2rem] text-left border border-slate-100 flex flex-col justify-center">
                       <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Effective As Of</p>
                       <p className="text-xl font-black text-[#35008B]">{formData.expectedDate}</p>
                    </div>
                 </div>

                 <div className="pt-8 border-t border-slate-100">
                    <button
                      onClick={() => window.location.reload()}
                      className="text-slate-400 font-black text-[11px] uppercase tracking-[0.3em] hover:text-[#35008B] transition-colors"
                    >
                      Register New Department
                    </button>
                 </div>
              </div>
              
              <div className="mt-12 flex flex-col items-center gap-4">
                 <div className="h-1 w-12 bg-[#DAA520]/30 rounded-full" />
                 <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] leading-relaxed max-w-sm">
                   Share this key with your students to grant them instant access to their official high-resolution certificates.
                 </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CollegeIntake;
