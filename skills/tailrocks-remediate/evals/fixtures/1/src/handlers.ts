export const loadUser = (id: string | null) => id && databaseLookup(id);
export const updateUser = (id: string | null) => id && databaseUpdate(id);
export const deleteUser = (id: string | null) => id && databaseDelete(id);

declare function databaseLookup(id: string): unknown;
declare function databaseUpdate(id: string): unknown;
declare function databaseDelete(id: string): unknown;
