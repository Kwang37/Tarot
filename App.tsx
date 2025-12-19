
import React, { useState, useEffect, useRef } from 'react';
import { 
  GameState, 
  SpreadType, 
  TarotCardData, 
  DrawnCard, 
  Orientation, 
  GestureType,
  Language
} from './types';
import { SPREADS, TAROT_DECK, TRANSLATIONS } from './constants';
import ThreeScene, { ThreeSceneHandle } from './components/ThreeScene';
import { interpretReading } from './services/geminiService';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.INTRO);
  const [lang, setLang] = useState<Language>('zh');
  const [question, setQuestion] = useState('');
  const [selectedSpread, setSelectedSpread] = useState<SpreadType>(SPREADS[0]);
  const [drawnCards, setDrawnCards] = useState<DrawnCard[]>([]);
  const [availableCards, setAvailableCards] = useState<TarotCardData[]>([...TAROT_DECK]);
  const [interpretation, setInterpretation] = useState<string>('');
  const [isCamerActive, setIsCameraActive] = useState(false);
  const [handGesture, setHandGesture] = useState<GestureType>(GestureType.NONE);
  const [isLoading, setIsLoading] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(!!process.env.API_KEY);

  const t = TRANSLATIONS[lang];
  const threeRef = useRef<ThreeSceneHandle>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const checkKey = async () => {
      // @ts-ignore
      if (window.aistudio?.hasSelectedApiKey) {
        // @ts-ignore
        const selected = await window.aistudio.hasSelectedApiKey();
        if (selected) setHasApiKey(true);
      }
    };
    checkKey();
  }, []);

  useEffect(() => {
    if (gameState === GameState.DRAWING) {
      initHands();
      if (!sessionStorage.getItem('tarot-tutorial-seen')) {
        setShowTutorial(true);
      }
    }
  }, [gameState]);

  const initHands = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setIsCameraActive(true);
      if (videoRef.current) videoRef.current.srcObject = stream;

      // @ts-ignore
      const hands = new window.Hands({
        locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
      });

      hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 1,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });

      hands.onResults((results: any) => {
        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
          const landmarks = results.multiHandLandmarks[0];
          const gesture = detectGesture(landmarks);
          setHandGesture(gesture);
          const indexTip = landmarks[8];
          threeRef.current?.setGesture(gesture, indexTip.x, indexTip.y);
        } else {
          setHandGesture(GestureType.NONE);
        }
      });

      // @ts-ignore
      const camera = new window.Camera(videoRef.current, {
        onFrame: async () => {
          await hands.send({ image: videoRef.current });
        },
        width: 640,
        height: 480
      });
      camera.start();
    } catch (err) {
      console.warn("Camera failed, fallback to mouse", err);
      setIsCameraActive(false);
      const handleMouse = (gesture: GestureType) => (e: MouseEvent) => {
        const x = e.clientX / window.innerWidth;
        const y = e.clientY / window.innerHeight;
        threeRef.current?.setGesture(gesture, x, y);
      };
      window.addEventListener('mousemove', handleMouse(GestureType.OPEN));
      window.addEventListener('mousedown', handleMouse(GestureType.PINCH));
      window.addEventListener('mouseup', handleMouse(GestureType.FIST));
    }
  };

  const handleSetKey = async () => {
    // @ts-ignore
    if (window.aistudio?.openSelectKey) {
      // @ts-ignore
      await window.aistudio.openSelectKey();
      setHasApiKey(true); // Assume success per guidelines
    } else {
      alert(lang === 'zh' ? "请在 Vercel 环境变量中设置 API_KEY。" : "Please set API_KEY in Vercel environment variables.");
    }
  };

  const detectGesture = (landmarks: any[]): GestureType => {
    const thumbTip = landmarks[4];
    const indexTip = landmarks[8];
    const middleTip = landmarks[12];
    const ringTip = landmarks[16];
    const pinkyTip = landmarks[20];
    const wrist = landmarks[0];

    const distPinch = Math.hypot(thumbTip.x - indexTip.x, thumbTip.y - indexTip.y);
    const isClosed = (tip: any) => Math.hypot(tip.x - wrist.x, tip.y - wrist.y) < 0.22;

    if (distPinch < 0.06) return GestureType.PINCH;
    if (isClosed(indexTip) && isClosed(middleTip) && isClosed(ringTip) && isClosed(pinkyTip)) return GestureType.FIST;
    if (!isClosed(indexTip) && isClosed(middleTip) && isClosed(ringTip) && isClosed(pinkyTip)) return GestureType.POINT;
    
    return GestureType.OPEN;
  };

  const prepareNextCard = () => {
    if (availableCards.length === 0) return;
    const randomIndex = Math.floor(Math.random() * availableCards.length);
    const card = availableCards[randomIndex];
    threeRef.current?.setActiveCard(card);
  };

  const handleCardConfirmed = (card: TarotCardData, orientation: Orientation) => {
    const newDrawn = [...drawnCards, { card, orientation, timestamp: Date.now() }];
    setDrawnCards(newDrawn);
    setAvailableCards(prev => prev.filter(c => c.id !== card.id));

    if (newDrawn.length >= selectedSpread.count) {
      setGameState(GameState.READING);
      performReading(newDrawn);
    } else {
      prepareNextCard();
    }
  };

  const performReading = async (cards: DrawnCard[]) => {
    setIsLoading(true);
    const res = await interpretReading(question, lang === 'zh' ? selectedSpread.name : selectedSpread.nameEn, cards, lang);
    setInterpretation(res);
    setIsLoading(false);
  };

  const dismissTutorial = () => {
    setShowTutorial(false);
    sessionStorage.setItem('tarot-tutorial-seen', 'true');
    prepareNextCard();
  };

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden select-none text-gray-200">
      <ThreeScene ref={threeRef} onCardConfirmed={handleCardConfirmed} />

      <div className="absolute top-4 left-4 z-50 flex gap-2">
        <button onClick={() => setLang('zh')} className={`px-3 py-1 rounded-md text-xs font-bold border border-white/10 transition-colors ${lang === 'zh' ? 'bg-white text-black shadow-lg' : 'bg-white/5 hover:bg-white/10 opacity-60'}`}>中</button>
        <button onClick={() => setLang('en')} className={`px-3 py-1 rounded-md text-xs font-bold border border-white/10 transition-colors ${lang === 'en' ? 'bg-white text-black shadow-lg' : 'bg-white/5 hover:bg-white/10 opacity-60'}`}>EN</button>
      </div>

      <div className={`fixed top-4 right-4 w-40 h-32 glass rounded-lg overflow-hidden transition-opacity z-40 border border-white/20 shadow-2xl ${gameState === GameState.DRAWING ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <video ref={videoRef} className="w-full h-full object-cover mirror scale-x-[-1]" autoPlay muted />
        <div className="absolute bottom-1 left-1 px-1.5 bg-black/70 rounded text-[9px] uppercase font-bold text-cyan-400 tracking-tighter">
          {isCamerActive ? `${t.handMode}: ${handGesture}` : t.mouseMode}
        </div>
      </div>

      {showTutorial && (
        <div className="absolute inset-0 bg-black/95 flex items-center justify-center z-[100] p-6 text-center animate-in fade-in duration-500 backdrop-blur-xl">
          <div className="max-w-xl glass p-12 rounded-[4rem] border border-white/20 shadow-[0_0_100px_rgba(255,255,255,0.1)]">
            <h3 className="text-4xl font-serif mb-12 tracking-widest text-white">{t.gestureTitle}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-14">
              <div className="flex flex-col items-center gap-4 group">
                <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-white/30 transition-all duration-500">
                   <span className="text-5xl group-hover:scale-110 transition-transform">🖐️</span>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-white/40">{t.gestureOpen.split(':')[0]}</p>
                  <p className="text-xs text-white/80 font-light">{t.gestureOpen.split(':')[1]}</p>
                </div>
              </div>
              <div className="flex flex-col items-center gap-4 group">
                <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-white/30 transition-all duration-500">
                   <span className="text-5xl group-hover:scale-110 transition-transform">🤏</span>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-white/40">{t.gesturePinch.split(':')[0]}</p>
                  <p className="text-xs text-white/80 font-light">{t.gesturePinch.split(':')[1]}</p>
                </div>
              </div>
              <div className="flex flex-col items-center gap-4 group">
                <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-white/30 transition-all duration-500">
                   <span className="text-5xl group-hover:scale-110 transition-transform">✊</span>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-white/40">{t.gestureFist.split(':')[0]}</p>
                  <p className="text-xs text-white/80 font-light">{t.gestureFist.split(':')[1]}</p>
                </div>
              </div>
            </div>
            <button onClick={dismissTutorial} className="px-16 py-5 bg-white text-black rounded-full text-xs font-bold uppercase tracking-[0.3em] hover:scale-105 active:scale-95 transition-all shadow-2xl">{t.gotIt}</button>
          </div>
        </div>
      )}

      {gameState === GameState.INTRO && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10 bg-black/40 backdrop-blur-[2px]">
          <h1 className="text-7xl font-serif mb-6 tracking-[0.2em] text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]">{t.title}</h1>
          <p className="max-w-lg text-xl text-gray-300 mb-12 font-light italic leading-relaxed opacity-80">{t.subtitle}</p>
          <button onClick={() => setGameState(GameState.SETUP)} className="px-16 py-5 border border-white/40 rounded-full glass hover:bg-white hover:text-black hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] transition-all duration-700 tracking-[0.4em] uppercase text-sm">{t.enter}</button>
        </div>
      )}

      {gameState === GameState.SETUP && (
        <div className="absolute inset-0 flex items-center justify-center p-6 z-10 animate-in fade-in zoom-in-95 duration-700">
          <div className="max-w-2xl w-full glass p-10 rounded-[2.5rem] shadow-2xl border border-white/10 overflow-y-auto max-h-[90vh]">
            <h2 className="text-4xl font-serif mb-8 text-white border-b border-white/10 pb-6 tracking-wide">{t.intent}</h2>
            
            <div className="space-y-8">
              {!hasApiKey && (
                <div className="p-4 rounded-2xl bg-orange-500/10 border border-orange-500/30 flex flex-col gap-3">
                  <div className="text-orange-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                    ⚠️ {lang === 'zh' ? '未配置神谕密钥' : 'No Oracle Key Configured'}
                  </div>
                  <p className="text-xs opacity-70 leading-relaxed italic">
                    {lang === 'zh' 
                      ? '为了获得 AI 解读，请点击下方按钮关联你的 Gemini API 密钥。' 
                      : 'To receive AI interpretations, link your Gemini API key below.'}
                  </p>
                  <button 
                    onClick={handleSetKey}
                    className="py-2 px-4 bg-orange-500 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-orange-600 transition-colors w-fit"
                  >
                    {lang === 'zh' ? '配置密钥' : 'Configure Key'}
                  </button>
                  <a 
                    href="https://ai.google.dev/gemini-api/docs/billing" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[9px] text-cyan-400 underline opacity-60 hover:opacity-100 transition-opacity"
                  >
                    {lang === 'zh' ? '计费与项目文档' : 'Billing & Documentation'}
                  </a>
                </div>
              )}

              <div>
                <label className="block text-[10px] uppercase tracking-[0.3em] mb-3 opacity-40 font-bold">{t.questionLabel}</label>
                <textarea 
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder={t.questionPlaceholder}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 focus:ring-1 focus:ring-white outline-none transition-all h-36 resize-none text-xl font-light tracking-wide text-white placeholder:opacity-20 shadow-inner"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-[0.3em] mb-3 opacity-40 font-bold">{t.chooseSpread}</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {SPREADS.map(s => (
                    <button 
                      key={s.id}
                      onClick={() => setSelectedSpread(s)}
                      className={`p-5 rounded-2xl border transition-all ${selectedSpread.id === s.id ? 'border-white bg-white/15 shadow-[0_0_15px_rgba(255,255,255,0.1)]' : 'border-white/10 bg-white/5 hover:bg-white/10 opacity-60'}`}
                    >
                      <div className="font-bold text-sm mb-1 text-white">{lang === 'zh' ? s.name : s.nameEn}</div>
                      <div className="text-[9px] opacity-40 uppercase tracking-widest">{s.count} Card{s.count > 1 ? 's' : ''}</div>
                    </button>
                  ))}
                </div>
              </div>

              <button 
                onClick={() => {
                  if(!question) return alert(lang === 'zh' ? "请输入你的问题。" : "Please enter your question.");
                  setGameState(GameState.DRAWING);
                }}
                className="w-full py-5 bg-white text-black rounded-2xl font-bold uppercase tracking-[0.2em] hover:scale-[1.01] active:scale-95 transition-all shadow-[0_10px_30px_rgba(255,255,255,0.15)] mt-4"
              >
                {t.commence}
              </button>
            </div>
          </div>
        </div>
      )}

      {gameState === GameState.DRAWING && !showTutorial && (
        <div className="absolute bottom-10 inset-x-0 flex flex-col items-center pointer-events-none animate-in fade-in duration-1000">
           <div className="glass px-8 py-4 rounded-full mb-4 flex items-center gap-10 border border-white/10 shadow-2xl">
            {selectedSpread.slots.map((slot, i) => (
              <div key={i} className={`flex items-center gap-3 transition-all duration-500 ${i < drawnCards.length ? 'text-cyan-400' : 'opacity-20'}`}>
                <div className={`w-2 h-2 rounded-full ${i === drawnCards.length ? 'bg-white animate-pulse shadow-[0_0_10px_white]' : i < drawnCards.length ? 'bg-cyan-400' : 'bg-white/20'}`} />
                <span className="text-[10px] uppercase tracking-[0.2em] font-bold">{lang === 'zh' ? slot : selectedSpread.slotsEn[i]}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {gameState === GameState.READING && (
        <div className="absolute inset-0 bg-[#020202]/95 flex flex-col z-50 animate-in slide-in-from-bottom duration-1000 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-8 md:p-16 scroll-smooth custom-scrollbar">
            <div className="max-w-5xl mx-auto space-y-16">
              <div className="text-center space-y-4">
                <h1 className="text-[10px] uppercase tracking-[0.6em] text-white/30">{t.spiritualInsight}</h1>
                <p className="text-4xl md:text-5xl font-serif text-white italic tracking-tight leading-tight max-w-3xl mx-auto">"{question}"</p>
              </div>

              <div className="flex justify-center gap-10 flex-wrap py-4">
                {drawnCards.map((dc, i) => (
                  <div key={i} className="text-center group animate-in zoom-in duration-700 delay-[300ms]">
                    <div className="relative mb-6">
                      <div className="absolute -inset-4 bg-white/5 blur-2xl rounded-full scale-0 group-hover:scale-100 transition-transform duration-700" />
                      <img src={dc.card.imageUrl} className={`w-40 h-64 object-cover rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-white/20 transition-all duration-700 group-hover:border-white/50 group-hover:translate-y-[-10px] ${dc.orientation === Orientation.REVERSED ? 'rotate-180' : ''}`} />
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-black border border-white/20 px-3 py-1 rounded-full text-[9px] font-bold text-white/80 uppercase tracking-widest shadow-xl backdrop-blur-md">
                        {lang === 'zh' ? selectedSpread.slots[i] : selectedSpread.slotsEn[i]}
                      </div>
                    </div>
                    <div className="font-serif text-2xl text-white mb-1 group-hover:text-cyan-400 transition-colors">{lang === 'zh' ? dc.card.name : dc.card.nameEn}</div>
                    <div className={`text-[10px] uppercase font-bold tracking-[0.2em] ${dc.orientation === Orientation.REVERSED ? 'text-orange-500' : 'text-cyan-500'}`}>
                      {dc.orientation === Orientation.REVERSED ? t.reversed : t.upright}
                    </div>
                  </div>
                ))}
              </div>

              <div className="relative group max-w-3xl mx-auto">
                <div className="absolute -inset-1 bg-gradient-to-b from-white/10 to-transparent blur opacity-20" />
                <div className="relative glass p-10 md:p-14 rounded-[3rem] shadow-2xl border border-white/5 min-h-[300px]">
                  {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-48 gap-6">
                      <div className="w-10 h-10 border-2 border-white/10 border-t-white rounded-full animate-spin" />
                      <div className="text-[10px] uppercase tracking-[0.4em] text-white/40 animate-pulse">{t.consulting}</div>
                    </div>
                  ) : (
                    <div className="prose prose-invert prose-lg max-w-none animate-in fade-in slide-in-from-top-4 duration-1000 delay-500">
                      {interpretation.split('\n').map((line, idx) => (
                        <p key={idx} className="mb-4 last:mb-0">
                          {line.startsWith('**') ? <span className="text-white font-serif text-2xl block border-b border-white/5 pb-2 mb-4 mt-8 first:mt-0">{line.replace(/\*\*/g, '')}</span> : line.startsWith('- ') || line.startsWith('* ') ? <span className="flex gap-3 text-white/70 pl-4 italic border-l border-white/10"><span className="text-cyan-500 text-sm">•</span>{line.substring(2)}</span> : line}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-center pb-24">
                <button onClick={() => window.location.reload()} className="px-14 py-4 glass rounded-full hover:bg-white/10 border border-white/10 text-[10px] uppercase tracking-[0.5em] text-white/50 hover:text-white transition-all duration-500 shadow-lg">{t.return}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
