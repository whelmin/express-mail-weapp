//app.js
App({
  onLaunch: function () {

  },
  getUserInfo:function(cb){
    var that = this;
    //调用登录接口
    wx.login({
      success: function(loginRes) {
        wx.getUserInfo({
          success: function(userRes) {
            that._g.userInfo = userRes.userInfo;
            // 登录
            wx.request({
              method: 'POST',
              url: that._g.server + '/login',
              data: {
                code: loginRes.code,
                encryptedData: userRes.encryptedData,
                iv: userRes.iv
              },
              header: {
                'content-type': 'application/x-www-form-urlencoded'
              },
              success: function(res) {
                that._g.token = res.data.token;
                that._g.user = res.data.user;
                typeof cb == "function" && cb();
              }
            });
          }
        });
      }
    });
  },
  //modal-loading
  showLoadToast: function(title, duration){
    wx.showToast({
      title: title || '加载中',
      icon: 'loading',
      mask: true,
      duration: duration || 10000
    });
  },
  //modal-err
  showErrModal: function(data, title){
    if(typeof data !== 'string') {
      var err = [];
      for(var key in data){
        if(data.hasOwnProperty(key)){
          err.push(data[key]);
        }
      }
      var content = err.join('; ');
    } else {
      var content = data;
    }
    wx.showModal({
      title: title || '加载失败',
      content: content || '未知错误',
      showCancel: false
    });
  },
  //remind-err
  showErr: function(data, that, remind) {
    var err = [];
    for(var key in data){
      if(data.hasOwnProperty(key)){
        err.push(data[key]);
      }
    }
    var obj = {};
    obj[remind] = err.join('; ');
    that.setData(obj);
  },
  //获取身份认证
  getAuth: function() {
    return this._g.token.userId + '_' + this._g.token.token + '_MP';
  },
  utils: require('/utils/util.js'),
  _g: {
    //微信信息
    userInfo: {},
    //用户信息
    user: {},
    token: {},
    server: 'http://139.129.33.201:9090'
  }
});
// just a test
