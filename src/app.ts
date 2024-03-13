/// <reference path="interfaces/drag-drop.ts"/>
/// <reference path="models/project.ts"/>
/// <reference path="state/project-state.ts"/>
/// <reference path="utils/validation.ts"/>
/// <reference path="decorators/autobind.ts"/>
/// <reference path="components/project-list.ts"/>
/// <reference path="components/project-input.ts"/>

namespace App {
	new ProjectInput();
	new ProjectList('finished');
	new ProjectList('active');
}
