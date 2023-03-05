import { useMemo } from "react";
import { DropdownMenu } from "../DropdownMenu";
import { useFetcher, useLoaderData } from "react-router-dom";

export const StatusesFilter = ({ className = "" }) => {
  const { project } = useLoaderData();
  const statusFilterFetcher = useFetcher();
  const filteredStatuses = useMemo(() => {
    const projectFilteredStatuses = project?.filteredStatuses || [];
    if (!["loading", "submitting"].includes(statusFilterFetcher.state)) return projectFilteredStatuses;
    if (statusFilterFetcher.formData?.get("action") !== "filter") return projectFilteredStatuses;
    const newValue = statusFilterFetcher.formData?.get("status");
    if (newValue) {
      if (projectFilteredStatuses.includes(newValue)) return projectFilteredStatuses.filter((s) => s !== newValue);
      return [...projectFilteredStatuses, newValue];
    }
    return projectFilteredStatuses;
  }, [project?.filteredStatuses, statusFilterFetcher.state, statusFilterFetcher?.formData]);

  return (
    <DropdownMenu
      id="statuses-filter"
      className={["[&_.menu-button.hide-menu]:italic [&_.menu-button.hide-menu]:opacity-50", className].join(" ")}
      title={`Filter${filteredStatuses.length ? ` (${filteredStatuses.length})` : ""}...`}
    >
      <statusFilterFetcher.Form method="post" id="status-filter" className="status-filter flex flex-col items-start">
        <input type="hidden" name="action" value="filter" />
        <button
          className={["!r-2 !p-1", filteredStatuses.includes("TODO") ? "line-through" : ""].join(" ")}
          type="submit"
          form="status-filter"
          name="status"
          value="TODO"
        >
          To do
        </button>
        <button
          className={["!p-1 !pr-4 ", filteredStatuses.includes("INPROGRESS") ? "line-through" : ""].join(" ")}
          type="submit"
          form="status-filter"
          name="status"
          value="INPROGRESS"
        >
          In&nbsp;progress
        </button>
        <button
          className={["!p-1 !pr-4 ", filteredStatuses.includes("NOTREADYYET") ? "line-through" : ""].join(" ")}
          type="submit"
          form="status-filter"
          name="status"
          value="NOTREADYYET"
        >
          Not&nbsp;ready&nbsp;yet
        </button>
        <button
          className={["!p-1 !pr-4 ", filteredStatuses.includes("DONE") ? "line-through" : ""].join(" ")}
          type="submit"
          form="status-filter"
          name="status"
          value="DONE"
        >
          Done
        </button>
        <button
          className={["!p-1 !pr-4 ", filteredStatuses.includes("KO") ? "line-through" : ""].join(" ")}
          type="submit"
          form="status-filter"
          name="status"
          value="KO"
        >
          KO
        </button>
      </statusFilterFetcher.Form>
    </DropdownMenu>
  );
};
