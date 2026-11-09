import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  BookOpenCheck,
  ChevronRight,
  Flame,
  GraduationCap,
  ListChecks,
  Presentation,
  ShieldCheck,
  Sparkles,
  Wand2,
} from "lucide-react";
import { getCurrentUser } from "@/lib/auth-session";
import styles from "./landing.module.css";

export const metadata: Metadata = {
  title: "Pixelspace AI Classroom — Ruang pembelajaran AI untuk murid Malaysia",
  description:
    "Tukar nota dan buku teks kepada buku kerja pintar — nota, kuiz, kad imbas dan slaid dijana AI. Direka untuk sekolah rendah dan menengah Malaysia.",
};

const FEATURES = [
  {
    icon: Sparkles,
    title: "Buku kerja pintar",
    text: "Muat naik sumber, tanya AI dan dapatkan jawapan bersitasi daripada bahan anda sendiri.",
  },
  {
    icon: Wand2,
    title: "Studio AI",
    text: "Jana nota, kuiz, kad imbas, peta minda dan panduan ulang kaji dalam beberapa saat.",
  },
  {
    icon: Presentation,
    title: "Slaid dengan ilustrasi",
    text: "Dek slaid kelas yang kemas dan tersusun, lengkap dengan ilustrasi dijana AI.",
  },
  {
    icon: Flame,
    title: "Rentetan & kemajuan",
    text: "Bina tabiat belajar harian dan pantau penguasaan setiap subjek dengan jelas.",
  },
  {
    icon: ShieldCheck,
    title: "Selamat untuk sekolah",
    text: "Akaun disahkan sekolah, nama paparan selamat dan guru sentiasa mengawal.",
  },
];

const STEPS = [
  {
    icon: BookOpenCheck,
    title: "Cipta buku kerja",
    text: "Pilih sumber pembelajaran — nota, PDF atau pautan — dan susun mengikut subjek.",
  },
  {
    icon: Wand2,
    title: "Jana dengan AI",
    text: "Satu ketikan untuk nota, kuiz, kad imbas dan slaid — semuanya berdasarkan sumber anda.",
  },
  {
    icon: ListChecks,
    title: "Ulang kaji & kongsi",
    text: "Belajar dengan kuiz interaktif, kumpul rentetan dan kongsi bahan dengan rakan.",
  },
];

const FAQ = [
  {
    q: "Adakah Pixelspace percuma untuk pelajar?",
    a: "Ya — pelajar di sekolah yang menyertai program perintis boleh menggunakan Pixelspace secara percuma. Daftar dengan emel anda dan pilih sekolah daripada senarai.",
  },
  {
    q: "Bagaimana data murid dilindungi?",
    a: "Akaun murid disahkan melalui sekolah. Bahan yang diterbitkan ke Jelajah hanya memaparkan nama paparan dan kelas — sumber peribadi, sembang AI dan nota tidak pernah dikongsi tanpa kebenaran.",
  },
  {
    q: "Sekolah saya tiada dalam senarai. Boleh sertai?",
    a: "Boleh. Semasa mendaftar, taip nama sekolah anda dan pilih \u201cMinta tambah sekolah\u201d — pasukan kami akan menghubungi pihak sekolah anda.",
  },
  {
    q: "Adakah AI boleh membuat kesilapan?",
    a: "Boleh — itu sebabnya setiap jawapan AI di Pixelspace disertakan rujukan sumber. Murid dan guru boleh menyemak setiap fakta dengan pantas.",
  },
];

export default async function LandingPage() {
  const user = await getCurrentUser();
  if (user) {
    redirect("/home");
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link href="/" className={styles.brand} aria-label="Pixelspace AI Classroom">
            <span className={styles.brandMark} aria-hidden="true"><ChevronRight /><ChevronRight /></span>
            <span>Pixelspace<small>AI Classroom</small></span>
          </Link>
          <nav className={styles.nav} aria-label="Navigasi laman">
            <a href="#ciri" className={styles.navLink}>Ciri-ciri</a>
            <a href="#cara" className={styles.navLink}>Cara ia berfungsi</a>
            <a href="#sekolah" className={styles.navLink}>Untuk sekolah</a>
            <a href="#soalan" className={styles.navLink}>Soalan lazim</a>
          </nav>
          <div className={styles.headerCtas}>
            <Link href="/login" className={styles.ghostButton}>Log masuk</Link>
            <Link href="/register" className={styles.primaryButton}>Daftar</Link>
          </div>
        </div>
      </header>

      <main id="main">
        {/* ---------------- Hero ---------------- */}
        <section className={styles.hero} aria-labelledby="landing-title">
          <div className={styles.heroCopy}>
            <span className={styles.eyebrow}>
              <Sparkles size={14} aria-hidden="true" /> RUANG PEMBELAJARAN AI · MALAYSIA
            </span>
            <h1 id="landing-title">
              Belajar lebih pintar,
              <br />
              <span className={styles.highlight}>bersama AI.</span>
            </h1>
            <p className={styles.heroSub}>
              Tukar nota dan buku teks kepada buku kerja pintar — nota, kuiz, kad imbas dan slaid
              dijana AI, lengkap dengan rujukan sumber. Direka untuk sekolah rendah dan menengah
              Malaysia.
            </p>
            <div className={styles.heroCtas}>
              <Link href="/register" className={styles.primaryCta}>
                Daftar percuma <ArrowRight size={18} aria-hidden="true" />
              </Link>
              <Link href="/login" className={styles.ghostCta}>
                Saya sudah ada akaun
              </Link>
            </div>
            <ul className={styles.trustRow}>
              <li><GraduationCap size={14} aria-hidden="true" /> Rendah &amp; Menengah</li>
              <li><ShieldCheck size={14} aria-hidden="true" /> Diselia sekolah</li>
              <li><Sparkles size={14} aria-hidden="true" /> Bahasa Melayu</li>
            </ul>
          </div>

          <div className={styles.heroArt} aria-hidden="true">
            <span className={styles.artBlob} />
            <Image
              src="/assets/login/ai-backpack.png"
              alt=""
              width={1280}
              height={1280}
              loading="eager"
              className={styles.mascot}
              sizes="(max-width: 900px) 280px, 520px"
            />
            <span className={`${styles.floatCard} ${styles.floatStreak}`}>
              <Flame size={18} />
              <span><strong>3 hari</strong><small>rentetan belajar</small></span>
            </span>
            <span className={`${styles.floatCard} ${styles.floatQuiz}`}>
              <ListChecks size={18} />
              <span><strong>Kuiz Kitaran Air</strong><small>6/8 betul · bersitasi</small></span>
            </span>
            <span className={`${styles.floatCard} ${styles.floatDeck}`}>
              <Presentation size={18} />
              <span><strong>Slaid dijana</strong><small>10 slaid · 6 ilustrasi</small></span>
            </span>
            <Image src="/assets/thiings/ai-sparkle.png" alt="" width={56} height={56} className={styles.sparkle} />
            <Image src="/assets/thiings/books.png" alt="" width={84} height={84} className={styles.books} />
          </div>
        </section>

        {/* ---------------- Preview ---------------- */}
        <section className={styles.preview} aria-label="Pratonton aplikasi">
          <div className={styles.browserFrame}>
            <span className={styles.browserBar} aria-hidden="true"><i /><i /><i /></span>
            <Image
              src="/assets/landing/slides-preview.png"
              alt="Dek slaid AI dengan ilustrasi kitaran air di dalam Pixelspace AI Classroom"
              width={1440}
              height={1000}
              className={styles.previewImg}
              sizes="(max-width: 1000px) 100vw, 1100px"
            />
          </div>
          <span className={styles.previewCaption}>
            <Wand2 size={15} aria-hidden="true" /> Dek slaid dijana AI — struktur teks kemas dengan ilustrasi flat.
          </span>
          <div className={styles.previewCard}>
            <Image src="/assets/landing/workbooks-preview.png" alt="Pustaka buku kerja pelajar" width={1440} height={900} className={styles.previewImg} sizes="(max-width: 1000px) 100vw, 1100px" />
          </div>
        </section>

        {/* ---------------- Features ---------------- */}
        <section className={styles.section} id="ciri" aria-labelledby="features-title">
          <div className={styles.sectionHead}>
            <span className={styles.kicker}>CIRI-CIRI</span>
            <h2 id="features-title">Semua yang murid perlukan dalam satu ruang.</h2>
            <p>Daripada memahami bab baharu hingga ulang kaji sebelum ujian — Pixelspace membantu setiap langkah.</p>
          </div>
          <div className={styles.featureGrid}>
            {FEATURES.map((feature) => (
              <article key={feature.title} className={styles.featureCard}>
                <span className={styles.featureIcon}><feature.icon size={22} aria-hidden="true" /></span>
                <h3>{feature.title}</h3>
                <p>{feature.text}</p>
              </article>
            ))}
          </div>
        </section>

        {/* ---------------- How it works ---------------- */}
        <section className={styles.section} id="cara" aria-labelledby="steps-title">
          <div className={styles.sectionHead}>
            <span className={styles.kicker}>CARA IA BERFUNGSI</span>
            <h2 id="steps-title">Tiga langkah mudah.</h2>
            <p>Tiada pemasangan, tiada kekeliruan — buka pelayar dan mula belajar.</p>
          </div>
          <div className={styles.stepGrid}>
            {STEPS.map((step, index) => (
              <article key={step.title} className={styles.stepCard}>
                <span className={styles.stepNum} aria-hidden="true">{index + 1}</span>
                <span className={styles.stepIcon}><step.icon size={20} aria-hidden="true" /></span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </article>
            ))}
          </div>
        </section>

        {/* ---------------- For schools ---------------- */}
        <section className={styles.schoolsBand} id="sekolah" aria-labelledby="schools-title">
          <div className={styles.schoolsCopy}>
            <span className={styles.kickerLight}>UNTUK SEKOLAH &amp; GURU</span>
            <h2 id="schools-title">Bawa Pixelspace ke sekolah anda.</h2>
            <p>
              Urus kelas, kongsi bahan pembelajaran dan pantau kemajuan murid — dengan kawalan
              penuh, laporan jelas dan sokongan program perintis bersama pasukan kami.
            </p>
            <ul className={styles.schoolsList}>
              <li>Kelas dan keahlian murid yang teratur</li>
              <li>Kongsi buku kerja kepada kelas dengan sekali klik</li>
              <li>Pantau kemajuan dan penguasaan subjek</li>
            </ul>
            <Link href="/register" className={styles.schoolsCta}>
              Daftar sekolah anda <ArrowRight size={17} aria-hidden="true" />
            </Link>
          </div>
          <div className={styles.schoolsArt} aria-hidden="true">
            <Image src="/assets/thiings/graduation.png" alt="" width={210} height={210} />
            <Image src="/assets/thiings/books.png" alt="" width={96} height={96} className={styles.schoolsBooks} />
          </div>
        </section>

        {/* ---------------- FAQ ---------------- */}
        <section className={styles.section} id="soalan" aria-labelledby="faq-title">
          <div className={styles.sectionHead}>
            <span className={styles.kicker}>SOALAN LAZIM</span>
            <h2 id="faq-title">Ada soalan? Kami jawab.</h2>
          </div>
          <div className={styles.faqList}>
            {FAQ.map((item) => (
              <details key={item.q} className={styles.faqItem}>
                <summary>{item.q}</summary>
                <p>{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* ---------------- Final CTA ---------------- */}
        <section className={styles.finalCta} aria-labelledby="cta-title">
          <div className={styles.finalInner}>
            <h2 id="cta-title">Sedia untuk memulakan perjalanan pembelajaran?</h2>
            <p>Daftar dalam masa dua minit — terus mula belajar dengan buku kerja pertama anda.</p>
            <div className={styles.finalActions}>
              <Link href="/register" className={styles.primaryCta}>
                Daftar sekarang <ArrowRight size={18} aria-hidden="true" />
              </Link>
              <Link href="/login" className={styles.finalGhost}>
                Log masuk
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerBrand}>
            <span className={styles.brandMark} aria-hidden="true"><ChevronRight /><ChevronRight /></span>
            <span>
              <strong>Pixelspace AI Classroom</strong>
              <small>Ruang pembelajaran AI untuk murid Malaysia.</small>
            </span>
          </div>
          <nav className={styles.footerLinks} aria-label="Pautan footer">
            <Link href="/login">Log masuk</Link>
            <Link href="/register">Daftar</Link>
            <Link href="/help">Bantuan</Link>
          </nav>
        </div>
        <p className={styles.footerMeta}>
          © 2026 Pixelspace · 3D icons by <a href="https://www.thiings.co/things" target="_blank" rel="noreferrer">Thiings</a>
        </p>
      </footer>
    </div>
  );
}
