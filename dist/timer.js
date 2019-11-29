import { __awaiter } from "tslib";
var TaskState;
(function (TaskState) {
    TaskState[TaskState["FIRST_DELAY"] = 0] = "FIRST_DELAY";
    TaskState[TaskState["PERIOD"] = 1] = "PERIOD";
})(TaskState || (TaskState = {}));
function storeTaskContext(map, taskContext) {
    let id;
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
    constructor() {
        this.onError = null;
        this._tasks = {};
    }
    cancel() {
        for (let taskId in this._tasks) {
            let taskCtx = this._tasks[taskId];
            this._stopTask(taskCtx);
            delete this._tasks[taskId];
        }
    }
    _errorHandler(e) {
        if (this.onError) {
            this.onError(e);
        }
        else {
            console.error(e);
        }
    }
    _nextFixedDelayTask(taskCtx) {
        taskCtx.timerId = setTimeout(() => __awaiter(this, void 0, void 0, function* () {
            let err;
            try {
                yield taskCtx.task();
            }
            catch (e) {
                this._errorHandler(e);
            }
            this._nextFixedDelayTask(taskCtx);
        }), taskCtx.period);
    }
    _startSchedule(taskCtx) {
        taskCtx.timerId = setTimeout(() => __awaiter(this, void 0, void 0, function* () {
            let err;
            taskCtx.state = TaskState.PERIOD;
            if (!taskCtx.fixedDelay && taskCtx.period) {
                taskCtx.timerId = setInterval(taskCtx.task, taskCtx.period);
            }
            try {
                yield taskCtx.task();
            }
            catch (e) {
                this._errorHandler(e);
            }
            if (taskCtx.fixedDelay && taskCtx.period) {
                this._nextFixedDelayTask(taskCtx);
            }
        }), taskCtx.delay);
    }
    schedule(task, delay, period) {
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
    scheduleAtFixedRate(task, delay, period) {
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
    _stopTask(taskCtx) {
        if (taskCtx.state == TaskState.FIRST_DELAY) {
            clearTimeout(taskCtx.timerId);
        }
        else {
            if (taskCtx.fixedDelay) {
                clearTimeout(taskCtx.timerId);
            }
            else {
                clearInterval(taskCtx.timerId);
            }
        }
        taskCtx.timerId = undefined;
    }
    removeTask(taskId) {
        let taskCtx = this._tasks[taskId];
        if (taskCtx) {
            delete this._tasks[taskId];
        }
        this._stopTask(taskCtx);
    }
}
export default Timer;
//# sourceMappingURL=timer.js.map