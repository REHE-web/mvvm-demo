##  README

###  1. observer.js

1、实现一个数据劫持Observer
2、通知和添加订阅

###  2. watcher.js

1、实现一个Watcher，连接Observer和Compile
2、通知和添加订阅

###  3. compile.js

1、实现模板编译

2、实现单向和双向绑定

###  4. mvvm.js

1、MVVM作为数据绑定的入口，整合Observer、Compile和Watcher三者，通过Observer来监听自己的model数据变化，通过Compile来解析编译模板指令，最终利用Watcher搭起Observer和Compile之间的通信桥梁，达到数据变化 -> 视图更新；视图交互变化(input) -> 数据model变更的双向绑定效果。

![](mvvm.png)