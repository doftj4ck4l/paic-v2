export const CLASS_TAB_IDS = ["overview", "assignments", "materials", "students", "progress"] as const;
export type ClassTabId = (typeof CLASS_TAB_IDS)[number];
