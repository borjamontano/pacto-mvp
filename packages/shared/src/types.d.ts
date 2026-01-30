export declare enum HouseholdRole {
    OWNER = "OWNER",
    MEMBER = "MEMBER"
}
export declare enum PactStatus {
    PENDING = "PENDING",
    DOING = "DOING",
    DONE = "DONE"
}
export declare enum PactActivityType {
    CREATED = "CREATED",
    UPDATED = "UPDATED",
    ASSIGNED = "ASSIGNED",
    UNASSIGNED = "UNASSIGNED",
    STATUS_CHANGED = "STATUS_CHANGED",
    DONE = "DONE",
    CONFIRMED = "CONFIRMED",
    COMMENT = "COMMENT"
}
export declare enum DevicePlatform {
    ios = "ios",
    android = "android"
}
export type Cursor = {
    createdAt: string;
    id: string;
};
