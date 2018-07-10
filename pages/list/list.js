// list.js
var api = require('../../api.js');
var app = getApp();
var is_loading_more = false;
var is_no_more = false;
Page({

    /**
     * 页面的初始数据
     */
    data: {
        cat_id: "",
        page: 1,
        cat_list: [],
        goods_list: [],
        sort: 0,
        sort_type: -1,
    },

    onLoad: function (options) {
        app.pageOnLoad(this);
        this.loadData(options);
    },

    /**
     * 加载初始数据
     * */
    loadData: function (options) {
        var page = this;
        var cat_list = wx.getStorageSync("cat_list");
        var height_bar = "";
        if (options.cat_id) {
            for (var i in cat_list) {
                var in_list = false;
                if (cat_list[i].id == options.cat_id) {
                    cat_list[i].checked = true;
                    if (cat_list[i].list.length > 0) {
                        height_bar = "height-bar";
                    }
                }
                for (var j in cat_list[i].list) {
                    if (cat_list[i].list[j].id == options.cat_id) {
                        cat_list[i].list[j].checked = true;
                        in_list = true;
                        height_bar = "height-bar";
                    }
                }
                if (in_list)
                    cat_list[i].checked = true;
            }
        }
        page.setData({
            cat_list: cat_list,
            cat_id: options.cat_id || "",
            height_bar: height_bar,
        });
        page.reloadGoodsList();

    },
    catClick: function (e) {
        var page = this;
        var cat_id = "";
        var index = e.currentTarget.dataset.index;
        var cat_list = page.data.cat_list;
        for (var i in cat_list) {
            for (var j in cat_list[i].list) {
                cat_list[i].list[j].checked = false;
            }
            if (i == index) {
                cat_list[i].checked = true;
                cat_id = cat_list[i].id;
            } else {
                cat_list[i].checked = false;
            }
        }
        var height_bar = "";
        if (cat_list[index].list.length > 0) {
            height_bar = "height-bar";
        }
        page.setData({
            cat_list: cat_list,
            cat_id: cat_id,
            height_bar: height_bar,
        });
        page.reloadGoodsList();
    },

    subCatClick: function (e) {
        var page = this;
        var cat_id = "";
        var index = e.currentTarget.dataset.index;
        var parent_index = e.currentTarget.dataset.parentIndex;
        var cat_list = page.data.cat_list;
        for (var i in cat_list) {
            for (var j in cat_list[i].list) {
                if (i == parent_index && j == index) {
                    cat_list[i].list[j].checked = true;
                    cat_id = cat_list[i].list[j].id;
                } else {
                    cat_list[i].list[j].checked = false;
                }
            }
        }
        page.setData({
            cat_list: cat_list,
            cat_id: cat_id,
        });
        page.reloadGoodsList();
    },

    allClick: function () {
        var page = this;
        var cat_list = page.data.cat_list;
        for (var i in cat_list) {
            for (var j in cat_list[i].list) {
                cat_list[i].list[j].checked = false;
            }
            cat_list[i].checked = false;
        }
        page.setData({
            cat_list: cat_list,
            cat_id: "",
            height_bar: "",
        });
        page.reloadGoodsList();
    }
    ,

    reloadGoodsList: function () {
        var page = this;
        is_no_more = false;
        page.setData({
            page: 1,
            goods_list: [],
            show_no_data_tip: false,
        });
        var cat_id = page.data.cat_id || "";
        var p = page.data.page || 1;
        //wx.showNavigationBarLoading();
        app.request({
            url: api.default.goods_list,
            data: {
                cat_id: cat_id,
                page: p,
                sort: page.data.sort,
                sort_type: page.data.sort_type,
            },
            success: function (res) {
                if (res.code == 0) {
                    if (res.data.list.length == 0)
                        is_no_more = true;
                    page.setData({page: (p + 1)});
                    page.setData({goods_list: res.data.list});
                }
                page.setData({
                    show_no_data_tip: (page.data.goods_list.length == 0),
                });
            },
            complete: function () {
                //wx.hideNavigationBarLoading();
            }
        });
    }
    ,

    loadMoreGoodsList: function () {
        var page = this;
        if (is_loading_more)
            return;
        page.setData({
            show_loading_bar: true,
        });
        is_loading_more = true;
        var cat_id = page.data.cat_id || "";
        var p = page.data.page || 2;
        app.request({
            url: api.default.goods_list,
            data: {
                page: p,
                cat_id: cat_id,
                sort: page.data.sort,
                sort_type: page.data.sort_type,
            },
            success: function (res) {
                if (res.data.list.length == 0)
                    is_no_more = true;
                var goods_list = page.data.goods_list.concat(res.data.list);
                page.setData({
                    goods_list: goods_list,
                    page: (p + 1),
                });
            },
            complete: function () {
                is_loading_more = false;
                page.setData({
                    show_loading_bar: false,
                });
            }
        });
    }
    ,

    onReachBottom: function () {
        var page = this;
        if (is_no_more)
            return;
        page.loadMoreGoodsList();
    },

    onShow: function (e) {
        app.pageOnShow(this);
        var page = this;
        var list_page_reload = wx.getStorageSync("list_page_reload");

        if (list_page_reload) {//从首页进来，按分类刷新商品列表
            var list_page_options = wx.getStorageSync("list_page_options");
            wx.removeStorageSync("list_page_options");
            wx.removeStorageSync("list_page_reload");
            var cat_id = list_page_options.cat_id || "";
            page.setData({
                cat_id: cat_id,
            });
            var cat_list = page.data.cat_list;
            for (var i in cat_list) {
                var in_list = false;
                for (var j in cat_list[i].list) {
                    if (cat_list[i].list[j].id == cat_id) {
                        cat_list[i].list[j].checked = true;
                        in_list = true;
                    } else {
                        cat_list[i].list[j].checked = false;
                    }
                }
                if (in_list || cat_id == cat_list[i].id) {
                    cat_list[i].checked = true;
                    if (cat_list[i].list && cat_list[i].list.length > 0) {
                        page.setData({
                            height_bar: "height-bar",
                        });
                    }
                }
                else {
                    cat_list[i].checked = false;
                }
            }
            page.setData({cat_list: cat_list});
            page.reloadGoodsList();
        }
    },

    sortClick: function (e) {
        var page = this;
        var sort = e.currentTarget.dataset.sort;
        var default_sort_type = e.currentTarget.dataset.default_sort_type == undefined ? -1 : e.currentTarget.dataset.default_sort_type;
        var sort_type = page.data.sort_type;
        if (page.data.sort == sort) {
            if (default_sort_type == -1) {
                return;
            }
            if (page.data.sort_type == -1) {
                sort_type = default_sort_type;
            } else {
                sort_type = (sort_type == 0 ? 1 : 0);
            }
        } else {
            sort_type = default_sort_type;
        }

        page.setData({
            sort: sort,
            sort_type: sort_type,
        });
        page.reloadGoodsList();
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    }
    ,


    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

    }
    ,

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {

    }
    ,

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {

    },
});