import { Crossword, WordNode, Word, ORIENTATION, Clue } from "./grid.interface";
var grandDictionary = require('./grandDictionary.json');

// The following variables should only be changed by an enlightened aesthete.
const themedSeed = ['plum', 'pear', 'grape', 'pineapple', 'cherry', 'strawberry'];  // apple
const minimumWordLength = 3;
const maximumWordLength = 13;
const minimumWordCount = 5; // The best crosswords have upwards of 60 words in a 15x15. This is introduced purely for ease of testing.
const puzzleHeight = 15;
const puzzleLength = 15;

const allowedIterations = 100000; // This prevents us being stuck due to lack of backtracking or extraordinarily bad seeds. May be unused.

// I have diverged from Austin in that I am not setting isBlackedOut to true initially.

function makeBlankGrid(height = puzzleHeight, length = puzzleLength): Crossword {
    let multiArray = new Array(length);
    let emptyNode = { character: '-', correctAnswerCharacter: '-', isBlackedOut: false, isFilled: false, isStartOfWord: false, isStartOfHorizontalWord: false, isStartOfVerticalWord: false, isPartOfHorizontalWord: false, isPartOfVerticalWord: false, isEndOfHorizontalWord: false, isEndOfVerticalWord: false, startsClue: -1, adjacent: false, fullyDetermined: false} as WordNode;
    for (let i = 0; i < multiArray.length; i++) {
        multiArray[i] = new Array(height);
    }
    for(let i = 0; i < length; i++) {
        for(let j = 0; j < height; j++) {
            multiArray[i][j] = emptyNode;
        }
    }
return {grid: multiArray, words: [], clues: [], height: height, length: length} as Crossword;
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

function displayCrossword(crossWord: Crossword): void {
    // console.log('crossword grid[0][0]: ', crossWord.grid[0][0]);
    for(let i = 0; i < crossWord.length; i++) {
        let row = '';
        // console.log('row: ', nodeRow);
        for(let j = 0; j < crossWord.height; j++) {
            row += crossWord.grid[j][i].correctAnswerCharacter;
        }
        console.log(row);
    }
}

function generateThemedLayout(themedSeed: string[], blankGrid: Crossword): Crossword {
    let themedCrossword = blankGrid;
    // loop through each word in the seed
    for(let i = 0; i < themedSeed.length; i++) {
        //choose a random orientation for the word
        let orientation = Math.floor(Math.random() * 2) === 0 ? ORIENTATION.HORIZONTAL : ORIENTATION.VERTICAL;
        //choose a random starting point for the word and make sure it doesn't overflow the grid in either direction if it is placed horizontally or vertically
        // case 1: horizontal
        let xStartIndex = 0;
        let yStartIndex = 0;
        if (orientation === ORIENTATION.HORIZONTAL) {
            xStartIndex = Math.floor(Math.random() * (themedCrossword.length - themedSeed[i].length));
            yStartIndex = Math.floor(Math.random() * themedCrossword.height);
        }
        // case 2: vertical
        if (orientation === ORIENTATION.VERTICAL) {
            xStartIndex = Math.floor(Math.random() * themedCrossword.length);
            yStartIndex = Math.floor(Math.random() * (themedCrossword.height - themedSeed[i].length));
        }
        console.log('xStartIndex: ', xStartIndex);
        console.log('yStartIndex: ', yStartIndex);
        
        //TODO 
        // this may be redundant to checkIfOverwriting?
        //make sure the starting point is not overwriting any existing characters in the proposed nodes. If it is, decrement i and try again.
        if (checkIfOverwriting(themedCrossword, themedSeed[i], xStartIndex, yStartIndex, orientation)) {
            console.log(`is overwriting ${themedSeed[i]}, decrementing i`);
            i--;
            continue;
        }
        // This loop hangs forever if the seed is too long for the grid. (AS WRITTEN) :)

        //loop through each letter in the word
        for(let j = 0; j < themedSeed[i].length; j++) {
            //set the character of the node at the current index to the current letter in the word
            console.log('setting character to: ', themedSeed[i][j], 'at index: ', i, j);
            // create a variable for the currently selected letter
            let currentLetter = themedSeed[i][j];
            console.log('currentLetter: ', currentLetter);
            if (orientation === ORIENTATION.HORIZONTAL) {                
                themedCrossword.grid[xStartIndex + j][yStartIndex] = {
                    ...themedCrossword.grid[xStartIndex + j][yStartIndex],
                    isFilled: true,
                    character: currentLetter,
                    correctAnswerCharacter: currentLetter,
                    isStartOfHorizontalWord: j === 0,
                    isEndOfHorizontalWord: j === themedSeed[i].length - 1,
                    isPartOfHorizontalWord: true,
                };
            } else {
                themedCrossword.grid[xStartIndex][yStartIndex + j] = {
                    ...themedCrossword.grid[xStartIndex][yStartIndex + j],
                    isFilled: true,
                    character: currentLetter,
                    correctAnswerCharacter: currentLetter,
                    isStartOfVerticalWord: j === 0,
                    isEndOfVerticalWord: j === themedSeed[i].length - 1,
                    isPartOfVerticalWord: true,
                };
            }
            setAdjacentProperty(themedCrossword, themedCrossword.grid[i][j], xStartIndex, yStartIndex);

        }
    }
    return themedCrossword;
}

function checkIfOverwriting(crossWord: Crossword, word: string, xStartIndex: number, yStartIndex: number, orientation: ORIENTATION): boolean {
    let result = false;
    //loop through each letter in the word and check if the node.adjacent property is true or if the node.isFilled property is true or if the node.character is not equal to the current letter in the word
    for(let j = 0; j < word.length; j++) {
        if (orientation === ORIENTATION.HORIZONTAL) {
            if (crossWord.grid[xStartIndex + j][yStartIndex].adjacent || crossWord.grid[xStartIndex + j][yStartIndex].isFilled ) {
                return true;
            }
        } else {
            if (crossWord.grid[xStartIndex][yStartIndex + j].adjacent || crossWord.grid[xStartIndex][yStartIndex + j].isFilled) {
                return true;
            }
        }
    }
    return result;
}

function setAdjacentProperty(crossWord: Crossword, node: WordNode, xIndex: number, yIndex: number) {
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

function getStartYIndex(word: string, height: number, width: number, orientation: ORIENTATION): number {
        // generate a random starting point
    let yStartIndex = 0;
        // ensure that the start and end index are within the bounds of the grid
        if (orientation === ORIENTATION.HORIZONTAL) {  
            yStartIndex = Math.floor(Math.random() * height);
            yStartIndex = yStartIndex >= 0 ? yStartIndex : 0;
        } else {
            yStartIndex = Math.floor(Math.random() * height) - word.length; 
            yStartIndex = yStartIndex >= 0 ? yStartIndex : 0;
        }
    return yStartIndex;
}

function getStartXIndex(word: string, height: number, width: number, orientation: ORIENTATION): number {
    let xStartIndex = 0;
    if (orientation === ORIENTATION.HORIZONTAL) {  
        xStartIndex = Math.floor(Math.random() * width) - word.length;
        xStartIndex = xStartIndex >= 0 ? xStartIndex : 0;
    } else {
        xStartIndex = Math.floor(Math.random() * width);
        xStartIndex = xStartIndex >= 0 ? xStartIndex : 0;
    }
    return xStartIndex;
}

function setStartAndEndOfWordProperties(crossWord: Crossword) {
    for(let i = 0; i < crossWord.words.length; i++) {
        let word = crossWord.words[i];
        if (word.orientation === ORIENTATION.HORIZONTAL) {
            crossWord.grid[word.xStartIndex][word.yStartIndex].isStartOfHorizontalWord = true;
            crossWord.grid[word.xStartIndex + word.length - 1][word.yStartIndex].isEndOfHorizontalWord = true;
        } else if (word.orientation === ORIENTATION.VERTICAL) {
            crossWord.grid[word.xStartIndex][word.yStartIndex].isStartOfVerticalWord = true;
            crossWord.grid[word.xStartIndex][word.yStartIndex + word.length - 1].isEndOfVerticalWord = true;
        }
    }
}

// a function which attempts to place a random word from the dictionary into a wordNode
// The function is given the crossWord and a wordNode as input and returns the crossword, either updated with the valid addition or unchanged.
// The function will check if fullyDetermined property of the wordNode is true. If it is, it will return the crossword unchanged.
// The function will check if the wordNode would extend a word if a new character were inserted.
// If it is, it will return the crossword unchanged and set the fullyDetermined property of the wordNode to true.
// The function will randomly choose horizontal or vertical. If horizontal[vertical], it will check if the 
// isPartOfHorizontal[Vertical]Word property is true. If it is, it will change to the other and check if the isPartOfVertical[Horizontal]Word property is true.
// If it is also true, it will return the crossword unchanged and set the fullyDetermined property of the wordNode to true.
// For the first orientation it finds valid, it will determine the maximum length word allowable without exceeding the grid size or overwriting blacked out wordNode.
// It will also consider the length allowed where it would not change any words by inserting a character.
// Once we have the maximum allowed length, we will compare it to minimumWordLength. If it does not meet or exceed this, return the grid unchanged and set the fullyDetermined property of the wordNode to true.
// If it does satisfy this parameter, randomly select a length of word to implement. Determine which of the letters of this word are already determined.
// Search grandDictionary.txt for any such matching word. Return the first one found. If none is found, return the crossword unchanged.
// If such a word is found, write all relevant properties. write the foundWord to the word object. Write the word to the crossword object. Check if we have reached the minimum number of words.
// return the updated crossword.

// This function is literally hangman :)
function fillFromDictionary(crossWord: Crossword, wordNode: WordNode, xIndex: number, yIndex: number): Crossword{
    // if the wordNode is fully determined, return the crossword unchanged
    if (wordNode.fullyDetermined) {
        return crossWord;
    }
    // randomly choose horizontal or vertical
    let orientation = Math.floor(Math.random() * 2) === 0 ? ORIENTATION.HORIZONTAL : ORIENTATION.VERTICAL;
    // if horizontal, check if the wordNode is part of a horizontal word. If it is, change orientation to vertical and check if it is part of a vertical word. If it is, return the crossword unchanged
    if (orientation === ORIENTATION.HORIZONTAL) {
        if (wordNode.isPartOfHorizontalWord) {
            orientation = ORIENTATION.VERTICAL;
            if (wordNode.isPartOfVerticalWord) {
                wordNode.fullyDetermined = true;
                return crossWord;
            }
        }
    } else {
        // if vertical, check if the wordNode is part of a vertical word. If it is, change orientation to horizontal and check if it is part of a horizontal word. If it is, return the crossword unchanged
        if (wordNode.isPartOfVerticalWord) {
            orientation = ORIENTATION.HORIZONTAL;
            if (wordNode.isPartOfHorizontalWord) {
                wordNode.fullyDetermined = true;
                return crossWord;
            }
        }
    }
    // determine the maximum length word allowable without exceeding the grid size or overwriting blacked out wordNode
    let maxLength = 0;
    let maxLengthWithoutOverwriting = 0;
    // if horizontal, check the number of wordNodes to the right of the current wordNode which are not blacked out, out of bounds, or part of a horizontal word
    if (orientation === ORIENTATION.HORIZONTAL) {
        for (let i = xIndex; i < crossWord.length; i++) {
            if (crossWord.grid[i][yIndex].isBlackedOut) {
                break;
            }
            maxLength++;
            if (!crossWord.grid[i][yIndex].isPartOfHorizontalWord) {
                maxLengthWithoutOverwriting++;
            }
        }
    } else {
        // if vertical, check the number of wordNodes below the current wordNode which are not blacked out, out of bounds, or part of a vertical word
        for (let i = yIndex; i < crossWord.length; i++) {
            if (crossWord.grid[xIndex][i].isBlackedOut) {
                break;
            }
            maxLength++;
            if (!crossWord.grid[xIndex][i].isPartOfVerticalWord) {
                maxLengthWithoutOverwriting++;
            }
        }
    }
    // compare the maximum length to the minimumWordLength. If it does not meet or exceed this, return the grid unchanged
    if (maxLength < minimumWordLength) {
        wordNode.fullyDetermined = true;
        return crossWord;
    }
    // randomly select a length of word to implement
    let wordLength = Math.floor(Math.random() * (maxLength - minimumWordLength + 1)) + minimumWordLength;
    // determine which of the letters of this word are already determined
    // let lettersAlreadyDetermined be an empty array of strings
    let lettersAlreadyDetermined: string[] = [];
    for (let i = 0; i < wordLength; i++) {
        if (orientation === ORIENTATION.HORIZONTAL) {
            if (crossWord.grid[xIndex + i][yIndex].character) {
                lettersAlreadyDetermined.push(crossWord.grid[xIndex + i][yIndex].character);
            }
        } else {    // if orientation === ORIENTATION.VERTICAL
            if (crossWord.grid[xIndex][yIndex + i].character) {
                lettersAlreadyDetermined.push(crossWord.grid[xIndex][yIndex + i].character);
            }
        }
    }
    // search grandDictionary.JSON for any such matching word. Return the first one found. If none is found, return the crossword unchanged
    let foundWord = findWordInDictionary(lettersAlreadyDetermined);
    if (!foundWord) {
        wordNode.fullyDetermined = true;
        return crossWord;
    }
    // if such a word is found, write all relevant properties.
    for (let i = 0; i < wordLength; i++) {
        if (orientation === ORIENTATION.HORIZONTAL) {
            crossWord.grid[xIndex + i][yIndex].character = foundWord[i];
            crossWord.grid[xIndex + i][yIndex].isPartOfHorizontalWord = true;
            crossWord.grid[xIndex + i][yIndex].isPartOfVerticalWord = false;
            crossWord.grid[xIndex + i][yIndex].fullyDetermined = true;
        } else {
            crossWord.grid[xIndex][yIndex + i].character = foundWord[i];
            crossWord.grid[xIndex][yIndex + i].isPartOfHorizontalWord = false;
            crossWord.grid[xIndex][yIndex + i].isPartOfVerticalWord = true;
            crossWord.grid[xIndex][yIndex + i].fullyDetermined = true;
        }
    }
    // set xStartIndex and yStartIndex to the start of the word.
    let xStartIndex = xIndex;
    let yStartIndex = yIndex;
    if (orientation === ORIENTATION.HORIZONTAL) {
        while (xStartIndex > 0 && !crossWord.grid[xStartIndex - 1][yStartIndex].isBlackedOut) {
            xStartIndex--;
        }
    } else {
        while (yStartIndex > 0 && !crossWord.grid[xStartIndex][yStartIndex - 1].isBlackedOut) {
            yStartIndex--;
        }
    }
    // if the words array of the crossword has a number of entries equal to the minimumWordCount, return the crossword
    if (crossWord.words.length === minimumWordCount) {
        // log to the console a success message
        console.log("Success!");
        return crossWord;
    }
    // if we have made it this far, push the word to the words array of the crossword
        crossWord.words.push({
        characters: foundWord,
        xStartIndex: xStartIndex,
        yStartIndex: yStartIndex,
        orientation: orientation,
        length: wordLength,
        xEndIndex: xStartIndex + wordLength - 1,
        yEndIndex: yStartIndex + wordLength - 1
    });
    return crossWord;
}

function findWordInDictionary(lettersAlreadyDetermined: string[]): string | undefined {
    // if the lettersAlreadyDetermined array is empty, return undefined
    if (lettersAlreadyDetermined.length === 0) {
        return undefined;
    }
    // if the lettersAlreadyDetermined array is not empty, create a regular expression to search for any word matching the lettersAlreadyDetermined array
    let regexString = "";
    for (let i = 0; i < lettersAlreadyDetermined.length; i++) {
        if (lettersAlreadyDetermined[i] === "") {
            regexString += "[a-z]";
        } else {
            regexString += lettersAlreadyDetermined[i];
        }
    }
    let regex = new RegExp(regexString);
    // search grandDictionary.JSON for any such matching word. Return the first one found. If none is found, return undefined
    for (let key in grandDictionary) {
        if (regex.test(key)) {
            return key;
        }
    }
    return undefined;
}

// we will create a function, addDictionaryWords, which will use iterate over all the parameters of fillFromDictionary and call fillFromDictionary with each set of parameters
function addDictionaryWords(crossWord: Crossword): Crossword {
    // start in the top left corner of the crossword
    let xIndex = 0;
    let yIndex = 0;
    // define the wordNode
    let wordNode = crossWord.grid[xIndex][yIndex];
    // while we have not reached the bottom right corner of the crossword
    while (xIndex < crossWord.length - 1 || yIndex < crossWord.length - 1) {
        // if the wordNode is not blacked out, and is not fully determined, call fillFromDictionary with the wordNode as a parameter
        if (!wordNode.isBlackedOut && !wordNode.fullyDetermined) {
            crossWord = fillFromDictionary(crossWord, wordNode, xIndex, yIndex);
        }
        // advance the wordNode to the next square
        if (yIndex < crossWord.length - 1) {
            yIndex++;
        } else {
            yIndex = 0;
            xIndex++;
        }
        // update the wordNode
        wordNode = crossWord.grid[xIndex][yIndex];
    }
    return crossWord;
}

// make a blank grid and print it to the console
let blankGrid = makeBlankGrid(13, 13);
displayCrossword(blankGrid);
let step2 = generateThemedLayout(themedSeed, blankGrid);
displayCrossword(step2);