import { useTranslations } from "next-intl";
import { Button } from "@tremor/react";
import {
  ArrayHelpers,
  ErrorMessage,
  Field,
  FieldArray,
  useField,
  useFormikContext,
} from "formik";
import * as Yup from "yup";
import { FormBodyBuilder } from "./types";
import { DefaultDropdown, StringOrNumberOption } from "@/components/Dropdown";
import { FiPlus, FiX } from "react-icons/fi";

export function SectionHeader({
  children,
}: {
  children: string | JSX.Element;
}) {
  return <div className="mb-4 font-bold text-lg">{children}</div>;
}

export function Label({ children }: { children: string | JSX.Element }) {
  return <div className="block font-medium text-base">{children}</div>;
}

export function SubLabel({ children }: { children: string | JSX.Element }) {
  return <div className="text-sm text-subtle mb-2">{children}</div>;
}

export function ManualErrorMessage({ children }: { children: string }) {
  return <div className="text-error text-sm mt-1">{children}</div>;
}

export function TextFormField({
  name,
  label,
  subtext,
  placeholder,
  onChange,
  type = "text",
  isTextArea = false,
  disabled = false,
  autoCompleteDisabled = true,
  error,
}: {
  name: string;
  label: string;
  subtext?: string | JSX.Element;
  placeholder?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  isTextArea?: boolean;
  disabled?: boolean;
  autoCompleteDisabled?: boolean;
  error?: string;
}) {
  return (
    <div className="mb-4">
      <Label>{label}</Label>
      {subtext && <SubLabel>{subtext}</SubLabel>}
      <Field
        as={isTextArea ? "textarea" : "input"}
        type={type}
        name={name}
        id={name}
        className={
          `
        border 
        border-border 
        rounded 
        w-full 
        py-2 
        px-3 
        mt-1
        ${isTextArea ? " h-28" : ""}
      ` + (disabled ? " bg-background-strong" : " bg-background-emphasis")
        }
        disabled={disabled}
        placeholder={placeholder}
        autoComplete={autoCompleteDisabled ? "off" : undefined}
        {...(onChange ? { onChange } : {})}
      />
      {error ? (
        <ManualErrorMessage>{error}</ManualErrorMessage>
      ) : (
        <ErrorMessage
          name={name}
          component="div"
          className="text-red-500 text-sm mt-1"
        />
      )}
    </div>
  );
}

interface BooleanFormFieldProps {
  name: string;
  label: string;
  subtext?: string | JSX.Element;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const BooleanFormField = ({
  name,
  label,
  subtext,
  onChange,
}: BooleanFormFieldProps) => {
  return (
    <div className="mb-4">
      <label className="flex text-sm">
        <Field
          name={name}
          type="checkbox"
          className="mx-3 px-5 w-3.5 h-3.5 my-auto"
          {...(onChange ? { onChange } : {})}
        />
        <div>
          <Label>{label}</Label>
          {subtext && <SubLabel>{subtext}</SubLabel>}
        </div>
      </label>

      <ErrorMessage
        name={name}
        component="div"
        className="text-red-500 text-sm mt-1"
      />
    </div>
  );
};

interface TextArrayFieldProps<T extends Yup.AnyObject> {
  name: string;
  label: string | JSX.Element;
  values: T;
  subtext?: string | JSX.Element;
  type?: string;
}

export function TextArrayField<T extends Yup.AnyObject>({
  name,
  label,
  values,
  subtext,
  type,
}: TextArrayFieldProps<T>) {
  const t = useTranslations("components_admin_connectors_Field");
  return (
    <div className="mb-4">
      <Label>{label}</Label>
      {subtext && <SubLabel>{subtext}</SubLabel>}

      <FieldArray
        name={name}
        render={(arrayHelpers: ArrayHelpers) => (
          <div>
            {values[name] &&
              values[name].length > 0 &&
              (values[name] as string[]).map((_, index) => (
                <div key={index} className="mt-2">
                  <div className="flex">
                    <Field
                      type={type}
                      name={`${name}.${index}`}
                      id={name}
                      className={`
                      border 
                      border-border 
                      bg-background 
                      rounded 
                      w-full 
                      py-2 
                      px-3 
                      mr-4
                      `}
                      // Disable autocomplete since the browser doesn't know how to handle an array of text fields
                      autoComplete="off"
                    />
                    <div className="my-auto">
                      <FiX
                        className="my-auto w-10 h-10 cursor-pointer hover:bg-hover rounded p-2"
                        onClick={() => arrayHelpers.remove(index)}
                      />
                    </div>
                  </div>
                  <ErrorMessage
                    name={`${name}.${index}`}
                    component="div"
                    className="text-error text-sm mt-1"
                  />
                </div>
              ))}

            <Button
              onClick={() => {
                arrayHelpers.push("");
              }}
              className="mt-3"
              color="green"
              size="xs"
              type="button"
              icon={FiPlus}
            >
              {t("Add_New_Button")}
            </Button>
          </div>
        )}
      />
    </div>
  );
}

interface TextArrayFieldBuilderProps<T extends Yup.AnyObject> {
  name: string;
  label: string;
  subtext?: string;
  type?: string;
}

export function TextArrayFieldBuilder<T extends Yup.AnyObject>(
  props: TextArrayFieldBuilderProps<T>
): FormBodyBuilder<T> {
  const _TextArrayField: FormBodyBuilder<T> = (values) => (
    <TextArrayField {...props} values={values} />
  );
  return _TextArrayField;
}

interface SelectorFormFieldProps {
  name: string;
  label?: string;
  options: StringOrNumberOption[];
  subtext?: string | JSX.Element;
  includeDefault?: boolean;
}

export function SelectorFormField({
  name,
  label,
  options,
  subtext,
  includeDefault = false,
}: SelectorFormFieldProps) {
  const [field] = useField<string>(name);
  const { setFieldValue } = useFormikContext();

  return (
    <div className="mb-4">
      {label && <Label>{label}</Label>}
      {subtext && <SubLabel>{subtext}</SubLabel>}

      <div className="mt-2">
        <DefaultDropdown
          options={options}
          selected={field.value}
          onSelect={(selected) => setFieldValue(name, selected)}
          includeDefault={includeDefault}
        />
      </div>

      <ErrorMessage
        name={name}
        component="div"
        className="text-red-500 text-sm mt-1"
      />
    </div>
  );
}
