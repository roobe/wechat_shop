// pages/favorite/favorite.js
var api = require('../../api.js');
var app = getApp();
Page({

    /**
     * 页面的初始数据
     */
    data: {
        swiper_current: 0,
        goods: {
            list: null,
            is_more: true,
            is_loading: false,
            page: 1,
        },
        topic: {
            list: null,
            is_more: true,
            is_loading: false,
            page: 1,
        }
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        app.pageOnLoad(this);
        this.loadGoodsList({
            reload: true,
            page: 1,
        });
        this.loadTopicList({
            reload: true,
            page: 1,
        });

    },


    tabSwitch: function (e) {
        var page = this;
        var index = e.currentTarget.dataset.index;
        page.setData({
            swiper_current: index,
        });
    },
    swiperChange: function (e) {
        console.log(e);
        var page = this;
        page.setData({
            swiper_current: e.detail.current,
        });
    },

    loadGoodsList: function (args) {
        var page = this;
        if (page.data.goods.is_loading)
            return;
        if (args.loadmore && !page.data.goods.is_more)
            return;
        page.data.goods.is_loading = true;
        page.setData({
            goods: page.data.goods,
        });
        app.request({
            url: api.user.favorite_list,
            data: {
                page: args.page,
            },
            success: function (res) {
                if (res.code == 0) {
                    if (args.reload) {
                        page.data.goods.list = res.data.list;
                    }
                    if (args.loadmore) {
                        page.data.goods.list = page.data.goods.list.concat(res.data.list);
                    }
                    page.data.goods.page = args.page;
                    page.data.goods.is_more = res.data.list.length > 0;
                    page.setData({
                        goods: page.data.goods,
                    });
                } else {
                }
            },
            complete: function () {
                page.data.goods.is_loading = false;
                page.setData({
                    goods: page.data.goods,
                });
            }
        });

    },

    goodsScrollBottom: function () {
        var page = this;
        page.loadGoodsList({
            loadmore: true,
            page: page.data.goods.page + 1,
        });
    },

    loadTopicList: function (args) {
        var page = this;
        if (page.data.topic.is_loading)
            return;
        if (args.loadmore && !page.data.topic.is_more)
            return;
        page.data.topic.is_loading = true;
        page.setData({
            topic: page.data.topic,
        });
        app.request({
            url: api.user.topic_favorite_list,
            data: {
                page: args.page,
            },
            success: function (res) {
                if (res.code == 0) {
                    if (args.reload) {
                        page.data.topic.list = res.data.list;
                    }
                    if (args.loadmore) {
                        page.data.topic.list = page.data.topic.list.concat(res.data.list);
                    }
                    page.data.topic.page = args.page;
                    page.data.topic.is_more = res.data.list.length > 0;
                    page.setData({
                        topic: page.data.topic,
                    });
                } else {
                }
            },
            complete: function () {
                page.data.topic.is_loading = false;
                page.setData({
                    topic: page.data.topic,
                });
            }
        });
    },

    topicScrollBottom: function () {
        var page = this;
        page.loadTopicList({
            loadmore: true,
            page: page.data.topic.page + 1,
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

    onReachBottom: function () {
        var page = this;
        page.loadMoreGoodsList();
    },
});