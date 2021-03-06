// pages/more/shared/my.js
// 用户已发帖子

var app = getApp();
Page({
  data:{
    list:[],
    //current存放页码相关信息
    current: {},
    list_remind: '加载中'
  },
  onLoad:function(options){
    var that = this;
    that.getList();
  },
  onShow:function(){
    // 页面显示
    var that = this;
    if(that.data.list_remind !== '加载中'){
      that.getList(0);
    }
  },
  //用户获取帖子列表
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
      url: app._g.server + '/u/shared/article/l/me',
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
            e.title = e.title.substr(0,10);
            e.content = e.content.split('\n[imgs-id-list]:')[0].substr(0,42);
            e.createTime = app.utils.formatDate(e.createTime);
            e.updateTime = app.utils.formatTime(e.updateTime);
            return e;
          });
          that.setData({
            list: that.data.list.concat(content),
          });
          if(data.last){
            that.setData({ list_remind: '已全部加载完' });
          }else{
            that.setData({ list_remind: '上滑加载更多' });
          }
          if(data.totalElements === 0){
            that.setData({ list_remind: '暂无帖，快去发帖吧...' });
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
  //用户删贴
  article_delete: function(e) {
    var that = this;
    wx.showModal({
      title: '提示',
      content: '你真的要删除该帖子？',
      success: function(res) {
        if(res.confirm) {
          wx.showNavigationBarLoading();
          wx.request({
              url: app._g.server + '/u/shared/article/d',
              method: 'POST', 
              data: {
                ids: e.target.dataset.key
              },
              header: {
                'content-type': 'application/x-www-form-urlencoded',
                'authorization': app.getAuth()
              }, 
              success: function(res){
                if(res.statusCode >= 200 && res.statusCode < 400){
                  var data = res.data;
                  if(data.succeeded) {
                    wx.showToast({ title: '删除帖子成功！' });
                    that.getList(0);
                  }
                }
              },
              fail: function(res) {
                // to do
                app.showErrModal('删除失败','网络错误，请重试！');
              },
              complete: function(res) {
                // complete
                wx.hideNavigationBarLoading();
              }
            })
        }
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