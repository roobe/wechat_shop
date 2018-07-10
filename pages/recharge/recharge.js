var api = require('../../api.js');
var app = getApp();
Page({

    /**
     * 页面的初始数据
     */
    data: {
        selected: -1,
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        app.pageOnLoad(this);
        var page = this;
        wx.showLoading({
            title: '加载中',
        })
        app.request({
            url: api.recharge.list,
            success: function (res) {
                var data = res.data;
                if (!data.balance || data.balance.status == 0) {
                    wx.showModal({
                        title: '提示',
                        content: '充值功能未开启，请联系管理员！',
                        showCancel: false,
                        success: function (res) {
                            if (res.confirm) {
                                wx.navigateBack({
                                    delta: 1
                                })
                            }
                        }
                    })
                }
                page.setData(res.data);
            },
            complete: function (res) {
                wx.hideLoading();
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

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {
        app.pageOnHide(this);
    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {
        app.pageOnUnload(this);
    },

    click: function (e) {
        this.setData({
            selected: e.currentTarget.dataset.index
        });
    },

    pay: function (e) {
        var page = this;
        var data = {};
        var selected = page.data.selected;
        if (selected == -1) {
            var money = page.data.money;
            if (money < 0.01) {
                wx.showModal({
                    title: '提示',
                    content: '充值金额不能小于0.01',
                    showCancel: false
                });
                return;
            }
            data.pay_price = money;
            data.send_price = 0;
        } else {
            var list = page.data.list;
            data.pay_price = list[selected].pay_price;
            data.send_price = list[selected].send_price;
        }
        if (!data.pay_price) {
            wx.showModal({
                title: '提示',
                content: '请选择充值金额',
                showCancel: false
            });
            return;
        }
        data.pay_type = "WECHAT_PAY";
        wx.showLoading({
            title: '提交中',
        });
        app.request({
            url: api.recharge.submit,
            data: data,
            method: 'POST',
            success: function (res) {
                if (res.code == 0) {
                    setTimeout(function () {
                        wx.hideLoading();
                    }, 1000);
                    wx.requestPayment({
                        timeStamp: res.data.timeStamp,
                        nonceStr: res.data.nonceStr,
                        package: res.data.package,
                        signType: res.data.signType,
                        paySign: res.data.paySign,
                        complete: function (e) {
                            if (e.errMsg == "requestPayment:fail" || e.errMsg == "requestPayment:fail cancel") {
                                wx.showModal({
                                    title: "提示",
                                    content: "订单尚未支付",
                                    showCancel: false,
                                    confirmText: "确认",
                                });
                                return;
                            }
                            if (e.errMsg == "requestPayment:ok") {
                                wx.showModal({
                                    title: "提示",
                                    content: "充值成功",
                                    showCancel: false,
                                    confirmText: "确认",
                                    success: function (res) {
                                        wx.redirectTo({
                                            url: '/pages/balance/balance',
                                        })
                                    }
                                });
                            }
                        },
                    });
                    return;
                } else {
                    wx.showModal({
                        title: '提示',
                        content: res.msg,
                        showCancel: false
                    });
                    wx.hideLoading();
                }
            }
        });
    },

    input: function (e) {
        this.setData({
            money: e.detail.value
        });
    }
});