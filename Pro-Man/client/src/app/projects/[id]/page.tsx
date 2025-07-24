// app/projects/[id]/page.tsx
import Project from "../../_components/project";

const ProjectPage =async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  return <Project id={id} />;
}
export default ProjectPage