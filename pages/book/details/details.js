 // pages/book/details/details.js
var api = require('../../../api.js');
var utils = require('../../../utils.js');
var app = getApp();
var WxParse = require('../../../wxParse/wxParse.js');
var p = 1;
var is_loading_comment = false;
var is_more_comment = true;
Page({

    /**
     * 页面的初始数据
     */
    data: {
        tab_detail: "active",
        tab_comment: "",
        comment_list: [],
        comment_count: {
            score_all: 0,
            score_3: 0,
            score_2: 0,
            score_1: 0,
        },
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        app.pageOnLoad(this);

        var parent_id = 0;
        var user_id = options.user_id;
        console.log("options=>" + JSON.stringify(options));
        var scene = decodeURIComponent(options.scene);
        if (user_id != undefined) {
            parent_id = user_id;
        } else if (scene != undefined) {
            console.log("scene string=>" + scene);
            var scene_obj = utils.scene_decode(scene);
            console.log("scene obj=>" + JSON.stringify(scene_obj));
            if (scene_obj.uid && scene_obj.gid) {
                parent_id = scene_obj.uid;
                options.id = scene_obj.gid;
            } else {
                parent_id = scene;
            }
        }
        app.loginBindParent({ parent_id: parent_id });

        this.setData({
            id: options.id,
        });
        p = 1;
        this.getGoodsInfo(options);
        this.getCommentList(false);
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

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {
        var page = this;
        page.getCommentList(true);
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {
        var page = this;
        var user_info = wx.getStorageSync("user_info");
        return {
            title: page.data.goods.name,
            path: '/pages/book/details/details?id=' + page.data.goods.id + '&user_id='+ user_info.id,
            imageUrl: page.data.goods.cover_pic,
            success: function (res) {
                // 转发成功
            }
        }
    },
    /**
     * 获取商品详情
     */
    getGoodsInfo: function (e) {
        var gid = e.id;
        var page = this;
        wx.showLoading({
            title: "正在加载",
            mask: true,
        });
        // wx.showNavigationBarLoading();
        app.request({
            url: api.book.details,
            method: "get",
            data: { gid: gid },
            success: function (res) {
                if (res.code == 0) {
                    var detail = res.data.info.detail;
                    WxParse.wxParse("detail", "html", detail, page);
                    // wx.setNavigationBarTitle({
                    //     title: res.data.info.name,
                    // })
                    // wx.hideNavigationBarLoading();
                    var sales = (parseInt(res.data.info.virtual_sales) + parseInt(res.data.info.sales));
                    page.setData({
                        goods: res.data.info,
                        shop:res.data.shopList,
                        sales: sales,
                    });
                } else {
                    wx.showModal({
                        title: '提示',
                        content: res.msg,
                        showCancel: false,
                        success: function (res) {
                            if (res.confirm) {
                                wx.redirectTo({
                                    url: '/pages/book/index/index'
                                });
                            }
                        }
                    });
                }
            },
            complete: function (res) {
                setTimeout(function () {
                    // 延长一秒取消加载动画
                    wx.hideLoading();
                }, 1000);
            }
        });
    },

    tabSwitch: function (e) {
        var page = this;
        var tab = e.currentTarget.dataset.tab;
        if (tab == "detail") {
            page.setData({
                tab_detail: "active",
                tab_comment: "",
            });
        } else {
            page.setData({
                tab_detail: "",
                tab_comment: "active",
            });
        }
    },
    commentPicView: function (e) {
        console.log(e);
        var page = this;
        var index = e.currentTarget.dataset.index;
        var pic_index = e.currentTarget.dataset.picIndex;
        wx.previewImage({
            current: page.data.comment_list[index].pic_list[pic_index],
            urls: page.data.comment_list[index].pic_list,
        });
    },
    /**
     * 立即预约
     */
    bespeakNow:function(e){
        wx.redirectTo({
            url: '/pages/book/submit/submit?id=' + this.data.goods.id,
        });
    },
    /**
     * 门店列表
     */
    goToShopList: function (e) {
        wx.navigateTo({
            url: '/pages/book/shop/shop?ids=' + this.data.goods.shop_id,
            success: function(res) {},
            fail: function(res) {},
            complete: function(res) {},
        });
    },
    /**
     * 获取评论列表
     */
    getCommentList: function (more) {
        console.log(more);
        var page = this;
        if (more && page.data.tab_comment != "active")
            return;
        if (is_loading_comment)
            return;
        if (!is_more_comment)
            return;
        is_loading_comment = true;
        app.request({
            url: api.book.goods_comment,
            data: {
                goods_id: page.data.id,
                page: p,
            },
            success: function (res) {
                if (res.code != 0)
                    return;
                is_loading_comment = false;
                p++;
                console.log(res.data.list);
                page.setData({
                    comment_count: res.data.comment_count,
                    comment_list: more ? page.data.comment_list.concat(res.data.list) : res.data.list,
                });
                if (res.data.list.length == 0)
                    is_more_comment = false;
            }
        });
    },
    showShareModal: function () {
        var page = this;
        page.setData({
            share_modal_active: "active",
            no_scroll: true,
        });
    },

    shareModalClose: function () {
        var page = this;
        page.setData({
            share_modal_active: "",
            no_scroll: false,
        });
    },
    getGoodsQrcode: function () {
        var page = this;
        page.setData({
            goods_qrcode_active: "active",
            share_modal_active: "",
        });
        if (page.data.goods_qrcode)
            return true;
        app.request({
            url: api.book.goods_qrcode,
            data: {
                goods_id: page.data.id,
            },
            success: function (res) {
                if (res.code == 0) {
                    page.setData({
                        goods_qrcode: res.data.pic_url,
                    });
                }
                if (res.code == 1) {
                    page.goodsQrcodeClose();
                    wx.showModal({
                        title: "提示",
                        content: res.msg,
                        showCancel: false,
                        success: function (res) {
                            if (res.confirm) {

                            }
                        }
                    });
                }
            },
        });
    },
    goodsQrcodeClose: function () {
        var page = this;
        page.setData({
            goods_qrcode_active: "",
            no_scroll: false,
        });
    },
    goodsQrcodeClose: function () {
        var page = this;
        page.setData({
            goods_qrcode_active: "",
            no_scroll: false,
        });
    },

    saveGoodsQrcode: function () {
        var page = this;
        if (!wx.saveImageToPhotosAlbum) {
            // 如果希望用户在最新版本的客户端上体验您的小程序，可以这样子提示
            wx.showModal({
                title: '提示',
                content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。',
                showCancel: false,
            });
            return;
        }

        wx.showLoading({
            title: "正在保存图片",
            mask: false,
        });

        wx.downloadFile({
            url: page.data.goods_qrcode,
            success: function (e) {
                wx.showLoading({
                    title: "正在保存图片",
                    mask: false,
                });
                wx.saveImageToPhotosAlbum({
                    filePath: e.tempFilePath,
                    success: function () {
                        wx.showModal({
                            title: '提示',
                            content: '商品海报保存成功',
                            showCancel: false,
                        });
                    },
                    fail: function (e) {
                        wx.showModal({
                            title: '图片保存失败',
                            content: e.errMsg,
                            showCancel: false,
                        });
                    },
                    complete: function (e) {
                        console.log(e);
                        wx.hideLoading();
                    }
                });
            },
            fail: function (e) {
                wx.showModal({
                    title: '图片下载失败',
                    content: e.errMsg + ";" + page.data.goods_qrcode,
                    showCancel: false,
                });
            },
            complete: function (e) {
                console.log(e);
                wx.hideLoading();
            }
        });

    },

    goodsQrcodeClick: function (e) {
        var src = e.currentTarget.dataset.src;
        wx.previewImage({
            urls: [src],
        });
    },
    goHome:function(e){
        wx.redirectTo({
            url: '/pages/book/index/index',
            success: function(res) {},
            fail: function(res) {},
            complete: function(res) {},
        })
    }
})