export const updateBoost = async (documentId: string, boost: number) => {
  const t = useTranslations("admin_documents_lib");
  const response = await fetch("/api/manage/admin/doc-boosts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      document_id: documentId,
      boost,
    }),
  });
  if (response.ok) {
    return null;
  }
  const responseJson = await response.json();
  return responseJson.message || responseJson.detail || t("Unknown_error");
};

export const updateHiddenStatus = async (
  documentId: string,
  isHidden: boolean
) => {
  const response = await fetch("/api/manage/admin/doc-hidden", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      document_id: documentId,
      hidden: isHidden,
    }),
  });
  return response;
};
