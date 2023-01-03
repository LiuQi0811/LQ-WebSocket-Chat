var wsObj = null
var wsUri = null
var userId = -1
var lockReconnect = false
var wsCreateHandler = null

/**
 * 创建 会话连接
 * @param type
 */
function createWebSocket(type) {
    console.log('创建连接传入的type ', type)
    var host = window.location.host //获取本机地址
    console.log('获取本机地址 ', host)
    userId = GetQueryString('userId')
    // wsUri ='ws://'+host+'/websocket?userId='+userId
    wsUri = 'ws://' + host + '/websocket/' + userId
    console.log("ws 地址", wsUri)
    try {
        wsObj = new WebSocket(wsUri)
        initWsEventHandle(type)
    } catch (e) {
        writeToScreen('执行关闭事件，开始重连 -- 群发')
        receiveMessage('执行关闭事件，开始重连 -- 点对点')
        reconnect()
    }
}


function initWsEventHandle(type) {
    console.log('初始化传入的 type参数 ', type)
    try {
        wsObj.onopen = (env) => {
            console.log('TYPE', type)
            onWsOpen(env, type)
        }

        wsObj.onmessage = (env) => {
            if (type === 0) {
                onWsMessage(env)
            } else if (type === 1) {
                onMessage(env)
            }
        }
        wsObj.onclose = (env) => {
            writeToScreen('执行关闭事件，开始重连 -- 群发')
            receiveMessage('执行关闭事件，开始重连 -- 点对点')
            onWsClose(env)
            reconnect()

        }
        wsObj.onerror = (env) => {
            writeToScreen('执行error事件，开始重连 -- 群发')
            receiveMessage('执行error事件，开始重连 -- 点对点')
            onWsError(env)
            reconnect()

        }
    } catch (e) {
        writeToScreen('绑定事件没有成功 -- 群发')
        receiveMessage('绑定事件没有成功 -- 点对点')
        reconnect()
    }
}


function onWsOpen(env, type) {
    console.log('开始 type', env, type)
    if (type == 0) {
        writeToScreen('CONNECTED -- 群发')
    } else if (type == 1) {
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

/**
 * 群发 消息接收 展示
 * @param message
 */
function writeToScreen(message) {
    if (DEBUG_FLAG) {
        $('#showMessage').val($('#showMessage').val() + "\n" + message)
    }
}


/**
 * 点对点 消息接收 展示
 * @param message
 */
function receiveMessage(message) {
    if (DEBUG_FLAG) {
        $('#showMsg').val($('#showMsg').val() + "\n" + message)
    }
}

/**
 * 解析 传入参数
 * @param name
 * @returns {string}
 * @constructor
 */
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
    console.log("CONTEXT", context)
    return context == null || context == '' || context == undefined ? '' : context
}

/**
 * 会话服务重连
 */
function reconnect() {
    if (lockReconnect) { //自定义锁 避免重发请求连接
        return;
    }
    writeToScreen('群发 1秒后重连')
    receiveMessage('点对 点1秒后重连')
    lockReconnect = true
    // 没连接上会一直连，设置延迟避免请求过多
    wsCreateHandler && clearTimeout(wsCreateHandler)
    wsCreateHandler = setTimeout(() => {
        writeToScreen('群发 重连......' + wsUri)
        receiveMessage('点对点 重连......' + wsUri)
        console.log(' 重连的 TYPE ', type)
        createWebSocket(type)
        lockReconnect = false
        writeToScreen('群发 重连完成')
        receiveMessage('点对点 重连完成')
    }, 1000)

}
