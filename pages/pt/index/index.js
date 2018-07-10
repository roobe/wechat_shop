// pages/pt/index.js
var api = require('../../../api.js');
var app = getApp();
Page({

    /**
     * 页面的初始数据
     */
    data: {
            cid: 0,
            scrollLeft:600,
            scrollTop:0,
            emptyGoods:0,
            page_count:0,
    },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      this.systemInfo = wx.getSystemInfoSync()
      app.pageOnLoad(this);
      this.loadIndexInfo(this);
      var store = wx.getStorageSync("store");
      this.setData({
          store: store,
      });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
      app.pageOnShow(this);
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  },
  /**
     * 拼团首页加载
     */
  loadIndexInfo: function (e) {
      var page = e;
      wx.showLoading({
          title: "正在加载",
          mask: true,
      });
      app.request({
          url: api.group.index,
          method: "get",
          success: function (res) {
              if (res.code == 0) {
                  setTimeout(function () {
                      // 延长一秒取消加载动画
                      wx.hideLoading();
                  }, 1000);
                  page.setData({
                      cat: res.data.cat,
                      banner: res.data.banner,
                      ad: res.data.ad,
                      goods: res.data.goods.list,
                      page: res.data.goods.page,
                      page_count: res.data.goods.page_count,
                    //   page_count: res.data.goods.page_count,
                  });
                  if (res.data.goods.row_count<=0){
                      page.setData({
                          emptyGoods:1,
                      })
                  }
              }
          }
      });
  },
  /**
   * 顶部导航事件
   */
  switchNav: function (e) {
      var page = this;
      wx.showLoading({
          title: "正在加载",
          mask: true,
      });
      var cid = 0;
      if (cid == e.currentTarget.dataset.id && e.currentTarget.dataset.id != 0) return;
      cid= e.currentTarget.dataset.id;
      console.log(this.systemInfo);
      var windowWidth = this.systemInfo.windowWidth
      var offsetLeft = e.currentTarget.offsetLeft
      var scrollLeft = this.data.scrollLeft;
      if (offsetLeft > windowWidth / 2) {
          scrollLeft = offsetLeft
      } else {
          scrollLeft = 0
      }
     page.setData({
         cid: cid,
         page:1,
         scrollLeft: scrollLeft,
         scrollTop: 0,
         emptyGoods:0,
         goods:[],
         show_loading_bar: 1,
     })
      app.request({
          url: api.group.list,
          method: "get",
          data: {cid:cid},
          success: function (res) {
              if (res.code == 0) {
                  setTimeout(function () {
                     // 延长一秒取消加载动画
                    wx.hideLoading();
                  }, 1000);
                  var goods = res.data.list;
                  if (res.data.page_count >= res.data.page) {
                      page.setData({
                          goods: goods,
                          page: res.data.page,
                          page_count: res.data.page_count,
                          row_count: res.data.row_count,
                          show_loading_bar: 0,
                      });
                  } else {
                      page.setData({
                          emptyGoods: 1,
                      });
                  }
              }
          }
      });
  },
  /**
   * 下拉加载
   */
    pullDownLoading:function(e)
    {
        var page = this;
        if (page.data.emptyGoods == 1 || page.data.show_loading_bar == 1){
            return;
        }
        page.setData({
            show_loading_bar: 1
        });
        var pageNum = parseInt(page.data.page + 1);
        var cid = page.data.cid;
        app.request({
            url: api.group.list,
            method: "get",
            data: { page: pageNum, cid: cid},
            success: function (res) {
                if (res.code == 0) {
                    var goods = page.data.goods;
                    if (res.data.page > page.data.page){
                        Array.prototype.push.apply(goods, res.data.list);
                    }
                    console.log(res.data.page);
                    console.log(res.data.page_count);
                    if (res.data.page_count >= res.data.page){
                        page.setData({
                            goods: goods,
                            page: res.data.page,
                            page_count: res.data.page_count,
                            row_count: res.data.row_count,
                            show_loading_bar: 0,
                        });
                    }else{
                        page.setData({
                            emptyGoods:1,
                        });
                    }
                }
            }
        });
  },
//   /**
//    * 前往商品详情
//    */
//     goDetails:function (e) {
//         var gid = e.currentTarget.dataset.gid;
//         var page = this;
//     }

    /**
     * 广告图片链接点击事件，处理跳转小程序
     * */
    navigatorClick: function (e) {
        var page = this;
        var open_type = e.currentTarget.dataset.open_type;
        var url = e.currentTarget.dataset.url;
        if (open_type != 'wxapp')
            return true;
        //console.log(url);
        url = parseQueryString(url);
        url.path = url.path ? decodeURIComponent(url.path) : "";
        console.log("Open New App");
        wx.navigateToMiniProgram({
            appId: url.appId,
            path: url.path,
            complete: function (e) {
                console.log(e);
            }
        });
        return false;

        function parseQueryString(url) {
            var reg_url = /^[^\?]+\?([\w\W]+)$/,
                reg_para = /([^&=]+)=([\w\W]*?)(&|$|#)/g,
                arr_url = reg_url.exec(url),
                ret = {};
            if (arr_url && arr_url[1]) {
                var str_para = arr_url[1], result;
                while ((result = reg_para.exec(str_para)) != null) {
                    ret[result[1]] = result[2];
                }
            }
            return ret;
        }
    },
    to_dial: function () {
        var contact_tel = this.data.store.contact_tel;
        wx.makePhoneCall({
            phoneNumber: contact_tel
        })
    },
})