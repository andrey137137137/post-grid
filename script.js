new Vue({
  el: '#post-grid-demo',
  data: {
    timeOut: 50,
    timeOutCounter: 0,
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
  },
  computed: {
    isTimeOut: function () {
      return this.timeOutCounter >= this.timeOut;
    },
    cellsCountInRow: function () {
      if (this.isLessThenMD) return 1;
      if (this.isLessThenLG) return 4;
      return 6;
    },
    isLessThenMD: function () {
      return this.totalWidth < this.breakpoints.md;
    },
    isLessThenLG: function () {
      return this.totalWidth < this.breakpoints.lg;
    },
    isLessThenXL: function () {
      return this.totalWidth < this.breakpoints.xl;
    },
    columnSizeStyle: function () {
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
    isOnlyCounter: function () {
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
    restCells: function () {
      return (
        this.smallCounter +
        this.highCounter * 2 +
        this.lastHighCounter * 2 +
        this.largeCounter * 4
      );
    },
  },
  methods: {
    isLargeCell: function (index) {
      const isEven = index % 2 == 0;
      const isThreeMultiple = index % 3 == 0;

      if (!this.isLessThenXL) {
        return isEven && isThreeMultiple;
      }

      return isThreeMultiple;
    },
    evenBeforeLargeStyle: function (index) {
      // if (!this.isLessThenXL && this.cells[index].gridColStart) {
      //   styles["grid-column-start"] = this.cells[index].gridColStart;
      // }

      // if (!this.isLessThenMD && this.cells[index].marginLeft) {
      //   styles.left = this.cells[index].marginLeft + "px";
      // }

      return this.cells[index].styles;
    },
    classes: function (index) {
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
    isLargeSizeByIndex: function (index) {
      if (this.isLessThenMD) {
        return false;
      }

      if (this.isLessThenXL) {
        return this.isLargeCell(index);
      }

      return this.isLargeCell(index) || this.isLargeCell(index + 1);
    },
    isEvenHighSizeByIndex: function (index) {
      if (this.isLessThenMD) {
        return false;
      }

      if (this.isLessThenXL) {
        return this.isLargeCell(index);
      }

      return this.isLargeCell(index + 2);
    },
    getSizeName: function (size) {
      switch (size) {
        case 1:
          return 'small';
        case 2:
          return 'high';
        case 4:
          return 'large';
      }
    },
    resetFirstFoundIndex: function (size) {
      this.firstFoundIndexes[this.getSizeName(size)] = -1;
    },
    setFirstFoundIndex: function (size, index) {
      const prop = this.getSizeName(size);

      if (this.firstFoundIndexes[prop] < 0) {
        this.firstFoundIndexes[prop] = index;
      }
    },
    getFirstFoundIndex: function (size) {
      return 0;

      // if (!size) {
      //   return 0;
      // }

      // const prop = this.getSizeName(size);

      // if (this.firstFoundIndexes[prop] < 0) {
      //   return 0;
      // }

      // return this.firstFoundIndexes[prop];
    },
    getCompleteCellsCount: function (largeCells) {
      return largeCells * 4 + largeCells * 2;
    },
    getRows: function (cells) {
      return Math.ceil(cells / this.cellsCountInRow);
    },
    setSizeCounter: function (counter) {
      counter--;
      return counter > 0 ? counter : 0;
    },
    decSizeCounter: function (size) {
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
    isExist: function (obj, prop) {
      return Object.prototype.hasOwnProperty.call(obj, prop);
    },
    config: function () {
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
    incTimeOutCounter: function () {
      this.timeOutCounter++;
    },
    log: function (data, isStart = false) {
      const title = isStart ? 'START' : '  ' + this.cells.length + '  ';
      const {
        rowsCount,
        lastRow,
        countInLastRow,
        isEvenRow,
        prevRowIndex,
        rowIndex,
        isRowWithHighAsLarge,
        lastHighsStartRowIndex,
        prevEvenStepIndex,
        evenStepIndex,
        sourceIndex,
        prevSize,
        soughtSize,
        cellCounter,
        sortedCounter,
        toSetGridColStart,
        isOverlyLarges,
        isIncompleteLarges,
      } = data;

      console.log(
        '=================================' +
          title +
          '=================================',
      );
      console.log('rowsCount:              ' + rowsCount);
      console.log('lastRow:                ' + lastRow);
      console.log('countInLastRow:         ' + countInLastRow);
      console.log('isEvenRow:              ' + isEvenRow);
      console.log('prevRowIndex:           ' + prevRowIndex);
      console.log('rowIndex:               ' + rowIndex);
      console.log('isRowWithHighAsLarge:   ' + isRowWithHighAsLarge);
      console.log('lastHighsStartRowIndex: ' + lastHighsStartRowIndex);
      console.log('');
      console.log('prevEvenStepIndex:      ' + prevEvenStepIndex);
      console.log('evenStepIndex:          ' + evenStepIndex);
      console.log('sourceIndex:            ' + sourceIndex);
      console.log('');
      console.log('prevSize:               ' + prevSize);
      console.log('soughtSize:             ' + soughtSize);
      console.log('');
      console.log('cellCounter:            ' + cellCounter);
      console.log('smallCounter:           ' + this.smallCounter);
      console.log('highCounter:            ' + this.highCounter);
      console.log('lastHighCounter:        ' + this.lastHighCounter);
      console.log('largeCounter:           ' + this.largeCounter);
      console.log('sortedCounter:          ' + sortedCounter);
      console.log('');
      console.log('toSetGridColStart:      ' + toSetGridColStart);
      console.log('isOverlyLarges:         ' + isOverlyLarges);
      console.log('isIncompleteLarges:     ' + isIncompleteLarges);
      console.log(
        '=================================' +
          title +
          '=================================',
      );
    },
    restructe(sourceArray) {
      this.config();

      this.tempArray = [];

      this.largeCounter = 0;
      this.highCounter = 0;
      this.smallCounter = 0;
      this.lastHighCounter = 0;

      let isEvenRow = false;

      let isOverlyLarges = false;
      let isIncompleteLarges = false;
      let toSetGridColStart = true;
      let isRowWithHighAsLarge;

      let toScaleDownBigSizes = false;
      let isNotFoundSize = false;
      let areSizesMatched = false;

      let isSmallSequence = false;
      let isShiftedEvenStepIndex = false;

      let rowsCount = 0;
      let lastRow;
      let prevRowIndex = 0;
      let rowIndex = 0;
      let lastHighsStartRowIndex = -1;

      let cellCounter = 0;
      let prevSize = 0;

      let prevEvenStepIndex = 0;
      let evenStepIndex = 0;

      let sourceArrayLength = sourceArray.length;
      let sourceIndex;

      let sortedCounter = 0;
      let countInLastRow = 0;
      let styles = {};
      let soughtSize;
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

        cellCounter += item.sourceSize;
        this.tempArray.push(item);
      });

      if (cellCounter < this.getCompleteCellsCount(this.largeCounter)) {
        const RowsWithSmallsNHighCounter =
          Math.floor(this.smallCounter / 2) + this.highCounter;
        const scalingDownLargeCounter = Math.ceil(
          (this.largeCounter - RowsWithSmallsNHighCounter) / 2,
        );

        rowsCount = RowsWithSmallsNHighCounter + scalingDownLargeCounter;

        if (!this.highCounter && !this.smallCounter) {
          toSetGridColStart = false;
        }

        isOverlyLarges = true;
      } else {
        rowsCount = this.getRows(cellCounter);
        isIncompleteLarges = this.smallCounter && this.largeCounter < rowsCount;

        if (isIncompleteLarges && this.highCounter) {
          const diff = rowsCount - this.largeCounter;

          if (diff < this.highCounter) {
            this.lastHighCounter = diff;
          } else {
            this.lastHighCounter = this.highCounter;
          }

          if (rowsCount % 2 == 0 && this.smallCounter % 2) {
            this.lastHighCounter--;
          }

          this.highCounter -= this.lastHighCounter;

          lastHighsStartRowIndex = rowsCount - diff;
          isRowWithHighAsLarge = rowIndex >= lastHighsStartRowIndex;
        } else if (
          (this.largeCounter && this.highCounter && !this.smallCounter) ||
          this.isOnlyCounter
        ) {
          toSetGridColStart = false;
        }
      }

      lastRow = rowsCount - 1;

      this.log(
        {
          rowsCount,
          lastRow,
          countInLastRow,
          isEvenRow,
          prevRowIndex,
          rowIndex,
          isRowWithHighAsLarge,
          lastHighsStartRowIndex,
          prevEvenStepIndex,
          evenStepIndex,
          sourceIndex,
          prevSize,
          soughtSize,
          cellCounter,
          sortedCounter,
          toSetGridColStart,
          isOverlyLarges,
          isIncompleteLarges,
        },
        true,
      );

      cellCounter = 0;
      this.cells = [];

      // ---------------------------------- BEGIN WHILE ---------------------------------

      while (!this.isTimeOut && sortedCounter < sourceArrayLength) {
        if (!isNotFoundSize) {
          if (isSmallSequence) {
            if (
              this.smallCounter &&
              (this.largeCounter || this.highCounter || this.lastHighCounter)
            ) {
              isSmallSequence = false;
            }
            soughtSize = 1;
          } else if (countInLastRow) {
            console.log(countInLastRow);
            soughtSize = 0;

            switch (countInLastRow) {
              case 4:
                if (!this.isOnlyCounter) {
                  if (this.smallCounter == 1) {
                    soughtSize = 1;
                    styles['grid-column-start'] = 2;
                  }
                } else if (this.highCounter) {
                  soughtSize = 2;
                }
                break;
              case 3:
                if (!this.isOnlyCounter) {
                  if (this.smallCounter == 1) {
                    soughtSize = 1;
                  }
                } else if (this.highCounter) {
                  soughtSize = 2;
                }
                break;
              case 2:
                if (!this.isOnlyCounter) {
                  soughtSize = 1;

                  if (this.highCounter) {
                    styles.left = this.cellWidth;
                  }
                } else if (this.largeCounter) {
                  soughtSize = 4;
                } else if (this.highCounter) {
                  styles.left = this.cellWidth;
                  soughtSize = 2;
                }
                break;
              case 1:
                if (this.largeCounter) {
                  styles.left = this.cellWidth;
                  soughtSize = 4;
                } else {
                  styles.left = this.cellWidth * 2;
                  soughtSize = 2;
                }
            }

            if (this.isExist(styles, 'left')) {
              styles.left += 'px';
            }

            if (!soughtSize) {
              soughtSize = 1;
              isSmallSequence = true;
            } else if (soughtSize > 1) {
              styles.height = this.cellHeight * 2 + 'px';
            }

            if (toSetGridColStart && soughtSize == 1) {
              toSetGridColStart = false;
            }
          } else if (
            this.isLargeSizeByIndex(evenStepIndex) &&
            (this.largeCounter || !isEvenRow) &&
            prevEvenStepIndex - evenStepIndex <= 1 &&
            (this.largeCounter || isRowWithHighAsLarge)
          ) {
            if (this.largeCounter) {
              soughtSize = 4;
            } else {
              soughtSize = 2;
              this.isLastHigh = true;
            }
          } else if (
            this.isEvenHighSizeByIndex(evenStepIndex) &&
            isEvenRow &&
            isIncompleteLarges &&
            isRowWithHighAsLarge
          ) {
            soughtSize = 2;
            this.isLastHigh = true;
          } else {
            soughtSize = 0;
          }
        } else {
          isNotFoundSize = false;

          if (soughtSize == 4) {
            soughtSize = 2;
          } else if (!isSmallSequence && this.highCounter) {
            soughtSize = 2;
          } else {
            soughtSize = 1;
          }
        }

        // ---------------------------------- BEGIN FOR ---------------------------------

        for (
          sourceIndex = this.getFirstFoundIndex(soughtSize);
          !this.isTimeOut && sourceIndex < sourceArrayLength;
          sourceIndex++
        ) {
          if (this.isExist(this.tempArray[sourceIndex], 'sorted')) {
            this.incTimeOutCounter();
            continue;
          }

          if (!soughtSize && this.tempArray[sourceIndex].sourceSize < 3) {
            soughtSize = this.tempArray[sourceIndex].sourceSize;

            this.log({
              rowsCount,
              lastRow,
              countInLastRow,
              isEvenRow,
              prevRowIndex,
              rowIndex,
              isRowWithHighAsLarge,
              lastHighsStartRowIndex,
              prevEvenStepIndex,
              evenStepIndex,
              sourceIndex,
              prevSize,
              soughtSize,
              cellCounter,
              sortedCounter,
              toSetGridColStart,
              isOverlyLarges,
              isIncompleteLarges,
            });

            switch (soughtSize) {
              case 1:
                if (this.smallCounter > 1) {
                  isSmallSequence = true;
                  break;
                } else if (
                  this.highCounter ||
                  this.lastHighCounter ||
                  isOverlyLarges
                ) {
                  // if (this.lastHighCounter) {
                  //   this.highCounter++;
                  //   this.lastHighCounter--;
                  // } else
                  if (!this.highCounter && isOverlyLarges) {
                    toScaleDownBigSizes = true;
                  }

                  soughtSize = 2;

                  this.incTimeOutCounter();
                  continue;
                } else if (
                  rowIndex == lastRow
                  // && this.isOnlyCounter
                ) {
                  break;
                }
              case 2:
                if (soughtSize == 2) {
                  if (this.highCounter) {
                    break;
                  }
                }
              default:
                soughtSize = 0;

                this.incTimeOutCounter();
                continue;
            }

            // console.log(this.lastHighCounter);
            // console.log(this.highCounter);
            // console.log(this.cellID);
            // console.log(soughtSize);
            // console.log('--------------------------------');
          }

          areSizesMatched =
            soughtSize == this.tempArray[sourceIndex].sourceSize;

          if (areSizesMatched || toScaleDownBigSizes) {
            if (!toScaleDownBigSizes) {
              calcSize = this.tempArray[sourceIndex].sourceSize;
            } else {
              if (areSizesMatched) {
                calcSize = this.tempArray[sourceIndex].sourceSize;
              } else {
                switch (this.tempArray[sourceIndex].sourceSize) {
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

            if (toSetGridColStart) {
              switch (calcSize) {
                case 2:
                  if (
                    isRowWithHighAsLarge &&
                    prevSize == 1 &&
                    cellCounter % this.cellsCountInRow >= 2
                  ) {
                    if (
                      isEvenRow &&
                      !this.isEvenHighSizeByIndex(evenStepIndex)
                    ) {
                      this.cells[this.cells.length - 1].styles[
                        'grid-column-start'
                      ] = 1;
                    } else if (this.isEvenHighSizeByIndex(evenStepIndex)) {
                      this.cells[this.cells.length - 1].styles[
                        'grid-column-start'
                      ] = 2;
                    }
                  }
                  break;
                case 1:
                  if (isRowWithHighAsLarge) {
                    if (isEvenRow) {
                      if (
                        this.isLargeCell(evenStepIndex + 4) &&
                        prevSize == 1
                      ) {
                        styles['grid-column-start'] = 1;
                      } else if (this.isLargeCell(evenStepIndex + 3)) {
                        styles['grid-column-start'] = 2;
                      }
                    }
                  } else if (this.isLargeCell(evenStepIndex + 2)) {
                    styles['grid-column-start'] = 1;
                  }
              }
            }

            this.cells.push({
              evenStepIndex: evenStepIndex,
              key: this.isExist(this.tempArray[sourceIndex], 'key')
                ? this.tempArray[sourceIndex].key
                : ++this.cellID,
              sourceSize: this.tempArray[sourceIndex].sourceSize,
              calcSize: calcSize,
              styles: styles,
            });

            if (
              toSetGridColStart &&
              ((this.largeCounter &&
                (this.highCounter || this.lastHighCounter) &&
                !this.smallCounter) ||
                this.isOnlyCounter)
            ) {
              toSetGridColStart = false;
            }

            this.decSizeCounter(this.tempArray[sourceIndex].sourceSize);
            this.resetFirstFoundIndex(calcSize);
            this.tempArray[sourceIndex].sorted = true;
            sortedCounter++;

            prevRowIndex = rowIndex;
            cellCounter += calcSize;
            rowIndex = Math.floor(cellCounter / this.cellsCountInRow);

            if (rowIndex > prevRowIndex) {
              isRowWithHighAsLarge =
                lastHighsStartRowIndex >= 0 &&
                rowIndex >= lastHighsStartRowIndex;
              isEvenRow = !isEvenRow;

              if (rowIndex == lastRow && isEvenRow) {
                if (this.isOnlyCounter && this.smallCounter) {
                  isSmallSequence = true;
                } else {
                  // countInLastRow =
                  //   this.smallCounter +
                  //   this.highCounter * 2 +
                  //   this.lastHighCounter * 2 +
                  //   this.largeCounter * 4;

                  console.log(this.restCells);

                  if (this.restCells < this.cellsCountInRow) {
                    countInLastRow = sourceArrayLength - sortedCounter;

                    if (this.lastHighCounter) {
                      this.highCounter += this.lastHighCounter;
                      this.lastHighCounter = 0;
                    }
                  }
                  // else {
                  //   countInLastRow = 0;
                  // }
                }
              }
            }

            if (
              !isShiftedEvenStepIndex &&
              !this.largeCounter &&
              rowIndex == lastHighsStartRowIndex &&
              isEvenRow &&
              isIncompleteLarges &&
              !countInLastRow
            ) {
              prevEvenStepIndex = evenStepIndex;

              if (calcSize == 2) {
                evenStepIndex--;
              } else {
                evenStepIndex -= 2;
              }

              isShiftedEvenStepIndex = true;
            } else if (calcSize == 2) {
              evenStepIndex += 2;
            } else {
              evenStepIndex++;
            }

            prevSize = calcSize;
            styles = {};

            this.incTimeOutCounter();
            break;
          } else {
            this.setFirstFoundIndex(
              this.tempArray[sourceIndex].sourceSize,
              sourceIndex,
            );
          }

          this.incTimeOutCounter();
        }

        // ----------------------------------- END FOR ----------------------------------

        if (sourceIndex >= sourceArrayLength) {
          switch (soughtSize) {
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

          if (soughtSize) {
            this.resetFirstFoundIndex(soughtSize);
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
      { sourceSize: 2 },
      { sourceSize: 2 },
      // { sourceSize: 2 },
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
