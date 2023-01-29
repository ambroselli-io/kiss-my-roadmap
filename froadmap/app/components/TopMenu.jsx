import React, { useCallback } from "react";
import { Link, useLoaderData, useSubmit } from "@remix-run/react";
import { MainHelpButton } from "~/components/HelpBlock";
import { DropdownMenu } from "~/components/DropdownMenu";
import OpenTrash from "~/components/OpenTrash";

const TopMenu = () => {
  const { user, project } = useLoaderData();

  const submit = useSubmit();

  const onNewProject = useCallback(
    (e) => {
      const formData = new FormData();
      formData.append("action", "newProject");
      submit(formData, { method: "POST", replace: true });
    },
    [submit]
  );

  const onDelete = useCallback(
    (e) => {
      if (!confirm("Are you sure you want to delete this project?")) {
        e.preventDefault();
      }
      const formData = new FormData();
      formData.append("action", "deleteProject");
      submit(formData, { method: "POST", replace: true });
    },
    [submit]
  );

  return (
    <header className="flex justify-between border-b-2 px-4 text-xs">
      {!!user?._id && (
        <>
          <div className="flex gap-2">
            <DropdownMenu
              id="header-menu-project"
              closeOnItemClick
              title="Projects"
              className="[&_.menu-container]:min-w-max"
            >
              <div className="flex flex-col items-start" id="top-menu">
                {!!project?._id && (
                  <Link to="/" className="inline-flex items-center gap-1">
                    <div className="h-6 w-6" /> My projects
                  </Link>
                )}
                <button form="top-menu" type="button" className="inline-flex items-center gap-1" onClick={onNewProject}>
                  <div className="inline-flex h-6 w-6 items-center justify-center">+</div> New project
                </button>
                {!!project?._id && (
                  <button
                    form="top-menu"
                    type="button"
                    className="inline-flex items-center gap-1 text-red-500 hover:text-red-600"
                    onClick={onDelete}
                  >
                    <OpenTrash className="h-6 w-6" /> Delete project
                  </button>
                )}
              </div>
            </DropdownMenu>
          </div>
          {!!project?._id && (
            <Link to="users" className="inline-flex items-center gap-1">
              Users
            </Link>
          )}
        </>
      )}
      {!!project?._id && <MainHelpButton className="ml-auto py-2 px-4 " />}
      <button
        formMethod="post"
        formAction="/action/logout"
        className="py-2 px-4 text-right"
        type="button"
        onClick={(e) => {
          const formData = new FormData();
          formData.append("action", "logout");
          submit(formData, { method: "POST", replace: true });
        }}
      >
        {!user?._id ? "Register" : <>Logout ({user?.name || user?.email})</>}
      </button>
    </header>
  );
};

export default TopMenu;
