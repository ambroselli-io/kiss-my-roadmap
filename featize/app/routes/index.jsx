import { Link, useLoaderData } from "@remix-run/react";
import ProjectModel from "~/db/models/project.server";
import UserModel from "~/db/models/user.server";

export const loader = async ({ request }) => {
  const user = await UserModel.findOne();

  const userProjects = [];
  for (const organisationId of user.organisations) {
    const organisationProjects = await ProjectModel.find({ organisation: organisationId });

    userProjects.push(...organisationProjects);
  }
  return {
    projects: userProjects,
    user,
  };
};

export default function Index() {
  const { projects, user } = useLoaderData();

  return (
    <div className="flex h-full max-h-full w-full max-w-full flex-col overflow-hidden">
      <header>This is my projects</header>
      <main className="relative flex-1 basis-full overflow-auto">
        {projects.map((project) => (
          <Link key={project._id} to={`/project/${project._id}`}>
            {project.title}
          </Link>
        ))}
      </main>
    </div>
  );
}
