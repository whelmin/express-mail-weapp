// pages/more/hire/input.js
// 获取应用实例
var app = getApp();
Page({
  data:{
    server: app._g.server,
    title: '',
    content: '',
    imgs: [],
    imgLen: 0,
    uploading: false,
    submit_loading: false
  },
  onLoad:function(options){
    // 页面初始化 options为页面跳转所带来的参数
  },
  onReady:function(){
    // 页面渲染完成
  },
  listenerTitle: function(e){
    this.setData({
      'title': e.detail.value
    });
  },
  listenerTextarea: function(e){
    this.setData({
      'content': e.detail.value
    });
  },
  choosePhoto: function() {
    var that = this;
    wx.showModal({
      title: '提示',
      content: '上传图片需要消耗流量，是否继续？',
      confirmText: '继续',
      success: function(res) {
        if (res.confirm) {
          wx.chooseImage({
            count: 4,
            sourceType: ['album', 'camera'],
            success: function (res) {
              var tempFilePaths = res.tempFilePaths, 
                  imgLen = tempFilePaths.length;
              that.setData({
                uploading: true,
                imgLen: that.data.imgLen + imgLen
              });
              console.log(res);
              tempFilePaths.forEach(function(e){
                that.uploadImg(e);
              });
            }
          });
        }
      }
    });
  },
  uploadImg: function(path){
    var that = this;
    console.log(path);
    wx.showNavigationBarLoading();
    // 上传图片
    wx.uploadFile({
      url: app._g.server + '/upload',
      header: {
        'authorization': app.getAuth(),
        'content-type': 'application/x-www-form-urlencoded'
      },
      filePath: path,
      name: 'file',
      success: function(res){
        console.log(res);
        var data = JSON.parse(res.data);
        if(data.id){
          that.setData({
            imgs: that.data.imgs.concat(data.id)
          });
        }
        if(that.data.imgs.length === that.data.imgLen){
          that.setData({
            uploading: false
          });
        }
      },
      fail: function(res){
        console.log(res);
        that.setData({
          imgLen: that.data.imgLen - 1,
          uploading: false
        });
        app.showErrModal(res.errMsg,'上传失败');

      },
      complete: function() {
        wx.hideNavigationBarLoading();
      }
    });
  },
  previewPhoto: function(e){
    var that = this;
    //预览图片
    if(that.data.uploading){
      app.showErrorModal('正在上传图片', '预览失败');
      return false;
    }
    wx.previewImage({
      current: that.data.server + '/img/' + that.data.imgs[e.target.dataset.index],
      urls: that.data.imgs.map(function(e, i) {
          return that.data.server + '/img/' + e
        })
    });
  },
  onShow:function(){
    // 页面显示
  },
  submit: function() {
    var that = this;
    var title = '', content = '', imgs = '';
    if(that.data.uploading ||!that.data.title || !that.data.content) {
      app.showErrModal('招聘内容不能为空哦','提示');
      return false;
    }
    wx.showModal({
      title: '提示',
      content: '是否确认发布该文章？',
      success: function(res) {
        if (res.confirm) {
          title = that.data.title;
          content = that.data.content;
          if(that.data.imgLen){
            imgs = '\n[imgs-id-list]:' + that.data.imgs.join(',');
            content += imgs;
          }
          app.showLoadToast();
          wx.request({
            url: that.data.server + '/u/article',
            data: {
              title: title,
              content: content
            },
            header: {
              'content-type': 'application/x-www-form-urlencoded',
              'authorization': app.getAuth()
            },
            method: 'POST',
            success: function(res){
              var data = res.data;
              console.log(res);
              console.log(data);
              if(data.status === 'CHECKING'){
                wx.showModal({
                  title: '提示',
                  content: '发布成功,文章审核中',
                  showCancel: false,
                  success: function(res) {
                    wx.navigateTo({
                      url: '/pages/more/hire/list'
                    });
                  }
                });
              }else{
                app.showErrModal(data.message, '发布失败');
              }
            },
            fail: function(res) {
              app.showErrModal(res.errMsg, '发布失败');
            },
            complete: function() {
              wx.hideToast();
            }
          });
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