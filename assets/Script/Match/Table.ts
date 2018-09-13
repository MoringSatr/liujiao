const {ccclass, property} = cc._decorator;
import {Match} from './Match'
import {Tool} from './../Tool/Tool';
import CellNode from './CellNode';

/**
 * piece = -1 那么代表不显示 ，不可用，
 *  0 代表空的
 *  其他对应的颜色
 */
@ccclass
export default class Table extends cc.Component {
    @property(cc.Prefab)
    cell: cc.Prefab = null;
    @property(cc.SpriteFrame)
    cellBackground: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    cellSelectBackground: cc.SpriteFrame = null;
    @property({
        type: [cc.SpriteFrame]
    })
    images: Array<cc.SpriteFrame> = new Array<cc.SpriteFrame>();
    @property(cc.Node)
    selfFlush: cc.Node = null;
    @property(cc.Node)
    openmentFlush: cc.Node = null;
    @property({
        type: [cc.Prefab]
    })
    style: Array<cc.Prefab> = new Array<cc.Prefab>();

    @property(cc.Prefab)
    toEffect: cc.Prefab = null;
    @property(cc.Prefab)
    attackEffect: cc.Prefab = null;
    @property(cc.Node)
    topHead: cc.Node = null;
    @property(cc.Node)
    bottomHead: cc.Node = null;

    @property({
        type: [cc.SpriteFrame]
    })
    compose: Array<cc.SpriteFrame> = new Array<cc.SpriteFrame>();

    cells: Array<Array<cc.Node>>;
    match: Match.SingleMatch;

    selfEle: Match.Element;
    selfCell: cc.Node;
    openmentEle: Match.Element;
    openmentCell: cc.Node;
    isFllow: boolean;

    fx: number;
    fy: number;
    sx: number;
    sy: number;

    isRotation: boolean;
    rotationAction: cc.Action;
    openmentRotationAction: cc.Action;
    begin: cc.Vec2;

    targetDisX: number;
    targetDisY: number;
    effectList: Array<{ point: number, to: { x: number, y: number }, list: Array<{ x: number, y: number }> }>;

    @Tool.thisIsEventCallBack("Table")
    openmentCellPos(x, y: number) {
        let fP = this.openmentCell.convertToWorldSpaceAR(this.openmentCell.getChildByName("1").getPosition());
        if (this.openmentCell.rotation > 0 && this.openmentEle.plates.length > 1) {
            fP = this.openmentCell.convertToWorldSpaceAR(this.openmentCell.getChildByName("2").getPosition());
        }
        let tarPos = this.node.convertToWorldSpaceAR(this.cells[y][x].getPosition());
        let toX = this.openmentCell.getPosition().x + (tarPos.x - fP.x);
        let toY = this.openmentCell.getPosition().y + (tarPos.y - fP.y);

        let sequence = cc.sequence(cc.moveTo(0.4, toX, toY), cc.callFunc(
            (data) => {
                let isOk = false;
                this.openmentCell.active = false;
                if (this.openmentEle.plates.length == 1) {
                    let fi = this.openmentEle.plates[0];
                    this.cells[fi.y + y][fi.x + x].getComponent(cc.Sprite).spriteFrame = this.images[fi.point - 1];
                    isOk = this.match.setPlace(new Match.Plate(fi.x + x, fi.y + y, fi.point));
                } else {
                    let fi = this.openmentEle.plates[0];
                    this.cells[fi.y + y][fi.x + x].getComponent(cc.Sprite).spriteFrame = this.images[fi.point - 1];
                    let si = this.openmentEle.plates[1];
                    this.cells[si.y + y][si.x + x].getComponent(cc.Sprite).spriteFrame = this.images[si.point - 1];
                    isOk = this.match.setPlace(new Match.Plate(fi.x + x, fi.y + y, fi.point), new Match.Plate(si.x + x, si.y + y, si.point));
                }
            }, this, null)
        )
        this.openmentCell.runAction(sequence);
    }

    @Tool.thisIsEventCallBack("Table")
    createCell(ele: Match.Element): cc.Node {
        let newCell = null;
        switch (ele.getType()) {
            case 0:
                newCell = cc.instantiate(this.style[0]);
                newCell.parent = this.node;
                newCell.getComponent(CellNode).setColor(0, ele.plates[0].point);
                break;
            case 1:
            case 2:
            case 3:
                newCell = cc.instantiate(this.style[ele.getType()]);
                newCell.parent = this.node;
                newCell.getComponent(CellNode).setColor(0, ele.plates[0].point);
                newCell.getComponent(CellNode).setColor(1, ele.plates[1].point);
                break;
        }
        return newCell;
    }

    @Tool.thisIsEventCallBack("Table")
    createSelfCell(ele: Match.Element) {
        if (this.selfCell != null) {
            this.selfCell.parent = null;
        }
        this.selfEle = ele;
        this.selfCell = this.createCell(ele);
        this.selfCell.setPosition(this.selfFlush.getPosition());
        this.selfCell.active = true;
    }

    @Tool.thisIsEventCallBack("Table")
    createOpenmentCell(ele: Match.Element) {
        if (this.openmentCell != null) {
            this.openmentCell.parent = null;
        }
        this.openmentEle = ele;
        this.openmentCell = this.createCell(ele);
        this.openmentCell.setPosition(this.openmentFlush.getPosition());
        this.openmentCell.active = true;
    }

    @Tool.thisIsEventCallBack("Table")
    rotation() {
        if (this.rotationAction != null) return;
        if (this.selfEle.plates.length > 1) {
            let sequence = cc.sequence(cc.rotateBy(0.1, 180), cc.callFunc(
                (data) => {
                    this.selfCell.getComponent(CellNode).Rotation180();
                    this.rotationAction = null;
                }, this, null)
            )
            this.rotationAction = this.selfCell.runAction(sequence);
        }
        return;
    }

    @Tool.thisIsEventCallBack("Table")
    openmentRotation() {
        if (this.openmentRotationAction != null) return;
        if (this.openmentEle.plates.length > 1) {
            let sequence = cc.sequence(cc.rotateBy(0.1, 180), cc.callFunc(
                (data) => {
                    this.openmentCell.getComponent(CellNode).Rotation180();
                    this.openmentRotationAction = null;
                }, this, null)
            )
            this.openmentRotationAction = this.openmentCell.runAction(sequence);
        }
        return;
    }

    onUpdateTable(pos: cc.Vec2) {
        if (this.isFllow == true) {
            let curPos = this.node.convertToNodeSpaceAR(pos);
            curPos.y += 100;
            this.selfCell.setPosition(curPos);

            let fP = this.selfCell.convertToWorldSpaceAR(this.selfCell.getChildByName("1").getPosition());
            let sP = null;

            let sE = this.selfCell.getChildByName("2")
            if (sE != null) {
                sP = this.selfCell.convertToWorldSpaceAR(this.selfCell.getChildByName("2").getPosition());
            }

            this.checkOver(fP, sP);
        }
    }

    @Tool.thisIsEventCallBack("Table")
    setMatchInfo(match: Match.SingleMatch) {
        this.match = match;
    }

    //制作棋盘
    drawTable(size: number) {
        let rowD = 80; //行每个的间隔
        let cold = 68;
        let min = 6;
        let addSymbol = -1;
        this.cells = new Array<Array<cc.Node>>();
        for (let y = 0; y < size; y++) {
            let newRow = new Array<cc.Node>();
            this.cells.push(newRow);
            for (let x = 0; x < size; x++) {
                let newCell = cc.instantiate(this.cell);
                let newX = (min * (rowD / 2) + rowD * x - rowD * 5 + rowD / 2);
                let newY = (-cold * 3 + y + y * cold);
                newCell.setPosition(newX, newY);
                newCell.parent = this.node;
                newRow.push(newCell);
            }
            min += addSymbol;
        }

        let hide = [{x: 4, y: 0}, {x: 5, y: 0}, {x: 6, y: 0},
            {x: 5, y: 1}, {x: 6, y: 1},
            {x: 6, y: 2},
            {x: 0, y: 4},
            {x: 0, y: 5}, {x: 1, y: 5},
            {x: 0, y: 6}, {x: 1, y: 6}, {x: 2, y: 6}];

        for (let i = 0; i < hide.length; i++) {
            this.cells[hide[i].y][hide[i].x].active = false;
        }
    }

    //回复格子状态
    @Tool.thisIsEventCallBack("Table")
    recovery(fx?, fy?, sx?, sy?: number) {
        for (let y = 0; y < this.cells.length; y++) {
            for (let x = 0; x < this.cells.length; x++) {
                if ((x == fx && y == fy) || (sx == x && sy == y)) continue;
                if (this.match.isNullCell(x, y)) {
                    this.cells[y][x].getComponent(cc.Sprite).spriteFrame = this.cellBackground;
                }
            }
        }
    }

    //检查板块经过    
    checkOver(fS: cc.Vec2, sS?: cc.Vec2) {
        this.sy = this.sx = this.fy = this.fx = null;
        this.recovery(this.fx, this.fy, this.sx, this.sy);
        let disX, disY = null;
        for (let y = 0; y < this.cells.length; y++) {
            for (let x = 0; x < this.cells.length; x++) {
                if (this.match.isNullCell(x, y) == false) continue;
                let wP = this.node.convertToWorldSpaceAR(this.cells[y][x].getPosition());
                let width = this.cells[y][x].width;
                let height = this.cells[y][x].height;
                if (Tool.Rect.inRange(wP.x + width / 2, wP.x - width / 2, wP.y + height / 2, wP.y - height / 2, fS)) {
                    this.cells[y][x].getComponent(cc.Sprite).spriteFrame = this.cellSelectBackground;
                    this.fx = x;
                    this.fy = y;
                    disX = wP.x - fS.x;
                    disY = wP.y - fS.y;
                } else if (sS != null && Tool.Rect.inRange(wP.x + width / 2, wP.x - width / 2, wP.y + height / 2, wP.y - height / 2, sS)) {
                    this.cells[y][x].getComponent(cc.Sprite).spriteFrame = this.cellSelectBackground;
                    this.sx = x;
                    this.sy = y;
                }
            }
        }

        if ((this.fx != null && (Tool.Number.abs(this.fx - this.sx) > 1) || (this.fy != null && Tool.Number.abs(this.fy - this.sy) > 1))) {
            this.sy = this.sx = null;
        }

        this.recovery(this.fx, this.fy, this.sx, this.sy);
        if (this.fx == null || this.fy == null && (sS != null && (this.sx == null || this.sy == null))) {
            this.sy = this.sx = this.fy = this.fx = null;
            this.setTargetDis();
        } else {
            this.setTargetDis(disX, disY);
        }
    }

    //点击放开
    @Tool.thisIsEventCallBack("Table")
    onTouchEnd(fn?, sn?: number): boolean {
        if (fn == null) return;
        if (fn != null && sn != null) {
            if (fn != null && this.fy != null && this.fx != null && sn != null && this.sy != null && this.sx != null) {
                this.cells[this.fy][this.fx].getComponent(cc.Sprite).spriteFrame = this.images[fn - 1];
                this.cells[this.sy][this.sx].getComponent(cc.Sprite).spriteFrame = this.images[sn - 1];
                if (this.match.setPlace(new Match.Plate(this.fx, this.fy, fn), new Match.Plate(this.sx, this.sy, sn)) == true) {
                    return true;
                }
            }
        } else {
            if (fn != null && this.fy != null && this.fx != null) {
                this.cells[this.fy][this.fx].getComponent(cc.Sprite).spriteFrame = this.images[fn - 1];
                if (this.match.setPlace(new Match.Plate(this.fx, this.fy, fn)) == true) {
                    return true;
                }
            }
        }
        return false;
    }

    @Tool.thisIsEventCallBack("Table")
    setCellNum(x, y, number: number) {
        this.cells[y][x].getComponent(cc.Sprite).spriteFrame = this.images[number - 1];
    }

    onLoad() {
        Tool.UI.delegate("Match.Table", this.node, "Table", this.node.parent);
        Tool.setEventRes("Table", this);

        Tool.UI.delegate("Table", this.node, "Table", this.node.parent);
        this.drawTable(7);


        this.effectList = new Array<{ point: number, to: { x: number, y: number }, list: Array<{ x: number, y: number }> }>();
    }

    @Tool.thisIsEventCallBack("Table")
    moveStart(e: cc.Event.EventTouch) {
        let curPos = this.node.convertToNodeSpaceAR(e.getLocation());
        let flushPos = this.selfFlush.getPosition();
        let width = this.selfFlush.width;
        let height = this.selfFlush.height;
        if (Tool.Rect.inRange(flushPos.x + width / 2, flushPos.x - width / 2, flushPos.y + height / 2, flushPos.y - height / 2, curPos)) {
            this.isFllow = true;
        }
        this.isRotation = true;
        this.targetDisX = null;
        this.targetDisY = null;
        this.begin = e.getLocation();
    }

    @Tool.thisIsEventCallBack("Table")
    moveing(e: cc.Event.EventTouch) {
        let curPos = e.getLocation();
        if (Tool.Line.distance(this.begin.x, this.begin.y, curPos.x, curPos.y) >= 20) {
            this.onUpdateTable(curPos);
        }
    }

    setTargetDis(x?, y?: number) {
        if (x == null || y == null) {
            this.targetDisX = null;
            this.targetDisY = null;
        }
        else {
            this.targetDisX = x;
            this.targetDisY = y;
        }
    }

    @Tool.thisIsEventCallBack("Table")
    moveEnd(e: cc.Event.EventTouch) {
        let curPos = e.getLocation();
        if (this.isFllow == true) {
            if (this.targetDisX == null || this.targetDisY == null) {
                this.selfCell.setPosition(this.selfFlush.getPosition());
                this.recovery();
            } else {
                let curPos = this.selfCell.getPosition();
                this.selfCell.setPosition(curPos.x + this.targetDisX, curPos.y + this.targetDisY);
                let isOk = true;
                if (this.selfEle.plates.length == 1) {
                    isOk = this.onTouchEnd(this.selfEle.plates[0].point);
                } else {
                    isOk = this.onTouchEnd(this.selfEle.plates[0].point, this.selfEle.plates[1].point);
                }

                if (isOk == false) {
                    this.selfCell.setPosition(this.selfFlush.getPosition());
                    this.recovery();
                }
            }
        }
        this.isFllow = false;
    }

    @Tool.thisIsEventCallBack("Table")
    pushEffect(point: number, list: Array<{ x: number, y: number }>, to?: { x: number, y: number }) {
        this.effectList.push({point: point, to: to, list: list});
    }

    @Tool.thisIsEventCallBack("Table")
    onEffectComplite(isTop: boolean) {
        let curEffect = this.effectList.shift();
        Tool.Timer.createTimer(0.1, () => {
            this.executeEffect(isTop);
        })
    }

    @Tool.thisIsEventCallBack("Table")
    executeEffect(isTop: boolean) {
        if (this.effectList.length > 0) {
            let curEffect = this.effectList[0];
            if (curEffect.point == 7) {
                for (let i = 0; i < curEffect.list.length; i++) {
                    let cellPos = curEffect.list[i];
                    this.cells[cellPos.y][cellPos.x].getComponent(cc.Sprite).spriteFrame = this.cellBackground;
                    if (i != curEffect.list.length - 1) {
                        let effectPos = this.cells[cellPos.y][cellPos.x].getPosition();
                        let attackNode = cc.instantiate(this.attackEffect);
                        let attPos = null;
                        if (isTop == true) attPos = this.topHead.getPosition();
                        else attPos = this.bottomHead.getPosition();
                        attackNode.parent = this.node;
                        attackNode.setPosition(effectPos);
                        attackNode.rotation = Tool.Angle.angle360(attackNode.x, attackNode.y, attPos.x, attPos.y);

                        let attacsequence = cc.sequence(cc.moveTo(0.3, attPos), cc.callFunc(
                            (data) => {
                                attackNode.parent = null;
                                Tool.EventDispatch.execute("MatchBase.onAttack")(curEffect.point, isTop);
                            }, this, null)
                        )
                        attackNode.runAction(attacsequence);
                    }
                }
                this.effectList.shift();
                this.executeEffect(isTop);
            } else {
                for (let i = 0; i < curEffect.list.length; i++) {
                    let cellPos = curEffect.list[i];
                    if (cellPos.x == curEffect.to.x && cellPos.y == curEffect.to.y) {
                        continue;
                    }

                    let effectPos = this.cells[cellPos.y][cellPos.x].getPosition();
                    let effectTo = cc.instantiate(this.toEffect);
                    let toPos = this.cells[curEffect.to.y][curEffect.to.x].getPosition();
                    this.cells[cellPos.y][cellPos.x].getComponent(cc.Sprite).spriteFrame = this.cellBackground;
                    effectTo.parent = this.node;
                    effectTo.setPosition(effectPos);
                    effectTo.rotation = Tool.Angle.angle360(effectPos.x, effectPos.y, toPos.x, toPos.y);
                    effectTo.getComponent(cc.Sprite).spriteFrame = this.compose[curEffect.point - 1];
                    effectTo.setScale(1, -1);

                    this.setCellNum(curEffect.to.x, curEffect.to.y, curEffect.point + 1);

                    let sequence = cc.sequence(cc.moveTo(0.3, toPos), cc.callFunc(
                        (data) => {
                            effectTo.parent = null;
                        }, this, null)
                    )
                    effectTo.runAction(sequence);

                    let attackNode = cc.instantiate(this.attackEffect);
                    let attPos = null;
                    if (isTop == true) attPos = this.topHead.getPosition();
                    else attPos = this.bottomHead.getPosition();
                    attackNode.parent = this.node;
                    attackNode.setPosition(effectPos);
                    attackNode.rotation = Tool.Angle.angle360(attackNode.x, attackNode.y, attPos.x, attPos.y);

                    let attacsequence = cc.sequence(cc.moveTo(0.3, attPos), cc.callFunc(
                        (data) => {
                            attackNode.getComponent(cc.Sprite).spriteFrame = null;
                            attackNode.setScale(0.3, 0.3);
                            Tool.EventDispatch.execute("MatchBase.onAttack")(curEffect.point, isTop);
                            let animation = attackNode.getComponent(cc.Animation);
                            var animState = animation.play('effect');

                            Tool.Timer.createTimer(0.2, () => {
                                attackNode.parent = null;
                            })

                        }, this, null)
                    )
                    attackNode.runAction(attacsequence);
                }

                Tool.Timer.createTimer(0.3, () => {
                    this.onEffectComplite(isTop);
                })
            }
        } else {
            this.recovery();
            Tool.EventDispatch.execute("MatchBase.onRoundOver")();

        }

    }


}