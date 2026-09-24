"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Search, X, ArrowUpRight } from "lucide-react";

const navigation = [
  { number: "01", label: "Home", href: "/" },
  { number: "02", label: "Writing", href: "/writing" },
  { number: "03", label: "Poems", href: "/poems" },
  { number: "04", label: "Stories", href: "/stories" },
  { number: "05", label: "About", href: "/about" },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  const pathname = usePathname();

  function closeMenu() {
    setMenuOpen(false);
  }

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
      <header className="site-header">
        <div className="header-inner">
          <Link href="/" className="site-logo" onClick={closeMenu}>
            Her Journal
          </Link>

          {/* DESKTOP NAVIGATION */}

          <nav className="main-nav" aria-label="Main navigation">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={pathname === item.href ? "nav-active" : ""}
              >
                {item.label}
              </Link>
            ))}

            <Link
              href="/search"
              className={`search-link ${
                pathname === "/search" ? "nav-active" : ""
              }`}
              aria-label="Search the journal"
            >
              <Search size={17} strokeWidth={1.5} />
            </Link>
          </nav>

          {/* MOBILE BUTTON */}

          <button
            type="button"
            className="mobile-menu-button"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
          >
            <span>Menu</span>

            <Menu size={19} strokeWidth={1.3} />
          </button>
        </div>
      </header>

      {/* ====================================
          MOBILE MENU
      ==================================== */}

      <div
        className={`mobile-menu ${menuOpen ? "mobile-menu-open" : ""}`}
        aria-hidden={!menuOpen}
      >
        <div className="mobile-menu-inner">
          {/* TOP */}

          <div className="mobile-menu-header">
            <Link href="/" className="mobile-menu-logo" onClick={closeMenu}>
              Her Journal
            </Link>

            <button
              type="button"
              className="mobile-menu-close"
              onClick={closeMenu}
              aria-label="Close menu"
            >
              <span>Close</span>

              <X size={19} strokeWidth={1.3} />
            </button>
          </div>

          {/* LINKS */}

          <nav
            id="mobile-navigation"
            className="mobile-navigation"
            aria-label="Mobile navigation"
          >
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMenu}
                className={pathname === item.href ? "mobile-nav-active" : ""}
              >
                <span>{item.number}</span>

                <strong>{item.label}</strong>

                <ArrowUpRight size={18} strokeWidth={1.1} />
              </Link>
            ))}
          </nav>

          {/* SEARCH */}

          <div className="mobile-menu-search">
            <Link href="/search" onClick={closeMenu}>
              <div>
                <Search size={15} strokeWidth={1.3} />

                <span>Search the journal</span>
              </div>

              <ArrowUpRight size={16} strokeWidth={1.2} />
            </Link>
          </div>

          {/* BOTTOM */}

          <div className="mobile-menu-footer">
            <span>Stories, poems & little pieces of life.</span>

            <span className="mobile-menu-mark">✦</span>
          </div>
        </div>
      </div>
    </>
  );
}
