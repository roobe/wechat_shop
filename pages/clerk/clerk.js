// pages/order-detail/order-detail.js
var api = require('../../api.js');
var app = getApp();
Page({

    /**
     * 页面的初始数据
     */
    data: {
        order: null,
        getGoodsTotalPrice: function () {
            return this.data.order.total_price;
        }
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        app.pageOnLoad(this);
        var page = this;
        page.setData({
            store: wx.getStorageSync('store'),
            user_info: wx.getStorageSync("user_info")
        });
        wx.showLoading({
            title: "正在加载",
        });
        app.request({
            url: api.order.clerk_detail,
            data: {
                order_no: options.scene,
            },
            success: function (res) {
                if (res.code == 0) {
                    page.setData({
                        order: res.data,
                    });
                } else {
                    wx.showModal({
                        title: '警告！',
                        showCancel: false,
                        content: '订单不存在',
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
    },
    clerk: function (e) {
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
                        url: api.order.clerk,
                        data: {
                            order_no: page.data.order.order_no
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

});