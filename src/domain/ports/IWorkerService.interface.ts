export type QueueJobCallback = (
  data?: Record<string, any>,
) => void | Promise<void>;

export interface IWorkerService {
  addJob: (
    event_type: string,
    data?: Record<string, any>,
    callback?: QueueJobCallback,
  ) => Promise<string>;
  registerJobHandler: (event_type: string, callback: QueueJobCallback) => void;
}
