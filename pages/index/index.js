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
    search_active: false,
    //列表是否有更新
    list_update: false,
    //计数
    count: {}
  },
  //下拉刷新
  onPullDownRefresh: function(){
    var that = this;
    that.login();
  },
  //上滑加载
  onReachBottom: function(){
    var that = this;
    if(that.data.isAdmin) {
        that.getList_a();
    }else{
        that.getList_u();
    }
  },
  onLoad: function () {
  },
  onShow: function (){
    var that = this;
    //登录
    that.login();
  },
  login: function () {
    var that = this;
    //登录
    app.showLoadToast();
    app.getUserInfo(function(){
      wx.hideToast();
      that.setData({
        isAdmin: app._g.role.isAdmin
      });
      if(that.data.isAdmin) {
        that.getList_a();
      }else{
        that.getList_u();
      }
      app.mpCount(function(data){
        that.setData({
          count: data
        });
      });
    });
  },
  //绑定input
  bindKeyInput: function(e) {
    var that = this;
    var obj = {};
    obj[e.target.dataset.key] = e.detail.value;
    that.setData(obj);
    // 搜索关键字清空后，需要重新获取列表
    if(e.detail.value === '' && that.data.list_update === true) {
      that.getList(0);
    }
  },
  //用户获取待认领列表
  getList_u: function(page) {
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
      url: app._g.server + '/u/mail/receive/l/lost',
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
            current: data,
            list_update: false
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
  //搜索
  search: function(e) {
    var that = this;
    if(that.data.search_text === ''){ 
      app.showErrModal('搜索关键字不能为空', '搜索失败'); return; 
    }
    wx.showNavigationBarLoading();
    wx.request({
      url: app._g.server + '/u/mail/receive/s/lost',
      data: {
        keywords: that.data.search_text
      },
      method: 'POST', 
      header: {
        'content-type': 'application/x-www-form-urlencoded',
        'authorization': app.getAuth()
      }, 
      success: function(res){
        //success
        if(res.statusCode >= 200 && res.statusCode < 400){
          var data = res.data;
          var content = data.content;
          if(content.length !==0) {
            content.map(function(e,i){
              e.sendTime = app.utils.formatDate(e.sendTime);
              e.submitTime = app.utils.formatTime(e.submitTime);
              return e;
            });
            that.setData({
              list: content,
              list_update: true
            });
          }else{
            that.setData({ 
              list_remind: '没有找到相关数据哦',
              list: [],
              list_update: true
            });
          }
        }
      },
      fail: function(res) {
        that.setData({ list_remind: '网络错误' });
      },
      complete: function(res) {
        wx.hideNavigationBarLoading();
      }
    })

  },
  //输入框聚焦，失焦变化
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
  qrcode: app.qrcode,
   //管理员获取取件列表
  getList_a: function(page) {
    var that = this;
    if(page === undefined){
      page = that.data.current.number + 1 || 0;
    }
    if(!page){ that.setData({ list:[], current: {} }); }
    if(page >= that.data.current.totalPages){ return; }
    that.setData({ list_remind: '加载中' });
    wx.showNavigationBarLoading();
    
    wx.request({
      method: 'POST',
      url: app._g.server + '/a/mail/receive/l',
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
            e.createTime = app.utils.formatDate(e.createTime);
            e.submitTime = app.utils.formatTime(e.submitTime);
            return e;
          });
          that.setData({
            list: that.data.list.concat(content),
            current: data,
            list_update: false
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
  //提交发布 NEW状态变为RECEIVING或者LOST
  submit: function(e) {
    var that = this;
    wx.showNavigationBarLoading();
    wx.request({
      url: app._g.server + '/a/mail/receive/submit',
      data: {
        ids: e.target.dataset.id
      },
      method: 'POST', 
      header: {
        'content-type': 'application/x-www-form-urlencoded',
        'authorization': app.getAuth()
      }, 
      success: function(res){
        if(res.statusCode >= 200 && res.statusCode < 400){
          var data = res.data;
          if(data.succeeded) {
            wx.showToast({title: '提交发布成功'});
            that.getList_a(0);
          }else{
            app.showErrModal(res.data,'提交失败');
          }
        }
      },
      fail: function(res) {
        app.showErrModal(res.data, '网络错误');
      },
      complete: function(res) {
        wx.hideNavigationBarLoading();
      }
    })
  }
});
