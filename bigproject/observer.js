
class Observer {
    constructor(data){
        this._data = data;
        Object.keys(this._data).forEach(key=>{
            let val = this._data[key];
            let dep = new Dep();
            observe(val);
            Object.defineProperty(this._data,key,{
                enumerable:true,//可遍历
                get(){
                    // 添加订阅者
                    Dep.target && dep.addSub(Dep.target);
                    return val;
                },
                set(newVal){
                    if( newVal === val ) return false;
                    val = newVal;
                    // 新的值是object的话，进行监听
                    observe(newVal);
                    // 通知订阅者
                    dep.notify();
                }
            })
        })
    }
}

function observe(value) {
    if (!value || typeof value !== 'object') {
        return;
    }
    return new Observer(value);
}

class Dep{
    constructor(){
        this.subs = [];
    }
    addSub(sub){
        this.subs.push(sub);
    }
    notify(){
        this.subs.forEach(sub=>{
            sub.update();
        })
    }
}
module.exports = observe;

