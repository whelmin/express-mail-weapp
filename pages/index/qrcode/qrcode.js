// pages/index/qrcode/qrcode.js
var app = getApp();
var querygo = null;
Page({
  data:{
    id: null,
    qrcode_url: null,
    data: {}
  },
  onLoad:function(options){
    var that = this;
    that.setData({
      id: options.id,
      qrcode_url: app._g.server + '/mail/u/receive/qrcode/' + app.getAuth() + '/' + options.id
    });
    wx.showNavigationBarLoading();
    that.getInfo();
    querygo = setInterval(function(){
      that.getInfo(function(used){
        if(used){ clearInterval(querygo); }
      }, function(){
        clearInterval(querygo);
      });
    }, 5000);
    
  },
  onUnload:function(){
    // 页面关闭
    clearInterval(querygo);
  },
  getInfo: function(cb, err_cb){
    var that = this;
    wx.request({
      method: 'GET',
      url: app._g.server + '/mail/receive/' + that.data.id,
      header: {
        'content-type': 'application/x-www-form-urlencoded',
        'authorization': app.getAuth()
      },
      success: function(res) {
        if(res.statusCode >= 200 && res.statusCode < 400){
          var data = res.data;
          data.receiveMail.sendTime = app.utils.formatDate(data.receiveMail.sendTime);
          data.receiveMail.submitTime = app.utils.formatTime(data.receiveMail.submitTime);
          data.receiveMail.receiveTime = app.utils.formatTime(data.receiveMail.receiveTime);
          that.setData({
            data: data
          });
          typeof cb == "function" && cb(data.receiveMail.status === 'RECEIVED');
        }else{
          app.showErrModal(res.data, '获取取件信息失败');
          typeof cb == "function" && err_cb();
        }
      },
      fail: function(res) {
        app.showErrModal(res.data, '网络错误');
        typeof cb == "function" && err_cb();
      },
      complete: function() {
        wx.hideNavigationBarLoading();
      }
    });
  }
});