"use strict";
exports.__esModule = true;
var themedSeed = ['pear', 'apple', 'grapes', 'banana', 'lemon', 'peach', 'cherry', 'mango', 'plum', 'orange', 'tomato', 'plantain'];
function makeBlankGrid(height, length) {
    if (height === void 0) { height = 15; }
    if (length === void 0) { length = 15; }
    var multiArray = new Array(length);
    var emptyNode = { character: 'a', correctAnswerCharacter: '', isBlackedOut: true, isFilled: false, isStartOfWord: false, startsClue: -1 };
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
function displayCrossword(crossWord) {
    // console.log('crossword grid[0][0]: ', crossWord.grid[0][0]);
    for (var i = 0; i < crossWord.height; i++) {
        var row = '';
        var nodeRow = crossWord.grid[i][0];
        // console.log('row: ', nodeRow);
        for (var j = 0; j < crossWord.length; j++) {
            row += crossWord.grid[j][i].character;
        }
        console.log(row);
    }
}
// function for generating the initial word layout
function generateWordLayout() {
    // invoke the blank grid generator
    var crossWord = makeBlankGrid();
    // Use the words in themedSeed to generate the word layout
    // for each word in themedSeed, generate a random orientation and starting point.
    // Ensure that the word does not go out of bounds.
    // loop through each word in themedSeed
    for (var i = 0; i < themedSeed.length; i++) {
        var currentWord = themedSeed[i];
        // generate a random orientation
        var orientation = Math.floor(Math.random() * 2) === 0 ? 'HORIZONTAL' : 'VERTICAL';
        // generate a random starting point
        var xStartIndex = Math.floor(Math.random() * crossWord.length);
        var yStartIndex = Math.floor(Math.random() * crossWord.height);
        // generate the end index
        var xEndIndex = xStartIndex + currentWord.length;
        var yEndIndex = yStartIndex + currentWord.length;
        // check if the word goes out of bounds
        if (orientation === 'HORIZONTAL') {
            if (xEndIndex > crossWord.length) {
                // if the word goes out of bounds, reroll the starting point
                xStartIndex = crossWord.length - currentWord.length;
            }
        }
        else {
            if (yEndIndex > crossWord.height) {
                yStartIndex = crossWord.height - currentWord.length;
            }
        }
        // if the word goes out of bounds, adjust the start index
        // add the word to the crossword
        var wordObj = { orientation: orientation,
            xStartIndex: xStartIndex,
            yStartIndex: yStartIndex,
            xEndIndex: xEndIndex,
            yEndIndex: yEndIndex,
            length: currentWord.length,
            characters: currentWord };
        crossWord.words.push(wordObj);
        // add each letter of the word to the corresponding grid space
        for (var j = 0; j < currentWord.length; j++) {
            if (orientation === 'HORIZONTAL') {
                crossWord.grid[xStartIndex + j][yStartIndex].character = currentWord[j];
                crossWord.grid[xStartIndex + j][yStartIndex].correctAnswerCharacter = currentWord[j];
            }
            else {
                crossWord.grid[xStartIndex][yStartIndex + j].character = currentWord[j];
                crossWord.grid[xStartIndex][yStartIndex + j].correctAnswerCharacter = currentWord[j];
            }
        }
        displayCrossword(crossWord);
    }
    return crossWord;
}
// const crossWord = makeBlankGrid(15, 15);
// displayCrossword(crossWord);
displayCrossword(generateWordLayout());
// generateWordLayout()
