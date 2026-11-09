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
  yearLabel: string;
  updatedDaysAgo: number;
};

export const WORKBOOKS: DemoWorkbook[] = [
  {
    id: "kitaran-air",
    title: "Kitaran Air",
    subjectId: "science",
    topic: "Proses sejatan, pemeluwapan dan kerpasan",
    progress: 64,
    teacherName: "Cikgu Farah",
    yearLabel: "Tahun 4",
    updatedDaysAgo: 0,
  },
  {
    id: "pecahan-tahun4",
    title: "Pecahan yang Menyeronokkan",
    subjectId: "math",
    topic: "Pecahan setara dan perbandingan",
    progress: 32,
    teacherName: "Cikgu Rosli",
    yearLabel: "Tahun 4",
    updatedDaysAgo: 2,
  },
  {
    id: "cerita-raya",
    title: "Cerita Rakyat Nusantara",
    subjectId: "language",
    topic: "Struktur cerita dan watak",
    progress: 78,
    teacherName: "Cikgu Aminah",
    yearLabel: "Tahun 4",
    updatedDaysAgo: 5,
  },
  {
    id: "sistem-suria",
    title: "Sistem Suria",
    subjectId: "science",
    topic: "Planet, orbit dan gerhana",
    progress: 12,
    teacherName: "Cikgu Farah",
    yearLabel: "Tahun 5",
    updatedDaysAgo: 1,
  },
  {
    id: "fungsi-kuadratik",
    title: "Fungsi Kuadratik",
    subjectId: "math",
    topic: "Graf, punca dan bentuk parabola",
    progress: 45,
    teacherName: "Cikgu Rosli",
    yearLabel: "Tingkatan 4",
    updatedDaysAgo: 7,
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


/* ================= Quizzes (teacher-created with AI from workbook sources) ================= */

export type DemoQuizStatus = "new" | "in-progress" | "done";

export type DemoQuizItem = {
  id: string;
  title: string;
  subjectId: SubjectId;
  teacherName: string;
  sourceWorkbookId: string;
  sourceWorkbookTitle: string;
  questionCount: number;
  due: string;
  status: DemoQuizStatus;
  score?: string;
};

export const QUIZZES: DemoQuizItem[] = [
  {
    id: "kuiz-kitaran-air",
    title: "Kuiz Kitaran Air",
    subjectId: "science",
    teacherName: "Cikgu Farah",
    sourceWorkbookId: "kitaran-air",
    sourceWorkbookTitle: "Kitaran Air",
    questionCount: 8,
    due: "Hari ini · 5:00 petang",
    status: "new",
  },
  {
    id: "kuiz-pecahan",
    title: "Kuiz Pecahan Setara",
    subjectId: "math",
    teacherName: "Cikgu Rosli",
    sourceWorkbookId: "pecahan-tahun4",
    sourceWorkbookTitle: "Pecahan yang Menyeronokkan",
    questionCount: 8,
    due: "Esok · 11:59 malam",
    status: "in-progress",
  },
  {
    id: "kuiz-cerita",
    title: "Kuiz Cerita Rakyat",
    subjectId: "language",
    teacherName: "Cikgu Aminah",
    sourceWorkbookId: "cerita-raya",
    sourceWorkbookTitle: "Cerita Rakyat Nusantara",
    questionCount: 8,
    due: "Selesai semalam",
    status: "done",
    score: "6/8",
  },
];

export function quizById(id: string): DemoQuizItem {
  return QUIZZES.find((q) => q.id === id) ?? QUIZZES[0];
}

/* ================= Explore ================= */

export type DemoTopic = {
  id: string;
  subjectId: SubjectId;
  name: string;
  blurb: string;
  workbookCount: number;
  quizCount: number;
  yearLabel: string;
};

export const TOPICS: DemoTopic[] = [
  { id: "kitaran-air", subjectId: "science", name: "Kitaran Air", blurb: "Sejatan, pemeluwapan dan kerpasan", workbookCount: 3, quizCount: 2, yearLabel: "Tahun 4" },
  { id: "rantai-makanan", subjectId: "science", name: "Rantai Makanan", blurb: "Pengeluar, pengguna dan pengurai", workbookCount: 2, quizCount: 1, yearLabel: "Tahun 4" },
  { id: "pecahan", subjectId: "math", name: "Pecahan", blurb: "Pecahan setara, tambah dan tolak", workbookCount: 4, quizCount: 3, yearLabel: "Tahun 4" },
  { id: "ruang", subjectId: "math", name: "Ruang & Bentuk", blurb: "Perimeter, luas dan isipadu", workbookCount: 2, quizCount: 1, yearLabel: "Tahun 4" },
  { id: "cerita-rakyat", subjectId: "language", name: "Cerita Rakyat", blurb: "Struktur cerita dan watak", workbookCount: 2, quizCount: 1, yearLabel: "Tahun 4" },
  { id: "tatabahasa", subjectId: "language", name: "Tatabahasa", blurb: "Kata nama, kata kerja dan ayat", workbookCount: 3, quizCount: 2, yearLabel: "Tahun 4" },
  { id: "reading", subjectId: "english", name: "Reading Comprehension", blurb: "Main idea, inference and vocabulary", workbookCount: 2, quizCount: 1, yearLabel: "Tahun 4" },
  { id: "writing", subjectId: "english", name: "Writing Skills", blurb: "Sentences, paragraphs and stories", workbookCount: 1, quizCount: 1, yearLabel: "Tahun 4" },
  { id: "kesultanan-melayu", subjectId: "history", name: "Kesultanan Melayu Melaka", blurb: "Pengasasan, kegemilangan dan kejatuhan", workbookCount: 2, quizCount: 1, yearLabel: "Tahun 5" },
  { id: "kemerdekaan", subjectId: "history", name: "Kemerdekaan Tanah Air", blurb: "Perjuangan menuju merdeka", workbookCount: 1, quizCount: 1, yearLabel: "Tahun 5" },
  { id: "peta-malaysia", subjectId: "geography", name: "Peta Malaysia", blurb: "Negeri, ibu negeri dan sempadan", workbookCount: 1, quizCount: 1, yearLabel: "Tahun 5" },
  { id: "cuaca-iklim", subjectId: "geography", name: "Cuaca & Iklim", blurb: "Musim, hujan dan iklim tropika", workbookCount: 1, quizCount: 0, yearLabel: "Tahun 5" },
];

export function topicById(id: string): DemoTopic {
  return TOPICS.find((t) => t.id === id) ?? TOPICS[0];
}

export function topicsForSubject(subjectId: SubjectId): DemoTopic[] {
  return TOPICS.filter((t) => t.subjectId === subjectId);
}

/* ================= Workbook workspace ================= */

export type DemoSource = {
  id: string;
  title: string;
  kind: "pdf" | "doc" | "note" | "web";
  status: "ready" | "processing" | "failed";
  sizeLabel: string;
  detail?: string;
};

export const WORKBOOK_SOURCES: DemoSource[] = [
  { id: "src-1", title: "Bab 8 — Kitaran Air (buku teks).pdf", kind: "pdf", status: "ready", sizeLabel: "2.4 MB", detail: "12 halaman" },
  { id: "src-2", title: "Nota Cikgu Farah — Sejatan.docx", kind: "doc", status: "ready", sizeLabel: "184 KB" },
  { id: "src-3", title: "Video: Air di Bumi (ringkasan)", kind: "web", status: "ready", sizeLabel: "Pautan", detail: "Diluluskan sekolah" },
  { id: "src-4", title: "Eksperimen kondensasi.mp4", kind: "pdf", status: "processing", sizeLabel: "48 MB", detail: "Menyalin teks…" },
  { id: "src-5", title: "Peta dunia kitaran air.png", kind: "note", status: "failed", sizeLabel: "1.1 MB", detail: "Format tidak disokong" },
];

export type DemoChatMessage = {
  id: string;
  role: "student" | "ai";
  text: string;
  grounded?: boolean;
  citations?: { index: number; sourceId: string; label: string }[];
};

export const WORKBOOK_CHAT: DemoChatMessage[] = [
  { id: "c1", role: "student", text: "Kenapa air di laut tak habis walaupun selalu sejat?" },
  {
    id: "c2",
    role: "ai",
    grounded: true,
    text: "Air di laut tidak habis kerana kitaran air berterusan. Air yang sejat naik ke langit, menyejuk dan membentuk awan, kemudian turun semula sebagai hujan dan mengalir ke laut. Proses ini berulang tanpa henti, jadi jumlah air di Bumi kekal hampir sama.",
    citations: [
      { index: 1, sourceId: "src-1", label: "Bab 8 — Kitaran Air, hlm. 4" },
      { index: 2, sourceId: "src-2", label: "Nota Cikgu Farah, bahagian 2" },
    ],
  },
  { id: "c3", role: "student", text: "Boleh terangkan pemeluwapan macam cerita?" },
  {
    id: "c4",
    role: "ai",
    grounded: true,
    text: "Bayangkan wap air itu seperti adik kecil yang naik tinggi ke langit. Bila sampai atas, udara di sana sejuk, jadi wap air memeluk rapat satu sama lain menjadi titisan kecil — itulah pemeluwapan. Titisan kecil ini berkumpul menjadi awan. Bila terlalu berat, mereka jatuh sebagai hujan.",
    citations: [{ index: 1, sourceId: "src-1", label: "Bab 8 — Kitaran Air, hlm. 6" }],
  },
];

export const SUGGESTED_QUESTIONS = [
  "Apakah perbezaan sejatan dan pemeluwapan?",
  "Buat satu kuiz pendek tentang kitaran air.",
  "Kenapa hutan penting untuk hujan?",
];

export type DemoStudioTool = {
  id: string;
  name: string;
  description: string;
  asset: string;
  status: "completed" | "pending" | "failed";
  artifactId?: string;
  artifactKind?: "notes" | "quizzes" | "flashcards" | "slides" | "mindmaps" | "audio" | "study-guides";
  meta?: string;
};

export const STUDIO_TOOLS: DemoStudioTool[] = [
  { id: "tool-notes", name: "Nota", description: "Nota berstruktur dengan sitasi sumber", asset: "/assets/thiings/tool-notes.png", status: "completed", artifactId: "nota-kitaran-air", artifactKind: "notes", meta: "8 bahagian" },
  { id: "tool-quiz", name: "Kuiz", description: "Soalan objektif daripada sumber dipilih", asset: "/assets/thiings/tool-quiz.png", status: "completed", artifactId: "kuiz-kitaran-air", artifactKind: "quizzes", meta: "8 soalan" },
  { id: "tool-cards", name: "Kad Imbas", description: "Kad depan-belakang dengan ulang kaji", asset: "/assets/thiings/tool-cards.png", status: "completed", artifactId: "kad-kitaran-air", artifactKind: "flashcards", meta: "10 kad" },
  { id: "tool-slides", name: "Slaid", description: "Dek pembentangan berslaid", asset: "/assets/thiings/tool-slides.png", status: "completed", artifactId: "slaid-kitaran-air", artifactKind: "slides", meta: "8 slaid" },
  { id: "tool-mindmap", name: "Peta Minda", description: "Peta konsep boleh kembang", asset: "/assets/thiings/tool-mindmap.png", status: "completed", artifactId: "peta-kitaran-air", artifactKind: "mindmaps", meta: "12 nod" },
  { id: "tool-guide", name: "Panduan Ulang Kaji", description: "Objektif, contoh dan senarai semak", asset: "/assets/thiings/tool-guide.png", status: "completed", artifactId: "panduan-kitaran-air", artifactKind: "study-guides", meta: "6 seksyen" },
  { id: "tool-audio", name: "Pelajaran Audio", description: "Penjelasan bersuara dengan transkrip", asset: "/assets/thiings/tool-audio.png", status: "failed", meta: "TTS belum disambung" },
];

/* ================= Creations ================= */

export type DemoCreation = {
  id: string;
  title: string;
  kind: "notes" | "quizzes" | "flashcards" | "slides" | "mindmaps" | "audio" | "study-guides";
  workbookId: string;
  workbookTitle: string;
  status: "ready" | "processing" | "failed";
  time: string;
  meta: string;
  asset: string;
};

export const CREATIONS: DemoCreation[] = [
  { id: "nota-kitaran-air", title: "Nota: Kitaran Air", kind: "notes", workbookId: "kitaran-air", workbookTitle: "Kitaran Air", status: "ready", time: "Hari ini", meta: "8 bahagian · 4 sitasi", asset: "/assets/thiings/tool-notes.png" },
  { id: "kuiz-kitaran-air", title: "Kuiz: Kitaran Air", kind: "quizzes", workbookId: "kitaran-air", workbookTitle: "Kitaran Air", status: "ready", time: "Hari ini", meta: "8 soalan", asset: "/assets/thiings/tool-quiz.png" },
  { id: "kad-kitaran-air", title: "Kad Imbas: Kitaran Air", kind: "flashcards", workbookId: "kitaran-air", workbookTitle: "Kitaran Air", status: "ready", time: "Semalam", meta: "10 kad", asset: "/assets/thiings/tool-cards.png" },
  { id: "slaid-kitaran-air", title: "Slaid: Kitaran Air", kind: "slides", workbookId: "kitaran-air", workbookTitle: "Kitaran Air", status: "ready", time: "Semalam", meta: "8 slaid", asset: "/assets/thiings/tool-slides.png" },
  { id: "peta-kitaran-air", title: "Peta Minda: Kitaran Air", kind: "mindmaps", workbookId: "kitaran-air", workbookTitle: "Kitaran Air", status: "ready", time: "2 hari lalu", meta: "12 nod", asset: "/assets/thiings/tool-mindmap.png" },
  { id: "panduan-kitaran-air", title: "Panduan Ulang Kaji: Kitaran Air", kind: "study-guides", workbookId: "kitaran-air", workbookTitle: "Kitaran Air", status: "ready", time: "2 hari lalu", meta: "6 seksyen", asset: "/assets/thiings/tool-guide.png" },
  { id: "audio-kitaran-air", title: "Audio: Kitaran Air", kind: "audio", workbookId: "kitaran-air", workbookTitle: "Kitaran Air", status: "failed", time: "3 hari lalu", meta: "TTS belum disambung", asset: "/assets/thiings/tool-audio.png" },
];

export const CREATION_KIND_LABEL: Record<DemoCreation["kind"], string> = {
  notes: "Nota",
  quizzes: "Kuiz",
  flashcards: "Kad Imbas",
  slides: "Slaid",
  mindmaps: "Peta Minda",
  audio: "Audio",
  "study-guides": "Panduan Ulang Kaji",
};

/* ================= Artifact content ================= */

export type DemoNoteSection = {
  id: string;
  heading: string;
  bullets: string[];
  citation?: { sourceId: string; label: string };
};

export const NOTE_SECTIONS: DemoNoteSection[] = [
  { id: "n1", heading: "Apakah kitaran air?", bullets: ["Pergerakan air yang berterusan antara laut, atmosfera dan darat.", "Dijana oleh tenaga matahari dan graviti."], citation: { sourceId: "src-1", label: "Bab 8, hlm. 3" } },
  { id: "n2", heading: "Sejatan (Evaporasi)", bullets: ["Air bertukar menjadi wap air pada permukaan laut dan tasik.", "Matahari memanaskan air sehingga naik ke atmosfera.", "Tumbuhan juga menyumbang melalui transpirasi."], citation: { sourceId: "src-1", label: "Bab 8, hlm. 4" } },
  { id: "n3", heading: "Pemeluwapan (Kondensasi)", bullets: ["Wap air menyejuk di atmosfera dan bertukar menjadi titisan kecil.", "Titisan berkumpul membentuk awan.", "Debu dan habuk membantu proses ini sebagai nukleus."], citation: { sourceId: "src-2", label: "Nota Cikgu Farah, bahagian 2" } },
  { id: "n4", heading: "Kerpasan (Presipitasi)", bullets: ["Awan yang berat melepaskan air sebagai hujan, salji atau batu."], citation: { sourceId: "src-1", label: "Bab 8, hlm. 6" } },
  { id: "n5", heading: "Pengumpulan (Koleksi)", bullets: ["Air hujan mengalir ke sungai dan laut melalui larian permukaan.", "Sebahagian air menyerap ke dalam tanah (infiltrasi)."], citation: { sourceId: "src-2", label: "Nota Cikgu Farah, bahagian 4" } },
];

export type DemoQuizQuestion = {
  id: string;
  question: string;
  options: string[];
  answer: number;
  explanation: string;
  aiExplain: string;
  citation: string;
};

export const QUIZ_QUESTIONS: DemoQuizQuestion[] = [
  { id: "q1", question: "Apakah proses air bertukar menjadi wap?", options: ["Pemeluwapan", "Sejatan", "Kerpasan", "Pengumpulan"], answer: 1, explanation: "Sejatan berlaku apabila matahari memanaskan air sehingga bertukar menjadi wap.",
    aiExplain: "Sejatan ialah bila matahari memanaskan air sehingga air bertukar menjadi wap. Fikirkan air panas dalam cerek — wap yang naik itu contoh sejatan. Dalam kitaran air, sejatan berlaku di laut, tasik dan sungai setiap hari.",
    citation: "Bab 8 — Kitaran Air, hlm. 4",
  },
  { id: "q2", question: "Apakah yang membentuk awan?", options: ["Titisan air yang berkumpul", "Wap panas sahaja", "Angin lautan", "Debu gunung berapi"], answer: 0, explanation: "Wap air yang menyejuk membentuk titisan kecil dan berkumpul menjadi awan.",
    aiExplain: "Bayangkan wap air naik ke langit dan bertemu udara sejuk. Wap itu memeluk rapat menjadi titisan kecil — titisan ini berkumpul dan itulah awan. Proses ini dipanggil pemeluwapan.",
    citation: "Nota Cikgu Farah, bahagian 2",
  },
  { id: "q3", question: "Apakah nama proses air menyerap ke dalam tanah?", options: ["Larian permukaan", "Infiltrasi", "Transpirasi", "Sublimasi"], answer: 1, explanation: "Infiltrasi ialah penyerapan air ke dalam lapisan tanah.",
    aiExplain: "Infiltrasi berlaku apabila air hujan meresap ke dalam tanah, seperti air menyiram tanah di kebun. Air ini disimpan dalam tanah dan mengalir perlahan ke sungai bawah tanah.",
    citation: "Bab 8 — Kitaran Air, hlm. 7",
  },
  { id: "q4", question: "Tenaga utama kitaran air ialah…", options: ["Angin", "Graviti sahaja", "Matahari", "Bulan"], answer: 2, explanation: "Matahari membekalkan tenaga haba untuk sejatan; graviti membantu kerpasan.",
    aiExplain: "Matahari ialah enjin kitaran air — tanpa habanya, air tidak akan sejat. Graviti pula membantu hujan jatuh ke bumi. Cuba ingat: matahari menaikkan air, graviti menurunkannya.",
    citation: "Bab 8 — Kitaran Air, hlm. 3",
  },
  { id: "q5", question: "Hujan, salji dan batu ialah contoh…", options: ["Kerpasan", "Sejatan", "Pemeluwapan", "Transpirasi"], answer: 0, explanation: "Kerpasan ialah air yang jatuh dari awan ke bumi.",
    aiExplain: "Kerpasan ialah apa sahaja yang jatuh dari awan: hujan, salji atau batu. Di Malaysia, kita paling biasa melihat hujan sebagai kerpasan.",
    citation: "Bab 8 — Kitaran Air, hlm. 6",
  },
  { id: "q6", question: "Tumbuhan melepaskan wap air melalui proses…", options: ["Infiltrasi", "Transpirasi", "Sublimasi", "Kerpasan"], answer: 1, explanation: "Transpirasi ialah proses tumbuhan melepaskan wap air melalui daun.",
    aiExplain: "Transpirasi ialah cara tumbuhan \"bernafas\" air — daun melepaskan wap air ke udara, seperti kita berpeluh. Hutan hujan menyumbang banyak wap air melalui transpirasi.",
    citation: "Nota Cikgu Farah, bahagian 3",
  },
  { id: "q7", question: "Kenapa jumlah air di Bumi kekal hampir sama?", options: ["Kerana air tidak boleh bergerak", "Kerana kitaran air berterusan", "Kerana hujan sahaja", "Kerana laut tidak menyejat"], answer: 1, explanation: "Kitaran air yang berterusan mengekalkan jumlah air di Bumi.",
    aiExplain: "Air di Bumi tidak hilang kerana ia sentiasa dikitar semula. Air yang sejat akan turun semula sebagai hujan — seperti air dalam botol tertutup yang dicurahkan dan dikumpul semula.",
    citation: "Bab 8 — Kitaran Air, hlm. 4",
  },
  { id: "q8", question: "Apakah yang membantu titisan air terbentuk di langit?", options: ["Debu dan habuk", "Cahaya bulan", "Ombak laut", "Batu karang"], answer: 0, explanation: "Debu dan habuk bertindak sebagai nukleus untuk pemeluwapan.",
    aiExplain: "Titisan air perlukan sesuatu untuk melekat, seperti debu dan habuk di udara. Tanpa nukleus ini, wap air sukar membentuk titisan dan awan.",
    citation: "Nota Cikgu Farah, bahagian 2",
  },
];

export type DemoFlashcard = { id: string; front: string; back: string };

export const FLASHCARDS: DemoFlashcard[] = [
  { id: "f1", front: "Sejatan", back: "Air bertukar menjadi wap kerana haba matahari." },
  { id: "f2", front: "Pemeluwapan", back: "Wap air menyejuk dan bertukar menjadi titisan kecil membentuk awan." },
  { id: "f3", front: "Kerpasan", back: "Air jatuh dari awan sebagai hujan, salji atau batu." },
  { id: "f4", front: "Pengumpulan", back: "Air terkumpul di sungai, tasik dan laut." },
  { id: "f5", front: "Infiltrasi", back: "Air menyerap masuk ke dalam tanah." },
  { id: "f6", front: "Transpirasi", back: "Tumbuhan melepaskan wap air melalui daun." },
  { id: "f7", front: "Larian permukaan", back: "Air mengalir di atas permukaan tanah ke sungai." },
  { id: "f8", front: "Tenaga kitaran air", back: "Matahari (haba) dan graviti." },
  { id: "f9", front: "Nukleus pemeluwapan", back: "Debu dan habuk di udara." },
  { id: "f10", front: "Kepentingan kitaran air", back: "Membekalkan air bersih dan mengekalkan cuaca." },
];

export type DemoSlide = { id: string; title: string; subtitle?: string; bullets: string[] };

export const SLIDES: DemoSlide[] = [
  { id: "s1", title: "Kitaran Air", subtitle: "Pembentangan Sains · Tahun 4", bullets: ["Oleh Aiman Hakim", "Sumber: Bab 8 & Nota Cikgu Farah"] },
  { id: "s2", title: "Apa itu kitaran air?", bullets: ["Pergerakan air yang berterusan", "Antara laut, langit dan darat", "Dijana oleh matahari dan graviti"] },
  { id: "s3", title: "Langkah 1 — Sejatan", bullets: ["Matahari memanaskan air", "Air bertukar menjadi wap", "Wap naik ke atmosfera"] },
  { id: "s4", title: "Langkah 2 — Pemeluwapan", bullets: ["Wap air menyejuk", "Titisan kecil terbentuk", "Awan mula terbentuk"] },
  { id: "s5", title: "Langkah 3 — Kerpasan", bullets: ["Awan menjadi berat", "Hujan turun ke bumi", "Salji di kawasan sejuk"] },
  { id: "s6", title: "Langkah 4 — Pengumpulan", bullets: ["Air mengalir ke sungai", "Sebahagian menyerap ke tanah", "Kembali ke laut"] },
  { id: "s7", title: "Kepentingan kitaran air", bullets: ["Air bersih untuk semua", "Menyuburkan tumbuhan", "Menyeimbangkan cuaca"] },
  { id: "s8", title: "Terima kasih!", bullets: ["Sumber: Bab 8 — Kitaran Air", "Nota Cikgu Farah — Sejatan"] },
];

export type DemoMindmapNode = {
  id: string;
  label: string;
  children?: DemoMindmapNode[];
};

export const MINDMAP: DemoMindmapNode = {
  id: "root",
  label: "Kitaran Air",
  children: [
    { id: "m1", label: "Sejatan", children: [{ id: "m1a", label: "Haba matahari" }, { id: "m1b", label: "Transpirasi" }] },
    { id: "m2", label: "Pemeluwapan", children: [{ id: "m2a", label: "Titisan kecil" }, { id: "m2b", label: "Nukleus debu" }] },
    { id: "m3", label: "Kerpasan", children: [{ id: "m3a", label: "Hujan" }, { id: "m3b", label: "Salji" }] },
    { id: "m4", label: "Pengumpulan", children: [{ id: "m4a", label: "Sungai & laut" }, { id: "m4b", label: "Infiltrasi" }] },
  ],
};

export type DemoStudyGuide = {
  overview: string;
  objectives: string[];
  concepts: { term: string; definition: string }[];
  example: { question: string; steps: string[] };
  checklist: string[];
};

export const STUDY_GUIDE: DemoStudyGuide = {
  overview: "Kitaran air menerangkan bagaimana air bergerak secara berterusan antara laut, atmosfera dan darat. Fahami empat langkah utama dan istilah penting untuk ujian.",
  objectives: [
    "Menyatakan empat langkah kitaran air.",
    "Menerangkan perbezaan sejatan dan pemeluwapan.",
    "Memberi contoh kerpasan di Malaysia.",
    "Menjelaskan mengapa kitaran air penting kepada hidupan.",
  ],
  concepts: [
    { term: "Sejatan", definition: "Air menjadi wap kerana haba matahari." },
    { term: "Pemeluwapan", definition: "Wap air menyejuk menjadi titisan kecil." },
    { term: "Kerpasan", definition: "Air jatuh dari awan (hujan/salji/batu)." },
    { term: "Infiltrasi", definition: "Air menyerap ke dalam tanah." },
  ],
  example: {
    question: "Terangkan apa yang berlaku kepada air laut pada hari yang panas.",
    steps: [
      "Matahari memanaskan permukaan laut.",
      "Air menyejat menjadi wap dan naik.",
      "Wap menyejuk di langit dan membentuk awan.",
      "Akhirnya hujan turun semula ke laut atau darat.",
    ],
  },
  checklist: [
    "Saya boleh label 4 langkah kitaran air.",
    "Saya boleh bezakan sejatan dan pemeluwapan.",
    "Saya boleh beri 2 contoh kerpasan.",
    "Saya sudah siapkan kuiz Kitaran Air.",
  ],
};

export const AUDIO_TRANSCRIPT: { id: string; time: string; text: string }[] = [
  { id: "a1", time: "0:00", text: "Hai! Hari ini kita belajar tentang kitaran air." },
  { id: "a2", time: "0:06", text: "Kitaran air bermula apabila matahari memanaskan air di laut." },
  { id: "a3", time: "0:14", text: "Air bertukar menjadi wap dan naik ke langit. Ini dipanggil sejatan." },
  { id: "a4", time: "0:24", text: "Di langit yang sejuk, wap air bertukar menjadi titisan kecil. Itulah pemeluwapan." },
  { id: "a5", time: "0:35", text: "Titisan berkumpul menjadi awan. Bila berat, hujan turun. Ini kerpasan." },
  { id: "a6", time: "0:47", text: "Air hujan mengalir semula ke sungai dan laut. Kitaran bermula lagi!" },
];

/* ================= Progress ================= */

export type DemoSubjectMastery = {
  subjectId: SubjectId;
  percent: number;
  trend: "up" | "flat" | "down";
  topics: { id: string; name: string; percent: number }[];
};

export const SUBJECT_MASTERY: DemoSubjectMastery[] = [
  { subjectId: "math", percent: 72, trend: "up", topics: [{ id: "pecahan", name: "Pecahan", percent: 84 }, { id: "ruang", name: "Ruang & Bentuk", percent: 61 }] },
  { subjectId: "science", percent: 64, trend: "up", topics: [{ id: "kitaran-air", name: "Kitaran Air", percent: 78 }, { id: "rantai-makanan", name: "Rantai Makanan", percent: 52 }] },
  { subjectId: "language", percent: 81, trend: "flat", topics: [{ id: "cerita-rakyat", name: "Cerita Rakyat", percent: 88 }, { id: "tatabahasa", name: "Tatabahasa", percent: 74 }] },
  { subjectId: "english", percent: 58, trend: "down", topics: [{ id: "reading", name: "Reading Comprehension", percent: 62 }, { id: "writing", name: "Writing Skills", percent: 54 }] },
  { subjectId: "history", percent: 45, trend: "flat", topics: [{ id: "kesultanan-melayu", name: "Kesultanan Melayu Melaka", percent: 48 }, { id: "kemerdekaan", name: "Kemerdekaan", percent: 42 }] },
];

export type DemoActivity = {
  id: string;
  title: string;
  detail: string;
  time: string;
  kind: "workbook" | "quiz" | "practice" | "achievement" | "creation";
};

export const ACTIVITY_HISTORY: DemoActivity[] = [
  { id: "h1", title: "Tanya Pixel AI", detail: "Kitaran Air · 2 soalan bersitasi", time: "Hari ini, 9:41 pagi", kind: "workbook" },
  { id: "h2", title: "Kuiz Kitaran Air", detail: "6/8 betul · 75%", time: "Semalam, 4:20 petang", kind: "quiz" },
  { id: "h3", title: "Nota dijana", detail: "Nota: Kitaran Air (8 bahagian)", time: "Semalam, 3:55 petang", kind: "creation" },
  { id: "h4", title: "Kuiz Pecahan Setara", detail: "Selesai · 8/8 betul", time: "2 hari lalu", kind: "quiz" },
  { id: "h5", title: "Latihan Pecahan", detail: "10 soalan · 80%", time: "3 hari lalu", kind: "practice" },
  { id: "h6", title: "Pencapaian: Bintang Sains", detail: "Siapkan 3 buku kerja Sains", time: "4 hari lalu", kind: "achievement" },
  { id: "h7", title: "Buku kerja dibuka", detail: "Kitaran Air · sesi 18 minit", time: "4 hari lalu", kind: "workbook" },
];

export type DemoNotification = {
  id: string;
  title: string;
  body: string;
  time: string;
  kind: "assignment" | "class" | "creation" | "account";
  read: boolean;
};

export const NOTIFICATIONS: DemoNotification[] = [
  { id: "n1", title: "Tugasan baharu", body: "Cikgu Farah menambah 'Laporan Kitaran Air' — perlu disiapkan hari ini.", time: "2 jam lalu", kind: "assignment", read: false },
  { id: "n2", title: "Penjanaan selesai", body: "Nota: Kitaran Air telah siap dijana.", time: "Semalam", kind: "creation", read: false },
  { id: "n3", title: "Pengumuman kelas", body: "Kuiz Sains Mingguan dibuka sehingga Khamis.", time: "Semalam", kind: "class", read: true },
  { id: "n4", title: "Pencapaian baharu", body: "Anda memperoleh 'Pembaca Hebat' — Baca 10 cerita.", time: "3 hari lalu", kind: "account", read: true },
];

/* ================= Demo komuniti pelajar (tiles in Jelajah) ================= */

export type DemoCommunityStudent = {
  id: string;
  name: string;
  className: string;
  yearLabel: string;
  bio: string;
  xp: number;
  streakDays: number;
  subscribers: number;
  badges: string[];
  followed: boolean;
};

export const COMMUNITY_STUDENTS: DemoCommunityStudent[] = [
  { id: "mei-lin", name: "Mei Lin", className: "4 Bestari", yearLabel: "Tahun 4", bio: "Suka sains dan eksperimen air. Selalu ulang kaji bersama kawan sekelas.", xp: 520, streakDays: 12, subscribers: 18, badges: ["Bintang Sains", "Pembaca Hebat", "Rentetan 7 Hari"], followed: true },
  { id: "danial", name: "Danial", className: "4 Bestari", yearLabel: "Tahun 4", bio: "Koleksi nota tatabahasa dan cerita pendek untuk ulang kaji cepat.", xp: 380, streakDays: 7, subscribers: 11, badges: ["Juara Bahasa", "Rentetan 7 Hari"], followed: true },
  { id: "priya", name: "Priya", className: "4 Dinamik", yearLabel: "Tahun 4", bio: "Trik matematik pantas — pecahan, ruang dan bentuk.", xp: 610, streakDays: 21, subscribers: 24, badges: ["Juara Pecahan", "Bintang Sains", "Rentetan 14 Hari"], followed: false },
  { id: "hafiz", name: "Hafiz", className: "4 Amanah", yearLabel: "Tahun 4", bio: "Eksperimen sains mudah yang boleh dibuat di rumah.", xp: 290, streakDays: 4, subscribers: 9, badges: ["Detektif Sains"], followed: false },
  { id: "sofia", name: "Sofia", className: "4 Amanah", yearLabel: "Tahun 4", bio: "Menulis cerita kreatif dan puisi untuk projek kelas.", xp: 445, streakDays: 9, subscribers: 14, badges: ["Pembaca Hebat", "Penulis Muda"], followed: false },
];

export function communityStudentById(id: string): DemoCommunityStudent {
  return COMMUNITY_STUDENTS.find((s) => s.id === id) ?? COMMUNITY_STUDENTS[0];
}

export function communityLevel(xp: number): number {
  return Math.floor(xp / 100) + 1;
}

export type DemoSharedWorkbook = {
  id: string;
  title: string;
  subjectId: SubjectId;
  topic: string;
  authorId: string;
  yearLabel: string;
  sharedAt: string;
  subscribers: number;
  saves: number;
  featured?: boolean;
  modules: DemoCreation["kind"][];
  asset: string;
  defaultSaved?: boolean;
  yourStreak?: number;
};

export const SHARED_WORKBOOKS: DemoSharedWorkbook[] = [
  { id: "peta-kitaran-air", title: "Peta Kitaran Air", subjectId: "science", topic: "Nota ringkas, kad imbas dan kuiz kitaran air", authorId: "mei-lin", yearLabel: "Tahun 4", sharedAt: "2 jam lalu", subscribers: 18, saves: 124, featured: true, modules: ["notes", "flashcards", "quizzes"], asset: "/assets/thiings/workbook-flask.png", defaultSaved: true, yourStreak: 3 },
  { id: "tatabahasa-mudah", title: "Tatabahasa Mudah", subjectId: "language", topic: "Kata nama, kata kerja dan ayat mudah", authorId: "danial", yearLabel: "Tahun 4", sharedAt: "Semalam", subscribers: 11, saves: 57, modules: ["notes", "slides", "study-guides"], asset: "/assets/thiings/workbook-pencil.png" },
  { id: "trik-pecahan-pantas", title: "Trik Pecahan Pantas", subjectId: "math", topic: "Cara cepat banding dan tambah pecahan", authorId: "priya", yearLabel: "Tahun 4", sharedAt: "2 hari lalu", subscribers: 24, saves: 86, featured: true, modules: ["notes", "slides", "quizzes", "mindmaps"], asset: "/assets/thiings/workbook-calculator.png" },
  { id: "cerita-pendek-kreatif", title: "Cerita Pendek Kreatif", subjectId: "language", topic: "Contoh cerita dan struktur watak untuk projek kelas", authorId: "sofia", yearLabel: "Tahun 4", sharedAt: "3 hari lalu", subscribers: 14, saves: 41, featured: true, modules: ["notes", "study-guides"], asset: "/assets/thiings/subject-language.png" },
  { id: "eksperimen-rumah", title: "Eksperimen Sains Rumah", subjectId: "science", topic: "5 eksperimen mudah dengan bahan dapur", authorId: "hafiz", yearLabel: "Tahun 5", sharedAt: "4 hari lalu", subscribers: 9, saves: 23, modules: ["notes", "flashcards"], asset: "/assets/thiings/subject-science.png" },
];

export function sharedWorkbookById(id: string): DemoSharedWorkbook {
  return SHARED_WORKBOOKS.find((w) => w.id === id) ?? SHARED_WORKBOOKS[0];
}

export function sharedWorkbooksByAuthor(authorId: string): DemoSharedWorkbook[] {
  return SHARED_WORKBOOKS.filter((w) => w.authorId === authorId);
}
