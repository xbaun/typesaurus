import * as testing from '@firebase/rules-unit-testing';

export default async () => {
	console.log("------- 1");
	(global as any).__FIREBASE_CTX__ = await testing.initializeTestEnvironment({projectId: 'project-id'}).then(env => env.unauthenticatedContext());
	console.log("------- 2")
};
