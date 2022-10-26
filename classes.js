class GameSpeedManager{

    constructor(tps,fps){
        this.set_param(tps,fps);
    }

    set_param = function(tps,fps){
        this.times_all_second = this.leastCommonMultiple(tps,fps);
        this.times_tick_secound = this.times_all_second / tps;
        this.times_frame_secound = this.times_all_second / fps;
        this.interval = 1000 / this.times_all_second;
        this.count_second = 0;

        this.start_time = Date.now();
        this.end_time = 0;

        this.total_first_time = this.start_time;
        this.total_count = 0;
        this.total_tick_count = 0;
        this.total_frame_count = 0;
        this.real_fps = 0;
        this.real_tps = 0;
    }

    finish = function(){
        this.end_time = Date.now();

        this.count_second++;

        if (++this.total_count > this.times_all_second) {
            this.real_fps = 1000 * this.total_frame_count / (this.end_time - this.total_first_time);
            this.real_tps = 1000 * this.total_tick_count / (this.end_time - this.total_first_time);
            this.total_first_time = this.end_time;
            this.total_count = 0;
            this.total_tick_count = 0;
            this.total_frame_count = 0;
        }

        let delta = this.end_time - this.start_time;
        delta = Math.max(0, this.interval - delta);

        this.start_time = this.end_time + delta;

        return delta;
    }

    shouldExecuteTick = function(){
        let flag = this.count_second % this.times_tick_secound == 0;
        if(flag) this.total_tick_count++;

        return flag;
    }
    shouldExecuteDraw = function(){
        let flag = this.count_second % this.times_frame_secound == 0;
        if(flag) this.total_frame_count++;

        return flag;
    }

    leastCommonMultiple = function(a, b){
        let i = Math.floor(Math.max(a, b));
        let j = Math.floor(Math.min(a, b));

        let l = i % j;
        while(l != 0){
            i = j;
            j = l;
            l = i % j;
        }

        return a * b / j;
    }
}
