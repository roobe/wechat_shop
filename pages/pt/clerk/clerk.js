// pages/pt/order-details/order-details.js
var api = require('../../../api.js');
var app = getApp();
Page({

    /**
     * 页面的初始数据
     */
    data: {

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
    loadOrderDetails: function () {
        var page = this;
        var oid = page.options.scene;
        wx.showLoading({
            title: "正在加载",
            mask: true,
        });
        app.request({
            url: api.group.order.clerk_order_details,
            data: {
                id: oid
            },
            success: function (res) {
                if (res.code == 0) {
                    if (res.data.status != 3) {
                        page.countDownRun(res.data.limit_time_ms);
                    }
                    page.setData({
                        order_info: res.data,
                        limit_time: res.data.limit_time,
                    });
                } else {
                    wx.showModal({
                        title: '提示',
                        content: res.msg,
                        showCancel: false,
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
     * 核销订单
     */
    clerkOrder: function (e) {
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
                        url: api.group.order.clerk,
                        data: {
                            order_id: page.data.order_info.order_id
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
});