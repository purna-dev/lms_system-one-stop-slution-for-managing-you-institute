import { createCollectionRepo } from "./collectionRepo";

export const auditRepo = createCollectionRepo("auditLog", "aud");
