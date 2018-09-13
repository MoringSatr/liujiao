const {ccclass, property} = cc._decorator;
import {Match} from './Match'
import Element from './CellNode';
import {Tool} from './../Tool/Tool';

@ccclass
export default class Touch extends cc.Component {
    isTouch: boolean;

    onLoad() {
        this.node.on(cc.Node.EventType.TOUCH_START, this.moveStart, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.moveing, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.moveEnd, this);
        Tool.UI.delegate("Touch", this.node, "Touch");
        this.isTouch = true;
        Tool.changeEventRes("Touch", this);
    }

    @Tool.thisIsEventCallBack("Touch")
    public notCanTouch() {
        this.isTouch = false;
    }

    @Tool.thisIsEventCallBack("Touch")
    public canTouch() {
        this.isTouch = true;
    }

    moveStart(e: cc.Event.EventTouch) {
        if (this.isTouch == false) return;
        Tool.UI.get("Rotation").script().moveStart(e);
        Tool.UI.get("Table").script().moveStart(e);
    }

    moveing(e: cc.Event.EventTouch) {
        if (this.isTouch == false) return;
        Tool.UI.get("Rotation").script().moveing(e);
        Tool.UI.get("Table").script().moveing(e);
    }

    moveEnd(e: cc.Event.EventTouch) {
        if (this.isTouch == false) return;
        Tool.UI.get("Rotation").script().moveEnd(e);
        Tool.UI.get("Table").script().moveEnd(e);
    }

}
