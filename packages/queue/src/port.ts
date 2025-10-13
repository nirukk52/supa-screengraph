export interface QueuePort {
	enqueue<T>(name: string, data: T): Promise<void>;
	worker<T>(name: string, handler: (data: T) => Promise<void>): void;
}
