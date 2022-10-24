class GameSpeedManager {

    constructor(fps) {
        this.set_fps(fps);
    }

    set_fps = function (fps) {
        this.goal_fps = fps;
        this.start_time = Date.now();
        this.end_time = 0;
        this.total_first_time = this.start_time;
        this.total_count = 0;
        this.real_fps = 0;
    }

    finish = function () {
        this.end_time = Date.now();
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
