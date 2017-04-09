// pages/more/hire/detail.js
var app = getApp();
Page({
  data:{
    server: app._g.server,
    // 文章id
    id: null,
    list: [],
    current: {},
    data:{},
    comment_remind: '正在加载评论...',
    comment_content: '',
    userInfo:{},
    submit_loading: false
  },
  //绑定input
  bindKeyInput: function(e) {
    var obj = {};
    obj[e.target.dataset.key] = e.detail.value;
    this.setData(obj);
  },
  onLoad:function(options){
    var that = this;
    wx.showNavigationBarLoading();
    that.setData({
        id: options.id,
        userInfo: app._g.userInfo
    });
    //获取招聘详情
    wx.request({
      method: 'GET',
      url: app._g.server + '/u/article/' + options.id,
      header: {
        'content-type': 'application/x-www-form-urlencoded',
        'authorization': app.getAuth()
      },
      success: function(res) {
        if(res.statusCode >= 200 && res.statusCode < 400){
          var data = res.data;
          var spliter = data.content.split('\n[imgs-id-list]:');
          data.text = spliter[0];
          var imgstr = spliter[1];
          data.imgs = imgstr ? imgstr.split(',') : [];
          data.createTime = app.utils.formatTime(data.createTime);
          data.updateTime = app.utils.formatTime(data.updateTime || '');
          that.setData({
            data: data
          });
        }else{
          app.showErr(res.data, that, '加载中');
        }
      },
      fail: function(res) {
        app.showErr(res.data, that, '网络错误');
      
      },
      complete: function() {
        wx.hideNavigationBarLoading();
        wx.stopPullDownRefresh();
      }
    });
    //获取评论
    that.getComment();
  },
  onReady:function(){
    //页面渲染完成
  },
  //上滑加载评论
  onReachBottom: function(){
    var that = this;
    that.getComment();
  },
  //获取评论
  getComment: function(page) {
    var that = this;
    if(page === undefined) {
      page = that.data.current.number + 1 || 0;
    }
    if(!page){ that.setData({ list:[], current: {} }); }
    if(page >= that.data.current.totalPages){ return; }
    that.setData({ comment_remind: '正在加载评论...' });

    wx.showNavigationBarLoading();
    wx.request({
      url: app._g.server + '/u/article/l/comment',
      method: 'POST',
      data: {
        articleId: that.data.id,
        page: page
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded',
        'authorization': app.getAuth()
      }, 
      success: function(res){
        if(res.statusCode>= 200 && res.statusCode < 400) {
          var data = res.data;
          var content = data.content;
          content.map(function(e,i){
            e.createTime = app.utils.formatDate(e.createTime);
            return e;
          });
          that.setData({
            list: that.data.list.concat(content),
            current: data,
          });
          if(data.last){
            that.setData({ comment_remind: '已加载全部评论' });
          }else{
            that.setData({ comment_remind: '上滑加载更多评论' });
          }
        }else{
          app.showErr(res.data, that, 'comment_remind');
        }
      },
      fail: function(res) {
        that.setData({ comment_remind: '网络错误' });
      },
      complete: function(res) {
         wx.hideNavigationBarLoading();
      }
    })
  },
  //发表评论
  submit: function() {
    var that = this;
    var content = that.data.comment_content;
    if(!content){ app.showErrModal('评论不能为空！', '发布失败'); return; }

    wx.showNavigationBarLoading();
    app.showLoadToast('发布中');
    that.setData({
      'submit_loading': true
    });
    wx.request({
      method: 'POST',
      url: app._g.server + '/u/article/comment',
      data: {
        articleId: that.data.id,
        content:that.data.comment_content
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded',
        'authorization': app.getAuth()
      },
      success: function(res) {
        if(res.statusCode >= 200 && res.statusCode < 400){
          var data = res.data;
          console.log(data);
          wx.showToast({ title: '评论成功', icon: 'success' });
          wx.redirectTo({
            url: '/pages/more/hire/detail?id=' + that.data.id
          });
        }else{
          app.showErrModal(res.data, '评论失败');
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
  },
  onShow:function(){
    //页面显示
  },
  onHide:function(){
    //页面隐藏
  },
  onUnload:function(){
    //页面关闭
  }
})