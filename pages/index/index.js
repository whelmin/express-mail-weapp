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
    search_active: false
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
    });
  },
  onShow: function (){
    var that = this;
    if(that.data.list_remind !== '加载中'){
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
      url: app._g.server + '/mail/u/receives/lost',
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
            current: data
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
