class Mvvm {
    constructor(options) {
        this.$options = options;
        this._data = this.$options.data;
        // 实现数据劫持
        observe(this._data);
        // 实现数据代理
        Object.keys(this._data).forEach((key)=>{
            Object.defineProperty(this,key,{
                enumerable:true,
                get(){
                    return this._data[key];
                },
                set(newVal){
                    this._data[key] = newVal;
                }
            })
        })
        new Compile(options.el,this)//编译
    }

}

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


class Watcher {
    constructor(vm,key,cb){
        this.$vm = vm;
        this.$key = key;
        this.$cb = cb;
        this.value = this.get();
    }
    get(){
        // 添加订阅者
        Dep.target = this;
        let value = this.getVMVal(this.$vm,this.$key);
        Dep.target = null;
        return value;
    }

    getVMVal(vm,expr){
        let exp = expr.split(".");
        let val = vm;
        exp.forEach((k)=>{
            val = val[k];
        })
        return val;
    }

    update(){
        let oldVal = this.value;
        let newVal = this.getVMVal(this.$vm,this.$key)
        if (newVal !== oldVal) {
            this.value = newVal;
            this.$cb(newVal, oldVal);
        }
    }
}

class Compile{

    constructor(el,vm){
        this.$vm = vm;
        this.$el = document.querySelector(el)
        if(this.$el){
            //将dom拷贝到内存中
            let fragment = document.createDocumentFragment();
            let child;
            while(child = this.$el.firstChild){
                fragment.appendChild(child)
            }
            this.$fragment = fragment;

            this.replace(this.$fragment)
            this.$el.appendChild(this.$fragment)
        }
    }

    replace(el){
        let childNodes = el.childNodes;
        Array.from(childNodes).forEach((node)=>{
            // 判断节点类型
            if(node.nodeType === 1){
                this.compileDom(node)
            }else if (node.nodeType === 3){
                this.compileText(node)
            }
            // 判断当前节点是否有子节点
            if(node.childNodes){
                this.replace(node)
            }
        })
    }

    compileDom(node){
        let attrs = node.attributes
        Array.from(attrs).forEach(attr => {
            let attrName = attr.name
            // 判断是否是指令
            if(attrName.indexOf("v-") === 0){
                let [,dir] = attrName.split("-")
                let expr = attr.value
                // 判断是普通指令还是事件指令
                if(dir.indexOf("on") === 0){
                    compileUtil.eventHandler(node,expr,dir,this.$vm)
                }else{
                    compileUtil[dir] && compileUtil[dir](node,expr,this.$vm)
                }
            }
        });
    }

    compileText(node){
        let text = node.textContent;
        let reg = /\{\{(.*)\}\}/;
        if(reg.test(text)){
            compileUtil.text(node,RegExp.$1,this.$vm)
        }
    }

}

// 数据更新
let update = {
    textUpdate(node,value){
        node.textContent = typeof value == 'undefined' ? '' : value
    },
    modelUpdate(node,value){
        node.value = typeof value == 'undefined' ? '' : value
    }
}

// 指令处理工具
let compileUtil = {

    text(node,expr,vm){
        this.buid(node,expr,vm,"text")
    },

    model(node,expr,vm){
        this.buid(node,expr,vm,"model")
        let me = this,
            val = this.getVMVal(vm, expr);
        node.addEventListener('input', function(e) {
            let newValue = e.target.value;
            if (val === newValue) {
                return;
            }

            me.setVMVal(vm, expr, newValue);
            val = newValue;
        });
    },

    eventHandler(node,expr,dir,vm){
        let [,eventType] = dir.split(":");
        let fn = vm.$options.methods && vm.$options.methods[expr]
        if(eventType && fn){
            node.addEventListener(eventType,fn.bind(vm),false)
        }
    },

    buid(node,expr,vm,dir){
        let updateFn = update[dir+'Update']
        updateFn && updateFn(node,this.getVMVal(vm,expr))

        new Watcher(vm, expr, function(value, oldValue) {
            updateFn && updateFn(node, value, oldValue);
        });
    },

    getVMVal(vm,expr){
        let exp = expr.split(".");
        let val = vm
        exp.forEach((k)=>{
            val = val[k]
        })
        return val
    },

    setVMVal(vm,expr,newValue){
        let exp = expr.split('.');
        let val = vm
        exp.forEach((key,i)=>{
            if(i<exp.length-1){
                val = val[key]
            }else{
                val[key] = newValue
            }
        })
    }
}
module.exports = Mvvm;