// pages/cat/cat.js
var api = require('../../../api.js');
var app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    quick_list: [],
    goods_list:[],
    carGoods:[],
    showModal: false,
    checked: false,
    cat_checked:false,
    color:'',
    total: {
      total_price: 0.00,
      total_num:0
    }
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
    app.request({
      url: api.quick.quick,
      success: function (res) {
        if (res.code == 0) {
          var quick_goods_list = page.data.quick_list;
          if (quick_goods_list.length == 0){

            var quick_lists = [];
            var quick_list = res.data.list;
            var quick_list_length = quick_list.length;
            for (var a = 0; a < quick_list_length; a++) {
              var quick_goods = quick_list[a]['goods'];
              var quick_goods_length = quick_goods.length;
              if (quick_goods_length != 0) {
                quick_lists.push(quick_list[a])
              }
            }
            var quick_lists_length = quick_lists.length;
            var quick_hot_goods = [];
            for (var i = 0; i < quick_lists_length;i++){
                quick_hot_goods.push(quick_lists[i]['goods']);
            }
            var quick_hot_goods_list = [].concat.apply([], quick_hot_goods);
            var quick_hot_goods_list_length = quick_hot_goods_list.length;
            var quick_hot_goods_lists = [];
            for (var x = 0; x < quick_hot_goods_list_length; x++) {
                if (quick_hot_goods_list[x]['hot_cakes'] == 1){
                    quick_hot_goods_lists.push(quick_hot_goods_list[x])
                }
            }
            for (var i = 0; i < quick_hot_goods_lists.length; i++) {
                for (var j = i + 1; j < quick_hot_goods_lists.length;) {
                    if (quick_hot_goods_lists[i].id == quick_hot_goods_lists[j].id) {//通过id属性进行匹配；
                        quick_hot_goods_lists.splice(j, 1);//去除重复的对象；
                    } else {
                        j++;
                    }
                }
            }
            
            page.setData({
              quick_list: quick_lists,
              quick_hot_goods_lists: quick_hot_goods_lists
            });
          }else{
            var quick_lists = wx.getStorageSync('quick_lists')
            var carGoods = wx.getStorageSync('carGoods')
            var total = wx.getStorageSync('total')
            var check_num = wx.getStorageSync('check_num')
            var quick_hot_goods_lists = wx.getStorageSync('quick_hot_goods_lists')
            if (quick_lists){
              page.setData({
                quick_list: quick_lists,
              });
              wx.removeStorageSync('quick_lists')
            }
            if (carGoods) {
              page.setData({
                carGoods: carGoods,
              });
              wx.removeStorageSync('carGoods')
            }
            if (total) {
              page.setData({
                total: total,
              });
              wx.removeStorageSync('total')
            }
            if (check_num) {
              page.setData({
                check_num: check_num,
              });
              wx.removeStorageSync('check_num')
            }
            if (quick_hot_goods_lists) {
                page.setData({
                    quick_hot_goods_lists: quick_hot_goods_lists,
                });
                wx.removeStorageSync('quick_hot_goods_lists')
            }
          }
        }
      }
    });
  },
  // 商品详情
  // get_goods_info:function(e){
  //   var page = this;
  //   var carGoods = page.data.carGoods;
  //   var length = carGoods.length;
  //   var cart_list = [];
  //   var cart_list_goods = [];
  //   for (var a = 0; a < length; a++) {
  //     if (carGoods[a].num != 0) {
  //       cart_list_goods = {
  //         'num': carGoods[a].num,
  //         'goods_name': carGoods[a].goods_name,
  //         'goods_price': carGoods[a].goods_price,
  //         'attr': carGoods[a].attr
  //       }
  //       cart_list.push(cart_list_goods)
  //     }
  //   }
  //   var total = page.data.total;
  //   var quick_list = page.data.quick_list;
  //   wx.setStorageSync("total", total);
  //   wx.setStorageSync("cart_list", cart_list);
  //   wx.setStorageSync("quick_list", quick_list);


  //   var data = e.currentTarget.dataset;
  //   var goods_id = data.id;
  //   wx.navigateTo({
  //     url: '/pages/quick-purchase/goods-info/goods?id='+goods_id
  //   })
  // },

// 商品定位
selectMenu: function (event) {
  var data = event.currentTarget.dataset
  var quick_list = this.data.quick_list;
  if (data.tag == 'hot_cakes'){
    var cat_checked = true;
    var quick_list_length = quick_list.length;
    for (var a = 0; a < quick_list_length; a++) {
      quick_list[a]['cat_checked'] = false;
    }
  }else{
    var index = data.index;
    var quick_list_length = quick_list.length;
    for (var a = 0; a < quick_list_length; a++) {
      quick_list[a]['cat_checked'] = false;
      if (quick_list[a]['id'] == quick_list[index]['id']) {
        quick_list[a]['cat_checked'] = true;
      }
    }
    cat_checked = false;
  }
  this.setData({
    toView: data.tag,
    selectedMenuId: data.id,
    quick_list: quick_list,
    cat_checked: cat_checked
  })
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
        }
    };
},
  // +购物车
jia: function (e) {
  var page = this;
  // 选中商品+1
  var data = e.currentTarget.dataset;
  var quick_list = page.data.quick_list;
  var length = quick_list.length;
  var goods_all = [];
  for (var i = 0; i < length; i++) {
    var goods_cat_all = quick_list[i]['goods'];
    var goods_length = goods_cat_all.length;
    for (var a = 0; a < goods_length; a++) {
      goods_all.push(goods_cat_all[a])
    }
  }
  var goods_all_length = goods_all.length;
  var goods = [];
  for (var x = 0; x < goods_all_length; x++) {
    if (goods_all[x]['id'] == data.id){
      goods.push(goods_all[x]);
    }
  }
  var goods_length = goods.length;
  for (var b = 0; b < goods_length; b++) {
    goods[b].num += 1;
  }  

  var goods_price = parseFloat(goods[0].price * goods[0].num);
  var carGoods = page.data.carGoods;
  var good = {
    'goods_id': goods[0].id,
    'num': 1,
    'goods_name': goods[0].name,
    'attr': '',
    'goods_price': (goods_price).toFixed(2),
    'price': goods[0].price,
  };
  var length = carGoods.length;
  var flag = true;
  if (length <= 0) {
    carGoods.push(good)
  } else {
    for (var a = 0; a < length; a++) {
      if (carGoods[a]['goods_id'] == goods[0].id) {
        carGoods[a]['num'] += 1;
        carGoods[a]['goods_price'] = goods_price.toFixed(2);
        flag = false;
      }
    }
    if (flag) {
      carGoods.push(good)
    }
  }
  // 购物车判断
  var car_goods = carGoods.find(function (v) {
    return v.goods_id == data.id
  })
  var goods_num = JSON.parse(goods[0].attr);
  if (car_goods['num'] > goods_num['0'].num){
    wx.showToast({
      title: "商品库存不足",
      image: "/images/icon-warning.png",
    });
    car_goods['num'] = goods_num['0'].num;
    for (var z = 0; z < goods_length; z++) {
      goods[z].num -= 1;
    } 
    return
  }
  // 购物车总量
  var total = page.data.total;
  total.total_num += 1;
  goods[0].price = parseFloat(goods[0].price);
  total.total_price = parseFloat(total.total_price);
  total.total_price += goods[0].price;
  total.total_price = total.total_price.toFixed(2);

  var quick_hot_goods_lists = page.data.quick_hot_goods_lists;
  var quick_hot_goods = quick_hot_goods_lists.find(function (v) {
      return v.id == data.id
  })
  if (quick_hot_goods){
      quick_hot_goods.num += 1;
  }
  page.setData({
    quick_list: quick_list,
    total: total,
    carGoods: carGoods,
    quick_hot_goods_lists: quick_hot_goods_lists
  }); 
},
  // -购物车
jian: function (e) {
  var page = this;
  var data = e.currentTarget.dataset;
  var quick_list = page.data.quick_list;

  var length = quick_list.length;
  var goods_all = [];
  for (var i = 0; i < length; i++) {
    var goods_cat_all = quick_list[i]['goods'];
    var goods_length = goods_cat_all.length;
    for (var a = 0; a < goods_length; a++) {
      goods_all.push(goods_cat_all[a])
    }
  }
  var goods_all_length = goods_all.length;
  var goods = [];
  for (var x = 0; x < goods_all_length; x++) {
    if (goods_all[x]['id'] == data.id) {
      goods.push(goods_all[x]);
    }
  }
  var goods_length = goods.length;
  for (var b = 0; b < goods_length; b++) {
    goods[b].num -= 1;
  }
  var total = page.data.total;
  total.total_num -= 1;
  goods[0].price = parseFloat(goods[0].price)
  total.total_price = parseFloat(total.total_price)
  total.total_price -= goods[0].price;
  total.total_price = total.total_price.toFixed(2)

  var quick_hot_goods_lists = page.data.quick_hot_goods_lists;
  var quick_hot_goods = quick_hot_goods_lists.find(function (v) {
      return v.id == data.id
  })
  if (quick_hot_goods){
      quick_hot_goods.num -= 1;
  }

  page.setData({
    'quick_list': quick_list,
    'total': total,
    'quick_hot_goods_lists': quick_hot_goods_lists
  })
  var carGoods = page.data.carGoods;
  var car_goods = carGoods.find(function (v) {
    return v.goods_id == data.id
  }) 
  car_goods.num -= 1;
  car_goods.goods_price = parseFloat(car_goods.goods_price)
  car_goods.goods_price -= goods[0].price;
  car_goods.goods_price = car_goods.goods_price.toFixed(2)
  page.setData({
    carGoods: carGoods
  }); 
},
  //选规格
  showDialogBtn: function (e) {
    var page = this;
    var goods_id = e.currentTarget.dataset.id;
    var data = e.currentTarget.dataset;
    app.request({
      url: api.default.goods,
      data: {
        id: goods_id
      },
      success: function (res) {
        if (res.code == 0) {
          page.setData({
            data:data,
            attr_group_list: res.data.attr_group_list,
            showModal: true
          });
        }
      }
    });

    if (data.cid){
        var quick_list = page.data.quick_list;
        var quick = quick_list.find(function (v) {
            return v.id == data.cid
        })
        var goods = quick.goods.find(function (v) {
            return v.id == data.id
        })
    }else{
        var quick_hot_goods_lists = page.data.quick_hot_goods_lists;
        var goods = quick_hot_goods_lists.find(function (v) {
            return v.id == data.id
        })
    }

    var attr = JSON.parse(goods.attr);
    var length = attr.length;
    for (var a = 0; a < length; a++) {
      attr[a]['check_num'] = 0;
    }
    page.setData({
      goods:goods,
      goods_name:goods.name,
      attr:attr
    });
    var car_goods = page.data.carGoods;
    var car_goods_length = car_goods.length;
    if (car_goods_length >= 1){
      for (var a = 0; a < car_goods_length; a++) {
        if (JSON.stringify(goods.name) != JSON.stringify(car_goods[a]['goods_name'])){
          page.setData({
            check_num: false,
            check_goods_price : false
          });
        }
      }
    }
  },
  close: function (e){
    this.setData({
      showModal: false,
    });
  },

  // 选择规格
  attrClick: function (e) {
    var page = this;
    var attr_group_id = e.target.dataset.groupId;
    var attr_id = e.target.dataset.id; 
    var attr_group_list = page.data.attr_group_list;
    for (var i in attr_group_list) {
      if (attr_group_list[i].attr_group_id != attr_group_id)
        continue;
      for (var j in attr_group_list[i].attr_list) {
        if (attr_group_list[i].attr_list[j].attr_id == attr_id) {
          attr_group_list[i].attr_list[j].checked = true;
        } else {
          attr_group_list[i].attr_list[j].checked = false;
        }
      }
    }
    var attr_group_list_length = attr_group_list.length;
    var check_attr_list = [];
    var check_attr_lists = [];
    for (var a = 0; a < attr_group_list_length; a++) {
      var attr_group_list_check = attr_group_list[a]['attr_list'];
      var attr_group_list_check_length = attr_group_list_check.length;
      for (var i = 0; i < attr_group_list_check_length; i++) {
        if (attr_group_list_check[i]['checked'] == true){
          var attrs = {
            'attr_group_id': attr_group_list[a]['attr_group_id'],
            'attr_group_name': attr_group_list[a]['attr_group_name'],
            'attr_id': attr_group_list_check[i]['attr_id'],
            'attr_name': attr_group_list_check[i]['attr_name']
          }
          check_attr_lists.push(attrs)
          var attrs_list = {
            'attr_id': attr_group_list_check[i]['attr_id'],
            'attr_name': attr_group_list_check[i]['attr_name']
          }
          check_attr_list.push(attrs_list)
        }
      }
    }
    var attr = page.data.attr;
    var attr_length = attr.length;
    for (var x = 0; x < attr_length; x++) {
      if (JSON.stringify(attr[x]['attr_list']) == JSON.stringify(check_attr_list)){
        var check_goods_price = attr[x]['price'];
      }
    }
    page.setData({
      attr_group_list: attr_group_list,
      check_goods_price: check_goods_price,
      check_attr_list:check_attr_list
    });

    var carGoods = page.data.carGoods;
    var length = page.data.carGoods.length;


    var goods = page.data.goods;
    var check_num = 0;
    for (var a = 0; a < length; a++) {
      if (carGoods[a]['goods_id'] == goods.id && JSON.stringify(carGoods[a]['attr']) == JSON.stringify(check_attr_lists)) {
        check_num = carGoods[a].num;
        break;
      }
    }
    page.setData({
      check_num: check_num
    });
  },

 //规格加购物车
  onConfirm: function (e) {
    var page = this;
    var attr_group = page.data.attr_group;
    var attr_group_lists = page.data.attr_group_list;
    var checked_attr_list = [];
    for (var i in attr_group_lists) {
      var attr = false;
      for (var j in attr_group_lists[i].attr_list) {
        if (attr_group_lists[i].attr_list[j].checked) {
          attr = {
            attr_id: attr_group_lists[i].attr_list[j].attr_id,
            attr_name: attr_group_lists[i].attr_list[j].attr_name,
          };
          break;
        }
      }
      if (!attr) {
        wx.showToast({
          title: "请选择" + attr_group_lists[i].attr_group_name,
          image: "/images/icon-warning.png",
        });
        return true;
      } else {
        checked_attr_list.push({
          attr_group_id: attr_group_lists[i].attr_group_id,
          attr_group_name: attr_group_lists[i].attr_group_name,
          attr_id: attr.attr_id,
          attr_name: attr.attr_name,
      });
      }
    } 
    page.setData({
      attr_group_list: attr_group_lists
    });
    var attr = page.data.attr;
    var check_attr_list = page.data.check_attr_list;
    var attr_length = attr.length;
    for (var x = 0; x < attr_length; x++) {
      if (JSON.stringify(attr[x]['attr_list']) == JSON.stringify(check_attr_list)) {
        var check_goods_num = attr[x]['num'];
      }
    }

    // 数量+
    var data = page.data.data;
    var quick_list = page.data.quick_list;
    var length = quick_list.length;
    var goods_all = [];
    for (var i = 0; i < length; i++) {
      var goods_cat_all = quick_list[i]['goods'];
      var goods_length = goods_cat_all.length;
      for (var a = 0; a < goods_length; a++) {
        goods_all.push(goods_cat_all[a])
      }
    }
    var goods_all_length = goods_all.length;
    var quickgoods = [];
    for (var x = 0; x < goods_all_length; x++) {
      if (goods_all[x]['id'] == data.id) {
        quickgoods.push(goods_all[x]);
      }
    }
    page.setData({
      checked_attr_list: checked_attr_list,
    });

    var attr_length = checked_attr_list.length;
    var attr_id = [];
    for (var a = 0; a < attr_length; a++) {
      attr_id.push(checked_attr_list[a]['attr_id']);
    }

    var carGoods = page.data.carGoods;
    var check_goods_price = page.data.check_goods_price;
    
    if (check_goods_price == 0){
      var monery = parseFloat(quickgoods[0].price);
    }else{
      var monery = parseFloat(check_goods_price);
    }
    var good = {
      'goods_id': quickgoods[0].id,
      'num': 1,
      'goods_name': quickgoods[0].name,
      'attr': checked_attr_list,
      'goods_price': monery,
      'price': monery,
    };
    var length = carGoods.length;
    var flag = true;
    var check_num = 0;
    if (length <= 0) {
      check_num = 1;
      carGoods.push(good)
    } else {
      for (var a = 0; a < length; a++) {
        if (carGoods[a]['goods_id'] == quickgoods[0].id && JSON.stringify(carGoods[a]['attr']) == JSON.stringify(checked_attr_list)) {
          carGoods[a]['num'] += 1;
          check_num = carGoods[a]['num'];
          flag = false;
        }
      }
      if (flag) {
        carGoods.push(good)
        check_num = 1;
      }
    }
    if (check_num > check_goods_num) {
      wx.showToast({
        title: "商品库存不足",
        image: "/images/icon-warning.png",
      });
      check_num = check_goods_num;
      for (var a = 0; a < length; a++) {
        if (carGoods[a]['goods_id'] == quickgoods[0].id && JSON.stringify(carGoods[a]['attr']) == JSON.stringify(checked_attr_list)) {
          carGoods[a]['num'] = check_goods_num;
        }
      }
      return
    }
    for (var a = 0; a < length; a++) {
      if (carGoods[a]['goods_id'] == quickgoods[0].id && JSON.stringify(carGoods[a]['attr']) == JSON.stringify(checked_attr_list)) {
        carGoods[a]['goods_price'] = parseFloat(carGoods[a]['goods_price']);
        carGoods[a]['goods_price'] += monery;
        carGoods[a]['goods_price'] = carGoods[a]['goods_price'].toFixed(2)
      }
    }
    
    var goods_length = quickgoods.length;
    for (var b = 0; b < goods_length; b++) {
      quickgoods[b].num += 1;
    }
    var total = page.data.total;
    total.total_num += 1;

    total.total_price = parseFloat(total.total_price)
    total.total_price += monery;
    total.total_price = total.total_price.toFixed(2)

    var quick_hot_goods_lists = page.data.quick_hot_goods_lists;
    var quick_hot_goods = quick_hot_goods_lists.find(function (v) {
        return v.id == data.id
    })
    if (quick_hot_goods){
        quick_hot_goods.num += 1;
    }

    page.setData({
        quick_hot_goods_lists: quick_hot_goods_lists,
        quick_list: quick_list,
        carGoods: carGoods,
        total:total,
        check_num: check_num
    });
  },
  /**
   * 弹出框蒙层截断touchmove事件
   */
  preventTouchMove: function () {
  },
  /**
   * 隐藏模态对话框
   */
  hideModal: function () {
    this.setData({
      showModal: false
    });
  },

  guigejian:function(e){
    var page = this;
    var data = page.data.data;
    var goods = page.data.goods;
    var goods_id = goods.id;
    var quick_list = page.data.quick_list;
    var length = quick_list.length;
    var goods_list = [];
    for (var i = 0; i < length; i++) {
      var quickgoods = quick_list[i]['goods'];
      var length2 = quickgoods.length;
      for (var a = 0; a < length2; a++) {
        goods_list.push(quickgoods[a])
      }
    }
    var goods_list_length = goods_list.length;
    var check_goods = [];
    for (var b = 0; b < goods_list_length; b++) {
      if (goods.id == goods_list[b].id){
        check_goods.push(goods_list[b])
      }
    }
    var check_goods_length = check_goods.length;
    for (var x = 0; x < check_goods_length; x++) {
      check_goods[x].num -= 1;
    }

    var quick_hot_goods_lists = page.data.quick_hot_goods_lists;
    var quick_hot_goods = quick_hot_goods_lists.find(function (v) {
        return v.id == data.id
    })
    if (quick_hot_goods){
        quick_hot_goods.num -= 1;
    }

    page.setData({
        'quick_hot_goods_lists': quick_hot_goods_lists,
        'quick_list': quick_list
    })
    var attr_group_lists = page.data.attr_group_list;
    var checked_attr_list = [];
    for (var i in attr_group_lists) {
      var attr = false;
      for (var j in attr_group_lists[i].attr_list) {
        if (attr_group_lists[i].attr_list[j].checked) {
          attr = {
            attr_id: attr_group_lists[i].attr_list[j].attr_id,
            attr_name: attr_group_lists[i].attr_list[j].attr_name,
          };
          break;
        }
      }
      if (!attr) {
        wx.showToast({
          title: "请选择" + attr_group_lists[i].attr_group_name,
          image: "/images/icon-warning.png",
        });
        return true;
      } else {
        checked_attr_list.push({
          attr_group_id: attr_group_lists[i].attr_group_id,
          attr_group_name: attr_group_lists[i].attr_group_name,
          attr_id: attr.attr_id,
          attr_name: attr.attr_name,
        });
      }
    } 
    var check_num = page.data.check_num;
    var carGoods = page.data.carGoods;
    var length = carGoods.length;
    for (var a = 0; a < length; a++) {
      if (carGoods[a]['goods_id'] == goods_id && JSON.stringify(carGoods[a]['attr']) == JSON.stringify(checked_attr_list)) {
        carGoods[a]['num'] -= 1;
        check_num = carGoods[a]['num'];
      }
    }
    page.setData({
      'check_num': check_num
    })

    var total = page.data.total;
    total.total_num -= 1;
    var check_goods_price = page.data.check_goods_price;
    check_goods_price = parseFloat(check_goods_price);
    total.total_price = parseFloat(total.total_price);
    total.total_price -= check_goods_price;
    total.total_price = total.total_price.toFixed(2)
    page.setData({
      'total': total
    })
    if (total.total_num == 0) {
      page.setData({
        goodsModel: false
      });
    }
  },

  // 购物车弹窗
  goodsModel: function (e) {
    var page = this;
    var carGoods = page.data.carGoods;
    var goodsModel = page.data.goodsModel;
    if (!goodsModel){
      page.setData({
        goodsModel: true
      });
    }else{
      page.setData({
        goodsModel: false
      });
    }
 
  },

  hideGoodsModel: function () {
    this.setData({
      goodsModel: false
    });
  },
  tianjia: function (e) {
    var page = this;
    var data = e.currentTarget.dataset;
    var quick_list = page.data.quick_list;
    var length = quick_list.length;
    var quick_list_goods = [];
    for (var i = 0; i < length; i++) {
      var goods = quick_list[i]['goods'];
      var goods_length = goods.length;
      for (var a = 0; a < goods_length; a++) {
        quick_list_goods.push(goods[a])
      }
    }
    var quick_list_goods_length = quick_list_goods.length;
    var check_goods = [];
    for (var b = 0; b < quick_list_goods_length; b++) {
      if (quick_list_goods[b].id == data.id){
        check_goods.push(quick_list_goods[b])
      }
    }
    var goods_attr = JSON.parse(check_goods[0]['attr']);
    if (goods_attr.length == 1) {
      var carGoods_list = page.data.carGoods;
      var car_goods = carGoods_list.find(function (v) {
        return v.goods_id == data.id
      })
      car_goods['num'] += 1;
      if (car_goods.num > goods_attr[0]['num']) {
        wx.showToast({
          title: "商品库存不足",
          image: "/images/icon-warning.png",
        });
        car_goods['num'] -= 1;
        return
      }
      car_goods['goods_price'] = parseFloat(car_goods['goods_price'])
      data.price = parseFloat(data.price)
      car_goods['goods_price'] += data.price;
      car_goods['goods_price'] = car_goods['goods_price'].toFixed(2)
      var check_goods_length = check_goods.length;
      for (var x = 0; x < check_goods_length; x++) {
        check_goods[x].num += 1;
      }   
    }else {
      var check_goods_length = check_goods.length;
      for (var x = 0; x < check_goods_length; x++) {
        check_goods[x].num += 1;
      }
      var carGoods_list = page.data.carGoods;
      var carGoods_list_length = carGoods_list.length;
      var check_attr_list = [];
      for (var a = 0; a < carGoods_list_length; a++) {
        if (data.index == a) {
          var check_attr = carGoods_list[a]['attr'];
          var check_attr_length = check_attr.length;
          for (var i = 0; i < check_attr_length; i++) {
            var attrs_list = {
              'attr_id': check_attr[i]['attr_id'],
              'attr_name': check_attr[i]['attr_name']
            }
            check_attr_list.push(attrs_list)
          }      
        }
      }
      var attr_length = goods_attr.length;
      for (var i = 0; i < attr_length; i++) {
        if (JSON.stringify(goods_attr[i]['attr_list']) == JSON.stringify(check_attr_list)) {
          var check_goods_num = goods_attr[i]['num'];
        }
      }
      for (var a = 0; a < carGoods_list_length; a++) {
        if (data.index == a) {
          carGoods_list[a]['num'] += 1;
          carGoods_list[a]['goods_price'] = parseFloat(carGoods_list[a]['goods_price'])
          data.price = parseFloat(data.price)
          carGoods_list[a]['goods_price'] += data.price;
          carGoods_list[a]['goods_price'] = carGoods_list[a]['goods_price'].toFixed(2)

          if (carGoods_list[a]['num'] > check_goods_num){
            wx.showToast({
              title: "商品库存不足",
              image: "/images/icon-warning.png",
            });
            carGoods_list[a]['num'] -= 1;
            var check_goods_length = check_goods.length;
            for (var x = 0; x < check_goods_length; x++) {
              check_goods[x].num -= 1;
            } 
            carGoods_list[a]['goods_price'] -= data.price;
            carGoods_list[a]['goods_price'] = carGoods_list[a]['goods_price'].toFixed(2)
            return
          }
        }
      }
    }
    var total = page.data.total;
    total.total_num += 1;
    total.total_price = parseFloat(total.total_price)
    data.price = parseFloat(data.price)
    total.total_price += data.price;
    total.total_price = total.total_price.toFixed(2);

    var quick_hot_goods_lists = page.data.quick_hot_goods_lists;
    var quick_hot_goods = quick_hot_goods_lists.find(function (v) {
        return v.id == data.id
    })
    if (quick_hot_goods){
        quick_hot_goods.num += 1;
    }
    page.setData({
      'quick_list': quick_list,
      'carGoods': carGoods_list,
      'total': total,
      'quick_hot_goods_lists': quick_hot_goods_lists
    })
  },

  jianshao: function (e) {
    var page = this;
    var data = e.currentTarget.dataset;
    var carGoods = page.data.carGoods;
    var length = carGoods.length;
    for (var a = 0; a < length; a++) {
      if (data.index == a) {
        if (carGoods[a].num <= 0){
          return
        }
        carGoods[a].num -= 1;
        data.price = parseFloat(data.price)
        carGoods[a].goods_price = parseFloat(carGoods[a].goods_price)
        carGoods[a].goods_price -= data.price;
        carGoods[a].goods_price = carGoods[a].goods_price.toFixed(2);
      }
    }
    page.setData({
      'carGoods': carGoods
    })
    var quick_list = page.data.quick_list;
    var length = quick_list.length;
    var carGood = [];
    for (var i = 0; i < length; i++) {
      var good = quick_list[i]['goods'];
      var length2 = good.length;
      for (var a = 0; a < length2; a++) {
        carGood.push(good[a])
      }
    }
    var quick_list_car_goods = [];
    var carGood_length = carGood.length;
    for (var a = 0; a < carGood_length; a++) {
      if (data.id == carGood[a]['id']){
        quick_list_car_goods.push(carGood[a])
      }
    }
    var quick_list_car_goods_length = quick_list_car_goods.length;
    for (var b = 0; b < quick_list_car_goods_length; b++) {
      if (quick_list_car_goods[b].id == data.id){
        quick_list_car_goods[b].num -= 1;
      }
    }
    page.setData({
      'quick_list': quick_list
    })

    var total = page.data.total;
    total.total_num -= 1;
    total.total_price = parseFloat(total.total_price);
    total.total_price -= data.price;
    total.total_price = total.total_price.toFixed(2);

    var quick_hot_goods_lists = page.data.quick_hot_goods_lists;
    var quick_hot_goods = quick_hot_goods_lists.find(function (v) {
        return v.id == data.id
    })
    if (quick_hot_goods){
        quick_hot_goods.num -= 1;
    }
    page.setData({
        'total': total,
        'quick_hot_goods_lists': quick_hot_goods_lists
    })
    if (total.total_num == 0) {
      page.setData({
        goodsModel: false
      });
    }
  },
  // 清空购物车
  clearCar: function (e) {
    var page = this;
    var data = e.currentTarget.dataset;
    var quick_list = page.data.quick_list;    
    var length = quick_list.length;
    for (var i = 0; i < length; i++) {
      var goods = quick_list[i]['goods'];
      var length2 = goods.length;
      for (var a = 0; a < length2; a++) {
        goods[a]['num'] = 0;
      }
    }
    page.setData({
      'quick_list': quick_list
    })

    var carGoods = page.data.carGoods;
    var length = carGoods.length;
    for (var i = 0; i < length; i++) {
      carGoods[i]['num'] = 0;
      carGoods[i]['goods_price'] = 0;
      page.setData({
        'carGoods': carGoods
      });
    }

    var total = page.data.total;
    total.total_num = 0;
    total.total_price = 0;
    page.setData({
      'total': total
    });

    var quick_hot_goods_lists = page.data.quick_hot_goods_lists;
    var quick_hot_goods_lists_length = quick_hot_goods_lists.length;
    for (var x = 0; x < quick_hot_goods_lists_length; x++) {
        quick_hot_goods_lists[x]['num'] = 0;
        page.setData({
            'quick_hot_goods_lists': quick_hot_goods_lists
        });
    }

    var check_num = page.data.check_num;
    check_num = 0;
    page.setData({
      check_num: check_num,
      goodsModel: false
    });

  },


  buynow:function(e){
    var page = this;
    var carGoods = page.data.carGoods;
    var quick_list = page.data.quick_list;
    wx.setStorageSync("quick_list", quick_list)

    var carGoods = page.data.carGoods;
    wx.setStorageSync("carGoods", carGoods)

    var total = page.data.total;
    wx.setStorageSync("total", total)

    var check_num = page.data.check_num;
    wx.setStorageSync("check_num", check_num)

    var quick_hot_goods_lists = page.data.quick_hot_goods_lists;
    wx.setStorageSync("quick_hot_goods_lists", quick_hot_goods_lists)

    var goodsModel = page.data.goodsModel;
    page.setData({
      goodsModel: false
    });

    var length = carGoods.length;
    var cart_list = [];
    var cart_list_goods = [];
    for (var a = 0; a < length; a++) {
      if (carGoods[a].num != 0) {
        cart_list_goods = {
          'id': carGoods[a].goods_id,
          'num': carGoods[a].num,
          'attr': carGoods[a].attr
        }
        cart_list.push(cart_list_goods)
      }
    }
    wx.navigateTo({
      url: '/pages/order-submit/order-submit?cart_list=' + JSON.stringify(cart_list),
    });
  },
});