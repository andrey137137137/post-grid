new Vue({
  el: '#post-grid-demo',
  data: {
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
    largeCounter: 0,
    highCounter: 0,
    smallCounter: 0,
    lastHighCounter: 0,
    cells: [],
    tempArray: [],
    rowsCount: 0,
    // lastRow: 0,
    restElems: 0,
    isEvenRow: 0,
    prevRowIndex: 0,
    rowIndex: 0,
    lastHighsStartRowIndex: -1,
    // prevEvenStepIndex: 0,
    // evenStepIndex: 0,
    sourceIndex: 0,
    prevSize: 0,
    soughtSize: 0,
    cellCounter: 0,
    sortedCounter: 0,
    toSetGridColStart: true,
    isOverlyLarges: false,
    isIncompleteLarges: false,
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
    isOnlyCounter() {
      let sizeTypeCounter = 0;

      if (this.smallCounter) {
        sizeTypeCounter++;
      }
      if (this.highCounter || this.lastHighCounter) {
        sizeTypeCounter++;
      }
      if (this.largeCounter) {
        sizeTypeCounter++;
      }

      return sizeTypeCounter == 1 ? true : false;
    },
    restCells() {
      return (
        this.smallCounter +
        this.highCounter * 2 +
        this.lastHighCounter * 2 +
        this.largeCounter * 4
      );
    },
    firstFoundIndex() {
      return 0;

      // if (!this.soughtSize) {
      //   return 0;
      // }

      // const prop = this.getSizeName(this.soughtSize);

      // if (this.firstFoundIndexes[prop] < 0) {
      //   return 0;
      // }

      // return this.firstFoundIndexes[prop];
    },
    isLargeSizeByIndex() {
      if (this.isLessThenMD || (this.isOnlyCounter && this.smallCounter)) {
        return false;
      }

      if (this.isLessThenXL) {
        return this.isLargeCell(this.cellCounter);
      }

      const EVEN_STEP = this.largeCounter ? 4 : 2;

      return (
        (this.largeCounter || this.isRowWithHighAsLarge) &&
        (this.isLargeCell(this.cellCounter) ||
          this.isLargeCell(this.cellCounter + EVEN_STEP))
      );
    },
  },
  methods: {
    getCompleteCellsCount() {
      return this.largeCounter * 4 + this.largeCounter * 2;
    },
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
      return {
        cell: true,
        'cell-small': this.cells[index].sourceSize == 1,
        'cell-high--bg': this.cells[index].sourceSize == 2,
        'cell-large--bg': this.cells[index].sourceSize == 4,
        'cell-high': !this.isLessThenXL && this.cells[index].calcSize == 2,
        'cell-large--md':
          !this.isLessThenMD &&
          this.isLessThenLG &&
          this.cells[index].calcSize == 4,
        'cell-large--lg':
          !this.isLessThenLG &&
          this.isLessThenXL &&
          this.cells[index].calcSize == 4,
        'cell-large--xl': !this.isLessThenXL && this.cells[index].calcSize == 4,
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
    setFirstFoundIndex(size, index) {
      const prop = this.getSizeName(size);

      if (this.firstFoundIndexes[prop] < 0) {
        this.firstFoundIndexes[prop] = index;
      }
    },
    getRows(cells) {
      return Math.ceil(cells / this.cellsCountInRow);
    },
    setSizeCounter(counter) {
      counter--;
      return counter > 0 ? counter : 0;
    },
    decSizeCounter(size) {
      switch (size) {
        case 4:
          this.largeCounter = this.setSizeCounter(this.largeCounter);
          break;
        case 2:
          if (this.isLastHigh) {
            this.lastHighCounter = this.setSizeCounter(this.lastHighCounter);
            this.isLastHigh = false;
          } else {
            this.highCounter = this.setSizeCounter(this.highCounter);
          }
          break;
        case 1:
          this.smallCounter = this.setSizeCounter(this.smallCounter);
      }
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
    },
    incTimeOutCounter() {
      this.timeOutCounter++;
    },
    calcRows() {
      if (this.cellCounter < this.getCompleteCellsCount) {
        const ROWS_WITH_SMALLS_N_HIGH_COUNTER =
          Math.floor(this.smallCounter / 2) + this.highCounter;
        const SCALING_DOWN_LARGE_COUNTER = Math.ceil(
          (this.largeCounter - ROWS_WITH_SMALLS_N_HIGH_COUNTER) / 2,
        );

        this.rowsCount =
          ROWS_WITH_SMALLS_N_HIGH_COUNTER + SCALING_DOWN_LARGE_COUNTER;

        if (this.isOnlyCounter) {
          this.toSetGridColStart = false;
        }

        this.isOverlyLarges = true;

        return;
      }

      this.rowsCount = this.getRows(this.cellCounter);
      this.isIncompleteLarges =
        this.smallCounter && this.largeCounter < this.rowsCount;

      if (this.isIncompleteLarges && this.highCounter) {
        const IS_INCOMPLETE_LAST_ROW =
          this.rowsCount * this.cellsCountInRow - this.cellCounter;
        let diff = this.rowsCount - this.largeCounter;

        if (IS_INCOMPLETE_LAST_ROW) {
          diff--;
        }

        if (diff < this.highCounter) {
          this.lastHighCounter = diff;
        } else {
          this.lastHighCounter = this.highCounter;
        }

        this.highCounter -= this.lastHighCounter;

        if (IS_INCOMPLETE_LAST_ROW) {
          diff++;
        }

        this.lastHighsStartRowIndex = this.rowsCount - diff;
        this.isRowWithHighAsLarge = this.lastHighsStartRowIndex == 0;
      } else if (
        (this.largeCounter && this.highCounter && !this.smallCounter) ||
        this.isOnlyCounter
      ) {
        this.toSetGridColStart = false;
      }
    },
    log(isStart = false) {
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
      console.log('cellCounter:            ' + this.cellCounter);
      console.log('smallCounter:           ' + this.smallCounter);
      console.log('highCounter:            ' + this.highCounter);
      console.log('lastHighCounter:        ' + this.lastHighCounter);
      console.log('largeCounter:           ' + this.largeCounter);
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
    restructe(sourceArray) {
      this.config();

      const GRID_COLUMN_START = 'grid-column-start';

      this.tempArray = [];

      this.largeCounter = 0;
      this.highCounter = 0;
      this.smallCounter = 0;
      this.lastHighCounter = 0;

      let toScaleDownBigSizes = false;
      let isNotFoundSize = false;
      let areSizesMatched = false;

      let isSmallSequence = false;
      let sourceArrayLength = sourceArray.length;

      let styles = {};
      let calcSize;

      sourceArray.forEach(item => {
        switch (item.sourceSize) {
          case 4:
            this.largeCounter++;
            break;
          case 2:
            this.highCounter++;
            break;
          case 1:
            this.smallCounter++;
        }

        this.cellCounter += item.sourceSize;
        this.tempArray.push(item);
      });

      this.calcRows();
      this.log(true);

      this.cellCounter = 0;
      this.cells = [];

      // ---------------------------------- BEGIN WHILE ---------------------------------

      while (!this.isTimeOut && this.sortedCounter < sourceArrayLength) {
        if (!isNotFoundSize) {
          if (isSmallSequence) {
            if (
              this.smallCounter &&
              (this.largeCounter || this.highCounter || this.lastHighCounter)
            ) {
              isSmallSequence = false;
            }
            this.soughtSize = 1;
          } else if (this.restElems) {
            console.log(this.restElems);
            this.soughtSize = 0;

            switch (this.restElems) {
              case 4:
                if (!this.isOnlyCounter) {
                  if (this.smallCounter == 1) {
                    this.soughtSize = 1;
                    styles[GRID_COLUMN_START] = 2;
                  }
                } else if (this.highCounter) {
                  this.soughtSize = 2;
                }
                break;
              case 3:
                if (!this.isOnlyCounter) {
                  if (this.smallCounter == 1) {
                    this.soughtSize = 1;
                  }
                } else if (this.highCounter) {
                  this.soughtSize = 2;
                }
                break;
              case 2:
                if (!this.isOnlyCounter) {
                  this.soughtSize = 1;

                  if (this.highCounter) {
                    styles.left = this.cellWidth;
                  }
                } else if (this.largeCounter) {
                  this.soughtSize = 4;
                } else if (this.highCounter) {
                  styles.left = this.cellWidth;
                  this.soughtSize = 2;
                }
                break;
              case 1:
                if (this.largeCounter) {
                  styles.left = this.cellWidth;
                  this.soughtSize = 4;
                } else {
                  styles.left = this.cellWidth * 2;
                  this.soughtSize = 2;
                }
            }

            if (this.isExist(styles, 'left')) {
              styles.left += 'px';
            }

            if (!this.soughtSize) {
              this.soughtSize = 1;
              isSmallSequence = true;
            } else if (this.soughtSize > 1) {
              styles.height = this.cellHeight * 2 + 'px';
            }

            if (this.toSetGridColStart && this.soughtSize == 1) {
              this.toSetGridColStart = false;
            }
          } else if (
            // this.isLargeSizeByIndex(this.evenStepIndex) &&
            // (this.largeCounter || !this.isEvenRow) &&
            // this.prevEvenStepIndex - this.evenStepIndex <= 1 &&
            // (this.largeCounter || this.isRowWithHighAsLarge)
            this.isLargeSizeByIndex
          ) {
            if (this.largeCounter) {
              this.soughtSize = 4;
            } else {
              this.soughtSize = 2;
              this.isLastHigh = true;
            }
          } else {
            this.soughtSize = 0;
          }
        } else {
          isNotFoundSize = false;

          if (this.soughtSize == 4) {
            this.soughtSize = 2;
          } else if (!isSmallSequence && this.highCounter) {
            this.soughtSize = 2;
          } else {
            this.soughtSize = 1;
          }
        }

        // ---------------------------------- BEGIN FOR ---------------------------------

        for (
          this.sourceIndex = this.firstFoundIndex;
          !this.isTimeOut && this.sourceIndex < sourceArrayLength;
          this.sourceIndex++
        ) {
          if (this.isExist(this.tempArray[this.sourceIndex], 'sorted')) {
            this.incTimeOutCounter();
            continue;
          }

          if (
            !this.soughtSize &&
            this.tempArray[this.sourceIndex].sourceSize < 3
          ) {
            this.soughtSize = this.tempArray[this.sourceIndex].sourceSize;

            this.log();

            switch (this.soughtSize) {
              case 1:
                if (this.smallCounter > 1) {
                  isSmallSequence = true;
                  break;
                } else if (
                  this.highCounter ||
                  this.lastHighCounter ||
                  this.isOverlyLarges
                ) {
                  // if (this.lastHighCounter) {
                  //   this.highCounter++;
                  //   this.lastHighCounter--;
                  // } else
                  if (!this.highCounter && this.isOverlyLarges) {
                    toScaleDownBigSizes = true;
                  }

                  this.soughtSize = 2;

                  this.incTimeOutCounter();
                  continue;
                } else if (
                  this.rowIndex == this.lastRow
                  // && this.isOnlyCounter
                ) {
                  break;
                }
              case 2:
                if (this.soughtSize == 2) {
                  if (this.highCounter) {
                    break;
                  }
                }
              default:
                this.soughtSize = 0;

                this.incTimeOutCounter();
                continue;
            }

            // console.log(this.lastHighCounter);
            // console.log(this.highCounter);
            // console.log(this.cellID);
            // console.log(this.soughtSize);
            // console.log('--------------------------------');
          }

          areSizesMatched =
            this.soughtSize == this.tempArray[this.sourceIndex].sourceSize;

          if (areSizesMatched || toScaleDownBigSizes) {
            if (!toScaleDownBigSizes) {
              calcSize = this.tempArray[this.sourceIndex].sourceSize;
            } else {
              if (areSizesMatched) {
                calcSize = this.tempArray[this.sourceIndex].sourceSize;
              } else {
                switch (this.tempArray[this.sourceIndex].sourceSize) {
                  case 4:
                    if (!isSmallSequence) {
                      calcSize = 2;
                    } else {
                      if (
                        this.largeCounter ||
                        this.highCounter ||
                        this.lastHighCounter
                      ) {
                        isSmallSequence = false;
                      }
                      calcSize = 1;
                    }
                    break;
                  default:
                    if (!isSmallSequence) {
                      isSmallSequence = true;
                    }
                    calcSize = 1;
                }
              }

              if (!this.isOnlyCounter) {
                toScaleDownBigSizes = false;
              }
            }

            if (this.toSetGridColStart) {
              switch (calcSize) {
                case 2:
                  if (
                    this.isRowWithHighAsLarge &&
                    this.prevSize == 1 &&
                    this.cellCounter % this.cellsCountInRow >= 2
                  ) {
                    if (this.isEvenRow && !this.isLargeSizeByIndex) {
                      this.cells[this.cells.length - 1].styles[
                        GRID_COLUMN_START
                      ] = 1;
                    } else if (this.isLargeSizeByIndex) {
                      this.cells[this.cells.length - 1].styles[
                        GRID_COLUMN_START
                      ] = 2;
                    }
                  }
                  break;
                case 1:
                  if (this.isRowWithHighAsLarge) {
                    if (this.isEvenRow) {
                      if (
                        this.isLargeCell(this.cellCounter + 4) &&
                        this.prevSize == 1
                      ) {
                        styles[GRID_COLUMN_START] = 1;
                      } else if (this.isLargeCell(this.cellCounter + 3)) {
                        styles[GRID_COLUMN_START] = 2;
                      }
                    }
                  } else if (
                    // this.isLargeCell(this.evenStepIndex + 2)
                    this.isLargeCell(this.cellCounter + 5)
                  ) {
                    styles[GRID_COLUMN_START] = 1;
                  }
              }
            }

            this.cells.push({
              cellCounter: this.cellCounter,
              key: this.isExist(this.tempArray[this.sourceIndex], 'key')
                ? this.tempArray[this.sourceIndex].key
                : ++this.cellID,
              sourceSize: this.tempArray[this.sourceIndex].sourceSize,
              calcSize,
              styles,
            });

            if (
              this.toSetGridColStart &&
              ((this.largeCounter &&
                (this.highCounter || this.lastHighCounter) &&
                !this.smallCounter) ||
                this.isOnlyCounter)
            ) {
              this.toSetGridColStart = false;
            }

            this.decSizeCounter(this.tempArray[this.sourceIndex].sourceSize);
            this.resetFirstFoundIndex(calcSize);
            this.tempArray[this.sourceIndex].sorted = true;
            this.sortedCounter++;

            this.prevRowIndex = this.rowIndex;
            this.cellCounter += calcSize;
            this.rowIndex = Math.floor(this.cellCounter / this.cellsCountInRow);

            if (this.rowIndex > this.prevRowIndex) {
              this.isRowWithHighAsLarge =
                this.lastHighsStartRowIndex >= 0 &&
                this.rowIndex >= this.lastHighsStartRowIndex;
              this.isEvenRow = !this.isEvenRow;

              if (this.rowIndex == this.lastRow && this.isEvenRow) {
                if (this.isOnlyCounter && this.smallCounter) {
                  isSmallSequence = true;
                } else {
                  console.log(this.restCells);

                  if (this.restCells < this.cellsCountInRow) {
                    this.restElems = sourceArrayLength - this.sortedCounter;

                    if (this.lastHighCounter) {
                      this.highCounter += this.lastHighCounter;
                      this.lastHighCounter = 0;
                    }
                  }
                  // else {
                  //   this.restElems = 0;
                  // }
                }
              }
            }

            this.prevSize = calcSize;
            styles = {};

            this.incTimeOutCounter();
            break;
          } else {
            this.setFirstFoundIndex(
              this.tempArray[this.sourceIndex].sourceSize,
              this.sourceIndex,
            );
          }

          this.incTimeOutCounter();
        }

        // ----------------------------------- END FOR ----------------------------------

        if (this.sourceIndex >= sourceArrayLength) {
          switch (this.soughtSize) {
            case 4:
              if (this.largeCounter) {
                break;
              }
            case 2:
              if (this.highCounter || this.lastHighCounter) {
                break;
              }
            case 1:
              if (this.smallCounter) {
                break;
              }
            default:
              toScaleDownBigSizes = true;
          }

          isNotFoundSize = true;

          if (this.soughtSize) {
            this.resetFirstFoundIndex(this.soughtSize);
          }
        }

        this.incTimeOutCounter();
      }

      // ----------------------------------- END WHILE ----------------------------------
    },
  },
  created() {
    this.restructe([
      { sourceSize: 1 },
      { sourceSize: 1 },
      { sourceSize: 1 },
      { sourceSize: 1 },

      { sourceSize: 1 },
      { sourceSize: 1 },
      { sourceSize: 1 },
      { sourceSize: 1 },

      { sourceSize: 1 },
      { sourceSize: 1 },
      { sourceSize: 1 },
      { sourceSize: 2 },

      { sourceSize: 1 },
      { sourceSize: 1 },
      { sourceSize: 1 },
      { sourceSize: 2 },

      { sourceSize: 1 },
      { sourceSize: 1 },
      { sourceSize: 1 },
      { sourceSize: 2 },

      { sourceSize: 2 },
      { sourceSize: 4 },
      { sourceSize: 4 },
      { sourceSize: 4 },
    ]);
  },
  mounted() {
    $vm = this;

    window.addEventListener('resize', function () {
      if ($vm.timeoutID) {
        clearTimeout($vm.timeoutID);
      }
      $vm.timeoutID = setTimeout(function () {
        $vm.restructe($vm.cells);
      }, 500);
    });
  },
});
