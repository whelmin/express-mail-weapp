//pages/index/receive/input.js
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
      receivePhoneNum: null
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
  submit: function() {
    var that = this;
    var form = that.data.form;
    if(!form.name){ app.showErrModal('认领人姓名不能为空！', '提交失败'); return; }
    if(!form.phone){ app.showErrModal('请选择联系电话！', '提交失败'); return; }
    if(!form.address){ app.showErrModal('联系地址不能为空！', '提交失败'); return; }
    wx.showNavigationBarLoading();
    app.showLoadToast('提交中');
    that.setData({
      'submit_loading': true
    });
    wx.request({
      method: 'POST',
      url: app._g.server + '/mail/u/receive/claim',
      data: {
        'receiveMail.id': that.data.id,
        claimer: that.data.form.name,
        phoneNum: that.data.form.phone,
        address: that.data.form.address
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded',
        'authorization': app.getAuth()
      },
  },
  onHide:function(){
    // 页面隐藏
  },
  onUnload:function(){
    // 页面关闭
  }
})