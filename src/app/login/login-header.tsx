import layoutStyles from "@/components/auth/auth-layout.module.css";

export function LoginHeader() {
  return (
    <div>
      <h1>Selamat kembali! <span className={layoutStyles.wave} role="img" aria-label="Hai">👋</span></h1>
      <p className={layoutStyles.formSubtitle}>Log masuk untuk meneruskan sesi anda.</p>
    </div>
  );
}
