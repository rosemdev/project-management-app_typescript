import { Project, ProjectStatus } from '../models/project';

type Listener<T> = (items: T[]) => void;

// class State
class State<T> {
	protected listeners: Listener<T>[] = [];

	addListener(listenerFn: Listener<T>) {
		this.listeners.push(listenerFn);
	}
}

//Project state management
export class ProjectState extends State<Project> {
	private projects: Project[] = [];
	private static instance: ProjectState;

	private constructor() {
		super();
	}

	static getInstance() {
		if (this.instance) {
			return this.instance;
		}

		this.instance = new ProjectState();

		return this.instance;
	}

	addProject(title: string, description: string, people: number) {
		const newProject = new Project(
			title,
			description,
			people,
			ProjectStatus.Active
		);

		this.projects.push(newProject);
		this.updateListeners();
	}

	moveProject(projectId: string, newStatus: ProjectStatus) {
		const project = this.projects.find((item) => {
			return item.id === projectId;
		});

		if (project && project.projectStatus !== newStatus) {
			project.projectStatus = newStatus;
			this.updateListeners();
		}
	}

	private updateListeners() {
		for (const listenerFn of this.listeners) {
			listenerFn(this.projects.slice());
		}
	}
}

export const projectState = ProjectState.getInstance();
