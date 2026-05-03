// Kawaii pages: Home / Favorites / Chat / Calendar / Map
const { useState: useK, useEffect: useKE, useRef: useKR, useMemo: useKM } = React;

// ====== Role config ======
const ROLES = {
  her: {
    name: '公主', en: 'La Princesse', img: '/public/her%20pic.png',
    accent: '#e8a4c9', accentDark: '#c97b8a', accentLight: '#f9c5d1',
    greet: '今天想去哪裡？', readOnly: false,
  },
  him: {
    name: '王子', en: 'Le Prince', img: '/public/him%20pic.png',
    accent: '#9bb3e8', accentDark: '#6b8bd8', accentLight: '#c5d4f9',
    greet: '今天有什麼安排？', readOnly: true,
  },
};

// ====== Sample data ======
const FAVORITES = [
  { id: 1, name: 'Cocoism 巧克力專門', tag: '法式甜點', mood: '紀念日', city: '台北 大安', img: 'linear-gradient(135deg, #d4a574 0%, #6b2737 100%)', note: '招牌可可慕斯一定要點，搭配深焙咖啡。' },
  { id: 2, name: '日和洋菓子店', tag: '蛋糕', mood: '週末早午茶', city: '台北 中山', img: 'linear-gradient(135deg, #f9c5d1 0%, #c97b8a 100%)', note: '靠窗的兩人座最棒，下午三點有陽光。' },
  { id: 3, name: '巴黎麵包屋', tag: '麵包 · 可頌', mood: '週末早午茶', city: '台北 信義', img: 'linear-gradient(135deg, #e8a4c9 0%, #8b6db5 100%)', note: '每週六新出爐草莓可頌，11 點前要到。' },
  { id: 4, name: '櫻丘 Pâtisserie', tag: '法式甜點', mood: '想吃甜的時候', city: '台北 東區', img: 'linear-gradient(135deg, #c8b3e8 0%, #4a2d7a 100%)', note: '聖多諾黑跟蒙布朗都好吃，二樓更安靜。' },
  { id: 5, name: 'Olu Olu 早午餐', tag: '早午餐', mood: '懶懶的週日', city: '台北 民生社區', img: 'linear-gradient(135deg, #9bb3e8 0%, #2d1b4e 100%)', note: '夏威夷風的鬆餅，記得加椰奶醬。' },
];
const CHATS = [
  { from: 'her', text: '今天晚餐想吃點不一樣的 ✨' },
  { from: 'bot', text: '看了你的收藏，櫻丘 Pâtisserie 從上次標記到現在還沒去過。要幫你查今天有沒有位嗎？' },
  { from: 'her', text: '好欸！但他六點半才下班，可以嗎？' },
  { from: 'bot', text: '櫻丘最後點餐 21:00，七點到剛好。我已經把 19:00 - 21:00 的時段先放上日曆草稿，等你確認。' },
  { from: 'her', text: '完美 💕 確認！' },
];

// ====== Floating Decoration Layer ======
function Decorations({ count = 18 }) {
  const dots = useKM(() => {
    return Array.from({ length: count }, (_, i) => {
      const t = ['heart', 'star', 'star', 'heart'][i % 4];
      return {
        i, t,
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: 12 + Math.random() * 18,
        delay: Math.random() * 4,
        dur: 4 + Math.random() * 6,
      };
    });
  }, [count]);
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{zIndex: 1}}>
      {dots.map(d => (
        <span
          key={d.i}
          className={`deco-${d.t} sparkle`}
          style={{
            left: `${d.left}%`,
            top: `${d.top}%`,
            fontSize: d.size,
            animationDelay: `${d.delay}s`,
            animationDuration: `${d.dur}s`,
          }}
        />
      ))}
    </div>
  );
}

// ====== Page Wrapper ======
function KawaiiPage({ children, useImage = false }) {
  return (
    <div className="page-stage">
      {useImage ? <div className="kawaii-bg" /> : <div className="kawaii-bg-solid" />}
      <Decorations />
      <div className="page-scroll">{children}</div>
    </div>
  );
}

// ====== HOME PAGE ======
function HomePage({ role, go }) {
  const cfg = ROLES[role];
  const [scrollY, setScrollY] = useK(0);
  useKE(() => {
    const el = document.querySelector('.page-scroll');
    if (!el) return;
    const onScroll = () => setScrollY(el.scrollTop);
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  const heroScale = Math.max(0.6, 1 - scrollY * 0.0008);
  const heroOpacity = Math.max(0, 1 - scrollY * 0.003);
  const heroRotate = scrollY * 0.02;

  return (
    <KawaiiPage useImage={true}>
      {/* HERO */}
      <section className="relative px-8" style={{height: '100vh', minHeight: 700}}>
        <div className="absolute inset-0 flex items-center justify-between max-w-6xl mx-auto" style={{padding: '80px 32px'}}>
          {/* Left text */}
          <div className="flex-1 max-w-md" style={{opacity: heroOpacity, transform: `translateY(${scrollY * -0.3}px)`}}>
            <p className="font-paris-display italic mb-4 text-glow" style={{color: cfg.accent, fontSize: 22}}>
              Bonjour, {cfg.en}
            </p>
            <h1 className="font-serif-tc font-black text-glow" style={{color: 'white', fontSize: 'clamp(44px, 6vw, 84px)', lineHeight: 1.1, marginBottom: 24}}>
              {cfg.greet}
            </h1>
            <p className="font-serif-tc" style={{color: 'rgba(255,255,255,0.75)', fontSize: 18, lineHeight: 1.8}}>
              你的口袋名單裡有 <span style={{color: cfg.accentLight, fontWeight: 700}}>5</span> 家還沒去過的甜點店，
              這週六晚上有空檔。
            </p>
            <div className="flex gap-3 mt-8">
              <button className="btn-kawaii" onClick={() => go(`${role}-chat`)}>跟 AI 聊聊</button>
              <button className="btn-kawaii" onClick={() => go(`${role}-favorites`)} style={{background: 'rgba(254,245,250,0.15)', backdropFilter: 'blur(10px)', border: '1px solid rgba(254,245,250,0.3)'}}>看我的收藏</button>
            </div>
          </div>

          {/* Right character */}
          <div className="hidden md:block flex-1 relative" style={{height: '100%'}}>
            <img
              src={cfg.img}
              alt={role}
              className="absolute float-y"
              style={{
                right: 0, bottom: 0,
                height: '95%',
                transform: `scale(${heroScale}) rotate(${heroRotate}deg)`,
                filter: `drop-shadow(0 30px 60px ${cfg.accent}40)`,
                transformOrigin: 'bottom center',
              }}
            />
          </div>
        </div>

        {/* Scroll cue */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 sparkle" style={{color: 'white', opacity: 0.5}}>
          <p className="font-paris-display tracking-[0.4em] text-xs">SCROLL</p>
          <div style={{width: 1, height: 30, background: 'white'}} />
        </div>
      </section>

      {/* QUICK STATS — slide-in cards */}
      <section className="px-8 py-20 relative" style={{zIndex: 2}}>
        <div className="max-w-6xl mx-auto">
          <p className="font-paris-display italic mb-2" style={{color: cfg.accent, fontSize: 16}}>— 今天的小總結 —</p>
          <h2 className="font-serif-tc font-bold mb-12" style={{color: 'white', fontSize: 'clamp(28px, 3.5vw, 44px)'}}>
            數字告訴你
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { num: '12', label: '本週吃了', sub: '比上週多 3 家' },
              { num: '5', label: '想去清單', sub: '下次見面前安排' },
              { num: '24', label: '兩人收藏', sub: '愛意 ++' },
            ].map((s, i) => (
              <SlideInCard key={s.num} delay={i * 100} dir={i % 2 === 0 ? 'left' : 'right'}>
                <div className="glass-kawaii rounded-3xl p-8 transition-transform hover:scale-105 hover:-rotate-1 cursor-pointer">
                  <div className="font-paris-display italic" style={{color: cfg.accentLight, fontSize: 96, lineHeight: 1, fontWeight: 900}}>
                    {s.num}
                  </div>
                  <p className="font-serif-tc font-bold mt-2" style={{color: 'white', fontSize: 20}}>{s.label}</p>
                  <p className="font-serif-tc mt-1" style={{color: 'rgba(255,255,255,0.6)', fontSize: 14}}>{s.sub}</p>
                </div>
              </SlideInCard>
            ))}
          </div>
        </div>
      </section>

      {/* HORIZONTAL CAROUSEL — recent favorites */}
      <section className="py-20 relative" style={{zIndex: 2}}>
        <div className="max-w-6xl mx-auto px-8 mb-8 flex items-end justify-between">
          <div>
            <p className="font-paris-display italic" style={{color: cfg.accent, fontSize: 16}}>— Recently Saved —</p>
            <h2 className="font-serif-tc font-bold mt-1" style={{color: 'white', fontSize: 'clamp(28px, 3.5vw, 44px)'}}>
              最近收藏
            </h2>
          </div>
          <button className="font-serif-tc font-bold opacity-60 hover:opacity-100" style={{color: cfg.accentLight}} onClick={() => go(`${role}-favorites`)}>
            查看全部 →
          </button>
        </div>
        <div className="flex gap-6 overflow-x-auto px-8 pb-8" style={{scrollSnapType: 'x mandatory', scrollbarWidth: 'none'}}>
          {FAVORITES.map((f, i) => (
            <div key={f.id} className="flex-shrink-0 transition-transform hover:scale-105 hover:-translate-y-2" style={{
              width: 280, scrollSnapAlign: 'start',
            }}>
              <div className="rounded-3xl overflow-hidden" style={{background: f.img, height: 200}}>
                <div className="h-full flex items-end p-6">
                  <div>
                    <p className="font-serif-tc font-bold text-shadow-soft" style={{color: 'white', fontSize: 22}}>{f.name}</p>
                    <p className="font-serif-tc opacity-80" style={{color: 'white', fontSize: 13}}>{f.city}</p>
                  </div>
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold" style={{background: cfg.accent, color: 'white'}}>{f.tag}</span>
                <span className="px-3 py-1 rounded-full text-xs font-bold glass-kawaii" style={{color: 'white'}}>{f.mood}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* QUICK ACTIONS GRID */}
      <section className="px-8 py-20 relative" style={{zIndex: 2}}>
        <div className="max-w-6xl mx-auto">
          <p className="font-paris-display italic mb-2" style={{color: cfg.accent, fontSize: 16}}>— Jump to —</p>
          <h2 className="font-serif-tc font-bold mb-12" style={{color: 'white', fontSize: 'clamp(28px, 3.5vw, 44px)'}}>
            繼續探索
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { id: `${role}-favorites`, en: 'FAVORITES', tc: '我的收藏', desc: '24 家口袋名單，按心情分類' },
              { id: `${role}-chat`, en: 'AI · CHAT', tc: '美食對話', desc: '想不到吃什麼？問問看' },
              { id: `${role}-calendar`, en: 'CALENDAR', tc: '美食日曆', desc: '這週的約會與下週的計畫' },
              { id: `${role}-map`, en: 'MAP', tc: '地圖探索', desc: '找附近還沒去過的店' },
            ].map((a, i) => (
              <SlideInCard key={a.id} delay={i * 80} dir={i % 2 === 0 ? 'left' : 'right'}>
                <button onClick={() => go(a.id)} className="w-full text-left glass-kawaii rounded-3xl p-8 transition-all hover:scale-[1.02] hover:-translate-y-1 group block">
                  <p className="font-paris-display tracking-[0.3em] text-xs mb-3" style={{color: cfg.accentLight}}>{a.en}</p>
                  <h3 className="font-serif-tc font-bold mb-2" style={{color: 'white', fontSize: 28}}>{a.tc}</h3>
                  <p className="font-serif-tc" style={{color: 'rgba(255,255,255,0.6)', fontSize: 15}}>{a.desc}</p>
                  <div className="mt-6 font-paris-display italic transition-transform group-hover:translate-x-2" style={{color: cfg.accent, fontSize: 16}}>Open →</div>
                </button>
              </SlideInCard>
            ))}
          </div>
        </div>
        <div className="text-center pt-16 pb-8 font-paris-display italic" style={{color: 'rgba(255,255,255,0.3)'}}>
          — Sweet Food Diary · {cfg.en} —
        </div>
      </section>
    </KawaiiPage>
  );
}

// Reusable slide-in observer
function SlideInCard({ children, delay = 0, dir = 'left' }) {
  const ref = useKR(null);
  useKE(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) setTimeout(() => el.classList.add('in'), delay);
    }, { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, [delay]);
  return <div ref={ref} className={dir === 'left' ? 'reveal-left' : 'reveal-right'}>{children}</div>;
}

// ====== FAVORITES PAGE — Scroll Stack ======
function FavoritesPage({ role }) {
  const cfg = ROLES[role];
  const [filter, setFilter] = useK('全部');
  const tags = ['全部', '法式甜點', '蛋糕', '麵包 · 可頌', '早午餐'];
  const list = filter === '全部' ? FAVORITES : FAVORITES.filter(f => f.tag === filter);

  return (
    <KawaiiPage>
      {/* Sticky filter header */}
      <div className="sticky top-0 z-20 px-8 pt-20 pb-6" style={{background: 'linear-gradient(180deg, rgba(45,27,78,0.9) 0%, rgba(45,27,78,0.6) 70%, transparent 100%)', backdropFilter: 'blur(20px)'}}>
        <div className="max-w-4xl mx-auto">
          <p className="font-paris-display italic mb-2" style={{color: cfg.accent, fontSize: 16}}>— My Pocket List —</p>
          <h1 className="font-serif-tc font-black mb-6 text-glow" style={{color: 'white', fontSize: 'clamp(36px, 5vw, 64px)', lineHeight: 1}}>
            收藏 <span style={{color: cfg.accentLight, fontSize: 'clamp(20px, 2vw, 28px)', fontWeight: 400}}>· {list.length} 家</span>
          </h1>
          <div className="flex gap-2 overflow-x-auto" style={{scrollbarWidth: 'none'}}>
            {tags.map(t => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className="px-4 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap"
                style={{
                  background: filter === t ? `linear-gradient(135deg, ${cfg.accent}, ${cfg.accentDark})` : 'rgba(254,245,250,0.1)',
                  color: 'white',
                  backdropFilter: 'blur(10px)',
                  border: filter === t ? `1px solid ${cfg.accentLight}` : '1px solid rgba(254,245,250,0.2)',
                  boxShadow: filter === t ? `0 8px 24px ${cfg.accent}40` : 'none',
                }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stack */}
      <div className="max-w-3xl mx-auto pt-12 pb-32 relative" style={{zIndex: 2}}>
        <div className="stack-container">
          {list.map((f, i) => (
            <div key={f.id} className="stack-card" style={{
              top: `${100 + i * 24}px`,
              background: f.img,
              boxShadow: `0 -8px 0 0 rgba(45,27,78,0.4), 0 30px 80px rgba(0,0,0,0.5)`,
            }}>
              <div className="absolute inset-0 p-10 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-paris-display italic" style={{color: 'rgba(255,255,255,0.85)', fontSize: 18}}>
                      No. {String(i + 1).padStart(2, '0')}
                    </p>
                    <h2 className="font-serif-tc font-black text-shadow-soft mt-2" style={{color: 'white', fontSize: 48, lineHeight: 1.1}}>
                      {f.name}
                    </h2>
                    <p className="font-serif-tc mt-2 text-shadow-soft" style={{color: 'rgba(255,255,255,0.85)', fontSize: 16}}>
                      {f.city} · {f.tag}
                    </p>
                  </div>
                  <button className="text-3xl" style={{color: cfg.accentLight, filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.5))'}}>♥</button>
                </div>
                <div>
                  <p className="font-serif-tc text-shadow-soft" style={{color: 'white', fontSize: 18, lineHeight: 1.6, maxWidth: 480}}>
                    "{f.note}"
                  </p>
                  <div className="mt-6 flex gap-3 items-center">
                    <span className="px-4 py-2 rounded-full text-sm font-bold glass-kawaii-strong">
                      {f.mood}
                    </span>
                    <span className="font-paris-display italic" style={{color: 'rgba(255,255,255,0.7)', fontSize: 14}}>
                      saved · 3 days ago
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* End mascot */}
        <div className="text-center mt-32">
          <img src="/public/cute%20pic.png" alt="cute" className="float-y mx-auto" style={{height: 180, filter: `drop-shadow(0 12px 32px ${cfg.accent}60)`}} />
          <p className="font-serif-tc mt-6" style={{color: 'white', fontSize: 18}}>還想加更多嗎？</p>
          {!cfg.readOnly && (
            <button className="btn-kawaii mt-4">+ 新增收藏</button>
          )}
          {cfg.readOnly && (
            <p className="mt-4 font-paris-display italic" style={{color: 'rgba(255,255,255,0.4)'}}>
              ( 閱讀模式 · 由公主管理 )
            </p>
          )}
        </div>
      </div>
    </KawaiiPage>
  );
}

// ====== CHAT PAGE ======
function ChatPage({ role }) {
  const cfg = ROLES[role];
  const [msgs, setMsgs] = useK(() => CHATS.slice(0, 0));
  const [input, setInput] = useK('');
  const endRef = useKR(null);

  useKE(() => {
    let i = 0;
    const tick = () => {
      if (i >= CHATS.length) return;
      setMsgs(prev => [...prev, CHATS[i]]);
      i++;
      setTimeout(tick, 1100);
    };
    setTimeout(tick, 500);
  }, []);

  useKE(() => {
    const el = document.querySelector('.page-scroll');
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [msgs]);

  const send = () => {
    if (!input.trim()) return;
    setMsgs(p => [...p, { from: role, text: input }]);
    setInput('');
    setTimeout(() => setMsgs(p => [...p, { from: 'bot', text: '收到！讓我想想 ✨' }]), 800);
  };

  const prompts = ['今晚吃什麼？', '推薦下午茶', '查我的口袋名單', '安排週末約會'];

  return (
    <KawaiiPage>
      {/* Sticky chat header with character */}
      <div className="sticky top-0 z-20 px-8 pt-16 pb-4" style={{background: 'linear-gradient(180deg, rgba(45,27,78,0.92) 0%, rgba(45,27,78,0.7) 80%, transparent 100%)', backdropFilter: 'blur(20px)'}}>
        <div className="max-w-3xl mx-auto flex items-center gap-4">
          <div className="relative" style={{width: 64, height: 64}}>
            <div className="absolute inset-0 rounded-full" style={{background: `linear-gradient(135deg, ${cfg.accent}, ${cfg.accentDark})`, animation: 'pulse-glow 2s ease-in-out infinite'}} />
            <img src={cfg.img} alt={role} className="absolute inset-0 w-full h-full object-cover rounded-full float-y-slow" style={{padding: 3, objectPosition: 'top'}} />
          </div>
          <div className="flex-1">
            <p className="font-paris-display italic" style={{color: cfg.accent, fontSize: 14}}>{cfg.en} · AI</p>
            <h1 className="font-serif-tc font-bold" style={{color: 'white', fontSize: 28}}>美食對話</h1>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold" style={{background: 'rgba(120, 220, 150, 0.2)', color: '#90f0a8', border: '1px solid rgba(144, 240, 168, 0.4)'}}>
            ● ONLINE
          </span>
        </div>
      </div>

      {/* Messages */}
      <div className="max-w-3xl mx-auto px-8 pt-8 pb-32 relative" style={{zIndex: 2}}>
        {msgs.map((m, i) => {
          if (m.from === 'bot') {
            return (
              <div key={i} className="flex items-end gap-2 mb-3" style={{animationDelay: `${i * 50}ms`}}>
                <div className="text-2xl" style={{filter: `drop-shadow(0 0 8px ${cfg.accent})`}}>✦</div>
                <div className="chat-bubble-bot">
                  <p className="font-paris-display italic text-xs mb-1 opacity-70">AI Assistant</p>
                  {m.text}
                </div>
              </div>
            );
          }
          if (m.from === role) {
            return <div key={i} className="chat-bubble-her" style={{background: `linear-gradient(135deg, ${cfg.accent}, ${cfg.accentDark})`, boxShadow: `0 4px 16px ${cfg.accent}50`}}>{m.text}</div>;
          }
          return <div key={i} className="chat-bubble-him">{m.text}</div>;
        })}
        <div ref={endRef} />
      </div>

      {/* Sticky input bar */}
      <div className="fixed bottom-0 left-0 right-0 px-8 pt-4 pb-8" style={{background: 'linear-gradient(0deg, rgba(45,27,78,0.95) 0%, rgba(45,27,78,0.6) 80%, transparent 100%)', backdropFilter: 'blur(20px)', zIndex: 30}}>
        <div className="max-w-3xl mx-auto">
          {/* Prompt chips */}
          <div className="flex gap-2 mb-3 overflow-x-auto pb-2" style={{scrollbarWidth: 'none'}}>
            {prompts.map(p => (
              <button key={p} onClick={() => setInput(p)} className="map-chip flex-shrink-0">
                {p}
              </button>
            ))}
          </div>
          <div className="flex gap-2 items-center glass-kawaii rounded-full pl-6 pr-2 py-2">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              placeholder="跟 AI 聊聊今天想吃什麼..."
              className="flex-1 bg-transparent outline-none font-serif-tc"
              style={{color: 'white', fontSize: 16, padding: '8px 0'}}
            />
            <button onClick={send} className="btn-kawaii" style={{padding: '12px 24px', background: `linear-gradient(135deg, ${cfg.accent}, ${cfg.accentDark})`}}>
              發送
            </button>
          </div>
        </div>
      </div>
    </KawaiiPage>
  );
}

// ====== CALENDAR PAGE ======
function CalendarPage({ role }) {
  const cfg = ROLES[role];
  const today = new Date();
  const [selected, setSelected] = useK(today.getDate());
  const [month] = useK(today.getMonth());
  const [year] = useK(today.getFullYear());

  const monthName = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'][month];
  const enMonth = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][month];
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const eventDays = [3, 8, 14, 20, 27];

  const events = {
    14: [{ time: '19:00', name: 'Cocoism 巧克力專門', tag: '紀念日' }],
    20: [{ time: '11:30', name: '日和洋菓子店', tag: '週末早午茶' }],
    27: [{ time: '15:00', name: '櫻丘 Pâtisserie', tag: '想吃甜的時候' }, { time: '19:30', name: '巴黎麵包屋', tag: '晚餐' }],
  };

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push({ blank: true, key: `b${i}` });
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ d, hasEvent: eventDays.includes(d), today: d === today.getDate(), key: d });
  }

  const todayEvents = events[selected] || [];

  return (
    <KawaiiPage>
      <div className="max-w-6xl mx-auto px-8 pt-20 pb-16 relative" style={{zIndex: 2}}>
        {/* Header */}
        <div className="flex items-end justify-between mb-12 reveal in">
          <div>
            <p className="font-paris-display italic" style={{color: cfg.accent, fontSize: 18}}>— Sweet Days —</p>
            <h1 className="font-serif-tc font-black text-glow mt-2" style={{color: 'white', fontSize: 'clamp(48px, 6vw, 80px)', lineHeight: 1}}>
              {monthName}
            </h1>
            <p className="font-paris-display italic mt-2" style={{color: 'rgba(255,255,255,0.5)', fontSize: 24}}>{enMonth} · {year}</p>
          </div>
          <div className="flex gap-2">
            <button className="w-12 h-12 rounded-full glass-kawaii flex items-center justify-center text-white text-xl hover:scale-110 transition-transform">‹</button>
            <button className="w-12 h-12 rounded-full glass-kawaii flex items-center justify-center text-white text-xl hover:scale-110 transition-transform">›</button>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr_360px] gap-12">
          {/* Calendar */}
          <div>
            <div className="grid grid-cols-7 gap-2 mb-3 font-paris-display tracking-widest text-sm" style={{color: cfg.accentLight}}>
              {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(d => (
                <div key={d} className="text-center py-2">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2">
              {cells.map((c) => c.blank ? (
                <div key={c.key} className="cal-cell muted" />
              ) : (
                <button
                  key={c.key}
                  onClick={() => setSelected(c.d)}
                  className={`cal-cell glass-kawaii ${c.today ? 'today' : ''} ${c.hasEvent ? 'has-event' : ''}`}
                  style={{
                    color: c.today ? 'white' : 'white',
                    fontSize: 18,
                    background: selected === c.d ? `linear-gradient(135deg, ${cfg.accent}, ${cfg.accentDark})` : (c.today ? `linear-gradient(135deg, ${cfg.accent}, ${cfg.accentDark})` : undefined),
                    boxShadow: selected === c.d ? `0 8px 24px ${cfg.accent}50` : undefined,
                  }}
                >
                  <span style={{fontSize: 18, fontWeight: 700}}>{c.d}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Detail panel */}
          <aside className="lg:sticky lg:top-24 self-start" style={{height: 'fit-content'}}>
            <div className="glass-kawaii rounded-3xl p-8">
              <p className="font-paris-display italic" style={{color: cfg.accent, fontSize: 14}}>
                {monthName} {selected}, {year}
              </p>
              <h3 className="font-serif-tc font-bold mb-6 mt-1" style={{color: 'white', fontSize: 32}}>
                {todayEvents.length === 0 ? '空白的一天' : `${todayEvents.length} 個約會`}
              </h3>
              {todayEvents.length === 0 ? (
                <div className="text-center py-12">
                  <img src="/public/cute%20pic.png" alt="" className="mx-auto float-y" style={{height: 120}} />
                  <p className="font-serif-tc mt-4" style={{color: 'rgba(255,255,255,0.6)'}}>
                    這天還沒有計畫
                  </p>
                  {!cfg.readOnly && (
                    <button className="btn-kawaii mt-4 text-sm" style={{padding: '8px 20px'}}>+ 加一個</button>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {todayEvents.map((e, i) => (
                    <div key={i} className="rounded-2xl p-4" style={{background: `linear-gradient(135deg, ${cfg.accent}40, ${cfg.accentDark}40)`, border: `1px solid ${cfg.accentLight}40`}}>
                      <p className="font-paris-display italic" style={{color: cfg.accentLight, fontSize: 14}}>{e.time}</p>
                      <p className="font-serif-tc font-bold mt-1" style={{color: 'white', fontSize: 18}}>{e.name}</p>
                      <p className="font-serif-tc mt-1" style={{color: 'rgba(255,255,255,0.7)', fontSize: 13}}>{e.tag}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Mini upcoming list */}
            <div className="glass-kawaii rounded-3xl p-6 mt-4">
              <p className="font-paris-display italic mb-4" style={{color: cfg.accent, fontSize: 14}}>UPCOMING</p>
              <div className="space-y-3">
                {Object.entries(events).filter(([d]) => Number(d) >= selected).slice(0, 3).map(([d, evs]) => (
                  <button key={d} onClick={() => setSelected(Number(d))} className="w-full text-left flex items-center gap-3 hover:opacity-80">
                    <div className="font-paris-display font-black" style={{color: cfg.accentLight, fontSize: 32, lineHeight: 1, minWidth: 40}}>
                      {String(d).padStart(2, '0')}
                    </div>
                    <div>
                      <p className="font-serif-tc font-bold" style={{color: 'white', fontSize: 14}}>{evs[0].name}</p>
                      <p className="font-serif-tc opacity-60" style={{color: 'white', fontSize: 12}}>{evs[0].time} · {evs[0].tag}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </KawaiiPage>
  );
}

// ====== MAP PAGE ======
function MapPage({ role }) {
  const cfg = ROLES[role];
  const [chip, setChip] = useK('全部');
  const chips = ['全部', '附近 · 1km', '法式甜點', '蛋糕', '麵包', '早午餐'];
  const [activePin, setActivePin] = useK(0);

  return (
    <div className="page-stage" style={{height: '100vh'}}>
      <div className="kawaii-bg-solid" />

      {/* Map area */}
      <div className="absolute inset-0" style={{top: 0, paddingTop: 0}}>
        {/* Placeholder map — actual implementation would use Google Maps Embed */}
        <div className="w-full h-full relative overflow-hidden" style={{
          background: `
            radial-gradient(circle at 30% 40%, ${cfg.accent}30 0%, transparent 30%),
            radial-gradient(circle at 70% 60%, ${cfg.accentDark}30 0%, transparent 30%),
            linear-gradient(180deg, #1a0f30 0%, #2d1b4e 100%)
          `,
        }}>
          {/* Decorative grid */}
          <div className="absolute inset-0" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }} />

          {/* Pins */}
          {FAVORITES.map((f, i) => {
            const positions = [{l: '25%', t: '35%'}, {l: '60%', t: '45%'}, {l: '40%', t: '60%'}, {l: '75%', t: '30%'}, {l: '50%', t: '70%'}];
            const pos = positions[i] || {l: '50%', t: '50%'};
            const isActive = activePin === i;
            return (
              <button
                key={f.id}
                onClick={() => setActivePin(i)}
                className="absolute transition-all"
                style={{
                  left: pos.l, top: pos.t,
                  transform: `translate(-50%, -100%) scale(${isActive ? 1.3 : 1})`,
                  zIndex: isActive ? 10 : 5,
                }}
              >
                <div className="relative">
                  <div className="rounded-full flex items-center justify-center font-serif-tc font-black text-white" style={{
                    width: isActive ? 48 : 40, height: isActive ? 48 : 40,
                    background: `linear-gradient(135deg, ${cfg.accent}, ${cfg.accentDark})`,
                    boxShadow: `0 8px 24px ${cfg.accent}, 0 0 0 4px rgba(254,245,250,0.2)`,
                    fontSize: 16,
                  }}>
                    {i + 1}
                  </div>
                  {isActive && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 glass-kawaii-strong rounded-2xl px-4 py-2 whitespace-nowrap" style={{minWidth: 180}}>
                      <p className="font-serif-tc font-bold text-sm">{f.name}</p>
                      <p className="font-serif-tc text-xs opacity-70">{f.tag}</p>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Sticky search overlay */}
      <div className="absolute top-0 left-0 right-0 z-20 px-8 pt-20 pb-6" style={{background: 'linear-gradient(180deg, rgba(45,27,78,0.85) 0%, transparent 100%)', backdropFilter: 'blur(8px)'}}>
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <p className="font-paris-display italic" style={{color: cfg.accent, fontSize: 16}}>— Discover Map —</p>
            <h1 className="font-serif-tc font-bold" style={{color: 'white', fontSize: 28}}>地圖探索</h1>
          </div>
          <div className="glass-kawaii-strong rounded-full px-6 py-3 flex items-center gap-3 max-w-xl">
            <span style={{color: cfg.accentDark, fontSize: 20}}>⌕</span>
            <input placeholder="搜尋餐廳、咖啡店、甜點..." className="flex-1 bg-transparent outline-none font-serif-tc" style={{fontSize: 15}} />
          </div>
          <div className="flex gap-2 mt-4 overflow-x-auto" style={{scrollbarWidth: 'none'}}>
            {chips.map(c => (
              <button key={c} onClick={() => setChip(c)} className={`map-chip ${chip === c ? 'active' : ''}`} style={chip === c ? {background: `linear-gradient(135deg, ${cfg.accent}, ${cfg.accentDark})`} : {}}>
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom drawer — sliding list */}
      <div className="absolute bottom-0 left-0 right-0 z-20" style={{maxHeight: '40vh'}}>
        <div className="glass-kawaii rounded-t-[32px] p-6" style={{borderTop: `2px solid ${cfg.accent}40`, backdropFilter: 'blur(28px)'}}>
          <div className="w-12 h-1 mx-auto rounded-full mb-4" style={{background: 'rgba(255,255,255,0.3)'}} />
          <p className="font-paris-display italic mb-3" style={{color: cfg.accent, fontSize: 14}}>NEAR YOU · {FAVORITES.length} places</p>
          <div className="flex gap-3 overflow-x-auto pb-2" style={{scrollbarWidth: 'none'}}>
            {FAVORITES.map((f, i) => (
              <button
                key={f.id}
                onClick={() => setActivePin(i)}
                className="flex-shrink-0 text-left transition-transform hover:-translate-y-1"
                style={{
                  width: 240,
                  borderRadius: 18,
                  overflow: 'hidden',
                  background: f.img,
                  border: activePin === i ? `2px solid ${cfg.accentLight}` : '2px solid transparent',
                  boxShadow: activePin === i ? `0 12px 32px ${cfg.accent}60` : 'none',
                }}
              >
                <div className="p-4 h-32 flex flex-col justify-end">
                  <div className="font-paris-display italic text-xs text-white opacity-80">No. {String(i + 1).padStart(2, '0')}</div>
                  <p className="font-serif-tc font-bold text-shadow-soft mt-1" style={{color: 'white', fontSize: 18, lineHeight: 1.2}}>{f.name}</p>
                  <p className="font-serif-tc text-shadow-soft" style={{color: 'rgba(255,255,255,0.85)', fontSize: 12}}>{f.city} · {f.tag}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <Decorations count={8} />
    </div>
  );
}

Object.assign(window, { HomePage, FavoritesPage, ChatPage, CalendarPage, MapPage });
