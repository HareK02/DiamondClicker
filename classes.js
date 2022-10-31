class GameSpeedManager {

<<<<<<< Updated upstream
    constructor(fps) {
        this.set_fps(fps);
    }

    set_fps = function (fps) {
        this.goal_fps = fps;
        this.start_time = new Date().getTime();
=======
    constructor(tps, fps) {
        this.set_param(tps, fps);
    }

    set_param = function (tps, fps) {
        this.times_all_second = this.leastCommonMultiple(tps, fps);
        this.times_tick_secound = this.times_all_second / tps;
        this.times_frame_secound = this.times_all_second / fps;
        this.interval = 1000 / this.times_all_second;
        this.count_second = 0;

        this.start_time = Date.now();
>>>>>>> Stashed changes
        this.end_time = 0;
        this.total_first_time = this.start_time;
        this.total_count = 0;
        this.real_fps = 0;
    }

    finish = function () {
<<<<<<< Updated upstream
        this.end_time = new Date().getTime();
        this.total_count++;
=======
        this.end_time = Date.now();
>>>>>>> Stashed changes

        if (this.total_count > this.goal_fps) {
            this.real_fps = 1000 * this.total_count / (this.end_time - this.total_first_time);
            this.total_first_time = this.end_time;
            this.total_count = 0;
        }

        let delta = this.end_time - this.start_time;
        delta = Math.max(0, 1000 / this.goal_fps - delta);

        this.start_time = this.end_time + delta;

        return delta;
    }
<<<<<<< Updated upstream
=======

    shouldExecuteTick = function () {
        let flag = this.count_second % this.times_tick_secound == 0;
        if (flag) this.total_tick_count++;

        return flag;
    }
    shouldExecuteDraw = function () {
        let flag = this.count_second % this.times_frame_secound == 0;
        if (flag) this.total_frame_count++;

        return flag;
    }

    leastCommonMultiple = function (a, b) {
        let i = Math.floor(Math.max(a, b));
        let j = Math.floor(Math.min(a, b));

        let l = i % j;
        while (l != 0) {
            i = j;
            j = l;
            l = i % j;
        }

        return a * b / j;
    }
>>>>>>> Stashed changes
}

class GameLoopManager {
    constructor(func, cps) {
        this.func = func
        this.cps = cps
        this.mpc = 1000 / this.cps
    }
    start() {
        this.leastTime = Date.now()
        done()
    }

    done() {
        this.deltaTime = Date.now() - leastTime;
        this.delta = mpc - this.deltaTime
        this.leastTime = Date.now()
        setTimeout(delta.func, 30);
    }
}