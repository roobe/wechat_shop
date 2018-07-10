var api = require('../../api.js');
var app = getApp();
var is_more = false;
Page({

    /**
     * 页面的初始数据
     */
    data: {
        show: false
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        app.pageOnLoad(this);
    },

    getData: function () {
        var page = this;
        wx.showLoading({
            title: '加载中',
        });
        app.request({
            url: api.recharge.record,
            data: {
                date: page.data.date_1 || ''
            },
            success: function (res) {
                page.setData({
                    list: res.data.list,
                });
                wx.hideLoading();
                is_more = false;
            }
        });
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {
        app.pageOnReady(this);
        var page = this;
        wx.showLoading({
            title: '加载中',
        });
        var user_info = wx.getStorageSync('user_info');
        app.request({
            url: api.recharge.index,
            success: function (res) {
                user_info.money = res.data.money;
                wx.setStorageSync('user_info', user_info);
                page.setData({
                    user_info: user_info,
                    list: res.data.list,
                    setting: res.data.setting,
                    date_1: res.data.date,
                    date: res.data.date.replace('-', '年') + '月'
                });
                wx.hideLoading();
            }
        });
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

    dateChange: function (e) {
        if (is_more) {
            return;
        }
        is_more = true;
        var date_1 = e.detail.value;
        var date = date_1.replace('-', '年') + '月';
        this.setData({
            date: date,
            date_1: date_1
        });
        this.getData();
    },

    dateUp: function () {
        var page = this;
        if (is_more) {
            return;
        }
        is_more = true;
        var date_1 = page.data.date_1;
        var date = page.data.date;
        var d = new Date(date_1);
        d.setMonth(d.getMonth() + 1);
        var m = d.getMonth() + 1;
        m = m.toString();
        m = m[1] ? m : '0' + m;
        page.setData({
            date: d.getFullYear() + '年' + m + '月',
            date_1: d.getFullYear() + '-' + m
        });
        page.getData();
    },

    dateDown: function () {
        var page = this;
        if (is_more) {
            return;
        }
        is_more = true;
        var date_1 = page.data.date_1;
        var date = page.data.date;
        var d = new Date(date_1);
        d.setMonth(d.getMonth() - 1);
        var m = d.getMonth() + 1;
        m = m.toString();
        m = m[1] ? m : '0' + m;
        page.setData({
            date: d.getFullYear() + '年' + m + '月',
            date_1: d.getFullYear() + '-' + m
        });
        page.getData();
    },

    click: function () {
        this.setData({
            show: true
        });
    },
    close: function () {
        this.setData({
            show: false
        });
    }
});