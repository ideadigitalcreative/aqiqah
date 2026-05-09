import React, { useEffect, useState, useRef } from 'react';
import {
  Heart,
  Smile,
  Star,
  MessageCircle,
  Circle,
  Sun,
  Clock3,
  MapPin,
  ArrowRight,
  User,
  Share2,
  Copy,
  X,
  Gift
} from 'lucide-react';
import { supabase } from './lib/supabase';

const App: React.FC = () => {
  const [activeSection, setActiveSection] = useState('cover');
  const [showToast, setShowToast] = useState({ show: false, message: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [wishes, setWishes] = useState<any[]>([]);
  const [showGifts, setShowGifts] = useState(false);

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
    const targetDate = new Date('2026-05-11T11:00:00+08:00').getTime();

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

  useEffect(() => {
    const attemptAutoplay = () => {
      audioRef.current?.play()
        .then(() => setIsPlaying(true))
        .catch(err => console.log("Autoplay waiting for user interaction:", err));
    };

    attemptAutoplay();

    // Also try on first click to increase success rate
    window.addEventListener('click', attemptAutoplay, { once: true });
    return () => window.removeEventListener('click', attemptAutoplay);
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
        setShowToast({ show: true, message: 'Terima kasih atas doa dan kehadirannya 🤍' });
        setFormData({ name: '', guests: '1', wish: '' });
        setTimeout(() => setShowToast({ show: false, message: '' }), 3000);
      }
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setShowToast({ show: true, message: 'Nomor rekening berhasil disalin!' });
    setTimeout(() => setShowToast({ show: false, message: '' }), 3000);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <div ref={containerRef} className="snap-container">
        {/* SECTION 1: COVER */}
        <section
          id="cover"
          className="snap-section relative flex flex-col items-center justify-center text-center text-white bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url("/bg.png")' }}
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
            <p className="text-sm uppercase tracking-[0.25em] mb-12 font-semibold -mt-24 text-primary">
              UNDANGAN TASYAKURAN AQIQAH
            </p>
            <div
              className="mb-8 px-12 py-20 bg-contain bg-center bg-no-repeat flex items-center justify-center min-h-[220px] w-full scale-125"
              style={{ backgroundImage: 'url("/shape.png")' }}
            >
              <h1 className="font-display text-[24px] font-bold text-glow text-white leading-tight px-4 text-center">
                Ahmad Musyaffa' Al Fajr
              </h1>
            </div>
            <p className="mb-4 font-bold mt-12 text-primary">
              Putra dari Fajar Menyingsin & Syadza Lathifah
            </p>
            <div className="inline-block px-8 py-2 bg-white/40 backdrop-blur-md rounded-full border border-white/30 mb-12 font-bold text-primary">
              Senin, 11 Mei 2026
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
          style={{ backgroundImage: 'url("/bg.png")' }}
        >
          {/* Masjid Illustration Top */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[320px] pt-8 px-6 reveal">
            <img
              src="/masjid.png"
              alt="Masjid"
              className="w-full h-auto drop-shadow-lg"
            />
          </div>

          <div className="reveal relative z-10 w-full mt-12 px-2">
            <div className="bg-white/90 backdrop-blur-sm p-8 rounded-lg shadow-soft text-center">
              <div className="space-y-4 text-[13px] leading-relaxed text-brown font-medium">
                <p>
                  Dua tahun bukan waktu yang sebentar bagi kami.
                  Ada banyak doa yang dipanjatkan diam-diam setelah shalat, banyak air mata yang jatuh tanpa diketahui siapa pun, dan banyak harapan yang terus kami genggam meski kadang hati mulai lelah menunggu.
                </p>
                <p>
                  Setiap kali melihat teman menggendong buah hati mereka, kami ikut bahagia, tetapi di dalam hati kecil kami selalu berbisik,
                  “Ya Allah, kapan giliran kami?”
                </p>
                <p>
                  Hari demi hari berlalu. Kami belajar untuk lebih sabar, lebih ikhlas, dan lebih percaya bahwa setiap doa pasti didengar pada waktu terbaik-Nya. Hingga akhirnya, setelah penantian panjang selama dua tahun, Allah menghadiahkan kepada kami seorang anak pertama yang begitu kami cintai sejak sebelum ia lahir.
                </p>
                <p>
                  Tangis kecilnya pertama kali terdengar, rasanya seperti seluruh dunia berhenti sejenak. Semua penantian, perjuangan, dan doa yang selama ini kami simpan akhirnya terjawab sudah. Rumah yang dulu terasa sunyi kini dipenuhi suara tangisan, tawa, dan kebahagiaan yang tak bisa digambarkan dengan kata-kata.
                </p>
                <p>
                  Kini, dengan penuh rasa syukur, kami ingin melaksanakan tasyakuran aqiqah untuk buah hati kami tercinta. Bukan sekadar sebuah acara, tetapi sebagai bentuk terima kasih kami kepada Allah SWT atas amanah terindah yang telah diberikan kepada keluarga kecil kami.
                </p>
                <p>
                  Semoga langkah kecil anak kami selalu dalam lindungan Allah, tumbuh menjadi anak yang sehat, shileh, berbakti kepada orang tua, dan membawa keberkahan bagi banyak orang.
                </p>
                <p>
                  Dan semoga setiap orang yang pernah menunggu dalam doa panjang seperti kami, suatu hari nanti juga dipeluk oleh kebahagiaan yang sama.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3: PROFIL */}
        <section
          id="profil"
          className="snap-section relative bg-cover bg-center bg-no-repeat flex flex-col items-center justify-center p-6"
          style={{ backgroundImage: 'url("/bg.png")' }}
        >
          <div className="bg-white/90 backdrop-blur-sm p-8 rounded-lg shadow-large text-center reveal w-full -mt-12">
            <div className="w-40 h-40 mx-auto mb-6 bg-secondary rounded-full flex items-center justify-center overflow-hidden shadow-inner border-4 border-white/50 relative">
              <img
                src="/baby1.png"
                alt="AHMAD MUSYAFFA' AL FAJR"
                className="w-full h-full object-cover scale-150 origin-center"
              />
            </div>
            <p className="text-sm mb-4 leading-relaxed text-brown">
              Dengan penuh rasa syukur kepada Allah SWT, kami mengundang Bapak/Ibu/Saudara/i untuk hadir dalam acara Tasyakuran Aqiqah putra kami tercinta:
            </p>
            <h3 className="font-display text-2xl font-bold mb-2 text-primary">
              AHMAD MUSYAFFA' AL FAJR
            </h3>
            <p className="text-xs text-muted-foreground uppercase tracking-widest mb-4">
              Lahir: Selasa, 05 Mei 2026
            </p>
            <div className="w-12 h-0.5 bg-accent mx-auto mb-4" />
            <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">
              Putra dari
            </p>
            <p className="font-semibold text-brown">
              Fajar Menyingsin & Syadza Lathifah
            </p>
          </div>
        </section>

        {/* SECTION 4: ACARA */}
        <section
          id="acara"
          className="snap-section relative bg-cover bg-center bg-no-repeat flex flex-col items-center justify-center p-6"
          style={{ backgroundImage: 'url("/bg.png")' }}
        >
          <div className="w-full reveal -mt-12">
            <h2 className="font-display text-2xl font-bold text-center mb-8 drop-shadow-md text-primary">
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
                  <p className="font-semibold text-brown">Senin, 11 Mei 2026</p>
                </div>
              </div>
              <div className="bg-white/90 backdrop-blur-sm p-5 rounded-lg shadow-soft flex items-center gap-4">
                <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center shrink-0">
                  <Clock3 className="text-primary" size={24} strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Waktu</p>
                  <p className="font-semibold text-brown">Pukul 11.00 wita - Selesai</p>
                </div>
              </div>
              <div className="bg-white/90 backdrop-blur-sm p-5 rounded-lg shadow-soft flex items-center gap-4">
                <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center shrink-0">
                  <MapPin className="text-primary" size={24} strokeWidth={1.5} />
                </div>
                <div className="flex-1">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Lokasi</p>
                  <p className="font-semibold text-brown">
                    Jl. Pahlawan Kompleks Mitra Berdikari Asri Blok A1 No.1, RQ Kurdin Nurhayati Bulurokeng
                  </p>
                  <a
                    href="https://maps.app.goo.gl/wu7mU4tV8HqCDSWM6"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block mt-1 text-xs font-bold text-primary underline underline-offset-2"
                  >
                    Buka Google Maps
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 5: LOKASI */}
        <section
          id="lokasi"
          className="snap-section relative bg-cover bg-center bg-no-repeat flex flex-col items-center justify-center p-6"
          style={{ backgroundImage: 'url("/bg.png")' }}
        >
          <div className="w-full reveal z-10">
            <h2 className="font-display text-2xl font-bold text-center mb-6 drop-shadow-md -mt-12 text-primary">
              Kado untuk Ananda
            </h2>

            <div className="bg-white/90 backdrop-blur-sm p-6 rounded-lg shadow-soft text-center">
              <div
                className="flex flex-col items-center justify-center py-12 cursor-pointer group"
                onClick={() => setShowGifts(true)}
              >
                <div className="relative animate-bounce-gentle mb-4">
                  <div className="w-32 h-32 bg-button-gradient rounded-2xl flex items-center justify-center shadow-glow group-hover:scale-110 transition-transform duration-300">
                    <Gift size={64} className="text-white" strokeWidth={1.5} />
                  </div>
                  <div className="absolute -top-3 -right-3 bg-white p-2 rounded-full shadow-lg">
                    <Heart size={20} className="text-primary fill-primary animate-pulse" />
                  </div>
                </div>
                <p className="font-bold text-primary animate-pulse tracking-wide">
                  Klik Untuk Kirim Kado
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 6: RSVP */}
        <section
          id="rsvp"
          className="snap-section relative bg-cover bg-center bg-no-repeat flex flex-col items-center justify-start pt-12 p-6"
          style={{ backgroundImage: 'url("/bg.png")' }}
        >
          <div className="w-full reveal pb-24 overflow-y-auto custom-scrollbar">
            <h2 className="font-display text-2xl font-bold mb-2 drop-shadow-md text-primary">
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
              <h3 className="font-display text-lg font-bold drop-shadow-md text-primary">Ucapan & Doa</h3>
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

        {/* SECTION 8: THANKS */}
        <section
          id="thanks"
          className="snap-section relative bg-cover bg-center bg-no-repeat flex flex-col items-center justify-center p-8 text-center"
          style={{ backgroundImage: 'url("/bg.png")' }}
        >
          <div className="reveal space-y-8 max-w-xs mx-auto">
            <div className="bg-white/90 backdrop-blur-sm p-10 rounded-lg shadow-large">
              <h2 className="font-display text-3xl font-bold mb-6 text-primary">
                Terima Kasih
              </h2>
              <p className="text-sm leading-relaxed text-brown">
                Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara(i) berkenan hadir dan memberikan doa kepada putra kami.
              </p>
              <p className="text-sm leading-relaxed text-brown">
                Atas kehadirannya, kami ucapkan terimakasih teriring doa setulus hati. Jazaakumullahu khairan.
              </p>
              <div className="space-y-2 mt-8">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">Kami Yang Berbahagia</p>
                <p className="font-display text-xl font-bold text-primary">
                  Fajar Menyingsin & Syadza Lathifah
                </p>
              </div>
            </div>

            <button
              onClick={() => scrollTo('cover')}
              className="inline-flex items-center gap-2 text-white font-semibold py-3 px-8 rounded-full shadow-large transition-transform active:scale-95 bg-primary"
            >
              Kembali ke Atas
            </button>

            <p className="text-[10px] pt-4 font-medium text-primary">
              © 2026 Fajar Menyingsin & Syadza Lathifah
            </p>
          </div>
        </section>
      </div>

      {/* SHARE BUTTON */}
      <button
        onClick={() => {
          const text = encodeURIComponent(
            "Assalamu'alaikum, kami mengundang Bapak/Ibu/Saudara(i) untuk hadir di acara Tasyakuran Aqiqah putra kami.\n\nYang insyaaAllah dilaksanakan pada :\n🗓️Hari Senin, 11 Mei 2026\n⏰️ Pukul 11.00 wita - Selesai\n📍Jl. Pahlawan Kompleks Mitra Berdikari Asri Blok A1 No.1, RQ Kurdin Nurhayati Bulurokeng\nhttps://maps.app.goo.gl/wu7mU4tV8HqCDSWM6"
          );
          window.open(`https://wa.me/?text=${text}`, '_blank');
        }}
        className="fixed left-1/2 translate-x-[130px] bottom-34 z-50 w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm shadow-large flex items-center justify-center transition-all duration-300 border-2 border-primary/20 active:scale-95 text-primary"
      >
        <Share2 size={24} strokeWidth={2.5} />
      </button>

      {/* MUSIC CONTROL */}
      <button
        id="btnAutoplay"
        onClick={toggleMusic}
        className="fixed left-1/2 translate-x-[130px] bottom-20 z-50 w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm shadow-large flex items-center justify-center transition-all duration-300 border-2 border-primary/20 active:scale-95 text-primary"
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
          <source src="/music-new.mp3" type="audio/mpeg" />
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
          icon={<Heart size={20} />}
          label="Hadiah"
          active={activeSection === 'lokasi' && showGifts}
          onClick={() => {
            scrollTo('lokasi');
            setShowGifts(true);
          }}
        />
        <NavItem
          icon={<MessageCircle size={20} />}
          label="RSVP"
          active={activeSection === 'rsvp'}
          onClick={() => scrollTo('rsvp')}
        />
      </nav>

      {/* MODAL GIFTS */}
      {showGifts && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-fade-in-up">
          <div className="bg-white/95 backdrop-blur-md p-8 rounded-2xl shadow-2xl w-full max-w-sm relative max-h-[90vh] overflow-y-auto custom-scrollbar">
            <button
              onClick={() => setShowGifts(false)}
              className="absolute top-4 right-4 text-primary bg-white hover:bg-primary hover:text-white border border-primary/20 p-2 rounded-full transition-colors active:scale-95 shadow-sm z-10"
              title="Tutup"
            >
              <X size={20} />
            </button>

            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center animate-bounce-gentle">
                <Gift size={48} className="text-primary" strokeWidth={1.5} />
              </div>
            </div>

            <h3 className="font-display text-2xl font-bold mb-4 text-center text-primary">Kado untuk Ananda</h3>

            {/* Map Section in Modal */}
            <div className="w-full h-48 rounded-xl overflow-hidden mb-6 border border-primary/10 shadow-inner">
              <iframe
                title="Lokasi Acara"
                width="100%"
                height="100%"
                frameBorder="0"
                style={{ border: 0 }}
                src="https://maps.google.com/maps?q=Jl.%20Pahlawan%20Kompleks%20Mitra%20Berdikari%20Asri%20Blok%20A1%20No.1,%20RQ%20Kurdin%20Nurhayati%20Bulurokeng&z=17&output=embed"
                allowFullScreen
              ></iframe>
            </div>


            <div className="bg-secondary/30 p-6 rounded-xl border border-primary/10 relative overflow-hidden group mb-4">
              <div className="flex justify-start mb-4">
                <img src="https://upload.wikimedia.org/wikipedia/commons/a/a0/Bank_Syariah_Indonesia.svg" alt="BSI" className="h-10" />
              </div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <p className="text-xl font-mono font-bold text-brown tracking-wider">1993 1209 91</p>
                <button
                  onClick={() => copyToClipboard('1993120991')}
                  className="p-2 bg-white rounded-full shadow-sm hover:scale-110 active:scale-95 transition-transform text-primary"
                  title="Salin Rekening"
                >
                  <Copy size={18} />
                </button>
              </div>
              <p className="text-sm font-semibold text-brown uppercase tracking-wider text-left">a.n Fajar Menyingsin</p>
            </div>
          </div>
        </div>
      )}

      {/* SUCCESS TOAST */}
      {
        showToast.show && (
          <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[60] animate-fade-in-up">
            <div className="bg-white px-6 py-3 rounded-full shadow-large border-l-4 border-primary">
              <p className="text-sm font-semibold text-brown">
                {showToast.message}
              </p>
            </div>
          </div>
        )
      }
    </div >
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
        <span className="text-2xl font-bold font-display text-primary">
          {value.toString().padStart(2, '0')}
        </span>
      </div>
      <span className="text-[10px] uppercase tracking-wider font-bold drop-shadow-sm text-primary">
        {label}
      </span>
    </div>
  );
};

export default App;
