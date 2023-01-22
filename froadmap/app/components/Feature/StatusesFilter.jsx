import { useFetcher, useLoaderData } from "@remix-run/react";
import { useMemo } from "react";
import { DropdownMenu } from "../DropdownMenu";

export const StatusesFilter = () => {
  const { project } = useLoaderData();
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
    <DropdownMenu
      className="-my-2 [&_.menu-button.hide-menu]:italic [&_.menu-button.hide-menu]:opacity-50 [&_.menu-container]:right-0 [&_.menu-container]:left-[unset] [&_.menu-container]:w-[unset]"
      title={`Filter${filteredStatuses.length ? ` (${filteredStatuses.length})` : ""}...`}
    >
      <statusFilterFetcher.Form method="post" id="status-filter" className="status-filter flex flex-col items-start">
        <input type="hidden" name="action" value="filter" />
        <button
          className={["!p-1 !pr-4", filteredStatuses.includes("TODO") ? "line-through" : ""].join(" ")}
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
