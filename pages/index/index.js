//index.js
//获取应用实例
var app = getApp();
Page({
  data: {
    isAdmin: false,
    list: [],
    current: {},
    list_remind: '加载中',
    search_text: '',
    search_active: false,
    //列表是否有更新
    list_update: false,
    //计数
    count: {}
  },
  //下拉刷新
  onPullDownRefresh: function(){
    var that = this;
    that.getList(0);
  },
  //上滑加载
  onReachBottom: function(){
    var that = this;
    that.getList();
  },
  onLoad: function () {
    var that = this;
    //登录
    app.showLoadToast();
    app.getUserInfo(function(){
      wx.hideToast();
      that.setData({
        isAdmin: app._g.role.isAdmin
      });
      that.getList();
      that.mpCount();
    });
  },
  onShow: function (){
    var that = this;
    if(that.data.list_remind !== '加载中'){
      that.getList(0);
    }
  },
  //绑定input
  bindKeyInput: function(e) {
    var that = this;
    var obj = {};
    obj[e.target.dataset.key] = e.detail.value;
    that.setData(obj);
    // 搜索关键字清空后，需要重新获取列表
    if(e.detail.value === '' && that.data.list_update === true) {
      that.getList(0);
    }
  },
  //获取待认领列表
  getList: function(page) {
    var that = this;
    if(app._g.role.isAdmin){ return; }
    if(page === undefined){
      page = that.data.current.number + 1 || 0;
    }
    if(!page){ that.setData({ list:[], current: {} }); }
    if(page >= that.data.current.totalPages){ return; }
    that.setData({ list_remind: '加载中' });
    wx.showNavigationBarLoading();
    
    wx.request({
      method: 'POST',
      url: app._g.server + '/u/mail/receive/l/lost',
      data: {
        page: page
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded',
        'authorization': app.getAuth()
      },
      success: function(res) {
        if(res.statusCode >= 200 && res.statusCode < 400){
          var data = res.data;
          var content = data.content;
          content.map(function(e,i){
            e.sendTime = app.utils.formatDate(e.sendTime);
            e.submitTime = app.utils.formatTime(e.submitTime);
            return e;
          });
          that.setData({
            list: that.data.list.concat(content),
            current: data,
            list_update: false
          });
          if(data.last){
            that.setData({ list_remind: '已全部加载' });
          }else{
            that.setData({ list_remind: '上滑加载更多' });
          }
        }else{
          app.showErr(res.data, that, 'list_remind');
        }
      },
      fail: function(res) {
        that.setData({ list_remind: '网络错误' });
      },
      complete: function() {
        wx.hideNavigationBarLoading();
        wx.stopPullDownRefresh();
      }
    });
  },
  // 搜索
  search: function(e) {
    var that = this;
    if(that.data.search_text === ''){ 
      app.showErrModal('搜索关键字不能为空', '搜索失败'); return; 
    }
    wx.showNavigationBarLoading();
    wx.request({
      url: app._g.server + '/u/mail/receive/s/lost',
      data: {
        keywords: that.data.search_text
      },
      method: 'POST', 
      header: {
        'content-type': 'application/x-www-form-urlencoded',
        'authorization': app.getAuth()
      }, 
      success: function(res){
        // success
        if(res.statusCode >= 200 && res.statusCode < 400){
          var data = res.data;
          var content = data.content;
          console.log(content);
          if(content.length !==0) {
            content.map(function(e,i){
              e.sendTime = app.utils.formatDate(e.sendTime);
              e.submitTime = app.utils.formatTime(e.submitTime);
              return e;
            });
            that.setData({
              list: content,
              list_update: true
            });
          }else{
            that.setData({ 
              list_remind: '没有找到相关数据哦',
              list: [],
              list_update: true
            });
          }
        }
      },
      fail: function(res) {
        // fail
        that.setData({ list_remind: '网络错误' });
      },
      complete: function(res) {
        // complete
        wx.hideNavigationBarLoading();
      }
    })

  },
  // 徽章计数
  mpCount: function() {
    var that = this;
    wx.request({
      url: app._g.server + '/mp/count',
      method: 'GET', 
      header: {
        'content-type': 'application/x-www-form-urlencoded',
        'authorization': app.getAuth()
      }, 
      success: function(res){
         if(res.statusCode >= 200 && res.statusCode < 400){
           var data = res.data;
           var receiveTotal = data.receiveMailCount + data.foundMailCount;
           data.receiveTotal = receiveTotal;
           console.log(data);
           app._g.count = data || {};
           that.setData({
             count: app._g.count
           });
         }
      },
      fail: function(res) {
        // fail
      },
      complete: function(res) {
        // complete
      }
    })
  },
  // 输入框聚焦，失焦变化
  inputFocus: function(e){
    this.setData({
      'search_active': true
    });
  },
  inputBlur: function(e){
    this.setData({
      'search_active': false
    });
  },
  //管理员操作
  qrcode: function(){
    wx.scanCode({
      success: function(res) {
        var result = JSON.parse(res.result);
        if(result.qrCodeInfoType === 'ADMIN_LOGIN'){
          // 扫码登录
          wx.showNavigationBarLoading();
          wx.request({
            method: 'POST',
            url: app._g.server + '/login/a/confirm',
            data: {
              qrCodeInfo: result.qrCodeInfo
            },
            header: {
              'content-type': 'application/x-www-form-urlencoded',
              'authorization': app.getAuth()
            },
            success: function(res) {
              if(res.statusCode >= 200 && res.statusCode < 400){
                if(res.data.code == '200'){
                  wx.showToast({ title: '登录成功' });
                }
              }else{
                app.showErrModal(res.data, '扫描二维码失败');
              }
            },
            fail: function(res) {
              app.showErrModal('网络错误', '扫描二维码失败');
            },
            complete: function() {
              wx.hideNavigationBarLoading();
            }
          });
        }else if(result.qrCodeInfoType === 'RECEIVE_MAIL'){
          // 扫码取件

        }else if(result.qrCodeInfoType === 'SEND_MAIL'){
          // 扫码寄件

        }
      }
    });
  }
});
