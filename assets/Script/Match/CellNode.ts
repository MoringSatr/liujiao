const {ccclass, property} = cc._decorator;

@ccclass
export default class CellNode extends cc.Component {
    @property({
        type: [cc.Node]
    })
    cells: Array<cc.Node> = new Array<cc.Node>();

    @property({
        type: [cc.SpriteFrame]
    })
    images: Array<cc.SpriteFrame> = new Array<cc.SpriteFrame>();


    public setColor(index, color: number) {
        this.cells[index].getComponent(cc.Sprite).spriteFrame = this.images[color - 1];
    }

    public Rotation180() {
        for (let i = 0; i < this.cells.length; i++) {
            this.cells[i].rotationX += 180
        }
    }

}
