// pages/index/receive/list.js
// 取件列表
var app = getApp();
Page({
  data:{
    list: [],
    current: {},
    list_remind: '加载中',
    active_type: 'RECEIVING',
    count: {}
  },
  onLoad: function(){
  },
  onShow: function(){
    var that = this;
    that.getList(0);
    if(!(app._g.count.receiveMailCount === undefined)) {
      that.setData({
        count: app._g.count
      });
    }
  },
  //获取取件列表
  getList: function(page) {
    var that = this;
    if(page === undefined){
      page = that.data.current.number + 1 || 0;
    }
    if(!page){ that.setData({ list:[], current: {} }); }
    else{ page = that.data.current.number + 1 || 0; }
    if(page >= that.data.current.totalPages){ return; }

    that.setData({ list_remind: '加载中' });
    wx.showNavigationBarLoading();
    var urlLink = (that.data.active_type === 'FOUND')? '/u/mail/receive/l/claim' : '/u/mail/receive/l';

    wx.request({
      method: 'POST',
      url: app._g.server + urlLink,
      data: {
        page: page,
        statusList: that.data.active_type
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
            e.receiveTime = app.utils.formatTime(e.receiveTime);
            if(e.receiveMail){
              e.receiveMail.submitTime = app.utils.formatTime(e.receiveMail.submitTime);
            }
            return e;
          });
          console.log(app._g.server + urlLink);
          that.setData({
            list: that.data.list.concat(content),
            current: data
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
  //切换tab
  switchType: function(e){
    var that = this;
    var active_type = e.currentTarget.dataset.type;
    // 点击时不是上一个状态时刷新,否则不刷新。
    if(active_type !== that.data.active_type) {
      that.setData({
        list: [],
        current: {},
        list_remind: '加载中',
        active_type: active_type
      });
      that.getList();
    }
  }
});