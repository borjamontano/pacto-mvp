"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DevicePlatform = exports.PactActivityType = exports.PactStatus = exports.HouseholdRole = void 0;
var HouseholdRole;
(function (HouseholdRole) {
    HouseholdRole["OWNER"] = "OWNER";
    HouseholdRole["MEMBER"] = "MEMBER";
})(HouseholdRole || (exports.HouseholdRole = HouseholdRole = {}));
var PactStatus;
(function (PactStatus) {
    PactStatus["PENDING"] = "PENDING";
    PactStatus["DOING"] = "DOING";
    PactStatus["DONE"] = "DONE";
})(PactStatus || (exports.PactStatus = PactStatus = {}));
var PactActivityType;
(function (PactActivityType) {
    PactActivityType["CREATED"] = "CREATED";
    PactActivityType["UPDATED"] = "UPDATED";
    PactActivityType["ASSIGNED"] = "ASSIGNED";
    PactActivityType["UNASSIGNED"] = "UNASSIGNED";
    PactActivityType["STATUS_CHANGED"] = "STATUS_CHANGED";
    PactActivityType["DONE"] = "DONE";
    PactActivityType["CONFIRMED"] = "CONFIRMED";
    PactActivityType["COMMENT"] = "COMMENT";
})(PactActivityType || (exports.PactActivityType = PactActivityType = {}));
var DevicePlatform;
(function (DevicePlatform) {
    DevicePlatform["ios"] = "ios";
    DevicePlatform["android"] = "android";
})(DevicePlatform || (exports.DevicePlatform = DevicePlatform = {}));
//# sourceMappingURL=types.js.map