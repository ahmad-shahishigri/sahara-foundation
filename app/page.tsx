"use client";
export default function Home() {
  return (
    <div style={pageStyle}>
      {/* ── Navigation Bar ───────────────────────────────────────────────── */}
      <nav style={navStyle}>
        <div style={navContainerStyle}>
          <div style={navBrandStyle}>
            <div style={navLogoStyle}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
              </svg>
            </div>
            <span style={navBrandTextStyle}>Sahara Welfare Foundation</span>
          </div>
          <div style={navLinksStyle}>
            <a href="/dashboard" style={navLinkStyle}>Dashboard</a>
            <a href="#" style={navLinkStyle}>About</a>
            <a href="#" style={navLinkStyle}>Donate</a>
            <a href="/dashboard" style={navCTAStyle}>Get Started →</a>
          </div>
        </div>
      </nav>

      {/* ── Hero Section ─────────────────────────────────────────────────── */}
      <main style={mainStyle}>
        <div style={orb1Style} />
        <div style={orb2Style} />
        <div style={orb3Style} />

        <div style={introStyle}>
          {/* Badge */}
          <div style={badgePillStyle}>
            <span style={badgeDotStyle} />
            <span style={badgeTextStyle}>Serving Communities Since 2016</span>
          </div>

          {/* Emblem */}
          <div style={emblemWrapStyle}>
            <div style={emblemStyle}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="white">
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 4l5 2.18V11c0 3.5-2.33 6.79-5 7.93C9.33 17.79 7 14.5 7 11V7.18L12 5z"/>
              </svg>
            </div>
          </div>

          {/* Foundation name */}
          <div style={h1WrapStyle}>
            <h1 style={h1LineOneStyle}>Sahara Welfare</h1>
            <h1 style={h1LineTwoStyle}>Foundation</h1>
          </div>

          {/* Decorative divider */}
          <div style={dividerRowStyle}>
            <div style={dividerLineStyle} />
            <div style={dividerDiamondStyle} />
            <div style={dividerLineStyle} />
          </div>

          <p style={pStyle}>
            Empowering communities through compassionate financial support.
            Track donations, manage loans, and monitor expenses — all in one place.
          </p>

          {/* Impact stats */}
          <div style={statsRowStyle}>
            <div style={statItemStyle}>
              <span style={statNumberStyle}>2,400+</span>
              <span style={statLabelStyle}>Families Helped</span>
            </div>
            <div style={statDivStyle} />
            <div style={statItemStyle}>
              <span style={statNumberStyle}>₨1.2M</span>
              <span style={statLabelStyle}>Distributed</span>
            </div>
            <div style={statDivStyle} />
            <div style={statItemStyle}>
              <span style={statNumberStyle}>98%</span>
              <span style={statLabelStyle}>Loan Recovery</span>
            </div>
          </div>

          <div style={ctasStyle}>
            <a href="/dashboard" style={primaryBtnStyle}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
              </svg>
              Go to Dashboard
            </a>
            <a href="https://www.saharafoundation.pk/" style={secondaryBtnStyle} target="_blank" rel="noopener noreferrer">
              Learn More
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 19H5V5h7V3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/>
              </svg>
            </a>
          </div>
        </div>
      </main>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer style={footerStyle}>
        {/* Wave separator */}
        <div style={{lineHeight:0}}>
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" style={{display:"block",width:"100%"}}>
            <path d="M0 60L60 50C120 40 240 20 360 15C480 10 600 20 720 28C840 36 960 42 1080 38C1200 34 1320 20 1380 13L1440 6V0H0V60Z" fill="#090d1a"/>
            <defs>
              <linearGradient id="wg" x1="0" y1="0" x2="1440" y2="0">
                <stop offset="0%" stopColor="#0f172a"/>
                <stop offset="100%" stopColor="#1e1b4b"/>
              </linearGradient>
            </defs>
          </svg>
        </div>

        <div style={footerContainerStyle}>
          <div style={footerGridStyle}>

            {/* Brand column */}
            <div style={footerBrandColStyle}>
              <div style={footerLogoRowStyle}>
                <div style={footerLogoBoxStyle}>
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="white">
                    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
                  </svg>
                </div>
                <div>
                  <h3 style={ftrH3Style}>Sahara Welfare Foundation</h3>
                  <p style={ftrTagStyle}>Building Stronger Communities</p>
                </div>
              </div>
              <div style={missionBoxStyle}>
                <p style={missionTextStyle}>
                  "Dedicated to providing financial assistance, interest-free loans, and compassionate support to those in need."
                </p>
              </div>
              <div style={socialRowStyle}>
                {[
                  {label:"Facebook", bg:"rgba(24,119,242,0.15)", border:"rgba(24,119,242,0.3)", path:<path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>},
                  {label:"Twitter",  bg:"rgba(29,161,242,0.15)", border:"rgba(29,161,242,0.3)", path:<path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/>},
                  {label:"Instagram",bg:"rgba(225,48,108,0.15)", border:"rgba(225,48,108,0.3)",  path:<path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37zM7.5 2h9A5.5 5.5 0 0122 7.5v9A5.5 5.5 0 0116.5 22h-9A5.5 5.5 0 012 16.5v-9A5.5 5.5 0 017.5 2zM17 6.5a1 1 0 100 2 1 1 0 000-2z"/>},
                  {label:"LinkedIn", bg:"rgba(0,119,181,0.15)", border:"rgba(0,119,181,0.3)",   path:<path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2zm2-6a2 2 0 110 4 2 2 0 010-4z"/>},
                ].map(s => (
                  <a key={s.label} href="#" aria-label={s.label}
                    style={{width:"38px",height:"38px",borderRadius:"10px",display:"flex",
                      alignItems:"center",justifyContent:"center",textDecoration:"none",
                      background:s.bg,border:`1px solid ${s.border}`,transition:"all 0.2s"}}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="white" stroke="none">{s.path}</svg>
                  </a>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 style={ftrSectionTitleStyle}>Quick Links</h4>
              <ul style={{listStyle:"none"}}>
                {[["About Us","#"],["Our Mission","#"],["How to Donate","#"],
                  ["Loan Application","/loanrecord"],["Success Stories","#"],["Annual Reports","/dashboard"]
                ].map(([label,href]) => (
                  <li key={label} style={{marginBottom:"12px"}}>
                    <a href={href} style={ftrLinkStyle}>
                      <span style={{color:"#6366f1",fontWeight:700}}>›</span> {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 style={ftrSectionTitleStyle}>Contact Us</h4>
              <div style={{display:"flex",flexDirection:"column",gap:"16px"}}>
                {[
                  {icon:"✉",label:"Email",value:"saharafoundation@support.pk",href:"mailto:saharafoundation@support.pk"},
                  {icon:"📞",label:"Office",value:"0310 5855299",href:"tel:03105855299"},
                  {icon:"📍",label:"Address",value:"PD House No. 249, Near Double Road, Rawalpindi",href:"#"},
                  {icon:"🕐",label:"Hours",value:"Mon–Fri: 9AM–5PM  ·  Sat: 10AM–2PM",href:"#"},
                ].map(c => (
                  <div key={c.label} style={{display:"flex",gap:"12px",alignItems:"flex-start"}}>
                    <div style={{width:"36px",height:"36px",borderRadius:"10px",flexShrink:0,
                      background:"rgba(99,102,241,0.1)",border:"1px solid rgba(99,102,241,0.2)",
                      display:"flex",alignItems:"center",justifyContent:"center",fontSize:"16px"}}>
                      {c.icon}
                    </div>
                    <div>
                      <p style={{fontSize:"11px",color:"#64748b",textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:"3px",fontWeight:600} as React.CSSProperties}>{c.label}</p>
                      <a href={c.href} style={{color:"#cbd5e1",fontSize:"13px",lineHeight:"1.5",textDecoration:"none",display:"block"}}>{c.value}</a>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Newsletter */}
            <div>
              <h4 style={ftrSectionTitleStyle}>Stay Updated</h4>
              <p style={{fontSize:"13px",color:"#64748b",lineHeight:"1.6",marginBottom:"20px"}}>
                Get updates on our initiatives and impact stories.
              </p>
              <form style={{display:"flex",flexDirection:"column",gap:"10px"}} onSubmit={e=>e.preventDefault()}>
                <input type="email" placeholder="Your email address" required
                  style={{width:"100%",padding:"11px 16px",borderRadius:"10px",
                    background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",
                    color:"white",fontSize:"14px",outline:"none"}} />
                <button type="submit"
                  style={{display:"flex",alignItems:"center",justifyContent:"center",gap:"8px",
                    padding:"11px",borderRadius:"10px",border:"none",cursor:"pointer",
                    background:"linear-gradient(135deg,#6366f1,#8b5cf6)",
                    color:"white",fontSize:"14px",fontWeight:600}}>
                  Subscribe
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M2 21l21-9L2 3v7l15 2-15 2v7z"/>
                  </svg>
                </button>
              </form>
              <div style={{display:"flex",flexDirection:"column",gap:"10px",marginTop:"20px"}}>
                {[{icon:"🛡️",text:"Trusted & Verified NGO"},{icon:"📜",text:"Registered with SECP Pakistan"}].map(b=>(
                  <div key={b.text} style={{display:"flex",alignItems:"center",gap:"10px",
                    padding:"10px 14px",borderRadius:"10px",
                    background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.06)"}}>
                    <span style={{fontSize:"16px"}}>{b.icon}</span>
                    <span style={{fontSize:"13px",color:"#94a3b8",fontWeight:500}}>{b.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer bottom bar */}
          <div style={footerBottomStyle}>
            <div style={footerBottomInnerStyle}>
              <p style={{fontSize:"13px",color:"#475569"}}>© 2024 Sahara Welfare Foundation. All Rights Reserved.</p>
              <div style={{display:"flex",gap:"20px"}}>
                {["Privacy Policy","Terms of Service","Disclaimer","Sitemap"].map(l=>(
                  <a key={l} href="#" style={{fontSize:"13px",color:"#475569",textDecoration:"none"}}>{l}</a>
                ))}
              </div>
              <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
                <span style={{fontSize:"12px",color:"#475569"}}>Accepts:</span>
                {["JazzCash","EasyPaisa","Bank Transfer"].map(t=>(
                  <span key={t} style={{fontSize:"12px",padding:"3px 10px",borderRadius:"6px",
                    background:"rgba(99,102,241,0.1)",border:"1px solid rgba(99,102,241,0.2)",
                    color:"#818cf8"}}>{t}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </footer>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        * { margin:0; padding:0; box-sizing:border-box; }
        body { font-family:'Inter',system-ui,sans-serif; }
        nav a:hover { opacity:0.75; }
        @keyframes float {
          0%,100% { transform:translateY(0px); }
          50%      { transform:translateY(-14px); }
        }
        @keyframes pulse-glow {
          0%,100% { opacity:0.35; transform:scale(1); }
          50%      { opacity:0.6;  transform:scale(1.05); }
        }
      `}</style>
    </div>
  );
}

/* ── Styles ─────────────────────────────────────────────────────────────── */

const pageStyle: React.CSSProperties = {
  minHeight:"100vh", display:"flex", flexDirection:"column",
  background:"linear-gradient(160deg,#0f172a 0%,#1e1b4b 55%,#0f172a 100%)",
  color:"white",
};

/* Nav */
const navStyle: React.CSSProperties = {
  position:"sticky",top:0,zIndex:100,
  background:"rgba(15,23,42,0.85)",backdropFilter:"blur(16px)",
  borderBottom:"1px solid rgba(255,255,255,0.06)",
};
const navContainerStyle: React.CSSProperties = {
  maxWidth:"1200px",margin:"0 auto",padding:"0 24px",
  display:"flex",alignItems:"center",justifyContent:"space-between",height:"64px",
};
const navBrandStyle: React.CSSProperties = { display:"flex",alignItems:"center",gap:"10px" };
const navLogoStyle: React.CSSProperties = {
  width:"36px",height:"36px",borderRadius:"10px",
  background:"linear-gradient(135deg,#6366f1,#8b5cf6)",
  display:"flex",alignItems:"center",justifyContent:"center",
};
const navBrandTextStyle: React.CSSProperties = { fontSize:"15px",fontWeight:700,color:"white" };
const navLinksStyle: React.CSSProperties = { display:"flex",alignItems:"center",gap:"8px" };
const navLinkStyle: React.CSSProperties = {
  padding:"8px 14px",borderRadius:"8px",
  color:"rgba(255,255,255,0.65)",fontSize:"14px",fontWeight:500,textDecoration:"none",
};
const navCTAStyle: React.CSSProperties = {
  padding:"8px 18px",borderRadius:"8px",
  background:"linear-gradient(135deg,#6366f1,#8b5cf6)",
  color:"white",fontSize:"14px",fontWeight:600,textDecoration:"none",
  boxShadow:"0 0 20px rgba(99,102,241,0.35)",
};

/* Hero */
const mainStyle: React.CSSProperties = {
  flex:1,display:"flex",alignItems:"center",justifyContent:"center",
  padding:"80px 24px",position:"relative",overflow:"hidden",
};
const orb1Style: React.CSSProperties = {
  position:"absolute",width:"500px",height:"500px",borderRadius:"50%",
  background:"radial-gradient(circle,rgba(99,102,241,0.18) 0%,transparent 70%)",
  top:"-120px",left:"-120px",pointerEvents:"none",
  animation:"pulse-glow 4s ease-in-out infinite",
};
const orb2Style: React.CSSProperties = {
  position:"absolute",width:"400px",height:"400px",borderRadius:"50%",
  background:"radial-gradient(circle,rgba(139,92,246,0.14) 0%,transparent 70%)",
  bottom:"-80px",right:"-80px",pointerEvents:"none",
  animation:"pulse-glow 5s ease-in-out infinite 1.5s",
};
const orb3Style: React.CSSProperties = {
  position:"absolute",width:"280px",height:"280px",borderRadius:"50%",
  background:"radial-gradient(circle,rgba(6,182,212,0.1) 0%,transparent 70%)",
  top:"35%",right:"15%",pointerEvents:"none",
};
const introStyle: React.CSSProperties = {
  maxWidth:"720px",textAlign:"center",position:"relative",zIndex:1,
  display:"flex",flexDirection:"column",alignItems:"center",gap:"28px",
};

/* Badge pill */
const badgePillStyle: React.CSSProperties = {
  display:"inline-flex",alignItems:"center",gap:"8px",
  padding:"6px 16px",borderRadius:"100px",
  background:"rgba(99,102,241,0.12)",border:"1px solid rgba(99,102,241,0.3)",
};
const badgeDotStyle: React.CSSProperties = {
  width:"8px",height:"8px",borderRadius:"50%",
  background:"#6366f1",boxShadow:"0 0 8px #6366f1",
};
const badgeTextStyle: React.CSSProperties = {
  fontSize:"13px",fontWeight:600,color:"#a5b4fc",letterSpacing:"0.5px",
};

/* Emblem */
const emblemWrapStyle: React.CSSProperties = { animation:"float 3.5s ease-in-out infinite" };
const emblemStyle: React.CSSProperties = {
  width:"90px",height:"90px",borderRadius:"24px",
  background:"linear-gradient(135deg,#6366f1 0%,#8b5cf6 50%,#06b6d4 100%)",
  display:"flex",alignItems:"center",justifyContent:"center",
  boxShadow:"0 0 50px rgba(99,102,241,0.5),0 20px 40px rgba(0,0,0,0.4)",
};

/* Heading */
const h1WrapStyle: React.CSSProperties = { display:"flex",flexDirection:"column",gap:"0px" };
const h1LineOneStyle: React.CSSProperties = {
  fontSize:"clamp(40px,6vw,68px)",fontWeight:900,lineHeight:1.05,
  background:"linear-gradient(135deg,#ffffff 0%,#e0e7ff 50%,#a5b4fc 100%)",
  WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text",
  letterSpacing:"-1.5px",margin:0,
};
const h1LineTwoStyle: React.CSSProperties = {
  fontSize:"clamp(40px,6vw,68px)",fontWeight:900,lineHeight:1.05,
  background:"linear-gradient(135deg,#6366f1 0%,#8b5cf6 50%,#06b6d4 100%)",
  WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text",
  letterSpacing:"-1.5px",margin:0,
};

/* Divider */
const dividerRowStyle: React.CSSProperties = {
  display:"flex",alignItems:"center",gap:"12px",width:"55%",
};
const dividerLineStyle: React.CSSProperties = {
  flex:1,height:"1px",
  background:"linear-gradient(90deg,transparent,rgba(99,102,241,0.5),transparent)",
};
const dividerDiamondStyle: React.CSSProperties = {
  width:"8px",height:"8px",transform:"rotate(45deg)",flexShrink:0,
  background:"linear-gradient(135deg,#6366f1,#8b5cf6)",
  boxShadow:"0 0 10px rgba(99,102,241,0.7)",
};

const pStyle: React.CSSProperties = {
  fontSize:"clamp(15px,2vw,19px)",color:"rgba(255,255,255,0.6)",
  lineHeight:1.8,maxWidth:"540px",
};

/* Stats */
const statsRowStyle: React.CSSProperties = {
  display:"flex",alignItems:"center",gap:"24px",
  padding:"18px 32px",borderRadius:"16px",
  background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",
  backdropFilter:"blur(12px)",
};
const statItemStyle: React.CSSProperties = {
  display:"flex",flexDirection:"column",alignItems:"center",gap:"4px",
};
const statNumberStyle: React.CSSProperties = {
  fontSize:"22px",fontWeight:800,
  background:"linear-gradient(135deg,#6366f1,#8b5cf6)",
  WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text",
};
const statLabelStyle: React.CSSProperties = {
  fontSize:"12px",color:"rgba(255,255,255,0.45)",fontWeight:500,
};
const statDivStyle: React.CSSProperties = {
  width:"1px",height:"36px",background:"rgba(255,255,255,0.08)",
};

/* CTA buttons */
const ctasStyle: React.CSSProperties = {
  display:"flex",gap:"16px",flexWrap:"wrap",justifyContent:"center",
};
const primaryBtnStyle: React.CSSProperties = {
  display:"inline-flex",alignItems:"center",gap:"8px",
  padding:"14px 28px",borderRadius:"12px",textDecoration:"none",
  background:"linear-gradient(135deg,#6366f1,#8b5cf6)",
  color:"white",fontSize:"16px",fontWeight:600,
  boxShadow:"0 8px 32px rgba(99,102,241,0.4)",
};
const secondaryBtnStyle: React.CSSProperties = {
  display:"inline-flex",alignItems:"center",gap:"8px",
  padding:"14px 28px",borderRadius:"12px",textDecoration:"none",
  background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.15)",
  color:"white",fontSize:"16px",fontWeight:600,
};

/* ── Footer styles ──────────────────────────────────────────────────────── */

const footerStyle: React.CSSProperties = {
  background:"linear-gradient(180deg,#090d1a 0%,#060810 100%)",
  color:"#cbd5e1",
};
const footerContainerStyle: React.CSSProperties = {
  maxWidth:"1200px",margin:"0 auto",padding:"48px 24px 0",
};
const footerGridStyle: React.CSSProperties = {
  display:"grid",
  gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",
  gap:"40px",paddingBottom:"48px",
};
const footerBrandColStyle: React.CSSProperties = {
  display:"flex",flexDirection:"column",gap:"20px",
};
const footerLogoRowStyle: React.CSSProperties = {
  display:"flex",alignItems:"center",gap:"14px",
};
const footerLogoBoxStyle: React.CSSProperties = {
  width:"52px",height:"52px",borderRadius:"14px",flexShrink:0,
  background:"linear-gradient(135deg,#6366f1,#8b5cf6)",
  display:"flex",alignItems:"center",justifyContent:"center",
  boxShadow:"0 0 24px rgba(99,102,241,0.4)",
};
const ftrH3Style: React.CSSProperties = {
  fontSize:"16px",fontWeight:700,color:"white",lineHeight:1.3,
};
const ftrTagStyle: React.CSSProperties = {
  fontSize:"12px",color:"#6366f1",fontWeight:600,marginTop:"3px",
  textTransform:"uppercase" as const,letterSpacing:"0.5px",
};
const missionBoxStyle: React.CSSProperties = {
  padding:"14px 16px",borderRadius:"12px",
  background:"rgba(99,102,241,0.07)",borderLeft:"3px solid #6366f1",
};
const missionTextStyle: React.CSSProperties = {
  fontSize:"13px",color:"#94a3b8",lineHeight:1.7,fontStyle:"italic",
};
const socialRowStyle: React.CSSProperties = { display:"flex",gap:"10px" };

const ftrSectionTitleStyle: React.CSSProperties = {
  fontSize:"14px",fontWeight:700,color:"white",
  marginBottom:"20px",paddingBottom:"10px",
  borderBottom:"1px solid rgba(99,102,241,0.25)",
  textTransform:"uppercase" as const,letterSpacing:"0.5px",
};
const ftrLinkStyle: React.CSSProperties = {
  color:"#94a3b8",textDecoration:"none",fontSize:"14px",
  display:"flex",alignItems:"center",gap:"8px",
};
const footerBottomStyle: React.CSSProperties = {
  borderTop:"1px solid rgba(255,255,255,0.05)",
  padding:"20px 0 28px",
};
const footerBottomInnerStyle: React.CSSProperties = {
  display:"flex",flexWrap:"wrap" as const,gap:"16px",
  justifyContent:"space-between",alignItems:"center",
};
