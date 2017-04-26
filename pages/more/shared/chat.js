// pages/more/shared/chat.js
// 群聊

// socket连接状态
var socketOpen = false;
// 消息队列
var socketMsgQueue = [];
function sendSocketMessage(msg) {
  if (socketOpen) {
    wx.sendSocketMessage({
      data: msg
    });
  }else {
    socketMsgQueue.push(msg)
  }
}

// 初始化
var ws = {
  send: sendSocketMessage,
  onopen: null,
  onmessage: null
};
var client = null;

function initClient() {
  // Stomp用来订阅和发布消息、基于二进制的协议
  var Stomp = require('../../../utils/stomp.js').Stomp;
  client = Stomp.over(ws);
}

var app = getApp();
Page({
  data:{
    status_remind: '建立连接中...',
    message_remind: '加载聊天记录',
    active_type: 'groupChat',
    record: []
  },
  onLoad:function(options){
    // 页面初始化 options为页面跳转所带来的参数
    var that = this;
  
    wx.connectSocket({
      url: 'ws://139.129.33.201:9090/express-mail',
      header:{ 
        'authorization': app.getAuth()
      },
      success: function(res) {
        console.log('Socket连接成功');
        that.setData({
          status_remind: '连接成功！开始群聊吧😊'
        });
      },
      fail: function(err) {
        that.setData({
          status_remind: '连接失败！请稍候重试。'
        });
      }
    });
    wx.onSocketOpen(function(res) {
      console.log('WebSocket连接已打开！')
      socketOpen = true;
      for(var i = 0; i < socketMsgQueue.length; i++) {
        sendSocketMessage(socketMsgQueue[i]);
      }
      socketMsgQueue = [];
      ws.onopen && ws.onopen();
    });
    
    wx.onSocketMessage(function (res) {
      console.log('收到onmessage事件:', res)
      ws.onmessage && ws.onmessage(res);
    });
    
    initClient();

    client.connect({ 'authorization': app.getAuth() }, function (sessionId) {
        // 订阅实时聊天记录
        client.subscribe('/topic/chat', function (body, headers) {
            console.log('实时聊天记录');
        });
        // 订阅历史聊天记录
        client.subscribe('/app/chat/record', function (res) {
            console.log('历史聊天记录');
            if(res.body) {
              that.setData({
                record: JSON.parse(res.body).content,
                message_remind: '加载聊天记录成功。'
              });
            }else{
              app.showErrModal('获取历史聊天记录失败','网络错误');
            }
            
        });
        // 订阅聊天错误信息
        client.subscribe('/user/queue/errors', function (body, headers) {
            console.log('聊天错误信息', body);
        });

        // client.send('/app/chat', { priority: 9 }, 'hello workyun.com !');
    });

    wx.onSocketError(function(res){
      console.log('WebSocket连接打开失败，请检查网络！')
    });
  },
  onReady:function(){
    // 页面渲染完成
  },
  //切换tab
  switchType: function(e) {
    var that = this;
    var active_type = e.currentTarget.dataset.type;
    if(active_type === 'forum') {
      wx.redirectTo({
        url: '/pages/more/shared/list'
      });
    }
  },
  onShow:function(){
    // 页面显示
  },
  onHide:function(){
    // 页面隐藏
  },
  onUnload:function(){
    // 页面关闭
  }
})