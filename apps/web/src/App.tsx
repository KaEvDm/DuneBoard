import {
  AlertTriangle,
  BookOpenText,
  Boxes,
  Bug,
  CheckCircle2,
  CircleDot,
  ClipboardCheck,
  Columns3,
  FileText,
  Filter,
  Flag,
  FlaskConical,
  GitBranch,
  ListTodo,
  Search,
  Vote,
  Wrench,
  X
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { executableTaskKinds, type ParsedTask, type TaskId, type TaskKind, type TaskStatus } from "@duneboard/core";
import { emptyBoard, fetchProjectBoard, fetchProjects, type BoardIndex, type BoardProject } from "./board-data";

type ViewMode = "list" | "board" | "graph";
type ExecutionState = "active" | "available" | "blocked" | "closed" | "container" | "draft" | "review" | "waiting";
type FilterValue<T extends string> = "all" | T;
type TaskFilters = {
  execution: FilterValue<ExecutionState>;
  kind: FilterValue<TaskKind>;
  label: string;
  status: FilterValue<TaskStatus>;
};

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

const kindOrder: TaskKind[] = ["epic", "feature", "story", "task", "bug", "spike", "chore", "decision"];

const executionLabels: Record<ExecutionState, string> = {
  active: "In work",
  available: "Available",
  blocked: "Blocked",
  closed: "Not active",
  container: "Planning",
  draft: "Not ready",
  review: "In review",
  waiting: "Waiting"
};

const kindMeta: Record<TaskKind, { icon: typeof CircleDot; label: string }> = {
  bug: { icon: Bug, label: "Bug" },
  chore: { icon: Wrench, label: "Chore" },
  decision: { icon: Vote, label: "Decision" },
  epic: { icon: Flag, label: "Epic" },
  feature: { icon: Boxes, label: "Feature" },
  spike: { icon: FlaskConical, label: "Spike" },
  story: { icon: BookOpenText, label: "Story" },
  task: { icon: ClipboardCheck, label: "Task" }
};

const emptyFilters: TaskFilters = {
  execution: "all",
  kind: "all",
  label: "all",
  status: "all"
};

const viewOptions: Array<{ icon: typeof ListTodo; id: ViewMode; label: string }> = [
  { icon: ListTodo, id: "list", label: "List" },
  { icon: Columns3, id: "board", label: "Board" },
  { icon: GitBranch, id: "graph", label: "Graph" }
];

const projectStorageKey = "duneboard:selected-project";

export function App() {
  const [projects, setProjects] = useState<BoardProject[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [activeProject, setActiveProject] = useState<BoardProject | undefined>();
  const [board, setBoard] = useState<BoardIndex>(emptyBoard);
  const [loadState, setLoadState] = useState<"loading" | "ready" | "error">("loading");
  const [loadError, setLoadError] = useState("");
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<TaskFilters>(emptyFilters);
  const [view, setView] = useState<ViewMode>("list");
  const [selectedTaskId, setSelectedTaskId] = useState<TaskId | undefined>();

  useEffect(() => {
    let canceled = false;

    setLoadState("loading");
    fetchProjects()
      .then((loadedProjects) => {
        if (canceled) {
          return;
        }

        setProjects(loadedProjects);

        const storedProjectId = window.localStorage.getItem(projectStorageKey);
        const nextProject =
          loadedProjects.find((project) => project.id === storedProjectId) ??
          loadedProjects.find((project) => project.isDefault) ??
          loadedProjects[0];

        if (!nextProject) {
          setLoadState("error");
          setLoadError("No DuneBoard projects are configured.");
          return;
        }

        setSelectedProjectId(nextProject.id);
      })
      .catch((error: unknown) => {
        if (canceled) {
          return;
        }

        setLoadState("error");
        setLoadError(error instanceof Error ? error.message : String(error));
      });

    return () => {
      canceled = true;
    };
  }, []);

  useEffect(() => {
    if (!selectedProjectId) {
      return;
    }

    let canceled = false;

    setLoadState("loading");
    fetchProjectBoard(selectedProjectId)
      .then(({ board: loadedBoard, project }) => {
        if (canceled) {
          return;
        }

        setBoard(loadedBoard);
        setActiveProject(project);
        setSelectedTaskId(loadedBoard.availableTaskIds[0] ?? loadedBoard.tasks[0]?.id);
        setQuery("");
        setFilters(emptyFilters);
        setLoadState("ready");
        setLoadError("");
        window.localStorage.setItem(projectStorageKey, project.id);
      })
      .catch((error: unknown) => {
        if (canceled) {
          return;
        }

        setBoard(emptyBoard);
        setActiveProject(projects.find((project) => project.id === selectedProjectId));
        setSelectedTaskId(undefined);
        setLoadState("error");
        setLoadError(error instanceof Error ? error.message : String(error));
      });

    return () => {
      canceled = true;
    };
  }, [projects, selectedProjectId]);

  const selectedTask = selectedTaskId ? board.tasksById[selectedTaskId] : undefined;
  const labelOptions = useMemo(
    () => [...new Set(board.tasks.flatMap((task) => task.labels))].sort((left, right) => left.localeCompare(right)),
    [board]
  );
  const hasActiveFilters = query.trim().length > 0 || Object.values(filters).some((value) => value !== "all");

  const filteredTasks = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return board.tasks
      .filter((task) => taskMatchesQuery(task, normalizedQuery))
      .filter((task) => taskMatchesFilters(task, filters, board));
  }, [board, filters, query]);

  const clearFilters = () => {
    setQuery("");
    setFilters(emptyFilters);
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <div className="brand-mark">DB</div>
          <div>
            <h1>DuneBoard</h1>
            <p title={activeProject?.root}>{activeProject ? formatBoardRoot(activeProject.root) : "Loading board"}</p>
          </div>
        </div>

        <ProjectSelector
          disabled={loadState === "loading"}
          onSelect={setSelectedProjectId}
          projects={projects}
          selectedProjectId={selectedProjectId}
        />

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
            {loadState === "loading" ? <p className="muted">Loading project...</p> : null}
            {loadState === "error" ? (
              <div className="issue-row error">
                <strong>load_error</strong>
                <span>{loadError}</span>
              </div>
            ) : null}
            {board.issues.map((issue) => (
              <div className={`issue-row ${issue.severity}`} key={`${issue.code}-${issue.filePath}-${issue.message}`}>
                <strong>{issue.code}</strong>
                <span>{issue.message}</span>
              </div>
            ))}
            {loadState === "ready" && board.issues.length === 0 ? <p className="muted">No validation issues</p> : null}
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

        <FilterBar
          filters={filters}
          hasActiveFilters={hasActiveFilters}
          labelOptions={labelOptions}
          onClear={clearFilters}
          onFiltersChange={setFilters}
          resultCount={filteredTasks.length}
          totalCount={board.tasks.length}
        />

        {view === "list" ? (
          <ListView
            board={board}
            onSelect={setSelectedTaskId}
            selectedTaskId={selectedTaskId}
            tasks={filteredTasks}
          />
        ) : null}

        {view === "board" ? (
          <BoardView
            board={board}
            onSelect={setSelectedTaskId}
            selectedTaskId={selectedTaskId}
            tasks={filteredTasks}
          />
        ) : null}

        {view === "graph" ? (
          <GraphView
            board={board}
            onSelect={setSelectedTaskId}
            selectedTaskId={selectedTaskId}
            tasks={filteredTasks}
          />
        ) : null}
      </main>

      <TaskDetail board={board} onSelectTask={setSelectedTaskId} task={selectedTask} />
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

function ProjectSelector({
  disabled,
  onSelect,
  projects,
  selectedProjectId
}: {
  disabled: boolean;
  onSelect: (projectId: string) => void;
  projects: BoardProject[];
  selectedProjectId: string;
}) {
  return (
    <label className="project-selector">
      <span>Project</span>
      <select
        disabled={disabled || projects.length === 0}
        onChange={(event) => onSelect(event.target.value)}
        value={selectedProjectId}
      >
        {projects.map((project) => (
          <option key={project.id} value={project.id}>
            {project.name}
          </option>
        ))}
      </select>
    </label>
  );
}

function FilterBar({
  filters,
  hasActiveFilters,
  labelOptions,
  onClear,
  onFiltersChange,
  resultCount,
  totalCount
}: {
  filters: TaskFilters;
  hasActiveFilters: boolean;
  labelOptions: string[];
  onClear: () => void;
  onFiltersChange: (filters: TaskFilters) => void;
  resultCount: number;
  totalCount: number;
}) {
  const setFilter = <Key extends keyof TaskFilters>(key: Key, value: TaskFilters[Key]) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  return (
    <div className="filter-row">
      <Filter size={17} />
      <select
        aria-label="Status"
        onChange={(event) => setFilter("status", event.target.value as TaskFilters["status"])}
        value={filters.status}
      >
        <option value="all">All statuses</option>
        {statusOrder.map((status) => (
          <option key={status} value={status}>
            {statusLabels[status]}
          </option>
        ))}
      </select>
      <select
        aria-label="Kind"
        onChange={(event) => setFilter("kind", event.target.value as TaskFilters["kind"])}
        value={filters.kind}
      >
        <option value="all">All kinds</option>
        {kindOrder.map((kind) => (
          <option key={kind} value={kind}>
            {kindMeta[kind].label}
          </option>
        ))}
      </select>
      <select
        aria-label="Label"
        onChange={(event) => setFilter("label", event.target.value)}
        value={filters.label}
      >
        <option value="all">All labels</option>
        {labelOptions.map((label) => (
          <option key={label} value={label}>
            {label}
          </option>
        ))}
      </select>
      <select
        aria-label="Queue state"
        onChange={(event) => setFilter("execution", event.target.value as TaskFilters["execution"])}
        value={filters.execution}
      >
        <option value="all">All queue states</option>
        {Object.entries(executionLabels).map(([state, label]) => (
          <option key={state} value={state}>
            {label}
          </option>
        ))}
      </select>
      <span className="result-count">
        {resultCount}/{totalCount}
      </span>
      <button className="clear-filters" disabled={!hasActiveFilters} onClick={onClear} title="Clear filters" type="button">
        <X size={16} />
      </button>
    </div>
  );
}

function ListView({
  board,
  onSelect,
  selectedTaskId,
  tasks
}: {
  board: BoardIndex;
  onSelect: (taskId: TaskId) => void;
  selectedTaskId: TaskId | undefined;
  tasks: ParsedTask[];
}) {
  return (
    <section className="task-list" aria-label="Task list">
      {tasks.map((task) => (
        <TaskRow
          board={board}
          key={task.id}
          onSelect={onSelect}
          selected={task.id === selectedTaskId}
          task={task}
        />
      ))}
      {tasks.length === 0 ? <EmptyState /> : null}
    </section>
  );
}

function BoardView({
  board,
  onSelect,
  selectedTaskId,
  tasks
}: {
  board: BoardIndex;
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
                  board={board}
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
  board,
  onSelect,
  selectedTaskId,
  tasks
}: {
  board: BoardIndex;
  onSelect: (taskId: TaskId) => void;
  selectedTaskId: TaskId | undefined;
  tasks: ParsedTask[];
}) {
  const levels = useMemo(() => groupTasksByDependencyLevel(tasks), [tasks]);

  return (
    <section className="graph-view" aria-label="Dependency graph">
      <div className="graph-columns">
        {levels.map((level, index) => (
          <div className="graph-level" key={index}>
            <div className="level-label" title={dependencyLevelTitle(index)}>
              <span>{dependencyLevelTitle(index)}</span>
              <small>{level.length}</small>
            </div>
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
                    <ExecutionPill state={executionStateFor(task, board)} />
                  </div>
                  <strong>{task.title}</strong>
                  <KindPill kind={task.kind} />
                  <DependencyLine task={task} />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function TaskRow({
  board,
  onSelect,
  selected,
  task
}: {
  board: BoardIndex;
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
        <ExecutionPill state={executionStateFor(task, board)} />
        <KindPill kind={task.kind} />
      </div>
      <DependencyLine task={task} />
    </button>
  );
}

function TaskCard({
  board,
  onSelect,
  selected,
  task
}: {
  board: BoardIndex;
  onSelect: (taskId: TaskId) => void;
  selected: boolean;
  task: ParsedTask;
}) {
  return (
    <button className={`task-card ${selected ? "selected" : ""}`} onClick={() => onSelect(task.id)} type="button">
      <div className="card-topline">
        <span className="task-id">{task.id}</span>
        <div className="card-pills">
          <PriorityPill priority={task.priority} />
          <KindPill kind={task.kind} />
          <ExecutionPill state={executionStateFor(task, board)} />
        </div>
      </div>
      <strong>{task.title}</strong>
      <DependencyLine task={task} />
    </button>
  );
}

function TaskDetail({
  board,
  onSelectTask,
  task
}: {
  board: BoardIndex;
  onSelectTask: (taskId: TaskId) => void;
  task: ParsedTask | undefined;
}) {
  const panelRef = useRef<HTMLElement>(null);

  useEffect(() => {
    panelRef.current?.scrollTo({ top: 0 });
  }, [task?.id]);

  if (!task) {
    return (
      <section className="detail-panel" ref={panelRef}>
        <p className="muted">No task selected</p>
      </section>
    );
  }

  const children = board.childrenById[task.id] ?? [];
  const dependents = board.dependentsById[task.id] ?? [];
  const completedCriteria = task.acceptance.filter((item) => item.checked).length;
  const executionState = executionStateFor(task, board);

  return (
    <section className="detail-panel" ref={panelRef}>
      <div className="detail-heading">
        <span className="task-id">{task.id}</span>
        <h2>{task.title}</h2>
        <div className="detail-pills">
          <PriorityPill priority={task.priority} />
          <StatusPill status={task.status} />
          <ExecutionPill state={executionState} />
          <KindPill kind={task.kind} />
        </div>
        <div className="detail-meta">
          <span>
            <FileText size={15} />
            {task.filePath}
          </span>
          <span>Assignee: {task.assignee ?? "none"}</span>
        </div>
      </div>

      <DetailSection title="Goal">{task.sections.Goal}</DetailSection>

      <section className="detail-section">
        <div className="detail-section-heading">
          <h3>Acceptance Criteria</h3>
          <span>{task.acceptance.length ? `${completedCriteria}/${task.acceptance.length}` : "0/0"}</span>
        </div>
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
        <RelationList board={board} label="Parent" onSelect={onSelectTask} values={task.parent ? [task.parent] : []} />
        <RelationList board={board} label="Depends on" onSelect={onSelectTask} values={task.depends_on} />
        <RelationList board={board} label="Children" onSelect={onSelectTask} values={children} />
        <RelationList board={board} label="Dependents" onSelect={onSelectTask} values={dependents} />
        <RelationList board={board} label="Related" onSelect={onSelectTask} values={task.relates_to} />
        <RelationList board={board} label="Labels" values={task.labels} />
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

function RelationList({
  board,
  label,
  onSelect,
  values
}: {
  board: BoardIndex;
  label: string;
  onSelect?: (taskId: TaskId) => void;
  values: string[];
}) {
  return (
    <div className="relation-list">
      <h3>{label}</h3>
      <div>
        {values.map((value) => {
          const relatedTask = board.tasksById[value as TaskId];

          if (relatedTask && onSelect) {
            return (
              <button className="relation-link" key={value} onClick={() => onSelect(value as TaskId)} type="button">
                <strong>{value}</strong>
                <span>{relatedTask.title}</span>
              </button>
            );
          }

          return (
            <span className="soft-pill" key={value}>
              {value}
            </span>
          );
        })}
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
  return (
    <span className={`status-pill ${status}`} title="Stored Markdown status">
      {statusLabels[status]}
    </span>
  );
}

function ExecutionPill({ state }: { state: ExecutionState }) {
  return (
    <span className={`execution-pill ${state}`} title="Derived queue state">
      Queue: {executionLabels[state]}
    </span>
  );
}

function KindPill({ kind }: { kind: TaskKind }) {
  const meta = kindMeta[kind];
  const Icon = meta.icon;

  return (
    <span className={`kind-pill ${kind}`} title={`Task type: ${meta.label}`}>
      <Icon size={13} />
      {meta.label}
    </span>
  );
}

function EmptyState() {
  return (
    <div className="empty-state">
      <strong>No matching tasks</strong>
      <span>Adjust filters or search.</span>
    </div>
  );
}

function taskMatchesQuery(task: ParsedTask, normalizedQuery: string): boolean {
  if (!normalizedQuery) {
    return true;
  }

  return [
    task.id,
    task.title,
    task.kind,
    task.status,
    task.priority,
    ...task.labels,
    task.sections.Goal ?? "",
    task.sections["Open Questions"] ?? ""
  ]
    .join(" ")
    .toLowerCase()
    .includes(normalizedQuery);
}

function taskMatchesFilters(task: ParsedTask, filters: TaskFilters, board: BoardIndex): boolean {
  if (filters.status !== "all" && task.status !== filters.status) {
    return false;
  }

  if (filters.kind !== "all" && task.kind !== filters.kind) {
    return false;
  }

  if (filters.label !== "all" && !task.labels.includes(filters.label)) {
    return false;
  }

  if (filters.execution !== "all" && executionStateFor(task, board) !== filters.execution) {
    return false;
  }

  return true;
}

function executionStateFor(task: ParsedTask, board: BoardIndex): ExecutionState {
  if (!executableTaskKinds.includes(task.kind)) {
    return "container";
  }

  if (task.status === "in_progress") {
    return "active";
  }

  if (task.status === "blocked") {
    return "blocked";
  }

  if (task.status === "review") {
    return "review";
  }

  if (task.status === "done" || task.status === "canceled") {
    return "closed";
  }

  if (task.status === "draft") {
    return "draft";
  }

  if (board.availableTaskIds.includes(task.id)) {
    return "available";
  }

  return "waiting";
}

function formatBoardRoot(value: string): string {
  const parts = value.split(/[\\/]+/).filter(Boolean);

  return parts.slice(-2).join(" / ") || value;
}

function dependencyLevelTitle(index: number): string {
  if (index === 0) {
    return "No dependencies";
  }

  return index === 1 ? "After 1 dependency layer" : `After ${index} dependency layers`;
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
