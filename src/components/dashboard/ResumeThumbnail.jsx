import React from "react";
import ClassicTemplate from "../resume/templates/ClassicTemplate";
import ModernTemplate from "../resume/templates/ModernTemplate";
import ModernTemplateLite from "../resume/templates/ModernTemplate"; // Testing if we can use them directly
import MinimalTemplate from "../resume/templates/MinimalTemplate";
import FresherTemplate from "../resume/templates/FresherTemplate";
import { readModelToResumeData } from "../../services/resumeReadModelApi";

const TemplateMap = {
  classic: ClassicTemplate,
  modern: ModernTemplate,
  minimal: MinimalTemplate,
  fresher: FresherTemplate,
};

const SkeletonBar = ({ className = "" }) => (
  <div className={`h-2 bg-slate-200/60 rounded ${className} animate-pulse`} />
);

const TemplateSkeleton = ({ templateName }) => {
  const isModern = templateName === "modern";
  
  return (
    <div className="w-full h-full p-6 bg-white flex flex-col gap-4">
      {/* Header Skeleton */}
      <div className={`flex flex-col ${isModern ? "items-start" : "items-center"} gap-2 mb-2`}>
        <div className="h-6 w-1/2 bg-slate-200 rounded animate-pulse" />
        <div className="h-3 w-1/3 bg-slate-100 rounded animate-pulse" />
      </div>
      
      <div className={`flex ${isModern ? "flex-row" : "flex-col"} gap-6 h-full`}>
        {/* Sidebar for Modern */}
        {isModern && (
          <div className="w-1/3 flex flex-col gap-4 border-r border-slate-100 pr-4">
            <div className="space-y-2">
              <div className="h-3 w-full bg-slate-200/50 rounded" />
              <div className="h-2 w-3/4 bg-slate-100" />
              <div className="h-2 w-1/2 bg-slate-100" />
            </div>
            <div className="space-y-2">
              <div className="h-3 w-full bg-slate-200/50 rounded" />
              <div className="h-2 w-3/4 bg-slate-100" />
            </div>
          </div>
        )}
        
        {/* Main Content Areas */}
        <div className="flex-1 space-y-5">
          {[1, 2, 3].map(i => (
            <div key={i} className="space-y-2">
              <div className="h-3 w-1/4 bg-slate-200/80 rounded" />
              <div className="space-y-1.5">
                <SkeletonBar className="w-full" />
                <SkeletonBar className="w-11/12" />
                <SkeletonBar className="w-10/12 opacity-50" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const ResumeThumbnail = ({ resume, documentJson }) => {
  const templateName = (resume?.template_name || "classic").toLowerCase();
  
  // If NO snapshot data exists yet, render the skeleton immediately
  if (!documentJson) {
    return (
      <div className="relative w-full aspect-[1/1.414] bg-slate-100 rounded-sm overflow-hidden border border-slate-200/60 shadow-inner group-hover:shadow-md transition-shadow flex justify-center">
        <div 
          className="absolute top-0 origin-top"
          style={{ width: "794px", height: "1123px", transform: "scale(0.3)" }}
        >
          <TemplateSkeleton templateName={templateName} />
        </div>
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-100/80 to-transparent h-12 flex items-end justify-center pb-2">
          <span className="text-[9px] font-bold text-slate-400 tracking-tight uppercase px-2 py-0.5 bg-white/50 rounded">
            Preview Pending (Open to Sync)
          </span>
        </div>
      </div>
    );
  }

  const TemplateComponent = TemplateMap[templateName] || ClassicTemplate;
  const resumeData = readModelToResumeData(documentJson);

  return (
    <div className="relative w-full aspect-[1/1.414] bg-slate-100 rounded-sm overflow-hidden border border-slate-200/60 shadow-inner group-hover:shadow-md transition-shadow flex justify-center">
      {/* Scaling Container */}
      <div 
        className="absolute top-0 origin-top"
        style={{ 
          width: "794px", 
          height: "1123px", 
          transform: "scale(0.3)", 
          pointerEvents: "none", 
          userSelect: "none",
        }}
      >
        <div className="bg-white h-full w-full shadow-2xl">
          <TemplateComponent resumeData={resumeData} isPreview={true} />
        </div>
      </div>
      
      {/* Glass Overlay for Premium Feel */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/5 pointer-events-none" />
      
      {/* Template Badge */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="px-1.5 py-0.5 bg-white/90 backdrop-blur-sm border border-slate-200 text-[9px] font-bold text-slate-500 rounded uppercase tracking-wider shadow-sm">
          {templateName}
        </span>
      </div>
    </div>
  );
};

export default ResumeThumbnail;
