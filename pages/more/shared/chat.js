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
    user:{
      id: null,
      nickName: null
    },
    active_type: 'groupChat',
    // record: [
    //   {
    //     id:	'590090cc00d9da5de5c7ace0',
    //     user: {
    //       id: '590051fe00d9da5de5c7accb',
    //       nickName: '这是昵称',
    //       avatarUrl: 'http://wx.qlogo.cn/mmopen/vi_32/DYAIOgq83eqdaRumdXeLU2wEm3Q3AevauKCjJWx3Ke48NyGpEnmqnKp26jibW7qic9qicN0ogrZSbxbk8LZ4jNEUA/0'
    //     },
    //   content:	'23',
    //   createTime:	'4-7 12:00:00',
    //   type: 'speak'
    // },
    // {
    //     id:	'590185dc00d9da0f8ef23ed4',
    //     user: {
    //       id: '59005a3100d9da5de5c7acce',
    //       nickName: 'whelmin',
    //       avatarUrl: 'http://wx.qlogo.cn/mmopen/vi_32/4j897mJ7GmzEKNicbRXs7DCXZcibx944Zlb6b7LmGyudpsEPSGYDYK50lxI6B6GW7fsiabo5Uy1y20Q3mzxicwibq8Q/0'
    //     },
    //   content:	'刚回家',
    //   createTime:	'04-27 13:47:08',
    //   type: 'speak',
    //   imgUrl: 'https://cqipc.cn/api/img/5900be3d00d9da4431772395'
    // }
    // ],
    record: [],
    inputContent: null,
    imgLen: 0,

  },
  onLoad:function(options){
    // 页面初始化 options为页面跳转所带来的参数
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
    wx.connectSocket({
      url: app._g.websocket + '/express-mail',
      header:{ 
        'authorization': app.getAuth()
      },
      success: function(res) {
        console.log('Socket连接成功');

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
              app.showErrModal('获取历史聊天记录失败','网络错误');
            }
            
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
        });

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
  // 绑定消息输入
  changeInputContent: function(e) {
    this.setData({
      'inputContent': e.detail.value
    });
  },
  sendMessage: function(){
    var that = this;
    console.log('send');
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
          console.log(res);
          // tempFilePaths.forEach(function(e){
          //   that.uploadImg(e);
          // });
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