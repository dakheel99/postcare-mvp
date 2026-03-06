import { useState, useEffect } from "react";

// ─── Supabase ─────────────────────────────────────────────────
const SB_URL = "https://gemspfmdeyzcgupaognu.supabase.co";
const SB_KEY = "sb_publishable_LR81YxOadOZHZPtbiTOkmg_GIGmrpmv";

const sbFetch = async (path, opts={}) => {
  const r = await fetch(`${SB_URL}/rest/v1${path}`, {
    headers: { "apikey": SB_KEY, "Authorization": `Bearer ${SB_KEY}`, "Content-Type": "application/json", "Prefer": "return=representation", ...opts.headers },
    ...opts,
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
};

const saveResponse = (data) => sbFetch("/responses", { method:"POST", body: JSON.stringify(data) });
const getResponses = (patientId) => sbFetch(`/responses?patient_id=eq.${patientId}&order=created_at.desc`);

// ─── أسئلة ────────────────────────────────────────────────────
const GENERAL_Q = [
  { id:"g1", text:"كيف تصف مستوى الألم؟", options:["لا ألم","ألم خفيف","ألم متوسط","ألم شديد"], alertOn:["ألم شديد"] },
  { id:"g2", text:"هل درجة حرارتك طبيعية؟", options:["نعم طبيعية","أعلى قليلاً","مرتفعة جداً"], alertOn:["مرتفعة جداً"] },
  { id:"g3", text:"هل تتناول أدويتك بانتظام؟", options:["نعم بانتظام","أحياناً","لا"], alertOn:["لا"] },
  { id:"g4", text:"هل تستطيع الأكل والشرب؟", options:["نعم بشكل طبيعي","بصعوبة","لا أستطيع"], alertOn:["لا أستطيع"] },
  { id:"g5", text:"كيف حال الجرح؟", options:["نظيف يلتئم","احمرار خفيف","تورم أو إفرازات"], alertOn:["تورم أو إفرازات"] },
];

const SURGERY_Q = {
  "استئصال المرارة":[
    { id:"s1", text:"هل تشعر بألم في الكتف الأيمن؟", options:["لا","نعم خفيف","نعم شديد"], alertOn:["نعم شديد"] },
    { id:"s2", text:"هل لاحظت اصفراراً في الجلد أو العينين؟", options:["لا","نعم"], alertOn:["نعم"] },
    { id:"s3", text:"هل رجعت حركة الأمعاء؟", options:["نعم","لا بعد"] },
  ],
  "استئصال الزائدة":[
    { id:"s1", text:"هل الجرح نظيف؟", options:["نعم","فيه احمرار","فيه إفرازات"], alertOn:["فيه إفرازات"] },
    { id:"s2", text:"هل الألم في البطن يتحسن؟", options:["نعم يتحسن","نفس","يزداد"], alertOn:["يزداد"] },
    { id:"s3", text:"هل تستطيع المشي؟", options:["نعم بشكل طبيعي","بصعوبة","لا"] },
  ],
  "استبدال الركبة":[
    { id:"s1", text:"هل تقوم بتمارين الركبة؟", options:["نعم يومياً","أحياناً","لا"], alertOn:["لا"] },
    { id:"s2", text:"هل الركبة منتفخة؟", options:["انتفاخ طبيعي","انتفاخ زائد","شديد الانتفاخ"], alertOn:["شديد الانتفاخ"] },
    { id:"s3", text:"هل تشعر بتنميل في القدم؟", options:["لا","نعم أحياناً","نعم دائماً"], alertOn:["نعم دائماً"] },
  ],
  "استبدال الورك":[
    { id:"s1", text:"هل تتجنب ثني الورك بشكل مفرط؟", options:["نعم","أحياناً أنسى"], alertOn:["أحياناً أنسى"] },
    { id:"s2", text:"هل تشعر بألم أو تورم في الساق؟", options:["لا","نعم خفيف","نعم شديد"], alertOn:["نعم شديد"] },
  ],
  "عملية القلب المفتوح":[
    { id:"s1", text:"هل تشعر بضيق تنفس؟", options:["لا","عند المجهود","في الراحة"], alertOn:["في الراحة"] },
    { id:"s2", text:"هل نبضك منتظم؟", options:["نعم منتظم","أحس بخفقان","غير منتظم"], alertOn:["غير منتظم"] },
    { id:"s3", text:"هل وزنك زاد فجأة؟", options:["لا","زاد قليلاً","زاد كثيراً"], alertOn:["زاد كثيراً"] },
  ],
  "عملية القيصرية":[
    { id:"s1", text:"كيف حال الجرح؟", options:["نظيف يلتئم","احمرار","إفرازات أو رائحة"], alertOn:["إفرازات أو رائحة"] },
    { id:"s2", text:"هل النزيف طبيعي؟", options:["نعم طبيعي","غزير قليلاً","غزير جداً"], alertOn:["غزير جداً"] },
    { id:"s3", text:"كيف مزاجك العام؟", options:["جيد","متعبة","حزينة جداً"], alertOn:["حزينة جداً"] },
  ],
  "عملية العمود الفقري":[
    { id:"s1", text:"هل تشعر بضعف أو تنميل في الساقين؟", options:["لا","نعم خفيف","نعم شديد"], alertOn:["نعم شديد"] },
    { id:"s2", text:"هل الألم أفضل من قبل العملية؟", options:["نعم أفضل","نفس","أسوأ"], alertOn:["أسوأ"] },
  ],
  "عملية الغدة الدرقية":[
    { id:"s1", text:"هل تشعر بصعوبة في البلع؟", options:["لا","نعم خفيفة","نعم شديدة"], alertOn:["نعم شديدة"] },
    { id:"s2", text:"هل تشعر بتشنجات في اليدين؟", options:["لا","نعم أحياناً","نعم دائماً"], alertOn:["نعم دائماً"] },
  ],
  "عملية المعدة":[
    { id:"s1", text:"هل تستطيع شرب السوائل؟", options:["نعم بسهولة","بصعوبة","لا أستطيع"], alertOn:["لا أستطيع"] },
    { id:"s2", text:"هل تشعر بغثيان مستمر؟", options:["لا","أحياناً","نعم مستمر"], alertOn:["نعم مستمر"] },
  ],
  "عملية الفتق":[
    { id:"s1", text:"هل تتجنب رفع الأشياء الثقيلة؟", options:["نعم","لا أستطيع تجنبها"], alertOn:["لا أستطيع تجنبها"] },
    { id:"s2", text:"هل الجرح منتفخ؟", options:["لا","انتفاخ خفيف","انتفاخ شديد"], alertOn:["انتفاخ شديد"] },
  ],
  "استئصال الورم":[
    { id:"s1", text:"هل الجرح يلتئم؟", options:["نعم جيد","ببطء","لا يلتئم"], alertOn:["لا يلتئم"] },
    { id:"s2", text:"هل حددت موعد المتابعة؟", options:["نعم","لا بعد"], alertOn:["لا بعد"] },
  ],
  "توسيع الشرايين / القسطرة":[
    { id:"s1", text:"هل تشعر بضيق صدر؟", options:["لا","نعم خفيف","نعم شديد"], alertOn:["نعم شديد"] },
    { id:"s2", text:"هل نبضك منتظم؟", options:["نعم","أحس بخفقان","لا"], alertOn:["لا"] },
  ],
  "البروستاتا / المسالك البولية":[
    { id:"s1", text:"هل تستطيع التبول؟", options:["نعم طبيعي","بصعوبة","لا أستطيع"], alertOn:["لا أستطيع"] },
    { id:"s2", text:"هل يوجد دم في البول؟", options:["لا","قليل","كثير"], alertOn:["كثير"] },
  ],
  "استئصال كيس مبيضي":[
    { id:"s1", text:"هل تشعرين بألم في البطن؟", options:["لا","ألم خفيف","ألم شديد"], alertOn:["ألم شديد"] },
    { id:"s2", text:"هل يوجد نزيف غير طبيعي؟", options:["لا","نعم"], alertOn:["نعم"] },
  ],
  "أخرى":[
    { id:"s1", text:"كيف تشعر بشكل عام؟", options:["بخير","متعب","سيء جداً"], alertOn:["سيء جداً"] },
    { id:"s2", text:"هل الجرح يلتئم؟", options:["نعم","ببطء","لا"], alertOn:["لا"] },
  ],
};

const ALL_SURGERIES = Object.keys(SURGERY_Q);
const DEPTS = ["الجراحة العامة","العظام","أمراض النساء","جراحة القلب","المسالك البولية","الجراحة العصبية","أمراض القلب","طب الأطفال","الأنف والأذن والحنجرة","العيون","الجلدية","الطوارئ","العناية المركزة","الباطنية","أخرى"];

const DEMO_PATIENTS = [
  { id:"p1", name:"محمد العتيبي", age:52, surgery:"استئصال المرارة", day:3, phone:"0501234567", risk:"متوسط", doctor:"د. سعد الغامدي", dept:"الجراحة العامة", alerts:["حرارة 38.2°م"], status:"تحذير", lastResponse:"منذ 4 ساعات", vitals:{pain:6,fever:38.2,wound:"تورم خفيف",mobility:"محدودة"}, timeline:[{day:1,status:"✅",note:"حالة جيدة"},{day:3,status:"⚠️",note:"ارتفاع حرارة"}] },
  { id:"p2", name:"فاطمة الزهراني", age:38, surgery:"استئصال الزائدة", day:7, phone:"0557654321", risk:"منخفض", doctor:"د. نورة السبيعي", dept:"الجراحة العامة", alerts:[], status:"مستقر", lastResponse:"منذ ساعة", vitals:{pain:2,fever:36.8,wound:"التئام جيد",mobility:"طبيعية"}, timeline:[{day:1,status:"✅",note:"بعد العملية بخير"},{day:7,status:"✅",note:"شبه طبيعي"}] },
  { id:"p3", name:"خالد الدوسري", age:65, surgery:"استبدال الركبة", day:5, phone:"0509876543", risk:"مرتفع", doctor:"د. عبدالله المطيري", dept:"العظام", alerts:["لم يستجب 12 ساعة"], status:"خطر", lastResponse:"منذ 12 ساعة", vitals:{pain:8,fever:38.9,wound:"غير معروف",mobility:"غير معروفة"}, timeline:[{day:1,status:"✅",note:"استيقاظ جيد"},{day:5,status:"🔴",note:"لا يوجد رد"}] },
];

const SC = {
  "مستقر":{ bg:"rgba(16,185,129,.15)", text:"#10b981", border:"rgba(16,185,129,.3)", dot:"#10b981" },
  "تحذير":{ bg:"rgba(245,158,11,.15)", text:"#f59e0b", border:"rgba(245,158,11,.3)", dot:"#f59e0b" },
  "خطر":  { bg:"rgba(239,68,68,.15)",  text:"#ef4444", border:"rgba(239,68,68,.3)",  dot:"#ef4444" },
  "جديد": { bg:"rgba(59,130,246,.15)", text:"#3b82f6", border:"rgba(59,130,246,.3)", dot:"#3b82f6" },
};
const RC = { "منخفض":{ color:"#10b981", bg:"rgba(16,185,129,.1)" }, "متوسط":{ color:"#f59e0b", bg:"rgba(245,158,11,.1)" }, "مرتفع":{ color:"#ef4444", bg:"rgba(239,68,68,.1)" } };

const card  = { background:"#111827", borderRadius:16, border:"1px solid #1f2937", overflow:"hidden" };
const cardH = { padding:"16px 20px", borderBottom:"1px solid #1f2937", display:"flex", justifyContent:"space-between", alignItems:"center" };
const OVL   = { position:"fixed", inset:0, background:"rgba(0,0,0,.8)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:500, padding:16 };
const MDL   = { background:"#111827", border:"1px solid #374151", borderRadius:20, padding:24, width:"100%", maxWidth:560, maxHeight:"90vh", overflowY:"auto" };
const INP   = { width:"100%", background:"#1f2937", color:"#f9fafb", fontSize:14, padding:"10px 14px", borderRadius:10, border:"1px solid #374151", outline:"none", boxSizing:"border-box" };
const LBL   = { fontSize:12, color:"#9ca3af", marginBottom:6, display:"block", fontWeight:500 };
const BTN   = (bg) => ({ background:bg, color:"#fff", border:"none", borderRadius:12, padding:"10px 20px", fontSize:14, fontWeight:600, cursor:"pointer" });
const BADGE = (bg,c,b) => ({ display:"inline-flex", alignItems:"center", gap:6, padding:"4px 12px", borderRadius:999, border:`1px solid ${b}`, background:bg, color:c, fontSize:12, fontWeight:500 });
const AV    = { width:40, height:40, borderRadius:12, background:"linear-gradient(135deg,#14b8a6,#0891b2)", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:"bold", fontSize:16, flexShrink:0 };
const EMPTY = { name:"", age:"", phone:"", surgery:"", customSurgery:"", dept:"", doctor:"", risk:"منخفض", notes:"", nationalId:"", fileNo:"", gender:"ذكر" };
const R2    = { display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:12 };

// ─── صفحة المريض ──────────────────────────────────────────────
function PatientPage({ patientId }) {
  const [patient, setPatient]   = useState(null);
  const [answers, setAnswers]   = useState({});
  const [step, setStep]         = useState("loading"); // loading | questions | done | notfound
  const [submitting, setSub]    = useState(false);

  useEffect(() => {
    const all = (() => { try { const s=localStorage.getItem("pc_v4"); return s?JSON.parse(s):DEMO_PATIENTS; } catch { return DEMO_PATIENTS; } })();
    const p = all.find(x => x.id === patientId || String(x.id) === patientId);
    if (p) { setPatient(p); setStep("questions"); }
    else setStep("notfound");
  }, [patientId]);

  const allQ = patient ? [...GENERAL_Q, ...(SURGERY_Q[patient.surgery]||SURGERY_Q["أخرى"])] : [];
  const answered = Object.keys(answers).length;
  const total = allQ.length;

  const submit = async () => {
    if (answered < total) return;
    setSub(true);
    const hasAlert = allQ.some(q => q.alertOn?.includes(answers[q.id]));
    try {
      await saveResponse({
        patient_id: String(patient.id),
        patient_name: patient.name,
        surgery: patient.surgery,
        answers,
        has_alert: hasAlert,
      });
      setStep("done");
    } catch(e) {
      console.error(e);
      setStep("done"); // show done anyway
    }
    setSub(false);
  };

  if (step==="loading") return (
    <div style={{ minHeight:"100vh", background:"#030712", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ color:"#6b7280", fontSize:16 }}>جاري التحميل...</div>
    </div>
  );

  if (step==="notfound") return (
    <div style={{ minHeight:"100vh", background:"#030712", display:"flex", alignItems:"center", justifyContent:"center", direction:"rtl" }}>
      <div style={{ textAlign:"center", color:"#6b7280" }}>
        <div style={{ fontSize:48, marginBottom:16 }}>❌</div>
        <div style={{ fontSize:18 }}>الرابط غير صحيح</div>
        <div style={{ fontSize:14, marginTop:8 }}>تواصل مع الفريق الطبي</div>
      </div>
    </div>
  );

  if (step==="done") return (
    <div style={{ minHeight:"100vh", background:"#030712", display:"flex", alignItems:"center", justifyContent:"center", direction:"rtl", padding:24 }}>
      <div style={{ textAlign:"center", maxWidth:400 }}>
        <div style={{ fontSize:64, marginBottom:20 }}>✅</div>
        <h2 style={{ color:"#f9fafb", fontSize:22, fontWeight:700, marginBottom:12 }}>شكراً {patient?.name}!</h2>
        <p style={{ color:"#9ca3af", fontSize:15, lineHeight:1.8 }}>تم استلام إجاباتك بنجاح.<br/>الفريق الطبي يتابع حالتك.</p>
        <div style={{ marginTop:24, background:"rgba(13,148,136,.1)", border:"1px solid rgba(20,184,166,.2)", borderRadius:16, padding:16 }}>
          <div style={{ color:"#2dd4bf", fontSize:13 }}>⚠️ في حال الطوارئ اتصل فوراً بـ 911</div>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", background:"#030712", color:"#f9fafb", fontFamily:"'Segoe UI',Tahoma,Arial,sans-serif", direction:"rtl", padding:"0 0 40px" }}>
      {/* header */}
      <div style={{ background:"#111827", borderBottom:"1px solid #1f2937", padding:"16px 24px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ width:36, height:36, borderRadius:10, background:"linear-gradient(135deg,#14b8a6,#0891b2)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>🏥</div>
          <div>
            <div style={{ fontWeight:700, fontSize:15 }}>منصة منصة أمان لرعاية المرضى بعد العمليات الجراحية</div>
            <div style={{ fontSize:11, color:"#6b7280" }}>منصة منصة أمان</div>
          </div>
        </div>
        <div style={{ background:"#1f2937", borderRadius:10, padding:"6px 14px", fontSize:12, color:"#2dd4bf" }}>
          {answered}/{total} سؤال
        </div>
      </div>

      {/* progress */}
      <div style={{ height:4, background:"#1f2937" }}>
        <div style={{ height:"100%", background:"linear-gradient(90deg,#14b8a6,#0891b2)", width:`${(answered/total)*100}%`, transition:"width .3s" }}></div>
      </div>

      <div style={{ maxWidth:600, margin:"0 auto", padding:"24px 16px" }}>
        {/* greeting */}
        <div style={{ background:"linear-gradient(135deg,rgba(13,148,136,.2),rgba(8,145,178,.1))", border:"1px solid rgba(20,184,166,.2)", borderRadius:16, padding:20, marginBottom:24 }}>
          <div style={{ fontSize:16, fontWeight:700, marginBottom:6 }}>السلام عليكم {patient.name} 👋</div>
          <div style={{ fontSize:13, color:"#9ca3af", lineHeight:1.8 }}>
            نتمنى لك الشفاء العاجل بعد عملية <strong style={{color:"#2dd4bf"}}>{patient.surgery}</strong>.<br/>
            يرجى الإجابة على الأسئلة التالية لمتابعة حالتك.
          </div>
        </div>

        {/* general questions */}
        <div style={{ fontSize:13, color:"#14b8a6", fontWeight:700, marginBottom:12, display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ background:"rgba(20,184,166,.15)", padding:"2px 10px", borderRadius:999 }}>أسئلة عامة</span>
        </div>
        {GENERAL_Q.map((q,i) => (
          <div key={q.id} style={{ background:"#111827", border:"1px solid #1f2937", borderRadius:16, padding:18, marginBottom:12 }}>
            <div style={{ fontSize:14, fontWeight:600, marginBottom:14, display:"flex", gap:8, alignItems:"flex-start" }}>
              <span style={{ background:"#1f2937", color:"#14b8a6", borderRadius:8, padding:"2px 8px", fontSize:12, flexShrink:0 }}>{i+1}</span>
              {q.text}
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {q.options.map(opt => {
                const sel = answers[q.id]===opt;
                const isAlert = q.alertOn?.includes(opt);
                return (
                  <button key={opt} onClick={()=>setAnswers(prev=>({...prev,[q.id]:opt}))}
                    style={{ padding:"11px 16px", borderRadius:12, border:`2px solid ${sel?(isAlert?"#f59e0b":"#14b8a6"):"#1f2937"}`, background:sel?(isAlert?"rgba(245,158,11,.15)":"rgba(20,184,166,.15)"):"#1f2937", color:sel?(isAlert?"#f59e0b":"#2dd4bf"):"#d1d5db", fontSize:14, cursor:"pointer", textAlign:"right", fontWeight:sel?600:400, transition:"all .15s" }}>
                    {sel ? "✓ " : ""}{opt}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {/* surgery-specific questions */}
        <div style={{ fontSize:13, color:"#7c3aed", fontWeight:700, margin:"20px 0 12px", display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ background:"rgba(124,58,237,.15)", padding:"2px 10px", borderRadius:999 }}>أسئلة خاصة بـ {patient.surgery}</span>
        </div>
        {(SURGERY_Q[patient.surgery]||SURGERY_Q["أخرى"]).map((q,i) => (
          <div key={q.id} style={{ background:"#111827", border:`1px solid ${q.alertOn?"rgba(124,58,237,.3)":"#1f2937"}`, borderRadius:16, padding:18, marginBottom:12 }}>
            <div style={{ fontSize:14, fontWeight:600, marginBottom:14, display:"flex", gap:8, alignItems:"flex-start" }}>
              <span style={{ background:"rgba(124,58,237,.15)", color:"#a78bfa", borderRadius:8, padding:"2px 8px", fontSize:12, flexShrink:0 }}>{GENERAL_Q.length+i+1}</span>
              {q.text}
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {q.options.map(opt => {
                const sel = answers[q.id]===opt;
                const isAlert = q.alertOn?.includes(opt);
                return (
                  <button key={opt} onClick={()=>setAnswers(prev=>({...prev,[q.id]:opt}))}
                    style={{ padding:"11px 16px", borderRadius:12, border:`2px solid ${sel?(isAlert?"#f59e0b":"#7c3aed"):"#1f2937"}`, background:sel?(isAlert?"rgba(245,158,11,.15)":"rgba(124,58,237,.15)"):"#1f2937", color:sel?(isAlert?"#f59e0b":"#a78bfa"):"#d1d5db", fontSize:14, cursor:"pointer", textAlign:"right", fontWeight:sel?600:400, transition:"all .15s" }}>
                    {sel ? "✓ " : ""}{opt}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {/* submit */}
        <div style={{ marginTop:24 }}>
          {answered < total && (
            <div style={{ textAlign:"center", color:"#6b7280", fontSize:13, marginBottom:12 }}>
              تبقى {total - answered} سؤال للإرسال
            </div>
          )}
          <button onClick={submit} disabled={answered < total || submitting}
            style={{ ...BTN(answered===total?"linear-gradient(135deg,#0d9488,#0891b2)":"#374151"), width:"100%", padding:16, fontSize:16, opacity:answered<total?.5:1 }}>
            {submitting ? "جاري الإرسال..." : answered===total ? "✅ إرسال الإجابات" : `أجب على جميع الأسئلة (${answered}/${total})`}
          </button>
        </div>

        <div style={{ textAlign:"center", marginTop:16, color:"#4b5563", fontSize:12 }}>
          ⚠️ في حال الطوارئ اتصل فوراً بـ 911
        </div>
      </div>
    </div>
  );
}

// ─── لوحة التحكم الرئيسية ─────────────────────────────────────
export default function App() {
  // ── تحقق هل هذا رابط مريض؟ ──
  const urlParams = new URLSearchParams(window.location.search);
  const patientParam = urlParams.get("patient");
  if (patientParam) return <PatientPage patientId={patientParam} />;

  const [patients, setPatients] = useState(() => {
    try { const s=localStorage.getItem("pc_v4"); return s?JSON.parse(s):DEMO_PATIENTS; } catch { return DEMO_PATIENTS; }
  });
  const [tab,      setTab]      = useState("dashboard");
  const [sel,      setSel]      = useState(null);
  const [showAdd,  setShowAdd]  = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDel,  setShowDel]  = useState(false);
  const [showSend, setShowSend] = useState(false);
  const [showResp, setShowResp] = useState(false);
  const [responses,setResponses]= useState([]);
  const [loadingR, setLoadingR] = useState(false);
  const [toast,    setToast]    = useState("");
  const [search,   setSearch]   = useState("");
  const [filt,     setFilt]     = useState("الكل");
  const [form,     setForm]     = useState(EMPTY);
  const [editForm, setEditForm] = useState({});
  const [formErr,  setFormErr]  = useState("");

  useEffect(() => { try { localStorage.setItem("pc_v4", JSON.stringify(patients)); } catch {} }, [patients]);

  const toast_ = (m) => { setToast(m); setTimeout(()=>setToast(""),3500); };
  const fc = (k,v) => setForm(f=>({...f,[k]:v}));
  const ef = (k,v) => setEditForm(f=>({...f,[k]:v}));

  const stats = { total:patients.length, stable:patients.filter(p=>p.status==="مستقر").length, warning:patients.filter(p=>p.status==="تحذير").length, danger:patients.filter(p=>p.status==="خطر").length };
  const filtered = patients.filter(p => (p.name.includes(search)||p.surgery.includes(search)) && (filt==="الكل"||p.status===filt));

  const patientLink = (p) => `${window.location.origin}${window.location.pathname}?patient=${p.id}`;

  const sendWhatsApp = (p, day) => {
    const link = patientLink(p);
    const msgs = {
      "يوم1": `السلام عليكم ${p.name} 🌟\n\nنتمنى لك الشفاء العاجل بعد عملية ${p.surgery}.\n\nللإجابة على أسئلة متابعتك اليومية، اضغط الرابط:\n👇\n${link}\n\n⚠️ في حال الطوارئ اتصل بـ 911\n\n— فريق منصة منصة أمان`,
      "يوم3": `مرحباً ${p.name} 👋\n\nاليوم الثالث بعد عملية ${p.surgery}.\n\nيرجى الإجابة على أسئلة المتابعة:\n👇\n${link}\n\n— فريق منصة منصة أمان`,
      "يوم7": `مرحباً ${p.name} 🌟\n\nاليوم السابع — نتمنى تعافيك!\n\nأسئلة المتابعة:\n👇\n${link}\n\n— فريق منصة منصة أمان`,
      "طارئ": `عزيزي ${p.name} 🚨\n\nلاحظنا عدم ردك.\n\nيرجى الإجابة فوراً:\n👇\n${link}\n\nأو اتصل: 920000000\n\n— فريق منصة منصة أمان`,
    };
    const phone = p.phone.startsWith("0")?"966"+p.phone.slice(1):p.phone;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msgs[day]||msgs["يوم1"])}`, "_blank");
    toast_(`📱 فُتح واتساب — الرابط مضمّن في الرسالة`);
  };

  const copyLink = (p) => { navigator.clipboard?.writeText(patientLink(p)); toast_("🔗 تم نسخ رابط المريض"); };

  const loadResponses = async (p) => {
    setShowResp(true); setLoadingR(true);
    try {
      const data = await getResponses(String(p.id));
      setResponses(data||[]);
      if (data?.length > 0) {
        const latest = data[0];
        if (latest.has_alert) {
          const updated = {...p, status:"تحذير", lastResponse:"الآن", timeline:[...p.timeline,{day:p.day,status:"⚠️",note:"إجابات المريض تستدعي المتابعة"}]};
          setPatients(prev=>prev.map(x=>x.id===p.id?updated:x));
          setSel(updated);
        }
      }
    } catch(e) { setResponses([]); }
    setLoadingR(false);
  };

  const addPatient = () => {
    if (!form.name.trim()) return setFormErr("اسم المريض مطلوب");
    if (!form.age||+form.age<1) return setFormErr("العمر غير صحيح");
    if (!form.phone.trim()) return setFormErr("رقم الجوال مطلوب");
    if (!form.surgery) return setFormErr("نوع العملية مطلوب");
    if (form.surgery==="أخرى" && !form.customSurgery.trim()) return setFormErr("يرجى كتابة نوع العملية");
    if (!form.dept) return setFormErr("القسم مطلوب");
    if (!form.doctor.trim()) return setFormErr("اسم الطبيب مطلوب");
    const surgeryName = form.surgery==="أخرى" ? form.customSurgery.trim() : form.surgery;
    const p = { id:`p${Date.now()}`, name:form.name.trim(), age:+form.age, phone:form.phone.trim(), nationalId:form.nationalId.trim(), fileNo:form.fileNo.trim(), gender:form.gender, surgery:surgeryName, dept:form.dept, doctor:form.doctor.trim(), risk:form.risk, day:1, alerts:[], status:"جديد", lastResponse:"الآن", vitals:{pain:0,fever:37.0,wound:"لم يُقيَّم",mobility:"لم تُقيَّم"}, timeline:[{day:1,status:"🆕",note:form.notes.trim()||"تم الإدخال — بدء المتابعة"}] };
    setPatients(prev=>[p,...prev]); setForm(EMPTY); setFormErr(""); setShowAdd(false);
    toast_(`✅ تم إضافة ${p.name}`); setSel(p); setTab("patients");
  };

  const openEdit = () => { setEditForm({name:sel.name,age:sel.age,phone:sel.phone,nationalId:sel.nationalId||"",fileNo:sel.fileNo||"",gender:sel.gender||"ذكر",surgery:sel.surgery,dept:sel.dept,doctor:sel.doctor,risk:sel.risk,pain:sel.vitals.pain,fever:sel.vitals.fever,wound:sel.vitals.wound,mobility:sel.vitals.mobility,note:""}); setShowEdit(true); };
  const saveEdit = () => {
    const updated = {...sel,name:editForm.name,age:+editForm.age,phone:editForm.phone,nationalId:editForm.nationalId||"",fileNo:editForm.fileNo||"",gender:editForm.gender||"ذكر",surgery:editForm.surgery,dept:editForm.dept,doctor:editForm.doctor,risk:editForm.risk,vitals:{pain:+editForm.pain,fever:+editForm.fever,wound:editForm.wound,mobility:editForm.mobility},timeline:editForm.note?.trim()?[...sel.timeline,{day:sel.day,status:"📝",note:editForm.note.trim()}]:sel.timeline};
    setPatients(prev=>prev.map(p=>p.id===sel.id?updated:p)); setSel(updated); setShowEdit(false); toast_("✅ تم تحديث الملف");
  };
  const deletePatient = () => { setPatients(prev=>prev.filter(p=>p.id!==sel.id)); setSel(null); setShowDel(false); toast_("🗑️ تم الحذف"); };
  const updateStatus = (s) => { setPatients(prev=>prev.map(p=>p.id===sel.id?{...p,status:s}:p)); setSel(prev=>({...prev,status:s})); toast_(`تم تحديث الحالة: ${s}`); };

  return (
    <div style={{ minHeight:"100vh", background:"#030712", color:"#f9fafb", fontFamily:"'Segoe UI',Tahoma,Arial,sans-serif", direction:"rtl" }}>

      {/* HEADER */}
      <div style={{ background:"#111827", borderBottom:"1px solid #1f2937", padding:"14px 24px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ width:40,height:40,borderRadius:12,background:"linear-gradient(135deg,#14b8a6,#0891b2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20 }}>🏥</div>
          <div><div style={{ fontWeight:700,fontSize:16 }}>منصة أمان</div><div style={{ fontSize:11,color:"#6b7280" }}>منصة منصة أمان لرعاية المرضى بعد العمليات الجراحية</div></div>
        </div>
        <div style={{ display:"flex",alignItems:"center",gap:12 }}>
          <button onClick={()=>setShowAdd(true)} style={{ ...BTN("linear-gradient(135deg,#0d9488,#0891b2)"),padding:"8px 18px",fontSize:13 }}>➕ إضافة مريض</button>
          <div style={{ display:"flex",alignItems:"center",gap:6,background:"#1f2937",borderRadius:10,padding:"6px 12px" }}><div style={{ width:8,height:8,borderRadius:"50%",background:"#10b981" }}></div><span style={{ fontSize:11,color:"#6b7280" }}>منصة منصة أمان</span></div>
        </div>
      </div>

      {/* NAV */}
      <div style={{ background:"#111827", borderBottom:"1px solid #1f2937", padding:"0 24px", display:"flex", gap:4 }}>
        {[["dashboard","📊 لوحة التحكم"],["patients","👥 المرضى"],["messages","💬 الرسائل"],["reports","📋 التقارير"]].map(([t,l])=>(
          <button key={t} onClick={()=>setTab(t)} style={{ padding:"12px 20px",fontSize:14,fontWeight:500,border:"none",borderBottom:tab===t?"2px solid #14b8a6":"2px solid transparent",color:tab===t?"#14b8a6":"#9ca3af",background:"transparent",cursor:"pointer" }}>{l}</button>
        ))}
      </div>

      <div style={{ padding:24, maxWidth:1200, margin:"0 auto" }}>

        {/* STATS */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:24 }}>
          {[{label:"إجمالي المرضى",v:stats.total,icon:"👥",g:"#1d4ed8,#1e40af"},{label:"مستقرون",v:stats.stable,icon:"✅",g:"#059669,#047857"},{label:"يحتاجون متابعة",v:stats.warning,icon:"⚠️",g:"#d97706,#b45309"},{label:"حالات طارئة",v:stats.danger,icon:"🚨",g:"#dc2626,#b91c1c"}].map((s,i)=>(
            <div key={i} style={{ background:`linear-gradient(135deg,${s.g})`,borderRadius:16,padding:20 }}>
              <div style={{ display:"flex",justifyContent:"space-between",marginBottom:10 }}><span style={{ fontSize:26 }}>{s.icon}</span><span style={{ fontSize:34,fontWeight:700 }}>{s.v}</span></div>
              <div style={{ fontWeight:600,fontSize:13 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {stats.danger>0 && (
          <div style={{ background:"rgba(239,68,68,.1)",border:"1px solid rgba(239,68,68,.2)",borderRadius:12,padding:16,marginBottom:24,display:"flex",alignItems:"center",gap:12 }}>
            <span style={{ fontSize:22 }}>🚨</span>
            <div style={{ flex:1 }}><div style={{ color:"#f87171",fontWeight:600,fontSize:13 }}>تنبيه عاجل</div><div style={{ color:"rgba(248,113,113,.65)",fontSize:12 }}>{patients.filter(p=>p.status==="خطر").map(p=>p.name).join(" | ")}</div></div>
            <button onClick={()=>{setFilt("خطر");setTab("patients");}} style={{ ...BTN("#dc2626"),padding:"8px 16px",fontSize:13 }}>عرض</button>
          </div>
        )}

        {/* DASHBOARD */}
        {tab==="dashboard" && (
          <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:24 }}>
            <div style={card}>
              <div style={cardH}><span style={{ fontWeight:700 }}>المرضى النشطون ({patients.length})</span><button onClick={()=>setShowAdd(true)} style={{ ...BTN("#0d9488"),padding:"6px 14px",fontSize:12 }}>➕</button></div>
              {patients.length===0 ? <div style={{ padding:48,textAlign:"center",color:"#4b5563" }}><div style={{ fontSize:44,marginBottom:12 }}>🏥</div><button onClick={()=>setShowAdd(true)} style={{ ...BTN("#0d9488"),padding:"10px 28px" }}>➕ أضف أول مريض</button></div>
              : patients.map(p=>{const sc=SC[p.status];return(<div key={p.id} onClick={()=>{setSel(p);setTab("patients");}} style={{ padding:"14px 20px",borderBottom:"1px solid #1f2937",cursor:"pointer",display:"flex",alignItems:"center",gap:12 }} onMouseEnter={e=>e.currentTarget.style.background="#1f2937"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}><div style={AV}>{p.name[0]}</div><div style={{ flex:1 }}><div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:3 }}><span style={{ fontWeight:600,fontSize:14 }}>{p.name}</span><span style={{ fontSize:11,padding:"2px 8px",borderRadius:999,color:RC[p.risk].color,background:RC[p.risk].bg }}>{p.risk}</span></div><div style={{ color:"#6b7280",fontSize:12 }}>{p.surgery} • اليوم {p.day} • {p.doctor}</div></div><div style={BADGE(sc.bg,sc.text,sc.border)}><div style={{ width:8,height:8,borderRadius:"50%",background:sc.dot }}></div>{p.status}</div></div>);})}
            </div>
            <div style={{ display:"flex",flexDirection:"column",gap:16 }}>
              <div style={card}>
                <div style={cardH}><span style={{ fontWeight:700,fontSize:14 }}>إجراءات سريعة</span></div>
                <div style={{ padding:16,display:"flex",flexDirection:"column",gap:8 }}>
                  {[{l:"➕ إضافة مريض",bg:"linear-gradient(135deg,#0d9488,#0891b2)",a:()=>setShowAdd(true)},{l:"📤 إرسال متابعة جماعية",bg:"#7c3aed",a:()=>setShowSend(true)},{l:"📋 تقرير الشهر",bg:"#1d4ed8",a:()=>setTab("reports")}].map((a,i)=>(
                    <button key={i} onClick={a.a} style={{ ...BTN(a.bg),background:a.bg,width:"100%",padding:11 }} onMouseEnter={e=>e.currentTarget.style.opacity=".85"} onMouseLeave={e=>e.currentTarget.style.opacity="1"}>{a.l}</button>
                  ))}
                </div>
              </div>
              <div style={{ background:"rgba(13,148,136,.08)",border:"1px solid rgba(20,184,166,.2)",borderRadius:16,padding:16 }}>
                <div style={{ color:"#2dd4bf",fontWeight:700,fontSize:13,marginBottom:12 }}>📈 إحصائيات</div>
                <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10 }}>
                  {[{l:"المرضى",v:patients.length,s:"نشطون"},{l:"الاستقرار",v:`${patients.length?Math.round((stats.stable/patients.length)*100):0}%`,s:""},{l:"خطرة",v:stats.danger,s:""},{l:"توفير",v:`${(patients.length*15).toLocaleString()}ك`,s:"ر/شهر"}].map((s,i)=>(
                    <div key={i} style={{ background:"rgba(15,23,42,.5)",borderRadius:12,padding:12 }}><div style={{ color:"#2dd4bf",fontWeight:700,fontSize:18 }}>{s.v}</div><div style={{ color:"#f9fafb",fontSize:11 }}>{s.l}</div></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PATIENTS */}
        {tab==="patients" && (
          <div style={{ display:"grid", gridTemplateColumns:"280px 1fr", gap:24 }}>
            <div style={card}>
              <div style={{ padding:14,borderBottom:"1px solid #1f2937" }}>
                <input style={{ ...INP,marginBottom:10 }} placeholder="🔍 بحث..." value={search} onChange={e=>setSearch(e.target.value)} />
                <div style={{ display:"flex",gap:6,flexWrap:"wrap" }}>
                  {["الكل","خطر","تحذير","مستقر","جديد"].map(f=><button key={f} onClick={()=>setFilt(f)} style={{ fontSize:11,padding:"3px 10px",borderRadius:999,border:"none",cursor:"pointer",background:filt===f?"#0d9488":"#1f2937",color:filt===f?"#fff":"#9ca3af" }}>{f}</button>)}
                </div>
              </div>
              <div style={{ overflowY:"auto",maxHeight:500 }}>
                {filtered.map(p=>{const sc=SC[p.status],isSel=sel?.id===p.id;return(
                  <div key={p.id} onClick={()=>setSel(p)} style={{ padding:"12px 14px",borderBottom:"1px solid #1f2937",cursor:"pointer",background:isSel?"rgba(13,148,136,.1)":"transparent",borderRight:isSel?"3px solid #14b8a6":"3px solid transparent",display:"flex",alignItems:"center",gap:10 }} onMouseEnter={e=>{if(!isSel)e.currentTarget.style.background="#1f2937";}} onMouseLeave={e=>{e.currentTarget.style.background=isSel?"rgba(13,148,136,.1)":"transparent";}}>
                    <div style={{ ...AV,width:34,height:34,fontSize:13 }}>{p.name[0]}</div>
                    <div style={{ flex:1,overflow:"hidden" }}><div style={{ fontWeight:600,fontSize:13,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis" }}>{p.name}</div><div style={{ color:"#6b7280",fontSize:11 }}>{p.surgery}</div></div>
                    <div style={{ width:8,height:8,borderRadius:"50%",background:sc.dot,flexShrink:0 }}></div>
                  </div>
                );})}
              </div>
              <div style={{ padding:14,borderTop:"1px solid #1f2937" }}><button onClick={()=>setShowAdd(true)} style={{ ...BTN("linear-gradient(135deg,#0d9488,#0891b2)"),width:"100%",padding:10,fontSize:13 }}>➕ إضافة مريض</button></div>
            </div>

            <div>
              {sel ? (
                <div style={{ display:"flex",flexDirection:"column",gap:16 }}>
                  <div style={card}>
                    <div style={{ padding:20 }}>
                      {/* patient header */}
                      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16 }}>
                        <div style={{ display:"flex",alignItems:"center",gap:14 }}>
                          <div style={{ ...AV,width:52,height:52,fontSize:22,borderRadius:16 }}>{sel.name[0]}</div>
                          <div><div style={{ fontWeight:700,fontSize:18 }}>{sel.name}</div><div style={{ color:"#9ca3af",fontSize:13 }}>{sel.age} سنة • {sel.surgery}</div><div style={{ color:"#6b7280",fontSize:11 }}>{sel.doctor} — {sel.dept}</div><div style={{ color:"#6b7280",fontSize:11 }}>📱 {sel.phone}</div>{sel.nationalId&&<div style={{ color:"#6b7280",fontSize:11 }}>🪪 هوية: {sel.nationalId}</div>}{sel.fileNo&&<div style={{ color:"#6b7280",fontSize:11 }}>📁 ملف: {sel.fileNo}</div>}<div style={{ color:"#6b7280",fontSize:11 }}>👤 {sel.gender||"غير محدد"}</div></div>
                        </div>
                        <div style={{ display:"flex",flexDirection:"column",alignItems:"flex-end",gap:8 }}>
                          <div style={BADGE(SC[sel.status].bg,SC[sel.status].text,SC[sel.status].border)}><div style={{ width:8,height:8,borderRadius:"50%",background:SC[sel.status].dot }}></div>{sel.status}</div>
                          <span style={{ fontSize:11,padding:"2px 10px",borderRadius:999,color:RC[sel.risk].color,background:RC[sel.risk].bg }}>خطورة {sel.risk}</span>
                        </div>
                      </div>

                      {/* vitals */}
                      <div style={{ display:"flex",gap:10,marginBottom:16 }}>
                        {[{l:"الألم",v:`${sel.vitals.pain}/10`,icon:"😣",c:sel.vitals.pain>6?"#ef4444":"#f59e0b"},{l:"الحرارة",v:`${sel.vitals.fever}°م`,icon:"🌡️",c:sel.vitals.fever>38?"#ef4444":"#10b981"},{l:"الجرح",v:sel.vitals.wound,icon:"🩹",c:"#3b82f6"},{l:"الحركة",v:sel.vitals.mobility,icon:"🚶",c:"#8b5cf6"}].map((v,i)=>(
                          <div key={i} style={{ background:"#1f2937",borderRadius:12,padding:12,textAlign:"center",flex:1 }}><div style={{ fontSize:18 }}>{v.icon}</div><div style={{ fontWeight:700,fontSize:11,color:v.c,margin:"4px 0" }}>{v.v}</div><div style={{ color:"#4b5563",fontSize:10 }}>{v.l}</div></div>
                        ))}
                      </div>

                      {/* رابط المريض */}
                      <div style={{ background:"rgba(20,184,166,.08)",border:"1px solid rgba(20,184,166,.2)",borderRadius:12,padding:14,marginBottom:14 }}>
                        <div style={{ fontSize:12,color:"#2dd4bf",fontWeight:600,marginBottom:8 }}>🔗 رابط استبيان المريض</div>
                        <div style={{ fontSize:11,color:"#6b7280",background:"#1f2937",borderRadius:8,padding:"8px 12px",marginBottom:10,wordBreak:"break-all" }}>{patientLink(sel)}</div>
                        <button onClick={()=>copyLink(sel)} style={{ ...BTN("#0d9488"),padding:"7px 16px",fontSize:12 }}>📋 نسخ الرابط</button>
                      </div>

                      {/* واتساب */}
                      <div style={{ borderTop:"1px solid #1f2937",paddingTop:14,marginBottom:14 }}>
                        <div style={{ fontSize:12,color:"#6b7280",marginBottom:8 }}>📱 إرسال رابط الاستبيان عبر واتساب:</div>
                        <div style={{ display:"flex",gap:8,flexWrap:"wrap" }}>
                          {[{l:"يوم 1",k:"يوم1",bg:"#1d4ed8"},{l:"يوم 3",k:"يوم3",bg:"#0d9488"},{l:"يوم 7",k:"يوم7",bg:"#7c3aed"},{l:"🚨 طارئ",k:"طارئ",bg:"#dc2626"}].map((m,i)=>(
                            <button key={i} onClick={()=>sendWhatsApp(sel,m.k)} style={{ ...BTN(m.bg),padding:"7px 14px",fontSize:12 }}>💬 {m.l}</button>
                          ))}
                        </div>
                      </div>

                      {/* إجابات المريض من Supabase */}
                      <div style={{ borderTop:"1px solid #1f2937",paddingTop:14,marginBottom:14 }}>
                        <button onClick={()=>loadResponses(sel)} style={{ ...BTN("linear-gradient(135deg,#7c3aed,#6d28d9)"),padding:"8px 18px",fontSize:13 }}>
                          📊 عرض إجابات المريض
                        </button>
                      </div>

                      {/* status */}
                      <div style={{ borderTop:"1px solid #1f2937",paddingTop:14 }}>
                        <div style={{ fontSize:12,color:"#6b7280",marginBottom:8 }}>تحديث الحالة:</div>
                        <div style={{ display:"flex",gap:8,flexWrap:"wrap" }}>
                          {["مستقر","تحذير","خطر","جديد"].map(s=><button key={s} onClick={()=>updateStatus(s)} style={{ ...BADGE(SC[s].bg,SC[s].text,SC[s].border),cursor:"pointer",outline:sel.status===s?`2px solid ${SC[s].text}`:"none",padding:"6px 14px" }}>{s}</button>)}
                          <button onClick={openEdit} style={{ background:"rgba(59,130,246,.1)",border:"1px solid rgba(59,130,246,.3)",color:"#60a5fa",borderRadius:999,padding:"6px 14px",fontSize:12,cursor:"pointer" }}>✏️ تعديل</button>
                          <button onClick={()=>setShowDel(true)} style={{ marginRight:"auto",background:"rgba(239,68,68,.1)",border:"1px solid rgba(239,68,68,.3)",color:"#f87171",borderRadius:999,padding:"6px 14px",fontSize:12,cursor:"pointer" }}>🗑️ حذف</button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {sel.alerts.length>0 && (
                    <div style={{ background:"rgba(239,68,68,.1)",border:"1px solid rgba(239,68,68,.2)",borderRadius:12,padding:16 }}>
                      <div style={{ color:"#f87171",fontWeight:600,fontSize:13,marginBottom:8 }}>🚨 تنبيهات</div>
                      {sel.alerts.map((a,i)=><div key={i} style={{ display:"flex",gap:8,color:"#fca5a5",fontSize:13,marginBottom:4 }}><div style={{ width:6,height:6,borderRadius:"50%",background:"#ef4444",marginTop:6,flexShrink:0 }}></div>{a}</div>)}
                    </div>
                  )}

                  <div style={card}>
                    <div style={cardH}><span style={{ fontWeight:700,fontSize:13 }}>📅 مسار المتابعة</span></div>
                    <div style={{ padding:16,display:"flex",flexDirection:"column",gap:12 }}>
                      {sel.timeline.map((t,i)=>(
                        <div key={i} style={{ display:"flex",gap:12,alignItems:"flex-start" }}>
                          <div style={{ display:"flex",flexDirection:"column",alignItems:"center" }}>
                            <div style={{ width:30,height:30,borderRadius:"50%",background:"#1f2937",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13 }}>{t.status}</div>
                            {i<sel.timeline.length-1&&<div style={{ width:2,height:20,background:"#1f2937",margin:"4px 0" }}></div>}
                          </div>
                          <div style={{ paddingTop:4 }}><div style={{ color:"#6b7280",fontSize:11,fontWeight:600 }}>اليوم {t.day}</div><div style={{ color:"#f9fafb",fontSize:12,whiteSpace:"pre-line" }}>{t.note}</div></div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ ...card,display:"flex",alignItems:"center",justifyContent:"center",height:300 }}>
                  <div style={{ textAlign:"center" }}><div style={{ fontSize:40,marginBottom:12 }}>👆</div><div style={{ color:"#6b7280" }}>اختر مريضاً لعرض تفاصيله</div></div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* MESSAGES */}
        {tab==="messages" && (
          <div style={card}>
            <div style={cardH}><span style={{ fontWeight:700,fontSize:16 }}>💬 نماذج رسائل المتابعة</span></div>
            <div style={{ padding:20,display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16 }}>
              {[
                {title:"اليوم الأول",tag:"يوم 1",bc:"rgba(59,130,246,.3)",msg:"السلام عليكم [اسم المريض] 🌟\n\nنتمنى لك الشفاء العاجل.\n\nللإجابة على أسئلة متابعتك:\n👇\n[رابط المريض]\n\n⚠️ الطوارئ: 911\n\n— فريق منصة منصة أمان"},
                {title:"اليوم الثالث",tag:"يوم 3",bc:"rgba(13,148,136,.3)",msg:"مرحباً [اسم المريض] 👋\n\nاليوم الثالث — كيف حالك؟\n\nأسئلة المتابعة:\n👇\n[رابط المريض]\n\n— فريق منصة منصة أمان"},
                {title:"تنبيه عاجل",tag:"طارئ 🔴",bc:"rgba(239,68,68,.3)",msg:"عزيزي [اسم المريض] 🚨\n\nلاحظنا عدم ردك.\n\nنرجو الرد فوراً:\n👇\n[رابط المريض]\n\nأو اتصل: 920000000\n\n— فريق منصة منصة أمان"},
              ].map((m,i)=>(
                <div key={i} style={{ border:`1px solid ${m.bc}`,borderRadius:16,padding:16,background:"rgba(255,255,255,.02)" }}>
                  <div style={{ display:"flex",gap:8,alignItems:"center",marginBottom:12 }}><span style={{ fontSize:11,padding:"2px 10px",borderRadius:999,background:"#1f2937",color:"#9ca3af" }}>{m.tag}</span><span style={{ fontWeight:600,fontSize:14 }}>{m.title}</span></div>
                  <div style={{ background:"#1f2937",borderRadius:12,padding:14,fontSize:11,color:"#d1d5db",lineHeight:1.8,whiteSpace:"pre-line",minHeight:160 }}>{m.msg}</div>
                  <button onClick={()=>{navigator.clipboard?.writeText(m.msg);toast_("📋 تم النسخ");}} style={{ ...BTN("#374151"),width:"100%",marginTop:10,fontSize:12,padding:"8px 0" }}>📋 نسخ</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* REPORTS */}
        {tab==="reports" && (
          <div style={card}>
            <div style={{ ...cardH,padding:20 }}><span style={{ fontWeight:700,fontSize:16 }}>📋 تقرير منصة منصة أمان</span></div>
            <div style={{ padding:20 }}>
              <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16,marginBottom:20 }}>
                {[{l:"مرضى مُتابَعون",v:patients.length,icon:"👥"},{l:"مستقرون",v:stats.stable,icon:"✅"},{l:"يحتاجون متابعة",v:stats.warning,icon:"⚠️"},{l:"توفير تقديري",v:`${(patients.length*15).toLocaleString()}k ر`,icon:"💰"}].map((s,i)=>(
                  <div key={i} style={{ background:"#1f2937",borderRadius:14,padding:16 }}><span style={{ fontSize:22 }}>{s.icon}</span><div style={{ fontWeight:700,fontSize:22,marginTop:8 }}>{s.v}</div><div style={{ color:"#6b7280",fontSize:12,marginTop:4 }}>{s.l}</div></div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* ADD MODAL */}
      {showAdd && (
        <div style={OVL}><div style={MDL}>
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20 }}><h3 style={{ margin:0,fontSize:18,fontWeight:700 }}>➕ إضافة مريض جديد</h3><button onClick={()=>{setShowAdd(false);setFormErr("");setForm(EMPTY);}} style={{ background:"none",border:"none",color:"#9ca3af",fontSize:22,cursor:"pointer" }}>✕</button></div>
          {formErr && <div style={{ background:"rgba(239,68,68,.1)",border:"1px solid rgba(239,68,68,.3)",borderRadius:10,padding:"10px 14px",marginBottom:14,color:"#f87171",fontSize:13 }}>⚠️ {formErr}</div>}
          <div style={R2}><div><label style={LBL}>الاسم *</label><input style={INP} placeholder="محمد العتيبي" value={form.name} onChange={e=>fc("name",e.target.value)} /></div><div><label style={LBL}>العمر *</label><input style={INP} type="number" placeholder="45" value={form.age} onChange={e=>fc("age",e.target.value)} /></div></div>
          <div style={R2}><div><label style={LBL}>الجوال *</label><input style={INP} placeholder="05xxxxxxxx" value={form.phone} onChange={e=>fc("phone",e.target.value)} /></div><div><label style={LBL}>الجنس *</label><select style={INP} value={form.gender} onChange={e=>fc("gender",e.target.value)}><option value="ذكر">👨 ذكر</option><option value="أنثى">👩 أنثى</option></select></div></div>
          <div style={R2}><div><label style={LBL}>رقم الهوية</label><input style={INP} placeholder="1xxxxxxxxx" value={form.nationalId} onChange={e=>fc("nationalId",e.target.value)} /></div><div><label style={LBL}>رقم الملف الطبي</label><input style={INP} placeholder="MRN-xxxxx" value={form.fileNo} onChange={e=>fc("fileNo",e.target.value)} /></div></div>
          <div style={R2}><div><label style={LBL}>درجة الخطورة</label><select style={INP} value={form.risk} onChange={e=>fc("risk",e.target.value)}><option value="منخفض">🟢 منخفض</option><option value="متوسط">🟡 متوسط</option><option value="مرتفع">🔴 مرتفع</option></select></div><div></div></div>
          <div style={{ marginBottom:12 }}>
            <label style={LBL}>نوع العملية *</label>
            <select style={INP} value={form.surgery} onChange={e=>fc("surgery",e.target.value)}>
              <option value="">-- اختر --</option>
              {ALL_SURGERIES.map(s=><option key={s} value={s}>{s}</option>)}
            </select>
            {form.surgery==="أخرى" && (
              <input style={{ ...INP, marginTop:8 }} placeholder="اكتب نوع العملية..." value={form.customSurgery} onChange={e=>fc("customSurgery",e.target.value)} />
            )}
          </div>
          <div style={R2}><div><label style={LBL}>القسم *</label><select style={INP} value={DEPTS.includes(form.dept)?form.dept:"أخرى"} onChange={e=>{if(e.target.value!=="أخرى")fc("dept",e.target.value);else fc("dept","");}}><option value="">-- اختر --</option>{DEPTS.map(d=><option key={d} value={d}>{d}</option>)}</select>{(!DEPTS.slice(0,-1).includes(form.dept))&&<input style={{...INP,marginTop:8}} placeholder="اكتب اسم القسم..." value={form.dept==="أخرى"?"":form.dept} onChange={e=>fc("dept",e.target.value)} />}</div><div><label style={LBL}>الطبيب *</label><input style={INP} placeholder="د. سعد الغامدي" value={form.doctor} onChange={e=>fc("doctor",e.target.value)} /></div></div>
          <div style={{ marginBottom:20 }}><label style={LBL}>ملاحظات</label><textarea style={{ ...INP,minHeight:65,resize:"vertical" }} value={form.notes} onChange={e=>fc("notes",e.target.value)} /></div>
          <div style={{ display:"flex",gap:10 }}><button onClick={addPatient} style={{ ...BTN("linear-gradient(135deg,#0d9488,#0891b2)"),flex:1,padding:14,fontSize:15 }}>✅ إضافة المريض</button><button onClick={()=>{setShowAdd(false);setFormErr("");setForm(EMPTY);}} style={{ ...BTN("#374151"),flex:1,padding:14 }}>إلغاء</button></div>
        </div></div>
      )}

      {/* EDIT MODAL */}
      {showEdit && (
        <div style={OVL}><div style={MDL}>
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20 }}><h3 style={{ margin:0,fontSize:18,fontWeight:700 }}>✏️ تعديل ملف المريض</h3><button onClick={()=>setShowEdit(false)} style={{ background:"none",border:"none",color:"#9ca3af",fontSize:22,cursor:"pointer" }}>✕</button></div>
          <div style={R2}><div><label style={LBL}>الاسم</label><input style={INP} value={editForm.name||""} onChange={e=>ef("name",e.target.value)} /></div><div><label style={LBL}>العمر</label><input style={INP} type="number" value={editForm.age||""} onChange={e=>ef("age",e.target.value)} /></div></div>
          <div style={R2}><div><label style={LBL}>الجوال</label><input style={INP} value={editForm.phone||""} onChange={e=>ef("phone",e.target.value)} /></div><div><label style={LBL}>الطبيب</label><input style={INP} value={editForm.doctor||""} onChange={e=>ef("doctor",e.target.value)} /></div></div>
          <div style={R2}><div><label style={LBL}>الجنس</label><select style={INP} value={editForm.gender||"ذكر"} onChange={e=>ef("gender",e.target.value)}><option value="ذكر">👨 ذكر</option><option value="أنثى">👩 أنثى</option></select></div><div></div></div>
          <div style={R2}><div><label style={LBL}>رقم الهوية</label><input style={INP} value={editForm.nationalId||""} onChange={e=>ef("nationalId",e.target.value)} /></div><div><label style={LBL}>رقم الملف الطبي</label><input style={INP} value={editForm.fileNo||""} onChange={e=>ef("fileNo",e.target.value)} /></div></div>
          <div style={R2}><div><label style={LBL}>العملية</label>
            <select style={INP} value={ALL_SURGERIES.includes(editForm.surgery||"")?(editForm.surgery||""):"أخرى"} onChange={e=>{ef("surgery",e.target.value);if(e.target.value!=="أخرى")ef("customSurgery","");}}>
              {ALL_SURGERIES.map(s=><option key={s} value={s}>{s}</option>)}
            </select>
            {!ALL_SURGERIES.slice(0,-1).includes(editForm.surgery||"") && editForm.surgery==="أخرى" && (
              <input style={{ ...INP, marginTop:8 }} placeholder="اكتب نوع العملية..." value={editForm.customSurgery||""} onChange={e=>ef("customSurgery",e.target.value)} />
            )}
          </div><div><label style={LBL}>الخطورة</label><select style={INP} value={editForm.risk||"منخفض"} onChange={e=>ef("risk",e.target.value)}><option value="منخفض">🟢 منخفض</option><option value="متوسط">🟡 متوسط</option><option value="مرتفع">🔴 مرتفع</option></select></div></div>
          <div style={{ fontSize:13,color:"#14b8a6",fontWeight:600,margin:"8px 0" }}>💊 العلامات الحيوية</div>
          <div style={R2}><div><label style={LBL}>الألم (0-10)</label><input style={INP} type="number" min="0" max="10" value={editForm.pain||0} onChange={e=>ef("pain",e.target.value)} /></div><div><label style={LBL}>الحرارة</label><input style={INP} type="number" step="0.1" value={editForm.fever||37} onChange={e=>ef("fever",e.target.value)} /></div></div>
          <div style={R2}><div><label style={LBL}>حالة الجرح</label><input style={INP} value={editForm.wound||""} onChange={e=>ef("wound",e.target.value)} /></div><div><label style={LBL}>الحركة</label><input style={INP} value={editForm.mobility||""} onChange={e=>ef("mobility",e.target.value)} /></div></div>
          <div style={{ marginBottom:20 }}><label style={LBL}>📝 ملاحظة للمسار الزمني</label><textarea style={{ ...INP,minHeight:65,resize:"vertical" }} value={editForm.note||""} onChange={e=>ef("note",e.target.value)} /></div>
          <div style={{ display:"flex",gap:10 }}><button onClick={saveEdit} style={{ ...BTN("linear-gradient(135deg,#0d9488,#0891b2)"),flex:1,padding:14,fontSize:15 }}>✅ حفظ</button><button onClick={()=>setShowEdit(false)} style={{ ...BTN("#374151"),flex:1,padding:14 }}>إلغاء</button></div>
        </div></div>
      )}

      {/* RESPONSES MODAL */}
      {showResp && (
        <div style={OVL}><div style={{ ...MDL,maxWidth:620 }}>
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20 }}>
            <div><h3 style={{ margin:0,fontSize:18,fontWeight:700 }}>📊 إجابات {sel?.name}</h3><div style={{ fontSize:12,color:"#6b7280",marginTop:4 }}>{responses.length} استجابة مسجلة</div></div>
            <button onClick={()=>setShowResp(false)} style={{ background:"none",border:"none",color:"#9ca3af",fontSize:22,cursor:"pointer" }}>✕</button>
          </div>
          {loadingR ? (
            <div style={{ textAlign:"center",padding:40,color:"#6b7280" }}>جاري التحميل...</div>
          ) : responses.length===0 ? (
            <div style={{ textAlign:"center",padding:40 }}>
              <div style={{ fontSize:40,marginBottom:12 }}>📭</div>
              <div style={{ color:"#6b7280",fontSize:14 }}>لا توجد إجابات بعد</div>
              <div style={{ color:"#4b5563",fontSize:12,marginTop:8 }}>أرسل رابط الاستبيان للمريض عبر واتساب</div>
            </div>
          ) : responses.map((r,i)=>(
            <div key={r.id} style={{ background:"#1f2937",borderRadius:14,padding:16,marginBottom:12,border:r.has_alert?"1px solid rgba(245,158,11,.4)":"1px solid transparent" }}>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12 }}>
                <div style={{ fontSize:13,fontWeight:600 }}>استجابة {responses.length-i}</div>
                <div style={{ display:"flex",gap:8,alignItems:"center" }}>
                  {r.has_alert && <span style={{ background:"rgba(245,158,11,.15)",color:"#f59e0b",border:"1px solid rgba(245,158,11,.3)",borderRadius:999,padding:"2px 10px",fontSize:11 }}>⚠️ يستدعي متابعة</span>}
                  <span style={{ color:"#4b5563",fontSize:11 }}>{new Date(r.created_at).toLocaleString("ar-SA")}</span>
                </div>
              </div>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8 }}>
                {Object.entries(r.answers||{}).map(([qId,ans])=>{
                  const allQ = [...GENERAL_Q,...(SURGERY_Q[r.surgery]||SURGERY_Q["أخرى"])];
                  const q = allQ.find(x=>x.id===qId);
                  if (!q) return null;
                  const isAlert = q.alertOn?.includes(ans);
                  return(
                    <div key={qId} style={{ background:"rgba(15,23,42,.5)",borderRadius:10,padding:"8px 12px" }}>
                      <div style={{ color:"#6b7280",fontSize:11,marginBottom:4 }}>{q.text.length>40?q.text.slice(0,40)+"...":q.text}</div>
                      <div style={{ fontWeight:600,fontSize:13,color:isAlert?"#f59e0b":"#2dd4bf" }}>{isAlert?"⚠️ ":""}{ans}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div></div>
      )}

      {/* SEND MODAL */}
      {showSend && (
        <div style={OVL}><div style={{ ...MDL,maxWidth:440 }}>
          <h3 style={{ margin:"0 0 16px",fontSize:17,fontWeight:700 }}>📤 إرسال متابعة جماعية</h3>
          <div style={{ background:"#1f2937",borderRadius:12,padding:14,marginBottom:14 }}>
            <div style={{ color:"#6b7280",fontSize:12,marginBottom:8 }}>المرضى ({patients.length}):</div>
            <div style={{ display:"flex",flexWrap:"wrap",gap:8 }}>{patients.map(p=><span key={p.id} style={{ fontSize:12,padding:"3px 10px",borderRadius:999,color:"#2dd4bf",background:"rgba(20,184,166,.1)",border:"1px solid rgba(20,184,166,.3)" }}>{p.name}</span>)}</div>
          </div>
          <div style={{ display:"flex",gap:10 }}><button onClick={()=>{setShowSend(false);toast_(`✅ تم إرسال رسائل لـ ${patients.length} مرضى`);}} style={{ ...BTN("#0d9488"),flex:1,padding:13 }}>✅ إرسال</button><button onClick={()=>setShowSend(false)} style={{ ...BTN("#374151"),flex:1,padding:13 }}>إلغاء</button></div>
        </div></div>
      )}

      {/* DELETE */}
      {showDel && (
        <div style={OVL}><div style={{ ...MDL,maxWidth:360,textAlign:"center" }}>
          <div style={{ fontSize:40,marginBottom:12 }}>🗑️</div>
          <h3 style={{ margin:"0 0 8px" }}>حذف المريض</h3>
          <p style={{ color:"#9ca3af",fontSize:14,margin:"0 0 20px" }}>هل أنت متأكد من حذف <strong style={{color:"#fff"}}>{sel?.name}</strong>؟</p>
          <div style={{ display:"flex",gap:10 }}><button onClick={deletePatient} style={{ ...BTN("#dc2626"),flex:1,padding:12 }}>نعم</button><button onClick={()=>setShowDel(false)} style={{ ...BTN("#374151"),flex:1,padding:12 }}>إلغاء</button></div>
        </div></div>
      )}

      {/* TOAST */}
      {toast && <div style={{ position:"fixed",bottom:24,left:"50%",transform:"translateX(-50%)",background:"#059669",color:"#fff",padding:"12px 24px",borderRadius:12,boxShadow:"0 8px 30px rgba(0,0,0,.4)",zIndex:1000,fontSize:14,fontWeight:500,whiteSpace:"nowrap" }}>{toast}</div>}

    </div>
  );
}
