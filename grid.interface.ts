
export interface Crossword {
    grid: WordNode[][];
    words: Word[];
    clues: Clue[];
    height: number;
    length: number;
}

//WordNode is a single character in the crossword.
export interface WordNode {
    adjacent: boolean;  //is adjacent to a filled space
    character: string;  //a single character as entered by the player
    correctAnswerCharacter: string; //correct character as determined by the program
    isFilled: boolean;  //the space has been filled with a character
    isBlackedOut: boolean;  //is blacked out and not usable. This should be reinitialized to false after each crossword is generated.
    isStartOfWord: boolean; //is the start of a word. Will have a clue number as well?
    isStartOfVerticalWord: boolean; //is the start of a vertical word.
    isStartOfHorizontalWord: boolean; //is the start of a horizontal word.
    isPartOfHorizontalWord: boolean; //is part of a horizontal word.
    isPartOfVerticalWord: boolean; //is part of a vertical word.
    isEndOfHorizontalWord: boolean; //is the end of a horizontal word.
    isEndOfVerticalWord: boolean; //is the end of a vertical word.
    fullyDetermined: boolean; //can the character contribute to another word? This will be true if isPartOfHorizontalWord and isPartOfVerticalWord are both true. This will be true if isBlackedOut is true. This will be true if the fillFromDictionary function fails to find a word that fits.
}

export interface Clue {
    hint: string;
    answer: Word;
    number: number;
}

export interface Word {
    orientation: ORIENTATION;
    xStartIndex: number;
    yStartIndex: number;
    xEndIndex: number;
    yEndIndex: number;
    length: number;
    characters: string;
}

export enum ORIENTATION {
    HORIZONTAL = 'HORIZONTAL',
    VERTICAL = 'VERTICAL'
}
