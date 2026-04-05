import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

const ROLE_PERMS = {
  owner: { manageMembers:true, manageFeedback:true, addFeedback:true, viewFeedback:true, deleteProject:true },
  admin: { manageMembers:true, manageFeedback:true, addFeedback:true, viewFeedback:true, deleteProject:false },
  editor: { manageMembers:false, manageFeedback:false, addFeedback:true, viewFeedback:true, deleteProject:false },
  member: { manageMembers:false, manageFeedback:false, addFeedback:true, viewFeedback:true, deleteProject:false },
  viewer: { manageMembers:false, manageFeedback:false, addFeedback:false, viewFeedback:true, deleteProject:false },
};
const ROLE_LABELS = {owner:"Owner",admin:"Admin",editor:"Editor",member:"Member",viewer:"Viewer"};
const DEVICES = [{id:"desktop",label:"Desktop",width:"100%",px:1440,icon:"M"},{id:"tablet",label:"Tablet",width:"768px",px:768,icon:"T"},{id:"mobile",label:"Mobile",width:"375px",px:375,icon:"P"}];
const PRIORITIES = [{id:"high",label:"High",color:"#EF4444",bg:"#FEF2F2"},{id:"medium",label:"Medium",color:"#F59E0B",bg:"#FFFBEB"},{id:"low",label:"Low",color:"#6B7280",bg:"#F3F4F6"}];
const SORT_OPTIONS = [{id:"newest",label:"Latest"},{id:"oldest",label:"Oldest"},{id:"priority",label:"Priority"}];
const ADMIN_EMAIL = "admin@nexxenstudio.com";
const LOGO_SRC = "data:image/png;base64,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";
const fmtDate = d => new Date(d).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"});
const fmtTime = d => new Date(d).toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"});
const fmtFull = d => fmtDate(d)+" at "+fmtTime(d);
const fmtRelative = d => {const diff=Date.now()-new Date(d).getTime();const m=Math.floor(diff/60000);if(m<1)return"Just now";if(m<60)return m+"m ago";const h=Math.floor(m/60);if(h<24)return h+"h ago";const dy=Math.floor(h/24);if(dy<7)return dy+"d ago";return fmtDate(d);};
const priOrder = {high:0,medium:1,low:2};

const DB = {
  async findUserByLogin(q,pw){if(!supabase)return null;try{const{data}=await supabase.from("users").select("*").or(`name.eq.${q},email.eq.${q}`).eq("password",pw).limit(1).single();return data||null;}catch(e){console.error("Login error:",e);return null;}},
  async findUserByEmail(e){if(!supabase)return null;try{const{data}=await supabase.from("users").select("*").eq("email",e).limit(1).single();return data||null;}catch{return null;}},
  async createUser(u){if(!supabase)return null;try{const{data,error}=await supabase.from("users").insert(u).select().single();if(error)console.error("Create user error:",error);return data;}catch(e){console.error(e);return null;}},
  getSession(){try{return JSON.parse(localStorage.getItem("nc-session"));}catch{return null;}},
  setSession(u){localStorage.setItem("nc-session",JSON.stringify(u));},
  clearSession(){localStorage.removeItem("nc-session");},
  getTheme(){return localStorage.getItem("nc-theme")||"light";},
  setTheme(t){localStorage.setItem("nc-theme",t);},
  async getProject(id){if(!supabase)return null;const{data}=await supabase.from("projects").select("*").eq("id",id).single();return data;},
  async getProjectsForUser(uid,email,isSuper){
    if(!supabase)return[];
    if(isSuper){const{data}=await supabase.from("projects").select("*").order("updated_at",{ascending:false});return data||[];}
    const{data:owned}=await supabase.from("projects").select("*").eq("owner_id",uid).order("updated_at",{ascending:false});
    const{data:mems}=await supabase.from("members").select("project_id").or(`user_id.eq.${uid},email.eq.${email}`);
    const mIds=(mems||[]).map(m=>m.project_id).filter(id=>!(owned||[]).find(p=>p.id===id));
    let mp=[];if(mIds.length>0){const{data}=await supabase.from("projects").select("*").in("id",mIds);mp=data||[];}
    return[...(owned||[]),...mp].sort((a,b)=>new Date(b.updated_at)-new Date(a.updated_at));
  },
  async createProject(p){if(!supabase)return null;const{data}=await supabase.from("projects").insert(p).select().single();return data;},
  async updateProject(id,u){if(supabase)await supabase.from("projects").update({...u,updated_at:new Date().toISOString()}).eq("id",id);},
  async deleteProject(id){if(supabase)await supabase.from("projects").delete().eq("id",id);},
  async getMembers(pid){if(!supabase)return[];const{data}=await supabase.from("members").select("*").eq("project_id",pid).order("added_at");return data||[];},
  async addMember(m){if(!supabase)return null;const{data}=await supabase.from("members").insert(m).select().single();return data;},
  async removeMember(pid,email){if(supabase)await supabase.from("members").delete().eq("project_id",pid).eq("email",email);},
  async updateMemberRole(pid,email,role){if(supabase)await supabase.from("members").update({role}).eq("project_id",pid).eq("email",email);},
  async getPins(pid){
    if(!supabase)return[];
    const{data:pins}=await supabase.from("pins").select("*").eq("project_id",pid).order("created_at");
    if(!pins||!pins.length)return[];
    const ids=pins.map(p=>p.id);
    const{data:cmts}=await supabase.from("comments").select("*").in("pin_id",ids).order("created_at");
    return pins.map(p=>({...p,comments:(cmts||[]).filter(c=>c.pin_id===p.id).map(c=>({author:c.author,text:c.body,timestamp:c.created_at,attachmentName:c.attachment_name,attachmentData:c.attachment_data,attachmentType:c.attachment_type}))}));
  },
  async createPin(p){if(!supabase)return null;try{const{data,error}=await supabase.from("pins").insert({project_id:p.project_id,x:p.x,y:p.y,status:p.status,priority:p.priority||"medium",screenshot:p.screenshot||null,device:p.device||"desktop"}).select().single();if(error){console.error("Create pin error:",error);return null;}return data;}catch(e){console.error("Pin exception:",e);return null;}},
  async updatePinStatus(id,s){if(supabase)await supabase.from("pins").update({status:s}).eq("id",id);},
  async updatePinPriority(id,p){if(supabase)await supabase.from("pins").update({priority:p}).eq("id",id);},
  async updatePinScreenshot(id,s){if(supabase)await supabase.from("pins").update({screenshot:s}).eq("id",id);},
  async deletePin(id){if(supabase)await supabase.from("pins").delete().eq("id",id);},
  async addComment(pinId,author,text,attName,attData,attType){
    if(!supabase)return null;
    try{const row={pin_id:pinId,author,body:text};
    if(attName){row.attachment_name=attName;row.attachment_data=attData;row.attachment_type=attType;}
    const{data,error}=await supabase.from("comments").insert(row).select().single();
    if(error)console.error("Comment error:",error);return data;}catch(e){console.error(e);return null;}
  },
};

// ─── Theme (Prodify-inspired purple/lavender) ───
const themes = {
  light: {
    bg:"#F6F4FB",bgAlt:"#FFFFFF",bgMuted:"#EFECF7",bgHover:"#E8E4F2",sidebar:"#FDFCFF",
    border:"#E4E0EF",borderLight:"#F0EDF8",borderFocus:"#8B5CF6",
    text:"#1E1B2E",textSecondary:"#6B6580",textMuted:"#9E97B3",textInverse:"#FFFFFF",
    accent:"#8B5CF6",accentHover:"#7C3AED",accentLight:"#EDE9FE",accentMuted:"rgba(139,92,246,0.06)",
    accentSoft:"#C4B5FD",
    primary:"#1E1B2E",primaryHover:"#2D2945",
    success:"#10B981",successLight:"#D1FAE5",successBorder:"#6EE7B7",
    danger:"#EF4444",dangerLight:"#FEE2E2",dangerBorder:"#FECACA",
    warn:"#F59E0B",warnLight:"#FEF3C7",
    info:"#3B82F6",infoLight:"#DBEAFE",
    shadow:"0 1px 3px rgba(30,27,46,0.04),0 1px 2px rgba(30,27,46,0.03)",
    shadowLg:"0 4px 20px rgba(30,27,46,0.08)",shadowXl:"0 12px 40px rgba(30,27,46,0.12)",
    overlay:"rgba(30,27,46,0.3)",canvasBg:"#EEEAF6",
    pinOpen:"#EF4444",pinResolved:"#10B981",
    cardGradient:"linear-gradient(135deg,#F6F4FB 0%,#EDE9FE 100%)",
  },
  dark: {
    bg:"#110F1A",bgAlt:"#1A1726",bgMuted:"#221F30",bgHover:"#2D2940",sidebar:"#16132A",
    border:"rgba(255,255,255,0.07)",borderLight:"rgba(255,255,255,0.04)",borderFocus:"#A78BFA",
    text:"#F0EDF8",textSecondary:"#A09AB3",textMuted:"#6B6580",textInverse:"#110F1A",
    accent:"#A78BFA",accentHover:"#C4B5FD",accentLight:"rgba(167,139,250,0.12)",accentMuted:"rgba(167,139,250,0.05)",
    accentSoft:"#7C3AED",
    primary:"#F0EDF8",primaryHover:"#FFFFFF",
    success:"#34D399",successLight:"rgba(52,211,153,0.12)",successBorder:"rgba(52,211,153,0.2)",
    danger:"#F87171",dangerLight:"rgba(248,113,113,0.12)",dangerBorder:"rgba(248,113,113,0.2)",
    warn:"#FBBF24",warnLight:"rgba(251,191,36,0.12)",
    info:"#60A5FA",infoLight:"rgba(96,165,250,0.12)",
    shadow:"0 1px 3px rgba(0,0,0,0.4)",shadowLg:"0 4px 20px rgba(0,0,0,0.5)",shadowXl:"0 12px 40px rgba(0,0,0,0.6)",
    overlay:"rgba(0,0,0,0.6)",canvasBg:"#0E0C17",
    pinOpen:"#F87171",pinResolved:"#34D399",
    cardGradient:"linear-gradient(135deg,#1A1726 0%,#221F30 100%)",
  },
};

const Icon = ({name,size=16,color="currentColor"}) => {
  const d={
    plus:<><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>,
    back:<><polyline points="15 18 9 12 15 6"/></>,
    pin:<><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></>,
    share:<><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></>,
    users:<><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>,
    trash:<><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></>,
    check:<><polyline points="20 6 9 17 4 12"/></>,
    x:<><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>,
    camera:<><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></>,
    monitor:<><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></>,
    tablet:<><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></>,
    phone:<><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></>,
    message:<><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></>,
    image:<><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></>,
    globe:<><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></>,
    sun:<><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></>,
    moon:<><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></>,
    link:<><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></>,
    upload:<><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></>,
    logout:<><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></>,
    send:<><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></>,
    paperclip:<><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></>,
    download:<><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></>,
    filter:<><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></>,
    sort:<><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></>,
    flag:<><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></>,
    alert:<><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></>,
    grid:<><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></>,
    home:<><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></>,
    eye:<><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}>{d[name]}</svg>;
};

// ─── Screenshot with pin marker ───
function captureRegion(src,px,py,pinNum,cb){
  const img=new Image();img.crossOrigin="anonymous";
  img.onload=()=>{const c=document.createElement("canvas"),x=c.getContext("2d");c.width=360;c.height=220;
    const sx=Math.max(0,Math.min((px/100)*img.width-180,img.width-360));
    const sy=Math.max(0,Math.min((py/100)*img.height-110,img.height-220));
    x.drawImage(img,sx,sy,360,220,0,0,360,220);
    // Darkened overlay around pin
    x.fillStyle="rgba(0,0,0,0.15)";x.fillRect(0,0,360,220);
    // Spotlight circle around pin
    const mx=(px/100)*img.width-sx,my=(py/100)*img.height-sy;
    x.save();x.globalCompositeOperation="destination-out";x.beginPath();x.arc(mx,my,40,0,Math.PI*2);x.fill();x.restore();
    // Pin marker
    x.fillStyle="#8B5CF6";x.strokeStyle="#fff";x.lineWidth=2;x.beginPath();x.arc(mx,my,12,0,Math.PI*2);x.fill();x.stroke();
    x.fillStyle="#fff";x.font="bold 11px sans-serif";x.textAlign="center";x.textBaseline="middle";x.fillText(String(pinNum),mx,my);
    // Border
    x.strokeStyle="rgba(139,92,246,0.5)";x.lineWidth=2;x.strokeRect(1,1,358,218);
    cb(c.toDataURL("image/jpeg",0.5));};
  img.onerror=()=>cb(null);img.src=src;
}
function genIframeShot(url,px,py,pinNum,cb){
  const c=document.createElement("canvas"),x=c.getContext("2d");c.width=360;c.height=220;
  // Browser mockup
  x.fillStyle="#F6F4FB";x.fillRect(0,0,360,220);
  x.fillStyle="#fff";x.fillRect(0,0,360,32);
  x.strokeStyle="#E4E0EF";x.lineWidth=1;x.beginPath();x.moveTo(0,32);x.lineTo(360,32);x.stroke();
  [["#FF5F57",14],["#FFBD2E",28],["#28CA42",42]].forEach(([cl,cx])=>{x.fillStyle=cl;x.beginPath();x.arc(cx,16,4,0,Math.PI*2);x.fill();});
  x.fillStyle="#EFECF7";x.beginPath();x.roundRect(54,7,250,18,4);x.fill();
  x.fillStyle="#9E97B3";x.font="10px sans-serif";x.textAlign="left";
  x.fillText(url.length>38?url.substring(0,38)+"...":url,62,20);
  // Content lines
  x.fillStyle="#E4E0EF";for(let i=0;i<7;i++){x.beginPath();x.roundRect(18,44+i*22,100+Math.random()*180,8,3);x.fill();}
  // Pin marker
  const mx=(px/100)*360,my=32+(py/100)*188;
  x.fillStyle="#8B5CF6";x.strokeStyle="#fff";x.lineWidth=2;x.beginPath();x.arc(mx,my,14,0,Math.PI*2);x.fill();x.stroke();
  x.fillStyle="#fff";x.font="bold 12px sans-serif";x.textAlign="center";x.textBaseline="middle";x.fillText(String(pinNum),mx,my);
  // Crosshair lines
  x.strokeStyle="rgba(139,92,246,0.3)";x.lineWidth=1;x.setLineDash([4,4]);
  x.beginPath();x.moveTo(mx,32);x.lineTo(mx,220);x.stroke();
  x.beginPath();x.moveTo(0,my);x.lineTo(360,my);x.stroke();
  // Label
  x.setLineDash([]);x.fillStyle="rgba(139,92,246,0.85)";x.beginPath();x.roundRect(mx-50,my+20,100,20,4);x.fill();
  x.fillStyle="#fff";x.font="10px sans-serif";x.fillText(Math.round(px)+"%, "+Math.round(py)+"%",mx,my+30);
  cb(c.toDataURL("image/jpeg",0.5));
}

// ─── Main Application ───
export default function NexxenCommenter() {
  const [theme,setTheme]=useState("light");
  const [user,setUser]=useState(null);
  const [view,setView]=useState("loading");
  const [projects,setProjects]=useState([]);
  const [currentProject,setCurrentProject]=useState(null);
  const [pins,setPins]=useState([]);
  const [members,setMembers]=useState([]);
  const [selectedDevice,setSelectedDevice]=useState("desktop");
  const [deviceFilter,setDeviceFilter]=useState("all");
  const [selectedPin,setSelectedPin]=useState(null);
  const [isPlacingPin,setIsPlacingPin]=useState(false);
  const [pendingPinPos,setPendingPinPos]=useState(null);
  const [newComment,setNewComment]=useState("");
  const [newAuthor,setNewAuthor]=useState("");
  const [newPriority,setNewPriority]=useState("medium");
  const [filterStatus,setFilterStatus]=useState("all");
  const [sortBy,setSortBy]=useState("newest");
  const [sidebarOpen,setSidebarOpen]=useState(true);
  const [showNewProject,setShowNewProject]=useState(false);
  const [showMembers,setShowMembers]=useState(false);
  const [showScreenshot,setShowScreenshot]=useState(null);
  const [newProjectName,setNewProjectName]=useState("");
  const [newProjectUrl,setNewProjectUrl]=useState("");
  const [newProjectType,setNewProjectType]=useState("url");
  const [uploadedImage,setUploadedImage]=useState(null);
  const [toast,setToast]=useState("");
  const [loginForm,setLoginForm]=useState({name:"",email:"",password:""});
  const [authMode,setAuthMode]=useState("login");
  const [iframeLoaded,setIframeLoaded]=useState(false);
  const [newMemberEmail,setNewMemberEmail]=useState("");
  const [newMemberRole,setNewMemberRole]=useState("member");
  const [clientProject,setClientProject]=useState(null);
  const [clientMode,setClientMode]=useState(false);
  const [clientPerms,setClientPerms]=useState(null);
  const [attachment,setAttachment]=useState(null);
  const fileInputRef=useRef(null);
  const attachRef=useRef(null);
  const iframeRef=useRef(null);
  const t=themes[theme];
  const showToast=msg=>{setToast(msg);setTimeout(()=>setToast(""),3000);};
  const css="@keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}@keyframes slideUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}@keyframes spin{to{transform:rotate(360deg)}}@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}";
  const fontLink="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap";

  // ─── Init ───
  useEffect(()=>{(async()=>{
    if(!supabase){setView("error");return;}
    setTheme(DB.getTheme());
    const hash=window.location.hash;
    if(hash.startsWith("#/review/")){
      const p=hash.replace("#/review/","").split("/");
      const proj=await DB.getProject(p[0]);
      if(proj){const fb=await DB.getPins(proj.id);const ms=await DB.getMembers(proj.id);const acc=ms.find(m=>m.token===(p[1]||""));
        setClientProject(proj);setPins(fb);setMembers(ms);setClientPerms(acc?ROLE_PERMS[acc.role]:ROLE_PERMS.viewer);setClientMode(true);setView("project");}
      else setView("auth");return;}
    const s=DB.getSession();
    if(s){setUser(s);setProjects(await DB.getProjectsForUser(s.id,s.email,s.email===ADMIN_EMAIL));setView("dashboard");}
    else setView("auth");
  })();},[]);

  // ─── Auth ───
  const handleAuth=async()=>{
    if(!loginForm.name.trim()||!loginForm.password.trim())return;
    if(authMode==="register"){
      if(!loginForm.email.trim())return;
      if(await DB.findUserByEmail(loginForm.email.trim())){showToast("Email already exists.");return;}
      const u=await DB.createUser({name:loginForm.name.trim(),email:loginForm.email.trim(),password:loginForm.password,role:"user"});
      if(u){DB.setSession(u);setUser(u);setProjects([]);setView("dashboard");}
    }else{
      const u=await DB.findUserByLogin(loginForm.name.trim(),loginForm.password);
      if(u){DB.setSession(u);setUser(u);setProjects(await DB.getProjectsForUser(u.id,u.email,u.email===ADMIN_EMAIL));setView("dashboard");}
      else showToast("Invalid credentials.");
    }
  };
  const handleLogout=()=>{DB.clearSession();setUser(null);setView("auth");setCurrentProject(null);setProjects([]);};

  // ─── Projects ───
  const createProject=async()=>{
    if(!newProjectName.trim())return;
    const p=await DB.createProject({name:newProjectName.trim(),url:newProjectType==="url"?newProjectUrl.trim():"",type:newProjectType,image_data:newProjectType==="image"?uploadedImage:null,owner_id:user.id,owner_name:user.name,feedback_count:0});
    if(p){await DB.addMember({project_id:p.id,user_id:user.id,name:user.name,email:user.email,role:"owner"});
      setProjects(prev=>[p,...prev]);setShowNewProject(false);setNewProjectName("");setNewProjectUrl("");setUploadedImage(null);openProject(p);}
  };
  const openProject=async p=>{setCurrentProject(p);setPins(await DB.getPins(p.id));setMembers(await DB.getMembers(p.id));setSelectedPin(null);setIframeLoaded(false);setView("project");};
  const deleteProject=async id=>{await DB.deleteProject(id);setProjects(prev=>prev.filter(p=>p.id!==id));showToast("Project deleted.");};

  // ─── Members ───
  const addMember=async()=>{if(!newMemberEmail.trim())return;const proj=currentProject||clientProject;if(!proj)return;
    const m=await DB.addMember({project_id:proj.id,user_id:null,name:newMemberEmail.split("@")[0],email:newMemberEmail.trim(),role:newMemberRole});
    if(m){setMembers(prev=>[...prev,m]);setNewMemberEmail("");showToast("Member added as "+ROLE_LABELS[newMemberRole]+".");}};
  const removeMember=async email=>{const p=currentProject||clientProject;if(p){await DB.removeMember(p.id,email);setMembers(prev=>prev.filter(m=>m.email!==email));}};
  const updateMemberRole=async(email,role)=>{const p=currentProject||clientProject;if(p){await DB.updateMemberRole(p.id,email,role);setMembers(prev=>prev.map(m=>m.email===email?{...m,role}:m));}};

  // ─── Pins & Comments ───
  const handleCanvasClick=e=>{if(!isPlacingPin)return;const r=e.currentTarget.getBoundingClientRect();setPendingPinPos({x:((e.clientX-r.left)/r.width)*100,y:((e.clientY-r.top)/r.height)*100});setIsPlacingPin(false);};

  const submitNewPin=async()=>{
    if(!newComment.trim()||!pendingPinPos)return;
    const proj=currentProject||clientProject;if(!proj)return;
    const author=clientMode?(newAuthor.trim()||"Guest"):(user?.name||"Anonymous");
    const pin=await DB.createPin({project_id:proj.id,x:pendingPinPos.x,y:pendingPinPos.y,status:"open",priority:newPriority,screenshot:null,device:selectedDevice});
    if(!pin){showToast("Failed to create pin. Check browser console for details.");return;}
    // Add comment with optional attachment
    let aName=null,aData=null,aType=null;
    if(attachment){aName=attachment.name;aData=attachment.data;aType=attachment.type;}
    await DB.addComment(pin.id,author,newComment.trim(),aName,aData,aType);
    // Screenshot
    const num=pins.length+1;
    const saveShot=d=>{if(d){DB.updatePinScreenshot(pin.id,d);setPins(prev=>prev.map(p=>p.id===pin.id?{...p,screenshot:d}:p));}};
    if(proj.type==="image"&&proj.image_data)captureRegion(proj.image_data,pendingPinPos.x,pendingPinPos.y,num,saveShot);
    else if(proj.type==="url"&&proj.url)genIframeShot(proj.url,pendingPinPos.x,pendingPinPos.y,num,saveShot);
    const cmt={author,text:newComment.trim(),timestamp:new Date().toISOString(),attachmentName:aName,attachmentData:aData,attachmentType:aType};
    setPins(prev=>[...prev,{...pin,comments:[cmt]}]);
    setPendingPinPos(null);setNewComment("");setNewPriority("medium");setAttachment(null);setSelectedPin(pin.id);
    if(currentProject){const nc=(currentProject.feedback_count||0)+1;await DB.updateProject(currentProject.id,{feedback_count:nc});
      const up={...currentProject,feedback_count:nc};setCurrentProject(up);setProjects(prev=>prev.map(p=>p.id===up.id?up:p));}
  };

  const handleReply=async(pinId,text,author,att)=>{
    let aName=null,aData=null,aType=null;if(att){aName=att.name;aData=att.data;aType=att.type;}
    await DB.addComment(pinId,author,text,aName,aData,aType);
    setPins(prev=>prev.map(p=>p.id===pinId?{...p,comments:[...p.comments,{author,text,timestamp:new Date().toISOString(),attachmentName:aName,attachmentData:aData,attachmentType:aType}]}:p));
  };
  const handleResolve=async pinId=>{const p=pins.find(x=>x.id===pinId);if(!p)return;const ns=p.status==="resolved"?"open":"resolved";await DB.updatePinStatus(pinId,ns);setPins(prev=>prev.map(x=>x.id===pinId?{...x,status:ns}:x));};
  const handleChangePriority=async(pinId,pri)=>{await DB.updatePinPriority(pinId,pri);setPins(prev=>prev.map(x=>x.id===pinId?{...x,priority:pri}:x));};
  const handleDeletePin=async pinId=>{await DB.deletePin(pinId);setPins(prev=>prev.filter(p=>p.id!==pinId));if(selectedPin===pinId)setSelectedPin(null);};
  const copyShareLink=tok=>{const p=currentProject||clientProject;if(!p)return;const token=tok||members.find(m=>m.role==="owner")?.token||"";navigator.clipboard.writeText(window.location.origin+window.location.pathname+"#/review/"+p.id+"/"+token).then(()=>showToast("Link copied.")).catch(()=>showToast("Could not copy."));};
  const handleImageUpload=e=>{const f=e.target.files?.[0];if(!f)return;const r=new FileReader();r.onload=async ev=>{if(showNewProject)setUploadedImage(ev.target.result);else if(currentProject){await DB.updateProject(currentProject.id,{image_data:ev.target.result,type:"image"});setCurrentProject(prev=>({...prev,image_data:ev.target.result,type:"image"}));}};r.readAsDataURL(f);};
  const handleAttach=e=>{const f=e.target.files?.[0];if(!f||f.size>5*1024*1024){showToast("File must be under 5MB.");return;}const r=new FileReader();r.onload=ev=>{setAttachment({name:f.name,data:ev.target.result,type:f.type});};r.readAsDataURL(f);};
  const toggleTheme=()=>{const n=theme==="light"?"dark":"light";setTheme(n);DB.setTheme(n);};

  // ─── Filtered & Sorted Pins ───
  const processedPins=useMemo(()=>{
    let fp=pins.filter(p=>{
      if(filterStatus==="open"&&p.status!=="open")return false;
      if(filterStatus==="resolved"&&p.status!=="resolved")return false;
      if(["high","medium","low"].includes(filterStatus)&&p.priority!==filterStatus)return false;
      if(deviceFilter!=="all"&&p.device!==deviceFilter)return false;
      return true;
    });
    if(sortBy==="newest")fp.sort((a,b)=>new Date(b.created_at)-new Date(a.created_at));
    else if(sortBy==="oldest")fp.sort((a,b)=>new Date(a.created_at)-new Date(b.created_at));
    else if(sortBy==="priority")fp.sort((a,b)=>(priOrder[a.priority]||1)-(priOrder[b.priority]||1));
    return fp;
  },[pins,filterStatus,deviceFilter,sortBy]);

  const activeProj=currentProject||clientProject;
  const projImage=activeProj?.image_data;const projUrl=activeProj?.url;const projType=activeProj?.type;
  const isSuperAdmin=user?.email===ADMIN_EMAIL;
  const userRole=useMemo(()=>{
    if(clientPerms)return clientPerms;if(!user||!members.length)return ROLE_PERMS.viewer;
    if(isSuperAdmin)return ROLE_PERMS.owner;
    const m=members.find(x=>x.user_id===user.id||x.email===user.email);
    return m?ROLE_PERMS[m.role]||ROLE_PERMS.viewer:ROLE_PERMS.viewer;
  },[user,members,clientPerms,isSuperAdmin]);

  // ─── Styles ───
  const S={
    page:{minHeight:"100vh",background:t.bg,color:t.text,fontFamily:"'Plus Jakarta Sans',sans-serif",transition:"background .3s,color .3s"},
    header:{background:t.bgAlt,borderBottom:"1px solid "+t.border,padding:"0 20px",display:"flex",alignItems:"center",justifyContent:"space-between",height:54,position:"sticky",top:0,zIndex:100},
    logoMark:{background:"linear-gradient(135deg,#8B5CF6,#6D28D9)",width:32,height:32,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",padding:0},
    btn:{background:"linear-gradient(135deg,#8B5CF6,#7C3AED)",border:"none",color:"#fff",borderRadius:10,padding:"8px 18px",fontSize:13,cursor:"pointer",fontWeight:600,display:"flex",alignItems:"center",gap:6,boxShadow:"0 2px 8px rgba(139,92,246,0.25)"},
    btnGhost:{background:"transparent",border:"1px solid "+t.border,color:t.textSecondary,borderRadius:10,padding:"7px 14px",fontSize:13,cursor:"pointer",fontWeight:500,display:"flex",alignItems:"center",gap:6,transition:"all .15s"},
    btnDanger:{background:t.dangerLight,border:"1px solid "+t.dangerBorder,color:t.danger,borderRadius:10,padding:"7px 14px",fontSize:13,cursor:"pointer",fontWeight:500},
    input:{width:"100%",boxSizing:"border-box",background:t.bgMuted,border:"1px solid "+t.border,borderRadius:10,padding:"10px 14px",color:t.text,fontSize:13,outline:"none",fontFamily:"'Plus Jakarta Sans',sans-serif"},
    card:{background:t.bgAlt,borderRadius:14,border:"1px solid "+t.border,overflow:"hidden",transition:"box-shadow .2s,transform .2s",cursor:"pointer"},
    modal:{position:"fixed",inset:0,background:t.overlay,display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,backdropFilter:"blur(8px)"},
    modalContent:{background:t.bgAlt,borderRadius:18,padding:28,width:480,border:"1px solid "+t.border,boxShadow:t.shadowXl},
    label:{fontSize:12,color:t.textSecondary,fontWeight:600,display:"block",marginBottom:5},
    badge:(c,bg)=>({background:bg,color:c,padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:600,display:"inline-flex",alignItems:"center",gap:4}),
    pill:{padding:"4px 12px",borderRadius:20,fontSize:11,fontWeight:600,cursor:"pointer",border:"1px solid transparent",transition:"all .15s"},
  };
  const Logo=({size=32})=><div style={{...S.logoMark,width:size,height:size}}><img src={LOGO_SRC} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/></div>;
  const PriBadge=({pri})=>{const p=PRIORITIES.find(x=>x.id===pri)||PRIORITIES[1];return<span style={{...S.badge(p.color,p.bg),gap:3}}><Icon name="flag" size={10} color={p.color}/>{p.label}</span>;};
  const DevBadge=({dev})=>{const ic=dev==="desktop"?"monitor":dev==="tablet"?"tablet":"phone";return<span style={{...S.badge(t.accent,t.accentLight),gap:3}}><Icon name={ic} size={10}/>{dev}</span>;};

  // ─── Error ───
  if(view==="error")return(<div style={{...S.page,display:"flex",alignItems:"center",justifyContent:"center"}}><link href={fontLink} rel="stylesheet"/><style>{css}</style><div style={{textAlign:"center",maxWidth:440,padding:24}}><Icon name="alert" size={40} color={t.danger}/><h2 style={{fontSize:20,fontWeight:700,marginTop:16,marginBottom:8}}>Database Not Connected</h2><p style={{color:t.textSecondary,fontSize:14,lineHeight:1.6,marginBottom:20}}>Create a <code style={{background:t.bgMuted,padding:"2px 6px",borderRadius:4}}>.env</code> file:</p><div style={{background:t.bgMuted,borderRadius:12,padding:16,textAlign:"left",fontSize:13,fontFamily:"monospace",lineHeight:1.8,border:"1px solid "+t.border}}>VITE_SUPABASE_URL=https://your-project.supabase.co<br/>VITE_SUPABASE_ANON_KEY=your-key-here</div></div></div>);
  if(view==="loading")return(<div style={{...S.page,display:"flex",alignItems:"center",justifyContent:"center"}}><link href={fontLink} rel="stylesheet"/><style>{css}</style><div style={{textAlign:"center"}}><div style={{width:36,height:36,border:"3px solid "+t.border,borderTopColor:t.accent,borderRadius:"50%",animation:"spin .8s linear infinite",margin:"0 auto 14px"}}/><p style={{color:t.textMuted,fontSize:13}}>Loading...</p></div></div>);

  // ─── Auth ───
  if(view==="auth")return(
    <div style={{...S.page,display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh"}}><link href={fontLink} rel="stylesheet"/><style>{css}</style>
    <div style={{width:420,animation:"fadeIn .4s ease"}}>
      <div style={{textAlign:"center",marginBottom:28}}><Logo size={56}/><h1 style={{fontSize:22,fontWeight:800,marginTop:14,marginBottom:4,letterSpacing:"-0.02em"}}>Nexxen Commenter</h1><p style={{color:t.textMuted,fontSize:13}}>Visual feedback and collaboration</p></div>
      <div style={{...S.modalContent,borderRadius:20}}>
        <div style={{display:"flex",marginBottom:20,background:t.bgMuted,borderRadius:10,padding:3}}>{["login","register"].map(m=><button key={m} onClick={()=>setAuthMode(m)} style={{flex:1,padding:"9px 0",borderRadius:8,border:"none",cursor:"pointer",background:authMode===m?t.bgAlt:"transparent",color:authMode===m?t.text:t.textMuted,fontWeight:600,fontSize:13,boxShadow:authMode===m?t.shadow:"none"}}>{m==="login"?"Sign In":"Create Account"}</button>)}</div>
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <div><label style={S.label}>{authMode==="login"?"Name or Email":"Name"}</label><input value={loginForm.name} onChange={e=>setLoginForm(p=>({...p,name:e.target.value}))} placeholder={authMode==="login"?"Your name or email":"Your name"} style={S.input} onKeyDown={e=>e.key==="Enter"&&handleAuth()}/></div>
          {authMode==="register"&&<div><label style={S.label}>Email</label><input value={loginForm.email} onChange={e=>setLoginForm(p=>({...p,email:e.target.value}))} placeholder="you@company.com" style={S.input} type="email"/></div>}
          <div><label style={S.label}>Password</label><input value={loginForm.password} onChange={e=>setLoginForm(p=>({...p,password:e.target.value}))} placeholder="Enter password" style={S.input} type="password" onKeyDown={e=>e.key==="Enter"&&handleAuth()}/></div>
          <button onClick={handleAuth} style={{...S.btn,justifyContent:"center",padding:"11px 0",width:"100%",borderRadius:12,fontSize:14}}>
            {authMode==="login"?"Sign In":"Create Account"}</button>
        </div></div>
      <div style={{textAlign:"center",marginTop:14}}><button onClick={toggleTheme} style={{...S.btnGhost,margin:"0 auto",padding:"6px 14px",borderRadius:20,fontSize:12}}><Icon name={theme==="light"?"moon":"sun"} size={13}/> {theme==="light"?"Dark":"Light"}</button></div>
    </div>
    {toast&&<div style={{position:"fixed",bottom:24,left:"50%",transform:"translateX(-50%)",background:t.danger,color:"#fff",padding:"10px 20px",borderRadius:10,fontSize:13,fontWeight:600,zIndex:9999}}>{toast}</div>}
    </div>);

  // ─── Dashboard ───
  if(view==="dashboard"){
    const openFB=projects.reduce((a,p)=>a+(p.feedback_count||0),0);
    const activeW=projects.filter(p=>new Date(p.updated_at)>new Date(Date.now()-7*864e5)).length;
    return(<div style={S.page}><link href={fontLink} rel="stylesheet"/><style>{css}</style>
      <div style={S.header}>
        <div style={{display:"flex",alignItems:"center",gap:10}}><Logo/><div><div style={{fontSize:15,fontWeight:800,letterSpacing:"-0.02em"}}>Nexxen Commenter</div></div></div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <button onClick={toggleTheme} style={{...S.btnGhost,padding:"6px 10px",borderRadius:8}}><Icon name={theme==="light"?"moon":"sun"} size={14}/></button>
          <div style={{display:"flex",alignItems:"center",gap:8,padding:"4px 12px 4px 4px",background:t.bgMuted,borderRadius:12}}>
            <div style={{width:28,height:28,borderRadius:8,background:"linear-gradient(135deg,#8B5CF6,#6D28D9)",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700}}>{user?.name?.charAt(0).toUpperCase()}</div>
            <span style={{fontSize:13,fontWeight:600}}>{user?.name}</span></div>
          <button onClick={handleLogout} style={{...S.btnGhost,padding:"6px 10px",borderRadius:8}}><Icon name="logout" size={14}/></button>
          <button onClick={()=>setShowNewProject(true)} style={S.btn}><Icon name="plus" size={14}/> New Project</button>
        </div></div>
      <div style={{maxWidth:1100,margin:"0 auto",padding:"28px 20px"}}>
        {/* Stats */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14,marginBottom:28}}>
          {[{label:"Projects",value:projects.length,color:t.accent,icon:"grid"},{label:"Open Feedback",value:openFB,color:t.danger,icon:"message"},{label:"Active This Week",value:activeW,color:t.success,icon:"eye"}].map((s,i)=>
            <div key={i} style={{background:t.bgAlt,borderRadius:14,border:"1px solid "+t.border,padding:"20px 22px",display:"flex",justifyContent:"space-between",alignItems:"center",animation:"fadeIn .3s ease "+i*.08+"s both"}}>
              <div><p style={{fontSize:11,color:t.textMuted,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.06em"}}>{s.label}</p><p style={{fontSize:28,fontWeight:800,color:s.color,marginTop:4}}>{s.value}</p></div>
              <div style={{width:42,height:42,borderRadius:12,background:t.accentLight,display:"flex",alignItems:"center",justifyContent:"center"}}><Icon name={s.icon} size={20} color={t.accent}/></div>
            </div>)}
        </div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <h2 style={{fontSize:16,fontWeight:700}}>Projects</h2></div>
        {projects.length===0&&!showNewProject&&<div style={{textAlign:"center",padding:"56px 24px",background:t.bgAlt,borderRadius:18,border:"1px dashed "+t.border}}><Icon name="image" size={40} color={t.textMuted}/><h3 style={{fontSize:17,fontWeight:600,marginTop:14,marginBottom:6}}>No projects yet</h3><p style={{color:t.textMuted,fontSize:13,maxWidth:340,margin:"0 auto 20px"}}>Create your first project to begin collecting feedback.</p><button onClick={()=>setShowNewProject(true)} style={S.btn}><Icon name="plus" size={14}/> Create Project</button></div>}
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:16}}>
          {projects.map((p,i)=><div key={p.id} style={{...S.card,animation:"fadeIn .3s ease "+i*.04+"s both"}} onClick={()=>openProject(p)} onMouseEnter={e=>{e.currentTarget.style.boxShadow=t.shadowLg;e.currentTarget.style.transform="translateY(-3px)";}} onMouseLeave={e=>{e.currentTarget.style.boxShadow="none";e.currentTarget.style.transform="translateY(0)";}}>
            <div style={{height:140,background:p.image_data||p.thumbnail?"url("+(p.thumbnail||p.image_data)+") center/cover":t.canvasBg,display:"flex",alignItems:"center",justifyContent:"center",borderBottom:"1px solid "+t.border}}>{!p.image_data&&!p.thumbnail&&<Icon name={p.url?"globe":"image"} size={32} color={t.textMuted}/>}</div>
            <div style={{padding:"14px 16px"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"start"}}>
              <div><h3 style={{fontSize:14,fontWeight:700,marginBottom:3}}>{p.name}</h3><p style={{fontSize:11,color:t.textMuted}}>{fmtRelative(p.updated_at)}</p></div>
              <div style={{display:"flex",gap:6,alignItems:"center"}}>
                <span style={S.badge(t.accent,t.accentLight)}>{p.feedback_count||0} pins</span>
                <button onClick={e=>{e.stopPropagation();deleteProject(p.id);}} style={{background:"none",border:"none",cursor:"pointer",padding:4,color:t.textMuted,opacity:0.4}}><Icon name="trash" size={14}/></button></div></div></div></div>)}</div></div>
      {/* New Project Modal */}
      {showNewProject&&<div style={S.modal} onClick={()=>setShowNewProject(false)}><div style={{...S.modalContent,animation:"slideUp .25s ease"}} onClick={e=>e.stopPropagation()}>
        <h2 style={{fontSize:18,fontWeight:800,marginBottom:3}}>New Project</h2><p style={{color:t.textMuted,fontSize:13,marginBottom:22}}>Add a website URL or upload a screenshot.</p>
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <div><label style={S.label}>Project Name</label><input value={newProjectName} onChange={e=>setNewProjectName(e.target.value)} placeholder="e.g., Homepage Redesign" style={S.input}/></div>
          <div><label style={S.label}>Content Type</label><div style={{display:"flex",gap:8}}>{[{id:"url",label:"Website URL",icon:"globe"},{id:"image",label:"Upload Image",icon:"upload"}].map(o=><button key={o.id} onClick={()=>setNewProjectType(o.id)} style={{flex:1,padding:14,borderRadius:12,cursor:"pointer",textAlign:"center",background:newProjectType===o.id?t.accentLight:t.bgMuted,border:"1px solid "+(newProjectType===o.id?t.accent:t.border)}}><Icon name={o.icon} size={20} color={newProjectType===o.id?t.accent:t.textMuted}/><div style={{fontSize:13,fontWeight:600,color:newProjectType===o.id?t.accent:t.text,marginTop:6}}>{o.label}</div></button>)}</div></div>
          {newProjectType==="url"&&<div><label style={S.label}>Website URL</label><input value={newProjectUrl} onChange={e=>setNewProjectUrl(e.target.value)} placeholder="https://example.com" style={S.input}/></div>}
          {newProjectType==="image"&&<div style={{border:"2px dashed "+t.border,borderRadius:14,padding:28,textAlign:"center",cursor:"pointer",background:uploadedImage?"url("+uploadedImage+") center/cover":t.bgMuted,minHeight:100,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",position:"relative"}} onClick={()=>fileInputRef.current?.click()}>{uploadedImage&&<div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.4)",borderRadius:12}}/>}<div style={{position:"relative",zIndex:1}}><Icon name={uploadedImage?"check":"upload"} size={24} color={uploadedImage?"#fff":t.textMuted}/><p style={{color:uploadedImage?"#fff":t.textMuted,fontSize:13,marginTop:6}}>{uploadedImage?"Uploaded. Click to change.":"Click to upload"}</p></div><input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} style={{display:"none"}}/></div>}
          <div style={{display:"flex",gap:10,marginTop:4}}><button onClick={()=>{setShowNewProject(false);setUploadedImage(null);}} style={{...S.btnGhost,flex:1,justifyContent:"center"}}>Cancel</button><button onClick={createProject} disabled={!newProjectName.trim()} style={{...S.btn,flex:1,justifyContent:"center",opacity:newProjectName.trim()?1:0.4,cursor:newProjectName.trim()?"pointer":"not-allowed"}}>Create</button></div>
        </div></div></div>}
      {toast&&<div style={{position:"fixed",bottom:24,left:"50%",transform:"translateX(-50%)",background:t.primary,color:t.textInverse,padding:"10px 20px",borderRadius:10,fontSize:13,fontWeight:600,zIndex:9999,animation:"fadeIn .2s ease"}}>{toast}</div>}
    </div>);
  }

  // ─── Project View ───
  if(view==="project"&&activeProj){
    const device=DEVICES.find(d=>d.id===selectedDevice)||DEVICES[0];
    const canAdd=userRole.addFeedback||clientMode;
    const canManage=userRole.manageFeedback;
    const canMembers=userRole.manageMembers;
    return(<div style={S.page}><link href={fontLink} rel="stylesheet"/><style>{css}</style>
      {/* Toolbar */}
      <div style={S.header}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          {!clientMode&&<button onClick={()=>{setView("dashboard");setCurrentProject(null);}} style={{...S.btnGhost,padding:"5px 10px",borderRadius:8}}><Icon name="back" size={14}/></button>}
          <Logo/><div><div style={{fontSize:14,fontWeight:700}}>{activeProj.name}</div><div style={{fontSize:10,color:t.textMuted,maxWidth:180,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{clientMode?"Review Mode":(projUrl||"Image Upload")}</div></div></div>
        {/* Device switcher */}
        <div style={{display:"flex",gap:2,background:t.bgMuted,borderRadius:10,padding:3}}>
          {DEVICES.map(d=>{const ic=d.id==="desktop"?"monitor":d.id==="tablet"?"tablet":"phone";return<button key={d.id} onClick={()=>setSelectedDevice(d.id)} style={{background:selectedDevice===d.id?t.bgAlt:"transparent",border:selectedDevice===d.id?"1px solid "+t.border:"1px solid transparent",color:selectedDevice===d.id?t.accent:t.textMuted,borderRadius:7,padding:"5px 12px",cursor:"pointer",fontSize:11,fontWeight:600,display:"flex",alignItems:"center",gap:4,boxShadow:selectedDevice===d.id?t.shadow:"none"}}><Icon name={ic} size={13}/>{d.px}</button>;})}
        </div>
        {/* Actions */}
        <div style={{display:"flex",gap:6,alignItems:"center"}}>
          {canAdd&&<button onClick={()=>setIsPlacingPin(!isPlacingPin)} style={{...(isPlacingPin?S.btnDanger:S.btnGhost),padding:"6px 12px",borderRadius:10}}><Icon name={isPlacingPin?"x":"pin"} size={14}/> {isPlacingPin?"Cancel":"Add Pin"}</button>}
          {!clientMode&&<><button onClick={()=>fileInputRef.current?.click()} style={{...S.btnGhost,padding:"6px 10px",borderRadius:8}}><Icon name="camera" size={14}/></button><input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} style={{display:"none"}}/></>}
          {canMembers&&<button onClick={()=>setShowMembers(true)} style={{...S.btnGhost,padding:"6px 10px",borderRadius:8}}><Icon name="users" size={14}/></button>}
          {!clientMode&&<button onClick={()=>copyShareLink()} style={S.btn}><Icon name="share" size={13}/> Share</button>}
          <button onClick={toggleTheme} style={{...S.btnGhost,padding:"6px 10px",borderRadius:8}}><Icon name={theme==="light"?"moon":"sun"} size={14}/></button>
          <button onClick={()=>setSidebarOpen(!sidebarOpen)} style={{...S.btnGhost,padding:"6px 10px",borderRadius:8,background:sidebarOpen?t.accentLight:"transparent",borderColor:sidebarOpen?t.accent:t.border,color:sidebarOpen?t.accent:t.textSecondary}}><Icon name="message" size={14}/> <span style={{fontSize:12,fontWeight:700}}>{processedPins.length}</span></button>
        </div></div>
      {/* Main */}
      <div style={{display:"flex",height:"calc(100vh - 54px)"}}>
        {/* Canvas */}
        <div style={{flex:1,overflow:"auto",display:"flex",justifyContent:"center",padding:20,background:t.canvasBg,cursor:isPlacingPin?"crosshair":"default"}}>
          <div style={{width:device.width,maxWidth:"100%",position:"relative",transition:"width .3s ease"}}>
            {projType==="url"&&projUrl?
              <div style={{position:"relative",width:"100%",height:"calc(100vh - 94px)",borderRadius:12,border:"1px solid "+t.border,background:"#fff"}}>
                <iframe ref={iframeRef} src={projUrl} style={{width:"100%",height:"100%",border:"none",background:"#fff",pointerEvents:isPlacingPin?"none":"auto",borderRadius:12}} onLoad={()=>setIframeLoaded(true)} sandbox="allow-scripts allow-same-origin allow-forms allow-popups"/>
                <div onClick={handleCanvasClick} style={{position:"absolute",inset:0,pointerEvents:isPlacingPin?"auto":"none",borderRadius:12}}>
                  {processedPins.map(pin=><PinMarker key={pin.id} pin={pin} index={pins.indexOf(pin)} isSelected={selectedPin===pin.id} t={t} onClick={p=>setSelectedPin(selectedPin===p.id?null:p.id)}/>)}
                  {pendingPinPos&&<PendingMarker pos={pendingPinPos} t={t}/>}</div>
                {!iframeLoaded&&<div style={{position:"absolute",inset:0,background:t.bgAlt,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",borderRadius:12}}><div style={{width:28,height:28,border:"2px solid "+t.border,borderTopColor:t.accent,borderRadius:"50%",animation:"spin .8s linear infinite"}}/><p style={{color:t.textMuted,fontSize:12,marginTop:10}}>Loading...</p></div>}
              </div>
            :projImage?
              <div style={{position:"relative",borderRadius:12,border:"1px solid "+t.border}} onClick={handleCanvasClick}>
                <img src={projImage} style={{width:"100%",display:"block",borderRadius:12}} alt="Project"/>
                {processedPins.map(pin=><PinMarker key={pin.id} pin={pin} index={pins.indexOf(pin)} isSelected={selectedPin===pin.id} t={t} onClick={p=>setSelectedPin(selectedPin===p.id?null:p.id)}/>)}
                {pendingPinPos&&<PendingMarker pos={pendingPinPos} t={t}/>}</div>
            :<div style={{border:"2px dashed "+t.border,borderRadius:18,padding:56,textAlign:"center",background:t.bgAlt}}><Icon name="camera" size={36} color={t.textMuted}/><h3 style={{fontSize:16,fontWeight:600,marginTop:14,marginBottom:6}}>No content yet</h3><p style={{color:t.textMuted,fontSize:13,marginBottom:18}}>Upload a screenshot or add a website URL</p>{!clientMode&&<button onClick={()=>fileInputRef.current?.click()} style={S.btn}><Icon name="upload" size={14}/> Upload</button>}</div>}
            {/* New pin form - positioned near the pin */}
            {pendingPinPos&&canAdd&&<div style={{position:"absolute",left:Math.min(pendingPinPos.x,65)+"%",top:pendingPinPos.y+"%",transform:"translate(20px,-50%)",background:t.bgAlt,borderRadius:16,padding:18,border:"1px solid "+t.accent,boxShadow:t.shadowXl,width:340,zIndex:999,animation:"fadeIn .15s ease"}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}><div style={{display:"flex",alignItems:"center",gap:6}}><div style={{width:22,height:22,borderRadius:"50%",background:t.accent,display:"flex",alignItems:"center",justifyContent:"center"}}><Icon name="pin" size={11} color="#fff"/></div><span style={{fontSize:13,fontWeight:700}}>Add Comment</span></div>
                <button onClick={()=>{setPendingPinPos(null);setNewComment("");setAttachment(null);}} style={{background:"none",border:"none",cursor:"pointer",color:t.textMuted}}><Icon name="x" size={14}/></button></div>
              <div style={{display:"flex",gap:4,marginBottom:10}}>{PRIORITIES.map(p=><button key={p.id} onClick={()=>setNewPriority(p.id)} style={{...S.pill,background:newPriority===p.id?p.bg:"transparent",color:newPriority===p.id?p.color:t.textMuted,borderColor:newPriority===p.id?p.color:"transparent",fontSize:11}}><Icon name="flag" size={9}/> {p.label}</button>)}</div>
              {clientMode&&<input value={newAuthor} onChange={e=>setNewAuthor(e.target.value)} placeholder="Your name" style={{...S.input,marginBottom:8,padding:"8px 12px"}}/>}
              <textarea value={newComment} onChange={e=>setNewComment(e.target.value)} placeholder="Describe the issue..." rows={3} autoFocus style={{...S.input,resize:"none",padding:"8px 12px"}}/>
              {attachment&&<div style={{display:"flex",alignItems:"center",gap:6,padding:"5px 10px",background:t.bgMuted,borderRadius:8,marginTop:8,fontSize:11,color:t.textSecondary}}><Icon name="paperclip" size={11}/>{attachment.name}<button onClick={()=>setAttachment(null)} style={{background:"none",border:"none",cursor:"pointer",color:t.textMuted,marginLeft:"auto"}}><Icon name="x" size={11}/></button></div>}
              <div style={{display:"flex",gap:6,marginTop:10,alignItems:"center"}}>
                <button onClick={()=>attachRef.current?.click()} style={{...S.btnGhost,padding:"5px 8px",borderRadius:8}}><Icon name="paperclip" size={12}/></button>
                <input ref={attachRef} type="file" onChange={handleAttach} style={{display:"none"}}/>
                <div style={{flex:1}}/>
                <button onClick={submitNewPin} disabled={!newComment.trim()} style={{...S.btn,opacity:newComment.trim()?1:0.4,cursor:newComment.trim()?"pointer":"not-allowed",padding:"7px 16px"}}><Icon name="send" size={12}/> Submit</button>
              </div></div>}
          </div></div>
        {/* Sidebar */}
        {sidebarOpen&&<div style={{width:370,background:t.bgAlt,borderLeft:"1px solid "+t.border,display:"flex",flexDirection:"column",animation:"fadeIn .2s ease"}}>
          {/* Header + filters */}
          <div style={{padding:"12px 14px",borderBottom:"1px solid "+t.border}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
              <h3 style={{fontSize:14,fontWeight:700}}>Feedback <span style={{color:t.textMuted,fontWeight:500}}>({pins.length})</span></h3>
              <div style={{display:"flex",gap:4,alignItems:"center"}}>
                <select value={sortBy} onChange={e=>setSortBy(e.target.value)} style={{...S.input,width:"auto",padding:"4px 8px",fontSize:11,borderRadius:6,cursor:"pointer"}}>
                  {SORT_OPTIONS.map(s=><option key={s.id} value={s.id}>{s.label}</option>)}</select>
              </div></div>
            {/* Status filter */}
            <div style={{display:"flex",gap:3,background:t.bgMuted,borderRadius:8,padding:2,marginBottom:8}}>
              {["all","open","resolved"].map(f=><button key={f} onClick={()=>setFilterStatus(f)} style={{flex:1,background:filterStatus===f?t.bgAlt:"transparent",border:"none",color:filterStatus===f?t.text:t.textMuted,borderRadius:6,padding:"4px 0",fontSize:11,cursor:"pointer",fontWeight:600,boxShadow:filterStatus===f?t.shadow:"none",textTransform:"capitalize"}}>{f} ({f==="all"?pins.length:pins.filter(p=>p.status===f).length})</button>)}</div>
            {/* Device filter */}
            <div style={{display:"flex",gap:4,marginBottom:6}}>
              {[{id:"all",label:"All Devices"},...DEVICES].map(d=>{const isAct=deviceFilter===d.id;return<button key={d.id} onClick={()=>setDeviceFilter(d.id)} style={{...S.pill,background:isAct?t.accentLight:t.bgMuted,color:isAct?t.accent:t.textMuted,borderColor:isAct?t.accentSoft:"transparent",fontSize:10}}>
                {d.id!=="all"&&<Icon name={d.id==="desktop"?"monitor":d.id==="tablet"?"tablet":"phone"} size={10}/>} {d.label||d.id}</button>;})}
            </div>
            {/* Priority filter */}
            <div style={{display:"flex",gap:4}}>
              <button onClick={()=>setFilterStatus(filterStatus==="all"?"all":filterStatus)} style={{...S.pill,background:!["high","medium","low"].includes(filterStatus)?t.bgMuted:t.bgMuted,color:!["high","medium","low"].includes(filterStatus)?t.textSecondary:t.textMuted,fontSize:10}} onClick={()=>{if(sortBy!=="priority")setSortBy("priority");else setSortBy("newest");}}>
                <Icon name="sort" size={10}/> {sortBy==="priority"?"By Priority":"Sort Priority"}</button>
              {PRIORITIES.map(p=>{const ct=pins.filter(x=>x.priority===p.id).length;return<button key={p.id} onClick={()=>setFilterStatus(filterStatus===p.id?"all":p.id)} style={{...S.pill,background:filterStatus===p.id?p.bg:t.bgMuted,color:filterStatus===p.id?p.color:t.textMuted,borderColor:filterStatus===p.id?p.color:"transparent",fontSize:10}}><Icon name="flag" size={9} color={filterStatus===p.id?p.color:t.textMuted}/> {p.label} ({ct})</button>;})}
            </div>
          </div>
          {/* Pin list */}
          <div style={{flex:1,overflowY:"auto",padding:10}}>
            {processedPins.length===0&&<div style={{textAlign:"center",padding:"36px 16px",color:t.textMuted}}><Icon name="message" size={28} color={t.textMuted}/><p style={{fontSize:13,fontWeight:600,marginTop:10}}>No feedback found</p></div>}
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {processedPins.map((pin,i)=>{const pidx=pins.indexOf(pin),isAct=selectedPin===pin.id;return<div key={pin.id} style={{background:isAct?t.accentMuted:t.bg,borderRadius:12,border:"1px solid "+(isAct?t.accent:t.border),overflow:"hidden",animation:"fadeIn .2s ease "+i*.03+"s both"}}>
                {/* Pin header */}
                <div style={{padding:"10px 12px",display:"flex",alignItems:"center",justifyContent:"space-between",cursor:"pointer",borderBottom:"1px solid "+t.borderLight}} onClick={()=>setSelectedPin(isAct?null:pin.id)}>
                  <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
                    <span style={{background:pin.status==="resolved"?t.success:t.danger,color:"#fff",width:22,height:22,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700}}>{pidx+1}</span>
                    <span style={{fontSize:12,fontWeight:600}}>Pin #{pidx+1}</span>
                    <PriBadge pri={pin.priority}/><DevBadge dev={pin.device}/>
                    <span style={{fontSize:10,color:t.textMuted}}>{fmtRelative(pin.created_at)}</span>
                  </div>
                  <div style={{display:"flex",gap:3}}>
                    {canManage&&<select value={pin.priority} onChange={e=>{e.stopPropagation();handleChangePriority(pin.id,e.target.value);}} onClick={e=>e.stopPropagation()} style={{...S.input,width:"auto",padding:"2px 4px",fontSize:10,borderRadius:4,cursor:"pointer"}}><option value="high">High</option><option value="medium">Med</option><option value="low">Low</option></select>}
                    {canManage&&<button onClick={e=>{e.stopPropagation();handleResolve(pin.id);}} style={{background:"none",border:"none",cursor:"pointer",padding:3,color:pin.status==="resolved"?t.success:t.textMuted}}><Icon name="check" size={13}/></button>}
                    {canManage&&<button onClick={e=>{e.stopPropagation();handleDeletePin(pin.id);}} style={{background:"none",border:"none",cursor:"pointer",padding:3,color:t.textMuted,opacity:0.4}}><Icon name="trash" size={13}/></button>}
                  </div></div>
                {/* Screenshot - always visible */}
                {pin.screenshot&&<div style={{padding:"8px 12px",borderBottom:"1px solid "+t.borderLight}}>
                  <img src={pin.screenshot} style={{width:"100%",borderRadius:8,border:"1px solid "+t.border,cursor:"pointer",display:"block"}} onClick={e=>{e.stopPropagation();setShowScreenshot(pin.screenshot);}} alt="Pin location"/>
                  <p style={{fontSize:10,color:t.textMuted,marginTop:4}}>Pin location -- click to enlarge</p></div>}
                {/* Comments */}
                <div style={{maxHeight:isAct?400:52,overflow:"hidden",transition:"max-height .25s ease"}}>
                  {pin.comments.map((c,ci)=><div key={ci} style={{padding:"8px 12px",borderBottom:ci<pin.comments.length-1?"1px solid "+t.borderLight:"none"}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                      <span style={{color:t.accent,fontSize:11,fontWeight:700}}>{c.author}</span>
                      <span style={{color:t.textMuted,fontSize:10}}>{fmtFull(c.timestamp)}</span></div>
                    <p style={{color:t.textSecondary,fontSize:12,lineHeight:1.5,margin:0}}>{c.text}</p>
                    {c.attachmentName&&<div style={{display:"flex",alignItems:"center",gap:6,marginTop:6,padding:"6px 10px",background:t.bgMuted,borderRadius:8,fontSize:11,color:t.textSecondary}}>
                      <Icon name="paperclip" size={12} color={t.accent}/>
                      <span style={{flex:1}}>{c.attachmentName}</span>
                      {c.attachmentData&&<a href={c.attachmentData} download={c.attachmentName} style={{color:t.accent,textDecoration:"none"}} onClick={e=>e.stopPropagation()}><Icon name="download" size={12}/></a>}
                    </div>}
                  </div>)}</div>
                {isAct&&canAdd&&<ReplyBox pinId={pin.id} onReply={handleReply} user={user} clientMode={clientMode} t={t} S={S}/>}
              </div>;})}
            </div></div></div>}
      </div>
      {/* Members Modal */}
      {showMembers&&<div style={S.modal} onClick={()=>setShowMembers(false)}><div style={{...S.modalContent,width:540,animation:"slideUp .25s ease",maxHeight:"80vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <div><h2 style={{fontSize:18,fontWeight:800}}>Team Members</h2><p style={{color:t.textMuted,fontSize:13,marginTop:2}}>Manage access and permissions.</p></div>
          <button onClick={()=>setShowMembers(false)} style={{background:"none",border:"none",cursor:"pointer",color:t.textMuted}}><Icon name="x" size={18}/></button></div>
        {canMembers&&<div style={{display:"flex",gap:8,marginBottom:20}}>
          <input value={newMemberEmail} onChange={e=>setNewMemberEmail(e.target.value)} placeholder="Email address" style={{...S.input,flex:1}}/>
          <select value={newMemberRole} onChange={e=>setNewMemberRole(e.target.value)} style={{...S.input,width:110,cursor:"pointer"}}><option value="admin">Admin</option><option value="member">Member</option><option value="editor">Editor</option><option value="viewer">Viewer</option></select>
          <button onClick={addMember} style={S.btn}>Add</button></div>}
        <div style={{background:t.bgMuted,borderRadius:10,padding:"10px 14px",marginBottom:16,border:"1px solid "+t.border}}>
          <p style={{fontSize:11,fontWeight:700,color:t.textSecondary,marginBottom:6}}>Roles</p>
          <div style={{fontSize:11,color:t.textMuted,lineHeight:1.8}}>
            <strong style={{color:t.text}}>Owner</strong> -- Full control &nbsp;|&nbsp; <strong style={{color:t.text}}>Admin</strong> -- Manage members/feedback<br/>
            <strong style={{color:t.text}}>Member</strong> -- Add feedback to assigned projects &nbsp;|&nbsp; <strong style={{color:t.text}}>Viewer</strong> -- View only</div></div>
        <div style={{display:"flex",flexDirection:"column",gap:6}}>
          {members.map((m,i)=><div key={i} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 12px",background:t.bg,borderRadius:10,border:"1px solid "+t.border}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:32,height:32,borderRadius:10,background:"linear-gradient(135deg,#8B5CF6,#6D28D9)",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700}}>{m.name?.charAt(0).toUpperCase()}</div>
              <div><div style={{fontSize:13,fontWeight:600}}>{m.name}</div><div style={{fontSize:11,color:t.textMuted}}>{m.email}</div></div></div>
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              {m.role==="owner"?<span style={S.badge(t.accent,t.accentLight)}>Owner</span>:canMembers?<>
                <select value={m.role} onChange={e=>updateMemberRole(m.email,e.target.value)} style={{...S.input,width:90,padding:"4px 8px",fontSize:11,cursor:"pointer",borderRadius:6}}><option value="admin">Admin</option><option value="member">Member</option><option value="editor">Editor</option><option value="viewer">Viewer</option></select>
                <button onClick={()=>copyShareLink(m.token)} style={{background:"none",border:"none",cursor:"pointer",color:t.textMuted,padding:3}} title="Copy link"><Icon name="link" size={13}/></button>
                <button onClick={()=>removeMember(m.email)} style={{background:"none",border:"none",cursor:"pointer",color:t.danger,padding:3}}><Icon name="x" size={13}/></button>
              </>:<span style={S.badge(t.textSecondary,t.bgMuted)}>{ROLE_LABELS[m.role]||m.role}</span>}
            </div></div>)}</div></div></div>}
      {/* Screenshot Modal */}
      {showScreenshot&&<div style={S.modal} onClick={()=>setShowScreenshot(null)}><div style={{animation:"slideUp .25s ease",maxWidth:520,width:"90%"}} onClick={e=>e.stopPropagation()}>
        <div style={{background:t.bgAlt,borderRadius:14,overflow:"hidden",border:"1px solid "+t.border,boxShadow:t.shadowXl}}>
          <div style={{padding:"10px 14px",borderBottom:"1px solid "+t.border,display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{fontSize:13,fontWeight:700}}>Pin Screenshot</span><button onClick={()=>setShowScreenshot(null)} style={{background:"none",border:"none",cursor:"pointer",color:t.textMuted}}><Icon name="x" size={16}/></button></div>
          <img src={showScreenshot} style={{width:"100%",display:"block"}} alt="Screenshot"/></div></div></div>}
      {toast&&<div style={{position:"fixed",bottom:24,left:"50%",transform:"translateX(-50%)",background:t.primary,color:t.textInverse,padding:"10px 20px",borderRadius:10,fontSize:13,fontWeight:600,zIndex:9999,animation:"fadeIn .2s ease"}}>{toast}</div>}
    </div>);
  }
  return null;
}

// ─── Sub-components ───
function PinMarker({pin,index,isSelected,t,onClick}){
  const c=pin.status==="resolved"?t.pinResolved:t.pinOpen;
  const[hover,setHover]=useState(false);
  const cm=pin.comments?.[0];
  const pri=PRIORITIES.find(p=>p.id===pin.priority)||PRIORITIES[1];
  return<div onClick={e=>{e.stopPropagation();onClick(pin);}} onMouseEnter={()=>setHover(true)} onMouseLeave={()=>setHover(false)} style={{position:"absolute",left:pin.x+"%",top:pin.y+"%",transform:"translate(-50%,-50%)",cursor:"pointer",zIndex:isSelected?100:hover?90:10,transition:"transform .15s"}}>
    {/* Pin circle */}
    <div style={{width:28,height:28,borderRadius:"50%",background:c,border:"2.5px solid #fff",boxShadow:isSelected?"0 0 0 3px "+c+",0 2px 8px rgba(0,0,0,0.25)":"0 2px 8px rgba(0,0,0,0.2)",display:"flex",alignItems:"center",justifyContent:"center",transition:"box-shadow .15s",transform:hover?"scale(1.15)":"scale(1)"}}>
      <span style={{color:"#fff",fontSize:11,fontWeight:700,lineHeight:1}}>{index+1}</span>
    </div>
    {/* Priority dot */}
    <div style={{position:"absolute",top:-3,right:-3,width:10,height:10,borderRadius:"50%",background:pri.color,border:"2px solid #fff"}}/>
    {/* Hover tooltip */}
    {hover&&!isSelected&&cm&&<div style={{position:"absolute",left:"50%",bottom:"100%",transform:"translateX(-50%)",marginBottom:8,background:t.bgAlt,borderRadius:12,padding:10,border:"1px solid "+t.border,boxShadow:t.shadowLg,width:230,pointerEvents:"none"}}>
      {pin.screenshot&&<img src={pin.screenshot} style={{width:"100%",borderRadius:6,marginBottom:6,display:"block",border:"1px solid "+t.border}} alt=""/>}
      <div style={{display:"flex",alignItems:"center",gap:4,marginBottom:3}}><PriBadge pri={pin.priority}/><DevBadge dev={pin.device}/></div>
      <div style={{fontSize:11,fontWeight:700,color:t.accent,marginBottom:2}}>{cm.author}</div>
      <div style={{fontSize:11,color:t.textSecondary,lineHeight:1.4,overflow:"hidden",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical"}}>{cm.text}</div>
    </div>}
  </div>;
}
function PendingMarker({pos,t}){return<div style={{position:"absolute",left:pos.x+"%",top:pos.y+"%",transform:"translate(-50%,-50%)",zIndex:200,animation:"pulse 1s ease infinite",pointerEvents:"none"}}>
<div style={{width:32,height:32,borderRadius:"50%",background:t.accent,border:"3px solid #fff",boxShadow:"0 0 0 2px "+t.accent+",0 4px 12px rgba(0,0,0,0.3)",display:"flex",alignItems:"center",justifyContent:"center"}}>
<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
</div></div>;}
function ReplyBox({pinId,onReply,user,clientMode,t,S}){
  const[text,setText]=useState("");const[author,setAuthor]=useState("");const[att,setAtt]=useState(null);const ref=useRef(null);
  const submit=()=>{if(!text.trim())return;onReply(pinId,text.trim(),clientMode?(author.trim()||"Guest"):(user?.name||"Anonymous"),att);setText("");setAtt(null);};
  const pickFile=e=>{const f=e.target.files?.[0];if(!f||f.size>5*1024*1024)return;const r=new FileReader();r.onload=ev=>{setAtt({name:f.name,data:ev.target.result,type:f.type});};r.readAsDataURL(f);};
  return<div style={{padding:"10px 12px",borderTop:"1px solid "+t.borderLight,background:t.bgMuted}}>
    {clientMode&&<input value={author} onChange={e=>setAuthor(e.target.value)} placeholder="Your name" style={{...S.input,marginBottom:6,fontSize:12,padding:"7px 10px"}}/>}
    {att&&<div style={{display:"flex",alignItems:"center",gap:4,padding:"4px 8px",background:t.bgAlt,borderRadius:6,marginBottom:6,fontSize:11,color:t.textSecondary}}><Icon name="paperclip" size={10}/>{att.name}<button onClick={()=>setAtt(null)} style={{background:"none",border:"none",cursor:"pointer",color:t.textMuted,marginLeft:"auto"}}><Icon name="x" size={10}/></button></div>}
    <div style={{display:"flex",gap:6,alignItems:"center"}}>
      <button onClick={()=>ref.current?.click()} style={{background:"none",border:"none",cursor:"pointer",color:t.textMuted,padding:3}}><Icon name="paperclip" size={14}/></button>
      <input ref={ref} type="file" onChange={pickFile} style={{display:"none"}}/>
      <input value={text} onChange={e=>setText(e.target.value)} placeholder="Reply..." onKeyDown={e=>e.key==="Enter"&&submit()} style={{...S.input,flex:1,fontSize:12,padding:"7px 10px"}}/>
      <button onClick={submit} style={{...S.btn,padding:"7px 14px",fontSize:12,borderRadius:8}}><Icon name="send" size={12}/></button>
    </div></div>;
}
function PriBadge({pri}){const p=PRIORITIES.find(x=>x.id===pri)||PRIORITIES[1];return<span style={{background:p.bg,color:p.color,padding:"2px 8px",borderRadius:12,fontSize:10,fontWeight:600,display:"inline-flex",alignItems:"center",gap:3}}><Icon name="flag" size={9} color={p.color}/>{p.label}</span>;}
function DevBadge({dev}){return<span style={{background:"rgba(139,92,246,0.08)",color:"#8B5CF6",padding:"2px 8px",borderRadius:12,fontSize:10,fontWeight:600,display:"inline-flex",alignItems:"center",gap:3}}><Icon name={dev==="desktop"?"monitor":dev==="tablet"?"tablet":"phone"} size={9}/>{dev}</span>;}
