import { listSources } from "@/lib/sources";

/**
 * Source text corpus used by AI generation.
 *
 * Real sources (DB) take priority — uploaded files, web pages, YouTube
 * transcripts, textbook sections and pasted text. The seeded demo corpus
 * remains as a fallback for demo workbooks that predate real sources.
 */

export type CorpusSource = { id: string; title: string; text: string };

export const WORKBOOK_CORPUS: Record<string, CorpusSource[]> = {
  "kitaran-air": [
    {
      id: "src-1",
      title: "Bab 8 — Kitaran Air (buku teks)",
      text: `Kitaran air ialah pergerakan air yang berterusan antara laut, atmosfera dan darat. Ia dijana oleh tenaga matahari dan graviti, dan jumlah air di Bumi kekal hampir sama kerana air sentiasa dikitar semula.

Sejatan (evaporasi) berlaku apabila matahari memanaskan permukaan laut, tasik dan sungai sehingga air bertukar menjadi wap air dan naik ke atmosfera. Tumbuhan juga menyumbang wap air melalui transpirasi — daun melepaskan wap air ke udara seperti manusia berpeluh.

Pemeluwapan (kondensasi) berlaku apabila wap air naik ke lapisan udara yang sejuk. Wap air menyejuk dan bertukar menjadi titisan kecil. Titisan ini berkumpul membentuk awan. Debu dan habuk di udara membantu proses ini sebagai nukleus pemeluwapan — tanpa nukleus, titisan air sukar terbentuk.

Kerpasan (presipitasi) berlaku apabila awan menjadi terlalu berat. Air jatuh semula ke bumi sebagai hujan, salji atau batu. Di Malaysia, hujan ialah bentuk kerpasan yang paling biasa.

Pengumpulan berlaku apabila air hujan mengalir ke sungai dan laut melalui larian permukaan. Sebahagian air menyerap ke dalam tanah melalui infiltrasi dan disimpan sebagai air bawah tanah.

Matahari ialah enjin utama kitaran air — tanpa habanya, air tidak akan sejat. Graviti pula membantu hujan jatuh ke bumi dan air mengalir kembali ke laut. Hutan hujan menyumbang banyak wap air melalui transpirasi dan membantu mengekalkan kitaran air.`,
    },
    {
      id: "src-2",
      title: "Nota Cikgu Farah — Sejatan",
      text: `Empat langkah kitaran air yang perlu murid ingat: sejatan, pemeluwapan, kerpasan, pengumpulan.

Sejatan: matahari memanaskan air di laut dan tasik. Air bertukar menjadi wap air yang tidak kelihatan. Fikirkan air panas dalam cerek — wap yang naik itu contoh sejatan.

Pemeluwapan: bayangkan wap air naik ke langit dan bertemu udara sejuk. Wap itu memeluk rapat menjadi titisan kecil — itulah pemeluwapan. Titisan berkumpul dan membentuk awan.

Kerpasan: bila awan terlalu berat dengan titisan air, hujan turun ke bumi. Salji dan batu juga bentuk kerpasan di kawasan sejuk.

Pengumpulan: air hujan mengalir ke sungai, tasik dan laut. Sebahagian menyerap ke dalam tanah. Kitaran bermula semula.

Kepentingan kitaran air: membekalkan air bersih untuk minuman dan pertanian, menyuburkan tumbuhan, dan mengeimbangkan cuaca. Tanpa kitaran air, hidupan di Bumi tidak dapat hidup.`,
    },
    {
      id: "src-3",
      title: "Video: Air di Bumi (ringkasan)",
      text: `Ringkasan video: Air meliputi lebih daripada dua pertiga permukaan Bumi. Kebanyakan air ialah air masin di laut — hanya sebahagian kecil air tawar yang boleh digunakan oleh manusia.

Kitaran air tidak pernah berhenti. Air yang kita minum hari ini mungkin pernah berada di laut beribu tahun lalu. Proses yang sama berlaku setiap hari: sejatan, pemeluwapan, kerpasan dan pengumpulan.

Eksperimen mudah: letakkan mangkuk air di bawah matahari. Selepas beberapa jam, air berkurang kerana sejatan. Tutup mangkuk dengan plastik dan letakkan ais di atas — titisan air akan terbentuk pada plastik. Itulah pemeluwapan dan kerpasan dalam skala kecil.`,
    },
  ],
  "pecahan-tahun4": [
    {
      id: "src-1",
      title: "Bab 4 — Pecahan (buku teks)",
      text: `Pecahan mewakili sebahagian daripada sesuatu keseluruhan. Pecahan ditulis sebagai satu nombor di atas nombor yang lain: pengangka di atas, penyebut di bawah. Contohnya, dalam pecahan 3/4, pengangka ialah 3 dan penyebut ialah 4.

Pecahan setara ialah pecahan yang mempunyai nilai yang sama walaupun pengangka dan penyebut berbeza. Contohnya 1/2 = 2/4 = 4/8. Untuk mendapat pecahan setara, darab atau bahagi pengangka dan penyebut dengan nombor yang sama.

Membandingkan pecahan: apabila penyebut sama, pecahan dengan pengangka lebih besar adalah lebih besar. Contohnya 3/5 lebih besar daripada 2/5. Apabila pengangka sama, pecahan dengan penyebut lebih kecil adalah lebih besar. Contohnya 1/3 lebih besar daripada 1/4.

Menambah dan menolak pecahan dengan penyebut yang sama: tambah atau tolak pengangka sahaja, penyebut kekal sama. Contohnya 2/7 + 3/7 = 5/7.

Pecahan wajar ialah pecahan di mana pengangka lebih kecil daripada penyebut, seperti 3/5. Pecahan tak wajar ialah pecahan di mana pengangka lebih besar atau sama dengan penyebut, seperti 7/5. Nombor bercampur mengandungi nombor bulat dan pecahan wajar, seperti 1 2/5.

Tip pantas: untuk menukar nombor bercampur 1 2/5 kepada pecahan tak wajar, darab nombor bulat dengan penyebut (1 × 5 = 5), tambah pengangka (5 + 2 = 7), dan kekalkan penyebut: 7/5.`,
    },
  ],
  "cerita-raya": [
    {
      id: "src-1",
      title: "Bab 6 — Cerita Rakyat Nusantara (buku teks)",
      text: `Cerita rakyat ialah cerita yang diwarisi daripada generasi ke generasi. Cerita rakyat Nusantara termasuk cerita rakyat Melayu, Cina, India dan bumiputera Sabah dan Sarawak.

Struktur cerita: setiap cerita yang baik mempunyai permulaan, perkembangan dan penutup. Permulaan memperkenalkan watak dan tempat. Perkembangan menunjukkan masalah yang dihadapi oleh watak. Penutup menyelesaikan masalah itu.

Watak dan perwatakan: watak utama ialah orang yang paling penting dalam cerita. Watak sampingan membantu watak utama. Perwatakan ialah sifat watak — berani, baik hati, rajin atau sebaliknya.

Latar: latar ialah tempat dan masa cerita berlaku. Contohnya "di sebuah kampung di tepi sungai pada zaman dahulu".

Contoh cerita rakyat yang terkenal: "Si Tanggang" mengajar kita supaya tidak menderhaka kepada ibu bapa. "Bawang Putih Bawang Merah" mengajar kita supaya tidak berdengki. "Sang Kancil" menunjukkan kepintaran mengalahkan kekuatan.

Nilai murni dalam cerita rakyat: kasih sayang, kejujuran, kerajinan, keberanian dan hormat-menghormati. Setiap cerita rakyat membawa pengajaran yang berguna untuk kehidupan.`,
    },
  ],
};

/** Only reviewed, ready sources visible to this user may enter generation. */
export async function corpusForWorkbook(workbookId: string, sourceIds?: string[], viewerId?: string): Promise<string> {
  const rows = await listSources(workbookId, viewerId);
  const ready = rows.filter(row => row.status === "ready" && row.fullText?.trim());
  const selected = sourceIds === undefined ? ready : ready.filter(row => sourceIds.includes(row.id));
  if (!selected.length) throw new Error("Pilih sekurang-kurangnya satu sumber yang siap diembed dalam tab Sumber.");
  return selected.map(row => `### Sumber: ${row.title} [${row.id}]\n${row.fullText}`).join("\n\n").slice(0, 80_000);
}
