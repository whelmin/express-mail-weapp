//pages/more/mail/receive/input.js
//管理员录入取件

var app = getApp();
Page({
  data:{
    id: null,
    data: {},
    form: {
      sender: null,
      sendAddress: null,
      sendPhoneNum: null,
      receiver: null,
      receiveAddress: null,
      receivePhoneNum: null,
      memo: null
    },
    submit_loading: false
  },
  onLoad:function(options){
    // 页面初始化 options为页面跳转所带来的参数
  },
  onReady:function(){
    // 页面渲染完成
  },
  onShow:function(){
    // 页面显示
  },
  //绑定input
  bindKeyInput: function(e) {
    var obj = {};
    obj[e.target.dataset.key] = e.detail.value;
    this.setData(obj);
  },
  submit: function() {
    var that = this;
    var form = that.data.form;
    if(!form.receiver){ app.showErrModal('收件人姓名不能为空！', '提交失败'); return; }
    wx.showNavigationBarLoading();
    app.showLoadToast('提交中');
    that.setData({
      'submit_loading': true
    });

    wx.request({
      method: 'POST',
      url: app._g.server + '/a/mail/receive',
      data: {
        id: that.data.id || '',
        sender: that.data.form.sender || '',
        sendAddress: that.data.form.sendAddress || '',
        sendPhoneNum: that.data.form.sendPhoneNum || '',
        receiver: that.data.form.receiver,
        receiveAddress: that.data.form.receiveAddress || '',
        receivePhoneNum: that.data.form.receivePhoneNum || '',
        memo: that.data.form.memo || ''
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
            url: '/pages/more/mail/mail'
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
          form: {
            sender: null,
            sendAddress: null,
            sendPhoneNum: null,
            receiver: null,
            receiveAddress: null,
            receivePhoneNum: null,
            memo: null
          }
        });
      }
    });
  },
  onHide:function(){
    // 页面隐藏
  },
  onUnload:function(){
    // 页面关闭
  }
})