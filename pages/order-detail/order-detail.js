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
          store:wx.getStorageSync("store")
        });
        wx.showLoading({
            title: "正在加载",
        });
        app.request({
            url: api.order.detail,
            data: {
                order_id: options.id,
            },
            success: function (res) {
                if (res.code == 0) {
                    page.setData({
                        order: res.data,
                    });
                }
            },
            complete: function () {
                wx.hideLoading();
            }
        });
    },

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
    location:function(){
      var page = this;
      var shop = page.data.order.shop;
      wx.openLocation({
        latitude: parseFloat(shop.latitude),
        longitude: parseFloat(shop.longitude),
        address:shop.address,
        name:shop.name
      })
    }

});