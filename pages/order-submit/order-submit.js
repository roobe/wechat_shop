// order-submit.js
var api = require('../../api.js');
var app = getApp();
var longitude = "";
var latitude = "";
var util = require('../../utils/utils.js');
Page({

    /**
     * 页面的初始数据
     */
    data: {
        total_price: 0,
        address: null,
        express_price: 0.00,
        content: '',
        offline: 0,
        express_price_1: 0.00,
        name: "",
        mobile: "",
        integral_radio: 1,
        new_total_price: 0,
        show_card: false,
        payment: -1,
        show_payment: false
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        app.pageOnLoad(this);
        var page = this;
        var time = util.formatData(new Date());
        page.setData({
            options: options,
            store: wx.getStorageSync("store"),
            time: time
        });
    },
    bindkeyinput: function (e) {
        this.setData({
            content: e.detail.value
        });
    },
    KeyName: function (e) {
        this.setData({
            name: e.detail.value
        });
    },
    KeyMobile: function (e) {
        this.setData({
            mobile: e.detail.value
        });
    },
    getOffline: function (e) {
        var page = this;
        var express = this.data.express_price;
        var express_1 = this.data.express_price_1;
        var offline = e.target.dataset.index;
        if (offline == 1) {
            this.setData({
                offline: 1,
                express_price: 0,
                express_price_1: express
            });
        } else {
            this.setData({
                offline: 0,
                express_price: express_1
            });
        }
        page.getPrice();
    },
    dingwei: function () {
        var page = this;
        wx.chooseLocation({
            success: function (e) {
                longitude = e.longitude;
                latitude = e.latitude;
                page.setData({
                    location: e.address,
                });
            },
            fail: function (res) {
                app.getauth({
                    content: "需要获取您的地理位置授权，请到小程序设置中打开授权",
                    success: function (e) {
                        if (e) {
                            if (e.authSetting["scope.userLocation"]) {
                                page.dingwei();
                            } else {
                                wx.showToast({
                                    title: '您取消了授权',
                                    image: '/images/icon-warning.png'
                                })
                            }
                        }
                    }
                });
            }
        })
    },

    orderSubmit: function (e) {
        var page = this;
        var offline = page.data.offline;
        var data = {};
        if (offline == 0) {
            if (!page.data.address || !page.data.address.id) {
                wx.showToast({
                    title: "请选择收货地址",
                    image: "/images/icon-warning.png",
                });
                return;
            }
            data.address_id = page.data.address.id;
        } else {
            data.address_name = page.data.name;
            data.address_mobile = page.data.mobile;
            if (page.data.shop.id) {
                data.shop_id = page.data.shop.id;
            } else {
                wx.showModal({
                    title: '警告',
                    content: '请选择门店',
                    showCancel: false
                });
                return;
            }
            if (!data.address_name || data.address_name == undefined) {
                page.showToast({
                    title: "请填写收货人",
                    image: "/images/icon-warning.png",
                });
                return;
            }
            if (!data.address_mobile || data.address_mobile == undefined) {
                page.showToast({
                    title: "请填写联系方式",
                    image: "/images/icon-warning.png",
                });
                return;
            } else {
                var check_mobile = /^1\d{10}$/;
                if (!check_mobile.test(data.address_mobile)) {
                    wx.showModal({
                        title: '提示',
                        content: '手机号格式不正确',
                        showCancel: false
                    });
                    return;
                }
            }
        }
        data.offline = offline;
        var form = page.data.form;
        if (form.is_form == 1) {
            var form_list = form.list;
            for (var i in form_list) {
                if (form_list[i].type == 'date') {
                    form_list[i].default = form_list[i].default ? form_list[i].default : page.data.time;
                }
                if (form_list[i].type == 'time') {
                    form_list[i].default = form_list[i].default ? form_list[i].default : '00:00';
                }
                if (form_list[i].required == 1) {
                    if (form_list[i].type == 'radio' || form_list[i].type == 'checkboxc') {
                        var is_true = false;
                        for (var j in form_list[i].default_list) {
                            if (form_list[i].default_list[j].is_selected == 1) {
                                is_true = true;
                            }
                        }
                        if (!is_true) {
                            wx.showModal({
                                title: '提示',
                                content: '请填写' + form.name + '，加‘*’为必填项',
                                showCancel: false
                            })
                            return false;
                        }
                    } else {
                        if (!form_list[i].default || form_list[i].default == undefined) {
                            wx.showModal({
                                title: '提示',
                                content: '请填写' + form.name + '，加‘*’为必填项',
                                showCancel: false
                            })
                            return false;
                        }
                    }
                }
            }
        }
        data.form = JSON.stringify(form);
        if (page.data.cart_id_list) {
            data.cart_id_list = JSON.stringify(page.data.cart_id_list);
        }
        if (page.data.goods_info) {
            data.goods_info = JSON.stringify(page.data.goods_info);
        }

        if (page.data.picker_coupon) {
            data.user_coupon_id = page.data.picker_coupon.user_coupon_id;
        }
        if (page.data.content) {
            data.content = page.data.content
        }
        if (page.data.cart_list) {
            data.cart_list = JSON.stringify(page.data.cart_list);
        }
        wx.showLoading({
            title: "正在提交",
            mask: true,
        });
        page.data.integral_radio == 1 ? data.use_integral = 1 : data.use_integral = 2;

        data.payment = page.data.payment;
        //提交订单
        app.request({
            url: api.order.submit,
            method: "post",
            data: data,
            success: function (res) {
                if (res.code == 0) {
                    setTimeout(function () {
                        wx.hideLoading();
                    }, 1000);
                    setTimeout(function () {
                        page.setData({
                            options: {},
                        });
                    }, 1);
                    var order_id = res.data.order_id;

                    //获取支付数据
                    if (data.payment == 0) {
                        app.request({
                            url: api.order.pay_data,
                            data: {
                                order_id: order_id,
                                pay_type: 'WECHAT_PAY',
                            },
                            success: function (res) {
                                if (res.code == 0) {
                                    //发起支付
                                    wx.requestPayment({
                                        timeStamp: res.data.timeStamp,
                                        nonceStr: res.data.nonceStr,
                                        package: res.data.package,
                                        signType: res.data.signType,
                                        paySign: res.data.paySign,
                                        success: function (e) {
                                            // wx.redirectTo({
                                            //     url: "/pages/order/order?status=1",
                                            // });
                                        },
                                        fail: function (e) {
                                        },
                                        complete: function (e) {
                                            if (e.errMsg == "requestPayment:fail" || e.errMsg == "requestPayment:fail cancel") {//支付失败转到待支付订单列表
                                                wx.showModal({
                                                    title: "提示",
                                                    content: "订单尚未支付",
                                                    showCancel: false,
                                                    confirmText: "确认",
                                                    success: function (res) {
                                                        if (res.confirm) {
                                                            wx.redirectTo({
                                                                url: "/pages/order/order?status=0",
                                                            });
                                                        }
                                                    }
                                                });
                                                return;
                                            }
                                            if (e.errMsg == "requestPayment:ok") {
                                                if (page.data.goods_card_list.length > 0) {
                                                    page.setData({
                                                        show_card: true
                                                    });
                                                } else {
                                                    wx.redirectTo({
                                                        url: "/pages/order/order?status=-1",
                                                    });
                                                }
                                                return;
                                            }
                                            wx.redirectTo({
                                                url: "/pages/order/order?status=-1",
                                            });
                                        },
                                    });

                                    var quick_list = wx.getStorageSync('quick_list')
                                    if (quick_list) {
                                        var length = quick_list.length;
                                        for (var i = 0; i < length; i++) {
                                            var goods = quick_list[i]['goods'];
                                            var length2 = goods.length;
                                            for (var a = 0; a < length2; a++) {
                                                goods[a]['num'] = 0;
                                            }
                                        }
                                        wx.setStorageSync("quick_lists", quick_list)

                                        var carGoods = wx.getStorageSync('carGoods')
                                        var length = carGoods.length;
                                        for (var i = 0; i < length; i++) {
                                            carGoods[i]['num'] = 0;
                                            carGoods[i]['goods_price'] = 0;
                                            page.setData({
                                                'carGoods': carGoods
                                            });
                                        }
                                        wx.setStorageSync("carGoods", carGoods)

                                        var total = wx.getStorageSync('total')
                                        if (total) {
                                            total.total_num = 0;
                                            total.total_price = 0;
                                            wx.setStorageSync("total", total)
                                        }

                                        var check_num = wx.getStorageSync('check_num')
                                        check_num = 0;
                                        wx.setStorageSync("check_num", check_num)

                                        var quick_hot_goods_lists = wx.getStorageSync('quick_hot_goods_lists')
                                        var length = quick_hot_goods_lists.length;
                                        for (var i = 0; i < length; i++) {
                                            quick_hot_goods_lists[i]['num'] = 0;
                                            page.setData({
                                                'quick_hot_goods_lists': quick_hot_goods_lists
                                            });
                                        }
                                        wx.setStorageSync("quick_hot_goods_lists", quick_hot_goods_lists)
                                    }
                                    return;
                                }
                                if (res.code == 1) {
                                    page.showToast({
                                        title: res.msg,
                                        image: "/images/icon-warning.png",
                                    });
                                    return;
                                }
                            }
                        });
                    }
                    if (data.payment == 2) {
                        app.request({
                            url: api.order.pay_data,
                            data: {
                                order_id: order_id,
                                pay_type: 'HUODAO_PAY',
                                form_id: e.detail.formId
                            },
                            success: function (res) {
                                if (res.code == 0) {
                                    wx.redirectTo({
                                        url: "/pages/order/order?status=-1",
                                    });
                                } else {
                                    page.showToast({
                                        title: res.msg,
                                        image: "/images/icon-warning.png",
                                    });
                                    return;
                                }
                            }

                        });
                    }
                    if (data.payment == 3) {
                        app.request({
                            url: api.order.pay_data,
                            data: {
                                order_id: order_id,
                                pay_type: 'BALANCE_PAY',
                                form_id: e.detail.formId
                            },
                            success: function (res) {
                                if (res.code == 0) {
                                    wx.redirectTo({
                                        url: "/pages/order/order?status=-1",
                                    });
                                } else {
                                    page.showToast({
                                        title: res.msg,
                                        image: "/images/icon-warning.png",
                                    });
                                    setTimeout(function () {
                                        wx.redirectTo({
                                            url: "/pages/order/order?status=-1",
                                        });
                                    }, 1000)
                                    return;
                                }
                            }

                        });
                    }
                }
                if (res.code == 1) {
                    wx.hideLoading();
                    page.showToast({
                        title: res.msg,
                        image: "/images/icon-warning.png",
                    });
                    return;
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
        var page = this;
        var address = wx.getStorageSync("picker_address");
        if (address) {
            page.setData({
                address: address,
                name: address.name,
                mobile: address.mobile
            });
            wx.removeStorageSync("picker_address");
        }
        page.getOrderData(page.data.options);
    },


    getOrderData: function (options) {
        var page = this;
        var data = {};
        var address_id = "";
        if (page.data.address && page.data.address.id)
            address_id = page.data.address.id;
        data.address_id = address_id;
        data.longitude = longitude;
        data.latitude = latitude;

        wx.showLoading({
            title: "正在加载",
            mask: true,
        });
        if (options.cart_list) {
            var cart_list = JSON.parse(options.cart_list);
            data.cart_list = options.cart_list;
        }

        if (options.cart_id_list) {
            var cart_id_list = JSON.parse(options.cart_id_list);
            data.cart_id_list = cart_id_list;
        }
        if (options.goods_info) {
            data.goods_info = options.goods_info;
        } 
        app.request({
            url: api.order.submit_preview,
            data: data,
            success: function (res) {
                wx.hideLoading();
                if (res.code == 0) {
                    var shop_list = res.data.shop_list;
                    var shop = {};
                    if (shop_list && shop_list.length == 1) {
                        shop = shop_list[0];
                    }
                    if (res.data.is_shop) {
                        shop = res.data.is_shop;
                    }
                    page.setData({
                        total_price: res.data.total_price,
                        goods_list: res.data.list,
                        address: res.data.address,
                        express_price: parseFloat(res.data.express_price),
                        coupon_list: res.data.coupon_list,
                        shop_list: shop_list,
                        shop: shop,
                        name: res.data.address ? res.data.address.name : '',
                        mobile: res.data.address ? res.data.address.mobile : '',
                        send_type: res.data.send_type,
                        level: res.data.level,
                        new_total_price: res.data.total_price,
                        integral: res.data.integral,
                        goods_card_list: res.data.goods_card_list,
                        form: res.data.form,
                        is_payment: res.data.is_payment,
                        pay_type_list: res.data.pay_type_list,
                        payment: res.data.pay_type_list[0].payment,
                    });
                    if (res.data.goods_info){
                        page.setData({
                            goods_info: res.data.goods_info,
                        });
                    }
                    if (res.data.cart_id_list) {
                        page.setData({
                            cart_id_list: res.data.cart_id_list,
                        });
                    }
                    if (res.data.cart_list) {
                        page.setData({
                            cart_list: res.data.cart_list,
                        });
                    }
                    if (res.data.send_type == 1) {//仅快递
                        page.setData({
                            offline: 0,
                        });
                    }
                    if (res.data.send_type == 2) {//仅自提
                        page.setData({
                            offline: 1,
                        });
                    }
                    page.getPrice();
                }
                if (res.code == 1) {
                    wx.showModal({
                        title: "提示",
                        content: res.msg,
                        showCancel: false,
                        confirmText: "返回",
                        success: function (res) {
                            if (res.confirm) {
                                wx.navigateBack({
                                    delta: 1,
                                });
                            }
                        }
                    });
                }
            }
        });
    },

    copyText: function (e) {
        var text = e.currentTarget.dataset.text;
        if (!text)
            return;
        wx.setClipboardData({
            data: text,
            success: function () {
                page.showToast({
                    title: "已复制内容",
                });
            },
            fail: function () {
                page.showToast({
                    title: "复制失败",
                    image: "/images/icon-warning.png",
                });
            },
        });
    },

    showCouponPicker: function () {
        var page = this;
        if (page.data.coupon_list && page.data.coupon_list.length > 0) {
            page.setData({
                show_coupon_picker: true,
            });
        }
    },

    pickCoupon: function (e) {
        var page = this;
        var index = e.currentTarget.dataset.index;
        if (index == '-1' || index == -1) {
            page.setData({
                picker_coupon: false,
                show_coupon_picker: false,
            });
        } else {
            // var new_total_price = page.data.total_price - page.data.coupon_list[index].sub_price - page.data.integral.forehead;
            // if (page.data.level) {
            //     new_total_price = new_total_price * page.data.level.discount / 10;
            // }
            page.setData({
                picker_coupon: page.data.coupon_list[index],
                show_coupon_picker: false,
                // new_total_price: parseFloat(new_total_price.toFixed(2)),
            });
        }
        page.getPrice();
    },

    numSub: function (num1, num2, length) {
        return 100;
    },
    showShop: function (e) {
        var page = this;
        page.dingwei();
        if (page.data.shop_list && page.data.shop_list.length >= 1) {
            page.setData({
                show_shop: true,
            });
        }
    },
    pickShop: function (e) {
        var page = this;
        var index = e.currentTarget.dataset.index;
        if (index == '-1' || index == -1) {
            page.setData({
                shop: false,
                show_shop: false,
            });
        } else {
            page.setData({
                shop: page.data.shop_list[index],
                show_shop: false,
            });
        }
        page.getPrice();
    },
    // integralRadio:function(e){
    //     var page = this;
    //     var index = e.currentTarget.dataset.index;
    //     if (index == null || index =='radio'){
    //         page.setData({
    //             integral_radio: 'radio-active',
    //         });
    //     } else {
    //         page.setData({
    //             integral_radio: 'radio',
    //         });
    //     }
    // },
    integralSwitchChange: function (e) {
        var page = this;
        if (e.detail.value != false) {
            page.setData({
                integral_radio: 1,
            });
        } else {
            page.setData({
                integral_radio: 2,
            });
        }
        page.getPrice();
    },
    integration: function (e) {
        var page = this;
        var integration = page.data.integral.integration;
        wx.showModal({
            title: '积分使用规则',
            content: integration,
            showCancel: false,
            confirmText: '我知道了',
            confirmColor: '#ff4544',
            success: function (res) {
                if (res.confirm) {
                    console.log('用户点击确定')
                }
            }
        });
    },
    /**
     * 计算总价
     */
    getPrice: function () {
        var page = this;
        var total_price = page.data.total_price;
        var new_total_price = total_price;
        var express_price = page.data.express_price;
        var picker_coupon = page.data.picker_coupon;
        var integral = page.data.integral;
        var integral_radio = page.data.integral_radio;
        var level = page.data.level;
        var offline = page.data.offline;

        if (picker_coupon) {
            new_total_price = new_total_price - picker_coupon.sub_price;
        }

        if (integral && integral_radio == 1) {
            new_total_price = new_total_price - parseFloat(integral.forehead);
        }

        if (level) {
            new_total_price = new_total_price * level.discount / 10;
        }

        if (new_total_price <= 0.01) {
            new_total_price = 0.01;
        }

        if (offline == 0) {
            new_total_price = new_total_price + express_price;
        }
        page.setData({
            new_total_price: parseFloat(new_total_price.toFixed(2))
        });

    },
    cardDel: function () {
        var page = this;
        page.setData({
            show_card: false
        });
        wx.redirectTo({
            url: '/pages/order/order?status=1',
        })
    },
    cardTo: function () {
        var page = this;
        page.setData({
            show_card: false
        });
        wx.redirectTo({
            url: '/pages/card/card'
        })
    },
    formInput: function (e) {
        var page = this;
        var index = e.currentTarget.dataset.index;
        var form = page.data.form;
        var form_list = form.list;
        form_list[index].default = e.detail.value;
        form.list = form_list;
        page.setData({
            form: form
        });
    },
    selectForm: function (e) {
        var page = this;
        var index = e.currentTarget.dataset.index;
        var k = e.currentTarget.dataset.k;
        var form = page.data.form;
        var form_list = form.list;
        if (form_list[index].type == 'radio') {
            var default_list = form_list[index].default_list;
            for (var i in default_list) {
                if (i == k) {
                    default_list[k].is_selected = 1;
                } else {
                    default_list[i].is_selected = 0;
                }
            }
            form_list[index].default_list = default_list;
        }
        if (form_list[index].type == 'checkbox') {
            var default_list = form_list[index].default_list;
            if (default_list[k].is_selected == 1) {
                default_list[k].is_selected = 0;
            } else {
                default_list[k].is_selected = 1;
            }
            form_list[index].default_list = default_list;
        }
        form.list = form_list;
        page.setData({
            form: form
        });
    },
    showPayment: function () {
        this.setData({
            show_payment: true
        });
    },
    payPicker: function (e) {
        var index = e.currentTarget.dataset.index;
        this.setData({
            payment: index
        });
    },
    payClose: function () {
        this.setData({
            show_payment: false
        });
    }
});