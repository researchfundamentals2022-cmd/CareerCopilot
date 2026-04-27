import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import { FiDownload, FiShare2, FiLock } from "react-icons/fi";
import { RiShieldCheckFill, RiAwardFill } from "react-icons/ri";
import { TbCertificate } from "react-icons/tb";
import { useNavigate } from "react-router-dom";
import { supabase } from "../services/supabase";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import logo from "../assets/Carrer_Copilot_Logo.png";
import stamp from "../assets/certificate_stamp.png";
import { motion, AnimatePresence } from "framer-motion";

const Certificate = () => {
  const { profile, user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const certRef = useRef(null);
  const containerRef = useRef(null);
  
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [isSharing, setIsSharing] = useState(false);
  const [scale, setScale] = useState(1);
  const [certName, setCertName] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const hasLoaded = useRef(false);

  // New College Personalization State
  const [accessCode, setAccessCode] = useState("");
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [collegeData, setCollegeData] = useState(null);
  const [redeemError, setRedeemError] = useState("");
  const [showRedeemSuccess, setShowRedeemSuccess] = useState(false);

  // Hardened Image Export States
  const [logoBase64, setLogoBase64] = useState(logo);
  const [stampBase64, setStampBase64] = useState(stamp);

  useEffect(() => {
    const toBase64 = async (url, setFn) => {
      try {
        const response = await fetch(url);
        const blob = await response.blob();
        const reader = new FileReader();
        reader.onloadend = () => setFn(reader.result);
        reader.readAsDataURL(blob);
      } catch (e) {
        console.error("Base64 conversion error", e);
      }
    };
    toBase64(logo, setLogoBase64);
    toBase64(stamp, setStampBase64);
  }, []);

  useEffect(() => {
    const initializeCertificate = async () => {
      if (!user || hasLoaded.current) return;
      hasLoaded.current = true;
      
      try {
        const [resumeRes, profileData] = await Promise.all([
          supabase
            .from("resumes")
            .select("id, updated_at")
            .eq("user_id", user.id)
            .eq("resume_status", "completed")
            .order('updated_at', { ascending: false })
            .limit(1)
            .maybeSingle(),
          refreshProfile()
        ]);

        if (resumeRes.error) throw resumeRes.error;
        
        const hasCompleted = !!resumeRes.data;
        setIsUnlocked(hasCompleted);

        if (hasCompleted && resumeRes.data.updated_at) {
          const date = new Date(resumeRes.data.updated_at);
          setIssueDate(date.toLocaleDateString('en-US', { 
            month: 'long', 
            day: 'numeric', 
            year: 'numeric' 
          }));
        }
        
        const rawName = profileData?.full_name || "Valued Candidate";
        const formattedName = rawName
          .trim()
          .split(/\s+/)
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ');
        
        setCertName(formattedName);

        if (profileData?.college_event_id) {
          const { data: eventData } = await supabase
            .from("college_events")
            .select("*")
            .eq("id", profileData.college_event_id)
            .single();
          
          if (eventData) setCollegeData(eventData);
        }

      } catch (err) {
        console.error("Certificate init error:", err);
      } finally {
        setIsChecking(false);
      }
    };

    initializeCertificate();
  }, [user]);

  const handleRedeemCode = async (e) => {
    e.preventDefault();
    if (!accessCode.trim()) return;
    
    setIsRedeeming(true);
    setRedeemError("");

    try {
      const { data: eventData, error: eventError } = await supabase
        .from("college_events")
        .select("*")
        .eq("access_code", accessCode.trim().toUpperCase())
        .single();

      if (eventError || !eventData) {
        throw new Error("Invalid access code.");
      }

      const { error: profileError } = await supabase
        .from("profiles")
        .update({ college_event_id: eventData.id })
        .eq("id", user.id);

      if (profileError) throw profileError;

      setCollegeData(eventData);
      setShowRedeemSuccess(true);
      setTimeout(() => setShowRedeemSuccess(false), 3000);
      setAccessCode("");
      
      refreshProfile();
    } catch (err) {
      setRedeemError(err.message);
    } finally {
      setIsRedeeming(false);
    }
  };

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const baseWidth = 950;
        if (containerWidth < baseWidth + 40) {
          setScale((containerWidth - 40) / baseWidth);
        } else {
          setScale(1);
        }
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isChecking, isUnlocked]);
  
  const handleDownloadPDF = async () => {
    if (!certRef.current) return;
    try {
      setIsSharing(true);
      
      // Force wait for images to be ready
      const images = certRef.current.querySelectorAll('img');
      await Promise.all(Array.from(images).map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise(resolve => { img.onload = resolve; img.onerror = resolve; });
      }));

      const canvas = await html2canvas(certRef.current, {
        scale: 3, 
        useCORS: true,
        allowTaint: false,
        logging: true,
        backgroundColor: "#ffffff",
        width: 950,
        height: 670,
        onclone: (clonedDoc) => {
          const cert = clonedDoc.getElementById("cert-canvas");
          if (cert) {
            cert.style.transform = "none";
            cert.style.margin = "0";
            
            // Ensure all SVGs (React Icons) are forced to render
            clonedDoc.querySelectorAll('svg').forEach(svg => {
              svg.style.display = 'block';
              // Keep original size but reinforce it for the capture engine
              const size = svg.getAttribute('width') || '64';
              svg.style.width = size + 'px';
              svg.style.height = size + 'px';
            });

            // Ensure images in clone are also visible
            clonedDoc.querySelectorAll('img').forEach(img => {
               img.style.visibility = 'visible';
               img.style.opacity = img.style.opacity || '1';
            });
          }
        }
      });
      
      const imgData = canvas.toDataURL("image/jpeg", 1.0);
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4"
      });
      pdf.addImage(imgData, "JPEG", 0, 0, 297, 210);
      pdf.save(`Certification_${certName.replace(/\s+/g, '_')}.pdf`);
      
    } catch (error) {
      console.error("PDF export error:", error);
      alert("Export failed. Please try again or use Chrome/Edge.");
    } finally {
      setIsSharing(false);
    }
  };
  
  const handleDownloadPNG = async () => {
    if (!certRef.current) return;
    try {
      setIsSharing(true);

      // Force wait for images to be ready
      const images = certRef.current.querySelectorAll('img');
      await Promise.all(Array.from(images).map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise(resolve => { img.onload = resolve; img.onerror = resolve; });
      }));

      const canvas = await html2canvas(certRef.current, {
        scale: 3, 
        useCORS: true,
        allowTaint: false,
        logging: true,
        backgroundColor: "#ffffff",
        width: 950,
        height: 670,
        onclone: (clonedDoc) => {
          const cert = clonedDoc.getElementById("cert-canvas");
          if (cert) {
            cert.style.transform = "none";
            cert.style.margin = "0";

            // Ensure all SVGs (React Icons) are forced to render
            clonedDoc.querySelectorAll('svg').forEach(svg => {
              svg.style.display = 'block';
              const size = svg.getAttribute('width') || '64';
              svg.style.width = size + 'px';
              svg.style.height = size + 'px';
            });

            clonedDoc.querySelectorAll('img').forEach(img => {
               img.style.visibility = 'visible';
               img.style.opacity = img.style.opacity || '1';
            });
          }
        }
      });
      const dataUrl = canvas.toDataURL("image/png", 1.0);
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `Certification_${certName.replace(/\s+/g, '_')}.png`;
      link.click();
    } catch (error) {
      console.error("PNG export error:", error);
    } finally {
      setIsSharing(false);
    }
  };

  if (isChecking) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#35008B]"></div>
      </div>
    );
  }

  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-[#f8fafc] py-20 px-4 flex flex-col items-center justify-center">
        <div className="max-w-md w-full bg-white p-10 rounded-3xl shadow-xl border border-[#f1f5f9] text-center animate-page-entry">
          <div className="w-20 h-20 bg-[#eef2ff] text-[#35008B] rounded-full flex items-center justify-center mx-auto mb-6">
            <FiLock size={40} />
          </div>
          <h2 className="text-2xl font-bold text-[#0f172a] mb-4">Certificate Locked</h2>
          <p className="text-[#64748b] mb-8 leading-relaxed">
            Please complete creating your resume and download it to unlock your official certification. Once you've downloaded your resume, you can share your certificate.
          </p>
          <button 
            onClick={() => navigate("/dashboard")}
            className="w-full bg-[#35008B] text-white font-bold py-4 rounded-xl shadow-lg hover:opacity-90 transition transform hover:scale-[1.02]"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] py-6 md:py-10 px-4" ref={containerRef}>
      <div className="max-w-[1000px] mx-auto flex flex-col items-center">
        
        {/* Controls Container (Dynamic Styling OK here, outside capture) */}
        <div className="w-full mb-8 space-y-6 no-print animate-page-entry">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="w-full md:w-auto">
              {!collegeData ? (
                <form onSubmit={handleRedeemCode} className="relative group max-w-sm">
                  <div className="absolute -inset-1 bg-linear-to-r from-[#35008B] to-[#fbbf24] rounded-xl blur-lg opacity-20 group-hover:opacity-40 transition-opacity" />
                  <div className="relative flex items-center bg-white border border-slate-200 rounded-xl overflow-hidden p-1 shadow-sm">
                    <input 
                      type="text"
                      placeholder="Enter College Code..."
                      value={accessCode}
                      onChange={(e) => setAccessCode(e.target.value)}
                      className="flex-1 bg-transparent border-none focus:ring-0 px-4 py-2 text-sm font-bold placeholder:font-normal uppercase"
                    />
                    <button 
                       type="submit"
                       disabled={isRedeeming}
                       className="bg-[#35008B] text-white px-5 py-2 rounded-lg text-xs font-bold transition hover:bg-slate-900 disabled:opacity-50"
                    >
                      {isRedeeming ? "Wait..." : "Apply"}
                    </button>
                  </div>
                  {redeemError && <p className="absolute -bottom-6 left-2 text-[10px] text-red-500 font-bold uppercase">{redeemError}</p>}
                </form>
              ) : (
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#f5f3ff] border border-[#ddd6fe] text-[#35008B]">
                  <RiShieldCheckFill className="animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-tight">Institution Verified: {collegeData.college_abbreviation}</span>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button 
                onClick={handleDownloadPNG} 
                disabled={isSharing}
                className="bg-white border-2 border-slate-200 px-5 py-2.5 rounded-xl text-slate-700 font-bold hover:bg-slate-50 transition-all shadow-sm flex items-center gap-2 text-sm disabled:opacity-50"
              >
                <FiShare2 className={isSharing ? "animate-spin" : "text-[#35008B]"} />
                Download PNG
              </button>
              <button 
                onClick={handleDownloadPDF} 
                className="bg-[#35008B] px-6 py-2.5 rounded-xl text-white font-bold hover:opacity-90 transition shadow-lg flex items-center gap-2 text-sm"
              >
                <FiDownload /> Download PDF
              </button>
            </div>
          </div>
        </div>

        {/* Certificate Canvas - STRICT HEX COLORS ONLY */}
        <div 
          className="relative transition-all duration-300 mx-auto"
          style={{ width: `${950 * scale}px`, height: `${670 * scale}px`, overflow: 'hidden' }}
        >
          <div 
            ref={certRef}
            id="cert-canvas"
            className="relative overflow-hidden"
            style={{ width: '950px', height: '670px', padding: '12px', background: '#35008B', transform: `scale(${scale})`, transformOrigin: 'top left', position: 'absolute', top: 0, left: 0, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}
          >
            <div className="w-full h-full relative flex flex-col items-center p-14 overflow-hidden" style={{ background: '#ffffff' }}>
              
              {/* Backdrop Watermark Logo */}
              <div 
                className="absolute pointer-events-none select-none"
                style={{ 
                  left: '50%', 
                  top: '55%', 
                  transform: 'translate(-50%, -50%)',
                  width: '550px',
                  opacity: 0.12
                }}
              >
                <img src={logoBase64} alt="" className="w-full h-auto" />
              </div>

              {/* Background Accents */}
              <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl" style={{ background: '#f8fafc', opacity: 0.5, zIndex: -1, transform: 'translate(50%, -50%)' }} />
              <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full blur-3xl" style={{ background: '#f5f3ff', opacity: 0.5, zIndex: -1, transform: 'translate(-50%, 50%)' }} />

              {/* Borders */}
              <div className="absolute inset-4 border-[1px]" style={{ borderColor: '#35008B', opacity: 0.1 }} />
              <div className="absolute inset-6 border-[2px]" style={{ borderColor: '#DAA520', opacity: 0.3 }} />

              {/* Header Logo - Border Safe */}
              <div className="absolute top-12 left-16 z-20">
                <img src={logoBase64} alt="Logo" className="h-16 object-contain" />
              </div>

              {/* Body Content - High Stability Architecture */}
              <div className="flex-1 flex flex-col items-center justify-center text-center px-12 relative z-10 w-full pt-0 pb-32">
                <div className="mb-0">
                  <div className="flex justify-center mb-1">
                    <RiAwardFill size={54} color="#DAA520" />
                  </div>
                  <h4 className="text-lg font-black uppercase tracking-[0.4em] mb-1" style={{ color: '#DAA520' }}>TRANSFORMATION COMPLETE</h4>
                  <p className="text-sm font-bold italic" style={{ color: '#64748b', opacity: 0.9 }}>This honors the achievement of</p>
                  <div className="w-40 h-[1px] mx-auto mt-2" style={{ background: '#DAA520', opacity: 0.6 }} />
                </div>
                
                <div className="mb-14">
                  <h2 className="text-7xl font-normal font-['Alex_Brush',_cursive] capitalize leading-none" style={{ color: '#0f172a' }}>
                    {certName || "Valued Candidate"}
                  </h2>
                </div>

                <div className="mb-8">
                   <p className="text-[13px] font-bold uppercase tracking-[0.2em]" style={{ color: '#35008B' }}>
                      {collegeData ? `${collegeData.branch_name} • ${collegeData.college_name}` : "Career Copilot Global Fellow"}
                   </p>
                </div>

                <div className="max-w-3xl px-4">
                   <p className="text-base font-bold mb-3 tracking-tight" style={{ color: '#1e293b' }}>
                      For the successful completion of the Career Copilot Accelerator.
                   </p>
                   <p className="text-sm leading-relaxed font-medium" style={{ color: '#475569' }}>
                      By mastering the art of AI-driven resume engineering, the recipient has developed a professional profile optimized for modern recruitment ecosystems. The holder of this certificate is formally designated as AI-Ready, possessing a resume specifically built to navigate advanced screening models and resonate with top-tier industry standards.
                   </p>
                </div>
              </div>

              {/* Footer Section - Border Safe Row */}
              <div className="absolute bottom-12 left-16 right-16 h-20 z-20">
                {/* Left: Issue Date */}
                <div className="absolute left-0 bottom-0 text-center flex flex-col items-center">
                   {/* Verification Shield */}
                   <div className="mb-2 w-10 h-10 rounded-full bg-white border-2 border-[#DAA520] flex items-center justify-center shadow-sm">
                      <RiShieldCheckFill size={24} className="text-[#35008B]" />
                   </div>
                   <div className="relative z-10">
                      <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: '#64748b' }}>Issue Date</p>
                      <p className="text-sm font-bold" style={{ color: '#0f172a' }}>{issueDate || "Processing..."}</p>
                   </div>
                </div>

                {/* Middle: Official Stamp */}
                <div className="absolute left-1/2 bottom-0 -translate-x-1/2 flex items-center justify-center">
                  <img src={stampBase64} alt="Official Seal" className="h-22 w-auto object-contain" style={{ opacity: 0.9, filter: 'contrast(1.2) saturate(1.2)' }} />
                </div>

                {/* Right: CEO Signature */}
                <div className="absolute right-0 bottom-0 flex flex-col items-end text-right">
                  <div className="relative mb-1 pr-2">
                    <p className="text-[28px] font-['Caveat',_cursive] leading-none italic whitespace-nowrap" style={{ color: '#35008B' }}>
                      Dr.TM Praneeth Naidu
                    </p>
                  </div>
                  <p className="text-[11px] font-black uppercase tracking-tighter" style={{ color: '#0f172a' }}>DR.TM PRANEETH NAIDU</p>
                  <p className="text-[9px] font-bold uppercase tracking-widest" style={{ color: '#64748b' }}>Chief Executive Officer, Cognisys Ai</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page { size: landscape; margin: 0 !important; }
          html, body { height: 100vh !important; margin: 0 !important; padding: 0 !important; overflow: hidden !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          .no-print { display: none !important; }
          #cert-canvas { box-shadow: none !important; margin: 0 !important; border: none !important; width: 100vw !important; height: 100vh !important; transform: none !important; position: fixed !important; top: 0 !important; left: 0 !important; display: flex !important; align-items: center !important; justify-content: center !important; z-index: 9999999 !important; }
           #cert-canvas > div { width: 100% !important; height: 100% !important; border: none !important; padding: 40px !important; }
        }
      `}} />
    </div>
  );
};

export default Certificate;
