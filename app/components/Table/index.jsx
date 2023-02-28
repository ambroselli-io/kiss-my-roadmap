const Table = ({ columns = [], data = [], rowKey, onRowClick, className, title, noData }) => {
  if (!data.length && noData) {
    return (
      <table className={[className, "w-full table-auto border-collapse text-sm"].join(" ")}>
        <thead>
          {!!title && (
            <tr>
              <th className="title" colSpan={columns.length}>
                {title}
              </th>
            </tr>
          )}
        </thead>
        <tbody>
          <tr>
            <td colSpan={columns.length} className="flex items-center justify-center">
              {noData}
            </td>
          </tr>
        </tbody>
      </table>
    );
  }

  // inspired by https://tailwindcss.com/docs/table-layout#auto

  return (
    <table
      className={[
        className,
        "relative w-full table-fixed border-separate border-spacing-0 border-2 border-gray-900",
      ].join(" ")}
    >
      <thead>
        {!!title && (
          <tr>
            <th tabIndex={0} aria-label={title} className="title" colSpan={columns.length}>
              {title}
            </th>
          </tr>
        )}
        <tr className="sticky top-0 z-50 border-2 border-b-2 border-t-2 border-gray-900 bg-white">
          {columns.map((column, index) => {
            const { onSortBy, onSortOrder, sortBy, sortOrder, sortableKey, dataKey } = column;
            const onNameClick = () => {
              if (sortBy === sortableKey || sortBy === dataKey) {
                onSortOrder(sortOrder === "ASC" ? "DESC" : "ASC");
                return;
              }
              onSortBy(sortableKey || dataKey);
            };
            return (
              <th
                className={[
                  column.className || "",
                  onSortBy ? "cursor-pointer" : "cursor-default",
                  "border-2 border-gray-900 bg-white p-4 text-left font-medium text-gray-900",
                ].join(" ")}
                key={String(dataKey) + String(column.title)}
              >
                <button aria-label="Changer l'ordre de tri" type="button" onClick={onSortBy ? onNameClick : null}>
                  {column.title}
                </button>
                {!!onSortBy && (sortBy === sortableKey || sortBy === dataKey) && (
                  <button onClick={onSortBy ? onNameClick : null} type="button" aria-label="Changer l'ordre de tri">
                    {sortOrder === "ASC" && (
                      <span className="mx-4" onClick={() => onSortOrder("DESC")}>{`\u00A0\u2193`}</span>
                    )}
                    {sortOrder === "DESC" && (
                      <span className="mx-4" onClick={() => onSortOrder("ASC")}>{`\u00A0\u2191`}</span>
                    )}
                  </button>
                )}
              </th>
            );
          })}
        </tr>
      </thead>
      <tbody className="bg-white ">
        {data
          .filter((e) => e)
          .map((item) => {
            return (
              <tr
                onClick={() => (onRowClick ? onRowClick(item) : null)}
                onKeyUp={(event) => {
                  if (event.key === "Enter") {
                    if (onRowClick) {
                      onRowClick(item);
                    }
                  }
                }}
                key={item[rowKey] || item._id}
                data-key={item[rowKey] || item._id}
                data-test-id={item[rowKey] || item._id}
                tabIndex={0}
                className={[item.className, onRowClick ? "cursor-pointer" : "cursor-auto"].join(" ")}
              >
                {columns.map((column, index) => {
                  return (
                    <td
                      className={[column.className || "", "border border-gray-900 p-4 text-gray-900"]
                        .filter(Boolean)
                        .join(" ")}
                      key={item[rowKey] + column.dataKey}
                    >
                      {column.render ? column.render(item) : item[column.dataKey]}
                    </td>
                  );
                })}
              </tr>
            );
          })}
      </tbody>
    </table>
  );
};

export default Table;
