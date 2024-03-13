/// <reference path="components/project-list.ts"/>
/// <reference path="components/project-input.ts"/>

namespace App {
	new ProjectInput();
	new ProjectList('finished');
	new ProjectList('active');
}
