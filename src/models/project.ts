namespace App {
	export enum ProjectStatus {
		Active,
		Finished,
	}

	//Project Type
	export class Project {
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
}
