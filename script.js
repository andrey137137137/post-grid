new Vue({
  el: "#post-grid-demo",
  data: {
    isLastHigh: false,
    totalWidth: 0,
    timeoutID: 0,
    cols: 3,
    cellWidth: 100,
    cellHeight: 100,
    cellID: -1,
    breakpoints: {
      xl: 1200,
      lg: 922,
      md: 768,
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
    cellsCountInBlock: function () {
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
        "grid-template":
          "repeat(" +
          Math.ceil(this.cells.length / this.cols) * 2 +
          ", " +
          this.cellHeight +
          "px) / repeat(" +
          this.cols +
          ", 1fr)",
      };
    },
    isOnlyCounter: function () {
      let counter = 0;

      if (this.smallCounter > 0) counter++;
      if (this.highCounter > 0 || this.lastHighCounter > 0) counter++;
      if (this.largeCounter > 0) counter++;

      return counter == 1 ? true : false;
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

      if (!this.isLessThenXL) return isEven && isThreeMultiple;

      return isThreeMultiple;
    },
    evenBeforeLargeStyle: function (index) {
      const styles = {};

      if (!this.isLessThenXL && this.cells[index].gridColStart) {
        styles["grid-column-start"] = this.cells[index].gridColStart;
      }

      if (!this.isLessThenMD && this.cells[index].marginLeft) {
        styles.left = this.cells[index].marginLeft + "px";
      }

      return styles;
    },
    classes: function (index) {
      return {
        cell: true,
        "cell-small": this.cells[index].sourceSize == 1,
        "cell-high--bg": this.cells[index].sourceSize == 2,
        "cell-large--bg": this.cells[index].sourceSize == 4,
        "cell-high": !this.isLessThenXL && this.cells[index].calcSize == 2,
        "cell-large--md":
          !this.isLessThenMD &&
          this.isLessThenLG &&
          this.cells[index].calcSize == 4,
        "cell-large--lg":
          !this.isLessThenLG &&
          this.isLessThenXL &&
          this.cells[index].calcSize == 4,
        "cell-large--xl": !this.isLessThenXL && this.cells[index].calcSize == 4,
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
          return "small";
        case 2:
          return "high";
        case 4:
          return "large";
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
      // return 0;
      if (!size) return 0;

      const prop = this.getSizeName(size);

      if (this.firstFoundIndexes[prop] < 0) return 0;
      return this.firstFoundIndexes[prop];
    },
    getCompleteCellsCount: function (cells) {
      return cells * 4 + cells * 2;
    },
    getBlocks: function (cells) {
      return Math.ceil(cells / this.cellsCountInBlock);
    },
    setSizeCounter: function (size) {
      size--;

      if (size < 0) size = 0;

      return size;
    },
    decSizeCounter: function (size) {
      switch (size) {
        case 4:
          // this.largeCounter--;
          this.largeCounter = this.setSizeCounter(this.largeCounter);
          break;
        case 2:
          if (this.isLastHigh) {
            // this.lastHighCounter--;
            this.lastHighCounter = this.setSizeCounter(this.lastHighCounter);
            this.isLastHigh = false;
          } else {
            // this.highCounter--;
            this.highCounter = this.setSizeCounter(this.highCounter);
          }
          break;
        case 1:
          // this.smallCounter--;
          this.smallCounter = this.setSizeCounter(this.smallCounter);
      }
    },
    isExist: function (obj, prop) {
      return Object.prototype.hasOwnProperty.call(obj, prop);
    },
    config: function () {
      this.totalWidth = window.innerWidth;

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
    restructe(sourceArray) {
      this.config();

      this.tempArray = [];

      this.largeCounter = 0;
      this.highCounter = 0;
      this.smallCounter = 0;
      this.lastHighCounter = 0;

      let isEvenBlock = false;

      let isOverlyLarges = false;
      let isIncompleteLarges = false;
      let isIncompleteLastBlock = false;
      let toSetGridColStart = true;
      let isBlockWithHighAsLarge;

      let toScaleDownBigSizes = false;
      let isNotFoundSize = false;

      let isSmallSequence = false;
      let isShiftedEvenStepIndex = false;

      let blocksCount = 0;
      let lastBlock;
      let prevBlockIndex = 0;
      let blockIndex = 0;
      let lastHighsStartBlockIndex = -1;

      let cellCounter = 0;
      let prevSize = 0;

      let prevEvenStepIndex = 0;
      let evenStepIndex = 0;

      let sourceArrayLength = sourceArray.length;
      let sourceIndex;

      let sortedCounter = 0;
      let countInLastBlock = 0;
      let marginLeft = 0;
      let gridColStart;
      let soughtSize;
      let calcSize;

      for (let index = 0; index < sourceArrayLength; index++) {
        switch (sourceArray[index].sourceSize) {
          case 4:
            this.largeCounter++;
            break;
          case 2:
            this.highCounter++;
            break;
          case 1:
            this.smallCounter++;
        }

        cellCounter += sourceArray[index].sourceSize;
        this.tempArray.push(sourceArray[index]);
      }

      if (cellCounter < this.getCompleteCellsCount(this.largeCounter)) {
        const BlocksWithSmallsNHighCounter =
          Math.floor(this.smallCounter / 2) + this.highCounter;
        const scalingDownLargeCounter = Math.ceil(
          (this.largeCounter - BlocksWithSmallsNHighCounter) / 2
        );

        blocksCount = BlocksWithSmallsNHighCounter + scalingDownLargeCounter;

        if (this.highCounter <= 0 && this.smallCounter <= 0) {
          toSetGridColStart = false;
        }

        isOverlyLarges = true;
      } else {
        blocksCount = this.getBlocks(cellCounter);
        isIncompleteLarges =
          this.smallCounter > 0 && this.largeCounter < blocksCount;

        if (isIncompleteLarges && this.highCounter > 0) {
          const diff = blocksCount - this.largeCounter;

          if (diff < this.highCounter) {
            this.lastHighCounter = diff;
          } else {
            this.lastHighCounter = this.highCounter;
          }

          this.highCounter -= this.lastHighCounter;

          lastHighsStartBlockIndex = blocksCount - diff;
          isBlockWithHighAsLarge = blockIndex >= lastHighsStartBlockIndex;
        } else if (
          (this.largeCounter > 0 &&
            this.highCounter > 0 &&
            this.smallCounter <= 0) ||
          this.isOnlyCounter
        ) {
          toSetGridColStart = false;
        }
      }

      lastBlock = blocksCount - 1;

      console.log(blocksCount);
      console.log(lastBlock);
      console.log(this.highCounter);
      console.log(this.lastHighCounter);
      console.log(lastHighsStartBlockIndex);
      console.log(isOverlyLarges);
      console.log(isIncompleteLarges);

      cellCounter = 0;
      this.cells = [];

      while (sortedCounter < sourceArrayLength) {
        if (!isNotFoundSize) {
          if (isSmallSequence) {
            if (
              this.smallCounter > 0 &&
              (this.largeCounter > 0 ||
                this.highCounter > 0 ||
                this.lastHighCounter > 0)
            ) {
              isSmallSequence = false;
            }
            soughtSize = 1;
          } else if (
            this.isLargeSizeByIndex(evenStepIndex) &&
            (this.largeCounter > 0 || !isEvenBlock) &&
            prevEvenStepIndex - evenStepIndex <= 1 &&
            (this.largeCounter > 0 || isBlockWithHighAsLarge)
          ) {
            if (this.largeCounter > 0) {
              soughtSize = 4;
            } else {
              soughtSize = 2;
              this.isLastHigh = true;
            }
          } else if (
            this.isEvenHighSizeByIndex(evenStepIndex) &&
            isEvenBlock &&
            isIncompleteLarges &&
            isBlockWithHighAsLarge
          ) {
            soughtSize = 2;
            this.isLastHigh = true;
          } else if (countInLastBlock) {
            soughtSize = 0;

            switch (countInLastBlock) {
              case 5:
                break;
              case 4:
                if (!this.isOnlyCounter) {
                  soughtSize = 1;
                  isSmallSequence = true;
                }
                break;
              case 3:
                if (!this.isOnlyCounter) {
                  soughtSize = 1;

                  if (this.smallCounter > 1) {
                    isSmallSequence = true;
                  }
                }
                break;
              case 2:
                if (!this.isOnlyCounter) {
                  if (this.largeCounter == 1 || this.highCounter == 1) {
                    soughtSize = 1;
                  }
                } else if (this.smallCounter > 0) {
                  soughtSize = 1;
                } else if (this.highCounter > 0) {
                  marginLeft = this.cellWidth;
                  soughtSize = 2;
                } else {
                  soughtSize = 4;
                }
                break;
              case 1:
                if (this.largeCounter == 1) {
                  marginLeft = this.cellWidth;
                  soughtSize = 4;
                } else if (this.highCounter == 1) {
                  marginLeft = this.cellWidth * 2;
                  soughtSize = 2;
                }
            }

            if (!soughtSize) {
              marginLeft = 0;
              soughtSize = 1;
              isSmallSequence = true;
            }
          } else {
            soughtSize = 0;
          }
        } else {
          isNotFoundSize = false;

          if (soughtSize == 4) {
            soughtSize = 2;
          } else if (!isSmallSequence && this.highCounter > 0) {
            soughtSize = 2;
          } else {
            soughtSize = 1;
          }
        }

        for (
          sourceIndex = this.getFirstFoundIndex(soughtSize);
          sourceIndex < sourceArrayLength;
          sourceIndex++
        ) {
          if (this.isExist(this.tempArray[sourceIndex], "sorted")) {
            continue;
          }

          if (!soughtSize && this.tempArray[sourceIndex].sourceSize < 3) {
            soughtSize = this.tempArray[sourceIndex].sourceSize;

            // console.log("--------------------------------");
            // console.log(this.lastHighCounter);
            // console.log(this.highCounter);
            // console.log(sourceIndex);
            // console.log(soughtSize);

            switch (soughtSize) {
              case 1:
                if (this.smallCounter > 1) {
                  isSmallSequence = true;
                  break;
                } else if (this.highCounter <= 0 && this.lastHighCounter > 0) {
                  this.highCounter++;
                  this.lastHighCounter--;
                }
              case 2:
                if (soughtSize == 2) {
                  if (this.highCounter > 0) break;
                }
              default:
                soughtSize = 0;
                continue;
            }

            // console.log(this.lastHighCounter);
            // console.log(this.highCounter);
            // console.log(this.cellID);
            // console.log(soughtSize);
            // console.log("--------------------------------");
          }

          if (
            soughtSize == this.tempArray[sourceIndex].sourceSize ||
            toScaleDownBigSizes
          ) {
            if (!toScaleDownBigSizes) {
              calcSize = this.tempArray[sourceIndex].sourceSize;
            } else {
              if (soughtSize == this.tempArray[sourceIndex].sourceSize) {
                calcSize = this.tempArray[sourceIndex].sourceSize;
              } else {
                switch (this.tempArray[sourceIndex].sourceSize) {
                  case 4:
                    if (!isSmallSequence) {
                      calcSize = 2;
                    } else {
                      if (
                        this.largeCounter > 0 ||
                        this.highCounter > 0 ||
                        this.lastHighCounter > 0
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

                if (!this.isOnlyCounter) {
                  toScaleDownBigSizes = false;
                }
              }
            }

            gridColStart = 0;

            if (toSetGridColStart) {
              switch (calcSize) {
                case 2:
                  if (
                    isBlockWithHighAsLarge &&
                    prevSize == 1 &&
                    cellCounter % this.cellsCountInBlock >= 2
                  ) {
                    if (
                      isEvenBlock &&
                      !this.isEvenHighSizeByIndex(evenStepIndex)
                    ) {
                      this.cells[this.cells.length - 1].gridColStart = 1;
                    } else if (this.isEvenHighSizeByIndex(evenStepIndex)) {
                      this.cells[this.cells.length - 1].gridColStart = 2;
                    }
                  }
                  break;
                case 1:
                  if (isBlockWithHighAsLarge) {
                    if (isEvenBlock) {
                      if (
                        this.isLargeCell(evenStepIndex + 4) &&
                        prevSize == 1
                      ) {
                        gridColStart = 1;
                      } else if (this.isLargeCell(evenStepIndex + 3)) {
                        gridColStart = 2;
                      }
                    }
                  } else if (this.isLargeCell(evenStepIndex + 2)) {
                    gridColStart = 1;
                  }
              }
            }

            this.cells.push({
              evenStepIndex: evenStepIndex,
              key: this.isExist(this.tempArray[sourceIndex], "key")
                ? this.tempArray[sourceIndex].key
                : ++this.cellID,
              sourceSize: this.tempArray[sourceIndex].sourceSize,
              calcSize: calcSize,
              marginLeft: marginLeft,
              gridColStart: gridColStart,
            });

            if (
              (toSetGridColStart &&
                this.largeCounter > 0 &&
                (this.highCounter > 0 || this.lastHighCounter > 0) &&
                this.smallCounter <= 0) ||
              this.isOnlyCounter
            ) {
              toSetGridColStart = false;
            }

            this.decSizeCounter(this.tempArray[sourceIndex].sourceSize);
            this.resetFirstFoundIndex(calcSize);
            this.tempArray[sourceIndex].sorted = true;
            sortedCounter++;

            prevBlockIndex = blockIndex;
            cellCounter += calcSize;
            blockIndex = Math.floor(cellCounter / this.cellsCountInBlock);

            if (blockIndex > prevBlockIndex) {
              isBlockWithHighAsLarge =
                lastHighsStartBlockIndex >= 0 &&
                blockIndex >= lastHighsStartBlockIndex;
              isEvenBlock = !isEvenBlock;

              if (blockIndex == lastBlock && isEvenBlock) {
                isIncompleteLastBlock = !!(
                  this.cellsCountInBlock -
                  this.smallCounter -
                  this.highCounter * 2 -
                  this.lastHighCounter * 2 -
                  this.largeCounter * 4
                );

                if (isIncompleteLastBlock) {
                  if (this.lastHighCounter > 0) {
                    this.highCounter += this.lastHighCounter;
                    this.lastHighCounter = 0;
                  }

                  countInLastBlock = sourceArrayLength - sortedCounter;
                }
              }
            }

            if (
              !isShiftedEvenStepIndex &&
              this.largeCounter <= 0 &&
              blockIndex == lastHighsStartBlockIndex &&
              isEvenBlock &&
              isIncompleteLarges
            ) {
              prevEvenStepIndex = evenStepIndex;
              evenStepIndex -= 2;
              isShiftedEvenStepIndex = true;
              // toSetGridColStart = false;
            } else if (calcSize == 2) {
              evenStepIndex += 2;
            } else {
              evenStepIndex++;
            }

            prevSize = calcSize;

            break;
          } else {
            this.setFirstFoundIndex(
              this.tempArray[sourceIndex].sourceSize,
              sourceIndex
            );
          }
        }

        if (sourceIndex >= sourceArrayLength) {
          switch (soughtSize) {
            case 4:
              if (this.largeCounter > 0) break;
            case 2:
              if (this.highCounter > 0 || this.lastHighCounter > 0) break;
            case 1:
              if (this.smallCounter > 0) break;
            default:
              toScaleDownBigSizes = true;
          }
          isNotFoundSize = true;
          this.resetFirstFoundIndex(soughtSize);
        }
      }
    },
  },
  created() {
    this.restructe([{ sourceSize: 4 }, { sourceSize: 4 }, { sourceSize: 4 }]);
  },
  mounted() {
    $vm = this;

    window.addEventListener("resize", function () {
      if ($vm.timeoutID) {
        clearTimeout($vm.timeoutID);
      }
      $vm.timeoutID = setTimeout(function () {
        $vm.restructe($vm.cells);
      }, 500);
    });
  },
});
