// pages/index.js
var app = getApp();
Page({
  data:{
    imgUrls: [
      '/images/index/xy1.jpeg',
      '/images/index/xy2.jpeg',
      '/images/index/xy3.jpeg',
      '/images/index/xy4.jpeg'
    ],
    indicatorDots: true,
    activeColor: '#f5f5f5',
    autoplay: true,
    interval: 5000,
    duration: 1000
  },
  //下拉刷新
  onPullDownRefresh: function(){
    var that = this;
    that.login();
  },
  onLoad: function () {
    var that = this;
    //登录
    console.log(555);
    that.login();
  },
  login: function () {
    var that = this;
    //登录
    app.showLoadToast();
    console.log(555);
    app.getUserInfo(function(){
      wx.hideToast();
    });
  },
  changeIndicatorDots: function(e) {
    this.setData({
      indicatorDots: !this.data.indicatorDots
    })
  },
  changeAutoplay: function(e) {
    this.setData({
      autoplay: !this.data.autoplay
    })
  },
  intervalChange: function(e) {
    this.setData({
      interval: e.detail.value
    })
  },
  durationChange: function(e) {
    this.setData({
      duration: e.detail.value
    })
  },
})