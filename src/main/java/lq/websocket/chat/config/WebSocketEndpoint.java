package lq.websocket.chat.config;

import com.alibaba.fastjson.JSON;
import lombok.extern.slf4j.Slf4j;
import lq.websocket.chat.pool.SocketSessionPool;
import org.springframework.stereotype.Component;

import javax.websocket.OnClose;
import javax.websocket.OnMessage;
import javax.websocket.OnOpen;
import javax.websocket.Session;
import javax.websocket.server.PathParam;
import javax.websocket.server.ServerEndpoint;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

/*
 *@ClassName WebSocketEndpoint
 *@Description 双向通信端点
 *@Author LiuQi
 *@Date 2023/1/2 11:55
 *@Version 1.0
 */
@ServerEndpoint(value = "/websocket/{userId}") //ws:localhost:8000/websocket/0001
@Component
@Slf4j
public class WebSocketEndpoint {
    private Session session;    //与某个客户端连接会话，需要通过它来给客户端发送数据

    /**
     * 连接建立成功调取方法
     */
    @OnOpen
    public void onOpen(Session session, @PathParam(value = "userId") String userId) {
        // 分解获取的参数，把参数信息 放到session 会话 key中
        //将会话存入连接池中
        SocketSessionPool.sessions.put(userId, session);

    }

    /**
     * 关闭连接
     */
    @OnClose
    public void onClose(Session session) throws IOException {
        SocketSessionPool.close(session.getId()); //删除 会话id
        session.close();// 关闭连接
    }

    /**
     * 收到客户端消息后调用的方法
     *
     * @param message 客户端发送过来的信息
     */
    @OnMessage
    public void onMessage(String message, Session session) {
        log.info("收到客户端消息后调用的方法.......");
        log.info("接收到的消息返回结果 {}", message);
         boolean checkSocket = this.heartCheckSocket(message, session);
        log.info("心跳检测  {}",  checkSocket);
        if(!checkSocket){
            if (message.contains("fromUserId")) {// 点对点会话
                Map<String, Object> params = JSON.parseObject(message, new HashMap<String, Object>().getClass());
                log.info("获取会话信息 JSON  {}", params);
                SocketSessionPool.sendMessage(params);
            } else {//群发会话
                log.info("获取会话信息 String {}  ", message);
                SocketSessionPool.sendMessage(message);
            }
        }

    }

    /**
     * 心跳检测
     *
     * @param message
     * @param session
     */
    public boolean heartCheckSocket(String message, Session session) { //如果是心跳检测的消息，返回pong作为心跳回应
        boolean result = false;
        if (message.equalsIgnoreCase("ping")) {
            try {
                Map<String, Object> params = new HashMap<>();
                params.put("type", "pong");
                session.getAsyncRemote().sendText(JSON.toJSONString(params));
                log.info("应答客户端的消息: {}", JSON.toJSONString(params));
            } catch (Exception e) {
                e.printStackTrace();
            }
            result = true;
        }
        return result;
    }
}
