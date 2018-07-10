// pages/card-clerk/card-clerk.js
var api = require('../../api.js');
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
        var page = this;
        var user_info = wx.getStorageSync("user_info");
        page.setData({
            store: wx.getStorageSync('store'),
            user_info: user_info
        });
        wx.showModal({
            title: '提示',
            content: '是否核销预约？',
            success: function (e) {
                if (e.confirm) {
                    wx.showLoading({
                        title: '核销中',
                    })
                    app.request({
                        url: api.user.card_clerk,
                        data: {
                            user_card_id: decodeURIComponent(options.scene)
                        },
                        success: function (res) {
                            wx.showModal({
                                title: '提示',
                                content: res.msg,
                                showCancel: false,
                                success: function (res) {
                                    if (res.confirm) {
                                        wx.redirectTo({
                                            url: '/pages/index/index',
                                        })
                                    }
                                }
                            })
                        },
                        complete: function () {
                            wx.hideLoading();
                        }
                    });
                }
                else if (e.cancel) {
                    wx.redirectTo({
                        url: '/pages/index/index',
                    })
                }
            }
        })
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
})