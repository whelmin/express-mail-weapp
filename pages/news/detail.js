var app = getApp();
Page({
  data: {
    remind: "加载中",
    id: "",
    title: "",    // 新闻标题
    date: "",     // 发布日期
    author: "",   // 发布作者
    reading: "",   // 阅读量
    content: ""   // 新闻内容
  },

  convertHtmlToText: function (inputText) {
    var returnText = "" + inputText;
    returnText = returnText.replace(/<\/?[^>]*>/g, '').replace(/[ | ]*\n/g, '\n').replace(/ /ig, '')
      .replace(/&mdash/gi, '-').replace(/&ldquo/gi, '“').replace(/&rdquo/gi, '”');
    return returnText;
  },

  onLoad: function (options) {
    var _this = this;
    _this.loginHandler(options);
  },
  loginHandler: function (options) {
    var _this = this;

    if (!options.id) {
      _this.setData({
        remind: '404'
      });
      return false;
    }
    _this.setData({
      'type': options.type,
      id: options.id
    });
    // options.openid = app._user.openid;
    // 发送请求
    /*wx.request({
      url: app._server + '/api/get_news_detail.php',
      data: options,
      success: function (res) {
        if (res.data && res.data.status === 200) {
          var info = res.data.data;
          // 提取信息中的时间，作者，阅读量
          var author_info = [];
          if (info.author) {
            author_info = info.author.split(' ').map(function (e) {
              return e.split(':')[1];
            });
          }
          _this.setData({
            date: author_info[0] || info.time || "",  // 发布日期
            author: author_info[1] || "",     // 发布作者
            reading: author_info[2] || "",    // 阅读量
            title: info.title,            //新闻标题
            content: _this.convertHtmlToText(info.body),  // 新闻内容
            source: _this.data.sources[options.type],
            remind: ''
          });

        } else {
          app.showErrorModal(res.data.message);
          _this.setData({
            remind: res.data.message || '未知错误'
          });
        }
      },
      fail: function () {
        app.showErrorModal(res.errMsg);
        _this.setData({
          remind: '网络错误'
        });
      }
    })*/
    // 临时模拟
    _this.setData({
      date: "2017-05-02",  // 发布日期
      author: "未知",     // 发布作者
      reading: "未知",    // 阅读量
      title: '【综合新闻】《重庆市教育评估管理办法》专家论证会在重庆工业职业技术学院召开',            //新闻标题
      content: '【综合新闻】《重庆市教育评估管理办法》专家论证会在重庆工业职业技术学院召开【综合新闻】《重庆市教育评估管理办法》专家论证会在重庆工业职业技术学院召开\n【综合新闻】《重庆市教育评估管理办法》专家论证会在重庆工业职业技术学院召开',  // 新闻内容
      remind: ''
    });
  }
});