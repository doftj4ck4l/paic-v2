import type { Metadata } from "next";
import { LegalPage, LegalSection } from "@/components/legal/legal-page";

export const metadata: Metadata = { title: "Terma Penggunaan" };

export default function TermsPage() {
  return (
    <LegalPage
      title="Terma Penggunaan"
      updated="10 November 2026"
      intro="Dengan mendaftar dan menggunakan Pixelspace AI Classroom, anda bersetuju dengan terma di bawah. Sila baca dengan teliti sebelum menggunakan perkhidmatan."
    >
      <LegalSection
        heading="1. Akaun anda"
        points={[
          "Anda bertanggungjawab memastikan maklumat pendaftaran adalah tepat dan terkini.",
          "Jaga kerahsiaan kata laluan anda. Semua aktiviti di bawah akaun anda adalah tanggungjawab anda.",
          "Satu akaun untuk satu orang. Akaun pelajar disahkan melalui emel; akaun guru disahkan dengan cara yang sama.",
        ]}
      />
      <LegalSection
        heading="2. Penggunaan yang dibenarkan"
        points={[
          "Platform ini untuk tujuan pembelajaran dan pengajaran sekolah.",
          "Dilarang: memuat naik kandungan menyalahi undang-undang atau melanggar hak cipta, cuba mengakses data pengguna lain, menyalahgunakan perkhidmatan AI, atau mengganggu kestabilan platform.",
          "Kami boleh menggantung atau menamatkan akaun yang melanggar terma ini.",
        ]}
      />
      <LegalSection
        heading="3. Kandungan anda"
        points={[
          "Anda memiliki kandungan yang anda muat naik atau cipta. Anda memberi kami kebenaran terhad untuk memprosesnya bagi menyediakan perkhidmatan (contohnya menjana bahan pembelajaran dan menjawab sembang AI).",
          "Pastikan anda mempunyai hak untuk menggunakan bahan yang dimuat naik, terutamanya bahan buku teks dan artikel pihak ketiga.",
          "Bahan yang diterbitkan ke Jelajah boleh dilihat oleh pengguna berdaftar lain dalam platform.",
        ]}
      />
      <LegalSection
        heading="4. Kandungan yang dijana AI"
        points={[
          "Bahan yang dijana (nota, kuiz, slaid, jawapan sembang dan lain-lain) dihasilkan secara automatik dan boleh mengandungi kesilapan.",
          "Sentiasa semak rujukan yang dipaparkan. Kandungan AI bukan nasihat profesional dan bukan pengganti bahan rasmi kurikulum.",
        ]}
      />
      <LegalSection
        heading="5. Harta intelek platform"
        points={[
          "Perisian, reka bentuk dan jenama Pixelspace AI Classroom adalah milik Pixelspace.",
          "Ikon 3D digunakan dengan atribusi kepada Thiings (thiings.co).",
        ]}
      />
      <LegalSection
        heading="6. Ketersediaan dan had liabiliti"
        points={[
          "Perkhidmatan disediakan \"sebagaimana adanya\". Kami berusaha memastikan ketersediaan tetapi tidak menjamin perkhidmatan tanpa gangguan.",
          "Setakat yang dibenarkan undang-undang, kami tidak bertanggungjawab atas kerugian tidak langsung yang timbul daripada penggunaan platform.",
        ]}
      />
      <LegalSection
        heading="7. Perubahan dan undang-undang"
        points={[
          "Kami boleh mengemas kini terma ini; penggunaan berterusan selepas perubahan bermakna anda menerima terma baharu.",
          "Terma ini tertakluk kepada undang-undang Malaysia.",
          "Sebarang pertanyaan: hello@pixelspace.com.my",
        ]}
      />
    </LegalPage>
  );
}
