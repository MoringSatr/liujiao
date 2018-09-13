import { Tool } from './../Tool/Tool'
export module Match {
    export class Plate {
        x: number;
        y: number;
        point: number;

        constructor(x, y, c: number) {
            this.x = x;
            this.y = y;
            this.point = c;
        }

        public swap(tar: Plate) {
            [this.point, tar.point] = [tar.point, this.point];
        }
    }

    export class Element {
        plates: Array<Plate>;
        type: number;


        getType(): number {
            return this.type;
        }

        constructor(max: number) {
            this.plates = new Array<Plate>();
            this.type = 0;
            this.create(max);
        }

        //添加板块
        public add(plate: Plate) {
            this.plates.push(plate);
        }

        //两个块调换位置
        public change() {
            if (this.plates.length < 2) return;
            this.plates[0].swap(this.plates[1]);
        }

        private randomColor(maxNum: number): number {
            let num = Tool.Number.RandInt32(1, maxNum);

            if (num < 30) {
                return 1;
            } else if (num < 50) {
                return 2;
            } else if (num < 70) {
                return 3;
            } else if (num < 80) {
                return 4;
            } else if (num < 90) {
                return 5;
            } else if (num < 98) {
                return 6
            } else {
                return 7;
            }
        }

        //随机创建1-2个板块的元素
        public create(maxNum: number) {
            let isDouble = Tool.Number.RandInt32(1, 100);
            if (isDouble >= 76) {
                this.plates.push(new Plate(0, 0, this.randomColor(maxNum)));
            } else {
                // - 1  / 2  \ 3
                let type = Tool.Number.RandInt32(1, 3);
                this.type = type;
                switch (type) {
                    case 1: {
                        this.plates.push(new Plate(0, 0, this.randomColor(maxNum)));
                        this.plates.push(new Plate(1, 0, this.randomColor(maxNum)));
                        break;
                    }
                    case 2: {
                        this.plates.push(new Plate(0, 0, this.randomColor(maxNum)));
                        this.plates.push(new Plate(0, 1, this.randomColor(maxNum)));
                        break;
                    }
                    case 3: {
                        this.plates.push(new Plate(0, 0, this.randomColor(maxNum)));
                        this.plates.push(new Plate(1, 1, this.randomColor(maxNum)));
                        break;
                    }
                    default:
                        break;
                }
            }
        }
    }

    export class SingleMatch {
        private piece: Array<Array<number>>;
        public isNullCell(x, y: number) {
            return this.piece[y][x] == 0;
        }

        private createPiece(size: number) {
            this.piece = new Array<Array<number>>();
            let firstHideSize = (size - 1) / 2;
            let addSymbol = -1;
            for (let y = 0; y < size; y++) {
                let newRow = new Array<number>();
                this.piece.push(newRow);
                if (firstHideSize == 0) {
                    addSymbol = 1;
                }
                for (let x = 0; x < size; x++) {
                    newRow.push(0);
                }
                firstHideSize += addSymbol;
            }

            let hide = [{ x: 4, y: 0 }, { x: 5, y: 0 }, { x: 6, y: 0 },
            { x: 5, y: 1 }, { x: 6, y: 1 },
            { x: 6, y: 2 },
            { x: 0, y: 4 },
            { x: 0, y: 5 }, { x: 1, y: 5 },
            { x: 0, y: 6 }, { x: 1, y: 6 }, { x: 2, y: 6 }];
            for (let i = 0; i < hide.length; i++) {
                this.piece[hide[i].y][hide[i].x] = -1;
            }
        }

        //检查是否可以放下这个元素
        public canPut(plate: Element): boolean {
            let size = this.piece.length;
            for (let y = 0; y < size; y++) {
                for (let x = 0; x < size; x++) {
                    if (this.piece[y][x] == 0) {
                        if (plate.plates.length > 1) {
                            let sx = x + plate.plates[1].x;
                            let sy = y + plate.plates[1].y;
                            if (this.piece[sy][sx] == 0) {
                                return true;
                            }
                        } else {
                            return true;
                        }
                    }
                }
            }
            return false;
        }

        //放入两个板块
        public setPlace(f, s?: Plate): boolean {
            if (this.piece[f.y][f.x] != 0) {
                return false;
            }
            if (s != null && this.piece[s.y][s.x] != 0) {
                return false;
            }

            this.piece[f.y][f.x] = f.point;
            if (s != null) {
                this.piece[s.y][s.x] = s.point;
            }
            this.check(f.x, f.y);
            if (s != null && s.point != f.point) {
                this.check(s.x, s.y);
            }
            Tool.EventDispatch.execute("MatchBase.onActionOver")();
            let isTop = Tool.EventDispatch.execute("MatchBase.isTopRound")()
            Tool.EventDispatch.asyncExecute("Table.executeEffect")(isTop);
            return true;
        }

        private isHas(arr: Array<{ x: number, y: number }>, x, y: number): boolean {
            for (let i = 0; i < arr.length; i++) {
                if (arr[i].x == x && arr[i].y == y) {
                    return true;
                }
            }
            return false;
        }

        public findOptimalPath(plate: Element): { x: number, y: number, num: number } {
            let size = this.piece.length;
            let pathList = new Array<{ x: number, y: number, num: number }>();
            for (let y = 0; y < size; y++) {
                for (let x = 0; x < size; x++) {
                    if (this.piece[y][x] == 0) {
                        if (plate.plates.length > 1) {
                            let sx = x + plate.plates[1].x;
                            let sy = y + plate.plates[1].y;
                            if (sx >= 0 && sx < size && sy >= 0 && sy < size && this.piece[sy][sx] == 0) {
                                let num = this.canDestoryNum(x, y, plate.plates[0].point);
                                num += this.canDestoryNum(sx, sy, plate.plates[1].point);
                                pathList.push({ x: x, y: y, num: num });
                            }
                        } else {
                            let num = this.canDestoryNum(x, y, plate.plates[0].point);
                            pathList.push({ x: x, y: y, num: num });
                        }
                    }
                }
            }

            if (pathList.length == 0) return null;
            let targetPos = pathList[0];
            for (let i = 1; i < pathList.length; i++) {
                if (pathList[i].num > targetPos.num) targetPos = pathList[i];
            }

            if (targetPos.num < 3) {
                targetPos = pathList[Tool.Number.RandInt32(0, pathList.length - 1)];
            }

            return targetPos;
        }

        private canDestoryNum(x, y, color: number): number {
            let has = new Array<{ x: number, y: number }>();
            has.push({ x: x, y: y });
            this.loopCheck(x, y, has, color);
            let count = has.length;
            if (has.length >= 3) {
                if (color <= 7) {
                    color++;
                    count += this.canDestoryNum(x, y, color);
                }
            }
            return count;
        }

        private check(x, y: number) {
            let has = new Array<{ x: number, y: number }>();
            has.push({ x: x, y: y });
            this.loopCheck(x, y, has, this.piece[y][x]);

            if (has.length >= 3) {
                let color = this.piece[y][x] + 1;
                Tool.EventDispatch.execute("Table.pushEffect")(this.piece[y][x], has, { x: x, y: y });
                for (let i = 0; i < has.length; i++) {
                    let cC = has[i];
                    this.piece[cC.y][cC.x] = 0;
                }
                if (color <= 7) {
                    this.piece[y][x] = color;
                    this.check(x, y);
                }
            }
        }

        private loopCheck(x, y: number, has: Array<{ x: number, y: number }>, color: number) {
            let borderList = new Array<{ x: number, y: number }>();


            let bX = x;
            let bY = y - 1;
            if (bY >= 0 && this.piece[bY][bX] > 0) {
                borderList.push({ x: bX, y: bY });
            }

            bX = x - 1;
            bY = y - 1;
            if (bY >= 0 && bX < this.piece.length && this.piece[bY][bX] > 0) {
                borderList.push({ x: bX, y: bY });
            }

            bX = x - 1;
            bY = y;
            if (bX >= 0 && this.piece[bY][bX] > 0) {
                borderList.push({ x: bX, y: bY });
            }

            bX = x + 1;
            bY = y;
            if (bX < this.piece.length && this.piece[bY][bX] > 0) {
                borderList.push({ x: bX, y: bY });
            }

            bX = x;
            bY = y + 1;
            if (bY < this.piece.length && this.piece[bY][bX] > 0) {
                borderList.push({ x: bX, y: bY });
            }

            bX = x + 1;
            bY = y + 1;
            if (bY < this.piece.length && bX < this.piece.length && this.piece[bY][bX] > 0) {
                borderList.push({ x: bX, y: bY });
            }


            for (let i = 0; i < borderList.length; i++) {
                let cC = borderList[i];
                if (color == this.piece[cC.y][cC.x] && this.isHas(has, cC.x, cC.y) == false) {
                    has.push({ x: cC.x, y: cC.y });
                    this.loopCheck(cC.x, cC.y, has, color);
                }
            }
        }

        constructor(size: number) {
            this.createPiece(7);
        }
    }

    export class MatchBase {
        constructor() { }
        logic: SingleMatch;
        onBegin() {
            Tool.UI.get("Table").hide();
            Tool.UI.get("Touch").hide();
            this.logic = new SingleMatch(7);
            Tool.UI.get("Table").script().setMatchInfo(this.logic);
        }

        @Tool.thisIsEventCallBack("MatchBase")
        onRoundOver() { }
        @Tool.thisIsEventCallBack("MatchBase")
        onActionOver() { }
        @Tool.thisIsEventCallBack("MatchBase")
        onTimerDeadTime() { }
        @Tool.thisIsEventCallBack("MatchBase")
        isTopRound(): boolean { return true }
        @Tool.thisIsEventCallBack("MatchBase")
        onAttack(v: number, isTargetSubHp: boolean) { }
    }

    enum Round {
        Self,
        Openment
    }

    export class AIMatch extends MatchBase {
        constructor() {
            super();
        }

        selfEle: Element;
        openmentEle: Element;
        round: Round;

        selfHp: number;
        aiHp: number;
        maxNum: number;

        onBegin() {
            this.maxNum = 60;
            super.onBegin();
            Tool.UI.get("Table").show();
            this.createSelfEle();
            this.createOpenmentEle();
            this.onPlayerRound();
            Tool.UI.get("Touch").show();
            Tool.changeEventRes("MatchBase", this);
            this.selfHp = 100;
            this.aiHp = 100;
            Tool.setEventRes("MatchBase", this);
        }

        createSelfEle() {
            if (this.maxNum < 100) this.maxNum += 3;
            this.selfEle = new Element(this.maxNum);
            Tool.EventDispatch.execute("Table.createSelfCell")(this.selfEle);
        }

        createOpenmentEle() {
            if (this.maxNum < 100) this.maxNum += 3;
            this.openmentEle = new Element(this.maxNum);
            Tool.EventDispatch.execute("Table.createOpenmentCell")(this.openmentEle);
        }

        onPlayerRound() {
            Tool.EventDispatch.execute("Touch.canTouch")();
            this.round = Round.Self;
            Tool.EventDispatch.execute("Round.bottomStartTimer")();
        }

        onAiRound() {
            this.round = Round.Openment;
            Tool.EventDispatch.execute("Round.topStartTimer")();
            let posInfo = this.logic.findOptimalPath(this.openmentEle);
            if (posInfo.num < 4) {
                this.openmentEle.change();
                Tool.EventDispatch.execute("Table.openmentRotation")();
                posInfo = this.logic.findOptimalPath(this.openmentEle);
            }

            Tool.Timer.createTimer(Tool.Number.RandInt32(1, 3), () => {
                Tool.EventDispatch.execute("Table.openmentCellPos")(posInfo.x, posInfo.y);
            })
        }

        onRoundOver() {
            if (this.round == Round.Self) {
                this.onAiRound();
            } else {
                this.onPlayerRound();
            }
        }

        onActionOver() {
            if (this.round == Round.Self) {
                this.createSelfEle();
                Tool.EventDispatch.execute("Touch.notCanTouch")();
            } else {
                this.createOpenmentEle();
            }
            Tool.EventDispatch.execute("Timer.stop")();
        }

        onTimerDeadTime() {
            this.onActionOver();
            this.onRoundOver();
        }

        isTopRound(): boolean {
            if (this.round == Round.Self) return true;
            return false;
        }

        onAttack(v: number, isTargetSubHp: boolean) {
            if (isTargetSubHp == false) {
                this.selfHp -= v;
                Tool.EventDispatch.asyncExecute("Round.setBottomHpValue")(this.selfHp, v);
            } else {
                this.aiHp -= v;
                Tool.EventDispatch.asyncExecute("Round.setTopHpValue")(this.aiHp, v);
            }

        }

    }

}