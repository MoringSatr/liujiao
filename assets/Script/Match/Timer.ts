const {ccclass, property} = cc._decorator;
import {Tool} from './../Tool/Tool';

@ccclass
export default class Timer extends cc.Component {
    @property({
        type: [cc.SpriteFrame]
    })
    numberImage: Array<cc.SpriteFrame> = new Array<cc.SpriteFrame>();
    @property(cc.Node)
    f: cc.Node = null;
    @property(cc.Node)
    s: cc.Node = null;
    timer: Tool.TimerHandle;
    conutdown: number;

    changeTime(time: number) {
        let f = Math.floor(time / 10);
        let s = time % 10;
        this.f.getComponent(cc.Sprite).spriteFrame = this.numberImage[f];
        this.s.getComponent(cc.Sprite).spriteFrame = this.numberImage[s];
    }

    onLoad() {
        this.timer = null;
        Tool.changeEventRes("Timer", this);
    }

    updateCountDown() {
        this.conutdown--;
        if (this.conutdown == 0) {
            this.timer = null;
            Tool.EventDispatch.execute("MatchBase.onTimerDeadTime")();
            return;
        }
        this.changeTime(this.conutdown);
        this.timer = Tool.Timer.createTimer(1, () => {
            this.updateCountDown();
        })
    }

    @Tool.thisIsEventCallBack("Timer")
    hide() {
        this.node.active = false;
    }

    @Tool.thisIsEventCallBack("Timer")
    show() {
        this.node.active = true;
    }

    @Tool.thisIsEventCallBack("Timer")
    start() {
        if (this.timer != null) {
            this.timer.stop();
        }
        this.conutdown = 31;
        this.updateCountDown();
    }

    @Tool.thisIsEventCallBack("Timer")
    stop() {
        if (this.timer != null) {
            this.timer.stop();
        }
    }

}
