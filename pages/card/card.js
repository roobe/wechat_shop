// pages/card/card.js
var api = require('../../api.js');
var app = getApp();
var is_loading = false;
Page({

    /**
     * 页面的初始数据
     */
    data: {
        page: 1,
        show_qrcode: false,
        status: 1
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        app.pageOnLoad(this);
        if (options.status) {
            this.setData({
                status: options.status
            });
        }
        this.loadData();
    },
    loadData: function () {
        var page = this;
        wx.showLoading({
            title: '加载中',
        })
        app.request({
            url: api.user.card,
            data: {
                page: 1,
                status: page.data.status
            },
            success: function (res) {
                if (res.code == 0) {
                    page.setData(res.data);
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
        if (this.data.page == this.data.page_count) {
            return;
        }
        this.loadMore();
    },

    loadMore: function () {
        var page = this;
        if (is_loading) {
            return;
        }
        is_loading = true;
        wx.showLoading({
            title: '加载中',
        });
        var p = page.data.page;
        app.request({
            url: api.user.card,
            data: {
                page: (p + 1),
                status: page.data.status
            },
            success: function (res) {
                if (res.code == 0) {
                    var list = page.data.list.concat(res.data.list);
                    page.setData({
                        list: list,
                        page_count: res.data.page_count,
                        row_count: res.data.row_count,
                        page: p + 1
                    });
                }
            },
            complete: function () {
                is_loading = false;
                wx.hideLoading();
            }
        });
    },
    getQrcode: function (e) {
        var page = this;
        var index = e.currentTarget.dataset.index;
        var list = page.data.list;
        var card = list[index];
        wx.showLoading({
            title: '加载中',
        });
        app.request({
            url: api.user.card_qrcode,
            data: {
                user_card_id: card.id
            },
            success: function (res) {
                if (res.code == 0) {
                    page.setData({
                        show_qrcode: true,
                        qrcode: res.data.url
                    });
                } else {
                    wx.showModal({
                        title: '提示',
                        content: res.msg,
                        showCancel: false,
                    })
                }
            },
            complete: function () {
                wx.hideLoading();
            }
        });
    },
    hide: function () {
        this.setData({
            show_qrcode: false
        });
    },
    goto: function (e) {
        var page = this;
        var status = e.currentTarget.dataset.status;
        wx.redirectTo({
            url: '/pages/card/card?status=' + status,
        })
    },
    save: function () {
        var page = this;
        if (wx.saveImageToPhotosAlbum) {
            wx.showLoading({
                title: "正在保存图片",
                mask: false,
            });

            wx.downloadFile({
                url: page.data.qrcode,
                success: function (e) {
                    wx.showLoading({
                        title: "正在保存图片",
                        mask: false,
                    });
                    page.saveImg(e);
                },
                fail: function (e) {
                    wx.showModal({
                        title: '下载失败',
                        content: e.errMsg + ";" + page.data.goods_qrcode,
                        showCancel: false,
                    });
                },
                complete: function (e) {
                    console.log(e);
                    wx.hideLoading();
                }
            });
        } else {
            wx.showModal({
                title: '提示',
                content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
            })
        }
    },
    saveImg: function (e) {
        var page = this;
        wx.saveImageToPhotosAlbum({
            filePath: e.tempFilePath,
            success: function () {
                wx.showModal({
                    title: '提示',
                    content: '保存成功',
                    showCancel: false,
                });
            },
            fail: function (e) {
                wx.getSetting({
                    success: function (r) {
                        if (!r.authSetting['scope.writePhotosAlbum']) {
                            app.getauth({
                                content: "小程序需要授权保存到相册",
                                success: function (res) {
                                    if (res) {
                                        console.log(res);
                                        page.saveImg(e);
                                    }
                                }
                            });
                        }
                    }
                })
            },
            complete: function (e) {
                wx.hideLoading();
            }
        });
    }
})