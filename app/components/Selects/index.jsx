import ReactSelect from "react-select";
import CreatableSelect from "react-select/creatable";
import { useSearchParams } from "@remix-run/react";
import Required from "../Required";
import styles from "./styles.css";
import { ClientOnly } from "remix-utils";
import resolveConfig from "tailwindcss/resolveConfig";
import tailwindConfig from "../../../tailwind.config.cjs/index.js";
import { capitalizeFirstLetter } from "app/services/strings";
const fullConfig = resolveConfig(tailwindConfig);

export const links = () => [{ rel: "stylesheet", href: styles }];

// https://stackoverflow.com/a/5624139/5225096
function hexToRgb(hex, opacity = 1) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return `rgba(${parseInt(result[1], 16)},${parseInt(result[2], 16)},${parseInt(result[3], 16)},${opacity})`;
}
const customTheme = (theme) => ({
  ...theme,
  borderRadius: `0.5rem`,
  colors: {
    ...theme.colors,
    primary: hexToRgb(fullConfig.theme.colors.app, 1),
    primary75: hexToRgb(fullConfig.theme.colors.app, 0.75),
    primary50: hexToRgb(fullConfig.theme.colors.app, 0.5),
    primary25: hexToRgb(fullConfig.theme.colors.app, 0.25),
    neutral: hexToRgb(fullConfig.theme.colors.app, 1.0),
    neutral90: hexToRgb(fullConfig.theme.colors.app, 0.9),
    neutral80: "rgb(17, 24, 39)", //text-black-90
    neutral70: hexToRgb(fullConfig.theme.colors.app, 0.7),
    neutral60: hexToRgb(fullConfig.theme.colors.app, 0.6),
    neutral40: hexToRgb(fullConfig.theme.colors.app, 0.4),
    neutral30: hexToRgb(fullConfig.theme.colors.app, 0.3),
    neutral20: hexToRgb(fullConfig.theme.colors.app, 0.2),
    neutral10: hexToRgb(fullConfig.theme.colors.app, 0.1),
    neutral5: hexToRgb(fullConfig.theme.colors.app, 0.05),
  },
});

const rootCustomStyles = (control = {}) => ({
  placeholder: (provided, state) => ({
    ...provided,
    color: "#9ca3af",
  }),
  control: (provided, state) => ({
    ...provided,
    borderColor: "rgb(209, 213, 219, 1)",
    ...control,
  }),
  valueContainer: (provided, state) => ({
    ...provided,
    padding: "0.625rem",
  }),
  input: (provided, state) => ({
    ...provided,
    margin: 0,
    padding: 0,
  }),
});

const SelectRoot = ({ name, options, defaultValue, form, isCreatable, customStyles, ...props }) => {
  const Component = isCreatable ? CreatableSelect : ReactSelect;
  return (
    <ClientOnly>
      {() => (
        <Component
          defaultValue={defaultValue}
          instanceId={`react-select-${name}`}
          name={name}
          form={form}
          options={options}
          className="w-full"
          classNamePrefix="select"
          theme={customTheme}
          placeholder="Sélectionner..."
          styles={rootCustomStyles(customStyles)}
          formatCreateLabel={(inputValue) => `Créer la catégorie ${capitalizeFirstLetter(inputValue)}`}
          {...props}
        />
      )}
    </ClientOnly>
  );
};

const SelectAutofill = ({
  legend,
  name,
  options,
  onChange,
  form,
  isCreatable,
  className = "",
  required = false,
  ...props
}) => {
  const [searchParams] = useSearchParams();
  const checkedValues = searchParams.getAll(name).map((id) => options.find((opt) => opt.value === id));

  // FIXME: timeout so the Form can consider the new input hidden
  const onChangeRequest = (args) => setTimeout(() => onChange?.(args));

  return (
    <fieldset className={`flex flex-wrap gap-2 ${className}`} suppressHydrationWarning>
      <legend className="mb-2 flex-shrink-0 basis-full">
        {legend}
        {required && <Required />}
      </legend>
      <SelectRoot
        name={name}
        options={options}
        defaultValue={checkedValues}
        onChange={onChangeRequest}
        form={form}
        isCreatable={isCreatable}
        isMulti
        {...props}
      />
    </fieldset>
  );
};

const Select = ({ legend, name, options, onChange, form, className = "", required = false, ...props }) => {
  const [searchParams] = useSearchParams();
  const checkedValues = searchParams.getAll(name).map((id) => options.find((opt) => opt.value === id));

  // FIXME: timeout so the Form can consider the new input hidden
  const onChangeRequest = (args) => setTimeout(() => onChange?.(args));

  return (
    <fieldset className={`flex flex-wrap gap-2 ${className}`} suppressHydrationWarning>
      <legend className="mb-2 flex-shrink-0 basis-full">
        {legend}
        {legend && required && <Required />}
      </legend>
      <SelectRoot
        name={name}
        options={options}
        defaultValue={checkedValues}
        onChange={onChangeRequest}
        form={form}
        {...props}
      />
    </fieldset>
  );
};

const transparentTheme = (theme) => ({
  ...theme,
  borderRadius: 0,
  borderWidth: 0,
});

const transparentCustomStyles = (control = {}) => ({
  placeholder: (provided, state) => ({
    ...provided,
    color: "#9ca3af",
    textAlign: "left",
    padding: "1rem",
  }),
  control: (provided, state) => ({
    ...provided,
    borderWidth: 0,
    backgroundColor: "transparent",
    height: "100%",
    ...control,
  }),
  singleValue: (provided, state) => ({
    ...provided,
    textAlign: "left",
    padding: "1rem",
    margin: 0,
  }),
  option: (provided, state) => ({
    ...provided,
    textAlign: "left",
    padding: "0 0.5rem",
  }),
  valueContainer: (provided, state) => ({
    ...provided,
    padding: 0,
    textAlign: "left",
    height: "100%",
  }),
  indicatorSeparator: (provided, state) => ({
    ...provided,
    display: "none",
  }),
  indicatorContainer: (provided, state) => ({
    ...provided,
    display: "none",
  }),
  input: (provided, state) => ({
    ...provided,
    margin: 0,
    padding: "1rem",
    backgroundColor: "transparent",
    textAlign: "left",
  }),
  menuList: (provided, state) => {
    if (state.selectProps.options.length === 0) {
      return {
        ...provided,
        display: "none",
      };
    }
    return {
      ...provided,
      padding: 0,
    };
  },
  noOptionsMessage: (provided, state) => ({
    ...provided,
    display: "none",
  }),
});

const TransparentSelect = ({ name, options, form, isCreatable, customStyles, ...props }) => {
  const Component = isCreatable ? CreatableSelect : ReactSelect;
  return (
    <ClientOnly>
      {() => (
        <Component
          instanceId={`react-select-${name}`}
          name={name}
          form={form}
          options={options.map((o) => ({ label: o, value: o }))}
          className="h-full w-full"
          classNamePrefix="select"
          theme={transparentTheme}
          onChange={({ value }) => {
            document.querySelector(`[form="${form}"]#react-select-react-select-${name}-input`).setRangeText(value);
            // document.querySelector(`form#${form}`).submit();
          }}
          placeholder="Écrire ici..."
          styles={transparentCustomStyles(customStyles)}
          formatCreateLabel={(inputValue) => capitalizeFirstLetter(inputValue)}
          {...props}
        />
      )}
    </ClientOnly>
  );
};

export { SelectAutofill, Select, SelectRoot, TransparentSelect };
