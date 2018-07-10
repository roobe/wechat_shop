//app.js
var util = require('./utils/utils.js');
var api;
App({
    is_on_launch: true,
    onLaunch: function () {
        this.setApi();
        api = this.api;

        this.getNavigationBarColor();
        console.log(wx.getSystemInfoSync());
        this.getStoreData();
        this.getCatList();
    },

    getStoreData: function () {
        var page = this;
        this.request({
            url: api.default.store,
            success: function (res) {
                if (res.code == 0) {
                    wx.setStorageSync("store", res.data.store);
                    wx.setStorageSync("store_name", res.data.store_name);
                    wx.setStorageSync("show_customer_service", res.data.show_customer_service);
                    wx.setStorageSync("contact_tel", res.data.contact_tel);
                    wx.setStorageSync("share_setting", res.data.share_setting);
                }
            },
            complete: function () {
                page.login();
            }
        });
    },

    getCatList: function () {
        this.request({
            url: api.default.cat_list,
            success: function (res) {
                if (res.code == 0) {
                    var cat_list = res.data.list || [];
                    wx.setStorageSync("cat_list", cat_list);
                }
            }
        });
    },

    login: function () {
        var pages = getCurrentPages();
        var page = pages[(pages.length - 1)];
        wx.showLoading({
            title: "正在登录",
            mask: true,
        });
        wx.login({
            success: function (res) {
                if (res.code) {
                    var code = res.code;
                    wx.getUserInfo({
                        success: function (res) {
                            //console.log(res);
                            getApp().request({
                                url: api.passport.login,
                                method: "post",
                                data: {
                                    code: code,
                                    user_info: res.rawData,
                                    encrypted_data: res.encryptedData,
                                    iv: res.iv,
                                    signature: res.signature
                                },
                                success: function (res) {
                                    wx.hideLoading();
                                    // console.log(code)
                                    if (res.code == 0) {
                                        wx.setStorageSync("access_token", res.data.access_token);
                                        wx.setStorageSync("user_info", res.data);
                                        // console.log(res);
                                        // var parent_id = wx.getStorageSync("parent_id");
                                        var p = getCurrentPages();
                                        var parent_id = 0;
                                        if (p[0].options.user_id != undefined) {
                                            var parent_id = p[0].options.user_id;
                                        }
                                        else if (p[0].options.scene != undefined) {
                                            var parent_id = p[0].options.scene;
                                        }
                                        // console.log(parent_id, p[0].options.scene, p[0].options.user_id);
                                        getApp().bindParent({
                                            parent_id: parent_id || 0
                                        });

                                        if (page == undefined) {
                                            return;

                                        }
                                        var loginNoRefreshPage = getApp().loginNoRefreshPage;
                                        for (var i in loginNoRefreshPage) {
                                            if (loginNoRefreshPage[i] === page.route)
                                                return;
                                        }
                                        wx.redirectTo({
                                            url: "/" + page.route + "?" + util.objectToUrlParams(page.options),
                                            fail: function () {
                                                wx.switchTab({
                                                    url: "/" + page.route,
                                                });
                                            },
                                        });
                                    } else {
                                        wx.showToast({
                                            title: res.msg
                                        });
                                    }
                                }
                            });
                        },
                        fail: function (res) {
                            wx.hideLoading();
                            getApp().getauth({
                                content: '需要获取您的用户信息授权，请到小程序设置中打开授权',
                                cancel: true,
                                success: function (e) {
                                    if (e) {
                                        getApp().login();
                                    }
                                },
                            });
                        }
                    });
                } else {
                    //console.log(res);
                }

            }
        });
    },
    request: function (object) {
        if (!object.data)
            object.data = {};
        var access_token = wx.getStorageSync("access_token");
        if (access_token) {
            object.data.access_token = access_token;
        }
        object.data._uniacid = this.siteInfo.uniacid;
        object.data._acid = this.siteInfo.acid;
        wx.request({
            url: object.url,
            header: object.header || {
                'content-type': 'application/x-www-form-urlencoded'
            },
            data: object.data || {},
            method: object.method || "GET",
            dataType: object.dataType || "json",
            success: function (res) {
                if (res.data.code == -1) {
                    getApp().login();
                } else {
                    if (object.success)
                        object.success(res.data);
                }
            },
            fail: function (res) {
                console.warn('--- request fail >>>');
                console.warn(res);
                console.warn('<<< request fail ---');
                var app = getApp();
                if (app.is_on_launch) {
                    app.is_on_launch = false;
                    wx.showModal({
                        title: "网络请求出错",
                        content: res.errMsg,
                        showCancel: false,
                        success: function (res) {
                            if (res.confirm) {
                                if (object.fail)
                                    object.fail(res);
                            }
                        }
                    });
                } else {
                    wx.showToast({
                        title: res.errMsg,
                        image: "/images/icon-warning.png",
                    });
                    if (object.fail)
                        object.fail(res);
                }
            },
            complete: function (res) {
                if (res.statusCode != 200) {
                    console.log('--- request http error >>>');
                    console.log(res.statusCode);
                    console.log(res.data);
                    console.log('<<< request http error ---');
                }
                if (object.complete)
                    object.complete(res);
            }
        });
    },
    saveFormId: function (form_id) {
        this.request({
            url: api.user.save_form_id,
            data: {
                form_id: form_id,
            }
        });
    },

    loginBindParent: function (object) {
        var access_token = wx.getStorageSync("access_token");
        if (access_token == '') {
            return true;
        }
        getApp().bindParent(object);
    },
    bindParent: function (object) {
        if (object.parent_id == "undefined" || object.parent_id == 0)
            return;
        console.log("Try To Bind Parent With User Id:" + object.parent_id);
        var user_info = wx.getStorageSync("user_info");
        var share_setting = wx.getStorageSync("share_setting");
        if (share_setting.level > 0) {
            var parent_id = object.parent_id;
            if (parent_id != 0) {
                getApp().request({
                    url: api.share.bind_parent,
                    data: {parent_id: object.parent_id},
                    success: function (res) {
                        if (res.code == 0) {
                            user_info.parent = res.data
                            wx.setStorageSync('user_info', user_info);
                        }
                    }
                });
            }
        }
    },

    /**
     * 分享送优惠券
     * */
    shareSendCoupon: function (page) {
        wx.showLoading({
            mask: true,
        });
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
        this.request({
            url: api.coupon.share_send,
            success: function (res) {
                if (res.code == 0) {
                    page.setData({
                        get_coupon_list: res.data.list
                    });
                }
            },
            complete: function () {
                wx.hideLoading();
            }
        });
    },
    getauth: function (object) {
        wx.showModal({
            title: '是否打开设置页面重新授权',
            content: object.content,
            confirmText: '去设置',
            success: function (e) {
                if (e.confirm) {
                    wx.openSetting({
                        success: function (res) {
                            if (object.success) {
                                object.success(res);
                            }
                        },
                        fail: function (res) {
                            if (object.fail) {
                                object.fail(res);
                            }
                        },
                        complete: function (res) {
                            if (object.complete)
                                object.complete(res);
                        }
                    })
                } else {
                    if (object.cancel) {
                        getApp().getauth(object);
                    }
                }
            }
        })
    },
    api: require('api.js'),
    setApi: function () {
        var siteroot = this.siteInfo.siteroot;
        siteroot = siteroot.replace('app/index.php', '');
        siteroot += 'addons/zjhj_mall/core/web/index.php?store_id=-1&r=api/';

        function getNewApiUri(api) {
            for (var i in api) {
                if (typeof api[i] === 'string') {
                    api[i] = api[i].replace('{$_api_root}', siteroot);
                } else {
                    api[i] = getNewApiUri(api[i]);
                }
            }
            return api;
        }

        this.api = getNewApiUri(this.api);
        var _index_api_url = this.api.default.index;
        var _web_root = _index_api_url.substr(0, _index_api_url.indexOf('/index.php'));
        this.webRoot = _web_root;
    },
    webRoot: null,
    siteInfo: require('siteinfo.js'),
    currentPage: null,
    pageOnLoad: function (page) {
        this.currentPage = page;
        console.log('--------pageOnLoad----------');
        if (typeof  page.openWxapp === 'undefined') {
            page.openWxapp = this.openWxapp;
        }
        if (typeof  page.showToast === 'undefined') {
            page.showToast = this.pageShowToast;
        }
        this.setNavigationBarColor();
        this.setPageNavbar(page);
        var app = this;
        this.currentPage.naveClick = function(e){
            var page = this;
            app.navigatorClick(e,page);
        }
    },
    pageOnReady: function (page) {
        console.log('--------pageOnReady----------');

    },
    pageOnShow: function (page) {
        console.log('--------pageOnShow----------');

    },
    pageOnHide: function (page) {
        console.log('--------pageOnHide----------');

    },
    pageOnUnload: function (page) {
        console.log('--------pageOnUnload----------');

    },

    setPageNavbar: function (page) {
        console.log('----setPageNavbar----');
        console.log(page);
        var navbar = wx.getStorageSync('_navbar');

        if (navbar) {
            setNavbar(navbar);
        }
        this.request({
            url: api.default.navbar,
            success: function (res) {
                if (res.code == 0) {
                    setNavbar(res.data);
                    wx.setStorageSync('_navbar', res.data);
                }
            }
        });

        function setNavbar(navbar) {
            var in_navs = false;
            var route = page.route || (page.__route__ || null);
            for (var i in navbar.navs) {
                if (navbar.navs[i].url === "/" + route) {
                    navbar.navs[i].active = true;
                    in_navs = true;
                } else {
                    navbar.navs[i].active = false;
                }
            }
            if (!in_navs)
                return;
            page.setData({_navbar: navbar});
        }

    },

    getNavigationBarColor: function () {
        var app = this;
        app.request({
            url: api.default.navigation_bar_color,
            success: function (res) {
                if (res.code == 0) {
                    wx.setStorageSync('_navigation_bar_color', res.data);
                    app.setNavigationBarColor();
                }
            }
        });
    },

    setNavigationBarColor: function () {
        var navigation_bar_color = wx.getStorageSync('_navigation_bar_color');
        if (navigation_bar_color) {
            wx.setNavigationBarColor(navigation_bar_color);
        }
    },

    //登录成功后不刷新的页面
    loginNoRefreshPage: [
        'pages/index/index',
        //'pages/fxhb/open/open',
        //'pages/fxhb/detail/detail',
    ],

    openWxapp: function (e) {
        console.log('--openWxapp---');
        if (!e.currentTarget.dataset.url)
            return;
        var url = e.currentTarget.dataset.url;
        url = parseQueryString(url);
        url.path = url.path ? decodeURIComponent(url.path) : "";
        console.log("Open New App");
        console.log(url);
        wx.navigateToMiniProgram({
            appId: url.appId,
            path: url.path,
            complete: function (e) {
                console.log(e);
            }
        });

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

    pageShowToast: function (e) {
        console.log('--- pageToast ---');
        var page = this.currentPage;
        var duration = e.duration || 2500;
        var title = e.title || '';
        var success = e.success || null;
        var fail = e.fail || null;
        var complete = e.complete || null;
        if (page._toast_timer) {
            clearTimeout(page._toast_timer);
        }
        page.setData({
            _toast: {
                title: title,
            },
        });
        page._toast_timer = setTimeout(function () {
            var _toast = page.data._toast;
            _toast.hide = true;
            page.setData({
                _toast: _toast,
            });
            if (typeof complete == 'function') {
                complete();
            }
        }, duration);
    },

    navigatorClick: function (e,page) {
        var open_type = e.currentTarget.dataset.open_type;
        if(open_type == 'redirect'){
            return true;
        }
        if (open_type == 'wxapp') {
            var path = e.currentTarget.dataset.path;
            var str = path.substr(0,1);
            if(str != '/'){
                path = '/' + path;
            }
            wx.navigateToMiniProgram({
                appId: e.currentTarget.dataset.appid,
                path: path,
                complete: function (e) {
                    console.log(e);
                }
            });
        }
        if(open_type == 'tel'){
            var contact_tel = e.currentTarget.dataset.tel;
            wx.makePhoneCall({
                phoneNumber: contact_tel
            })
        }
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

});