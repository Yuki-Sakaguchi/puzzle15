/**
 * 15パズル
 * @param {Object} _options
 *                 _options.id            ゲームのパズルを表示させるid
 *                 _options.boxCount      パズルの数(1辺)
 *                 _options.imagePath     画像のパス(正方形)
 *                 _options.isAutoPlay    ボード生成時にシャッフル済みにするかどうか
 *                 _options.isShowNumber  番号を表示するかどうか
 *                 _options.maxWidth      大きい幅で表示される時の最大幅を決める
 */
var Puzzle = function(_options) {
  // optionで設定できる値
  this.id = _options.id ? _options.id : 'puzzle';
  this.boxCount = _options.boxCount ? _options.boxCount : 4;
  this.imagePath = _options.imagePath;
  this.isAutoPlay = _options.isAutoPlay ? true : false;
  this.isShowNumber = _options.isShowNumber ? true : false;
  this.maxWidth = _options.maxWidth ? _options.maxWidth : 500;

  // 固定の設定値
  this.state = 1;
  this.dataIdName = 'data-id';
  this.activeClass = 'js-active';
  this.isScramble = false;

  this.init();
};

/**
 * 初期化処理
 */
Puzzle.prototype.init = function() {
  this.state = 1;

  // ボードの設定
  this.setParams();
  this.setBoard();


  // ボードのクリックイベント
  this.puzzle.addEventListener('click', function(e) {
    if (this.state == 1) {
      this.puzzle.className = 'animate';
      this.shiftCell(e.target);
    }
  }.bind(this));

  // オートプレイがtrueの時は初めからシャッフルしておく
  if (this.isAutoPlay) this.scramble();

  // 番号の表示処理
  if (this.isShowNumber) {
    this.toggleNumber();
  }
};

/**
 * 値を設定
 */
Puzzle.prototype.setParams = function() {
  // ボードの長さ設定
  var boardSize = window.innerWidth * 0.9;
  this.boardSize = boardSize > this.maxWidth ? this.maxWidth : boardSize;

  // パズル取得
  this.puzzle = document.getElementById(this.id);
  this.puzzle.style.width = this.puzzle.style.height = this.boardSize + 'px';

  // ボックスのサイズ設定
  this.boxSize = (this.boardSize - (this.puzzle.offsetWidth - this.puzzle.clientWidth)) / this.boxCount;
};

/**
 * ボードのセット
 */
Puzzle.prototype.setBoard = function() {
  if (this.state == 0) return;
  this.puzzle.innerHTML = '';
  
  var n = 1;
  for (var i = 0; i < this.boxCount; i++) {
    for (var j = 0; j < this.boxCount; j++) {
      var cell = document.createElement('span');
      cell.id = 'cell-' + i + '-' + j;

      // 位置
      cell.style.left = (j * this.boxSize) + 'px';
      cell.style.top = (i * this.boxSize) + 'px';
      cell.style.width = this.boxSize + 'px';
      cell.style.height = this.boxSize + 'px';

      // 画像
      var positionX = n % this.boxCount == 0 ? (this.boxCount - 1) : (n % this.boxCount) - 1;
      var positionY = Math.ceil(n / this.boxCount) - 1;
      cell.style.backgroundPositionX = -(positionX * this.boxSize) + 'px';
      cell.style.backgroundPositionY = -(positionY * this.boxSize) + 'px';
      cell.style.backgroundImage = 'url("' + this.imagePath + '")';
      cell.style.backgroundRepeat = 'no-repeat';
      cell.style.backgroundSize = this.boardSize + 'px';

      if (n <= (this.boxCount * this.boxCount) - 1) {
        cell.classList.add('number');
        // cell.classList.add((i%2==0 && j%2>0 || i%2>0 && j%2==0) ? 'dark' : 'light');
        cell.setAttribute(this.dataIdName, n);
        cell.innerHTML = '<span class="min-number">' + n.toString() + '</span>';
        n++;
      } else {
        cell.className = 'empty';
      }
      this.puzzle.appendChild(cell);
    }
  }
};

/**
 * シャッフル
 */
Puzzle.prototype.scramble = function() {
  if (this.state == 0) {
    return;
  }

  this.isScramble = true;
  this.puzzle.removeAttribute('class');
  state = 0;
  
  var previousCell;
  var i = 1;
  var interval = setInterval(function() {
    if (i <= 100) {
      var adjacent = this.getAdjacentCells(this.getEmptyCell());
      if (previousCell) {
        for (var j = adjacent.length - 1; j >= 0; j--) {
          if (adjacent[j].getAttribute(this.dataIdName) == previousCell.getAttribute(this.dataIdName)) {
            adjacent.splice(j, 1);
          }
        }
      }
      previousCell = adjacent[this.rand(0, adjacent.length-1)];
      this.shiftCell(previousCell);
      i++;
    } else {
      clearInterval(interval);
      this.isScramble = false;
      state = 1;
    }
  }.bind(this), 5);
};

/**
 * ランダムの値を生成
 * @param {Number} from 
 * @param {Number} to 
 */
Puzzle.prototype.rand = function(from, to) {
  return Math.floor(Math.random() * (to - from + 1)) + from;
};

/**
 * 隣接したemptyのセルを取得
 * @param {*} cell 
 */
Puzzle.prototype.getEmptyAdjacentCell = function(cell) {
  var adjacent = this.getAdjacentCells(cell);
  for (var i = 0; i < adjacent.length; i++) {
    if (adjacent[i].className == 'empty') {
      return adjacent[i];
    }
  }
  return false;
};

/**
 * 隣接したセルを取得
 * @param {*} cell 
 */
Puzzle.prototype.getAdjacentCells = function(cell) {
  var id = cell.id.split('-');
  var row = parseInt(id[1]);
  var col = parseInt(id[2]);

  var adjacent = [];
  if (row < this.boxCount-1) adjacent.push(this.getCell(row + 1, col));
  if (row > 0) adjacent.push(this.getCell(row - 1, col));
  if (col < this.boxCount-1) adjacent.push(this.getCell(row, col + 1));
  if (col > 0) adjacent.push(this.getCell(row, col - 1));
  return adjacent;
};

/**
 * セルを取得
 * @param {String} row 
 * @param {String} col 
 */
Puzzle.prototype.getCell = function(row, col) {
  return document.getElementById('cell-' + row + '-' + col);
};

/**
 * emptyセルを取得
 */
Puzzle.prototype.getEmptyCell = function() {
  return this.puzzle.querySelector('.empty');
};

/**
 * クリアしたかチェックする
 */
Puzzle.prototype.checkOrder = function() {
  if (this.isScramble) return false; // シャッフル中はクリアチェックしない
  if (this.getCell(this.boxCount - 1, this.boxCount - 1).className != 'empty') return false;

  var n = 1;
  for (var i = 0; i < this.boxCount; i++) {
    for (var j = 0; j < this.boxCount; j++) {
      if (n <= (this.boxCount * this.boxCount) - 1 && this.getCell(i, j).getAttribute(this.dataIdName) != n.toString()) {
        return false;
      }
      n++;
    }
  }

  // クリア
  setTimeout(function() {
    this.gameover();
  }.bind(this), 200);
};

/**
 * セルを移動させる
 * @param {*} cell 
 */
Puzzle.prototype.shiftCell = function(cell) {
  if (cell.className != 'empty') {
    var emptyCell = this.getEmptyAdjacentCell(cell);
    
    if (emptyCell) {
      // 一旦保存
      var tmp = {
        left: cell.style.left,
        top: cell.style.top,
        width: cell.style.width,
        height: cell.style.height,
        id: cell.id
      };

      // emptyと位置を交換
      cell.style.left = emptyCell.style.left;
      cell.style.top = emptyCell.style.top;
      cell.style.width = emptyCell.style.width;
      cell.style.height = emptyCell.style.height;
      cell.id = emptyCell.id;
      emptyCell.style.left = tmp.left;
      emptyCell.style.top = tmp.top;
      emptyCell.style.width = tmp.width;
      emptyCell.style.height = tmp.height;
      emptyCell.id = tmp.id;

      // クリアしているかチェック
      if (this.state == 1) this.checkOrder();
    }
  }
};

/**
 * ボードをリセットする
 */
Puzzle.prototype.reset = function() {
  this.state = 1;
  this.setBoard();
}

/**
 * 新しくゲームを開始する
 */
Puzzle.prototype.newGame = function() {
  this.state = 1;
  this.scramble();
}

/**
 * 番号の表示非表示を切り替え
 */
Puzzle.prototype.toggleNumber = function() {
  this.isShowNumber= !this.isShowNumber;
  this.puzzle.querySelectorAll('.min-number').forEach(function(e) {
    e.classList.toggle(this.activeClass);
  }.bind(this));
};

/**
 * クリア時の処理
 */
Puzzle.prototype.gameover = function() {
  if (confirm('クリア！！\nもう一度遊びますか？')) {
    this.scramble();
  }
};