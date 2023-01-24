"use strict";
exports.__esModule = true;
var grid_interface_1 = require("./grid.interface");
// make a maximum of 8 total strings in the themedSeed array
var themedSeed = ['tomato', 'plantain', 'apple'];
var minimumWordLength = 3;
var maximumWordLength = 13;
var minimumWordCount = 25; // The best crosswords have upwards of 60 words in a 15x15. This is introduced purely for ease of testing.
var allowedIterations = 100000; // This prevents us being stuck due to lack of backtracking or extraordinarily bad seeds.
function makeBlankGrid(height, length) {
    if (height === void 0) { height = 15; }
    if (length === void 0) { length = 15; }
    var multiArray = new Array(length);
    var emptyNode = { character: '-', correctAnswerCharacter: '', isBlackedOut: true, isFilled: false, isStartOfWord: false, isStartOfHorizontalWord: false, isStartOfVerticalWord: false, startsClue: -1, adjacent: false };
    for (var i = 0; i < multiArray.length; i++) {
        multiArray[i] = new Array(height);
    }
    for (var i = 0; i < length; i++) {
        for (var j = 0; j < height; j++) {
            multiArray[i][j] = emptyNode;
        }
    }
    return { grid: multiArray, words: [], clues: [], height: height, length: length };
}
// An optional function to force certain squares to be blacked out.
// This can be used to make art and funny shapes.
// the function will accept an array of coordinates and set the corresponding squares to blacked out.
// function forceBlackout(crossWord: Crossword, coordinates: number[][]): Crossword {
//     for(let i = 0; i < coordinates.length; i++) {
//         crossWord.grid[coordinates[i][0]][coordinates[i][1]].isBlackedOut = true;
//     }
//     return crossWord;
// }
function displayCrossword(crossWord) {
    // console.log('crossword grid[0][0]: ', crossWord.grid[0][0]);
    for (var i = 0; i < crossWord.length; i++) {
        var row = '';
        // console.log('row: ', nodeRow);
        for (var j = 0; j < crossWord.height; j++) {
            row += crossWord.grid[j][i].character;
        }
        console.log(row);
    }
}
// function for generating the initial word layout
function generateWordLayout() {
    // invoke the blank grid generator
    var crossWord = makeBlankGrid();
    // loop through each word in themedSeed
    for (var i = 0; i < themedSeed.length; i++) {
        var currentWord = themedSeed[i];
        // generate horizontal or vertical orientation
        var orientation_1 = Math.floor(Math.random() * 2) === 0 ? grid_interface_1.ORIENTATION.HORIZONTAL : grid_interface_1.ORIENTATION.VERTICAL;
        // generate a random starting point
        var xStartIndex = getStartXIndex(currentWord, crossWord.height, crossWord.length, orientation_1);
        var yStartIndex = getStartYIndex(currentWord, crossWord.height, crossWord.length, orientation_1);
        // check if any of the characters in the currentWord will overwrite another WordNode in crossWord.grid with adjacent: true or with a different letter than the one in the currentWord
        var isOverwriting = checkIfOverwriting(crossWord, currentWord, xStartIndex, yStartIndex, orientation_1);
        // if the word is overwriting, decrement i and try again
        if (isOverwriting) {
            i--;
            continue;
        }
        // generate the end index
        var xEndIndex = xStartIndex + currentWord.length;
        var yEndIndex = yStartIndex + currentWord.length;
        // if the word goes out of bounds, adjust the start index
        // add the word to the crossword
        var wordObj = { orientation: orientation_1,
            xStartIndex: xStartIndex,
            yStartIndex: yStartIndex,
            xEndIndex: xEndIndex,
            yEndIndex: yEndIndex,
            length: currentWord.length,
            characters: currentWord };
        crossWord.words.push(wordObj);
        // add each letter of the word to the corresponding grid space
        for (var j = 0; j < currentWord.length; j++) {
            var node = { character: currentWord[j], correctAnswerCharacter: currentWord[j], isBlackedOut: false, isFilled: true, isStartOfWord: false, startsClue: -1 };
            if (orientation_1 === grid_interface_1.ORIENTATION.HORIZONTAL) {
                crossWord.grid[xStartIndex + j][yStartIndex] = node;
                setAdjacentProperty(crossWord, node, xStartIndex + j, yStartIndex);
            }
            else {
                crossWord.grid[xStartIndex][yStartIndex + j] = node;
                setAdjacentProperty(crossWord, node, xStartIndex, yStartIndex + j);
            }
        }
    }
    return crossWord;
}
// write a function that checks if the current word will overwrite another word in the crossword using the adjacent property
function checkIfOverwriting(crossWord, word, xStartIndex, yStartIndex, orientation) {
    // loop through each letter in the word
    for (var i = 0; i < word.length; i++) {
        // if the orientation is horizontal, check the xIndex
        if (orientation === grid_interface_1.ORIENTATION.HORIZONTAL) {
            // if the xIndex is out of bounds, return true
            if (xStartIndex + i >= crossWord.length) {
                return true;
            }
            // if the node at the xIndex is adjacent, return true
            if (crossWord.grid[xStartIndex + i][yStartIndex].adjacent) {
                return true;
            }
            // if the node at the xIndex has a different character than the current letter in the word, return true
            if (crossWord.grid[xStartIndex + i][yStartIndex].character !== word[i]) {
                return true;
            }
        }
        else {
            // if the yIndex is out of bounds, return true
            if (yStartIndex + i >= crossWord.height) {
                return true;
            }
            // if the node at the yIndex is adjacent, return true
            if (crossWord.grid[xStartIndex][yStartIndex + i].adjacent) {
                return true;
            }
            // if the node at the yIndex has a different character than the current letter in the word, return true
            if (crossWord.grid[xStartIndex][yStartIndex + i].character !== word[i]) {
                return true;
            }
        }
    }
    return false;
}
// write a function that sets the adjacent property of all nodes adjacent to the current node to true
function setAdjacentProperty(crossWord, node, xIndex, yIndex) {
    // if the xIndex is less than 0, don't try to set the adjacent property of the nodes that are out of bounds
    if (xIndex - 1 >= 0) {
        crossWord.grid[xIndex - 1][yIndex].adjacent = true;
    }
    if (xIndex + 1 < crossWord.length) {
        crossWord.grid[xIndex + 1][yIndex].adjacent = true;
    }
    if (yIndex - 1 >= 0) {
        crossWord.grid[xIndex][yIndex - 1].adjacent = true;
    }
    if (yIndex + 1 < crossWord.height) {
        crossWord.grid[xIndex][yIndex + 1].adjacent = true;
    }
    if (xIndex - 1 >= 0 && yIndex - 1 >= 0) {
        crossWord.grid[xIndex - 1][yIndex - 1].adjacent = true;
    }
    if (xIndex - 1 >= 0 && yIndex + 1 < crossWord.height) {
        crossWord.grid[xIndex - 1][yIndex + 1].adjacent = true;
    }
    if (xIndex + 1 < crossWord.length && yIndex - 1 >= 0) {
        crossWord.grid[xIndex + 1][yIndex - 1].adjacent = true;
    }
    if (xIndex + 1 < crossWord.length && yIndex + 1 < crossWord.height) {
        crossWord.grid[xIndex + 1][yIndex + 1].adjacent = true;
    }
}
function getStartYIndex(word, height, width, orientation) {
    // generate a random starting point
    var yStartIndex = 0;
    // ensure that the start and end index are within the bounds of the grid
    if (orientation === grid_interface_1.ORIENTATION.HORIZONTAL) {
        yStartIndex = Math.floor(Math.random() * height);
        yStartIndex = yStartIndex >= 0 ? yStartIndex : 0;
    }
    else {
        yStartIndex = Math.floor(Math.random() * height) - word.length;
        yStartIndex = yStartIndex >= 0 ? yStartIndex : 0;
    }
    return yStartIndex;
}
function getStartXIndex(word, height, width, orientation) {
    var xStartIndex = 0;
    if (orientation === grid_interface_1.ORIENTATION.HORIZONTAL) {
        xStartIndex = Math.floor(Math.random() * width) - word.length;
        xStartIndex = xStartIndex >= 0 ? xStartIndex : 0;
    }
    else {
        xStartIndex = Math.floor(Math.random() * width);
        xStartIndex = xStartIndex >= 0 ? xStartIndex : 0;
    }
    return xStartIndex;
}
displayCrossword(generateWordLayout());
// for each word in the crossword, set the isStartOfWord property of the first node to true.
// if the word is horizontal, set isStartOfHorizontalWord to true
// if the word is vertical, set isStartOfVerticalWord to true
function setStartOfWordProperties(crossWord) {
    for (var i = 0; i < crossWord.words.length; i++) {
        var word = crossWord.words[i];
        if (word.orientation === grid_interface_1.ORIENTATION.HORIZONTAL) {
            crossWord.grid[word.xStartIndex][word.yStartIndex].isStartOfHorizontalWord = true;
        }
        else if (word.orientation === grid_interface_1.ORIENTATION.VERTICAL) {
            crossWord.grid[word.xStartIndex][word.yStartIndex].isStartOfVerticalWord = true;
        }
    }
}
