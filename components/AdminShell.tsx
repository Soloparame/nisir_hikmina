"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  LogOut,
  Megaphone,
  Stethoscope,
} from "lucide-react";
import { signOutAdmin } from "../lib/actions/doctors";
import styles from "./AdminShell.module.css";

type Props = {
  children: React.ReactNode;
};

const NAV = [
  { href: "/admin/doctors", label: "Doctors", icon: Stethoscope },
  { href: "/admin/updates", label: "Daily Updates", icon: Megaphone },
];

export default function AdminShell({ children }: Props) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    await signOutAdmin();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <LayoutDashboard size={22} />
          <div>
            <strong>ንስር Admin</strong>
            <span>Dashboard</span>
          </div>
        </div>
        <nav className={styles.nav}>
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`${styles.navLink} ${
                pathname.startsWith(href) ? styles.navActive : ""
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}
        </nav>
        <button type="button" className={styles.signOut} onClick={handleSignOut}>
          <LogOut size={16} />
          Sign out
        </button>
      </aside>
      <main className={styles.main}>{children}</main>
    </div>
  );
}
