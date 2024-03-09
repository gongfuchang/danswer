"use client";

import {useTranslations} from "next-intl";
import {
  Table,
  TableHead,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
  Button,
} from "@tremor/react";
import { LoadingAnimation } from "@/components/Loading";
import { AdminPageTitle } from "@/components/admin/Title";
import { usePopup } from "@/components/admin/connectors/Popup";
import { UsersIcon } from "@/components/icons/icons";
import { fetcher } from "@/lib/fetcher";
import { User } from "@/lib/types";
import useSWR, { mutate } from "swr";

const UsersTable = () => {
  const { popup, setPopup } = usePopup();

  const {
    data: users,
    isLoading,
    error,
  } = useSWR<User[]>("/api/manage/users", fetcher);

  const t = useTranslations("admin_users_page");

  if (isLoading) {
    return <LoadingAnimation text={t("Loading")} />;
  }

  if (error || !users) {
    return <div className="text-error">Error loading users</div>;
  }

  return (
    <div>
      {popup}

      <Table className="overflow-visible">
        <TableHead>
          <TableRow>
            <TableHeaderCell>{t("Email")}</TableHeaderCell>
            <TableHeaderCell>{t("Role")}</TableHeaderCell>
            <TableHeaderCell>
              <div className="flex">
                <div className="ml-auto">{t("Promote")}</div>
              </div>
            </TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((user) => {
            return (
              <TableRow key={user.id}>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <i>{user.role === "admin" ? t("Admin") : t("User")}</i>
                </TableCell>
                <TableCell>
                  <div className="flex">
                    <div className="ml-auto">
                      <Button
                        onClick={async () => {
                          const res = await fetch(
                            "/api/manage/promote-user-to-admin",
                            {
                              method: "PATCH",
                              headers: {
                                "Content-Type": "application/json",
                              },
                              body: JSON.stringify({
                                user_email: user.email,
                              }),
                            }
                          );
                          if (!res.ok) {
                            const errorMsg = await res.text();
                            setPopup({
                              message: t("Failed_Promote_User", {errorMsg: errorMsg}),
                              type: "error",
                            });
                          } else {
                            mutate("/api/manage/users");
                            setPopup({
                              message: t("Promote_User"),
                              type: "success",
                            });
                          }
                        }}
                      >
                        {t("Promote_Admin_Button")}
                      </Button>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

const Page = () => {
  const t = useTranslations("admin_users_page");
  return (
    <div className="mx-auto container">
      <AdminPageTitle title={t("Manage_Users")} icon={<UsersIcon size={32} />} />

      <UsersTable />
    </div>
  );
};

export default Page;
