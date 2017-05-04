// pages/more/mail/send/input.js
var app = getApp();
Page({
  data:{
    phoneNums: [],
    phoneIndex: null,
    data: {},
    form: {},
    submit_loading: false
  },
  bindPickerChange: function(e) {
    var that = this;
    that.setData({
      phoneIndex: e.detail.value,
      'form.sendPhoneNum': that.data.phoneNums[e.detail.value]
    });
  },
  //绑定input
  bindKeyInput: function(e) {
    var obj = {};
    obj[e.target.dataset.key] = e.detail.value;
    this.setData(obj);
  },
  onLoad:function(){

  },
  onShow:function(){
    // 页面显示
    var that = this;
    that.setData({
      phoneNums: app._g.user.phoneNums || []
    });
  },
  // 提交
  submit: function(){
    var that = this;
    var form = that.data.form;
    if(!form.sender){ app.showErrModal('寄件人姓名不能为空！', '提交失败'); return; }
    if(!form.sendPhoneNum){ app.showErrModal('请选择寄件电话！', '提交失败'); return; }
    if(!form.sendAddress){ app.showErrModal('寄件地址不能为空！', '提交失败'); return; }
    if(!form.receiver){ app.showErrModal('收件人姓名不能为空！', '提交失败'); return; }
    if(!form.receivePhoneNum){ app.showErrModal('收件电话不能为空！', '提交失败'); return; }
    if(!form.receiveAddress){ app.showErrModal('收件地址不能为空！', '提交失败'); return; }

    wx.showNavigationBarLoading();
    app.showLoadToast('提交中');
    that.setData({
      'submit_loading': true
    });
    wx.request({
      method: 'POST',
      url: app._g.server + '/u/mail/send',
      data: {
        sender: that.data.form.sender,
        sendAddress: that.data.form.sendAddress,
        sendPhoneNum: that.data.form.sendPhoneNum,
        receiver: that.data.form.receiver,
        receiveAddress: that.data.form.receiveAddress,
        receivePhoneNum: that.data.form.receivePhoneNum,
        memo: that.data.form.memo
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded',
        'authorization': app.getAuth()
      },
      success: function(res) {
        if(res.statusCode >= 200 && res.statusCode < 400){
          var data = res.data;
          wx.showToast({ title: '提交成功', icon: 'success' });
          wx.redirectTo({
            url: '/pages/more/mail/send/list'
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
          'submit_loading': false
        });
      }
    });
  }
})