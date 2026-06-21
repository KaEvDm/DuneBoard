import {
  AlertTriangle,
  BookOpenText,
  Boxes,
  Bug,
  ChevronDown,
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
  Moon,
  Search,
  Sun,
  Vote,
  Wrench,
  X
} from "lucide-react";
import { type PointerEvent as ReactPointerEvent, useEffect, useMemo, useRef, useState } from "react";
import { executableTaskKinds, type ParsedTask, type TaskId, type TaskKind, type TaskStatus } from "@duneboard/core";
import { emptyBoard, fetchProjectBoard, fetchProjects, type BoardIndex, type BoardProject } from "./board-data";

type ViewMode = "list" | "board" | "graph";
type ThemeMode = "light" | "dark";
type ReadinessState = "available" | "planning" | "waiting";
type FilterValue<T extends string> = "all" | T;
type StatusFilterValue = "all" | TaskStatus[];
type TaskFilters = {
  kind: FilterValue<TaskKind>;
  label: string;
  readiness: FilterValue<ReadinessState>;
  status: StatusFilterValue;
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

const readinessLabels: Record<ReadinessState, string> = {
  available: "Available",
  planning: "Planning container",
  waiting: "Waiting on deps"
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
  kind: "all",
  label: "all",
  readiness: "all",
  status: "all"
};

const viewOptions: Array<{ icon: typeof ListTodo; id: ViewMode; label: string }> = [
  { icon: ListTodo, id: "list", label: "List" },
  { icon: Columns3, id: "board", label: "Board" },
  { icon: GitBranch, id: "graph", label: "Graph" }
];

const graphCanvasPadding = 18;
const graphColumnGap = 72;
const graphGroupPadding = 14;
const graphNodeChromeHeight = 94;
const graphNodeMaxTitleLines = 6;
const graphNodeMinHeight = 150;
const graphNodeTitleCharsPerLine = 42;
const graphNodeTitleLineHeight = 20;
const graphNodeWidth = 420;
const graphRowGap = 18;
const projectStorageKey = "duneboard:selected-project";
const themeStorageKey = "duneboard:theme";

type GraphNodeLayout = {
  depth: number;
  height: number;
  renderAsGroup?: boolean;
  task: ParsedTask;
  width: number;
  x: number;
  y: number;
};

type GraphGroupLayout = {
  childCount: number;
  depth: number;
  height: number;
  nested: boolean;
  task: ParsedTask;
  width: number;
  x: number;
  y: number;
};

type GraphBoxLayout = {
  height: number;
  width: number;
  x: number;
  y: number;
};

type GraphPanState = {
  pointerId: number;
  scrollLeft: number;
  scrollTop: number;
  x: number;
  y: number;
};

type GraphEdgeLayout = {
  from: TaskId;
  kind: "dependency" | "hierarchy";
  path: string;
  to: TaskId;
};

type GraphLayout = {
  dependencyEdgeCount: number;
  edges: GraphEdgeLayout[];
  groups: GraphGroupLayout[];
  hierarchyEdgeCount: number;
  height: number;
  hiddenIsolatedCount: number;
  nodes: GraphNodeLayout[];
  width: number;
};

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
  const [theme, setTheme] = useState<ThemeMode>(() => initialTheme());

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    window.localStorage.setItem(themeStorageKey, theme);
  }, [theme]);

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

          <div className="toolbar-actions">
            <label className="search-box">
              <Search size={17} />
              <input
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search tasks"
                type="search"
                value={query}
              />
            </label>
            <button
              aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
              className="theme-toggle"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              title={theme === "dark" ? "Light theme" : "Dark theme"}
              type="button"
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
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

function initialTheme(): ThemeMode {
  const storedTheme = window.localStorage.getItem(themeStorageKey);

  if (storedTheme === "light" || storedTheme === "dark") {
    return storedTheme;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
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
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);
  const lastStatusIndexRef = useRef<number | undefined>(undefined);
  const statusClickShiftRef = useRef(false);
  const statusMenuRef = useRef<HTMLDivElement>(null);
  const selectedStatuses = statusFilterToSelectedStatuses(filters.status);
  const allStatusesSelected = selectedStatuses.length === statusOrder.length;
  const someStatusesSelected = selectedStatuses.length > 0;

  useEffect(() => {
    if (!statusMenuOpen) {
      return undefined;
    }

    const closeOnOutsidePointer = (event: PointerEvent) => {
      if (event.target instanceof Node && !statusMenuRef.current?.contains(event.target)) {
        setStatusMenuOpen(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setStatusMenuOpen(false);
      }
    };

    document.addEventListener("pointerdown", closeOnOutsidePointer);
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.removeEventListener("pointerdown", closeOnOutsidePointer);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [statusMenuOpen]);

  const setFilter = <Key extends keyof TaskFilters>(key: Key, value: TaskFilters[Key]) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const setSelectedStatuses = (statuses: TaskStatus[]) => {
    setFilter("status", normalizeStatusFilter(statuses));
  };

  const toggleAllStatuses = (checked: boolean) => {
    lastStatusIndexRef.current = undefined;
    setFilter("status", checked ? "all" : []);
  };

  const toggleStatus = (status: TaskStatus, checked: boolean, shiftKey: boolean) => {
    const statusIndex = statusOrder.indexOf(status);
    const nextStatuses = new Set(selectedStatuses);

    if (shiftKey && lastStatusIndexRef.current !== undefined) {
      const startIndex = Math.min(lastStatusIndexRef.current, statusIndex);
      const endIndex = Math.max(lastStatusIndexRef.current, statusIndex);

      statusOrder.slice(startIndex, endIndex + 1).forEach((rangeStatus) => {
        if (checked) {
          nextStatuses.add(rangeStatus);
        } else {
          nextStatuses.delete(rangeStatus);
        }
      });
    } else if (checked) {
      nextStatuses.add(status);
    } else {
      nextStatuses.delete(status);
    }

    lastStatusIndexRef.current = statusIndex;
    setSelectedStatuses(statusOrder.filter((orderedStatus) => nextStatuses.has(orderedStatus)));
  };

  return (
    <div className="filter-row">
      <Filter size={17} />
      <div className="status-filter" ref={statusMenuRef}>
        <button
          aria-expanded={statusMenuOpen}
          aria-haspopup="true"
          className="status-filter-button"
          onClick={() => setStatusMenuOpen((open) => !open)}
          type="button"
        >
          <span>Status</span>
          <strong>{statusFilterLabel(filters.status)}</strong>
          <ChevronDown size={15} />
        </button>
        {statusMenuOpen ? (
          <div aria-label="Status options" className="status-filter-menu" role="group">
            <label className="status-filter-option status-filter-option-all">
              <input
                checked={allStatusesSelected}
                onChange={(event) => toggleAllStatuses(event.currentTarget.checked)}
                ref={(input) => {
                  if (input) {
                    input.indeterminate = someStatusesSelected && !allStatusesSelected;
                  }
                }}
                type="checkbox"
              />
              <span>All statuses</span>
            </label>
            {statusOrder.map((status) => (
              <label className="status-filter-option" key={status}>
                <input
                  checked={selectedStatuses.includes(status)}
                  onChange={(event) => {
                    toggleStatus(status, event.currentTarget.checked, statusClickShiftRef.current);
                    statusClickShiftRef.current = false;
                  }}
                  onClick={(event) => {
                    statusClickShiftRef.current = event.shiftKey;
                  }}
                  type="checkbox"
                />
                <span>{statusLabels[status]}</span>
              </label>
            ))}
          </div>
        ) : null}
      </div>
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
        aria-label="Readiness"
        onChange={(event) => setFilter("readiness", event.target.value as TaskFilters["readiness"])}
        value={filters.readiness}
      >
        <option value="all">All readiness</option>
        {Object.entries(readinessLabels).map(([state, label]) => (
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
  const layout = useMemo(() => buildGraphLayout(tasks), [tasks]);
  const panViewportRef = useRef<HTMLDivElement>(null);
  const panStateRef = useRef<GraphPanState | undefined>(undefined);
  const [isPanning, setIsPanning] = useState(false);

  const startPanning = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0 || isGraphNodeTarget(event.target)) {
      return;
    }

    const viewport = panViewportRef.current;

    if (!viewport) {
      return;
    }

    panStateRef.current = {
      pointerId: event.pointerId,
      scrollLeft: viewport.scrollLeft,
      scrollTop: viewport.scrollTop,
      x: event.clientX,
      y: event.clientY
    };
    event.currentTarget.setPointerCapture(event.pointerId);
    setIsPanning(true);
    event.preventDefault();
  };

  const panGraph = (event: ReactPointerEvent<HTMLDivElement>) => {
    const panState = panStateRef.current;
    const viewport = panViewportRef.current;

    if (!panState || !viewport || event.pointerId !== panState.pointerId) {
      return;
    }

    viewport.scrollLeft = panState.scrollLeft - (event.clientX - panState.x);
    viewport.scrollTop = panState.scrollTop - (event.clientY - panState.y);
    event.preventDefault();
  };

  const stopPanning = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (panStateRef.current?.pointerId !== event.pointerId) {
      return;
    }

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    panStateRef.current = undefined;
    setIsPanning(false);
  };

  if (tasks.length === 0) {
    return (
      <section className="graph-view" aria-label="Dependency graph">
        <EmptyState />
      </section>
    );
  }

  return (
    <section className="graph-view" aria-label="Dependency graph">
      <div className="graph-summary">
        <span>{formatTaskCount(layout.nodes.length, "graph task")}</span>
        {layout.groups.length > 0 ? <span>{formatTaskCount(layout.groups.length, "container group")}</span> : null}
        <span>{formatTaskCount(layout.dependencyEdgeCount, "dependency", "dependencies")}</span>
        <span>{formatTaskCount(layout.hierarchyEdgeCount, "parent link")}</span>
        {layout.hiddenIsolatedCount > 0 ? <span>{formatTaskCount(layout.hiddenIsolatedCount, "isolated task")} hidden</span> : null}
      </div>
      <div className="graph-legend" aria-label="Graph edge legend">
        <span>
          <i className="dependency" />
          Dependency
        </span>
        <span>
          <i className="hierarchy" />
          Parent to child
        </span>
      </div>
      <div
        className={`graph-pan-area ${isPanning ? "panning" : ""}`}
        onLostPointerCapture={stopPanning}
        onPointerCancel={stopPanning}
        onPointerDown={startPanning}
        onPointerMove={panGraph}
        onPointerUp={stopPanning}
        ref={panViewportRef}
      >
        <div className="graph-canvas" style={{ height: layout.height, width: layout.width }}>
          {layout.groups.map((group) => (
            <div
              className={`graph-group ${group.task.kind} ${group.nested ? "nested" : ""} ${
                group.task.id === selectedTaskId ? "selected" : ""
              }`}
              key={group.task.id}
              style={{ height: group.height, left: group.x, top: group.y, width: group.width }}
            >
              <button
                className="graph-group-header"
                onClick={() => onSelect(group.task.id)}
                title={group.task.title}
                type="button"
              >
                <div className="node-topline">
                  <span>{group.task.id}</span>
                  <ReadinessPill state={readinessFor(group.task, board)} />
                </div>
                <strong>{group.task.title}</strong>
                <div className="node-pills">
                  <StatusPill status={group.task.status} />
                  <KindPill kind={group.task.kind} />
                  <span className="soft-pill">{formatTaskCount(group.childCount, "child", "children")}</span>
                </div>
              </button>
            </div>
          ))}
          <svg
            aria-hidden="true"
            className="graph-edges"
            height={layout.height}
            viewBox={`0 0 ${layout.width} ${layout.height}`}
            width={layout.width}
          >
            <defs>
              <marker
                id="dependency-arrow"
                markerHeight="10"
                markerWidth="10"
                orient="auto"
                refX="9"
                refY="5"
                viewBox="0 0 10 10"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" />
              </marker>
              <marker
                id="hierarchy-arrow"
                markerHeight="10"
                markerWidth="10"
                orient="auto"
                refX="9"
                refY="5"
                viewBox="0 0 10 10"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" />
              </marker>
            </defs>
            {layout.edges.map((edge) => (
              <path
                className={`graph-edge ${edge.kind}`}
                d={edge.path}
                key={`${edge.kind}-${edge.from}-${edge.to}`}
                markerEnd={edge.kind === "dependency" ? "url(#dependency-arrow)" : "url(#hierarchy-arrow)"}
              />
            ))}
          </svg>
          {layout.nodes.filter((node) => !node.renderAsGroup).map((node) => (
            <button
              className={`graph-node ${node.task.id === selectedTaskId ? "selected" : ""}`}
              key={node.task.id}
              onClick={() => onSelect(node.task.id)}
              style={{ height: node.height, left: node.x, top: node.y, width: node.width }}
              title={node.task.title}
              type="button"
            >
              <div className="node-topline">
                <span>{node.task.id}</span>
                <ReadinessPill state={readinessFor(node.task, board)} />
              </div>
              <strong>{node.task.title}</strong>
              <div className="node-pills">
                <StatusPill status={node.task.status} />
                <KindPill kind={node.task.kind} />
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function isGraphNodeTarget(target: EventTarget): boolean {
  return target instanceof Element && Boolean(target.closest(".graph-node, .graph-group-header"));
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
        {isClosedTask(task) ? null : <PriorityPill priority={task.priority} />}
        <StatusPill status={task.status} />
        <ReadinessPill state={readinessFor(task, board)} />
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
          {isClosedTask(task) ? null : <PriorityPill priority={task.priority} />}
          <KindPill kind={task.kind} />
          <ReadinessPill state={readinessFor(task, board)} />
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
  const readiness = readinessFor(task, board);

  return (
    <section className="detail-panel" ref={panelRef}>
      <div className="detail-heading">
        <span className="task-id">{task.id}</span>
        <h2>{task.title}</h2>
        <div className="detail-pills">
          {isClosedTask(task) ? null : <PriorityPill priority={task.priority} />}
          <StatusPill status={task.status} />
          <ReadinessPill state={readiness} />
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
      <DesignSection>{task.sections.Design}</DesignSection>

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

      <DetailSection title="Notes">{task.sections.Notes}</DetailSection>
      <DetailSection title="Open Questions">{task.sections["Open Questions"]}</DetailSection>
      <DetailSection title="Work Log">{task.sections["Work Log"]}</DetailSection>
    </section>
  );
}

function DesignSection({ children }: { children: string | undefined }) {
  if (!children?.trim()) {
    return null;
  }

  return (
    <details className="detail-section collapsible-section">
      <summary>
        <span>Design</span>
        <ChevronDown size={15} />
      </summary>
      <div className="markdown-text">{children}</div>
    </details>
  );
}

function DetailSection({ children, title }: { children: string | undefined; title: string }) {
  return (
    <section className="detail-section">
      <h3>{title}</h3>
      <div className="markdown-text">{children || "None"}</div>
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

function ReadinessPill({ state }: { state: ReadinessState | undefined }) {
  if (!state) {
    return null;
  }

  return (
    <span className={`readiness-pill ${state}`} title="Derived readiness">
      {readinessLabels[state]}
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
    task.sections.Design ?? "",
    task.sections.Notes ?? "",
    task.sections["Open Questions"] ?? ""
  ]
    .join(" ")
    .toLowerCase()
    .includes(normalizedQuery);
}

function taskMatchesFilters(task: ParsedTask, filters: TaskFilters, board: BoardIndex): boolean {
  if (!taskMatchesStatusFilter(task.status, filters.status)) {
    return false;
  }

  if (filters.kind !== "all" && task.kind !== filters.kind) {
    return false;
  }

  if (filters.label !== "all" && !task.labels.includes(filters.label)) {
    return false;
  }

  if (filters.readiness !== "all" && readinessFor(task, board) !== filters.readiness) {
    return false;
  }

  return true;
}

function normalizeStatusFilter(statuses: TaskStatus[]): StatusFilterValue {
  const orderedStatuses = statusOrder.filter((status) => statuses.includes(status));

  return orderedStatuses.length === statusOrder.length ? "all" : orderedStatuses;
}

function statusFilterLabel(filter: StatusFilterValue): string {
  const selectedStatuses = statusFilterToSelectedStatuses(filter);

  if (selectedStatuses.length === statusOrder.length) {
    return "All statuses";
  }

  if (selectedStatuses.length === 0) {
    return "No statuses";
  }

  if (selectedStatuses.length === 1) {
    const selectedStatus = selectedStatuses[0];

    return selectedStatus ? statusLabels[selectedStatus] : "No statuses";
  }

  if (selectedStatuses.length === statusOrder.length - 1) {
    const omittedStatus = statusOrder.find((status) => !selectedStatuses.includes(status));

    return omittedStatus ? `All except ${statusLabels[omittedStatus]}` : `${selectedStatuses.length} statuses`;
  }

  return `${selectedStatuses.length} statuses`;
}

function statusFilterToSelectedStatuses(filter: StatusFilterValue): TaskStatus[] {
  if (filter === "all") {
    return statusOrder;
  }

  return statusOrder.filter((status) => filter.includes(status));
}

function taskMatchesStatusFilter(status: TaskStatus, filter: StatusFilterValue): boolean {
  return statusFilterToSelectedStatuses(filter).includes(status);
}

function isClosedTask(task: ParsedTask): boolean {
  return task.status === "done" || task.status === "canceled";
}

function readinessFor(task: ParsedTask, board: BoardIndex): ReadinessState | undefined {
  if (!executableTaskKinds.includes(task.kind)) {
    return task.status === "done" || task.status === "canceled" ? undefined : "planning";
  }

  if (task.status !== "ready") {
    return undefined;
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

function formatTaskCount(count: number, singularLabel: string, pluralLabel = `${singularLabel}s`): string {
  return `${count} ${count === 1 ? singularLabel : pluralLabel}`;
}

function buildGraphLayout(tasks: ParsedTask[]): GraphLayout {
  const visibleIds = new Set(tasks.map((task) => task.id));
  const connectedIds = new Set<TaskId>();
  const hasHierarchyEdges = tasks.some((task) => task.parent && visibleIds.has(task.parent));

  tasks.forEach((task) => {
    task.depends_on.forEach((dependencyId) => {
      if (!visibleIds.has(dependencyId)) {
        return;
      }

      connectedIds.add(task.id);
      connectedIds.add(dependencyId);
    });

    if (task.parent && visibleIds.has(task.parent)) {
      connectedIds.add(task.id);
      connectedIds.add(task.parent);
    }
  });

  const layoutTasks = connectedIds.size > 0 ? tasks.filter((task) => connectedIds.has(task.id)) : tasks;
  const nodes = hasHierarchyEdges ? positionGraphNodesByHierarchy(layoutTasks) : positionGraphNodesByLevels(layoutTasks);
  const childrenByParent = groupTasksByParent(layoutTasks);
  const groups = hasHierarchyEdges ? buildGraphGroups(nodes, childrenByParent) : [];

  const nodesById = new Map(nodes.map((node) => [node.task.id, node]));
  const edges: GraphEdgeLayout[] = [];

  const addEdge = (fromId: TaskId, toNode: GraphNodeLayout, kind: GraphEdgeLayout["kind"]) => {
    const fromNode = nodesById.get(fromId);

    if (!fromNode) {
      return;
    }

    const startX = fromNode.x + fromNode.width;
    const startY = fromNode.y + fromNode.height / 2;
    const endX = toNode.x;
    const endY = toNode.y + toNode.height / 2;
    const middleX = startX + Math.max((endX - startX) / 2, 36);

    edges.push({
      from: fromId,
      kind,
      path:
        kind === "hierarchy"
          ? `M ${startX} ${startY} H ${middleX} V ${endY} H ${endX}`
          : `M ${startX} ${startY} C ${middleX} ${startY} ${middleX} ${endY} ${endX} ${endY}`,
      to: toNode.task.id
    });
  };

  nodes.forEach((node) => {
    node.task.depends_on.forEach((dependencyId) => {
      addEdge(dependencyId, node, "dependency");
    });

    if (node.task.parent) {
      addEdge(node.task.parent, node, "hierarchy");
    }
  });

  return {
    dependencyEdgeCount: edges.filter((edge) => edge.kind === "dependency").length,
    edges,
    groups,
    hierarchyEdgeCount: edges.filter((edge) => edge.kind === "hierarchy").length,
    height: graphExtent([...nodes, ...groups], "height"),
    hiddenIsolatedCount: connectedIds.size > 0 ? tasks.length - layoutTasks.length : 0,
    nodes,
    width: graphExtent([...nodes, ...groups], "width")
  };
}

function positionGraphNodesByHierarchy(tasks: ParsedTask[]): GraphNodeLayout[] {
  const visibleIds = new Set(tasks.map((task) => task.id));
  const order = new Map(tasks.map((task, index) => [task.id, index]));
  const childrenByParent = groupTasksByParent(tasks);

  childrenByParent.forEach((children) => {
    children.sort((left, right) => (order.get(left.id) ?? 0) - (order.get(right.id) ?? 0));
  });

  const roots = tasks
    .filter((task) => !task.parent || !visibleIds.has(task.parent))
    .sort((left, right) => (order.get(left.id) ?? 0) - (order.get(right.id) ?? 0));
  const nodes: GraphNodeLayout[] = [];
  let nextNodeY = graphCanvasPadding;

  const placeTask = (task: ParsedTask, depth: number, path = new Set<TaskId>()) => {
    if (path.has(task.id)) {
      return;
    }

    const height = graphNodeHeightFor(task);
    const y = nextNodeY;
    nextNodeY += height + graphRowGap;

    nodes.push({
      depth,
      height,
      renderAsGroup: childrenByParent.has(task.id),
      task,
      width: graphNodeWidth,
      x: graphCanvasPadding + depth * (graphNodeWidth + graphColumnGap),
      y
    });

    const children = childrenByParent.get(task.id) ?? [];
    children.forEach((child) => placeTask(child, depth + 1, new Set([...path, task.id])));
  };

  roots.forEach((root) => placeTask(root, 0));

  return nodes.sort((left, right) => left.x - right.x || left.y - right.y);
}

function positionGraphNodesByLevels(tasks: ParsedTask[]): GraphNodeLayout[] {
  const levels = groupTasksByDependencyLevel(tasks);
  const nodes: GraphNodeLayout[] = [];

  levels.forEach((level, levelIndex) => {
    let y = graphCanvasPadding;

    level.forEach((task) => {
      const height = graphNodeHeightFor(task);

      nodes.push({
        depth: levelIndex,
        height,
        task,
        width: graphNodeWidth,
        x: graphCanvasPadding + levelIndex * (graphNodeWidth + graphColumnGap),
        y
      });

      y += height + graphRowGap;
    });
  });

  return nodes;
}

function groupTasksByParent(tasks: ParsedTask[]): Map<TaskId, ParsedTask[]> {
  const visibleIds = new Set(tasks.map((task) => task.id));
  const childrenByParent = new Map<TaskId, ParsedTask[]>();

  tasks.forEach((task) => {
    if (!task.parent || !visibleIds.has(task.parent)) {
      return;
    }

    childrenByParent.set(task.parent, [...(childrenByParent.get(task.parent) ?? []), task]);
  });

  return childrenByParent;
}

function buildGraphGroups(nodes: GraphNodeLayout[], childrenByParent: Map<TaskId, ParsedTask[]>): GraphGroupLayout[] {
  const nodesById = new Map(nodes.map((node) => [node.task.id, node]));

  return nodes
    .filter((node) => childrenByParent.has(node.task.id))
    .map((node) => {
      const descendantNodes = collectGraphDescendants(node.task.id, childrenByParent, nodesById);
      const containedNodes = [node, ...descendantNodes];
      const minX = Math.max(0, Math.min(...containedNodes.map((containedNode) => containedNode.x)) - graphGroupPadding);
      const minY = Math.max(0, Math.min(...containedNodes.map((containedNode) => containedNode.y)) - graphGroupPadding);
      const maxX = Math.max(...containedNodes.map((containedNode) => containedNode.x + containedNode.width));
      const maxY = Math.max(...containedNodes.map((containedNode) => containedNode.y + containedNode.height));

      return {
        childCount: childrenByParent.get(node.task.id)?.length ?? 0,
        depth: node.depth,
        height: maxY - minY + graphGroupPadding,
        nested: Boolean(node.task.parent && childrenByParent.has(node.task.parent)),
        task: node.task,
        width: maxX - minX + graphGroupPadding,
        x: minX,
        y: minY
      };
    })
    .sort((left, right) => left.depth - right.depth || left.y - right.y || left.x - right.x);
}

function collectGraphDescendants(
  taskId: TaskId,
  childrenByParent: Map<TaskId, ParsedTask[]>,
  nodesById: Map<TaskId, GraphNodeLayout>,
  path = new Set<TaskId>()
): GraphNodeLayout[] {
  if (path.has(taskId)) {
    return [];
  }

  const nextPath = new Set([...path, taskId]);
  const descendants: GraphNodeLayout[] = [];

  (childrenByParent.get(taskId) ?? []).forEach((child) => {
    const childNode = nodesById.get(child.id);

    if (!childNode) {
      return;
    }

    descendants.push(childNode, ...collectGraphDescendants(child.id, childrenByParent, nodesById, nextPath));
  });

  return descendants;
}

function graphNodeHeightFor(task: ParsedTask): number {
  const estimatedTitleLines = Math.min(
    graphNodeMaxTitleLines,
    Math.max(2, Math.ceil(task.title.length / graphNodeTitleCharsPerLine))
  );

  return Math.max(graphNodeMinHeight, graphNodeChromeHeight + estimatedTitleLines * graphNodeTitleLineHeight);
}

function graphExtent(nodes: GraphBoxLayout[], axis: "height" | "width"): number {
  const minimum = axis === "height" ? 360 : 860;
  const edge = axis === "height" ? "y" : "x";
  const size = axis === "height" ? "height" : "width";
  const maxNodeEdge = Math.max(...nodes.map((node) => node[edge] + node[size]), 0);

  return Math.max(minimum, maxNodeEdge + graphCanvasPadding);
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
