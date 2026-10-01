import { createCollectionRepo } from "./collectionRepo";

export const examsRepo = createCollectionRepo("exams", "exam");
export const examMarksRepo = createCollectionRepo("examMarks", "mark");
