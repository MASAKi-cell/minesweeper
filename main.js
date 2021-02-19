'use strict';

//===================================
// マインスイーパ用のセルクラス
//===================================
class MSCell extends HTMLTableCellElement {

    //-----------------------------------
    // コンストラクタの設定
    //-----------------------------------
    constructor() {
        super();
        this.addEventListener('click', this.clickFunc); //右クリックの設定
        this.addEventListener('contextmenu', this.clickRightFunc); //左クリックの設定
        this.addEventListener('dblclick', this.clickDblFunc); //ダブルクリックの設定
    }

    //-----------------------------------
    // マインスイーパ、 x、y、爆弾の初期設定
    //-----------------------------------
    init(x, y, bombFlg) {
        this.openedFlg = false; // 開封フラグ
        this.x = x;
        this.y = y;
        this.bombFlg = bombFlg; // 爆弾
        this.classList.add('js__closed')

    }

    //-----------------------------------
    // 周辺セルの設定
    //-----------------------------------
    setArounds(arounds) {
        this.arounds = arounds; // 周辺セル
        this.aroundBombCount = this.arounds.filter(around => around.bombFlg).length; // 周辺セルの爆弾数
    }

    //-----------------------------------
    // セルの中身を表示
    //-----------------------------------
    show() {
        if (this.bombFlg) { // 爆弾のときは💣を表示
            this.textContent = '💣';
            this.classList.remove('js__closed');
            this.classList.add('js__bombed');
        } else {
            if (this.aroundBombCount > 0) { // 爆弾ではないとき
                this.textContent = this.aroundBombCount; // 周辺の爆弾数が1個以上のときは数を表示
            }
            this.classList.remove('js__closed');
            this.classList.add('js__opened');
        }
    }

    //-----------------------------------
    // セルを左クリックしたときの処理
    //-----------------------------------
    clickFunc() {

        if (this.openedFlg) { // 開封済みのときは何もしない
            return;
        }
        if (this.textContent === '旗' || this.textContent === '？') { // 「旗」や「？」がついてるときも何もしない
            return;
        }
        this.openedFlg = true; // 開封済みにする

        this.show();

        if (this.bombFlg) {
            msCells.forEach(button => button.show()); // このセルが爆弾のときはゲームオーバーなので全セルを開く
        } else {
            if (this.aroundBombCount === 0) { // このセルが爆弾でないとき
                this.arounds.forEach(around => around.clickFunc()); // 周囲に爆弾が無いときは周囲のセルを全部開く
            }
        }
    }

    //-----------------------------------
    // セルを右クリックしたときの処理
    //-----------------------------------
    clickRightFunc(right) {
        right.preventDefault();// 右クリックメニュー禁止

        if (this.openedFlg) {// 既に開かれている場合は何もしない
            return;
        }

        if (this.textContent === '') {// 旗を表示
            this.textContent = '旗';
        } else if (this.textContent === '旗') {
            this.textContent = '？';
        } else if (this.textContent === '？') {
            this.textContent = '';
        }

    }

    //-----------------------------------
    // セルをダブルクリックしたときの処理
    //-----------------------------------
    clickDblFunc() {
        if (!this.openedFlg) {// 既に開かれている場合は何もしない
            return;
        }
        let flgCount = this.arounds.filter(around => around.textContent === '旗').length; // 周囲の旗の数を取得
        if (this.aroundBombCount === flgCount) {
            this.arounds.forEach(around => around.clickFunc());
        }
    }

}

//===================================
// カスタム要素の定義
//===================================
customElements.define('ms-td', MSCell, { extends: 'td' });

//===================================
// 全セルを格納しておく変数
//===================================
let msCells = [];

//===================================
// ゲーム初期化用関数
//===================================
let initGame = function (xSize, ySize) { // ボタン配置
    for (let y = 0; y < ySize; y++) {
        let tr = document.createElement('tr');
        for (let x = 0; x < xSize; x++) { // セルを作る
            let msCell = document.createElement('td', { is: 'ms-td' }); // セルの初期化
            msCell.init(x, y, Math.random() * 100 < 10); // セルをtrにいれておく
            tr.appendChild(msCell); // msCellsにも入れておく
            msCells.push(msCell);
        }
        document.getElementById('target').appendChild(tr);
    }

    // aroundsの設定
    msCells.forEach(msCell => { // 周囲8マスを取得
        let arounds = msCells.filter(otherCell => {
            if (msCell === otherCell) {
                return false;
            }
            let xArea = [msCell.x - 1, msCell.x, msCell.x + 1];
            let yArea = [msCell.y - 1, msCell.y, msCell.y + 1];

            if (xArea.indexOf(otherCell.x) >= 0) {
                if (yArea.indexOf(otherCell.y) >= 0) {
                    return true;
                }
            }
            return false;
        });
        msCell.setArounds(arounds); // 周囲8マスをaroundsとして設定
    });

}

//===================================
// ゲーム初期化の設定
//===================================
initGame(15, 15);

//タイマーを初期化する
function initTimer () {
    startTime = performance.now();
    changeTimer (); //これをしないと一瞬だけテキストが表示されない
    timerInterval = setTimeout(changeTimer, 50);
  }
  
  //タイマーの時間とテキストを設定する
  function changeTimer () {
    let elapsedTime = performance.now() - startTime;
    let min = Math.floor(elapsedTime / 60000);
    let sec = Math.floor(elapsedTime / 1000) % 60;
    timerText.innerHTML = (min < 10 ? "0" : "") + String(min) + ":" + (sec < 10 ? "0" : "") + String(sec);
    if (isGameActive) {
      setTimeout(changeTimer, 50);
    }
  }