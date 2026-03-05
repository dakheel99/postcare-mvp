import { useState, useEffect } from "react";

const DEMO_PATIENTS = [
  {
    id: 1, name: "محمد العتيبي", age: 52, surgery: "استئصال المرارة",
    day: 3, phone: "0501234567", risk: "متوسط",
    doctor: "د. سعد الغامدي", dept: "الجراحة العامة",
    alerts: ["حرارة 38.2°م", "ألم متزايد في موضع الجرح"],
    status: "تحذير", lastResponse: "منذ 4 ساعات",
    vitals: { pain: 6, fever: 38.2, wound: "تورم خفيف", mobility: "محدودة" },
    timeline: [{ day:1,status:"✅",note:"حالة جيدة، ألم طبيعي" },{ day:2,status:"✅",note:"تحسن ملحوظ" },{ day:3,status:"⚠️",note:"ارتفاع حرارة وألم" }]
  },
  {
    id: 2, name: "فاطمة الزهراني", age: 38, surgery: "استئصال الزائدة",
    day: 7, phone: "0557654321", risk: "منخفض",
    doctor: "د. نورة السبيعي", dept: "الجراحة العامة",
    alerts: [], status: "مستقر", lastResponse: "منذ ساعة",
    vitals: { pain: 2, fever: 36.8, wound: "التئام جيد", mobility: "طبيعية" },
    timeline: [{ day:1,status:"✅",note:"بعد العملية بخير" },{ day:3,status:"✅",note:"تعافٍ ممتاز" },{ day:7,status:"✅",note:"شبه طبيعي" }]
  },
  {
    id: 3, name: "خالد الدوسري", age: 65, surgery: "استبدال الركبة",
    day: 5, phone: "0509876543", risk: "مرتفع",
    doctor: "د. عبدالله المطيري", dept: "العظام",
    alerts: ["لم يستجب منذ 12 ساعة", "مريض مزمن - سكري"],
    status: "خطر", lastResponse: "منذ 12 ساعة",
    vitals: { pain: 8, fever: 38.9, wound: "غير معروف", mobility: "غير معروفة" },
    timeline: [{ day:1,status:"✅",note:"استيقاظ من التخدير جيد" },{ day:3,status:"⚠️",note:"ألم شديد" },{ day:5,status:"🔴",note:"لا يوجد رد" }]
  },
];

const SURGERIES = ["استئصال المرارة","استئصال الزائدة","استبدال الركبة","استبدال الورك","عملية القلب المفتوح","استئصال كيس مبيضي","عملية العمود الفقري","استئصال ورم","عملية المعدة","عملية الغدة الدرقية","أخرى"];
const DEPTS     = ["الجراحة العامة","العظام","أمراض النساء","جراحة القلب","المسالك البولية","الجراحة العصبية","أخرى"];

const SC = {
  "مستقر":{ bg:"rgba(16,185,129,.15)",  text:"#10b981", border:"rgba(16,185,129,.3)",  dot:"#10b981" },
  "تحذير":{ bg:"rgba(245,158,11,.15)",  text:"#f59e0b", border:"rgba(245,158,11,.3)",  dot:"#f59e0b" },
  "خطر":  { bg:"rgba(239,68,68,.15)",   text:"#ef4444", border:"rgba(239,68,68,.3)",   dot:"#ef4444" },
  "جديد": { bg:"rgba(59,130,246,.15)",  text:"#3b82f6", border:"rgba(59,130,246,.3)",  dot:"#3b82f6" },
};
const RC = {
  "منخفض":{ color:"#10b981", bg:"rgba(16,185,129,.1)" },
  "متوسط":{ color:"#f59e0b", bg:"rgba(245,158,11,.1)" },
  "مرتفع":{ color:"#ef4444", bg:"rgba(239,68,68,.1)"  },
};

/* ─── tiny style helpers ─── */
const card    = { background:"#111827", borderRadius:16, border:"1px solid #1f2937", overflow:"hidden" };
const cardH   = { padding:"16px 20px", borderBottom:"1px solid #1f2937", display:"flex", justifyContent:"space-between", alignItems:"center" };
const overlay = { position:"fixed", inset:0, background:"rgba(0,0,0,.75)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:500, padding:16 };
const modal   = { background:"#111827", border:"1px solid #374151", borderRadius:20, padding:24, width:"100%", maxWidth:520, maxHeight:"90vh", overflowY:"auto" };
const inp     = { width:"100%", background:"#1f2937", color:"#f9fafb", fontSize:14, padding:"10px 14px", borderRadius:10, border:"1px solid #374151", outline:"none", boxSizing:"border-box" };
const sel     = { ...inp };
const lbl     = { fontSize:12, color:"#9ca3af", marginBottom:6, display:"block", fontWeight:500 };
const btn     = (bg) => ({ background:bg, color:"#fff", border:"none", borderRadius:12, padding:"10px 20px", fontSize:14, fontWeight:600, cursor:"pointer" });
const badge   = (bg,c,b) => ({ display:"inline-flex", alignItems:"center", gap:6, padding:"4px 12px", borderRadius:999, border:`1px solid ${b}`, background:bg, color:c, fontSize:12, fontWeight:500 });
const avatar  = { width:40, height:40, borderRadius:12, background:"linear-gradient(135deg,#14b8a6,#0891b2)", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:"bold", fontSize:16, flexShrink:0 };

const EMPTY = { name:"", age:"", phone:"", surgery:"", dept:"", doctor:"", risk:"منخفض", notes:"" };

export default function App() {
  const [patients, setPatients] = useState(() => {
    try { const s = localStorage.getItem("pc_patients"); return s ? JSON.parse(s) : DEMO_PATIENTS; }
    catch { return DEMO_PATIENTS; }
  });
  const [tab, setTab]           = useState("dashboard");
  const [sel2, setSel2]         = useState(null);
  const [showAdd, setShowAdd]   = useState(false);
  const [showDel, setShowDel]   = useState(false);
  const [showSend, setShowSend] = useState(false);
  const [toast, setToast]       = useState("");
  const [search, setSearch]     = useState("");
  const [filt, setFilt]         = useState("الكل");
  const [form, setForm]         = useState(EMPTY);
  const [err, setErr]           = useState("");

  useEffect(() => { try { localStorage.setItem("pc_patients", JSON.stringify(patients)); } catch {} }, [patients]);

  const showToast = (m) => { setToast(m); setTimeout(() => setToast(""), 3000); };
  const fc = (k,v) => setForm(f => ({ ...f, [k]:v }));

  const stats = {
    total:   patients.length,
    stable:  patients.filter(p=>p.status==="مستقر").length,
    warning: patients.filter(p=>p.status==="تحذير").length,
    danger:  patients.filter(p=>p.status==="خطر").length,
  };

  const filtered = patients.filter(p => {
    const ms = p.name.includes(search)||p.surgery.includes(search)||p.doctor.includes(search);
    const mf = filt==="الكل"||p.status===filt;
    return ms && mf;
  });

  const addPatient = () => {
    if (!form.name.trim())                          return setErr("اسم المريض مطلوب");
    if (!form.age||isNaN(form.age)||+form.age<1)    return setErr("العمر غير صحيح");
    if (!form.phone.trim())                         return setErr("رقم الجوال مطلوب");
    if (!form.surgery)                              return setErr("نوع العملية مطلوب");
    if (!form.dept)                                 return setErr("القسم مطلوب");
    if (!form.doctor.trim())                        return setErr("اسم الطبيب مطلوب");
    const p = {
      id: Date.now(), name:form.name.trim(), age:+form.age, phone:form.phone.trim(),
      surgery:form.surgery, dept:form.dept, doctor:form.doctor.trim(), risk:form.risk,
      day:1, alerts:[], status:"جديد", lastResponse:"الآن",
      vitals:{ pain:0, fever:37.0, wound:"لم يُقيَّم بعد", mobility:"لم تُقيَّم بعد" },
      timeline:[{ day:1, status:"🆕", note:form.notes.trim()||"تم إدخال المريض — بدء المتابعة" }],
    };
    setPatients(prev => [p, ...prev]);
    setForm(EMPTY); setErr(""); setShowAdd(false);
    showToast(`✅ تم إضافة ${p.name} بنجاح`);
    setSel2(p); setTab("patients");
  };

  const deletePatient = () => {
    setPatients(prev => prev.filter(p=>p.id!==sel2.id));
    setSel2(null); setShowDel(false);
    showToast("🗑️ تم حذف المريض");
  };

  const updateStatus = (s) => {
    setPatients(prev => prev.map(p=>p.id===sel2.id?{...p,status:s}:p));
    setSel2(prev => ({ ...prev, status:s }));
    showToast(`تم تحديث الحالة إلى: ${s}`);
  };

  /* ──────────────────────────────────────────────── */
  return (
    <div style={{ minHeight:"100vh", background:"#030712", color:"#f9fafb", fontFamily:"'Segoe UI',Tahoma,Arial,sans-serif", direction:"rtl" }}>

      {/* ── HEADER ── */}
      <div style={{ background:"#111827", borderBottom:"1px solid #1f2937", padding:"14px 24px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ width:40, height:40, borderRadius:12, background:"linear-gradient(135deg,#14b8a6,#0891b2)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>🏥</div>
          <div>
            <div style={{ fontWeight:700, fontSize:16 }}>رعاية ما بعد</div>
            <div style={{ fontSize:11, color:"#6b7280" }}>منصة متابعة ما بعد العملية الجراحية</div>
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <button onClick={()=>setShowAdd(true)} style={{ ...btn("linear-gradient(135deg,#0d9488,#0891b2)"), padding:"8px 18px", fontSize:13 }}>
            ➕ إضافة مريض
          </button>
          <div style={{ display:"flex", alignItems:"center", gap:6, background:"#1f2937", borderRadius:10, padding:"6px 12px" }}>
            <div style={{ width:8, height:8, borderRadius:"50%", background:"#10b981" }}></div>
            <span style={{ fontSize:11, color:"#6b7280" }}>مبادرة أمان — خيري</span>
          </div>
        </div>
      </div>

      {/* ── NAV ── */}
      <div style={{ background:"#111827", borderBottom:"1px solid #1f2937", padding:"0 24px", display:"flex", gap:4 }}>
        {[["dashboard","📊 لوحة التحكم"],["patients","👥 المرضى"],["messages","💬 الرسائل"],["reports","📋 التقارير"]].map(([t,l])=>(
          <button key={t} onClick={()=>setTab(t)} style={{ padding:"12px 20px", fontSize:14, fontWeight:500, border:"none", borderBottom:tab===t?"2px solid #14b8a6":"2px solid transparent", color:tab===t?"#14b8a6":"#9ca3af", background:"transparent", cursor:"pointer" }}>{l}</button>
        ))}
      </div>

      <div style={{ padding:24, maxWidth:1200, margin:"0 auto" }}>

        {/* ── STATS ── */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:24 }}>
          {[
            { label:"إجمالي المرضى",  v:stats.total,   icon:"👥", g:"#1d4ed8,#1e40af", sub:"نشطون الآن" },
            { label:"مستقرون",        v:stats.stable,  icon:"✅", g:"#059669,#047857", sub:"حالة جيدة" },
            { label:"يحتاجون متابعة", v:stats.warning, icon:"⚠️", g:"#d97706,#b45309", sub:"تنبيهات" },
            { label:"حالات طارئة",    v:stats.danger,  icon:"🚨", g:"#dc2626,#b91c1c", sub:"تدخل فوري" },
          ].map((s,i)=>(
            <div key={i} style={{ background:`linear-gradient(135deg,${s.g})`, borderRadius:16, padding:20 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:10 }}>
                <span style={{ fontSize:26 }}>{s.icon}</span>
                <span style={{ fontSize:34, fontWeight:700 }}>{s.v}</span>
              </div>
              <div style={{ fontWeight:600, fontSize:13 }}>{s.label}</div>
              <div style={{ fontSize:11, color:"rgba(255,255,255,.55)", marginTop:4 }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* ── DANGER BANNER ── */}
        {stats.danger > 0 && (
          <div style={{ background:"rgba(239,68,68,.1)", border:"1px solid rgba(239,68,68,.2)", borderRadius:12, padding:16, marginBottom:24, display:"flex", alignItems:"center", gap:12 }}>
            <span style={{ fontSize:22 }}>🚨</span>
            <div style={{ flex:1 }}>
              <div style={{ color:"#f87171", fontWeight:600, fontSize:13 }}>تنبيه عاجل — مريض يحتاج تدخلاً فورياً</div>
              <div style={{ color:"rgba(248,113,113,.65)", fontSize:12, marginTop:2 }}>
                {patients.filter(p=>p.status==="خطر").map(p=>p.name).join(" | ")}
              </div>
            </div>
            <button onClick={()=>{ setFilt("خطر"); setTab("patients"); }} style={{ ...btn("#dc2626"), padding:"8px 16px", fontSize:13 }}>عرض الحالات</button>
          </div>
        )}

        {/* ════════════════ DASHBOARD ════════════════ */}
        {tab==="dashboard" && (
          <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:24 }}>
            <div style={card}>
              <div style={cardH}>
                <span style={{ fontWeight:700 }}>المرضى النشطون ({patients.length})</span>
                <button onClick={()=>setShowAdd(true)} style={{ ...btn("#0d9488"), padding:"6px 14px", fontSize:12 }}>➕ إضافة</button>
              </div>
              {patients.length===0 ? (
                <div style={{ padding:48, textAlign:"center", color:"#4b5563" }}>
                  <div style={{ fontSize:44, marginBottom:12 }}>🏥</div>
                  <div style={{ fontSize:14, marginBottom:16 }}>لا يوجد مرضى بعد</div>
                  <button onClick={()=>setShowAdd(true)} style={{ ...btn("#0d9488"), padding:"10px 28px" }}>➕ أضف أول مريض</button>
                </div>
              ) : patients.map(p=>{
                const sc=SC[p.status];
                return (
                  <div key={p.id} onClick={()=>{ setSel2(p); setTab("patients"); }}
                    style={{ padding:"14px 20px", borderBottom:"1px solid #1f2937", cursor:"pointer", display:"flex", alignItems:"center", gap:12 }}
                    onMouseEnter={e=>e.currentTarget.style.background="#1f2937"}
                    onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                    <div style={avatar}>{p.name[0]}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:3 }}>
                        <span style={{ fontWeight:600, fontSize:14 }}>{p.name}</span>
                        <span style={{ fontSize:11, padding:"2px 8px", borderRadius:999, color:RC[p.risk].color, background:RC[p.risk].bg }}>{p.risk}</span>
                      </div>
                      <div style={{ color:"#6b7280", fontSize:12 }}>{p.surgery} • اليوم {p.day} • {p.doctor}</div>
                    </div>
                    <div style={{ textAlign:"left" }}>
                      <div style={badge(sc.bg,sc.text,sc.border)}><div style={{ width:8,height:8,borderRadius:"50%",background:sc.dot }}></div>{p.status}</div>
                      <div style={{ fontSize:11, color:"#4b5563", marginTop:4 }}>{p.lastResponse}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
              <div style={card}>
                <div style={cardH}><span style={{ fontWeight:700, fontSize:14 }}>إجراءات سريعة</span></div>
                <div style={{ padding:16, display:"flex", flexDirection:"column", gap:8 }}>
                  {[
                    { l:"➕ إضافة مريض جديد",    bg:"linear-gradient(135deg,#0d9488,#0891b2)", a:()=>setShowAdd(true) },
                    { l:"📤 إرسال متابعة جماعية", bg:"#7c3aed", a:()=>setShowSend(true) },
                    { l:"📋 تقرير الشهر",          bg:"#1d4ed8", a:()=>setTab("reports") },
                  ].map((a,i)=>(
                    <button key={i} onClick={a.a} style={{ ...btn(a.bg), background:a.bg, width:"100%", padding:11 }}
                      onMouseEnter={e=>e.currentTarget.style.opacity=".85"}
                      onMouseLeave={e=>e.currentTarget.style.opacity="1"}>{a.l}</button>
                  ))}
                </div>
              </div>
              <div style={{ background:"rgba(13,148,136,.08)", border:"1px solid rgba(20,184,166,.2)", borderRadius:16, padding:16 }}>
                <div style={{ color:"#2dd4bf", fontWeight:700, fontSize:13, marginBottom:12 }}>📈 إحصائيات</div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                  {[
                    { l:"إجمالي المرضى", v:patients.length, s:"نشطون" },
                    { l:"نسبة الاستقرار", v:`${patients.length?Math.round((stats.stable/patients.length)*100):0}%`, s:"مستقرون" },
                    { l:"حالات خطرة",    v:stats.danger, s:"تحتاج تدخل" },
                    { l:"توفير تقديري",  v:`${(patients.length*15).toLocaleString()}ك`, s:"ريال / شهر" },
                  ].map((s,i)=>(
                    <div key={i} style={{ background:"rgba(15,23,42,.5)", borderRadius:12, padding:12 }}>
                      <div style={{ color:"#2dd4bf", fontWeight:700, fontSize:18 }}>{s.v}</div>
                      <div style={{ color:"#f9fafb", fontSize:11, fontWeight:600 }}>{s.l}</div>
                      <div style={{ color:"#4b5563", fontSize:10 }}>{s.s}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ════════════════ PATIENTS ════════════════ */}
        {tab==="patients" && (
          <div style={{ display:"grid", gridTemplateColumns:"280px 1fr", gap:24 }}>
            {/* list */}
            <div style={card}>
              <div style={{ padding:14, borderBottom:"1px solid #1f2937" }}>
                <input style={{ ...inp, marginBottom:10 }} placeholder="🔍 بحث..." value={search} onChange={e=>setSearch(e.target.value)} />
                <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                  {["الكل","خطر","تحذير","مستقر","جديد"].map(f=>(
                    <button key={f} onClick={()=>setFilt(f)} style={{ fontSize:11, padding:"3px 10px", borderRadius:999, border:"none", cursor:"pointer", background:filt===f?"#0d9488":"#1f2937", color:filt===f?"#fff":"#9ca3af" }}>{f}</button>
                  ))}
                </div>
              </div>
              <div style={{ overflowY:"auto", maxHeight:500 }}>
                {filtered.length===0 ? (
                  <div style={{ padding:30, textAlign:"center", color:"#4b5563", fontSize:13 }}>لا توجد نتائج</div>
                ) : filtered.map(p=>{
                  const sc=SC[p.status], isSel=sel2?.id===p.id;
                  return (
                    <div key={p.id} onClick={()=>setSel2(p)}
                      style={{ padding:"12px 14px", borderBottom:"1px solid #1f2937", cursor:"pointer", background:isSel?"rgba(13,148,136,.1)":"transparent", borderRight:isSel?"3px solid #14b8a6":"3px solid transparent", display:"flex", alignItems:"center", gap:10 }}
                      onMouseEnter={e=>{ if(!isSel) e.currentTarget.style.background="#1f2937"; }}
                      onMouseLeave={e=>{ e.currentTarget.style.background=isSel?"rgba(13,148,136,.1)":"transparent"; }}>
                      <div style={{ ...avatar, width:34, height:34, fontSize:13 }}>{p.name[0]}</div>
                      <div style={{ flex:1, overflow:"hidden" }}>
                        <div style={{ fontWeight:600, fontSize:13, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{p.name}</div>
                        <div style={{ color:"#6b7280", fontSize:11 }}>{p.surgery}</div>
                      </div>
                      <div style={{ width:8, height:8, borderRadius:"50%", background:sc.dot, flexShrink:0 }}></div>
                    </div>
                  );
                })}
              </div>
              <div style={{ padding:14, borderTop:"1px solid #1f2937" }}>
                <button onClick={()=>setShowAdd(true)} style={{ ...btn("linear-gradient(135deg,#0d9488,#0891b2)"), width:"100%", padding:10, fontSize:13 }}>➕ إضافة مريض</button>
              </div>
            </div>

            {/* detail */}
            <div>
              {sel2 ? (
                <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
                  <div style={card}>
                    <div style={{ padding:20 }}>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:16 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:14 }}>
                          <div style={{ ...avatar, width:52, height:52, fontSize:22, borderRadius:16 }}>{sel2.name[0]}</div>
                          <div>
                            <div style={{ fontWeight:700, fontSize:18 }}>{sel2.name}</div>
                            <div style={{ color:"#9ca3af", fontSize:13 }}>{sel2.age} سنة • {sel2.surgery}</div>
                            <div style={{ color:"#6b7280", fontSize:11 }}>{sel2.doctor} — {sel2.dept}</div>
                            <div style={{ color:"#6b7280", fontSize:11 }}>📱 {sel2.phone}</div>
                          </div>
                        </div>
                        <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:8 }}>
                          <div style={badge(SC[sel2.status].bg,SC[sel2.status].text,SC[sel2.status].border)}>
                            <div style={{ width:8,height:8,borderRadius:"50%",background:SC[sel2.status].dot }}></div>{sel2.status}
                          </div>
                          <span style={{ fontSize:11, padding:"2px 10px", borderRadius:999, color:RC[sel2.risk].color, background:RC[sel2.risk].bg }}>خطورة {sel2.risk}</span>
                        </div>
                      </div>
                      {/* vitals */}
                      <div style={{ display:"flex", gap:10, marginBottom:16 }}>
                        {[
                          { l:"الألم",   v:`${sel2.vitals.pain}/10`, icon:"😣",  c:sel2.vitals.pain>6?"#ef4444":"#f59e0b" },
                          { l:"الحرارة", v:`${sel2.vitals.fever}°م`, icon:"🌡️", c:sel2.vitals.fever>38?"#ef4444":"#10b981" },
                          { l:"الجرح",   v:sel2.vitals.wound,        icon:"🩹",  c:"#3b82f6" },
                          { l:"الحركة",  v:sel2.vitals.mobility,     icon:"🚶",  c:"#8b5cf6" },
                        ].map((v,i)=>(
                          <div key={i} style={{ background:"#1f2937", borderRadius:12, padding:12, textAlign:"center", flex:1 }}>
                            <div style={{ fontSize:18 }}>{v.icon}</div>
                            <div style={{ fontWeight:700, fontSize:12, color:v.c, margin:"4px 0" }}>{v.v}</div>
                            <div style={{ color:"#4b5563", fontSize:10 }}>{v.l}</div>
                          </div>
                        ))}
                      </div>
                      {/* status update */}
                      <div style={{ borderTop:"1px solid #1f2937", paddingTop:14 }}>
                        <div style={{ fontSize:12, color:"#6b7280", marginBottom:8 }}>تحديث الحالة:</div>
                        <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                          {["مستقر","تحذير","خطر","جديد"].map(s=>(
                            <button key={s} onClick={()=>updateStatus(s)}
                              style={{ ...badge(SC[s].bg,SC[s].text,SC[s].border), cursor:"pointer", outline:sel2.status===s?`2px solid ${SC[s].text}`:"none", padding:"6px 14px" }}>{s}</button>
                          ))}
                          <button onClick={()=>setShowDel(true)}
                            style={{ marginRight:"auto", background:"rgba(239,68,68,.1)", border:"1px solid rgba(239,68,68,.3)", color:"#f87171", borderRadius:999, padding:"6px 14px", fontSize:12, cursor:"pointer" }}>
                            🗑️ حذف
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {sel2.alerts.length>0 && (
                    <div style={{ background:"rgba(239,68,68,.1)", border:"1px solid rgba(239,68,68,.2)", borderRadius:12, padding:16 }}>
                      <div style={{ color:"#f87171", fontWeight:600, fontSize:13, marginBottom:8 }}>🚨 تنبيهات</div>
                      {sel2.alerts.map((a,i)=>(
                        <div key={i} style={{ display:"flex", gap:8, color:"#fca5a5", fontSize:13, marginBottom:4 }}>
                          <div style={{ width:6, height:6, borderRadius:"50%", background:"#ef4444", marginTop:6, flexShrink:0 }}></div>{a}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* timeline */}
                  <div style={card}>
                    <div style={cardH}><span style={{ fontWeight:700, fontSize:13 }}>📅 مسار المتابعة</span></div>
                    <div style={{ padding:16, display:"flex", flexDirection:"column", gap:12 }}>
                      {sel2.timeline.map((t,i)=>(
                        <div key={i} style={{ display:"flex", gap:12, alignItems:"flex-start" }}>
                          <div style={{ display:"flex", flexDirection:"column", alignItems:"center" }}>
                            <div style={{ width:30,height:30,borderRadius:"50%",background:"#1f2937",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13 }}>{t.status}</div>
                            {i<sel2.timeline.length-1&&<div style={{ width:2,height:20,background:"#1f2937",margin:"4px 0" }}></div>}
                          </div>
                          <div style={{ paddingTop:4 }}>
                            <div style={{ color:"#6b7280", fontSize:11, fontWeight:600 }}>اليوم {t.day}</div>
                            <div style={{ color:"#f9fafb", fontSize:12 }}>{t.note}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ ...card, display:"flex", alignItems:"center", justifyContent:"center", height:300 }}>
                  <div style={{ textAlign:"center" }}>
                    <div style={{ fontSize:40, marginBottom:12 }}>👆</div>
                    <div style={{ color:"#6b7280" }}>اختر مريضاً لعرض تفاصيله</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ════════════════ MESSAGES ════════════════ */}
        {tab==="messages" && (
          <div style={card}>
            <div style={cardH}><span style={{ fontWeight:700, fontSize:16 }}>💬 نماذج رسائل المتابعة</span></div>
            <div style={{ padding:20, display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16 }}>
              {[
                { title:"اليوم الأول", tag:"يوم 1", bc:"rgba(59,130,246,.3)", msg:`السلام عليكم [اسم المريض] 🌟\n\nنتمنى لك الشفاء العاجل بعد عملية [نوع العملية].\n\nللتأكد من سلامتك، نرجو الإجابة:\n\n1️⃣ هل تشعر بألم شديد؟ (1-10)\n2️⃣ هل درجة حرارتك طبيعية؟\n3️⃣ هل تستطيع التنفس بشكل جيد؟\n\n⚠️ في حال الطوارئ اتصل فوراً بـ 911\n\n— فريق مبادرة أمان` },
                { title:"اليوم الثالث", tag:"يوم 3", bc:"rgba(13,148,136,.3)", msg:`مرحباً [اسم المريض] 👋\n\nاليوم الثالث بعد العملية — كيف حالك؟\n\n1️⃣ هل لاحظت تورماً أو احمراراً في الجرح؟\n2️⃣ هل تتناول الأدوية كما وصف الطبيب؟\n3️⃣ هل يتحسن الألم مقارنة بالأمس؟\n\nفريقنا يتابعك باستمرار ❤️\n\n— فريق مبادرة أمان` },
                { title:"تنبيه عاجل", tag:"طارئ 🔴", bc:"rgba(239,68,68,.3)", msg:`عزيزي [اسم المريض] 🚨\n\nلاحظنا عدم ردك منذ فترة.\n\nنرجو الرد فوراً أو الاتصال بنا:\n📞 الطوارئ: 920000000\n\nصحتك أولويتنا 💙\n\n— فريق مبادرة أمان` },
              ].map((m,i)=>(
                <div key={i} style={{ border:`1px solid ${m.bc}`, borderRadius:16, padding:16, background:"rgba(255,255,255,.02)" }}>
                  <div style={{ display:"flex", gap:8, alignItems:"center", marginBottom:12 }}>
                    <span style={{ fontSize:11, padding:"2px 10px", borderRadius:999, background:"#1f2937", color:"#9ca3af" }}>{m.tag}</span>
                    <span style={{ fontWeight:600, fontSize:14 }}>{m.title}</span>
                  </div>
                  <div style={{ background:"#1f2937", borderRadius:12, padding:14, fontSize:11, color:"#d1d5db", lineHeight:1.8, whiteSpace:"pre-line", minHeight:190 }}>{m.msg}</div>
                  <button onClick={()=>{ navigator.clipboard?.writeText(m.msg); showToast("📋 تم نسخ الرسالة"); }}
                    style={{ ...btn("#374151"), width:"100%", marginTop:10, fontSize:12, padding:"8px 0" }}>📋 نسخ الرسالة</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ════════════════ REPORTS ════════════════ */}
        {tab==="reports" && (
          <div style={card}>
            <div style={{ ...cardH, padding:20 }}>
              <span style={{ fontWeight:700, fontSize:16 }}>📋 تقرير مبادرة أمان</span>
              <span style={{ fontSize:11, padding:"2px 10px", borderRadius:999, background:"#1f2937", color:"#9ca3af" }}>مارس 2026</span>
            </div>
            <div style={{ padding:20 }}>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:20 }}>
                {[
                  { l:"مرضى مُتابَعون",       v:patients.length,   icon:"👥", t:"نشطون" },
                  { l:"مستقرون",              v:stats.stable,      icon:"✅", t:`${patients.length?Math.round((stats.stable/patients.length)*100):0}%` },
                  { l:"يحتاجون متابعة",       v:stats.warning,     icon:"⚠️", t:"تنبيه" },
                  { l:"توفير تقديري",         v:`${(patients.length*15).toLocaleString()}k ر`, icon:"💰", t:"شهرياً" },
                ].map((s,i)=>(
                  <div key={i} style={{ background:"#1f2937", borderRadius:14, padding:16 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                      <span style={{ fontSize:22 }}>{s.icon}</span>
                      <span style={{ fontSize:11, color:"#14b8a6", background:"rgba(20,184,166,.1)", padding:"2px 8px", borderRadius:999 }}>{s.t}</span>
                    </div>
                    <div style={{ fontWeight:700, fontSize:22 }}>{s.v}</div>
                    <div style={{ color:"#6b7280", fontSize:12, marginTop:4 }}>{s.l}</div>
                  </div>
                ))}
              </div>
              <div style={{ background:"rgba(13,148,136,.08)", border:"1px solid rgba(20,184,166,.2)", borderRadius:14, padding:16 }}>
                <div style={{ color:"#2dd4bf", fontWeight:600, fontSize:14, marginBottom:8 }}>🎯 الأثر المباشر</div>
                <p style={{ color:"#d1d5db", fontSize:13, lineHeight:1.8, margin:0 }}>
                  المنصة تتابع حالياً <strong style={{color:"#fff"}}>{patients.length} مريض</strong>، منهم <strong style={{color:"#10b981"}}>{stats.stable} في حالة مستقرة</strong>.
                  الوفر التقديري للمنشأة الشريكة يتجاوز <strong style={{color:"#fff"}}>{(patients.length*15).toLocaleString()} ريال شهرياً</strong>.
                </p>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* ════════════ ADD MODAL ════════════ */}
      {showAdd && (
        <div style={overlay}>
          <div style={modal}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
              <h3 style={{ margin:0, fontSize:18, fontWeight:700 }}>➕ إضافة مريض جديد</h3>
              <button onClick={()=>{ setShowAdd(false); setErr(""); setForm(EMPTY); }} style={{ background:"none", border:"none", color:"#9ca3af", fontSize:22, cursor:"pointer" }}>✕</button>
            </div>

            {err && <div style={{ background:"rgba(239,68,68,.1)", border:"1px solid rgba(239,68,68,.3)", borderRadius:10, padding:"10px 14px", marginBottom:14, color:"#f87171", fontSize:13 }}>⚠️ {err}</div>}

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:12 }}>
              <div><label style={lbl}>اسم المريض *</label><input style={inp} placeholder="مثال: محمد العتيبي" value={form.name} onChange={e=>fc("name",e.target.value)} /></div>
              <div><label style={lbl}>العمر *</label><input style={inp} type="number" placeholder="مثال: 45" value={form.age} onChange={e=>fc("age",e.target.value)} /></div>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:12 }}>
              <div><label style={lbl}>رقم الجوال *</label><input style={inp} placeholder="05xxxxxxxx" value={form.phone} onChange={e=>fc("phone",e.target.value)} /></div>
              <div><label style={lbl}>درجة الخطورة</label>
                <select style={sel} value={form.risk} onChange={e=>fc("risk",e.target.value)}>
                  <option value="منخفض">🟢 منخفض</option>
                  <option value="متوسط">🟡 متوسط</option>
                  <option value="مرتفع">🔴 مرتفع</option>
                </select>
              </div>
            </div>
            <div style={{ marginBottom:12 }}>
              <label style={lbl}>نوع العملية *</label>
              <select style={sel} value={form.surgery} onChange={e=>fc("surgery",e.target.value)}>
                <option value="">-- اختر نوع العملية --</option>
                {SURGERIES.map(s=><option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:12 }}>
              <div><label style={lbl}>القسم *</label>
                <select style={sel} value={form.dept} onChange={e=>fc("dept",e.target.value)}>
                  <option value="">-- اختر القسم --</option>
                  {DEPTS.map(d=><option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div><label style={lbl}>الطبيب المعالج *</label><input style={inp} placeholder="مثال: د. سعد الغامدي" value={form.doctor} onChange={e=>fc("doctor",e.target.value)} /></div>
            </div>
            <div style={{ marginBottom:20 }}>
              <label style={lbl}>ملاحظات (اختياري)</label>
              <textarea style={{ ...inp, minHeight:65, resize:"vertical" }} placeholder="أي معلومات مهمة..." value={form.notes} onChange={e=>fc("notes",e.target.value)} />
            </div>
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={addPatient} style={{ ...btn("linear-gradient(135deg,#0d9488,#0891b2)"), flex:1, padding:14, fontSize:15 }}>✅ إضافة المريض</button>
              <button onClick={()=>{ setShowAdd(false); setErr(""); setForm(EMPTY); }} style={{ ...btn("#374151"), flex:1, padding:14 }}>إلغاء</button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════ SEND MODAL ════════════ */}
      {showSend && (
        <div style={overlay}>
          <div style={{ ...modal, maxWidth:440 }}>
            <h3 style={{ margin:"0 0 16px", fontSize:17, fontWeight:700 }}>📤 إرسال متابعة جماعية</h3>
            <div style={{ background:"#1f2937", borderRadius:12, padding:14, marginBottom:14 }}>
              <div style={{ color:"#6b7280", fontSize:12, marginBottom:8 }}>المرضى ({patients.length}):</div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                {patients.map(p=>(
                  <span key={p.id} style={{ fontSize:12, padding:"3px 10px", borderRadius:999, color:"#2dd4bf", background:"rgba(20,184,166,.1)", border:"1px solid rgba(20,184,166,.3)" }}>{p.name}</span>
                ))}
              </div>
            </div>
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={()=>{ setShowSend(false); showToast(`✅ تم إرسال رسائل المتابعة لـ ${patients.length} مرضى`); }} style={{ ...btn("#0d9488"), flex:1, padding:13 }}>✅ إرسال الآن</button>
              <button onClick={()=>setShowSend(false)} style={{ ...btn("#374151"), flex:1, padding:13 }}>إلغاء</button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════ DELETE CONFIRM ════════════ */}
      {showDel && (
        <div style={overlay}>
          <div style={{ ...modal, maxWidth:360, textAlign:"center" }}>
            <div style={{ fontSize:40, marginBottom:12 }}>🗑️</div>
            <h3 style={{ margin:"0 0 8px" }}>حذف المريض</h3>
            <p style={{ color:"#9ca3af", fontSize:14, margin:"0 0 20px" }}>هل أنت متأكد من حذف <strong style={{color:"#fff"}}>{sel2?.name}</strong>؟</p>
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={deletePatient} style={{ ...btn("#dc2626"), flex:1, padding:12 }}>نعم، احذف</button>
              <button onClick={()=>setShowDel(false)} style={{ ...btn("#374151"), flex:1, padding:12 }}>إلغاء</button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════ TOAST ════════════ */}
      {toast && (
        <div style={{ position:"fixed", bottom:24, left:"50%", transform:"translateX(-50%)", background:"#059669", color:"#fff", padding:"12px 24px", borderRadius:12, boxShadow:"0 8px 30px rgba(0,0,0,.4)", display:"flex", alignItems:"center", gap:10, zIndex:1000, fontSize:14, fontWeight:500, whiteSpace:"nowrap" }}>
          {toast}
        </div>
      )}

    </div>
  );
}
