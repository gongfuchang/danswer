import { getTranslations } from "next-intl/server";
import { Header } from "@/components/Header";
import { AdminSidebar } from "@/components/admin/connectors/AdminSidebar";
import {
  NotebookIcon,
  KeyIcon,
  UsersIcon,
  ThumbsUpIcon,
  BookmarkIcon,
  CPUIcon,
  ZoomInIcon,
  RobotIcon,
  ConnectorIcon,
  SlackIcon
} from "@/components/icons/icons";
import { User } from "@/lib/types";
import {
  AuthTypeMetadata,
  getAuthTypeMetadataSS,
  getCurrentUserSS,
} from "@/lib/userSS";
import { redirect } from "next/navigation";
import { FiCpu, FiLayers, FiPackage, FiSlack, FiMessageSquare, FiSearch, FiHelpCircle, FiPocket,FiDollarSign,FiSettings,FiTrello ,FiShoppingBag ,FiCode    } from "react-icons/fi";
import { BsRobot } from "react-icons/bs";
export async function Layout({ children }: { children: React.ReactNode }) {
  const t = await getTranslations("components_admin_Layout");
  const tasks = [getAuthTypeMetadataSS(), getCurrentUserSS()];

  // catch cases where the backend is completely unreachable here
  // without try / catch, will just raise an exception and the page
  // will not render
  let results: (User | AuthTypeMetadata | null)[] = [null, null];
  try {
    results = await Promise.all(tasks);
  } catch (e) {
    console.log(`Some fetch failed for the main search page - ${e}`);
  }

  const authTypeMetadata = results[0] as AuthTypeMetadata | null;
  const user = results[1] as User | null;

  const authDisabled = authTypeMetadata?.authType === "disabled";
  const requiresVerification = authTypeMetadata?.requiresVerification;
  if (!authDisabled) {
    if (!user) {
      return redirect("/auth/login");
    }
    if (user.role !== "admin") {
      return redirect("/");
    }
    if (!user.is_verified && requiresVerification) {
      return redirect("/auth/waiting-on-verification");
    }
  }
  const sections = {
    "Knowledge_Mmgt": [
      {
        name: "Knowledge_Unit",
        link: "/admin/indexing/status",
        icon: <NotebookIcon size={18} />,
      },
      {
        name: "Document_Sets",
        link: "/admin/documents/sets",
        icon: <BookmarkIcon size={18} />,
      },
      {
        name: "Document_Explorer",
        link: "/admin/documents/explorer",
        icon: <ZoomInIcon size={18} />,
      }, 
    ],
    "Knowledge_Operation": [
      {
        name: "Chat",
        link: "/admin/chat",
        icon: <FiMessageSquare size={18} />,
      },
      {
        name: "Search",
        link: "/admin/search",
        icon: <FiSearch size={18} />,
      },
      {
        name: "Custom_Assistants",
        link: "/admin/personas",
        icon: <RobotIcon size={18} />,
      },      
      {
        name: "Feedback_Answer",
        link: "/admin/qa/feedback",
        icon: <ThumbsUpIcon size={18} />,
      },
      {
        name: "Feedback_Doc",
        link: "/admin/documents/feedback",
        icon: <ThumbsUpIcon size={18} />,
      },      
    ],
    "FAQ_Mgmt": [
      {
        name: "FAQ_List",
        link: "/admin/faq",
        icon: <FiTrello size={18} />,
      },
      {
        name: "QA_Mgmt",
        link: "/admin/qa",
        icon: <FiHelpCircle size={18} />,
      },
    ],
    "Integration": [
      {
        name: "Apache_Answer",
        link: "/admin/integration/apache-answer",
        icon: <FiCode size={18} />,
      },
      {
        name: "Dingding_Bots",
        link: "/admin/integration/dingding",
        icon: <BsRobot size={18} />,
      },
      {
        name: "Slack_Bots",
        link: "/admin/bot",
        icon: <FiSlack size={18} />,
      },
    ],
    "Model_Mgmt": [
      {
        name: "API_Key",
        link: "/admin/keys/openai",
        icon: <FiCpu size={18} />,
      },
      {
        name: "Embedding",
        link: "/admin/models/embedding",
        icon: <FiPackage size={18} />,
      },
    ],
    "Accounting": [
      {
        name: "Accounting_Overview",
        link: "/admin/accounting",
        icon: <FiDollarSign size={18} />,
      },
      {
        name: "Accounting_Detail",
        link: "/admin/accounting/detail",
        icon: <FiPocket size={18} />,
      },
      {
        name: "User_Plan",
        link: "/admin/accounting/plan",
        icon: <FiShoppingBag size={18} />,
      },
    ],
    "System_Mgmt": [
      {
        name: "Users",
        link: "/admin/users",
        icon: <UsersIcon size={18} />,
      },
      {
        name: "System_Logs",
        link: "/admin/system/logs",
        icon: <FiSearch size={18} />,
      },
    ],
  };
  let collections = [];
  for (const section in sections) {
    const items = sections[section];
    let coll_items = [];
    items.forEach((item) => {
      coll_items.push({
        name: (
          <div className="flex">
            {item["icon"]}
            <div className="ml-1">{t(item["name"])}</div>
          </div>
        ),
        link: item["link"],
      });
    });
    collections.push({ name: t(section), items: coll_items});
  }
 
  return (
    <div className="h-screen overflow-y-hidden">
      <div className="absolute top-0 z-50 w-full">
        <Header user={user} />
      </div>
      <div className="flex h-full pt-16">
        <div className="w-80 pt-6 pb-8 h-full border-r border-border">
          <AdminSidebar
            collections={collections}
          />
        </div>
        <div className="h-full overflow-y-auto w-full px-4">
          {children}
        </div>
      </div>
    </div>
  );
}
