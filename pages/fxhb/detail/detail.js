var api = require('../../../api.js');
var app = getApp();
var timer = null;
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
            wechat: app.webRoot + '/statics/images/fxhb/wechat.png',
            coupon: app.webRoot + '/statics/images/fxhb/coupon.png',
            pointer_r: app.webRoot + '/statics/images/fxhb/pointer_r.png',
            best_icon: app.webRoot + '/statics/images/fxhb/best_icon.png',
            more_l: app.webRoot + '/statics/images/fxhb/more_l.png',
            more_r: app.webRoot + '/statics/images/fxhb/more_r.png',
            cry: app.webRoot + '/statics/images/fxhb/cry.png',
            share_modal_bg: app.webRoot + '/statics/images/fxhb/share_modal_bg.png',
        },
        goods_list: null,
        rest_time_str: '--:--:--',
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        var page = this;
        app.pageOnLoad(this);

        var id = options.id;
        wx.showLoading({title: '加载中', mask: true});
        app.request({
            url: api.fxhb.detail,
            data: {
                id: id,
            },
            success: function (res) {
                wx.hideLoading();
                if (res.code == 1) {
                    wx.showModal({
                        title: '提示',
                        content: res.msg,
                        showCancel: false,
                        success: function (e) {
                            if (e.confirm) {
                                if (res.game_open == 1) {
                                    wx.redirectTo({
                                        url: '/pages/fxhb/open/open',
                                    });
                                } else {
                                    wx.redirectTo({
                                        url: '/pages/index/index',
                                    });
                                }
                            }
                        }
                    });
                    return;
                }
                if (res.code == 0) {
                    page.setData({
                        rule: res.data.rule,
                        share_pic: res.data.share_pic,
                        share_title: res.data.share_title,
                        coupon_total_money: res.data.coupon_total_money,
                        rest_user_num: res.data.rest_user_num,
                        rest_time: res.data.rest_time,
                        hongbao: res.data.hongbao,
                        hongbao_list: res.data.hongbao_list,
                        is_my_hongbao: res.data.is_my_hongbao,
                        my_coupon: res.data.my_coupon,
                        goods_list: res.data.goods_list,
                    });
                    page.setRestTimeStr();
                }
                page.showShareModal();
            },
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

    //打开分享提示框
    showShareModal: function () {
        var page = this;
        page.setData({
            showShareModal: true,
        });
    },

    //关闭分享提示框
    closeShareModal: function () {
        var page = this;
        page.setData({
            showShareModal: false,
        });
    },

    //倒计时器
    setRestTimeStr: function () {
        var page = this;
        var rest_time = page.data.rest_time || false;
        if (rest_time === false || rest_time === null)
            return;
        rest_time = parseInt(rest_time);
        if (rest_time <= 0) {
            page.setData({
                rest_time_str: '00:00:00',
            });
            return;
        }
        if (timer)
            clearInterval(timer);
        timer = setInterval(function () {
            rest_time = page.data.rest_time;
            if (rest_time <= 0) {
                clearInterval(timer);
                page.setData({
                    rest_time_str: '00:00:00',
                });
                return;
            }
            var h = parseInt(rest_time / 3600);
            var m = parseInt((rest_time % 3600) / 60);
            var s = parseInt((rest_time % 3600) % 60);
            page.setData({
                rest_time: rest_time - 1,
                rest_time_str: (h < 10 ? ('0' + h) : h) + ':' + (m < 10 ? ('0' + m) : m) + ':' + (s < 10 ? ('0' + s) : s),
            });
        }, 1000);
    },

    //一起拆红包操作
    detailSubmit: function (e) {
        var page = this;
        wx.showLoading({
            mask: true,
        });
        app.request({
            url: api.fxhb.detail_submit,
            method: 'post',
            data: {
                id: page.data.hongbao.id,
                form_id: e.detail.formId,
            },
            success: function (res) {
                if (res.code == 1) {
                    wx.hideLoading();
                    page.showToast({
                        title: res.msg,
                        complete: function () {
                            if (res.game_open == 0) {
                                wx.redirectTo({
                                    url: '/pages/index/index',

                                });
                            }
                        }
                    });
                    return;
                }
                if (res.code == 0) {
                    wx.hideLoading();
                    page.showToast({
                        title: res.msg,
                        complete: function () {
                            if (res.reload == 1) {
                                wx.redirectTo({
                                    url: '/pages/fxhb/detail/detail?id=' + page.options.id,
                                });
                            }
                        }
                    });
                }
            }
        });
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {
        var page = this;
        return {
            title: page.data.share_title || null,
            imageUrl: page.data.share_pic || null,
            complete: function () {
                page.closeShareModal();
            }
        };
    }
});