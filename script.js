new Vue({
  el: "#post-grid-demo",
  data: {
    isLastHigh: false,
    totalWidth: 0,
    timeoutID: 0,
    cols: 3,
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
    largesCount: 0,
    highsCount: 0,
    smallsCount: 0,
    lastHighsCount: 0,
    cells: [],
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

      if (this.smallsCount > 0) counter++;
      if (this.highsCount > 0 || this.lastHighsCount > 0) counter++;
      if (this.largesCount > 0) counter++;

      return counter == 1 ? true : false;
    },
    restCells: function () {
      return (
        this.smallsCount +
        this.highsCount * 2 +
        this.lastHighsCount * 2 +
        this.largesCount * 4
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
      if (this.isLessThenXL) return "";
      if (!this.cells[index].styleGridColStart) return "";

      return "grid-column-start: " + this.cells[index].styleGridColStart;
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
      return 0;
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
    setSizeCount: function (size) {
      size--;

      if (size < 0) size = 0;

      return size;
    },
    decSizeCount: function (size) {
      switch (size) {
        case 4:
          // this.largesCount--;
          this.largesCount = this.setSizeCount(this.largesCount);
          break;
        case 2:
          if (this.isLastHigh) {
            // this.lastHighsCount--;
            this.lastHighsCount = this.setSizeCount(this.lastHighsCount);
            this.isLastHigh = false;
          } else {
            // this.highsCount--;
            this.highsCount = this.setSizeCount(this.highsCount);
          }
          break;
        case 1:
          // this.smallsCount--;
          this.smallsCount = this.setSizeCount(this.smallsCount);
      }
    },
    addCell: function (sourceData, calcData) {
      this.cells.push({
        evenStepIndex: calcData.evenStepIndex,
        key: sourceData.key >= 0 ? sourceData.key : ++this.cellID,
        sourceSize: sourceData.sourceSize,
        calcSize: calcData.calcSize,
        styleGridColStart: calcData.styleGridColStart,
      });
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

      this.largesCount = 0;
      this.highsCount = 0;
      this.smallsCount = 0;
      this.lastHighsCount = 0;

      const tempArray = [];

      let isEvenBlock = false;

      let isIncompleteLarges = false;
      let toSetBeforeEvenLarge = true;
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

      let cellsCount = 0;
      let cellIndex = 0;

      let gaps = 0;

      let prevEvenStepIndex = 0;
      let evenStepIndex = 0;

      let sourceArrayLength = sourceArray.length;
      let sourceIndex;

      let sortedCount = 0;
      let styleGridColStart;
      let soughtSize;
      let calcSize;

      for (let index = 0; index < sourceArrayLength; index++) {
        switch (sourceArray[index].sourceSize) {
          case 4:
            this.largesCount++;
            break;
          case 2:
            this.highsCount++;
            break;
          case 1:
            this.smallsCount++;
        }

        cellsCount += sourceArray[index].sourceSize;
        tempArray.push(sourceArray[index]);
      }

      if (cellsCount < this.getCompleteCellsCount(this.largesCount)) {
        const BlocksWithSmallsNHighsCount =
          Math.floor(this.smallsCount / 2) + this.highsCount;
        const scalingDownLargesCount = Math.ceil(
          (this.largesCount - BlocksWithSmallsNHighsCount) / 2
        );

        blocksCount = BlocksWithSmallsNHighsCount + scalingDownLargesCount;

        if (this.highsCount <= 0 && this.smallsCount <= 0) {
          toSetBeforeEvenLarge = false;
        }
      } else {
        blocksCount = this.getBlocks(cellsCount);
        isIncompleteLarges =
          this.smallsCount > 0 && this.largesCount < blocksCount;

        if (isIncompleteLarges && this.highsCount > 0) {
          const diff = blocksCount - this.largesCount;

          if (diff < this.highsCount) {
            this.lastHighsCount = diff;
          } else {
            this.lastHighsCount = this.highsCount;
          }

          this.highsCount -= this.lastHighsCount;

          lastHighsStartBlockIndex = blocksCount - diff;
          isBlockWithHighAsLarge = blockIndex >= lastHighsStartBlockIndex;
        } else if (
          (this.largesCount > 0 &&
            this.highsCount > 0 &&
            this.smallsCount <= 0) ||
          this.isOnlyCounter
        ) {
          toSetBeforeEvenLarge = false;
        }
      }

      lastBlock = blocksCount - 1;

      console.log(blocksCount);
      console.log(lastBlock);
      console.log(this.highsCount);
      console.log(this.lastHighsCount);
      console.log(lastHighsStartBlockIndex);
      console.log(isIncompleteLarges);

      cellsCount = 0;
      this.cells = [];

      while (sortedCount < sourceArrayLength) {
        if (!isNotFoundSize) {
          if (isSmallSequence) {
            if (
              this.smallsCount > 0 &&
              (this.largesCount > 0 ||
                this.highsCount > 0 ||
                this.lastHighsCount > 0)
            ) {
              isSmallSequence = false;
            }
            soughtSize = 1;
          } else if (
            this.isLargeSizeByIndex(evenStepIndex) &&
            (this.largesCount > 0 || !isEvenBlock) &&
            prevEvenStepIndex - evenStepIndex <= 1 &&
            (this.largesCount > 0 || isBlockWithHighAsLarge)
          ) {
            if (this.largesCount > 0) {
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
          } else if (gaps) {
            switch (sourceArrayLength - sortedCount) {
              case 5:
              case 4:
                if (!this.isOnlyCounter) {
                  soughtSize = 1;
                  isSmallSequence = true;
                  break;
                }
              case 3:
                if (!this.isOnlyCounter) {
                  soughtSize = 1;

                  if (this.smallsCount > 1) {
                    isSmallSequence = true;
                  }
                  break;
                }
              case 2:
                if (!this.isOnlyCounter) {
                  if (this.largesCount == 1 || this.highsCount == 1) {
                    soughtSize = 1;
                  }
                  break;
                } else {
                  if (this.highsCount > 0) {
                    soughtSize = 2;
                    break;
                  }
                }
              case 1:
                if (this.largesCount == 1) {
                  soughtSize = 4;
                  break;
                } else if (this.highsCount == 1) {
                  soughtSize = 2;
                  break;
                }
              default:
                gaps = 0;
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
          } else if (!isSmallSequence && this.highsCount > 0) {
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
          if (this.isExist(tempArray[sourceIndex], "sorted")) {
            continue;
          }

          if (!soughtSize && tempArray[sourceIndex].sourceSize < 3) {
            soughtSize = tempArray[sourceIndex].sourceSize;

            // console.log("--------------------------------");
            // console.log(this.lastHighsCount);
            // console.log(this.highsCount);
            // console.log(sourceIndex);
            // console.log(soughtSize);

            switch (soughtSize) {
              case 2:
                if (this.highsCount <= 0) {
                  soughtSize = 0;
                  continue;
                }
                break;
              case 1:
                isSmallSequence = true;
            }

            // console.log(this.lastHighsCount);
            // console.log(this.highsCount);
            // console.log(this.cellID);
            // console.log(soughtSize);
            // console.log("--------------------------------");
          }

          if (
            soughtSize == tempArray[sourceIndex].sourceSize ||
            toScaleDownBigSizes
          ) {
            if (!toScaleDownBigSizes) {
              calcSize = tempArray[sourceIndex].sourceSize;
            } else {
              if (soughtSize == tempArray[sourceIndex].sourceSize) {
                calcSize = tempArray[sourceIndex].sourceSize;
              } else {
                switch (tempArray[sourceIndex].sourceSize) {
                  case 4:
                    if (!isSmallSequence) {
                      calcSize = 2;
                    } else {
                      if (
                        this.largesCount > 0 ||
                        this.highsCount > 0 ||
                        this.lastHighsCount > 0
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

            styleGridColStart = 0;

            if (soughtSize == 1 && toSetBeforeEvenLarge) {
              if (isBlockWithHighAsLarge) {
                if (isEvenBlock) {
                  if (this.isLargeCell(evenStepIndex + 4)) {
                    styleGridColStart = 1;
                  } else if (this.isLargeCell(evenStepIndex + 3)) {
                    styleGridColStart = 2;
                  }
                }
              } else if (this.isLargeCell(evenStepIndex + 2)) {
                styleGridColStart = 1;
              }
            }

            this.addCell(
              {
                key: tempArray[sourceIndex].key,
                sourceSize: tempArray[sourceIndex].sourceSize,
              },
              {
                evenStepIndex: evenStepIndex,
                calcSize: calcSize,
                styleGridColStart: styleGridColStart,
              }
            );

            this.decSizeCount(tempArray[sourceIndex].sourceSize);
            this.resetFirstFoundIndex(calcSize);
            tempArray[sourceIndex].sorted = true;
            sortedCount++;

            prevBlockIndex = blockIndex;
            cellsCount += calcSize;
            cellIndex += calcSize;
            blockIndex = Math.floor(cellIndex / this.cellsCountInBlock);

            if (blockIndex > prevBlockIndex) {
              isBlockWithHighAsLarge =
                lastHighsStartBlockIndex >= 0 &&
                blockIndex >= lastHighsStartBlockIndex;
              isEvenBlock = !isEvenBlock;

              if (blockIndex == lastBlock) {
                gaps =
                  this.cellsCountInBlock -
                  this.smallsCount -
                  this.highsCount * 2 -
                  this.lastHighsCount * 2 -
                  this.largesCount * 4;

                if (this.lastHighsCount > 0 && gaps) {
                  this.highsCount += this.lastHighsCount;
                  this.lastHighsCount = 0;
                }

                if (!isEvenBlock) {
                  gaps = 0;
                }
              }
            }

            if (
              !isShiftedEvenStepIndex &&
              this.largesCount <= 0 &&
              blockIndex == lastHighsStartBlockIndex &&
              isEvenBlock &&
              isIncompleteLarges
            ) {
              prevEvenStepIndex = evenStepIndex;
              evenStepIndex -= 2;
              isShiftedEvenStepIndex = true;
              // toSetBeforeEvenLarge = false;
            } else if (calcSize == 2) {
              evenStepIndex += 2;
            } else {
              evenStepIndex++;
            }

            if (
              (toSetBeforeEvenLarge &&
                this.largesCount > 0 &&
                (this.highsCount > 0 || this.lastHighsCount > 0) &&
                this.smallsCount <= 0) ||
              this.isOnlyCounter
            ) {
              toSetBeforeEvenLarge = false;
            }

            break;
          } else {
            this.setFirstFoundIndex(
              tempArray[sourceIndex].sourceSize,
              sourceIndex
            );
          }
        }

        if (sourceIndex >= sourceArrayLength) {
          switch (soughtSize) {
            case 4:
              if (this.largesCount > 0) break;
            case 2:
              if (this.highsCount > 0 || this.lastHighsCount > 0) break;
            case 1:
              if (this.smallsCount > 0) break;
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
    this.restructe([
      { sourceSize: 1 },
      { sourceSize: 1 },
      { sourceSize: 1 },
      { sourceSize: 1 },
      { sourceSize: 2 },
      { sourceSize: 1 },
      { sourceSize: 2 },
      { sourceSize: 1 },
      { sourceSize: 4 },
      { sourceSize: 4 },
      { sourceSize: 4 },
      { sourceSize: 4 },
      { sourceSize: 2 },
      { sourceSize: 1 },
      { sourceSize: 2 },
    ]);
  },
  mounted() {
    $vm = this;

    window.addEventListener("resize", function () {
      if ($vm.timeoutID) {
        clearTimeout($vm.timeoutID);
      }
      $vm.timeoutID = setTimeout(function () {
        $vm.restructe($vm.cells);
      }, 1000);
    });
  },
});