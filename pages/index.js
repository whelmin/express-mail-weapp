// pages/index.js
var app = getApp();
Page({
  data:{
    core: [
      { id: 'mail', path: 'mail/mail', name: '邮报系统' },
      { id: 'express', path: 'express/express', name: '速递服务' },
      { id: 'shared', path: 'shared/list', name: '共享服务' },
      { id: 'hire', path: 'hire/list', name: '招聘信息' },
      { id: 'card', path: 'card/index', name: '一卡通', disable: true },
      { id: 'disable', name: '今日头条', disable: true },
      { id: 'disable', name: '学术讲座', disable: true },
      { id: 'disable', name: '逃逃点名', disable: true },
      { id: 'disable', name: '物业报修', disable: true },
      { id: 'disable', name: '社团联合', disable: true }
    ],
    hotList: [
      { id: 0, title: '【喜讯】热烈祝贺重庆工业职业技术学院荣获“第五届黄炎培优秀学校奖”' },
      { id: 1, title: '【综合新闻】重庆市教育政策研讨会在重庆工业职业技术学院召开' },
      { id: 2, title: '【综合新闻】《重庆市教育评估管理办法》专家论证会在重庆工业职业技术学院召开' }
    ]
  },
  //下拉刷新
  onPullDownRefresh: function(){
    var that = this;
    that.login();
  },
  onLoad: function () {
    var that = this;
    //登录
    that.login();
  },
  login: function () {
    var that = this;
    //登录
    app.showLoadToast('登录中');
    app.getUserInfo(function(){
      wx.hideToast();
      wx.stopPullDownRefresh();
    });
  }
})