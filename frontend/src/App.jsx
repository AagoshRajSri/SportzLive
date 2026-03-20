import React, { useEffect, useRef, useState, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { Activity, Radio, PlayCircle, Target, X, Zap, Search } from 'lucide-react';
import SportsLoader, { getSportColor } from './components/Loader.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';

const API_URL = 'http://localhost:3000';
const WS_URL = 'ws://localhost:3000/ws';

export default function App() {
  const [loading, setLoading] = useState(true);
  const [matches, setMatches] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [commentary, setCommentary] = useState({});
  const [ws, setWs] = useState(null);

  // Layout Refs
  const headerRef = useRef(null);
  const gridRef = useRef(null);

  useEffect(() => {
    fetch(`${API_URL}/matches`)
      .then(r => r.json())
      .then(data => setMatches(data.data || []))
      .catch(err => console.error("Failed to fetch matches:", err));
  }, []);

  const socketRef = useRef(null);

  useEffect(() => {
    const socket = new WebSocket(WS_URL);
    socketRef.current = socket;

    socket.onopen = () => {
      if (socketRef.current === socket) setWs(socket);
    };

    socket.onmessage = (event) => {
      if (socketRef.current !== socket) return;
      const msg = JSON.parse(event.data);
      if (msg.type === 'match_created') {
        setMatches(prev => [msg.data, ...prev]);
      } else if (msg.type === 'commentary') {
        const payload = msg.data;
        setCommentary(prev => {
          const matchComments = prev[payload.matchId] || [];
          if (matchComments.some(c => c.id === payload.id)) return prev;
          return { ...prev, [payload.matchId]: [payload, ...matchComments] };
        });
        
        if (payload.metadata && payload.metadata.score) {
           setMatches(prev => prev.map(m => {
             if (m.id === payload.matchId) {
                return { ...m, homeScore: payload.metadata.score.home ?? m.homeScore, awayScore: payload.metadata.score.away ?? m.awayScore };
             }
             return m;
           }));
        }
      }
    };

    return () => {
      setWs(null);
      socket.onopen = null;
      socket.onmessage = null;
      if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) {
        socket.close();
      }
      if (socketRef.current === socket) socketRef.current = null;
    };
  }, []);

  // Reveal Dashboard Animations
  useLayoutEffect(() => {
    if (!loading && headerRef.current) {
      const ctx = gsap.context(() => {
        gsap.from(headerRef.current, { y: -50, opacity: 0, duration: 0.8, ease: "power3.out" });
      });
      return () => ctx.revert();
    }
  }, [loading]);

  useLayoutEffect(() => {
    if (!loading && gridRef.current && matches.length > 0) {
      const children = gridRef.current.children;
      if (children.length > 0) {
        gsap.fromTo(children, 
          { y: 60, opacity: 0, scale: 0.95 },
          { y: 0, opacity: 1, scale: 1, duration: 0.6, stagger: 0.08, ease: "back.out(1.5)" }
        );
      }
    }
  }, [loading, matches.length > 0]);

  if (loading) {
    return (
      <ErrorBoundary>
        <SportsLoader onComplete={() => setLoading(false)} />
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen pb-20 bg-gridded relative">
        <div className="max-w-[1400px] mx-auto px-6 relative z-10 pt-8">
          
          {/* Header */}
          <header ref={headerRef} className="flex justify-between items-center py-6 mb-8 border-b border-white/10">
            <div className="flex items-center gap-4">
              <span className="text-3xl">⚡</span>
              <div>
                <h1 className="text-5xl font-bebas tracking-[4px] text-white">
                  SPORTZ<span className="animate-spectrum">LIVE</span>
                </h1>
                <p className="text-xs font-mono-sport text-white/40 tracking-[2px] uppercase mt-1">
                  Global Network Feed Active
                </p>
              </div>
            </div>
            
            <div className="flex-1 flex justify-center px-8">
              <div className="glass-panel group max-w-md w-full relative flex items-center px-5 py-2.5 rounded-full border border-white/5 transition-all duration-300 focus-within:border-cyan-500/50 focus-within:ring-2 focus-within:ring-cyan-500/20">
                <Search size={18} className="text-white/30 group-focus-within:text-cyan-400 transition-colors" />
                <input 
                  type="text"
                  placeholder="SEARCH FOR NODES, TEAMS, OR SPORTS..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-transparent border-none outline-none flex-1 px-4 text-[11px] font-mono-sport tracking-[1px] text-white placeholder:text-white/20 uppercase"
                />
                <div className="absolute right-3 opacity-20 text-[9px] font-black group-focus-within:opacity-40 transition-opacity">CMD+K</div>
              </div>
            </div>
            
            <div className="glass-panel flex items-center gap-3 px-5 py-2.5 rounded-full">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
              <span className="text-xs font-mono-sport font-bold tracking-[2px] text-green-400 uppercase">Live Uplink</span>
            </div>
          </header>

          {/* Main Content */}
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            
            {/* Matches Grid */}
            <div className="flex-1 w-full relative">
              <div className="flex justify-between items-center mb-8 px-2 border-l-4 border-white pl-4">
                <h2 className="text-4xl font-bebas tracking-[2px] text-white">ACTIVE TOURNAMENTS</h2>
                <span className="text-[11px] font-mono-sport tracking-widest bg-white/10 px-3 py-1.5 rounded text-white/60">
                  DATAPOINTS: {matches.length}
                </span>
              </div>
              
              <div ref={gridRef} className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {matches
                  .filter(m => 
                    m.homeTeam.toLowerCase().includes(searchTerm.toLowerCase()) || 
                    m.awayTeam.toLowerCase().includes(searchTerm.toLowerCase()) || 
                    m.sport.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map(match => (
                  <MatchCard 
                    key={match.id} 
                    match={match} 
                    isActive={selectedMatch?.id === match.id}
                    onClick={() => setSelectedMatch(match)}
                  />
                ))}
              </div>
            </div>

            {/* Real-time Commentary Sidebar */}
            <div className="w-full lg:w-[450px] shrink-0 sticky top-8">
              <CommentaryFeed 
                match={selectedMatch} 
                comments={selectedMatch ? (commentary[selectedMatch.id] || []) : []} 
                setCommentary={setCommentary}
                ws={ws}
                onClose={() => setSelectedMatch(null)}
              />
            </div>

          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}

function MatchCard({ match, isActive, onClick }) {
  const cardRef = useRef(null);
  const sportColor = getSportColor(match.sport);
  const isLive = match.status === 'live';
  
  const handleMouseEnter = () => {
    if (!isActive) gsap.to(cardRef.current, { scale: 1.02, y: -5, duration: 0.3, ease: "power2.out" });
  };
  const handleMouseLeave = () => {
    if (!isActive) gsap.to(cardRef.current, { scale: 1, y: 0, duration: 0.3, ease: "power2.out" });
  };

  const homeRef = useRef(null);
  const awayRef = useRef(null);
  useEffect(() => {
    gsap.fromTo(homeRef.current, { scale: 1.5, color: sportColor }, { scale: 1, color: 'white', duration: 0.5 });
  }, [match.homeScore, sportColor]);
  useEffect(() => {
    gsap.fromTo(awayRef.current, { scale: 1.5, color: sportColor }, { scale: 1, color: 'white', duration: 0.5 });
  }, [match.awayScore, sportColor]);

  return (
    <div 
      ref={cardRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className={`relative glass-panel rounded-3xl p-6 cursor-pointer overflow-hidden transition-all duration-300
        ${isActive ? 'bg-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.8)]' : 'hover:bg-white/10'}
      `}
      style={{
        boxShadow: isActive ? `0 0 30px ${sportColor}44` : undefined,
        borderColor: isActive ? sportColor : 'rgba(255,255,255,0.08)'
      }}
    >
      {isActive && (
        <div style={{ background: `radial-gradient(circle at top right, ${sportColor}22 0%, transparent 60%)`}} className="absolute inset-0 pointer-events-none"></div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-8 relative z-10 border-b border-white/5 pb-4">
        <span 
           className="text-[14px] font-bebas tracking-[4px] px-4 py-1.5 rounded-sm border border-white/10 uppercase"
           style={{ color: sportColor, background: `${sportColor}11` }}
        >
          {match.sport}
        </span>
        {isLive ? (
          <div className="flex items-center gap-2 font-mono-sport text-xs tracking-widest uppercase" style={{ color: sportColor }}>
            <Radio size={12} className="animate-pulse" /> LIVE
          </div>
        ) : (
          <span className="text-[10px] font-mono-sport uppercase text-white/30 tracking-widest">SCHEDULED</span>
        )}
      </div>

      {/* Score */}
      <div className="space-y-6 relative z-10">
        <div className="flex justify-between items-center group">
          <span className="text-3xl font-bebas tracking-[2px] text-white/90 group-hover:text-white transition-colors">
            {match.homeTeam}
          </span>
          <span ref={homeRef} className="text-4xl font-bebas tracking-tighter text-white">{match.homeScore}</span>
        </div>

        <div className="flex justify-between items-center group">
          <span className="text-3xl font-bebas tracking-[2px] text-white/90 group-hover:text-white transition-colors">
            {match.awayTeam}
          </span>
          <span ref={awayRef} className="text-4xl font-bebas tracking-tighter text-white">{match.awayScore}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 flex justify-between items-center relative z-10 pt-4 opacity-50">
        <span className="text-[11px] font-mono-sport tracking-[2px]">
          MATCH-{match.id.toString().padStart(4, '0')}
        </span>
        <div className="p-2 rounded-full border border-white/20">
          <PlayCircle size={16} />
        </div>
      </div>
    </div>
  );
}

function CommentaryFeed({ match, comments, setCommentary, ws, onClose }) {
  const listRef = useRef(null);
  const containerRef = useRef(null);
  const prevCommentsLength = useRef(comments.length);

  useEffect(() => {
    if (match) {
      fetch(`${API_URL}/matches/${match.id}/commentary`)
         .then(r => r.json())
         .then(data => data && data.data && setCommentary(prev => ({ ...prev, [match.id]: data.data })));
    }
  }, [match, setCommentary]);

  useEffect(() => {
    if (match && ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'subscribe', matchId: match.id }));
      return () => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'unsubscribe', matchId: match.id }));
        }
      };
    }
  }, [match, ws]);

  useLayoutEffect(() => {
    if (!match) return;
    const ctx = gsap.context(() => {
      gsap.from(containerRef.current, { x: 50, opacity: 0, duration: 0.5, ease: "power3.out" });
    });
    return () => ctx.revert();
  }, [match?.id]);

  useEffect(() => {
    if (comments.length > prevCommentsLength.current && listRef.current) {
      const newElement = listRef.current.firstElementChild;
      if (newElement) {
        gsap.fromTo(newElement,
          { opacity: 0, x: -30, height: 0, scale: 0.9, backgroundColor: "rgba(255,255,255,0.1)" },
          { opacity: 1, x: 0, height: "auto", scale: 1, backgroundColor: "transparent", duration: 0.6, ease: "back.out(1.5)" }
        );
      }
    }
    prevCommentsLength.current = comments.length;
  }, [comments]);

  if (!match) {
    return (
      <div className="glass-panel h-[600px] rounded-3xl flex flex-col items-center justify-center p-8 text-center border-dashed border-white/20">
        <Zap size={48} className="text-white/10 mb-6" />
        <h3 className="text-2xl font-bebas tracking-[4px] text-white/50 mb-2">AWAITING CONNECTION</h3>
        <p className="text-[11px] font-mono-sport text-white/30 tracking-[1px] leading-relaxed uppercase">Select a match to initialize<br/>the live neural stream.</p>
      </div>
    );
  }

  const sportColor = getSportColor(match.sport);

  return (
    <div ref={containerRef} className="glass-panel h-[800px] flex flex-col rounded-3xl overflow-hidden" style={{ borderColor: `${sportColor}44` }}>
      
      {/* Header */}
      <div className="p-6 border-b border-white/10 relative" style={{ background: `linear-gradient(135deg, ${sportColor}11, transparent)` }}>
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full animate-ping" style={{ background: sportColor }}></div>
            <h3 className="text-[11px] font-mono-sport tracking-[2px] uppercase" style={{ color: sportColor }}>LIVE UPLINK</h3>
          </div>
          <button onClick={onClose} className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition text-white/50 hover:text-white">
            <X size={16} />
          </button>
        </div>
        
        <div className="flex justify-between items-baseline font-bebas">
          <span className="text-2xl tracking-[2px] truncate w-1/3 text-white/70">{match.homeTeam}</span>
          <span className="text-4xl tracking-tighter text-white" style={{ textShadow: `0 0 20px ${sportColor}` }}>
            {match.homeScore} - {match.awayScore}
          </span>
          <span className="text-2xl tracking-[2px] truncate w-1/3 text-right text-white/70">{match.awayTeam}</span>
        </div>
      </div>

      {/* Feed */}
      <div ref={listRef} className="flex-1 overflow-y-auto p-6 space-y-4">
        {comments.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[200px] opacity-50">
            <Activity className="animate-spin-slow mb-4 text-white/30" size={32} />
            <p className="text-[10px] font-mono-sport tracking-widest text-white/30 uppercase">Awaiting signals...</p>
          </div>
        ) : (
          comments.map((comment, idx) => (
            <div key={comment.id || idx} className="relative pl-6 group">
              <div className="absolute left-0 top-1.5 w-2 h-2 rounded-full" style={{ background: sportColor, boxShadow: `0 0 10px ${sportColor}` }}></div>
              {idx !== comments.length - 1 && (
                <div className="absolute left-[3px] top-4 w-[2px] h-[calc(100%+8px)]" style={{ background: `linear-gradient(to bottom, ${sportColor}55, transparent)` }}></div>
              )}
              
              <div className="bg-white/5 border border-white/5 rounded-2xl p-4 transition duration-300 hover:bg-white/10 hover:border-white/20">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="text-[10px] font-mono-sport tracking-widest text-white/40">
                    {new Date(comment.createdAt || new Date()).toLocaleTimeString([], { hour12: false })}
                  </span>
                  
                  {comment.minute !== null && comment.minute !== undefined && (
                    <span 
                       className="text-[10px] font-bebas tracking-[2px] px-2 py-0.5 rounded-sm"
                       style={{ color: sportColor, border: `1px solid ${sportColor}44`, background: `${sportColor}11` }}
                    >
                      {comment.minute}'
                    </span>
                  )}
                  
                  {comment.eventType && (
                    <span className="text-[10px] font-mono-sport tracking-widest px-2 py-0.5 rounded-sm uppercase text-white/50 bg-white/5">
                      {comment.eventType}
                    </span>
                  )}
                </div>
                
                {(comment.actor || comment.team) && (
                  <div className="text-[11px] font-mono-sport font-bold text-white/80 mb-2 tracking-[1px] uppercase">
                    {comment.actor} {comment.actor && comment.team ? <span className="opacity-40 mx-1">//</span> : ''} {comment.team}
                  </div>
                )}
                
                <p className="text-[13px] font-mono-sport text-white/60 leading-relaxed font-medium">
                  {comment.message}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
