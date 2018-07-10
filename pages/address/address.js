// pages/address/address.js
var api = require('../../api.js');
var app = getApp();
Page({

    /**
     * 页面的初始数据
     */
    data: {
        address_list: [],
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
        var page = this;
        wx.showNavigationBarLoading();
        app.request({
            url: api.user.address_list,
            success: function (res) {
                wx.hideNavigationBarLoading();
                if (res.code == 0) {
                    page.setData({
                        address_list: res.data.list,
                    });
                }
                page.setData({
                    show_no_data_tip: (page.data.address_list.length == 0),
                });
            }
        });
    },

    setDefaultAddress: function (e) {
        var page = this;
        var index = e.currentTarget.dataset.index;
        var address = page.data.address_list[index];
        wx.showLoading({
            title: "正在保存",
            mask: true,
        });
        app.request({
            url: api.user.address_set_default,
            data: {
                address_id: address.id,
            },
            success: function (res) {
                wx.hideLoading();
                if (res.code == 0) {
                    var address_list = page.data.address_list;
                    for (var i in address_list) {
                        if (i == index) {
                            address_list[i].is_default = 1;
                        } else {
                            address_list[i].is_default = 0;
                        }
                    }
                    page.setData({
                        address_list: address_list,
                    });
                }
            }
        });
    },

    deleteAddress: function (e) {
        var page = this;
        var address_id = e.currentTarget.dataset.id;
        var index = e.currentTarget.dataset.index;
        wx.showModal({
            title: "提示",
            content: "确认删除改收货地址？",
            success: function (res) {
                if (res.confirm) {
                    wx.showLoading({
                        title: "正在删除",
                        mask: true,
                    });
                    app.request({
                        url: api.user.address_delete,
                        data: {
                            address_id: address_id,
                        },
                        success: function (res) {
                            if (res.code == 0) {
                                wx.redirectTo({
                                    url: "/pages/address/address",
                                });
                            }
                            if (res.code == 1) {
                                wx.hideLoading();
                                wx.showToast({
                                    title: res.msg,
                                    image: "/images/icon-warning.png",
                                });
                            }
                        }
                    });
                }
            }
        });
    },

});