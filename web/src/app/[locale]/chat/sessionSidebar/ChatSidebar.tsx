"use client";

import {useTranslations} from "next-intl";
import {
  FiLayout,
  FiLogOut,
  FiMessageSquare,
  FiMoreHorizontal,
  FiPlusSquare,
  FiSearch,
} from "react-icons/fi";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User } from "@/lib/types";
import { logout } from "@/lib/user";
import { BasicClickable, BasicSelectable } from "@/components/BasicClickable";
import { ChatSessionDisplay } from "./SessionDisplay";
import { ChatSession } from "../interfaces";
import { groupSessionsByDateRange } from "../lib";
import {
  HEADER_PADDING,
  NEXT_PUBLIC_NEW_CHAT_DIRECTS_TO_SAME_PERSONA,
} from "@/lib/constants";

interface ChatSidebarProps {
  existingChats: ChatSession[];
  currentChatSession: ChatSession | null | undefined;
  user: User | null;
  embeddedMode: boolean;
}

export const ChatSidebar = ({
  existingChats,
  currentChatSession,
  user,
  embeddedMode,
}: ChatSidebarProps) => {
  const t = useTranslations("chat_sessionSidebar_ChatSidebar");
  const router = useRouter();

  const groupedChatSessions = groupSessionsByDateRange(existingChats);

  const [userInfoVisible, setUserInfoVisible] = useState(false);
  const userInfoRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    logout().then((isSuccess) => {
      if (!isSuccess) {
        alert(t("Failed_Logout"));
      }
      router.push("/auth/login");
    });
  };

  // hides logout popup on any click outside
  const handleClickOutside = (event: MouseEvent) => {
    if (
      userInfoRef.current &&
      !userInfoRef.current.contains(event.target as Node)
    ) {
      setUserInfoVisible(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const currentChatId = currentChatSession?.id;

  // prevent the NextJS Router cache from causing the chat sidebar to not
  // update / show an outdated list of chats
  useEffect(() => {
    router.refresh();
  }, [currentChatId]);

  return (
    <div
      className={`
        w-72
        2xl:w-80
        ${embeddedMode ? '' : HEADER_PADDING}
        border-r 
        border-border 
        flex 
        flex-col 
        h-screen
        transition-transform`}
      id="chat-sidebar"
    >
      <Link
        href={
          embeddedMode ? "/admin/chat" : '/chat' +
          (NEXT_PUBLIC_NEW_CHAT_DIRECTS_TO_SAME_PERSONA && currentChatSession
            ? `?personaId=${currentChatSession.persona_id}`
            : "")
        }
        className="mx-3 mt-5"
      >
        <BasicClickable fullWidth>
          <div className="flex text-sm">
            <FiPlusSquare className="my-auto mr-2" /> {t("New_Chat")}
          </div>
        </BasicClickable>
      </Link>

      <div className="mt-1 pb-1 mb-1 ml-3 overflow-y-auto h-full">
        {Object.entries(groupedChatSessions).map(
          ([dateRange, chatSessions]) => {
            if (chatSessions.length > 0) {
              return (
                <div key={dateRange}>
                  <div className="text-xs text-subtle flex pb-0.5 mb-1.5 mt-5 font-bold">
                    {t(dateRange.replaceAll(" ", "_"))}
                  </div>
                  {chatSessions.map((chat) => {
                    const isSelected = currentChatId === chat.id;
                    return (
                      <div key={chat.id} className="mr-3">
                        <ChatSessionDisplay
                          chatSession={chat}
                          isSelected={isSelected}
                          embeddedMode={embeddedMode}
                        />
                      </div>
                    );
                  })}
                </div>
              );
            }
          }
        )}
        {/* {existingChats.map((chat) => {
          const isSelected = currentChatId === chat.id;
          return (
            <div key={chat.id} className="mr-3">
              <ChatSessionDisplay chatSession={chat} isSelected={isSelected} />
            </div>
          );
        })} */}
      </div>
        {!embeddedMode && (
          <div
          className="mt-auto py-2 border-t border-border px-3"
          ref={userInfoRef}
          >
            <div className="relative text-strong">
              {userInfoVisible && (
                <div
                  className={
                    (user ? "translate-y-[-110%]" : "translate-y-[-115%]") +
                    " absolute top-0 bg-background border border-border z-30 w-full rounded text-strong text-sm"
                  }
                >
                  <Link
                    href="/search"
                    className="flex py-3 px-4 cursor-pointer hover:bg-hover"
                  >
                    <FiSearch className="my-auto mr-2" />
                    {t("Danswer_Search")}
                  </Link>
                  <Link
                    href="/chat"
                    className="flex py-3 px-4 cursor-pointer hover:bg-hover"
                  >
                    <FiMessageSquare className="my-auto mr-2" />
                    {t("Danswer_Chat")}
                  </Link>
                  {(!user || user.role === "admin") && (
                    <Link
                      href="/admin/indexing/status"
                      className="flex py-3 px-4 cursor-pointer border-t border-border hover:bg-hover"
                    >
                      <FiLayout className="my-auto mr-2" />
                      {t("Admin_Panel")}
                    </Link>
                  )}
                  {user && (
                    <div
                      onClick={handleLogout}
                      className="flex py-3 px-4 cursor-pointer border-t border-border rounded hover:bg-hover"
                    >
                      <FiLogOut className="my-auto mr-2" />
                      {t("Log_Out")}
                    </div>
                  )}
                </div>
              )}
              <BasicSelectable fullWidth selected={false}>
                <div
                  onClick={() => setUserInfoVisible(!userInfoVisible)}
                  className="flex h-8"
                >
                  <div className="my-auto mr-2 bg-user rounded-lg px-1.5">
                    {user && user.email ? user.email[0].toUpperCase() : "A"}
                  </div>
                  <p className="my-auto">
                    {user ? user.email : "Anonymous Possum"}
                  </p>
                  <FiMoreHorizontal className="my-auto ml-auto mr-2" size={20} />
                </div>
              </BasicSelectable>
            </div>
          </div>
        )}

    </div>
  );
};
