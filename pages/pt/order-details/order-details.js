// pages/pt/order-details/order-details.js
var api = require('../../../api.js');
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
      hide: 1,
      qrcode: ""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      app.pageOnLoad(this);
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
        var page = this;
        page.loadOrderDetails();
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
        var page = this;
        var path = '/pages/pt/group/details?oid=' + page.data.order_info.order_id
        return {
            title: page.data.order_info.goods_list[0].name,
            path: path,
            imageUrl: page.data.order_info.goods_list[0].goods_pic,
            success: function (res) {
                console.log(path)
                console.log(res)
            }
        }
    },
   /**
    * 订单详情数据加载
    */
    loadOrderDetails:function(){
        var page = this;
        wx.showLoading({
            title: "正在加载",
            mask: true,
        });
        app.request({
            url: api.group.order.detail,
            data: {
                order_id: page.options.id
            },
            success: function (res) {
                if (res.code == 0) {
                    if (res.data.status !=3){
                        page.countDownRun(res.data.limit_time_ms);
                    }
                    page.setData({
                        order_info: res.data,
                        limit_time: res.data.limit_time,
                    });
                }else{
                    wx.showModal({
                        title: '提示',
                        content: res.msg,
                        showCancel:false,
                        success: function (res) {
                            if (res.confirm) {
                                wx.redirectTo({
                                    url: '/pages/pt/order/order'
                                })
                            }
                        }
                    })
                }
            },
            complete: function () {
                wx.hideLoading();
            }
        });
    },
    /**
     * 复制
     */
    copyText: function (e) {
        var page = this;
        var text = e.currentTarget.dataset.text;
        wx.setClipboardData({
            data: text,
            success: function () {
                wx.showToast({
                    title: "已复制"
                });
            }
        });
    },  
    /**
     * 执行倒计时
     */
    countDownRun: function (limit_time_ms) {
        var page = this;
        setInterval(function () {
            var leftTime = (new Date(limit_time_ms[0], limit_time_ms[1] - 1, limit_time_ms[2], limit_time_ms[3], limit_time_ms[4], limit_time_ms[5])) - (new Date()); //计算剩余的毫秒数 
            var hours = parseInt(leftTime / 1000 / 60 / 60 % 24, 10); //计算剩余的小时 
            var minutes = parseInt(leftTime / 1000 / 60 % 60, 10);//计算剩余的分钟 
            var seconds = parseInt(leftTime / 1000 % 60, 10);//计算剩余的秒数 

            hours = page.checkTime(hours);
            minutes = page.checkTime(minutes);
            seconds = page.checkTime(seconds);
            page.setData({
                limit_time: {
                    hours: hours > 0 ? hours:0,
                    mins: minutes > 0 ? minutes:0,
                    secs: seconds > 0 ? seconds:0,
                },
            });
        }, 1000);
    },
    /**
     * 时间补0
     */
    checkTime: function (i) { //将0-9的数字前面加上0，例1变为01 
        if (i < 10) {
            i = "0" + i;
        }
        return i;
    },
    /**
     * 确认收货
     */
    toConfirm:function(e){
        var page = this;
        wx.showLoading({
            title: "正在加载",
            mask: true,
        });
        app.request({
            url: api.group.order.confirm,
            data: {
                order_id: page.data.order_info.order_id
            },
            success: function (res) {
                if (res.code == 0) {
                    wx.showModal({
                        title: '提示',
                        content: res.msg,
                        showCancel: false,
                        success: function (res) {
                            if (res.confirm) {
                                wx.redirectTo({
                                    url: '/pages/pt/order-details/order-details?id=' + page.data.order_info.order_id
                                })
                            }
                        }
                    });
                } else {
                    wx.showModal({
                        title: '提示',
                        content: res.msg,
                        showCancel: false,
                        success: function (res) {
                            if (res.confirm) {
                                wx.redirectTo({
                                    url: '/pages/pt/order-details/order-details?id=' + page.data.order_info.order_id
                                })
                            }
                        }
                    });
                };
            },
            complete: function () {
                wx.hideLoading();
            }
        }); 
    },
    /**
     * 前往参团页
     */
    goToGroup:function(e){
        wx.redirectTo({
            url: '/pages/pt/group/details?oid=' + this.data.order_info.order_id,
            success: function(res) {},
            fail: function(res) {},
            complete: function(res) {},
        })
    },
    /**
     * 导航到店
     */
    location: function () {
        var page = this;
        var shop = page.data.order_info.shop;
        wx.openLocation({
            latitude: parseFloat(shop.latitude),
            longitude: parseFloat(shop.longitude),
            address: shop.address,
            name: shop.name
        });
    },
    /**
     * 到店拿货获取核销二维码
     */
    getOfflineQrcode: function (e) {
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
                        qrcode: res.data.url,
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
    // /**
    //  * 订单申请售后
    //  */
    // customerService:function(e){
    //     var page = this;
    //     var oid = page.data.order_info.order_id;





    // },
});