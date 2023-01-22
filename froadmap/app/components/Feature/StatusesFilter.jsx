import { useFetcher, useLoaderData } from "@remix-run/react";
import { useMemo, useState } from "react";

export const StatusesFilter = () => {
  const { project } = useLoaderData();
  const [showFilter, setShowFilter] = useState(false);
  const statusFilterFetcher = useFetcher();
  const filteredStatuses = useMemo(() => {
    if (!["loading", "submitting"].includes(statusFilterFetcher.state)) return project.filteredStatuses;
    if (statusFilterFetcher.submission.formData?.get("action") !== "filter") return project.filteredStatuses;
    const newValue = statusFilterFetcher.submission.formData?.get("status");
    if (newValue) {
      if (project.filteredStatuses.includes(newValue)) return project.filteredStatuses.filter((s) => s !== newValue);
      return [...project.filteredStatuses, newValue];
    }
    return project.filteredStatuses;
  }, [project.filteredStatuses, statusFilterFetcher.state, statusFilterFetcher.submission?.formData]);

  return (
    <div className="relative -my-2">
      <button
        type="button"
        onClick={() => setShowFilter((f) => !f)}
        className={["block h-full px-4 text-xs", showFilter ? "bg-black text-white" : "italic opacity-50"].join(" ")}
      >
        Filter{filteredStatuses.length ? ` (${filteredStatuses.length})` : ""}...
      </button>
      {showFilter && (
        <statusFilterFetcher.Form
          method="post"
          id="status-filter"
          // onSubmit={(e) => {
          //   // setShowFilter(false);
          // }}
          className="status-filter absolute top-8 right-0 flex flex-col items-start overflow-hidden rounded border bg-white"
        >
          <input type="hidden" name="action" value="filter" />
          <button
            className={[
              "w-full p-1 pr-4 text-left hover:bg-gray-300",
              filteredStatuses.includes("TODO") ? "line-through" : "",
            ].join(" ")}
            type="submit"
            form="status-filter"
            name="status"
            value="TODO"
          >
            To do
          </button>
          <button
            className={[
              "w-full p-1 pr-4 text-left hover:bg-gray-300",
              filteredStatuses.includes("INPROGRESS") ? "line-through" : "",
            ].join(" ")}
            type="submit"
            form="status-filter"
            name="status"
            value="INPROGRESS"
          >
            In&nbsp;progress
          </button>
          <button
            className={[
              "w-full p-1 pr-4 text-left hover:bg-gray-300",
              filteredStatuses.includes("NOTREADYYET") ? "line-through" : "",
            ].join(" ")}
            type="submit"
            form="status-filter"
            name="status"
            value="NOTREADYYET"
          >
            Not&nbsp;ready&nbsp;yet
          </button>
          <button
            className={[
              "w-full p-1 pr-4 text-left hover:bg-gray-300",
              filteredStatuses.includes("DONE") ? "line-through" : "",
            ].join(" ")}
            type="submit"
            form="status-filter"
            name="status"
            value="DONE"
          >
            Done
          </button>
          <button
            className={[
              "w-full p-1 pr-4 text-left hover:bg-gray-300",
              filteredStatuses.includes("KO") ? "line-through" : "",
            ].join(" ")}
            type="submit"
            form="status-filter"
            name="status"
            value="KO"
          >
            KO
          </button>
        </statusFilterFetcher.Form>
      )}
    </div>
  );
};
