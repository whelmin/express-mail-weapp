// pages/more/shared/input.js
// 新建发帖论坛
var app = getApp();
Page({
  data:{
    server: app._g.server,
    title: '',
    id: null,
    content: '',
    imgs: [],
    imgLen: 0,
    uploading: false,
    submit_loading: false
  },
  onLoad:function(options){
    // 页面初始化 options为页面跳转所带来的参数
    var that = this;
    if(options.id) {
      that.setData({
        'id': options.id
      });
      app.showLoadToast();
      wx.request({
          url: that.data.server + '/u/shared/article/'+ options.id,
          header: {
            'content-type': 'application/x-www-form-urlencoded',
            'authorization': app.getAuth()
          },
          method: 'GET',
          success: function(res){
              var data = res.data;
              var spliter = data.content.split('\n[imgs-id-list]:');

              that.setData({
                'title': data.title,
                'content': spliter[0],
                'imgs': spliter[1] ? spliter[1].split(',') : [],
                'imgLen': spliter[1] ? spliter[1].split(',').length : 0
              });
              console.log(that.data.imgLen);
            },
          fail: function(res) {
              app.showErrModal(res.errMsg, '获取详情失败，请稍候重试！');
          },
          complete: function() {
              wx.hideToast();
          }
        });
    }
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
  // 删除图片
  removePhoto: function(e) {
    var that = this;
    if(that.data.uploading) {
        app.showErrModal('图片上传中','删除失败');
        return false;
    }
    wx.showModal({
      title: '提示',
      content: '你是否要删除图片？',
      confirmText: '是',
      success: function(res) {
        if(res.confirm) {
          that.data.imgs.splice(e.currentTarget.dataset.index,1);
          that.setData({
            imgLen: that.data.imgLen - 1,
            imgs: that.data.imgs
          });
        }
      }
    });
  },
  previewPhoto: function(e){
    var that = this;
    //预览图片
    if(that.data.uploading){
      app.showErrModal('图片上传中', '预览失败');
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
      app.showErrModal('内容不能为空哦','提示');
      return false;
    }
    wx.showModal({
      title: '提示',
      content: '是否确认发布该贴？',
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
            url: that.data.server + '/u/shared/article',
            data: {
              id: that.data.id || '',
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
              wx.showModal({
                  title: '提示',
                  content: '发布成功',
                  showCancel: false,
                  success: function(res) {
                    wx.redirectTo({
                      url: '/pages/more/shared/list'
                    });
                  }
                });
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