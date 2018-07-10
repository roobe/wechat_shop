// pages/order-refund-detail/order-refund-detail.js
var api = require('../../api.js');
var app = getApp();
Page({

    /**
     * 页面的初始数据
     */
    data: {
        order_refund: null,
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        app.pageOnLoad(this);

        var page = this;

        wx.showLoading({
            title: "正在加载",
        });
        app.request({
            url: api.order.refund_detail,
            data: {
                order_refund_id: options.id,
            },
            success: function (res) {
                if (res.code == 0) {
                    page.setData({
                        order_refund: res.data,
                    });
                }
            },
            complete: function () {
                wx.hideLoading();
            }
        });
    },
    viewImage: function (e) {
        var page = this;
        var index = e.currentTarget.dataset.index;
        wx.previewImage({
            current: page.data.order_refund.refund_pic_list[index],
            urls: page.data.order_refund.refund_pic_list,
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
})