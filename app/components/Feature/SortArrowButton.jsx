export const SortArrowButton = ({ field, onClick, sortOrder, sortBy, className = "" }) => {
  if (!sortBy) return null;
  if (sortBy !== field) return null;
  return (
    <button
      className={["mr-2", className].join(" ")}
      onClick={onClick}
      type="button"
      aria-label="Changer l'ordre de tri"
      data-sortkey={field}
    >
      <span>
        {sortOrder === "ASC" && `\u00A0\u2193`}
        {sortOrder === "DESC" && `\u00A0\u2191`}
      </span>
    </button>
  );
};
