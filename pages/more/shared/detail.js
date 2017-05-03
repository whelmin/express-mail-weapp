// pages/more/shared/detail.js
// 共享服务

var app = getApp();

Page({
  data:{
    server: app._g.server,
    // 文章id
    id: null,
    list: [],
    current: {},
    data:{},
    // 提示
    comment_remind: '正在加载评论...',
    // 评论内容
    comment_content: '',
    userInfo:{},
    submit_loading: false
  },
  onShareAppMessage: function () {
    var that = this;
    return {
      title: that.data.data.title,
      desc: that.data.data.text,
      path: '/pages/more/shared/detail?id=that.data.id',
    }
  },
  //绑定input
  bindKeyInput: function(e) {
    var obj = {};
    obj[e.target.dataset.key] = e.detail.value;
    this.setData(obj);
  },
  previewPhoto: function(e) {
    var that = this;
    var urlsArray = [];
    urlsArray.push(e.target.dataset.imgUrl);
    
    wx.previewImage({
      current: e.target.dataset.imgUrl,
      urls: urlsArray
    });
  },
  onLoad:function(options){
    var that = this;
    wx.showNavigationBarLoading();
    that.setData({
        id: options.id,
        userInfo: app._g.userInfo
    });
    //获取共享文章详情
    wx.request({
      method: 'GET',
      url: app._g.server + '/u/shared/article/' + options.id,
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
          data.createTime = app.utils.formatTime(data.createTime || '');
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
      url: app._g.server + '/u/shared/article/l/comment',
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
      url: app._g.server + '/u/shared/article/comment',
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
          wx.showToast({ title: '评论成功！', icon: 'success' });
          wx.redirectTo({
            url: '/pages/more/shared/detail?id=' + that.data.id
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