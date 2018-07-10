// pages/cat/cat.js
var api = require('../../api.js');
var app = getApp();
Page({

    /**
     * 页面的初始数据
     */
    data: {
        cat_list: [],
        sub_cat_list_scroll_top: 0,
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        app.pageOnLoad(this);
        this.setData({
            store: wx.getStorageSync("store"),
        });
    },

    onShow: function () {
        app.pageOnShow(this);
        this.loadData();
    },

    loadData: function (options) {
        var page = this;
        var cat_list = wx.getStorageSync("cat_list");
        if (cat_list) {
            page.setData({
                cat_list: cat_list,
                current_cat: null,
            });
        }
        app.request({
            url: api.default.cat_list,
            success: function (res) {
                if (res.code == 0) {
                    page.setData({
                        cat_list: res.data.list,
                        current_cat: null,
                    });
                    wx.setStorageSync("cat_list", res.data.list);
                }
            },
            complete: function () {
                wx.stopPullDownRefresh();
            }
        });
    },

    catItemClick: function (e) {
        var page = this;
        var index = e.currentTarget.dataset.index;
        var cat_list = page.data.cat_list;
        var scroll_top = 0;
        var add_scroll_top = true;
        var current_cat = null;
        for (var i in cat_list) {
            if (i == index) {
                cat_list[i].active = true;
                add_scroll_top = false;
                current_cat = cat_list[i];
            } else {
                cat_list[i].active = false;
                if (add_scroll_top) {
                    //scroll_top += 62;
                    //scroll_top += 45;
                    //var row_count = Math.ceil(cat_list[i].list.length / 3);
                    //scroll_top += row_count * (79 + 2);

                    //scroll_top += cat_list[i].list.length * 76;
                }
            }
        }
        console.log(current_cat);
        page.setData({
            cat_list: cat_list,
            sub_cat_list_scroll_top: scroll_top,
            current_cat: current_cat,
        });
    },

});