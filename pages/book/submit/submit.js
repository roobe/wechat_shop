// pages/book/submit/submit.js
var api = require('../../../api.js');
var utils = require('../../../utils/utils.js');
var app = getApp();
Page({

    /**
     * 页面的初始数据
     */
    data: {
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        app.pageOnLoad(this);
        this.getPreview(options);
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
    
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {
    
    },
    /**
     * 复选
     */
    checkboxChange:function(e){
        console.log(e.target.dataset.id);
        var page = this;
        var pid = e.target.dataset.pid;
        var id = e.target.dataset.id;
        var form_list = page.data.form_list;
            var is_selected = form_list[pid].default[id]['selected'];
            if (is_selected==true) {
                form_list[pid].default[id]['selected'] = false;
            }else{
                form_list[pid].default[id]['selected'] = true;
            }
        page.setData({
            form_list: form_list,
        });
    },
    /**
     * 单选
     */
    radioChange:function(e){
        var page = this;
        var pid = e.target.dataset.pid;
        var form_list = page.data.form_list;
        for (var i in form_list[pid].default){
            if (e.target.dataset.id == i){
                form_list[pid].default[i]['selected'] = true;
            }else{
                form_list[pid].default[i]['selected'] = false;
            }
        }
        page.setData({
            form_list:form_list,
        });
    },
    /**
     * input 改变
     */
    inputChenge:function(e){
        console.log(e);
        var page = this;
        var id = e.target.dataset.id;
        var form_list = page.data.form_list;
        form_list[id].default = e.detail.value;
        page.setData({
            form_list : form_list,
        });
    },

    /**
     * 获取数据
     * getsubmit_preview
     */
    getPreview:function(e){
        var page = this;
        var gid = e.id;
        wx.showLoading({
            title: "正在加载",
            mask: true,
        });
        // wx.showNavigationBarLoading();
        app.request({
            url: api.book.submit_preview,
            method: "get",
            data: { gid: gid },
            success: function (res) {
                if (res.code == 0) {
                    for (var i in res.data.form_list){
                        if (res.data.form_list[i].type=='date'){
                            res.data.form_list[i].default = res.data.form_list[i].default ? res.data.form_list[i].default : utils.formatData(new Date);
                        }
                        if (res.data.form_list[i].type == 'time') {
                            res.data.form_list[i].default = res.data.form_list[i].default ? res.data.form_list[i].default : '00:00';
                        }
                    }
                    page.setData({
                        goods: res.data.goods,
                        form_list: res.data.form_list,
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
    submit:function(e){
        var form_id = e.detail.formId;
        var page = this;
        var gid = page.data.goods.id;
        var form_list = JSON.stringify(page.data.form_list);
        console.log(form_list);
        wx.showLoading({
            title: "正在提交",
            mask: true,
        });
        // wx.showNavigationBarLoading();
        app.request({
            url: api.book.submit,
            method: "post",
            data: { gid: gid, form_list: form_list, form_id: form_id},
            success: function (res) {
                if (res.code == 0) {
                    if(res.type==1){
                        // 免费
                        wx.redirectTo({
                            url: "/pages/book/order/order?status=1",
                        });
                    }else{
                        wx.showLoading({
                            title: "正在提交",
                            mask: true,
                        });
                        //发起支付
                        wx.requestPayment({
                            timeStamp: res.data.timeStamp,
                            nonceStr: res.data.nonceStr,
                            package: res.data.package,
                            signType: res.data.signType,
                            paySign: res.data.paySign,
                            success: function (e) {
                                wx.redirectTo({
                                    url: "/pages/book/order/order?status=1",
                                });
                            },
                            fail: function (e) {
                            },
                            complete: function (e) {
                                setTimeout(function () {
                                    // 延长一秒取消加载动画
                                    wx.hideLoading();
                                }, 1000);
                                if (e.errMsg == "requestPayment:fail" || e.errMsg == "requestPayment:fail cancel") {//支付失败转到待支付订单列表
                                    wx.showModal({
                                        title: "提示",
                                        content: "订单尚未支付",
                                        showCancel: false,
                                        confirmText: "确认",
                                        success: function (res) {
                                            if (res.confirm) {
                                                wx.redirectTo({
                                                    url: "/pages/book/order/order?status=0",
                                                });
                                            }
                                        }
                                    });
                                    return;
                                }
                                if (e.errMsg == "requestPayment:ok") {
                                    return;
                                }
                                wx.redirectTo({
                                    url: "/pages/book/order/order?status=-1",
                                });
                            },
                        });
                        return;
                    }
                } else {
                    wx.showModal({
                        title: '提示',
                        content: res.msg,
                        showCancel: false,
                        success: function (res) {
                            // if (res.confirm) {
                            //     wx.redirectTo({
                            //         url: '/pages/book/index/index'
                            //     });
                            // }
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
    }
})