const {ccclass, property} = cc._decorator;
import {Tool} from './../Tool/Tool';

@ccclass
export default class Round extends cc.Component {
    @property(cc.Node)
    timer: cc.Node = null;
    @property(cc.Node)
    topTimerPos: cc.Node = null;
    @property(cc.Node)
    bottomTimerPos: cc.Node = null;
    @property(cc.Node)
    topPrompt: cc.Node = null;
    @property(cc.Node)
    bottomPrompt: cc.Node = null;
    @property(cc.Label)
    topNameTxt: cc.Label = null;
    @property(cc.Label)
    bottomNameTxt: cc.Label = null;
    @property(cc.ProgressBar)
    topHpBar: cc.ProgressBar = null;
    @property(cc.ProgressBar)
    bottomHpBar: cc.ProgressBar = null;
    @property(cc.Label)
    topHpTxt: cc.Label = null;
    @property(cc.Label)
    bottomHpTxt: cc.Label = null;
    @property(cc.Sprite)
    topHead: cc.Sprite = null;
    @property(cc.Sprite)
    bottomHead: cc.Sprite = null;
    @property(cc.Sprite)
    topNameBg: cc.Sprite = null;
    @property(cc.Sprite)
    bottomNameBg: cc.Sprite = null;
    @property(cc.Sprite)
    topFaceBox: cc.Sprite = null;
    @property(cc.Sprite)
    bottomFaceBox: cc.Sprite = null;
    @property({
        type: [cc.SpriteFrame]
    })
    faceBoxImg: Array<cc.SpriteFrame> = new Array<cc.SpriteFrame>();
    @property({
        type: [cc.SpriteFrame]
    })
    nameBgImg: Array<cc.SpriteFrame> = new Array<cc.SpriteFrame>();
    @property(cc.Prefab)
    hpPrefab: cc.Prefab = null;
    @property(cc.Prefab)
    expression: cc.Prefab = null;
    @property({
        type: [cc.SpriteFrame]
    })
    expressionImg: Array<cc.SpriteFrame> = new Array<cc.SpriteFrame>();
    @property(cc.Node)
    bottomExpression: cc.Node = null;
    @property(cc.Node)
    topExpression: cc.Node = null;

    onLoad() {
        this.topPrompt.active = false;
        this.bottomPrompt.active = false;
        this.topHpTxt.string = "100/100";
        this.bottomHpTxt.string = "100/100";
        this.effectArray = new Array<() => any>();
        this.addTime = 0;
        Tool.changeEventRes("Round", this);
    }

    addTime: number;

    update(dt: number) {
        if (this.effectArray.length == 0) this.addTime = 0.2;
        if (this.effectArray.length > 0) {
            if (this.addTime < 0.2) {
                this.addTime += dt;
                return;
            }
            let fun = this.effectArray.shift();
            fun();
            this.addTime = 0;
        }
    }

    @Tool.thisIsEventCallBack("Round")
    topStartTimer() {
        this.topPrompt.active = true;
        this.bottomPrompt.active = false;
        this.timer.setPosition(this.topTimerPos.getPosition());
        Tool.EventDispatch.nextTickExecute("Timer.start")();
    }

    @Tool.thisIsEventCallBack("Round")
    bottomStartTimer() {
        this.topPrompt.active = false;
        this.bottomPrompt.active = true;
        this.timer.setPosition(this.bottomTimerPos.getPosition());
        Tool.EventDispatch.nextTickExecute("Timer.start")();
    }

    createHpNode(v, f, t: cc.Vec2) {
        let hpNode = cc.instantiate(this.hpPrefab);
        hpNode.setPosition(f);
        hpNode.parent = this.node;
        let label = hpNode.getComponent(cc.Label);
        label.string = "-" + v;
        let actionArray = [];
        actionArray.push(cc.moveTo(1, t.x, t.y));
        actionArray.push(cc.fadeOut(1));

        if (actionArray.length < 1) return true;

        let spawn;
        if (actionArray.length < 2) {
            spawn = actionArray[0];
        }
        else {
            spawn = cc.spawn(actionArray);
        }

        let sequence = cc.sequence(spawn, cc.callFunc(
            (data) => {
                hpNode.parent = null;
            }, this, null)
        )
        hpNode.runAction(sequence);
    }

    @Tool.thisIsEventCallBack("Round")
    setTopHpValue(curValue, subValue: number) {
        let effectFun = () => {
            this.topHpTxt.string = curValue + "/100";
            let toPos = this.topHead.node.getPosition();
            toPos.y += 50;
            this.createHpNode(subValue, this.topHead.node.getPosition(), toPos);
            this.topHpBar.progress = curValue / 100;
        }
        this.effectArray.push(effectFun);
    }

    effectArray: Array<() => any>;

    @Tool.thisIsEventCallBack("Round")
    setBottomHpValue(curValue, subValue: number) {
        let effectFun = () => {
            this.bottomHpTxt.string = curValue + "/100";
            let toPos = this.bottomHead.node.getPosition();
            toPos.y -= 50;
            this.createHpNode(subValue, this.bottomHead.node.getPosition(), toPos);
            this.bottomHpBar.progress = curValue / 100;
        }
        this.effectArray.push(effectFun);
    }

    private action(tar: cc.Node, x, y: number) {
        let actionArray = [];
        actionArray.push(cc.moveTo(2, x, y));
        actionArray.push(cc.fadeOut(2));

        if (actionArray.length < 1) return true;

        let spawn;
        if (actionArray.length < 2) {
            spawn = actionArray[0];
        }
        else {
            spawn = cc.spawn(actionArray);
        }

        let self = this;
        let sequence = cc.sequence(spawn, cc.callFunc(
            (data) => {
                tar.parent = null;
            }, this, null)
        )

        tar.runAction(sequence);
    }

    private showSelfExpression(type: number) {
        let newExpression = cc.instantiate(this.expression);
        newExpression.parent = this.node;

        newExpression.setPosition(this.bottomHead.node.getPosition());
        let sprite = newExpression.getComponent(cc.Sprite);
        sprite.spriteFrame = this.expressionImg[type];

        let x = ((Math.random() * newExpression.width) + this.bottomExpression.getPosition().x)
        let y = ((Math.random() * newExpression.height) + this.bottomExpression.getPosition().y)
        this.action(newExpression, x, y);
    }

    showExpression(obj: any, type: number) {
        this.showSelfExpression(type - 1);
    }

}

