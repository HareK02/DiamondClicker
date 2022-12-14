class GameSpeedManager {

    constructor(fps) {
        this.set_fps(fps);
    }

    set_fps = function (fps) {
        this.goal_fps = fps;
        this.start_time = new Date().getTime();
        this.end_time = 0;
        this.total_first_time = this.start_time;
        this.total_count = 0;
        this.real_fps = 0;
    }

    finish = function () {
        this.end_time = new Date().getTime();
        this.total_count++;

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
}

class GameLoopManager {
    constructor(func, cps, debug = false) {
        this.func = func
        this.cps = cps
        this.mpc = 1000 / this.cps
        this.debug = debug

        this.total_count = 0
        this.total_time = 0
    }
    start() {
        this.leastDelta = 0
        this.start_time = Date.now()
        this.leastTime = Date.now()
        this.done()//ここでdoneではなくfuncをtimeout付けて実行がいい(その前にtotal関連の処理も必要)
    }

    done() {
        let now = Date.now()
        let deltaTime = now - this.leastTime
        let delta = this.leastDelta - deltaTime
        this.leastDelta = Math.max(0, this.mpc + delta)
        if (this.debug) console.log(deltaTime, "(", this.leastDelta, ")", this.total_time / this.total_count)
        setTimeout(this.func, this.leastDelta)
        this.leastTime = now

        this.total_count++
        this.total_time += deltaTime
    }

    refresh_total() {
        this.total_count = 1
        this.total_time = this.leastDelta
    }
}