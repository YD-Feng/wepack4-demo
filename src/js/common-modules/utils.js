var loginUrl = {
    dev: '//sso.dev.51dinghuo.cc/login/',
    test: '//sso.51dinghuo.cc/login/',
    newTest: '//sso.newtest1.51dinghuo.cc/login/',
    perf: '//sso.perf.51dinghuo.cc/login/',
    production: '//sso.zskuaixiao.com/login'
};

var logoutUrl = {
    dev: '//sso.dev.51dinghuo.cc/api/logout',
    test: '//sso.51dinghuo.cc/api/logout',
    newTest: '//sso.newtest1.51dinghuo.cc/api/logout',
    perf: '//sso.perf.51dinghuo.cc/api/logout',
    production: '//athena.zskuaixiao.com/api/user/logout'
};

var accountHost = {
    dev: '//account.dev.51dinghuo.cc',
    test: '//account.51dinghuo.cc',
    newTest: '//account.newtest1.51dinghuo.cc',
    perf: '//account.perf.51dinghuo.cc',
    production: '//account.zskuaixiao.com'
};

/* 小程序管理地址 */
var wxManagerUrl = {
    dev: '//wx-manager.dev.51dinghuo.cc',
    test: '//wx-manager.51dinghuo.cc',
    newTest: '//wx-manager.newtest1.51dinghuo.cc',
    production: '//wx-manager.zskuaixiao.com'
};

var pickerOptShortcuts = [
    {
        text: '00:00:00',
        onClick: function (picker) {
            var date = picker.visibleDate ? picker.visibleDate : new Date().format(picker.dateFormat);
            picker.$emit('pick',  new Date(date + ' 00:00:00'));
        }
    },
    {
        text: '23:59:59',
        onClick: function (picker) {
            var date = picker.visibleDate ? picker.visibleDate : new Date().format(picker.dateFormat);
            picker.$emit('pick', new Date(date + ' 23:59:59'));
        }
    },
    {
        text: '10:00:00',
        onClick: function (picker) {
            var date = picker.visibleDate ? picker.visibleDate : new Date().format(picker.dateFormat);
            picker.$emit('pick',new Date(date + ' 10:00:00'));
        }
    },
    {
        text: '11:00:00',
        onClick: function (picker) {
            var date = picker.visibleDate ? picker.visibleDate : new Date().format(picker.dateFormat);
            picker.$emit('pick', new Date(date + ' 11:00:00'));
        }
    },
    {
        text: '12:00:00',
        onClick: function (picker) {
            var date = picker.visibleDate ? picker.visibleDate : new Date().format(picker.dateFormat);
            picker.$emit('pick', new Date(date + ' 12:00:00'));
        }
    },
    {
        text: '14:00:00',
        onClick: function (picker) {
            var date = picker.visibleDate ? picker.visibleDate : new Date().format(picker.dateFormat);
            picker.$emit('pick', new Date(date + ' 14:00:00'));
        }
    },
    {
        text: '17:00:00',
        onClick: function (picker) {
            var date = picker.visibleDate ? picker.visibleDate : new Date().format(picker.dateFormat);
            picker.$emit('pick', new Date(date + ' 17:00:00'));
        }
    }
];

//乘法
var accMul = function (arg1, arg2) {
    var m = 0, s1 = arg1.toString(), s2 = arg2.toString();
    try {
        m += s1.split('.')[1].length;
    } catch (e) {
    }
    try {
        m += s2.split('.')[1].length;
    } catch (e) {
    }
    return Number(s1.replace('.', '')) * Number(s2.replace('.', '')) / Math.pow(10, m);
};

// 除法
var accDiv = function (a, b) {
    var c, d, e = 0,
        f = 0;
    try {
        e = a.toString().split(".")[1].length;
    } catch (g) {}
    try {
        f = b.toString().split(".")[1].length;
    } catch (g) {}
    return c = Number(a.toString().replace(".", "")), d = Number(b.toString().replace(".", "")), accMul(c / d, Math.pow(10, f - e));
};

//加法
var accAdd = function (arg1, arg2) {
    var r1, r2, m;
    try {
        r1 = arg1.toString().split('.')[1].length;
    } catch (e) {
        r1 = 0
    }
    try {
        r2 = arg2.toString().split('.')[1].length;
    } catch (e) {
        r2 = 0;
    }
    m = Math.pow(10, Math.max(r1, r2));
    return (arg1 * m + arg2 * m) / m;
};

//减法
var accSub = function (arg1, arg2) {
    var r1, r2, m, n;
    try {
        r1 = arg1.toString().split('.')[1].length;
    } catch (e) {
        r1 = 0;
    }
    try {
        r2 = arg2.toString().split('.')[1].length;
    } catch (e) {
        r2 = 0;
    }
    m = Math.pow(10, Math.max(r1, r2));
    //动态控制精度长度
    n = (r1 >= r2) ? r1 : r2;
    return ((arg2 * m - arg1 * m) / m).toFixed(n);
};

//保留两位小数
var toDecimal2 = function (x) {
    var f = parseFloat(x);

    if (isNaN(f)) {
        return false;
    }

    f = Math.round(accMul(x,100)) / 100;

    var s = f.toString(),
        rs = s.indexOf('.');

    if (rs < 0) {
        rs = s.length;
        s += '.';
    }

    while (s.length <= rs + 2) {
        s += '0';
    }

    return s;
};

const deepClone = (source) => {
    const targetObj = source.constructor === Array ? [] : {}; // 判断复制的目标是数组还是对象
    for (let keys in source) { // 遍历目标
        if (source.hasOwnProperty(keys)) {
            if (source[keys] && typeof source[keys] === 'object') { // 如果值是对象，就递归一下
                targetObj[keys] = source[keys].constructor === Array ? [] : {};
                targetObj[keys] = deepClone(source[keys]);
            } else { // 如果不是，就直接赋值
                targetObj[keys] = source[keys];
            }
        }
    }
    return targetObj;
};

//金额数据格式化 10000 -> 10,000.00
const transMoney = (money) => {
    if (money && money != null) {
        money = money.toString();
        var left = money.split('.')[0],
            right= money.split('.')[1];

        right = right ? (right.length >= 2 ? '.' + right.substr(0, 2) : '.' + right + '0') : '.00';

        var temp = left.split('').reverse().join('').match(/(\d{1,3})/g);

        return (money * 1 < 0 ? '-' : '') + temp.join(',').split('').reverse().join('') + right;
    } else if (money === 0) {
        //注意 === 在这里的使用，如果传入的 money 为 0,if 中会将其判定为 boolean 类型，故而要另外做 === 判断
        return '0.00';
    } else {
        return '';
    }
};


var protocol = window.location.protocol;
loginUrl = protocol + loginUrl[process.env.NODE_ENV || 'test'];
logoutUrl = protocol + logoutUrl[process.env.NODE_ENV || 'test'];
accountHost = protocol + accountHost[process.env.NODE_ENV || 'test'];
wxManagerUrl = protocol + wxManagerUrl[process.env.NODE_ENV || 'test'];

export {
    loginUrl,
    logoutUrl,
    accountHost,
    wxManagerUrl,
    pickerOptShortcuts,
    accMul,
    accAdd,
    accSub,
    accDiv,
    toDecimal2,
    deepClone,
    transMoney
};
