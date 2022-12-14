//毎回桁数を導きだすのは如何に？(負荷的に)

//#region regular functions
let e = id => {
    return document.getElementById(id)
}
let addEvent = (elem, type, func) => {
    elem.addEventListener(type, func, false)
}

let _escape = (str) => {
    return str.replace(/[^a-zA-Z0-9@*_+\-./]/g, (m) => {
        const code = m.charCodeAt(0)
        if (code <= 0xff) {
            return '%' + ('00' + code.toString(16)).slice(-2).toUpperCase()
        } else {
            return '%u' + ('0000' + code.toString(16)).slice(-4).toUpperCase()
        }
    })
}
let _unescape = (str) => {
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
    "long": [1000, [' thousand', ' million', ' billion', ' trillion', ' quadrillion', ' quintillion', ' sextillion', ' septillion', ' octillion', ' nonillion', ' decillion', ' undecillion', ' duodecillion', ' tredecillion', ' quattuordecillion', ' quindecillion', ' sexdecillion', ' septendecillion', ' octodecillion', ' novemdecillion', ' vigintillion', ' unvigintillion', ' duovigintillion', ' trevigintillion', ' quattuorvigintillion', ' quinvigintillion', ' sexvigintillion', ' septenvigintillion', ' octovigintillion', ' novemvigintillion', ' trigintillion', ' untrigintillion', ' duotrigintillion', ' tretrigintillion', ' quattuortrigintillion', ' quintrigintillion', ' sextrigintillion', ' septentrigintillion', ' octotrigintillion', ' novemtrigintillion', ' quadragintillion', ' unquadragintillion', ' duoquadragintillion', ' trequadragintillion', ' quattuorquadragintillion', ' quinquadragintillion', ' sexquadragintillion', ' septenquadragintillion', ' octoquadragintillion', ' novemquadragintillion', ' quinquagintillion', ' unquinquagintillion', ' duoquinquagintillion', ' trequinquagintillion', ' quattuorquinquagintillion', ' quinquinquagintillion', ' sexquinquagintillion', ' septenquinquagintillion', ' octoquinquagintillion', ' novemquinquagintillion', ' sexagintillion', ' unsexagintillion', ' duosexagintillion', ' tresexagintillion', ' quattuorsexagintillion', ' quinsexagintillion', ' sexsexagintillion', ' septensexagintillion', ' octosexagintillion', ' novemsexagintillion', ' septuagintillion', ' unseptuagintillion', ' duoseptuagintillion', ' treseptuagintillion', ' quattuorseptuagintillion', ' quinseptuagintillion', ' sexseptuagintillion', ' septenseptuagintillion', ' octoseptuagintillion', ' novemseptuagintillion', ' octogintillion', ' unoctogintillion', ' duooctogintillion', ' treoctogintillion', ' quattuoroctogintillion', ' quinoctogintillion', ' sexoctogintillion', ' septenoctogintillion', ' octooctogintillion', ' novemoctogintillion', ' nonagintillion', ' unnonagintillion', ' duononagintillion', ' trenonagintillion', ' quattuornonagintillion', ' quinnonagintillion', ' sexnonagintillion', ' septennonagintillion', ' octononagintillion', ' novemnonagintillion']],
    "short": [1000, ['k', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc', ' UnD', ' DoD', ' TrD', ' QaD', ' QiD', ' SxD', ' SpD', ' OcD', ' NoD', ' V', ' UnV', ' DoV', ' TrV', ' QaV', ' QiV', ' SxV', ' SpV', ' OcV', ' NoV', ' T', ' UnT', ' DoT', ' TrT', ' QaT', ' QiT', ' SxT', ' SpT', ' OcT', ' NoT', ' Qa', ' UnQa', ' DoQa', ' TrQa', ' QaQa', ' QiQa', ' SxQa', ' SpQa', ' OcQa', ' NoQa', ' Qi', ' UnQi', ' DoQi', ' TrQi', ' QaQi', ' QiQi', ' SxQi', ' SpQi', ' OcQi', ' NoQi', ' Sx', ' UnSx', ' DoSx', ' TrSx', ' QaSx', ' QiSx', ' SxSx', ' SpSx', ' OcSx', ' NoSx', ' Sp', ' UnSp', ' DoSp', ' TrSp', ' QaSp', ' QiSp', ' SxSp', ' SpSp', ' OcSp', ' NoSp', ' O', ' UnO', ' DoO', ' TrO', ' QaO', ' QiO', ' SxO', ' SpO', ' OcO', ' NoO', ' N', ' UnN', ' DoN', ' TrN', ' QaN', ' QiN', ' SxN', ' SpN', ' OcN', ' NoN']],
    "JA_JP": [10000, ['万', '億', '兆', '京', '垓', '𥝱', '穣', '溝', '澗', '正', '載', '極', '恒河沙', '阿僧祇', '那由他', '不可思議', '無量大数']]
}

let Langs = {
    'EN_US': { nameEN: 'English', name: 'English' },
    'JA_JP': { nameEN: 'Japanese', name: '日本語' }
} // 予定はこの二言語だけ

//#region game usualy function

//桁数とフォーマッタのIndexを返す
let NumScale = (value) => {
    let x = value.toString().length
    return {
        "digit": x,
        "scale": ~~((x - 1) / (numFormats[Game.formatter][0].toString().length - 1))
    }
}

let BeautifyNum = (value, scale = -1) => {
    if (scale == -1) scale = NumScale(value).scale
    if (scale <= 1) return { 'i': value.toString(), 'd': '', 'f': '' }
    let str = (value / (BigInt(numFormats[Game.formatter][0] ** (scale - 1)))).toString()
    return { 'i': str.slice(0, -3), 'd': str.slice(-3), 'f': numFormats[Game.formatter][1][scale - 1] }
}
//#endregion

let Game = {}
Game.Launch = () => {

    Game.Init = {} //初期化関数
    //ゲームの機能自体はここに書いていく
    Game.Init = () => {
        Game.diamonds = BigInt('0')

        //#region Click handling
        Game.ClickableDiamond = e('ClickableDiamond')
        Game.Click = () => {
            console.log("click");
        }
        addEvent(ClickableDiamond, 'click', Game.Click)
        addEvent(ClickableDiamond, 'mousedown', (e) => { })
        addEvent(ClickableDiamond, 'mouseup', (e) => { })
        addEvent(ClickableDiamond, 'mouseover', (e) => { })
        addEvent(ClickableDiamond, 'mouseout', (e) => { })
        //#endregion

        //#region GUI

        //要素の取得とクリックイベント
        //施設の売買、インベントリ操作諸々
        Game.Title = e('Banner')

        //#endregion

        Game.CalcDpS = () => { //DpSの計算 変更のあったタイミングで実行する
            let productsDpS = 0
            let productsDpSPer = 100
            let Bigtps = BigInt(Game.tps)
            for (key of Object.keys(Game.products)) {
                let d = Game.products[key].GetDpS()
                productsDpS += d.num
                productsDpSPer += d.per
            }
            Game.DpS = BigInt(~~(productsDpS * (productsDpSPer / 100) * 1000))
            let DpSDec = Number(Game.DpS % (Bigtps * 1000n))
            Game.DpTDec = DpSDec / Game.tps
            Game.DpT = (Game.DpS - BigInt(DpSDec)) / Bigtps / 1000n
        }

        //#region Data of Game,prefs & I/O
        Game.products = {
            "test1": {
                "enabled": true, //表示されるか否か
                "level": 1, //レベル0は買われてない状態
                "data": {
                    //レベル以外に保持するパラメーターはここに
                },
                "GetDpS": function () {
                    //keyごとに処理するのでkeyの削除/追加可能
                    //ここで特殊効果も乗せたりする
                    return {
                        "num": this.level,
                        "per": this.level * 0.5,
                        "clicknum": 0, //物理クリックに加算する実数(仮案)
                        "clickper": 0 //物理クリックにの倍率(仮案)
                    }
                },
                "initCost": 100, //初期費用
                "GetCost": function (level = this.level) {
                    //与えられたレベルから次のレベルに行くのにかかるコスト
                    //まとめ買いはこれが何回も呼ばれる
                    return level ^ 1.1
                }
            }
        }

        Game.prefs = []
        Game.prefsItems = [ //項目と並びの定義
            "particles",  // particle effects | 2:with physics / 1:normal particle / 0:off
            "volume",     // audio volume     | 0~100
            "autosave",   // auto save        | 0~10 min, 0 to disable
            "cssvisual",  // Visual with CSS  | 2:high / 1:mid / 0:low
            "fancyvisual" // Visual with Code | 2:high / 1:mid / 0:low
        ]
        Game.defaultPrefs = [2, 75, 1, 2, 2] //項目のデフォルト値

        Game.SaveLoc = "SaveData"
        Game.SaveIndex = {
            "basicInfo": 1,  //バージョン、言語など
            "prefs": 2,      //設定項目
            "game": 3,       //ゲームのデータ
            "products": 4,   //施設設備の情報
            "stats": 5       //実績
        }
        Game.WriteSave = () => {
            let data = []
            let keys = Object.keys(Game.SaveIndex)
            for (key of keys) {
                switch (key) {
                    case "basicInfo": {
                        data[Game.SaveIndex.basicInfo] =
                            (VERSION) + '-' +
                            (Game.language) + '-' +
                            (Game.formatter)
                    } break
                    case "prefs": {
                        data[Game.SaveIndex.prefs] = (() => {
                            let str = ''
                            for (let i = 0; ; i++) {
                                str += Game.prefs[Game.prefsItems[i]] + '-'
                                if (!(i < Game.prefsItems.length - 1)) {
                                    return str.slice(0, -1)
                                }
                            }
                        })()
                    } break
                    case "game": {
                        data[Game.SaveIndex.game] = (() => {
                            let str = Game.diamonds.toString() + '-'
                        })()
                    } break
                    case "products": {

                    } break
                    case "stats": {
                    } break
                }
            }// 平文→base64→エスケープ ↓
            localStorageSet(Game.SaveLoc, _escape(btoa(data.join('|'))))
        }
        Game.LoadSave = (dat) => {
            let data = dat ? atob(_unescape(dat)).split('|') : undefined
            for (key of Object.keys(Game.SaveIndex)) {
                switch (key) {
                    case "basicInfo": {
                        let spl = data ? data[Game.SaveIndex.basicInfo].split('-') : []
                        if (spl[0] == undefined) { console.log("初回起動") }
                        else if (VERSION != spl[0]) { console.log("アップデートがありました" + VERSION + spl[0]) }
                        Game.language = spl[1] ? spl[1] : "EN_US"
                        Game.formatter = spl[2] ? spl[2] : "long"
                    } break
                    case "prefs": {
                        let spl = data ? data[Game.SaveIndex.prefs].split('-') : []
                        for (let i = 0; i < Game.prefsItems.length; i++) {
                            Game.prefs[Game.prefsItems[i]] = spl[i] ? parseInt(spl[i]) : Game.defaultPrefs[i]
                        }
                    } break
                    case "game": {
                        let spl = data ? data[Game.SaveIndex.prefs].split('-') : []
                        Game.diamonds = BigInt(spl[0] ? spl[0] : 0)
                    } break
                    case "products": {

                    } break
                    case "stats": {
                    } break
                }
            }
            data && Game.WriteSave()
        }
        //#endregion
        Game.tps = 30
        Game.frameManager = new GameSpeedManager(Game.tps)

        Game.decDiamonds = 0
        Game.CalcDpS()
    }

    //フレーム毎の処理
    Game.Update = () => {
        //dpsの加算、エフェクト効果の経過、
        Game.diamonds += Game.DpT

        Game.decDiamonds += Game.DpTDec //小数部は別で計算
        if (Game.decDiamonds >= 1000) {
            Game.decDiamonds -= 1000
            Game.diamonds += 1n
        }
        Game.Draw() //一時的にここに
    }

    //描画
    Game.Draw = () => {
        //ダイヤ数の表示、エフェクトの処理
        let beautify = BeautifyNum(Game.diamonds)
        let str = beautify.i + ((beautify.d == '') ? '' : '.' + beautify.d) + beautify.f + ' diamonds'
        Game.Title.textContent = str
    }

    //メインループ
    Game.Loop = () => {
        Game.Update()
        setTimeout(Game.Loop, Game.frameManager.finish())
    }
}

window.onload = () => {
    Game.Launch()
    Game.Init()
    Game.LoadSave(localStorageGet(Game.SaveLoc))
    Game.Loop()
}
//#endregion