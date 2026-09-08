import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { useThemeStore } from "../stores/themeStore";
import {
  Sparkles,
  BookOpen,
  ArrowRight,
  CheckCircle,
  BarChart3,
  Globe,
  Users,
  Menu,
  X,
  Languages,
  Moon,
  Sun,
  Activity,
  Brain,
  MessageCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  const { isAuthenticated } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [emailInput, setEmailInput] = useState("");

  const handleStartFree = (e: React.FormEvent) => {
    e.preventDefault();
    if (isAuthenticated) {
      navigate("/dashboard");
    } else {
      // Pass email as a state or query param to login page if desired
      navigate("/login");
    }
  };

  // Simulated interactive story card inside the hero section
  const [activeWord, setActiveWord] = useState<string | null>(null);
  const words = [
    { en: "Artificial", ar: "الاصطناعي", desc: "مصطلح يشير إلى شيء صنعته أيدي البشر وليس طبيعياً." },
    { en: "Intelligence", ar: "الذكاء", desc: "القدرة على التعلم والتفكير والفهم بدلاً من مجرد الحفظ." },
    { en: "adapts", ar: "يتكيف", desc: "يعدل سلوكه ليتناسب مع الظروف الجديدة أو المدخلات المختلفة." },
    { en: "dynamically", ar: "ديناميكياً", desc: "بشكل تفاعلي ومستمر وتلقائي دون تدخل مسبق." }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300 font-sans selection:bg-primary/30 selection:text-foreground overflow-hidden" dir="rtl">
      {/* Background Glows */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[150px] dark:bg-primary/5" />
        <div className="absolute top-[30%] right-[-10%] w-[40%] h-[40%] rounded-full bg-accent/15 blur-[120px] dark:bg-accent/5" />
        <div className="absolute bottom-[10%] left-[10%] w-[45%] h-[45%] rounded-full bg-primary/10 blur-[130px] dark:bg-primary/5" />
      </div>

      {/* 1. Header / Navigation Bar */}
      <header className="sticky top-0 z-50 w-full glass border-b border-border/40 backdrop-blur-md transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
              <Sparkles size={20} className="text-primary-foreground" />
            </div>
            <span className="font-extrabold text-xl leading-tight tracking-tight text-foreground">
              LinguaFlow <span className="text-primary text-xs font-semibold uppercase tracking-widest px-1.5 py-0.5 rounded-md bg-primary/10">AI</span>
            </span>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a href="#problems" className="hover:text-foreground transition-colors">العقبات التقليدية</a>
            <a href="#solutions" className="hover:text-foreground transition-colors">الحل التكيفي</a>
            <a href="#features" className="hover:text-foreground transition-colors">الميزات</a>
            <a href="#how-it-works" className="hover:text-foreground transition-colors">كيف يعمل</a>
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {/* Theme Toggle Button */}
            <button
              onClick={() => toggleTheme()}
              className="p-2.5 rounded-xl hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
              title={theme === "dark" ? "الوضع المضيء" : "الوضع الداكن"}
            >
              {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {isAuthenticated ? (
              <Button onClick={() => navigate("/dashboard")} className="neon-glow font-bold rounded-xl px-5">
                لوحة التحكم
                <ArrowRight size={16} className="mr-1 rotate-180" />
              </Button>
            ) : (
              <>
                <Link to="/login" className="text-sm font-semibold hover:text-primary transition-colors pl-2">
                  تسجيل الدخول
                </Link>
                <Button onClick={() => navigate("/login")} className="neon-glow font-bold rounded-xl px-5">
                  ابدأ مجاناً
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Buttons */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={() => toggleTheme()}
              className="p-2 rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg hover:bg-muted/50 text-foreground transition-colors"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Nav Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border/30 bg-background/95 backdrop-blur-xl animate-in fade-in slide-in-from-top-4 duration-200">
            <div className="px-4 pt-4 pb-6 space-y-4 flex flex-col font-medium">
              <a
                href="#problems"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                العقبات التقليدية
              </a>
              <a
                href="#solutions"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                الحل التكيفي
              </a>
              <a
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                الميزات
              </a>
              <a
                href="#how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                كيف يعمل
              </a>
              <hr className="border-border/30" />
              {isAuthenticated ? (
                <Button onClick={() => { setMobileMenuOpen(false); navigate("/dashboard"); }} className="w-full neon-glow font-bold py-3 rounded-xl">
                  الانتقال للوحة التحكم
                </Button>
              ) : (
                <div className="flex flex-col gap-3">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-center py-2 text-sm font-semibold hover:text-primary transition-colors"
                  >
                    تسجيل الدخول
                  </Link>
                  <Button onClick={() => { setMobileMenuOpen(false); navigate("/login"); }} className="w-full neon-glow font-bold py-3 rounded-xl">
                    ابدأ مجاناً
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* 2. Hero Section */}
      <section className="relative pt-10 pb-20 md:py-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10 flex flex-col items-center text-center">
        {/* Intro Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-semibold mb-6 animate-pulse">
          <Sparkles size={14} />
          جيل جديد من التعليم الذكي المخصص بالكامل
        </div>

        {/* Heading */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.2] max-w-4xl text-foreground mb-6">
          لا تتعلم اللغات كغيرك. <br />
          <span className="bg-gradient-to-r from-[#2d4638] via-[#3a5a40] to-[#588157] dark:from-[#588157] dark:via-[#7ea87c] dark:to-[#a3b18a] bg-clip-text text-transparent">
            ابنِ مسارك المخصص بالذكاء الاصطناعي
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed mb-10">
          منصة ذكية تتكيف ديناميكياً مع مستواك واهتماماتك. اختر لغتك واكتشف متعة التعلم التفاعلي من أي لغة أم تفضلها، عبر قصص ذكية تُصمم خصيصاً لك.
        </p>

        {/* CTA Form / Buttons */}
        <form onSubmit={handleStartFree} className="w-full max-w-md flex flex-col sm:flex-row gap-3 mb-16">
          <input
            type="email"
            placeholder="أدخل بريدك الإلكتروني للبدء..."
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            required
            className="flex-1 px-5 py-4 rounded-xl border border-border/80 bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary/50 text-right backdrop-blur-sm shadow-inner"
          />
          <Button type="submit" className="neon-glow font-bold text-base py-4 px-8 rounded-xl shrink-0 h-auto">
            {isAuthenticated ? "افتح لوحة التحكم" : "ابدأ رحلتك مجاناً"}
          </Button>
        </form>

        {/* Interactive UI Mockup Showcase */}
        <div className="w-full max-w-4xl glass rounded-2xl border border-border/40 p-4 sm:p-6 shadow-2xl relative">
          {/* Windows Dots */}
          <div className="flex gap-1.5 mb-4 border-b border-border/20 pb-3" dir="ltr">
            <span className="w-3 h-3 rounded-full bg-red-500/80" />
            <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <span className="w-3 h-3 rounded-full bg-green-500/80" />
            <span className="text-xs text-muted-foreground ml-2 select-none font-mono">LinguaFlow Interactive Player</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Story/Text Section */}
            <div className="md:col-span-8 text-right space-y-4">
              <span className="text-[10px] bg-primary/10 text-primary font-bold uppercase px-2 py-0.5 rounded">
                مستوى متقدم ذكي
              </span>
              <h3 className="text-lg font-bold text-foreground">قصة تفاعلية: بزوغ التكنولوجيا الفائقة</h3>
              
              <div className="p-4 sm:p-6 bg-muted/30 dark:bg-muted/10 rounded-xl border border-border/20 relative">
                {/* Paragraph containing clickable interactive words */}
                <p className="text-base sm:text-lg leading-loose text-foreground font-medium" dir="ltr">
                  Modern {" "}
                  {words.map((w, idx) => (
                    <span
                      key={idx}
                      onMouseEnter={() => setActiveWord(w.en)}
                      onMouseLeave={() => setActiveWord(null)}
                      onClick={() => setActiveWord(w.en === activeWord ? null : w.en)}
                      className={`cursor-pointer px-1 rounded transition-all select-none border-b-2 font-bold ${
                        activeWord === w.en
                          ? "bg-primary/20 border-primary text-primary-foreground dark:text-primary scale-105"
                          : "border-dotted border-muted-foreground hover:bg-muted text-foreground"
                      }`}
                    >
                      {w.en}
                    </span>
                  ))}
                  {" "} technology changes how we interact.
                </p>
                
                <p className="text-xs text-muted-foreground mt-4 border-t border-border/10 pt-3 text-right">
                  💡 *مرر الفأرة أو اضغط على الكلمات المحددة بنقاط لمعاينة الترجمة الفورية الذكية.*
                </p>
              </div>
            </div>

            {/* Translation Popup Panel Simulation */}
            <div className="md:col-span-4 h-full flex flex-col justify-center">
              <div className="p-5 rounded-xl border border-border/30 bg-background/80 shadow-md relative min-h-[160px] flex flex-col justify-between transition-all duration-300">
                {activeWord ? (
                  <div className="space-y-2 text-right">
                    <div className="flex justify-between items-center border-b border-border/20 pb-2">
                      <span className="text-xs text-muted-foreground font-mono" dir="ltr">{activeWord}</span>
                      <span className="text-sm font-bold text-primary">
                        {words.find(w => w.en === activeWord)?.ar}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed pt-1">
                      {words.find(w => w.en === activeWord)?.desc}
                    </p>
                    <div className="flex gap-2 pt-2">
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded font-semibold">
                        مفردات هامة
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center py-6 text-muted-foreground">
                    <Brain size={32} className="mb-2 text-muted-foreground/50 animate-bounce" />
                    <span className="text-xs">ضع مؤشر الفأرة على كلمة في القصة لمشاهدة شرحها الفوري</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Problem Section */}
      <section id="problems" className="py-20 md:py-28 border-t border-border/20 bg-muted/20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              لماذا تفشل الطرق التقليدية في تعليم اللغات؟
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg">
              حفظ القواعد القديمة وحشو المفردات في قوالب ثابتة لم يعد يفي بالغرض لمتطلبات العصر الحديث.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="glass p-8 rounded-2xl border border-border/30 hover:border-primary/20 transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center mb-6">
                  <Users size={24} />
                </div>
                <h3 className="text-lg font-bold mb-3">التعليم الموحد (One-Size-Fits-All)</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  تفترض المناهج التقليدية أن كل المتعلمين يتشابهون في سرعة الحفظ ونوع الاهتمامات، مما يسبب إحباطاً سريعاً وتراجعاً في مستويات الشغف.
                </p>
              </div>
              <div className="pt-6 text-xs font-semibold text-destructive/80 flex items-center gap-1">
                تراجع في الاستمرارية بنسبة 70%
              </div>
            </div>

            {/* Card 2 */}
            <div className="glass p-8 rounded-2xl border border-border/30 hover:border-primary/20 transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center mb-6">
                  <BookOpen size={24} />
                </div>
                <h3 className="text-lg font-bold mb-3">النصوص الجافة والقديمة</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  حفظ قوائم كلمات منفصلة أو قراءة نصوص عقيمة لا ترتبط بحياتك العملية، تجعل عملية التعلم أشبه بواجب مدرسي ممل، وليس مهارة حية.
                </p>
              </div>
              <div className="pt-6 text-xs font-semibold text-destructive/80 flex items-center gap-1">
                صعوبة استرجاع الكلمات في السياق
              </div>
            </div>

            {/* Card 3 */}
            <div className="glass p-8 rounded-2xl border border-border/30 hover:border-primary/20 transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center mb-6">
                  <Globe size={24} />
                </div>
                <h3 className="text-lg font-bold mb-3">عائق اللغة الوسيطة</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  تجبرك معظم التطبيقات على المرور باللغة الإنجليزية أولاً لتعلم اللغات الأخرى، مما يبطئ عملية الفهم الطبيعي ويخلق ازدواجية فكرية.
                </p>
              </div>
              <div className="pt-6 text-xs font-semibold text-destructive/80 flex items-center gap-1">
                الارتباط القسري باللغة الإنجليزية كمعيار وحيد
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Solution Section */}
      <section id="solutions" className="py-20 md:py-28 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Visual Flow Animation / Graphics */}
            <div className="order-2 lg:order-1 flex justify-center">
              <div className="relative w-full max-w-md p-8 glass rounded-2xl border border-border/30 flex flex-col items-center gap-6 shadow-xl">
                <div className="flex justify-between w-full items-center gap-4">
                  <div className="px-4 py-2.5 rounded-xl bg-primary/10 border border-primary/20 text-sm font-bold text-primary">
                    لغتك الأم
                  </div>
                  <div className="h-[2px] flex-1 bg-gradient-to-r from-primary to-accent relative">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-accent animate-ping" />
                  </div>
                  <div className="px-4 py-2.5 rounded-xl bg-accent/10 border border-accent/20 text-sm font-bold text-accent">
                    اللغة المستهدفة
                  </div>
                </div>

                <div className="w-full p-4 rounded-xl bg-background/50 border border-border/20 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                    <Activity size={18} />
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-foreground">خوارزميات التكيف الديناميكي</p>
                    <p className="text-[10px] text-muted-foreground">تعديل الصعوبة والمصطلحات كل ثانية حسب قراءتك</p>
                  </div>
                </div>

                <div className="w-full p-4 rounded-xl bg-background/50 border border-border/20 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0">
                    <Brain size={18} />
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-foreground">التعلم بالسياق القصصي</p>
                    <p className="text-[10px] text-muted-foreground">إنشاء قصص خصيصاً في اهتماماتك (برمجة، طب، إدارة)</p>
                  </div>
                </div>

                {/* Level Flow indicators */}
                <div className="flex gap-2 w-full pt-2">
                  <span className="text-[10px] bg-primary/10 text-primary px-2.5 py-1 rounded-full font-bold">مبتدئ A1</span>
                  <span className="text-[10px] bg-primary/20 text-primary px-2.5 py-1 rounded-full font-bold">متوسط B1</span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-500 px-2.5 py-1 rounded-full font-bold">متقدم C1</span>
                </div>
              </div>
            </div>

            {/* Explanation text */}
            <div className="order-1 lg:order-2 space-y-6 text-right">
              <span className="text-xs bg-emerald-500/10 text-emerald-500 font-bold uppercase px-3 py-1 rounded-full">
                الحل المبتكر لدينا
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                تجربة تعليمية ذكية تتكيف معك، لا العكس
              </h2>
              <p className="text-muted-foreground text-base leading-relaxed">
                مع LinguaFlow AI، لن تتقيد بمناهج مسبقة الصنع. نظامنا الذكي يراقب مستواك الحقيقي ويصنع المحتوى في التو واللحظة ليكون تحدياً مناسباً تماماً لقدراتك الحالية.
              </p>

              <div className="space-y-4 pt-4">
                <div className="flex gap-3">
                  <CheckCircle size={20} className="text-emerald-500 shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold text-foreground text-sm">تعلّم بلا حدود (Any-to-Any)</h4>
                    <p className="text-xs text-muted-foreground">تعلم الإسبانية من العربية مباشرة، أو اليابانية من الألمانية. لا وجود لحواجز وسيطة.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <CheckCircle size={20} className="text-emerald-500 shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold text-foreground text-sm">التكيف التلقائي المستمر</h4>
                    <p className="text-xs text-muted-foreground">يتحسن المحتوى أو تنخفض صعوبته فورياً حسب سرعة تفاعلك وصحة إجاباتك.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <CheckCircle size={20} className="text-emerald-500 shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold text-foreground text-sm">سياق قصصي ممتع</h4>
                    <p className="text-xs text-muted-foreground">عش اللغة من خلال قصص تفاعلية مليئة بالإثارة مبنية حول مجال دراستك أو عملك المفضّل.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Features Section */}
      <section id="features" className="py-20 md:py-28 border-t border-border/20 bg-muted/10 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs bg-primary/10 text-primary font-bold uppercase px-3 py-1 rounded-full">
              ميزات مصممة خصيصاً للنجاح
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mt-3 mb-4">
              أدوات متكاملة تدعم رحلتك التعليمية
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg">
              كل ما تحتاجه للانتقال بمهارتك اللغوية من البداية وحتى الاحتراف التقني والتحدث الطبيعي.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <div className="glass p-6 rounded-2xl border border-border/20 hover:border-primary/40 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-6">
                  <Brain size={20} />
                </div>
                <h3 className="font-bold text-base mb-2">بناء المفردات الذكي</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  احفظ الكلمات الجديدة بضغطة زر. تراجعها بنظام التكرار المتباعد (Spaced Repetition) الذكي لضمان استقرارها في ذاكرتك الطويلة.
                </p>
              </div>
              <div className="text-[10px] text-primary font-bold pt-4 flex items-center gap-1 cursor-pointer">
                تكرار متباعد علمي
              </div>
            </div>

            {/* Feature 2 */}
            <div className="glass p-6 rounded-2xl border border-border/20 hover:border-primary/40 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-6">
                  <MessageCircle size={20} />
                </div>
                <h3 className="font-bold text-base mb-2">ممارسة النطق بالصوت</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  لا تكتفِ بالقراءة. تدرّب على التحدث بمساعدة خوارزميات التعرف الصوتي الذكية التي تقيّم مخارج حروفك وتصححها فوراً.
                </p>
              </div>
              <div className="text-[10px] text-primary font-bold pt-4 flex items-center gap-1 cursor-pointer">
                تقييم صوتي مدعوم بالذكاء الاصطناعي
              </div>
            </div>

            {/* Feature 3 */}
            <div className="glass p-6 rounded-2xl border border-border/20 hover:border-primary/40 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-6">
                  <Languages size={20} />
                </div>
                <h3 className="font-bold text-base mb-2">تخصيص مجالات الاهتمام</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  اختر اهتمامك: الهندسة البرمجية، الإدارة، الطب، أم المحادثات اليومية والسفر. ستكون كل مفرداتك وقصصك متمحورة حول خيارك.
                </p>
              </div>
              <div className="text-[10px] text-primary font-bold pt-4 flex items-center gap-1 cursor-pointer">
                أكثر من 15 مجال تخصص
              </div>
            </div>

            {/* Feature 4 */}
            <div className="glass p-6 rounded-2xl border border-border/20 hover:border-primary/40 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-6">
                  <BarChart3 size={20} />
                </div>
                <h3 className="font-bold text-base mb-2">تقارير وإحصائيات حية</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  شاهد تقدّمك اللغوي، حجم الكلمات التي أتقنتها، ووتيرة استذكارك اليومية من خلال رسوم بيانية وتتبع دقيق للمؤشرات.
                </p>
              </div>
              <div className="text-[10px] text-primary font-bold pt-4 flex items-center gap-1 cursor-pointer">
                لوحة تحكم ذكية متكاملة
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. How It Works Section */}
      <section id="how-it-works" className="py-20 md:py-28 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              خطوات بسيطة تفصلك عن طلاقتك القادمة
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg">
              صممنا تجربة الانضمام لتكون خالية من التعقيدات للبدء الفوري.
            </p>
          </div>

          <div className="relative">
            {/* Timeline Line for desktop */}
            <div className="hidden lg:block absolute top-[50px] left-4 right-4 h-[2px] bg-border/40 z-0" />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 relative z-10">
              {/* Step 1 */}
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-primary text-primary-foreground font-black text-lg flex items-center justify-center shadow-lg shadow-primary/30 relative">
                  01
                  <div className="absolute inset-0 rounded-full border-4 border-background animate-ping pointer-events-none" />
                </div>
                <h3 className="text-lg font-bold">حدد لغاتك واهتماماتك</h3>
                <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
                  اختر لغتك الأم، اللغة التي تريد تعلمها، ومجال اهتمامك الفعلي (مثل الذكاء الاصطناعي أو إدارة المشاريع).
                </p>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-primary text-primary-foreground font-black text-lg flex items-center justify-center shadow-lg shadow-primary/30">
                  02
                </div>
                <h3 className="text-lg font-bold">تفاعل مع قراءتك المخصصة</h3>
                <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
                  اقرأ واستمع للقصص المشوقة المخصصة لمستواك، واضغط على أي كلمة صعبة لتعرف معناها وتراجعها تلقائياً.
                </p>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-500 text-white font-black text-lg flex items-center justify-center shadow-lg shadow-emerald-500/30">
                  03
                </div>
                <h3 className="text-lg font-bold text-foreground">تطور وتكيف تلقائياً</h3>
                <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
                  مع كل قصة تنتهي منها وجملة تتحدث بها، يتعلم خوارزميتنا أسلوبك ويعدل صعوبة المحتوى التالي لضمان التطوير المستمر.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. CTA Section */}
      <section className="py-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 z-10 relative">
        <div className="rounded-3xl bg-gradient-to-br from-[#2d4638] via-[#3a5a40] to-[#588157] dark:from-[#222723] dark:via-[#344e41] dark:to-[#3a5a40] text-primary-foreground p-8 sm:p-12 md:p-16 text-center shadow-2xl relative overflow-hidden neon-glow">
          {/* Background overlay rays */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.15)_0%,transparent_60%)] pointer-events-none" />

          <h2 className="text-3xl sm:text-4xl font-extrabold mb-4 relative z-10 leading-tight">
            جاهز لتجربة تعليمية مصممة لك خصيصاً؟
          </h2>
          <p className="text-primary-foreground/85 text-base sm:text-lg max-w-xl mx-auto mb-8 relative z-10 leading-relaxed">
            انضم اليوم مجاناً وكسر قيود التعليم الموحد لتكتشف كيف يمكن للذكاء الاصطناعي تسريع تمكنك من اللغة.
          </p>

          <div className="max-w-md mx-auto flex flex-col sm:flex-row gap-3 relative z-10 justify-center">
            <Button
              onClick={() => navigate("/login")}
              className="bg-white text-primary hover:bg-neutral-100 font-bold text-base py-4 px-10 rounded-xl shadow-lg border border-transparent"
            >
              ابدأ مسارك التعليمي مجاناً
            </Button>
          </div>
        </div>
      </section>

      {/* 8. Footer */}
      <footer className="border-t border-border/30 bg-background/50 py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-md">
              <Sparkles size={16} className="text-primary-foreground" />
            </div>
            <span className="font-bold text-base">LinguaFlow AI</span>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            © {new Date().getFullYear()} جميع الحقوق محفوظة لمنصة LinguaFlow AI لتعلّم اللغات التكيفي.
          </p>

          <div className="flex items-center gap-6 text-xs text-muted-foreground font-medium">
            <a href="#problems" className="hover:text-foreground transition-colors">عن الخدمة</a>
            <a href="#features" className="hover:text-foreground transition-colors">الميزات</a>
            <a href="/login" className="hover:text-foreground transition-colors">تسجيل دخول</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
