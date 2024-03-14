import { Component } from './base-component.js';
import { Validatable } from '../utils/validation.js';
import { validate } from '../utils/validation.js';
import { projectState } from '../state/project-state.js';
import { autobind } from '../decorators/autobind.js';

//Project input class
export class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
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
