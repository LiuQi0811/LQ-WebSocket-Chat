package lq.websocket.chat.pool;

import lombok.extern.slf4j.Slf4j;

import javax.websocket.Session;
import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

/*
 *@ClassName SocketSessionPool
 *@Description 会话连接池
 *@Author LiuQi
 *@Date 2023/1/2 12:17
 *@Version 1.0
 */
@Slf4j
public class SocketSessionPool {
    public static Map<String, Session> sessions = new ConcurrentHashMap<>(); //会话连接池


    /**
     * 关闭会话连接
     *
     * @param sessionId
     * @throws IOException
     */
    public static void close(String sessionId) throws IOException {
        log.info("进入到关闭会话方法.......");
        for (String userId : SocketSessionPool.sessions.keySet()) {// 遍历会话池 所有的session
            Session session = SocketSessionPool.sessions.get(userId);
            if (session.getId().equals(sessionId)) { //如果获取的session 与传入的session 一致 删除这条会话
                log.info("对比后的会话id {}  ", session.getId());
                sessions.remove(userId);
                break;
            }
        }
    }

    public static void sendMessage(String sessionId, String message) {
        sessions.get(sessionId).getAsyncRemote().sendText(message);
    }

    /**
     *  群发信息
     * @param message
     */
    public static void sendMessage(String message) {
        for (String sessionId : SocketSessionPool.sessions.keySet()) {
            SocketSessionPool.sessions.get(sessionId).getAsyncRemote().sendText(message);
        }
    }

    /**
     * 点对点发消息
     * @param params
     */
    public static void sendMessage(Map<String,Object> params)
    {
        //        var data = {'fromUserId': userId, 'toUserId': toUserId, 'msg': msg}
         String fromUserId = (String) params.get("fromUserId");
         String toUserId = (String) params.get("toUserId");
         String msg = (String) params.get("msg");
         msg = "来自"+fromUserId+"的消息: "+msg;

         Session session = SocketSessionPool.sessions.get(toUserId); //获取会话
        if (session!=null) {
            session.getAsyncRemote().sendText(msg);
        }
    }
}
