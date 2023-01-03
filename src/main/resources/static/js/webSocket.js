var wsObj = null
var wsUri = null
var userId = -1


function createWebSocket(type) {
    console.log('创建连接传入的type ',type)
    var host = window.location.host //获取本机地址
    console.log('获取本机地址 ', host)
    userId = GetQueryString('userId')
    // wsUri ='ws://'+host+'/websocket?userId='+userId
    wsUri = 'ws://' + host + '/websocket/' + userId
    console.log("ws 地址" ,wsUri)
    try {
        wsObj = new WebSocket(wsUri)
        initWsEventHandle(type)
    } catch (e) {
        writeToScreen('执行关闭事件，开始重连 -- 群发')
        receiveMessage('执行关闭事件，开始重连 -- 点对点')
    }
}


function initWsEventHandle(type) {
    console.log('初始化传入的 type参数 ',type)
    try {
        wsObj.onopen = (env) => {
            console.log('TYPE',type)
            onWsOpen(env,type)
        }

        wsObj.onmessage = (env) => {
            if(type===0){
                onWsMessage(env)
            }else if (type===1){
                onMessage(env)
            }
        }
        wsObj.onclose = (env) => {
            writeToScreen('执行关闭事件，开始重连 -- 群发')
            receiveMessage('执行关闭事件，开始重连 -- 点对点')
            onWsClose(env)
        }
        wsObj.onerror = (env) => {
            writeToScreen('执行error事件，开始重连 -- 群发')
            receiveMessage('执行error事件，开始重连 -- 点对点')
            onWsError(env)
        }
    } catch (e) {
        writeToScreen('绑定事件没有成功 -- 群发')
        receiveMessage('绑定事件没有成功 -- 点对点')
    }
}


function onWsOpen(env,type) {
    console.log('开始 type' ,env,type)
    if(type==0){
        writeToScreen('CONNECTED -- 群发')
    }else if (type===1){
        receiveMessage('CONNECTED -- 点对点')
    }

}

function onWsClose(env) {
    writeToScreen('DISCONNECTED -- 群发')
    receiveMessage('DISCONNECTED -- 点对点')
}

function onWsError(env) {
    writeToScreen(env.data)
    receiveMessage(env.data)
}


function writeToScreen(message) {
    if (DEBUG_FLAG) {
        $('#showMessage').val($('#showMessage').val() + "\n" + message)
    }
}

function receiveMessage(message){
    if (DEBUG_FLAG) {
        $('#receive').val($('#receive').val() + "\n" + message)
    }
}


function GetQueryString(name) {
    var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i')
    var r = window.location.search.substr(1).match(reg) // 获取url中'?'符后的字符串 并正则匹配
    var context = ''
    console.log(r)
    if (r != null) {
        context = r[2]
    }
    reg = null
    r = null
    console.log("CONTEXT",context)
    return context == null || context == '' || context == undefined ? '' : context
}
