new Vue({
  el: "#post-grid-demo",
  data: {
    totalWidth: 0,
    timeoutID: 0,
    cols: 3,
    firstIndexBeforeEvenLarge: 4,
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

      if (this.smallsCount) counter++;
      if (this.highsCount || this.lastHighsCount) counter++;
      if (this.largesCount) counter++;

      return counter == 1 ? true : false;
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
      if (!this.cells[index].beforeEvenLarge) return "";

      return {
        // "grid-row-start": this.cells[index].beforeEvenLarge,
        "grid-column-start": 1,
      };
    },
    classes: function (index) {
      return {
        cell: true,
        "cell-small": this.cells[index].sourceSize == 1,
        "cell-high--bg": this.cells[index].sourceSize == 2,
        "cell-large--bg": this.cells[index].sourceSize == 4,
        "cell-high": !this.isLessThenXL && this.cells[index].calcSize == 2,
        "cell-large--md":
          !this.isLessThenMD && this.isLessThenLG && this.cells[index].calcSize == 4,
        "cell-large--lg":
          !this.isLessThenLG && this.isLessThenXL && this.cells[index].calcSize == 4,
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
      const prop = this.getSizeName(size);

      if (this.firstFoundIndexes[prop] < 0) return 0;

      return this.firstFoundIndexes[prop];
    },
    getSize: function () {
      if (this.largesCount) return 4;
      if (this.highsCount) return 2;
      return 1;
    },
    getCompleteCellsCount: function (cells) {
      return cells * 4 + cells * 2;
    },
    getBlocks: function (cells) {
      return Math.ceil(cells / this.cellsCountInBlock);
    },
    decSizeCount: function (size) {
      switch (size) {
        case 4:
          this.largesCount--;
          break;
        case 2:
          if (this.isLastHigh) {
            this.lastHighsCount--;
            this.isLastHigh = false;
          } else {
            this.highsCount--;
          }
          break;
        case 1:
          this.smallsCount--;
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

      this.largesCount = 0;
      this.highsCount = 0;
      this.smallsCount = 0;
      this.lastHighsCount = 0;

      const tempArray = [];

      let isIncompleteBlock = false;
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
      let restCells = 0;
      let cellIndex = 0;

      let prevEvenStepIndex = 0;
      let evenStepIndex = 0;

      let sourceArrayLength = sourceArray.length;
      let sourceIndex;

      let sortedCount = 0;
      let beforeEvenLarge;
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
        const BlocksWithSmallsNHighsCount = Math.floor(this.smallsCount / 2) + this.highsCount;
        const scalingDownLargesCount = Math.ceil(
          (this.largesCount - BlocksWithSmallsNHighsCount) / 2,
        );
        console.log(this.largesCount);
        console.log(BlocksWithSmallsNHighsCount);
        console.log(scalingDownLargesCount);

        blocksCount = BlocksWithSmallsNHighsCount + scalingDownLargesCount;

        // isIncompleteBlock = !!isEvenSmallsCount;

        if (!this.highsCount && !this.smallsCount) {
          toSetBeforeEvenLarge = false;
        }
      } else {
        blocksCount = this.getBlocks(cellsCount);
        isIncompleteLarges = this.smallsCount > 0 && this.largesCount < blocksCount;

        if (isIncompleteLarges && this.highsCount) {
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
          (this.largesCount && this.highsCount && !this.smallsCount) ||
          this.isOnlyCounter
        ) {
          toSetBeforeEvenLarge = false;
        }

        isIncompleteBlock = !!(cellsCount % this.cellsCountInBlock);
      }

      lastBlock = blocksCount - 1;

      if (isIncompleteBlock) {
        restCells = cellsCount - lastBlock * this.cellsCountInBlock;
      }

      console.log(sourceArrayLength);
      console.log(cellsCount);
      console.log(blocksCount);
      console.log(lastBlock);
      console.log(lastHighsStartBlockIndex);
      console.log(restCells);
      console.log(isIncompleteBlock);
      console.log(isIncompleteLarges);

      cellsCount = 0;
      this.cells = [];

      while (sortedCount < sourceArrayLength) {
        if (!isNotFoundSize) {
          if (isSmallSequence) {
            if (this.smallsCount && (this.largesCount || this.highsCount || this.lastHighsCount)) {
              isSmallSequence = false;
            }
            soughtSize = 1;
          } else if (
            this.isLargeSizeByIndex(evenStepIndex) &&
            prevEvenStepIndex - evenStepIndex <= 1 &&
            (this.largesCount || isBlockWithHighAsLarge)
          ) {
            if (this.largesCount) {
              soughtSize = 4;
            } else {
              soughtSize = 2;
              this.isLastHigh = true;
            }
          } else if (
            this.isEvenHighSizeByIndex(evenStepIndex) &&
            isIncompleteLarges &&
            isBlockWithHighAsLarge
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
          } else if (!isSmallSequence && this.highsCount) {
            soughtSize = 2;
          } else {
            soughtSize = 1;
          }
        }

        if (!soughtSize) {
          sourceIndex = 0;
        } else {
          sourceIndex = this.getFirstFoundIndex(soughtSize);
        }

        for (; sourceIndex < sourceArrayLength; sourceIndex++) {
          if (this.isExist(tempArray[sourceIndex], "sorted")) {
            continue;
          }

          if (!soughtSize && tempArray[sourceIndex].sourceSize < 3) {
            soughtSize = tempArray[sourceIndex].sourceSize;

            if (soughtSize == 1) {
              isSmallSequence = true;
            }
          }

          if (soughtSize == tempArray[sourceIndex].sourceSize || toScaleDownBigSizes) {
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
                      if (this.largesCount || this.highsCount || this.lastHighsCount) {
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

            prevBlockIndex = blockIndex;
            cellsCount += calcSize;
            cellIndex += calcSize;
            blockIndex = Math.floor(cellIndex / this.cellsCountInBlock);

            if (blockIndex > prevBlockIndex) {
              isBlockWithHighAsLarge =
                lastHighsStartBlockIndex >= 0 && blockIndex >= lastHighsStartBlockIndex;
              isEvenBlock = !isEvenBlock;
            }

            if (toSetBeforeEvenLarge) {
              beforeEvenLarge = this.isLargeCell(evenStepIndex + 2) ? evenStepIndex : false;
            } else {
              beforeEvenLarge = false;
            }

            if (!isShiftedEvenStepIndex && !this.largesCount && isEvenBlock && isIncompleteLarges) {
              prevEvenStepIndex = evenStepIndex;
              evenStepIndex -= 2;
              isShiftedEvenStepIndex = true;
              toSetBeforeEvenLarge = false;
            } else if (calcSize == 2) {
              evenStepIndex += 2;
            } else {
              evenStepIndex++;
            }

            this.cells.push({
              key: this.isExist(tempArray[sourceIndex], "key")
                ? tempArray[sourceIndex].key
                : ++this.cellID,
              sourceSize: tempArray[sourceIndex].sourceSize,
              calcSize: calcSize,
              beforeEvenLarge: beforeEvenLarge,
            });

            this.decSizeCount(tempArray[sourceIndex].sourceSize);
            this.resetFirstFoundIndex(calcSize);
            tempArray[sourceIndex].sorted = true;
            sortedCount++;

            if (
              (toSetBeforeEvenLarge &&
                this.largesCount &&
                (this.highsCount || this.lastHighsCount) &&
                !this.smallsCount) ||
              this.isOnlyCounter
            ) {
              toSetBeforeEvenLarge = false;
            }

            break;
          } else {
            this.setFirstFoundIndex(tempArray[sourceIndex].sourceSize, sourceIndex);
          }
        }

        if (sourceIndex >= sourceArrayLength) {
          toScaleDownBigSizes = true;
          isNotFoundSize = true;
          this.resetFirstFoundIndex(soughtSize);
        }
      }
    },
  },
  created() {
    this.restructe([
      { sourceSize: 4 },
      { sourceSize: 4 },
      { sourceSize: 4 },
      { sourceSize: 1 },
      { sourceSize: 1 },
      { sourceSize: 1 },
      { sourceSize: 4 },
      { sourceSize: 4 },
      { sourceSize: 4 },
      { sourceSize: 1 },
      { sourceSize: 1 },
      { sourceSize: 1 },
      { sourceSize: 1 },
      { sourceSize: 1 },
      { sourceSize: 4 },
      { sourceSize: 4 },
      { sourceSize: 4 },
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
      { sourceSize: 1 },
      { sourceSize: 1 },
      { sourceSize: 1 },
      { sourceSize: 1 },
      { sourceSize: 1 },
      { sourceSize: 2 },
      { sourceSize: 2 },
      { sourceSize: 2 },
      { sourceSize: 2 },
      { sourceSize: 2 },
      { sourceSize: 2 },
      { sourceSize: 2 },
      { sourceSize: 2 },
      { sourceSize: 2 },
      { sourceSize: 2 },
      { sourceSize: 2 },
      { sourceSize: 2 },
      { sourceSize: 2 },
      { sourceSize: 2 },
      { sourceSize: 2 },
      { sourceSize: 2 },
      { sourceSize: 2 },
      { sourceSize: 2 },
      { sourceSize: 2 },
      { sourceSize: 2 },
      { sourceSize: 2 },
      { sourceSize: 2 },
      { sourceSize: 2 },
      { sourceSize: 2 },
      { sourceSize: 2 },
      { sourceSize: 2 },
      { sourceSize: 2 },
      { sourceSize: 2 },
      { sourceSize: 2 },
      { sourceSize: 2 },
      { sourceSize: 2 },
      { sourceSize: 2 },
      { sourceSize: 2 },
      { sourceSize: 2 },
      { sourceSize: 2 },
      { sourceSize: 2 },
      { sourceSize: 2 },
      { sourceSize: 2 },
      { sourceSize: 2 },
      { sourceSize: 2 },
      { sourceSize: 2 },
      { sourceSize: 2 },
      { sourceSize: 2 },
      { sourceSize: 2 },
      { sourceSize: 2 },
      { sourceSize: 2 },
      { sourceSize: 2 },
      { sourceSize: 2 },
      { sourceSize: 2 },
      { sourceSize: 2 },
      { sourceSize: 2 },
      { sourceSize: 2 },
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
      }, 200);
    });
  },
});
