new Vue({
  el: '#post-grid-demo',
  data: {
    toShow: {
      styles: false,
      log: true,
      rows: false,
      repeatSearch: false,
      timeOut: false,
      lastRow: false,
      cellsCounter: false,
      totalWidth: true,
    },
    timeOut: 1500,
    timeOutCounter: 0,
    isRowWithHighAsLarge: false,
    isLastHigh: false,
    totalWidth: 0,
    timeoutID: 0,
    cols: 3,
    cellWidth: 100,
    cellHeight: 100,
    cellID: -1,
    breakpoints: {
      // xl: 1200,
      // lg: 922,
      // md: 768,
      xl: 320,
      lg: 320,
      md: 320,
    },
    firstFoundIndexes: {
      large: -1,
      high: -1,
      small: -1,
    },
    largesCounter: 0,
    highsCounter: 0,
    smallsCounter: 0,
    lastHighsCounter: 0,
    cells: [],
    tempArray: [],
    rowsCount: 0,
    // lastRow: 0,
    allRestCells: 0,
    allRestElems: 0,
    restElems: 0,
    isEvenRow: 0,
    prevRowIndex: 0,
    // rowIndex: 0,
    lastHighsStartRowIndex: -1,
    // prevEvenStepIndex: 0,
    // evenStepIndex: 0,
    sourceIndex: 0,
    prevSize: 0,
    soughtSize: 0,
    cellsCounter: 0,
    tempCellsCounter: 0,
    sortedCounter: 0,
    sourceArrayLength: 0,
    styles: {},
    calcSize: 0,
    isOverlyLarges: false,
    isIncompleteLarges: false,
    toScaleDownBigSizes: false,
    isNotFoundSize: false,
    toRepeatSearch: false,
    isSmallSequence: false,
  },
  computed: {
    lastRow() {
      return this.rowsCount - 1;
    },
    isTimeOut() {
      return this.timeOutCounter >= this.timeOut;
    },
    cellsCountInRow() {
      if (this.isLessThenMD) {
        return 1;
      }
      if (this.isLessThenLG) {
        return 4;
      }
      return 6;
    },
    isLessThenMD() {
      return this.totalWidth < this.breakpoints.md;
    },
    isLessThenLG() {
      return this.totalWidth < this.breakpoints.lg;
    },
    isLessThenXL() {
      return this.totalWidth < this.breakpoints.xl;
    },
    columnSizeStyle() {
      return {
        'grid-template':
          'repeat(' +
          Math.ceil(this.cells.length / this.cols) * 2 +
          ', ' +
          this.cellHeight +
          'px) / repeat(' +
          this.cols +
          ', 1fr)',
      };
    },
    allHighsCounters() {
      return this.highsCounter || this.lastHighsCounter;
    },
    isNotSmallsCounter() {
      return !this.smallsCounter && this.largesCounter && this.allHighsCounters;
    },
    isOnlyCounter() {
      let sizeTypeCounter = 0;

      if (this.smallsCounter) {
        sizeTypeCounter++;
      }
      if (this.allHighsCounters) {
        sizeTypeCounter++;
      }
      if (this.largesCounter) {
        sizeTypeCounter++;
      }

      return sizeTypeCounter == 1 ? true : false;
    },
    toSetGridColStart() {
      if (this.isOnlyCounter) {
        return false;
      }

      if (this.isNotSmallsCounter) {
        return false;
      }

      return true;
    },
    firstFoundIndex() {
      // return 0;

      if (!this.soughtSize) {
        return 0;
      }

      const PROP = this.getSizeName(this.soughtSize);

      if (this.firstFoundIndexes[PROP] < 0) {
        return 0;
      }

      return this.firstFoundIndexes[PROP];
    },
    isLargeSizeByIndex() {
      if (this.isLessThenMD || (this.isOnlyCounter && this.smallsCounter)) {
        return false;
      }

      if (this.isLessThenXL) {
        return this.isLargeCell(this.cellsCounter);
      }

      const EVEN_STEP = this.largesCounter ? 4 : 2;

      return (
        (this.largesCounter || this.isRowWithHighAsLarge) &&
        (this.isLargeCell(this.cellsCounter) ||
          this.isLargeCell(this.cellsCounter + EVEN_STEP))
      );
    },
    isLastEvenRow() {
      return this.rowIndex == this.lastRow && this.isEvenRow;
    },
    isIncompleteLastRow() {
      return this.allRestCells < this.cellsCountInRow;
    },
    isIncompleteLastEvenRow() {
      return this.isLastEvenRow && this.isIncompleteLastRow;
    },
    curElem() {
      return this.tempArray[this.sourceIndex];
    },
    curSourceSize() {
      return this.curElem.sourceSize;
    },
    areSizesMatched() {
      return this.soughtSize == this.curSourceSize;
    },
    rowIndex() {
      return Math.floor(this.cellsCounter / this.cellsCountInRow);
    },
  },
  methods: {
    evenBeforeLargeStyle(index) {
      // if (!this.isLessThenXL && this.cells[index].gridColStart) {
      //   styles["grid-column-start"] = this.cells[index].gridColStart;
      // }

      // if (!this.isLessThenMD && this.cells[index].marginLeft) {
      //   styles.left = this.cells[index].marginLeft + "px";
      // }

      return this.cells[index].styles;
    },
    classes(index) {
      const { sourceSize, calcSize } = this.cells[index];
      return {
        cell: true,
        'cell-small': sourceSize == 1,
        'cell-high--bg': sourceSize == 2,
        'cell-large--bg': sourceSize == 4,
        'cell-high': !this.isLessThenXL && calcSize == 2,
        'cell-large--md':
          !this.isLessThenMD && this.isLessThenLG && calcSize == 4,
        'cell-large--lg':
          !this.isLessThenLG && this.isLessThenXL && calcSize == 4,
        'cell-large--xl': !this.isLessThenXL && calcSize == 4,
      };
    },
    isLargeCell(index) {
      if (!this.isLessThenXL) {
        return index % 12 == 0;
      }
      return index % 3 == 0;
    },
    getSizeName(size) {
      switch (size) {
        case 1:
          return 'small';
        case 2:
          return 'high';
        case 4:
          return 'large';
      }
    },
    resetFirstFoundIndex(size) {
      this.firstFoundIndexes[this.getSizeName(size)] = -1;
    },
    setFirstFoundIndex() {
      const prop = this.getSizeName(this.curSourceSize);

      if (this.firstFoundIndexes[prop] < 0) {
        this.firstFoundIndexes[prop] = this.sourceIndex;
      }
    },
    setSizeCounter(counterNamePrefix) {
      const COUNTER_NAME = counterNamePrefix + 'sCounter';
      let counter = this[COUNTER_NAME];
      counter--;
      this[COUNTER_NAME] = counter > 0 ? counter : 0;
    },
    decSizeCounter() {
      if (this.isLastHigh) {
        this.setSizeCounter('lastHigh');
        this.isLastHigh = false;
        return;
      }
      this.setSizeCounter(this.getSizeName(this.curSourceSize));
    },
    isExist(obj, prop) {
      return Object.prototype.hasOwnProperty.call(obj, prop);
    },
    config() {
      this.totalWidth = window.innerWidth;
      this.timeOutCounter = 0;

      if (this.totalWidth >= this.breakpoints.xl) {
        this.cols = 3;
      } else if (this.totalWidth >= this.breakpoints.lg) {
        this.cols = 2;
      } else if (this.totalWidth >= this.breakpoints.md) {
        this.cols = 1;
      } else {
        this.cols = 1;
      }

      this.firstFoundIndexes.large = -1;
      this.firstFoundIndexes.high = -1;
      this.firstFoundIndexes.small = -1;

      this.tempArray = [];
      this.styles = {};

      this.allRestCells = 0;
      this.allRestElems = 0;
      this.restElems = 0;

      this.isEvenRow = 0;
      this.prevRowIndex = 0;
      // this.rowIndex = 0;
      this.lastHighsStartRowIndex = -1;

      this.sourceIndex = 0;
      this.sortedCounter = 0;

      this.prevSize = 0;
      this.soughtSize = 0;
      this.calcSize = 0;

      this.isOverlyLarges = false;
      this.isIncompleteLarges = false;
      this.toScaleDownBigSizes = false;
      this.isNotFoundSize = false;
      this.isSmallSequence = false;
      this.toRepeatSearch = false;
    },
    incTimeOutCounter() {
      if (this.toShow.timeOut) {
        console.log('TIME_OUT_COUNTER BEFORE: ' + this.timeOutCounter);
      }
      this.timeOutCounter++;
      if (this.toShow.timeOut) {
        console.log('TIME_OUT_COUNTER AFTER: ' + this.timeOutCounter);
      }
    },
    calcRowsWhenOverlyLarges() {
      if (this.tempCellsCounter >= this.largesCounter * 6 - 2) {
        return;
      }

      const SMALLS_N_HIGHS_ROWS =
        Math.ceil(this.smallsCounter / 2) + this.highsCounter;
      this.rowsCount =
        SMALLS_N_HIGHS_ROWS +
        Math.ceil((this.largesCounter - SMALLS_N_HIGHS_ROWS) / 2);
      this.isOverlyLarges = true;
    },
    configWhenIncompleteLarges() {
      this.isIncompleteLarges =
        this.smallsCounter && this.largesCounter < this.rowsCount;

      if (!this.isIncompleteLarges) {
        return;
      }

      if (!this.highsCounter) {
        return;
      }

      const IS_INCOMPLETE_LAST_ROW =
        this.rowsCount * this.cellsCountInRow - this.tempCellsCounter;
      let diff = this.rowsCount - this.largesCounter;

      if (IS_INCOMPLETE_LAST_ROW) {
        diff--;
      }

      if (diff < this.highsCounter) {
        this.lastHighsCounter = diff;
      } else {
        this.lastHighsCounter = this.highsCounter;
      }

      this.highsCounter -= this.lastHighsCounter;

      if (IS_INCOMPLETE_LAST_ROW) {
        diff++;
      }

      this.lastHighsStartRowIndex = this.rowsCount - diff;
      this.isRowWithHighAsLarge = this.lastHighsStartRowIndex == 0;
    },
    calcRows() {
      this.calcRowsWhenOverlyLarges();

      if (this.isOverlyLarges) {
        if (this.toShow.rows) {
          console.log('ROWS: ' + this.rowsCount);
        }
        return;
      }

      this.rowsCount = Math.ceil(this.tempCellsCounter / this.cellsCountInRow);
      if (this.toShow.rows) {
        console.log('ROWS: ' + this.rowsCount);
      }
      this.configWhenIncompleteLarges();
    },
    log(isStart = false) {
      if (!this.toShow.log) {
        return;
      }

      const title = isStart ? 'START' : '  ' + this.cells.length + '  ';

      console.log(
        '=================================' +
          title +
          '=================================',
      );
      console.log('rowsCount:              ' + this.rowsCount);
      console.log('lastRow:                ' + this.lastRow);
      console.log('restElems:              ' + this.restElems);
      console.log('isEvenRow:              ' + this.isEvenRow);
      console.log('prevRowIndex:           ' + this.prevRowIndex);
      console.log('rowIndex:               ' + this.rowIndex);
      console.log('isRowWithHighAsLarge:   ' + this.isRowWithHighAsLarge);
      console.log('lastHighsStartRowIndex: ' + this.lastHighsStartRowIndex);
      console.log('');
      // console.log('prevEvenStepIndex:      ' + this.prevEvenStepIndex);
      // console.log('evenStepIndex:          ' + this.evenStepIndex);
      console.log('sourceIndex:            ' + this.sourceIndex);
      console.log('');
      console.log('prevSize:               ' + this.prevSize);
      console.log('soughtSize:             ' + this.soughtSize);
      console.log('');
      console.log('tempCellsCounter:       ' + this.tempCellsCounter);
      console.log('cellsCounter:           ' + this.cellsCounter);
      console.log('smallsCounter:          ' + this.smallsCounter);
      console.log('highsCounter:           ' + this.highsCounter);
      console.log('lastHighsCounter:       ' + this.lastHighsCounter);
      console.log('largesCounter:          ' + this.largesCounter);
      console.log('sortedCounter:          ' + this.sortedCounter);
      console.log('');
      console.log('toSetGridColStart:      ' + this.toSetGridColStart);
      console.log('isOverlyLarges:         ' + this.isOverlyLarges);
      console.log('isIncompleteLarges:     ' + this.isIncompleteLarges);
      console.log(
        '=================================' +
          title +
          '=================================',
      );
    },
    setGridColumnStart(value, toPrevCell = false) {
      const GRID_COLUMN_START = 'grid-column-start';

      if (!toPrevCell) {
        this.styles[GRID_COLUMN_START] = value;
        return;
      }

      this.cells[this.cells.length - 1].styles[GRID_COLUMN_START] = value;
    },
    setStyles() {
      if (!this.toSetGridColStart) {
        return;
      }

      if (this.isIncompleteLastEvenRow) {
        return;
      }

      switch (this.calcSize) {
        case 2:
          if (
            this.isRowWithHighAsLarge &&
            this.prevSize == 1 &&
            this.cellsCounter % this.cellsCountInRow >= 2
          ) {
            if (this.isEvenRow && !this.isLargeSizeByIndex) {
              this.setGridColumnStart(1, true);
            } else if (this.isLargeSizeByIndex) {
              this.setGridColumnStart(2, true);
            }
          }
          return;
        case 1:
          if (this.isRowWithHighAsLarge) {
            if (this.isEvenRow) {
              if (
                this.isLargeCell(this.cellsCounter + 4) &&
                this.prevSize == 1
              ) {
                this.setGridColumnStart(1);
              } else if (this.isLargeCell(this.cellsCounter + 3)) {
                this.setGridColumnStart(2);
              }
            }
          } else if (
            // this.isLargeCell(this.evenStepIndex + 2)
            this.isLargeCell(this.cellsCounter + 5)
          ) {
            this.setGridColumnStart(1);
          }
      }
    },
    checkNextRow() {
      if (this.rowIndex <= this.prevRowIndex) {
        return;
      }

      this.isRowWithHighAsLarge =
        this.lastHighsStartRowIndex >= 0 &&
        this.rowIndex >= this.lastHighsStartRowIndex;
      this.isEvenRow = !this.isEvenRow;

      if (!this.isLastEvenRow) {
        return;
      }

      if (this.isOnlyCounter && this.smallsCounter) {
        this.isSmallSequence = true;
        return;
      }

      this.allRestCells =
        this.smallsCounter +
        this.highsCounter * 2 +
        this.lastHighsCounter * 2 +
        this.largesCounter * 4;
      if (this.toShow.lastRow) {
        console.log(this.allRestCells);
      }

      if (this.isIncompleteLastRow) {
        if (this.toShow.lastRow) {
          console.log(this.sourceArrayLength);
          console.log(this.sortedCounter);
        }
        this.restElems = this.sourceArrayLength - this.sortedCounter;
        if (this.toShow.lastRow) {
          console.log(this.restElems);
        }
        this.allRestElems = this.restElems;
        return;
      }

      if (this.lastHighsCounter) {
        this.highsCounter += this.lastHighsCounter;
        this.lastHighsCounter = 0;
      }
    },
    isFoundUnknownSize() {
      if (this.soughtSize) {
        return false;
      }

      if (this.curSourceSize >= 3) {
        return false;
      }

      this.soughtSize = this.curSourceSize;
      this.log();

      switch (this.soughtSize) {
        case 1:
          if (this.smallsCounter > 1) {
            this.isSmallSequence = true;
            return false;
          }

          if (this.allHighsCounters || this.isOverlyLarges) {
            // if (this.lastHighsCounter) {
            //   this.highsCounter++;
            //   this.lastHighsCounter--;
            // } else
            if (!this.highsCounter && this.isOverlyLarges) {
              this.toScaleDownBigSizes = true;
            }

            this.soughtSize = 2;
            this.incTimeOutCounter();
            return true;
          }

          if (
            this.rowIndex == this.lastRow
            // && this.isOnlyCounter
          ) {
            return false;
          }

        case 2:
          if (this.soughtSize == 2 && this.highsCounter) {
            return false;
          }

        default:
          this.soughtSize = 0;
          this.incTimeOutCounter();
          return true;
      }
    },
    setCalcSize() {
      if (!this.toScaleDownBigSizes) {
        this.calcSize = this.curSourceSize;
        return;
      }

      if (this.areSizesMatched) {
        this.calcSize = this.curSourceSize;
      } else {
        switch (this.curSourceSize) {
          case 4:
            if (!this.isSmallSequence) {
              this.calcSize = 2;
            } else {
              if (
                this.largesCounter ||
                this.highsCounter ||
                this.lastHighsCounter
              ) {
                this.isSmallSequence = false;
              }
              this.calcSize = 1;
            }
            break;
          default:
            if (!this.isSmallSequence) {
              this.isSmallSequence = true;
            }
            this.calcSize = 1;
        }
      }

      if (!this.isOnlyCounter) {
        this.toScaleDownBigSizes = false;
      }
    },
    pushToCells() {
      this.cells.push({
        cellsCounter: this.cellsCounter,
        key: this.isExist(this.curElem, 'key')
          ? this.curElem.key
          : ++this.cellID,
        sourceSize: this.curSourceSize,
        calcSize: this.calcSize,
        styles: this.styles,
      });
    },
    searchSize() {
      for (
        this.sourceIndex = this.firstFoundIndex;
        !this.isTimeOut && this.sourceIndex < this.sourceArrayLength;
        this.sourceIndex++
      ) {
        if (this.isExist(this.curElem, 'sorted')) {
          this.incTimeOutCounter();
          continue;
        }

        if (this.isFoundUnknownSize()) {
          continue;
        }

        if (!this.areSizesMatched && !this.toScaleDownBigSizes) {
          this.setFirstFoundIndex();
          this.incTimeOutCounter();
          continue;
        }

        this.setCalcSize();
        this.setStyles();
        if (this.toShow.styles) {
          console.log(this.styles);
        }

        this.pushToCells();
        this.toRepeatSearch = false;

        this.decSizeCounter();
        this.resetFirstFoundIndex(this.calcSize);
        this.curElem.sorted = true;
        this.sortedCounter++;

        this.prevRowIndex = this.rowIndex;
        this.cellsCounter += this.calcSize;
        // this.rowIndex = Math.floor(this.cellsCounter / this.cellsCountInRow);

        this.checkNextRow();

        this.prevSize = this.calcSize;
        this.styles = {};

        this.incTimeOutCounter();
        return;
      }
    },
    setRestSoughtSize(bigSizeCount, bigSizeValue) {
      if (this.restElems > bigSizeCount) {
        this.soughtSize = 1;
      } else {
        this.soughtSize = bigSizeValue;
      }
    },
    setRestGridColumnStart() {
      if (this.restElems == 2) {
        this.setGridColumnStart(2);
      } else {
        this.setGridColumnStart(3);
      }
    },
    calcIncompleteEvenLastRow() {
      if (this.toShow.lastRow) {
        console.log(this.allRestCells);
        console.log(this.restElems);
      }

      switch (this.allRestCells) {
        case 5:
          switch (this.allRestElems) {
            case 4:
              this.setRestSoughtSize(1, 2);
              if (this.restElems == 2) {
                this.setGridColumnStart(2);
              }
              break;
            case 3:
              this.setRestSoughtSize(2, 2);
              break;
            case 2:
              this.setRestSoughtSize(1, 4);
          }
          break;

        case 4:
          switch (this.allRestElems) {
            case 3:
              this.setRestSoughtSize(1, 2);
              break;
            case 2:
              this.soughtSize = 2;
              this.setRestGridColumnStart();
              break;
            case 1:
              this.soughtSize = 4;
              this.setGridColumnStart(2);
          }
          break;

        case 3:
          this.setRestSoughtSize(1, 2);
          this.setRestGridColumnStart();
          break;

        case 2:
          this.soughtSize = 2;
          this.setGridColumnStart(3);
      }

      this.restElems--;
    },
    calcElems(sourceArray) {
      this.largesCounter = 0;
      this.highsCounter = 0;
      this.smallsCounter = 0;
      this.lastHighsCounter = 0;
      this.cellsCounter = 0;
      this.tempCellsCounter = 0;

      if (this.toShow.cellsCounter) {
        console.log('cellsCounter:     ' + this.cellsCounter);
        console.log('tempCellsCounter: ' + this.tempCellsCounter);
      }

      sourceArray.forEach(item => {
        switch (item.sourceSize) {
          case 4:
            this.largesCounter++;
            break;
          case 2:
            this.highsCounter++;
            break;
          case 1:
            this.smallsCounter++;
        }

        if (item.sourceSize) {
          this.tempCellsCounter += item.sourceSize;
          this.tempArray.push(item);
        }
      });

      this.sourceArrayLength = this.tempArray.length;
    },
    setSoughtSize() {
      if (this.isNotFoundSize) {
        this.isNotFoundSize = false;

        if (this.soughtSize == 4) {
          this.soughtSize = 2;
        } else if (!this.isSmallSequence && this.highsCounter) {
          this.soughtSize = 2;
        } else {
          this.soughtSize = 1;
        }

        return;
      }

      if (this.isSmallSequence) {
        if (
          this.smallsCounter &&
          (this.largesCounter || this.allHighsCounters)
        ) {
          this.isSmallSequence = false;
        }

        this.soughtSize = 1;
        return;
      }

      if (this.isIncompleteLastEvenRow) {
        this.calcIncompleteEvenLastRow();
        return;
      }

      if (
        // this.isLargeSizeByIndex(this.evenStepIndex) &&
        // (this.largesCounter || !this.isEvenRow) &&
        // this.prevEvenStepIndex - this.evenStepIndex <= 1 &&
        // (this.largesCounter || this.isRowWithHighAsLarge)
        this.isLargeSizeByIndex
      ) {
        if (this.largesCounter) {
          this.soughtSize = 4;
          return;
        }

        this.soughtSize = 2;
        this.isLastHigh = true;
        return;
      }

      this.soughtSize = 0;
    },
    restructe(sourceArray) {
      this.config();
      this.calcElems(sourceArray);
      this.calcRows();
      this.log(true);

      this.tempCellsCounter = 0;
      this.cells = [];

      // ---------------------------------- BEGIN WHILE ---------------------------------

      while (!this.isTimeOut && this.sortedCounter < this.sourceArrayLength) {
        this.setSoughtSize();

        // ---------------------------------- BEGIN FOR ---------------------------------

        this.searchSize();

        // ----------------------------------- END FOR ----------------------------------

        if (this.sourceIndex >= this.sourceArrayLength) {
          if (this.soughtSize) {
            this.toRepeatSearch = !this.toRepeatSearch;
            if (this.toShow.repeatSearch) {
              console.log(
                '------------------------------TO_REPEAT_SEARCH------------------------------: ' +
                  this.toRepeatSearch,
              );
            }
          }

          if (!this.toRepeatSearch) {
            switch (this.soughtSize) {
              case 4:
                if (this.largesCounter) {
                  break;
                }
              case 2:
                if (this.allHighsCounters) {
                  break;
                }
              case 1:
                if (this.smallsCounter) {
                  break;
                }
              default:
                this.toScaleDownBigSizes = true;
            }

            this.isNotFoundSize = true;
          }

          if (this.soughtSize) {
            this.resetFirstFoundIndex(this.soughtSize);
          }
        }

        this.incTimeOutCounter();
      }

      // ----------------------------------- END WHILE ----------------------------------
    },
    resizeOn() {
      if (this.toShow.totalWidth) {
        console.log('WINDOW: ' + window.innerWidth);
      }
      if (this.totalWidth == window.innerWidth) {
        if (this.toShow.totalWidth) {
          console.log('WINDOW if: ' + window.innerWidth);
        }
        return;
      }

      if (this.timeoutID) {
        clearTimeout(this.timeoutID);
      }

      const $vm = this;

      this.timeoutID = setTimeout(() => {
        $vm.restructe($vm.cells);
      }, 500);
    },
  },
  created() {
    this.restructe([
      { sourceSize: 1 },
      { sourceSize: 1 },
      { sourceSize: 1 },
      { sourceSize: 1 },
      { sourceSize: 1 },
      { sourceSize: 2 },
      { sourceSize: 4 },
      { sourceSize: 4 },
      { sourceSize: 4 },
      { sourceSize: 4 },
      { sourceSize: 4 },
      { sourceSize: 4 },
    ]);
  },
  mounted() {
    window.addEventListener('resize', this.resizeOn);
  },
});
