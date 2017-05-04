// pages/user/bind.js
var app = getApp();
Page({
  data:{
    'cell_active': false,
    'phone': null,
    'code': null,
    'send_time': 0,
    'submit_loading': false,
    'phoneNums': [],
  },
  onLoad:function(options){
    var that = this;
    that.setData({
      'phoneNums': app._g.user.phoneNums
    });
  },
  cellToggle:function(){
    var that = this;
    that.setData({
      'cell_active': !that.data.cell_active
    });
  },
  //绑定input
  bindKeyInput: function(e) {
    var obj = {};
    obj[e.target.dataset.key] = e.detail.value;
    this.setData(obj)
  },
  //发送验证码
  sendCode: function() {
    var that = this;
    if(that.data.send_time){ return; }
    if(!that.data.phone){
      app.showErrModal('请填写手机号！', '发送验证码失败'); return;
    }
    that.setData({
      'send_time': 60
    });
    var timego = setInterval(function(){
      var send_time = that.data.send_time;
      if(!send_time){
        clearInterval(timego);
      }else{
        that.setData({
          'send_time': send_time - 1
        });
      }
    }, 1000);
    wx.showNavigationBarLoading();
    wx.request({
      method: 'POST',
      url: app._g.server + '/verifycode',
      data: {
        operation: 'BIND_PHONE_NUM',
        phoneNum: that.data.phone
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded',
        'authorization': app.getAuth()
      },
      success: function(res) {
        if(res.statusCode >= 200 && res.statusCode < 400){
          var data = res.data;
          console.info(data.msg);
        }else{
          app.showErrModal(res.data, '发送验证码失败');
        }
      },
      fail: function(res) {
        app.showErrModal('网络错误', '发送验证码失败');
      },
      complete: function() {
        wx.hideNavigationBarLoading();
      }
    });
  },
  submit: function() {
    var that = this;
    if(that.data.submit_loading){ return; }
    if(!that.data.phone){
      app.showErrModal('请填写手机号！', '提交失败'); return;
    }
    if(!that.data.code){
      app.showErrModal('请填写验证码！', '提交失败'); return;
    }
    wx.showNavigationBarLoading();
    app.showLoadToast('提交中');
    that.setData({
      'submit_loading': true
    });
    wx.request({
      method: 'POST',
      url: app._g.server + '/bind',
      data: {
        phoneNum: that.data.phone,
        verifyCode: that.data.code
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded',
        'authorization': app.getAuth()
      },
      success: function(res) {
        if(res.statusCode >= 200 && res.statusCode < 400){
          var data = res.data;
          app._g.user.phoneNums = data.phoneNums || [];
          that.setData({
            'phoneNums': data.phoneNums || [],
            'phone': null,
            'code': null
          });
          wx.showToast({ title: '提交成功' });
        }else{
          app.showErrModal(res.data, '提交失败');
          wx.hideToast();
        }
      },
      fail: function(res) {
        app.showErrModal('网络错误', '发送验证码失败');
        wx.hideToast();
      },
      complete: function() {
        wx.hideNavigationBarLoading();
        that.setData({
          'submit_loading': false
        });
      }
    });
  },
  unbind: function(e) {
    var that = this;
    wx.showModal({
      title: '提示',
      content: '您确定要删除该手机号码？',
      success: function(res) {
        if(res.confirm) {
            wx.showNavigationBarLoading();
            wx.request({
              url: app._g.server + '/unbind/' + e.target.dataset.phoneNumber,
              method: 'GET', 
              // 设置请求的 header
              header: {
                'content-type': 'application/x-www-form-urlencoded',
                'authorization': app.getAuth()
              }, 
              success: function(res){
                // success
                if(res.statusCode >= 200 && res.statusCode < 400){
                  var data = res.data;
                  console.log(data);
                  wx.showToast({ title: '删除成功！' });
                  // 刷新手机号码列表
                  app._g.user.phoneNums = data.phoneNums || [];
                  that.setData({
                    'phoneNums': data.phoneNums || []
                  });
                }
              },
              fail: function(res) {
                // to do
                showErrModal('删除手机号码失败','网络错误，请重试！');
              },
              complete: function(res) {
                // complete
                wx.hideNavigationBarLoading();
              }
            })
        }else{
          console.log('用户点击取消');
        }
      }
    });
  }
});