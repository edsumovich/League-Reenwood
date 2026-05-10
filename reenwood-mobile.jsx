import { useState, useMemo, useRef, useEffect } from "react";

// ─── CONSTANTS ────────────────────────────────────────────────
const TOTAL_CAP  = 300;
const ACTIVE_MAX = 30;
const TAXI_MAX   = 5;
const PASSWORD   = "reenwood2026";
const POS_ORDER  = { QB:0, TeamQB:1, RB:2, WR:3, TE:4 };
const POS_LIST   = ["QB","TeamQB","RB","WR","TE"];

const NFL_TEAMS = [
  {abbr:"ARI",name:"Arizona Cardinals"},{abbr:"ATL",name:"Atlanta Falcons"},
  {abbr:"BAL",name:"Baltimore Ravens"},{abbr:"BUF",name:"Buffalo Bills"},
  {abbr:"CAR",name:"Carolina Panthers"},{abbr:"CHI",name:"Chicago Bears"},
  {abbr:"CIN",name:"Cincinnati Bengals"},{abbr:"CLE",name:"Cleveland Browns"},
  {abbr:"DAL",name:"Dallas Cowboys"},{abbr:"DEN",name:"Denver Broncos"},
  {abbr:"DET",name:"Detroit Lions"},{abbr:"GB",name:"Green Bay Packers"},
  {abbr:"HOU",name:"Houston Texans"},{abbr:"IND",name:"Indianapolis Colts"},
  {abbr:"JAX",name:"Jacksonville Jaguars"},{abbr:"KC",name:"Kansas City Chiefs"},
  {abbr:"LV",name:"Las Vegas Raiders"},{abbr:"LAC",name:"LA Chargers"},
  {abbr:"LAR",name:"LA Rams"},{abbr:"MIA",name:"Miami Dolphins"},
  {abbr:"MIN",name:"Minnesota Vikings"},{abbr:"NE",name:"New England Patriots"},
  {abbr:"NO",name:"New Orleans Saints"},{abbr:"NYG",name:"New York Giants"},
  {abbr:"NYJ",name:"New York Jets"},{abbr:"PHI",name:"Philadelphia Eagles"},
  {abbr:"PIT",name:"Pittsburgh Steelers"},{abbr:"SF",name:"San Francisco 49ers"},
  {abbr:"SEA",name:"Seattle Seahawks"},{abbr:"TB",name:"Tampa Bay Buccaneers"},
  {abbr:"TEN",name:"Tennessee Titans"},{abbr:"WAS",name:"Washington Commanders"},
];

// Master player pool – salary/contract info available league-wide (read-only reference)
const PLAYER_POOL = [
  {name:"Patrick Mahomes",    pos:"QB",    team:"KC",  salary:72, years:3, age:30},
  {name:"Lamar Jackson",      pos:"QB",    team:"BAL", salary:65, years:2, age:27},
  {name:"Josh Allen",         pos:"QB",    team:"BUF", salary:60, years:3, age:28},
  {name:"Joe Burrow",         pos:"QB",    team:"CIN", salary:55, years:2, age:28},
  {name:"Jalen Hurts",        pos:"QB",    team:"PHI", salary:58, years:3, age:26},
  {name:"Tua Tagovailoa",     pos:"QB",    team:"MIA", salary:40, years:2, age:27},
  {name:"Jordan Love",        pos:"QB",    team:"GB",  salary:38, years:2, age:26},
  {name:"Dak Prescott",       pos:"QB",    team:"DAL", salary:36, years:1, age:31},
  {name:"Kansas City Chiefs", pos:"TeamQB",team:"KC",  salary:18, years:1, age:0 },
  {name:"Baltimore Ravens",   pos:"TeamQB",team:"BAL", salary:14, years:1, age:0 },
  {name:"Buffalo Bills",      pos:"TeamQB",team:"BUF", salary:16, years:1, age:0 },
  {name:"Philadelphia Eagles",pos:"TeamQB",team:"PHI", salary:15, years:1, age:0 },
  {name:"Christian McCaffrey",pos:"RB",    team:"SF",  salary:42, years:2, age:27},
  {name:"Jahmyr Gibbs",       pos:"RB",    team:"DET", salary:28, years:3, age:23},
  {name:"De'Von Achane",      pos:"RB",    team:"MIA", salary:22, years:2, age:23},
  {name:"Jaylen Warren",      pos:"RB",    team:"PIT", salary:8,  years:2, age:25},
  {name:"Breece Hall",        pos:"RB",    team:"NYJ", salary:30, years:2, age:24},
  {name:"Bijan Robinson",     pos:"RB",    team:"ATL", salary:26, years:3, age:23},
  {name:"Derrick Henry",      pos:"RB",    team:"BAL", salary:16, years:1, age:30},
  {name:"Travis Etienne",     pos:"RB",    team:"JAX", salary:18, years:2, age:25},
  {name:"Ja'Marr Chase",      pos:"WR",    team:"CIN", salary:55, years:3, age:25},
  {name:"Davante Adams",      pos:"WR",    team:"LV",  salary:38, years:1, age:32},
  {name:"Nico Collins",       pos:"WR",    team:"HOU", salary:26, years:2, age:25},
  {name:"Rome Odunze",        pos:"WR",    team:"CHI", salary:14, years:3, age:22},
  {name:"Drake London",       pos:"WR",    team:"ATL", salary:24, years:2, age:24},
  {name:"CeeDee Lamb",        pos:"WR",    team:"DAL", salary:45, years:3, age:25},
  {name:"Tyreek Hill",        pos:"WR",    team:"MIA", salary:42, years:2, age:30},
  {name:"DeVonta Smith",      pos:"WR",    team:"PHI", salary:22, years:2, age:27},
  {name:"Garrett Wilson",     pos:"WR",    team:"NYJ", salary:28, years:2, age:25},
  {name:"Sam LaPorta",        pos:"TE",    team:"DET", salary:20, years:3, age:24},
  {name:"Dalton Kincaid",     pos:"TE",    team:"BUF", salary:12, years:2, age:24},
  {name:"Tucker Kraft",       pos:"TE",    team:"GB",  salary:9,  years:2, age:23},
  {name:"Trey McBride",       pos:"TE",    team:"ARI", salary:24, years:3, age:25},
  {name:"Sam LaPorta",        pos:"TE",    team:"DET", salary:20, years:3, age:24},
  {name:"Mark Andrews",       pos:"TE",    team:"BAL", salary:22, years:2, age:29},
  {name:"Travis Kelce",       pos:"TE",    team:"KC",  salary:20, years:1, age:35},
];

const SEED = [
  {id:"s1", name:"Patrick Mahomes",    pos:"QB",     team:"KC",  salary:72, years:3, age:30, rookie:false, taxi:false, ir:false, removed:false},
  {id:"s2", name:"Lamar Jackson",      pos:"QB",     team:"BAL", salary:65, years:2, age:27, rookie:false, taxi:false, ir:false, removed:false},
  {id:"s3", name:"Kansas City Chiefs", pos:"TeamQB", team:"KC",  salary:18, years:1, age:0,  rookie:false, taxi:false, ir:false, removed:false},
  {id:"s4", name:"Baltimore Ravens",   pos:"TeamQB", team:"BAL", salary:14, years:1, age:0,  rookie:false, taxi:false, ir:false, removed:false},
  {id:"s5", name:"Christian McCaffrey",pos:"RB",     team:"SF",  salary:42, years:2, age:27, rookie:false, taxi:false, ir:true,  removed:false},
  {id:"s6", name:"Jahmyr Gibbs",       pos:"RB",     team:"DET", salary:28, years:3, age:23, rookie:false, taxi:false, ir:false, removed:false},
  {id:"s7", name:"De'Von Achane",      pos:"RB",     team:"MIA", salary:22, years:2, age:23, rookie:false, taxi:false, ir:false, removed:false},
  {id:"s8", name:"Jaylen Warren",      pos:"RB",     team:"PIT", salary:8,  years:2, age:25, rookie:false, taxi:true,  ir:false, removed:false},
  {id:"s9", name:"Ja'Marr Chase",      pos:"WR",     team:"CIN", salary:55, years:3, age:25, rookie:false, taxi:false, ir:false, removed:false},
  {id:"s10",name:"Davante Adams",      pos:"WR",     team:"LV",  salary:38, years:1, age:32, rookie:false, taxi:false, ir:false, removed:false},
  {id:"s11",name:"Nico Collins",       pos:"WR",     team:"HOU", salary:26, years:2, age:25, rookie:false, taxi:false, ir:false, removed:false},
  {id:"s12",name:"Rome Odunze",        pos:"WR",     team:"CHI", salary:14, years:3, age:22, rookie:true,  taxi:false, ir:false, removed:false},
  {id:"s13",name:"Drake London",       pos:"WR",     team:"ATL", salary:24, years:2, age:24, rookie:false, taxi:false, ir:false, removed:false},
  {id:"s14",name:"Sam LaPorta",        pos:"TE",     team:"DET", salary:20, years:3, age:24, rookie:false, taxi:false, ir:false, removed:false},
  {id:"s15",name:"Dalton Kincaid",     pos:"TE",     team:"BUF", salary:12, years:2, age:24, rookie:false, taxi:true,  ir:false, removed:false},
  {id:"s16",name:"Tucker Kraft",       pos:"TE",     team:"GB",  salary:9,  years:2, age:23, rookie:false, taxi:true,  ir:false, removed:false},
];

// ─── HELPERS ──────────────────────────────────────────────────
const calcPenalty = p => Math.round((p.years||0)*(p.salary||0)*0.5);

const POS_COLOR = {
  QB:"#ff7a7a", TeamQB:"#ffb347", RB:"#56ccf2", WR:"#c3b1e1", TE:"#77dd77"
};

function savedKey(team)   { return `rw_saved_${team.toLowerCase().replace(/\s+/g,"_")}`; }
function workingKey(team) { return `rw_work_${team.toLowerCase().replace(/\s+/g,"_")}`; }

// ─── STYLES ───────────────────────────────────────────────────
const C = {
  bg:"#05091a", surface:"#0b1230", surface2:"#0f1940",
  border:"#1e2d5a", red:"#C8102E", red2:"#a00d24",
  blue2:"#001a44", white:"#F5F5F5", offwhite:"#c8d0e4",
  muted:"#6b7eaa", text:"#c8d4ee",
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800;900&family=Barlow:wght@400;500;600&family=Share+Tech+Mono&display=swap');
  * { box-sizing:border-box; -webkit-tap-highlight-color:transparent; }
  body { margin:0; background:${C.bg}; color:${C.text}; font-family:'Barlow',sans-serif; }
  input,select,button { font-family:inherit; }
  ::-webkit-scrollbar { width:3px; height:3px; }
  ::-webkit-scrollbar-thumb { background:${C.border}; }
  @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  @keyframes pulse  { 0%,100%{opacity:1} 50%{opacity:0.5} }
  @keyframes slideIn{ from{opacity:0;transform:translateX(-6px)} to{opacity:1;transform:translateX(0)} }
`;

// ─── SUB-COMPONENTS ───────────────────────────────────────────
function Tag({ children, color }) {
  return (
    <span style={{
      display:"inline-block", fontSize:9, fontFamily:"'Share Tech Mono',monospace",
      letterSpacing:1, padding:"2px 5px", border:`1px solid ${color}`,
      color, marginLeft:5, verticalAlign:"middle", lineHeight:1.4,
    }}>{children}</span>
  );
}

function PosChip({ pos }) {
  const c = POS_COLOR[pos] || C.muted;
  return (
    <span style={{
      display:"inline-block", padding:"2px 7px", borderRadius:2,
      fontFamily:"'Barlow Condensed',sans-serif", fontSize:12, fontWeight:700, letterSpacing:1,
      background:"rgba(255,255,255,0.06)", border:`1px solid ${c}`, color:c,
    }}>{pos}</span>
  );
}

function Alert({ type, icon, children }) {
  const colors = {
    danger:{bg:"rgba(200,16,46,0.1)", border:C.red, color:"#ff9aaa"},
    warn:  {bg:"rgba(255,179,71,0.1)",border:"#ffb347",color:"#ffd080"},
    info:  {bg:"rgba(74,144,217,0.08)",border:"#4a8fd9",color:"#90c8ff"},
  };
  const s = colors[type];
  return (
    <div style={{
      display:"flex", alignItems:"center", gap:10, padding:"10px 14px",
      border:`1px solid ${s.border}`, background:s.bg, color:s.color,
      fontFamily:"'Share Tech Mono',monospace", fontSize:12, lineHeight:1.5,
      animation:"slideIn 0.3s ease both",
    }}>
      <span style={{fontSize:15,flexShrink:0}}>{icon}</span>
      <span dangerouslySetInnerHTML={{__html:children}} />
    </div>
  );
}

function SumCard({ label, value, sub, accent }) {
  const borders = {
    red:C.red, blue:"#4a8fd9", good:"#4caf50", warn:"#ffb347", danger:C.red, neutral:C.border
  };
  return (
    <div style={{
      background:C.surface, border:`1px solid ${C.border}`,
      borderTop:`3px solid ${borders[accent]||C.border}`,
      padding:"12px 14px 10px", flex:1, minWidth:0,
    }}>
      <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:9,letterSpacing:3,textTransform:"uppercase",color:C.muted,marginBottom:4}}>{label}</div>
      <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:26,fontWeight:800,lineHeight:1,color:C.white,letterSpacing:0.5}}>{value}</div>
      <div style={{fontSize:10,color:C.muted,marginTop:3,fontFamily:"'Share Tech Mono',monospace"}}>{sub}</div>
    </div>
  );
}

// ─── MODAL SHELL ──────────────────────────────────────────────
function Modal({ open, onClose, children, topColor }) {
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);
  if (!open) return null;
  return (
    <div onClick={e=>{ if(e.target===e.currentTarget) onClose(); }} style={{
      position:"fixed", inset:0, background:"rgba(0,0,0,0.82)", backdropFilter:"blur(4px)",
      display:"flex", alignItems:"flex-end", justifyContent:"center", zIndex:900,
      padding:0,
    }}>
      <div style={{
        background:C.surface, borderTop:`4px solid ${topColor||C.red}`,
        border:`1px solid ${C.border}`, borderBottom:"none",
        width:"100%", maxWidth:600, maxHeight:"92vh", overflowY:"auto",
        padding:"24px 20px 36px", position:"relative",
        animation:"fadeUp 0.22s ease both", borderRadius:"12px 12px 0 0",
      }}>
        {children}
      </div>
    </div>
  );
}

function ModalTitle({ children }) {
  return (
    <div style={{
      fontFamily:"'Barlow Condensed',sans-serif", fontSize:24, fontWeight:900,
      letterSpacing:2, textTransform:"uppercase", color:C.white, marginBottom:20,
      textShadow:"0 2px 8px rgba(0,0,0,0.6)",
    }}>{children}</div>
  );
}

function CloseBtn({ onClose }) {
  return (
    <button onClick={onClose} style={{
      position:"absolute", top:14, right:16, background:"none", border:"none",
      color:C.muted, fontSize:22, cursor:"pointer", lineHeight:1, padding:4,
    }}>✕</button>
  );
}

function Field({ label, children }) {
  return (
    <div style={{marginBottom:14}}>
      <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:10,letterSpacing:2,textTransform:"uppercase",color:C.muted,marginBottom:6}}>{label}</div>
      {children}
    </div>
  );
}

const inputStyle = {
  width:"100%", background:C.bg, border:`1px solid ${C.border}`,
  color:C.offwhite, padding:"11px 13px",
  fontFamily:"'Share Tech Mono',monospace", fontSize:13, outline:"none",
};

function RedBtn({ children, onClick, style={} }) {
  return (
    <button onClick={onClick} style={{
      flex:1, background:C.red, border:"none", color:"#fff", padding:"13px 0",
      fontFamily:"'Barlow Condensed',sans-serif", fontSize:17, fontWeight:800,
      letterSpacing:3, textTransform:"uppercase", cursor:"pointer",
      textShadow:"0 1px 4px rgba(0,0,0,0.4)", ...style,
    }}>{children}</button>
  );
}

function GhostBtn({ children, onClick }) {
  return (
    <button onClick={onClick} style={{
      flex:1, background:"transparent", border:`1px solid ${C.border}`,
      color:C.muted, padding:"13px 0",
      fontFamily:"'Barlow Condensed',sans-serif", fontSize:17, fontWeight:700,
      letterSpacing:3, textTransform:"uppercase", cursor:"pointer",
    }}>{children}</button>
  );
}

// ─── PLAYER SEARCH FIELD ──────────────────────────────────────
function PlayerSearchField({ value, onChange, onSelect, existingNames }) {
  const [open, setOpen] = useState(false);
  const results = useMemo(() => {
    if (!value.trim()) return [];
    const q = value.toLowerCase();
    return PLAYER_POOL.filter(p =>
      p.name.toLowerCase().includes(q) && !existingNames.has(p.name)
    ).slice(0,8);
  }, [value, existingNames]);

  return (
    <div style={{position:"relative"}}>
      <input
        style={{...inputStyle, borderColor: open && results.length ? "#4a8fd9" : C.border}}
        value={value}
        onChange={e=>{ onChange(e.target.value); setOpen(true); }}
        onFocus={()=>setOpen(true)}
        onBlur={()=>setTimeout(()=>setOpen(false),150)}
        placeholder="Search player name…"
        autoComplete="off"
      />
      {open && results.length > 0 && (
        <div style={{
          position:"absolute", top:"100%", left:0, right:0, zIndex:999,
          background:C.surface2, border:`1px solid #4a8fd9`, borderTop:"none",
          maxHeight:220, overflowY:"auto",
        }}>
          {results.map((p,i) => (
            <div key={i}
              onMouseDown={()=>{ onSelect(p); setOpen(false); }}
              style={{
                display:"flex", alignItems:"center", justifyContent:"space-between",
                padding:"10px 13px", cursor:"pointer", borderBottom:`1px solid ${C.border}`,
              }}
              onMouseEnter={e=>e.currentTarget.style.background=C.surface}
              onMouseLeave={e=>e.currentTarget.style.background="transparent"}
            >
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <PosChip pos={p.pos} />
                <span style={{fontFamily:"'Barlow',sans-serif",fontSize:14,fontWeight:600,color:C.white}}>{p.name}</span>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:11,color:C.offwhite}}>${p.salary} / {p.years}yr</div>
                <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:10,color:C.muted}}>{p.team}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── PLAYER FORM ──────────────────────────────────────────────
function PlayerForm({ initial, existingNames, onSave, onCancel, isEdit }) {
  const blank = { name:"", pos:"QB", team:"", salary:"", years:"", age:"", rookie:false, taxi:false, ir:false };
  const [f, setF] = useState(initial || blank);
  const [autofilled, setAutofilled] = useState(false);

  const set = (k,v) => setF(prev=>({...prev,[k]:v}));

  const penalty = useMemo(() => {
    const s = parseFloat(f.salary)||0, y = parseFloat(f.years)||0;
    return s>0&&y>0 ? Math.round(y*s*0.5) : 0;
  }, [f.salary, f.years]);

  function handlePoolSelect(p) {
    setF(prev=>({...prev, name:p.name, pos:p.pos, team:p.team, salary:p.salary, years:p.years, age:p.age||prev.age}));
    setAutofilled(true);
  }

  function handleSubmit() {
    if (!f.name.trim()) { alert("Player name is required."); return; }
    onSave({
      name: f.name.trim(),
      pos: f.pos, team: f.team,
      salary: parseFloat(f.salary)||0,
      years: parseInt(f.years)||0,
      age: parseInt(f.age)||0,
      rookie: !!f.rookie, taxi: !!f.taxi, ir: !!f.ir,
    });
  }

  return (
    <div>
      {!isEdit && (
        <Field label="Search Existing Players">
          <PlayerSearchField
            value={f.name}
            onChange={v=>{ set("name",v); setAutofilled(false); }}
            onSelect={handlePoolSelect}
            existingNames={existingNames}
          />
          {autofilled && (
            <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:11,color:"#77dd77",marginTop:6,padding:"7px 11px",background:"rgba(119,221,119,0.08)",border:"1px solid rgba(119,221,119,0.2)"}}>
              ✓ Salary info loaded — you can adjust below for your cap scenario
            </div>
          )}
        </Field>
      )}

      {isEdit && (
        <Field label="Player Name">
          <input style={inputStyle} value={f.name} onChange={e=>set("name",e.target.value)} placeholder="First Last" />
        </Field>
      )}

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <Field label="Position">
          <select style={inputStyle} value={f.pos} onChange={e=>set("pos",e.target.value)}>
            {POS_LIST.map(p=><option key={p} value={p}>{p}</option>)}
          </select>
        </Field>
        <Field label="NFL Team">
          <select style={inputStyle} value={f.team} onChange={e=>set("team",e.target.value)}>
            <option value="">— Select —</option>
            {NFL_TEAMS.map(t=>(
              <option key={t.abbr} value={t.abbr}>{t.abbr} – {t.name}</option>
            ))}
          </select>
        </Field>
        <Field label="Salary ($)">
          <input style={inputStyle} type="number" min="1" value={f.salary}
            onChange={e=>set("salary",e.target.value)} placeholder="e.g. 45" />
        </Field>
        <Field label="Contract Years">
          <input style={inputStyle} type="number" min="1" max="10" value={f.years}
            onChange={e=>set("years",e.target.value)} placeholder="e.g. 3" />
        </Field>
        <Field label="Age">
          <input style={inputStyle} type="number" min="18" max="50" value={f.age}
            onChange={e=>set("age",e.target.value)} placeholder="e.g. 24" />
        </Field>
      </div>

      {penalty > 0 && (
        <div style={{
          background:"rgba(200,16,46,0.08)", border:"1px solid rgba(200,16,46,0.25)",
          padding:"9px 13px", marginBottom:16,
          fontFamily:"'Share Tech Mono',monospace", fontSize:11, color:"#ff8888",
        }}>
          Cut penalty if released: ${penalty} ({f.years} yrs × ${f.salary} × 0.5)
        </div>
      )}

      <div style={{display:"flex",gap:12,marginBottom:20,flexWrap:"wrap"}}>
        {[["rookie","Rookie"],["taxi","Taxi Squad"],["ir","IR"]].map(([k,label])=>(
          <label key={k} style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer"}}>
            <input type="checkbox" checked={!!f[k]} onChange={e=>set(k,e.target.checked)}
              style={{accentColor:C.red,width:16,height:16}} />
            <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:11,color:C.muted,letterSpacing:1,textTransform:"uppercase"}}>{label}</span>
          </label>
        ))}
      </div>

      <div style={{display:"flex",gap:10}}>
        <RedBtn onClick={handleSubmit}>{isEdit?"Update Player":"Add Player"}</RedBtn>
        <GhostBtn onClick={onCancel}>Cancel</GhostBtn>
      </div>
    </div>
  );
}

// ─── PLAYER CARD (mobile list item) ───────────────────────────
function PlayerCard({ p, onEdit, onRemove, onCut }) {
  const pen = calcPenalty(p);
  const posC = POS_COLOR[p.pos] || C.muted;
  const isRemoved = !!p.removed;

  const statusColor = isRemoved ? C.muted : p.taxi ? "#ffb347" : p.ir ? C.red : "#77dd77";
  const statusText  = isRemoved ? "REMOVED" : p.taxi ? "TAXI" : p.ir ? "IR" : "ACTIVE";

  return (
    <div style={{
      background:C.surface, border:`1px solid ${C.border}`,
      borderLeft:`4px solid ${isRemoved?C.muted:posC}`,
      padding:"12px 14px", marginBottom:8,
      opacity: isRemoved ? 0.5 : 1,
      transition:"opacity 0.2s",
    }}>
      {/* Top row */}
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:8}}>
        <div style={{display:"flex",alignItems:"center",gap:8,flex:1,minWidth:0}}>
          <PosChip pos={p.pos} />
          <div style={{minWidth:0}}>
            <div style={{
              fontFamily:"'Barlow',sans-serif", fontWeight:600, fontSize:15,
              color:isRemoved?C.muted:C.white,
              textDecoration:isRemoved?"line-through":"none",
              whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis",
            }}>{p.name}</div>
            <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:10,color:C.muted,marginTop:2}}>
              {p.team||"—"}
              {p.age>0 && <span> · Age {p.age}</span>}
            </div>
          </div>
        </div>
        <div style={{textAlign:"right",flexShrink:0,marginLeft:10}}>
          <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:14,fontWeight:600,color:isRemoved?C.muted:C.offwhite}}>
            {p.taxi||isRemoved?"—":`$${p.salary||0}`}
          </div>
          <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:10,color:C.muted}}>
            {p.years?`${p.years}yr`:"—"}
          </div>
        </div>
      </div>

      {/* Mid row: tags + status + penalty */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
        <div style={{display:"flex",alignItems:"center",gap:4,flexWrap:"wrap"}}>
          <span style={{fontFamily:"'Share Tech Mono',monospace",fontSize:10,color:statusColor,letterSpacing:1}}>{statusText}</span>
          {p.rookie && <Tag color="#77dd77">RK</Tag>}
        </div>
        {pen>0 && !isRemoved && (
          <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:10,color:"#ff8888"}}>
            penalty: ${pen}
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div style={{display:"flex",gap:8}}>
        <button onClick={()=>onEdit(p.id)} style={{
          flex:1, background:"transparent", border:`1px solid ${C.border}`,
          color:C.muted, padding:"7px 0", fontFamily:"'Share Tech Mono',monospace",
          fontSize:11, letterSpacing:1, cursor:"pointer", textTransform:"uppercase",
        }}>Edit</button>
        <button onClick={()=>onRemove(p.id)} style={{
          flex:1, background:isRemoved?"rgba(255,179,71,0.08)":"transparent",
          border:`1px solid ${isRemoved?"#ffb347":C.border}`,
          color:isRemoved?"#ffb347":C.muted, padding:"7px 0",
          fontFamily:"'Share Tech Mono',monospace",
          fontSize:11, letterSpacing:1, cursor:"pointer", textTransform:"uppercase",
        }}>{isRemoved?"Restore":"Remove"}</button>
        <button onClick={()=>onCut(p.id)} style={{
          flex:1, background:"transparent", border:`1px solid ${C.border}`,
          color:C.muted, padding:"7px 0", fontFamily:"'Share Tech Mono',monospace",
          fontSize:11, letterSpacing:1, cursor:"pointer", textTransform:"uppercase",
        }}>Cut</button>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen]         = useState("login");
  const [teamName, setTeamName]     = useState("");
  const [loginUser, setLoginUser]   = useState("");
  const [loginPass, setLoginPass]   = useState("");
  const [loginErr, setLoginErr]     = useState("");
  const [players, setPlayers]       = useState([]);
  const [saved, setSaved]           = useState([]);
  const [isDirty, setIsDirty]       = useState(false);
  const [sortCol, setSortCol]       = useState("pos");
  const [sortDir, setSortDir]       = useState(1);
  const [showRemoved, setShowRemoved] = useState(false);
  const [filterPos, setFilterPos]   = useState("ALL");
  const [toast, setToast]           = useState(null);

  // modals
  const [addOpen, setAddOpen]       = useState(false);
  const [editPlayer, setEditPlayer] = useState(null);
  const [cutPlayer, setCutPlayer]   = useState(null);
  const [saveOpen, setSaveOpen]     = useState(false);
  const [resetOpen, setResetOpen]   = useState(false);

  let toastTimer = useRef(null);

  function showToast(msg, color="#4caf50") {
    setToast({ msg, color });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(()=>setToast(null), 3000);
  }

  function markDirty(newPlayers, savedRef) {
    const dirty = JSON.stringify(newPlayers) !== JSON.stringify(savedRef);
    setIsDirty(dirty);
  }

  function updatePlayers(newPlayers) {
    setPlayers(newPlayers);
    markDirty(newPlayers, saved);
  }

  // ── Login ──
  function doLogin() {
    if (!loginUser.trim()) { setLoginErr("Enter your franchise name."); return; }
    if (loginPass !== PASSWORD) { setLoginErr("Incorrect password."); return; }
    const team = loginUser.trim();
    setTeamName(team);
    const rawSaved   = localStorage.getItem(savedKey(team));
    const rawWorking = localStorage.getItem(workingKey(team));
    const sv = rawSaved   ? JSON.parse(rawSaved)   : SEED.map(p=>({...p}));
    const wp = rawWorking ? JSON.parse(rawWorking) : sv.map(p=>({...p}));
    if (!rawSaved) localStorage.setItem(savedKey(team), JSON.stringify(sv));
    setSaved(sv);
    setPlayers(wp);
    setIsDirty(JSON.stringify(wp) !== JSON.stringify(sv));
    setScreen("app");
  }

  function doLogout() {
    setScreen("login"); setLoginPass(""); setLoginErr("");
    setPlayers([]); setSaved([]); setTeamName(""); setIsDirty(false);
  }

  // ── Persist ──
  function persist(newPlayers) {
    localStorage.setItem(workingKey(teamName), JSON.stringify(newPlayers));
  }

  // ── Add player ──
  function handleAddPlayer(data) {
    const newPlayers = [...players, { id:"p"+Date.now(), removed:false, ...data }];
    persist(newPlayers);
    updatePlayers(newPlayers);
    setAddOpen(false);
    showToast(`✓ ${data.name} added to roster`);
  }

  // ── Edit player ──
  function handleEditPlayer(data) {
    const newPlayers = players.map(p => p.id===editPlayer.id ? {...p,...data} : p);
    persist(newPlayers);
    updatePlayers(newPlayers);
    setEditPlayer(null);
    showToast(`✓ ${data.name} updated`);
  }

  // ── Remove/restore ──
  function toggleRemove(id) {
    const newPlayers = players.map(p => p.id===id ? {...p,removed:!p.removed} : p);
    persist(newPlayers);
    updatePlayers(newPlayers);
  }

  // ── Cut ──
  function doCut() {
    const newPlayers = players.filter(p=>p.id!==cutPlayer.id);
    persist(newPlayers);
    updatePlayers(newPlayers);
    showToast(`${cutPlayer.name} released`, C.red);
    setCutPlayer(null);
  }

  // ── Save ──
  function doSave() {
    const cleaned = players.filter(p=>!p.removed).map(p=>{const c={...p};delete c.removed;return c;});
    const withRemoved = cleaned.map(p=>({...p,removed:false}));
    localStorage.setItem(savedKey(teamName), JSON.stringify(withRemoved));
    localStorage.setItem(workingKey(teamName), JSON.stringify(withRemoved));
    setSaved(withRemoved);
    setPlayers(withRemoved);
    setIsDirty(false);
    setSaveOpen(false);
    setShowRemoved(false);
    showToast("✓ Roster saved");
  }

  // ── Reset ──
  function doReset() {
    const restored = saved.map(p=>({...p,removed:false}));
    localStorage.setItem(workingKey(teamName), JSON.stringify(restored));
    setPlayers(restored);
    setIsDirty(false);
    setResetOpen(false);
    setShowRemoved(false);
    showToast("↩ Reset to last saved state", "#ffb347");
  }

  // ── Sort ──
  function doSort(col) {
    if (sortCol===col) setSortDir(d=>d*-1);
    else { setSortCol(col); setSortDir(1); }
  }

  // ── Computed ──
  const existingNames = useMemo(()=>new Set(players.map(p=>p.name)),[players]);

  const activePlayers = useMemo(()=>players.filter(p=>!p.taxi&&!p.ir&&!p.removed),[players]);
  const taxiPlayers   = useMemo(()=>players.filter(p=>p.taxi&&!p.removed),[players]);
  const capUsed       = useMemo(()=>players.filter(p=>!p.taxi&&!p.removed).reduce((s,p)=>s+(p.salary||0),0),[players]);
  const capSpace      = TOTAL_CAP - capUsed;
  const capPct        = Math.min(100,Math.round((capUsed/TOTAL_CAP)*100));
  const totalPenalty  = useMemo(()=>players.filter(p=>!p.removed).reduce((s,p)=>s+calcPenalty(p),0),[players]);
  const removedCount  = useMemo(()=>players.filter(p=>p.removed).length,[players]);

  const sorted = useMemo(()=>{
    let list = showRemoved ? [...players] : players.filter(p=>!p.removed);
    if (filterPos !== "ALL") list = list.filter(p=>p.pos===filterPos);
    return list.sort((a,b)=>{
      if (sortCol==="pos") {
        const d=(POS_ORDER[a.pos]||0)-(POS_ORDER[b.pos]||0);
        return d!==0?d*sortDir:a.name.localeCompare(b.name);
      }
      if (sortCol==="name")    return a.name.localeCompare(b.name)*sortDir;
      if (sortCol==="salary")  return ((b.salary||0)-(a.salary||0))*sortDir;
      if (sortCol==="penalty") return (calcPenalty(b)-calcPenalty(a))*sortDir;
      return 0;
    });
  },[players,showRemoved,filterPos,sortCol,sortDir]);

  // ── SCREENS ──────────────────────────────────────────────────

  if (screen === "login") return (
    <>
      <style>{css}</style>
      <div style={{
        minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center",
        position:"relative", overflow:"hidden", background:C.bg, padding:16,
      }}>
        {/* BG */}
        <div style={{position:"absolute",inset:0,background:`linear-gradient(135deg,${C.blue2} 0%,${C.blue2} 40%,#0a0f2e 40%,#0a0f2e 60%,${C.red2} 60%,${C.red2} 100%)`,opacity:0.38}}/>
        <div style={{position:"absolute",inset:0,backgroundImage:"radial-gradient(circle, rgba(255,255,255,0.16) 1px, transparent 1px)",backgroundSize:"28px 28px",opacity:0.4}}/>
        {/* Card */}
        <div style={{
          position:"relative", width:"100%", maxWidth:420,
          background:C.surface, border:`1px solid ${C.border}`, borderTop:`4px solid ${C.red}`,
          padding:"40px 32px 36px", boxShadow:"0 40px 80px rgba(0,0,0,0.7)",
          animation:"fadeUp 0.45s ease both",
        }}>
          <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:11,fontWeight:700,letterSpacing:5,textTransform:"uppercase",color:C.red,marginBottom:6,textShadow:"0 1px 6px rgba(200,16,46,0.5)"}}>League Reenwood</div>
          <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:52,fontWeight:900,lineHeight:0.95,color:C.white,textTransform:"uppercase",marginBottom:4,letterSpacing:1,textShadow:"0 2px 12px rgba(0,0,0,0.8)"}}>
            CAP<br/><span style={{color:C.red}}>ROOM</span>
          </div>
          <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:11,color:C.muted,marginBottom:32}}>2026 SUPERFLEX DYNASTY // SALARY MANAGEMENT</div>
          <div style={{height:1,background:C.border,margin:"0 -32px 28px"}}/>

          <div style={{marginBottom:18}}>
            <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:10,letterSpacing:3,textTransform:"uppercase",color:C.muted,marginBottom:8}}>Team Name</div>
            <input style={{...inputStyle,width:"100%"}} value={loginUser} onChange={e=>setLoginUser(e.target.value)} placeholder="Your franchise name" autoComplete="username" />
          </div>
          <div style={{marginBottom:6}}>
            <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:10,letterSpacing:3,textTransform:"uppercase",color:C.muted,marginBottom:8}}>Password</div>
            <input style={{...inputStyle,width:"100%"}} type="password" value={loginPass}
              onChange={e=>setLoginPass(e.target.value)}
              onKeyDown={e=>e.key==="Enter"&&doLogin()}
              placeholder="••••••••" autoComplete="current-password" />
          </div>
          {loginErr && <div style={{fontSize:12,color:"#ff8080",fontFamily:"'Share Tech Mono',monospace",marginBottom:12,textAlign:"center"}}>{loginErr}</div>}
          <RedBtn onClick={doLogin} style={{width:"100%",marginTop:20,display:"block",flex:"none"}}>Enter Front Office</RedBtn>
          <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:11,color:C.muted,marginTop:16,lineHeight:1.6}}>
            Default password: <strong style={{color:C.offwhite}}>reenwood2026</strong>
          </div>
        </div>
      </div>
    </>
  );

  // ── APP SCREEN ──────────────────────────────────────────────
  const spaceAccent = capSpace<0?"danger":capSpace<30?"warn":"good";
  const rosterAccent = activePlayers.length>ACTIVE_MAX?"danger":activePlayers.length===ACTIVE_MAX?"warn":"blue";

  return (
    <>
      <style>{css}</style>

      {/* HEADER */}
      <div style={{
        background:C.blue2, borderBottom:`3px solid ${C.red}`,
        padding:"0 16px", height:56,
        display:"flex", alignItems:"center", justifyContent:"space-between",
        position:"sticky", top:0, zIndex:200,
        boxShadow:"0 4px 20px rgba(0,0,0,0.5)",
      }}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:22,fontWeight:900,letterSpacing:2,color:C.white,textShadow:"0 1px 6px rgba(0,0,0,0.5)"}}>
            League <span style={{color:C.red}}>Reenwood</span>
          </div>
          {isDirty && (
            <div style={{
              fontFamily:"'Share Tech Mono',monospace",fontSize:9,letterSpacing:1,
              color:"#ffb347",background:"rgba(255,179,71,0.12)",
              border:"1px solid rgba(255,179,71,0.35)",padding:"3px 8px",
              animation:"pulse 2s infinite",
            }}>UNSAVED</div>
          )}
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <button onClick={()=>setResetOpen(true)} style={{
            background:"transparent", border:`1px solid ${C.border}`,
            color:C.muted, padding:"6px 12px",
            fontFamily:"'Barlow Condensed',sans-serif", fontSize:13,
            fontWeight:700, letterSpacing:2, textTransform:"uppercase",
            cursor:"pointer",
          }}>↩</button>
          <button onClick={()=>setSaveOpen(true)} style={{
            background:C.red, border:"none", color:"#fff",
            padding:"6px 14px",
            fontFamily:"'Barlow Condensed',sans-serif", fontSize:13,
            fontWeight:800, letterSpacing:2, textTransform:"uppercase",
            cursor:"pointer",
          }}>Save</button>
          <button onClick={doLogout} style={{
            background:"transparent", border:`1px solid ${C.border}`,
            color:C.muted, padding:"6px 10px",
            fontFamily:"'Share Tech Mono',monospace",fontSize:10,
            letterSpacing:1, cursor:"pointer", textTransform:"uppercase",
          }}>Out</button>
        </div>
      </div>

      <div style={{maxWidth:640,margin:"0 auto",padding:"16px 12px 80px"}}>

        {/* ALERTS */}
        <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:16}}>
          {isDirty && <Alert type="info" icon="💾">Unsaved changes — tap <strong>Save</strong> to commit or ↩ to revert</Alert>}
          {capUsed>TOTAL_CAP && <Alert type="danger" icon="🚨">OVER THE CAP — ${capUsed-TOTAL_CAP} over the ${TOTAL_CAP} limit</Alert>}
          {capUsed<=TOTAL_CAP && capUsed>TOTAL_CAP*0.95 && <Alert type="warn" icon="⚠️">CAP CRITICAL — only ${TOTAL_CAP-capUsed} remaining</Alert>}
          {activePlayers.length>ACTIVE_MAX && <Alert type="danger" icon="🚨">ROSTER OVER LIMIT — {activePlayers.length}/{ACTIVE_MAX} — cut {activePlayers.length-ACTIVE_MAX} player(s)</Alert>}
          {activePlayers.length===ACTIVE_MAX && <Alert type="warn" icon="⚠️">ROSTER FULL — at {ACTIVE_MAX}-player limit</Alert>}
          {taxiPlayers.length>TAXI_MAX && <Alert type="danger" icon="🚨">TAXI OVER LIMIT — {taxiPlayers.length}/{TAXI_MAX} players</Alert>}
          {removedCount>0 && <Alert type="warn" icon="👁">{removedCount} player(s) temporarily removed from cap — Save to make permanent</Alert>}
        </div>

        {/* SUMMARY CARDS – 2 rows of 2+3 on mobile */}
        <div style={{display:"flex",gap:8,marginBottom:8}}>
          <SumCard label="Salary Cap"   value="$300"       sub="League max"          accent="red" />
          <SumCard label="Cap Used"     value={`$${capUsed}`}  sub={`${capPct}% allocated`} accent={capUsed>TOTAL_CAP?"danger":"neutral"} />
          <SumCard label="Cap Space"    value={`$${capSpace}`} sub={capSpace>=0?"Available":"OVER CAP"} accent={spaceAccent} />
        </div>
        <div style={{display:"flex",gap:8,marginBottom:16}}>
          <SumCard label="Active"       value={activePlayers.length} sub={`of ${ACTIVE_MAX} slots`} accent={rosterAccent} />
          <SumCard label="Taxi Squad"   value={taxiPlayers.length}   sub={`of ${TAXI_MAX} slots`}   accent={taxiPlayers.length>TAXI_MAX?"danger":taxiPlayers.length===TAXI_MAX?"warn":"blue"} />
          <SumCard label="Cut Penalties" value={`$${totalPenalty}`}  sub="if all cut today"         accent="neutral" />
        </div>

        {/* CAP BAR */}
        <div style={{background:C.surface,border:`1px solid ${C.border}`,padding:"12px 16px",marginBottom:16}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:8,fontFamily:"'Share Tech Mono',monospace",fontSize:10,color:C.muted,letterSpacing:1,textTransform:"uppercase"}}>
            <span>Cap Utilization</span><span>{capPct}%</span>
          </div>
          <div style={{height:10,background:C.bg,border:`1px solid ${C.border}`,overflow:"hidden"}}>
            <div style={{
              height:"100%",width:`${capPct}%`,transition:"width 0.5s ease",
              background: capPct>100 ? `linear-gradient(90deg,${C.red2},${C.red})` :
                          capPct>90  ? "linear-gradient(90deg,#c06000,#ffb347)" :
                                       "linear-gradient(90deg,#002868,#4a8fd9)",
            }}/>
          </div>
        </div>

        {/* TOOLBAR */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10,gap:8}}>
          <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:18,fontWeight:800,letterSpacing:2,textTransform:"uppercase",color:C.white}}>
            Roster <span style={{color:C.red}}>/ Players</span>
          </div>
          <button onClick={()=>setAddOpen(true)} style={{
            background:C.red, border:"none", color:"#fff",
            padding:"9px 16px",
            fontFamily:"'Barlow Condensed',sans-serif",fontSize:14,fontWeight:700,
            letterSpacing:2,textTransform:"uppercase",cursor:"pointer",flexShrink:0,
          }}>+ Add</button>
        </div>

        {/* FILTERS */}
        <div style={{display:"flex",gap:6,marginBottom:12,flexWrap:"wrap"}}>
          {["ALL",...POS_LIST].map(p=>(
            <button key={p} onClick={()=>setFilterPos(p)} style={{
              padding:"5px 11px", border:`1px solid ${filterPos===p?(POS_COLOR[p]||C.red):C.border}`,
              background:filterPos===p?"rgba(255,255,255,0.06)":"transparent",
              color:filterPos===p?(POS_COLOR[p]||C.red):C.muted,
              fontFamily:"'Share Tech Mono',monospace",fontSize:11,letterSpacing:1,
              cursor:"pointer",textTransform:"uppercase",
            }}>{p}</button>
          ))}
          <button onClick={()=>setShowRemoved(v=>!v)} style={{
            padding:"5px 11px", border:`1px solid ${showRemoved&&removedCount>0?"#ffb347":C.border}`,
            background:"transparent", color:showRemoved&&removedCount>0?"#ffb347":C.muted,
            fontFamily:"'Share Tech Mono',monospace",fontSize:11,letterSpacing:1,
            cursor:"pointer",textTransform:"uppercase", marginLeft:"auto",
          }}>{showRemoved?"Hide":"Show"} Removed ({removedCount})</button>
        </div>

        {/* SORT BAR */}
        <div style={{display:"flex",gap:6,marginBottom:10}}>
          {[["pos","Pos"],["name","Name"],["salary","Salary"],["penalty","Penalty"]].map(([col,label])=>(
            <button key={col} onClick={()=>doSort(col)} style={{
              padding:"4px 10px", border:`1px solid ${sortCol===col?C.red:C.border}`,
              background:"transparent", color:sortCol===col?C.red:C.muted,
              fontFamily:"'Share Tech Mono',monospace",fontSize:10,letterSpacing:1,
              cursor:"pointer",textTransform:"uppercase",
            }}>{label}{sortCol===col?(sortDir===1?"↓":"↑"):""}</button>
          ))}
        </div>

        {/* PLAYER LIST */}
        {sorted.length===0 ? (
          <div style={{textAlign:"center",padding:"40px 20px",color:C.muted,fontFamily:"'Share Tech Mono',monospace",fontSize:12}}>
            No players to display. Tap "+ Add" to add your first player.
          </div>
        ) : (
          sorted.map(p=>(
            <PlayerCard
              key={p.id} p={p}
              onEdit={id=>setEditPlayer(players.find(x=>x.id===id))}
              onRemove={toggleRemove}
              onCut={id=>setCutPlayer(players.find(x=>x.id===id))}
            />
          ))
        )}
      </div>

      {/* ── ADD MODAL ── */}
      <Modal open={addOpen} onClose={()=>setAddOpen(false)} topColor={C.red}>
        <CloseBtn onClose={()=>setAddOpen(false)} />
        <ModalTitle>Add <span style={{color:C.red}}>Player</span></ModalTitle>
        <PlayerForm
          existingNames={existingNames}
          onSave={handleAddPlayer}
          onCancel={()=>setAddOpen(false)}
          isEdit={false}
        />
      </Modal>

      {/* ── EDIT MODAL ── */}
      <Modal open={!!editPlayer} onClose={()=>setEditPlayer(null)} topColor="#4a8fd9">
        <CloseBtn onClose={()=>setEditPlayer(null)} />
        <ModalTitle>Edit <span style={{color:"#4a8fd9"}}>Player</span></ModalTitle>
        {editPlayer && (
          <PlayerForm
            initial={{...editPlayer,salary:editPlayer.salary||"",years:editPlayer.years||"",age:editPlayer.age||""}}
            existingNames={new Set()}
            onSave={handleEditPlayer}
            onCancel={()=>setEditPlayer(null)}
            isEdit={true}
          />
        )}
      </Modal>

      {/* ── CUT CONFIRM ── */}
      <Modal open={!!cutPlayer} onClose={()=>setCutPlayer(null)} topColor={C.red}>
        <CloseBtn onClose={()=>setCutPlayer(null)} />
        <div style={{textAlign:"center",padding:"8px 0"}}>
          <div style={{fontSize:32,marginBottom:12}}>✂️</div>
          <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:24,fontWeight:900,letterSpacing:2,textTransform:"uppercase",color:C.red,marginBottom:8}}>Cut Player?</div>
          <p style={{color:C.muted,fontSize:14,lineHeight:1.7,marginBottom:10}}>
            Release <strong style={{color:C.white}}>{cutPlayer?.name}</strong> from your roster?<br/>You can undo with Reset before saving.
          </p>
          {cutPlayer && calcPenalty(cutPlayer)>0 && (
            <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:11,color:"#ff8888",background:"rgba(200,16,46,0.08)",border:"1px solid rgba(200,16,46,0.2)",padding:"9px 13px",marginBottom:20}}>
              ⚠ Dead cap penalty: ${calcPenalty(cutPlayer)} ({cutPlayer.years} yrs × ${cutPlayer.salary} × 0.5)
            </div>
          )}
          <div style={{display:"flex",gap:10,marginTop:16}}>
            <RedBtn onClick={doCut}>Cut Player</RedBtn>
            <GhostBtn onClick={()=>setCutPlayer(null)}>Cancel</GhostBtn>
          </div>
        </div>
      </Modal>

      {/* ── SAVE CONFIRM ── */}
      <Modal open={saveOpen} onClose={()=>setSaveOpen(false)} topColor="#4a8fd9">
        <CloseBtn onClose={()=>setSaveOpen(false)} />
        <div style={{textAlign:"center",padding:"8px 0"}}>
          <div style={{fontSize:32,marginBottom:12}}>💾</div>
          <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:24,fontWeight:900,letterSpacing:2,textTransform:"uppercase",color:"#4a8fd9",marginBottom:8}}>Save Roster?</div>
          <p style={{color:C.muted,fontSize:14,lineHeight:1.7,marginBottom:10}}>
            Are you sure? This becomes the new saved state — Reset will revert to this point going forward.
          </p>
          {removedCount>0 && (
            <div style={{fontFamily:"'Share Tech Mono',monospace",fontSize:11,color:"#90c8ff",background:"rgba(74,144,217,0.08)",border:"1px solid rgba(74,144,217,0.2)",padding:"9px 13px",marginBottom:16}}>
              Note: {removedCount} removed player(s) will be permanently cut on save
            </div>
          )}
          <div style={{display:"flex",gap:10,marginTop:16}}>
            <RedBtn onClick={doSave} style={{background:"#2a6e2e"}}>Yes, Save</RedBtn>
            <GhostBtn onClick={()=>setSaveOpen(false)}>Cancel</GhostBtn>
          </div>
        </div>
      </Modal>

      {/* ── RESET CONFIRM ── */}
      <Modal open={resetOpen} onClose={()=>setResetOpen(false)} topColor="#b07000">
        <CloseBtn onClose={()=>setResetOpen(false)} />
        <div style={{textAlign:"center",padding:"8px 0"}}>
          <div style={{fontSize:32,marginBottom:12}}>↩</div>
          <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:24,fontWeight:900,letterSpacing:2,textTransform:"uppercase",color:"#ffb347",marginBottom:8}}>Reset Roster?</div>
          <p style={{color:C.muted,fontSize:14,lineHeight:1.7,marginBottom:10}}>
            Discard all unsaved changes and revert to your last saved roster?<br/>
            <strong style={{color:C.white}}>All edits, additions, and removals will be undone.</strong>
          </p>
          <div style={{display:"flex",gap:10,marginTop:20}}>
            <RedBtn onClick={doReset} style={{background:"#8a5500"}}>Yes, Reset</RedBtn>
            <GhostBtn onClick={()=>setResetOpen(false)}>Cancel</GhostBtn>
          </div>
        </div>
      </Modal>

      {/* TOAST */}
      {toast && (
        <div style={{
          position:"fixed", bottom:20, left:"50%", transform:"translateX(-50%)",
          background:C.surface2, border:`1px solid ${C.border}`,
          borderLeft:`4px solid ${toast.color}`,
          color:C.offwhite, padding:"11px 22px",
          fontFamily:"'Share Tech Mono',monospace", fontSize:12, letterSpacing:0.5,
          boxShadow:"0 8px 30px rgba(0,0,0,0.5)", zIndex:9999, whiteSpace:"nowrap",
          animation:"fadeUp 0.3s ease both",
        }}>{toast.msg}</div>
      )}
    </>
  );
}
