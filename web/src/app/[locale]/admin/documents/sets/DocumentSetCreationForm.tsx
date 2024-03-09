import {useTranslations} from "next-intl";
import { ArrayHelpers, FieldArray, Form, Formik } from "formik";
import * as Yup from "yup";
import { PopupSpec } from "@/components/admin/connectors/Popup";
import { createDocumentSet, updateDocumentSet } from "./lib";
import { ConnectorIndexingStatus, DocumentSet } from "@/lib/types";
import { TextFormField } from "@/components/admin/connectors/Field";
import { ConnectorTitle } from "@/components/admin/connectors/ConnectorTitle";
import { Button } from "@tremor/react";

interface SetCreationPopupProps {
  ccPairs: ConnectorIndexingStatus<any, any>[];
  onClose: () => void;
  setPopup: (popupSpec: PopupSpec | null) => void;
  existingDocumentSet?: DocumentSet;
}

export const DocumentSetCreationForm = ({
  ccPairs,
  onClose,
  setPopup,
  existingDocumentSet,
}: SetCreationPopupProps) => {
  const t = useTranslations("admin_documents_sets_DocumentSetCreationForm");
  const isUpdate = existingDocumentSet !== undefined;

  return (
    <div>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        onClick={onClose}
      >
        <div
          className="bg-background p-6 rounded border border-border shadow-lg relative w-1/2 text-sm"
          onClick={(event) => event.stopPropagation()}
        >
          <Formik
            initialValues={{
              name: existingDocumentSet ? existingDocumentSet.name : "",
              description: existingDocumentSet
                ? existingDocumentSet.description
                : "",
              ccPairIds: existingDocumentSet
                ? existingDocumentSet.cc_pair_descriptors.map(
                    (ccPairDescriptor) => {
                      return ccPairDescriptor.id;
                    }
                  )
                : ([] as number[]),
            }}
            validationSchema={Yup.object().shape({
              name: Yup.string().required(t("Enter_Set_Name")),
              description: Yup.string().required(
                  t("Enter_Set_Desc")
            ),
              ccPairIds: Yup.array()
                .of(Yup.number().required())
                .required(t("Select_One_Connector")),
            })}
            onSubmit={async (values, formikHelpers) => {
              formikHelpers.setSubmitting(true);
              let response;
              if (isUpdate) {
                response = await updateDocumentSet({
                  id: existingDocumentSet.id,
                  ...values,
                });
              } else {
                response = await createDocumentSet(values);
              }
              formikHelpers.setSubmitting(false);
              if (response.ok) {
                setPopup({
                  message: isUpdate
                    ? t("Update_Success_Message")
                    : t("Create_Success_Message"),
                  type: "success",
                });
                onClose();
              } else {
                const errorMsg = await response.text();
                setPopup({
                  message: isUpdate
                    ? `${t("Update_Error_Prefix")} - ${errorMsg}`
                    : `${t("Create_Error_Prefix")} - ${errorMsg}`,
                  type: "error",
                });
              }
            }}
          >
            {({ isSubmitting, values }) => (
              <Form>
                <h2 className="text-lg text-emphasis font-bold mb-3">
                  {isUpdate
                    ? t("Update_Document_Set")
                    : t("Create_New_Document_Set")}
                </h2>
                <TextFormField
                  name="name"
                  label={t("Name_Label")}
                  placeholder={t("Name_Placeholder")}
                  disabled={isUpdate}
                  autoCompleteDisabled={true}
                />
                <TextFormField
                  name="description"
                  label={t("Description")}
                  placeholder={t("Describe_Document_Set")}
                  autoCompleteDisabled={t("Auto_Complete_Disabled")}
                />
                <h2 className="mb-1 font-medium text-base">
                  {t("Pick_Connectors")}
                </h2>
                <p className="mb-3 text-xs">
                  {t("Pick_Connectors_Description")}
                </p>
                <FieldArray
                  name="ccPairIds"
                  render={(arrayHelpers: ArrayHelpers) => (
                    <div className="mb-3 flex gap-2 flex-wrap">
                      {ccPairs.map((ccPair) => {
                        const ind = values.ccPairIds.indexOf(ccPair.cc_pair_id);
                        let isSelected = ind !== -1;
                        return (
                          <div
                            key={`${ccPair.connector.id}-${ccPair.credential.id}`}
                            className={
                              `
                              px-3 
                              py-1
                              rounded-lg 
                              border
                              border-border 
                              w-fit 
                              flex 
                              cursor-pointer ` +
                              (isSelected
                                ? " bg-background-strong"
                                : " hover:bg-hover")
                            }
                            onClick={() => {
                              if (isSelected) {
                                arrayHelpers.remove(ind);
                              } else {
                                arrayHelpers.push(ccPair.cc_pair_id);
                              }
                            }}
                          >
                            <div className="my-auto">
                              <ConnectorTitle
                                connector={ccPair.connector}
                                ccPairId={ccPair.cc_pair_id}
                                ccPairName={ccPair.name}
                                isLink={false}
                                showMetadata={false}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                />
                <div className="flex">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-64 mx-auto"
                  >
                    {isUpdate ? t("Update_Button") : t("Create_Button")}
                  </Button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
};
