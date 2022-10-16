//毎回桁数を導きだすのは如何に？(負荷的に)

//#region regular functions
let escape = (str) => {
    return str.replace(/[^a-zA-Z0-9@*_+\-./]/g, (m) => {
        const code = m.charCodeAt(0)
        if (code <= 0xff) {
            return '%' + ('00' + code.toString(16)).slice(-2).toUpperCase()
        } else {
            return '%u' + ('0000' + code.toString(16)).slice(-4).toUpperCase()
        }
    })
}
let unescape = (str) => {
    let d = (st) => {
        let i = 0
        for (let j = 0; j < st.length; j++) {
            if (st[j] === '0') i++
            else break
        }
        return st.slice(i)
    }
    let s = (st, start, range) => {
        let s = ''
        for (let i = 0; i < range; i++) {
            s += st[start + i + 1]
        }
        return s
    }
    let res = ''
    for (let i = 0; i < str.length; i++) {
        if (/[a-zA-Z0-9@*_+\-./]/g.test(str[i])) {
            res += str[i]
        } else if (str[i] === '%') {
            if (str[i + 1] === 'u') {
                i += 5
                res += String.fromCharCode(Number.parseInt(d(s(str, i - 4, 4)), 16))
            } else {
                i += 2
                res += String.fromCharCode(Number.parseInt(d(s(str, i - 2, 2)), 16))
            }
        }
    }
    return res
}

localStorageGet = function (key) {
    try { return window.localStorage.getItem(key); } catch (exception) { }
}
localStorageSet = function (key, str) {
    try { window.localStorage.setItem(key, str); } catch (exception) { }
}
//#endregion

//#region game
let numFormats = {
    "long": [' thousand', ' million', ' billion', ' trillion', ' quadrillion', ' quintillion', ' sextillion', ' septillion', ' octillion', ' nonillion', ' decillion', ' undecillion', ' duodecillion', ' tredecillion', ' quattuordecillion', ' quindecillion', ' sexdecillion', ' septendecillion', ' octodecillion', ' novemdecillion', ' vigintillion', ' unvigintillion', ' duovigintillion', ' trevigintillion', ' quattuorvigintillion', ' quinvigintillion', ' sexvigintillion', ' septenvigintillion', ' octovigintillion', ' novemvigintillion', ' trigintillion', ' untrigintillion', ' duotrigintillion', ' tretrigintillion', ' quattuortrigintillion', ' quintrigintillion', ' sextrigintillion', ' septentrigintillion', ' octotrigintillion', ' novemtrigintillion', ' quadragintillion', ' unquadragintillion', ' duoquadragintillion', ' trequadragintillion', ' quattuorquadragintillion', ' quinquadragintillion', ' sexquadragintillion', ' septenquadragintillion', ' octoquadragintillion', ' novemquadragintillion', ' quinquagintillion', ' unquinquagintillion', ' duoquinquagintillion', ' trequinquagintillion', ' quattuorquinquagintillion', ' quinquinquagintillion', ' sexquinquagintillion', ' septenquinquagintillion', ' octoquinquagintillion', ' novemquinquagintillion', ' sexagintillion', ' unsexagintillion', ' duosexagintillion', ' tresexagintillion', ' quattuorsexagintillion', ' quinsexagintillion', ' sexsexagintillion', ' septensexagintillion', ' octosexagintillion', ' novemsexagintillion', ' septuagintillion', ' unseptuagintillion', ' duoseptuagintillion', ' treseptuagintillion', ' quattuorseptuagintillion', ' quinseptuagintillion', ' sexseptuagintillion', ' septenseptuagintillion', ' octoseptuagintillion', ' novemseptuagintillion', ' octogintillion', ' unoctogintillion', ' duooctogintillion', ' treoctogintillion', ' quattuoroctogintillion', ' quinoctogintillion', ' sexoctogintillion', ' septenoctogintillion', ' octooctogintillion', ' novemoctogintillion', ' nonagintillion', ' unnonagintillion', ' duononagintillion', ' trenonagintillion', ' quattuornonagintillion', ' quinnonagintillion', ' sexnonagintillion', ' septennonagintillion', ' octononagintillion', ' novemnonagintillion'],
    "short": ['k', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc', ' UnD', ' DoD', ' TrD', ' QaD', ' QiD', ' SxD', ' SpD', ' OcD', ' NoD', ' V', ' UnV', ' DoV', ' TrV', ' QaV', ' QiV', ' SxV', ' SpV', ' OcV', ' NoV', ' T', ' UnT', ' DoT', ' TrT', ' QaT', ' QiT', ' SxT', ' SpT', ' OcT', ' NoT', ' Qa', ' UnQa', ' DoQa', ' TrQa', ' QaQa', ' QiQa', ' SxQa', ' SpQa', ' OcQa', ' NoQa', ' Qi', ' UnQi', ' DoQi', ' TrQi', ' QaQi', ' QiQi', ' SxQi', ' SpQi', ' OcQi', ' NoQi', ' Sx', ' UnSx', ' DoSx', ' TrSx', ' QaSx', ' QiSx', ' SxSx', ' SpSx', ' OcSx', ' NoSx', ' Sp', ' UnSp', ' DoSp', ' TrSp', ' QaSp', ' QiSp', ' SxSp', ' SpSp', ' OcSp', ' NoSp', ' O', ' UnO', ' DoO', ' TrO', ' QaO', ' QiO', ' SxO', ' SpO', ' OcO', ' NoO', ' N', ' UnN', ' DoN', ' TrN', ' QaN', ' QiN', ' SxN', ' SpN', ' OcN', ' NoN']
}
let numFormatters = [] 
//フォーマッタはどんな実装にしようか悩み中
//日本語は４桁単位なのでフォーマッタを複数要るよな

let Langs = {
    'EN_US': { nameEN: 'English', name: 'English' },
    'JA_JP': { nameEN: 'Japanese', name: '日本語' }
} // lang/に配置されてる

//#region game usualy function
let toFixed = (x) => { //正確な値を文字列で返す。('1e+5' > "100000") 引数はstringに解釈される
    return Number(x).toFixed()
}

//桁に対応する単位を求める関数 ","の数を返す
// 1,000,000 = 2 (milion)
// 1,000,000,000 = 3 (milion)
//これによって単位を配列にしてアクセスできる
//Infinity、NaN、数値型以外は-1
let NumScale = (x) => {
    return Number.isFinite(x) ? ~~((toFixed(x).length + 1) / 3) : -1
}

let BeautifyNum = (value, scale) => { //未実装
    let v, s
    return { "v": v, "s": s }
    //数値、揃える桁を与えると、成形された数値と単位を返す
    //1,234,000 2 = {"1.000","million"}
}
//#endregion

let Game = {}
Game.SaveLoc = "SaveData"
Game.SaveIndex = {
    "basicInfo": 1,  //バージョン、言語など
    "prefs": 2,      //設定項目
    "game": 3,       //ゲームのデータ
    "products": 4,   //施設設備の情報
    "stats": 5       //実績
}
Game.Launch = () => {
    Game.diamonds
    Game.Init = {}
    Game.WriteSave = () => {
        let data = [];
        let keys = Object.keys(Game.SaveIndex)
        for (let n = 0; n < keys.length; n++) {
            switch (keys[n]) {
                case "basicInfo": {
                    data[Game.SaveIndex.basicInfo] =
                        (Game.VERSION) + '.' +
                        (Game.language)
                } break
                case "prefs": {
                    data[Game.SaveIndex.prefs] = (() => {
                        let str = ''
                        for (let i = 0; ; i++) {
                            str += Game.prefs[Game.prefsItems[i]] + '.'
                            if (!(i < Game.prefsItems.length - 1)) {
                                return str.slice(0, -1)
                            }
                        }
                    })()
                } break
                case "game": {
                } break
                case "stats": {
                } break
            }
        }// 平文→base64→エスケープ ↓
        localStorageSet(Game.SaveLoc, Utilities.escape(btoa(data.join('-'))))
    }
    Game.LoadSave = () => {
        let data = atob(Utilities.unescape(localStorageGet(Game.SaveLoc))).split('-')
        Object.keys(Game.SaveIndex).forEach(key => {
            switch (key) {
                case "basicInfo": {
                    let spl = data[Game.SaveIndex.basicInfo].split('.')
                    Game.VERSION = spl[0]
                    Game.language = spl[1]
                } break
                case "prefs": {
                    let spl = data[Game.SaveIndex.prefs].split('.')
                    for (let i = 0; i < Game.prefsItems.length; i++) {
                        Game.prefs[Game.prefsItems[i]] = spl[i]
                    }
                } break
                case "game": {
                } break
                case "stats": {
                } break
            }
        })
    }

    Game.Init = () => {

        Game.prefs = []
        Game.prefsItems = [ //項目と並びの定義
            "particles",  // particle effects | 2:with physics / 1:normal particle / 0:off
            "volume",     // audio volume     | 0~100
            "autosave",   // auto save        | 0~10 min, 0 to disable
            "cssvisual",  // Visual with CSS  | 2:high / 1:mid / 0:low
            "fancyvisual" // Visual with Code | 2:high / 1:mid / 0:low
        ]
        Game.defaultPrefs = [2, 75, 1, 2, 2] //項目のデフォルト値
        Game.DefaultPrefs = () => {
            for (let i = 0; i < Game.prefsItems.length; i++) {
                Game.prefs[Game.prefsItems[i]] = Game.defaultPrefs[i]
            }
        }
        Game.DefaultPrefs()
    }
}
window.onload = () => {
    Game.Launch()
    Game.Init()
    Game.LoadSave()
};
//#endregion