// pages/more/shared/list.js
// 共享服务论坛文章模块
var app = getApp();

Page({
  data:{
    list:[],
    //current 用于存放页码相关信息
    current: {},
    list_remind: '加载中',
    active_type: 'forum',
  },
  onLoad:function(){
    var that = this;
    that.getList();
  },
  onReady:function(){
    // 页面渲染完成
  },
  onShow:function(){
    // 页面显示
    var that = this;
    if(that.data.list_remind !== '加载中'){
      that.getList(0);
    }
  },
  //用户获取招聘列表
  getList: function(page) {
    var that = this;
    if(page === undefined){
      page = that.data.current.number + 1 || 0;
    }
    if(!page){ 
      that.setData({ 
        list:[] 
      }); 
    }
    if(page >= that.data.current.totalPages){ return; }
    that.setData({ list_remind: '加载中' });
    wx.showNavigationBarLoading();
    
    wx.request({
      method: 'POST',
      url: app._g.server + '/u/shared/article/l',
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
            e.title = e.title.substr(0,18);
            e.content = e.content.split('\n[imgs-id-list]:')[0].substr(0,25);
            e.createTime = app.utils.formatDate(e.createTime);
            e.updateTime = app.utils.formatTime(e.updateTime);
            return e;
          });
          that.setData({
            list: that.data.list.concat(content),
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
  //切换tab
  switchType: function(e) {
    var that = this;
    var active_type = e.currentTarget.dataset.type;
    if(active_type !== that.data.active_type) {
      that.setData({
        list: [],
        current: {},
        list_remind: '加载中',
        active_type: active_type
      });
      that.getList();
    }
  },
  onHide:function(){
    // 页面隐藏
  },
  onUnload:function(){
    // 页面关闭
  }
})