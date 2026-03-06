import { useState, useEffect } from "react";
import { T } from "./i18n";

const SB_URL = "https://gemspfmdeyzcgupaognu.supabase.co";
const SB_KEY = "sb_publishable_LR81YxOadOZHZPtbiTOkmg_GIGmrpmv";
const sbFetch = async (path, opts={}) => {
  const r = await fetch(`${SB_URL}/rest/v1${path}`, { headers:{"apikey":SB_KEY,"Authorization":`Bearer ${SB_KEY}`,"Content-Type":"application/json","Prefer":"return=representation",...opts.headers}, ...opts });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
};
const saveResponse = (data) => sbFetch("/responses", { method:"POST", body:JSON.stringify(data) });
const getResponses = (patientId) => sbFetch(`/responses?patient_id=eq.${patientId}&order=created_at.desc`);

const GENERAL_Q = {
  ar: [
    { id:"g1", text:"كيف تصف مستوى الألم؟", options:["لا ألم","ألم خفيف","ألم متوسط","ألم شديد"], alertOn:["ألم شديد"] },
    { id:"g2", text:"هل درجة حرارتك طبيعية؟", options:["نعم طبيعية","أعلى قليلاً","مرتفعة جداً"], alertOn:["مرتفعة جداً"] },
    { id:"g3", text:"هل تتناول أدويتك بانتظام؟", options:["نعم بانتظام","أحياناً","لا"], alertOn:["لا"] },
    { id:"g4", text:"هل تستطيع الأكل والشرب؟", options:["نعم بشكل طبيعي","بصعوبة","لا أستطيع"], alertOn:["لا أستطيع"] },
    { id:"g5", text:"كيف حال الجرح؟", options:["نظيف يلتئم","احمرار خفيف","تورم أو إفرازات"], alertOn:["تورم أو إفرازات"] },
  ],
  en: [
    { id:"g1", text:"How would you describe your pain level?", options:["No pain","Mild pain","Moderate pain","Severe pain"], alertOn:["Severe pain"] },
    { id:"g2", text:"Is your body temperature normal?", options:["Yes, normal","Slightly elevated","Very high"], alertOn:["Very high"] },
    { id:"g3", text:"Are you taking your medications regularly?", options:["Yes, regularly","Sometimes","No"], alertOn:["No"] },
    { id:"g4", text:"Can you eat and drink normally?", options:["Yes, normally","With difficulty","Unable to"], alertOn:["Unable to"] },
    { id:"g5", text:"How is the wound looking?", options:["Clean and healing","Slight redness","Swelling or discharge"], alertOn:["Swelling or discharge"] },
  ]
};

const SURGERY_Q = {
  ar: {
    "استئصال المرارة":[{id:"s1",text:"هل تشعر بألم في الكتف الأيمن؟",options:["لا","نعم خفيف","نعم شديد"],alertOn:["نعم شديد"]},{id:"s2",text:"هل لاحظت اصفراراً في الجلد أو العينين؟",options:["لا","نعم"],alertOn:["نعم"]},{id:"s3",text:"هل رجعت حركة الأمعاء؟",options:["نعم","لا بعد"]}],
    "استئصال الزائدة":[{id:"s1",text:"هل الجرح نظيف؟",options:["نعم","فيه احمرار","فيه إفرازات"],alertOn:["فيه إفرازات"]},{id:"s2",text:"هل الألم في البطن يتحسن؟",options:["نعم يتحسن","نفس","يزداد"],alertOn:["يزداد"]},{id:"s3",text:"هل تستطيع المشي؟",options:["نعم","بصعوبة","لا"]}],
    "استبدال الركبة":[{id:"s1",text:"هل تقوم بتمارين الركبة؟",options:["نعم يومياً","أحياناً","لا"],alertOn:["لا"]},{id:"s2",text:"هل الركبة منتفخة؟",options:["انتفاخ طبيعي","انتفاخ زائد","شديد الانتفاخ"],alertOn:["شديد الانتفاخ"]},{id:"s3",text:"هل تشعر بتنميل في القدم؟",options:["لا","نعم أحياناً","نعم دائماً"],alertOn:["نعم دائماً"]}],
    "استبدال الورك":[{id:"s1",text:"هل تتجنب ثني الورك بشكل مفرط؟",options:["نعم","أحياناً أنسى"],alertOn:["أحياناً أنسى"]},{id:"s2",text:"هل تشعر بألم أو تورم في الساق؟",options:["لا","نعم خفيف","نعم شديد"],alertOn:["نعم شديد"]}],
    "عملية القلب المفتوح":[{id:"s1",text:"هل تشعر بضيق تنفس؟",options:["لا","عند المجهود","في الراحة"],alertOn:["في الراحة"]},{id:"s2",text:"هل نبضك منتظم؟",options:["نعم","أحس بخفقان","غير منتظم"],alertOn:["غير منتظم"]},{id:"s3",text:"هل وزنك زاد فجأة؟",options:["لا","زاد قليلاً","زاد كثيراً"],alertOn:["زاد كثيراً"]}],
    "عملية القيصرية":[{id:"s1",text:"كيف حال الجرح؟",options:["نظيف يلتئم","احمرار","إفرازات أو رائحة"],alertOn:["إفرازات أو رائحة"]},{id:"s2",text:"هل النزيف طبيعي؟",options:["نعم طبيعي","غزير قليلاً","غزير جداً"],alertOn:["غزير جداً"]},{id:"s3",text:"كيف مزاجك العام؟",options:["جيد","متعبة","حزينة جداً"],alertOn:["حزينة جداً"]}],
    "عملية العمود الفقري":[{id:"s1",text:"هل تشعر بضعف أو تنميل في الساقين؟",options:["لا","نعم خفيف","نعم شديد"],alertOn:["نعم شديد"]},{id:"s2",text:"هل الألم أفضل من قبل العملية؟",options:["نعم أفضل","نفس","أسوأ"],alertOn:["أسوأ"]}],
    "عملية الغدة الدرقية":[{id:"s1",text:"هل تشعر بصعوبة في البلع؟",options:["لا","نعم خفيفة","نعم شديدة"],alertOn:["نعم شديدة"]},{id:"s2",text:"هل تشعر بتشنجات في اليدين؟",options:["لا","نعم أحياناً","نعم دائماً"],alertOn:["نعم دائماً"]}],
    "عملية المعدة":[{id:"s1",text:"هل تستطيع شرب السوائل؟",options:["نعم بسهولة","بصعوبة","لا أستطيع"],alertOn:["لا أستطيع"]},{id:"s2",text:"هل تشعر بغثيان مستمر؟",options:["لا","أحياناً","نعم مستمر"],alertOn:["نعم مستمر"]}],
    "عملية الفتق":[{id:"s1",text:"هل تتجنب رفع الأشياء الثقيلة؟",options:["نعم","لا أستطيع تجنبها"],alertOn:["لا أستطيع تجنبها"]},{id:"s2",text:"هل الجرح منتفخ؟",options:["لا","انتفاخ خفيف","انتفاخ شديد"],alertOn:["انتفاخ شديد"]}],
    "استئصال الورم":[{id:"s1",text:"هل الجرح يلتئم؟",options:["نعم جيد","ببطء","لا يلتئم"],alertOn:["لا يلتئم"]},{id:"s2",text:"هل حددت موعد المتابعة؟",options:["نعم","لا بعد"],alertOn:["لا بعد"]}],
    "توسيع الشرايين / القسطرة":[{id:"s1",text:"هل تشعر بضيق صدر؟",options:["لا","نعم خفيف","نعم شديد"],alertOn:["نعم شديد"]},{id:"s2",text:"هل نبضك منتظم؟",options:["نعم","أحس بخفقان","لا"],alertOn:["لا"]}],
    "البروستاتا / المسالك البولية":[{id:"s1",text:"هل تستطيع التبول؟",options:["نعم طبيعي","بصعوبة","لا أستطيع"],alertOn:["لا أستطيع"]},{id:"s2",text:"هل يوجد دم في البول؟",options:["لا","قليل","كثير"],alertOn:["كثير"]}],
    "استئصال كيس مبيضي":[{id:"s1",text:"هل تشعرين بألم في البطن؟",options:["لا","ألم خفيف","ألم شديد"],alertOn:["ألم شديد"]},{id:"s2",text:"هل يوجد نزيف غير طبيعي؟",options:["لا","نعم"],alertOn:["نعم"]}],
    "أخرى":[{id:"s1",text:"كيف تشعر بشكل عام؟",options:["بخير","متعب","سيء جداً"],alertOn:["سيء جداً"]},{id:"s2",text:"هل الجرح يلتئم؟",options:["نعم","ببطء","لا"],alertOn:["لا"]}],
  },
  en: {
    "Cholecystectomy":[{id:"s1",text:"Do you feel pain in the right shoulder?",options:["No","Mild yes","Severe yes"],alertOn:["Severe yes"]},{id:"s2",text:"Have you noticed yellowing of skin or eyes?",options:["No","Yes"],alertOn:["Yes"]},{id:"s3",text:"Has bowel movement returned?",options:["Yes","Not yet"]}],
    "Appendectomy":[{id:"s1",text:"Is the wound clean?",options:["Yes","Some redness","Discharge present"],alertOn:["Discharge present"]},{id:"s2",text:"Is abdominal pain improving?",options:["Yes improving","Same","Getting worse"],alertOn:["Getting worse"]},{id:"s3",text:"Can you walk normally?",options:["Yes","With difficulty","No"]}],
    "Knee Replacement":[{id:"s1",text:"Are you doing your knee exercises?",options:["Yes daily","Sometimes","No"],alertOn:["No"]},{id:"s2",text:"Is the knee swollen?",options:["Normal swelling","Excessive swelling","Very swollen"],alertOn:["Very swollen"]},{id:"s3",text:"Do you feel numbness in the foot?",options:["No","Sometimes","Always"],alertOn:["Always"]}],
    "Hip Replacement":[{id:"s1",text:"Are you avoiding bending the hip excessively?",options:["Yes","Sometimes forget"],alertOn:["Sometimes forget"]},{id:"s2",text:"Do you feel pain or swelling in the leg?",options:["No","Mild","Severe"],alertOn:["Severe"]}],
    "Open Heart Surgery":[{id:"s1",text:"Do you feel shortness of breath?",options:["No","During exertion","At rest"],alertOn:["At rest"]},{id:"s2",text:"Is your heartbeat regular?",options:["Yes","Feel palpitations","Irregular"],alertOn:["Irregular"]},{id:"s3",text:"Has your weight suddenly increased?",options:["No","A little","A lot"],alertOn:["A lot"]}],
    "C-Section":[{id:"s1",text:"How is the wound?",options:["Clean and healing","Redness","Discharge or odor"],alertOn:["Discharge or odor"]},{id:"s2",text:"Is the bleeding normal?",options:["Yes normal","Slightly heavy","Very heavy"],alertOn:["Very heavy"]},{id:"s3",text:"How is your mood?",options:["Good","Tired","Very sad"],alertOn:["Very sad"]}],
    "Spinal Surgery":[{id:"s1",text:"Do you feel weakness or numbness in legs?",options:["No","Mild","Severe"],alertOn:["Severe"]},{id:"s2",text:"Is the pain better than before surgery?",options:["Yes better","Same","Worse"],alertOn:["Worse"]}],
    "Thyroid Surgery":[{id:"s1",text:"Do you have difficulty swallowing?",options:["No","Mild","Severe"],alertOn:["Severe"]},{id:"s2",text:"Do you feel cramps in hands?",options:["No","Sometimes","Always"],alertOn:["Always"]}],
    "Gastric Surgery":[{id:"s1",text:"Can you drink fluids?",options:["Yes easily","With difficulty","Cannot"],alertOn:["Cannot"]},{id:"s2",text:"Do you feel persistent nausea?",options:["No","Sometimes","Yes persistent"],alertOn:["Yes persistent"]}],
    "Hernia Repair":[{id:"s1",text:"Are you avoiding lifting heavy objects?",options:["Yes","Cannot avoid it"],alertOn:["Cannot avoid it"]},{id:"s2",text:"Is the wound swollen?",options:["No","Mild","Severe"],alertOn:["Severe"]}],
    "Tumor Removal":[{id:"s1",text:"Is the wound healing?",options:["Yes well","Slowly","Not healing"],alertOn:["Not healing"]},{id:"s2",text:"Have you scheduled a follow-up?",options:["Yes","Not yet"],alertOn:["Not yet"]}],
    "Angioplasty":[{id:"s1",text:"Do you feel chest tightness?",options:["No","Mild","Severe"],alertOn:["Severe"]},{id:"s2",text:"Is your heartbeat regular?",options:["Yes","Feel palpitations","No"],alertOn:["No"]}],
    "Urology / Prostate":[{id:"s1",text:"Can you urinate normally?",options:["Yes","With difficulty","Cannot"],alertOn:["Cannot"]},{id:"s2",text:"Is there blood in urine?",options:["No","A little","A lot"],alertOn:["A lot"]}],
    "Ovarian Cyst Removal":[{id:"s1",text:"Do you feel abdominal pain?",options:["No","Mild","Severe"],alertOn:["Severe"]},{id:"s2",text:"Is there abnormal bleeding?",options:["No","Yes"],alertOn:["Yes"]}],
    "Other":[{id:"s1",text:"How do you feel overall?",options:["Well","Tired","Very unwell"],alertOn:["Very unwell"]},{id:"s2",text:"Is the wound healing?",options:["Yes","Slowly","No"],alertOn:["No"]}],
  }
};

const SURGERIES_AR = Object.keys(SURGERY_Q.ar);
const SURGERIES_EN = Object.keys(SURGERY_Q.en);
const DEPTS_AR = ["الجراحة العامة","العظام","أمراض النساء","جراحة القلب","المسالك البولية","الجراحة العصبية","أمراض القلب","طب الأطفال","الأنف والأذن والحنجرة","العيون","الجلدية","الطوارئ","العناية المركزة","الباطنية","أخرى"];
const DEPTS_EN = ["General Surgery","Orthopedics","Obstetrics & Gynecology","Cardiac Surgery","Urology","Neurosurgery","Cardiology","Pediatrics","ENT","Ophthalmology","Dermatology","Emergency","ICU","Internal Medicine","Other"];

const DEMO_PATIENTS = [
  { id:"p1", name:"Mohammed Al-Otaibi", age:52, surgery:"Cholecystectomy", day:3, phone:"0501234567", risk:"Medium", doctor:"Dr. Saad Al-Ghamdi", dept:"General Surgery", alerts:["Fever 38.2°C"], status:"Warning", lastResponse:"4 hours ago", vitals:{pain:6,fever:38.2,wound:"Mild swelling",mobility:"Limited"}, timeline:[{day:1,status:"✅",note:"Good condition"},{day:3,status:"⚠️",note:"Elevated fever"}], nationalId:"", fileNo:"", gender:"Male" },
  { id:"p2", name:"Fatima Al-Zahrani", age:38, surgery:"Appendectomy", day:7, phone:"0557654321", risk:"Low", doctor:"Dr. Noura Al-Subaie", dept:"General Surgery", alerts:[], status:"Stable", lastResponse:"1 hour ago", vitals:{pain:2,fever:36.8,wound:"Healing well",mobility:"Normal"}, timeline:[{day:1,status:"✅",note:"Post-op well"},{day:7,status:"✅",note:"Almost normal"}], nationalId:"", fileNo:"", gender:"Female" },
  { id:"p3", name:"Khalid Al-Dosari", age:65, surgery:"Knee Replacement", day:5, phone:"0509876543", risk:"High", doctor:"Dr. Abdullah Al-Mutairi", dept:"Orthopedics", alerts:["No response 12hrs"], status:"Critical", lastResponse:"12 hours ago", vitals:{pain:8,fever:38.9,wound:"Unknown",mobility:"Unknown"}, timeline:[{day:1,status:"✅",note:"Good awakening"},{day:5,status:"🔴",note:"No response"}], nationalId:"", fileNo:"", gender:"Male" },
];

const SC_AR = { "مستقر":{ bg:"rgba(16,185,129,.15)", text:"#10b981", border:"rgba(16,185,129,.3)", dot:"#10b981" }, "تحذير":{ bg:"rgba(245,158,11,.15)", text:"#f59e0b", border:"rgba(245,158,11,.3)", dot:"#f59e0b" }, "خطر":{ bg:"rgba(239,68,68,.15)", text:"#ef4444", border:"rgba(239,68,68,.3)", dot:"#ef4444" }, "جديد":{ bg:"rgba(59,130,246,.15)", text:"#3b82f6", border:"rgba(59,130,246,.3)", dot:"#3b82f6" } };
const SC_EN = { "Stable":{ bg:"rgba(16,185,129,.15)", text:"#10b981", border:"rgba(16,185,129,.3)", dot:"#10b981" }, "Warning":{ bg:"rgba(245,158,11,.15)", text:"#f59e0b", border:"rgba(245,158,11,.3)", dot:"#f59e0b" }, "Critical":{ bg:"rgba(239,68,68,.15)", text:"#ef4444", border:"rgba(239,68,68,.3)", dot:"#ef4444" }, "New":{ bg:"rgba(59,130,246,.15)", text:"#3b82f6", border:"rgba(59,130,246,.3)", dot:"#3b82f6" } };
const RC_AR = { "منخفض":{ color:"#10b981", bg:"rgba(16,185,129,.1)" }, "متوسط":{ color:"#f59e0b", bg:"rgba(245,158,11,.1)" }, "مرتفع":{ color:"#ef4444", bg:"rgba(239,68,68,.1)" } };
const RC_EN = { "Low":{ color:"#10b981", bg:"rgba(16,185,129,.1)" }, "Medium":{ color:"#f59e0b", bg:"rgba(245,158,11,.1)" }, "High":{ color:"#ef4444", bg:"rgba(239,68,68,.1)" } };

const card  = { background:"#111827", borderRadius:16, border:"1px solid #1f2937", overflow:"hidden" };
const cardH = { padding:"16px 20px", borderBottom:"1px solid #1f2937", display:"flex", justifyContent:"space-between", alignItems:"center" };
const OVL   = { position:"fixed", inset:0, background:"rgba(0,0,0,.8)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:500, padding:16 };
const MDL   = { background:"#111827", border:"1px solid #374151", borderRadius:20, padding:24, width:"100%", maxWidth:560, maxHeight:"90vh", overflowY:"auto" };
const INP   = { width:"100%", background:"#1f2937", color:"#f9fafb", fontSize:14, padding:"10px 14px", borderRadius:10, border:"1px solid #374151", outline:"none", boxSizing:"border-box" };
const LBL   = { fontSize:12, color:"#9ca3af", marginBottom:6, display:"block", fontWeight:500 };
const BTN   = (bg) => ({ background:bg, color:"#fff", border:"none", borderRadius:12, padding:"10px 20px", fontSize:14, fontWeight:600, cursor:"pointer" });
const BADGE = (bg,c,b) => ({ display:"inline-flex", alignItems:"center", gap:6, padding:"4px 12px", borderRadius:999, border:`1px solid ${b}`, background:bg, color:c, fontSize:12, fontWeight:500 });
const AV    = { width:40, height:40, borderRadius:12, background:"linear-gradient(135deg,#14b8a6,#0891b2)", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:"bold", fontSize:16, flexShrink:0 };
const R2    = { display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:12 };

function mkEmpty(lang) { return { name:"", age:"", phone:"", surgery:"", dept:"", doctor:"", risk: lang==="ar"?"منخفض":"Low", notes:"", nationalId:"", fileNo:"", gender: lang==="ar"?"ذكر":"Male" }; }

// ─── Patient Survey Page ───────────────────────────────────────
function PatientPage({ patientId }) {
  const [patient, setPatient] = useState(null);
  const [answers, setAnswers] = useState({});
  const [step, setStep]       = useState("loading");
  const [submitting, setSub]  = useState(false);
  const [lang, setLang]       = useState("ar");
  const t = T[lang];

  useEffect(() => {
    const all = (() => { try { const s=localStorage.getItem("pc_v4"); return s?JSON.parse(s):DEMO_PATIENTS; } catch { return DEMO_PATIENTS; } })();
    const p = all.find(x => x.id===patientId || String(x.id)===patientId);
    if (p) { setPatient(p); setStep("questions"); } else setStep("notfound");
  }, [patientId]);

  const gq = GENERAL_Q[lang];
  const sq = patient ? (lang==="ar" ? (SURGERY_Q.ar[patient.surgery]||SURGERY_Q.ar["أخرى"]) : (SURGERY_Q.en[patient.surgery]||SURGERY_Q.en["Other"])) : [];
  const allQ = [...gq, ...sq];
  const answered = Object.keys(answers).length;
  const total = allQ.length;

  const submit = async () => {
    if (answered < total) return;
    setSub(true);
    const hasAlert = allQ.some(q => q.alertOn?.includes(answers[q.id]));
    try { await saveResponse({ patient_id:String(patient.id), patient_name:patient.name, surgery:patient.surgery, answers, has_alert:hasAlert }); } catch(e) {}
    setStep("done"); setSub(false);
  };

  if (step==="loading") return <div style={{ minHeight:"100vh", background:"#030712", display:"flex", alignItems:"center", justifyContent:"center" }}><div style={{ color:"#6b7280" }}>{t.loading}</div></div>;
  if (step==="notfound") return <div style={{ minHeight:"100vh", background:"#030712", display:"flex", alignItems:"center", justifyContent:"center", direction:t.dir }}><div style={{ textAlign:"center", color:"#6b7280" }}><div style={{ fontSize:48, marginBottom:16 }}>❌</div><div style={{ fontSize:18 }}>{t.notFound}</div><div style={{ fontSize:14, marginTop:8 }}>{t.notFoundSub}</div></div></div>;
  if (step==="done") return (
    <div style={{ minHeight:"100vh", background:"#030712", display:"flex", alignItems:"center", justifyContent:"center", direction:t.dir, padding:24 }}>
      <div style={{ textAlign:"center", maxWidth:400 }}>
        <div style={{ fontSize:64, marginBottom:20 }}>✅</div>
        <h2 style={{ color:"#f9fafb", fontSize:22, fontWeight:700, marginBottom:12 }}>{t.doneTitle} {patient?.name}!</h2>
        <p style={{ color:"#9ca3af", fontSize:15, lineHeight:1.8, whiteSpace:"pre-line" }}>{t.doneSub}</p>
        <div style={{ marginTop:24, background:"rgba(13,148,136,.1)", border:"1px solid rgba(20,184,166,.2)", borderRadius:16, padding:16 }}>
          <div style={{ color:"#2dd4bf", fontSize:13 }}>{t.emergency}</div>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", background:"#030712", color:"#f9fafb", fontFamily:"'Segoe UI',Tahoma,Arial,sans-serif", direction:t.dir, paddingBottom:40 }}>
      <div style={{ background:"#111827", borderBottom:"1px solid #1f2937", padding:"16px 24px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ width:36,height:36,borderRadius:10,background:"linear-gradient(135deg,#14b8a6,#0891b2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18 }}>🏥</div>
          <div><div style={{ fontWeight:700, fontSize:15 }}>{t.appName}</div><div style={{ fontSize:11, color:"#6b7280" }}>{t.appSub}</div></div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ background:"#1f2937", borderRadius:10, padding:"6px 14px", fontSize:12, color:"#2dd4bf" }}>{answered}/{total}</div>
          <button onClick={()=>setLang(l=>l==="ar"?"en":"ar")} style={{ ...BTN("#374151"), padding:"6px 14px", fontSize:12 }}>{lang==="ar"?"EN":"عربي"}</button>
        </div>
      </div>
      <div style={{ height:4, background:"#1f2937" }}>
        <div style={{ height:"100%", background:"linear-gradient(90deg,#14b8a6,#0891b2)", width:`${(answered/total)*100}%`, transition:"width .3s" }}></div>
      </div>
      <div style={{ maxWidth:600, margin:"0 auto", padding:"24px 16px" }}>
        <div style={{ background:"linear-gradient(135deg,rgba(13,148,136,.2),rgba(8,145,178,.1))", border:"1px solid rgba(20,184,166,.2)", borderRadius:16, padding:20, marginBottom:24 }}>
          <div style={{ fontSize:16, fontWeight:700, marginBottom:6 }}>{t.greetingPrefix} {patient.name} {t.greetingSuffix}</div>
          <div style={{ fontSize:13, color:"#9ca3af", lineHeight:1.8 }}>{t.patientPageSub} <strong style={{color:"#2dd4bf"}}>{patient.surgery}</strong>.<br/>{t.patientPageInstr}</div>
        </div>

        <div style={{ fontSize:13, color:"#14b8a6", fontWeight:700, marginBottom:12 }}><span style={{ background:"rgba(20,184,166,.15)", padding:"2px 10px", borderRadius:999 }}>{t.generalQ}</span></div>
        {gq.map((q,i) => (
          <div key={q.id} style={{ background:"#111827", border:"1px solid #1f2937", borderRadius:16, padding:18, marginBottom:12 }}>
            <div style={{ fontSize:14, fontWeight:600, marginBottom:14, display:"flex", gap:8 }}>
              <span style={{ background:"#1f2937", color:"#14b8a6", borderRadius:8, padding:"2px 8px", fontSize:12, flexShrink:0 }}>{i+1}</span>{q.text}
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {q.options.map(opt => { const sel=answers[q.id]===opt, isAlert=q.alertOn?.includes(opt); return (
                <button key={opt} onClick={()=>setAnswers(p=>({...p,[q.id]:opt}))}
                  style={{ padding:"11px 16px", borderRadius:12, border:`2px solid ${sel?(isAlert?"#f59e0b":"#14b8a6"):"#1f2937"}`, background:sel?(isAlert?"rgba(245,158,11,.15)":"rgba(20,184,166,.15)"):"#1f2937", color:sel?(isAlert?"#f59e0b":"#2dd4bf"):"#d1d5db", fontSize:14, cursor:"pointer", textAlign:t.dir==="rtl"?"right":"left", fontWeight:sel?600:400 }}>
                  {sel?"✓ ":""}{opt}
                </button>
              ); })}
            </div>
          </div>
        ))}

        <div style={{ fontSize:13, color:"#7c3aed", fontWeight:700, margin:"20px 0 12px" }}><span style={{ background:"rgba(124,58,237,.15)", padding:"2px 10px", borderRadius:999 }}>{t.specificQ} {patient.surgery}</span></div>
        {sq.map((q,i) => (
          <div key={q.id} style={{ background:"#111827", border:`1px solid ${q.alertOn?"rgba(124,58,237,.3)":"#1f2937"}`, borderRadius:16, padding:18, marginBottom:12 }}>
            <div style={{ fontSize:14, fontWeight:600, marginBottom:14, display:"flex", gap:8 }}>
              <span style={{ background:"rgba(124,58,237,.15)", color:"#a78bfa", borderRadius:8, padding:"2px 8px", fontSize:12, flexShrink:0 }}>{gq.length+i+1}</span>{q.text}
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {q.options.map(opt => { const sel=answers[q.id]===opt, isAlert=q.alertOn?.includes(opt); return (
                <button key={opt} onClick={()=>setAnswers(p=>({...p,[q.id]:opt}))}
                  style={{ padding:"11px 16px", borderRadius:12, border:`2px solid ${sel?(isAlert?"#f59e0b":"#7c3aed"):"#1f2937"}`, background:sel?(isAlert?"rgba(245,158,11,.15)":"rgba(124,58,237,.15)"):"#1f2937", color:sel?(isAlert?"#f59e0b":"#a78bfa"):"#d1d5db", fontSize:14, cursor:"pointer", textAlign:t.dir==="rtl"?"right":"left", fontWeight:sel?600:400 }}>
                  {sel?"✓ ":""}{opt}
                </button>
              ); })}
            </div>
          </div>
        ))}

        <div style={{ marginTop:24 }}>
          {answered<total && <div style={{ textAlign:"center", color:"#6b7280", fontSize:13, marginBottom:12 }}>{t.remaining} {total-answered} {t.remainingSuffix}</div>}
          <button onClick={submit} disabled={answered<total||submitting}
            style={{ ...BTN(answered===total?"linear-gradient(135deg,#0d9488,#0891b2)":"#374151"), width:"100%", padding:16, fontSize:16, opacity:answered<total?.5:1 }}>
            {submitting?t.sending:answered===total?t.submitBtn:`${t.answerAll} (${answered}/${total})`}
          </button>
        </div>
        <div style={{ textAlign:"center", marginTop:16, color:"#4b5563", fontSize:12 }}>{t.emergency}</div>
      </div>
    </div>
  );
}

// ─── Main Dashboard ────────────────────────────────────────────
export default function App() {
  const urlParams = new URLSearchParams(window.location.search);
  const patientParam = urlParams.get("patient");
  if (patientParam) return <PatientPage patientId={patientParam} />;

  const [lang,     setLang]     = useState("ar");
  const t = T[lang];
  const SC = lang==="ar" ? SC_AR : SC_EN;
  const RC = lang==="ar" ? RC_AR : RC_EN;
  const SURGERIES = lang==="ar" ? SURGERIES_AR : SURGERIES_EN;
  const DEPTS = lang==="ar" ? DEPTS_AR : DEPTS_EN;
  const STATUSES = lang==="ar" ? ["مستقر","تحذير","خطر","جديد"] : ["Stable","Warning","Critical","New"];

  const [patients, setPatients] = useState(() => { try { const s=localStorage.getItem("pc_v4"); return s?JSON.parse(s):DEMO_PATIENTS; } catch { return DEMO_PATIENTS; } });
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
  const [filt,     setFilt]     = useState(lang==="ar"?"الكل":"All");
  const [form,     setForm]     = useState(()=>mkEmpty(lang));
  const [editForm, setEditForm] = useState({});
  const [formErr,  setFormErr]  = useState("");

  useEffect(() => { try { localStorage.setItem("pc_v4", JSON.stringify(patients)); } catch {} }, [patients]);
  useEffect(() => { setFilt(lang==="ar"?"الكل":"All"); setForm(mkEmpty(lang)); }, [lang]);

  const toast_ = (m) => { setToast(m); setTimeout(()=>setToast(""),3500); };
  const fc = (k,v) => setForm(f=>({...f,[k]:v}));
  const ef = (k,v) => setEditForm(f=>({...f,[k]:v}));

  const statusAll = lang==="ar" ? "الكل" : "All";
  const filterStatuses = [statusAll, ...STATUSES];

  const stats = { total:patients.length, stable:patients.filter(p=>p.status===t.statusStable||p.status==="مستقر"||p.status==="Stable").length, warning:patients.filter(p=>p.status===t.statusWarning||p.status==="تحذير"||p.status==="Warning").length, danger:patients.filter(p=>p.status===t.statusDanger||p.status==="خطر"||p.status==="Critical").length };
  const filtered = patients.filter(p => (p.name.toLowerCase().includes(search.toLowerCase())||p.surgery.toLowerCase().includes(search.toLowerCase())) && (filt===statusAll||p.status===filt));
  const patientLink = (p) => `${window.location.origin}${window.location.pathname}?patient=${p.id}`;

  const sendWhatsApp = (p, day) => {
    const link = patientLink(p);
    const msgs = lang==="ar" ? {
      "يوم1":`السلام عليكم ${p.name} 🌟\n\nنتمنى لك الشفاء العاجل بعد عملية ${p.surgery}.\n\nللإجابة على أسئلة متابعتك، اضغط:\n👇\n${link}\n\n⚠️ الطوارئ: 911\n\n— فريق منصة أمان`,
      "يوم3":`مرحباً ${p.name} 👋\n\nاليوم الثالث بعد عملية ${p.surgery}.\n\nأسئلة المتابعة:\n👇\n${link}\n\n— فريق منصة أمان`,
      "يوم7":`مرحباً ${p.name} 🌟\n\nاليوم السابع — نتمنى تعافيك!\n\nأسئلة المتابعة:\n👇\n${link}\n\n— فريق منصة أمان`,
      "طارئ":`عزيزي ${p.name} 🚨\n\nلاحظنا عدم ردك.\n\nيرجى الإجابة فوراً:\n👇\n${link}\n\nأو اتصل: 920000000\n\n— فريق منصة أمان`,
    } : {
      "Day1":`Hello ${p.name} 🌟\n\nWe hope you're recovering well from your ${p.surgery}.\n\nPlease answer your follow-up questions:\n👇\n${link}\n\n⚠️ Emergency: 911\n\n— Aman Platform Team`,
      "Day3":`Hello ${p.name} 👋\n\nDay 3 after your ${p.surgery}.\n\nFollow-up questions:\n👇\n${link}\n\n— Aman Platform Team`,
      "Day7":`Hello ${p.name} 🌟\n\nDay 7 — hope you're feeling better!\n\nFollow-up questions:\n👇\n${link}\n\n— Aman Platform Team`,
      "Urgent":`Dear ${p.name} 🚨\n\nWe noticed you haven't responded.\n\nPlease respond now:\n👇\n${link}\n\nOr call: 920000000\n\n— Aman Platform Team`,
    };
    const dayKeys = lang==="ar" ? ["يوم1","يوم3","يوم7","طارئ"] : ["Day1","Day3","Day7","Urgent"];
    const msg = msgs[dayKeys[["يوم1","يوم3","يوم7","طارئ","Day1","Day3","Day7","Urgent"].indexOf(day)]] || Object.values(msgs)[0];
    const phone = p.phone.startsWith("0")?"966"+p.phone.slice(1):p.phone;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`,"_blank");
    toast_(t.toastWA);
  };

  const copyLink = (p) => { navigator.clipboard?.writeText(patientLink(p)); toast_(t.toastCopied); };

  const loadResponses = async (p) => {
    setShowResp(true); setLoadingR(true);
    try { const data=await getResponses(String(p.id)); setResponses(data||[]); } catch { setResponses([]); }
    setLoadingR(false);
  };

  const addPatient = () => {
    if (!form.name.trim()) return setFormErr(t.errName);
    if (!form.age||+form.age<1) return setFormErr(t.errAge);
    if (!form.phone.trim()) return setFormErr(t.errPhone);
    if (!form.surgery) return setFormErr(t.errSurgery);
    if (!form.dept) return setFormErr(t.errDept);
    if (!form.doctor.trim()) return setFormErr(t.errDoctor);
    const p = { id:`p${Date.now()}`, name:form.name.trim(), age:+form.age, phone:form.phone.trim(), surgery:form.surgery, dept:form.dept, doctor:form.doctor.trim(), risk:form.risk, day:1, alerts:[], status:t.statusNew, lastResponse:lang==="ar"?"الآن":"Just now", vitals:{pain:0,fever:37.0,wound:lang==="ar"?"لم يُقيَّم":"Not assessed",mobility:lang==="ar"?"لم تُقيَّم":"Not assessed"}, timeline:[{day:1,status:"🆕",note:form.notes.trim()||(lang==="ar"?"تم الإدخال — بدء المتابعة":"Patient added — monitoring started")}], nationalId:form.nationalId.trim(), fileNo:form.fileNo.trim(), gender:form.gender };
    setPatients(prev=>[p,...prev]); setForm(mkEmpty(lang)); setFormErr(""); setShowAdd(false);
    toast_(`${t.toastAdded} ${p.name}`); setSel(p); setTab("patients");
  };

  const openEdit = () => { setEditForm({name:sel.name,age:sel.age,phone:sel.phone,surgery:sel.surgery,dept:sel.dept,doctor:sel.doctor,risk:sel.risk,pain:sel.vitals.pain,fever:sel.vitals.fever,wound:sel.vitals.wound,mobility:sel.vitals.mobility,note:"",nationalId:sel.nationalId||"",fileNo:sel.fileNo||"",gender:sel.gender||(lang==="ar"?"ذكر":"Male")}); setShowEdit(true); };
  const saveEdit = () => {
    const updated = {...sel,name:editForm.name,age:+editForm.age,phone:editForm.phone,surgery:editForm.surgery,dept:editForm.dept,doctor:editForm.doctor,risk:editForm.risk,nationalId:editForm.nationalId,fileNo:editForm.fileNo,gender:editForm.gender,vitals:{pain:+editForm.pain,fever:+editForm.fever,wound:editForm.wound,mobility:editForm.mobility},timeline:editForm.note?.trim()?[...sel.timeline,{day:sel.day,status:"📝",note:editForm.note.trim()}]:sel.timeline};
    setPatients(prev=>prev.map(p=>p.id===sel.id?updated:p)); setSel(updated); setShowEdit(false); toast_(t.toastUpdated);
  };
  const deletePatient = () => { setPatients(prev=>prev.filter(p=>p.id!==sel.id)); setSel(null); setShowDel(false); toast_(t.toastDeleted); };
  const updateStatus = (s) => { setPatients(prev=>prev.map(p=>p.id===sel.id?{...p,status:s}:p)); setSel(prev=>({...prev,status:s})); toast_(`${t.toastStatus} ${s}`); };

  const whatsappDays = lang==="ar"
    ? [{l:t.day1,k:"يوم1",bg:"#1d4ed8"},{l:t.day3,k:"يوم3",bg:"#0d9488"},{l:t.day7,k:"يوم7",bg:"#7c3aed"},{l:t.urgent,k:"طارئ",bg:"#dc2626"}]
    : [{l:t.day1,k:"Day1",bg:"#1d4ed8"},{l:t.day3,k:"Day3",bg:"#0d9488"},{l:t.day7,k:"Day7",bg:"#7c3aed"},{l:t.urgent,k:"Urgent",bg:"#dc2626"}];

  return (
    <div style={{ minHeight:"100vh", background:"#030712", color:"#f9fafb", fontFamily:"'Segoe UI',Tahoma,Arial,sans-serif", direction:t.dir }}>

      {/* HEADER */}
      <div style={{ background:"#111827", borderBottom:"1px solid #1f2937", padding:"14px 24px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ width:40,height:40,borderRadius:12,background:"linear-gradient(135deg,#14b8a6,#0891b2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20 }}>🏥</div>
          <div><div style={{ fontWeight:700,fontSize:16 }}>{t.appName}</div><div style={{ fontSize:11,color:"#6b7280" }}>{t.appSub}</div></div>
        </div>
        <div style={{ display:"flex",alignItems:"center",gap:12 }}>
          {/* Language Toggle */}
          <button onClick={()=>setLang(l=>l==="ar"?"en":"ar")}
            style={{ display:"flex",alignItems:"center",gap:8,background:"#1f2937",border:"1px solid #374151",borderRadius:10,padding:"6px 14px",cursor:"pointer",color:"#f9fafb",fontSize:13,fontWeight:600 }}>
            <span style={{ fontSize:16 }}>{lang==="ar"?"🇬🇧":"🇸🇦"}</span>
            {lang==="ar"?"English":"عربي"}
          </button>
          <button onClick={()=>setShowAdd(true)} style={{ ...BTN("linear-gradient(135deg,#0d9488,#0891b2)"),padding:"8px 18px",fontSize:13 }}>{t.addPatient}</button>
          <div style={{ display:"flex",alignItems:"center",gap:6,background:"#1f2937",borderRadius:10,padding:"6px 12px" }}><div style={{ width:8,height:8,borderRadius:"50%",background:"#10b981" }}></div><span style={{ fontSize:11,color:"#6b7280" }}>{t.initiative}</span></div>
        </div>
      </div>

      {/* NAV */}
      <div style={{ background:"#111827", borderBottom:"1px solid #1f2937", padding:"0 24px", display:"flex", gap:4 }}>
        {[["dashboard",t.dashboard],["patients",t.patients],["messages",t.messages],["reports",t.reports]].map(([tv,l])=>(
          <button key={tv} onClick={()=>setTab(tv)} style={{ padding:"12px 20px",fontSize:14,fontWeight:500,border:"none",borderBottom:tab===tv?"2px solid #14b8a6":"2px solid transparent",color:tab===tv?"#14b8a6":"#9ca3af",background:"transparent",cursor:"pointer" }}>{l}</button>
        ))}
      </div>

      <div style={{ padding:24, maxWidth:1200, margin:"0 auto" }}>

        {/* STATS */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:24 }}>
          {[{label:t.totalPatients,v:stats.total,icon:"👥",g:"#1d4ed8,#1e40af",sub:t.active},{label:t.stable,v:stats.stable,icon:"✅",g:"#059669,#047857",sub:t.goodCondition},{label:t.needFollowup,v:stats.warning,icon:"⚠️",g:"#d97706,#b45309",sub:t.alerts},{label:t.critical,v:stats.danger,icon:"🚨",g:"#dc2626,#b91c1c",sub:t.urgentAction}].map((s,i)=>(
            <div key={i} style={{ background:`linear-gradient(135deg,${s.g})`,borderRadius:16,padding:20 }}>
              <div style={{ display:"flex",justifyContent:"space-between",marginBottom:10 }}><span style={{ fontSize:26 }}>{s.icon}</span><span style={{ fontSize:34,fontWeight:700 }}>{s.v}</span></div>
              <div style={{ fontWeight:600,fontSize:13 }}>{s.label}</div>
              <div style={{ fontSize:11,color:"rgba(255,255,255,.55)",marginTop:4 }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {stats.danger>0 && (
          <div style={{ background:"rgba(239,68,68,.1)",border:"1px solid rgba(239,68,68,.2)",borderRadius:12,padding:16,marginBottom:24,display:"flex",alignItems:"center",gap:12 }}>
            <span style={{ fontSize:22 }}>🚨</span>
            <div style={{ flex:1 }}><div style={{ color:"#f87171",fontWeight:600,fontSize:13 }}>{t.urgentBanner}</div></div>
            <button onClick={()=>{setFilt(t.statusDanger);setTab("patients");}} style={{ ...BTN("#dc2626"),padding:"8px 16px",fontSize:13 }}>{t.viewCases}</button>
          </div>
        )}

        {/* DASHBOARD */}
        {tab==="dashboard" && (
          <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:24 }}>
            <div style={card}>
              <div style={cardH}><span style={{ fontWeight:700 }}>{t.patients} ({patients.length})</span><button onClick={()=>setShowAdd(true)} style={{ ...BTN("#0d9488"),padding:"6px 14px",fontSize:12 }}>➕</button></div>
              {patients.length===0 ? (
                <div style={{ padding:48,textAlign:"center",color:"#4b5563" }}><div style={{ fontSize:44,marginBottom:12 }}>🏥</div><div style={{ fontSize:14,marginBottom:16 }}>{t.noPatients}</div><button onClick={()=>setShowAdd(true)} style={{ ...BTN("#0d9488"),padding:"10px 28px" }}>{t.addFirst}</button></div>
              ) : patients.map(p=>{ const sc=SC[p.status]||SC_EN["Stable"]; return (
                <div key={p.id} onClick={()=>{setSel(p);setTab("patients");}} style={{ padding:"14px 20px",borderBottom:"1px solid #1f2937",cursor:"pointer",display:"flex",alignItems:"center",gap:12 }} onMouseEnter={e=>e.currentTarget.style.background="#1f2937"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  <div style={AV}>{p.name[0]}</div>
                  <div style={{ flex:1 }}><div style={{ fontWeight:600,fontSize:14 }}>{p.name}</div><div style={{ color:"#6b7280",fontSize:12 }}>{p.surgery} • {t.day} {p.day} • {p.doctor}</div></div>
                  <div style={BADGE(sc.bg,sc.text,sc.border)}><div style={{ width:8,height:8,borderRadius:"50%",background:sc.dot }}></div>{p.status}</div>
                </div>
              );})}
            </div>
            <div style={{ display:"flex",flexDirection:"column",gap:16 }}>
              <div style={card}>
                <div style={cardH}><span style={{ fontWeight:700,fontSize:14 }}>{t.quickActions}</span></div>
                <div style={{ padding:16,display:"flex",flexDirection:"column",gap:8 }}>
                  {[{l:t.addPatientBtn,bg:"linear-gradient(135deg,#0d9488,#0891b2)",a:()=>setShowAdd(true)},{l:t.bulkSend,bg:"#7c3aed",a:()=>setShowSend(true)},{l:t.monthReport,bg:"#1d4ed8",a:()=>setTab("reports")}].map((a,i)=>(
                    <button key={i} onClick={a.a} style={{ ...BTN(a.bg),background:a.bg,width:"100%",padding:11 }} onMouseEnter={e=>e.currentTarget.style.opacity=".85"} onMouseLeave={e=>e.currentTarget.style.opacity="1"}>{a.l}</button>
                  ))}
                </div>
              </div>
              <div style={{ background:"rgba(13,148,136,.08)",border:"1px solid rgba(20,184,166,.2)",borderRadius:16,padding:16 }}>
                <div style={{ color:"#2dd4bf",fontWeight:700,fontSize:13,marginBottom:12 }}>{t.statsTitle}</div>
                <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10 }}>
                  {[{l:t.totalLabel,v:patients.length},{l:t.stabilityLabel,v:`${patients.length?Math.round((stats.stable/patients.length)*100):0}%`},{l:t.criticalLabel,v:stats.danger},{l:t.savingsLabel,v:`${(patients.length*15).toLocaleString()}k`}].map((s,i)=>(
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
                <input style={{ ...INP,marginBottom:10 }} placeholder={t.search} value={search} onChange={e=>setSearch(e.target.value)} />
                <div style={{ display:"flex",gap:6,flexWrap:"wrap" }}>
                  {filterStatuses.map(f=><button key={f} onClick={()=>setFilt(f)} style={{ fontSize:11,padding:"3px 10px",borderRadius:999,border:"none",cursor:"pointer",background:filt===f?"#0d9488":"#1f2937",color:filt===f?"#fff":"#9ca3af" }}>{f}</button>)}
                </div>
              </div>
              <div style={{ overflowY:"auto",maxHeight:500 }}>
                {filtered.length===0 ? <div style={{ padding:30,textAlign:"center",color:"#4b5563",fontSize:13 }}>{t.noResults}</div>
                : filtered.map(p=>{ const sc=SC[p.status]||SC_EN["Stable"],isSel=sel?.id===p.id; return (
                  <div key={p.id} onClick={()=>setSel(p)} style={{ padding:"12px 14px",borderBottom:"1px solid #1f2937",cursor:"pointer",background:isSel?"rgba(13,148,136,.1)":"transparent",borderRight:t.dir==="rtl"&&isSel?"3px solid #14b8a6":"none",borderLeft:t.dir==="ltr"&&isSel?"3px solid #14b8a6":"none",display:"flex",alignItems:"center",gap:10 }} onMouseEnter={e=>{if(!isSel)e.currentTarget.style.background="#1f2937";}} onMouseLeave={e=>{e.currentTarget.style.background=isSel?"rgba(13,148,136,.1)":"transparent";}}>
                    <div style={{ ...AV,width:34,height:34,fontSize:13 }}>{p.name[0]}</div>
                    <div style={{ flex:1,overflow:"hidden" }}><div style={{ fontWeight:600,fontSize:13,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis" }}>{p.name}</div><div style={{ color:"#6b7280",fontSize:11 }}>{p.surgery}</div></div>
                    <div style={{ width:8,height:8,borderRadius:"50%",background:sc.dot,flexShrink:0 }}></div>
                  </div>
                );})}
              </div>
              <div style={{ padding:14,borderTop:"1px solid #1f2937" }}><button onClick={()=>setShowAdd(true)} style={{ ...BTN("linear-gradient(135deg,#0d9488,#0891b2)"),width:"100%",padding:10,fontSize:13 }}>{t.addPatient}</button></div>
            </div>

            <div>
              {sel ? (
                <div style={{ display:"flex",flexDirection:"column",gap:16 }}>
                  <div style={card}>
                    <div style={{ padding:20 }}>
                      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16 }}>
                        <div style={{ display:"flex",alignItems:"center",gap:14 }}>
                          <div style={{ ...AV,width:52,height:52,fontSize:22,borderRadius:16 }}>{sel.name[0]}</div>
                          <div>
                            <div style={{ fontWeight:700,fontSize:18 }}>{sel.name}</div>
                            <div style={{ color:"#9ca3af",fontSize:13 }}>{sel.age} {t.years} • {sel.surgery}</div>
                            <div style={{ color:"#6b7280",fontSize:11 }}>{sel.doctor} — {sel.dept}</div>
                            <div style={{ color:"#6b7280",fontSize:11 }}>📱 {sel.phone}</div>
                            {sel.nationalId&&<div style={{ color:"#6b7280",fontSize:11 }}>🪪 {sel.nationalId}</div>}
                            {sel.fileNo&&<div style={{ color:"#6b7280",fontSize:11 }}>📁 {sel.fileNo}</div>}
                            {sel.gender&&<div style={{ color:"#6b7280",fontSize:11 }}>👤 {sel.gender}</div>}
                          </div>
                        </div>
                        <div style={{ display:"flex",flexDirection:"column",alignItems:"flex-end",gap:8 }}>
                          {SC[sel.status] && <div style={BADGE(SC[sel.status].bg,SC[sel.status].text,SC[sel.status].border)}><div style={{ width:8,height:8,borderRadius:"50%",background:SC[sel.status].dot }}></div>{sel.status}</div>}
                          {RC[sel.risk] && <span style={{ fontSize:11,padding:"2px 10px",borderRadius:999,color:RC[sel.risk].color,background:RC[sel.risk].bg }}>{t.riskLevel}: {sel.risk}</span>}
                        </div>
                      </div>
                      {/* vitals */}
                      <div style={{ display:"flex",gap:10,marginBottom:16 }}>
                        {[{l:t.pain,v:`${sel.vitals.pain}/10`,icon:"😣",c:sel.vitals.pain>6?"#ef4444":"#f59e0b"},{l:t.fever,v:`${sel.vitals.fever}°`,icon:"🌡️",c:sel.vitals.fever>38?"#ef4444":"#10b981"},{l:t.wound,v:sel.vitals.wound,icon:"🩹",c:"#3b82f6"},{l:t.mobility,v:sel.vitals.mobility,icon:"🚶",c:"#8b5cf6"}].map((v,i)=>(
                          <div key={i} style={{ background:"#1f2937",borderRadius:12,padding:12,textAlign:"center",flex:1 }}><div style={{ fontSize:18 }}>{v.icon}</div><div style={{ fontWeight:700,fontSize:11,color:v.c,margin:"4px 0" }}>{v.v}</div><div style={{ color:"#4b5563",fontSize:10 }}>{v.l}</div></div>
                        ))}
                      </div>
                      {/* link */}
                      <div style={{ background:"rgba(20,184,166,.08)",border:"1px solid rgba(20,184,166,.2)",borderRadius:12,padding:14,marginBottom:14 }}>
                        <div style={{ fontSize:12,color:"#2dd4bf",fontWeight:600,marginBottom:8 }}>{t.patientLink}</div>
                        <div style={{ fontSize:11,color:"#6b7280",background:"#1f2937",borderRadius:8,padding:"8px 12px",marginBottom:10,wordBreak:"break-all" }}>{patientLink(sel)}</div>
                        <button onClick={()=>copyLink(sel)} style={{ ...BTN("#0d9488"),padding:"7px 16px",fontSize:12 }}>{t.copyLink}</button>
                      </div>
                      {/* whatsapp */}
                      <div style={{ borderTop:"1px solid #1f2937",paddingTop:14,marginBottom:14 }}>
                        <div style={{ fontSize:12,color:"#6b7280",marginBottom:8 }}>{t.sendWhatsapp}</div>
                        <div style={{ display:"flex",gap:8,flexWrap:"wrap" }}>
                          {whatsappDays.map((m,i)=><button key={i} onClick={()=>sendWhatsApp(sel,m.k)} style={{ ...BTN(m.bg),padding:"7px 14px",fontSize:12 }}>💬 {m.l}</button>)}
                        </div>
                      </div>
                      {/* responses */}
                      <div style={{ borderTop:"1px solid #1f2937",paddingTop:14,marginBottom:14 }}>
                        <button onClick={()=>loadResponses(sel)} style={{ ...BTN("linear-gradient(135deg,#7c3aed,#6d28d9)"),padding:"8px 18px",fontSize:13 }}>{t.viewResponses}</button>
                      </div>
                      {/* status */}
                      <div style={{ borderTop:"1px solid #1f2937",paddingTop:14 }}>
                        <div style={{ fontSize:12,color:"#6b7280",marginBottom:8 }}>{t.updateStatus}</div>
                        <div style={{ display:"flex",gap:8,flexWrap:"wrap" }}>
                          {STATUSES.map(s=>SC[s]&&<button key={s} onClick={()=>updateStatus(s)} style={{ ...BADGE(SC[s].bg,SC[s].text,SC[s].border),cursor:"pointer",outline:sel.status===s?`2px solid ${SC[s].text}`:"none",padding:"6px 14px" }}>{s}</button>)}
                          <button onClick={openEdit} style={{ background:"rgba(59,130,246,.1)",border:"1px solid rgba(59,130,246,.3)",color:"#60a5fa",borderRadius:999,padding:"6px 14px",fontSize:12,cursor:"pointer" }}>{t.edit}</button>
                          <button onClick={()=>setShowDel(true)} style={{ marginRight:t.dir==="rtl"?"auto":"0",marginLeft:t.dir==="ltr"?"auto":"0",background:"rgba(239,68,68,.1)",border:"1px solid rgba(239,68,68,.3)",color:"#f87171",borderRadius:999,padding:"6px 14px",fontSize:12,cursor:"pointer" }}>{t.delete}</button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div style={card}>
                    <div style={cardH}><span style={{ fontWeight:700,fontSize:13 }}>{t.timeline}</span></div>
                    <div style={{ padding:16,display:"flex",flexDirection:"column",gap:12 }}>
                      {sel.timeline.map((tl,i)=>(
                        <div key={i} style={{ display:"flex",gap:12,alignItems:"flex-start" }}>
                          <div style={{ display:"flex",flexDirection:"column",alignItems:"center" }}>
                            <div style={{ width:30,height:30,borderRadius:"50%",background:"#1f2937",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13 }}>{tl.status}</div>
                            {i<sel.timeline.length-1&&<div style={{ width:2,height:20,background:"#1f2937",margin:"4px 0" }}></div>}
                          </div>
                          <div style={{ paddingTop:4 }}><div style={{ color:"#6b7280",fontSize:11,fontWeight:600 }}>{t.day} {tl.day}</div><div style={{ color:"#f9fafb",fontSize:12,whiteSpace:"pre-line" }}>{tl.note}</div></div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ ...card,display:"flex",alignItems:"center",justifyContent:"center",height:300 }}>
                  <div style={{ textAlign:"center" }}><div style={{ fontSize:40,marginBottom:12 }}>👆</div><div style={{ color:"#6b7280" }}>{t.selectPatient}</div></div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* REPORTS */}
        {tab==="reports" && (
          <div style={card}>
            <div style={{ ...cardH,padding:20 }}><span style={{ fontWeight:700,fontSize:16 }}>{t.reportTitle}</span><span style={{ fontSize:11,padding:"2px 10px",borderRadius:999,background:"#1f2937",color:"#9ca3af" }}>{t.reportMonth}</span></div>
            <div style={{ padding:20 }}>
              <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16,marginBottom:20 }}>
                {[{l:t.followed,v:patients.length,icon:"👥"},{l:t.stableReport,v:stats.stable,icon:"✅"},{l:t.needFollowReport,v:stats.warning,icon:"⚠️"},{l:t.savings,v:`${(patients.length*15).toLocaleString()}k`,icon:"💰"}].map((s,i)=>(
                  <div key={i} style={{ background:"#1f2937",borderRadius:14,padding:16 }}><span style={{ fontSize:22 }}>{s.icon}</span><div style={{ fontWeight:700,fontSize:22,marginTop:8 }}>{s.v}</div><div style={{ color:"#6b7280",fontSize:12,marginTop:4 }}>{s.l}</div></div>
                ))}
              </div>
              <div style={{ background:"rgba(13,148,136,.08)",border:"1px solid rgba(20,184,166,.2)",borderRadius:14,padding:16 }}>
                <div style={{ color:"#2dd4bf",fontWeight:600,fontSize:14,marginBottom:8 }}>{t.impactTitle}</div>
                <p style={{ color:"#d1d5db",fontSize:13,lineHeight:1.8,margin:0 }}>
                  {t.impactText1} <strong style={{color:"#fff"}}>{patients.length}</strong> {t.impactText2} <strong style={{color:"#10b981"}}>{stats.stable}</strong> {t.impactText3} <strong style={{color:"#fff"}}>{(patients.length*15).toLocaleString()}</strong> {t.impactText4}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* MESSAGES */}
        {tab==="messages" && (
          <div style={card}>
            <div style={cardH}><span style={{ fontWeight:700,fontSize:16 }}>{t.messages}</span></div>
            <div style={{ padding:20,display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16 }}>
              {(lang==="ar" ? [
                {title:"اليوم الأول",tag:"يوم 1",bc:"rgba(59,130,246,.3)",msg:"السلام عليكم [اسم المريض] 🌟\n\nنتمنى لك الشفاء العاجل.\n\nأسئلة المتابعة:\n👇\n[رابط المريض]\n\n⚠️ الطوارئ: 911\n\n— فريق منصة أمان"},
                {title:"اليوم الثالث",tag:"يوم 3",bc:"rgba(13,148,136,.3)",msg:"مرحباً [اسم المريض] 👋\n\nاليوم الثالث — كيف حالك؟\n\nأسئلة المتابعة:\n👇\n[رابط المريض]\n\n— فريق منصة أمان"},
                {title:"تنبيه عاجل",tag:"طارئ 🔴",bc:"rgba(239,68,68,.3)",msg:"عزيزي [اسم المريض] 🚨\n\nلاحظنا عدم ردك.\n\nنرجو الرد فوراً:\n👇\n[رابط المريض]\n\nأو اتصل: 920000000\n\n— فريق منصة أمان"},
              ] : [
                {title:"Day 1",tag:"Day 1",bc:"rgba(59,130,246,.3)",msg:"Hello [Patient Name] 🌟\n\nWe hope you're recovering well.\n\nPlease answer follow-up questions:\n👇\n[Patient Link]\n\n⚠️ Emergency: 911\n\n— Aman Platform Team"},
                {title:"Day 3",tag:"Day 3",bc:"rgba(13,148,136,.3)",msg:"Hello [Patient Name] 👋\n\nDay 3 — how are you feeling?\n\nFollow-up questions:\n👇\n[Patient Link]\n\n— Aman Platform Team"},
                {title:"Urgent Alert",tag:"Urgent 🔴",bc:"rgba(239,68,68,.3)",msg:"Dear [Patient Name] 🚨\n\nWe noticed you haven't responded.\n\nPlease respond now:\n👇\n[Patient Link]\n\nOr call: 920000000\n\n— Aman Platform Team"},
              ]).map((m,i)=>(
                <div key={i} style={{ border:`1px solid ${m.bc}`,borderRadius:16,padding:16,background:"rgba(255,255,255,.02)" }}>
                  <div style={{ display:"flex",gap:8,alignItems:"center",marginBottom:12 }}><span style={{ fontSize:11,padding:"2px 10px",borderRadius:999,background:"#1f2937",color:"#9ca3af" }}>{m.tag}</span><span style={{ fontWeight:600,fontSize:14 }}>{m.title}</span></div>
                  <div style={{ background:"#1f2937",borderRadius:12,padding:14,fontSize:11,color:"#d1d5db",lineHeight:1.8,whiteSpace:"pre-line",minHeight:160 }}>{m.msg}</div>
                  <button onClick={()=>{navigator.clipboard?.writeText(m.msg);toast_(lang==="ar"?"📋 تم النسخ":"📋 Copied");}} style={{ ...BTN("#374151"),width:"100%",marginTop:10,fontSize:12,padding:"8px 0" }}>📋 {lang==="ar"?"نسخ":"Copy"}</button>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* ADD MODAL */}
      {showAdd && (
        <div style={OVL}><div style={MDL}>
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20 }}><h3 style={{ margin:0,fontSize:18,fontWeight:700 }}>{t.addTitle}</h3><button onClick={()=>{setShowAdd(false);setFormErr("");setForm(mkEmpty(lang));}} style={{ background:"none",border:"none",color:"#9ca3af",fontSize:22,cursor:"pointer" }}>✕</button></div>
          {formErr&&<div style={{ background:"rgba(239,68,68,.1)",border:"1px solid rgba(239,68,68,.3)",borderRadius:10,padding:"10px 14px",marginBottom:14,color:"#f87171",fontSize:13 }}>⚠️ {formErr}</div>}
          <div style={R2}><div><label style={LBL}>{t.nameLabel}</label><input style={INP} value={form.name} onChange={e=>fc("name",e.target.value)} /></div><div><label style={LBL}>{t.ageLabel}</label><input style={INP} type="number" value={form.age} onChange={e=>fc("age",e.target.value)} /></div></div>
          <div style={R2}><div><label style={LBL}>{t.phoneLabel}</label><input style={INP} placeholder="05xxxxxxxx" value={form.phone} onChange={e=>fc("phone",e.target.value)} /></div><div><label style={LBL}>{t.genderLabel}</label><select style={INP} value={form.gender} onChange={e=>fc("gender",e.target.value)}><option value={lang==="ar"?"ذكر":"Male"}>{t.male}</option><option value={lang==="ar"?"أنثى":"Female"}>{t.female}</option></select></div></div>
          <div style={R2}><div><label style={LBL}>{t.nationalIdLabel}</label><input style={INP} value={form.nationalId} onChange={e=>fc("nationalId",e.target.value)} /></div><div><label style={LBL}>{t.fileNoLabel}</label><input style={INP} value={form.fileNo} onChange={e=>fc("fileNo",e.target.value)} /></div></div>
          <div style={{ marginBottom:12 }}><label style={LBL}>{t.surgeryLabel}</label><select style={INP} value={form.surgery} onChange={e=>fc("surgery",e.target.value)}><option value="">{t.chooseOption}</option>{SURGERIES.map(s=><option key={s} value={s}>{s}</option>)}</select></div>
          <div style={R2}>
            <div><label style={LBL}>{t.deptLabel}</label><select style={INP} value={DEPTS.slice(0,-1).includes(form.dept)?form.dept:DEPTS[DEPTS.length-1]} onChange={e=>{if(e.target.value!==DEPTS[DEPTS.length-1])fc("dept",e.target.value);else fc("dept","");}}><option value="">{t.chooseOption}</option>{DEPTS.map(d=><option key={d} value={d}>{d}</option>)}</select>{!DEPTS.slice(0,-1).includes(form.dept)&&<input style={{...INP,marginTop:8}} placeholder={t.customDept} value={form.dept===DEPTS[DEPTS.length-1]?"":form.dept} onChange={e=>fc("dept",e.target.value)} />}</div>
            <div><label style={LBL}>{t.doctorLabel}</label><input style={INP} value={form.doctor} onChange={e=>fc("doctor",e.target.value)} /></div>
          </div>
          <div style={{ marginBottom:12 }}><label style={LBL}>{t.riskLabel}</label><select style={INP} value={form.risk} onChange={e=>fc("risk",e.target.value)}>{(lang==="ar"?[["منخفض",t.riskLow],["متوسط",t.riskMed],["مرتفع",t.riskHigh]]:[["Low",t.riskLow],["Medium",t.riskMed],["High",t.riskHigh]]).map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></div>
          <div style={{ marginBottom:20 }}><label style={LBL}>{t.notesLabel}</label><textarea style={{ ...INP,minHeight:65,resize:"vertical" }} value={form.notes} onChange={e=>fc("notes",e.target.value)} /></div>
          <div style={{ display:"flex",gap:10 }}><button onClick={addPatient} style={{ ...BTN("linear-gradient(135deg,#0d9488,#0891b2)"),flex:1,padding:14,fontSize:15 }}>{t.addBtn}</button><button onClick={()=>{setShowAdd(false);setFormErr("");setForm(mkEmpty(lang));}} style={{ ...BTN("#374151"),flex:1,padding:14 }}>{t.cancel}</button></div>
        </div></div>
      )}

      {/* EDIT MODAL */}
      {showEdit && (
        <div style={OVL}><div style={MDL}>
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20 }}><h3 style={{ margin:0,fontSize:18,fontWeight:700 }}>{t.editTitle}</h3><button onClick={()=>setShowEdit(false)} style={{ background:"none",border:"none",color:"#9ca3af",fontSize:22,cursor:"pointer" }}>✕</button></div>
          <div style={{ fontSize:13,color:"#14b8a6",fontWeight:600,marginBottom:10 }}>{t.basicInfo}</div>
          <div style={R2}><div><label style={LBL}>{t.nameLabel}</label><input style={INP} value={editForm.name||""} onChange={e=>ef("name",e.target.value)} /></div><div><label style={LBL}>{t.ageLabel}</label><input style={INP} type="number" value={editForm.age||""} onChange={e=>ef("age",e.target.value)} /></div></div>
          <div style={R2}><div><label style={LBL}>{t.phoneLabel}</label><input style={INP} value={editForm.phone||""} onChange={e=>ef("phone",e.target.value)} /></div><div><label style={LBL}>{t.doctorLabel}</label><input style={INP} value={editForm.doctor||""} onChange={e=>ef("doctor",e.target.value)} /></div></div>
          <div style={R2}><div><label style={LBL}>{t.genderLabel}</label><select style={INP} value={editForm.gender||(lang==="ar"?"ذكر":"Male")} onChange={e=>ef("gender",e.target.value)}><option value={lang==="ar"?"ذكر":"Male"}>{t.male}</option><option value={lang==="ar"?"أنثى":"Female"}>{t.female}</option></select></div><div><label style={LBL}>{t.riskLabel}</label><select style={INP} value={editForm.risk||""} onChange={e=>ef("risk",e.target.value)}>{(lang==="ar"?[["منخفض",t.riskLow],["متوسط",t.riskMed],["مرتفع",t.riskHigh]]:[["Low",t.riskLow],["Medium",t.riskMed],["High",t.riskHigh]]).map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></div></div>
          <div style={R2}><div><label style={LBL}>{t.nationalIdLabel}</label><input style={INP} value={editForm.nationalId||""} onChange={e=>ef("nationalId",e.target.value)} /></div><div><label style={LBL}>{t.fileNoLabel}</label><input style={INP} value={editForm.fileNo||""} onChange={e=>ef("fileNo",e.target.value)} /></div></div>
          <div style={R2}><div><label style={LBL}>{t.surgeryLabel}</label><select style={INP} value={editForm.surgery||""} onChange={e=>ef("surgery",e.target.value)}>{SURGERIES.map(s=><option key={s} value={s}>{s}</option>)}</select></div><div><label style={LBL}>{t.deptLabel}</label><input style={INP} value={editForm.dept||""} onChange={e=>ef("dept",e.target.value)} /></div></div>
          <div style={{ fontSize:13,color:"#14b8a6",fontWeight:600,margin:"8px 0" }}>{t.vitalsTitle}</div>
          <div style={R2}><div><label style={LBL}>{t.painLabel}</label><input style={INP} type="number" min="0" max="10" value={editForm.pain||0} onChange={e=>ef("pain",e.target.value)} /></div><div><label style={LBL}>{t.feverLabel}</label><input style={INP} type="number" step="0.1" value={editForm.fever||37} onChange={e=>ef("fever",e.target.value)} /></div></div>
          <div style={R2}><div><label style={LBL}>{t.woundLabel}</label><input style={INP} value={editForm.wound||""} onChange={e=>ef("wound",e.target.value)} /></div><div><label style={LBL}>{t.mobilityLabel}</label><input style={INP} value={editForm.mobility||""} onChange={e=>ef("mobility",e.target.value)} /></div></div>
          <div style={{ marginBottom:20 }}><label style={LBL}>{t.noteLabel}</label><textarea style={{ ...INP,minHeight:65,resize:"vertical" }} value={editForm.note||""} onChange={e=>ef("note",e.target.value)} /></div>
          <div style={{ display:"flex",gap:10 }}><button onClick={saveEdit} style={{ ...BTN("linear-gradient(135deg,#0d9488,#0891b2)"),flex:1,padding:14,fontSize:15 }}>{t.saveEdit}</button><button onClick={()=>setShowEdit(false)} style={{ ...BTN("#374151"),flex:1,padding:14 }}>{t.cancel}</button></div>
        </div></div>
      )}

      {/* RESPONSES */}
      {showResp && (
        <div style={OVL}><div style={{ ...MDL,maxWidth:620 }}>
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20 }}>
            <div><h3 style={{ margin:0,fontSize:18,fontWeight:700 }}>{t.responsesTitle} {sel?.name}</h3><div style={{ fontSize:12,color:"#6b7280",marginTop:4 }}>{responses.length} {t.responses}</div></div>
            <button onClick={()=>setShowResp(false)} style={{ background:"none",border:"none",color:"#9ca3af",fontSize:22,cursor:"pointer" }}>✕</button>
          </div>
          {loadingR ? <div style={{ textAlign:"center",padding:40,color:"#6b7280" }}>{t.loading}</div>
          : responses.length===0 ? <div style={{ textAlign:"center",padding:40 }}><div style={{ fontSize:40,marginBottom:12 }}>📭</div><div style={{ color:"#6b7280",fontSize:14 }}>{t.noResponses}</div><div style={{ color:"#4b5563",fontSize:12,marginTop:8 }}>{t.noResponsesSub}</div></div>
          : responses.map((r,i)=>(
            <div key={r.id} style={{ background:"#1f2937",borderRadius:14,padding:16,marginBottom:12,border:r.has_alert?"1px solid rgba(245,158,11,.4)":"1px solid transparent" }}>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12 }}>
                <div style={{ fontSize:13,fontWeight:600 }}>{t.response} {responses.length-i}</div>
                <div style={{ display:"flex",gap:8,alignItems:"center" }}>
                  {r.has_alert&&<span style={{ background:"rgba(245,158,11,.15)",color:"#f59e0b",border:"1px solid rgba(245,158,11,.3)",borderRadius:999,padding:"2px 10px",fontSize:11 }}>{t.needsFollowup}</span>}
                  <span style={{ color:"#4b5563",fontSize:11 }}>{new Date(r.created_at).toLocaleString(lang==="ar"?"ar-SA":"en-US")}</span>
                </div>
              </div>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8 }}>
                {Object.entries(r.answers||{}).map(([qId,ans])=>{
                  const allQ=[...GENERAL_Q[lang],...(lang==="ar"?SURGERY_Q.ar[r.surgery]||SURGERY_Q.ar["أخرى"]:SURGERY_Q.en[r.surgery]||SURGERY_Q.en["Other"])];
                  const q=allQ.find(x=>x.id===qId); if(!q) return null;
                  const isAlert=q.alertOn?.includes(ans);
                  return <div key={qId} style={{ background:"rgba(15,23,42,.5)",borderRadius:10,padding:"8px 12px" }}><div style={{ color:"#6b7280",fontSize:11,marginBottom:4 }}>{q.text.length>40?q.text.slice(0,40)+"...":q.text}</div><div style={{ fontWeight:600,fontSize:13,color:isAlert?"#f59e0b":"#2dd4bf" }}>{isAlert?"⚠️ ":""}{ans}</div></div>;
                })}
              </div>
            </div>
          ))}
        </div></div>
      )}

      {/* SEND */}
      {showSend && (
        <div style={OVL}><div style={{ ...MDL,maxWidth:440 }}>
          <h3 style={{ margin:"0 0 16px",fontSize:17,fontWeight:700 }}>{t.sendTitle}</h3>
          <div style={{ background:"#1f2937",borderRadius:12,padding:14,marginBottom:14 }}>
            <div style={{ display:"flex",flexWrap:"wrap",gap:8 }}>{patients.map(p=><span key={p.id} style={{ fontSize:12,padding:"3px 10px",borderRadius:999,color:"#2dd4bf",background:"rgba(20,184,166,.1)",border:"1px solid rgba(20,184,166,.3)" }}>{p.name}</span>)}</div>
          </div>
          <div style={{ display:"flex",gap:10 }}><button onClick={()=>{setShowSend(false);toast_(`${t.toastSent} ${patients.length} ${t.toastSentSuffix}`);}} style={{ ...BTN("#0d9488"),flex:1,padding:13 }}>{t.sendNow}</button><button onClick={()=>setShowSend(false)} style={{ ...BTN("#374151"),flex:1,padding:13 }}>{t.cancel}</button></div>
        </div></div>
      )}

      {/* DELETE */}
      {showDel && (
        <div style={OVL}><div style={{ ...MDL,maxWidth:360,textAlign:"center" }}>
          <div style={{ fontSize:40,marginBottom:12 }}>🗑️</div>
          <h3 style={{ margin:"0 0 8px" }}>{t.deleteTitle}</h3>
          <p style={{ color:"#9ca3af",fontSize:14,margin:"0 0 20px" }}>{t.deleteConfirm} <strong style={{color:"#fff"}}>{sel?.name}</strong>?</p>
          <div style={{ display:"flex",gap:10 }}><button onClick={deletePatient} style={{ ...BTN("#dc2626"),flex:1,padding:12 }}>{t.deleteYes}</button><button onClick={()=>setShowDel(false)} style={{ ...BTN("#374151"),flex:1,padding:12 }}>{t.cancel}</button></div>
        </div></div>
      )}

      {toast && <div style={{ position:"fixed",bottom:24,left:"50%",transform:"translateX(-50%)",background:"#059669",color:"#fff",padding:"12px 24px",borderRadius:12,boxShadow:"0 8px 30px rgba(0,0,0,.4)",zIndex:1000,fontSize:14,fontWeight:500,whiteSpace:"nowrap" }}>{toast}</div>}
    </div>
  );
}
