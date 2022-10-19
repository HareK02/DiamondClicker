//毎回桁数を導きだすのは如何に？(負荷的に)

//#region regular functions
let e = id => {
    return document.getElementById(id);
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

//正確な値を文字列で返す。('1e+5' > "100000") 引数はstringに解釈される
//第二引数は返す小数の桁数。 デフォルトで整数部のみになる
let toFixed = (x, s = 0) => {
    return Number.parseFloat(x).toFixed(s)
}

//桁に対応する単位を求める関数 ","の数を返す
// 1,000,000 = 2 (milion) | 1,000,000,000 = 3 (milion)
//これによって単位を配列にしてアクセスできる
//Infinity、NaN、数値型以外は-1
let NumScale = (x) => {
    return Number.isFinite(x) ? ~~((toFixed(x).length + 1) / 3) : -1
}

let BeautifyNum = (value) => {
    let base = 0
    let scale = numFormats[Game.formatter][0]
    if (!isFinite(value)) return 'Infinity';
    while (Math.round(value) >= scale) {
        value /= scale;
        base++;
    }
    if (base >= numFormats[Game.formatter][1].length) return 'Infinity'
    return { "v": (Math.round(value * scale) / scale), "s": (base == 0 ? '' : numFormats[Game.formatter][1][base - 1]) }
}
//#endregion

let Game = {}
Game.Launch = () => {


    Game.Init = {} //初期化関数
    //ゲームの機能自体はここに書いていく
    Game.Init = () => {
        Game.diamond = new BigInt('0')

        //#region Click handling
        var ClickableDiamond = e('ClickableDiamond');
        Game.Click = () => {

        }
        AddEvent(ClickableDiamond, 'click', Game.Click);
        AddEvent(ClickableDiamond, 'mousedown', (e) => { });
        AddEvent(ClickableDiamond, 'mouseup', (e) => { });
        AddEvent(ClickableDiamond, 'mouseover', (e) => { });
        AddEvent(ClickableDiamond, 'mouseout', (e) => { });
        //#endregion

        //#region GUI
        var Title = e('diamonds');

        //#endregion

        //#region Game,prefs Data I/O
        Game.SaveLoc = "SaveData"
        Game.SaveIndex = {
            "basicInfo": 1,  //バージョン、言語など
            "prefs": 2,      //設定項目
            "game": 3,       //ゲームのデータ
            "products": 4,   //施設設備の情報
            "stats": 5       //実績
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
        Game.DefaultPrefs = () => { //その他初期値
            for (let i = 0; i < Game.prefsItems.length; i++) {
                Game.prefs[Game.prefsItems[i]] = Game.defaultPrefs[i]
            }
            Game.language = "EN_US"
            Game.formatter = "long"
        }
        Game.DefaultPrefs()

        Game.WriteSave = () => {
            let data = [];
            let keys = Object.keys(Game.SaveIndex)
            for (let n = 0; n < keys.length; n++) {
                switch (keys[n]) {
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
        Game.LoadSave = () => {
            let data = atob(_unescape(localStorageGet(Game.SaveLoc))).split('|')
            Object.keys(Game.SaveIndex).forEach(key => {
                switch (key) {
                    case "basicInfo": {
                        let spl = data[Game.SaveIndex.basicInfo].split('-')
                        if (VERSION != spl[0]) { console.log("アップデートがありました" + VERSION + spl[0]) }
                        Game.language = spl[1] ? spl[1] : "EN_US"
                        Game.formatter = spl[2] ? spl[2] : "long"
                    } break
                    case "prefs": {
                        let spl = data[Game.SaveIndex.prefs].split('-')
                        for (let i = 0; i < Game.prefsItems.length; i++) {
                            if (spl[i]) Game.prefs[Game.prefsItems[i]] = parseInt(spl[i])
                        }
                    } break
                    case "game": {
                        let spl = data[Game.SaveIndex.prefs].split('-')
                        Game.diamonds = BigInt(spl[0])
                    } break
                    case "products": {

                    } breakF
                    case "stats": {
                    } break
                }
            })
        }

        //#endregion
    
        Game.gameSpeedManager = new GameSpeedManager(30)
        Game.Loop();
    }

    //フレーム毎の処理
    Game.Update = () => {
        //dpsの加算、エフェクト効果の経過、
    }

    //描画
    Game.Draw = () => {
        //ダイヤ数の更新、エフェクトの処理
    }

    //メインループ
    Game.Loop = () => {
        Game.Update()
        Game.Draw()

        setTimeout(Game.Loop, gameSpeedManager.finish());
    }
}
window.onload = () => {
    Game.Launch()
    Game.Init()
    Game.LoadSave()

};
//#endregion