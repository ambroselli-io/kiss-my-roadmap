import React, { useCallback } from "react";
import { Form, Link, useLoaderData, useSubmit } from "react-router-dom";
import { MainHelpButton } from "./HelpBlock";
import { DropdownMenu } from "./DropdownMenu";
import OpenTrash from "./OpenTrash";
import EasyContact from "./EasyContact";

const TopMenu = () => {
  const { project } = useLoaderData();

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
    <>
      <header className="border-b-2 text-xs">
        <div className="relative flex justify-between">
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
          <Form method="get" className="ml-auto inline-flex items-center gap-1 py-2 px-4" id="contact-modal">
            <button value="true" name="show-contact-modal" type="submit">
              Contact
            </button>
          </Form>
          {!!project?._id && <MainHelpButton className="py-2 px-4" />}
        </div>
      </header>
      <EasyContact param="show-contact-modal" />
    </>
  );
};

export default TopMenu;
