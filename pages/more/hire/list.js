// pages/more/hire/list.js
// 招聘信息列表
var app = getApp();

Page({
  data:{
    list:[],
    //current存放页码相关信息
    current: {},
    list_remind: '加载中',
    search_active: false,
    search_text: '',
    //列表是否有更新
    list_update: false
  },
  onLoad: function(){
    var that = this;
    that.getList();
  },
  onReady: function(){
    // 页面渲染完成
  },
  onShow: function(){
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
      url: app._g.server + '/u/article/l',
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
          if(data.totalElements === 0) {
            that.setData({ list_remind: '暂无招聘文章' });
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
      app.showErrModal('关键字不能为空', '搜索失败'); return; 
    }
    wx.showNavigationBarLoading();
    wx.request({
      url: app._g.server + '/u/article/s',
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
              e.title = e.title.substr(0,18);
              e.content = e.content.split('\n[imgs-id-list]:')[0].substr(0,25);
              e.createTime = app.utils.formatDate(e.createTime || '');
              e.updateTime = app.utils.formatTime(e.updateTime || '');
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
  //搜索框聚焦，失焦变化
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
  onHide:function(){
    // 页面隐藏
  },
  onUnload:function(){
    // 页面关闭
  }
})