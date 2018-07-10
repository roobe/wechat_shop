// pages/address-edit/address-edit.js
var api = require('../../api.js');
var area_picker = require('../../area-picker/area-picker.js');
var app = getApp();
Page({
    data: {
        name: "",
        mobile: "",
        detail: "",
        district: null,
    },
    onLoad: function (options) {
        app.pageOnLoad(this);
        var page = this;
        page.getDistrictData(function (data) {
            area_picker.init({
                page: page,
                data: data,
            });
        });

        page.setData({
            address_id: options.id,
        });
        if (options.id) {
            wx.showLoading({
                title: "正在加载",
                mask: true,
            });
            app.request({
                url: api.user.address_detail,
                data: {
                    id: options.id,
                },
                success: function (res) {
                    wx.hideLoading();
                    if (res.code == 0) {
                        page.setData(res.data);
                    }
                }
            });
        }
    },

    getDistrictData: function (cb) {
        var district = wx.getStorageSync("district");
        if (!district) {
            wx.showLoading({
                title: "正在加载",
                mask: true,
            });
            app.request({
                url: api.default.district,
                success: function (res) {
                    wx.hideLoading();
                    if (res.code == 0) {
                        district = res.data;
                        wx.setStorageSync("district", district);
                        cb(district);
                    }
                }
            });
            return;
        }
        cb(district);
    },

    onAreaPickerConfirm: function (e) {
        //console.log(e);
        var page = this;
        page.setData({
            district: {
                province: {
                    id: e[0].id,
                    name: e[0].name,
                },
                city: {
                    id: e[1].id,
                    name: e[1].name,
                },
                district: {
                    id: e[2].id,
                    name: e[2].name,
                },
            }
        });
    },

    saveAddress: function () {
        var page = this;
        var myreg = /^([0-9]{6,12})$/;
        var myreg2 = /^(\d{3,4}-\d{6,9})$/;
        console.log(myreg2.test(page.data.mobile));
        if (!myreg.test(page.data.mobile) && !myreg2.test(page.data.mobile)) {
            wx.showToast({
                title: "联系电话格式不正确",
                image: "/images/icon-warning.png",
            });
            return false;
        }
        wx.showLoading({
            title: "正在保存",
            mask: true,
        });
        var district = page.data.district;
        if (!district) {
            district = {
                province: {
                    id: ""
                },
                city: {
                    id: ""
                },
                district: {
                    id: ""
                }
            };
        }
        app.request({
            url: api.user.address_save,
            method: "post",
            data: {
                address_id: page.data.address_id || "",
                name: page.data.name,
                mobile: page.data.mobile,
                province_id: district.province.id,
                city_id: district.city.id,
                district_id: district.district.id,
                detail: page.data.detail,
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
                                wx.navigateBack();
                            }
                        }
                    });
                }
                if (res.code == 1) {
                    wx.showToast({
                        title: res.msg,
                        image: "/images/icon-warning.png",
                    });
                }
            }
        });
    },

    inputBlur: function (e) {
        //console.log(JSON.stringify(e));
        var name = e.currentTarget.dataset.name;
        var value = e.detail.value;
        //var data = '{"form":{"' + name + '":"' + value + '"}}';
        var data = '{"' + name + '":"' + value + '"}';
        this.setData(JSON.parse(data));
    },

    getWechatAddress: function (e) {
        var page = this;
        wx.chooseAddress({
            success: function (e) {
                if (e.errMsg != 'chooseAddress:ok')
                    return;
                wx.showLoading();
                app.request({
                    url: api.user.wechat_district,
                    data: {
                        national_code: e.nationalCode,
                        province_name: e.provinceName,
                        city_name: e.cityName,
                        county_name: e.countyName,
                    },
                    success: function (res) {
                        if (res.code == 1) {
                            wx.showModal({
                                title: '提示',
                                content: res.msg,
                                showCancel: false,
                            });
                        }
                        page.setData({
                            name: e.userName || "",
                            mobile: e.telNumber || "",
                            detail: e.detailInfo || "",
                            district: res.data.district,
                        });
                    },
                    complete: function () {
                        wx.hideLoading();
                    }
                });
            }
        });
    },

    onReady: function () {

    },
    onShow: function () {

    },
});