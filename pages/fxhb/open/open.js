var api = require('../../../api.js');
var app = getApp();
Page({

    /**
     * 页面的初始数据
     */
    data: {
        page_img: {
            bg: app.webRoot + '/statics/images/fxhb/bg.png',
            close: app.webRoot + '/statics/images/fxhb/close.png',
            hongbao_bg: app.webRoot + '/statics/images/fxhb/hongbao_bg.png',
            open_hongbao_btn: app.webRoot + '/statics/images/fxhb/open_hongbao_btn.png',
        },
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        var page = this;
        app.pageOnLoad(this);
        wx.showLoading({title: '加载中', mask: true});
        app.request({
            url: api.fxhb.open,
            success: function (res) {
                wx.hideLoading();
                if (res.code == 0) {
                    if (res.data.hongbao_id) {
                        wx.redirectTo({
                            url: '/pages/fxhb/detail/detail?id=' + res.data.hongbao_id,
                        });
                    } else {
                        page.setData(res.data);
                    }
                }
                if (res.code == 1) {
                    wx.showModal({
                        content: res.msg,
                        showCancel: false,
                        success: function (res) {
                            if (res.confirm) {
                                wx.redirectTo({
                                    url: '/pages/index/index'
                                });
                            }
                        }
                    });
                }
            }
        });
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {
        app.pageOnReady(this);
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        app.pageOnShow(this);
    },

    showRule: function () {
        var page = this;
        page.setData({
            showRule: true,
        });
    },

    closeRule: function () {
        var page = this;
        page.setData({
            showRule: false,
        });
    },

    openHongbao: function (e) {
        console.log(e);
        var page = this;
        wx.showLoading({title: '抢红包中', mask: true});
        app.request({
            url: api.fxhb.open_submit,
            method: 'post',
            data: {
                form_id: e.detail.formId,
            },
            success: function (res) {
                if (res.code == 0) {
                    wx.redirectTo({
                        url: '/pages/fxhb/detail/detail?id=' + res.data.hongbao_id,
                    });
                } else {
                    wx.hideLoading();
                    wx.showModal({
                        content: res.msg,
                        showCancel: false,
                    });
                }
            }
        });
    },
});