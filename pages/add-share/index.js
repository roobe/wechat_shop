// pages/add-share/index.js
var api = require('../../api.js');
var app = getApp();
Page({

    /**
     * 页面的初始数据
     */
    data: {
        form: {
            name: '',
            mobile: '',
        },
        img: "/images/img-share-un.png",
        agree: 0
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
        var user_info = wx.getStorageSync("user_info");
        var store = wx.getStorageSync("store");
        var share_setting = wx.getStorageSync("share_setting");
        wx.showLoading({
            title: '加载中',
        });
        app.pageOnShow(page);
        page.setData({
            user_info: user_info,
            store: store,
            share_setting: share_setting
        });
        app.request({
            url: api.share.check,
            method: 'POST',
            success: function (res) {
                if (res.code == 0) {
                    user_info.is_distributor = res.data;
                    wx.setStorageSync("user_info", user_info);
                    if(res.data == 1){
                        wx.redirectTo({
                            url: '/pages/share/index',
                        })
                    }
                }
                page.setData({
                    user_info: user_info,
                });
            },
            complete:function(){
                wx.hideLoading();
            }
        });

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
    formSubmit: function (e) {
        var page = this;
        var user_info = wx.getStorageSync("user_info");
        page.data.form = e.detail.value;
        if (page.data.form.name == undefined || page.data.form.name == '') {
            wx.showToast({
                title: "请填写姓名！",
                image: "/images/icon-warning.png",
            });
            return;
        }
        if (page.data.form.mobile == undefined || page.data.form.mobile == '') {
            wx.showToast({
                title: "请填写联系方式！",
                image: "/images/icon-warning.png",
            });
            return;
        }
        var data = e.detail.value;
        data.form_id = e.detail.formId;
        if (page.data.agree == 0) {
            wx.showToast({
                title: "请先阅读并确认分销申请协议！！",
                image: "/images/icon-warning.png",
            });
            return;
        }
        console.log(page.data.agree);
        wx.showLoading({
            title: "正在提交",
            mask: true,
        });
        app.request({
            url: api.share.join,
            method: 'POST',
            data: data,
            success: function (res) {
                if (res.code == 0) {
                    user_info.is_distributor = 2;
                    wx.setStorageSync(
                        "user_info", user_info
                    );
                    wx.redirectTo({
                        url: '/pages/add-share/index',
                    })
                } else {
                    wx.showToast({
                        title: res.msg,
                        image: "/images/icon-warning.png",
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

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },
    agreement: function () {
        var share_setting = wx.getStorageSync("share_setting");
        wx.showModal({
            title: '分销协议',
            content: share_setting.agree,
            showCancel: false,
            confirmText: "我已阅读",
            confirmColor: "#ff4544",
            success: function (res) {
                if (res.confirm) {
                    console.log('用户点击确定')
                }
            }
        });
    },
    agree: function () {
        var page = this;
        var agree = page.data.agree;
        if (agree == 0) {
            agree = 1;
            page.setData({
                img: "/images/img-share-agree.png",
                agree: agree
            });
        }
        else if (agree == 1) {
            agree = 0;
            page.setData({
                img: "/images/img-share-un.png",
                agree: agree
            });
        }
    }
})