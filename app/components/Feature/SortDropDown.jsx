import { DropdownMenu } from "../DropdownMenu";
import { SortArrowButton } from "./SortArrowButton";

const fields = [
  { key: "content", title: "Feature\u00A0name" },
  { key: "businessValue", title: "🤑\u00A0Added\u00A0value" },
  { key: "devCost", title: "💸\u00A0Production\u00A0cost" },
  { key: "priority", title: "❗️\u00A0Priority" },
  { key: "score", title: "💯\u00A0Score" },
  { key: "status", title: "Status" },
];

export const SortDropDown = ({ field, onClick, sortOrder, sortBy }) => {
  return (
    <div className="flex">
      <DropdownMenu
        id="sort-dropdown"
        closeOnItemClick
        title={fields.find((_field) => _field.key === field)?.title ?? "Sort by..."}
        className={[
          !field ? "[&_.menu-button.hide-menu]:italic [&_.menu-button.hide-menu]:opacity-50" : "",
          "order-2",
        ].join(" ")}
      >
        {fields.map(({ key, title }) => (
          <SortByButton
            key={key}
            field={key}
            title={title}
            onClick={onClick}
            className={sortBy === key ? "bg-gray-200" : ""}
          />
        ))}
      </DropdownMenu>
      <SortArrowButton
        field={field}
        onClick={(e) => {
          e.stopPropagation();
          onClick(e);
        }}
        sortOrder={sortOrder}
        sortBy={sortBy}
        className="z-50 order-1 -mr-2 ml-2"
      />
    </div>
  );
};

const SortByButton = ({ title, field, onClick }) => {
  return (
    <button
      className="grow text-left"
      aria-label={`Sort by ${title}`}
      type="button"
      data-sortkey={field}
      onClick={onClick}
    >
      {title}
    </button>
  );
};
