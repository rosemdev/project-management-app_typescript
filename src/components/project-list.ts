import { Component } from './base-component';
import { autobind } from '../decorators/autobind';
import { Project, ProjectStatus } from '../models/project';
import { DragTarget } from '../interfaces/drag-drop';
import { projectState } from '../state/project-state';
import { ProjectItem } from './project-item';

//Project List class
export class ProjectList
	extends Component<HTMLDivElement, HTMLElement>
	implements DragTarget
{
	assignProjects: Project[];

	constructor(private type: 'active' | 'finished') {
		super('project-list', 'app', false, `${type}-projects`);

		this.assignProjects = [];
		this.configure();
		this.renderContent();
	}

	@autobind
	dragOverHandler(event: DragEvent): void {
		if (event.dataTransfer && event.dataTransfer.types[0] === 'text/plain') {
			event.preventDefault();
			const listEl = this.element.querySelector('ul')!;
			listEl.classList.add('droppable');
		}
	}

	@autobind
	dropHandler(event: DragEvent): void {
		const projectId = event.dataTransfer!.getData('text/plain');
		console.log(this.type);
		projectState.moveProject(
			projectId,
			this.type === 'active' ? ProjectStatus.Active : ProjectStatus.Finished
		);

		const listEl = this.element.querySelector('ul')!;
		listEl.classList.remove('droppable');
	}

	@autobind
	dragLeaveHandler(_event: DragEvent): void {
		const listEl = this.element.querySelector('ul')!;
		listEl.classList.remove('droppable');
	}

	configure(): void {
		this.element.addEventListener('dragover', this.dragOverHandler);
		this.element.addEventListener('drop', this.dropHandler);
		this.element.addEventListener('dragleave', this.dragLeaveHandler);

		projectState.addListener((projects: Project[]) => {
			const relevantProjects: Project[] = projects.filter((item) => {
				if (this.type === 'active') {
					return item.projectStatus === ProjectStatus.Active;
				}

				return item.projectStatus === ProjectStatus.Finished;
			});
			this.assignProjects = relevantProjects;
			this.renderProjects();
		});
	}

	renderContent() {
		const listId = `${this.type}-projects-list`;
		this.element.querySelector('ul')!.id = listId;
		this.element.querySelector('h2')!.textContent =
			this.type.toLocaleUpperCase() + ' PROJECTS';
	}

	private renderProjects() {
		const listElement = document.getElementById(
			`${this.type}-projects-list`
		)! as HTMLUListElement;

		listElement.innerHTML = '';

		for (const project of this.assignProjects) {
			new ProjectItem(this.element.querySelector('ul')!.id, project);
		}
	}
}
