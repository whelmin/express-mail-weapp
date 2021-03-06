// pages/more/mail/qrcode/qrcode.js
// 获取二维码
var app = getApp();
var querygo = null;
Page({
  data:{
    id: null,
    claimId: null,
    qrcode_url: null,
    // 邮件send或receive状态
    mailType: null,
    mailStatus: null,
    data: {}
  },
  onLoad:function(options){
    var that = this;
    that.setData({
      id: options.id,
      claimId: options.claimId || null
    });
    var mailType = options.type;
    that.setData({
      qrcode_url: app._g.server + '/u/mail/' + mailType + '/qrcode/' + app.getAuth() + '/' + options.id,
      mailType: mailType,
      mailStatus: options.status
    });
    wx.showNavigationBarLoading();
    that.getInfo();
    querygo = setInterval(function(){
      that.getInfo(function(used){
        if(used){ clearInterval(querygo); }
      }, function(){
        clearInterval(querygo);
      });
    }, 3000);
    
  },
  onUnload:function(){
    // 页面关闭
    clearInterval(querygo);
  },
  getInfo: function(cb, err_cb){
    var that = this;
    var mailType = that.data.mailType;
    that.sendRequest('/u/mail/' + mailType + '/' + that.data.id, cb, err_cb);
    if (that.data.claimId) {
      that.sendRequest('/u/mail/receive/claim/' + that.data.claimId, cb, err_cb);
    }
  },
  sendRequest: function(url, cb, err_cb) {
    var that = this;
    wx.request({
        method: 'GET',
        url: app._g.server + url,
        header: {
          'content-type': 'application/x-www-form-urlencoded',
          'authorization': app.getAuth()
        },
        success: function(res) {
          if(res.statusCode >= 200 && res.statusCode < 400){
            var data = res.data;
            // 取件
            if (data.receiveMail) {
              data.receiveMail.sendTime = app.utils.formatDate(data.receiveMail.sendTime);
              data.receiveMail.submitTime = app.utils.formatTime(data.receiveMail.submitTime);
              data.receiveMail.receiveTime = app.utils.formatTime(data.receiveMail.receiveTime);
            }
            if (data.createTime) {
              data.createTime = app.utils.formatDate(data.createTime);
              data.submitTime = app.utils.formatTime(data.submitTime);
              data.updateTime = app.utils.formatTime(data.updateTime);
            }
            that.setData({
              data: Object.assign({}, that.data.data, data)
            });
            var status = data.status || data.receiveMail.status;
            typeof cb === "function" && cb(status === 'RECEIVED' || status === 'SENDING');
          }else{
            app.showErrModal(res.data, '获取信息失败');
            typeof err_cb === "function" && err_cb();
          }
        },
        fail: function(res) {
          app.showErrModal(res.data, '网络错误');
          typeof err_cb == "function" && err_cb();
        },
        complete: function() {
          wx.hideNavigationBarLoading();
        }
      });
  }
});