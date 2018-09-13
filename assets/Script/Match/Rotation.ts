const {ccclass, property} = cc._decorator;
import {Tool} from './../Tool/Tool';

@ccclass
export default class Rotation extends cc.Component {
    begin: cc.Vec2;
    isRotation: boolean;

    onLoad() {
        Tool.UI.delegate("Rotation", this.node, "Rotation");
        this.begin = null;
        this.isRotation = true;
    }

    moveStart(e: cc.Event.EventTouch) {
        if (Tool.Rect.inNode(this.node, e.getLocation()) == false) return;
        this.begin = e.getLocation();
        this.isRotation = true;
    }

    moveing(e: cc.Event.EventTouch) {
        if (Tool.Rect.inNode(this.node, e.getLocation()) == false) return;
        let curPos = e.getLocation();
        if (Tool.Line.distance(this.begin.x, this.begin.y, curPos.x, curPos.y) >= 20) {
            this.isRotation = false;
        }
    }

    moveEnd(e: cc.Event.EventTouch) {
        if (Tool.Rect.inNode(this.node, e.getLocation()) == false) return;
        let curPos = e.getLocation();
        if (Tool.Line.distance(this.begin.x, this.begin.y, curPos.x, curPos.y) <= 20 && this.isRotation == true) {
            Tool.EventDispatch.execute("Table.rotation")();
        }
    }
}
