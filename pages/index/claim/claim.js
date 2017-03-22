// pages/index/claim/claim.js
var app = getApp();
Page({
  data:{
    id: null,
    phoneNums: [],
    phoneIndex: null,
    data: {},
    form: {
      name: null,
      phone: null,
      address: null
    },
    submit_loading: false
  },
  bindPickerChange: function(e) {
    var that = this;
    that.setData({
      phoneIndex: e.detail.value,
      'form.phone': that.data.phoneNums[e.detail.value]
    });
  },
  onLoad:function(options){
    var that = this;
    that.setData({
      id: options.id
    });
    wx.showNavigationBarLoading();
    wx.request({
      method: 'GET',
      url: app._g.server + '/mail/receive/' + options.id,
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
        }else{
          app.showErrModal(res.data, '获取邮件信息失败');
        }
      },
      fail: function(res) {
        app.showErrModal(res.data, '网络错误');
      },
      complete: function() {
        wx.hideNavigationBarLoading();
      }
    });
  },
  onShow:function(){
    // 页面显示
    var that = this;
    that.setData({
      phoneNums: app._g.user.phoneNums || []
    });
  },
  //绑定input
  bindKeyInput: function(e) {
    var obj = {};
    obj[e.target.dataset.key] = e.detail.value;
    this.setData(obj);
  },
  submit: function(){
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
        id: that.data.id,
        claimer: that.data.form.name,
        phoneNum: that.data.form.phone,
        address: that.data.form.address
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded',
        'authorization': app.getAuth()
      },
      success: function(res) {
        if(res.statusCode >= 200 && res.statusCode < 400){
          var data = res.data;
          that.setData({
            phoneIndex: null,
            form: {
              name: null,
              phone: null,
              address: null
            }
          });
          wx.showToast({ title: '提交成功' });
          wx.redirectTo({
            url: '/pages/index/receive/list'
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
});