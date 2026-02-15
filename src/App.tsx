import React, { useEffect, useState, useRef } from 'react';
import {
  Heart,
  Smile,
  Star,
  MessageCircle,
  Circle,
  Sun,
  Clock3,
  Navigation,
  ArrowRight,
  User
} from 'lucide-react';
import { supabase } from './lib/supabase';

const App: React.FC = () => {
  const [activeSection, setActiveSection] = useState('cover');
  const [showToast, setShowToast] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [wishes, setWishes] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    guests: '1',
    wish: ''
  });

  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const toggleMusic = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(e => console.error("Playback failed:", e));
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Fetch wishes from Supabase
  useEffect(() => {
    const fetchWishes = async () => {
      const { data, error } = await supabase
        .from('rsvps')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching wishes:', error);
      } else {
        setWishes(data || []);
      }
    };

    fetchWishes();

    // Subscribe to real-time changes
    const channel = supabase
      .channel('public:rsvps')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'rsvps' }, (payload) => {
        setWishes((prev) => [payload.new, ...prev]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observerOptions = {
      root: containerRef.current,
      threshold: 0.5,
    };

    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
          entry.target.classList.add('active');
        }
      });
    }, observerOptions);

    const sections = document.querySelectorAll('.snap-section');
    sections.forEach(section => sectionObserver.observe(section));

    return () => sectionObserver.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      // Start music when opening invitation
      if (id === 'doa' && !isPlaying) {
        audioRef.current?.play().catch(e => console.error("Autoplay blocked:", e));
        setIsPlaying(true);
      }
    }
  };

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const targetDate = new Date('2026-02-17T10:00:00+07:00').getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance < 0) {
        clearInterval(interval);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleRSVP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.wish) {
      setIsLoading(true);
      const { error } = await supabase
        .from('rsvps')
        .insert([
          {
            name: formData.name,
            guests: parseInt(formData.guests),
            wish: formData.wish
          }
        ]);

      setIsLoading(false);

      if (error) {
        alert('Gagal mengirim RSVP. Silakan coba lagi.');
        console.error('Error inserting RSVP:', error);
      } else {
        setShowToast(true);
        setFormData({ name: '', guests: '1', wish: '' });
        setTimeout(() => setShowToast(false), 3000);
      }
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <div ref={containerRef} className="snap-container">
        {/* SECTION 1: COVER */}
        <section
          id="cover"
          className="snap-section relative flex flex-col items-center justify-center text-center text-white bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url("/bg.webp")' }}
        >
          {/* Decorative Elements */}
          <div className="absolute inset-0 z-0">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="absolute bg-white rounded-full animate-twinkle"
                style={{
                  width: Math.random() * 8 + 4 + 'px',
                  height: Math.random() * 8 + 4 + 'px',
                  top: Math.random() * 100 + '%',
                  left: Math.random() * 100 + '%',
                  opacity: Math.random() * 0.5 + 0.2,
                  animationDelay: Math.random() * 3 + 's'
                }}
              />
            ))}
            <div className="absolute top-10 left-[-10%] w-60 h-40 bg-white/10 blur-3xl rounded-full" />
            <div className="absolute top-20 right-[-10%] w-40 h-30 bg-white/5 blur-2xl rounded-full" />
          </div>

          {/* Content */}
          <div className="relative z-10 px-6 animate-slide-up">
            <p className="text-sm uppercase tracking-[0.25em] mb-6 font-semibold -mt-8" style={{ color: '#6c52a1' }}>
              UNDANGAN TASYAKURAN AQIQAH
            </p>
            <div
              className="mb-8 px-12 py-20 bg-contain bg-center bg-no-repeat flex items-center justify-center min-h-[220px] w-full scale-125"
              style={{ backgroundImage: 'url("/shape.webp")' }}
            >
              <h1 className="font-display text-[24px] font-bold text-glow text-white leading-tight px-4 text-center">
                Muhammad Hanan Al Fitrah
              </h1>
            </div>
            <p className="mb-8 font-medium" style={{ color: '#6c52a1' }}>
              Putra dari Idul Fitrah & Eka Yuliana
            </p>
            <div className="inline-block px-8 py-2 bg-white/40 backdrop-blur-md rounded-full border border-white/30 mb-12 font-bold" style={{ color: '#6c52a1' }}>
              17 Februari 2026
            </div>
            <button
              onClick={() => scrollTo('doa')}
              className="bg-white text-primary font-bold px-10 py-3 rounded-btn shadow-soft animate-bounce-gentle transition-transform active:scale-95"
            >
              BUKA UNDANGAN
            </button>
          </div>
        </section>

        {/* SECTION 2: DOA */}
        <section
          id="doa"
          className="snap-section relative bg-cover bg-center bg-no-repeat flex flex-col items-center justify-center"
          style={{ backgroundImage: 'url("/bg.webp")' }}
        >
          {/* Masjid Illustration Top */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[320px] pt-8 px-6 reveal">
            <img
              src="/masjid.webp"
              alt="Masjid"
              className="w-full h-auto drop-shadow-lg"
            />
          </div>

          <div className="reveal relative z-10 w-full mt-12 px-2">
            <div className="bg-white/90 backdrop-blur-sm p-8 rounded-lg shadow-soft text-center">
              <h2 className="font-display text-2xl font-bold text-center mb-6" style={{ color: 'rgb(108, 82, 161)' }}>
                Doa untuk Putra Kami
              </h2>
              <p className="text-xl font-body mb-4 leading-loose text-brown" dir="rtl">
                أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّةِ مِنْ كُلِّ شَيْطَانٍ وَهَامَّةٍ وَمِنْ كُلِّ عَيْنٍ لَامَّةٍ
              </p>
              <div className="w-12 h-0.5 bg-accent mx-auto mb-4" />
              <p className="text-sm text-muted-foreground italic">
                "Aku berlindung dengan kalimat-kalimat Allah yang sempurna dari setiap setan dan binatang berbisa serta dari setiap mata yang dengki."
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 3: PROFIL */}
        <section
          id="profil"
          className="snap-section relative bg-cover bg-center bg-no-repeat flex flex-col items-center justify-center p-6"
          style={{ backgroundImage: 'url("/bg.webp")' }}
        >
          <div className="bg-white/90 backdrop-blur-sm p-8 rounded-lg shadow-large text-center reveal w-full">
            <div className="w-40 h-40 mx-auto mb-6 bg-secondary rounded-full flex items-center justify-center overflow-hidden shadow-inner border-4 border-white/50 relative">
              <img
                src="/baby.png"
                alt="Muhammad Hanan Al Fitrah"
                className="w-full h-full object-cover scale-150 origin-center"
              />
            </div>
            <p className="text-sm mb-4 leading-relaxed text-brown">
              Dengan penuh rasa syukur kepada Allah SWT, kami mengundang Bapak/Ibu/Saudara/i untuk hadir dalam acara Tasyakuran Aqiqah putra kami tercinta:
            </p>
            <h3 className="font-display text-2xl font-bold mb-2" style={{ color: 'rgb(108, 82, 161)' }}>
              Muhammad Hanan Al Fitrah
            </h3>
            <div className="w-12 h-0.5 bg-accent mx-auto mb-4" />
            <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">
              Putra dari
            </p>
            <p className="font-semibold text-brown">
              Idul Fitrah & Eka Yuliana
            </p>
          </div>
        </section>

        {/* SECTION 4: ACARA */}
        <section
          id="acara"
          className="snap-section relative bg-cover bg-center bg-no-repeat flex flex-col items-center justify-center p-6"
          style={{ backgroundImage: 'url("/bg.webp")' }}
        >
          <div className="w-full reveal">
            <h2 className="font-display text-2xl font-bold text-center mb-8 drop-shadow-md" style={{ color: 'rgb(108, 82, 161)' }}>
              Detail Acara
            </h2>

            {/* Countdown Timer */}
            <div className="flex justify-center gap-3 mb-10">
              <CountdownBox value={timeLeft.days} label="Hari" />
              <CountdownBox value={timeLeft.hours} label="Jam" />
              <CountdownBox value={timeLeft.minutes} label="Menit" />
              <CountdownBox value={timeLeft.seconds} label="Detik" />
            </div>

            <div className="space-y-4">
              <div className="bg-white/90 backdrop-blur-sm p-5 rounded-lg shadow-soft flex items-center gap-4">
                <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center shrink-0">
                  <Sun className="text-primary" size={24} strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Tanggal</p>
                  <p className="font-semibold text-brown">17 Februari 2026</p>
                </div>
              </div>
              <div className="bg-white/90 backdrop-blur-sm p-5 rounded-lg shadow-soft flex items-center gap-4">
                <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center shrink-0">
                  <Clock3 className="text-primary" size={24} strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Waktu</p>
                  <p className="font-semibold text-brown">Pukul 10.00 WIB – Selesai</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 5: LOKASI */}
        <section
          id="lokasi"
          className="snap-section relative bg-cover bg-center bg-no-repeat flex flex-col items-center justify-center p-6"
          style={{ backgroundImage: 'url("/bg.webp")' }}
        >
          <div className="w-full reveal z-10">
            <h2 className="font-display text-2xl font-bold text-center mb-6 drop-shadow-md -mt-12" style={{ color: 'rgb(108, 82, 161)' }}>
              Lokasi Acara
            </h2>

            <div className="bg-white/90 backdrop-blur-sm p-6 rounded-lg shadow-soft text-center">
              <div className="w-full h-64 rounded-lg overflow-hidden mb-6 border border-primary/10 shadow-inner">
                <iframe
                  title="Lokasi Acara"
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  style={{ border: 0 }}
                  src="https://maps.google.com/maps?q=-5.23366,119.464269&z=17&output=embed"
                  allowFullScreen
                ></iframe>
              </div>
              <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                <Navigation className="text-primary" size={24} strokeWidth={1.5} />
              </div>
              <p className="font-semibold text-brown mb-1">
                Jl. Nurul Jihad, Biring Kaloro
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                Kec. Somba Opu, Kab. Gowa
              </p>
              <a
                href="https://www.google.com/maps/place/5%C2%B014'01.2%22S+119%C2%B027'51.4%22E/@-5.23366,119.4616941,17z/data=!3m1!4b1!4m4!3m3!8m2!3d-5.23366!4d119.464269"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block w-full py-3 bg-button-gradient text-white font-bold rounded-btn shadow-glow transition-transform active:scale-95"
              >
                Buka Google Maps
              </a>
            </div>
          </div>
        </section>

        {/* SECTION 6: RSVP */}
        <section
          id="rsvp"
          className="snap-section relative bg-cover bg-center bg-no-repeat flex flex-col items-center justify-start pt-12 p-6"
          style={{ backgroundImage: 'url("/bg.webp")' }}
        >
          <div className="w-full reveal pb-24 overflow-y-auto custom-scrollbar">
            <h2 className="font-display text-2xl font-bold mb-2 drop-shadow-md" style={{ color: 'rgb(108, 82, 161)' }}>
              Konfirmasi Kehadiran
            </h2>
            <p className="text-sm mb-6 font-medium text-black">
              Kirim doa & konfirmasi kehadiran Anda
            </p>

            <form onSubmit={handleRSVP} className="bg-white/90 backdrop-blur-sm p-6 rounded-lg shadow-large mb-10">
              <div className="space-y-4 mb-6">
                <div>
                  <label className="text-xs font-semibold text-brown ml-1 mb-1 block">NAMA</label>
                  <input
                    type="text"
                    required
                    placeholder="Nama Lengkap"
                    className="w-full bg-white/50 px-4 py-3 rounded-lg border border-primary/10 focus:ring-2 focus:ring-primary/30 outline-none text-sm"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-brown ml-1 mb-1 block">JUMLAH TAMU</label>
                  <input
                    type="number"
                    min="1"
                    required
                    className="w-full bg-white/50 px-4 py-3 rounded-lg border border-primary/10 focus:ring-2 focus:ring-primary/30 outline-none text-sm"
                    value={formData.guests}
                    onChange={(e) => setFormData({ ...formData, guests: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-brown ml-1 mb-1 block">UCAPAN & DOA</label>
                  <textarea
                    rows={4}
                    placeholder="Tuliskan ucapan & doa terbaik Anda..."
                    className="w-full bg-white/50 px-4 py-3 rounded-lg border border-primary/10 focus:ring-2 focus:ring-primary/30 outline-none text-sm resize-none"
                    value={formData.wish}
                    onChange={(e) => setFormData({ ...formData, wish: e.target.value })}
                  ></textarea>
                </div>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-button-gradient text-white font-bold py-3 rounded-btn flex items-center justify-center gap-2 shadow-glow transition-transform active:scale-95 disabled:opacity-70"
              >
                {isLoading ? 'Mengirim...' : 'Kirim Konfirmasi'} <ArrowRight size={20} strokeWidth={2.5} />
              </button>
            </form>

            <div className="space-y-4">
              <h3 className="font-display text-lg font-bold drop-shadow-md" style={{ color: 'rgb(108, 82, 161)' }}>Ucapan & Doa</h3>
              <div className="space-y-3 pr-1">
                {wishes.map((w, i) => (
                  <div key={i} className="bg-white/90 backdrop-blur-sm p-4 rounded-lg shadow-soft flex gap-3 animate-fade-in-up">
                    <div className="w-7 h-7 bg-secondary rounded-full flex items-center justify-center shrink-0">
                      <User className="text-primary" size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-brown">{w.name}</p>
                      <p className="text-xs text-muted-foreground">{w.wish}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 7: THANKS */}
        <section
          id="thanks"
          className="snap-section relative bg-cover bg-center bg-no-repeat flex flex-col items-center justify-center p-8 text-center"
          style={{ backgroundImage: 'url("/bg.webp")' }}
        >
          <div className="reveal space-y-8 max-w-xs mx-auto">
            <div className="bg-white/90 backdrop-blur-sm p-10 rounded-lg shadow-large">
              <h2 className="font-display text-3xl font-bold mb-6" style={{ color: 'rgb(108, 82, 161)' }}>
                Terima Kasih
              </h2>
              <p className="text-sm leading-relaxed text-brown mb-8">
                Merupakan suatu kebahagiaan dan kehormatan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu kepada putra kami.
              </p>
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">Keluarga Besar</p>
                <p className="font-display text-xl font-bold" style={{ color: 'rgb(108, 82, 161)' }}>
                  Idul Fitrah & Eka Yuliana
                </p>
              </div>
            </div>

            <button
              onClick={() => scrollTo('cover')}
              className="inline-flex items-center gap-2 text-white font-semibold py-3 px-8 rounded-full shadow-large transition-transform active:scale-95"
              style={{ backgroundColor: 'rgb(108, 82, 161)' }}
            >
              Kembali ke Atas
            </button>

            <p className="text-[10px] pt-4 font-medium" style={{ color: 'rgb(108, 82, 161)' }}>
              © 2026 Muhammad Hanan Al Fitrah
            </p>
          </div>
        </section>
      </div>

      {/* MUSIC CONTROL */}
      <button
        id="btnAutoplay"
        onClick={toggleMusic}
        style={{ color: 'rgb(108, 82, 161)' }}
        className="fixed right-6 bottom-24 z-50 w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm shadow-large flex items-center justify-center transition-all duration-300 border-2 border-primary/20 active:scale-95"
      >
        {isPlaying ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" viewBox="0 0 256 256" className="pause animate-pulse-gentle">
            <path d="M128,24A104,104,0,1,0,232,128,104.13,104.13,0,0,0,128,24ZM112,160a8,8,0,0,1-16,0V96a8,8,0,0,1,16,0Zm48,0a8,8,0,0,1-16,0V96a8,8,0,0,1,16,0Z"></path>
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" viewBox="0 0 256 256" className="play">
            <path d="M128,24A104,104,0,1,0,232,128,104.13,104.13,0,0,0,128,24Zm36.44,110.66-48,32A8.05,8.05,0,0,1,112,168a8,8,0,0,1-8-8V96a8,8,0,0,1,12.44-6.66l48,32a8,8,0,0,1,0,13.32Z"></path>
          </svg>
        )}

        {/* Audio Element */}
        <audio ref={audioRef} loop>
          <source src="/music.mp3" type="audio/mpeg" />
          <source src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" type="audio/mpeg" />
        </audio>
      </button>

      {/* MOBILE FOOTER */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] h-[65px] glass-nav border-t border-white/20 rounded-t-nav z-50 flex items-center justify-around px-4 shadow-footer">
        <NavItem
          icon={<Circle size={20} />}
          label="Opening"
          active={activeSection === 'cover'}
          onClick={() => scrollTo('cover')}
        />
        <NavItem
          icon={<Heart size={20} />}
          label="Doa"
          active={activeSection === 'doa'}
          onClick={() => scrollTo('doa')}
        />
        <NavItem
          icon={<Smile size={20} />}
          label="Profil"
          active={activeSection === 'profil'}
          onClick={() => scrollTo('profil')}
        />
        <NavItem
          icon={<Star size={20} />}
          label="Acara"
          active={activeSection === 'acara'}
          onClick={() => scrollTo('acara')}
        />
        <NavItem
          icon={<MessageCircle size={20} />}
          label="RSVP"
          active={activeSection === 'rsvp'}
          onClick={() => scrollTo('rsvp')}
        />
      </nav>

      {/* SUCCESS TOAST */}
      {showToast && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[60] animate-fade-in-up">
          <div className="bg-white px-6 py-3 rounded-full shadow-large border-l-4 border-primary">
            <p className="text-sm font-semibold text-brown">
              Terima kasih atas doa dan kehadirannya 🤍
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

const NavItem: React.FC<{ icon: React.ReactNode, label: string, active: boolean, onClick: () => void }> = ({
  icon, label, active, onClick
}) => {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-1 transition-all duration-300 ${active ? 'bg-button-gradient text-white px-4 py-1.5 rounded-full scale-105 shadow-glow' : 'text-muted-foreground'
        }`}
    >
      {React.cloneElement(icon as React.ReactElement<any>, { strokeWidth: active ? 2 : 1.5 })}
      <span className="text-[10px] font-semibold">{label}</span>
    </button>
  );
};

const CountdownBox: React.FC<{ value: number, label: string }> = ({ value, label }) => {
  return (
    <div className="flex flex-col items-center">
      <div className="w-16 h-16 bg-white/95 backdrop-blur-sm rounded-xl shadow-soft flex items-center justify-center mb-1 border border-primary/10">
        <span className="text-2xl font-bold font-display" style={{ color: 'rgb(108, 82, 161)' }}>
          {value.toString().padStart(2, '0')}
        </span>
      </div>
      <span className="text-[10px] uppercase tracking-wider font-bold drop-shadow-sm" style={{ color: 'rgb(108, 82, 161)' }}>
        {label}
      </span>
    </div>
  );
};

export default App;
