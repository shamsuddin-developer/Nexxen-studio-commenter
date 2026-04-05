import { useState, useEffect, useRef, useMemo } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

const ROLES = { OWNER: "owner", ADMIN: "admin", EDITOR: "editor", VIEWER: "viewer" };
const ROLE_LABELS = { owner: "Owner", admin: "Admin", editor: "Editor", viewer: "Viewer" };
const ROLE_PERMS = {
  owner: { manageMembers: true, manageFeedback: true, addFeedback: true, viewFeedback: true, deleteProject: true, editProject: true },
  admin: { manageMembers: true, manageFeedback: true, addFeedback: true, viewFeedback: true, deleteProject: false, editProject: true },
  editor: { manageMembers: false, manageFeedback: false, addFeedback: true, viewFeedback: true, deleteProject: false, editProject: false },
  viewer: { manageMembers: false, manageFeedback: false, addFeedback: false, viewFeedback: true, deleteProject: false, editProject: false },
};
const DEVICES = [
  { id: "desktop", label: "Desktop", width: "100%", px: 1440 },
  { id: "tablet", label: "Tablet", width: "768px", px: 768 },
  { id: "mobile", label: "Mobile", width: "375px", px: 375 },
];
const ADMIN_EMAIL = "admin@nexxenstudio.com";
const LOGO_SRC = "data:image/png;base64,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";
const fmtDate = (d) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
const fmtTime = (d) => new Date(d).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
const fmtFull = (d) => fmtDate(d) + " at " + fmtTime(d);

const DB = {
  async findUserByLogin(nameOrEmail, password) {
    if (!supabase) return null;
    const { data } = await supabase.from("users").select("*").or("name.eq." + nameOrEmail + ",email.eq." + nameOrEmail).eq("password", password).limit(1).single();
    return data || null;
  },
  async findUserByEmail(email) {
    if (!supabase) return null;
    const { data } = await supabase.from("users").select("*").eq("email", email).limit(1).single();
    return data || null;
  },
  async createUser(user) {
    if (!supabase) return null;
    const { data } = await supabase.from("users").insert(user).select().single();
    return data;
  },
  getSession() { try { return JSON.parse(localStorage.getItem("mu-session")); } catch { return null; } },
  setSession(u) { localStorage.setItem("mu-session", JSON.stringify(u)); },
  clearSession() { localStorage.removeItem("mu-session"); },
  getTheme() { return localStorage.getItem("mu-theme") || "light"; },
  setTheme(t) { localStorage.setItem("mu-theme", t); },
  async getProject(id) {
    if (!supabase) return null;
    const { data } = await supabase.from("projects").select("*").eq("id", id).single();
    return data;
  },
  async getProjectsForUser(userId, email, isSuperAdmin) {
    if (!supabase) return [];
    if (isSuperAdmin) {
      const { data } = await supabase.from("projects").select("*").order("updated_at", { ascending: false });
      return data || [];
    }
    const { data: owned } = await supabase.from("projects").select("*").eq("owner_id", userId).order("updated_at", { ascending: false });
    const { data: memberships } = await supabase.from("members").select("project_id").or("user_id.eq." + userId + ",email.eq." + email);
    const memberProjIds = (memberships || []).map(m => m.project_id).filter(id => !(owned || []).find(p => p.id === id));
    let memberProjects = [];
    if (memberProjIds.length > 0) {
      const { data } = await supabase.from("projects").select("*").in("id", memberProjIds);
      memberProjects = data || [];
    }
    const all = [...(owned || []), ...memberProjects];
    all.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
    return all;
  },
  async createProject(project) {
    if (!supabase) return null;
    const { data } = await supabase.from("projects").insert(project).select().single();
    return data;
  },
  async updateProject(id, updates) {
    if (!supabase) return;
    await supabase.from("projects").update({ ...updates, updated_at: new Date().toISOString() }).eq("id", id);
  },
  async deleteProject(id) {
    if (!supabase) return;
    await supabase.from("projects").delete().eq("id", id);
  },
  async getMembers(projectId) {
    if (!supabase) return [];
    const { data } = await supabase.from("members").select("*").eq("project_id", projectId).order("added_at");
    return data || [];
  },
  async addMember(member) {
    if (!supabase) return null;
    const { data } = await supabase.from("members").insert(member).select().single();
    return data;
  },
  async removeMember(projectId, email) {
    if (!supabase) return;
    await supabase.from("members").delete().eq("project_id", projectId).eq("email", email);
  },
  async updateMemberRole(projectId, email, role) {
    if (!supabase) return;
    await supabase.from("members").update({ role }).eq("project_id", projectId).eq("email", email);
  },
  async getPins(projectId) {
    if (!supabase) return [];
    const { data: pins } = await supabase.from("pins").select("*").eq("project_id", projectId).order("created_at");
    if (!pins || pins.length === 0) return [];
    const pinIds = pins.map(p => p.id);
    const { data: comments } = await supabase.from("comments").select("*").in("pin_id", pinIds).order("created_at");
    return pins.map(p => ({ ...p, comments: (comments || []).filter(c => c.pin_id === p.id).map(c => ({ author: c.author, text: c.body, timestamp: c.created_at })) }));
  },
  async createPin(pin) {
    if (!supabase) return null;
    const { data } = await supabase.from("pins").insert({ project_id: pin.project_id, x: pin.x, y: pin.y, status: pin.status, screenshot: pin.screenshot, device: pin.device }).select().single();
    return data;
  },
  async updatePinStatus(pinId, status) { if (supabase) await supabase.from("pins").update({ status }).eq("id", pinId); },
  async updatePinScreenshot(pinId, screenshot) { if (supabase) await supabase.from("pins").update({ screenshot }).eq("id", pinId); },
  async deletePin(pinId) { if (supabase) await supabase.from("pins").delete().eq("id", pinId); },
  async addComment(pinId, author, text) {
    if (!supabase) return null;
    const { data } = await supabase.from("comments").insert({ pin_id: pinId, author, body: text }).select().single();
    return data;
  },
};

const themes = {
  light: {
    bg: "#FFFFFF", bgAlt: "#FFFFFF", bgMuted: "#F7F7F5", bgHover: "#F0F0EC",
    border: "#E8E8E5", borderLight: "#F0F0EC", borderFocus: "#F2CF4D",
    text: "#1A1A1A", textSecondary: "#666666", textMuted: "#999999", textInverse: "#FFFFFF",
    accent: "#F2CF4D", accentHover: "#D4B63E", accentLight: "#FEFBEF", accentMuted: "rgba(242,207,77,0.08)",
    primary: "#1A1A1A", primaryHover: "#333333", primaryLight: "#F5F5F5",
    success: "#22C55E", successLight: "#F0FDF4", successBorder: "#BBF7D0",
    danger: "#EF4444", dangerLight: "#FEF2F2", dangerBorder: "#FECACA",
    shadow: "0 1px 2px rgba(0,0,0,0.04), 0 1px 4px rgba(0,0,0,0.03)",
    shadowLg: "0 4px 16px rgba(0,0,0,0.06)", shadowXl: "0 12px 40px rgba(0,0,0,0.10)",
    overlay: "rgba(0,0,0,0.35)", canvasBg: "#F3F3F0", pinOpen: "#EF4444", pinResolved: "#22C55E",
  },
  dark: {
    bg: "#0C0C0C", bgAlt: "#141414", bgMuted: "#1C1C1C", bgHover: "#262626",
    border: "rgba(255,255,255,0.08)", borderLight: "rgba(255,255,255,0.04)", borderFocus: "#F2CF4D",
    text: "#F2F2F0", textSecondary: "#A0A0A0", textMuted: "#666666", textInverse: "#0C0C0C",
    accent: "#F2CF4D", accentHover: "#F7DC6F", accentLight: "rgba(242,207,77,0.10)", accentMuted: "rgba(242,207,77,0.05)",
    primary: "#F2F2F0", primaryHover: "#FFFFFF", primaryLight: "#262626",
    success: "#4ADE80", successLight: "rgba(74,222,128,0.10)", successBorder: "rgba(74,222,128,0.18)",
    danger: "#F87171", dangerLight: "rgba(248,113,113,0.10)", dangerBorder: "rgba(248,113,113,0.18)",
    shadow: "0 1px 3px rgba(0,0,0,0.5)", shadowLg: "0 6px 24px rgba(0,0,0,0.5)", shadowXl: "0 16px 48px rgba(0,0,0,0.6)",
    overlay: "rgba(0,0,0,0.65)", canvasBg: "#101010", pinOpen: "#F87171", pinResolved: "#4ADE80",
  },
};

const Icon = ({ name, size = 16, color = "currentColor" }) => {
  const i = {
    plus: <><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>,
    back: <><polyline points="15 18 9 12 15 6"/></>,
    pin: <><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></>,
    share: <><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></>,
    users: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>,
    trash: <><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></>,
    check: <><polyline points="20 6 9 17 4 12"/></>,
    x: <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>,
    camera: <><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></>,
    monitor: <><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></>,
    tablet: <><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></>,
    phone: <><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></>,
    message: <><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></>,
    image: <><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></>,
    globe: <><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></>,
    sun: <><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></>,
    moon: <><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></>,
    link: <><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></>,
    upload: <><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></>,
    logout: <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></>,
    send: <><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></>,
    crop: <><path d="M6.13 1L6 16a2 2 0 0 0 2 2h15"/><path d="M1 6.13L16 6a2 2 0 0 1 2 2v15"/></>,
    alertCircle: <><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>{i[name]}</svg>;
};

function captureRegion(src, px, py, cb) {
  const img = new Image(); img.crossOrigin = "anonymous";
  img.onload = () => { const c = document.createElement("canvas"), x = c.getContext("2d"); c.width = 400; c.height = 260; const sx = Math.max(0, Math.min((px/100)*img.width-200, img.width-400)); const sy = Math.max(0, Math.min((py/100)*img.height-130, img.height-260)); x.drawImage(img,sx,sy,400,260,0,0,400,260); const mx=(px/100)*img.width-sx, my=(py/100)*img.height-sy; x.fillStyle="#EF4444"; x.beginPath(); x.arc(mx,my,8,0,Math.PI*2); x.fill(); x.fillStyle="#FFF"; x.font="bold 10px sans-serif"; x.textAlign="center"; x.textBaseline="middle"; x.fillText("!",mx,my); x.strokeStyle="rgba(242,207,77,0.4)"; x.lineWidth=2; x.strokeRect(1,1,398,258); cb(c.toDataURL("image/jpeg",0.7)); };
  img.onerror = () => cb(null); img.src = src;
}

function genIframeShot(url, px, py, idx, cb) {
  const c = document.createElement("canvas"), x = c.getContext("2d"); c.width=400; c.height=260;
  x.fillStyle="#F7F7F5"; x.fillRect(0,0,400,260); x.fillStyle="#FFF"; x.fillRect(0,0,400,36); x.strokeStyle="#E8E8E5"; x.lineWidth=1; x.beginPath(); x.moveTo(0,36); x.lineTo(400,36); x.stroke();
  [["#FF5F57",16],["#FFBD2E",30],["#28CA42",44]].forEach(([cl,cx])=>{ x.fillStyle=cl; x.beginPath(); x.arc(cx,18,5,0,Math.PI*2); x.fill(); });
  x.fillStyle="#F7F7F5"; x.beginPath(); x.roundRect(60,8,280,20,4); x.fill(); x.fillStyle="#999"; x.font="11px sans-serif"; x.textAlign="left"; x.fillText(url.length>40?url.substring(0,40)+"...":url,68,22);
  x.fillStyle="#E8E8E5"; for(let j=0;j<8;j++){x.beginPath();x.roundRect(20,50+j*24,120+Math.random()*200,10,3);x.fill();}
  const mx=(px/100)*400, my=36+(py/100)*224; x.fillStyle="#EF4444"; x.beginPath(); x.arc(mx,my,12,0,Math.PI*2); x.fill(); x.fillStyle="#FFF"; x.font="bold 12px sans-serif"; x.textAlign="center"; x.textBaseline="middle"; x.fillText(String(idx+1),mx,my);
  x.fillStyle="rgba(242,207,77,0.9)"; x.beginPath(); x.roundRect(mx-60,my+18,120,22,4); x.fill(); x.fillStyle="#1A1A1A"; x.font="11px sans-serif"; x.fillText("Pin at "+Math.round(px)+"%, "+Math.round(py)+"%",mx,my+29);
  cb(c.toDataURL("image/jpeg",0.7));
}

export default function NexxenCommenter() {
  const [theme, setTheme] = useState("light");
  const [user, setUser] = useState(null);
  const [view, setView] = useState("loading");
  const [projects, setProjects] = useState([]);
  const [currentProject, setCurrentProject] = useState(null);
  const [pins, setPins] = useState([]);
  const [members, setMembers] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState("desktop");
  const [selectedPin, setSelectedPin] = useState(null);
  const [isPlacingPin, setIsPlacingPin] = useState(false);
  const [pendingPinPos, setPendingPinPos] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [newAuthor, setNewAuthor] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showNewProject, setShowNewProject] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [showScreenshot, setShowScreenshot] = useState(null);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectUrl, setNewProjectUrl] = useState("");
  const [newProjectType, setNewProjectType] = useState("url");
  const [uploadedImage, setUploadedImage] = useState(null);
  const [toast, setToast] = useState("");
  const [loginForm, setLoginForm] = useState({ name: "", email: "", password: "" });
  const [authMode, setAuthMode] = useState("login");
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberRole, setNewMemberRole] = useState("editor");
  const [clientProject, setClientProject] = useState(null);
  const [clientMode, setClientMode] = useState(false);
  const [clientPerms, setClientPerms] = useState(null);
  const fileInputRef = useRef(null);
  const iframeRef = useRef(null);
  const t = themes[theme];
  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3000); };
  const css = "@keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}@keyframes slideUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}@keyframes spin{to{transform:rotate(360deg)}}";
  const fontLink = "https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&display=swap";

  useEffect(() => {
    (async () => {
      if (!supabase) { setView("error"); return; }
      setTheme(DB.getTheme());
      const hash = window.location.hash;
      if (hash.startsWith("#/review/")) {
        const parts = hash.replace("#/review/", "").split("/");
        const proj = await DB.getProject(parts[0]);
        if (proj) {
          const fb = await DB.getPins(proj.id);
          const mems = await DB.getMembers(proj.id);
          const acc = mems.find(m => m.token === (parts[1] || ""));
          setClientProject(proj); setPins(fb); setMembers(mems);
          setClientPerms(acc ? ROLE_PERMS[acc.role] : ROLE_PERMS.viewer);
          setClientMode(true); setView("project");
        } else setView("auth");
        return;
      }
      const session = DB.getSession();
      if (session) {
        setUser(session);
        setProjects(await DB.getProjectsForUser(session.id, session.email, session.email === ADMIN_EMAIL));
        setView("dashboard");
      } else setView("auth");
    })();
  }, []);

  const handleAuth = async () => {
    if (!loginForm.name.trim() || !loginForm.password.trim()) return;
    if (authMode === "register") {
      if (!loginForm.email.trim()) return;
      if (await DB.findUserByEmail(loginForm.email.trim())) { showToast("Account with this email already exists."); return; }
      const u = await DB.createUser({ name: loginForm.name.trim(), email: loginForm.email.trim(), password: loginForm.password, role: "user" });
      if (u) { DB.setSession(u); setUser(u); setProjects([]); setView("dashboard"); }
    } else {
      const u = await DB.findUserByLogin(loginForm.name.trim(), loginForm.password);
      if (u) { DB.setSession(u); setUser(u); setProjects(await DB.getProjectsForUser(u.id, u.email, u.email === ADMIN_EMAIL)); setView("dashboard"); }
      else showToast("Invalid credentials.");
    }
  };
  const handleLogout = () => { DB.clearSession(); setUser(null); setView("auth"); setCurrentProject(null); setProjects([]); };

  const createProject = async () => {
    if (!newProjectName.trim()) return;
    const p = await DB.createProject({ name: newProjectName.trim(), url: newProjectType === "url" ? newProjectUrl.trim() : "", type: newProjectType, image_data: newProjectType === "image" ? uploadedImage : null, owner_id: user.id, owner_name: user.name, feedback_count: 0 });
    if (p) {
      await DB.addMember({ project_id: p.id, user_id: user.id, name: user.name, email: user.email, role: ROLES.OWNER });
      setProjects(prev => [p, ...prev]); setShowNewProject(false); setNewProjectName(""); setNewProjectUrl(""); setUploadedImage(null); openProject(p);
    }
  };
  const openProject = async (p) => { setCurrentProject(p); setPins(await DB.getPins(p.id)); setMembers(await DB.getMembers(p.id)); setSelectedPin(null); setIframeLoaded(false); setView("project"); };
  const deleteProject = async (id) => { await DB.deleteProject(id); setProjects(prev => prev.filter(p => p.id !== id)); showToast("Project deleted."); };

  const addMember = async () => {
    if (!newMemberEmail.trim()) return;
    const proj = currentProject || clientProject; if (!proj) return;
    const m = await DB.addMember({ project_id: proj.id, user_id: null, name: newMemberEmail.split("@")[0], email: newMemberEmail.trim(), role: newMemberRole });
    if (m) { setMembers(prev => [...prev, m]); setNewMemberEmail(""); showToast("Member added as " + ROLE_LABELS[newMemberRole] + "."); }
  };
  const removeMember = async (email) => { const p = currentProject || clientProject; if (p) { await DB.removeMember(p.id, email); setMembers(prev => prev.filter(m => m.email !== email)); } };
  const updateMemberRole = async (email, role) => { const p = currentProject || clientProject; if (p) { await DB.updateMemberRole(p.id, email, role); setMembers(prev => prev.map(m => m.email === email ? { ...m, role } : m)); } };

  const handleCanvasClick = (e) => { if (!isPlacingPin) return; const r = e.currentTarget.getBoundingClientRect(); setPendingPinPos({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 }); setIsPlacingPin(false); };

  const submitNewPin = async () => {
    if (!newComment.trim() || !pendingPinPos) return;
    const proj = currentProject || clientProject; if (!proj) return;
    const author = clientMode ? (newAuthor.trim() || "Guest") : (user?.name || "Anonymous");
    const pin = await DB.createPin({ project_id: proj.id, x: pendingPinPos.x, y: pendingPinPos.y, status: "open", screenshot: null, device: selectedDevice });
    if (!pin) return;
    await DB.addComment(pin.id, author, newComment.trim());
    const idx = pins.length;
    const saveSS = (d) => { if (d) { DB.updatePinScreenshot(pin.id, d); setPins(prev => prev.map(p => p.id === pin.id ? { ...p, screenshot: d } : p)); } };
    if (proj.type === "image" && proj.image_data) captureRegion(proj.image_data, pendingPinPos.x, pendingPinPos.y, saveSS);
    else if (proj.type === "url" && proj.url) genIframeShot(proj.url, pendingPinPos.x, pendingPinPos.y, idx, saveSS);
    setPins(prev => [...prev, { ...pin, comments: [{ author, text: newComment.trim(), timestamp: new Date().toISOString() }] }]);
    setPendingPinPos(null); setNewComment(""); setSelectedPin(pin.id);
    if (currentProject) {
      const nc = (currentProject.feedback_count || 0) + 1;
      await DB.updateProject(currentProject.id, { feedback_count: nc });
      const up = { ...currentProject, feedback_count: nc }; setCurrentProject(up); setProjects(prev => prev.map(p => p.id === up.id ? up : p));
    }
  };
  const handleReply = async (pinId, text, author) => { await DB.addComment(pinId, author, text); setPins(prev => prev.map(p => p.id === pinId ? { ...p, comments: [...p.comments, { author, text, timestamp: new Date().toISOString() }] } : p)); };
  const handleResolve = async (pinId) => { const p = pins.find(x => x.id === pinId); if (!p) return; const ns = p.status === "resolved" ? "open" : "resolved"; await DB.updatePinStatus(pinId, ns); setPins(prev => prev.map(x => x.id === pinId ? { ...x, status: ns } : x)); };
  const handleDeletePin = async (pinId) => { await DB.deletePin(pinId); setPins(prev => prev.filter(p => p.id !== pinId)); if (selectedPin === pinId) setSelectedPin(null); };
  const copyShareLink = (tok) => { const p = currentProject || clientProject; if (!p) return; const token = tok || members.find(m => m.role === "owner")?.token || ""; navigator.clipboard.writeText(window.location.origin + window.location.pathname + "#/review/" + p.id + "/" + token).then(() => showToast("Share link copied.")).catch(() => showToast("Could not copy link.")); };
  const handleImageUpload = (e) => { const f = e.target.files?.[0]; if (!f) return; const r = new FileReader(); r.onload = async (ev) => { if (showNewProject) setUploadedImage(ev.target.result); else if (currentProject) { await DB.updateProject(currentProject.id, { image_data: ev.target.result, type: "image" }); setCurrentProject(prev => ({ ...prev, image_data: ev.target.result, type: "image" })); } }; r.readAsDataURL(f); };
  const toggleTheme = () => { const n = theme === "light" ? "dark" : "light"; setTheme(n); DB.setTheme(n); };

  const filteredPins = pins.filter(p => filterStatus === "all" || p.status === filterStatus);
  const activeProj = currentProject || clientProject;
  const projImage = activeProj?.image_data; const projUrl = activeProj?.url; const projType = activeProj?.type;
  const isSuperAdmin = user?.email === ADMIN_EMAIL;
  const userRole = useMemo(() => {
    if (clientPerms) return clientPerms;
    if (!user || !members.length) return ROLE_PERMS.viewer;
    if (isSuperAdmin) return ROLE_PERMS.owner;
    const m = members.find(x => x.user_id === user.id || x.email === user.email);
    return m ? ROLE_PERMS[m.role] : ROLE_PERMS.viewer;
  }, [user, members, clientPerms, isSuperAdmin]);

  const S = {
    page: { minHeight: "100vh", background: t.bg, color: t.text, fontFamily: "'Sora', sans-serif", transition: "background 0.3s, color 0.3s" },
    header: { background: t.bgAlt, borderBottom: "1px solid " + t.border, padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 56, position: "sticky", top: 0, zIndex: 100 },
    logoMark: { background: t.accent, width: 32, height: 32, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: t.text, fontWeight: 700, fontSize: 15 },
    btn: { background: t.primary, border: "none", color: t.textInverse, borderRadius: 8, padding: "8px 18px", fontSize: 13, cursor: "pointer", fontWeight: 600, display: "flex", alignItems: "center", gap: 6 },
    btnGhost: { background: "transparent", border: "1px solid " + t.border, color: t.textSecondary, borderRadius: 8, padding: "7px 14px", fontSize: 13, cursor: "pointer", fontWeight: 500, display: "flex", alignItems: "center", gap: 6 },
    btnDanger: { background: t.dangerLight, border: "1px solid " + t.dangerBorder, color: t.danger, borderRadius: 8, padding: "7px 14px", fontSize: 13, cursor: "pointer", fontWeight: 500 },
    input: { width: "100%", boxSizing: "border-box", background: t.bgMuted, border: "1px solid " + t.border, borderRadius: 8, padding: "10px 14px", color: t.text, fontSize: 13, outline: "none", fontFamily: "'Sora',sans-serif" },
    modal: { position: "fixed", inset: 0, background: t.overlay, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, backdropFilter: "blur(6px)" },
    modalContent: { background: t.bgAlt, borderRadius: 16, padding: 28, width: 460, border: "1px solid " + t.border, boxShadow: t.shadowXl },
    label: { fontSize: 12, color: t.textSecondary, fontWeight: 600, display: "block", marginBottom: 5 },
    badge: (c, bg) => ({ background: bg, color: c, padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, display: "inline-block" }),
  };

  if (view === "error") return (<div style={{...S.page, display:"flex",alignItems:"center",justifyContent:"center"}}><link href={fontLink} rel="stylesheet"/><style>{css}</style><div style={{textAlign:"center",maxWidth:440,padding:24}}><Icon name="alertCircle" size={40} color={t.danger}/><h2 style={{fontSize:20,fontWeight:700,marginTop:16,marginBottom:8}}>Database Not Connected</h2><p style={{color:t.textSecondary,fontSize:14,lineHeight:1.6,marginBottom:20}}>Create a <code style={{background:t.bgMuted,padding:"2px 6px",borderRadius:4}}>.env</code> file in your project root:</p><div style={{background:t.bgMuted,borderRadius:10,padding:16,textAlign:"left",fontSize:13,fontFamily:"monospace",lineHeight:1.8,border:"1px solid "+t.border}}>VITE_SUPABASE_URL=https://your-project.supabase.co<br/>VITE_SUPABASE_ANON_KEY=your-anon-key-here</div><p style={{color:t.textMuted,fontSize:12,marginTop:14}}>Then restart with <code style={{background:t.bgMuted,padding:"2px 6px",borderRadius:4}}>npm run dev</code></p></div></div>);

  if (view === "loading") return (<div style={{...S.page,display:"flex",alignItems:"center",justifyContent:"center"}}><link href={fontLink} rel="stylesheet"/><style>{css}</style><div style={{textAlign:"center"}}><div style={{width:36,height:36,border:"3px solid "+t.border,borderTopColor:t.accent,borderRadius:"50%",animation:"spin .8s linear infinite",margin:"0 auto 14px"}}/><p style={{color:t.textMuted,fontSize:13}}>Loading...</p></div></div>);

  if (view === "auth") return (<div style={{...S.page,display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh"}}><link href={fontLink} rel="stylesheet"/><style>{css}</style><div style={{width:400,animation:"fadeIn .4s ease"}}><div style={{textAlign:"center",marginBottom:32}}><div style={{...S.logoMark,width:48,height:48,fontSize:22,borderRadius:12,margin:"0 auto 14px",overflow:"hidden",padding:0}}><img src={LOGO_SRC} alt="NC" style={{width:"100%",height:"100%",objectFit:"cover"}}/></div><h1 style={{fontSize:24,fontWeight:700,marginBottom:4}}>Nexxen Commenter</h1><p style={{color:t.textMuted,fontSize:14}}>Visual feedback and collaboration tool</p></div><div style={S.modalContent}><div style={{display:"flex",marginBottom:20,background:t.bgMuted,borderRadius:8,padding:3}}>{["login","register"].map(m=><button key={m} onClick={()=>setAuthMode(m)} style={{flex:1,padding:"8px 0",borderRadius:6,border:"none",cursor:"pointer",background:authMode===m?t.bgAlt:"transparent",color:authMode===m?t.text:t.textMuted,fontWeight:600,fontSize:13,boxShadow:authMode===m?t.shadow:"none"}}>{m==="login"?"Sign In":"Create Account"}</button>)}</div><div style={{display:"flex",flexDirection:"column",gap:12}}><div><label style={S.label}>{authMode==="login"?"Name or Email":"Name"}</label><input value={loginForm.name} onChange={e=>setLoginForm(p=>({...p,name:e.target.value}))} placeholder={authMode==="login"?"Your name or email":"Your name"} style={S.input} onKeyDown={e=>e.key==="Enter"&&handleAuth()}/></div>{authMode==="register"&&<div><label style={S.label}>Email</label><input value={loginForm.email} onChange={e=>setLoginForm(p=>({...p,email:e.target.value}))} placeholder="you@company.com" style={S.input} type="email"/></div>}<div><label style={S.label}>Password</label><input value={loginForm.password} onChange={e=>setLoginForm(p=>({...p,password:e.target.value}))} placeholder="Enter password" style={S.input} type="password" onKeyDown={e=>e.key==="Enter"&&handleAuth()}/></div><button onClick={handleAuth} style={{...S.btn,justifyContent:"center",padding:"10px 0",marginTop:4,width:"100%"}}>{authMode==="login"?"Sign In":"Create Account"}</button></div></div><div style={{textAlign:"center",marginTop:16}}><button onClick={toggleTheme} style={{...S.btnGhost,margin:"0 auto",padding:"6px 14px"}}><Icon name={theme==="light"?"moon":"sun"} size={14}/> {theme==="light"?"Dark Mode":"Light Mode"}</button></div></div>{toast&&<div style={{position:"fixed",bottom:24,left:"50%",transform:"translateX(-50%)",background:t.danger,color:"#fff",padding:"10px 20px",borderRadius:8,fontSize:13,fontWeight:600,zIndex:9999}}>{toast}</div>}</div>);

  if (view === "dashboard") {
    return (<div style={S.page}><link href={fontLink} rel="stylesheet"/><style>{css}</style>
      <div style={S.header}><div style={{display:"flex",alignItems:"center",gap:10}}><div style={{...S.logoMark,overflow:"hidden",padding:0}}><img src={LOGO_SRC} alt="NC" style={{width:"100%",height:"100%",objectFit:"cover"}}/></div><div><div style={{fontSize:15,fontWeight:700}}>Nexxen Commenter</div><div style={{fontSize:10,color:t.textMuted,textTransform:"uppercase",letterSpacing:"0.06em"}}>Workspace</div></div></div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}><button onClick={toggleTheme} style={{...S.btnGhost,padding:"6px 10px"}}><Icon name={theme==="light"?"moon":"sun"} size={14}/></button><div style={{display:"flex",alignItems:"center",gap:8,padding:"4px 10px 4px 4px",background:t.bgMuted,borderRadius:8}}><div style={{width:28,height:28,borderRadius:7,background:t.accent,color:t.text,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700}}>{user?.name?.charAt(0).toUpperCase()}</div><span style={{fontSize:13,fontWeight:600}}>{user?.name}</span></div><button onClick={handleLogout} style={{...S.btnGhost,padding:"6px 10px"}}><Icon name="logout" size={14}/></button><button onClick={()=>setShowNewProject(true)} style={S.btn}><Icon name="plus" size={14}/> New Project</button></div></div>
      <div style={{maxWidth:1060,margin:"0 auto",padding:"28px 20px"}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14,marginBottom:28}}>{[{label:"Projects",value:projects.length,color:t.accent},{label:"Open Feedback",value:projects.reduce((a,p)=>a+(p.feedback_count||0),0),color:t.danger},{label:"Active This Week",value:projects.filter(p=>new Date(p.updated_at)>new Date(Date.now()-7*864e5)).length,color:t.success}].map((s,i)=><div key={i} style={{background:t.bgAlt,borderRadius:10,border:"1px solid "+t.border,padding:"18px 22px",animation:"fadeIn .3s ease "+i*.08+"s both"}}><p style={{fontSize:11,color:t.textMuted,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.06em"}}>{s.label}</p><p style={{fontSize:30,fontWeight:700,color:s.color,marginTop:2}}>{s.value}</p></div>)}</div>
        <h2 style={{fontSize:13,fontWeight:600,color:t.textMuted,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:16}}>Projects</h2>
        {projects.length===0&&!showNewProject&&<div style={{textAlign:"center",padding:"56px 24px",background:t.bgAlt,borderRadius:14,border:"1px dashed "+t.border}}><Icon name="image" size={40} color={t.textMuted}/><h3 style={{fontSize:17,fontWeight:600,marginTop:14,marginBottom:6}}>No projects yet</h3><p style={{color:t.textMuted,fontSize:13,maxWidth:340,margin:"0 auto 20px"}}>Create your first project to start collecting feedback.</p><button onClick={()=>setShowNewProject(true)} style={S.btn}><Icon name="plus" size={14}/> Create First Project</button></div>}
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:14}}>{projects.map((p,i)=><div key={p.id} style={{background:t.bgAlt,borderRadius:12,border:"1px solid "+t.border,overflow:"hidden",cursor:"pointer",transition:"box-shadow .2s,transform .2s",animation:"fadeIn .3s ease "+i*.04+"s both"}} onClick={()=>openProject(p)} onMouseEnter={e=>{e.currentTarget.style.boxShadow=t.shadowLg;e.currentTarget.style.transform="translateY(-2px)";}} onMouseLeave={e=>{e.currentTarget.style.boxShadow="none";e.currentTarget.style.transform="translateY(0)";}}><div style={{height:150,background:p.image_data?"url("+p.image_data+") center/cover":t.canvasBg,display:"flex",alignItems:"center",justifyContent:"center",borderBottom:"1px solid "+t.border}}>{!p.image_data&&<Icon name={p.url?"globe":"image"} size={32} color={t.textMuted}/>}</div><div style={{padding:"13px 16px"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"start"}}><div><h3 style={{fontSize:14,fontWeight:700,marginBottom:3}}>{p.name}</h3><p style={{fontSize:11,color:t.textMuted}}>{fmtDate(p.updated_at)}</p></div><div style={{display:"flex",gap:6,alignItems:"center"}}><span style={S.badge(t.danger,t.dangerLight)}>{p.feedback_count||0} pins</span><button onClick={e=>{e.stopPropagation();deleteProject(p.id);}} style={{background:"none",border:"none",cursor:"pointer",padding:4,color:t.textMuted,opacity:0.5}}><Icon name="trash" size={14}/></button></div></div></div></div>)}</div></div>
      {showNewProject&&<div style={S.modal} onClick={()=>setShowNewProject(false)}><div style={{...S.modalContent,animation:"slideUp .25s ease"}} onClick={e=>e.stopPropagation()}><h2 style={{fontSize:18,fontWeight:700,marginBottom:3}}>New Project</h2><p style={{color:t.textMuted,fontSize:13,marginBottom:22}}>Add a website URL or upload a screenshot.</p><div style={{display:"flex",flexDirection:"column",gap:14}}><div><label style={S.label}>Project Name</label><input value={newProjectName} onChange={e=>setNewProjectName(e.target.value)} placeholder="e.g., Homepage Redesign" style={S.input}/></div><div><label style={S.label}>Content Type</label><div style={{display:"flex",gap:8}}>{[{id:"url",label:"Website URL",icon:"globe"},{id:"image",label:"Upload Image",icon:"upload"}].map(o=><button key={o.id} onClick={()=>setNewProjectType(o.id)} style={{flex:1,padding:12,borderRadius:8,cursor:"pointer",textAlign:"center",background:newProjectType===o.id?t.accentLight:t.bgMuted,border:"1px solid "+(newProjectType===o.id?t.accent:t.border)}}><Icon name={o.icon} size={18} color={newProjectType===o.id?t.accent:t.textMuted}/><div style={{fontSize:13,fontWeight:600,color:newProjectType===o.id?t.accent:t.text,marginTop:4}}>{o.label}</div></button>)}</div></div>{newProjectType==="url"&&<div><label style={S.label}>Website URL</label><input value={newProjectUrl} onChange={e=>setNewProjectUrl(e.target.value)} placeholder="https://example.com" style={S.input}/></div>}{newProjectType==="image"&&<div style={{border:"2px dashed "+t.border,borderRadius:10,padding:28,textAlign:"center",cursor:"pointer",background:uploadedImage?"url("+uploadedImage+") center/cover":t.bgMuted,minHeight:100,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",position:"relative"}} onClick={()=>fileInputRef.current?.click()}>{uploadedImage&&<div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.45)",borderRadius:8}}/>}<div style={{position:"relative",zIndex:1}}><Icon name={uploadedImage?"check":"upload"} size={24} color={uploadedImage?"#fff":t.textMuted}/><p style={{color:uploadedImage?"#fff":t.textMuted,fontSize:13,marginTop:6}}>{uploadedImage?"Uploaded. Click to change.":"Click to upload"}</p></div><input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} style={{display:"none"}}/></div>}<div style={{display:"flex",gap:10,marginTop:4}}><button onClick={()=>{setShowNewProject(false);setUploadedImage(null);}} style={{...S.btnGhost,flex:1,justifyContent:"center"}}>Cancel</button><button onClick={createProject} disabled={!newProjectName.trim()} style={{...S.btn,flex:1,justifyContent:"center",opacity:newProjectName.trim()?1:0.4,cursor:newProjectName.trim()?"pointer":"not-allowed"}}>Create Project</button></div></div></div></div>}
      {toast&&<div style={{position:"fixed",bottom:24,left:"50%",transform:"translateX(-50%)",background:t.primary,color:t.textInverse,padding:"10px 20px",borderRadius:8,fontSize:13,fontWeight:600,zIndex:9999,animation:"fadeIn .2s ease"}}>{toast}</div>}</div>);
  }

  if (view === "project" && activeProj) {
    const device = DEVICES.find(d => d.id === selectedDevice) || DEVICES[0];
    const canAdd = userRole.addFeedback || clientMode;
    const canManage = userRole.manageFeedback;
    const canMembers = userRole.manageMembers;
    return (<div style={S.page}><link href={fontLink} rel="stylesheet"/><style>{css}</style>
      <div style={S.header}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>{!clientMode&&<button onClick={()=>{setView("dashboard");setCurrentProject(null);}} style={{...S.btnGhost,padding:"5px 10px"}}><Icon name="back" size={14}/></button>}<div style={{...S.logoMark,overflow:"hidden",padding:0}}><img src={LOGO_SRC} alt="NC" style={{width:"100%",height:"100%",objectFit:"cover"}}/></div><div><div style={{fontSize:14,fontWeight:700}}>{activeProj.name}</div><div style={{fontSize:10,color:t.textMuted,maxWidth:200,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{clientMode?"Review Mode":(projUrl||"Image Upload")}</div></div></div>
        <div style={{display:"flex",gap:2,background:t.bgMuted,borderRadius:7,padding:2}}>{DEVICES.map(d=>{const ic=d.id==="desktop"?"monitor":d.id==="tablet"?"tablet":"phone";return<button key={d.id} onClick={()=>setSelectedDevice(d.id)} style={{background:selectedDevice===d.id?t.bgAlt:"transparent",border:selectedDevice===d.id?"1px solid "+t.border:"1px solid transparent",color:selectedDevice===d.id?t.accent:t.textMuted,borderRadius:5,padding:"4px 10px",cursor:"pointer",fontSize:11,fontWeight:600,display:"flex",alignItems:"center",gap:4,boxShadow:selectedDevice===d.id?t.shadow:"none"}}><Icon name={ic} size={13}/> {d.px}</button>;})}</div>
        <div style={{display:"flex",gap:6,alignItems:"center"}}>
          {canAdd&&<button onClick={()=>setIsPlacingPin(!isPlacingPin)} style={{...(isPlacingPin?S.btnDanger:S.btnGhost),padding:"6px 12px"}}><Icon name={isPlacingPin?"x":"pin"} size={14}/> {isPlacingPin?"Cancel":"Add Pin"}</button>}
          {!clientMode&&<><button onClick={()=>fileInputRef.current?.click()} style={{...S.btnGhost,padding:"6px 10px"}}><Icon name="camera" size={14}/></button><input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} style={{display:"none"}}/></>}
          {canMembers&&<button onClick={()=>setShowMembers(true)} style={{...S.btnGhost,padding:"6px 10px"}}><Icon name="users" size={14}/></button>}
          {!clientMode&&<button onClick={()=>copyShareLink()} style={S.btn}><Icon name="share" size={13}/> Share</button>}
          <button onClick={toggleTheme} style={{...S.btnGhost,padding:"6px 10px"}}><Icon name={theme==="light"?"moon":"sun"} size={14}/></button>
          <button onClick={()=>setSidebarOpen(!sidebarOpen)} style={{...S.btnGhost,padding:"6px 10px",background:sidebarOpen?t.accentLight:"transparent",borderColor:sidebarOpen?t.accent:t.border,color:sidebarOpen?t.accent:t.textSecondary}}><Icon name="message" size={14}/> <span style={{fontSize:12,fontWeight:700}}>{filteredPins.length}</span></button></div></div>
      <div style={{display:"flex",height:"calc(100vh - 56px)"}}>
        <div style={{flex:1,overflow:"auto",display:"flex",justifyContent:"center",padding:20,background:t.canvasBg,cursor:isPlacingPin?"crosshair":"default"}}>
          <div style={{width:device.width,maxWidth:"100%",position:"relative",transition:"width .3s ease"}}>
            {projType==="url"&&projUrl?<div style={{position:"relative",width:"100%",height:"calc(100vh - 96px)",borderRadius:8,overflow:"hidden",border:"1px solid "+t.border,background:"#fff"}} onClick={handleCanvasClick}>
              <iframe ref={iframeRef} src={projUrl} style={{width:"100%",height:"100%",border:"none",background:"#fff",pointerEvents:isPlacingPin?"none":"auto"}} onLoad={()=>setIframeLoaded(true)} sandbox="allow-scripts allow-same-origin allow-forms allow-popups"/>
              {!iframeLoaded&&<div style={{position:"absolute",inset:0,background:t.bgAlt,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column"}}><div style={{width:28,height:28,border:"2px solid "+t.border,borderTopColor:t.accent,borderRadius:"50%",animation:"spin .8s linear infinite"}}/><p style={{color:t.textMuted,fontSize:12,marginTop:10}}>Loading website...</p></div>}
              {filteredPins.map(pin=><PinMarker key={pin.id} pin={pin} index={pins.indexOf(pin)} isSelected={selectedPin===pin.id} t={t} onClick={p=>setSelectedPin(selectedPin===p.id?null:p.id)}/>)}
              {pendingPinPos&&<PendingMarker pos={pendingPinPos} t={t}/>}</div>
            :projImage?<div style={{position:"relative",borderRadius:8,overflow:"hidden",border:"1px solid "+t.border}} onClick={handleCanvasClick}>
              <img src={projImage} style={{width:"100%",display:"block"}} alt="Project"/>
              {filteredPins.map(pin=><PinMarker key={pin.id} pin={pin} index={pins.indexOf(pin)} isSelected={selectedPin===pin.id} t={t} onClick={p=>setSelectedPin(selectedPin===p.id?null:p.id)}/>)}
              {pendingPinPos&&<PendingMarker pos={pendingPinPos} t={t}/>}</div>
            :<div style={{border:"2px dashed "+t.border,borderRadius:14,padding:56,textAlign:"center",background:t.bgAlt}}><Icon name="camera" size={36} color={t.textMuted}/><h3 style={{fontSize:16,fontWeight:600,marginTop:14,marginBottom:6}}>No content yet</h3><p style={{color:t.textMuted,fontSize:13,marginBottom:18}}>Upload a screenshot or add a website URL</p>{!clientMode&&<button onClick={()=>fileInputRef.current?.click()} style={S.btn}><Icon name="upload" size={14}/> Upload Image</button>}</div>}
            {pendingPinPos&&canAdd&&<div style={{position:"fixed",bottom:20,left:"50%",transform:"translateX(-50%)",background:t.bgAlt,borderRadius:12,padding:16,border:"1px solid "+t.accent,boxShadow:t.shadowXl,width:370,zIndex:999,animation:"fadeIn .2s ease"}}><div style={{display:"flex",alignItems:"center",gap:6,marginBottom:10}}><Icon name="pin" size={14} color={t.accent}/><span style={{fontSize:12,fontWeight:700,color:t.accent}}>New Feedback Pin</span></div>{clientMode&&<input value={newAuthor} onChange={e=>setNewAuthor(e.target.value)} placeholder="Your name" style={{...S.input,marginBottom:8}}/>}<textarea value={newComment} onChange={e=>setNewComment(e.target.value)} placeholder="Describe the issue..." rows={3} autoFocus style={{...S.input,resize:"none"}}/><p style={{fontSize:10,color:t.textMuted,margin:"6px 0 8px"}}>A screenshot will be captured automatically.</p><div style={{display:"flex",gap:8}}><button onClick={()=>{setPendingPinPos(null);setNewComment("");}} style={{...S.btnGhost,flex:1,justifyContent:"center"}}>Cancel</button><button onClick={submitNewPin} disabled={!newComment.trim()} style={{...S.btn,flex:1,justifyContent:"center",opacity:newComment.trim()?1:0.4,cursor:newComment.trim()?"pointer":"not-allowed"}}><Icon name="send" size={13}/> Submit</button></div></div>}
          </div></div>
        {sidebarOpen&&<div style={{width:350,background:t.bgAlt,borderLeft:"1px solid "+t.border,display:"flex",flexDirection:"column",animation:"fadeIn .2s ease"}}>
          <div style={{padding:"12px 14px",borderBottom:"1px solid "+t.border}}><h3 style={{fontSize:13,fontWeight:700,marginBottom:10}}>Feedback ({pins.length})</h3><div style={{display:"flex",gap:3,background:t.bgMuted,borderRadius:6,padding:2}}>{["all","open","resolved"].map(f=><button key={f} onClick={()=>setFilterStatus(f)} style={{flex:1,background:filterStatus===f?t.bgAlt:"transparent",border:"none",color:filterStatus===f?t.text:t.textMuted,borderRadius:4,padding:"4px 0",fontSize:11,cursor:"pointer",fontWeight:600,boxShadow:filterStatus===f?t.shadow:"none",textTransform:"capitalize"}}>{f} ({f==="all"?pins.length:pins.filter(p=>p.status===f).length})</button>)}</div></div>
          <div style={{flex:1,overflowY:"auto",padding:10}}>
            {filteredPins.length===0&&<div style={{textAlign:"center",padding:"36px 16px",color:t.textMuted}}><Icon name="message" size={28} color={t.textMuted}/><p style={{fontSize:13,fontWeight:600,marginTop:10}}>{filterStatus==="all"?"No feedback yet":"No "+filterStatus+" items"}</p></div>}
            <div style={{display:"flex",flexDirection:"column",gap:10}}>{filteredPins.map((pin,i)=>{const pidx=pins.indexOf(pin),isAct=selectedPin===pin.id;return<div key={pin.id} style={{background:isAct?t.accentMuted:t.bg,borderRadius:10,border:"1px solid "+(isAct?t.accent:t.border),overflow:"hidden",animation:"fadeIn .2s ease "+i*.03+"s both"}}>
              <div style={{padding:"10px 12px",display:"flex",alignItems:"center",justifyContent:"space-between",cursor:"pointer",borderBottom:"1px solid "+t.borderLight}} onClick={()=>setSelectedPin(isAct?null:pin.id)}>
                <div style={{display:"flex",alignItems:"center",gap:8}}><span style={{background:pin.status==="resolved"?t.success:t.danger,color:"#fff",width:22,height:22,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700}}>{pidx+1}</span><span style={{fontSize:12,fontWeight:600}}>Pin #{pidx+1}</span><span style={S.badge(pin.status==="resolved"?t.success:t.danger,pin.status==="resolved"?t.successLight:t.dangerLight)}>{pin.status}</span></div>
                <div style={{display:"flex",gap:4}}>{pin.screenshot&&<button onClick={e=>{e.stopPropagation();setShowScreenshot(pin.screenshot);}} style={{background:"none",border:"none",cursor:"pointer",padding:3,color:t.textMuted}}><Icon name="crop" size={13}/></button>}{canManage&&<button onClick={e=>{e.stopPropagation();handleResolve(pin.id);}} style={{background:"none",border:"none",cursor:"pointer",padding:3,color:pin.status==="resolved"?t.success:t.textMuted}}><Icon name="check" size={13}/></button>}{canManage&&<button onClick={e=>{e.stopPropagation();handleDeletePin(pin.id);}} style={{background:"none",border:"none",cursor:"pointer",padding:3,color:t.textMuted,opacity:0.5}}><Icon name="trash" size={13}/></button>}</div></div>
              {pin.screenshot&&isAct&&<div style={{padding:"8px 12px",borderBottom:"1px solid "+t.borderLight}}><img src={pin.screenshot} style={{width:"100%",borderRadius:6,border:"1px solid "+t.border,cursor:"pointer"}} onClick={()=>setShowScreenshot(pin.screenshot)} alt="Screenshot"/></div>}
              <div style={{maxHeight:isAct?300:60,overflow:"hidden",transition:"max-height .2s ease"}}>{pin.comments.map((c,ci)=><div key={ci} style={{padding:"8px 12px",borderBottom:ci<pin.comments.length-1?"1px solid "+t.borderLight:"none"}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}><span style={{color:t.accent,fontSize:11,fontWeight:700}}>{c.author}</span><span style={{color:t.textMuted,fontSize:10}}>{fmtFull(c.timestamp)}</span></div><p style={{color:t.textSecondary,fontSize:12,lineHeight:1.5,margin:0}}>{c.text}</p></div>)}</div>
              {isAct&&canAdd&&<ReplyBox pinId={pin.id} onReply={handleReply} user={user} clientMode={clientMode} t={t} S={S}/>}
            </div>;})}</div></div></div>}
      </div>
      {showMembers&&<div style={S.modal} onClick={()=>setShowMembers(false)}><div style={{...S.modalContent,width:520,animation:"slideUp .25s ease",maxHeight:"80vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}><div><h2 style={{fontSize:18,fontWeight:700}}>Team Members</h2><p style={{color:t.textMuted,fontSize:13,marginTop:2}}>Manage access and permissions.</p></div><button onClick={()=>setShowMembers(false)} style={{background:"none",border:"none",cursor:"pointer",color:t.textMuted}}><Icon name="x" size={18}/></button></div>
        {canMembers&&<div style={{display:"flex",gap:8,marginBottom:20}}><input value={newMemberEmail} onChange={e=>setNewMemberEmail(e.target.value)} placeholder="Email address" style={{...S.input,flex:1}}/><select value={newMemberRole} onChange={e=>setNewMemberRole(e.target.value)} style={{...S.input,width:110,cursor:"pointer"}}><option value="admin">Admin</option><option value="editor">Editor</option><option value="viewer">Viewer</option></select><button onClick={addMember} style={S.btn}>Add</button></div>}
        <div style={{background:t.bgMuted,borderRadius:8,padding:"10px 14px",marginBottom:16,border:"1px solid "+t.border}}><p style={{fontSize:11,fontWeight:700,color:t.textSecondary,marginBottom:6}}>Permission Levels</p><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"4px 16px",fontSize:11,color:t.textMuted}}><span><strong style={{color:t.text}}>Owner</strong> -- Full control</span><span><strong style={{color:t.text}}>Admin</strong> -- Manage members/feedback</span><span><strong style={{color:t.text}}>Editor</strong> -- Add feedback</span><span><strong style={{color:t.text}}>Viewer</strong> -- View only</span></div></div>
        <div style={{display:"flex",flexDirection:"column",gap:6}}>{members.map((m,i)=><div key={i} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 12px",background:t.bg,borderRadius:8,border:"1px solid "+t.border}}><div style={{display:"flex",alignItems:"center",gap:10}}><div style={{width:32,height:32,borderRadius:8,background:t.accentLight,color:t.accent,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700}}>{m.name?.charAt(0).toUpperCase()}</div><div><div style={{fontSize:13,fontWeight:600}}>{m.name}</div><div style={{fontSize:11,color:t.textMuted}}>{m.email}</div></div></div><div style={{display:"flex",alignItems:"center",gap:8}}>{m.role==="owner"?<span style={S.badge(t.accent,t.accentLight)}>Owner</span>:canMembers?<><select value={m.role} onChange={e=>updateMemberRole(m.email,e.target.value)} style={{...S.input,width:90,padding:"4px 8px",fontSize:11,cursor:"pointer"}}><option value="admin">Admin</option><option value="editor">Editor</option><option value="viewer">Viewer</option></select><button onClick={()=>copyShareLink(m.token)} style={{background:"none",border:"none",cursor:"pointer",color:t.textMuted,padding:4}}><Icon name="link" size={13}/></button><button onClick={()=>removeMember(m.email)} style={{background:"none",border:"none",cursor:"pointer",color:t.danger,padding:4}}><Icon name="x" size={13}/></button></>:<span style={S.badge(t.textSecondary,t.bgMuted)}>{ROLE_LABELS[m.role]}</span>}</div></div>)}</div></div></div>}
      {showScreenshot&&<div style={S.modal} onClick={()=>setShowScreenshot(null)}><div style={{animation:"slideUp .25s ease",maxWidth:500,width:"90%"}} onClick={e=>e.stopPropagation()}><div style={{background:t.bgAlt,borderRadius:12,overflow:"hidden",border:"1px solid "+t.border,boxShadow:t.shadowXl}}><div style={{padding:"10px 14px",borderBottom:"1px solid "+t.border,display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{fontSize:13,fontWeight:700}}>Pin Screenshot</span><button onClick={()=>setShowScreenshot(null)} style={{background:"none",border:"none",cursor:"pointer",color:t.textMuted}}><Icon name="x" size={16}/></button></div><img src={showScreenshot} style={{width:"100%",display:"block"}} alt="Screenshot"/></div></div></div>}
      {toast&&<div style={{position:"fixed",bottom:24,left:"50%",transform:"translateX(-50%)",background:t.primary,color:t.textInverse,padding:"10px 20px",borderRadius:8,fontSize:13,fontWeight:600,zIndex:9999,animation:"fadeIn .2s ease"}}>{toast}</div>}
    </div>);
  }
  return null;
}

function PinMarker({pin,index,isSelected,t,onClick}){const c=pin.status==="resolved"?t.pinResolved:t.pinOpen;return<div onClick={e=>{e.stopPropagation();onClick(pin);}} style={{position:"absolute",left:pin.x+"%",top:pin.y+"%",transform:"translate(-50%,-100%)",cursor:"pointer",zIndex:isSelected?100:10,filter:isSelected?"drop-shadow(0 0 6px "+c+")":"none",transition:"filter .15s"}}><svg width="26" height="34" viewBox="0 0 26 34"><path d="M13 0C5.82 0 0 5.82 0 13c0 9.75 13 21 13 21s13-11.25 13-21C26 5.82 20.18 0 13 0z" fill={c}/><text x="13" y="17" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="700" fontFamily="sans-serif">{index+1}</text></svg></div>;}

function PendingMarker({pos,t}){return<div style={{position:"absolute",left:pos.x+"%",top:pos.y+"%",transform:"translate(-50%,-100%)",zIndex:200}}><svg width="26" height="34" viewBox="0 0 26 34"><path d="M13 0C5.82 0 0 5.82 0 13c0 9.75 13 21 13 21s13-11.25 13-21C26 5.82 20.18 0 13 0z" fill={t.accent} opacity="0.7"/><text x="13" y="17" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="700">?</text></svg></div>;}

function ReplyBox({pinId,onReply,user,clientMode,t,S}){const[text,setText]=useState("");const[author,setAuthor]=useState("");const submit=()=>{if(!text.trim())return;onReply(pinId,text.trim(),clientMode?(author.trim()||"Guest"):(user?.name||"Anonymous"));setText("");};return<div style={{padding:"8px 12px",borderTop:"1px solid "+t.borderLight,background:t.bgMuted}}>{clientMode&&<input value={author} onChange={e=>setAuthor(e.target.value)} placeholder="Your name" style={{...S.input,marginBottom:6,fontSize:12,padding:"6px 10px"}}/>}<div style={{display:"flex",gap:6}}><input value={text} onChange={e=>setText(e.target.value)} placeholder="Reply..." onKeyDown={e=>e.key==="Enter"&&submit()} style={{...S.input,flex:1,fontSize:12,padding:"6px 10px"}}/><button onClick={submit} style={{...S.btn,padding:"6px 12px",fontSize:12}}><Icon name="send" size={12}/></button></div></div>;}
