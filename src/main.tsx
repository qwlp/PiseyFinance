import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { createRoot } from "react-dom/client";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ConvexReactClient, useConvexAuth, useQuery } from "convex/react";
import { ConvexBetterAuthProvider } from "@convex-dev/better-auth/react";
import { makeFunctionReference } from "convex/server";
import {
  ArrowLeft,
  Accessibility,
  BadgeCheck,
  BarChart3,
  BookOpen,
  Bot,
  Building2,
  Calculator,
  Check,
  ChevronRight,
  CircleHelp,
  Contrast,
  Eye,
  EyeOff,
  FileText,
  GitCompareArrows,
  Heart,
  Home as HomeIcon,
  Info,
  Languages,
  LayoutGrid,
  List,
  LockKeyhole,
  LogOut,
  Mail,
  MapPin,
  Menu,
  MessageSquareText,
  Paperclip,
  Plus,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Star,
  Trash2,
  Type,
  UserRound,
  UserRoundPlus,
  X,
} from "lucide-react";
import type { GlossaryTerm, Institution } from "./types";
import { InstitutionPage } from "./InstitutionPage";
import { ComparePage } from "./ComparePage";
import { InstitutionPicker } from "./InstitutionPicker";
import { authClient } from "./auth-client";
import "./styles.css";

type Locale = "km" | "en";
const copy = {
  km: {
    home: "ទំព័រដើម",
    explore: "ស្វែងរក",
    consult: "ប្រឹក្សា",
    learn: "ស្វែងយល់",
    loan: "គណនាឥណទាន",
    profile: "គណនី",
    search: "ស្វែងរកឈ្មោះធនាគារ ឬគ្រឹះស្ថាន…",
    title: "ស្វែងរកគ្រឹះស្ថានហិរញ្ញវត្ថុ",
    subtitle: "គ្រឹះស្ថាន ១២៥ ក្នុងបញ្ជី CMA។ ស្ថានភាព NBC បង្ហាញដាច់ដោយឡែក។",
    all: "ទាំងអស់",
    verified: "បានផ្ទៀងផ្ទាត់ដោយ NBC",
    notVerified: "មិនទាន់ផ្ទៀងផ្ទាត់",
    details: "មើលព័ត៌មានលម្អិត",
    institutions: "គ្រឹះស្ថានហិរញ្ញវត្ថុ",
    compare: "ប្រៀបធៀប",
    reviews: "ការវាយតម្លៃរបស់ Finឆែក",
    disclaimer: "ព័ត៌មានទូទៅប៉ុណ្ណោះ មិនមែនជាដំបូន្មានហិរញ្ញវត្ថុវិជ្ជាជីវៈទេ។",
  },
  en: {
    home: "Home",
    explore: "Explore",
    consult: "Consult",
    learn: "Learn",
    loan: "Loan",
    profile: "Profile",
    search: "Search banks or institutions…",
    title: "Find a financial institution",
    subtitle:
      "125 CMA-listed institutions. NBC verification is shown separately.",
    all: "All",
    verified: "NBC regulated",
    notVerified: "Not yet verified",
    details: "View details",
    institutions: "Financial institutions",
    compare: "Compare",
    reviews: "FinCheck assessment",
    disclaimer: "General information only — not professional financial advice.",
  },
};

const DataContext = createContext<{
  institutions: Institution[];
  glossary: GlossaryTerm[];
}>({ institutions: [], glossary: [] });
const useData = () => useContext(DataContext);
// Kept only for the unused legacy comparison
// component below; live views read DataContext.
const institutions: Institution[] = [];

type AccessibilitySettings = { fontSize: "default" | "large" | "largest"; highContrast: boolean; reduceMotion: boolean };
const defaultAccessibility: AccessibilitySettings = { fontSize: "default", highContrast: false, reduceMotion: false };

function App() {
  const institutionResult = useQuery(
    makeFunctionReference<"query", Record<string, never>, Institution[]>(
      "institutions:list",
    ),
  );
  const glossaryResult = useQuery(
    makeFunctionReference<"query", Record<string, never>, GlossaryTerm[]>(
      "glossary:list",
    ),
  );
  const [locale, setLocale] = useState<Locale>(() =>
    localStorage.getItem("locale") === "en" ? "en" : "km",
  );
  const [path, setPath] = useState(location.pathname);
  const [search, setSearch] = useState("");
  const [compare, setCompare] = useState<string[]>([]);
  const [accessibility, setAccessibility] = useState<AccessibilitySettings>(() => {
    try { return { ...defaultAccessibility, ...JSON.parse(localStorage.getItem("fincheck-accessibility") ?? "{}") }; }
    catch { return defaultAccessibility; }
  });
  const t = copy[locale];
  useEffect(() => {
    document.documentElement.lang = locale;
    localStorage.setItem("locale", locale);
  }, [locale]);
  useEffect(() => {
    document.documentElement.dataset.fontSize = accessibility.fontSize;
    document.documentElement.dataset.contrast = accessibility.highContrast ? "high" : "standard";
    document.documentElement.dataset.motion = accessibility.reduceMotion ? "reduced" : "standard";
    localStorage.setItem("fincheck-accessibility", JSON.stringify(accessibility));
  }, [accessibility]);
  useEffect(() => {
    const pop = () => setPath(location.pathname);
    addEventListener("popstate", pop);
    return () => removeEventListener("popstate", pop);
  }, []);
  if (institutionResult === undefined || glossaryResult === undefined)
    return (
      <main className="page">
        <p>{locale === "km" ? "កំពុងទាញយកទិន្នន័យ…" : "Loading data…"} </p>
      </main>
    );
  const institutions = institutionResult;
  const glossary = glossaryResult;
  const go = (next: string) => {
    history.pushState({}, "", next);
    setPath(next);
    scrollTo(0, 0);
  };
  const shared = { locale, t, go, search, setSearch, compare, setCompare, accessibility, setAccessibility };
  let content: React.ReactNode;
  if (path === "/") content = <Home {...shared} />;
  else if (path === "/institutions") content = <Explore {...shared} />;
  else if (path.startsWith("/institutions/"))
    content = (
      <InstitutionPage
        institution={
          institutions.find((i) => i.id === path.split("/")[2]) ??
          institutions[0]
        }
        {...shared}
      />
    );
  else if (path === "/compare")
    content = (
      <ComparePage
        institutions={institutions}
        ids={
          compare.length ? compare : institutions.slice(0, 2).map((i) => i.id)
        }
        locale={locale}
        go={go}
      />
    );
  else if (path === "/consult") content = <Consult {...shared} />;
  else if (path === "/loan") content = <LoanCalculator locale={locale} />;
  else if (path === "/learn") content = <Learn {...shared} />;
  else if (path.startsWith("/learn/"))
    content = <LessonArticle slug={path.split("/")[2]} {...shared} />;
  else if (path === "/profile") content = <Account {...shared} />;
  else content = <Home {...shared} />;
  return (
    <DataContext.Provider value={{ institutions, glossary }}>
      <Header locale={locale} setLocale={setLocale} go={go} />
      <main>{content} </main>
      <MobileNav path={path} t={t} go={go} />
      {compare.length > 0 && path !== "/compare" && (
        <CompareTray
          ids={compare}
          setCompare={setCompare}
          go={go}
          locale={locale}
          t={t}
        />
      )}{" "}
    </DataContext.Provider>
  );
}

type Shared = {
  locale: Locale;
  t: typeof copy.km;
  go: (p: string) => void;
  search: string;
  setSearch: (s: string) => void;
  compare: string[];
  setCompare: (v: string[]) => void;
  accessibility: AccessibilitySettings;
  setAccessibility: React.Dispatch<React.SetStateAction<AccessibilitySettings>>;
};

function InstitutionLogo({
  institution,
  large = false,
}: {
  institution: Institution;
  large?: boolean;
}) {
  return (
    <span
      className={`institution-logo${large ? " large" : ""}`}
      style={{ background: institution.logo ? "#fff" : institution.color }}
    >
      {institution.logo ? (
        <img src={institution.logo} alt="" />
      ) : (
        institution.short
      )}
    </span>
  );
}

function CmaLogo({ compact = false }: { compact?: boolean }) {
  return (
    <img
      className={compact ? "cma-logo compact" : "cma-logo"}
      src="/logos/cma-logo.png"
      alt="Cambodia Microfinance Association"
    />
  );
}

function NbcLogo() {
  return (
    <img
      className="nbc-logo"
      src="/logos/nbc-logo.svg"
      alt="National Bank of Cambodia"
    />
  );
}

function Header({
  locale,
  setLocale,
  go,
}: {
  locale: Locale;
  setLocale: (l: Locale) => void;
  go: (p: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const { isAuthenticated } = useConvexAuth();
  const navigate = (path: string) => {
    setOpen(false);
    go(path);
  };
  return (
    <header className="topbar">
      <button className="wordmark" onClick={() => go("/")} aria-label={locale === "km" ? "Finឆែក ទំព័រដើម" : "FinCheck home"}>
        {locale === "km" ? "Finឆែក" : "FinCheck"}
      </button>
      <nav className="desktop-nav">
        <button onClick={() => go("/")}>
          {locale === "km" ? "ទំព័រដើម" : "Home"}{" "}
        </button>
        <button onClick={() => go("/institutions")}>
          {locale === "km" ? "គ្រឹះស្ថាន" : "Institutions"}{" "}
        </button>
        <button onClick={() => go("/learn")}>
          {locale === "km" ? "ស្វែងយល់" : "Learn"}{" "}
        </button>
        <button onClick={() => go("/consult")}>
          {locale === "km" ? "ប្រឹក្សា" : "Consult"}{" "}
        </button>
        <button onClick={() => go("/loan")}>
          {locale === "km" ? "គណនាឥណទាន" : "Loan"}{" "}
        </button>
      </nav>
      <div className="header-actions">
        <button
          className="language"
          onClick={() => setLocale(locale === "km" ? "en" : "km")}
        >
          <Languages size={18} />
          {locale === "km" ? "English" : "ខ្មែរ"}{" "}
        </button>
        <button className="account-link" onClick={() => go("/profile")}>
          <UserRound />
          {isAuthenticated
            ? locale === "km"
              ? "គណនី"
              : "Account"
            : locale === "km"
              ? "ចូលគណនី"
              : "Sign in"}{" "}
        </button>
      </div>
      <button
        className="menu-toggle"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-label={open ? "Close menu" : "Open menu"}
      >
        {open ? <X /> : <Menu />}{" "}
      </button>
      {open && (
        <nav className="mobile-menu">
          <button onClick={() => navigate("/")}>
            {locale === "km" ? "ទំព័រដើម" : "Home"}{" "}
          </button>
          <button onClick={() => navigate("/institutions")}>
            {locale === "km" ? "គ្រឹះស្ថាន" : "Institutions"}{" "}
          </button>
          <button onClick={() => navigate("/learn")}>
            {locale === "km" ? "ស្វែងយល់" : "Learn"}{" "}
          </button>
          <button onClick={() => navigate("/consult")}>
            {locale === "km" ? "ប្រឹក្សា" : "Consult"}{" "}
          </button>
          <button onClick={() => navigate("/loan")}>
            {locale === "km" ? "គណនាឥណទាន" : "Loan"}{" "}
          </button>
          <button onClick={() => navigate("/profile")}>
            {locale === "km" ? "ចូលគណនី" : "Sign in"}{" "}
          </button>
        </nav>
      )}{" "}
    </header>
  );
}

function Home(s: Shared) {
  const { institutions, glossary } = useData();
  const [query, setQuery] = useState("");
  const [compareA, setCompareA] = useState("");
  const [compareB, setCompareB] = useState("");
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    s.setSearch(query);
    s.go("/institutions");
  };
  const startCompare = () => {
    if (compareA && compareB) {
      s.setCompare([compareA, compareB]);
      s.go("/compare");
    }
  };
  return (
    <>
      <section className="home-hero">
        <div className="hero-ribbons" aria-hidden="true">
          <i />
          <i />
          <i />
          <i />
        </div>
        <div className="home-hero-copy">
          <h1 className="sr-only">{s.t.title}</h1>
          <form className="home-search" onSubmit={submit}>
            <Search />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={s.t.search}
            />
            <button>
              {s.locale === "km" ? "ស្វែងរក" : "Explore"} <ChevronRight />
            </button>
          </form>
          <div className="hero-compare-picker">
            <div className="compare-selects">
              <InstitutionPicker
                institutions={institutions}
                value={compareA}
                disabledId={compareB}
                onChange={setCompareA}
                label={s.locale === "km" ? "ជម្រើសទី ១" : "First institution"}
                placeholder={
                  s.locale === "km"
                    ? "ជ្រើសរើសគ្រឹះស្ថាន…"
                    : "Choose an institution…"
                }
                searchPlaceholder={
                  s.locale === "km"
                    ? "ស្វែងរកគ្រឹះស្ថាន…"
                    : "Search institutions…"
                }
                emptyMessage={
                  s.locale === "km"
                    ? "រកមិនឃើញគ្រឹះស្ថាន"
                    : "No institutions found"
                }
              />
              <span className="versus">VS</span>
              <InstitutionPicker
                institutions={institutions}
                value={compareB}
                disabledId={compareA}
                onChange={setCompareB}
                label={s.locale === "km" ? "ជម្រើសទី ២" : "Second institution"}
                placeholder={
                  s.locale === "km"
                    ? "ជ្រើសរើសគ្រឹះស្ថាន…"
                    : "Choose an institution…"
                }
                searchPlaceholder={
                  s.locale === "km"
                    ? "ស្វែងរកគ្រឹះស្ថាន…"
                    : "Search institutions…"
                }
                emptyMessage={
                  s.locale === "km"
                    ? "រកមិនឃើញគ្រឹះស្ថាន"
                    : "No institutions found"
                }
              />
              <button
                type="button"
                onClick={startCompare}
                disabled={!compareA || !compareB}
                aria-label={s.locale === "km" ? "ប្រៀបធៀប" : "Compare"}
              >
                <ChevronRight />
              </button>
            </div>
          </div>
        </div>
      </section>
      <section className="need-section">
        <div className="need-intro">
          <span className="section-number">01</span>
          <div>
            <span className="kicker">
              {s.locale === "km"
                ? "ចាប់ផ្ដើមពីតម្រូវការ"
                : "Start with your need"}
            </span>
            <h2>
              {s.locale === "km"
                ? "តើអ្នកកំពុងស្វែងរកអ្វី?"
                : "What are you looking for?"}
            </h2>
          </div>
          <p>
            {s.locale === "km"
              ? "ជ្រើសប្រភេទមួយ ដើម្បីកាត់បន្ថយបញ្ជី និងមើលជម្រើសដែលពាក់ព័ន្ធ។"
              : "Choose a category to narrow the directory to the options that matter."}
          </p>
        </div>
        <div className="need-grid">
          {[
            [
              Building2,
              "ធនាគារ",
              "Banks",
              "គណនីប្រចាំថ្ងៃ និងសន្សំ",
              "Everyday accounts and savings",
              "bank",
            ],
            [
              ShieldCheck,
              "មីក្រូហិរញ្ញវត្ថុ",
              "Microfinance",
              "ឥណទាន និងសេវាសហគមន៍",
              "Loans and community services",
              "microfinance",
            ],
            [
              MapPin,
              "ឥណទានជនបទ",
              "Rural credit",
              "សេវាហិរញ្ញវត្ថុក្នុងតំបន់",
              "Local financial services",
              "rural",
            ],
            [
              GitCompareArrows,
              "មើលទាំងអស់",
              "Browse all",
              "ស្វែងរកក្នុងបញ្ជីទាំងមូល",
              "Search the full directory",
              "",
            ],
          ].map(([Icon, km, en, descKm, descEn, value]: any) => (
            <button
              key={en}
              onClick={() => {
                s.setSearch(value);
                s.go("/institutions");
              }}
            >
              <span className="need-icon">
                <Icon />
              </span>
              <span>
                <b>{s.locale === "km" ? km : en}</b>
                <small>{s.locale === "km" ? descKm : descEn}</small>
              </span>
              <ChevronRight />
            </button>
          ))}
        </div>
      </section>
      <section className="section learn-preview">
        <div className="section-head">
          <div>
            <h2>
              {s.locale === "km"
                ? "ពាក្យហិរញ្ញវត្ថុគួរយល់"
                : "Financial terms to know"}
            </h2>
          </div>
        </div>
        <div className="term-grid">
          {glossary.slice(0, 3).map((x, index) => (
            <article key={x.slug}>
              <span className="term-index">0{index + 1}</span>
              <h3>{s.locale === "km" ? x.km : x.en}</h3>
              <p>{s.locale === "km" ? x.defKm : x.defEn}</p>
              <button onClick={() => s.go("/learn")}>
                {s.locale === "km" ? "អានបន្ថែម" : "Read more"} <ChevronRight />
              </button>
            </article>
          ))}
          <button className="term-all" onClick={() => s.go("/learn")}>
            <span>
              {s.locale === "km" ? "ស្វែងយល់បន្ថែម" : "Explore the glossary"}
            </span>
            <ChevronRight />
          </button>
        </div>
      </section>
      <HomeFooter locale={s.locale} go={s.go} />
    </>
  );
}

function HomeFooter({
  locale,
  go,
}: {
  locale: Locale;
  go: (path: string) => void;
}) {
  const links =
    locale === "km"
      ? [
          ["គ្រឹះស្ថាន", "/institutions"],
          ["ប្រៀបធៀប", "/compare"],
          ["គណនាឥណទាន", "/loan"],
          ["ស្វែងយល់", "/learn"],
          ["ប្រឹក្សា", "/consult"],
        ]
      : [
          ["Institutions", "/institutions"],
          ["Compare", "/compare"],
          ["Loan calculator", "/loan"],
          ["Learn", "/learn"],
          ["Consult", "/consult"],
        ];
  return (
    <footer className="home-footer">
      <div className="footer-inner">
        <nav
          aria-label={
            locale === "km" ? "តំណភ្ជាប់បាតទំព័រ" : "Footer navigation"
          }
        >
          {links.map(([label, path]) => (
            <button key={path} onClick={() => go(path)}>
              {label}
            </button>
          ))}
        </nav>
      </div>
    </footer>
  );
}

function LoanCalculator({ locale }: { locale: Locale }) {
  const [amount, setAmount] = useState(10000);
  const [rate, setRate] = useState(8);
  const [years, setYears] = useState(3);
  const [currency, setCurrency] = useState<"USD" | "KHR">("USD");

  const principal = Math.max(0, Number(amount) || 0);
  const annualRate = Math.max(0, Number(rate) || 0);
  const months = Math.max(1, Math.round((Number(years) || 0) * 12));
  const monthlyRate = annualRate / 100 / 12;
  const monthlyPayment =
    monthlyRate === 0
      ? principal / months
      : (principal * monthlyRate * (1 + monthlyRate) ** months) /
        ((1 + monthlyRate) ** months - 1);
  const totalPayment = monthlyPayment * months;
  const totalInterest = Math.max(0, totalPayment - principal);

  const money = (value: number) => {
    const formatted = new Intl.NumberFormat("en-US", {
      minimumFractionDigits: currency === "USD" ? 2 : 0,
      maximumFractionDigits: currency === "USD" ? 2 : 0,
    }).format(Number.isFinite(value) ? value : 0);
    return currency === "USD" ? `$${formatted}` : `${formatted} ៛`;
  };

  const isKm = locale === "km";
  return (
    <section className="loan-page">
      <header className="loan-heading">
        <h1>{isKm ? "ម៉ាស៊ីនគណនាឥណទាន" : "Loan calculator"}</h1>
        <p>
          {isKm
            ? "ប៉ាន់ស្មានការបង់រំលស់ប្រចាំខែ និងការប្រាក់សរុបរបស់អ្នក។"
            : "Estimate your monthly repayment and see the total cost of a loan."}
        </p>
      </header>

      <div className="loan-workspace">
        <form className="loan-form" onSubmit={(event) => event.preventDefault()}>
          <div className="loan-form-head">
            <h2>{isKm ? "ព័ត៌មានឥណទាន" : "Loan details"}</h2>
            <label>
              <span className="sr-only">{isKm ? "រូបិយប័ណ្ណ" : "Currency"}</span>
              <select
                aria-label={isKm ? "រូបិយប័ណ្ណ" : "Currency"}
                value={currency}
                onChange={(event) =>
                  setCurrency(event.target.value as "USD" | "KHR")
                }
              >
                <option value="USD">USD ($)</option>
                <option value="KHR">KHR (៛)</option>
              </select>
            </label>
          </div>

          <label className="loan-field">
            <span>{isKm ? "ចំនួនប្រាក់កម្ចី" : "Loan amount"}</span>
            <div>
              <b>{currency === "USD" ? "$" : "៛"}</b>
              <input
                aria-label={isKm ? "ចំនួនប្រាក់កម្ចី" : "Loan amount"}
                type="number"
                min="0"
                step={currency === "USD" ? "100" : "100000"}
                value={amount}
                onChange={(event) => setAmount(Number(event.target.value))}
              />
            </div>
          </label>

          <div className="loan-field-row">
            <label className="loan-field">
              <span>{isKm ? "អត្រាការប្រាក់ប្រចាំឆ្នាំ" : "Annual interest rate"}</span>
              <div>
                <input
                  aria-label={isKm ? "អត្រាការប្រាក់ប្រចាំឆ្នាំ" : "Annual interest rate"}
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={rate}
                  onChange={(event) => setRate(Number(event.target.value))}
                />
                <b>%</b>
              </div>
            </label>
            <label className="loan-field">
              <span>{isKm ? "រយៈពេលកម្ចី" : "Loan term"}</span>
              <div>
                <input
                  aria-label={isKm ? "រយៈពេលកម្ចី" : "Loan term"}
                  type="number"
                  min="1"
                  max="50"
                  step="1"
                  value={years}
                  onChange={(event) => setYears(Number(event.target.value))}
                />
                <b>{isKm ? "ឆ្នាំ" : "years"}</b>
              </div>
            </label>
          </div>
        </form>

        <aside className="loan-results" aria-live="polite">
          <span>{isKm ? "ការបង់ប្រចាំខែប៉ាន់ស្មាន" : "Estimated monthly payment"}</span>
          <strong>{money(monthlyPayment)}</strong>
          <small>
            {isKm ? `បង់ចំនួន ${months} ខែ` : `${months} monthly payments`}
          </small>

          <dl>
            <div>
              <dt>{isKm ? "ប្រាក់ដើម" : "Principal"}</dt>
              <dd>{money(principal)}</dd>
            </div>
            <div>
              <dt>{isKm ? "ការប្រាក់សរុប" : "Total interest"}</dt>
              <dd>{money(totalInterest)}</dd>
            </div>
            <div>
              <dt>{isKm ? "ចំនួនសរុបត្រូវបង់" : "Total repayment"}</dt>
              <dd>{money(totalPayment)}</dd>
            </div>
          </dl>
          <p className="loan-note">
            <Info />
            {isKm
              ? "នេះជាការប៉ាន់ស្មានប៉ុណ្ណោះ។ ថ្លៃសេវា និងលក្ខខណ្ឌរបស់គ្រឹះស្ថានអាចធ្វើឱ្យចំនួនពិតប្រាកដខុសគ្នា។"
              : "This is an estimate. Fees and lender terms may change the actual repayment amount."}
          </p>
        </aside>
      </div>
    </section>
  );
}

function InstitutionCard({
  institution: i,
  locale,
  t,
  go,
  compare,
  setCompare,
}: Shared & { institution: Institution }) {
  const selected = compare.includes(i.id);
  return (
    <article className="institution-card">
      <div className="card-top">
        <InstitutionLogo institution={i} />
        <button className="heart" aria-label="Save">
          <Heart />
        </button>
      </div>
      {i.cmaMember && (
        <span className="badge cma">
          <CmaLogo />
        </span>
      )}
      <span className={`badge ${i.verified ? "ok" : "neutral"}`}>
        {i.verified ? <BadgeCheck /> : <CircleHelp />}
        {i.verified ? t.verified : t.notVerified}
      </span>
      <h3>{locale === "km" ? i.nameKm : i.nameEn}</h3>
      <small>{locale === "km" ? i.typeKm : i.typeEn}</small>
      <div className="rating unrated">
        <MessageSquareText />
        <span>{locale === "km" ? "រង្វាស់ដោយ Finឆែក" : "Metrics by FinCheck"}</span>
      </div>
      <div className="card-actions">
        <button
          className="primary ghost"
          onClick={() => go("/institutions/" + i.id)}
        >
          {t.details}
        </button>
        <button
          aria-label={t.compare}
          className={selected ? "compare selected" : "compare"}
          onClick={() =>
            setCompare(
              selected
                ? compare.filter((x) => x !== i.id)
                : compare.length < 3
                  ? [...compare, i.id]
                  : compare,
            )
          }
        >
          {selected ? <Check /> : <GitCompareArrows />}
        </button>
      </div>
    </article>
  );
}

function InstitutionRow({
  institution: i,
  locale,
  t,
  go,
  compare,
  setCompare,
}: Shared & { institution: Institution }) {
  const selected = compare.includes(i.id);
  return (
    <article className="institution-row">
      <InstitutionLogo institution={i} />
      <div className="row-institution">
        <h2>{locale === "km" ? i.nameKm : i.nameEn}</h2>
        <span>{locale === "km" ? i.typeKm : i.typeEn}</span>
      </div>
      <div className="row-status">
        <small>{locale === "km" ? "ការផ្ទៀងផ្ទាត់" : "Verification"}</small>
        <span>
          {i.verified ? <NbcLogo /> : <CircleHelp />}
          {i.verified ? t.verified : t.notVerified}
        </span>
      </div>
      <div className="row-actions">
        <button
          className={selected ? "row-compare selected" : "row-compare"}
          onClick={() =>
            setCompare(
              selected
                ? compare.filter((x) => x !== i.id)
                : compare.length < 3
                  ? [...compare, i.id]
                  : compare,
            )
          }
        >
          {selected ? <Check /> : <GitCompareArrows />}
          <span>
            {selected ? (locale === "km" ? "បានបន្ថែម" : "Added") : t.compare}
          </span>
        </button>
        <button
          className="row-details"
          onClick={() => go("/institutions/" + i.id)}
        >
          {t.details}
          <ChevronRight />
        </button>
      </div>
    </article>
  );
}

function Explore(s: Shared) {
  const { institutions } = useData();
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [type, setType] = useState("all");
  const [view, setView] = useState<"list" | "grid">(() =>
    localStorage.getItem("institution-view") === "grid" ? "grid" : "list",
  );
  useEffect(() => localStorage.setItem("institution-view", view), [view]);
  const results = useMemo(() => {
    const collator = new Intl.Collator(s.locale, {
      numeric: true,
      sensitivity: "base",
    });

    return institutions
      .filter(
        (i) =>
          (!verifiedOnly || i.verified) &&
          (type === "all" ||
            (type === "Commercial"
              ? i.typeEn.toLowerCase().includes("bank")
              : i.typeEn.toLowerCase().includes("microfinance") ||
                i.typeEn.includes("MFI"))) &&
          (i.nameKm + i.nameEn + i.services.join(""))
            .toLowerCase()
            .includes(s.search.toLowerCase()),
      )
      .sort((a, b) =>
        collator.compare(
          s.locale === "km" ? a.nameKm : a.nameEn,
          s.locale === "km" ? b.nameKm : b.nameEn,
        ),
      );
  }, [institutions, verifiedOnly, type, s.search, s.locale]);
  return (
    <div className="page directory-page">
      <div className="page-title">
        <h1>{s.t.institutions} </h1>
        <p>
          {s.locale === "km"
            ? "ស្វែងរក និងប្រៀបធៀបគ្រឹះស្ថានក្នុងបញ្ជី។"
            : "Search and compare institutions in the directory."}{" "}
        </p>{" "}
      </div>
      <div className="directory-tools">
        <div className="explore-search">
          <Search />
          <input
            value={s.search}
            onChange={(e) => s.setSearch(e.target.value)}
            placeholder={s.t.search}
          />
        </div>
        <div className="filters">
          <button
            className={type === "all" ? "active" : ""}
            onClick={() => setType("all")}
          >
            {s.t.all}{" "}
          </button>
          <button
            className={type === "Commercial" ? "active" : ""}
            onClick={() => setType("Commercial")}
          >
            {s.locale === "km" ? "ធនាគារ" : "Banks"}{" "}
          </button>
          <button
            className={type === "MFI" ? "active" : ""}
            onClick={() => setType("MFI")}
          >
            {s.locale === "km" ? "មីក្រូហិរញ្ញវត្ថុ" : "Microfinance"}{" "}
          </button>{" "}
          <button
            className={verifiedOnly ? "active" : ""}
            onClick={() => setVerifiedOnly(!verifiedOnly)}
          >
            <BadgeCheck />
            {s.locale === "km" ? "បានផ្ទៀងផ្ទាត់" : "Verified"}{" "}
          </button>{" "}
        </div>
      </div>
      <div className="results-head">
        <b>
          {results.length} {s.locale === "km" ? "លទ្ធផល" : "institutions"}{" "}
        </b>{" "}
        <div
          className="view-switcher"
          role="group"
          aria-label={s.locale === "km" ? "ទម្រង់បង្ហាញ" : "View options"}
        >
          <button
            type="button"
            className={view === "list" ? "active" : ""}
            aria-label={s.locale === "km" ? "បង្ហាញជាបញ្ជី" : "List view"}
            aria-pressed={view === "list"}
            title={s.locale === "km" ? "បញ្ជី" : "List"}
            onClick={() => setView("list")}
          >
            <List />
          </button>
          <button
            type="button"
            className={view === "grid" ? "active" : ""}
            aria-label={s.locale === "km" ? "បង្ហាញជាប្រអប់" : "Grid view"}
            aria-pressed={view === "grid"}
            title={s.locale === "km" ? "ប្រអប់" : "Grid"}
            onClick={() => setView("grid")}
          >
            <LayoutGrid />
          </button>
        </div>
      </div>
      <div className={`institution-list view-${view}`}>
        {results.map((i) => (
          <InstitutionRow key={i.id} institution={i} {...s} />
        ))}{" "}
      </div>
      {!results.length && (
        <div className="empty">
          <Search />
          <h2>{s.locale === "km" ? "រកមិនឃើញលទ្ធផល" : "No results found"} </h2>
          <button onClick={() => s.setSearch("")}>
            {s.locale === "km" ? "សម្អាតការស្វែងរក" : "Clear search"}{" "}
          </button>{" "}
        </div>
      )}{" "}
    </div>
  );
}

function Profile({
  institution: i,
  ...s
}: Shared & { institution: Institution }) {
  const [evidence, setEvidence] = useState(false);
  return (
    <div className="page">
      <button className="back" onClick={() => s.go("/institutions")}>
        <ArrowLeft />
        {s.locale === "km" ? "ត្រឡប់ទៅលទ្ធផល" : "Back to results"}{" "}
      </button>
      <section className="profile-hero">
        <span
          className="institution-logo large"
          style={{ background: i.color }}
        >
          {i.short}{" "}
        </span>
        <div>
          <span className={`badge ${i.verified ? "ok" : "neutral"}`}>
            {i.verified ? <BadgeCheck /> : <CircleHelp />}{" "}
            {i.verified ? s.t.verified : s.t.notVerified}{" "}
          </span>
          <h1>{s.locale === "km" ? i.nameKm : i.nameEn} </h1>{" "}
          <p>
            {" "}
            {s.locale === "km" ? i.nameEn : i.nameKm}·{" "}
            {s.locale === "km" ? i.typeKm : i.typeEn}{" "}
          </p>
          <div className="rating">
            <Star fill="currentColor" />
            <b>{i.rating} </b>
            <span>
              ({i.reviews} {s.locale === "km" ? "មតិ" : "reviews"})
            </span>
          </div>
        </div>
        <button className="primary">
          <Heart />
          {s.locale === "km" ? "រក្សាទុក" : "Save"}{" "}
        </button>
      </section>
      <div className="profile-layout">
        <div>
          <section className="content-card">
            <h2>
              {s.locale === "km"
                ? "អំពីគ្រឹះស្ថាន"
                : "About this institution"}{" "}
            </h2>{" "}
            <p>{s.locale === "km" ? i.descriptionKm : i.descriptionEn} </p>{" "}
            <div className="service-pills">
              {i.services.map((x) => (
                <span key={x}>{x} </span>
              ))}{" "}
            </div>
          </section>
          <section className="content-card">
            <div className="section-head">
              <h2>{s.t.reviews} </h2>
              <button className="primary">
                {s.locale === "km" ? "សរសេរមតិ" : "Write a review"}{" "}
              </button>
            </div>
            <div className="review">
              <span className="avatar"> ស</span>
              <div>
                <b>{s.locale === "km" ? "សុភាព" : "Sopheap"} </b>
                <div className="rating">
                  {[1, 2, 3, 4, 5].map((x) => (
                    <Star key={x} fill="currentColor" />
                  ))}{" "}
                </div>
                <p>
                  {s.locale === "km"
                    ? "បុគ្គលិកពន្យល់ពីថ្លៃសេវាច្បាស់ ហើយការបើកគណនីមិនចំណាយពេលយូរ។"
                    : "Staff explained the fees clearly, and opening the account did not take long."}{" "}
                </p>
                <small>
                  {s.locale === "km"
                    ? "បទពិសោធន៍ផ្ទាល់ · ២ ខែមុន"
                    : "Firsthand experience · 2 months ago"}{" "}
                </small>{" "}
              </div>
            </div>
          </section>
        </div>
        <aside>
          <section className="verification-card">
            <div className="verify-head">
              <ShieldCheck />
              <div>
                <b>{i.verified ? s.t.verified : s.t.notVerified} </b>{" "}
                <small>
                  {s.locale === "km"
                    ? "ស្ថានភាពផ្ទៀងផ្ទាត់"
                    : "Verification status"}{" "}
                </small>
              </div>
            </div>
            <dl>
              <div>
                <dt>{s.locale === "km" ? "និយតករ" : "Regulator"} </dt>
                <dd>{i.verified ? "National Bank of Cambodia" : "—"} </dd>{" "}
              </div>
              <div>
                <dt>
                  {s.locale === "km" ? "ពិនិត្យចុងក្រោយ" : "Last checked"}{" "}
                </dt>
                <dd>{i.verified ? "15 Aug 2026" : "Pending review"} </dd>{" "}
              </div>
              <div>
                <dt>{s.locale === "km" ? "ប្រភេទ" : "Category"} </dt>
                <dd>{s.locale === "km" ? i.typeKm : i.typeEn} </dd>{" "}
              </div>
            </dl>
            <button
              className="primary ghost full"
              onClick={() => setEvidence(!evidence)}
            >
              {s.locale === "km" ? "មើលប្រភពផ្លូវការ" : "View official source"}{" "}
              <ChevronRight />
            </button>
            {evidence && (
              <div className="evidence">
                <Info />
                <p>
                  {s.locale === "km"
                    ? "គំរូនេះបង្ហាញរចនាសម្ព័ន្ធភស្តុតាង។ ត្រូវបញ្ចូលតំណ NBC ដែលបានពិនិត្យមុនដាក់ឱ្យប្រើប្រាស់។"
                    : "This prototype demonstrates the evidence structure. Add a reviewed NBC source before production."}{" "}
                </p>{" "}
              </div>
            )}{" "}
          </section>
          <section className="content-card">
            <h3>{s.locale === "km" ? "តំបន់សេវា" : "Service areas"} </h3>
            {i.provinces.map((p) => (
              <p className="line" key={p}>
                <MapPin />
                {p}{" "}
              </p>
            ))}{" "}
            <p className="line">
              <Check />
              {i.deposits
                ? s.locale === "km"
                  ? "ទទួលប្រាក់បញ្ញើ"
                  : "Accepts deposits"
                : s.locale === "km"
                  ? "មិនទទួលប្រាក់បញ្ញើ"
                  : "Does not take deposits"}{" "}
            </p>{" "}
          </section>
        </aside>
      </div>
    </div>
  );
}

function Compare({ ids, ...s }: Shared & { ids: string[] }) {
  const { institutions } = useData();
  const list = ids
    .map((id) => institutions.find((i) => i.id === id))
    .filter(Boolean) as Institution[];
  return (
    <div className="page">
      <div className="page-title">
        <span className="kicker">
          {s.locale === "km" ? "មើលភាពខុសគ្នា" : "See the differences"}{" "}
        </span>{" "}
        <h1>{s.t.compare} </h1>
        <p>
          {s.locale === "km"
            ? "ប្រៀបធៀបព័ត៌មានសំខាន់ៗ។ ពិនិត្យប្រភពផ្លូវការមុនសម្រេចចិត្ត។"
            : "Compare key facts. Check official sources before deciding."}{" "}
        </p>{" "}
      </div>
      <div className="compare-table">
        <div className="compare-row header">
          <b>{s.locale === "km" ? "ព័ត៌មាន" : "Details"} </b>
          {list.map((i) => (
            <div key={i.id}>
              <span
                className="institution-logo"
                style={{ background: i.color }}
              >
                {i.short}{" "}
              </span>
              <b>{s.locale === "km" ? i.nameKm : i.nameEn} </b>{" "}
            </div>
          ))}{" "}
        </div>
        {[
          ["typeKm", "ប្រភេទ", "Type"],
          ["verified", "ស្ថានភាព", "Verification"],
          ["deposits", "ប្រាក់បញ្ញើ", "Deposits"],
          ["rating", "ការវាយតម្លៃ", "Rating"],
        ].map(([key, km, en]) => (
          <div className="compare-row" key={key}>
            <b>{s.locale === "km" ? km : en} </b>
            {list.map((i) => (
              <span key={i.id}>
                {key === "verified"
                  ? i.verified
                    ? s.t.verified
                    : s.t.notVerified
                  : key === "deposits"
                    ? i.deposits
                      ? "✓"
                      : "—"
                    : key === "typeKm"
                      ? s.locale === "km"
                        ? i.typeKm
                        : i.typeEn
                      : "★ " + i.rating}{" "}
              </span>
            ))}{" "}
          </div>
        ))}{" "}
      </div>{" "}
    </div>
  );
}

function InlineMarkdown({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\(https?:\/\/[^\s)]+\))/g);
  return (
    <>
      {parts.map((part, index) => {
        const bold = part.match(/ ^\*\*(.+)\*\*$ /);
        if (bold) return <strong key={index}>{bold[1]} </strong>;
        const link = part.match(/^\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)$/);
        if (link)
          return (
            <a key={index} href={link[2]} target="_blank" rel="noreferrer">
              {link[1]}{" "}
            </a>
          );
        return part;
      })}
    </>
  );
}

function LegacyMarkdownMessage({ content }: { content: string }) {
  const blocks: React.ReactNode[] = [];
  let list: string[] = [];
  const flushList = () => {
    if (list.length) {
      blocks.push(
        <ul key={`list - ${blocks.length}`}>
          {list.map((item, index) => (
            <li key={index}>
              <InlineMarkdown text={item} />
            </li>
          ))}{" "}
        </ul>,
      );
      list = [];
    }
  };
  content.split("\n").forEach((line, index) => {
    const trimmed = line.trim();
    const bullet = trimmed.match(/^[-*]\s+(.+)/);
    if (bullet) {
      list.push(bullet[1]);
      return;
    }
    flushList();
    if (!trimmed) return;
    const heading = trimmed.match(/^#{1,3}\s+(.+)/);
    blocks.push(
      heading ? (
        <h3 key={index}>
          <InlineMarkdown text={heading[1]} />
        </h3>
      ) : (
        <p key={index}>
          <InlineMarkdown text={trimmed} />
        </p>
      ),
    );
  });
  flushList();
  return <div className="markdown-message">{blocks} </div>;
}

function MarkdownMessage({ content }: { content: string }) {
  // Models occasionally join adjacent table rows with `||` and use HTML
  // breaks inside cells. Normalize both so formatting never leaks as text.
  const normalized = content
    .replace(/\s*\|\|\s*/g, "|\n|")
    .replace(/<br\s*\/?>/gi, " · ")
    // Do not expose a tiny, unfinished final bullet such as `- **L` when a
    // provider stops generation partway through a Markdown item.
    .replace(/\n\s*[-*+]\s+(?:\*{1,2})?[\p{L}\p{N}]{0,2}\s*$/u, "")
    .trim();

  return (
    <div className="markdown-message">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{normalized}</ReactMarkdown>
    </div>
  );
}

type ChatMessage = { id: string; role: "user" | "assistant"; content: string };
type ChatThread = {
  id: string;
  title: string;
  messages: ChatMessage[];
  updatedAt: number;
};

const CHAT_HISTORY_KEY = "pisey-chat-history-v1";
const LEAKED_REASONING_PATTERNS = [
  /^here(?:'|’)s (?:a|the|my) (?:thinking|thought|reasoning|analysis) process\b/i,
  /^(?:#+\s*)?(?:analysis|reasoning|thinking process|internal reasoning)\s*:/i,
  /^\s*\d+\.\s*(?:analy[sz]e user input|identify (?:key )?constraints|determine content structure)\b/im,
];

function removeLeakedReasoning(messages: ChatMessage[]) {
  return messages.reduce<ChatMessage[]>((safe, message) => {
    const leaked =
      message.role === "assistant" &&
      LEAKED_REASONING_PATTERNS.some((pattern) => pattern.test(message.content.trim()));
    if (leaked) {
      // Remove the matching user turn too, avoiding a false "interrupted" state.
      if (safe.at(-1)?.role === "user") safe.pop();
    } else {
      safe.push(message);
    }
    return safe;
  }, []);
}

function makeId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
}

function newChatThread(): ChatThread {
  return { id: makeId(), title: "", messages: [], updatedAt: Date.now() };
}

function loadChatHistory(): ChatThread[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(CHAT_HISTORY_KEY) ?? "[]") as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((thread): thread is ChatThread => {
        if (!thread || typeof thread !== "object") return false;
        const value = thread as Partial<ChatThread>;
        return (
          typeof value.id === "string" &&
          typeof value.title === "string" &&
          typeof value.updatedAt === "number" &&
          Array.isArray(value.messages) &&
          value.messages.every(
            (message) =>
              message &&
              typeof message.id === "string" &&
              (message.role === "user" || message.role === "assistant") &&
              typeof message.content === "string",
          )
        );
      })
      .map((thread) => ({
        ...thread,
        messages: removeLeakedReasoning(thread.messages),
      }))
      .slice(0, 30);
  } catch {
    return [];
  }
}

function saveChatHistory(threads: ChatThread[]) {
  try {
    localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(threads.slice(0, 30)));
  } catch {
    // A full or disabled storage area should not prevent the chat from working.
  }
}

function Consult(s: Shared) {
  const [threads, setThreads] = useState<ChatThread[]>(() => {
    const saved = loadChatHistory();
    return saved.length ? saved : [newChatThread()];
  });
  const [activeId, setActiveId] = useState(() => {
    const saved = loadChatHistory();
    const preferred = localStorage.getItem(`${CHAT_HISTORY_KEY}-active`);
    return saved.find((thread) => thread.id === preferred)?.id ?? saved[0]?.id ?? "";
  });
  const [text, setText] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const activeThread = threads.find((thread) => thread.id === activeId) ?? threads[0];
  const messages = activeThread?.messages ?? [];
  useEffect(() => {
    saveChatHistory(threads);
  }, [threads]);
  useEffect(() => {
    if (activeThread) localStorage.setItem(`${CHAT_HISTORY_KEY}-active`, activeThread.id);
  }, [activeThread?.id]);

  const updateThread = (id: string, update: (thread: ChatThread) => ChatThread) => {
    setThreads((current) => {
      const next = current.map((thread) => (thread.id === id ? update(thread) : thread));
      next.sort((a, b) => b.updatedAt - a.updatedAt);
      saveChatHistory(next);
      return next;
    });
  };
  const startNewChat = () => {
    const thread = newChatThread();
    setThreads((current) => [thread, ...current]);
    setActiveId(thread.id);
    setText("");
    setError("");
  };
  const deleteThread = (id: string) => {
    const remaining = threads.filter((thread) => thread.id !== id);
    const next = remaining.length ? remaining : [newChatThread()];
    setThreads(next);
    if (id === activeThread?.id) setActiveId(next[0].id);
    setError("");
  };
  const prompts =
    s.locale === "km"
      ? [
          "តើខ្ញុំគួរប្រៀបធៀបឥណទានដូចម្តេច?",
          "តើអត្រាការប្រាក់មានន័យដូចម្តេច?",
          "តើត្រូវសួរអ្វីមុនបើកគណនី?",
        ]
      : [
          "How should I compare loans?",
          "What does an interest rate mean?",
          "What should I ask before opening an account?",
        ];
  const submitMessage = async (content: string, previous = messages) => {
    if (!content || loading) return;
    const threadId = activeThread?.id;
    if (!threadId) return;
    const next = [
      ...previous,
      { id: makeId(), role: "user", content } satisfies ChatMessage,
    ];
    updateThread(threadId, (thread) => ({
      ...thread,
      title: thread.title || content.slice(0, 52),
      messages: next,
      updatedAt: Date.now(),
    }));
    setText("");
    setFiles([]);
    setError("");
    setLoading(true);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: next.map(({ role, content }) => ({ role, content })),
          locale: s.locale,
        }),
      });
      const data = (await response.json()) as {
        reply?: string;
        error?: string;
      };
      if (!response.ok || !data.reply)
        throw new Error(data.error || "Chat request failed.");
      updateThread(threadId, (thread) => ({
        ...thread,
        messages: [
          ...next,
          { id: makeId(), role: "assistant", content: data.reply! },
        ],
        updatedAt: Date.now(),
      }));
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Chat request failed.",
      );
    } finally {
      setLoading(false);
    }
  };
  const send = (e: React.FormEvent) => {
    e.preventDefault();
    void submitMessage(text.trim());
  };
  const retryLastMessage = () => {
    const last = messages.at(-1);
    if (!last || last.role !== "user") return;
    const previous = messages.slice(0, -1);
    updateThread(activeThread.id, (thread) => ({ ...thread, messages: previous }));
    void submitMessage(last.content, previous);
  };
  return (
    <div className="assistant-page">
      <div className="assistant-workspace">
        <aside className="chat-history" aria-label={s.locale === "km" ? "ប្រវត្តិជជែក" : "Chat history"}>
          <div className="chat-history-head">
            <b>{s.locale === "km" ? "ប្រវត្តិជជែក" : "Chats"}</b>
            <button type="button" onClick={startNewChat} aria-label={s.locale === "km" ? "ការជជែកថ្មី" : "New chat"}>
              <Plus />
            </button>
          </div>
          <div className="chat-history-list">
            {threads.map((thread) => (
              <div className={thread.id === activeThread?.id ? "active" : ""} key={thread.id}>
                <button type="button" onClick={() => { setActiveId(thread.id); setError(""); }}>
                  <MessageSquareText />
                  <span>{thread.title || (s.locale === "km" ? "ការជជែកថ្មី" : "New chat")}</span>
                </button>
                <button type="button" className="delete-chat" onClick={() => deleteThread(thread.id)} aria-label={s.locale === "km" ? "លុបការជជែក" : "Delete chat"}>
                  <Trash2 />
                </button>
              </div>
            ))}
          </div>
        </aside>
        <div className="assistant-shell">
        <h1>
          {s.locale === "km" ? "តើខ្ញុំអាចជួយអ្វីបាន?" : "How can I help?"}{" "}
        </h1>{" "}
        <div className="assistant-topics">
          <button onClick={() => setText(prompts[0])}>
            <GitCompareArrows />
            {s.locale === "km" ? "ប្រៀបធៀប" : "Compare"}{" "}
          </button>
          <button
            onClick={() =>
              setText(
                s.locale === "km"
                  ? "តើខ្ញុំគួរសន្សំប្រាក់ដូចម្តេច?"
                  : "How should I start saving?",
              )
            }
          >
            <Building2 />
            {s.locale === "km" ? "សន្សំ" : "Save"}{" "}
          </button>
          <button onClick={() => setText(prompts[1])}>
            <BookOpen />
            {s.locale === "km" ? "ស្វែងយល់" : "Learn"}{" "}
          </button>
        </div>
        {messages.length === 0 && (
          <div className="assistant-prompts">
            {prompts.map((p) => (
              <button key={p} onClick={() => setText(p)}>
                {p} <ChevronRight />{" "}
              </button>
            ))}{" "}
          </div>
        )}{" "}
        <div className="assistant-conversation" aria-live="polite">
          {messages.map((message) => (
            <div className={`assistant-message ${message.role}`} key={message.id}>
              <div>
                <b>
                  {message.role === "assistant"
                    ? s.locale === "km"
                      ? "Finឆែក ឆ្លើយតប"
                      : "FinCheck"
                    : s.locale === "km"
                      ? "អ្នក"
                      : "You"}{" "}
                </b>
                <MarkdownMessage content={message.content} />
                {message.role === "assistant" && (
                  <small>{s.t.disclaimer} </small>
                )}{" "}
              </div>
            </div>
          ))}{" "}
          {loading && (
            <div className="assistant-status">
              {s.locale === "km" ? "កំពុងគិត…" : "Thinking…"}{" "}
            </div>
          )}
          {!loading && !error && messages.at(-1)?.role === "user" && (
            <div className="assistant-interrupted" role="status">
              <span>
                {s.locale === "km"
                  ? "ការឆ្លើយតបត្រូវបានផ្អាក។"
                  : "The response was interrupted."}
              </span>
              <button type="button" onClick={retryLastMessage}>
                {s.locale === "km" ? "បន្តម្តងទៀត" : "Try again"}
              </button>
            </div>
          )}
          {error && (
            <div className="assistant-error" role="alert">
              {error}{" "}
              {messages.at(-1)?.role === "user" && (
                <button type="button" onClick={retryLastMessage}>
                  {s.locale === "km" ? "ព្យាយាមម្តងទៀត" : "Retry"}
                </button>
              )}
            </div>
          )}{" "}
        </div>
        <form className="assistant-composer" onSubmit={send}>
          {files.length > 0 && (
            <div className="attached-files">
              {files.map((file, index) => (
                <span key={file.name + index}>
                  <FileText />
                  <b>{file.name} </b>
                  <button
                    type="button"
                    onClick={() =>
                      setFiles(files.filter((_, n) => n !== index))
                    }
                    aria-label={`Remove ${file.name}`}
                  >
                    <X />
                  </button>
                </span>
              ))}{" "}
            </div>
          )}{" "}
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                e.currentTarget.form?.requestSubmit();
              }
            }}
            disabled={loading}
            placeholder={s.locale === "km" ? "សរសេរសារ…" : "Type your message…"}
          />
          <div>
            <label className="attach-control">
              <Paperclip />
              <span>{s.locale === "km" ? "ភ្ជាប់ឯកសារ" : "Attach files"}</span>
              <input
                type="file"
                multiple
                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                onChange={(e) => {
                  setFiles(
                    [...files, ...Array.from(e.target.files ?? [])].slice(0, 5),
                  );
                  e.target.value = "";
                }}
              />{" "}
            </label>
            <span className="privacy-hint">
              <Info />
              {s.locale === "km"
                ? "កុំចែករំលែកលេខសម្ងាត់ ឬ OTP"
                : "Never share passwords or OTPs"}{" "}
            </span>
            <button
              disabled={!text.trim() || loading}
              aria-label={s.locale === "km" ? "ផ្ញើ" : "Send"}
            >
              <ChevronRight />
            </button>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
}

function Learn(s: Shared) {
  const { glossary } = useData();
  const [q, setQ] = useState("");
  const [topic, setTopic] = useState("all");
  const topicTerms: Record<string, string[]> = {
    all: glossary.map((x) => x.slug),
    borrowing: [
      "interest",
      "principal",
      "apr",
      "flat-rate",
      "declining-balance",
      "loan-term",
      "installment",
      "processing-fee",
      "prepayment",
      "guarantor",
      "debt-to-income",
      "grace-period",
      "late-fee",
      "default",
      "collateral",
      "total-cost",
      "credit-report",
      "terms-conditions",
    ],
    saving: [
      "interest",
      "principal",
      "savings-account",
      "compound-interest",
      "emergency-fund",
      "savings-goal",
      "automatic-saving",
      "fixed-deposit",
      "liquidity",
      "inflation",
      "budget",
      "deposit-insurance",
    ],
    safety: [
      "collateral",
      "late-fee",
      "guarantor",
      "default",
      "deposit-insurance",
      "otp",
      "phishing",
      "pin",
      "licensed-institution",
      "terms-conditions",
      "complaint",
      "fraud",
      "credit-report",
    ],
  };
  const topics = [
    ["all", BookOpen, "មេរៀនទាំងអស់", "All lessons"],
    ["borrowing", Building2, "ការខ្ចីប្រាក់", "Borrowing"],
    ["saving", Sparkles, "ការសន្សំ", "Saving"],
    ["safety", ShieldCheck, "សុវត្ថិភាព", "Safety"],
  ] as const;
  const terms = glossary.filter(
    (x) =>
      topicTerms[topic].includes(x.slug) &&
      (x.km + x.en + x.defKm + x.defEn)
        .toLowerCase()
        .includes(q.trim().toLowerCase()),
  );
  return (
    <div className="learn-page">
      <section className="learn-workspace">
        <nav
          className="lesson-topics"
          aria-label={s.locale === "km" ? "ប្រធានបទមេរៀន" : "Lesson topics"}
        >
          {topics.map(([id, Icon, km, en]) => (
            <button
              key={id}
              className={topic === id ? "active" : ""}
              onClick={() => setTopic(id)}
              aria-pressed={topic === id}
            >
              <Icon />
              <span>{s.locale === "km" ? km : en} </span>
              <small>{topicTerms[id].length} </small>
            </button>
          ))}{" "}
        </nav>
        <div className="lesson-content">
          <div className="lesson-toolbar">
            <div>
              <h2>
                {s.locale === "km"
                  ? topics.find((x) => x[0] === topic)![2]
                  : topics.find((x) => x[0] === topic)![3]}{" "}
              </h2>
              <p>
                {terms.length}{" "}
                {s.locale === "km" ? "មេរៀនខ្លីៗ" : "short lessons"} · 2–3 min
              </p>
            </div>
            <label className="lesson-search">
              <Search />
              <span className="sr-only">
                {s.locale === "km" ? "ស្វែងរកមេរៀន" : "Search lessons"}{" "}
              </span>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={s.locale === "km" ? "ស្វែងរក…" : "Search lessons…"}
              />
              {q && (
                <button
                  type="button"
                  onClick={() => setQ("")}
                  aria-label={s.locale === "km" ? "សម្អាត" : "Clear search"}
                >
                  <X />
                </button>
              )}{" "}
            </label>
          </div>
          {terms.length ? (
            <div className="lesson-list">
              {terms.map((x) => (
                <article key={x.slug}>
                  <button
                    className="lesson-summary"
                    onClick={() => s.go("/learn/" + x.slug)}
                  >
                    <span className="lesson-number" aria-hidden="true" />
                    <span className="lesson-copy">
                      <small>{s.locale === "km" ? x.en : x.km} </small>{" "}
                      <b>{s.locale === "km" ? x.km : x.en} </b>
                      <span>{s.locale === "km" ? x.defKm : x.defEn} </span>{" "}
                    </span>
                    <span className="lesson-state">
                      <ChevronRight />
                    </span>
                  </button>
                </article>
              ))}{" "}
            </div>
          ) : (
            <div className="lesson-empty">
              <Search />
              <h3>
                {s.locale === "km" ? "រកមិនឃើញមេរៀន" : "No lessons found"}{" "}
              </h3>
              <p>
                {s.locale === "km"
                  ? "សាកល្បងពាក្យផ្សេង ឬសម្អាតការស្វែងរក។"
                  : "Try another phrase or clear your search."}{" "}
              </p>
              <button onClick={() => setQ("")}>
                {s.locale === "km"
                  ? "បង្ហាញមេរៀនទាំងអស់"
                  : "Show all lessons"}{" "}
              </button>{" "}
            </div>
          )}{" "}
        </div>
      </section>
    </div>
  );
}

function LessonArticle({ slug, ...s }: Shared & { slug: string }) {
  const { glossary } = useData();
  const term = glossary.find((x) => x.slug === slug) ?? glossary[0];
  const detail: Record<
    string,
    {
      exampleEn: string;
      exampleKm: string;
      pointsEn: string[];
      pointsKm: string[];
      questionEn: string;
      questionKm: string;
    }
  > = {
    interest: {
      exampleEn:
        "If you borrow $1,000 at 12% annual interest, the interest is about $120 for one year before fees. The actual amount can differ depending on how the lender calculates it.",
      exampleKm:
        "បើអ្នកខ្ចី ១,០០០ ដុល្លារ ក្នុងអត្រាការប្រាក់ ១២% ក្នុងមួយឆ្នាំ ការប្រាក់ប្រហែល ១២០ ដុល្លារ មុនរាប់ថ្លៃសេវា។ ចំនួនពិតអាចខុសគ្នាតាមវិធីគណនា។",
      pointsEn: [
        "An annual rate describes the cost over one year.",
        "A flat rate and a declining-balance rate are not equivalent.",
        "Fees can make the total borrowing cost higher than the advertised rate.",
      ],
      pointsKm: [
        "អត្រាប្រចាំឆ្នាំបង្ហាញថ្លៃក្នុងរយៈពេលមួយឆ្នាំ។",
        "អត្រាថេរ និងអត្រាលើសមតុល្យថយចុះ មិនដូចគ្នាទេ។",
        "ថ្លៃសេវាអាចធ្វើឱ្យថ្លៃខ្ចីសរុបខ្ពស់ជាងអត្រាផ្សព្វផ្សាយ។",
      ],
      questionEn: "Is this rate flat or calculated on the declining balance?",
      questionKm: "តើអត្រានេះគណនាថេរ ឬលើសមតុល្យថយចុះ?",
    },
    principal: {
      exampleEn:
        "On a $2,000 loan, the $2,000 is the principal. Interest and processing fees are separate costs.",
      exampleKm:
        "ក្នុងឥណទាន ២,០០០ ដុល្លារ ចំនួន ២,០០០ ដុល្លារគឺជាប្រាក់ដើម។ ការប្រាក់ និងថ្លៃដំណើរការជាចំណាយផ្សេង។",
      pointsEn: [
        "Principal is the amount you receive or deposit.",
        "Loan payments may include both principal and interest.",
        "Reducing principal usually reduces future interest on a declining-balance loan.",
      ],
      pointsKm: [
        "ប្រាក់ដើមគឺចំនួនដែលអ្នកទទួល ឬដាក់សន្សំ។",
        "ការបង់ឥណទានអាចរួមមានប្រាក់ដើម និងការប្រាក់។",
        "ការកាត់បន្ថយប្រាក់ដើម ជាទូទៅកាត់បន្ថយការប្រាក់បន្ទាប់។",
      ],
      questionEn: "How much of each payment reduces my principal?",
      questionKm: "ការបង់ម្តងៗ កាត់បន្ថយប្រាក់ដើមប៉ុន្មាន?",
    },
    collateral: {
      exampleEn:
        "A lender may accept a land title or vehicle as security. If you cannot repay, that asset may be at risk.",
      exampleKm:
        "អ្នកផ្តល់កម្ចីអាចទទួលប្លង់ដី ឬយានយន្តជាទ្រព្យធានា។ បើអ្នកមិនអាចសង ទ្រព្យនោះអាចប្រឈមនឹងការបាត់បង់។",
      pointsEn: [
        "The agreement should identify the pledged asset clearly.",
        "Collateral does not remove your obligation to repay.",
        "Understand the lender’s process if you miss payments.",
      ],
      pointsKm: [
        "កិច្ចសន្យាគួរបញ្ជាក់ទ្រព្យធានាឱ្យច្បាស់។",
        "ទ្រព្យធានាមិនលុបកាតព្វកិច្ចសងប្រាក់ទេ។",
        "ត្រូវយល់ពីដំណើរការរបស់អ្នកផ្តល់កម្ចី បើអ្នកខកខានបង់។",
      ],
      questionEn:
        "Exactly which asset is pledged, and when could it be claimed?",
      questionKm: "តើទ្រព្យណាត្រូវបានដាក់ធានា ហើយពេលណាអាចត្រូវបានរឹបអូស?",
    },
    "late-fee": {
      exampleEn:
        "If a payment is due on the 5th and arrives on the 8th, the lender may add a late fee under your agreement.",
      exampleKm:
        "បើត្រូវបង់នៅថ្ងៃទី ៥ តែបានបង់នៅថ្ងៃទី ៨ អ្នកផ្តល់កម្ចីអាចគិតថ្លៃយឺតយ៉ាវតាមកិច្ចសន្យា។",
      pointsEn: [
        "The fee and due date should appear in your agreement.",
        "Some products may have a grace period.",
        "Repeated late payments can increase your total cost.",
      ],
      pointsKm: [
        "ថ្លៃ និងថ្ងៃកំណត់គួរមានក្នុងកិច្ចសន្យា។",
        "ផលិតផលខ្លះអាចមានរយៈពេលអនុគ្រោះ។",
        "ការបង់យឺតម្តងហើយម្តងទៀតអាចបង្កើនចំណាយសរុប។",
      ],
      questionEn: "What is the grace period and exact late-fee amount?",
      questionKm: "តើរយៈពេលអនុគ្រោះ និងថ្លៃយឺតយ៉ាវពិតប្រាកដប៉ុន្មាន?",
    },
  };
  const d = detail[term.slug] ?? {
    exampleEn: `In practice, ${term.en.toLowerCase()} can affect the amount you pay, receive, or need to protect. Check how it appears in the product documents before agreeing.`,
    exampleKm: `ក្នុងការអនុវត្ត ${term.km} អាចប៉ះពាល់ដល់ចំនួនដែលអ្នកបង់ ទទួល ឬត្រូវការពារ។ ពិនិត្យរបៀបដែលវាមានក្នុងឯកសារផលិតផល មុនពេលយល់ព្រម។`,
    pointsEn: [
      `Read the exact definition of ${term.en.toLowerCase()} in the provider's documents.`,
      "Compare the amount, timing, and conditions—not only the headline offer.",
      "Ask for a written explanation if anything is unclear.",
    ],
    pointsKm: [
      `អាននិយមន័យពិតប្រាកដនៃ ${term.km} ក្នុងឯកសាររបស់អ្នកផ្តល់សេវា។`,
      "ប្រៀបធៀបចំនួន ពេលវេលា និងលក្ខខណ្ឌ មិនមែនតែការផ្សព្វផ្សាយទេ។",
      "ស្នើសុំការពន្យល់ជាលាយលក្ខណ៍អក្សរ បើមានអ្វីមិនច្បាស់។",
    ],
    questionEn: `How does ${term.en.toLowerCase()} apply to this product, and where is it written?`,
    questionKm: `តើ ${term.km} អនុវត្តចំពោះផលិតផលនេះយ៉ាងដូចម្តេច ហើយសរសេរនៅកន្លែងណា?`,
  };
  const index = glossary.findIndex((x) => x.slug === term.slug);
  const next = glossary[index + 1];
  return (
    <div className="article-page">
      <div className="article-shell">
        <button className="article-back" onClick={() => s.go("/learn")}>
          <ArrowLeft />
          {s.locale === "km" ? "មេរៀនទាំងអស់" : "All lessons"}{" "}
        </button>{" "}
        <article>
          <header>
            <h1>{s.locale === "km" ? term.km : term.en} </h1>{" "}
            <p>{s.locale === "km" ? term.defKm : term.defEn} </p>
          </header>
          <section>
            <h2>{s.locale === "km" ? "អត្ថន័យសាមញ្ញ" : "What it means"} </h2>
            <p>{s.locale === "km" ? d.exampleKm : d.exampleEn} </p>{" "}
          </section>
          <section>
            <h2>{s.locale === "km" ? "ចំណុចសំខាន់ៗ" : "What to remember"} </h2>{" "}
            <ul>
              {(s.locale === "km" ? d.pointsKm : d.pointsEn).map((p) => (
                <li key={p}>
                  <Check />
                  {p}{" "}
                </li>
              ))}{" "}
            </ul>
          </section>
          <aside>
            <div>
              <b>
                {s.locale === "km"
                  ? "សួរមុនពេលអ្នកសម្រេចចិត្ត"
                  : "Ask before you decide"}{" "}
              </b>{" "}
              <p>{s.locale === "km" ? d.questionKm : d.questionEn} </p>
            </div>
          </aside>
          {next && (
            <footer>
              <button onClick={() => s.go("/learn/" + next.slug)}>
                <span>
                  {s.locale === "km" ? "មេរៀនបន្ទាប់" : "Next lesson"}{" "}
                  <b>{s.locale === "km" ? next.km : next.en} </b>
                </span>
                <ChevronRight />
              </button>
            </footer>
          )}{" "}
        </article>
      </div>
    </div>
  );
}

function Account(s: Shared) {
  const km = s.locale === "km";
  const [mode, setMode] = useState<"login" | "register">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [authError, setAuthError] = useState("");
  const { isAuthenticated, isLoading } = useConvexAuth();
  const account = useQuery(
    makeFunctionReference<
      "query",
      Record<string, never>,
      {
        name: string;
        email: string;
        isAnonymous?: boolean;
      } | null
    >("auth:getCurrentUser"),
    isAuthenticated ? {} : "skip",
  );
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const change = (key: keyof typeof form, value: string) => {
    setForm({ ...form, [key]: value });
    setErrors({ ...errors, [key]: "" });
    setSubmitted(false);
  };
  const switchMode = (next: "login" | "register") => {
    setMode(next);
    setErrors({});
    setSubmitted(false);
    setShowPassword(false);
  };
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (mode === "register" && !form.name.trim())
      next.name = km ? "សូមបញ្ចូលឈ្មោះរបស់អ្នក។" : "Please enter your name.";
    if (!/^\S+@\S+\.\S+$/.test(form.email))
      next.email = km
        ? "សូមបញ្ចូលអ៊ីមែលត្រឹមត្រូវ។"
        : "Enter a valid email address.";
    if (form.password.length < 8)
      next.password = km
        ? "លេខសម្ងាត់ត្រូវមានយ៉ាងតិច ៨ តួ។"
        : "Password must be at least 8 characters.";
    if (mode === "register" && form.confirm !== form.password)
      next.confirm = km ? "លេខសម្ងាត់មិនត្រូវគ្នា។" : "Passwords do not match.";
    setErrors(next);
    if (Object.keys(next).length) return;
    setBusy(true);
    setAuthError("");
    const result =
      mode === "login"
        ? await authClient.signIn.email({
            email: form.email,
            password: form.password,
          })
        : await authClient.signUp.email({
            name: form.name.trim(),
            email: form.email,
            password: form.password,
          });
    setBusy(false);
    if (result.error) {
      setAuthError(
        result.error.message ||
          (km ? "មិនអាចចូលគណនីបានទេ។" : "Unable to authenticate."),
      );
      return;
    }
    setSubmitted(true);
  };
  const guest = async () => {
    setBusy(true);
    setAuthError("");
    const result = await authClient.signIn.anonymous();
    setBusy(false);
    if (result.error)
      setAuthError(
        result.error.message ||
          (km ? "មិនអាចបន្តជាភ្ញៀវបានទេ។" : "Unable to continue as guest."),
      );
  };
  const logout = async () => {
    await authClient.signOut();
    setForm({ name: "", email: "", password: "", confirm: "" });
    setSubmitted(false);
  };
  if (isLoading || (isAuthenticated && account === undefined))
    return (
      <div className="account-page">
        <div className="auth-loading">{km ? "កំពុងផ្ទុក…" : "Loading…"} </div>
      </div>
    );
  if (account)
    return (
      <div className="account-page">
        <section className="account-card account-welcome">
          <header className="account-welcome-head">
            <div className="account-identity">
              <span className="account-avatar">{account.name.slice(0, 1).toUpperCase()}</span>
              <div>
                <span className="account-status">{account.isAnonymous ? (km ? "ភ្ញៀវ" : "Guest") : (km ? "គណនី" : "Account")}</span>
                <h1>{account.isAnonymous ? (km ? "គណនីភ្ញៀវ" : "Guest account") : account.name}</h1>
                <p>{account.isAnonymous ? (km ? "រក្សាទុកសម្រាប់ពេលដែលអ្នកកំពុងប្រើកម្មវិធីនេះ" : "Your personal space on FinCheck") : account.email}</p>
              </div>
            </div>
            <button className="account-signout" onClick={logout} aria-label={km ? "ចាកចេញពីគណនី" : "Sign out"}><LogOut /></button>
          </header>
          <div className="account-section-title"><span>{km ? "សកម្មភាពរបស់អ្នក" : "Your activity"}</span></div>
          <div className="account-benefits">
            <button onClick={() => s.go("/institutions")}>
              <Heart />
              <span>
                <b>{km ? "ជម្រើសដែលបានរក្សាទុក" : "Saved choices"} </b>
                <small>
                  {km
                    ? "រក្សាទុកគ្រឹះស្ថានដែលអ្នកចាប់អារម្មណ៍"
                    : "Keep institutions you care about"}{" "}
                </small>
              </span>
              <ChevronRight />
            </button>
            <button onClick={() => s.go("/institutions")}>
              <BarChart3 />
              <span>
                <b>{km ? "ការវាយតម្លៃរបស់ Finឆែក" : "FinCheck assessments"} </b>
                <small>
                  {km
                    ? "មើលរង្វាស់ដែលយើងគណនាពីប្រភពផ្លូវការ"
                    : "View metrics we calculate from official sources"}{" "}
                </small>
              </span>
              <ChevronRight />
            </button>
          </div>
          <div className="account-section-title"><span>{km ? "មធ្យោបាយងាយស្រួលប្រើ" : "Accessibility"}</span></div>
          <section className="accessibility-settings" aria-labelledby="accessibility-title">
            <div className="accessibility-intro"><Accessibility/><div><b id="accessibility-title">{km ? "កែសម្រួលការបង្ហាញ" : "Adjust your display"}</b><small>{km ? "រក្សាទុកដោយស្វ័យប្រវត្តិសម្រាប់អ្នក។" : "Saved automatically for you."}</small></div></div>
            <fieldset><legend><Type/>{km ? "ទំហំអក្សរ" : "Text size"}</legend><div className="segmented-control">{(["default","large","largest"] as const).map((size,index)=><button type="button" key={size} className={s.accessibility.fontSize===size?"active":""} aria-pressed={s.accessibility.fontSize===size} onClick={()=>s.setAccessibility(value=>({...value,fontSize:size}))}>{km?["ធម្មតា","ធំ","ធំបំផុត"][index]:["Default","Large","Largest"][index]}</button>)}</div></fieldset>
            <label className="accessibility-toggle"><Contrast/><span><b>{km ? "កម្រិតពណ៌ខ្ពស់" : "High contrast"}</b><small>{km ? "ធ្វើឱ្យអក្សរ និងបន្ទាត់កាន់តែច្បាស់" : "Strengthen text and interface boundaries"}</small></span><input type="checkbox" checked={s.accessibility.highContrast} onChange={event=>s.setAccessibility(value=>({...value,highContrast:event.target.checked}))}/></label>
            <label className="accessibility-toggle"><Accessibility/><span><b>{km ? "កាត់បន្ថយចលនា" : "Reduce motion"}</b><small>{km ? "បិទចលនាដែលមិនចាំបាច់" : "Limit non-essential animation"}</small></span><input type="checkbox" checked={s.accessibility.reduceMotion} onChange={event=>s.setAccessibility(value=>({...value,reduceMotion:event.target.checked}))}/></label>
          </section>
        </section>
      </div>
    );
  return (
    <div className="account-page">
      <div className="auth-layout">
        <section className="auth-card">
          <div className="auth-tabs" role="tablist">
            <button
              role="tab"
              aria-selected={mode === "login"}
              className={mode === "login" ? "active" : ""}
              onClick={() => switchMode("login")}
            >
              {km ? "ចូលគណនី" : "Sign in"}{" "}
            </button>
            <button
              role="tab"
              aria-selected={mode === "register"}
              className={mode === "register" ? "active" : ""}
              onClick={() => switchMode("register")}
            >
              {km ? "បង្កើតគណនី" : "Create account"}{" "}
            </button>{" "}
          </div>
          <div className="auth-heading">
            <span>{mode === "login" ? <UserRound /> : <UserRoundPlus />} </span>
            <h2>
              {mode === "login"
                ? km
                  ? "សូមស្វាគមន៍មកវិញ"
                  : "Welcome back"
                : km
                  ? "ចាប់ផ្ដើមជាមួយ Finឆែក"
                  : "Get started with FinCheck"}{" "}
            </h2>{" "}
            <p>
              {mode === "login"
                ? km
                  ? "ចូលគណនីដើម្បីបន្តទៅជម្រើសរបស់អ្នក។"
                  : "Sign in to continue to your saved choices."
                : km
                  ? "បង្កើតគណនីឥតគិតថ្លៃក្នុងរយៈពេលតិចជាងមួយនាទី។"
                  : "Create your free account in less than a minute."}{" "}
            </p>{" "}
          </div>
          <form className="auth-form" onSubmit={submit} noValidate>
            {mode === "register" && (
              <label>
                <span>{km ? "ឈ្មោះពេញ" : "Full name"} </span>
                <div className={errors.name ? "field invalid" : "field"}>
                  <UserRound />
                  <input
                    autoComplete="name"
                    value={form.name}
                    onChange={(e) => change("name", e.target.value)}
                    placeholder={km ? "ឈ្មោះរបស់អ្នក" : "Your name"}
                    aria-invalid={!!errors.name}
                  />
                </div>
                {errors.name && <small>{errors.name} </small>}{" "}
              </label>
            )}{" "}
            <label>
              {" "}
              <span>{km ? "អាសយដ្ឋានអ៊ីមែល" : "Email address"} </span>
              <div className={errors.email ? "field invalid" : "field"}>
                <Mail />
                <input
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={(e) => change("email", e.target.value)}
                  placeholder="name@example.com"
                  aria-invalid={!!errors.email}
                />
              </div>
              {errors.email && <small>{errors.email} </small>}{" "}
            </label>
            <label>
              <span>{km ? "លេខសម្ងាត់" : "Password"} </span>
              <div className={errors.password ? "field invalid" : "field"}>
                <LockKeyhole />
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete={
                    mode === "login" ? "current-password" : "new-password"
                  }
                  value={form.password}
                  onChange={(e) => change("password", e.target.value)}
                  placeholder={km ? "យ៉ាងតិច ៨ តួ" : "At least 8 characters"}
                  aria-invalid={!!errors.password}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={
                    showPassword
                      ? km
                        ? "លាក់លេខសម្ងាត់"
                        : "Hide password"
                      : km
                        ? "បង្ហាញលេខសម្ងាត់"
                        : "Show password"
                  }
                >
                  {showPassword ? <EyeOff /> : <Eye />}{" "}
                </button>
              </div>
              {errors.password && <small>{errors.password} </small>}{" "}
            </label>
            {mode === "register" && (
              <label>
                <span>{km ? "បញ្ជាក់លេខសម្ងាត់" : "Confirm password"} </span>
                <div className={errors.confirm ? "field invalid" : "field"}>
                  <LockKeyhole />
                  <input
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={form.confirm}
                    onChange={(e) => change("confirm", e.target.value)}
                    placeholder={
                      km ? "បញ្ចូលលេខសម្ងាត់ម្ដងទៀត" : "Enter password again"
                    }
                    aria-invalid={!!errors.confirm}
                  />
                </div>
                {errors.confirm && <small>{errors.confirm} </small>}{" "}
              </label>
            )}{" "}
            {mode === "login" && (
              <div className="auth-options">
                <label>
                  <input type="checkbox" />
                  {km ? "ចងចាំខ្ញុំ" : "Remember me"}{" "}
                </label>{" "}
                <button type="button">
                  {km ? "ភ្លេចលេខសម្ងាត់?" : "Forgot password?"}{" "}
                </button>{" "}
              </div>
            )}{" "}
            <button className="auth-submit" type="submit" disabled={busy}>
              {busy ? (km ? "កំពុងដំណើរការ…" : "Please wait…") : mode === "login"
                ? km
                  ? "ចូលគណនី"
                  : "Sign in"
                : km
                  ? "បង្កើតគណនី"
                  : "Create account"}
              {!busy && <ChevronRight />}
            </button>
            {authError && <p className="auth-error">{authError}</p>}
            {submitted && (
              <p className="auth-success">
                <Check />
                {km ? "បានបញ្ចប់ដោយជោគជ័យ។" : "Success."}{" "}
              </p>
            )}{" "}
          </form>
          <div className="auth-divider"><span>{km ? "ឬ" : "or"}</span></div>
          <button className="guest-submit" type="button" onClick={guest} disabled={busy}>
            <UserRound />{km ? "បន្តជាភ្ញៀវ" : "Continue as guest"}
          </button>
          <p className="auth-note">
            {km
              ? "ដោយបន្ត អ្នកយល់ព្រមតាមលក្ខខណ្ឌប្រើប្រាស់ និងគោលការណ៍ឯកជនភាពរបស់យើង។"
              : "By continuing, you agree to our Terms of Use and Privacy Policy."}{" "}
          </p>{" "}
        </section>
      </div>
    </div>
  );
}

function CompareTray({
  ids,
  setCompare,
  go,
  locale,
  t,
}: {
  ids: string[];
  setCompare: (x: string[]) => void;
  go: (p: string) => void;
  locale: Locale;
  t: typeof copy.km;
}) {
  const { institutions } = useData();
  return (
    <aside className="compare-tray" aria-label={t.compare}>
      <div className="tray-summary">
        <span className="tray-symbol">
          <GitCompareArrows />
        </span>
        <span>
          <b>{t.compare}</b>
          <small>
            {ids.length}/3 {locale === "km" ? "បានជ្រើសរើស" : "selected"}
          </small>
        </span>
      </div>
      <div className="tray-items">
        {ids.map((id) => {
          const i = institutions.find((x) => x.id === id)!;
          return (
            <div className="tray-institution" key={id}>
              <span
                className="tray-logo"
                style={{ background: i.logo ? "#fff" : i.color }}
              >
                {i.logo ? <img src={i.logo} alt="" /> : i.short}
              </span>
              <span className="tray-name">
                <b>{locale === "km" ? i.nameKm : i.nameEn}</b>
                <small>{locale === "km" ? i.typeKm : i.typeEn}</small>
              </span>
              <button
                type="button"
                onClick={() => setCompare(ids.filter((x) => x !== id))}
                aria-label={`${locale === "km" ? "ដកចេញ" : "Remove"} ${i.nameEn}`}
              >
                <X />
              </button>
            </div>
          );
        })}
      </div>
      <button
        className="primary tray-action"
        onClick={() => go("/compare")}
        disabled={ids.length < 2}
      >
        <span>{locale === "km" ? "ប្រៀបធៀប" : "Compare"}</span>
        <ChevronRight />
      </button>
    </aside>
  );
}

function MobileNav({
  path,
  t,
  go,
}: {
  path: string;
  t: typeof copy.km;
  go: (p: string) => void;
}) {
  const items: [[any, string, string], ...Array<[any, string, string]>] = [
    [HomeIcon, t.home, "/"],
    [Search, t.explore, "/institutions"],
    [Calculator, t.loan, "/loan"],
    [Bot, t.consult, "/consult"],
    [BookOpen, t.learn, "/learn"],
    [UserRound, t.profile, "/profile"],
  ];
  return (
    <nav className="mobile-nav">
      {items.map(([Icon, label, p]) => (
        <button
          key={p}
          className={path === p ? "active" : ""}
          onClick={() => go(p)}
        >
          <Icon />
          <span>{label} </span>
        </button>
      ))}{" "}
    </nav>
  );
}

const convexUrl = import.meta.env.VITE_CONVEX_URL;
if (!convexUrl)
  throw new Error(
    "VITE_CONVEX_URL is required. Run `bunx convex dev` to configure this project.",
  );
const convex = new ConvexReactClient(convexUrl);
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ConvexBetterAuthProvider client={convex} authClient={authClient}>
      <App />
    </ConvexBetterAuthProvider>
  </React.StrictMode>,
);
