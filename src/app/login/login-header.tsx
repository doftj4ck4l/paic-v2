"use client";

import { useState } from "react";
import { GraduationCap, Info, Presentation } from "lucide-react";
import layoutStyles from "@/components/auth/auth-layout.module.css";
import styles from "@/components/auth/auth-form.module.css";

type Role = "student" | "teacher";

const COPY = {
  student: {
    title: <>Selamat kembali! <span className={layoutStyles.wave} role="img" aria-label="Hai">👋</span></>,
    subtitle: "Log masuk untuk menyambung pembelajaran anda.",
  },
  teacher: {
    title: <>Selamat kembali, cikgu!</>,
    subtitle: "Log masuk untuk menguruskan kelas dan bahan pembelajaran anda.",
  },
} as const;

export function LoginHeader() {
  const [role, setRole] = useState<Role>("student");
  const copy = COPY[role];

  return (
    <div>
      <div className={styles.roleToggle} role="group" aria-label="Jenis akaun">
        <button
          type="button"
          className={styles.roleButton}
          aria-pressed={role === "student"}
          onClick={() => setRole("student")}
        >
          <GraduationCap aria-hidden="true" /> Pelajar
        </button>
        <button
          type="button"
          className={styles.roleButton}
          aria-pressed={role === "teacher"}
          onClick={() => setRole("teacher")}
        >
          <Presentation aria-hidden="true" /> Guru
        </button>
      </div>
      <h1>{copy.title}</h1>
      <p className={layoutStyles.formSubtitle}>{copy.subtitle}</p>
      {role === "teacher" && (
        <p className={styles.teacherNote}>
          <Info aria-hidden="true" />
          Guru kini boleh mendaftar sendiri — pilih opsyen Guru semasa mendaftar.
        </p>
      )}
    </div>
  );
}
