// pages/user/user.js
var app = getApp();
Page({
  data:{
    isMailAdmin: false,
    isExpressAdmin: false,
    userInfo: {}
  },
  onLoad:function(options){
    var that = this;
    that.setData({
      userInfo: app._g.userInfo,
      isMailAdmin: app._g.role.isMailAdmin,
      isExpressAdmin: app._g.role.isExpressAdmin
    });
  },
  qrcode: app.qrcode,
  onReady:function(){
    // 页面渲染完成
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