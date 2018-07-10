// cart.js
var api = require('../../api.js');
var app = getApp();
Page({

    /**
     * 页面的初始数据
     */ 
    data: {
        total_price: 0.00,
        cart_check_all: false,
        cart_list: [],
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        app.pageOnLoad(this);
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
        page.setData({
            cart_check_all: false,
            show_cart_edit: false,
        });
        page.getCartList();
    },

    getCartList: function () {
        var page = this;
        //wx.showNavigationBarLoading();
        page.setData({
            show_no_data_tip: false,
        });
        app.request({
            url: api.cart.list,
            success: function (res) {
                if (res.code == 0) {
                    page.setData({
                        cart_list: res.data.list,
                        total_price: 0.00,
                        cart_check_all: false,
                        show_cart_edit: false,
                    });
                }
                page.setData({
                    show_no_data_tip: (page.data.cart_list.length == 0),
                });
                //wx.hideNavigationBarLoading();
                //wx.stopPullDownRefresh();
            }
        });
    },

    //购物车减少
    cartLess: function(index){
        var page = this;
        var cart_list = page.data.cart_list;
        for(var i in cart_list){
            if(index.currentTarget.id == cart_list[i]['cart_id']){
                 cart_list[i]['num'] = page.data.cart_list[i]['num']-1;
                 cart_list[i]['price'] =page.data.cart_list[i]['unitPrice'] * cart_list[i]['num'];
                 page.setData({
                     cart_list:cart_list,
                 });
                 page.updateTotalPrice();
            }
        };
    },
    //购物车添加
    cartAdd: function(index){
        var page = this;
        var cart_list = page.data.cart_list;
        for(var i in cart_list){
            if(index.currentTarget.id == cart_list[i]['cart_id']){
                cart_list[i]['num'] = page.data.cart_list[i]['num'] + 1;
                cart_list[i]['price'] =page.data.cart_list[i]['unitPrice'] * cart_list[i]['num'];

                page.setData({
                    cart_list:cart_list,
                });
                page.updateTotalPrice();
            }
        };
    },
    cartCheck: function (e) {
        var page = this;
        var index = e.currentTarget.dataset.index;
        var cart_list = page.data.cart_list;
        var num = 0;
        if (cart_list[index].checked) {
            cart_list[index].checked = false;
        } else {
            cart_list[index].checked = true;
        }

        for(var i in cart_list){
            if(cart_list[i].checked==true){
                num++;
            }
        }
        page.setData({
            cart_list: cart_list,
        });

        if(num == cart_list.length){
            page.setData({
                cart_check_all:true,
            });          
        }else{
            page.setData({
                cart_check_all:false,
            });      
        }
        page.updateTotalPrice();
    },

    cartCheckAll: function () {
        var page = this;
        var cart_list = page.data.cart_list;
        var checked = false;
        if (page.data.cart_check_all) {
            checked = false;
        } else {
            checked = true;
        }
        for (var i in cart_list) {
            if (!cart_list[i].disabled || page.data.show_cart_edit)
                cart_list[i].checked = checked;
        }
        page.setData({
            cart_check_all: checked,
            cart_list: cart_list,
        });
        page.updateTotalPrice();

    },

    updateTotalPrice: function () {
        var page = this;
        var total_price = 0.00;
        var cart_list = page.data.cart_list;
        for (var i in cart_list) {
            if (cart_list[i].checked)
                total_price += cart_list[i].price;
        }
        page.setData({
          total_price: total_price.toFixed(2),
        });
    },

    /**
     * 提交
     * 
     */
    cartSubmit: function () {
        var page = this;
        var submit = 0;
        var cart = JSON.stringify(page.data.cart_list);
        if(cart == []){
            return;
        }
        app.request({
            url: api.cart.cart_edit,
            method: 'post',
            data: {
                list: cart,
            },
            success: function (res) {
              if (res.code == 0) {


                    var cart_list = page.data.cart_list;                
                    var cart_id_list = [];
                    for (var i in cart_list) {
                        if (cart_list[i].checked)
                            cart_id_list.push(cart_list[i].cart_id);
                    }
                    if (cart_id_list.length == 0) {
                        return true;
                    }
                    wx.navigateTo({
                        url: '/pages/order-submit/order-submit?cart_id_list=' + JSON.stringify(cart_id_list),
                    });

                }
            }
        }); 


    },

    cartEdit: function () {
        var page = this;
        var cart_list = page.data.cart_list;
        for (var i in cart_list) {
            cart_list[i].checked = false;
        }
        page.setData({
            cart_list: cart_list,
            show_cart_edit: true,
            cart_check_all: false,
        });
        page.updateTotalPrice();
    },

    cartDone: function () {
        var page = this;
        var cart_list = page.data.cart_list;
        for (var i in cart_list) {
            cart_list[i].checked = false;
        }
        page.setData({
            cart_list: cart_list,
            show_cart_edit: false,
            cart_check_all: false,
        });
        page.updateTotalPrice();
    },

    cartDelete: function () {
        var page = this;
        var cart_list = page.data.cart_list;
        var cart_id_list = [];
        for (var i in cart_list) {
            if (cart_list[i].checked)
                cart_id_list.push(cart_list[i].cart_id);
        }
        if (cart_id_list.length == 0) {
            return true;
        }
        wx.showModal({
            title: "提示",
            content: "确认删除" + cart_id_list.length + "项内容？",
            success: function (res) {
                if (res.cancel)
                    return true;
                wx.showLoading({
                    title: "正在删除",
                    mask: true,
                });
                app.request({
                    url: api.cart.delete,
                    data: {
                        cart_id_list: JSON.stringify(cart_id_list),
                    },
                    success: function (res) {
                        wx.hideLoading();
                        wx.showToast({
                            title: res.msg,
                        });
                        if (res.code == 0) {
                            //page.cartDone();
                            page.getCartList();
                        }
                        if (res.code == 1) {
                        }
                    }
                });
            }
        });
    },   
     onHide: function () {
        var page = this;
        var cart = JSON.stringify(page.data.cart_list);
        if(cart == []){
            return;
        }
        app.request({
            url: api.cart.cart_edit,
            method: 'post',
            data: {
                  list: cart,
            },
            success: function (res) {
             if (res.code == 0) {
                console.log(res.msg);
                }
            }
        }); 
    },
    onUnload: function () {
        var page = this;
        var cart = JSON.stringify(page.data.cart_list);
        if(cart == [])
            return;
        app.request({
            url: api.cart.cart_edit,
            method: 'post',
            data: {
                list: cart,
            },
            success: function (res) {
             if (res.code == 0) {
                console.log(res.msg);
                }
            }
        }); 
    },

});