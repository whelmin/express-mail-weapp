// pages/more/mail/send/visit.js
// 管理员查询上门寄件列表

var app = getApp();
Page({
  data:{
    list: [],
    //current存放当前页码等信息
    current: {},
    list_remind:'加载中',
    active_type: 'VISITING'
  },
  onLoad:function(options){
    // 页面初始化 options为页面跳转所带来的参数
  },
  onReady:function(){
    // 页面渲染完成
  },
  onShow:function(){
    // 页面显示
    var that = this;
    that.getList(0); 
  },
   //获取上门寄件列表
  getList: function(page) {
    //page为请求的页码，默认为0
    var that = this;
    if(page === undefined){
        page = that.data.current.number + 1 || 0;
    }
    if(!page){ that.setData({ list: [], current: {} });}
    else{ page = that.data.current.number + 1 || 0; }

    if(page >= that.data.current.totalPages) { return; }
    that.setData({ list_remind: '加载中' });

    wx.showNavigationBarLoading();
    wx.request({
      url: app._g.server + '/a/mail/send/l',
      data: {
        statusList: that.data.active_type,
        page: page
      },
      method: 'POST', 
      header: {
        'content-type': 'application/x-www-form-urlencoded',
        'authorization': app.getAuth()
      }, 
      success: function(res){
        if(res.statusCode >= 200 && res.statusCode < 400){
          var data = res.data;
          console.log(data);
          var content = data.content;
          content.map(function(e,i){
            e.createTime = app.utils.formatTime(e.createTime);
            e.requestVisitingTime = app.utils.formatTime(e.requestVisitingTime);
            return e;
          });
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
    })
  },
  onHide:function(){
    // 页面隐藏
  },
  onUnload:function(){
    // 页面关闭
  }
})