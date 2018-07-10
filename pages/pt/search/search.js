// pages/pt/search/search.js
var api = require('../../../api.js');
var app = getApp();
var pageNum = 1;
Page({

    /**
     * 页面的初始数据
     */
    data: {
        history_show : false,
        search_val:'',
        list: [],
        history_info:[],
        show_loading_bar:false,
        emptyGoods:false,
        newSearch:true,
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        app.pageOnLoad(this);
        var page = this;


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
        wx.getStorage({
            key: 'history_info',
            success: function (res) {
                console.log(res.data.length);
                if(res.data.length > 0){
                    page.setData({
                        history_info: res.data,
                        history_show: true,
                    });
                }
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
        if (page.data.emptyGoods){
            return;
        }
        if (page.data.page_count <= pageNum){
            page.setData({
                emptyGoods:true,
            })
        }
        pageNum++;
        page.getSearchGoods();
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {
    
    },
    /**
     * 搜索
     */
    toSearch:function (e){
        var value = e.detail.value;
        var page = this;
        if (!value){
            return;
        }
        var history_info = page.data.history_info;

        history_info.unshift(value);
        for (var i in history_info) {
            if (history_info.length <= 20)
                break;
            history_info.splice(i, 1);
        }
        wx.setStorageSync('history_info', history_info);
        page.setData({
            history_info: history_info,
            history_show:false,
            keyword:value,
            list:[],
        });

        page.getSearchGoods();
    },
    /**
     * 取消
     */
    cancelSearchValue:function(e){
        wx.navigateBack({
            delta: 1,
        });
    },
    /**
     * 光标聚集input
     */
    newSearch:function(e){
        var page = this;
        var history_show = false;
        if (page.data.history_info.length > 0){
            history_show = true;
        }
        pageNum = 1;
        page.setData({
            history_show: history_show,
            list:[],
            newSearch:[],
            emptyGoods:false,
        });
    },
    /**
     * 清除历史搜索
     */
    clearHistoryInfo:function(e){
        var page = this;
        var history_info = [];
        wx.setStorageSync('history_info', history_info);
        page.setData({
            history_info: history_info,
            history_show: false,
        });
    },
    /**
     * 请求接口获取搜索结果
     */
    getSearchGoods:function(){
        var page = this;
        var keyword = page.data.keyword;
        if(!keyword){
            return;
        }
        page.setData({
            show_loading_bar: true,
        });
        app.request({
            url: api.group.search,
            data: {
                keyword: keyword,
                page: pageNum,
            },
            success: function (res) {
                if (res.code == 0) {
                    if (page.data.newSearch){
                        var list = res.data.list;
                    }else{
                        var list = page.data.list.concat(res.data.list);
                    }
                    page.setData({
                        list: list,
                        page_count: res.data.page_count,
                        emptyGoods: true,
                        show_loading_bar:false,
                    });
                    if (res.data.page_count>pageNum){
                        page.setData({
                            newSearch:false,
                            emptyGoods:false,
                        })
                    };
                }
            },
            complete: function () {
            }
        });
    },
    /**
     * 历史记录点击
     */
    historyItem:function(e){
        var keyword = e.currentTarget.dataset.keyword;
        var page = this;
        page.setData({
            keyword: keyword,
            history_show:false,
        });
        page.getSearchGoods();
    }

})