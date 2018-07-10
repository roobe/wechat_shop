var api = require('../../api.js');
var app = getApp();
Page({

    /**
     * 页面的初始数据
     */
    data: {
        load_more_count: 0,
        last_load_more_time: 0,
        is_loading: false,
        loading_class: "",
        cat_id: false,
        keyword: false,
        page: 1,
        limit: 20,
        goods_list: [],
        show_history: true,
        show_result: false,
        history_list: [],
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
        app.pageOnShow(this);
        var page = this;
        page.setData({
            history_list: page.getHistoryList(true),
        });
    },
    inputFocus: function () {
        var page = this;
        page.setData({
            show_history: true,
            show_result: false,
        });
    },
    inputBlur: function () {
        var page = this;
        if (page.data.goods_list.length > 0) {
            setTimeout(function () {
                page.setData({
                    show_history: false,
                    show_result: true,
                });
            }, 300);
        }
    },
    inputConfirm: function (e) {
        var page = this;
        var keyword = e.detail.value;
        if (keyword.length == 0)
            return;
        page.setData({
            page: 1,
            keyword: keyword,
        });
        page.setHistory(keyword);
        page.getGoodsList();

    },
    searchCancel: function () {
        wx.navigateBack({
            delta: 1,
        });
    },
    historyClick: function (e) {
        var page = this;
        var keyword = e.currentTarget.dataset.value;
        if (keyword.length == 0)
            return;
        page.setData({
            page: 1,
            keyword: keyword,
        });
        page.getGoodsList();
    },

    getGoodsList: function () {
        var page = this;
        page.setData({
            show_history: false,
            show_result: true,
        });
        page.setData({
            page: 1,
            scroll_top: 0,
        });
        page.setData({
            goods_list: [],
        });
        var data = {};
        if (page.data.cat_id) {
            data.cat_id = page.data.cat_id;
            page.setActiveCat(data.cat_id);
        }
        if (page.data.keyword) {
            data.keyword = page.data.keyword;
        }
        page.showLoadingBar();
        page.is_loading = true;
        app.request({
            url: api.default.goods_list,
            data: data,
            success: function (res) {
                if (res.code == 0) {
                    page.setData({
                        goods_list: res.data.list
                    });
                }
                if (res.code == 1) {
                }
            },
            complete: function () {
                page.hideLoadingBar();
                page.is_loading = false;
            }
        });
    },
    onListScrollBottom: function (e) {
        var page = this;
        page.getMoreGoodsList();
    },
    getHistoryList: function (is_desc) {
        is_desc = is_desc || false;
        var history_list = wx.getStorageSync('search_history_list');
        if (!history_list)
            return [];
        if (!is_desc) {
            return history_list;
        }
        var new_list = [];
        for (var i = history_list.length - 1; i >= 0; i--)
            new_list.push(history_list[i]);
        return new_list;
    },
    setHistory: function (keyword) {
        var page = this;
        var history_list = page.getHistoryList();
        history_list.push({
            keyword: keyword,
        });
        for (var i in history_list) {
            if (history_list.length <= 20)
                break;
            history_list.splice(i, 1);
        }
        wx.setStorageSync('search_history_list', history_list);
    },

    getMoreGoodsList: function () {
        var page = this;
        var data = {};
        if (page.data.cat_id) {
            data.cat_id = page.data.cat_id;
            page.setActiveCat(data.cat_id);
        }
        if (page.data.keyword)
            data.keyword = page.data.keyword;
        data.page = page.data.page || 1;
        page.showLoadingMoreBar();
        page.setData({
            is_loading: true
        });
        page.setData({
            load_more_count: page.data.load_more_count + 1,
        });
        data.page = page.data.page + 1;
        page.setData({page: data.page});
        app.request({
            url: api.default.goods_list,
            data: data,
            success: function (res) {
                if (res.code == 0) {
                    var old_goods_list = page.data.goods_list;
                    if (res.data.list.length > 0) {
                        for (var i in res.data.list) {
                            old_goods_list.push(res.data.list[i]);
                        }
                        page.setData({
                            goods_list: old_goods_list
                        });
                    } else {
                        page.setData({
                            page: data.page - 1,
                        });
                    }
                }
                if (res.code == 1) {
                }
            },
            complete: function () {
                page.setData({
                    is_loading: false
                });
                page.hideLoadingMoreBar();
            }
        });
    },

    showLoadingBar: function () {
        var page = this;
        page.setData({
            loading_class: "active",
        });
    },
    hideLoadingBar: function () {
        var page = this;
        page.setData({
            loading_class: "",
        });
    },
    showLoadingMoreBar: function () {
        var page = this;
        page.setData({
            loading_more_active: "active",
        });
    },
    hideLoadingMoreBar: function () {
        var page = this;
        page.setData({
            loading_more_active: "",
        });
    },
    deleteSearchHistory: function () {
        var page = this;
        page.setData({
            history_list: null,
        });
        wx.removeStorageSync("search_history_list");
    },

});