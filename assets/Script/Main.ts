const {ccclass, property} = cc._decorator;
import {Match} from './Match/Match'
import {Tool} from './Tool/Tool';
import CellNode from './Match/CellNode';


@ccclass
export default class Main extends cc.Component {

    match: Match.MatchBase;


    async onLoad() {
        this.match = new Match.AIMatch();
        this.match.onBegin();
    }

    update(dt: number) {

    }
}
