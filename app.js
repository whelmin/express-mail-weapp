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
                var userRoles = res.data.user.userRoles || ['NORMAL_USER'];
                that._g.role.userRoles = userRoles;
                if(userRoles.indexOf('SUPER_ADMIN') !== -1 || userRoles.indexOf('MAIL_ADMIN') !== -1){
                  that._g.role.isMailAdmin = true;
                }
                if(userRoles.indexOf('SUPER_ADMIN') !== -1 || userRoles.indexOf('EXPRESS_ADMIN') !== -1){
                  that._g.role.isExpressAdmin = true;
                }
                if(res.data.register){
                  wx.showModal({
                    title: '补全信息',
                    content: '请先绑定手机号才能正常查阅信息！',
                    success: function(res) {
                      if (res.confirm) {
                        wx.navigateTo({
                          url: '/pages/user/bind'
                        });
                      }
                    }
                  });
                }
                typeof cb == "function" && cb();
              }
            });
          },
        });
      }
    });
  },
  //徽章计数
  mpCount: function(cb) {
    var that = this;
    wx.request({
      url: that._g.server + '/mp/count',
      method: 'GET', 
      header: {
        'content-type': 'application/x-www-form-urlencoded',
        'authorization': that.getAuth()
      }, 
      success: function(res){
         if(res.statusCode >= 200 && res.statusCode < 400){
           var data = res.data;
           data.receiveMailTotal = data.receiveMailCount + data.foundMailCount;
           data.receiveExpressTotal = data.receiveExpressCount + data.foundExpressCount;
           that._g.count = data || {};
           typeof cb == "function" && cb(data);
         }
      },
      fail: function(res) {
        // fail
      },
      complete: function(res) {
        // complete
      }
    })
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
    return this._g.token.userId + '_' + this._g.token.token + '_' + this._g.token.platform;
  },
  //管理员操作
  qrcode: function(){
    var that = this;
    wx.showNavigationBarLoading();
    wx.scanCode({
      success: function(res) {
        var result = JSON.parse(res.result);
        if(result.qrCodeInfoType === 'ADMIN_LOGIN'){
          // 扫码登录
          var url = '/login/a/confirm';
          var name = '登录';
        }else if(result.qrCodeInfoType === 'RECEIVE_MAIL'){
          // 扫码取邮件
          var url = '/a/mail/receive/qrcode/pickup';
          var name = '扫码取件';
        }else if(result.qrCodeInfoType === 'SEND_MAIL'){
          // 扫码寄邮件
          var url = '/a/mail/send/qrcode/submit';
          var name = '扫码寄件';
        }else if(result.qrCodeInfoType === 'RECEIVE_EXPRESS'){
          // 扫码取快递
          var url = '/a/express/receive/qrcode/pickup';
          var name = '扫码取件';
        }else if(result.qrCodeInfoType === 'SEND_EXPRESS'){
          // 扫码寄快递
          var url = '/a/express/send/qrcode/submit';
          var name = '扫码寄件';
        }
        // 发送请求
        wx.request({
          method: 'POST',
          url: that._g.server + url,
          data: {
            qrCodeInfo: result.qrCodeInfo
          },
          header: {
            'content-type': 'application/x-www-form-urlencoded',
            'authorization': that.getAuth()
          },
          success: function(res) {
            if(res.statusCode >= 200 && res.statusCode < 400){
              if(!res.data.code || res.data.code == 200){
                wx.showToast({ title: name + '成功' });
              }
            }else{
              that.showErrModal(res.data, '扫描二维码失败');
            }
          },
          fail: function(res) {
            that.showErrModal('网络错误', '扫描二维码失败');
          },
          complete: function() {
            wx.hideNavigationBarLoading();
          }
        });
      },
      complete: function() {
        wx.hideNavigationBarLoading();
      }
    });
  },
  utils: require('/utils/util.js'),
  _g: {
    //微信信息
    userInfo: {},
    //用户信息
    user: {},
    role: {
      userRoles: [],
      isMailAdmin: false,
      isExpressAdmin: false
    },
    //计数
    count: {},
    token: {},
    websocket: 'wss://cqipc.cn/api',
    server: 'https://cqipc.cn/api',
  }
});
