import { createCollectionRepo } from "./collectionRepo";

export const assignmentsRepo = createCollectionRepo("assignments", "asg");
export const submissionsRepo = createCollectionRepo("submissions", "sub");
