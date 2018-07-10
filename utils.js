var utils = {
    scene_decode: function (scene) {
        var _str = scene + "";
        var _str_list = _str.split(",");
        var res = {};
        for (var i in _str_list) {
            var _tmp_str = _str_list[i];
            var _tmp_str_list = _tmp_str.split(":");
            if (_tmp_str_list.length > 0&&_tmp_str_list[0]) {
                res[_tmp_str_list[0]] = _tmp_str_list[1] || null;
            }
        }
        return res;
    }
};
module.exports = utils;