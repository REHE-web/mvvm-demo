class Compile{

    constructor(el,vm){
        this.$vm = vm;
        this.$el = document.querySelector(el)
        if(this.$el){
            //将dom拷贝到内存中
            let fragment = document.createDocumentFragment();
            let child;
            while(child = this.$el.firstChild){
                fragment.appendChild(this.$el.firstChild)
            }
            this.$fragment = fragment;

            this.replace(this.$fragment)
            this.$el.appendChild(this.$fragment)
        }
    }

    replace(el){
        Array.from(el.childNodes).forEach((node)=>{
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
                //判断是普通指令还是事件指令
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