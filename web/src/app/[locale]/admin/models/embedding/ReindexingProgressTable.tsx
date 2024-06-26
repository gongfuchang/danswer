import {useTranslations} from "next-intl";
import { PageSelector } from "@/components/PageSelector";
import { CCPairStatus, IndexAttemptStatus } from "@/components/Status";
import { ConnectorIndexingStatus, ValidStatuses } from "@/lib/types";
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@tremor/react";
import Link from "next/link";
import { useState } from "react";
import { FiMaximize2 } from "react-icons/fi";

export function ReindexingProgressTable({
  reindexingProgress,
}: {
  reindexingProgress: ConnectorIndexingStatus<any, any>[];
}) {
  const t = useTranslations("admin_models_embedding_ReindexingProgressTable");
  const numToDisplay = 10;
  const [page, setPage] = useState(1);

  return (
    <div>
      <Table>
        <TableHead>
          <TableRow>
            <TableHeaderCell>{t("Connector_Name")}</TableHeaderCell>
            <TableHeaderCell>{t("Status")}</TableHeaderCell>
            <TableHeaderCell>{t("Docs_Reindexed")}</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {reindexingProgress
            .slice(numToDisplay * (page - 1), numToDisplay * page)
            .map((reindexingProgress) => {
              return (
                <TableRow key={reindexingProgress.name}>
                  <TableCell>
                    <Link
                      href={`/admin/connector/${reindexingProgress.cc_pair_id}`}
                      className="text-link cursor-pointer flex"
                    >
                      <FiMaximize2 className="my-auto mr-1" />
                      {reindexingProgress.name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    {reindexingProgress.latest_index_attempt?.status && (
                      <IndexAttemptStatus
                        status={reindexingProgress.latest_index_attempt.status}
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    {reindexingProgress?.latest_index_attempt
                      ?.total_docs_indexed || "-"}
                  </TableCell>
                </TableRow>
              );
            })}
        </TableBody>
      </Table>

      <div className="mt-3 flex">
        <div className="mx-auto">
          <PageSelector
            totalPages={Math.ceil(reindexingProgress.length / numToDisplay)}
            currentPage={page}
            onPageChange={(newPage) => setPage(newPage)}
          />
        </div>
      </div>
    </div>
  );
}
