import type { Metadata } from "next";
import { LegalPage, LegalSection } from "@/components/legal/legal-page";

export const metadata: Metadata = { title: "Dasar Privasi" };

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Dasar Privasi"
      updated="10 November 2026"
      intro="Pixelspace AI Classroom ialah platform pembelajaran berbantukan AI untuk sekolah di Malaysia. Dasar ini menerangkan data yang kami kumpul, cara ia digunakan dan hak anda di bawah Akta Perlindungan Data Peribadi 2010 (PDPA)."
    >
      <LegalSection
        heading="1. Data yang kami kumpul"
        points={[
          "Maklumat akaun: nama penuh, ID pengguna, nama paparan, alamat emel, sekolah, tahun/tingkatan (pelajar) atau peranan (guru).",
          "Kandungan yang anda tambah: sumber pembelajaran yang dimuat naik atau ditampal (fail, pautan, teks) dan bahan yang dijana (nota, kuiz, kad imbas, slaid, audio dan lain-lain).",
          "Interaksi: soalan dan jawapan dalam sembang AI, pilihan sumber untuk penjanaan, dan aktiviti pembelajaran asas.",
          "Data teknikal: log sistem, jenis peranti dan ralat — digunakan untuk keselamatan dan kestabilan perkhidmatan.",
        ]}
      />
      <LegalSection
        heading="2. Cara data digunakan"
        points={[
          "Menyediakan dan menguruskan akaun anda, termasuk pengesahan emel dan pengesahan sekolah.",
          "Menjana bahan pembelajaran dan menjawab soalan sembang AI berdasarkan sumber yang anda pilih.",
          "Menyimpan buku kerja, hasil pembelajaran dan kemajuan anda supaya boleh diakses semula.",
          "Mengekalkan keselamatan platform, mencegah penyalahgunaan dan menambah baik perkhidmatan.",
        ]}
      />
      <LegalSection
        heading="3. Perkongsian data"
        points={[
          "Kami tidak menjual data peribadi anda kepada mana-mana pihak.",
          "Pemproses pihak ketiga (contohnya penyedia model AI dan infrastruktur) hanya menerima data yang diperlukan untuk menyediakan perkhidmatan, di bawah kewajipan kerahsiaan.",
          "Apabila anda menerbitkan buku kerja ke Jelajah, hanya nama paparan dan kelas/tahun dipaparkan kepada pengguna lain. Sumber peribadi, sembang AI dan nota anda tidak dikongsi.",
          "Sembang AI adalah peribadi kepada setiap pengguna — termasuk pembaca buku kerja yang diterbitkan; mereka tidak dapat melihat perbualan anda.",
        ]}
      />
      <LegalSection
        heading="4. Pelajar dan sekolah"
        points={[
          "Akaun pelajar disahkan melalui emel dan dikaitkan dengan sekolah. Guru dan pihak sekolah bertanggungjawab mendapatkan kebenaran ibu bapa/penjaga di mana diperlukan.",
          "Kandungan pembelajaran yang dikongsi secara terbuka tidak mengandungi maklumat hubungan peribadi pelajar.",
        ]}
      />
      <LegalSection
        heading="5. Penyimpanan dan keselamatan"
        points={[
          "Data disimpan pada pelayan kami dengan kawalan akses, dan dihantar melalui sambungan tersulit (HTTPS).",
          "Kata laluan disimpan dalam bentuk cincang (hashed) dan tidak pernah boleh dibaca oleh kami.",
          "Data disimpan selagi akaun aktif atau selagi diperlukan untuk tujuan di atas.",
        ]}
      />
      <LegalSection
        heading="6. Hak anda (PDPA)"
        points={[
          "Mengakses dan membetulkan data peribadi anda melalui halaman profil atau dengan menghubungi kami.",
          "Meminta pemadaman akaun dan data berkaitan — kami akan memproses permintaan dalam masa yang munasabah.",
          "Menarik balik kebenaran pemprosesan pada bila-bila masa, tertakluk kepada keperluan undang-undang.",
        ]}
      />
      <LegalSection
        heading="7. Perubahan dan hubungan"
        points={[
          "Kami boleh mengemas kini dasar ini dari semasa ke semasa; perubahan penting akan dimaklumkan melalui platform.",
          "Sebarang pertanyaan: hello@pixelspace.com.my",
        ]}
      />
    </LegalPage>
  );
}
