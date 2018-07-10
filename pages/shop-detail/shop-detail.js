// pages/shop-detail/shop-detail.js
var api = require('../../api.js');
var utils = require('../../utils.js');
var app = getApp();
var WxParse = require('../../wxParse/wxParse.js');
Page({

    /**
     * 页面的初始数据
     */
    data: {
        score: [1, 2, 3, 4, 5],
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        app.pageOnLoad(this);
        var page = this;

        var user_id = options.user_id;
        app.loginBindParent({ parent_id: user_id });
        page.setData({
            shop_id: options.shop_id
        });
        console.log(user_id);
        wx.showLoading({
            title: '加载中',
        });
        app.request({
            url: api.default.shop_detail,
            method: 'GET',
            data: {
                shop_id: options.shop_id
            },
            success: function (res) {
                if (res.code == 0) {
                    page.setData(res.data);
                    var detail = res.data.shop.content ? res.data.shop.content : "<span>暂无信息</span>"
                    WxParse.wxParse("detail", "html", detail, page);
                } else {
                    wx.showModal({
                        title: '提示',
                        content: res.msg,
                        showCancel: false,
                        success: function (e) {
                            if (e.confirm) {
                                wx.redirectTo({
                                    url: '/pages/shop/shop',
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

    mobile: function () {
        var page = this;
        wx.makePhoneCall({
            phoneNumber: page.data.shop.mobile,
        })
    },
    goto: function () {
        var page = this;
        wx.getSetting({
            success: function (res) {
                if (!res.authSetting['scope.userLocation']) {
                    app.getauth({
                        content: '需要获取您的地理位置授权，请到小程序设置中打开授权！',
                        cancel: false,
                        success: function (res) {
                            if (res.authSetting['scope.userLocation']) {
                                page.location();
                            }
                        }
                    });
                } else {
                    page.location();
                }
            }
        })
    },

    location: function () {
        var page = this;
        var shop = page.data.shop;
        wx.openLocation({
            latitude: parseFloat(shop.latitude),
            longitude: parseFloat(shop.longitude),
            name: shop.name,
            address: shop.address
        })
    },
    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function (options) {
        var page = this;
        var user_info = wx.getStorageSync("user_info");
        var shop_id = page.data.shop_id;
        return {
            path: "/pages/shop-detail/shop-detail?shop_id="+shop_id+"&user_id=" + user_info.id,
        };
    },
})