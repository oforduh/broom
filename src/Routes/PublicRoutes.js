import { useState } from "react";
import styles from "./publicRoutes.module.scss";

export default function PublicRoute({ children }) {
  const [navOpen, setnavOpen] = useState(false);
  return (
    <>
      <aside
        className={
          navOpen
            ? `${styles.componentAside} ${styles.active}`
            : `${styles.componentAside}`
        }
      >
        {children}
      </aside>
    </>
  );
}
