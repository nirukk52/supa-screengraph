import { getInfra, resetInfra } from "./infra";

export const bus = getInfra().bus;
export const queue = getInfra().queue;

export { resetInfra };
