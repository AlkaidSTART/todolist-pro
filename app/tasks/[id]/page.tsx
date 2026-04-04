import TaskForm from "../task-form";

export default function EditTaskPage({
  params,
}: {
  params: { id: string };
}) {
  return <TaskForm mode="edit" taskId={params.id} />;
}