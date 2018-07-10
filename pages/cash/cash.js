// pages/cash/cash.js
var api = require('../../api.js');
var app = getApp();

function min(var1, var2) {
    var1 = parseFloat(var1);
    var2 = parseFloat(var2);
    return var1 > var2 ? var2 : var1;
}

Page({

    /**
     * 页面的初始数据
     */
    data: {
        price: 0.00,
        cash_max_day: -1,
        selected: -1
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
        var share_setting = wx.getStorageSync("share_setting");
        page.setData({
            share_setting: share_setting
        });
        app.request({
            url: api.share.get_price,
            success: function (res) {
                if (res.code == 0) {
                    console.log(res.data)
                    var selected = 0;
                    var name = '';
                    var mobile = '';
                    var cash_last = res.data.cash_last;
                    var bank = '';
                    var bank_name = '';
                    if (res.data.pay_type == 1) {
                        selected = 1;
                    }
                    if (res.data.bank == 1 && res.data.pay_type == 3) {
                        selected = 3;
                    }

                    if (cash_last && (res.data.pay_type == 2 || res.data.pay_type == cash_last['type'])) {
                        selected = cash_last['type'];
                        name = cash_last['name'];
                        mobile = cash_last['mobile'];
                        bank = cash_last['mobile'];
                        bank_name = cash_last['bank_name'];
                    }
                    var a = res.data;
                    page.setData({
                        price: res.data.price.price,
                        cash_max_day: res.data.cash_max_day,
                        pay_type: res.data.pay_type,
                        selected: selected,
                        name: name,
                        mobile: mobile,
                        bank: res.data.bank,
                        bank_name: bank_name,
                    });
                }
            }
        });
    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {

    },


    formSubmit: function (e) {
        var page = this;
        var cash = parseFloat(parseFloat(e.detail.value.cash).toFixed(2));
        var cash_max = page.data.price;
        if (page.data.cash_max_day != -1) {
            cash_max = min(cash_max, page.data.cash_max_day)
        }
        if (cash > cash_max) {
            wx.showToast({
                title: "提现金额不能超过" + cash_max + "元",
                image: "/images/icon-warning.png",
            });
            return;
        }
        if (cash < parseFloat(page.data.share_setting.min_money)) {
            wx.showToast({
                title: "提现金额不能低于" + page.data.share_setting.min_money + "元",
                image: "/images/icon-warning.png",
            });
            return;
        }
        var name = e.detail.value.name;
        var mobile = e.detail.value.mobile;
        if (!name || name == undefined) {
            wx.showToast({
                title: '姓名不能为空',
                image: "/images/icon-warning.png",
            });
            return;
        }
        if (!mobile || mobile == undefined) {
            wx.showToast({
                title: '账号不能为空',
                image: "/images/icon-warning.png",
            });
            return;
        }

        var selected = page.data.selected;
        if (selected != 0 && selected != 1 && selected != 3) {
            wx.showToast({
                title: '请选择提现方式',
                image: "/images/icon-warning.png",
            });
            return;
        }
        var bank_name = e.detail.value.bank_name;
        if (typeof (bank_name) == "undefined") {
            var bank_name = '';
        } else {
            var bank_name = bank_name;
        }
        if (selected == 3) {

            if (!bank_name || bank_name == '') {
                wx.showToast({
                    title: '开户行不能为空',
                    image: "/images/icon-warning.png",
                });
                return;
            }
        }
        wx.showLoading({
            title: "正在提交",
            mask: true,
        });
        app.request({
            url: api.share.apply,
            method: 'POST',
            data: {
                cash: cash,
                name: name,
                mobile: mobile,
                bank: bank_name,
                pay_type: selected,
                scene: 'CASH',
                form_id: e.detail.formId,
            },
            success: function (res) {
                wx.hideLoading();
                wx.showModal({
                    title: "提示",
                    content: res.msg,
                    showCancel: false,
                    success: function (e) {
                        if (e.confirm) {
                            if (res.code == 0) {
                                wx.redirectTo({
                                    url: '/pages/cash-detail/cash-detail',
                                })
                            }
                        }
                    }
                });
            }
        });
    },

    showCashMaxDetail: function () {
        wx.showModal({
            title: "提示",
            content: "今日剩余提现金额=平台每日可提现金额-今日所有用户提现金额"
        });
    },
    select: function (e) {
        var index = e.currentTarget.dataset.index;
        this.setData({
            selected: index
        });
    }

});