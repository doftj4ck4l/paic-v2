/**
 * Seeded demonstration data for the design-validation build.
 * Clearly fictional. Replaced by real queries in later phases.
 */

export type SubjectId =
  | "math"
  | "science"
  | "language"
  | "english"
  | "history"
  | "geography";

export type TintColor = "teal" | "amber" | "orange" | "blue" | "white" | "cream";

export type DemoSubject = {
  id: SubjectId;
  name: string;
  icon: "calculator" | "flask" | "book" | "chat" | "crown" | "globe";
  asset: string;
  color: TintColor;
  blurb: string;
  workbookCount: number;
};

export const SUBJECTS: DemoSubject[] = [
  {
    id: "math",
    name: "Matematik",
    icon: "calculator",
    asset: "/assets/thiings/subject-math.png",
    color: "amber",
    blurb: "Nombor, pecahan dan ruang",
    workbookCount: 3,
  },
  {
    id: "science",
    name: "Sains",
    icon: "flask",
    asset: "/assets/thiings/subject-science.png",
    color: "teal",
    blurb: "Alam semula jadi dan ujian",
    workbookCount: 5,
  },
  {
    id: "language",
    name: "Bahasa Melayu",
    icon: "book",
    asset: "/assets/thiings/subject-language.png",
    color: "orange",
    blurb: "Membaca, menulis dan bercerita",
    workbookCount: 4,
  },
  {
    id: "english",
    name: "English",
    icon: "chat",
    asset: "/assets/thiings/subject-english.png",
    color: "blue",
    blurb: "Reading, writing and speaking",
    workbookCount: 2,
  },
  {
    id: "history",
    name: "Sejarah",
    icon: "crown",
    asset: "/assets/thiings/subject-history.png",
    color: "white",
    blurb: "Kisah dahulu dan sekarang",
    workbookCount: 2,
  },
  {
    id: "geography",
    name: "Geografi",
    icon: "globe",
    asset: "/assets/thiings/subject-geography.png",
    color: "cream",
    blurb: "Peta, cuaca dan tempat",
    workbookCount: 1,
  },
];

export function subjectById(id: SubjectId): DemoSubject {
  return SUBJECTS.find((s) => s.id === id) ?? SUBJECTS[0];
}

export type DemoWorkbook = {
  id: string;
  title: string;
  subjectId: SubjectId;
  topic: string;
  progress: number;
  teacherName: string;
};

export const WORKBOOKS: DemoWorkbook[] = [
  {
    id: "kitaran-air",
    title: "Kitaran Air",
    subjectId: "science",
    topic: "Proses sejatan, pemeluwapan dan kerpasan",
    progress: 64,
    teacherName: "Cikgu Farah",
  },
  {
    id: "pecahan-tahun4",
    title: "Pecahan yang Menyeronokkan",
    subjectId: "math",
    topic: "Pecahan setara dan perbandingan",
    progress: 32,
    teacherName: "Cikgu Rosli",
  },
  {
    id: "cerita-raya",
    title: "Cerita Rakyat Nusantara",
    subjectId: "language",
    topic: "Struktur cerita dan watak",
    progress: 78,
    teacherName: "Cikgu Aminah",
  },
];

export type DemoQuiz = {
  id: string;
  title: string;
  subtitle: string;
  subjectId: SubjectId;
  object: string;
  points: number;
  comments: number;
  href: string;
};

export const HOME_QUIZZES: DemoQuiz[] = [
  {
    id: "hq1",
    title: "Kuiz Kitaran Air",
    subtitle: "Uji pemahaman Sains anda!",
    subjectId: "science",
    object: "/assets/thiings/subject-science.png",
    points: 40,
    comments: 12,
    href: "/pending/quiz-kitaran-air",
  },
  {
    id: "hq2",
    title: "Kuiz Pecahan Setara",
    subtitle: "Latih kemahiran Matematik anda!",
    subjectId: "math",
    object: "/assets/thiings/subject-math.png",
    points: 35,
    comments: 8,
    href: "/pending/quiz-pecahan",
  },
  {
    id: "hq3",
    title: "Kuiz Cerita Rakyat",
    subtitle: "Perbaiki Bahasa Melayu anda!",
    subjectId: "language",
    object: "/assets/thiings/subject-language.png",
    points: 30,
    comments: 5,
    href: "/pending/quiz-cerita",
  },
];

export type DemoAchievement = {
  id: string;
  label: string;
  detail: string;
  earned: boolean;
  color: TintColor;
  icon: "star" | "medal" | "trophy" | "target" | "crown";
};

export const ACHIEVEMENTS: DemoAchievement[] = [
  {
    id: "a1",
    label: "Bintang Sains",
    detail: "Siapkan 3 buku kerja Sains",
    earned: true,
    color: "amber",
    icon: "star",
  },
  {
    id: "a2",
    label: "Juara Pecahan",
    detail: "Skor penuh kuiz pecahan",
    earned: true,
    color: "orange",
    icon: "medal",
  },
  {
    id: "a3",
    label: "Pembaca Hebat",
    detail: "Baca 10 cerita",
    earned: true,
    color: "teal",
    icon: "trophy",
  },
  {
    id: "a4",
    label: "Penjelajah Peta",
    detail: "Selesaikan bab Geografi",
    earned: false,
    color: "blue",
    icon: "target",
  },
  {
    id: "a5",
    label: "Detektif Sejarah",
    detail: "Selesaikan 5 garis masa",
    earned: false,
    color: "white",
    icon: "crown",
  },
];

export type DemoAnnouncement = {
  id: string;
  title: string;
  body: string;
  source: string;
  time: string;
};

export const ANNOUNCEMENTS: DemoAnnouncement[] = [
  {
    id: "n1",
    title: "Pertandingan Bercerita",
    body: "Sertai pertandingan bercerita peringkat sekolah pada Jumaat ini di dewan.",
    source: "SK Taman Bunga Raya",
    time: "2 jam lalu",
  },
  {
    id: "n2",
    title: "Kuiz Sains Mingguan",
    body: "Cikgu Farah membuka kuiz Kitaran Air sehingga hari Khamis.",
    source: "4 Bestari",
    time: "Semalam",
  },
];

export type DemoAssignment = {
  id: string;
  title: string;
  subjectId: SubjectId;
  dueLabel: string;
  status: "not-started" | "in-progress" | "submitted" | "graded";
  tone: "today" | "soon" | "done";
  score?: string;
};

export const ASSIGNMENTS: DemoAssignment[] = [
  {
    id: "tugasan-1",
    title: "Laporan Kitaran Air",
    subjectId: "science",
    dueLabel: "Hari ini, 5:00 petang",
    status: "in-progress",
    tone: "today",
  },
  {
    id: "tugasan-2",
    title: "Latihan Pecahan Setara",
    subjectId: "math",
    dueLabel: "Esok",
    status: "not-started",
    tone: "soon",
  },
  {
    id: "tugasan-3",
    title: "Karangan: Keluarga Saya",
    subjectId: "language",
    dueLabel: "Diserahkan 2 hari lalu",
    status: "graded",
    tone: "done",
    score: "18/20",
  },
];
