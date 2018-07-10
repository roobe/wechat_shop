var api = require('../../api.js');
var app = getApp();
var share_count = 0;
var width = 260;
var int = 1;
var interval = 1;
var page_first_init = true;
var timer = 1;
var msgHistory = '';
Page({
    data: {
        x: wx.getSystemInfoSync().windowWidth,
        y: wx.getSystemInfoSync().windowHeight,
        left: 0,
        show_notice: false,
        animationData: {},
        play: -1,
        time: 0,
        buy_user: '',
        buy_address: '',
        buy_time: 0,
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {

        app.pageOnLoad(this);
        this.loadData(options);
        var page = this;
        var parent_id = 0;
        var user_id = options.user_id;
        var scene = decodeURIComponent(options.scene);
        if (user_id != undefined) {
            parent_id = user_id;
        }
        else if (scene != undefined) {
            parent_id = scene;
        }
        app.loginBindParent({ parent_id: parent_id });

        if (this.data.store.purchase_frame === 1) {
            this.suspension(this.data.time);
        } else {
            page.setData({
                buy_user: '',
            })
        }
    },

    /**
     * 购买记录
     */
    suspension: function () {
        var page = this;

        interval = setInterval(function () {
            app.request({
                url: api.default.buy_data,
                data: { 'time': page.data.time },
                method: 'POST',
                success: function (res) {
                    if (res.code == 0) {
                        var inArray = false;

                        if (msgHistory == res.md5) {
                            inArray = true;
                        }
                        var cha_time = '';
                        var s = res.cha_time;
                        var m = Math.floor(s / 60 - Math.floor(s / 3600) * 60);
                        if (m == 0) {
                            cha_time = s % 60 + '秒';
                        } else {
                            cha_time = m + '分' + s % 60 + '秒';
                        };

                        if (!inArray && res.cha_time <= 300) {
                            page.setData({
                                buy_time: cha_time,
                                buy_user: (res.data.user.length >= 5) ? res.data.user.slice(0, 4) + "..." : res.data.user,
                                buy_avatar_url: res.data.avatar_url,
                                buy_address: (res.data.address.length >= 8) ? res.data.address.slice(0, 7) + "..." : res.data.address,
                            });
                            msgHistory = res.md5;
                        } else {
                            page.setData({
                                buy_user: '',
                                buy_address: '',
                                buy_avatar_url: '',
                                buy_time: '',
                            });
                        }

                    }
                }
            });
        }, 5000);
    },

    /**
     * 加载页面数据
     */
    loadData: function (options) {
        var page = this;
        var pages_index_index = wx.getStorageSync('pages_index_index');
        if (pages_index_index) {
            pages_index_index.act_modal_list = [];
            page.setData(pages_index_index);
        }
        app.request({
            url: api.default.index,
            success: function (res) {
                if (res.code == 0) {
                    if (!page_first_init) {
                        res.data.act_modal_list = [];
                    } else {
                        page_first_init = false;
                    }
                    page.setData(res.data);
                    wx.setStorageSync('store', res.data.store);
                    wx.setStorageSync('pages_index_index', res.data);
                    var _user_info = wx.getStorageSync('user_info');
                    if (_user_info) {
                        page.setData({
                            _user_info: _user_info,
                        });
                    }
                    page.miaoshaTimer();
                }
            },
            complete: function () {
                wx.stopPullDownRefresh();
            }
        });

    },
    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        app.pageOnShow(this);
        share_count = 0;
        var store = wx.getStorageSync("store");
        if (store && store.name) {
            wx.setNavigationBarTitle({
                title: store.name,
            });
        }
        clearInterval(int);
        this.notice();
    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {
        clearInterval(timer);
        this.loadData();
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function (options) {
        var page = this;
        var user_info = wx.getStorageSync("user_info");
        return {
            path: "/pages/index/index?user_id=" + user_info.id,
            success: function (e) {
                share_count++;
                if (share_count == 1)
                    app.shareSendCoupon(page);
            },
            title: page.data.store.name
        };
    },
    receive: function (e) {
        var page = this;
        var id = e.currentTarget.dataset.index;
        wx.showLoading({
            title: '领取中',
            mask: true,
        })
        if (!page.hideGetCoupon) {
            page.hideGetCoupon = function (e) {
                var url = e.currentTarget.dataset.url || false;
                page.setData({
                    get_coupon_list: null,
                });
                if (url) {
                    wx.navigateTo({
                        url: url,
                    });
                }
            };
        }
        app.request({
            url: api.coupon.receive,
            data: { id: id },
            success: function (res) {
                wx.hideLoading();
                if (res.code == 0) {
                    page.setData({
                        get_coupon_list: res.data.list,
                        coupon_list: res.data.coupon_list
                    });
                } else {
                    wx.showToast({
                        title: res.msg,
                        duration: 2000
                    })
                    page.setData({
                        coupon_list: res.data.coupon_list
                    });
                }
            },
            // complete: function () {
            //   wx.hideLoading();
            // }
        });
    },

    navigatorClick: function (e) {
        var page = this;
        var open_type = e.currentTarget.dataset.open_type;
        var url = e.currentTarget.dataset.url;
        if (open_type != 'wxapp')
            return true;
        //console.log(url);
        url = parseQueryString(url);
        url.path = url.path ? decodeURIComponent(url.path) : "";
        console.log("Open New App");
        wx.navigateToMiniProgram({
            appId: url.appId,
            path: url.path,
            complete: function (e) {
                console.log(e);
            }
        });
        return false;

        function parseQueryString(url) {
            var reg_url = /^[^\?]+\?([\w\W]+)$/,
                reg_para = /([^&=]+)=([\w\W]*?)(&|$|#)/g,
                arr_url = reg_url.exec(url),
                ret = {};
            if (arr_url && arr_url[1]) {
                var str_para = arr_url[1], result;
                while ((result = reg_para.exec(str_para)) != null) {
                    ret[result[1]] = result[2];
                }
            }
            return ret;
        }
    },
    closeCouponBox: function (e) {
        this.setData({
            get_coupon_list: ""
        });
    },

    notice: function () {
        var page = this;
        var notice = page.data.notice;
        if (notice == undefined) {
            return;
        }
        var length = notice.length * 14;
        return;
    },
    miaoshaTimer: function () {
        var page = this;
        if (!page.data.miaosha || !page.data.miaosha.rest_time)
            return;
        timer = setInterval(function () {
            if (page.data.miaosha.rest_time > 0) {
                page.data.miaosha.rest_time = page.data.miaosha.rest_time - 1;
            } else {
                clearInterval(timer);
                return;
            }
            page.data.miaosha.times = page.getTimesBySecond(page.data.miaosha.rest_time);
            page.setData({
                miaosha: page.data.miaosha,
            });
        }, 1000);

    },

    onHide: function () {
        app.pageOnHide(this);
        this.setData({
            play: -1
        });
        clearInterval(int);
        clearInterval(interval);
    },
    onUnload: function () {
        app.pageOnUnload(this);
        this.setData({
            play: -1
        });
        clearInterval(timer);
        clearInterval(int);
        clearInterval(interval);
    },
    showNotice: function () {
        this.setData({
            show_notice: true
        });
    },
    closeNotice: function () {
        this.setData({
            show_notice: false
        });
    },

    getTimesBySecond: function (s) {
        s = parseInt(s);
        if (isNaN(s))
            return {
                h: '00',
                m: '00',
                s: '00',
            };
        var _h = parseInt(s / 3600);
        var _m = parseInt((s % 3600) / 60);
        var _s = s % 60;
        var type = 0;
        if (_h >= 1) {
            _h -= 1;
        }
        return {
            h: _h < 10 ? ('0' + _h) : ('' + _h),
            m: _m < 10 ? ('0' + _m) : ('' + _m),
            s: _s < 10 ? ('0' + _s) : ('' + _s),
        };

    },
    to_dial: function () {
        var contact_tel = this.data.store.contact_tel;
        wx.makePhoneCall({
            phoneNumber: contact_tel
        })
    },

    closeActModal: function () {
        var page = this;
        var act_modal_list = page.data.act_modal_list;
        var show_next = true;
        var next_i;
        for (var i in act_modal_list) {
            var index = parseInt(i);
            if (act_modal_list[index].show) {
                act_modal_list[index].show = false;
                next_i = index + 1;
                if (typeof act_modal_list[next_i] != 'undefined' && show_next) {
                    show_next = false;
                    setTimeout(function () {
                        page.data.act_modal_list[next_i].show = true;
                        page.setData({
                            act_modal_list: page.data.act_modal_list
                        });
                    }, 500);
                }
            }
        }
        page.setData({
            act_modal_list: act_modal_list,
        });
    },
    naveClick: function (e) {
        var page = this;
        app.navigatorClick(e, page);
    },
    play: function (e) {
        this.setData({
            play: e.currentTarget.dataset.index
        });
    },
    onPageScroll: function (e) {
        var page = this;
        if (page.data.play != -1) {
            wx.createSelectorQuery().select('.video').fields({
                rect: true
            }, function (res) {
                console.log(res.top);
                var max = wx.getSystemInfoSync().windowHeight;
                if (res.top <= -200 || res.top >= max - 57) {
                    page.setData({
                        play: -1
                    });
                }
            }).exec();
        }
    }
});
