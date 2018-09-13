const {ccclass, property} = cc._decorator;
export module Tool {

    class UsingTool {
        public static update(dt: number) {
            Update.update("Tool.Timer", dt);
        }

        private static isRun = false;

        public static run() {
            if (UsingTool.isRun == false) {
                setInterval(UsingTool.update, 50, 0.05);
            }
        }
    }

    //用于number的操作
    export class Number {
        //返回两个数中最大的
        public static max(f: number, s: number): number {
            return f > s ? f : s;
        }

        //返回两个数中最小的
        public static min(f: number, s: number): number {
            return f < s ? f : s;
        }

        //如果正取负
        public static plus(n: number): number {
            if (n < 0) return n * -1;
            return n;
        }

        //如果负取正
        public static minus(n: number): number {
            if (n > 0) return n * -1;
            return n;
        }

        //取绝对值
        public static abs(n: number): number {
            return n >= 0 ? n : n * -1;
        }

        public static toInt(n: string): number {
            return parseInt(n);
        }

        public static toFloat(n: string): number {
            return parseFloat(n);
        }

        public static RandInt32(b, e: number): number {
            return Math.floor((Math.random() * e) + b);
        }

    }

    export class StringObj {
        public static format(format: string, ...args) {
            return cc.js.formatStr(format, args);
        }
    }

    export class Int64 {
        upper: number;
        lower: number;

        constructor(upper: number, lower: number) {
            this.upper = upper;
            this.lower = lower;
        }
    }

    class EventInfo {
        private res: any;
        private cb: Map<(...args) => any>;

        constructor() {
            this.res = null;
            this.cb = new Map<(...args) => any>();
        }

        getRes(): any {
            return this.res;
        }

        setRes(src: any) {
            this.res = src;
        }

        addEvent(name: string, callBack: (...args) => any) {
            this.cb.set(name, callBack);
        }

        removeEvent(name: string) {
            this.cb.erase(name);
        }

        getCB(name: string): (...args) => any {
            return this.cb.get(name);
        }

    }

    export class EventDispatch {
        public static callBack: Map<EventInfo>;

        private static check() {
            if (EventDispatch.callBack == null) {
                EventDispatch.callBack = new Map<EventInfo>();
            }
        }

        private static getResOjb(src: string): EventInfo {
            EventDispatch.check();
            let srcObj = EventDispatch.callBack.get(src);
            if (srcObj == null) {
                srcObj = new EventInfo();
                EventDispatch.callBack.set(src, srcObj);
            }
            return srcObj;
        }

        private static getCB(eventId: any): (...args) => any {
            EventDispatch.check();
            let src, fun = null;
            [src, fun] = eventId.split(".");
            let srcObj = EventDispatch.callBack.get(src);
            if (srcObj == null) return;
            return srcObj.getCB(fun);
        }

        /**
         * 移除事件,如果至专递组，那么删除整组事件，如果传递 组.eventid 那么只删除该组的指定事件
         * @param eventId 事件group 或者gruop.event
         */
        public static removeEvent(eventId: any) {
            EventDispatch.check();
            let src, fun = null;
            [src, fun] = eventId.split(".");
            if (fun != null) {
                let srcObj = EventDispatch.callBack.get(src);
                srcObj.removeEvent(fun);
            } else {
                EventDispatch.callBack.erase(src);
            }
        }

        /**
         * 用来设置回调函数，在函数前面添加@Tool.EventDispatch.Event 即可
         */
        public static event(resName: string) {
            return (obj, fun, pro: any) => {
                EventDispatch.check();
                let srcObj = EventDispatch.getResOjb(resName);
                srcObj.addEvent(fun, (...args) => {
                    let res = EventDispatch.callBack.get(resName);
                    let resObj = res.getRes();
                    if (resObj != null) {
                        return resObj[fun](...args);
                    }
                });
            }
        }

        /**
         * 更改源执行体 ,一般用于继承的子类替换掉父类的源指针，或者替换执行对象
         */
        public static changeEventObj(name: string, obj: any) {
            EventDispatch.check();
            let srcObj = EventDispatch.getResOjb(name);
            if (srcObj != null) {
                srcObj.setRes(obj);
            }
        }

        /**
         * 注册时间
         * @param eventId 事件id
         * @param callBack 回调
         */
        public static register(eventId: any, callBack: (...args) => any) {
            EventDispatch.check()
            let src, fun = null;
            [src, fun] = eventId.split(".");
            let srcObj = EventDispatch.getResOjb(src);
            srcObj.addEvent(fun, callBack);
        }

        /**
         * 立即执行事件
         * @param eventId 事件id
         */
        public static execute(eventId: any): (...args) => any {
            EventDispatch.check()
            return EventDispatch.getCB(eventId);
        }

        /**
         * 异步执行事件
         * @param eventId 事件id
         */
        public static asyncExecute(eventId: any): (...args) => any {
            EventDispatch.check()
            let af = async (...args) => {
                let func = await EventDispatch.getCB(eventId)
                return func(...args)
            }
            return af;
        }

        /**
         * 下一个tick执行事件
         * @param eventId 事件id
         */
        public static nextTickExecute(eventId: any): (...args) => any {
            EventDispatch.check()
            let tf = (...args) => {
                Tool.Timer.createTimer(0, () => {
                    EventDispatch.getCB(eventId)(...args);
                })

            }
            return tf;
        }
    }

    export function thisIsEventCallBack(resName: string) {
        return Tool.EventDispatch.event(resName);
    }

    export function setEventRes(name: string, obj: any) {
        Tool.EventDispatch.changeEventObj(name, obj);
    }

    export function changeEventRes(name: string, obj: any) {
        Tool.EventDispatch.changeEventObj(name, obj);
    }

    export class Map<T> {
        public data: {};
        private num: number;

        constructor() {
            this.data = {};
            this.num = 0;
        }

        public has(key: any): boolean {
            if (this.get(key) == null) return false;
            return true;
        }

        public set(key: any, value: T) {
            if (this.data[key] == null) {
                this.num++;
            }
            this.data[key] = value;
        }

        public erase(key: any) {
            delete this.data[key];
            this.num--;
        }

        public size(): number {
            return this.num;
        }

        public get(key: any): T {
            return this.data[key];
        }

        public removeAll() {
            this.data = {};
            this.num = 0;
        }

        public iterator(): {} {
            return this.data;
        }
    }

    /*
        黑板可以把一个元素写在黑板上，然后在个个模块中获取，写在黑板上的元素
    */
    export class Blackboard {
        private data: Map<any>;

        constructor() {
            this.data = new Map<any>();
        }

        public static set(key: any, value: any) {
            Blackboard.check();
            Blackboard.s_Blackboard.data.set(key, value);
        }

        public static get<T>(key: any): T {
            Blackboard.check();
            return Blackboard.s_Blackboard.data.get(key);
        }

        public static erase(key: any) {
            Blackboard.s_Blackboard.data.erase(key);
        }

        private static s_Blackboard;

        private static check() {
            if (Blackboard.s_Blackboard == null) Blackboard.s_Blackboard = new Blackboard();
        }
    }


    /**
     !#en
     神经系统，主要用于一个大型类中，各个模块的通讯使用。这样可以很好的解耦合。
     主要是可以让同一个神经调用，可以调用一组关联的回调
     也可以设置关联的系统模块
     */
    export class Nervus {
        private datas: Map<Array<(...args) => void>>;
        private system: Map<any>;

        public constructor() {
            this.datas = new Map<Array<(...args) => void>>();
            this.system = new Map<any>();
        }

        //设置系统模块
        public set(name: string, system: any) {
            this.system.set(name, system);
        }

        //获取系统模块
        public get<T>(name: string): T {
            return this.system.get(name);
        }

        //移除系统模块
        public remove(name: string): any {
            this.system.erase(name);
        }

        //添加神经
        public addNervus(name: string, cb: (...args) => void) {
            if (this.datas.has(name) == false) {
                this.datas.set(name, new Array<(...args) => void>());
            }
            this.datas.get(name).push(cb);
        }

        //移除神经
        public removeNervus(name: string, cb?: (...args) => void) {
            if (this.datas.has(name) == true) {
                if (cb == null) {
                    this.datas.erase(name);
                } else {
                    let cbList = this.datas.get(name);
                    for (let i = 0; i < cbList.length; i++) {
                        if (cbList[i] == cb) {
                            cbList[i] = cbList.pop();
                            return;
                        }
                    }
                }
            }
        }

        //删除神经
        public deleteNervus(name: string) {
            this.datas.erase(name);
        }

        //必须执行
        public mustCall(name: string): (...args) => void {
            let cbList = this.datas.get(name);
            return function (...args) {
                cbList.forEach(cb => {
                    cb(...args);
                });
            }
        }

        //反正通知了，并不关注执行不执行
        public call(name: string): (...args) => void {
            if (this.datas.get(name) == null) {
                return function (...args) {
                }
            } else {
                return this.mustCall(name);
            }
        }

        //是否有神经
        public has(name: string): boolean {
            return this.datas.has(name);
        }
    }

    //小黑板，和blackBorad一样，就是blackBorad是单例的
    export class SmallBlackBorad {
        private data: Map<any>;

        constructor() {
            this.data = new Map<any>();
        }

        public set(key: any, value: any) {
            this.data.set(key, value);
        }

        public get(key: any): any {
            return this.data.get(key);
        }

        public erase(key: any) {
            this.data.erase(key);
        }

        public clean() {
            this.data.removeAll();
        }
    }

    //用于负责全局的分类update
    export class Update {
        private data: Map<(...args) => void>;

        constructor() {
            this.data = new Map<(...args) => void>();
        }

        /**
         * 设置更新管理器需要更新的对象
         * 例如Tool.Update.set("ZoneUpdate", (dt: number) => { this.tick(dt) })
         * @param key key
         * @param value func 回调
         */
        public static set(key: any, value: (...args) => void) {
            Update.check();
            let update = Update.get(key);
            if (update != null) {
                cc.error("repeat update key :" + key);
            }
            Update.s_Update.data.set(key, value);
        }

        /**
         * 获取更新key的回调函数
         * @param key key
         */
        public static get(key: any): (...args) => void {
            Update.check();
            return Update.s_Update.data.get(key);
        }

        /**
         * 移除key的更新回调
         * @param key key
         */
        public static erase(key: any) {
            Update.check();
            Update.s_Update.data.erase(key);
        }

        /**
         * 调用更新key的函数
         * @param key key
         * @param args 回调参数
         */
        public static update(key: any, ...args) {
            Update.check();
            let update = Update.get(key);
            if (update == null) return;
            update(...args);
        }

        private static s_Update;

        private static check() {
            if (Update.s_Update == null) Update.s_Update = new Update();
        }
    }

    //神经助手，帮助注册和销毁
    //主要是用于，某个模块可能需要添加与神经的关联
    //然后cutOff函数可以帮助切断这个对象注册的所有神经关联
    export class NervusAssistant {
        private nervusCB: Map<(...args) => void>;
        private nervusItem: Map<string>;
        private nervus: Nervus;

        constructor(nervus: Nervus) {
            this.nervus = nervus;
            this.nervusCB = new Map<(...args) => void>();
            this.nervusItem = new Map<string>();
        }

        public set(name: string, system: any) {
            this.nervus.set(name, system);
            this.nervusItem.set(name, system);
        }

        //获取系统模块
        public get<T>(name: string): T {
            return this.nervus.get(name);
        }

        //移除系统模块
        public remove(name: string): any {
            this.nervus.remove(name);
            this.nervusItem.erase(name);
        }

        //获取神经对象
        public getNervus(): Nervus {
            return this.nervus;
        }

        //添加神经
        public addNervus(name: string, cb: (...args) => void) {
            this.nervusCB.set(name, cb);
            this.nervus.addNervus(name, cb);
        }

        //移除神经
        public removeNervus(name: string) {
            let cb = this.nervusCB.get(name);
            if (cb == null) return;
            this.nervus.removeNervus(name, cb);
        }

        //切断所有神经
        public cutOff() {
            let list = this.nervusCB.iterator()
            for (let iter in list) {
                this.removeNervus(iter);
            }

            list = this.nervusItem.iterator()
            for (let iter in list) {
                let item = this.nervus.get(iter);
                if (item == this.nervusItem.get(item)) {
                    this.remove(iter);
                }
            }
        }

        //必须执行
        public mustCall(name: string): (...args) => void {
            return this.nervus.mustCall(name);
        }

        //反正通知了，并不关注执行不执行
        public call(name: string): (...args) => void {
            return this.nervus.call(name);
        }
    }

    class FactoryStore {
        //用来存放库存
        private store: Array<any>;
        //创建函数
        public createFun: () => any;
        //销毁函数 obj是要销毁的对象
        public destoryFun: (obj: any) => void;

        //销毁整个仓库的囤积物
        public destory() {
            this.store.forEach(
                (obj) => {
                    this.destoryFun(obj);
                }
            )
        }

        //把物品归还给仓库
        public put(obj: any) {
            this.store.push(obj);
        }

        //如果仓库中有库存，那么就拿库存的，没有就创建
        public create(): any {
            if (this.store.length) {
                return this.store.pop();
            }
            return this.createFun();
        }

        constructor() {
            this.store = new Array<any>();
        }
    }

    interface FactoryFlag {
        _factory_type_Name: string;
        _factory_id: any;
    }

    /**
     *创建对象工厂
     */
    export class Factory {
        private gruopList: Map<Map<FactoryStore>>;

        /**
         * 设置工厂需要创建的对象
         * @param cf 创建对象的方法
         * @param df 销毁对象的方法 ,df传入的obj就是要销毁的对象
         * @param typeName 对象的分类
         * @param id 对象的id
         */
        public static setStore(cf: () => any, df: (obj: any) => void, typeName: string, id?: any) {
            Factory.check();
            let self = Factory.s_Factory;
            [typeName, id] = (id != null) ? [typeName, id] : typeName.split(".");
            let newStore = new FactoryStore();
            newStore.createFun = cf;
            newStore.destoryFun = df;

            if (self.gruopList.has(typeName) == false) {
                let newGroup = new Map<FactoryStore>();
                self.gruopList.set(typeName, newGroup);
            }
            self.gruopList.get(typeName).set(id, newStore);
        }

        /**
         * 创建对象，首先对象得是使用setStroe注册了
         * @param typeName 对象的分类 也可以直接 typename.id
         * @param id 对象的id，如果 typename直接使用typename.id这个就不要在写了
         */
        public static create<T>(typeName: string, id?: any): T {
            Factory.check();
            let self = Factory.s_Factory;
            [typeName, id] = (id != null) ? [typeName, id] : typeName.split(".");
            let newObj = self.gruopList.get(typeName).get(id).create();
            let flag = newObj as FactoryFlag;
            flag._factory_id = id;
            flag._factory_type_Name = typeName;
            return newObj;
        }

        /**
         * 将使用完毕后的对象放回到仓库以便重新再利用
         * @param obj 要放回的对象
         */
        public static put(obj: any) {
            Factory.check();
            let self = Factory.s_Factory;
            let flag = obj as FactoryFlag;
            if (flag._factory_id == null || flag._factory_type_Name == null) {
                cc.error("object must be created by the factory");
            }
            self.gruopList.get(flag._factory_type_Name).get(flag._factory_id).put(obj);
        }

        /**
         * 销毁整个类型id的仓库
         * @param typeName 对象的分类 也可以直接 typename.id
         * @param id 对象的id，如果 typename直接使用typename.id这个就不要在写了
         */
        public static destory(typeName: string, id?: any) {
            Factory.check();
            let self = Factory.s_Factory;
            [typeName, id] = (id != null) ? [typeName, id] : typeName.split(".");
            self.gruopList.get(typeName).get(id).destory();
            self.gruopList.get(typeName).erase(id);
        }

        constructor() {
            this.gruopList = new Map<Map<FactoryStore>>();
        }

        private static s_Factory: Factory;

        private static check() {
            if (Factory.s_Factory == null) Factory.s_Factory = new Factory();
        }
    }

    /**
     * UI控制器
     */
    class UIItem {
        private prefab: cc.Prefab;
        private exist: cc.Node;
        private scriptName: string;
        private defParent: cc.Node;

        /**
         * @param prefab UI的预制体
         * @param scriptName UI上绑定的脚本
         */
        constructor(prefab: cc.Prefab | cc.Node, scriptName?: string, parent?: cc.Node) {
            if (prefab instanceof cc.Prefab) {
                this.prefab = <cc.Prefab>prefab;
            } else {
                this.exist = <cc.Node>prefab;
            }
            this.scriptName = scriptName;
            this.defParent = parent;
        }

        private create() {
            if (this.exist == null) {
                this.exist = cc.instantiate(this.prefab);
                this.exist.parent = this.defParent;
                this.exist.active = false;
            }
        }

        /**
         * 显示UI
         */
        public show() {
            this.create();
            this.exist.active = true;
        }

        /**
         * 隐藏UI
         */
        public hide() {
            if (this.exist == null) {
                this.create();
            }
            this.exist.active = false;
        }

        /**
         * 获取UI上绑定的脚本
         */
        public script(): any {
            if (this.exist == null) {
                this.create();
            }
            if (this.scriptName == null) {
                return null;
            }
            let script = this.exist.getComponent(this.scriptName);
            return script;
        }

        /**
         * 获取UI自身节点对象
         */
        public node(): cc.Node {
            if (this.exist == null) {
                this.create();
            }
            return this.exist;
        }

        /**
         * 销毁UI对象
         */
        public destor() {
            if (this.exist == null) return;
            this.exist.destroy();
            this.exist = null;
        }

        /**
         * 设置父节点
         */
        public set parent(node: cc.Node) {
            this.defParent = node;
            this.show();
        }
    }

    /**
     * UI管理器
     * 注册是 Type.ID 方式注册
     * 可一个获取Script()，
     * UI注册会让注册的地方变得七零八落，不知道在什么地方注册的,
     * 而且返回的是any，导致不知道返回的对象是什么
     * 让接口变得模糊，所以这里注册应该维护一个UI使用文档
     * 好处是使用方便，让UI有一个集体的控制的地方
     */
    export class UI {
        private gruop: Map<Map<UIItem>>;

        constructor() {
            this.gruop = new Map<Map<UIItem>>();
        }

        /**
         * 设置要控制的UI
         * @param prefab UI的预制体
         * @param groupName 控制的组信息 "gruop.id"形式
         * @param scriptName UI控件上绑定的脚本名字
         * @param parent UI的父节点
         */
        public static delegate(groupName: string, prefab: cc.Prefab | cc.Node, scriptName?: string, parent?: cc.Node) {
            UI.check();
            let self = UI.s_UI;
            let id: string;
            [groupName, id] = (id != null) ? [groupName, id] : groupName.split(".");
            let item = new UIItem(prefab, scriptName, parent);
            if (self.gruop.has(groupName) == false) {
                self.gruop.set(groupName, new Map<UIItem>());
            }
            self.gruop.get(groupName).set(id, item);
        }

        /**
         * 获取UI控件
         * @param groupName 控制的组信息 "gruop.id"形式
         */
        public static get(groupName: string): UIItem {
            UI.check();
            let self = UI.s_UI;
            let id: string;
            [groupName, id] = (id != null) ? [groupName, id] : groupName.split(".");
            return self.gruop.get(groupName).get(id);
        }

        private static s_UI: UI;

        private static check() {
            if (UI.s_UI == null) UI.s_UI = new UI();
        }
    }

    //定时器句柄
    export class TimerHandle {
        exe: () => void;
        isValid: boolean;
        deadTime: number;

        constructor(exe: () => void, deadTime: number) {
            this.exe = exe;
            this.deadTime = deadTime;
            this.isValid = true;
        }

        stop() {
            this.isValid = false;
        }

        exec() {
            this.exe();
            this.isValid = false;
        }
    }


    //定时器
    export class Timer {
        list: Array<TimerHandle>;

        constructor() {
            this.list = new Array<TimerHandle>();
        }

        public static createTimer(deadTime: number, exe: () => void): TimerHandle {
            Timer.check();
            let self = Timer.s_Timer;
            let newTimer = new TimerHandle(exe, deadTime);
            self.list.push(newTimer);
            return newTimer;
        }

        private static s_Timer: Timer;

        private static check() {
            if (Timer.s_Timer == null) {
                Timer.s_Timer = new Timer();
                UsingTool.run();
                Tool.Update.set("Tool.Timer", (dt: number) => {
                    let self = Timer.s_Timer;
                    if (self.list.length == 0) return;
                    for (let i = self.list.length - 1; i >= 0; i--) {
                        let curTimer = self.list[i];
                        if (curTimer.isValid == true) {
                            curTimer.deadTime -= dt;
                            if (curTimer.deadTime <= 0) {
                                curTimer.exec();
                            }
                        } else {
                            if (self.list.length > 1) {
                                self.list[i] = self.list.pop();
                            }
                            else {
                                self.list.pop();
                            }
                        }
                    }
                })
            }
        }

    }

    //深拷贝
    export class DeepClone {
        static Clone(data) {
            let obj = {};
            let originQueue = [data];
            let copyQueue = [obj];
            let visitQueue = [];
            let copyVisitQueue = [];
            while (originQueue.length > 0) {
                let data = originQueue.shift();
                let obj = copyQueue.shift();
                visitQueue.push(data);
                copyVisitQueue.push(obj);
                for (let key in data) {
                    let _value = data[key]
                    if (typeof _value !== 'object') {
                        obj[key] = _value;
                    } else {
                        let index = visitQueue.indexOf(_value);
                        if (index >= 0) {
                            obj[key] = copyVisitQueue[index];
                        } else {
                            originQueue.push(_value);
                            obj[key] = {};
                            copyQueue.push(obj[key]);
                        }
                    }
                }
            }
            return obj;
        }
    }

    class SoundInfo {
        path: string
        id: number
        res: any;

        constructor(path: string, res: any) {
            this.path = null;
            this.id = -1;
            this.res = res;
        }
    }

    class SoundGroup {
        data: Map<SoundInfo>;
        volume: number;

        constructor() {
            this.data = new Map<SoundInfo>();
            this.volume = 1;
        }

        add(name, path: string, ccb: () => void) {
            if (this.data.get(name) != null) return;
            cc.loader.loadRes(path, (err, clip) => {
                this.data.set(name, new SoundInfo(path, clip));
                if (ccb != null) {
                    ccb();
                }
            });
        }

        remove(name: string) {
            let si = this.data.get(name);
            if (si != null) {
                // cc.audioEngine.uncache(si.path);
                cc.loader.release(si.path);
            }
        }

        removeAll() {
            let iter = this.data.iterator()
            for (let i in iter) {
                let path = (<SoundInfo>iter[i]).path;
                // cc.audioEngine.uncache();
                cc.loader.release(path);
            }
        }

        /**
         * 设置音量
         * @param v 音量0-1
         */
        setVolume(v: number) {
            this.volume = v;
            let iter = this.data.iterator()
            for (let i in iter) {
                cc.audioEngine.setVolume((<SoundInfo>iter[i]).id, v);
            }
        }

        getVolume(): number {
            return this.volume;
        }

        loopPlay(name: string) {
            let si = this.data.get(name);
            if (si != null) {
                si.id = cc.audioEngine.play(si.res, true, this.volume);
            }
        }

        play(name: string) {
            let si = this.data.get(name);
            if (si != null) {
                si.id = cc.audioEngine.play(si.res, false, this.volume);
            }
        }

        stop(name: string) {
            let si = this.data.get(name);
            if (si != null) {
                cc.audioEngine.stop(si.id);
            }
        }

        stopAll() {
            let iter = this.data.iterator()
            for (let i in iter) {
                cc.audioEngine.stop((<SoundInfo>iter[i]).id);
            }
        }

        pause(name: string) {
            let si = this.data.get(name);
            if (si != null) {
                cc.audioEngine.pause(si.id);
            }
        }

        pauseAll() {
            let iter = this.data.iterator()
            for (let i in iter) {
                cc.audioEngine.pause((<SoundInfo>iter[i]).id);
            }
        }
    }

    export class Sound {
        data: Map<SoundGroup>;

        constructor() {
            this.data = new Map<SoundGroup>();
        }

        public static add(path, ccb: () => void, gruop, name?: string) {
            Sound.check();
            let self = Sound.s_Sound;
            [gruop, name] = (name != null) ? [gruop, name] : gruop.split(".");
            if (self.data.get(gruop) == null) {
                self.data.set(gruop, new SoundGroup());
            }
            let g = self.data.get(gruop);
            g.add(name, path, ccb);
        }

        public static remove(gruop, name?: string) {
            Sound.check();
            let self = Sound.s_Sound;
            [gruop, name] = (name != null) ? [gruop, name] : gruop.split(".");
            let g = self.data.get(gruop);
            if (g == null) return;
            if (name = null) {
                if (g != null) {
                    g.removeAll();
                    self.data.erase(gruop)
                }
            } else {
                g.remove(name);
            }
        }

        public static setVolume(v: number, gruop, name?: string) {
            Sound.check();
            let self = Sound.s_Sound;
            [gruop, name] = (name != null) ? [gruop, name] : gruop.split(".");
            let g = self.data.get(gruop);
            if (g == null) return;
            g.setVolume(v);
        }

        public static stop(gruop, name?: string) {
            Sound.check();
            let self = Sound.s_Sound;
            [gruop, name] = (name != null) ? [gruop, name] : gruop.split(".");
            let g = self.data.get(gruop);
            if (g == null) return;
            if (name != null) {
                g.stop(name);
            } else {
                g.stopAll();
            }
        }

        public static play(gruop, name?: string) {
            Sound.check();
            let self = Sound.s_Sound;
            [gruop, name] = (name != null) ? [gruop, name] : gruop.split(".");
            let g = self.data.get(gruop);
            if (g == null) return;
            if (name == null) return;
            g.play(name);
        }

        public static loopPlay(gruop, name?: string) {
            Sound.check();
            let self = Sound.s_Sound;
            [gruop, name] = (name != null) ? [gruop, name] : gruop.split(".");
            let g = self.data.get(gruop);
            if (g == null) return;
            if (name == null) return;
            g.loopPlay(name);
        }

        public static pause(gruop, name?: string) {
            Sound.check();
            let self = Sound.s_Sound;
            [gruop, name] = (name != null) ? [gruop, name] : gruop.split(".");
            let g = self.data.get(gruop);
            if (g == null) return;
            if (name != null) {
                g.pause(name);
            } else {
                g.pauseAll();
            }
        }

        private static s_Sound: Sound;

        private static check() {
            if (Sound.s_Sound == null) Sound.s_Sound = new Sound();
        }
    }

    //矩形相关
    export class Rect {
        //求某个点是否在矩形范围内
        public static inRange(maxX: number, minX: number, maxY: number, minY: number, x: cc.Vec2 | number, y?: number): boolean {
            let tx = 0;
            let ty = 0;
            if (y != null) {
                tx = <number>x;
                ty = y;
            } else {
                tx = (<cc.Vec2>x).x;
                ty = (<cc.Vec2>x).y;
            }

            if (minX <= tx && tx <= maxX) {
                if (minY <= ty && ty <= maxY) {
                    return true;
                }
            }
            return false;
        }

        /**
         * 某个世界坐标点是否在节点内
         * @param node
         * @param worldPos
         */
        public static inNode(node: cc.Node, worldPos: cc.Vec2) {
            let nodePos = node.convertToNodeSpace(worldPos);
            if (nodePos.x < 0 || nodePos.y < 0 || nodePos.x > node.width || nodePos.y > node.height) {
                return false;
            }
            return true;
        }
    }

    export class Angle {
        //计算角度 360度
        public static angle360(px1, py1, px2, py2: number): number {
            let angle = Math.atan2((px1 - px2), (py1 - py2));
            return angle * (180 / Math.PI);
        }

        //通过角度和方向区间数量，计算出角度所在的区间，0度0区间 ,direcationNum有多少个区间
        public static getDirection(angle: number, direcationNum: number): number {
            let angle360 = angle;
            if (angle < 0) angle360 = 360 + angle;
            let direcationAngle = 360 / direcationNum / 2;

            if (angle360 < direcationAngle || angle360 > (360 - direcationAngle)) {
                return 0;
            }

            angle360 += angle360 % direcationAngle;
            var direction = Math.floor((angle360 - direcationAngle) / direcationAngle);
            if (direction % 2 == 1) direction += 1;
            direction = direction * direcationAngle;
            return Math.floor(direction / (direcationAngle * 2));
        }

        //通过区间和方向区间数量，计算出区间的中间角度，0度0区间 
        public static getAngleByDirection(direction: number, direcationNum: number) {
            if (direction == 0) return 0;
            let direcationAngle = 360 / direcationNum / 2;
            return direction * direcationAngle * 2;
        }
    }

    //直线相关
    export class Line {
        //两条线是否有重叠部分
        public static overlapping(fl: number, fr: number, sl: number, sr: number): boolean {
            let fb = Number.max(fl, fr);
            let fs = Number.min(fl, fr);
            let sb = Number.max(sl, sr);
            let ss = Number.min(sl, sr);
            if (ss > fb || sb < fs) return false;
            return true;
        }

        //求直接长度
        public static distance(x1: number, y1: number, x2: number, y2: number): number {
            return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
        }
    }

    //Txt读取器
    export class TxtReader {
        names: string[];
        types: string[];
        datas: {};

        constructor() {
            this.names = null;
            this.types = null;
            this.datas = {};
        }

        private checkArrayLastChar(arr: string[]) {
            let value = arr[arr.length - 1]
            if (value.charAt(value.length - 1) == '\r') {
                arr[arr.length - 1] = value.substring(0, value.length - 1)
            }

        }

        private loadData(data: string) {
            if (this.names == null) {
                this.names = data.split("\t");
                this.checkArrayLastChar(this.names);
            } else if (this.types == null) {
                this.types = data.split("\t");
                let value = this.types[this.types.length - 1]
                this.checkArrayLastChar(this.types);
            } else {
                this.setData(data);
            }
        }

        private onLoad(data: string) {
            let row = data.split("\n");
            this.checkArrayLastChar(row);
            for (let i = 0; i < row.length; i++) {
                this.loadData(row[i]);
            }
        }

        private convertData(type: string, data: string): any {
            let dataType = type.charAt(0);
            if (dataType == "i") {
                return parseInt(data);
            } else if (dataType == "f") {
                return parseFloat(data);
            } else {
                return data;
            }
        }

        private setData(data: string) {
            let dataList = data.split("\t");
            this.checkArrayLastChar(dataList);
            let newRow = {}
            let isArray = false;
            for (let i = 0; i < dataList.length; i++) {
                let type = this.types[i];
                let value = dataList[i];
                let name = this.names[i];

                if (name.indexOf("[") >= 0) isArray = true;
                if (isArray == true) {
                    let arrName = name.slice(0, name.indexOf("[") - 1);
                    if (newRow[arrName] == null) newRow[arrName] = new Array();
                    newRow[arrName].push(this.convertData(type, value));
                } else {
                    newRow[name] = this.convertData(type, value);
                }
            }
            this.datas[this.convertData(this.types[0], dataList[0])] = newRow;
        }

        public open(file: string) {
            let self = this
            cc.loader.loadRes(file, function (err, str) {
                if (err) {
                    cc.log(err)
                    return
                }
                self.onLoad(str)
            });
        }
    }


}
