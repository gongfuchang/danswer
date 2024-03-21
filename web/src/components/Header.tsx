"use client";

import {useTranslations} from "next-intl";
import { User } from "@/lib/types";
import { logout } from "@/lib/user";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { CustomDropdown, DefaultDropdownElement } from "./Dropdown";
import { FiMessageSquare, FiSearch } from "react-icons/fi";
import { usePathname } from "next/navigation";
import { HiLanguage } from "react-icons/hi2";

interface HeaderProps {
  user: User | null;
}

export const Header: React.FC<HeaderProps> = ({ user }) => {
  const t = useTranslations("components_Header");
  const router = useRouter();
  const pathname = usePathname();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    const response = await logout();
    if (!response.ok) {
      alert(t("Failed_Logout_Message"));
    }
    // disable auto-redirect immediately after logging out so the user
    // is not immediately re-logged in
    router.push("/auth/login?disableAutoRedirect=true");
  };

  // When dropdownOpen state changes, it attaches/removes the click listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener("click", handleClickOutside);
    } else {
      document.removeEventListener("click", handleClickOutside);
    }

    // Clean up function to remove listener when component unmounts
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [dropdownOpen]);

  const baseClsName = "relative flex items-center justify-center rounded-full border-[0.5px] border-stroke bg-gray-200 hover:text-primary";
  const linkClsName = baseClsName + ' px-2 py-2';
  const userName = user && user.email ? user.email.split('@')[0] : "Anonymous";
  const userNameDisplay = userName.charAt(0).toUpperCase() + userName.slice(1)
  return (
    <header className="border-b border-border bg-background-emphasis">
      <div className="mx-8 flex h-16">
        <Link className="py-4" href="/search">
          <div className="flex">
            <div className="h-[160px] w-[71px]">
              <Image src="/logo-banner.png" alt="Logo" width="1419" height="1520" />
            </div>
          </div>
        </Link>

        <div className="flex items-center gap-3 2xsm:gap-7 ml-auto">
          <ul className="flex items-center gap-2 2xsm:gap-4">
          <li className="relative">
              <Link href="#" className={linkClsName} title={t("Switch_Lanauge")}  
                onClick={() => {
                  // get the current locale from url which contains /en-US/path or /zh-CN/path
                  const url = window.document.URL;
                  if (!url.includes('/en-US') && !url.includes('/zh-CN')) {
                    // if the url does not contain any locale, redirect to the default locale
                    router.push('/zh-CN/admin');
                    return;
                  }
                  const currentLocale = url.includes('/en-US') ? 'en-US' : 'zh-CN';
                  const newLocale = currentLocale === 'en-US' ? 'zh-CN' : 'en-US';
                  const newPath = url.replace(`/${currentLocale}`, `/${newLocale}`);

                  // redirect to the new locale
                  // router.replace(newPath);
                  window.location.href = newPath;
                }}>
                <HiLanguage />
              </Link>
            </li>            
            <li className="relative">
              <Link href="/search" className={linkClsName} title={t("Search")}>
                <FiSearch />
              </Link>
            </li>
            <li className="relative">
              <Link href="/chat" className={linkClsName} title={t("Chat")}>
                <FiMessageSquare />
              </Link>
            </li>                
          </ul>
          <div className="relative cursor-pointer">
            <CustomDropdown
                dropdown={
                  <div
                    className={
                      "absolute right-0 mt-2 bg-background rounded border border-border " +
                      "w-48 overflow-hidden shadow-xl z-10 text-sm"
                    }
                  >
                    {/* Show connector option if (1) auth is disabled or (2) user is an admin */}
                    {(!user || user.role === "admin") && (
                      <Link href="/admin/indexing/status">
                        <DefaultDropdownElement name={t("Admin_Panel")} />
                      </Link>
                    )}
                    {user && (
                      <DefaultDropdownElement
                        name={t("Logout")}
                        onSelect={handleLogout}
                      />
                    )}
                  </div>
                }
              >
              <span className="flex items-center gap-4">
                <span className="hidden text-right lg:block">
                  <span className="block text-sm font-medium text-black dark:text-white">
                    {userNameDisplay}
                  </span>
                  <span className="block text-xs font-medium">Admin</span>
                </span>
                <span className={baseClsName}>
                  <Image src={`/avator-${Math.floor(Math.random() * 3)}.png`} alt="User" width={50} height={50} />
                </span>              
              </span>
            </CustomDropdown>        
          </div>
        </div>
      </div>
    </header>
  );
};
