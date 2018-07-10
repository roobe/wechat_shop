// pages/book/order/details.js
var api = require('../../../api.js');
var utils = require('../../../utils.js');
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
        console.log(options);
        this.getOrderDetails(options);
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
     * 订单详情
     */
    getOrderDetails: function (e) {
        var oid = e.scene;
        var page = this;
        wx.showLoading({
            title: "正在加载",
            mask: true,
        });
        // wx.showNavigationBarLoading();
        app.request({
            url: api.book.clerk_order_details,
            method: "get",
            data: { id: oid },
            success: function (res) {
                if (res.code == 0) {
                    page.setData({
                        goods: res.data,
                    });
                } else {
                    wx.showModal({
                        title: '提示',
                        content: res.msg,
                        showCancel: false,
                        success: function (res) {
                            if (res.confirm) {
                                wx.redirectTo({
                                    url: '/pages/user/user'
                                });
                            }
                        }
                    });
                }
            },
            complete: function (res) {
                setTimeout(function () {
                    // 延长一秒取消加载动画
                    wx.hideLoading();
                }, 1000);
            }
        });
    },
    /**
     * 跳转至商品详情
     */
    goToGoodsDetails: function (e) {
        wx.redirectTo({
            url: '/pages/book/details/details?id=' + this.data.goods.goods_id,
        })
    },
    /**
     * 确认核销
     */
    nowWriteOff:function(e)
    {
        var page = this;
        console.log(page.data.order)
        wx.showModal({
            title: '提示',
            content: '是否确认核销？',
            success: function (res) {
                if (res.confirm) {
                    wx.showLoading({
                        title: "正在加载",
                    });
                    app.request({
                        url: api.book.clerk,
                        data: {
                            order_id: page.data.goods.id
                        },
                        success: function (res) {
                            if (res.code == 0) {
                                wx.redirectTo({
                                    url: '/pages/user/user',
                                })
                            } else {
                                wx.showModal({
                                    title: '警告！',
                                    showCancel: false,
                                    content: res.msg,
                                    confirmText: '确认',
                                    success: function (res) {
                                        if (res.confirm) {
                                            wx.redirectTo({
                                                url: '/pages/index/index',
                                            })
                                        }
                                    }
                                });
                            }
                        },
                        complete: function () {
                            wx.hideLoading();
                        }
                    });
                } else if (res.cancel) {
                }
            }
        })
    }
})