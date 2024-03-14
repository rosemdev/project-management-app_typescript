	// autobind decorator
	export function autobind(
		originalMethod: any,
		context: ClassMethodDecoratorContext<any>
	) {
		const methodName = context.name;

		context.addInitializer(function () {
			this[methodName] = this[methodName].bind(this);
		});

		function replacementMethod(this: any, ...args: any[]) {
			// console.log('LOG: Entering method.');
			originalMethod.call(this, ...args);
			// console.log('LOG: Exiting method.');
		}
		return replacementMethod;
	}
