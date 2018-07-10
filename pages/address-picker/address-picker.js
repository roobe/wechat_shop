var api = require('../../api.js');
var app = getApp();
Page({

    /**
     * 页面的初始数据
     */
    data: {
        address_list: null,
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
            }
        });
    },

    pickAddress: function (e) {
        var page = this;
        var index = e.currentTarget.dataset.index;
        var address = page.data.address_list[index];
        wx.setStorageSync("picker_address", address);
        wx.navigateBack();
    },

    getWechatAddress: function (e) {
        var page = this;
        wx.chooseAddress({
            success: function (e) {
                if (e.errMsg != 'chooseAddress:ok')
                    return;
                wx.showLoading();
                app.request({
                    url: api.user.add_wechat_address,
                    method: "post",
                    data: {
                        national_code: e.nationalCode,
                        name: e.userName,
                        mobile: e.telNumber,
                        detail: e.detailInfo,
                        province_name: e.provinceName,
                        city_name: e.cityName,
                        county_name: e.countyName,
                    },
                    success: function (res) {
                        if (res.code == 1) {
                            wx.showModal({
                                title: '提示',
                                content: res.msg,
                                showCancel: false,
                            });
                            return;
                        }
                        if (res.code == 0) {
                            wx.setStorageSync("picker_address", res.data);
                            wx.navigateBack();
                        }
                    },
                    complete: function () {
                        wx.hideLoading();
                    }
                });
            }
        });
    },
});