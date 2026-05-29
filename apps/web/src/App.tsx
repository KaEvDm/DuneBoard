import {
  AlertTriangle,
  CheckCircle2,
  CircleDot,
  Columns3,
  GitBranch,
  ListTodo,
  Search
} from "lucide-react";
import { useMemo, useState } from "react";
import type { ParsedTask, TaskId, TaskStatus } from "@duneboard/core";
import { board } from "./board-data";

type ViewMode = "list" | "board" | "graph";

const statusOrder: TaskStatus[] = [
  "draft",
  "ready",
  "in_progress",
  "blocked",
  "review",
  "done",
  "canceled"
];

const statusLabels: Record<TaskStatus, string> = {
  blocked: "Blocked",
  canceled: "Canceled",
  done: "Done",
  draft: "Draft",
  in_progress: "In progress",
  ready: "Ready",
  review: "Review"
};

const viewOptions: Array<{ icon: typeof ListTodo; id: ViewMode; label: string }> = [
  { icon: ListTodo, id: "list", label: "List" },
  { icon: Columns3, id: "board", label: "Board" },
  { icon: GitBranch, id: "graph", label: "Graph" }
];

export function App() {
  const [query, setQuery] = useState("");
  const [view, setView] = useState<ViewMode>("list");
  const [selectedTaskId, setSelectedTaskId] = useState<TaskId | undefined>(
    board.availableTaskIds[0] ?? board.tasks[0]?.id
  );

  const selectedTask = selectedTaskId ? board.tasksById[selectedTaskId] : undefined;

  const filteredTasks = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return board.tasks;
    }

    return board.tasks.filter((task) => {
      return [
        task.id,
        task.title,
        task.kind,
        task.status,
        task.priority,
        ...task.labels,
        task.sections.Goal ?? ""
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);
    });
  }, [query]);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <div className="brand-mark">DB</div>
          <div>
            <h1>DuneBoard</h1>
            <p>Local task graph</p>
          </div>
        </div>

        <div className="metric-grid">
          <Metric label="Tasks" value={board.tasks.length} />
          <Metric label="Ready" value={board.availableTaskIds.length} />
          <Metric label="Blocked" value={board.dependencyBlockedTaskIds.length} />
          <Metric label="Issues" value={board.issues.length} tone={board.issues.length ? "danger" : "ok"} />
        </div>

        <section className="side-section">
          <div className="section-title">
            <CircleDot size={16} />
            <span>Ready Queue</span>
          </div>
          <div className="compact-list">
            {board.availableTaskIds.map((taskId) => (
              <button
                className="compact-task"
                key={taskId}
                onClick={() => setSelectedTaskId(taskId)}
                type="button"
              >
                <strong>{taskId}</strong>
                <span>{board.tasksById[taskId]?.title}</span>
              </button>
            ))}
            {board.availableTaskIds.length === 0 ? <p className="muted">No available tasks</p> : null}
          </div>
        </section>

        <section className="side-section">
          <div className="section-title">
            <AlertTriangle size={16} />
            <span>Validation</span>
          </div>
          <div className="issue-list">
            {board.issues.map((issue) => (
              <div className={`issue-row ${issue.severity}`} key={`${issue.code}-${issue.filePath}-${issue.message}`}>
                <strong>{issue.code}</strong>
                <span>{issue.message}</span>
              </div>
            ))}
            {board.issues.length === 0 ? <p className="muted">No validation issues</p> : null}
          </div>
        </section>
      </aside>

      <main className="workspace">
        <div className="toolbar">
          <div className="segmented-control" aria-label="View mode">
            {viewOptions.map((option) => {
              const Icon = option.icon;
              return (
                <button
                  aria-pressed={view === option.id}
                  className={view === option.id ? "active" : ""}
                  key={option.id}
                  onClick={() => setView(option.id)}
                  title={option.label}
                  type="button"
                >
                  <Icon size={17} />
                  <span>{option.label}</span>
                </button>
              );
            })}
          </div>

          <label className="search-box">
            <Search size={17} />
            <input
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search tasks"
              type="search"
              value={query}
            />
          </label>
        </div>

        {view === "list" ? (
          <ListView
            onSelect={setSelectedTaskId}
            selectedTaskId={selectedTaskId}
            tasks={filteredTasks}
          />
        ) : null}

        {view === "board" ? (
          <BoardView
            onSelect={setSelectedTaskId}
            selectedTaskId={selectedTaskId}
            tasks={filteredTasks}
          />
        ) : null}

        {view === "graph" ? (
          <GraphView
            onSelect={setSelectedTaskId}
            selectedTaskId={selectedTaskId}
            tasks={filteredTasks}
          />
        ) : null}
      </main>

      <TaskDetail task={selectedTask} />
    </div>
  );
}

function Metric({ label, tone, value }: { label: string; tone?: "danger" | "ok"; value: number }) {
  return (
    <div className={`metric ${tone ?? ""}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function ListView({
  onSelect,
  selectedTaskId,
  tasks
}: {
  onSelect: (taskId: TaskId) => void;
  selectedTaskId: TaskId | undefined;
  tasks: ParsedTask[];
}) {
  return (
    <section className="task-list" aria-label="Task list">
      {tasks.map((task) => (
        <TaskRow
          key={task.id}
          onSelect={onSelect}
          selected={task.id === selectedTaskId}
          task={task}
        />
      ))}
    </section>
  );
}

function BoardView({
  onSelect,
  selectedTaskId,
  tasks
}: {
  onSelect: (taskId: TaskId) => void;
  selectedTaskId: TaskId | undefined;
  tasks: ParsedTask[];
}) {
  return (
    <section className="board-view" aria-label="Kanban board">
      {statusOrder.map((status) => {
        const statusTasks = tasks.filter((task) => task.status === status);

        return (
          <div className="board-column" key={status}>
            <div className="column-header">
              <span>{statusLabels[status]}</span>
              <strong>{statusTasks.length}</strong>
            </div>
            <div className="column-stack">
              {statusTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  onSelect={onSelect}
                  selected={task.id === selectedTaskId}
                  task={task}
                />
              ))}
            </div>
          </div>
        );
      })}
    </section>
  );
}

function GraphView({
  onSelect,
  selectedTaskId,
  tasks
}: {
  onSelect: (taskId: TaskId) => void;
  selectedTaskId: TaskId | undefined;
  tasks: ParsedTask[];
}) {
  const levels = useMemo(() => groupTasksByDependencyLevel(tasks), [tasks]);

  return (
    <section className="graph-view" aria-label="Dependency graph">
      {levels.map((level, index) => (
        <div className="graph-level" key={index}>
          <div className="level-label">L{index}</div>
          <div className="graph-stack">
            {level.map((task) => (
              <button
                className={`graph-node ${task.id === selectedTaskId ? "selected" : ""}`}
                key={task.id}
                onClick={() => onSelect(task.id)}
                type="button"
              >
                <div className="node-topline">
                  <span>{task.id}</span>
                  <StatusPill status={task.status} />
                </div>
                <strong>{task.title}</strong>
                <DependencyLine task={task} />
              </button>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}

function TaskRow({
  onSelect,
  selected,
  task
}: {
  onSelect: (taskId: TaskId) => void;
  selected: boolean;
  task: ParsedTask;
}) {
  return (
    <button className={`task-row ${selected ? "selected" : ""}`} onClick={() => onSelect(task.id)} type="button">
      <div>
        <span className="task-id">{task.id}</span>
        <strong>{task.title}</strong>
      </div>
      <div className="row-meta">
        <PriorityPill priority={task.priority} />
        <StatusPill status={task.status} />
        <span>{task.kind}</span>
      </div>
      <DependencyLine task={task} />
    </button>
  );
}

function TaskCard({
  onSelect,
  selected,
  task
}: {
  onSelect: (taskId: TaskId) => void;
  selected: boolean;
  task: ParsedTask;
}) {
  return (
    <button className={`task-card ${selected ? "selected" : ""}`} onClick={() => onSelect(task.id)} type="button">
      <div className="card-topline">
        <span className="task-id">{task.id}</span>
        <PriorityPill priority={task.priority} />
      </div>
      <strong>{task.title}</strong>
      <DependencyLine task={task} />
    </button>
  );
}

function TaskDetail({ task }: { task: ParsedTask | undefined }) {
  if (!task) {
    return (
      <section className="detail-panel">
        <p className="muted">No task selected</p>
      </section>
    );
  }

  const children = board.childrenById[task.id] ?? [];
  const dependents = board.dependentsById[task.id] ?? [];

  return (
    <section className="detail-panel">
      <div className="detail-heading">
        <span className="task-id">{task.id}</span>
        <h2>{task.title}</h2>
        <div className="detail-pills">
          <PriorityPill priority={task.priority} />
          <StatusPill status={task.status} />
          <span className="soft-pill">{task.kind}</span>
        </div>
      </div>

      <DetailSection title="Goal">{task.sections.Goal}</DetailSection>

      <section className="detail-section">
        <h3>Acceptance Criteria</h3>
        <div className="acceptance-list">
          {task.acceptance.map((item) => (
            <div className="acceptance-item" key={item.text}>
              {item.checked ? <CheckCircle2 size={16} /> : <CircleDot size={16} />}
              <span>{item.text}</span>
            </div>
          ))}
          {task.acceptance.length === 0 ? <p className="muted">No criteria</p> : null}
        </div>
      </section>

      <section className="detail-section relation-grid">
        <RelationList label="Depends on" values={task.depends_on} />
        <RelationList label="Children" values={children} />
        <RelationList label="Dependents" values={dependents} />
        <RelationList label="Labels" values={task.labels} />
      </section>

      <DetailSection title="Open Questions">{task.sections["Open Questions"]}</DetailSection>
      <DetailSection title="Work Log">{task.sections["Work Log"]}</DetailSection>
    </section>
  );
}

function DetailSection({ children, title }: { children: string | undefined; title: string }) {
  return (
    <section className="detail-section">
      <h3>{title}</h3>
      <p className="markdown-text">{children || "None"}</p>
    </section>
  );
}

function RelationList({ label, values }: { label: string; values: string[] }) {
  return (
    <div className="relation-list">
      <h3>{label}</h3>
      <div>
        {values.map((value) => (
          <span className="soft-pill" key={value}>
            {value}
          </span>
        ))}
        {values.length === 0 ? <span className="muted">None</span> : null}
      </div>
    </div>
  );
}

function DependencyLine({ task }: { task: ParsedTask }) {
  if (task.depends_on.length === 0) {
    return <span className="dependency-line">No dependencies</span>;
  }

  return <span className="dependency-line">Depends on {task.depends_on.join(", ")}</span>;
}

function PriorityPill({ priority }: { priority: string }) {
  return <span className={`priority-pill ${priority.toLowerCase()}`}>{priority}</span>;
}

function StatusPill({ status }: { status: TaskStatus }) {
  return <span className={`status-pill ${status}`}>{statusLabels[status]}</span>;
}

function groupTasksByDependencyLevel(tasks: ParsedTask[]): ParsedTask[][] {
  const visibleIds = new Set(tasks.map((task) => task.id));
  const byId = Object.fromEntries(tasks.map((task) => [task.id, task]));
  const memo = new Map<TaskId, number>();

  const levelFor = (task: ParsedTask, path = new Set<TaskId>()): number => {
    const cached = memo.get(task.id);

    if (cached !== undefined) {
      return cached;
    }

    if (path.has(task.id)) {
      return 0;
    }

    const dependencyLevels = task.depends_on
      .filter((dependencyId) => visibleIds.has(dependencyId))
      .map((dependencyId) => {
        const dependency = byId[dependencyId];
        return dependency ? levelFor(dependency, new Set([...path, task.id])) : 0;
      });

    const level = dependencyLevels.length ? Math.max(...dependencyLevels) + 1 : 0;
    memo.set(task.id, level);
    return level;
  };

  const grouped = new Map<number, ParsedTask[]>();

  tasks.forEach((task) => {
    const level = levelFor(task);
    grouped.set(level, [...(grouped.get(level) ?? []), task]);
  });

  return [...grouped.entries()]
    .sort(([left], [right]) => left - right)
    .map(([, levelTasks]) => levelTasks.sort((left, right) => left.id.localeCompare(right.id)));
}
