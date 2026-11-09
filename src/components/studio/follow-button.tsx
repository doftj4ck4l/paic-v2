"use client";

import { UserPlus, UserRoundCheck } from "lucide-react";
import { toggleFollow, useSocial } from "@/lib/demo-social";
import styles from "./follow-button.module.css";

export function FollowButton({
  studentId,
  size = "default",
}: {
  studentId: string;
  size?: "default" | "small";
}) {
  const { followed } = useSocial();
  const following = followed.includes(studentId);
  return (
    <button
      type="button"
      onClick={() => toggleFollow(studentId)}
      aria-pressed={following}
      data-following={following}
      data-size={size}
      className={styles.follow}
    >
      {following ? <UserRoundCheck aria-hidden="true" /> : <UserPlus aria-hidden="true" />}
      {following ? "Mengikuti" : "Ikut"}
    </button>
  );
}
