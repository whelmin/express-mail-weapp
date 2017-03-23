// pages/index/send/input.js
var app = getApp();
Page({
  data:{
    phoneNums: [],
    phoneIndex: null,
    data: {},
    form: {
      sendName: null,
      sendPhone: null,
      sendAddress: null,
      receiveName: null,
      receivePhone: null,
      receiveAddress: null
    },
    submit_loading: false
  },
  bindPickerChange: function(e) {
    var that = this;
    that.setData({
      phoneIndex: e.detail.value,
      'form.sendPhone': that.data.phoneNums[e.detail.value]
    });
  },
  //绑定input
  bindKeyInput: function(e) {
    var obj = {};
    obj[e.target.dataset.key] = e.detail.value;
    this.setData(obj);
  },
  onLoad:function(options){
    // 页面初始化 options为页面跳转所带来的参数
    var that = this;
    that.setData({
      phoneNums: app._g.user.phoneNums || []
    });
  },
  onShow:function(){
    // 页面显示
    var that = this;
    that.setData({
      phoneNums: app._g.user.phoneNums || []
    });
    console.log(app._g.user.phoneNums);
  },
  // 提交
  submit: function(){
    var that = this;
    var form = that.data.form;
    if(!form.sendName){ app.showErrModal('寄件人姓名不能为空！', '提交失败'); return; }
    if(!form.sendPhone){ app.showErrModal('请选择寄件电话！', '提交失败'); return; }
    if(!form.sendAddress){ app.showErrModal('寄件地址不能为空！', '提交失败'); return; }
    if(!form.receiveName){ app.showErrModal('收件人姓名不能为空！', '提交失败'); return; }
    if(!form.receivePhone){ app.showErrModal('收件电话不能为空！', '提交失败'); return; }
    if(!form.receiveAddress){ app.showErrModal('收件地址不能为空！', '提交失败'); return; }

    wx.showNavigationBarLoading();
    app.showLoadToast('提交中');
    that.setData({
      'submit_loading': true
    });
    wx.request({
      method: 'POST',
      url: app._g.server + '/mail/u/send',
      data: {
        sender: that.data.form.sendName,
        sendAddress: that.data.form.sendAddress,
        sendPhoneNum: that.data.form.sendPhone,
        receiver: that.data.form.receiveName,
        receiveAddress: that.data.form.receivePhone,
        receivePhoneNum: that.data.form.receiveAddress
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded',
        'authorization': app.getAuth()
      },
      success: function(res) {
        if(res.statusCode >= 200 && res.statusCode < 400){
          var data = res.data;
          wx.showToast({ title: '提交成功' });
          wx.redirectTo({
            url: '/pages/index/send/list'
          });
        }else{
          app.showErrModal(res.data, '提交失败');
          wx.hideToast();
        }
      },
      fail: function(res) {
        app.showErrModal(res.data, '网络错误');
        wx.hideToast();
      },
      complete: function() {
        wx.hideNavigationBarLoading();
        that.setData({
          'submit_loading': false,
          phoneIndex: null,
          form: {
            sendName: null,
            sendPhone: null,
            sendAddress: null,
            receiveName: null,
            receivePhone: null,
            receiveAddress: null
          }
        });
      }
    });
  }
})