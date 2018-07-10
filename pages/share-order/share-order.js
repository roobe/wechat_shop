// pages/share-order/share-order.js
var api = require('../../api.js');
var app = getApp();
var is_no_more = false;
var is_loading = false;
var p = 2;
Page({

    /**
     * 页面的初始数据
     */
    data: {
        status: -1,
        list: [],
        hidden: -1,
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        app.pageOnLoad(this);
        var page = this;
        is_no_more = false;
        is_loading = false;
        p = 2;
        page.GetList(options.status || -1);
    },

    GetList: function (status) {
        var page = this;
        page.setData({
            status: parseInt(status || -1),
        });
        wx.showLoading({
            title: "正在加载",
            mask: true,
        });
        app.request({
            url: api.share.get_order,
            data: {
                status: page.data.status
            },
            success: function (res) {
                page.setData({
                    list: res.data
                });
            },
            complete: function () {
                wx.hideLoading();
            }
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

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {

    },
    click: function (e) {
        var page = this;
        var index = e.currentTarget.dataset.index;
        page.setData({
            hidden: page.data.hidden == index ? -1 : index
        });
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

        var page = this;
        if (is_loading || is_no_more)
            return;
        is_loading = true;
        app.request({
            url: api.share.get_order,
            data: {
                status: page.data.status,
                page: p,
            },
            success: function (res) {
                if (res.code == 0) {

                    var list = page.data.list.concat(res.data);
                    page.setData({
                        list: list,
                    });
                    if (res.data.length == 0) {
                        is_no_more = true;
                    }
                }
                p++;
            },
            complete: function () {
                is_loading = false;
            }
        });

    }
})