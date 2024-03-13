// autobind decorator
function autobind(
	originalMethod: any,
	context: ClassMethodDecoratorContext<any>
) {
	const methodName = context.name;

	context.addInitializer(function () {
		this[methodName] = this[methodName].bind(this);
	});

	function replacementMethod(this: any, ...args: any[]) {
		console.log('LOG: Entering method.');
		originalMethod.call(this, ...args);
		console.log('LOG: Exiting method.');
	}
	return replacementMethod;
}

interface Validatable {
	value: string | number;
	required?: boolean;
	minLength?: number;
	maxLength?: number;
	min?: number;
	max?: number;
}

function validate(validatableInput: Validatable) {
	let isValid = true;

	if (validatableInput.required) {
		isValid = isValid && validatableInput.value.toString().length > 0;
	}

	if (
		validatableInput.minLength !== undefined &&
		typeof validatableInput.value === 'string'
	) {
		isValid =
			isValid && validatableInput.value.length > validatableInput.minLength;
	}

	if (
		validatableInput.maxLength !== undefined &&
		typeof validatableInput.value === 'string'
	) {
		isValid =
			isValid && validatableInput.value.length < validatableInput.maxLength;
	}

	if (
		validatableInput.min !== undefined &&
		typeof validatableInput.value === 'number'
	) {
		isValid = isValid && validatableInput.value > validatableInput.min;
	}

	if (
		validatableInput.max !== undefined &&
		typeof validatableInput.value === 'number'
	) {
		isValid = isValid && validatableInput.value < validatableInput.max;
	}

	return isValid;
}

enum ProjectStatus {
	Active,
	Finished,
}

//Project Type
class Project {
	id: string;

	constructor(
		public title: string,
		public descripton: string,
		public people: number,
		public projectStatus: ProjectStatus
	) {
		this.id = new Date().getTime().toString();
		this.title = title;
		this.descripton = descripton;
		this.people = people;
	}
}

type Listener<T> = (items: T[]) => void;

// class State
class State<T> {
	protected listeners: Listener<T>[] = [];

	addListener(listenerFn: Listener<T>) {
		this.listeners.push(listenerFn);
	}
}

//Project state management
class ProjectState extends State<Project> {
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

		for (const listenerFn of this.listeners) {
			listenerFn(this.projects.slice());
		}
	}
}

const projectState = ProjectState.getInstance();

// Component Base class
abstract class Component<T extends HTMLElement, U extends HTMLElement> {
	templateElement: HTMLTemplateElement;
	hostElement: T;
	element: U;

	constructor(
		templateId: string,
		hostElementId: string,
		insertAtStart: boolean,
		newElementId?: string
	) {
		this.templateElement = document.getElementById(
			templateId
		)! as HTMLTemplateElement;
		this.hostElement = document.getElementById(hostElementId)! as T;

		const importedNode = document.importNode(
			this.templateElement.content,
			true
		);

		this.element = importedNode.firstElementChild as U;

		if (newElementId) {
			this.element.id = newElementId;
		}

		this.attach(insertAtStart);
	}

	private attach(insertAtStart: boolean) {
		this.hostElement.insertAdjacentElement(
			insertAtStart ? 'afterbegin' : 'beforeend',
			this.element
		);
	}

	abstract configure(): void;
	abstract renderContent(): void;
}

//Project Item class
class ProjectItem extends Component<HTMLUListElement, HTMLLIElement>{
	private project: Project;

	get persons() {
		if (this.project.people == 1) {
			return '1 person'
		} else {
			return `${this.project.people} persons`
		}
	}

	constructor(hostId: string, project: Project) {
		super('single-project', hostId, false, project.id);
		this.project = project;
		this.configure();
		this.renderContent();
	}

	configure(): void {
		
	}
	renderContent(): void {
		this.element.querySelector('h2')!.textContent = this.project.title ; 
		this.element.querySelector('h3')!.textContent = this.persons + ' assigned' ; 
		this.element.querySelector('p')!.textContent = this.project.descripton ; 
	}
}

//Project List class
class ProjectList extends Component<HTMLDivElement, HTMLElement> {
	assignProjects: Project[];

	constructor(private type: 'active' | 'finished') {
		super('project-list', 'app', false, `${type}-projects`);

		this.assignProjects = [];
		this.configure();
		this.renderContent();
	}

	configure(): void {
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

//Project input class
class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
	titleInputElement: HTMLInputElement;
	descriptionInputElement: HTMLInputElement;
	peopleInputElement: HTMLInputElement;

	constructor() {
		super('project-input', 'app', true, 'user-input');

		this.titleInputElement = this.element.querySelector(
			'#title'
		) as HTMLInputElement;
		this.descriptionInputElement = this.element.querySelector(
			'#description'
		) as HTMLInputElement;
		this.peopleInputElement = this.element.querySelector(
			'#people'
		) as HTMLInputElement;

		this.configure();
	}

	configure() {
		this.element.addEventListener('submit', this.submitHandler);
	}

	renderContent(): void {}

	private gatherUserInput(): [string, string, number] | void {
		const title = this.titleInputElement.value.trim();
		const description = this.descriptionInputElement.value.trim();
		const people = this.peopleInputElement.value.trim();

		const titleValidatable: Validatable = {
			value: title,
			required: true,
			minLength: 2,
			maxLength: 100,
		};
		const descriptionValidatable: Validatable = {
			value: title,
			required: true,
			minLength: 3,
			maxLength: 1000,
		};
		const peopleValidatable: Validatable = {
			value: title,
			required: true,
			min: 1,
		};

		if (
			!validate(titleValidatable) ||
			!validate(descriptionValidatable) ||
			!validate(peopleValidatable)
		) {
			alert('Invalid input!');

			return;
		}

		return [title, description, +people];
	}

	private clearInputs() {
		this.titleInputElement.value = '';
		this.descriptionInputElement.value = '';
		this.peopleInputElement.value = '';
	}

	@autobind
	private submitHandler(event: Event) {
		event.preventDefault();
		const userInput = this.gatherUserInput();

		if (!userInput) {
			return;
		}

		const [title, description, people] = userInput;

		projectState.addProject(title, description, people);
		this.clearInputs();
	}
}

const projectInput = new ProjectInput();
const activeProjectList = new ProjectList('finished');
const finishedProjectList = new ProjectList('active');
