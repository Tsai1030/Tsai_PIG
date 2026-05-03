// Romantic Paris pages: Landing + Login
const { useState, useEffect, useRef, useCallback } = React;

// ====== Reusable: Scroll Reveal hook ======
function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) el.classList.add('in'); },
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return ref;
}

// ====== Reusable: Parallax scroll value ======
function useScrollY(scrollEl) {
  const [y, setY] = useState(0);
  useEffect(() => {
    const el = scrollEl?.current;
    if (!el) return;
    const onScroll = () => setY(el.scrollTop);
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [scrollEl]);
  return y;
}

// ====== Landing Page ======
function LandingPage({ onEnter }) {
  const scrollRef = useRef(null);
  const y = useScrollY(scrollRef);

  const titleRef = useReveal();
  const storyRef = useReveal();
  const story2Ref = useReveal();
  const featRef1 = useReveal();
  const featRef2 = useReveal();
  const featRef3 = useReveal();
  const ctaRef = useReveal();

  return (
    <div className="page-stage">
      <div ref={scrollRef} className="page-scroll" style={{background: '#1a0e0a'}}>
        {/* HERO */}
        <section className="relative" style={{height: '100vh', minHeight: 720}}>
          <div className="paris-bg parallax-hero" style={{transform: `translateY(${y * 0.4}px) scale(${1 + y * 0.0003})`}} />
          <div className="paris-grain" />

          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6" style={{zIndex: 2}}>
            <div ref={titleRef} className="reveal-scale">
              <p className="font-paris-display tracking-[0.5em] text-paris-gold mb-6" style={{color: '#d4a574', fontSize: 14, letterSpacing: '0.5em'}}>
                EST · 2026 · PARIS
              </p>
              <h1 className="font-paris-display text-shadow-soft" style={{
                color: '#f5e8d8',
                fontSize: 'clamp(64px, 11vw, 160px)',
                lineHeight: 0.95,
                fontWeight: 400,
                fontStyle: 'italic',
                margin: 0,
              }}>
                甜蜜<br />食記
              </h1>
              <div className="flex items-center justify-center gap-4 mt-8">
                <span style={{height: 1, width: 60, background: '#d4a574'}} />
                <p className="font-paris-display tracking-widest" style={{color: '#f5e8d8', fontSize: 18, letterSpacing: '0.3em'}}>
                  Sweet Food Diary
                </p>
                <span style={{height: 1, width: 60, background: '#d4a574'}} />
              </div>
            </div>

            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 animate-pulse" style={{color: '#f5e8d8', opacity: 0.7}}>
              <p className="font-serif-tc text-xs tracking-[0.4em]">SCROLL</p>
              <div style={{width: 1, height: 40, background: '#f5e8d8'}} />
            </div>
          </div>
        </section>

        {/* STORY */}
        <section className="relative px-8 py-32" style={{background: 'linear-gradient(180deg, #1a0e0a 0%, #2a1a18 100%)'}}>
          <div className="max-w-5xl mx-auto">
            <div ref={storyRef} className="reveal text-center mb-20">
              <p className="font-paris-display italic mb-4" style={{color: '#d4a574', fontSize: 20}}>— Chapter One —</p>
              <h2 className="font-serif-tc font-bold mb-6" style={{color: '#f5e8d8', fontSize: 'clamp(36px, 5vw, 64px)'}}>
                兩個人的食譜
              </h2>
              <p className="font-serif-tc mx-auto" style={{color: 'rgba(245,232,216,0.7)', fontSize: 18, lineHeight: 1.9, maxWidth: 600}}>
                從清晨的可頌到深夜的甜湯，每一次一起坐下吃飯，<br />都是寫在這座城市裡的小章節。
              </p>
            </div>

            <div ref={story2Ref} className="reveal grid md:grid-cols-2 gap-12 mt-24">
              <div className="reveal-left in">
                <div className="text-5xl font-paris-display italic mb-4" style={{color: '#d4a574'}}>她</div>
                <h3 className="font-serif-tc font-bold mb-4" style={{color: '#f5e8d8', fontSize: 32}}>規劃者</h3>
                <p className="font-serif-tc" style={{color: 'rgba(245,232,216,0.65)', fontSize: 16, lineHeight: 1.8}}>
                  尋找新店、收藏夢想清單、安排約會。她讓每一週都有期待。
                </p>
                <div className="flex gap-4 mt-8 text-sm font-paris-display tracking-wider" style={{color: '#c97b8a'}}>
                  <span>CALENDAR</span>
                  <span>·</span>
                  <span>FAVORITES</span>
                  <span>·</span>
                  <span>MAP</span>
                </div>
              </div>
              <div className="reveal-right in">
                <div className="text-5xl font-paris-display italic mb-4" style={{color: '#d4a574'}}>他</div>
                <h3 className="font-serif-tc font-bold mb-4" style={{color: '#f5e8d8', fontSize: 32}}>執行者</h3>
                <p className="font-serif-tc" style={{color: 'rgba(245,232,216,0.65)', fontSize: 16, lineHeight: 1.8}}>
                  收到提醒、確認時間、出發。他把每一份計畫變成現場的擁抱。
                </p>
                <div className="flex gap-4 mt-8 text-sm font-paris-display tracking-wider" style={{color: '#c97b8a'}}>
                  <span>NOTIFY</span>
                  <span>·</span>
                  <span>EXECUTE</span>
                  <span>·</span>
                  <span>CHAT</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES — sticky stack */}
        <section className="relative px-8 py-32" style={{background: '#2a1a18'}}>
          <div className="max-w-4xl mx-auto">
            <p className="font-paris-display italic text-center mb-4" style={{color: '#d4a574', fontSize: 20}}>— Chapter Two —</p>
            <h2 className="font-serif-tc font-bold text-center mb-20" style={{color: '#f5e8d8', fontSize: 'clamp(32px, 4vw, 56px)'}}>
              一起記錄的方式
            </h2>

            <div className="space-y-32">
              {[
                { ref: featRef1, num: '01', en: 'CALENDAR', tc: '行事曆同步', desc: '她在日曆裡標記下週的法式午茶，他打開就看見了。共享、不打擾，就像放在客廳桌上的便條紙。' },
                { ref: featRef2, num: '02', en: 'FAVORITES', tc: '心動口袋名單', desc: '看到喜歡的店一鍵收藏，加上心情標籤。「下雨天想去的咖啡」「適合慶生的法餐」，找回憶不再翻聊天紀錄。' },
                { ref: featRef3, num: '03', en: 'AI · CHAT', tc: '對話式靈感', desc: '不知道吃什麼？問問你們的 AI 美食家。它知道你的收藏、你的口味、你上週去過哪。' },
              ].map((f, i) => (
                <div key={f.num} ref={f.ref} className={i % 2 === 0 ? 'reveal-left' : 'reveal-right'}>
                  <div className="flex items-start gap-8 md:gap-12">
                    <div className="font-paris-display italic" style={{color: '#d4a574', fontSize: 80, lineHeight: 1, opacity: 0.4}}>
                      {f.num}
                    </div>
                    <div className="flex-1">
                      <p className="font-paris-display tracking-[0.3em] text-sm mb-2" style={{color: '#c97b8a'}}>{f.en}</p>
                      <h3 className="font-serif-tc font-bold mb-4" style={{color: '#f5e8d8', fontSize: 32}}>{f.tc}</h3>
                      <p className="font-serif-tc" style={{color: 'rgba(245,232,216,0.7)', fontSize: 17, lineHeight: 1.9, maxWidth: 520}}>
                        {f.desc}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="relative px-8 py-32 text-center" style={{background: 'linear-gradient(180deg, #2a1a18 0%, #1a0e0a 100%)'}}>
          <div ref={ctaRef} className="reveal-scale max-w-3xl mx-auto">
            <p className="font-paris-display italic mb-6" style={{color: '#d4a574', fontSize: 24}}>The story begins...</p>
            <h2 className="font-serif-tc font-bold mb-12" style={{color: '#f5e8d8', fontSize: 'clamp(40px, 6vw, 72px)', lineHeight: 1.2}}>
              準備好<br />一起寫下今天了嗎
            </h2>
            <button className="btn-paris" onClick={onEnter}>
              進入我們的世界
            </button>
            <p className="mt-8 font-paris-display tracking-[0.3em] text-xs" style={{color: 'rgba(245,232,216,0.4)'}}>
              CHAPTER · 003 · BEGIN
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

// ====== Login Page ======
function LoginPage({ onLogin }) {
  const [selected, setSelected] = useState(null);
  const [password, setPassword] = useState('');
  const [shake, setShake] = useState(false);

  const submit = () => {
    if (!password) { setShake(true); setTimeout(() => setShake(false), 500); return; }
    onLogin(selected);
  };

  return (
    <div className="page-stage" style={{height: '100vh'}}>
      <div className="paris-bg" style={{filter: 'brightness(0.55) saturate(1.1) blur(2px)'}} />
      <div className="paris-grain" />

      {/* Header brand */}
      <div className="absolute top-0 left-0 right-0 z-10 px-8 py-8 flex justify-between items-center" style={{paddingTop: 80}}>
        <div className="font-paris-display italic" style={{color: '#f5e8d8', fontSize: 24}}>
          Sweet · Food · Diary
        </div>
        <div className="font-paris-display tracking-[0.3em] text-xs" style={{color: '#d4a574'}}>
          EST · 2026
        </div>
      </div>

      {/* Center content */}
      <div className="absolute inset-0 flex items-center justify-center px-6">
        <div className="w-full max-w-5xl">
          <div className="text-center mb-12">
            <p className="font-paris-display italic mb-3" style={{color: '#d4a574', fontSize: 20}}>— Welcome back —</p>
            <h1 className="font-serif-tc font-bold text-shadow-soft" style={{color: '#f5e8d8', fontSize: 'clamp(40px, 6vw, 72px)', lineHeight: 1}}>
              請選擇你的角色
            </h1>
          </div>

          {/* Role cards */}
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {[
              { role: 'her', label: '她', subtitle: 'La Princesse', desc: '美食規劃者', img: '/public/her%20pic.png', accent: '#c97b8a' },
              { role: 'him', label: '他', subtitle: 'Le Prince', desc: '美食執行者', img: '/public/him%20pic.png', accent: '#9bb3e8' },
            ].map((r) => {
              const isSelected = selected === r.role;
              const isOther = selected && selected !== r.role;
              return (
                <button
                  key={r.role}
                  onClick={() => { setSelected(r.role); setPassword(''); }}
                  className="relative overflow-hidden text-left transition-all duration-500 group"
                  style={{
                    height: 380,
                    borderRadius: 8,
                    border: `1px solid ${isSelected ? r.accent : 'rgba(212,165,116,0.3)'}`,
                    background: 'rgba(20, 10, 8, 0.5)',
                    transform: isSelected ? 'scale(1.03) translateY(-8px)' : isOther ? 'scale(0.95) translateY(0)' : 'scale(1)',
                    opacity: isOther ? 0.4 : 1,
                    boxShadow: isSelected ? `0 24px 60px ${r.accent}40, 0 0 0 1px ${r.accent}` : '0 12px 32px rgba(0,0,0,0.4)',
                    cursor: 'pointer',
                  }}
                >
                  <div className="absolute inset-0 overflow-hidden">
                    <img
                      src={r.img}
                      alt={r.role}
                      className="absolute object-contain transition-all duration-700 group-hover:scale-105"
                      style={{
                        right: -40,
                        bottom: -20,
                        height: '110%',
                        filter: isSelected ? 'none' : 'grayscale(0.3) brightness(0.85)',
                      }}
                    />
                  </div>
                  <div className="relative z-10 p-8 flex flex-col h-full justify-between">
                    <div>
                      <p className="font-paris-display italic tracking-wider" style={{color: r.accent, fontSize: 18}}>{r.subtitle}</p>
                      <h3 className="font-serif-tc font-black mt-2" style={{color: '#f5e8d8', fontSize: 80, lineHeight: 1}}>{r.label}</h3>
                    </div>
                    <div>
                      <p className="font-serif-tc" style={{color: 'rgba(245,232,216,0.8)', fontSize: 16}}>{r.desc}</p>
                      <p className="font-paris-display tracking-[0.3em] mt-2 text-xs" style={{color: r.accent}}>
                        {isSelected ? '✓ SELECTED' : 'CLICK TO ENTER'}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Password panel */}
          <div className="max-w-md mx-auto overflow-hidden transition-all duration-500" style={{
            maxHeight: selected ? 220 : 0,
            opacity: selected ? 1 : 0,
            marginTop: selected ? 32 : 0,
          }}>
            <div className="glass-paris" style={{borderRadius: 8, padding: 24}}>
              <p className="font-serif-tc mb-3" style={{color: '#2a1a18', fontSize: 14}}>
                {selected === 'her' ? '歡迎回來，公主' : '歡迎回來，王子'}
              </p>
              <div className={shake ? 'animate-pulse' : ''} style={{animation: shake ? 'shake 0.4s' : ''}}>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && submit()}
                  placeholder="輸入通關密語"
                  autoFocus
                  className="w-full px-4 py-3 outline-none font-serif-tc"
                  style={{
                    background: 'transparent',
                    borderBottom: '1px solid #6b2737',
                    color: '#2a1a18',
                    fontSize: 16,
                  }}
                />
              </div>
              <button onClick={submit} className="btn-paris mt-4 w-full" style={{padding: '12px 24px'}}>
                推開那扇門
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`@keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-8px); } 75% { transform: translateX(8px); } }`}</style>
    </div>
  );
}

Object.assign(window, { LandingPage, LoginPage, useReveal, useScrollY });
