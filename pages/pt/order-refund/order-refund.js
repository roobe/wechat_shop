// /pages/order-refund/order-refund.js
var api = require('../../../api.js');
var app = getApp();
Page({

    /**
     * 页面的初始数据
     */
    data: {
        switch_tab_1: "active",
        switch_tab_2: "",
        goods: {
            goods_pic: "https://goss1.vcg.com/creative/vcg/800/version23/VCG21f302700c4.jpg",
        },
        refund_data_1: {},
        refund_data_2: {},
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        app.pageOnLoad(this);
        var page = this;
        app.request({
            url: api.group.order.refund_preview,
            data: {
                order_id: options.id,
            },
            success: function (res) {
                if (res.code == 0) {
                    page.setData({
                        goods: res.data,
                    });
                }
                if (res.code == 1) {
                    wx.showModal({
                        title: "提示",
                        content: res.msg,
                        image: "/images/icon-warning.png",
                        success: function (res) {
                            if (res.confirm) {
                                wx.navigateBack();
                            }
                        }
                    });
                }
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

    switchTab: function (e) {
        var page = this;
        var id = e.currentTarget.dataset.id;
        if (id == 1) {
            page.setData({
                switch_tab_1: "active",
                switch_tab_2: "",
            });
        } else {
            page.setData({
                switch_tab_1: "",
                switch_tab_2: "active",
            });
        }
    },
    descInput: function (e) {
        var page = this;
        var type = e.currentTarget.dataset.type;
        var value = e.detail.value;
        if (type == 1) {
            var refund_data_1 = page.data.refund_data_1;
            refund_data_1.desc = value;
            page.setData({
                refund_data_1: refund_data_1,
            });
        }
        if (type == 2) {
            var refund_data_2 = page.data.refund_data_2;
            refund_data_2.desc = value;
            page.setData({
                refund_data_2: refund_data_2,
            });
        }
    },

    chooseImage: function (e) {
        var page = this;
        var type = e.currentTarget.dataset.type;
        var max_pic_num = 6;
        if (type == 1) {
            var refund_data_1 = page.data.refund_data_1;
            var pic_num = 0;
            if (refund_data_1.pic_list)
                pic_num = refund_data_1.pic_list.length || 0;
            var _count = max_pic_num - pic_num;
            wx.chooseImage({
                count: _count,
                success: function (res) {
                    if (!refund_data_1.pic_list)
                        refund_data_1.pic_list = [];
                    refund_data_1.pic_list = refund_data_1.pic_list.concat(res.tempFilePaths);
                    page.setData({
                        refund_data_1: refund_data_1
                    });
                }
            });
        }
        if (type == 2) {
            var refund_data_2 = page.data.refund_data_2;
            var pic_num = 0;
            if (refund_data_2.pic_list)
                pic_num = refund_data_2.pic_list.length || 0;
            var _count = max_pic_num - pic_num;
            wx.chooseImage({
                count: _count,
                success: function (res) {
                    if (!refund_data_2.pic_list)
                        refund_data_2.pic_list = [];
                    refund_data_2.pic_list = refund_data_2.pic_list.concat(res.tempFilePaths);
                    page.setData({
                        refund_data_2: refund_data_2
                    });
                }
            });
        }
    },
    deleteImage: function (e) {
        var page = this;
        var type = e.currentTarget.dataset.type;
        var index = e.currentTarget.dataset.index;
        if (type == 1) {
            var refund_data_1 = page.data.refund_data_1;
            refund_data_1.pic_list.splice(index, 1);
            page.setData({
                refund_data_1: refund_data_1
            });
        }
        if (type == 2) {
            var refund_data_2 = page.data.refund_data_2;
            refund_data_2.pic_list.splice(index, 1);
            page.setData({
                refund_data_2: refund_data_2
            });
        }
    },
    refundSubmit: function (e) {
        var page = this;
        var type = e.currentTarget.dataset.type;

        /*--退货退款开始--*/
        if (type == 1) {//退货退款
            var desc = page.data.refund_data_1.desc || "";
            if (desc.length == 0) {
                wx.showToast({
                    title: "请填写退款原因",
                    image: "/images/icon-warning.png"
                });
                return;
            }
            var pic_url_list = [];
            var pic_complete_count = 0;

            //如果有图片先上传图片
            if (page.data.refund_data_1.pic_list && page.data.refund_data_1.pic_list.length > 0) {
                wx.showLoading({
                    title: "正在上传图片",
                    mask: true,
                });
                for (var i in page.data.refund_data_1.pic_list) {
                    (function (i) {
                        wx.uploadFile({
                            url: api.default.upload_image,
                            filePath: page.data.refund_data_1.pic_list[i],
                            name: "image",
                            success: function (res) {
                                //console.log(res);
                            },
                            complete: function (res) {
                                pic_complete_count++;
                                if (res.statusCode == 200) {
                                    res = JSON.parse(res.data);
                                    if (res.code == 0) {
                                        pic_url_list[i] = res.data.url;
                                    }
                                }
                                if (pic_complete_count == page.data.refund_data_1.pic_list.length) {
                                    wx.hideLoading();
                                    _submit();
                                }
                            }
                        });
                    })(i);
                }
            } else {
                _submit();
            }

            function _submit() {
                wx.showLoading({
                    title: "正在提交",
                    mask: true,
                });
                app.request({
                    url: api.group.order.refund,
                    method: "post",
                    data: {
                        type: 1,
                        order_detail_id: page.data.goods.order_detail_id,
                        desc: desc,
                        pic_list: JSON.stringify(pic_url_list),
                    },
                    success: function (res) {
                        wx.hideLoading();
                        if (res.code == 0) {
                            wx.showModal({
                                title: "提示",
                                content: res.msg,
                                showCancel: false,
                                success: function (res) {
                                    if (res.confirm) {
                                        wx.redirectTo({
                                            url: "/pages/pt/order/order?status=4"
                                        });
                                    }
                                }
                            });
                        }
                        if (res.code == 1) {
                            wx.showModal({
                                title: "提示",
                                content: res.msg,
                                showCancel: false,
                                success: function (res) {
                                    if (res.confirm) {
                                        wx.navigateBack({
                                            delta: 2,
                                        });
                                    }
                                }
                            });
                        }
                    }
                });
            }
        }
        /*--退货退款结束--*/

        /*--换货开始--*/
        if (type == 2) {//换货
            var desc = page.data.refund_data_2.desc || "";
            if (desc.length == 0) {
                wx.showToast({
                    title: "请填写换货说明",
                    image: "/images/icon-warning.png"
                });
                return;
            }
            var pic_url_list = [];
            var pic_complete_count = 0;

            //如果有图片先上传图片
            if (page.data.refund_data_2.pic_list && page.data.refund_data_2.pic_list.length > 0) {
                wx.showLoading({
                    title: "正在上传图片",
                    mask: true,
                });
                for (var i in page.data.refund_data_2.pic_list) {
                    (function (i) {
                        wx.uploadFile({
                            url: api.default.upload_image,
                            filePath: page.data.refund_data_2.pic_list[i],
                            name: "image",
                            success: function (res) {
                                //console.log(res);
                            },
                            complete: function (res) {
                                pic_complete_count++;
                                if (res.statusCode == 200) {
                                    res = JSON.parse(res.data);
                                    if (res.code == 0) {
                                        pic_url_list[i] = res.data.url;
                                    }
                                }
                                if (pic_complete_count == page.data.refund_data_2.pic_list.length) {
                                    wx.hideLoading();
                                    _submit();
                                }
                            }
                        });
                    })(i);
                }
            } else {
                _submit();
            }

            function _submit() {
                wx.showLoading({
                    title: "正在提交",
                    mask: true,
                });
                app.request({
                    url: api.group.order.refund,
                    method: "post",
                    data: {
                        type: 2,
                        order_detail_id: page.data.goods.order_detail_id,
                        desc: desc,
                        pic_list: JSON.stringify(pic_url_list),
                    },
                    success: function (res) {
                        wx.hideLoading();
                        if (res.code == 0) {
                            wx.showModal({
                                title: "提示",
                                content: res.msg,
                                showCancel: false,
                                success: function (res) {
                                    if (res.confirm) {
                                        wx.redirectTo({
                                            url: "/pages/pt/order/order?status=4"
                                        });
                                    }
                                }
                            });
                        }
                        if (res.code == 1) {
                            wx.showModal({
                                title: "提示",
                                content: res.msg,
                                showCancel: false,
                                success: function (res) {
                                    if (res.confirm) {
                                        wx.navigateBack({
                                            delta: 2,
                                        });
                                    }
                                }
                            });
                        }
                    }
                });
            }
        }
        /*--换货结束--*/


    }
});