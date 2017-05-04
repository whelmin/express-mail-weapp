// pages/more/shared/chat.js
// socket连接状态, 消息队列
var socketOpen, socketMsgQueue, ws, client;

// 群聊
function sendSocketMessage(msg) {
  if (socketOpen) {
    wx.sendSocketMessage({
      data: msg
    });
  }else {
    socketMsgQueue.push(msg);
  }
}

function init() {
  socketOpen = false;
  socketMsgQueue = [];
  ws = {
    send: sendSocketMessage,
    onopen: null,
    onmessage: null
  };
  client = null;
}

function initClient() {
  // Stomp用来订阅和发布消息、基于二进制的协议
  var Stomp = require('../../../utils/stomp.js').Stomp;
  client = Stomp.over(ws);
}

var app = getApp();
Page({
  data:{
    user:{
      id: null,
      nickName: null
    },
    active_type: 'groupChat',
    record: [],
    inputContent: null,
    scrollTop: 0,
    scrollHeight: 0,
    toView: '',
    count: 0
  },
  onShareAppMessage: function () {
    var that = this;
    return {
      title: '共享服务群聊',
      desc: '即刻加入群聊',
      path: '/pages/more/shared/chat'
    }
  },
  onLoad:function(options){
    // 页面初始化 options为页面跳转所带来的参数
    var that = this;

    if(!app._g.user.id) {
      app.getUserInfo(function(){
        that.getData(options);
      });
    }else{
      that.getData(options);
    }
  },
  onUnload: function() {
    wx.closeSocket();
  },
  getData:function(options){
    var that = this;
    that.setData({
      'user.id': app._g.user.id,
      'user.nickName': app._g.user.nickName
    });
    that.data.record.push({
      id: that.data.record.length,
      type: 'system',
      content: '正在登录 ...'
    });
    init();
    wx.connectSocket({
      url: app._g.websocket + '/express-mail',
      header:{ 
        'authorization': app.getAuth()
      },
      success: function(res) {
        // console.log('Socket连接成功');

        that.data.record.push({
          id: that.data.record.length,
          type: 'system',
          content: '登录成功😬'
        });

        that.data.record.push({
          id: that.data.record.length,
          type: 'system',
          content: that.data.user.nickName + '加入群聊了，开始聊天吧 ...'
        });

        that.setData({
          record: that.data.record
        });
      },
      fail: function(err) {
        that.data.record.push({
          id: that.data.record.length,
          type: 'system',
          content: '登录失败' + err
        });

        that.data.record.push({
          id: that.data.record.length,
          type: 'system',
          content: '您还没有加入群聊，请稍后重试'
        });

        that.setData({
          record: that.data.record
        });
      }
    });
    wx.onSocketOpen(function(res) {
      // console.log('WebSocket连接已打开！');
      socketOpen = true;
      for(var i = 0; i < socketMsgQueue.length; i++) {
        sendSocketMessage(socketMsgQueue[i]);
      }
      socketMsgQueue = [];
      ws.onopen && ws.onopen();
    });
    
    wx.onSocketMessage(function (res) {
      // console.log('收到onmessage事件:', res);
      ws.onmessage && ws.onmessage(res);
    });
    
    initClient();

    client.connect({ 'authorization': app.getAuth() }, function (sessionId) {
        // 订阅实时聊天记录
        client.subscribe('/topic/chat', function (res) {
            var item = JSON.parse(res.body);
            item.type = 'speak';
            item.createTime = app.utils.formatNoS(item.createTime);
            if(item.content.match(/\!\[img\]\:/g)) {
              item.imgUrl = item.content.split('![img]:')[1];
            }
            that.data.record.push(item);

            that.setData({
              record: that.data.record
            });
            that.scrollBottom('chat');
        });
        // 订阅历史聊天记录
        client.subscribe('/app/chat/record', function (res) {
            var body = res.body;
            if(body) {
              var content = JSON.parse(body).content;

              content.map(function(e,i){
                e.type = 'speak';
                e.createTime = app.utils.formatNoS(e.createTime);
                if(e.content.match(/\!\[img\]\:/g)) {
                  e.imgUrl = e.content.split('![img]:')[1];
                }
                return e;
              });
              
              that.setData({
                record: that.data.record.concat(content)
              });
            }else{
              that.data.record.push({
                id: that.data.record.length,
                type: 'system',
                content: '获取历史聊天记录失败，请检查网络'
              });
              that.setData({
                record: that.data.record
              });
            }
            that.scrollBottom('chat');
        });
        // 订阅聊天错误信息
        client.subscribe('/user/queue/errors', function (res) {
            that.data.record.push({
              id: that.data.record.length,
              type: 'system',
              content: res.body
            });

            that.setData({
              record: that.data.record
            });
            that.scrollBottom('chat');
        });

    });

    wx.onSocketError(function(res){
      // console.log('WebSocket连接打开失败，请检查网络！');
      that.data.record.push({
          id: that.data.record.length,
          type: 'system',
          content: 'WebSocket连接失败，请检查网络' + res.body
      });
      
      that.setData({
        record: that.data.record
      });
      that.scrollBottom('chat');
    });
  },
  //监听滚动
  onScroll: function(e) {
    var that = this;
    var scrollTop = e.detail.scrollTop;
    if(scrollTop > that.data.scrollHeight) {
      that.setData({
        scrollHeight: scrollTop
      });
    }
    that.setData({
      scrollTop: scrollTop
    });
  },
  //监听到底部
  onScrollTolower: function() {
    var that = this;
    that.setData({
      count: 0
    });
  },
  //滚动到底部
  scrollBottom: function(status){
    var that = this;
    if(status === 'chat' && that.data.scrollHeight - that.data.scrollTop > 500){
      // 如果正在查阅历史记录，则只显示有新消息，但不进行滚动
      that.data.count++;
      that.setData({
        count: that.data.count
      });
      return;
    }
    that.setData({
      count: 0
    });
    that.setData({
      toView: 'lastItem'
    });
  },
  // 绑定消息输入
  changeInputContent: function(e) {
    this.setData({
      'inputContent': e.detail.value
    });
  },
  sendMessage: function(){
    var that = this;
    if(!that.data.inputContent) {
      return false;
    }
    client.send('/app/chat', {}, JSON.stringify({
        content: that.data.inputContent
    }));

    that.setData({
      'inputContent': null
    });
  },
  sendPhoto: function() {
    var that = this;
    wx.chooseImage({
        count: 1,
        sourceType: ['album', 'camera'],
        success: function (res) {
          var tempFilePaths = res.tempFilePaths;          
          wx.showNavigationBarLoading();
          wx.uploadFile({
            url: app._g.server + '/upload',
            header: {
              'authorization': app.getAuth(),
              'content-type': 'application/x-www-form-urlencoded'
            },
            filePath: tempFilePaths[0],
            name: 'file',
            success: function(res){
              var data = JSON.parse(res.data);
              console.log(data);
              client.send('/app/chat', {}, JSON.stringify({
                content: '![img]:' + app._g.server + '/img/' + data.id
              }));
            },
            fail: function(res){
              app.showErrModal(res.errMsg,'网络错误，请稍候重试');

            },
            complete: function() {
              wx.hideNavigationBarLoading();
            }
        });
        }
    });
  },
  previewPhoto: function(e) {
    var that = this;
    var urlsArray = [];
    urlsArray.push(e.target.dataset.imgUrl);

    wx.previewImage({
      current: e.target.dataset.imgUrl,
      urls: urlsArray
    });
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