import {useTranslations} from "next-intl";
import { Quote } from "@/lib/search/interfaces";
import { ResponseSection, StatusOptions } from "./ResponseSection";
import ReactMarkdown from "react-markdown";

const TEMP_STRING = "__$%^TEMP$%^__";

function replaceNewlines(answer: string) {
  // Since the one-shot answer is a JSON, GPT adds extra backslashes to the
  // newlines. This function replaces the extra backslashes with the correct
  // number of backslashes so that ReactMarkdown can render the newlines

  // Step 1: Replace '\\\\n' with a temporary placeholder
  answer = answer.replace(/\\\\n/g, TEMP_STRING);

  // Step 2: Replace '\\n' with '\n'
  answer = answer.replace(/\\n/g, "\n");

  // Step 3: Replace the temporary placeholder with '\\n'
  answer = answer.replace(TEMP_STRING, "\\n");

  return answer;
}

interface AnswerSectionProps {
  answer: string | null;
  quotes: Quote[] | null;
  error: string | null;
  nonAnswerableReason: string | null;
  isFetching: boolean;
}

export const AnswerSection = (props: AnswerSectionProps) => {
  const t = useTranslations("components_search_results_AnswerSection");
  let status = "in-progress" as StatusOptions;
  let header = <>{t("Building_Answer")}</>;
  let body = null;

  // finished answer
  if (props.quotes !== null || !props.isFetching) {
    status = "success";
    header = <>{t("AI_Answer")}</>;
    if (props.answer) {
      body = (
        <ReactMarkdown className="prose text-sm max-w-full">
          {replaceNewlines(props.answer)}
        </ReactMarkdown>
      );
    } else {
      body = <div>{t("Information_Not_Found")}</div>;
    }
    // error while building answer (NOTE: if error occurs during quote generation
    // the above if statement will hit and the error will not be displayed)
  } else if (props.error) {
    status = "failed";
    header = <>{t("Error_Building_Answer")}</>;
    body = (
      <div className="flex">
        <div className="text-error my-auto ml-1">{props.error}</div>
      </div>
    );
    // answer is streaming
  } else if (props.answer) {
    status = "success";
    header = <>{t("AI_Answer")}</>;
    body = (
      <ReactMarkdown className="prose text-sm max-w-full">
        {replaceNewlines(props.answer)}
      </ReactMarkdown>
    );
  }
  if (props.nonAnswerableReason) {
    status = "warning";
    header = <>{t("Building_Best_Effort_AI_Answer")}</>;
  }

  return (
    <ResponseSection
      status={status}
      header={
        <div className="flex">
          <div className="ml-2 text-strong">{header}</div>
        </div>
      }
      body={
        <div className="">
          {body}
          {props.nonAnswerableReason && !props.isFetching && (
            <div className="mt-4 text-sm">
              <b className="font-medium">{t("Warning")}:</b> {t("AI_Not_Answerable_Message")}{" "}
              <div className="italic mt-1 ml-2">
                {props.nonAnswerableReason}
              </div>
            </div>
          )}
        </div>
      }
      desiredOpenStatus={true}
      isNotControllable={true}
    />
  );
}