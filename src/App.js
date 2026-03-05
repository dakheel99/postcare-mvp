import { useState } from "react";

const patients = [
  {
    id: 1, name: "محمد العتيبي", age: 52, surgery: "استئصال المرارة",
    day: 3, phone: "0501234567", risk: "متوسط",
    doctor: "د. سعد الغامدي", dept: "الجراحة العامة",
    alerts: ["حرارة 38.2°م", "ألم متزايد في موضع الجرح"],
    status: "تحذير", lastResponse: "منذ 4 ساعات",
    vitals: { pain: 6, fever: 38.2, wound: "تورم خفيف", mobility: "محدودة" },
    timeline: [
      { day: 1, status: "✅", note: "حالة جيدة، ألم طبيعي" },
      { day: 2, status: "✅", note: "تحسن ملحوظ" },
      { day: 3, status: "⚠️", note: "ارتفاع حرارة وألم" },
    ]
  },
  {
    id: 2, name: "فاطمة الزهراني", age: 38, surgery: "استئصال الزائدة",
    day: 7, phone: "0557654321", risk: "منخفض",
    doctor: "د. نورة السبيعي", dept: "الجراحة العامة",
    alerts: [],
    status: "مستقر", lastResponse: "منذ ساعة",
    vitals: { pain: 2, fever: 36.8, wound: "التئام جيد", mobility: "طبيعية" },
    timeline: [
      { day: 1, status: "✅", note: "بعد العملية بخير" },
      { day: 3, status: "✅", note: "تعافٍ ممتاز" },
      { day: 7, status: "✅", note: "شبه طبيعي" },
    ]
  },
  {
    id: 3, name: "خالد الدوسري", age: 65, surgery: "استبدال الركبة",
    day: 5, phone: "0509876543", risk: "مرتفع",
    doctor: "د. عبدالله المطيري", dept: "العظام",
    alerts: ["لم يستجب منذ 12 ساعة", "مريض مزمن - سكري"],
    status: "خطر", lastResponse: "منذ 12 ساعة",
    vitals: { pain: 8, fever: 38.9, wound: "غير معروف", mobility: "غير معروفة" },
    timeline: [
      { day: 1, status: "✅", note: "استيقاظ من التخدير جيد" },
      { day: 3, status: "⚠️", note: "ألم شديد" },
      { day: 5, status: "🔴", note: "لا يوجد رد" },
    ]
  },
  {
    id: 4, name: "سارة القحطاني", age: 29, surgery: "استئصال كيس مبيضي",
    day: 1, phone: "0543217890", risk: "منخفض",
    doctor: "د. هناء الشمري", dept: "أمراض النساء",
    alerts: [],
    status: "جديد", lastResponse: "الآن",
    vitals: { pain: 4, fever: 37.1, wound: "طبيعي", mobility: "محدودة" },
    timeline: [
      { day: 1, status: "✅", note: "اليوم الأول - متابعة" },
    ]
  },
];

const questions = {
  1: ["هل تشعر بألم شديد في مكان العملية؟ (من 1 إلى 10)", "هل قست حرارتك؟ ما هي درجتها؟", "هل لاحظت أي تورم أو احمرار في الجرح؟", "هل تستطيع التنفس بشكل طبيعي؟"],
  3: ["هل لاحظت أي إفرازات من الجرح؟", "هل تتناول مضادات الحيوية كما وصف الطبيب؟", "ما درجة ألمك اليوم مقارنة بالأمس؟", "هل استطعت المشي قليلاً؟"],
  7: ["هل الجرح يلتئم بشكل جيد في رأيك؟", "هل تحتاج إلى مسكنات للألم؟", "هل عدت لممارسة نشاطاتك اليومية؟", "هل لديك أي قلق تود مشاركته مع الطبيب؟"],
};

const statusConfig = {
  "مستقر": { bg: "rgba(16,185,129,0.15)", text: "#10b981", border: "rgba(16,185,129,0.3)", dot: "#10b981" },
  "تحذير": { bg: "rgba(245,158,11,0.15)", text: "#f59e0b", border: "rgba(245,158,11,0.3)", dot: "#f59e0b" },
  "خطر":   { bg: "rgba(239,68,68,0.15)",  text: "#ef4444", border: "rgba(239,68,68,0.3)",  dot: "#ef4444" },
  "جديد":  { bg: "rgba(59,130,246,0.15)", text: "#3b82f6", border: "rgba(59,130,246,0.3)", dot: "#3b82f6" },
};

const riskColors = {
  "منخفض": { color: "#10b981", bg: "rgba(16,185,129,0.1)" },
  "متوسط": { color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
  "مرتفع": { color: "#ef4444", bg: "rgba(239,68,68,0.1)" },
};

const S = {
  page:       { minHeight:"100vh", background:"#030712", color:"#f9fafb", fontFamily:"'Segoe UI',Tahoma,Arial,sans-serif", direction:"rtl" },
  header:     { background:"#111827", borderBottom:"1px solid #1f2937", padding:"16px 24px", display:"flex", alignItems:"center", justifyContent:"space-between" },
  logoBox:    { width:40, height:40, borderRadius:12, background:"linear-gradient(135deg,#14b8a6,#0891b2)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 },
  nav:        { background:"#111827", borderBottom:"1px solid #1f2937", padding:"0 24px", display:"flex", gap:4 },
  navBtn:     (active) => ({ padding:"12px 20px", fontSize:14, fontWeight:500, border:"none", borderBottom: active ? "2px solid #14b8a6" : "2px solid transparent", color: active ? "#14b8a6" : "#9ca3af", background:"transparent", cursor:"pointer", transition:"all 0.2s" }),
  content:    { padding:24, maxWidth:1200, margin:"0 auto" },
  grid4:      { display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:24 },
  statCard:   (grad) => ({ background:`linear-gradient(135deg,${grad})`, borderRadius:16, padding:20, boxShadow:"0 4px 20px rgba(0,0,0,0.3)" }),
  card:       { background:"#111827", borderRadius:16, border:"1px solid #1f2937", overflow:"hidden" },
  cardHead:   { padding:"16px 20px", borderBottom:"1px solid #1f2937", display:"flex", justifyContent:"space-between", alignItems:"center" },
  grid23:     { display:"grid", gridTemplateColumns:"2fr 1fr", gap:24 },
  grid32:     { display:"grid", gridTemplateColumns:"1fr 2fr", gap:24 },
  row:        { display:"flex", alignItems:"center", gap:12 },
  avatar:     { width:40, height:40, borderRadius:12, background:"linear-gradient(135deg,#14b8a6,#0891b2)", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:"bold", fontSize:16, flexShrink:0 },
  badge:      (bg,color,border) => ({ display:"inline-flex", alignItems:"center", gap:6, padding:"4px 12px", borderRadius:999, border:`1px solid ${border}`, background:bg, color:color, fontSize:12, fontWeight:500 }),
  dot:        (color) => ({ width:8, height:8, borderRadius:"50%", background:color }),
  btn:        (bg,hover) => ({ background:bg, color:"#fff", border:"none", borderRadius:12, padding:"10px 20px", fontSize:14, fontWeight:600, cursor:"pointer", width:"100%", marginTop:8 }),
  input:      { width:"100%", background:"#1f2937", color:"#f9fafb", fontSize:14, padding:"10px 16px", borderRadius:12, border:"1px solid #374151", outline:"none", marginBottom:12, boxSizing:"border-box" },
  alert:      { background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.2)", borderRadius:12, padding:16, marginBottom:16 },
  vital:      { background:"#1f2937", borderRadius:12, padding:12, textAlign:"center", flex:1 },
  toast:      { position:"fixed", bottom:24, left:"50%", transform:"translateX(-50%)", background:"#059669", color:"#fff", padding:"12px 24px", borderRadius:12, boxShadow:"0 8px 30px rgba(0,0,0,0.4)", display:"flex", alignItems:"center", gap:10, zIndex:1000, fontSize:14, fontWeight:500, whiteSpace:"nowrap" },
  overlay:    { position:"fixed", inset:0, background:"rgba(0,0,0,0.7)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:500, padding:16 },
  modal:      { background:"#111827", border:"1px solid #374151", borderRadius:20, padding:24, width:"100%", maxWidth:440 },
  tag:        { fontSize:11, padding:"2px 10px", borderRadius:999, background:"#1f2937", color:"#9ca3af" },
  miniStat:   { background:"rgba(15,23,42,0.6)", borderRadius:12, padding:12 },
  timelineDot:(s) => ({ width:32, height:32, borderRadius:"50%", background:"#1f2937", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, flexShrink:0 }),
};

export default function PostCareAI() {
  const [activeTab, setActiveTab]         = useState("dashboard");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showModal, setShowModal]         = useState(false);
  const [sentOk, setSentOk]               = useState(false);
  const [search, setSearch]               = useState("");
  const [filter, setFilter]               = useState("الكل");

  const stats = {
    total:   patients.length,
    stable:  patients.filter(p => p.status === "مستقر").length,
    warning: patients.filter(p => p.status === "تحذير").length,
    danger:  patients.filter(p => p.status === "خطر").length,
  };

  const filtered = patients.filter(p => {
    const ms = p.name.includes(search) || p.surgery.includes(search) || p.doctor.includes(search);
    const mf = filter === "الكل" || p.status === filter;
    return ms && mf;
  });

  const send = () => { setShowModal(false); setSentOk(true); setTimeout(() => setSentOk(false), 3000); };

  const openPatient = (p) => { setSelectedPatient(p); setActiveTab("patients"); };

  return (
    <div style={S.page}>

      {/* Header */}
      <div style={S.header}>
        <div style={S.row}>
          <div style={S.logoBox}>🏥</div>
          <div>
            <div style={{ fontWeight:700, fontSize:16 }}>رعاية ما بعد</div>
            <div style={{ fontSize:11, color:"#6b7280" }}>منصة متابعة ما بعد العملية الجراحية</div>
          </div>
        </div>
        <div style={{ ...S.row, gap:16 }}>
          <div style={{ ...S.row, gap:6, background:"#1f2937", borderRadius:10, padding:"6px 12px" }}>
            <div style={{ width:28, height:28, background:"#14b8a6", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:700 }}>م</div>
            <span style={{ fontSize:13, color:"#d1d5db" }}>مدير الجودة</span>
          </div>
          <div style={S.row}>
            <div style={{ width:8, height:8, borderRadius:"50%", background:"#10b981" }}></div>
            <span style={{ fontSize:11, color:"#6b7280" }}>مبادرة أمان — خيري</span>
          </div>
        </div>
      </div>

      {/* Nav */}
      <div style={S.nav}>
        {[["dashboard","📊 لوحة التحكم"],["patients","👥 المرضى"],["messages","💬 الرسائل"],["reports","📋 التقارير"]].map(([tab,label]) => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={S.navBtn(activeTab === tab)}>{label}</button>
        ))}
      </div>

      <div style={S.content}>

        {/* Stats */}
        <div style={S.grid4}>
          {[
            { label:"إجمالي المرضى",     value:stats.total,   icon:"👥", grad:"#1d4ed8,#1e40af", sub:"نشطون الآن" },
            { label:"مستقرون",           value:stats.stable,  icon:"✅", grad:"#059669,#047857", sub:"حالة جيدة" },
            { label:"يحتاجون متابعة",    value:stats.warning, icon:"⚠️", grad:"#d97706,#b45309", sub:"تنبيهات مفعّلة" },
            { label:"حالات طارئة",       value:stats.danger,  icon:"🚨", grad:"#dc2626,#b91c1c", sub:"تدخل فوري" },
          ].map((s,i) => (
            <div key={i} style={S.statCard(s.grad)}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
                <span style={{ fontSize:28 }}>{s.icon}</span>
                <span style={{ fontSize:36, fontWeight:700 }}>{s.value}</span>
              </div>
              <div style={{ fontWeight:600, fontSize:13 }}>{s.label}</div>
              <div style={{ fontSize:11, color:"rgba(255,255,255,0.6)", marginTop:4 }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Alert banner */}
        {patients.some(p => p.status === "خطر") && (
          <div style={{ ...S.alert, display:"flex", alignItems:"center", gap:12, marginBottom:24 }}>
            <span style={{ fontSize:24 }}>🚨</span>
            <div style={{ flex:1 }}>
              <div style={{ color:"#f87171", fontWeight:600, fontSize:14 }}>تنبيه عاجل — مريض يحتاج تدخلاً فورياً</div>
              <div style={{ color:"rgba(248,113,113,0.7)", fontSize:12 }}>خالد الدوسري - لم يستجب منذ 12 ساعة - مريض مزمن عالي الخطورة</div>
            </div>
            <button onClick={() => openPatient(patients[2])} style={{ ...S.btn("#dc2626"), width:"auto", margin:0, padding:"8px 16px", fontSize:13 }}>عرض الحالة</button>
          </div>
        )}

        {/* ── DASHBOARD ── */}
        {activeTab === "dashboard" && (
          <div style={S.grid23}>
            {/* Patient list */}
            <div style={S.card}>
              <div style={S.cardHead}>
                <span style={{ fontWeight:700 }}>المرضى اليوم</span>
                <span style={S.tag}>30 يوم متابعة</span>
              </div>
              {patients.map(p => {
                const sc = statusConfig[p.status];
                return (
                  <div key={p.id} onClick={() => openPatient(p)}
                    style={{ padding:"14px 20px", borderBottom:"1px solid #1f2937", cursor:"pointer", display:"flex", alignItems:"center", gap:12, transition:"background 0.15s" }}
                    onMouseEnter={e => e.currentTarget.style.background="#1f2937"}
                    onMouseLeave={e => e.currentTarget.style.background="transparent"}>
                    <div style={S.avatar}>{p.name[0]}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                        <span style={{ fontWeight:600, fontSize:14 }}>{p.name}</span>
                        <span style={{ fontSize:11, padding:"2px 8px", borderRadius:999, color:riskColors[p.risk].color, background:riskColors[p.risk].bg }}>{p.risk}</span>
                      </div>
                      <div style={{ color:"#6b7280", fontSize:12 }}>{p.surgery} • اليوم {p.day} • {p.doctor}</div>
                    </div>
                    <div style={{ textAlign:"left" }}>
                      <div style={S.badge(sc.bg, sc.text, sc.border)}>
                        <div style={S.dot(sc.dot)}></div>{p.status}
                      </div>
                      <div style={{ fontSize:11, color:"#4b5563", marginTop:4 }}>{p.lastResponse}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Sidebar */}
            <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

              {/* Quick actions */}
              <div style={S.card}>
                <div style={S.cardHead}><span style={{ fontWeight:700, fontSize:14 }}>إجراءات سريعة</span></div>
                <div style={{ padding:16, display:"flex", flexDirection:"column", gap:8 }}>
                  {[
                    { label:"📤 إرسال متابعة جماعية", bg:"#0d9488", action:() => setShowModal(true) },
                    { label:"📊 تقرير اليوم",          bg:"#7c3aed", action:() => setActiveTab("reports") },
                    { label:"💬 نماذج الرسائل",        bg:"#1d4ed8", action:() => setActiveTab("messages") },
                  ].map((a,i) => (
                    <button key={i} onClick={a.action}
                      style={{ ...S.btn(a.bg), margin:0, display:"flex", alignItems:"center", justifyContent:"center", gap:8, padding:"10px 16px" }}
                      onMouseEnter={e => e.currentTarget.style.opacity="0.85"}
                      onMouseLeave={e => e.currentTarget.style.opacity="1"}>
                      {a.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Activity */}
              <div style={S.card}>
                <div style={S.cardHead}><span style={{ fontWeight:700, fontSize:14 }}>نشاط اليوم</span></div>
                <div style={{ padding:16, display:"flex", flexDirection:"column", gap:12 }}>
                  {[
                    { time:"08:00", event:"إرسال أسئلة اليوم 3 — محمد العتيبي", type:"send" },
                    { time:"08:45", event:"رد المريض — فاطمة الزهراني ✅", type:"ok" },
                    { time:"09:20", event:"تنبيه: حرارة مرتفعة — محمد العتيبي", type:"warn" },
                    { time:"الآن", event:"خالد الدوسري لم يستجب 🔴", type:"danger" },
                  ].map((e,i) => (
                    <div key={i} style={{ display:"flex", gap:10, alignItems:"flex-start" }}>
                      <span style={{ color:"#4b5563", fontSize:11, width:40, flexShrink:0, marginTop:2 }}>{e.time}</span>
                      <div style={{ width:8, height:8, borderRadius:"50%", marginTop:4, flexShrink:0, background: e.type==="danger"?"#ef4444":e.type==="warn"?"#f59e0b":e.type==="ok"?"#10b981":"#3b82f6" }}></div>
                      <span style={{ color:"#d1d5db", fontSize:12, lineHeight:1.5 }}>{e.event}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Month stats */}
              <div style={{ background:"rgba(13,148,136,0.1)", border:"1px solid rgba(20,184,166,0.2)", borderRadius:16, padding:16 }}>
                <div style={{ color:"#2dd4bf", fontWeight:700, fontSize:13, marginBottom:12 }}>📈 هذا الشهر</div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                  {[
                    { label:"تم تجنبها", value:"3",    sub:"إعادة تنويم" },
                    { label:"معدل الرد", value:"87%",  sub:"من المرضى" },
                    { label:"وقت الرد",  value:"45د",  sub:"متوسط" },
                    { label:"رضا المرضى",value:"4.8★", sub:"تقييم" },
                  ].map((s,i) => (
                    <div key={i} style={S.miniStat}>
                      <div style={{ color:"#2dd4bf", fontWeight:700, fontSize:18 }}>{s.value}</div>
                      <div style={{ color:"#f9fafb", fontSize:11, fontWeight:600 }}>{s.label}</div>
                      <div style={{ color:"#4b5563", fontSize:10 }}>{s.sub}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── PATIENTS ── */}
        {activeTab === "patients" && (
          <div style={S.grid32}>
            {/* List */}
            <div style={S.card}>
              <div style={{ padding:16, borderBottom:"1px solid #1f2937" }}>
                <input style={S.input} placeholder="🔍 بحث عن مريض..." value={search} onChange={e => setSearch(e.target.value)} />
                <div style={{ display:"flex", gap:8 }}>
                  {["الكل","خطر","تحذير","مستقر"].map(f => (
                    <button key={f} onClick={() => setFilter(f)}
                      style={{ fontSize:11, padding:"4px 12px", borderRadius:999, border:"none", cursor:"pointer", background: filter===f?"#0d9488":"#1f2937", color: filter===f?"#fff":"#9ca3af", transition:"all 0.2s" }}>
                      {f}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ overflowY:"auto", maxHeight:500 }}>
                {filtered.map(p => {
                  const sc = statusConfig[p.status];
                  const selected = selectedPatient?.id === p.id;
                  return (
                    <div key={p.id} onClick={() => setSelectedPatient(p)}
                      style={{ padding:14, borderBottom:"1px solid #1f2937", cursor:"pointer", background: selected?"rgba(13,148,136,0.1)":"transparent", borderRight: selected?"3px solid #14b8a6":"3px solid transparent", display:"flex", alignItems:"center", gap:12 }}
                      onMouseEnter={e => { if(!selected) e.currentTarget.style.background="#1f2937"; }}
                      onMouseLeave={e => { if(!selected) e.currentTarget.style.background="transparent"; }}>
                      <div style={{ ...S.avatar, width:36, height:36, fontSize:14 }}>{p.name[0]}</div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontWeight:600, fontSize:13 }}>{p.name}</div>
                        <div style={{ color:"#6b7280", fontSize:11 }}>{p.surgery}</div>
                      </div>
                      <div style={{ width:8, height:8, borderRadius:"50%", background:sc.dot }}></div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Detail */}
            <div>
              {selectedPatient ? (
                <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
                  {/* Header */}
                  <div style={S.card}>
                    <div style={{ padding:20 }}>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:16 }}>
                        <div style={S.row}>
                          <div style={{ ...S.avatar, width:52, height:52, fontSize:22, borderRadius:16 }}>{selectedPatient.name[0]}</div>
                          <div>
                            <div style={{ fontWeight:700, fontSize:18 }}>{selectedPatient.name}</div>
                            <div style={{ color:"#9ca3af", fontSize:13 }}>{selectedPatient.age} سنة • {selectedPatient.surgery}</div>
                            <div style={{ color:"#6b7280", fontSize:11 }}>{selectedPatient.doctor} — {selectedPatient.dept}</div>
                          </div>
                        </div>
                        <div style={{ textAlign:"left" }}>
                          <div style={S.badge(statusConfig[selectedPatient.status].bg, statusConfig[selectedPatient.status].text, statusConfig[selectedPatient.status].border)}>
                            <div style={S.dot(statusConfig[selectedPatient.status].dot)}></div>
                            {selectedPatient.status}
                          </div>
                          <div style={{ marginTop:6, fontSize:11, padding:"2px 10px", borderRadius:999, color:riskColors[selectedPatient.risk].color, background:riskColors[selectedPatient.risk].bg, display:"inline-block" }}>
                            خطورة {selectedPatient.risk}
                          </div>
                        </div>
                      </div>
                      {/* Vitals */}
                      <div style={{ display:"flex", gap:10 }}>
                        {[
                          { label:"الألم",   value:`${selectedPatient.vitals.pain}/10`, icon:"😣",  color: selectedPatient.vitals.pain>6?"#ef4444":"#f59e0b" },
                          { label:"الحرارة", value:`${selectedPatient.vitals.fever}°م`, icon:"🌡️", color: selectedPatient.vitals.fever>38?"#ef4444":"#10b981" },
                          { label:"الجرح",   value:selectedPatient.vitals.wound,        icon:"🩹",  color:"#3b82f6" },
                          { label:"الحركة",  value:selectedPatient.vitals.mobility,     icon:"🚶",  color:"#8b5cf6" },
                        ].map((v,i) => (
                          <div key={i} style={S.vital}>
                            <div style={{ fontSize:20 }}>{v.icon}</div>
                            <div style={{ fontWeight:700, fontSize:13, color:v.color, margin:"4px 0" }}>{v.value}</div>
                            <div style={{ color:"#4b5563", fontSize:11 }}>{v.label}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Alerts */}
                  {selectedPatient.alerts.length > 0 && (
                    <div style={S.alert}>
                      <div style={{ color:"#f87171", fontWeight:600, fontSize:13, marginBottom:8 }}>🚨 تنبيهات نشطة</div>
                      {selectedPatient.alerts.map((a,i) => (
                        <div key={i} style={{ display:"flex", alignItems:"center", gap:8, color:"#fca5a5", fontSize:13 }}>
                          <div style={{ width:6, height:6, borderRadius:"50%", background:"#ef4444" }}></div>{a}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Timeline + Questions */}
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
                    <div style={S.card}>
                      <div style={S.cardHead}><span style={{ fontWeight:700, fontSize:13 }}>📅 مسار المتابعة</span></div>
                      <div style={{ padding:16, display:"flex", flexDirection:"column", gap:12 }}>
                        {selectedPatient.timeline.map((t,i) => (
                          <div key={i} style={{ display:"flex", gap:12, alignItems:"flex-start" }}>
                            <div style={{ display:"flex", flexDirection:"column", alignItems:"center" }}>
                              <div style={S.timelineDot(t.status)}>{t.status}</div>
                              {i < selectedPatient.timeline.length-1 && <div style={{ width:2, height:24, background:"#1f2937", margin:"4px 0" }}></div>}
                            </div>
                            <div style={{ paddingTop:4 }}>
                              <div style={{ color:"#6b7280", fontSize:11, fontWeight:600 }}>اليوم {t.day}</div>
                              <div style={{ color:"#f9fafb", fontSize:12 }}>{t.note}</div>
                            </div>
                          </div>
                        ))}
                        <div style={{ display:"flex", gap:12, alignItems:"flex-start", opacity:0.4 }}>
                          <div style={{ width:32, height:32, borderRadius:"50%", border:"2px dashed #374151", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>⏳</div>
                          <div style={{ paddingTop:8, color:"#4b5563", fontSize:11 }}>اليوم 30 — إنهاء المتابعة</div>
                        </div>
                      </div>
                    </div>

                    <div style={S.card}>
                      <div style={S.cardHead}><span style={{ fontWeight:700, fontSize:13 }}>❓ أسئلة اليوم {selectedPatient.day}</span></div>
                      <div style={{ padding:16, display:"flex", flexDirection:"column", gap:8 }}>
                        {(questions[selectedPatient.day] || questions[1]).map((q,i) => (
                          <div key={i} style={{ background:"#1f2937", borderRadius:10, padding:10, fontSize:12, color:"#d1d5db", display:"flex", gap:8 }}>
                            <span style={{ color:"#14b8a6", fontWeight:700, flexShrink:0 }}>{i+1}.</span>{q}
                          </div>
                        ))}
                        <button onClick={() => setShowModal(true)} style={{ ...S.btn("#0d9488"), margin:0, marginTop:8 }}>📤 إرسال عبر واتساب</button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ ...S.card, display:"flex", alignItems:"center", justifyContent:"center", height:300 }}>
                  <div style={{ textAlign:"center" }}>
                    <div style={{ fontSize:40, marginBottom:12 }}>👆</div>
                    <div style={{ color:"#6b7280" }}>اختر مريضاً لعرض تفاصيله</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── MESSAGES ── */}
        {activeTab === "messages" && (
          <div style={S.card}>
            <div style={S.cardHead}><span style={{ fontWeight:700, fontSize:16 }}>💬 نماذج رسائل المتابعة</span></div>
            <div style={{ padding:20, display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16 }}>
              {[
                { title:"اليوم الأول", tag:"يوم 1", borderColor:"rgba(59,130,246,0.3)", msg:`السلام عليكم [اسم المريض] 🌟\n\nنتمنى لك الشفاء العاجل بعد عملية [نوع العملية].\n\nللتأكد من سلامتك، نرجو الإجابة:\n\n1️⃣ هل تشعر بألم شديد؟ (1-10)\n2️⃣ هل درجة حرارتك طبيعية؟\n3️⃣ هل تستطيع التنفس بشكل جيد؟\n\n⚠️ في حال الطوارئ اتصل فوراً بـ 911\n\n— فريق مبادرة أمان` },
                { title:"اليوم الثالث", tag:"يوم 3", borderColor:"rgba(13,148,136,0.3)", msg:`مرحباً [اسم المريض] 👋\n\nاليوم الثالث بعد العملية — كيف حالك؟\n\n1️⃣ هل لاحظت تورماً أو احمراراً في الجرح؟\n2️⃣ هل تتناول الأدوية كما وصف الطبيب؟\n3️⃣ هل يتحسن الألم مقارنة بالأمس؟\n\nفريقنا يتابعك باستمرار ❤️\n\n— فريق مبادرة أمان` },
                { title:"التنبيه العاجل", tag:"طارئ 🔴", borderColor:"rgba(239,68,68,0.3)", msg:`عزيزي [اسم المريض] 🚨\n\nلاحظنا عدم ردك منذ فترة.\n\nنرجو الرد فوراً أو الاتصال بنا:\n\n📞 الطوارئ: 920000000\n\nأو أخبر أحد أفراد عائلتك للتواصل معنا.\n\nصحتك أولويتنا 💙\n\n— فريق مبادرة أمان` },
              ].map((m,i) => (
                <div key={i} style={{ border:`1px solid ${m.borderColor}`, borderRadius:16, padding:16, background:"rgba(255,255,255,0.02)" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
                    <span style={S.tag}>{m.tag}</span>
                    <span style={{ fontWeight:600, fontSize:14 }}>{m.title}</span>
                  </div>
                  <div style={{ background:"#1f2937", borderRadius:12, padding:14, fontSize:11, color:"#d1d5db", lineHeight:1.8, whiteSpace:"pre-line", direction:"rtl", minHeight:200 }}>{m.msg}</div>
                  <button style={{ ...S.btn("#374151"), margin:0, marginTop:10, fontSize:12 }}>📋 نسخ الرسالة</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── REPORTS ── */}
        {activeTab === "reports" && (
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            <div style={S.card}>
              <div style={{ ...S.cardHead, padding:20 }}>
                <span style={{ fontWeight:700, fontSize:16 }}>📋 تقرير مبادرة أمان — مارس 2026</span>
                <button style={{ ...S.btn("#0d9488"), width:"auto", margin:0, padding:"8px 16px", fontSize:13 }}>⬇️ تصدير PDF</button>
              </div>
              <div style={{ padding:20 }}>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:20 }}>
                  {[
                    { label:"مرضى تم متابعتهم",    value:"47",          icon:"👥", trend:"+12%" },
                    { label:"إعادة تنويم مُجنَّبة", value:"8",           icon:"🏥", trend:"-23%" },
                    { label:"تنبيهات مبكرة",        value:"15",          icon:"⚠️", trend:"مبكراً" },
                    { label:"توفير تقديري",         value:"120,000 ريال",icon:"💰", trend:"للمنشأة" },
                  ].map((s,i) => (
                    <div key={i} style={{ background:"#1f2937", borderRadius:14, padding:16 }}>
                      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                        <span style={{ fontSize:24 }}>{s.icon}</span>
                        <span style={{ fontSize:11, color:"#14b8a6", background:"rgba(20,184,166,0.1)", padding:"2px 8px", borderRadius:999 }}>{s.trend}</span>
                      </div>
                      <div style={{ fontWeight:700, fontSize:22 }}>{s.value}</div>
                      <div style={{ color:"#6b7280", fontSize:12, marginTop:4 }}>{s.label}</div>
                    </div>
                  ))}
                </div>
                <div style={{ background:"rgba(13,148,136,0.1)", border:"1px solid rgba(20,184,166,0.2)", borderRadius:14, padding:16 }}>
                  <div style={{ color:"#2dd4bf", fontWeight:600, fontSize:14, marginBottom:8 }}>🎯 الأثر المباشر للمبادرة</div>
                  <p style={{ color:"#d1d5db", fontSize:13, lineHeight:1.8, margin:0 }}>
                    خلال شهر واحد، استطاعت مبادرة أمان تجنب 8 حالات إعادة تنويم مكلفة، وكشف 15 حالة مضاعفات في مراحل مبكرة قابلة للعلاج بدون دخول المستشفى. الوفر التقديري للمنشأة الشريكة يتجاوز 120,000 ريال شهرياً.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Modal */}
      {showModal && (
        <div style={S.overlay}>
          <div style={S.modal}>
            <div style={{ fontWeight:700, fontSize:16, marginBottom:16 }}>📤 إرسال رسالة متابعة</div>
            <div style={{ background:"#1f2937", borderRadius:12, padding:14, marginBottom:14 }}>
              <div style={{ color:"#6b7280", fontSize:12, marginBottom:8 }}>المرضى المستهدفون:</div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                {patients.map(p => (
                  <span key={p.id} style={{ fontSize:12, padding:"4px 10px", borderRadius:999, color:"#2dd4bf", background:"rgba(20,184,166,0.1)", border:"1px solid rgba(20,184,166,0.3)" }}>{p.name}</span>
                ))}
              </div>
            </div>
            <div style={{ background:"#1f2937", borderRadius:12, padding:14, marginBottom:16, fontSize:12, color:"#d1d5db", lineHeight:1.7 }}>
              <div style={{ color:"#6b7280", marginBottom:6 }}>نموذج الرسالة:</div>
              السلام عليكم [اسم المريض] 🌟<br />
              نتمنى لك الشفاء. للمتابعة نرجو الإجابة على أسئلتنا اليومية...<br /><br />
              — فريق مبادرة أمان
            </div>
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={send}          style={{ ...S.btn("#0d9488"), flex:1, margin:0, padding:14 }}>✅ إرسال الآن</button>
              <button onClick={() => setShowModal(false)} style={{ ...S.btn("#374151"), flex:1, margin:0, padding:14 }}>إلغاء</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {sentOk && (
        <div style={S.toast}>
          <span>✅</span>
          <span>تم إرسال رسائل المتابعة بنجاح لـ 4 مرضى</span>
        </div>
      )}

    </div>
  );
}
