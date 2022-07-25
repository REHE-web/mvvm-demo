/**
 * @jest-environment jsdom
 */
const Mvvm = require('./mvvm')

test('单向绑定测试', () => {
    let div = document.createElement("div");
    div.innerHTML = `<p v-text="a.a"></p>`;
    document.body.innerHTML = `<div id="app">` + div.innerHTML + `</div>`;
    const vm = new Mvvm({
        el:"#app",
        data:{
            a:{
                a:"b"
            }
        }
    })
    let b = document.querySelectorAll("p").item(0).innerHTML
    expect(b).toBe(vm.$options.data.a.a)
})

test('双向绑定测试', () => {
    let div = document.createElement("div");
    div.innerHTML = `
        <input type="text" v-model="msg">
        <p>{{msg}}</p>
    `;
    document.body.innerHTML = `<div id="app">` + div.innerHTML + `</div>`;
    const vm = new Mvvm({
        el:"#app",
        data:{
            msg:"mvvm",
        }
    })
    let input = document.querySelector('input');
    input.value = "new_mvvm"
    let evt = document.createEvent('HTMLEvents')
    evt.initEvent('input', true, true)
    input.dispatchEvent(evt);
    let msg = document.querySelectorAll("p").item(0).innerHTML
    expect(msg).toBe(vm.$options.data.msg)
})

test('事件绑定测试', () => {
    let div = document.createElement("div");
    div.innerHTML = `
        <button v-on:click="addOne">加一</button>
        <p>{{counter}}</p>
    `;
    document.body.innerHTML = `<div id="app">` + div.innerHTML + `</div>`;
    const vm = new Mvvm({
        el:"#app",
        data:{
            counter: 0
        },
        methods:{
            addOne (){
                this.counter++;
            }
        }
    })
    let cnt = document.querySelectorAll("p").item(0).innerHTML
    expect(parseInt(cnt)).toBe(vm.$options.data.counter)
})