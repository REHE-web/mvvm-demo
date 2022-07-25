
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
