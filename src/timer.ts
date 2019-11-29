import {
    TaskId,
    TimerTask,
    errorCallback
} from "./types";

enum TaskState {
    FIRST_DELAY,
    PERIOD
}

interface ITaskContext {
    id: number;
    state: TaskState;
    task: TimerTask;
    delay: number;
    period?: number;
    fixedDelay: boolean;
    timerId: any;
}

type TaskContextMap = Record<TaskId, ITaskContext>;

function storeTaskContext(map: TaskContextMap, taskContext: ITaskContext): ITaskContext {
    let id: number;
    let remainingCount = 100;
    do {
        id = Math.random();
        if (typeof map[id] === 'undefined') {
            break;
        }
        id = 0;
    } while (--remainingCount > 0);
    if (id <= 0) {
        throw Error('Failed generate id');
    }
    map[id] = taskContext;
    taskContext.id = id;
    return taskContext;
}

class Timer {
    public onError: errorCallback | null = null;

    private _tasks: TaskContextMap = {};

    cancel() {
        for(let taskId in this._tasks) {
            let taskCtx = this._tasks[taskId];
            this._stopTask(taskCtx);
            delete this._tasks[taskId];
        }
    }

    private _errorHandler(e: any): void {
        if (this.onError) {
            this.onError(e);
        } else {
            console.error(e);
        }
    }

    private _nextFixedDelayTask(taskCtx: ITaskContext) {
        taskCtx.timerId = setTimeout(async () => {
            let err;
            try {
                await taskCtx.task();
            } catch (e) {
                this._errorHandler(e);
            }
            this._nextFixedDelayTask(taskCtx);
        }, taskCtx.period);
    }

    private _startSchedule(taskCtx: ITaskContext) {
        taskCtx.timerId = setTimeout(async () => {
            let err;
            taskCtx.state = TaskState.PERIOD;
            if (!taskCtx.fixedDelay && taskCtx.period) {
                taskCtx.timerId = setInterval(taskCtx.task, taskCtx.period);
            }
            try {
                await taskCtx.task();
            } catch(e) {
                this._errorHandler(e);
            }
            if (taskCtx.fixedDelay && taskCtx.period) {
                this._nextFixedDelayTask(taskCtx);
            }
        }, taskCtx.delay);
    }

    schedule(task: TimerTask, delay: number, period?: number): TaskId {
        const taskCtx = storeTaskContext(this._tasks, {
            id: 0,
            state: TaskState.FIRST_DELAY,
            fixedDelay: false,
            delay: delay,
            period: period,
            task: task,
            timerId: undefined
        });
        this._startSchedule(taskCtx);
        return taskCtx.id;
    }

    scheduleAtFixedRate(task: TimerTask, delay: number, period?: number): TaskId {
        const taskCtx = storeTaskContext(this._tasks, {
            id: 0,
            state: TaskState.FIRST_DELAY,
            fixedDelay: true,
            delay: delay,
            period: period,
            task: task,
            timerId: undefined
        });
        this._startSchedule(taskCtx);
        return taskCtx.id;
    }

    _stopTask(taskCtx: ITaskContext) {
        if (taskCtx.state == TaskState.FIRST_DELAY) {
            clearTimeout(taskCtx.timerId);
        }else{
            if (taskCtx.fixedDelay) {
                clearTimeout(taskCtx.timerId);
            }else{
                clearInterval(taskCtx.timerId);
            }
        }
        taskCtx.timerId = undefined;
    }

    removeTask(taskId: TaskId) {
        let taskCtx = this._tasks[taskId];
        if (taskCtx) {
            delete this._tasks[taskId];
        }
        this._stopTask(taskCtx);
    }
}

export default Timer;
