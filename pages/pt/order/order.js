// pages/pt/order/order.js
var api = require('../../../api.js');
var app = getApp();
var is_no_more = false;
var is_loading = false;
var p=2;
Page({

  /**
   * 页面的初始数据
   */
    data: {
        hide: 1,
        qrcode: "",
        scrollLeft: 0,
        scrollTop: 0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      this.systemInfo = wx.getSystemInfoSync()
      var store = wx.getStorageSync("store");
      this.setData({
          store: store,
      });

      app.pageOnLoad(this);
      var page = this;
      is_no_more = false;
      is_loading = false;
      p = 2;
      page.loadOrderList(options.status || -1);
    //   var windowWidth = this.systemInfo.windowWidth
    //   var offsetLeft = e.currentTarget.offsetLeft
    //   var scrollLeft = this.data.scrollLeft;
      var scrollLeft = 0;
      if (options.status >= 2 ) {
          scrollLeft = 600
      } else {
          scrollLeft = 0
      }
      page.setData({
          scrollLeft: scrollLeft,
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
   * 用户点击右上角分享
   */
  onShareAppMessage: function (options) {
      var page = this;
      console.log(options);
      var index = options.target.dataset.index;
      console.log(page.data.order_list[index]);
      var path = '/pages/pt/group/details?oid=' + options.target.dataset.id
      return {
          title: page.data.order_list[index].goods_list[0].goods_name,
          path: path,
          imageUrl: page.data.order_list[index].goods_list[0].goods_pic,
          success: function (res) {
              console.log(path)
              console.log(res)
          }
      }
  },
  /**
   * 初次加载数据
   */
    loadOrderList: function (status) {
        if (status == undefined)
            status = -1;
        var page = this;
        page.setData({
            status: status,
        });
        wx.showLoading({
            title: "正在加载",
            mask: true,
        });
        app.request({
            url: api.group.order.list,
            data: {
                status: page.data.status,
            },
            success: function (res) {
                if (res.code == 0) {
                    page.setData({
                      order_list: res.data.list,
                    });
                }
                page.setData({
                    show_no_data_tip: (res.data.list.length == 0),
                });
                if(status==4){
                    return;
                }
                page.countDown();
                
            },
            complete: function () {
                wx.hideLoading();
            }
        });
    },
    /**
     * 拼团倒计时
    */
    countDown: function () {
        var page = this;
        setInterval(function () {
            var order_list = page.data.order_list; 
            for (var i in order_list) {
                var leftTime = (new Date(order_list[i]['limit_time_ms'][0], order_list[i]['limit_time_ms'][1] - 1, order_list[i]['limit_time_ms'][2], order_list[i]['limit_time_ms'][3], order_list[i]['limit_time_ms'][4], order_list[i]['limit_time_ms'][5])) - (new Date()); //计算剩余的毫秒数 
                var days = parseInt(leftTime / 1000 / 60 / 60 / 24, 10); //计算剩余的天数 
                var hours = parseInt(leftTime / 1000 / 60 / 60 % 24, 10); //计算剩余的小时 
                var minutes = parseInt(leftTime / 1000 / 60 % 60, 10);//计算剩余的分钟 
                var seconds = parseInt(leftTime / 1000 % 60, 10);//计算剩余的秒数 

                days = page.checkTime(days);
                hours = page.checkTime(hours);
                minutes = page.checkTime(minutes);
                seconds = page.checkTime(seconds);
                order_list[i].limit_time = {
                    days: days,
                    hours: hours > 0 ? hours:'00',
                    mins: minutes > 0 ? minutes: '00',
                    secs: seconds > 0 ? seconds:'00',
                };
                page.setData({
                    order_list: order_list,
                });
            }
        }, 1000);
    },
    /**
    * 时间补0
    */
    checkTime: function (i) { //将0-9的数字前面加上0，例1变为01 
        i = i > 0 ? i : 0;
        if (i < 10) {
            i = "0" + i;
        }
        return i;
    },
    /**
     * 页面触底事件
     */
    onReachBottom: function () {
        var page = this;
        if (is_loading || is_no_more)
            return;
        is_loading = true;
        app.request({
            url: api.group.order.list,
            data: {
                status: page.data.status,
                page: p,
            },
            success: function (res) {
                if (res.code == 0) {
                    var order_list = page.data.order_list.concat(res.data.list);
                    page.setData({
                        order_list: order_list,
                    });
                    if (res.data.list.length == 0) {
                        is_no_more = true;
                    }
                }
                p++;
            },
            complete: function () {
                is_loading = false;
            }
        });
    },
    /**
 * 返回首页
 */
    goHome: function (e) {
        wx.redirectTo({
            url: '/pages/pt/index/index'
        })
    },
    /**
     * 去支付
     */
    orderPay: function (e) {
        wx.showLoading({
            title: "正在提交",
            mask: true,
        });
        app.request({
            url: api.group.pay_data,
            data: {
                order_id: e.currentTarget.dataset.id,
                pay_type: "WECHAT_PAY",
            },
            complete: function () {
                wx.hideLoading();
            },
            success: function (res) {
                console.log(res);
                if (res.code == 0) {
                    wx.requestPayment({
                        timeStamp: res.data.timeStamp,
                        nonceStr: res.data.nonceStr,
                        package: res.data.package,
                        signType: res.data.signType,
                        paySign: res.data.paySign,
                        success: function (e) {
                            console.log("success");
                            console.log(e);
                        },
                        fail: function (e) {
                            console.log("fail");
                            console.log(e);
                        },
                        complete: function (e) {
                            console.log("complete");
                            console.log(e);

                            if (e.errMsg == "requestPayment:fail" || e.errMsg == "requestPayment:fail cancel") {//支付失败转到待支付订单列表
                                wx.showModal({
                                    title: "提示",
                                    content: "订单尚未支付",
                                    showCancel: false,
                                    confirmText: "确认",
                                    success: function (res) {
                                        if (res.confirm) {
                                            wx.redirectTo({
                                                url: "/pages/pt/order/order?status=0",
                                            });
                                        }
                                    }
                                });
                                return;
                            }
                            wx.redirectTo({
                                url: "/pages/pt/order/order?status=1",
                            });
                        },
                    });
                }
                if (res.code == 1) {
                    wx.showToast({
                        title: res.msg,
                        image: "/images/icon-warning.png",
                    });
                }
            }
        });
    },
    /**
     * 去参团
     */
    goToGroup: function (e) {
        wx.navigateTo({
            url: '/pages/pt/group/details?oid=' + e.target.dataset.id,
        })
    },
    /**
     * 到店拿货获取核销二维码
     */
    getOfflineQrcode:function(e){
        var page = this;
        wx.showLoading({
            title: "正在加载",
            mask: true,
        });
            app.request({
                url: api.group.order.get_qrcode,
                data: {
                    order_no: e.currentTarget.dataset.id,
                },
                success: function (res) {
                    if (res.code == 0) {
                        page.setData({
                            hide: 0,
                            qrcode: res.data.url
                        });
                    } else {
                        wx.showModal({
                            title: '提示',
                            content: res.msg,
                        })
                    }
                },
                complete: function () {
                    wx.hideLoading();
                }
            });
    },
    hide: function (e) {
        this.setData({
            hide: 1
        });
    },
    /**
     * 订单取消
     */
    goToCancel: function (e) {
        var page = this;
        wx.showModal({
            title: "提示",
            content: "是否取消该订单？",
            cancelText: "否",
            confirmText: "是",
            success: function (res) {
                if (res.cancel)
                    return true;
                if (res.confirm) {
                    wx.showLoading({
                        title: "操作中",
                    });
                    app.request({
                        url: api.group.order.revoke,
                        data: {
                            order_id: e.currentTarget.dataset.id,
                        },
                        success: function (res) {
                            wx.hideLoading();
                            wx.showModal({
                                title: "提示",
                                content: res.msg,
                                showCancel: false,
                                success: function (res) {
                                    if (res.confirm) {
                                        page.loadOrderList(page.data.status);
                                    }
                                }
                            });
                        }
                    });
                }
            }
        });
    },
    /**
     * 顶部导航事件
     */
    switchNav: function (e) {
        var page = this;

        var status = e.currentTarget.dataset.status;
        // var windowWidth = this.systemInfo.windowWidth
        // var offsetLeft = e.currentTarget.offsetLeft
        // var scrollLeft = this.data.scrollLeft;
        // if (offsetLeft > windowWidth / 2) {
        //     scrollLeft = offsetLeft
        // } else {
        //     scrollLeft = 0
        // }
        // page.setData({
        //     scrollLeft: scrollLeft,
        // });
        wx.redirectTo({
            url: '/pages/pt/order/order?status='+status,
        })
    },

    /**
     * 前往退款详情
     */
    goToRefundDetail:function(e){
        var page = this;
        var id = e.currentTarget.dataset.refund_id;

        wx.navigateTo({
            url: '/pages/pt/order-refund-detail/order-refund-detail?id=' + id,
        })

    }
})