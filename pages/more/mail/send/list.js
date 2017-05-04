//pages/more/mail/send/list.js
//用户寄件列表

var app = getApp();
Page({
  data:{
    list: [],
    current: {},
    list_remind:'加载中',
    active_type: 'NEW,VISITING',
    count: {}
  },
  onLoad: function(){

  },
  onShow: function(){
    //页面显示
    var that = this;
    that.getList(0); 
    app.mpCount(function(data){
      that.setData({
        count: data
      });
    }); 
  },
  //获取寄件列表
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
      url: app._g.server + '/u/mail/send/l',
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
          var content = data.content;
          content.map(function(e,i){
            e.createTime = app.utils.formatTime(e.createTime);
            e.submitTime = app.utils.formatTime(e.submitTime);
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
  //申请上门
  applyDoor: function(e) {
    var that = this;
    wx.showModal({
      title: '提示',
      content: '你是否要申请上门寄件服务',
      showCancel: true,
      success: function(res) {
        if(res.confirm){
          console.log('用户点击确定');
          wx.showNavigationBarLoading();
          //发送上门请求
          wx.request({
            url: app._g.server + '/u/mail/send/visiting/' + e.currentTarget.dataset.id,
            method: 'GET', 
            header: {
              'content-type': 'application/x-www-form-urlencoded',
              'authorization': app.getAuth()
            }, 
            success: function(res){
              //success
              if(res.statusCode >= 200 && res.statusCode < 400){
                var data = res.data;
                if(data.status === "VISITING"){
                    wx.showToast({ title: '申请上门成功！' });
                    //重新获取寄件列表
                    that.getList(0);
                }
              }
            },
            fail: function(res) {
              showErrModal('申请上门失败','网络错误，请重试！');
            },
            complete: function() {
              wx.hideNavigationBarLoading();
            }
          })
        }else{
          console.log('用户点击取消');
        }
      },
      fail: function() {
        console.log('获取模态框失败');
      }
    });
  },
  remove: function(e) {
    var that = this;
    wx.showModal({
      title: '提示',
      content: '你是否要删除该寄件？',
      showCancel: true,
      success: function(res) {
        if(res.confirm){
          console.log('用户点击确定');
          wx.showNavigationBarLoading();
          //发送删除请求
          wx.request({
            url: app._g.server + '/u/mail/send/d',
            method: 'POST', 
            data: {
              ids: e.currentTarget.dataset.id
            },
            header: {
              'content-type': 'application/x-www-form-urlencoded',
              'authorization': app.getAuth()
            }, 
            success: function(res){
              //success
              if(res.statusCode >= 200 && res.statusCode < 400){
                var data = res.data;
                console.log(data);
                if(data.succeeded === 1 && data.failed === 0) {
                  wx.showToast({ title: '删除寄件成功！' });
                  that.getList(0);
                  app._g.count.sendMailCount--;
                  that.setData({
                    'count.sendMailCount': that.data.count.sendMailCount-1
                  });
                }
              }
            },
            fail: function(res) {
              showErrModal('删除寄件失败','网络错误，请重试！');
            },
            complete: function() {
              wx.hideNavigationBarLoading();
            }
          })
        }
      },
      fail: function() {
        console.log('获取模态框失败');
      }
    });
  }

});