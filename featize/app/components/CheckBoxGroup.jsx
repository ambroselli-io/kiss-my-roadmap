import { useSearchParams } from "@remix-run/react";
import { useState } from "react";
import Required from "./Required";

const CheckBox = ({ name, value, label, children, className = "", initAnswers = [] }) => {
  const [searchParams] = useSearchParams();
  const checkedValues = initAnswers?.length ? initAnswers : searchParams.getAll(name);
  return (
    <label className="w-full">
      <input
        type="checkbox"
        name={name}
        value={value}
        id={value}
        className="peer hidden w-0"
        defaultChecked={checkedValues.includes(value)}
      />
      <div
        className={`cursor-pointer rounded-lg border border-app bg-white px-2 py-1 text-app peer-checked:bg-app peer-checked:text-white ${className}`}
        dangerouslySetInnerHTML={{ __html: label }}
      />
      {children}
    </label>
  );
};

/*
options: [
  {
    value:
    label:
  }
]
*/
const CheckBoxGroup = ({
  name,
  options,
  legend = null,
  className = "",
  required = false,
  withOther = false,
  initAnswers = [],
}) => {
  const [otherValue, setOtherValue] = useState(() =>
    initAnswers.includes("other") ? { target: { value: "other" } } : null
  );

  return (
    <>
      <fieldset className={`flex w-full flex-wrap gap-2  ${className}`}>
        {!!legend && (
          <legend className="mb-2 flex-shrink-0 basis-full">
            {legend}
            {required && <Required />}
          </legend>
        )}
        {options.map(({ value, label }) => (
          <CheckBox
            key={value}
            name={name}
            value={value}
            label={label}
            initAnswers={initAnswers}
          />
        ))}
        {!!withOther && (
          <CheckBox
            name={name}
            value="other"
            label="Autre"
            className="peer-checked:hidden"
            initAnswers={initAnswers}
          >
            <textarea
              name={name}
              placeholder="Vous pensez à autre chose ? Vous pouvez l'indiquer ici"
              row="1"
              id="other"
              onChange={setOtherValue}
              defaultValue={
                initAnswers.includes("other") ? initAnswers[initAnswers.length - 1] : ""
              }
              className={`hidden w-full cursor-pointer rounded-lg border border-app bg-white px-2 py-1 text-app placeholder:opacity-60 peer-checked:block ${
                otherValue?.target?.value.length ? "bg-app text-white" : ""
              } focus:!bg-white focus:!text-app`}
            />
          </CheckBox>
        )}
      </fieldset>
    </>
  );
};

export default CheckBoxGroup;
